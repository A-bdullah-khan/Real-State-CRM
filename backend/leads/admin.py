from django.contrib import admin

from followups.models import FollowUp

from .models import Lead


class FollowUpInline(admin.TabularInline):
    model = FollowUp
    extra = 0
    fields = ["method", "scheduled_at", "status", "notes"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "phone", "status", "source", "created_at"]
    list_filter = ["status", "source"]
    search_fields = ["first_name", "last_name", "email", "phone"]
    filter_horizontal = ["interested_properties"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [FollowUpInline]
