import Icon from './Icon'

export default function Pagination({ page, count, pageSize, hasNext, hasPrevious, onPageChange }) {
  if (!hasNext && !hasPrevious) return null
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm tabular-nums text-slate-500">
        Page <span className="font-medium text-slate-900">{page}</span> of {totalPages}
        <span className="mx-1.5 text-slate-300">·</span>
        {count} results
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary px-2.5" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>
          <Icon name="chevronLeft" className="h-4 w-4" />
          Previous
        </button>
        <button type="button" className="btn-secondary px-2.5" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
