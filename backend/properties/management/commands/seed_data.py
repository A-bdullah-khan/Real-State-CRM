from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from leads.models import Lead
from properties.models import Property

PROPERTIES = [
    {
        "title": "Modern Family Home with Pool",
        "description": "Spacious 4-bed home with open-plan kitchen, backyard pool and two-car garage.",
        "property_type": Property.PropertyType.HOUSE,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("685000.00"),
        "bedrooms": 4,
        "bathrooms": Decimal("3.0"),
        "area_sqft": 2650,
        "address": "1428 Willow Creek Dr",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78745",
    },
    {
        "title": "Downtown Loft Apartment",
        "description": "Industrial-style loft with exposed brick, floor-to-ceiling windows, walk to everything.",
        "property_type": Property.PropertyType.APARTMENT,
        "listing_type": Property.ListingType.RENT,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("2400.00"),
        "bedrooms": 1,
        "bathrooms": Decimal("1.0"),
        "area_sqft": 850,
        "address": "301 Congress Ave, Unit 1204",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78701",
    },
    {
        "title": "Lakeview Luxury Condo",
        "description": "High-floor condo with lake views, concierge, gym and rooftop terrace.",
        "property_type": Property.PropertyType.CONDO,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.PENDING,
        "price": Decimal("925000.00"),
        "bedrooms": 2,
        "bathrooms": Decimal("2.0"),
        "area_sqft": 1450,
        "address": "155 N Harbor Dr, Unit 3805",
        "city": "Chicago",
        "state": "IL",
        "zip_code": "60601",
    },
    {
        "title": "Charming Brick Townhouse",
        "description": "Renovated 3-level townhouse near parks and schools, private patio.",
        "property_type": Property.PropertyType.TOWNHOUSE,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("489000.00"),
        "bedrooms": 3,
        "bathrooms": Decimal("2.5"),
        "area_sqft": 1820,
        "address": "2217 N Seminary Ave",
        "city": "Chicago",
        "state": "IL",
        "zip_code": "60614",
    },
    {
        "title": "Starter Home in Quiet Suburb",
        "description": "Affordable 2-bed bungalow with fenced yard, ideal for first-time buyers.",
        "property_type": Property.PropertyType.HOUSE,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("245000.00"),
        "bedrooms": 2,
        "bathrooms": Decimal("1.0"),
        "area_sqft": 1100,
        "address": "86 Maple St",
        "city": "Phoenix",
        "state": "AZ",
        "zip_code": "85032",
    },
    {
        "title": "Desert Ranch Estate",
        "description": "Single-story 5-bed estate on 1 acre with mountain views and casita.",
        "property_type": Property.PropertyType.HOUSE,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.PENDING,
        "price": Decimal("1350000.00"),
        "bedrooms": 5,
        "bathrooms": Decimal("4.5"),
        "area_sqft": 4200,
        "address": "9001 E Desert Vista Rd",
        "city": "Scottsdale",
        "state": "AZ",
        "zip_code": "85255",
    },
    {
        "title": "Bayside 2BR Apartment",
        "description": "Bright apartment with in-unit laundry, balcony and bay glimpses.",
        "property_type": Property.PropertyType.APARTMENT,
        "listing_type": Property.ListingType.RENT,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("3850.00"),
        "bedrooms": 2,
        "bathrooms": Decimal("2.0"),
        "area_sqft": 1050,
        "address": "740 Bay St, Apt 5B",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94109",
    },
    {
        "title": "Retail Storefront on Main Street",
        "description": "Ground-floor commercial unit with high foot traffic and street parking.",
        "property_type": Property.PropertyType.COMMERCIAL,
        "listing_type": Property.ListingType.RENT,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("5500.00"),
        "bedrooms": 0,
        "bathrooms": Decimal("1.0"),
        "area_sqft": 1600,
        "address": "412 Main St",
        "city": "Dallas",
        "state": "TX",
        "zip_code": "75202",
    },
    {
        "title": "Buildable Residential Lot",
        "description": "Half-acre lot zoned residential, utilities at the street.",
        "property_type": Property.PropertyType.LAND,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.AVAILABLE,
        "price": Decimal("120000.00"),
        "bedrooms": 0,
        "bathrooms": Decimal("0.0"),
        "area_sqft": 21780,
        "address": "Lot 14, Ridgeview Rd",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78738",
    },
    {
        "title": "Updated Mid-Century Condo",
        "description": "Recently updated condo with new appliances, pool access and covered parking.",
        "property_type": Property.PropertyType.CONDO,
        "listing_type": Property.ListingType.SALE,
        "status": Property.Status.SOLD,
        "price": Decimal("315000.00"),
        "bedrooms": 2,
        "bathrooms": Decimal("2.0"),
        "area_sqft": 1180,
        "address": "2550 W Camelback Rd, Unit 210",
        "city": "Phoenix",
        "state": "AZ",
        "zip_code": "85016",
    },
]

