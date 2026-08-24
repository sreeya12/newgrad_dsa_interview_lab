import { useCallback } from 'react'
import { useRoute, navigate } from '../router.jsx'

export default function Link({ to, className = '', children, ...rest }) {
  const path = useRoute()
  const isActive = path === to || (to !== '/' && path.startsWith(to))

  const onClick = useCallback(
    (event) => {
      event.preventDefault()
      navigate(to)
      window.scrollTo({ top: 0 })
    },
    [to],
  )

  return (
    <a
      href={`#${to}`}
      onClick={onClick}
      className={`${className}${isActive ? ' is-active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
