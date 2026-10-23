const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: import.meta.env.VITE_CURRENCY || 'USD',
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—'
  return currencyFormatter.format(Number(value))
}

export function formatDateTime(value) {
  return value ? dateTimeFormatter.format(new Date(value)) : '—'
}

export function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

/** Format a Date as the local `YYYY-MM-DDTHH:mm` string a datetime-local input expects. */
export function toDateTimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
