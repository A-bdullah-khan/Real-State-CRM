from django.contrib import admin

from .models import FollowUp


@admin.register(FollowUp)
class FollowUpAdmin(admin.ModelAdmin):
    list_display = ["lead", "method", "scheduled_at", "status", "completed_at"]
    list_filter = ["status", "method"]
    search_fields = ["lead__first_name", "lead__last_name", "notes"]
    autocomplete_fields = ["lead"]
    readonly_fields = ["completed_at", "created_at", "updated_at"]
