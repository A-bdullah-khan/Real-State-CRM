import { useEffect, useState } from 'react'
import { ButtonSpinner } from './Feedback'
import { useToast } from '../hooks/useToast'
import { getErrorMessage, leadService } from '../services'

/**
 * Lifecycle: mounted fresh per property (see the `key` below), so form state never leaks between
 * listings. While submitting, Escape, backdrop clicks and Cancel are ignored so a slow request
 * can't be orphaned. Success closes with a toast; failures stay inline so the user can fix and resend.
 */
function InquiryForm({ property, source, onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState(() => ({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: `I'm interested in "${property.title}" (listing #${property.id}).`,
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && !submitting && onClose()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Please provide an email address or a phone number so an agent can reach you.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const lead = await leadService.create({
        ...form,
        source,
        preferred_location: property.city ?? '',
        interested_properties: [property.id],
      })
      toast.success(`Thanks, ${lead.first_name}! An agent will contact you about "${property.title}".`)
      onCreated?.(lead)
      onClose()
    } catch (err) {
      // Only reset on failure: on success the modal unmounts, and the button must stay disabled until then.
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center" onClick={() => !submitting && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        aria-busy={submitting}
        className="card max-h-full w-full max-w-md animate-fade-in-up overflow-y-auto p-6 shadow-lift"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="inquiry-modal-title" className="text-lg font-semibold text-slate-900">Enquire about this property</h2>
        <p className="mt-1 text-sm text-slate-500">{property.title}{property.city ? ` · ${property.city}` : ''}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <fieldset disabled={submitting} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="inquiry-first-name" className="label">First name</label>
                <input id="inquiry-first-name" name="first_name" required autoFocus maxLength={100} value={form.first_name} onChange={updateField} className="input" />
              </div>
              <div>
                <label htmlFor="inquiry-last-name" className="label">Last name</label>
                <input id="inquiry-last-name" name="last_name" maxLength={100} value={form.last_name} onChange={updateField} className="input" />
              </div>
            </div>
            <div>
              <label htmlFor="inquiry-email" className="label">Email</label>
              <input id="inquiry-email" name="email" type="email" value={form.email} onChange={updateField} className="input" />
            </div>
            <div>
              <label htmlFor="inquiry-phone" className="label">Phone</label>
              <input id="inquiry-phone" name="phone" type="tel" maxLength={30} value={form.phone} onChange={updateField} className="input" />
            </div>
            <div>
              <label htmlFor="inquiry-notes" className="label">Message</label>
              <textarea id="inquiry-notes" name="notes" rows={3} value={form.notes} onChange={updateField} className="input" />
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting || !form.first_name.trim()}>
              {submitting && <ButtonSpinner />}
              {submitting ? 'Sending…' : 'Send inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Modal that creates a lead interested in `property`. Form state resets each time it opens.
 * `source` is the Lead.source value to record (e.g. 'ai_chat' or 'website').
 */
export default function InquiryModal({ property, ...props }) {
  if (!property) return null
  return <InquiryForm key={property.id} property={property} {...props} />
}
