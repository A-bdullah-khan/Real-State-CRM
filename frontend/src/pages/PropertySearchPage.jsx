import { useState } from 'react'
import AIChatPanel from '../components/AIChatPanel'
import InquiryModal from '../components/InquiryModal'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorAlert, Spinner } from '../components/Feedback'
import Icon from '../components/Icon'
import { useApiQuery } from '../hooks/useApiQuery'
import { propertyService } from '../services'
import { LISTING_TYPES, PROPERTY_TYPES } from '../utils/constants'

const PAGE_SIZE = 20

const EMPTY_FILTERS = {
  search: '',
  city: '',
  property_type: '',
  listing_type: '',
  min_price: '',
  max_price: '',
  min_bedrooms: '',
}

const TABS = [
  { id: 'ai', label: 'AI Assistant', icon: 'sparkles' },
  { id: 'browse', label: 'Browse listings', icon: 'grid' },
]

/** Filter form + results. Edits go to `draft`; the query only refires when the form is submitted. */
function BrowseListings({ onEnquire }) {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)

  const params = { ...filters, status: 'available', page }
  const { data, error, loading, reload } = useApiQuery(
    (options) => propertyService.list(params, options),
    JSON.stringify(params),
  )

  const updateDraft = (event) => setDraft((current) => ({ ...current, [event.target.name]: event.target.value }))

  const applyFilters = (event) => {
    event.preventDefault()
    setFilters(draft)
    setPage(1)
  }

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const properties = data?.results ?? []

  return (
    <div className="space-y-6">
      <form onSubmit={applyFilters} className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900 sm:col-span-2 lg:col-span-4">
          <Icon name="filters" className="h-4 w-4 text-slate-400" />
          Filters
        </p>
        <div className="sm:col-span-2">
          <label htmlFor="search" className="label">Keyword</label>
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="search" name="search" value={draft.search} onChange={updateDraft} placeholder="e.g. garden, pool, downtown" className="input pl-9" />
          </div>
        </div>
        <div>
          <label htmlFor="city" className="label">City</label>
          <input id="city" name="city" value={draft.city} onChange={updateDraft} placeholder="Any city" className="input" />
        </div>
        <div>
          <label htmlFor="listing_type" className="label">Listing</label>
          <select id="listing_type" name="listing_type" value={draft.listing_type} onChange={updateDraft} className="input">
            <option value="">Sale or rent</option>
            {LISTING_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="property_type" className="label">Property type</label>
          <select id="property_type" name="property_type" value={draft.property_type} onChange={updateDraft} className="input">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="min_price" className="label">Min price</label>
          <input id="min_price" name="min_price" type="number" min="0" value={draft.min_price} onChange={updateDraft} className="input" />
        </div>
        <div>
          <label htmlFor="max_price" className="label">Max price</label>
          <input id="max_price" name="max_price" type="number" min="0" value={draft.max_price} onChange={updateDraft} className="input" />
        </div>
        <div>
          <label htmlFor="min_bedrooms" className="label">Bedrooms</label>
          <select id="min_bedrooms" name="min_bedrooms" value={draft.min_bedrooms} onChange={updateDraft} className="input">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2 lg:col-span-4">
          <button type="button" className="btn-secondary" onClick={resetFilters}>Reset</button>
          <button type="submit" className="btn-primary">
            <Icon name="search" className="h-4 w-4" />
            Search
          </button>
        </div>
      </form>

      <ErrorAlert message={error} onRetry={reload} />

      {loading && !data ? (
        <Spinner label="Loading properties…" />
      ) : !error && properties.length === 0 ? (
        <EmptyState title="No properties found" description="Try widening your price range or clearing some filters." />
      ) : (
        <>
          <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                footer={
                  <button type="button" className="btn-secondary w-full" onClick={() => onEnquire(property)}>
                    Enquire
                  </button>
                }
              />
            ))}
          </div>
          {data && (
            <Pagination
              page={page}
              count={data.count}
              pageSize={PAGE_SIZE}
              hasNext={Boolean(data.next)}
              hasPrevious={Boolean(data.previous)}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default function PropertySearchPage() {
  const [activeTab, setActiveTab] = useState('ai')
  const [inquiry, setInquiry] = useState(null)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-brand-600" />
            AI-powered property search
          </span>
          <h1 className="page-title mt-4">
            Find your next <span className="text-gradient">property</span>
          </h1>
          <p className="page-subtitle">
            Describe what you need to our AI assistant, or browse available listings with filters.
          </p>
        </div>

        <div role="tablist" aria-label="Search mode" className="segmented self-start sm:self-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`segmented-item ${activeTab === tab.id ? 'segmented-item-active' : ''}`}
            >
              <Icon name={tab.icon} className={`h-4 w-4 ${activeTab === tab.id && tab.id === 'ai' ? 'text-brand-600' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Both panels stay mounted so the chat history survives switching tabs. */}
      <div role="tabpanel" id="panel-ai" aria-labelledby="tab-ai" hidden={activeTab !== 'ai'}>
        <AIChatPanel onEnquire={(property) => setInquiry({ property, source: 'ai_chat' })} />
      </div>
      <div role="tabpanel" id="panel-browse" aria-labelledby="tab-browse" hidden={activeTab !== 'browse'}>
        <BrowseListings onEnquire={(property) => setInquiry({ property, source: 'website' })} />
      </div>

      <InquiryModal property={inquiry?.property} source={inquiry?.source} onClose={() => setInquiry(null)} />
    </div>
  )
}
