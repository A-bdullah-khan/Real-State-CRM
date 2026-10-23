import Icon from './Icon'
import StatusBadge from './StatusBadge'
import { formatCurrency } from '../utils/format'

function Fact({ icon, label, value }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-slate-900">{value}</dd>
    </div>
  )
}

export default function PropertyCard({ property, footer }) {
  const {
    title, image_url, price, listing_type, listing_type_display, property_type_display,
    status, status_display, bedrooms, bathrooms, area_sqft, address, city, state,
  } = property
  const location = [address, city, state].filter(Boolean).join(', ')

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <Icon name="photo" className="h-8 w-8" />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        {/* Bottom scrim keeps the price tag legible on bright photos; the placeholder doesn't need it. */}
        {image_url && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-900/40 to-transparent" />
        )}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {listing_type_display ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-soft ring-1 ring-black/5 backdrop-blur">
              {listing_type_display}
            </span>
          ) : <span />}
          <StatusBadge status={status} label={status_display} />
        </div>

        <p className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-base font-semibold tracking-tight text-slate-900 shadow-soft ring-1 ring-black/5 backdrop-blur">
          {formatCurrency(price)}
          {listing_type === 'rent' && <span className="text-xs font-medium text-slate-500"> /mo</span>}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-w-0">
          {property_type_display && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600">{property_type_display}</p>
          )}
          <h3 className="truncate font-semibold tracking-tight text-slate-900 transition group-hover:text-brand-700">{title}</h3>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Icon name="mapPin" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>

        <dl className="mt-auto grid grid-cols-3 gap-2 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-100">
          <Fact icon="bed" label="Beds" value={bedrooms} />
          <Fact icon="bath" label="Baths" value={bathrooms != null ? Number(bathrooms) : '—'} />
          <Fact icon="area" label="Sq ft" value={area_sqft ? area_sqft.toLocaleString() : '—'} />
        </dl>

        {footer}
      </div>
    </article>
  )
}
