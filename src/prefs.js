import { useSyncExternalStore } from 'react'

/* ==================================================================
   App-wide preferences.

   `useLocalStorage` gives each component its own copy of the state, which is
   fine for a checkbox set owned by one page but wrong for a preference the nav
   bar sets and five pages read. This is a tiny external store instead: one
   value, every subscriber re-renders the moment it changes.
   ================================================================== */

const KEY = 'dsa.lang'
const VALID = ['cpp', 'py']

export const LANGS = [
  { id: 'cpp', label: 'C++' },
  { id: 'py', label: 'Python' },
]

function read() {
  try {
    const v = window.localStorage.getItem(KEY)
    return VALID.includes(v) ? v : 'cpp'
  } catch {
    // private mode / blocked storage: fall back to the default
    return 'cpp'
  }
}

let value = read()
const listeners = new Set()

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setLang(next) {
  if (!VALID.includes(next) || next === value) return
  value = next
  try {
    window.localStorage.setItem(KEY, next)
  } catch {
    // stay in memory for this session
  }
  listeners.forEach((fn) => fn())
}

export function useLang() {
  return useSyncExternalStore(
    subscribe,
    () => value,
    () => 'cpp',
  )
}

/** Pick the right half of a { cpp, py } pair, tolerating a missing twin. */
export function pick(pair, lang) {
  if (!pair) return undefined
  return pair[lang] ?? pair.cpp ?? pair.py
}
