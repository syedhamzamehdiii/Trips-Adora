"""
Dashboard Service
Handles business logic for admin dashboard statistics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
from bson import ObjectId
from app.core.database import get_database
import logging
import re

logger = logging.getLogger(__name__)


class DashboardService:
    BOOKINGS_COLLECTION = "customer_bookings"

    @staticmethod
    def _get_collection(name: str):
        """Get a MongoDB collection by name."""
        db = get_database()
        return db[name]
    
    @staticmethod
    def _is_valid_country(value: str) -> bool:
        """
        Validate if a value looks like a valid country name.
        Filters out numeric values, postal codes, phone numbers, etc.
        """
        if not value or not isinstance(value, str):
            return False
        
        value = value.strip()
        
        # Too short to be a country
        if len(value) < 2:
            return False
        
        # If it's purely numeric (like "54000"), it's not a country
        if value.isdigit():
            return False
        
        # If it's mostly numbers with some characters, likely a postal code
        if len([c for c in value if c.isdigit()]) > len([c for c in value if c.isalpha()]):
            return False
        
        # Must contain at least one letter
        if not any(c.isalpha() for c in value):
            return False
        
        # Common invalid patterns
        invalid_patterns = ['+', '@', '#', 'http', 'www', '.com', '.org']
        if any(pattern in value.lower() for pattern in invalid_patterns):
            return False
        
        return True
    
    @staticmethod
    def _get_country_from_city(city: str) -> str:
        """
        Map city name to country name.
        Returns the country name if city is found in mapping, otherwise returns the city name.
        """
        if not city or not isinstance(city, str):
            return None
        
        city = city.strip().title()  # Normalize to Title Case
        
        # Major cities to countries mapping (unique entries only)
        city_to_country = {
            # Pakistan cities (major ones)
            'Lahore': 'Pakistan', 'Karachi': 'Pakistan', 'Islamabad': 'Pakistan',
            'Rawalpindi': 'Pakistan', 'Faisalabad': 'Pakistan', 'Multan': 'Pakistan',
            'Peshawar': 'Pakistan', 'Quetta': 'Pakistan', 'Sialkot': 'Pakistan',
            'Gujranwala': 'Pakistan', 'Hyderabad': 'Pakistan', 'Sargodha': 'Pakistan',
            'Bahawalpur': 'Pakistan', 'Sukkur': 'Pakistan', 'Larkana': 'Pakistan',
            'Sheikhupura': 'Pakistan', 'Rahim Yar Khan': 'Pakistan', 'Gujrat': 'Pakistan',
            'Kasur': 'Pakistan', 'Mardan': 'Pakistan', 'Mingora': 'Pakistan',
            'Nawabshah': 'Pakistan', 'Chiniot': 'Pakistan', 'Kotri': 'Pakistan',
            'Khanpur': 'Pakistan', 'Hafizabad': 'Pakistan', 'Kohat': 'Pakistan',
            'Jacobabad': 'Pakistan', 'Shikarpur': 'Pakistan', 'Muzaffargarh': 'Pakistan',
            'Khanewal': 'Pakistan', 'Kamoke': 'Pakistan', 'Umerkot': 'Pakistan',
            'Umarkot': 'Pakistan', 'Jhelum': 'Pakistan', 'Gwadar': 'Pakistan',
            'Dera Ghazi Khan': 'Pakistan', 'Dadu': 'Pakistan', 'Mandi Bahauddin': 'Pakistan',
            'Tando Allahyar': 'Pakistan', 'Tando Adam': 'Pakistan', 'Khairpur': 'Pakistan',
            'Mirpur Khas': 'Pakistan', 'Kunri': 'Pakistan', 'Digri': 'Pakistan',
            'Sanghar': 'Pakistan', 'Nawabshah': 'Pakistan', 'Ghotki': 'Pakistan',
            'Rohri': 'Pakistan', 'Kandhkot': 'Pakistan', 'Mithi': 'Pakistan',
            'Chachro': 'Pakistan', 'Nagarparkar': 'Pakistan', 'Islamkot': 'Pakistan',
            'Nangarparkar': 'Pakistan', 'Bannu': 'Pakistan', 'Haripur': 'Pakistan',
            'Narowal': 'Pakistan', 'Okara': 'Pakistan', 'Sahiwal': 'Pakistan',
            'Pakpattan': 'Pakistan', 'Chichawatni': 'Pakistan', 'Thatta': 'Pakistan',
            'Dera Ismail Khan': 'Pakistan', 'Charsadda': 'Pakistan', 'Tank': 'Pakistan',
            # Add more cities from other countries as needed
        }
        
        # Check exact match first
        if city in city_to_country:
            return city_to_country[city]
        
        # Check case-insensitive match
        city_lower = city.lower()
        for mapped_city, country in city_to_country.items():
            if mapped_city.lower() == city_lower:
                return country
        
        # If city not found in mapping, return the city name itself
        # (it might already be a country name)
        return city
    
    @staticmethod
    def _extract_city_from_address(address: str) -> str:
        """
        Extract city name from a long address string and return the country.
        Example: "House no 1170, Street 1, Woods Block, Paragon City, Lahore, 54000" -> "Pakistan"
        """
        if not address or not isinstance(address, str):
            return None
        
        address = address.strip()
        
        # Split by common delimiters (comma, semicolon, or newline)
        parts = [p.strip() for p in re.split(r'[,;]', address)]
        
        # Remove empty parts
        parts = [p for p in parts if p]
        
        if not parts:
            return None
        
        # Common address keywords to skip
        address_keywords = ['house', 'street', 'block', 'road', 'avenue', 'lane', 'drive', 
                          'boulevard', 'circle', 'court', 'place', 'way', 'park', 'plaza',
                          'apartment', 'apt', 'suite', 'unit', 'building', 'floor', 'room']
        
        # Look for city name - usually one of the last meaningful parts before postal code
        # Common pattern: ... City, CityName, PostalCode
        # Or: ... CityName, PostalCode
        # We'll collect potential city names and return the one that maps to a country
        potential_cities = []
        
        for i in range(len(parts) - 1, -1, -1):
            part = parts[i].strip()
            
            # Skip if it's purely numeric (postal code)
            if part.isdigit():
                continue
            
            # Skip if it's mostly numbers (likely postal code or house number)
            digit_count = len([c for c in part if c.isdigit()])
            alpha_count = len([c for c in part if c.isalpha()])
            if digit_count > alpha_count and digit_count > 2:
                continue
            
            # Skip common address keywords
            part_lower = part.lower()
            if any(keyword in part_lower for keyword in address_keywords):
                continue
            
            # If it contains "city" or "town", the next part is likely the city name
            if 'city' in part_lower or 'town' in part_lower:
                if i + 1 < len(parts):
                    next_part = parts[i + 1].strip()
                    if DashboardService._is_valid_country(next_part) and not any(c.isdigit() for c in next_part):
                        # Convert city to country
                        country = DashboardService._get_country_from_city(next_part)
                        if country and country != next_part:  # If it mapped to a country, return it
                            return country
                        potential_cities.append(next_part)
                continue
            
            # Check if this part looks like a valid city name
            if DashboardService._is_valid_country(part):
                # Additional check: city names are usually 2-30 characters and don't contain numbers
                if 2 <= len(part) <= 30 and not any(c.isdigit() for c in part):
                    # Try to convert city to country
                    country = DashboardService._get_country_from_city(part)
                    if country and country != part:  # If it mapped to a country, return it immediately
                        return country
                    potential_cities.append(part)
        
        # If we found potential cities, try to map them to countries
        for city in potential_cities:
            country = DashboardService._get_country_from_city(city)
            if country and country != city:  # If it successfully mapped to a country
                return country
        
        # If no mapping found, return the first potential city (might already be a country name)
        if potential_cities:
            return potential_cities[0]
        
        # If no city found yet, try the second-to-last part (common pattern: ..., City, PostalCode)
        if len(parts) >= 2:
            candidate = parts[-2].strip()
            if (DashboardService._is_valid_country(candidate) and 
                not any(c.isdigit() for c in candidate) and
                len(candidate) >= 2):
                # Convert city to country
                country = DashboardService._get_country_from_city(candidate)
                if country and country != candidate:  # If it mapped to a country
                    return country
                return candidate
        
        return None

    @staticmethod
    async def get_dashboard_stats() -> Dict[str, Any]:
        """
        Get dashboard statistics:
        - Total bookings
        - Total earnings/revenue
        - Cancellation rate
        - Percentage changes for trends
        """
        try:
            bookings_collection = DashboardService._get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            now = datetime.utcnow()
            this_month_start = datetime(now.year, now.month, 1)
            last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
            last_month_end = this_month_start - timedelta(seconds=1)
            
            # Total bookings (all time)
            total_bookings = await bookings_collection.count_documents({})
            
            # Total bookings this month
            bookings_this_month = await bookings_collection.count_documents({
                "created_at": {"$gte": this_month_start}
            })
            
            # Total bookings last month
            bookings_last_month = await bookings_collection.count_documents({
                "created_at": {"$gte": last_month_start, "$lte": last_month_end}
            })
            
            # Calculate bookings percentage change
            bookings_change = 0.0
            if bookings_last_month > 0:
                bookings_change = ((bookings_this_month - bookings_last_month) / bookings_last_month) * 100
            elif bookings_this_month > 0:
                bookings_change = 100.0
            
            # Total revenue (all time)
            revenue_pipeline = [
                {"$group": {
                    "_id": None,
                    "total_revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            revenue_result = await bookings_collection.aggregate(revenue_pipeline).to_list(length=1)
            total_revenue = float(revenue_result[0].get("total_revenue", 0)) if revenue_result else 0.0
            
            # Revenue this month
            revenue_this_month_pipeline = [
                {"$match": {"created_at": {"$gte": this_month_start}}},
                {"$group": {
                    "_id": None,
                    "total_revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            revenue_this_month_result = await bookings_collection.aggregate(revenue_this_month_pipeline).to_list(length=1)
            revenue_this_month = float(revenue_this_month_result[0].get("total_revenue", 0)) if revenue_this_month_result else 0.0
            
            # Revenue last month
            revenue_last_month_pipeline = [
                {"$match": {"created_at": {"$gte": last_month_start, "$lte": last_month_end}}},
                {"$group": {
                    "_id": None,
                    "total_revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            revenue_last_month_result = await bookings_collection.aggregate(revenue_last_month_pipeline).to_list(length=1)
            revenue_last_month = float(revenue_last_month_result[0].get("total_revenue", 0)) if revenue_last_month_result else 0.0
            
            # Calculate revenue percentage change
            revenue_change = 0.0
            if revenue_last_month > 0:
                revenue_change = ((revenue_this_month - revenue_last_month) / revenue_last_month) * 100
            elif revenue_this_month > 0:
                revenue_change = 100.0
            
            # Cancellation rate
            # Count cancelled bookings (assuming status field or cancellation field exists)
            cancelled_bookings = await bookings_collection.count_documents({
                "$or": [
                    {"status": {"$in": ["cancelled", "canceled", "Cancelled", "Canceled"]}},
                    {"cancelled": True},
                    {"is_cancelled": True}
                ]
            })
            
            cancellation_rate = 0.0
            if total_bookings > 0:
                cancellation_rate = (cancelled_bookings / total_bookings) * 100
            
            # Cancellation rate last month
            cancelled_last_month = await bookings_collection.count_documents({
                "$and": [
                    {"created_at": {"$gte": last_month_start, "$lte": last_month_end}},
                    {"$or": [
                        {"status": {"$in": ["cancelled", "canceled", "Cancelled", "Canceled"]}},
                        {"cancelled": True},
                        {"is_cancelled": True}
                    ]}
                ]
            })
            
            bookings_last_month_for_cancel = await bookings_collection.count_documents({
                "created_at": {"$gte": last_month_start, "$lte": last_month_end}
            })
            
            cancellation_rate_last_month = 0.0
            if bookings_last_month_for_cancel > 0:
                cancellation_rate_last_month = (cancelled_last_month / bookings_last_month_for_cancel) * 100
            
            # Calculate cancellation rate change
            cancellation_change = cancellation_rate - cancellation_rate_last_month
            
            return {
                "total_bookings": total_bookings,
                "bookings_change": round(bookings_change, 1),
                "total_revenue": round(total_revenue, 2),
                "revenue_change": round(revenue_change, 1),
                "cancellation_rate": round(cancellation_rate, 1),
                "cancellation_change": round(cancellation_change, 1),
            }
        except Exception as e:
            logger.error(f"Error in get_dashboard_stats: {e}", exc_info=True)
            raise

    @staticmethod
    async def get_bookings_revenue_chart(months: int = 12) -> List[Dict[str, Any]]:
        """
        Get bookings and revenue data for chart (time series).
        Returns data grouped by month.
        """
        try:
            bookings_collection = DashboardService._get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            now = datetime.utcnow()
            start_date = now - timedelta(days=months * 30)
            
            # Aggregate bookings and revenue by month
            pipeline = [
                {"$match": {"created_at": {"$gte": start_date}}},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"}
                    },
                    "bookings": {"$sum": 1},
                    "revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }},
                {"$sort": {"_id.year": 1, "_id.month": 1}}
            ]
            
            results = await bookings_collection.aggregate(pipeline).to_list(length=None)
            
            # Format data for chart - only include months with actual data
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            chart_data = []
            
            # Only include months that have bookings > 0 or revenue > 0
            for result in results:
                bookings_count = int(result.get("bookings", 0))
                revenue_amount = float(result.get("revenue", 0))
                
                # Only add months with actual data
                if bookings_count > 0 or revenue_amount > 0:
                    year = result["_id"]["year"]
                    month = result["_id"]["month"]
                    
                    chart_data.append({
                        "month": month_names[month - 1],
                        "country": None,  # Add country field as None for schema compatibility
                        "bookings": bookings_count,
                        "revenue": round(revenue_amount, 0)  # Keep in original units, frontend will format
                    })
            
            return chart_data
        except Exception as e:
            logger.error(f"Error in get_bookings_revenue_chart: {e}", exc_info=True)
            raise

    @staticmethod
    async def get_top_countries_by_month(month_name: str = None) -> List[Dict[str, Any]]:
        """
        Get top countries by bookings for a specific month.
        If month_name is None, uses current month.
        Returns top 4 countries with booking counts.
        """
        try:
            bookings_collection = DashboardService._get_collection(DashboardService.BOOKINGS_COLLECTION)
            users_collection = DashboardService._get_collection("users")
            
            now = datetime.utcnow()
            
            # Parse month name to month number
            month_names = {
                'january': 1, 'february': 2, 'march': 3, 'april': 4,
                'may': 5, 'june': 6, 'july': 7, 'august': 8,
                'september': 9, 'october': 10, 'november': 11, 'december': 12,
                'all': None  # Special case for "All"
            }
            
            # Get bookings - filter by month if specified, otherwise get all
            if month_name and month_name.lower() != 'all':
                month_num = month_names.get(month_name.lower(), now.month)
                year = now.year
                # If month is in the future, use previous year
                if month_num > now.month:
                    year = now.year - 1
                
                month_start = datetime(year, month_num, 1)
                if month_num == 12:
                    month_end = datetime(year + 1, 1, 1)
                else:
                    month_end = datetime(year, month_num + 1, 1)
                
                # Get all bookings for the month
                bookings = await bookings_collection.find({
                    "created_at": {"$gte": month_start, "$lt": month_end}
                }, {"user_id": 1}).to_list(length=None)
            else:
                # Get all bookings (when "All" is selected or no month specified)
                bookings = await bookings_collection.find({}, {"user_id": 1}).to_list(length=None)
            
            # Get unique user IDs and convert to ObjectId if needed
            user_ids_raw = [b.get("user_id") for b in bookings if b.get("user_id")]
            user_ids = []
            for uid in user_ids_raw:
                try:
                    if isinstance(uid, str):
                        user_ids.append(ObjectId(uid))
                    elif isinstance(uid, ObjectId):
                        user_ids.append(uid)
                except:
                    continue
            
            if not user_ids:
                return []
            
            # Get countries from users collection
            user_docs = await users_collection.find(
                {"_id": {"$in": user_ids}},
                {"country": 1, "city": 1, "address": 1, "location": 1}
            ).to_list(length=None)
            
            # Map user_id to country
            user_country_map = {}
            for doc in user_docs:
                user_id_obj = doc.get("_id")
                # Try country first, then city, then extract from location/address
                country = doc.get("country")
                if not country or not DashboardService._is_valid_country(country):
                    country = doc.get("city")
                    if not country or not DashboardService._is_valid_country(country):
                        # Try location - but if it's a long address, extract from it
                        location = doc.get("location")
                        if location and isinstance(location, str):
                            if len(location) > 20:
                                # It's likely a full address, extract city/country from it
                                country = DashboardService._extract_city_from_address(location)
                            elif DashboardService._is_valid_country(location):
                                country = location
                            else:
                                country = None
                        else:
                            country = None
                        
                        # If still no country, try to extract from address if it's a long address
                        if not country or not DashboardService._is_valid_country(country):
                            address = doc.get("address")
                            if address and isinstance(address, str) and len(address) > 20:
                                country = DashboardService._extract_city_from_address(address)
                            else:
                                country = None
                
                if country and DashboardService._is_valid_country(country):
                    # Map both ObjectId and string versions
                    user_country_map[str(user_id_obj)] = country
                    if isinstance(user_id_obj, ObjectId):
                        user_country_map[user_id_obj] = country
            
            # For users still missing country, check customer_profiles
            missing_country_user_ids = [
                str(uid) for uid in user_ids
                if not user_country_map.get(str(uid)) and not user_country_map.get(uid)
            ]
            if missing_country_user_ids:
                profiles_collection = DashboardService._get_collection("customer_profiles")
                profile_docs = await profiles_collection.find(
                    {"user_id": {"$in": missing_country_user_ids}},
                    {"user_id": 1, "user": 1, "country": 1, "city": 1, "address": 1, "location": 1}
                ).to_list(length=None)
                
                for profile in profile_docs:
                    user_id_str = str(profile.get("user_id"))
                    country = None
                    
                    # First try top-level country field
                    country = profile.get("country")
                    if not country or not DashboardService._is_valid_country(country):
                        # Try city
                        country = profile.get("city")
                        if not country or not DashboardService._is_valid_country(country):
                            # Try location - but if it's a long address, extract from it
                            location = profile.get("location")
                            if location and isinstance(location, str):
                                if len(location) > 20:
                                    # It's likely a full address, extract city/country from it
                                    country = DashboardService._extract_city_from_address(location)
                                elif DashboardService._is_valid_country(location):
                                    country = location
                                else:
                                    country = None
                            else:
                                country = None
                            
                            # If still no country, try to extract from address field
                            if not country or not DashboardService._is_valid_country(country):
                                address = profile.get("address")
                                if address and isinstance(address, str) and len(address) > 20:
                                    country = DashboardService._extract_city_from_address(address)
                                else:
                                    country = None
                    
                    # If not found, check user section (like supplier does)
                    if not country:
                        user_section = profile.get("user") or {}
                        country = user_section.get("country")
                        if not country or not DashboardService._is_valid_country(country):
                            country = user_section.get("city")
                            if not country or not DashboardService._is_valid_country(country):
                                # Try location - but if it's a long address, extract from it
                                user_location = user_section.get("location")
                                if user_location and isinstance(user_location, str):
                                    if len(user_location) > 20:
                                        # It's likely a full address, extract city/country from it
                                        country = DashboardService._extract_city_from_address(user_location)
                                    elif DashboardService._is_valid_country(user_location):
                                        country = user_location
                                    else:
                                        country = None
                                else:
                                    country = None
                                
                                # If still no country, try to extract from user section address if available
                                if not country or not DashboardService._is_valid_country(country):
                                    user_address = user_section.get("address")
                                    if user_address and isinstance(user_address, str) and len(user_address) > 20:
                                        country = DashboardService._extract_city_from_address(user_address)
                                    else:
                                        country = None
                    
                    if country and DashboardService._is_valid_country(country):
                        user_country_map[user_id_str] = country
            
            # Count bookings by country (filter out invalid countries)
            country_counts = {}
            for booking in bookings:
                user_id = booking.get("user_id")
                # Try to find country by string or ObjectId
                country = user_country_map.get(str(user_id)) or user_country_map.get(user_id)
                
                # Only use valid country names, otherwise mark as Unknown
                if not country or not DashboardService._is_valid_country(country):
                    country = "Unknown"
                
                country_counts[country] = country_counts.get(country, 0) + 1
            
            # Sort by count and get top 4
            top_countries = sorted(
                country_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:4]
            
            return [{"country": country, "bookings": count} for country, count in top_countries]
        except Exception as e:
            logger.error(f"Error in get_top_countries_by_month: {e}", exc_info=True)
            return []

    @staticmethod
    async def get_bookings_revenue_by_country() -> List[Dict[str, Any]]:
        """
        Get bookings and revenue grouped by country for all customers.
        Returns top countries with their bookings and revenue totals.
        """
        try:
            bookings_collection = DashboardService._get_collection(DashboardService.BOOKINGS_COLLECTION)
            users_collection = DashboardService._get_collection("users")
            
            # Get all bookings
            bookings = await bookings_collection.find(
                {},
                {"user_id": 1, "total_amount": 1}
            ).to_list(length=None)
            
            if not bookings:
                return []
            
            # Get unique user IDs
            user_ids_raw = [b.get("user_id") for b in bookings if b.get("user_id")]
            user_ids = []
            for uid in user_ids_raw:
                try:
                    if isinstance(uid, str):
                        user_ids.append(ObjectId(uid))
                    elif isinstance(uid, ObjectId):
                        user_ids.append(uid)
                except:
                    continue
            
            if not user_ids:
                return []
            
            # Get countries from users collection
            user_docs = await users_collection.find(
                {"_id": {"$in": user_ids}},
                {"country": 1, "city": 1, "address": 1}
            ).to_list(length=None)
            
            # Map user_id to country
            user_country_map = {}
            for doc in user_docs:
                user_id_obj = doc.get("_id")
                country = (
                    doc.get("country") or 
                    doc.get("city") or 
                    doc.get("address") or 
                    "Unknown"
                )
                # Map both ObjectId and string versions
                user_country_map[str(user_id_obj)] = country
                if isinstance(user_id_obj, ObjectId):
                    user_country_map[user_id_obj] = country
            
            # Aggregate bookings and revenue by country
            country_data = {}
            for booking in bookings:
                user_id = booking.get("user_id")
                # Try to find country by string or ObjectId
                country = user_country_map.get(str(user_id)) or user_country_map.get(user_id) or "Unknown"
                revenue = float(booking.get("total_amount", 0))
                
                if country not in country_data:
                    country_data[country] = {"bookings": 0, "revenue": 0.0}
                
                country_data[country]["bookings"] += 1
                country_data[country]["revenue"] += revenue
            
            # Convert to list and sort by bookings (descending)
            result = [
                {
                    "country": country,
                    "month": None,  # Add month field as None for schema compatibility
                    "bookings": int(data["bookings"]),
                    "revenue": float(round(data["revenue"], 0))
                }
                for country, data in country_data.items()
            ]
            
            # Sort by bookings descending
            result.sort(key=lambda x: x["bookings"], reverse=True)
            
            return result
        except Exception as e:
            logger.error(f"Error in get_bookings_revenue_by_country: {e}", exc_info=True)
            import traceback
            logger.error(traceback.format_exc())
            return []

