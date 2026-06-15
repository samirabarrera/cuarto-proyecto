import { useState } from 'react'
import '../styles/navbar.css'

const VIEWS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: 'bi-grid-fill' },
  { id: 'transactions',  label: 'Transacciones', icon: 'bi-arrow-left-right' },
  { id: 'goals',         label: 'Metas',         icon: 'bi-bullseye' },
]

export default function Navbar({ activeView, onNavigate, isConnected }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="ff-navbar navbar navbar-expand-md">
      <div className="container-fluid">

        {/* Brand */}
        <span className="ff-brand">
          <i className="bi bi-graph-up-arrow brand-icon" />
          FinanceFlow
        </span>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list text-white fs-4" />
        </button>

        {/* Links */}
        <div className={`navbar-collapse ${menuOpen ? 'd-block' : 'd-none d-md-flex'}`}>
          <ul className="navbar-nav mx-auto gap-1 mt-2 mt-md-0">
            {VIEWS.map(v => (
              <li className="nav-item" key={v.id}>
                <button
                  className={`ff-nav-link ${activeView === v.id ? 'active' : ''}`}
                  onClick={() => { onNavigate(v.id); setMenuOpen(false) }}
                  id={`nav-${v.id}`}
                >
                  <i className={`bi ${v.icon}`} />
                  {v.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Socket status */}
          <div className="socket-status ms-md-3 mt-2 mt-md-0">
            <span className={`socket-dot ${isConnected ? 'connected' : ''}`} />
            {isConnected ? 'En vivo' : 'Desconectado'}
          </div>
        </div>
      </div>
    </nav>
  )
}
