import { useState, useMemo } from 'react'
import { BREADTH } from '../data/mlBreadth.js'
import { CASES, SCRIPT } from '../data/mlCases.js'
import { useLocalStorage } from '../useLocalStorage.js'
import './log.css'
import './mltrack.css'

/* The MLE half of the loop: the breadth questions, the six cases worked
   end to end, and the script that structures the 50 minutes.
   Additive — nothing here replaces the SDE material, it sits beside it. */

export default function MlTrack() {
  const [tab, setTab] = useState('breadth')
  const [known, setKnown] = useLocalStorage('mlt.known', {})
  const [openQ, setOpenQ] = useState({})
  const [openC, setOpenC] = useState({})

  const toggleKnown = (key) =>
    setKnown((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = 1
      return next
    })

  const totals = useMemo(() => {
    let all = 0
    BREADTH.forEach((s) => (all += s.qs.length))
    const done = Object.values(known).filter(Boolean).length
    return { all, done }
  }, [known])

  const pct = totals.all ? Math.round((totals.done / totals.all) * 100) : 0

  return (
    <div className="log" style={{ '--accent': 'var(--teal)' }}>
      <header className="top">
        <div className="wrap">
          <div className="brandrow">
            <div>
              <p className="eyebrow">ML interview track · MLE</p>
              <h1>The other half of the loop</h1>
            </div>
          </div>

          <div className="meters">
            <div className="meter">
              <span className="n">{totals.done}</span>
              <span className="l">of {totals.all} answered cold</span>
            </div>
            <div className="meter">
              <span className="n">{CASES.length}</span>
              <span className="l">cases worked</span>
            </div>
            <div className="bar" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </div>
          </div>

          <nav className="tabs" aria-label="Sections">
            <button
              type="button"
              className={tab === 'breadth' ? 'on' : ''}
              onClick={() => setTab('breadth')}
            >
              Breadth bank
            </button>
            <button
              type="button"
              className={tab === 'cases' ? 'on' : ''}
              onClick={() => setTab('cases')}
            >
              Worked cases
            </button>
            <button
              type="button"
              className={tab === 'script' ? 'on' : ''}
              onClick={() => setTab('script')}
            >
              The 50-minute script
            </button>
          </nav>
        </div>
      </header>

      <div className="wrap mlt">
        {tab === 'breadth' && (
          <>
            <div className="phase">
              <h2>Answer these out loud</h2>
              <span className="rng">{totals.all} prompts</span>
              <p>
                Open one, say the answer before you read it, then tick it only
                if what you said covered the same ground. Reading and
                recognising is not the same as producing it under a timer.
              </p>
            </div>

            {BREADTH.map((s) => {
              const sDone = s.qs.filter((_, i) => known[`${s.sec}-${i}`]).length
              return (
                <div key={s.sec}>
                  <div className="phase">
                    <h2>{s.sec}</h2>
                    <span className="rng">
                      {sDone} / {s.qs.length}
                    </span>
                    <p>{s.blurb}</p>
                  </div>

                  <div className="days">
                    {s.qs.map((q, i) => {
                      const key = `${s.sec}-${i}`
                      const on = !!openQ[key]
                      const done = !!known[key]
                      return (
                        <div
                          key={key}
                          className={`day${on ? ' open' : ''}${done ? ' full' : ''}`}
                        >
                          <div className="dayhead" style={{ cursor: 'default' }}>
                            <button
                              type="button"
                              className={`box${done ? ' done' : ''}`}
                              aria-pressed={done}
                              aria-label={
                                done ? 'Mark not yet solid' : 'Mark solid'
                              }
                              onClick={() => toggleKnown(key)}
                            >
                              {done ? '✓' : ''}
                            </button>
                            <button
                              type="button"
                              className="qrow"
                              style={{
                                background: 'transparent',
                                border: 0,
                                padding: 0,
                                font: 'inherit',
                                color: 'inherit',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              aria-expanded={on}
                              onClick={() =>
                                setOpenQ((p) => ({ ...p, [key]: !p[key] }))
                              }
                            >
                              <span className="qtext">{q.q}</span>
                            </button>
                            <span className="chev" aria-hidden="true">
                              ▸
                            </span>
                          </div>
                          {on && (
                            <div className="body">
                              <p className="ans">{q.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {tab === 'cases' && (
          <>
            <div className="phase">
              <h2>Six systems, in the order you would say them</h2>
              <span className="rng">{CASES.length} cases</span>
              <p>
                Each case follows the script on the next tab. Read the prompt,
                talk through all nine steps yourself, then open it and see what
                you skipped — the gap is almost always metrics or failure
                modes, never features.
              </p>
            </div>

            <div className="days">
              {CASES.map((c) => {
                const on = !!openC[c.id]
                return (
                  <div key={c.id} className={`day${on ? ' open' : ''}`}>
                    <button
                      type="button"
                      className="dayhead"
                      aria-expanded={on}
                      onClick={() => setOpenC((p) => ({ ...p, [c.id]: !p[c.id] }))}
                    >
                      <span className="dnum">{c.id}</span>
                      <span className="dtopic">{c.name}</span>
                      <span className="dcount">{c.blocks.length} steps</span>
                      <span className="chev" aria-hidden="true">
                        ▸
                      </span>
                    </button>

                    {on && (
                      <div className="body">
                        <p className="prompt">“{c.prompt}”</p>

                        <div className="scale">
                          {c.scale.map(([k, v]) => (
                            <span key={k}>
                              <b>{k}</b>
                              {v}
                            </span>
                          ))}
                        </div>

                        {c.blocks.map((b) => (
                          <div className="cb" key={b.k}>
                            <span className="k">{b.k}</span>
                            <p>{b.v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'script' && (
          <>
            <div className="phase">
              <h2>Fifty minutes, nine steps</h2>
              <span className="rng">the shape of the round</span>
              <p>
                The timings are a budget, not a rule. What matters is the order:
                every step depends on the one before it, and the two most
                commonly skipped — naming the label, and volunteering the
                failure modes — are the two that decide the score.
              </p>
            </div>

            {SCRIPT.map((s) => (
              <div className="step" key={s.n}>
                <div className="sn">{String(s.n).padStart(2, '0')}</div>
                <div className="sbody">
                  <h3>
                    {s.t} <em>{s.min} min</em>
                  </h3>
                  <p>{s.say}</p>
                  <div className="watch">
                    <b>watch out</b>
                    {s.watch}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