# "interested_in" lists property titles to link via Lead.interested_properties.
LEADS = [
    {
        "first_name": "Sarah",
        "last_name": "Mitchell",
        "email": "sarah.mitchell@example.com",
        "phone": "+1-512-555-0142",
        "source": Lead.Source.WEBSITE,
        "status": Lead.Status.NEW,
        "budget_min": Decimal("550000.00"),
        "budget_max": Decimal("750000.00"),
        "preferred_location": "Austin, TX",
        "notes": "Relocating for work. Needs 4+ bedrooms and a yard; good school district is a must.",
        "interested_in": ["Modern Family Home with Pool"],
    },
    {
        "first_name": "David",
        "last_name": "Chen",
        "email": "david.chen@example.com",
        "phone": "+1-312-555-0198",
        "source": Lead.Source.REFERRAL,
        "status": Lead.Status.CONTACTED,
        "budget_min": Decimal("400000.00"),
        "budget_max": Decimal("950000.00"),
        "preferred_location": "Chicago, IL",
        "notes": "Open to condo or townhouse, 2-3 bedrooms. Prefers walkable neighborhood near transit.",
        "interested_in": ["Lakeview Luxury Condo", "Charming Brick Townhouse"],
    },
    {
        "first_name": "Maria",
        "last_name": "Gonzalez",
        "email": "maria.gonzalez@example.com",
        "phone": "+1-602-555-0117",
        "source": Lead.Source.AI_CHAT,
        "status": Lead.Status.QUALIFIED,
        "budget_min": Decimal("200000.00"),
        "budget_max": Decimal("275000.00"),
        "preferred_location": "Phoenix, AZ",
        "notes": "First-time buyer, pre-approved for $275k. Wants 2 bedrooms, single story.",
        "interested_in": ["Starter Home in Quiet Suburb"],
    },
    {
        "first_name": "James",
        "last_name": "Okafor",
        "email": "james.okafor@example.com",
        "phone": "",
        "source": Lead.Source.SOCIAL,
        "status": Lead.Status.NEW,
        "budget_min": Decimal("3000.00"),
        "budget_max": Decimal("4000.00"),
        "preferred_location": "San Francisco, CA",
        "notes": "Looking to rent a 2BR within 6 weeks. Monthly budget; in-unit laundry preferred.",
        "interested_in": ["Bayside 2BR Apartment"],
    },
    {
        "first_name": "Priya",
        "last_name": "Raman",
        "email": "",
        "phone": "+1-214-555-0163",
        "source": Lead.Source.WALK_IN,
        "status": Lead.Status.CONTACTED,
        "budget_min": Decimal("4000.00"),
        "budget_max": Decimal("6000.00"),
        "preferred_location": "Dallas, TX",
        "notes": "Opening a boutique; needs ~1,500 sqft retail space with street visibility. Monthly budget.",
        "interested_in": ["Retail Storefront on Main Street"],
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample properties and leads (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        properties_by_title = {}
        for data in PROPERTIES:
            prop = Property.objects.filter(title=data["title"]).first() or Property()
            created = prop.pk is None
            for field, value in data.items():
                setattr(prop, field, value)
            prop.full_clean()
            prop.save()
            properties_by_title[prop.title] = prop
            self.stdout.write(f"  {'Created' if created else 'Updated'} property: {prop}")

        for data in LEADS:
            data = dict(data)
            interested_in = data.pop("interested_in")
            # Leads without an email are matched on phone instead.
            lookup = {"email": data["email"]} if data["email"] else {"phone": data["phone"]}
            lead = Lead.objects.filter(**lookup).first() or Lead()
            created = lead.pk is None
            for field, value in data.items():
                setattr(lead, field, value)
            lead.full_clean()
            lead.save()
            lead.interested_properties.set([properties_by_title[t] for t in interested_in])
            self.stdout.write(f"  {'Created' if created else 'Updated'} lead: {lead} ({lead.status})")

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: {Property.objects.count()} properties, {Lead.objects.count()} leads in database."
            )
        )
