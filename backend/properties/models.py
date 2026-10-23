from django.core.validators import MinValueValidator
from django.db import models


class Property(models.Model):
    class PropertyType(models.TextChoices):
        HOUSE = "house", "House"
        APARTMENT = "apartment", "Apartment"
        CONDO = "condo", "Condo"
        TOWNHOUSE = "townhouse", "Townhouse"
        LAND = "land", "Land"
        COMMERCIAL = "commercial", "Commercial"

    class ListingType(models.TextChoices):
        SALE = "sale", "For Sale"
        RENT = "rent", "For Rent"

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        PENDING = "pending", "Pending"
        SOLD = "sold", "Sold"
        RENTED = "rented", "Rented"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    property_type = models.CharField(max_length=20, choices=PropertyType.choices, default=PropertyType.HOUSE)
    listing_type = models.CharField(max_length=10, choices=ListingType.choices, default=ListingType.SALE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE, db_index=True)

    price = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=0, validators=[MinValueValidator(0)])
    area_sqft = models.PositiveIntegerField(null=True, blank=True)

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)

    image_url = models.URLField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "properties"
        indexes = [models.Index(fields=["city", "price"])]

    def __str__(self):
        return f"{self.title} ({self.city})"
