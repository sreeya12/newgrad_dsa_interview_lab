import { useState, useMemo, useRef, useEffect } from 'react'
import { C, mono, sans, disp } from './dsalab/tokens.js'
import { Btn, Pick, Section, CostTable, Code } from './dsalab/ui.jsx'
import { MODULES } from './dsalab/modules.jsx'
import { MODULES_ML } from './dsalab/mlModules.jsx'
import { MODULE_CODE_PY } from './dsalab/modulesPy.js'
import MlDepth from './dsalab/mlDepthView.jsx'
import { useLang } from '../prefs.js'
import { useLocalStorage } from '../useLocalStorage.js'
import './dsalab/lab.css'

/* ==================================================================
   DS&A LAB BENCH — companion to the 45-day plan
   Every module: trace -> invariant -> cost -> C++ -> traps -> problems
   ================================================================== */

export default function DsaExplained() {
  const lang = useLang()
  const [sel, setSel] = useState(0)
  const [track, setTrack] = useLocalStorage('dsa.track', 'sde')
  const [known, setKnown] = useLocalStorage('dsa.lab.known', {})
  const [railOpen, setRailOpen] = useState(false)
  const topRef = useRef(null)
  const paneRef = useRef(null)

  // The MLE track appends the ML-native modules to the same rail.
  const all = useMemo(
    () => (track === 'mle' ? [...MODULES, ...MODULES_ML] : MODULES),
    [track],
  )
  // Switching track shrinks the list, so clamp once and use idx everywhere:
  // reading all[sel - 1] with a stale sel is what blanked the page.
  const idx = Math.min(sel, all.length - 1)
  const m = all[idx]

  const groups = useMemo(() => {
    const g = []
    all.forEach((mod, i) => {
      let last = g[g.length - 1]
      if (!last || last.name !== mod.g) {
        last = { name: mod.g, items: [] }
        g.push(last)
      }
      last.items.push({ n: mod.n, i })
    })
    return g
  }, [all])

  const doneCount = Object.values(known).filter(Boolean).length

  const wantScroll = useRef(false)

  const go = (i) => {
    wantScroll.current = true
    setSel(i)
    setRailOpen(false)
  }

  // Scroll after the commit, not inside go(): closing the picker removes up
  // to 60vh of list, so scrolling first lands you well past the heading.
  // On desktop the rail sits beside the masthead and scrolling there shows
  // both; on a phone the masthead is a screenful you would only scroll past
  // again, so land on the module itself.
  useEffect(() => {
    if (!wantScroll.current) return
    wantScroll.current = false
    const narrow = window.matchMedia('(max-width: 880px)').matches
    const target = (narrow ? paneRef : topRef).current
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [idx, railOpen])

  return (
    <div
      style={{
        color: C.ink,
        fontFamily: sans,
        textAlign: 'left',
        flexGrow: 1,
      }}
    >
      <div className="lab-bench">
        {/* masthead */}
        <header
          ref={topRef}
          className="mast"
          style={{
            padding: '36px 0 22px',
            borderBottom: `2px solid ${C.ink}`,
            scrollMarginTop: 'calc(var(--nav-h) + 8px)',
          }}
        >
          <div
            className="masthead-row"
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
                {all.length} modules, each one a machine you can run. Step the
                tape, watch the state change, then read the invariant that makes
                it correct and the {lang === 'py' ? 'Python' : 'C++'} beside it.
              </p>
            </div>
            <div
              className="trackpick"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
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

        <div className="cols">
          {/* rail — a sticky sidebar on desktop, a collapsed picker on a phone */}
          <nav className={`rail${railOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="railtoggle"
              aria-expanded={railOpen}
              onClick={() => setRailOpen((o) => !o)}
            >
              <span className="rt-n">{String(idx + 1).padStart(2, '0')}</span>
              <span className="rt-name">{m.n}</span>
              <span className="rt-meta">
                {doneCount}/{all.length}
              </span>
              <span className="rt-chev" aria-hidden="true">
                ▸
              </span>
            </button>

            <div className="raillist">
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: C.mute,
                  marginBottom: 10,
                }}
              >
                {doneCount} / {all.length} marked solid
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
                    const on = it.i === idx
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
                        <span
                          style={{ fontSize: 13.5, lineHeight: 1.35, flex: 1 }}
                        >
                          {it.n}
                        </span>
                        {known[it.i] && (
                          <span
                            style={{
                              color: on ? C.paper : C.teal,
                              fontSize: 12,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* main */}
          <main className="pane" ref={paneRef}>
            <div className="modhead">
              <div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: C.rust,
                    letterSpacing: '0.1em',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')} · {m.days}
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
                onClick={() => setKnown({ ...known, [idx]: !known[idx] })}
                active={!!known[idx]}
              >
                {known[idx] ? '✓ solid' : 'mark solid'}
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

            <Section label={lang === 'py' ? 'Python' : 'C++'}>
              <Code>
                {(lang === 'py' && (m.codePy || MODULE_CODE_PY[m.n])) || m.code}
              </Code>
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

            {track === 'mle' && <MlDepth name={m.n} lang={lang} />}

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

            <div className="stepnav">
              <Btn onClick={() => go(Math.max(0, idx - 1))} wide>
                ← {idx > 0 ? all[idx - 1].n : 'start'}
              </Btn>
              <Btn onClick={() => go(Math.min(all.length - 1, idx + 1))} wide>
                {idx < all.length - 1 ? all[idx + 1].n : 'end'} →
              </Btn>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
