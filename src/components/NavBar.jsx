import { useState } from 'react'
import Link from './Link.jsx'
import { routes } from '../routes.js'
import LangToggle from './LangToggle.jsx'
import './NavBar.css'

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-dot" aria-hidden="true" />
        DSA&nbsp;Plan
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <nav className={`nav-links${open ? ' is-open' : ''}`}>
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="nav-link"
            onClickCapture={() => setOpen(false)}
          >
            {route.label}
          </Link>
        ))}
        <LangToggle />
      </nav>
    </header>
  )
}
