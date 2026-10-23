from rest_framework import serializers

from properties.models import Property
from properties.serializers import PropertySerializer

from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    source_display = serializers.CharField(source="get_source_display", read_only=True)
    interested_properties = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Property.objects.all(), required=False
    )
    interested_properties_detail = PropertySerializer(source="interested_properties", many=True, read_only=True)
    followup_count = serializers.IntegerField(read_only=True)
    next_followup_at = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "source",
            "source_display",
            "status",
            "status_display",
            "budget_min",
            "budget_max",
            "preferred_location",
            "notes",
            "interested_properties",
            "interested_properties_detail",
            "followup_count",
            "next_followup_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        def current(field):
            return attrs.get(field, getattr(self.instance, field, None))

        if not current("email") and not current("phone"):
            raise serializers.ValidationError("A lead needs at least an email or a phone number.")
        budget_min, budget_max = current("budget_min"), current("budget_max")
        if budget_min is not None and budget_max is not None and budget_min > budget_max:
            raise serializers.ValidationError({"budget_max": "Maximum budget must be greater than minimum budget."})
        return attrs
