from django.contrib import admin

from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["title", "city", "property_type", "listing_type", "status", "price", "bedrooms", "created_at"]
    list_filter = ["status", "property_type", "listing_type", "city"]
    search_fields = ["title", "address", "city"]
    readonly_fields = ["created_at", "updated_at"]
