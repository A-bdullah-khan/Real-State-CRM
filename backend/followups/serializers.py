from rest_framework import serializers

from leads.models import Lead

from .models import FollowUp


class FollowUpSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source="lead.full_name", read_only=True)
    method_display = serializers.CharField(source="get_method_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = FollowUp
        fields = [
            "id",
            "lead",
            "lead_name",
            "method",
            "method_display",
            "scheduled_at",
            "status",
            "status_display",
            "notes",
            "is_overdue",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]


class GenerateDraftSerializer(serializers.Serializer):
    """Input for POST /api/followups/generate-draft/."""

    lead_id = serializers.PrimaryKeyRelatedField(queryset=Lead.objects.all())


class CompleteFollowUpSerializer(serializers.ModelSerializer):
    """
    Optional edits applied when an agent completes a follow-up (e.g. after reviewing an AI draft).
    All fields are optional; an empty body just marks the follow-up completed.
    """

    class Meta:
        model = FollowUp
        fields = ["notes", "scheduled_at", "method"]
