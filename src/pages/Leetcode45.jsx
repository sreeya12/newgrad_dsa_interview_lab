import { useState, useMemo } from 'react'
import { PHASES, PLAN, METHOD } from '../data/leetcode45.js'
import { useLocalStorage } from '../useLocalStorage.js'
import './log.css'

const slug = (t) =>
  t
    .toLowerCase()
    .replace(/[()',.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export default function Leetcode45() {
  // A problem cycles: unset -> "done" -> "flag" -> unset.
  const [state, setState] = useLocalStorage('lc45.state', {})
  const [track, setTrack] = useLocalStorage('dsa.track', 'sde')
  const [open, setOpen] = useState(1)
  const [tab, setTab] = useState('plan')

  const cycle = (key) => {
    setState((prev) => {
      const next = { ...prev }
      if (!prev[key]) next[key] = 'done'
      else if (prev[key] === 'done') next[key] = 'flag'
      else delete next[key]
      return next
    })
  }

  const all = useMemo(() => {
    const out = []
    PLAN.forEach((day) =>
      day.probs.forEach((pr) => out.push({ key: `${day.d}-${pr[0]}`, day, pr })),
    )
    return out
  }, [])

  const doneCount = all.filter((x) => state[x.key] === 'done').length
  const flagged = all.filter((x) => state[x.key] === 'flag')
  const pct = Math.round((doneCount / all.length) * 100)
  const daysDone = PLAN.filter(
    (day) => day.probs.length > 0 && day.probs.every((pr) => state[`${day.d}-${pr[0]}`]),
  ).length

  const dayState = (day) => {
    if (!day.probs.length) return ''
    const n = day.probs.filter((pr) => state[`${day.d}-${pr[0]}`]).length
    if (n === day.probs.length) return 'full'
    return n > 0 ? 'some' : ''
  }

  return (
    <div className="log" style={{ '--accent': 'var(--teal)' }}>
      <header className="top">
        <div className="wrap">
          <div className="brandrow">
            <div>
              <p className="eyebrow">45-day training log · new grad</p>
              <h1>From patterns to offers</h1>
            </div>
            <div className="toggle" role="group" aria-label="Track">
              <button type="button" className={track === 'sde' ? 'on' : ''} onClick={() => setTrack('sde')}>
                SDE
              </button>
              <button type="button" className={track === 'mle' ? 'on' : ''} onClick={() => setTrack('mle')}>
                MLE
              </button>
            </div>
          </div>

          <div className="meters">
            <div className="meter">
              <span className="n">{doneCount}</span>
              <span className="l">of {all.length} solved</span>
            </div>
            <div className="meter">
              <span className="n">{daysDone}</span>
              <span className="l">days closed</span>
            </div>
            <div className="meter">
              <span className="n">{flagged.length}</span>
              <span className="l">in review</span>
            </div>
            <div className="bar">
              <i style={{ width: `${pct}%` }} />
            </div>
          </div>

          <nav className="tabs">
            <button type="button" className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>
              The plan
            </button>
            <button type="button" className={tab === 'review' ? 'on' : ''} onClick={() => setTab('review')}>
              Review queue ({flagged.length})
            </button>
            <button type="button" className={tab === 'method' ? 'on' : ''} onClick={() => setTab('method')}>
              How to practice
            </button>
          </nav>
        </div>
      </header>

      <div className="wrap">
        {tab === 'plan' &&
          PHASES.map((ph) => (
            <section key={ph.id}>
              <div className="phase">
                <h2>{ph.name}</h2>
                <span className="rng">{ph.range}</span>
                <p>{ph.note}</p>
              </div>
              <div className="days">
                {PLAN.filter((d) => d.p === ph.id).map((day) => {
                  const st = dayState(day)
                  const n = day.probs.filter((pr) => state[`${day.d}-${pr[0]}`]).length
                  const isOpen = open === day.d
                  return (
                    <article key={day.d} className={`day ${st} ${isOpen ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="dayhead"
                        onClick={() => setOpen(isOpen ? null : day.d)}
                        aria-expanded={isOpen}
                      >
                        <span className="dnum">DAY {String(day.d).padStart(2, '0')}</span>
                        <span className="dtopic">{day.topic}</span>
                        <span className="dcount">
                          {day.probs.length ? `${n}/${day.probs.length}` : 'open'}
                        </span>
                        <span className="chev">▶</span>
                      </button>

                      {isOpen && (
                        <div className="body">
                          <p className="focus">{day.focus}</p>
                          {day.probs.map((pr) => {
                            const key = `${day.d}-${pr[0]}`
                            const s = state[key]
                            return (
                              <div key={key} className={`trow ${s === 'done' ? 'done' : ''}`}>
                                <button
                                  type="button"
                                  className={`box ${s === 'done' ? 'done' : s === 'flag' ? 'flag' : ''}`}
                                  onClick={() => cycle(key)}
                                  aria-label={`${pr[1]}: ${s === 'done' ? 'solved' : s === 'flag' ? 'flagged for review' : 'not started'}`}
                                >
                                  {s === 'done' ? '✓' : s === 'flag' ? '!' : ''}
                                </button>
                                <span className="pid">{pr[0]}</span>
                                <a
                                  className="pt"
                                  href={`https://leetcode.com/problems/${slug(pr[1])}/`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {pr[1]}
                                </a>
                                {pr[3] && <span className="prem">PREMIUM</span>}
                                <span className={`diff ${pr[2]}`}>{pr[2]}</span>
                              </div>
                            )
                          })}

                          {track === 'mle' && (
                            <div className="mlblock">
                              <span className="k">ML add-on · 45 min</span>
                              <p>{day.ml}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}

        {tab === 'review' && (
          <section style={{ paddingTop: 28 }}>
            {flagged.length === 0 ? (
              <div className="empty">
                <p>
                  Nothing flagged yet. Click a problem&apos;s box twice to send it here — flag
                  anything you needed a hint for, even if you finished it.
                </p>
              </div>
            ) : (
              flagged.map((x) => (
                <div key={x.key} className="flagrow">
                  <button
                    type="button"
                    className="box flag"
                    onClick={() => cycle(x.key)}
                    aria-label={`Clear flag on ${x.pr[1]}`}
                  >
                    !
                  </button>
                  <span className="pid">{x.pr[0]}</span>
                  <a
                    className="pt"
                    href={`https://leetcode.com/problems/${slug(x.pr[1])}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {x.pr[1]}
                  </a>
                  <span className="qmeta">
                    DAY {x.day.d} · {x.day.topic}
                  </span>
                  <span className={`diff ${x.pr[2]}`}>{x.pr[2]}</span>
                </div>
              ))
            )}
          </section>
        )}

        {tab === 'method' && (
          <section style={{ paddingTop: 28 }}>
            {METHOD.map((m) => (
              <div key={m.h} className="card">
                <h3>{m.h}</h3>
                <p>{m.b}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
