import Link from '../components/Link.jsx'
import { routes } from '../routes.js'

export default function NotFound() {
  return (
    <main className="page">
      <header className="page-header">
        <p className="page-eyebrow">404</p>
        <h1>Nothing routed here</h1>
        <p className="page-lede">
          That URL does not match a page. Pick one of the sections below.
        </p>
      </header>
      <div className="card-grid">
        {routes.map((route) => (
          <Link key={route.path} to={route.path} className="card">
            <h3>{route.label}</h3>
          </Link>
        ))}
      </div>
    </main>
  )
}
