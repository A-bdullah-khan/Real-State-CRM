import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format'

function budgetRange(min, max) {
  if (!min && !max) return '—'
  if (min && max) return `${formatCurrency(min)} – ${formatCurrency(max)}`
  return min ? `From ${formatCurrency(min)}` : `Up to ${formatCurrency(max)}`
}

function initials(name) {
  const letters = (name || '').split(/\s+/).filter(Boolean).map((word) => word[0]).join('')
  return (letters.slice(0, 2) || '?').toUpperCase()
}

const TH = 'whitespace-nowrap px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500'

export default function LeadTable({ leads, onFollowUp }) {
  const navigate = useNavigate()

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200/80 bg-slate-50/80 text-left">
          <tr>
            <th scope="col" className={TH}>Lead</th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={TH}>Source</th>
            <th scope="col" className={TH}>Budget</th>
            <th scope="col" className={TH}>Next follow-up</th>
            <th scope="col" className={TH}>Created</th>
            {onFollowUp && <th scope="col" className={TH}><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="group cursor-pointer transition-colors hover:bg-slate-50/80"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-violet-100 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60"
                    aria-hidden="true"
                  >
                    {initials(lead.full_name)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/leads/${lead.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="font-medium text-slate-900 transition group-hover:text-brand-700"
                    >
                      {lead.full_name}
                    </Link>
                    <p className="truncate text-xs text-slate-500">{lead.email || lead.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} label={lead.status_display} />
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {lead.source_display}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-slate-700">
                {budgetRange(lead.budget_min, lead.budget_max)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                {lead.next_followup_at ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                    {formatDateTime(lead.next_followup_at)}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-500">{formatDate(lead.created_at)}</td>
              {onFollowUp && (
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    className="btn-secondary px-2.5 py-1.5 text-xs group-hover:ring-brand-200 group-hover:text-brand-700"
                    onClick={(event) => {
                      event.stopPropagation()
                      onFollowUp(lead)
                    }}
                  >
                    <Icon name="sparkles" className="h-3.5 w-3.5" />
                    AI follow-up
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
