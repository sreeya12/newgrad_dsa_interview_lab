import { useState, useMemo } from 'react'
import { CARDS } from '../data/patterns.js'
import { CARD_CODE_PY } from '../data/patternsPy.js'
import { useLang } from '../prefs.js'
import './patterns.css'

export default function Home() {
  const lang = useLang()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(null)
  const [group, setGroup] = useState('All')

  const groups = useMemo(
    () => ['All', ...Array.from(new Set(CARDS.map((c) => c.g)))],
    [],
  )

  const shown = CARDS.filter((c) => {
    const hitGroup = group === 'All' || c.g === group
    const t = (c.name + c.trigger + c.move + c.canon).toLowerCase()
    return hitGroup && t.includes(q.toLowerCase())
  })

  const codeOf = (c) => (lang === 'py' && CARD_CODE_PY[c.name]) || c.code

  const copy = async (c) => {
    try {
      await navigator.clipboard.writeText(codeOf(c))
      setCopied(c.name)
      setTimeout(() => setCopied(null), 1400)
    } catch {
      // clipboard blocked (no permission, or not a secure context);
      // the template is on screen anyway
      setCopied('__failed__')
      setTimeout(() => setCopied(null), 1400)
    }
  }

  return (
    <div className="pat">
      <header className="top">
        <div className="wrap">
          <p className="eyebrow">
            Companion reference · {lang === 'py' ? 'Python' : 'C++'}
          </p>
          <h1>What to reach for, and why</h1>
          <p className="sub">
            Twenty-one patterns keyed to the phrase that gives them away. Read the trigger,
            name the pattern out loud, then check whether your template matches.
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a pattern, a trigger phrase, or a problem number"
            aria-label="Search patterns"
          />
          <div className="chips">
            {groups.map((g) => (
              <button
                type="button"
                key={g}
                className={`chip ${group === g ? 'on' : ''}`}
                onClick={() => setGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap" style={{ paddingTop: 14 }}>
        {shown.length === 0 && (
          <div className="none">
            No pattern matches that. Try a problem name, or clear the filter.
          </div>
        )}

        {shown.map((c) => {
          const isOpen = open === c.name
          return (
            <article className={`card ${isOpen ? 'open' : ''}`} key={c.name}>
              <button
                type="button"
                className="head"
                onClick={() => setOpen(isOpen ? null : c.name)}
                aria-expanded={isOpen}
              >
                <p className="quote">&ldquo;{c.trigger}&rdquo;</p>
                <h2 className="nm">
                  {c.name} <span className="tag">{c.g}</span>
                </h2>
              </button>

              {isOpen && (
                <div className="body">
                  <p className="move">{c.move}</p>
                  <div className="facts">
                    <span>
                      <b>Cost</b> · {c.big}
                    </span>
                    <span>
                      <b>Canonical</b> · {c.canon}
                    </span>
                  </div>
                  <div className="coderow">
                    <span className="lbl">
                      Template · {lang === 'py' ? 'Python' : 'C++'}
                    </span>
                    <button type="button" className="cp" onClick={() => copy(c)}>
                      {copied === c.name
                        ? 'Copied'
                        : copied === '__failed__'
                          ? 'Select it instead'
                          : 'Copy'}
                    </button>
                  </div>
                  <pre>{codeOf(c)}</pre>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
