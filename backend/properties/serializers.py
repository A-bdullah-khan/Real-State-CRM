from rest_framework import serializers

from .models import Property


class PropertySerializer(serializers.ModelSerializer):
    property_type_display = serializers.CharField(source="get_property_type_display", read_only=True)
    listing_type_display = serializers.CharField(source="get_listing_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "property_type",
            "property_type_display",
            "listing_type",
            "listing_type_display",
            "status",
            "status_display",
            "price",
            "bedrooms",
            "bathrooms",
            "area_sqft",
            "address",
            "city",
            "state",
            "zip_code",
            "image_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
