from django.core.exceptions import ValidationError
from django.db import models


class Lead(models.Model):
    class Source(models.TextChoices):
        WEBSITE = "website", "Website"
        AI_CHAT = "ai_chat", "AI Chat"
        REFERRAL = "referral", "Referral"
        SOCIAL = "social", "Social Media"
        WALK_IN = "walk_in", "Walk-in"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        NEGOTIATING = "negotiating", "Negotiating"
        WON = "won", "Won"
        LOST = "lost", "Lost"

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, db_index=True)
    phone = models.CharField(max_length=30, blank=True)

    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WEBSITE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)

    budget_min = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    preferred_location = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)

    interested_properties = models.ManyToManyField(
        "properties.Property", related_name="interested_leads", blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.full_name

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def clean(self):
        if not self.email and not self.phone:
            raise ValidationError("A lead needs at least an email or a phone number.")
        if self.budget_min is not None and self.budget_max is not None and self.budget_min > self.budget_max:
            raise ValidationError({"budget_max": "Maximum budget must be greater than minimum budget."})
