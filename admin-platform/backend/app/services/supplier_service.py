"""
Supplier Service
Handles business logic for supplier operations
"""
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.supplier import Supplier
from app.models.supplier_onboarding import SupplierOnboarding, OnboardingStatus
from app.models.user import User
from app.schemas.supplier import (
    SupplierResponse,
    SupplierStatsResponse,
    SupplierDetailResponse,
    ProductListResponse,
    ProductSummary,
    DocumentInfo,
    SupplierInsightsResponse,
    ProductDetailResponse,
)
from app.core.database import get_database
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)


class SupplierService:
    """Service for supplier-related operations"""
    
    @staticmethod
    async def get_active_suppliers(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> dict:
        """
        Get all *verified and active* suppliers with pagination and search.
        Source-of-truth is the supplier-platform `users` collection so we mirror
        their behaviour/fields (supplier_code, is_active, is_verified).
        """
        try:
            skip = (page - 1) * page_size

            # Base query: supplier role AND verified AND active
            from beanie.operators import And
            from app.models.user import UserRole

            base_query = And(
                User.role == UserRole.SUPPLIER,
                User.is_active == True,   # noqa: E712 - beanie boolean comparison
                User.is_verified == True  # noqa: E712
            )

            # Apply search on email / names / supplier_code
            users_cursor = User.find(base_query)
            if search:
                search_lower = search.lower()
                all_users = await users_cursor.to_list()
                filtered_users = [
                    user for user in all_users
                    if (
                        search_lower in user.email.lower()
                        or search_lower in (user.full_name or "").lower()
                        or search_lower in (user.business_name or "").lower()
                        or search_lower in (user.supplier_code or "").lower()
                    )
                ]
                total = len(filtered_users)
                users_page = filtered_users[skip:skip + page_size]
            else:
                total = await users_cursor.count()
                users_page = await users_cursor.skip(skip).limit(page_size).to_list()

            db = get_database()
            suppliers_data = []

            # Pre-aggregate bookings/revenue/reviews for this page
            user_ids_list = [str(u.id) for u in users_page]

            bookings_stats_map: dict[str, dict] = {}
            if user_ids_list:
                try:
                    CANCELLED_STATUSES = {"cancelled", "canceled", "refund", "refund/dispute"}
                    pipeline = [
                        {"$match": {"supplier_id": {"$in": user_ids_list}}},
                        {"$group": {
                            "_id": "$supplier_id",
                            "bookings": {"$sum": 1},
                            "revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}},
                            "cancelled": {"$sum": {
                                "$cond": [
                                    {"$in": [{"$toLower": {"$ifNull": ["$status", ""]}}, list(CANCELLED_STATUSES)]},
                                    1,
                                    0
                                ]
                            }},
                            "successful": {"$sum": {
                                "$cond": [
                                    {"$not": [{"$in": [{"$toLower": {"$ifNull": ["$status", ""]}}, list(CANCELLED_STATUSES)]}]},
                                    1,
                                    0
                                ]
                            }},
                        }}
                    ]
                    async for row in db["customer_bookings"].aggregate(pipeline):
                        sid = row.get("_id")
                        bookings_stats_map[sid] = {
                            "bookings": row.get("bookings", 0),
                            "revenue": float(row.get("revenue", 0) or 0),
                            "cancelled": row.get("cancelled", 0),
                            "successful": row.get("successful", 0),
                        }
                except Exception as e:
                    logger.debug(f"Could not aggregate bookings: {e}")

            # First, collect product IDs for these suppliers to match reviews by product_id
            products_by_supplier: dict[str, list[str]] = {}
            try:
                products_cursor = db["products"].find({"supplier_id": {"$in": user_ids_list}}, {"_id": 1, "supplier_id": 1})
                async for doc in products_cursor:
                    sid = doc.get("supplier_id")
                    pid = doc.get("_id")
                    if sid and pid:
                        pid_str = str(pid)
                        products_by_supplier.setdefault(sid, []).append(pid_str)
            except Exception as e:
                logger.debug(f"Could not fetch products for review mapping: {e}")

            reviews_stats_map: dict[str, int] = {}
            if user_ids_list:
                try:
                    supplier_codes_list = [u.supplier_code or f"SUP-{str(u.id)[:8]}" for u in users_page]
                    user_obj_ids = [ObjectId(uid) for uid in user_ids_list if ObjectId.is_valid(uid)]
                    # Build OR clauses for multiple possible fields used in reviews
                    review_match_or = []
                    for field in ["supplier_id", "supplier_code", "supplier", "supplierId", "supplierCode", "author.supplier_id", "author.supplier_code"]:
                        review_match_or.append({field: {"$in": user_ids_list}})
                        review_match_or.append({field: {"$in": supplier_codes_list}})
                        if user_obj_ids:
                            review_match_or.append({field: {"$in": user_obj_ids}})
                    # Also match by product_id
                    product_ids_all: list[str] = []
                    for lst in products_by_supplier.values():
                        product_ids_all.extend(lst)
                    if product_ids_all:
                        # Also try matching product_id as ObjectId
                        product_obj_ids = [ObjectId(pid) for pid in product_ids_all if ObjectId.is_valid(pid)]
                        review_match_or.append({"product_id": {"$in": product_ids_all}})
                        if product_obj_ids:
                            review_match_or.append({"product_id": {"$in": product_obj_ids}})
                    # Only run aggregation if we have match conditions
                    if not review_match_or:
                        reviews_stats_map = {}
                    else:
                        pipeline = [
                            {"$match": {"$or": review_match_or}},
                            {"$group": {"_id": None, "counts": {"$push": {"id": "$supplier_id", "code": "$supplier_code", "author": "$author", "product_id": "$product_id"}}}}
                        ]
                        # Instead of grouping by _id directly (since field may differ), accumulate then count
                        agg = await db["customer_reviews"].aggregate(pipeline).to_list(length=1)
                    if agg:
                        counts_map: dict[str, int] = {}
                        for item in agg[0].get("counts", []):
                            sid = item.get("id") or item.get("code")
                            if not sid and isinstance(item.get("author"), dict):
                                sid = item["author"].get("supplier_id") or item["author"].get("supplier_code")
                            if not sid and item.get("product_id"):
                                # Resolve product_id back to supplier_id
                                pid = str(item.get("product_id"))
                                for sup_id, pids in products_by_supplier.items():
                                    if pid in pids:
                                        sid = sup_id
                                        break
                            if sid:
                                sid_str = str(sid)
                                counts_map[sid_str] = counts_map.get(sid_str, 0) + 1
                        reviews_stats_map = counts_map
                except Exception as e:
                    logger.debug(f"Could not aggregate reviews: {e}")

            for user in users_page:
                user_id_str = str(user.id)

                # Count published products for the supplier (matches supplier-platform)
                total_tours = 0
                try:
                    products_collection = db["products"]
                    total_tours = await products_collection.count_documents({
                        "supplier_id": user_id_str,
                        "status": "published"
                    })
                except Exception as e:
                    logger.debug(f"Could not count products for supplier {user_id_str}: {e}")

                # Try to enrich with onboarding info (for account_type) if present
                onboarding = await SupplierOnboarding.find_one(SupplierOnboarding.user_id == user_id_str)
                account_type = onboarding.business_type.value if onboarding and onboarding.business_type else None

                location_parts = []
                if user.country:
                    location_parts.append(user.country)
                if user.address:
                    location_parts.append(user.address)
                location = ", ".join(location_parts) if location_parts else None

                # Use supplier_code as the canonical identifier (matches supplier-platform)
                supplier_code = user.supplier_code or f"SUP-{user_id_str[:8]}"

                # Look up aggregated bookings/revenue stats
                bookings_info = bookings_stats_map.get(user_id_str, {})
                bookings = bookings_info.get("bookings", 0)
                revenue_val = bookings_info.get("revenue", 0.0)
                cancelled = bookings_info.get("cancelled", 0)
                successful = bookings_info.get("successful", 0)
                reviews_count = reviews_stats_map.get(user_id_str, 0)
                # also check by supplier_code key
                if reviews_count == 0:
                    reviews_count = reviews_stats_map.get(supplier_code, 0)
                perf_den = successful + cancelled
                performance = 0.0
                if perf_den > 0:
                    performance = min(100.0, round((successful / perf_den) * 100, 1))

                # Enrich with Supplier document to get average rating and total revenue
                rating_val: float = 0.0
                try:
                    supplier_doc = await Supplier.find_one(Supplier.user_id == user_id_str)
                    if supplier_doc and getattr(supplier_doc, "rating", None) is not None:
                        rating_val = float(supplier_doc.rating)
                        # If Supplier.total_revenue is present and non-zero, prefer it for revenue
                        total_rev = getattr(supplier_doc, "total_revenue", None)
                        if isinstance(total_rev, (int, float)) and total_rev:
                            revenue_val = float(total_rev)
                except Exception as e:
                    logger.debug(f"Could not enrich supplier rating/revenue for {user_id_str}: {e}")

                # Status behaviour similar to customers list:
                # - "Active"  -> supplier account is active AND verified
                # - "Inactive" -> anything else (blocked, unverified, etc.)
                status = "Active" if (getattr(user, "is_active", False) and getattr(user, "is_verified", False)) else "Inactive"

                suppliers_data.append({
                    "id": supplier_code,
                    "supplier_id": supplier_code,
                    "name": user.business_name or user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "location": location,
                    "total_tours": total_tours,
                    "status": status,
                    "revenue": revenue_val,
                    "rating": rating_val,
                    "bookings": bookings,
                    "reviews": reviews_count,
                    "performance": performance,
                    "account_type": account_type,
                    "created_at": user.created_at
                })

            # Fallback: if no verified+active suppliers, show approved onboardings
            if total == 0:
                from app.models.supplier_onboarding import OnboardingStatus
                onboarding_query = SupplierOnboarding.find(
                    SupplierOnboarding.status == OnboardingStatus.APPROVED
                )
                onboarding_list = await onboarding_query.skip(skip).limit(page_size).to_list()
                total = await onboarding_query.count()
                for ob in onboarding_list:
                    suppliers_data.append({
                        "id": f"#OB-{str(ob.id)[:8]}",
                        "supplier_id": f"#OB-{str(ob.id)[:8]}",
                        "name": ob.business_name or ob.user_name or "Supplier",
                        "email": ob.business_email or ob.user_email or ob.email,
                        "phone": ob.business_phone,
                        "location": ", ".join(filter(None, [ob.business_country, ob.business_city])),
                        "total_tours": 0,
                        "status": ob.status.value if hasattr(ob.status, "value") else str(ob.status),
                        "revenue": 0,
                        "rating": 0,
                        "account_type": ob.business_type.value if hasattr(ob.business_type, "value") else str(ob.business_type),
                        "created_at": ob.submitted_at
                    })

            return {
                "suppliers": suppliers_data,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size,
                "debug": {
                    "suppliers_found": len(suppliers_data),
                    "source": "users",
                    "search": search
                }
            }
                
        except Exception as e:
            logger.error(f"Error fetching active suppliers: {e}")
            raise
    
    @staticmethod
    async def get_supplier_stats() -> SupplierStatsResponse:
        """
        Get supplier statistics
        
        Returns:
            SupplierStatsResponse with aggregated statistics
        """
        try:
            from beanie.operators import And
            from app.models.user import UserRole

            # Totals derived from supplier-platform users collection
            total_suppliers = await User.find(User.role == UserRole.SUPPLIER).count()
            # Active suppliers: verified + active (previous behaviour, as requested)
            active_suppliers = await User.find(
                And(
                    User.role == UserRole.SUPPLIER,
                    User.is_active == True,   # noqa: E712
                    User.is_verified == True  # noqa: E712
                )
            ).count()
            
            # Verification pending (from onboarding)
            from app.models.supplier_onboarding import OnboardingStatus
            onboarding_pending = await SupplierOnboarding.find(
                SupplierOnboarding.status == OnboardingStatus.PENDING
            ).count()
            verification_pending = onboarding_pending
            
            # If no suppliers yet, fall back to approved onboardings for totals/active
            if total_suppliers == 0:
                onboarding_approved = await SupplierOnboarding.find(
                    SupplierOnboarding.status == OnboardingStatus.APPROVED
                ).count()
                total_suppliers = onboarding_approved
                active_suppliers = onboarding_approved
            
            # Total earnings for admin:
            # Sum ALL customer booking amounts and take the admin commission (25%)
            db = get_database()
            bookings_collection = db["customer_bookings"]

            total_gross_amount: float = 0.0
            try:
                pipeline = [
                    {
                        "$group": {
                            "_id": None,
                            "total_amount": {
                                "$sum": {
                                    "$ifNull": ["$total_amount", 0]
                                }
                            },
                        }
                    }
                ]
                agg = await bookings_collection.aggregate(pipeline).to_list(length=1)
                if agg:
                    total_gross_amount = float(agg[0].get("total_amount", 0) or 0.0)
            except Exception as e:
                logger.error(f"Error aggregating total supplier earnings from bookings: {e}", exc_info=True)

            # Admin keeps 25% commission, suppliers receive 75% as payouts.
            # For the 'Total earnings' card we want the ADMIN'S earnings (commission).
            total_earnings = round(total_gross_amount * 0.25, 2) if total_gross_amount else 0.0
            
            return SupplierStatsResponse(
                total_suppliers=total_suppliers,
                active_suppliers=active_suppliers,
                verification_pending=verification_pending,
                total_earnings=total_earnings
            )
            
        except Exception as e:
            logger.error(f"Error fetching supplier stats: {e}")
            raise

    @staticmethod
    async def get_supplier_detail(supplier_code: str) -> SupplierDetailResponse:
        """
        Get detailed supplier profile by supplier_code (or fallback to id prefix).
        """
        try:
            # Try by supplier_code first (canonical)
            user = await User.find_one(User.supplier_code == supplier_code)
            # Fallback: if caller sent prefixed id (#TA-xxx) strip it and retry
            if not user and supplier_code.startswith("#TA-"):
                user = await User.find_one(User.supplier_code == supplier_code.replace("#TA-", ""))
            if not user:
                raise ValueError("Supplier not found")

            user_id_str = str(user.id)
            db = get_database()

            # Enrich with supplier document if present (revenue/rating)
            supplier_doc = await Supplier.find_one(Supplier.user_id == user_id_str)
            earnings = supplier_doc.total_revenue if supplier_doc else 0.0
            rating = supplier_doc.rating if supplier_doc else 0.0

            # Total tours from products (published)
            total_tours = 0
            try:
                products_collection = db["products"]
                total_tours = await products_collection.count_documents({
                    "supplier_id": user_id_str,
                    "status": "published"
                })
            except Exception as e:
                logger.debug(f"Could not count products for supplier {user_id_str}: {e}")

            onboarding = await SupplierOnboarding.find_one(SupplierOnboarding.user_id == user_id_str)
            account_type = onboarding.business_type.value if onboarding and onboarding.business_type else None

            # Base location info from onboarding / user
            address = user.address or (onboarding.person_address if onboarding else None)
            city = getattr(onboarding, "business_city", None) if onboarding else None
            state = getattr(onboarding, "business_state", None) if onboarding else None
            country = user.country or (onboarding.business_country if onboarding else None)
            legal_name = onboarding.user_name if onboarding else None
            contact_phone: Optional[str] = user.phone
            avatar_url: Optional[str] = getattr(user, "avatar_url", None) or getattr(user, "profile_photo", None)

            # Overlay with latest supplier account settings (profileData + editableInfo + contactNumbers)
            try:
                settings_doc = await db["supplier_account_settings"].find_one({"supplier_id": user_id_str})
                if settings_doc:
                    data = settings_doc.get("data") or {}
                    profile_data = data.get("profileData") or {}
                    editable_info = data.get("editableInfo") or {}

                    def pick(src: dict, key: str, current: Optional[str]) -> Optional[str]:
                        val = src.get(key)
                        if isinstance(val, str) and val.strip():
                            return val
                        return current

                    # Account type and identity
                    account_type = pick(profile_data, "accountType", account_type)
                    account_type = pick(editable_info, "accountType", account_type)
                    legal_name = pick(profile_data, "legalName", legal_name)
                    legal_name = pick(editable_info, "legalName", legal_name)

                    # Contact info (prefer explicit contactValue, otherwise first contactNumbers.value)
                    contact_phone = pick(profile_data, "contactValue", contact_phone)
                    contact_numbers = data.get("contactNumbers")
                    if isinstance(contact_numbers, list):
                        for c in contact_numbers:
                            val = c.get("value")
                            if isinstance(val, str) and val.strip():
                                contact_phone = val
                                break

                    # Profile photo (supplier dashboard uses globalUserPhoto/profilePhotoPreview)
                    possible_photo = (
                        data.get("globalUserPhoto")
                        or data.get("profilePhotoPreview")
                        or profile_data.get("profilePhotoPreview")
                        or editable_info.get("profilePhotoPreview")
                        or data.get("avatar_url")
                        or data.get("profile_photo")
                    )
                    if isinstance(possible_photo, str) and possible_photo.strip():
                        avatar_url = possible_photo.strip()

                    # Office information (street, city, state, country)
                    address = pick(profile_data, "streetAddress", address)
                    address = pick(editable_info, "streetAddress", address)
                    city = pick(profile_data, "city", city)
                    city = pick(editable_info, "city", city)
                    state = pick(profile_data, "state", state)
                    state = pick(editable_info, "state", state)
                    country = pick(profile_data, "country", country)
                    country = pick(editable_info, "country", country)
            except Exception as settings_err:
                logger.debug(f"Could not overlay supplier settings for {supplier_code}: {settings_err}")

            # Derive basic payout rows from customer bookings (realtime)
            payouts: list[dict] = []
            total_payout_earnings = 0.0
            try:
                bookings_collection = db["customer_bookings"]
                pipeline = [
                    {"$match": {"supplier_id": user_id_str}},
                    {
                        "$project": {
                            "created_at": 1,
                            "product_title": 1,
                            "title": 1,
                            "tour_name": 1,
                            "reference_code": 1,
                            "total_amount": {"$ifNull": ["$total_amount", 0]},
                        }
                    },
                    {
                        "$addFields": {
                            "payout_date": {
                                "$dateToString": {
                                    "format": "%Y-%m-%d",
                                    "date": "$created_at",
                                }
                            },
                            "payout_product": {
                                "$ifNull": [
                                    "$product_title",
                                    {
                                        "$ifNull": ["$title", "$tour_name"]
                                    }
                                ]
                            },
                        }
                    },
                    {
                        "$group": {
                            "_id": {
                                "date": "$payout_date",
                                "product": "$payout_product",
                            },
                            "bookings": {"$sum": 1},
                            "earnings": {"$sum": "$total_amount"},
                            "sample_ref": {"$first": "$reference_code"},
                        }
                    },
                    {"$sort": {"_id.date": -1}},
                    {"$limit": 50},
                ]

                async for row in bookings_collection.aggregate(pipeline):
                    key = row.get("_id", {}) or {}
                    date_str = key.get("date") or ""
                    # Prefer product title from aggregation, with sensible fallbacks
                    raw_product = key.get("product")
                    if isinstance(raw_product, dict):
                        product_name = raw_product.get("title") or raw_product.get("product_title") or raw_product.get("tour_name") or "—"
                    else:
                        product_name = raw_product or "—"
                    bookings_count = int(row.get("bookings", 0) or 0)
                    earnings_val = float(row.get("earnings", 0) or 0.0)

                    commission_val = round(earnings_val * 0.25, 2)
                    payout_amount = round(earnings_val - commission_val, 2)
                    due_amount = payout_amount  # until we track paid vs. unpaid

                    total_payout_earnings += payout_amount

                    payouts.append(
                        {
                            "date": date_str,
                            "product": product_name,
                            "reference": row.get("sample_ref"),
                            "bookings": bookings_count,
                            "earnings": earnings_val,
                            "commission": commission_val,
                            "dueAmount": due_amount,
                            "payout": payout_amount,
                        }
                    )
            except Exception as e:
                logger.debug(
                    f"Could not derive payouts for supplier {user_id_str}: {e}"
                )

            # If we don't have a stored Supplier.total_revenue, derive earnings from payouts
            if not earnings and total_payout_earnings:
                earnings = total_payout_earnings

            # Optionally enrich rating from the same logic used in get_supplier_insights
            try:
                insights = await SupplierService.get_supplier_insights(user.supplier_code or supplier_code)
                if insights and insights.average_rating is not None:
                    rating = insights.average_rating
                # If earnings is still zero, use total bookings-based earnings if we ever add it there
            except Exception as ins_err:
                logger.debug(f"Could not enrich supplier detail with insights for {supplier_code}: {ins_err}")

            documents: list[DocumentInfo] = []
            # Documents from original onboarding (registration)
            if onboarding:
                doc_fields = [
                    ("Business license", onboarding.business_document_url),
                    ("Public liability insurance", onboarding.insurance_document_url),
                    ("Logo", onboarding.logo_url),
                    ("ID Front", onboarding.id_front_url),
                    ("ID Back", onboarding.id_back_url),
                ]
                for label, url in doc_fields:
                    if url:
                        documents.append(
                            DocumentInfo(
                                id=f"{label}".replace(" ", "_"),
                                label=label,
                                url=url,
                            )
                        )

            # Documents from latest account settings (previews / public IDs)
            try:
                settings_doc = await db["supplier_account_settings"].find_one({"supplier_id": user_id_str})
                if settings_doc:
                    data = settings_doc.get("data") or {}
                    preview_fields = [
                        ("Business license", "businessLicensePreview"),
                        ("Public liability insurance", "liabilityInsurancePreview"),
                        ("Logo", "logoPreview"),
                    ]
                    for label, key in preview_fields:
                        url = data.get(key)
                        if url and not any(d.label == label for d in documents):
                            documents.append(
                                DocumentInfo(
                                    id=f"settings_{label}".replace(" ", "_"),
                                    label=label,
                                    url=url,
                                )
                            )
            except Exception as docs_err:
                logger.debug(f"Could not enrich supplier documents from settings for {supplier_code}: {docs_err}")

            return SupplierDetailResponse(
                id=user.supplier_code or f"SUP-{user_id_str[:8]}",
                name=user.business_name or user.full_name,
                legal_name=legal_name,
                email=user.email,
                avatar_url=avatar_url,
                phone=contact_phone,
                address=address,
                city=city,
                state=state,
                country=country,
                account_type=account_type,
                total_tours=total_tours,
                rating=rating or 0,
                earnings=earnings or 0,
                payouts=payouts,
                documents=documents,
                created_at=user.created_at
            )
        except Exception as e:
            logger.error(f"Error fetching supplier detail for {supplier_code}: {e}")
            raise

    @staticmethod
    async def get_supplier_insights(supplier_code: str) -> SupplierInsightsResponse:
        """
        Compute high-level performance insights for a supplier, mirroring the supplier platform
        Insights page (bookings, cancellation rate, average rating, response rate, satisfaction).
        """
        try:
            # Resolve supplier user by supplier_code
            user = await User.find_one(User.supplier_code == supplier_code)
            if not user and supplier_code.startswith("SUP-"):
                # Fallback: try without prefix if needed
                user = await User.find_one(User.supplier_code == supplier_code.replace("SUP-", ""))
            if not user:
                raise ValueError("Supplier not found")

            supplier_id = str(user.id)
            db = get_database()

            # Fetch bookings for this supplier
            bookings_cursor = db["customer_bookings"].find({"supplier_id": supplier_id})
            bookings = await bookings_cursor.to_list(length=1000)

            total_bookings = len(bookings)
            booking_this_month = 0
            cancellations = 0

            from datetime import datetime

            now = datetime.utcnow()
            month_key = (now.year, now.month)

            # Local definition of cancellation statuses (kept in sync with dashboard logic)
            CANCELLED_STATUSES = {"cancelled", "canceled", "refund", "refund/dispute"}

            for b in bookings:
                status = (b.get("status") or "").lower()
                created_at = b.get("created_at")
                if isinstance(created_at, datetime):
                    key = (created_at.year, created_at.month)
                    if key == month_key:
                        booking_this_month += 1
                if status in CANCELLED_STATUSES:
                    cancellations += 1

            cancellation_rate = (
                round((cancellations / total_bookings) * 100, 2) if total_bookings else 0.0
            )
            completion_rate = max(0.0, min(100.0, round(100.0 - cancellation_rate, 2)))

            # Average rating from customer_reviews for this supplier's products
            average_rating = 0.0
            try:
                product_ids = []
                prod_cursor = db["products"].find({"supplier_id": supplier_id}, {"_id": 1})
                async for p in prod_cursor:
                    pid = p.get("_id")
                    if pid:
                        product_ids.append(str(pid))
                if product_ids:
                    reviews_coll = db["customer_reviews"]
                    pipeline = [
                        {"$match": {"product_id": {"$in": product_ids}}},
                        {
                            "$group": {
                                "_id": None,
                                "avg_rating": {"$avg": "$rating"},
                            }
                        },
                    ]
                    docs = await reviews_coll.aggregate(pipeline).to_list(length=1)
                    if docs:
                        avg = docs[0].get("avg_rating")
                        if avg is not None:
                            average_rating = round(float(avg), 1)
            except Exception as rating_err:
                logger.debug(f"Could not compute average rating for {supplier_code}: {rating_err}")

            # Response rate based on supplier reply activity (messages collection)
            response_rate = 0.0
            try:
                from datetime import timedelta

                days = 30
                since = now - timedelta(days=days)
                messages_coll = db["messages"]
                pipeline = [
                    {
                        "$match": {
                            "sender_id": supplier_id,
                            "sender_type": "supplier",
                            "created_at": {"$gte": since},
                        }
                    },
                    {
                        "$group": {
                            "_id": {
                                "$dateToString": {
                                    "format": "%Y-%m-%d",
                                    "date": "$created_at",
                                }
                            },
                            "replies": {"$sum": 1},
                        }
                    },
                ]
                reply_docs = await messages_coll.aggregate(pipeline).to_list(length=None)
                active_days = len(reply_docs)
                if days > 0:
                    response_rate = round((active_days / days) * 100.0, 2)
            except Exception as resp_err:
                logger.debug(f"Could not compute response rate for {supplier_code}: {resp_err}")

            # Customer satisfaction as a percentage based on average rating (out of 5)
            satisfaction = 0.0
            if average_rating > 0:
                satisfaction = round((average_rating / 5.0) * 100.0, 2)

            return SupplierInsightsResponse(
                booking_this_month=booking_this_month,
                total_bookings=total_bookings,
                cancellation_rate=cancellation_rate,
                completion_rate=completion_rate,
                average_rating=average_rating,
                response_rate=response_rate,
                satisfaction=satisfaction,
            )
        except Exception as e:
            logger.error(f"Error fetching insights for supplier {supplier_code}: {e}")
            raise

    @staticmethod
    async def get_pending_onboardings(status: Optional[str] = None) -> dict:
        """
        Fetch supplier onboardings for admin review.
        Defaults to pending status if none provided.
        """
        try:
            query = {}
            if status:
                query["status"] = status
            else:
                query["status"] = OnboardingStatus.PENDING

            onboardings = await SupplierOnboarding.find(query).sort("-submitted_at").to_list()
            results = []
            for ob in onboardings:
                results.append({
                    "id": str(ob.id),
                    "email": ob.business_email or ob.user_email or ob.email,
                    "business_name": ob.business_name or ob.user_name,
                    "business_type": ob.business_type.value if hasattr(ob.business_type, "value") else ob.business_type,
                    "business_country": ob.business_country,
                    "business_city": ob.business_city,
                    "status": ob.status.value if hasattr(ob.status, "value") else ob.status,
                    "submitted_at": ob.submitted_at,
                    "user_id": ob.user_id,
                })

            return {
                "onboardings": results,
                "total": len(results)
            }
        except Exception as e:
            logger.error(f"Error fetching pending onboardings: {e}")
            raise

    @staticmethod
    async def update_onboarding_status(onboarding_id: str, status: str, rejection_reason: Optional[str] = None) -> dict:
        """
        Update onboarding status; approve/reject supplier.
        On approve: mark linked user as verified and active.
        """
        try:
            onboarding = await SupplierOnboarding.get(onboarding_id)
            if not onboarding:
                raise ValueError("Onboarding not found")

            onboarding.status = OnboardingStatus(status)
            onboarding.reviewed_at = datetime.utcnow()
            onboarding.reviewed_by = "admin-panel"
            onboarding.rejection_reason = rejection_reason
            onboarding.updated_at = datetime.utcnow()
            await onboarding.save()

            # Sync to user record if linked
            user = None
            if onboarding.user_id:
                user = await User.get(onboarding.user_id)
            elif onboarding.email:
                user = await User.find_one(User.email == onboarding.email)

            if user:
                if onboarding.status == OnboardingStatus.APPROVED:
                    user.is_verified = True
                    user.is_active = True
                elif onboarding.status == OnboardingStatus.REJECTED:
                    user.is_verified = False
                    user.is_active = False
                    user.blocked_reason = rejection_reason
                    user.blocked_at = datetime.utcnow()
                    user.blocked_by = "admin-panel"
                user.updated_at = datetime.utcnow()
                await user.save()

            return onboarding.dict()
        except Exception as e:
            logger.error(f"Error updating onboarding status: {e}")
            raise

    @staticmethod
    async def get_supplier_products(
        supplier_code: str,
        page: int = 1,
        page_size: int = 10
    ) -> ProductListResponse:
        """
        Get published products for a supplier.
        """
        try:
            user = await User.find_one(User.supplier_code == supplier_code)
            if not user and supplier_code.startswith("#TA-"):
                user = await User.find_one(User.supplier_code == supplier_code.replace("#TA-", ""))
            if not user:
                raise ValueError("Supplier not found")

            user_id_str = str(user.id)
            db = get_database()
            products_collection = db["products"]

            query = {"supplier_id": user_id_str, "status": "published"}
            total = await products_collection.count_documents(query)
            cursor = products_collection.find(query).skip((page - 1) * page_size).limit(page_size)
            docs = await cursor.to_list(length=page_size)

            products = []
            for doc in docs:
                vehicle = None
                try:
                    # Prefer rich vehicle info from custom_fields.vehicles_full[0]
                    custom_fields = doc.get("custom_fields") or {}
                    vehicles_full = custom_fields.get("vehicles_full") or custom_fields.get("vehiclesFull") or []
                    primary_vehicle = vehicles_full[0] if isinstance(vehicles_full, list) and vehicles_full else None

                    if isinstance(primary_vehicle, dict):
                        vehicle = (
                            primary_vehicle.get("title")
                            or primary_vehicle.get("model")
                            or primary_vehicle.get("type")
                        )

                    # Fallback to vehicle_details if nothing found in custom_fields
                    if not vehicle:
                        vehicle_details = doc.get("vehicle_details") or {}
                        vehicle = vehicle_details.get("vehicle_model") or vehicle_details.get("vehicle_type")

                    # Final cleanup: normalize short codes like "suv" -> "SUV"
                    if isinstance(vehicle, str):
                        v = vehicle.strip()
                        if v.lower() in {"suv", "van", "bus", "car"}:
                            vehicle = v.upper()
                        else:
                            # Title-case longer labels for nicer display
                            vehicle = v.title()
                except Exception:
                    vehicle = None

                duration = None
                # Attempt to derive a readable duration if available
                if "duration" in doc and doc.get("duration"):
                    duration = str(doc.get("duration"))
                elif "pickup_dropoff" in doc and doc.get("pickup_dropoff"):
                    # No clear duration field; leave None
                    duration = None

                products.append(ProductSummary(
                    id=str(doc.get("_id")),
                    title=doc.get("title"),
                    tagline=doc.get("tagline"),
                    category=doc.get("category"),
                    price=doc.get("price"),
                    currency=doc.get("currency"),
                    price_unit=doc.get("price_unit"),
                    status=doc.get("status"),
                    duration=duration,
                    vehicle=vehicle,
                ))

            return ProductListResponse(
                products=products,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=(total + page_size - 1) // page_size
            )
        except Exception as e:
            logger.error(f"Error fetching supplier products for {supplier_code}: {e}")
            raise

    @staticmethod
    async def get_product_detail(product_id: str) -> ProductDetailResponse:
        """
        Get full product detail by product_id for admin view.
        Reads directly from the shared `products` collection so it matches
        supplier and customer platforms.
        """
        from bson import ObjectId

        try:
            db = get_database()
            products_collection = db["products"]

            if not ObjectId.is_valid(product_id):
                raise ValueError("Invalid product id")

            doc = await products_collection.find_one({"_id": ObjectId(product_id)})
            if not doc:
                raise ValueError("Product not found")

            # Normalize fields into a flat dict compatible with ProductDetailResponse
            data = dict(doc)
            data["id"] = str(data.pop("_id"))

            # Normalize custom fields: documents may store this as `customFields` (camelCase)
            custom_fields = data.get("custom_fields") or data.get("customFields") or {}
            # Remove camelCase duplicate if present
            if "customFields" in data:
                data.pop("customFields", None)
            data["custom_fields"] = custom_fields

            # Convert enum-like status to plain string if needed
            status_val = data.get("status")
            if hasattr(status_val, "value"):
                data["status"] = status_val.value

            # Ensure list/dict fields are not None
            for key in [
                "highlights",
                "images",
                "gallery_images",
                "itinerary",
                "languages",
                "things_to_carry",
                "faqs",
                "breadcrumb",
            ]:
                if data.get(key) is None:
                    data[key] = []

            if data.get("custom_fields") is None:
                data["custom_fields"] = {}

            return ProductDetailResponse(**data)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching product detail for {product_id}: {e}", exc_info=True)
            raise

    @staticmethod
    async def update_product_detail(product_id: str, payload: Dict[str, Any]) -> ProductDetailResponse:
        """
        Update product detail by product_id on behalf of admin.

        Admin edits should overwrite the published product so that changes
        are reflected in supplier and customer platforms in real-time.
        Only a controlled set of fields is updated to avoid breaking metadata.
        """
        from bson import ObjectId

        try:
            if not ObjectId.is_valid(product_id):
                raise ValueError("Invalid product id")

            db = get_database()
            products_collection = db["products"]

            # Whitelisted fields that admin is allowed to update
            allowed_fields = {
                "title",
                "tagline",
                "description",
                "hero_image",
                "gallery_images",
                "images",
                "duration",
                "guide_type",
                "activity_type",
                "languages",
                "things_to_carry",
                "included_excluded",
                "accessibility",
                "vehicle_details",
                "pickup_dropoff",
                "price",
                "currency",
                "price_unit",
                "faqs",
                "cancellation_policy",
                "destination",
                "breadcrumb",
                "selling_points",
                "style_theme",
                "custom_fields",
            }

            update_doc: Dict[str, Any] = {}
            for key, value in (payload or {}).items():
                if key in allowed_fields:
                    update_doc[key] = value

            if not update_doc:
                # Nothing to update; just return current detail
                return await SupplierService.get_product_detail(product_id)

            await products_collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_doc},
            )

            # Return refreshed product detail
            return await SupplierService.get_product_detail(product_id)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating product detail for {product_id}: {e}", exc_info=True)
            raise

    @staticmethod
    async def block_supplier(supplier_code: str, reason: Optional[str] = None) -> dict:
        user = await User.find_one(User.supplier_code == supplier_code)
        if not user and supplier_code.startswith("#TA-"):
            user = await User.find_one(User.supplier_code == supplier_code.replace("#TA-", ""))
        if not user:
            raise ValueError("Supplier not found")
        user.is_active = False
        user.blocked_reason = reason
        user.blocked_at = datetime.utcnow()
        user.blocked_by = "admin-panel"
        user.updated_at = datetime.utcnow()
        await user.save()
        return {"supplier_id": supplier_code, "blocked_reason": reason}

    @staticmethod
    async def unblock_supplier(supplier_code: str) -> dict:
        user = await User.find_one(User.supplier_code == supplier_code)
        if not user and supplier_code.startswith("#TA-"):
            user = await User.find_one(User.supplier_code == supplier_code.replace("#TA-", ""))
        if not user:
            raise ValueError("Supplier not found")
        user.is_active = True
        user.blocked_reason = None
        user.blocked_at = None
        user.blocked_by = None
        user.updated_at = datetime.utcnow()
        await user.save()
        return {"supplier_id": supplier_code}

    @staticmethod
    async def get_blocked_suppliers(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> dict:
        try:
            from app.models.user import UserRole
            skip = (page - 1) * page_size
            db = get_database()
            users_collection = db["users"]
            
            # Use raw MongoDB query - more reliable for None checks
            # Query for blocked suppliers: role=supplier, is_active=False, blocked_reason exists and is not None
            query = {
                "role": UserRole.SUPPLIER.value,
                "is_active": False,
                "blocked_reason": {"$ne": None, "$exists": True}
            }
            
            logger.info(f"[get_blocked_suppliers] Query: {query}, page={page}, page_size={page_size}, search={search}")
            
            # Apply search filter if provided
            if search:
                search_lower = search.lower()
                # Fetch all matching blocked suppliers first
                all_users_cursor = users_collection.find(query)
                all_users_docs = await all_users_cursor.to_list(length=None)
                # Filter in Python for search
                filtered_docs = [
                    doc for doc in all_users_docs
                    if (
                        search_lower in (doc.get("email") or "").lower()
                        or search_lower in (doc.get("full_name") or "").lower()
                        or search_lower in (doc.get("business_name") or "").lower()
                        or search_lower in (doc.get("supplier_code") or "").lower()
                    )
                ]
                total = len(filtered_docs)
                users_page_docs = filtered_docs[skip:skip + page_size]
            else:
                total = await users_collection.count_documents(query)
                logger.info(f"[get_blocked_suppliers] Found {total} blocked suppliers")
                users_page_docs = await users_collection.find(query).skip(skip).limit(page_size).to_list(length=page_size)
                logger.info(f"[get_blocked_suppliers] Fetched {len(users_page_docs)} documents for page {page}")
            
            # Extract user data directly from MongoDB documents (more reliable)
            suppliers_data = []
            user_ids_list = []
            user_data_map = {}  # Map user_id to user data
            
            logger.info(f"[get_blocked_suppliers] Processing {len(users_page_docs)} user documents")
            
            for doc in users_page_docs:
                try:
                    # Convert to dict if needed
                    if hasattr(doc, 'get'):
                        user_dict = dict(doc)
                    else:
                        user_dict = doc
                    
                    # Extract user ID - handle ObjectId properly
                    user_id_obj = user_dict.get('_id')
                    if not user_id_obj:
                        logger.warning(f"[get_blocked_suppliers] Document missing _id: {user_dict}")
                        continue
                    
                    # Convert ObjectId to string
                    try:
                        if isinstance(user_id_obj, ObjectId):
                            user_id = str(user_id_obj)
                        elif hasattr(user_id_obj, '__str__'):
                            user_id = str(user_id_obj)
                        else:
                            user_id = user_id_obj
                        
                        if not user_id or user_id == 'None':
                            logger.warning(f"[get_blocked_suppliers] Invalid user_id: {user_id_obj}")
                            continue
                        
                        user_ids_list.append(user_id)
                        user_data_map[user_id] = user_dict
                        logger.debug(f"[get_blocked_suppliers] Added user {user_id} to map")
                    except Exception as e:
                        logger.error(f"[get_blocked_suppliers] Error processing user_id: {e}", exc_info=True)
                        continue
                except Exception as e:
                    logger.error(f"[get_blocked_suppliers] Failed to process user document: {e}", exc_info=True)
                    continue
            
            logger.info(f"[get_blocked_suppliers] Processed {len(user_ids_list)} users")

            bookings_stats_map: dict[str, dict] = {}
            if user_ids_list:
                try:
                    CANCELLED_STATUSES = {"cancelled", "canceled", "refund", "refund/dispute"}
                    pipeline = [
                        {"$match": {"supplier_id": {"$in": user_ids_list}}},
                        {"$group": {
                            "_id": "$supplier_id",
                            "bookings": {"$sum": 1},
                            "revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}},
                            "cancelled": {"$sum": {
                                "$cond": [
                                    {"$in": [{"$toLower": {"$ifNull": ["$status", ""]}}, list(CANCELLED_STATUSES)]},
                                    1,
                                    0
                                ]
                            }},
                            "successful": {"$sum": {
                                "$cond": [
                                    {"$not": [{"$in": [{"$toLower": {"$ifNull": ["$status", ""]}}, list(CANCELLED_STATUSES)]}]},
                                    1,
                                    0
                                ]
                            }},
                        }}
                    ]
                    async for row in db["customer_bookings"].aggregate(pipeline):
                        sid = row.get("_id")
                        bookings_stats_map[sid] = {
                            "bookings": row.get("bookings", 0),
                            "revenue": float(row.get("revenue", 0) or 0),
                            "cancelled": row.get("cancelled", 0),
                            "successful": row.get("successful", 0),
                        }
                except Exception as e:
                    logger.debug(f"Could not aggregate bookings (blocked): {e}")

            # First, collect product IDs for these suppliers to match reviews by product_id
            products_by_supplier: dict[str, list[str]] = {}
            try:
                products_cursor = db["products"].find({"supplier_id": {"$in": user_ids_list}}, {"_id": 1, "supplier_id": 1})
                async for doc in products_cursor:
                    sid = doc.get("supplier_id")
                    pid = doc.get("_id")
                    if sid and pid:
                        pid_str = str(pid)
                        products_by_supplier.setdefault(sid, []).append(pid_str)
            except Exception as e:
                logger.debug(f"Could not fetch products for review mapping (blocked): {e}")

            reviews_stats_map: dict[str, int] = {}
            if user_ids_list:
                try:
                    supplier_codes_list = [
                        user_data_map.get(uid, {}).get('supplier_code') or f"SUP-{uid[:8]}" 
                        for uid in user_ids_list
                    ]
                    user_obj_ids = [ObjectId(uid) for uid in user_ids_list if ObjectId.is_valid(uid)]
                    review_match_or = []
                    for field in ["supplier_id", "supplier_code", "supplier", "supplierId", "supplierCode", "author.supplier_id", "author.supplier_code"]:
                        review_match_or.append({field: {"$in": user_ids_list}})
                        review_match_or.append({field: {"$in": supplier_codes_list}})
                        if user_obj_ids:
                            review_match_or.append({field: {"$in": user_obj_ids}})
                    # Also match by product_id
                    product_ids_all: list[str] = []
                    for lst in products_by_supplier.values():
                        product_ids_all.extend(lst)
                    if product_ids_all:
                        # Also try matching product_id as ObjectId
                        product_obj_ids = [ObjectId(pid) for pid in product_ids_all if ObjectId.is_valid(pid)]
                        review_match_or.append({"product_id": {"$in": product_ids_all}})
                        if product_obj_ids:
                            review_match_or.append({"product_id": {"$in": product_obj_ids}})
                    # Only run aggregation if we have match conditions
                    if not review_match_or:
                        reviews_stats_map = {}
                    else:
                        pipeline = [
                            {"$match": {"$or": review_match_or}},
                            {"$group": {"_id": None, "counts": {"$push": {"id": "$supplier_id", "code": "$supplier_code", "author": "$author", "product_id": "$product_id"}}}}
                        ]
                        agg = await db["customer_reviews"].aggregate(pipeline).to_list(length=1)
                        if agg:
                            counts_map: dict[str, int] = {}
                            for item in agg[0].get("counts", []):
                                sid = item.get("id") or item.get("code")
                                if not sid and isinstance(item.get("author"), dict):
                                    sid = item["author"].get("supplier_id") or item["author"].get("supplier_code")
                                if not sid and item.get("product_id"):
                                    # Resolve product_id back to supplier_id
                                    pid = str(item.get("product_id"))
                                    for sup_id, pids in products_by_supplier.items():
                                        if pid in pids:
                                            sid = sup_id
                                            break
                                if sid:
                                    sid_str = str(sid)
                                    counts_map[sid_str] = counts_map.get(sid_str, 0) + 1
                            reviews_stats_map = counts_map
                except Exception as e:
                    logger.debug(f"Could not aggregate reviews (blocked): {e}")

            for user_id_str in user_ids_list:
                user_dict = user_data_map.get(user_id_str, {})
                if not user_dict:
                    continue
                
                account_type = None
                try:
                    onboarding = await SupplierOnboarding.find_one(SupplierOnboarding.user_id == user_id_str)
                    account_type = onboarding.business_type.value if onboarding and onboarding.business_type else None
                except Exception as e:
                    logger.debug(f"Could not fetch onboarding for user {user_id_str}: {e}")
                
                supplier_code = user_dict.get('supplier_code') or f"SUP-{user_id_str[:8]}"

                bookings_info = bookings_stats_map.get(user_id_str, {})
                bookings = bookings_info.get("bookings", 0)
                revenue_val = bookings_info.get("revenue", 0.0)
                cancelled = bookings_info.get("cancelled", 0)
                successful = bookings_info.get("successful", 0)
                reviews_count = reviews_stats_map.get(user_id_str, 0)
                if reviews_count == 0:
                    reviews_count = reviews_stats_map.get(supplier_code, 0)
                perf_den = successful + cancelled
                performance = 0.0
                if perf_den > 0:
                    performance = min(100.0, round((successful / perf_den) * 100, 1))

                # Prepare supplier data matching SupplierResponse schema
                supplier_data = {
                    "id": supplier_code,  # Schema expects 'id' (alias for supplier_id)
                    "supplier_id": supplier_code,
                    "name": user_dict.get('business_name') or user_dict.get('full_name', '') or 'Unknown',
                    "email": user_dict.get('email', '') or 'No email',
                    "phone": user_dict.get('phone'),
                    "status": "Blocked",
                    "revenue": float(revenue_val) if revenue_val else 0.0,
                    "rating": 0.0,
                    "bookings": int(bookings) if bookings else 0,
                    "reviews": int(reviews_count) if reviews_count else 0,
                    "performance": float(performance) if performance else 0.0,
                    "account_type": account_type,
                    "created_at": user_dict.get('created_at'),
                }
                
                # Add blocked-specific fields if needed (these won't be in schema but won't break it)
                if user_dict.get('blocked_reason'):
                    supplier_data["blocked_reason"] = user_dict.get('blocked_reason')
                if user_dict.get('blocked_at'):
                    supplier_data["blocked_at"] = user_dict.get('blocked_at')
                
                suppliers_data.append(supplier_data)
                logger.debug(f"[get_blocked_suppliers] Added supplier {supplier_code} to results")

            logger.info(f"[get_blocked_suppliers] Returning {len(suppliers_data)} suppliers, total={total}")
            
            result = {
                "suppliers": suppliers_data,
                "total": int(total) if total else 0,
                "page": int(page) if page else 1,
                "page_size": int(page_size) if page_size else 10,
                "total_pages": int((total + page_size - 1) // page_size) if page_size and total else 0
            }
            
            logger.debug(f"[get_blocked_suppliers] Result structure: suppliers={len(result['suppliers'])}, total={result['total']}")
            return result
        except Exception as e:
            logger.error(f"Error fetching blocked suppliers: {e}", exc_info=True)
            # Return empty result instead of raising to prevent 500 error
            return {
                "suppliers": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0
            }
