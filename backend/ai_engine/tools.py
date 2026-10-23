"""
Tools the AI agent can invoke against the CRM.

Each tool is a plain function that takes JSON-serialisable keyword arguments
and returns a JSON-serialisable result, so it can be exposed to any LLM
provider's tool/function-calling interface via `TOOL_REGISTRY`.

Tools never raise on bad input; they return {"error": ...} so the agent can
explain the problem and ask the user for a correction.
"""
from datetime import timezone as dt_timezone
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from followups.models import FollowUp
from leads.models import Lead
from properties.models import Property

MAX_SEARCH_RESULTS = 10


def _validation_error(exc):
    """Flatten a Django ValidationError into the tool error shape the model can read."""
    if hasattr(exc, "message_dict"):
        details = "; ".join(f"{field}: {' '.join(msgs)}" for field, msgs in exc.message_dict.items())
        return {"error": f"Validation failed. {details}", "fields": exc.message_dict}
    return {"error": f"Validation failed. {' '.join(exc.messages)}"}


def _to_money(value, field):
    """Convert a JSON number/string to a 2-decimal-place Decimal (floats would fail DecimalField validation)."""
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value)).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError) as exc:
        raise ValidationError({field: [f"'{value}' is not a valid amount."]}) from exc


def _to_utc_datetime(value):
    """
    Parse an ISO-8601 string into a timezone-aware UTC datetime.

    Strings without an offset are interpreted as UTC. Returns None if the
    value cannot be parsed.
    """
    if not isinstance(value, str):
        return None
    try:
        parsed = parse_datetime(value.strip())
    except ValueError:  # well-formed but impossible, e.g. month 13
        return None
    if parsed is None:
        return None
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, dt_timezone.utc)
    return parsed.astimezone(dt_timezone.utc)


def search_properties(city=None, property_type=None, listing_type=None, min_price=None, max_price=None,
                      min_bedrooms=None, limit=MAX_SEARCH_RESULTS):
    """Return a compact summary of AVAILABLE listings matching every filter given."""
    qs =Property.objects.filter(status=Property.Status.AVAILABLE)
    if city:
        qs = qs.filter(city__icontains=city)
    if property_type:
        qs = qs.filter(property_type=property_type)
    if listing_type:
        qs = qs.filter(listing_type=listing_type)
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)
    if min_bedrooms is not None:
        qs = qs.filter(bedrooms__gte=min_bedrooms)
    limit = max(1, min(int(limit), MAX_SEARCH_RESULTS))
    return [
        {
            "id": p.id,
            "title": p.title,
            "city": p.city,
            "price": str(p.price),
            "bedrooms": p.bedrooms,
            "property_type": p.property_type,
            "listing_type": p.listing_type,
        }
        for p in qs[:limit]
    ]


def _find_existing_lead(email, phone):
    """
    Return the lead that already owns this email or phone, or None.

    Email is matched case-insensitively and takes priority over phone. Phones are
    compared as entered (after trimming), so "+1-512-555-0142" and "5125550142"
    are treated as different numbers. When several records match, the oldest one
    is treated as the canonical lead.
    """
    oldest_first = Lead.objects.order_by("created_at", "id")
    if email:
        lead = oldest_first.filter(email__iexact=email).first()
        if lead:
            return lead
    if phone:
        return oldest_first.filter(phone=phone).first()
    return None


def _merge_into_lead(lead, fields):
    """
    Apply details from a repeat enquiry to an existing lead without losing data.

    Identity and contact fields are only filled in when blank, so an agent's
    curated record is never overwritten. Preferences (location, budget) take the
    newly stated value, since the prospect's latest answer is the current one.
    New notes are appended. Status and source are left alone so the lead keeps
    its place in the pipeline.
    """
    for name in ("first_name", "last_name", "email", "phone"):
        if fields[name] and not getattr(lead, name):
            setattr(lead, name, fields[name])
    for name in ("preferred_location", "budget_min", "budget_max"):
        if fields[name] not in (None, ""):
            setattr(lead, name, fields[name])
    if fields["notes"] and fields["notes"] not in lead.notes:
        lead.notes = f"{lead.notes}\n\n{fields['notes']}".strip()


def create_lead(first_name, email="", phone="", last_name="", preferred_location="", notes="",
                budget_min=None, budget_max=None):
    """
    Create a lead from an AI chat, or update the existing lead with the same email/phone.

    Returns {"id", "full_name", "created"}; `created` is False when an existing
    lead was matched and updated instead of a duplicate being inserted.
    """
    try:
        fields = {
            "first_name": (first_name or "").strip(),
            "last_name": (last_name or "").strip(),
            "email": (email or "").strip(),
            "phone": (phone or "").strip(),
            "preferred_location": (preferred_location or "").strip(),
            "notes": (notes or "").strip(),
            "budget_min": _to_money(budget_min, "budget_min"),
            "budget_max": _to_money(budget_max, "budget_max"),
        }
        lead = _find_existing_lead(fields["email"], fields["phone"])
        created = lead is None
        if created:
            lead = Lead(source=Lead.Source.AI_CHAT, **fields)
        else:
            _merge_into_lead(lead, fields)
        # Runs field validators (email format, max lengths, decimal limits) and Lead.clean()
        # (email-or-phone required, budget_min <= budget_max).
        lead.full_clean()
    except ValidationError as exc:
        return _validation_error(exc)
    lead.save()
    return {"id": lead.id, "full_name": lead.full_name, "created": created}


def schedule_followup(lead_id, scheduled_at, method=FollowUp.Method.CALL, notes=""):
    """Book a future follow-up for an existing lead; times are normalised to UTC."""
    when =_to_utc_datetime(scheduled_at)
    if when is None:
        return {"error": "scheduled_at must be an ISO-8601 datetime, e.g. 2026-10-21T15:00:00+00:00."}
    if when < timezone.now():
        return {"error": f"scheduled_at {when.isoformat()} is in the past."}
    try:
        lead_id = int(lead_id)
    except (TypeError, ValueError):
        return {"error": "lead_id must be an integer."}
    if not Lead.objects.filter(pk=lead_id).exists():
        return {"error": f"Lead {lead_id} does not exist."}
    followup = FollowUp(lead_id=lead_id, scheduled_at=when, method=method, notes=(notes or "").strip())
    try:
        followup.full_clean()
    except ValidationError as exc:
        return _validation_error(exc)
    followup.save()
    return {"id": followup.id, "scheduled_at": followup.scheduled_at.isoformat()}


TOOL_REGISTRY = {
    "search_properties": search_properties,
    "create_lead": create_lead,
    "schedule_followup": schedule_followup,
}
