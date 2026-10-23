import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import logo from '../assets/logo.svg'
import { APP_NAME } from '../utils/constants'

const NAV_LINKS = [
  { to: '/', label: 'Property Search', icon: 'sparkles', end: true },
  { to: '/crm', label: 'CRM Dashboard', icon: 'chart' },
]

const desktopLinkClass = ({ isActive }) => `segmented-item ${isActive ? 'segmented-item-active' : ''}`

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg shadow-glow transition group-hover:scale-105" />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">{APP_NAME}</span>
          <span className="hidden rounded-md bg-gradient-to-r from-brand-600 to-violet-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white sm:inline">
            AI
          </span>
        </Link>

        <div className="segmented hidden sm:inline-flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              <Icon name={link.icon} className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" strokeWidth={2} />
        </button>
      </nav>

      {menuOpen && (
        <div className="animate-fade-in-up space-y-1 border-t border-slate-200/70 bg-white/90 px-4 py-3 sm:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={link.icon} className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
