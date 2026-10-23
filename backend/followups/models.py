from django.db import models
from django.utils import timezone


class FollowUp(models.Model):
    class Method(models.TextChoices):
        CALL = "call", "Phone Call"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        WHATSAPP = "whatsapp", "WhatsApp"
        MEETING = "meeting", "Meeting"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    lead = models.ForeignKey("leads.Lead", on_delete=models.CASCADE, related_name="followups")
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CALL)
    scheduled_at = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at"]
        verbose_name = "follow-up"

    def __str__(self):
        return f"{self.get_method_display()} with {self.lead} on {self.scheduled_at:%Y-%m-%d %H:%M}"

    @property
    def is_overdue(self):
        return self.status == self.Status.PENDING and self.scheduled_at < timezone.now()

    def save(self, *args, **kwargs):
        if self.status == self.Status.COMPLETED and self.completed_at is None:
            self.completed_at = timezone.now()
        elif self.status != self.Status.COMPLETED:
            self.completed_at = None
        super().save(*args, **kwargs)
