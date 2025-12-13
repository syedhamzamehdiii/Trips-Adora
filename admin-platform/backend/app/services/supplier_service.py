"""
Supplier Service
Handles business logic for supplier operations
"""
from typing import Optional
from datetime import datetime
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

                suppliers_data.append({
                    "id": supplier_code,
                    "supplier_id": supplier_code,
                    "name": user.business_name or user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "location": location,
                    "total_tours": total_tours,
                    "status": "Active",
                    "revenue": revenue_val,
                    "rating": 0,
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
            
            # Total earnings: we currently don't track revenue on User; keep Supplier total_revenue if present
            suppliers = await Supplier.find().to_list()
            total_earnings = sum(supplier.total_revenue or 0 for supplier in suppliers)
            
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

            address = user.address or (onboarding.person_address if onboarding else None)
            city = getattr(onboarding, "business_city", None) if onboarding else None
            state = getattr(onboarding, "business_state", None) if onboarding else None
            country = user.country or (onboarding.business_country if onboarding else None)

            # Placeholder payouts until payouts collection exists
            payouts: list[dict] = []

            documents: list[DocumentInfo] = []
            if onboarding:
                doc_fields = [
                    ("Insurance Doc.", onboarding.insurance_document_url),
                    ("Business Doc.", onboarding.business_document_url),
                    ("Logo Uploaded", onboarding.logo_url),
                    ("ID Front", onboarding.id_front_url),
                    ("ID Back", onboarding.id_back_url),
                ]
                for label, url in doc_fields:
                    if url:
                        documents.append(DocumentInfo(id=f"{label}".replace(" ", "_"), label=label, url=url))

            return SupplierDetailResponse(
                id=user.supplier_code or f"SUP-{user_id_str[:8]}",
                name=user.business_name or user.full_name,
                legal_name=onboarding.user_name if onboarding else None,
                email=user.email,
                phone=user.phone,
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
                    vehicle_details = doc.get("vehicle_details") or {}
                    vehicle = vehicle_details.get("vehicle_model") or vehicle_details.get("vehicle_type")
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
