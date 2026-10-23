from django.db.models import Count, Min, Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from followups.models import FollowUp

from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    """CRUD for leads at /api/leads/, plus a pipeline summary at /api/leads/stats/."""

    serializer_class = LeadSerializer
    filterset_fields = ["status", "source"]
    search_fields = ["first_name", "last_name", "email", "phone", "preferred_location"]
    ordering_fields = ["created_at", "updated_at", "first_name", "status", "next_followup_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        # Annotate follow-up summary fields in SQL so the list view avoids N+1 queries.
        pending = Q(followups__status=FollowUp.Status.PENDING)
        return (
            Lead.objects.annotate(
                followup_count=Count("followups", distinct=True),
                next_followup_at=Min("followups__scheduled_at", filter=pending),
            )
            .prefetch_related("interested_properties")
        )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Lead counts grouped by pipeline status, for the CRM dashboard."""
        counts = dict(Lead.objects.values_list("status").annotate(total=Count("id")))
        by_status = {value: counts.get(value, 0) for value in Lead.Status.values}
        return Response(
            {
                "total": sum(by_status.values()),
                "by_status": by_status,
                "pending_followups": FollowUp.objects.filter(status=FollowUp.Status.PENDING).count(),
            }
        )
