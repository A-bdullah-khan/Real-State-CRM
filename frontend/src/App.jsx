import { Link, Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import CRMDashboardPage from './pages/CRMDashboardPage'
import LeadDetailPage from './pages/LeadDetailPage'
import PropertySearchPage from './pages/PropertySearchPage'

function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Keyed by path so a crash on one page doesn't follow the user to the next; the navbar stays usable. */}
        <ErrorBoundary key={pathname}>
          <Routes>
            <Route path="/" element={<PropertySearchPage />} />
            <Route path="/crm" element={<CRMDashboardPage />} />
            <Route path="/leads/:leadId" element={<LeadDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}
