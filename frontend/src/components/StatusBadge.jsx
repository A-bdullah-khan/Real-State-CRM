import { DEFAULT_STATUS_STYLE, STATUS_STYLES } from '../utils/constants'

export default function StatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {label || status}
    </span>
  )
}
