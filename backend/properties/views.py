import django_filters
from rest_framework import viewsets

from .models import Property
from .serializers import PropertySerializer


class PropertyFilter(django_filters.FilterSet):
    """Query-string filters for listings, e.g. ?city=austin&min_price=200000&min_bedrooms=3."""

    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_bedrooms = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")

    class Meta:
        model = Property
        fields = ["property_type", "listing_type", "status", "city"]


class PropertyViewSet(viewsets.ModelViewSet):
    """CRUD for listings at /api/properties/, with filtering, search and ordering."""

    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    filterset_class = PropertyFilter
    search_fields = ["title", "description", "address", "city"]
    ordering_fields = ["price", "created_at", "bedrooms", "area_sqft"]
