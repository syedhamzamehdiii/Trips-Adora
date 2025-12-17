"""
Finance Service
Realtime finance aggregation for admin platform.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from bson import ObjectId

from app.core.database import get_database
import logging
from app.services.platform_settings_service import PlatformSettingsService

logger = logging.getLogger(__name__)


class FinanceService:
    BOOKINGS_COLLECTION = "customer_bookings"
    USERS_COLLECTION = "users"
    PRODUCTS_COLLECTION = "products"

    # Commission rate is dynamic (Admin Settings) via PlatformSettingsService.

    @staticmethod
    def _db():
        return get_database()

    @staticmethod
    def _parse_month(month: Optional[str]) -> Optional[int]:
        if not month:
            return None
        m = str(month).strip()
        if not m or m.lower() == "all":
            return None
        month_map = {
            "jan": 1, "january": 1,
            "feb": 2, "february": 2,
            "mar": 3, "march": 3,
            "apr": 4, "april": 4,
            "may": 5,
            "jun": 6, "june": 6,
            "jul": 7, "july": 7,
            "aug": 8, "august": 8,
            "sep": 9, "sept": 9, "september": 9,
            "oct": 10, "october": 10,
            "nov": 11, "november": 11,
            "dec": 12, "december": 12,
        }
        key = m.lower()
        if key.isdigit():
            val = int(key)
            return val if 1 <= val <= 12 else None
        return month_map.get(key[:3], month_map.get(key))

    @staticmethod
    def _month_bounds(year: int, month: int) -> Tuple[datetime, datetime]:
        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1) - timedelta(microseconds=1)
        else:
            end = datetime(year, month + 1, 1) - timedelta(microseconds=1)
        return start, end

    @staticmethod
    def _month_abbr(month: int) -> str:
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]

    @staticmethod
    def _non_cancelled_match() -> Dict[str, Any]:
        cancelled = ["cancelled", "canceled", "refund", "refund/dispute"]
        # Allow missing status; exclude known cancelled statuses (case-insensitive)
        return {
            "$or": [
                {"status": {"$exists": False}},
                {"status": None},
                {"$expr": {"$not": [{"$in": [{"$toLower": {"$ifNull": ["$status", ""]}}, cancelled]}]}},
            ]
        }

    @staticmethod
    async def get_summary() -> Dict[str, Any]:
        db = FinanceService._db()
        bookings = db[FinanceService.BOOKINGS_COLLECTION]
        commission_rate = await PlatformSettingsService.get_commission_rate()

        now = datetime.utcnow()
        this_month_start = datetime(now.year, now.month, 1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        last_month_end = this_month_start - timedelta(microseconds=1)

        base_match = FinanceService._non_cancelled_match()

        # Total revenue (all time)
        revenue_pipeline = [
            {"$match": base_match},
            {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$total_amount", 0]}}}},
        ]
        revenue_result = await bookings.aggregate(revenue_pipeline).to_list(length=1)
        total_revenue = float(revenue_result[0].get("total", 0) or 0) if revenue_result else 0.0

        # This month revenue
        this_month_pipeline = [
            {"$match": {"$and": [base_match, {"created_at": {"$gte": this_month_start}}]}},
            {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$total_amount", 0]}}}},
        ]
        this_month_result = await bookings.aggregate(this_month_pipeline).to_list(length=1)
        revenue_this_month = float(this_month_result[0].get("total", 0) or 0) if this_month_result else 0.0

        # Last month revenue
        last_month_pipeline = [
            {"$match": {"$and": [base_match, {"created_at": {"$gte": last_month_start, "$lte": last_month_end}}]}},
            {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$total_amount", 0]}}}},
        ]
        last_month_result = await bookings.aggregate(last_month_pipeline).to_list(length=1)
        revenue_last_month = float(last_month_result[0].get("total", 0) or 0) if last_month_result else 0.0

        def pct_change(curr: float, prev: float) -> float:
            if prev > 0:
                return round(((curr - prev) / prev) * 100, 1)
            if curr > 0:
                return 100.0
            return 0.0

        revenue_change = pct_change(revenue_this_month, revenue_last_month)

        total_commission = round(total_revenue * commission_rate, 2)
        total_supplier_payouts = round(total_revenue * (1 - commission_rate), 2)

        commission_change = pct_change(
            revenue_this_month * commission_rate,
            revenue_last_month * commission_rate,
        )
        payouts_change = pct_change(
            revenue_this_month * (1 - commission_rate),
            revenue_last_month * (1 - commission_rate),
        )

        return {
            "total_revenue": round(total_revenue, 2),
            "revenue_change": revenue_change,
            "total_commission": total_commission,
            "commission_change": commission_change,
            "total_supplier_payouts": total_supplier_payouts,
            "payouts_change": payouts_change,
        }

    @staticmethod
    async def get_trend(months: int = 6) -> List[Dict[str, Any]]:
        months = int(months or 6)
        months = max(1, min(months, 24))

        db = FinanceService._db()
        bookings = db[FinanceService.BOOKINGS_COLLECTION]
        commission_rate = await PlatformSettingsService.get_commission_rate()

        base_match = FinanceService._non_cancelled_match()

        pipeline = [
            {"$match": base_match},
            {"$addFields": {"year": {"$year": "$created_at"}, "month": {"$month": "$created_at"}}},
            {"$group": {
                "_id": {"year": "$year", "month": "$month"},
                "revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}},
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1}},
        ]
        rows = await bookings.aggregate(pipeline).to_list(length=None)
        rows = rows[-months:] if len(rows) > months else rows

        points = []
        for row in rows:
            m = int(row["_id"]["month"])
            revenue = float(row.get("revenue", 0) or 0)
            commission = revenue * commission_rate
            payout = revenue * (1 - commission_rate)
            points.append({
                "month": FinanceService._month_abbr(m),
                "revenue": round(revenue, 2),
                "commission": round(commission, 2),
                "net_earnings": round(payout, 2),
            })

        return points

    @staticmethod
    async def list_supplier_payouts(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        month: Optional[str] = None,
    ) -> Dict[str, Any]:
        page = max(1, int(page or 1))
        page_size = max(1, min(int(page_size or 10), 100))

        db = FinanceService._db()
        bookings = db[FinanceService.BOOKINGS_COLLECTION]
        users = db[FinanceService.USERS_COLLECTION]
        products = db[FinanceService.PRODUCTS_COLLECTION]
        commission_rate = await PlatformSettingsService.get_commission_rate()

        base_match = FinanceService._non_cancelled_match()

        match_parts: List[Dict[str, Any]] = [base_match]

        mnum = FinanceService._parse_month(month)
        if mnum:
            now = datetime.utcnow()
            start, end = FinanceService._month_bounds(now.year, mnum)
            match_parts.append({"created_at": {"$gte": start, "$lte": end}})

        pipeline: List[Dict[str, Any]] = [
            {"$match": {"$and": match_parts}},
            {"$addFields": {
                "month_num": {"$month": "$created_at"},
                "product_name": {
                    "$ifNull": [
                        "$tour_name",
                        {"$ifNull": ["$product_title", {"$ifNull": ["$title", ""]}]},
                    ]
                },
            }},
            {"$group": {
                "_id": {
                    "supplier_id": "$supplier_id",
                    "product_id": "$product_id",
                    "product_name": "$product_name",
                    "month_num": "$month_num",
                },
                "bookings": {"$sum": 1},
                "earnings": {"$sum": {"$ifNull": ["$total_amount", 0]}},
            }},
            {"$sort": {"_id.month_num": -1, "earnings": -1}},
        ]

        # Fetch all grouped rows (bounded) and paginate in Python (keeps it simpler/safer)
        grouped = await bookings.aggregate(pipeline).to_list(length=None)

        # Resolve supplier codes for search filtering
        supplier_ids = []
        for row in grouped:
            sid = row.get("_id", {}).get("supplier_id")
            if sid and sid not in supplier_ids:
                supplier_ids.append(sid)

        supplier_code_by_id: Dict[str, str] = {}
        obj_ids = [ObjectId(sid) for sid in supplier_ids if ObjectId.is_valid(sid)]
        if obj_ids:
            cursor = users.find({"_id": {"$in": obj_ids}}, {"supplier_code": 1})
            async for u in cursor:
                supplier_code_by_id[str(u["_id"])] = u.get("supplier_code") or None

        # Apply search
        if search:
            s = search.lower().strip()
            def matches(row: Dict[str, Any]) -> bool:
                _id = row.get("_id", {})
                sid = str(_id.get("supplier_id") or "")
                scode = (supplier_code_by_id.get(sid) or "").lower()
                pname = str(_id.get("product_name") or "").lower()
                return s in sid.lower() or s in scode or s in pname
            grouped = [r for r in grouped if matches(r)]

        total = len(grouped)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_rows = grouped[start_idx:end_idx]

        # Fill missing product names from products collection if needed
        product_ids = []
        for row in page_rows:
            pid = row.get("_id", {}).get("product_id")
            if pid and pid not in product_ids:
                product_ids.append(pid)

        product_title_by_id: Dict[str, str] = {}
        obj_pids = [ObjectId(pid) for pid in product_ids if ObjectId.is_valid(pid)]
        if obj_pids:
            cursor = products.find({"_id": {"$in": obj_pids}}, {"title": 1})
            async for p in cursor:
                product_title_by_id[str(p["_id"])] = p.get("title") or ""

        rows_out: List[Dict[str, Any]] = []
        for row in page_rows:
            _id = row.get("_id", {})
            sid = str(_id.get("supplier_id") or "")
            scode = supplier_code_by_id.get(sid) or sid
            pid = _id.get("product_id")
            pname = (_id.get("product_name") or "").strip()
            if (not pname) and pid:
                pname = product_title_by_id.get(str(pid), "") or "Product"
            earnings = float(row.get("earnings", 0) or 0)
            commission = earnings * commission_rate
            payout = earnings * (1 - commission_rate)
            month_num = int(_id.get("month_num") or 0) or None

            rows_out.append({
                "supplier_id": sid,
                "supplier_code": scode,
                "month": FinanceService._month_abbr(month_num) if month_num else "",
                "product_id": str(pid) if pid else None,
                "product_name": pname or "Product",
                "bookings": int(row.get("bookings", 0) or 0),
                "earnings": round(earnings, 2),
                "commission": round(commission, 2),
                "payout": round(payout, 2),
            })

        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        return {
            "rows": rows_out,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    @staticmethod
    async def list_admin_commission(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        month: Optional[str] = None,
    ) -> Dict[str, Any]:
        page = max(1, int(page or 1))
        page_size = max(1, min(int(page_size or 10), 100))

        db = FinanceService._db()
        bookings = db[FinanceService.BOOKINGS_COLLECTION]
        commission_rate = await PlatformSettingsService.get_commission_rate()

        base_match = FinanceService._non_cancelled_match()
        match_parts: List[Dict[str, Any]] = [base_match]

        mnum = FinanceService._parse_month(month)
        if mnum:
            now = datetime.utcnow()
            start, end = FinanceService._month_bounds(now.year, mnum)
            match_parts.append({"created_at": {"$gte": start, "$lte": end}})

        pipeline = [
            {"$match": {"$and": match_parts}},
            {"$addFields": {"month_num": {"$month": "$created_at"}}},
            {"$group": {
                "_id": {"month_num": "$month_num"},
                "total_earnings": {"$sum": {"$ifNull": ["$total_amount", 0]}},
            }},
            {"$sort": {"_id.month_num": -1}},
        ]
        grouped = await bookings.aggregate(pipeline).to_list(length=None)

        # Search by month label if provided
        if search:
            s = search.lower().strip()
            grouped = [r for r in grouped if s in FinanceService._month_abbr(int(r["_id"]["month_num"])).lower()]

        total = len(grouped)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_rows = grouped[start_idx:end_idx]

        rows_out = []
        for row in page_rows:
            month_num = int(row.get("_id", {}).get("month_num") or 0)
            earnings = float(row.get("total_earnings", 0) or 0)
            commission = earnings * commission_rate
            supplier_payouts = earnings * (1 - commission_rate)
            rows_out.append({
                "month": FinanceService._month_abbr(month_num) if month_num else "",
                "total_earnings": round(earnings, 2),
                "commission": round(commission, 2),
                "supplier_payouts": round(supplier_payouts, 2),
                "bank": None,
                "payout_status": "Withdraw" if commission > 0 else None,
                "wallet_received": False,
            })

        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        return {
            "rows": rows_out,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    @staticmethod
    async def list_supplier_payout_history(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        month: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Merge ALL suppliers' payout history into a single table, matching the
        supplier detail "Supplier Payout History" format:
        date + product + bookings + earnings + commission(25%) + dueAmount + payout.
        """
        page = max(1, int(page or 1))
        page_size = max(1, min(int(page_size or 10), 100))

        db = FinanceService._db()
        bookings = db[FinanceService.BOOKINGS_COLLECTION]
        users = db[FinanceService.USERS_COLLECTION]
        commission_rate = await PlatformSettingsService.get_commission_rate()

        base_match = FinanceService._non_cancelled_match()
        match_parts: List[Dict[str, Any]] = [base_match]

        # Month filter (by created_at)
        mnum = FinanceService._parse_month(month)
        if mnum:
            now = datetime.utcnow()
            start, end = FinanceService._month_bounds(now.year, mnum)
            match_parts.append({"created_at": {"$gte": start, "$lte": end}})

        # Search (supplier id/code or product name)
        if search and str(search).strip():
            s = str(search).strip()

            supplier_ids_from_code: List[str] = []
            try:
                cursor = users.find({"supplier_code": {"$regex": s, "$options": "i"}}, {"_id": 1})
                async for u in cursor:
                    supplier_ids_from_code.append(str(u["_id"]))
            except Exception as e:
                logger.debug(f"Supplier code lookup failed for search={s}: {e}")

            or_parts: List[Dict[str, Any]] = []
            if supplier_ids_from_code:
                or_parts.append({"supplier_id": {"$in": supplier_ids_from_code}})

            # supplier_id raw match (string ObjectId)
            or_parts.append({"supplier_id": {"$regex": s, "$options": "i"}})

            # product name match (common fields)
            or_parts.append({"product_title": {"$regex": s, "$options": "i"}})
            or_parts.append({"title": {"$regex": s, "$options": "i"}})
            or_parts.append({"tour_name": {"$regex": s, "$options": "i"}})

            match_parts.append({"$or": or_parts})

        skip = (page - 1) * page_size

        pipeline: List[Dict[str, Any]] = [
            {"$match": {"$and": match_parts}},
            {
                "$project": {
                    "created_at": 1,
                    "supplier_id": 1,
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
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                    },
                    "payout_product": {
                        "$ifNull": [
                            "$product_title",
                            {"$ifNull": ["$title", "$tour_name"]},
                        ]
                    },
                }
            },
            {
                "$group": {
                    "_id": {
                        "supplier_id": "$supplier_id",
                        "date": "$payout_date",
                        "product": "$payout_product",
                    },
                    "bookings": {"$sum": 1},
                    "earnings": {"$sum": "$total_amount"},
                    "sample_ref": {"$first": "$reference_code"},
                }
            },
            {"$sort": {"_id.date": -1, "earnings": -1}},
            {
                "$facet": {
                    "metadata": [{"$count": "total"}],
                    "rows": [{"$skip": skip}, {"$limit": page_size}],
                }
            },
        ]

        agg = await bookings.aggregate(pipeline).to_list(length=1)
        facet = agg[0] if agg else {"metadata": [], "rows": []}
        total = int((facet.get("metadata") or [{}])[0].get("total", 0) or 0) if facet.get("metadata") else 0
        rows = facet.get("rows") or []

        # Resolve supplier codes for the current page
        supplier_ids = []
        for r in rows:
            sid = (r.get("_id") or {}).get("supplier_id")
            if sid and sid not in supplier_ids:
                supplier_ids.append(sid)

        supplier_code_by_id: Dict[str, str] = {}
        obj_ids = [ObjectId(sid) for sid in supplier_ids if ObjectId.is_valid(sid)]
        if obj_ids:
            cursor = users.find({"_id": {"$in": obj_ids}}, {"supplier_code": 1})
            async for u in cursor:
                supplier_code_by_id[str(u["_id"])] = u.get("supplier_code") or None

        rows_out: List[Dict[str, Any]] = []
        for r in rows:
            _id = r.get("_id") or {}
            sid = str(_id.get("supplier_id") or "")
            scode = supplier_code_by_id.get(sid) or sid

            date_str = _id.get("date") or ""
            raw_product = _id.get("product")
            product_name = raw_product or "—"

            bookings_count = int(r.get("bookings", 0) or 0)
            earnings_val = float(r.get("earnings", 0) or 0.0)

            commission_val = round(earnings_val * commission_rate, 2)
            payout_amount = round(earnings_val - commission_val, 2)
            due_amount = payout_amount

            rows_out.append(
                {
                    "date": date_str,
                    "supplier_id": sid,
                    "supplier_code": scode,
                    "product": product_name,
                    "reference": r.get("sample_ref"),
                    "bookings": bookings_count,
                    "earnings": round(earnings_val, 2),
                    "commission": commission_val,
                    "dueAmount": round(due_amount, 2),
                    "payout": round(payout_amount, 2),
                }
            )

        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        return {
            "rows": rows_out,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }


