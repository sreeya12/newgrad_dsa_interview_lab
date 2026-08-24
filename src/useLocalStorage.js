import { useState, useEffect, useCallback } from 'react'

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode, blocked cookies) - stay in memory
    }
  }, [key, value])

  const reset = useCallback(() => setValue(fallback), [fallback])

  return [value, setValue, reset]
}

// Convenience hook for "set of checked ids" progress tracking.
export function useCheckSet(key) {
  const [ids, setIds] = useLocalStorage(key, [])
  const set = new Set(ids)

  const toggle = useCallback(
    (id) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setIds],
  )

  const clear = useCallback(() => setIds([]), [setIds])

  return { set, toggle, clear, count: set.size }
}
