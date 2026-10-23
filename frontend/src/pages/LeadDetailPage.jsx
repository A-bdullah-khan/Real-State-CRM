import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FollowUpModal from '../components/FollowUpModal'
import PropertyCard from '../components/PropertyCard'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, ErrorAlert, Spinner } from '../components/Feedback'
import { useApiQuery } from '../hooks/useApiQuery'
import { followUpService, getErrorMessage, leadService } from '../services'
import { LEAD_STATUSES } from '../utils/constants'
import { formatCurrency, formatDateTime } from '../utils/format'

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{children || '—'}</dd>
    </div>
  )
}

/**
 * Single lead: contact details, follow-up history and linked listings. Inline actions (status change,
 * mark complete) share one `saving` flag and refetch both queries on success.
 */
export default function LeadDetailPage() {
  const { leadId } = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)

  const lead = useApiQuery((options) => leadService.get(leadId, options), `lead-${leadId}`)
  const followUps = useApiQuery(
    (options) => followUpService.list({ lead: leadId, ordering: '-scheduled_at' }, options),
    `followups-${leadId}`,
  )

  const refresh = () => {
    lead.reload()
    followUps.reload()
  }

  const runAction = async (action) => {
    setSaving(true)
    setActionError('')
    try {
      await action()
      refresh()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = (event) => {
    const status = event.target.value
    runAction(() => leadService.update(leadId, { status }))
  }

  const completeFollowUp = (id) => runAction(() => followUpService.complete(id))

  if (lead.loading && !lead.data) return <Spinner label="Loading lead…" />
  if (lead.error && !lead.data) {
    return (
      <div className="space-y-4">
        <Link to="/crm" className="text-sm font-medium text-brand-700 hover:underline">← Back to dashboard</Link>
        <ErrorAlert message={lead.error} onRetry={lead.reload} />
      </div>
    )
  }

  const data = lead.data
  const followUpList = followUps.data?.results ?? []

  return (
    <div className="space-y-6">
      <Link to="/crm" className="text-sm font-medium text-brand-700 hover:underline">← Back to dashboard</Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{data.full_name}</h1>
            <StatusBadge status={data.status} label={data.status_display} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Lead from {data.source_display} · added {formatDateTime(data.created_at)}
          </p>
        </div>
        <div className="flex gap-3">
          <label htmlFor="lead-status" className="sr-only">Lead status</label>
          <select id="lead-status" value={data.status} onChange={changeStatus} disabled={saving} className="input w-40">
            {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="button" className="btn-primary whitespace-nowrap" onClick={() => setModalOpen(true)}>
            Schedule follow-up
          </button>
        </div>
      </div>

      <ErrorAlert message={actionError} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <h2 className="font-semibold text-slate-900">Contact &amp; preferences</h2>
          <dl className="mt-4 space-y-4">
            <Detail label="Email">{data.email && <a href={`mailto:${data.email}`} className="text-brand-700 hover:underline">{data.email}</a>}</Detail>
            <Detail label="Phone">{data.phone && <a href={`tel:${data.phone}`} className="text-brand-700 hover:underline">{data.phone}</a>}</Detail>
            <Detail label="Preferred location">{data.preferred_location}</Detail>
            <Detail label="Budget">
              {data.budget_min || data.budget_max
                ? `${formatCurrency(data.budget_min)} – ${formatCurrency(data.budget_max)}`
                : null}
            </Detail>
            <Detail label="Notes">{data.notes && <span className="whitespace-pre-line font-normal">{data.notes}</span>}</Detail>
          </dl>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Follow-ups</h2>
          <ErrorAlert message={followUps.error} onRetry={followUps.reload} />
          {followUps.loading && !followUps.data ? (
            <Spinner label="Loading follow-ups…" />
          ) : followUpList.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No follow-ups scheduled yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {followUpList.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{item.method_display}</p>
                      <StatusBadge status={item.status} label={item.status_display} />
                      {item.is_overdue && <span className="text-xs font-medium text-red-600">Overdue</span>}
                    </div>
                    <p className="text-sm text-slate-500">{formatDateTime(item.scheduled_at)}</p>
                    {item.notes && <p className="mt-1 text-sm text-slate-600">{item.notes}</p>}
                  </div>
                  {item.status === 'pending' && (
                    <button type="button" className="btn-secondary" disabled={saving} onClick={() => completeFollowUp(item.id)}>
                      Mark complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="font-semibold text-slate-900">Interested properties</h2>
        {data.interested_properties_detail.length === 0 ? (
          <EmptyState title="No properties linked" description="Properties this lead shows interest in will appear here." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.interested_properties_detail.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        )}
      </section>

      <FollowUpModal
        open={modalOpen}
        leadId={data.id}
        leadName={data.full_name}
        leadStatus={data.status}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
      />
    </div>
  )
}
