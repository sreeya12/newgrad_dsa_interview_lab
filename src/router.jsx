import { useState, useEffect } from 'react'

// Minimal zero-dependency hash router.
// Hash routing is used so the app also works from `file://` and from any
// static host without server-side rewrite rules.

export function currentPath() {
  const hash = window.location.hash || '#/'
  return hash.replace(/^#/, '') || '/'
}

export function useRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export function navigate(to) {
  if (currentPath() === to) return
  window.location.hash = to
}
