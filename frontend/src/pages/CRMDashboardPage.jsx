import { useState } from 'react'
import FollowUpModal from '../components/FollowUpModal'
import LeadTable from '../components/LeadTable'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorAlert, Spinner } from '../components/Feedback'
import Icon from '../components/Icon'
import { useApiQuery } from '../hooks/useApiQuery'
import { leadService } from '../services'
import { LEAD_STATUSES } from '../utils/constants'

const PAGE_SIZE = 20

const STAT_TONES = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
}

function StatCard({ label, value, icon, tone = 'slate' }) {
  return (
    <div className="card group relative overflow-hidden p-4 transition hover:shadow-lift sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset ${STAT_TONES[tone]}`}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-slate-900 sm:text-3xl">{value ?? '—'}</p>
    </div>
  )
}

/**
 * Pipeline overview: status counts plus a searchable, paginated lead table. Stats and the list load
 * independently, so one failing doesn't blank the other; both refresh after a follow-up is saved.
 */
export default function CRMDashboardPage() {
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [followUpLead, setFollowUpLead] = useState(null)

  const stats = useApiQuery((options) => leadService.stats(options), 'lead-stats')

  const params = { search, status, page }
  const leads = useApiQuery((options) => leadService.list(params, options), JSON.stringify(params))

  const applySearch = (event) => {
    event.preventDefault()
    setSearch(searchDraft.trim())
    setPage(1)
  }

  const selectStatus = (value) => {
    setStatus(value)
    setPage(1)
  }

  const refresh = () => {
    stats.reload()
    leads.reload()
  }

  const byStatus = stats.data?.by_status ?? {}
  const results = leads.data?.results ?? []

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">
          <Icon name="chart" className="h-3.5 w-3.5 text-brand-600" />
          Pipeline
        </span>
        <h1 className="page-title mt-4">CRM Dashboard</h1>
        <p className="page-subtitle">Track your pipeline and stay on top of follow-ups.</p>
      </div>

      <div className="space-y-4">
        <ErrorAlert message={stats.error} onRetry={stats.reload} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total leads" value={stats.data?.total} icon="users" />
          <StatCard label="New leads" value={byStatus.new} icon="bolt" tone="sky" />
          <StatCard label="In negotiation" value={byStatus.negotiating} icon="fire" tone="amber" />
          <StatCard label="Pending follow-ups" value={stats.data?.pending_followups} icon="calendar" tone="brand" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Scrolls horizontally on narrow screens instead of wrapping into a ragged block. */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="segmented" role="tablist" aria-label="Filter by status">
              {[{ value: '', label: 'All' }, ...LEAD_STATUSES].map((option) => {
                const active = status === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectStatus(option.value)}
                    className={`segmented-item ${active ? 'segmented-item-active' : ''}`}
                  >
                    {option.label}
                    {option.value && byStatus[option.value] !== undefined && (
                      <span
                        className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                          active ? 'bg-slate-900 text-white' : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {byStatus[option.value]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={applySearch} className="flex gap-2">
            <div className="relative flex-1 lg:w-72 lg:flex-none">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search name, email, phone…"
                aria-label="Search leads"
                className="input pl-9"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>

        <ErrorAlert message={leads.error} onRetry={leads.reload} />

        {leads.loading && !leads.data ? (
          <Spinner label="Loading leads…" />
        ) : !leads.error && results.length === 0 ? (
          <EmptyState title="No leads yet" description="Leads captured by the AI agent or added in the admin will appear here." />
        ) : (
          <div className={`transition-opacity ${leads.loading ? 'opacity-60' : ''}`}>
            <LeadTable leads={results} onFollowUp={setFollowUpLead} />
            {leads.data && (
              <Pagination
                page={page}
                count={leads.data.count}
                pageSize={PAGE_SIZE}
                hasNext={Boolean(leads.data.next)}
                hasPrevious={Boolean(leads.data.previous)}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>

      <FollowUpModal
        key={followUpLead?.id}
        open={Boolean(followUpLead)}
        leadId={followUpLead?.id}
        leadName={followUpLead?.full_name}
        leadStatus={followUpLead?.status}
        onClose={() => setFollowUpLead(null)}
        onSaved={refresh}
      />
    </div>
  )
}
