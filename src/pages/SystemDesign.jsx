import { useState, useMemo, useCallback } from 'react'
import { PHASES, PLAN, FRAMEWORKS, ROUNDS } from '../data/systemDesign.js'
import { useLocalStorage } from '../useLocalStorage.js'
import './log.css'

export default function SystemDesign() {
  const [state, setState] = useLocalStorage('sd45.state', {})
  const [track, setTrack] = useLocalStorage('dsa.track', 'sde')
  const [open, setOpen] = useState(1)
  const [tab, setTab] = useState('plan')

  const toggle = (key) => {
    setState((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = 1
      return next
    })
  }

  // On the MLE track the day's ML tasks count toward the day's total too.
  const keysFor = useCallback(
    (day) => {
      const base = day.tasks.map((_, i) => `${day.d}-s${i}`)
      return track === 'mle'
        ? base.concat(day.mlTasks.map((_, i) => `${day.d}-m${i}`))
        : base
    },
    [track],
  )

  const totals = useMemo(() => {
    let all = 0,
      done = 0,
      fullDays = 0
    PLAN.forEach((day) => {
      const ks = keysFor(day)
      all += ks.length
      const n = ks.filter((k) => state[k]).length
      done += n
      if (n === ks.length) fullDays++
    })
    return { all, done, fullDays }
  }, [state, keysFor])

  const pct = totals.all ? Math.round((totals.done / totals.all) * 100) : 0

  return (
    <div className="log" style={{ '--accent': 'var(--blue)' }}>
      <header className="top">
        <div className="wrap">
          <div className="brandrow">
            <div>
              <p className="eyebrow">45-day design log · new grad</p>
              <h1>Designing out loud</h1>
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
              <span className="n">{totals.done}</span>
              <span className="l">of {totals.all} done</span>
            </div>
            <div className="meter">
              <span className="n">{totals.fullDays}</span>
              <span className="l">days closed</span>
            </div>
            <div className="bar">
              <i style={{ width: `${pct}%` }} />
            </div>
          </div>

          <nav className="tabs">
            <button type="button" className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>
              The plan
            </button>
            <button type="button" className={tab === 'frame' ? 'on' : ''} onClick={() => setTab('frame')}>
              Frameworks
            </button>
            <button type="button" className={tab === 'rounds' ? 'on' : ''} onClick={() => setTab('rounds')}>
              Round map
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
                  const ks = keysFor(day)
                  const n = ks.filter((k) => state[k]).length
                  const cls = n === ks.length ? 'full' : n > 0 ? 'some' : ''
                  const isOpen = open === day.d
                  return (
                    <article key={day.d} className={`day ${cls} ${isOpen ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="dayhead"
                        onClick={() => setOpen(isOpen ? null : day.d)}
                        aria-expanded={isOpen}
                      >
                        <span className="dnum">DAY {String(day.d).padStart(2, '0')}</span>
                        <span className="dtopic">{day.topic}</span>
                        <span className="dcount">
                          {n}/{ks.length}
                        </span>
                        <span className="chev">▶</span>
                      </button>

                      {isOpen && (
                        <div className="body">
                          <p className="focus">{day.focus}</p>
                          {day.tasks.map((t, i) => {
                            const k = `${day.d}-s${i}`
                            return (
                              <div key={k} className={`trow ${state[k] ? 'done' : ''}`}>
                                <button
                                  type="button"
                                  className={`box ${state[k] ? 'done' : ''}`}
                                  onClick={() => toggle(k)}
                                  aria-label={t}
                                >
                                  {state[k] ? '✓' : ''}
                                </button>
                                <span className="tlabel">{t}</span>
                              </div>
                            )
                          })}

                          {track === 'mle' && (
                            <div className="mlblock">
                              <span className="k">MLE track</span>
                              <p>{day.ml}</p>
                              {day.mlTasks.map((t, i) => {
                                const k = `${day.d}-m${i}`
                                return (
                                  <div key={k} className={`trow ${state[k] ? 'done' : ''}`}>
                                    <button
                                      type="button"
                                      className={`box ml ${state[k] ? 'done' : ''}`}
                                      onClick={() => toggle(k)}
                                      aria-label={t}
                                    >
                                      {state[k] ? '✓' : ''}
                                    </button>
                                    <span className="tlabel">{t}</span>
                                  </div>
                                )
                              })}
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

        {tab === 'frame' && (
          <section style={{ paddingTop: 28 }}>
            {FRAMEWORKS.map((f) => (
              <div className="card" key={f.h}>
                <h3>{f.h}</h3>
                <p>{f.b}</p>
              </div>
            ))}
          </section>
        )}

        {tab === 'rounds' && (
          <section style={{ paddingTop: 28 }}>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Loop</th>
                    <th>What a new grad actually gets</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUNDS.map((r) => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td>{r[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="caveat">
              Formats are moving fast in 2026 and vary by team, office, and pilot status. Ask
              your recruiter directly what your loop contains — they will usually tell you, and
              it is a reasonable question that costs you nothing.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
