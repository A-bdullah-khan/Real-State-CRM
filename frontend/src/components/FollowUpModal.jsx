import { useEffect, useState } from 'react'
import { ButtonSpinner } from './Feedback'
import Icon from './Icon'
import { useToast } from '../hooks/useToast'
import { followUpService, getErrorMessage, leadService } from '../services'
import { FOLLOWUP_METHODS } from '../utils/constants'
import { toDateTimeLocalValue } from '../utils/format'

function defaultScheduleTime() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  return toDateTimeLocalValue(tomorrow)
}

/**
 * Two modes share one form: manual scheduling, and review of an AI draft. A generated draft is
 * already persisted as a PENDING follow-up, so from then on every exit path (approve, mark sent,
 * discard) resolves that record. That is why plain dismissal is disabled while a draft is open.
 */
function FollowUpForm({ leadId, leadName, leadStatus, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(() => ({ method: 'call', scheduled_at: defaultScheduleTime(), notes: '' }))
  // The AI-generated follow-up awaiting approval: { id, nextStep, rationale }. The backend has already saved it as pending.
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(null) // 'generating' | 'scheduling' | 'sending' | 'discarding' | null
  const [error, setError] = useState('')

  // With an unapproved draft open, closing must be an explicit choice (approve or discard) so drafts are never orphaned.
  const canDismiss = !busy && !draft

  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && canDismiss && onClose()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, canDismiss])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const payload = () => ({
    method: form.method,
    notes: form.notes.trim(),
    scheduled_at: new Date(form.scheduled_at).toISOString(),
  })

  // Every server action goes through here: one busy flag disables all buttons, errors land inline.
  const run = async (kind, action) => {
    setBusy(kind)
    setError('')
    try {
      await action()
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      if (kind === 'generating') toast.error(`Couldn't generate an AI draft. ${message}`)
    } finally {
      setBusy(null)
    }
  }

  const generateDraft = () => run('generating', async () => {
    const result = await followUpService.generateDraft(leadId)
    const previous = draft
    setDraft({ id: result.id, nextStep: result.draft?.next_step ?? '', rationale: result.draft?.rationale ?? '' })
    setForm({
      method: result.method,
      scheduled_at: toDateTimeLocalValue(new Date(result.scheduled_at)),
      notes: result.notes,
    })
    onSaved?.()
    // Regenerating replaces the earlier draft, which would otherwise linger as a pending follow-up.
    if (previous) {
      await followUpService.update(previous.id, { status: 'cancelled' }).catch(() => {
        toast.error(`The previous draft (#${previous.id}) could not be discarded; cancel it from the lead page.`)
      })
    }
  })

  const schedule = (event) => {
    event.preventDefault()
    if (new Date(form.scheduled_at) <= new Date()) {
      setError('Pick a date and time in the future to schedule this follow-up.')
      return
    }
    run('scheduling', async () => {
      if (draft) await followUpService.update(draft.id, payload())
      else await followUpService.create({ ...payload(), lead: leadId })
      toast.success(`Follow-up with ${leadName || 'the lead'} scheduled.`)
      onSaved?.()
      onClose()
    })
  }

  const markSent = () => run('sending', async () => {
    await followUpService.complete(draft.id, payload())
    let message = `Follow-up approved and marked as sent.`
    if (leadStatus === 'new') {
      try {
        await leadService.update(leadId, { status: 'contacted' })
        message += ' Lead moved to Contacted.'
      } catch (err) {
        toast.error(`Follow-up saved, but the lead status could not be updated. ${getErrorMessage(err)}`)
      }
    }
    toast.success(message)
    onSaved?.()
    onClose()
  })

  const discardDraft = () => run('discarding', async () => {
    await followUpService.update(draft.id, { status: 'cancelled' })
    toast.show('AI draft discarded.')
    onSaved?.()
    onClose()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center" onClick={() => canDismiss && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="followup-modal-title"
        aria-busy={Boolean(busy)}
        className="card max-h-full w-full max-w-lg animate-fade-in-up overflow-y-auto p-6 shadow-lift"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="followup-modal-title" className="text-lg font-semibold text-slate-900">
              {draft ? 'Review AI follow-up draft' : 'Schedule follow-up'}
            </h2>
            {leadName && <p className="mt-1 text-sm text-slate-500">with {leadName}</p>}
          </div>
          <button type="button" className="btn-ai shrink-0" onClick={generateDraft} disabled={Boolean(busy)}>
            {busy === 'generating' ? <ButtonSpinner /> : <Icon name="sparkles" className="h-4 w-4" />}
            {busy === 'generating' ? 'Drafting…' : draft ? 'Regenerate' : 'Generate AI Draft'}
          </button>
        </div>

        {busy === 'generating' && (
          <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700" role="status">
            Writing a personalised draft from this lead's requirements and history…
          </p>
        )}

        {draft && busy !== 'generating' && (draft.nextStep || draft.rationale) && (
          <div className="mt-4 space-y-1 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm">
            {draft.nextStep && (
              <p className="text-slate-800"><span className="font-medium text-brand-700">Suggested next step:</span> {draft.nextStep}</p>
            )}
            {draft.rationale && <p className="text-slate-600">{draft.rationale}</p>}
          </div>
        )}

        <form onSubmit={schedule} className="mt-5 space-y-4">
          <fieldset disabled={Boolean(busy)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="followup-method" className="label">Channel</label>
                <select id="followup-method" name="method" value={form.method} onChange={updateField} className="input">
                  {FOLLOWUP_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="followup-scheduled-at" className="label">Date &amp; time</label>
                <input
                  id="followup-scheduled-at"
                  name="scheduled_at"
                  type="datetime-local"
                  required
                  value={form.scheduled_at}
                  onChange={updateField}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="followup-notes" className="label">{draft ? 'Message (edit before approving)' : 'Notes'}</label>
              <textarea
                id="followup-notes"
                name="notes"
                rows={draft ? 8 : 3}
                value={form.notes}
                onChange={updateField}
                placeholder={draft ? '' : 'What should be discussed? Or generate an AI draft above.'}
                className="input"
              />
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            {draft ? (
              <>
                <button type="button" className="btn-secondary" onClick={discardDraft} disabled={Boolean(busy)}>
                  {busy === 'discarding' && <ButtonSpinner />}
                  Discard draft
                </button>
                <button type="button" className="btn-secondary" onClick={markSent} disabled={Boolean(busy) || !form.notes.trim()}>
                  {busy === 'sending' && <ButtonSpinner />}
                  Approve &amp; Mark Sent
                </button>
                <button type="submit" className="btn-primary" disabled={Boolean(busy) || !form.notes.trim()}>
                  {busy === 'scheduling' && <ButtonSpinner />}
                  Approve &amp; Schedule
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-secondary" onClick={onClose} disabled={Boolean(busy)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={Boolean(busy)}>
                  {busy === 'scheduling' && <ButtonSpinner />}
                  Schedule
                </button>
              </>
            )}
          </div>
          {draft && (
            <p className="text-xs text-slate-500">
              <strong>Approve &amp; Schedule</strong> keeps it pending until the scheduled time.{' '}
              <strong>Approve &amp; Mark Sent</strong> records it as done now
              {leadStatus === 'new' ? ' and moves the lead to Contacted' : ''}.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

/**
 * Modal for scheduling a follow-up manually or reviewing an AI-generated draft. Form state resets each time it opens.
 * `onSaved` fires after anything is persisted (draft generated, approved, sent or discarded).
 */
export default function FollowUpModal({ open, ...props }) {
  if (!open) return null
  return <FollowUpForm {...props} />
}
