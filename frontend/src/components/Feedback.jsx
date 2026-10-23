import Icon from './Icon'

/**
 * Shared loading, error and empty-state primitives. Pages compose these instead of
 * hand-rolling their own so every async view degrades the same way.
 */

/** Block-level spinner for a section whose data has not arrived yet. */
export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      {label}
    </div>
  )
}

/** Inline spinner for buttons; inherits the button's text colour so it works on any variant. */
export function ButtonSpinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
}

/** Dismissible-by-retry error banner. Renders nothing when there is no message, so it can sit in the tree unconditionally. */
export function ErrorAlert({ message, onRetry }) {
  if (!message) return null
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/80 p-4 text-sm text-red-800 shadow-soft"
      role="alert"
    >
      <Icon name="warning" className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 font-medium text-red-700 transition hover:bg-red-100"
        >
          <Icon name="retry" className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-soft ring-1 ring-slate-200">
        <Icon name="search" className="h-5 w-5" />
      </span>
      <p className="mt-4 font-medium text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  )
}
