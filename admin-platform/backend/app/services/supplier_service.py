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

                suppliers_data.append({
                    "id": supplier_code,
                    "supplier_id": supplier_code,
                    "name": user.business_name or user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "location": location,
                    "total_tours": total_tours,
                    "status": "Active",
                    "revenue": 0,  # No revenue tracked on user doc; can be enriched later
                    "rating": 0,
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
