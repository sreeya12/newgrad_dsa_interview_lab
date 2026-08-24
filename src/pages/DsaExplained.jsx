import { useState, useMemo, useRef } from 'react'
import { C, mono, sans, disp } from './dsalab/tokens.js'
import { Btn, Pick, Section, CostTable, Code } from './dsalab/ui.jsx'
import { MODULES } from './dsalab/modules.jsx'
import { useLocalStorage } from '../useLocalStorage.js'

/* ==================================================================
   DS&A LAB BENCH — companion to the 45-day plan
   Every module: trace -> invariant -> cost -> C++ -> traps -> problems
   ================================================================== */

export default function DsaExplained() {
  const [sel, setSel] = useState(0)
  const [track, setTrack] = useLocalStorage('dsa.track', 'sde')
  const [known, setKnown] = useLocalStorage('dsa.lab.known', {})
  const topRef = useRef(null)

  const m = MODULES[sel]

  const groups = useMemo(() => {
    const g = []
    MODULES.forEach((mod, i) => {
      let last = g[g.length - 1]
      if (!last || last.name !== mod.g) {
        last = { name: mod.g, items: [] }
        g.push(last)
      }
      last.items.push({ n: mod.n, i })
    })
    return g
  }, [])

  const doneCount = Object.values(known).filter(Boolean).length

  const go = (i) => {
    setSel(i)
    if (topRef.current)
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      style={{
        color: C.ink,
        fontFamily: sans,
        textAlign: 'left',
        flexGrow: 1,
      }}
    >
      <style>{`
        .lab-bench * { box-sizing: border-box; }
        .lab-bench button:focus-visible,
        .lab-bench [tabindex]:focus-visible { outline: 2px solid ${C.rust}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .lab-bench * { scroll-behavior: auto !important; } }
        @media print { .lab-bench .rail { display: none; } }
      `}</style>

      <div
        className="lab-bench"
        style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px 80px' }}
      >
        {/* masthead */}
        <header
          ref={topRef}
          style={{
            padding: '36px 0 22px',
            borderBottom: `2px solid ${C.ink}`,
            scrollMarginTop: 'calc(var(--nav-h) + 8px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.rust,
                }}
              >
                Lab bench · companion to the 45-day plan
              </div>
              <h1
                style={{
                  fontSize: 'clamp(28px, 4.6vw, 46px)',
                  lineHeight: 1.04,
                  margin: '10px 0 8px',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  color: C.ink,
                  fontFamily: disp,
                }}
              >
                Data structures &amp; algorithms,
                <br />
                traced one step at a time
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: 620,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: C.mute,
                }}
              >
                Nineteen modules, each one a machine you can run. Step the tape,
                watch the state change, then read the invariant that makes it
                correct and the C++ it compiles down to.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Pick
                label="track"
                value={track}
                onChange={setTrack}
                options={[
                  { v: 'sde', t: 'SDE' },
                  { v: 'mle', t: 'MLE' },
                ]}
              />
            </div>
          </div>
        </header>

        <div
          style={{
            display: 'flex',
            gap: 34,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {/* rail */}
          <nav
            className="rail"
            style={{
              flex: '1 1 236px',
              minWidth: 236,
              maxWidth: 300,
              paddingTop: 22,
              position: 'sticky',
              top: 'calc(var(--nav-h) + 12px)',
              maxHeight: 'calc(100vh - var(--nav-h) - 24px)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: C.mute,
                marginBottom: 10,
              }}
            >
              {doneCount} / {MODULES.length} marked solid
            </div>

            {groups.map((g) => (
              <div key={g.name} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: C.mute,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${C.line}`,
                    marginBottom: 4,
                  }}
                >
                  {g.name}
                </div>
                {g.items.map((it) => {
                  const on = it.i === sel
                  return (
                    <div
                      key={it.i}
                      onClick={() => go(it.i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          go(it.i)
                        }
                      }}
                      style={{
                        display: 'flex',
                        gap: 9,
                        alignItems: 'baseline',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        borderRadius: 2,
                        background: on ? C.ink : 'transparent',
                        color: on ? C.paper : C.ink,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 10.5,
                          color: on ? '#8a99ad' : C.mute,
                        }}
                      >
                        {String(it.i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 13.5, lineHeight: 1.35, flex: 1 }}>
                        {it.n}
                      </span>
                      {known[it.i] && (
                        <span style={{ color: on ? C.paper : C.teal, fontSize: 12 }}>
                          ✓
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* main */}
          <main style={{ flex: '999 1 560px', minWidth: 300, paddingTop: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: C.rust,
                    letterSpacing: '0.1em',
                  }}
                >
                  {String(sel + 1).padStart(2, '0')} · {m.days}
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(22px, 3.2vw, 31px)',
                    margin: '6px 0 6px',
                    letterSpacing: '-0.02em',
                    fontWeight: 600,
                    color: C.ink,
                    fontFamily: disp,
                  }}
                >
                  {m.n}
                </h2>
              </div>
              <Btn
                onClick={() => setKnown({ ...known, [sel]: !known[sel] })}
                active={!!known[sel]}
              >
                {known[sel] ? '✓ solid' : 'mark solid'}
              </Btn>
            </div>

            <div
              style={{
                borderLeft: `3px solid ${C.amber}`,
                paddingLeft: 12,
                margin: '4px 0 16px',
                fontSize: 13.5,
                color: C.mute,
              }}
            >
              <b
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.amber,
                }}
              >
                Reach for it when
              </b>
              <div style={{ marginTop: 3 }}>{m.trigger}</div>
            </div>

            <p style={{ fontSize: 15.5, lineHeight: 1.66, margin: '0 0 6px' }}>
              {m.idea}
            </p>

            <Section label="Run it">{m.lab}</Section>

            <Section label="The invariant" accent={C.teal}>
              <div
                style={{
                  background: '#e7f1f0',
                  border: '1px solid #bcd8d5',
                  borderRadius: 3,
                  padding: '12px 14px',
                  fontSize: 14.5,
                  lineHeight: 1.6,
                }}
              >
                {m.invariant}
              </div>
            </Section>

            <Section label="What it costs">
              <CostTable head={m.costHead} rows={m.cost} />
            </Section>

            <Section label="C++">
              <Code>{m.code}</Code>
            </Section>

            <Section label="Where people lose points" accent={C.rust}>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 14.3,
                  lineHeight: 1.62,
                }}
              >
                {m.traps.map((t, k) => (
                  <li key={k} style={{ marginBottom: 5 }}>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>

            {track === 'mle' && (
              <Section label="Where this shows up in ML" accent={C.violet}>
                <div
                  style={{
                    background: '#efecf6',
                    border: '1px solid #cec6e2',
                    borderRadius: 3,
                    padding: '12px 14px',
                    fontSize: 14.5,
                    lineHeight: 1.6,
                  }}
                >
                  {m.ml}
                </div>
              </Section>
            )}

            <Section label="Drill these">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {m.probs.map((p) => (
                  <span
                    key={p}
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      padding: '5px 9px',
                      borderRadius: 2,
                      border: `1px solid ${C.line}`,
                      background: C.card,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Section>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 34,
                gap: 10,
              }}
            >
              <Btn onClick={() => go(Math.max(0, sel - 1))} wide>
                ← {sel > 0 ? MODULES[sel - 1].n : 'start'}
              </Btn>
              <Btn onClick={() => go(Math.min(MODULES.length - 1, sel + 1))} wide>
                {sel < MODULES.length - 1 ? MODULES[sel + 1].n : 'end'} →
              </Btn>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
