export const APP_NAME = import.meta.env.VITE_APP_NAME || 'EstateFlow CRM'

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
]

export const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
]

export const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export const FOLLOWUP_METHODS = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Meeting' },
]

// Badge colours per status value; `dot` is the leading indicator. Statuses shared across
// models (e.g. `pending`) intentionally share a colour.
const MUTED = { badge: 'bg-slate-100 text-slate-600 ring-slate-500/15', dot: 'bg-slate-400' }

export const STATUS_STYLES = {
  // Leads — cool to warm as the deal progresses
  new: { badge: 'bg-sky-50 text-sky-700 ring-sky-600/15', dot: 'bg-sky-500' },
  contacted: { badge: 'bg-brand-50 text-brand-700 ring-brand-600/15', dot: 'bg-brand-500' },
  qualified: { badge: 'bg-violet-50 text-violet-700 ring-violet-600/15', dot: 'bg-violet-500' },
  negotiating: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500' },
  won: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', dot: 'bg-emerald-500' },
  lost: MUTED,
  // Properties
  available: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', dot: 'bg-emerald-500' },
  sold: MUTED,
  rented: MUTED,
  // Follow-ups (and pending properties)
  pending: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500' },
  completed: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', dot: 'bg-emerald-500' },
  cancelled: MUTED,
}

export const DEFAULT_STATUS_STYLE = MUTED
