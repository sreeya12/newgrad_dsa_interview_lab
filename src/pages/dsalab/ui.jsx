import { useId, useRef, useEffect, useMemo } from 'react'
import { C, STATE_FILL, mono, sans } from './tokens.js'
import { useLang, pick } from '../../prefs.js'

/* ---------------- transport ---------------- */

export function Btn({ children, onClick, wide, active, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        fontFamily: mono,
        fontSize: 12,
        letterSpacing: '0.02em',
        padding: wide ? '6px 14px' : '6px 10px',
        background: active ? C.ink : 'transparent',
        color: active ? C.paper : C.ink,
        border: `1px solid ${active ? C.ink : C.line}`,
        borderRadius: 2,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export function Tape({ tape }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginTop: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn onClick={tape.reset} title="back to start">
          |◀
        </Btn>
        <Btn onClick={() => tape.step(-1)} title="step back">
          ◀
        </Btn>
        <Btn onClick={tape.toggle} wide active={tape.playing}>
          {tape.playing ? 'pause' : 'play'}
        </Btn>
        <Btn onClick={() => tape.step(1)} title="step forward">
          ▶
        </Btn>
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 140,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-end',
          height: 22,
        }}
      >
        {Array.from({ length: tape.n }).map((_, k) => (
          <div
            key={k}
            onClick={() => tape.set(k)}
            title={'step ' + (k + 1)}
            style={{
              flex: 1,
              minWidth: 2,
              height: k === tape.i ? 20 : 9,
              cursor: 'pointer',
              background:
                k === tape.i ? C.rust : k < tape.i ? '#9fb0c4' : '#dce3ea',
            }}
          />
        ))}
      </div>

      <span
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: C.mute,
          whiteSpace: 'nowrap',
        }}
      >
        {String(tape.i + 1).padStart(2, '0')} /{' '}
        {String(tape.n).padStart(2, '0')}
      </span>
    </div>
  )
}

/* ---------------- trace: the code the tape is walking ---------------- */

export function TraceCode({ code, active }) {
  const boxRef = useRef(null)
  const lines = useMemo(() => code.replace(/\s+$/, '').split('\n'), [code])

  const hot = Array.isArray(active) ? active : active ? [active] : []
  const hotSet = new Set(hot)
  const key = hot.join(',')

  // Keep the highlighted line visible without ever scrolling the page:
  // set the container's own scrollTop rather than calling scrollIntoView.
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const el = box.querySelector('[data-hot="1"]')
    if (!el) return
    const target = el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2
    box.scrollTop = Math.max(0, Math.min(target, box.scrollHeight - box.clientHeight))
  }, [key])

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.mute,
          marginBottom: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>The code, at this step</span>
        <span style={{ flex: 1, height: 1, background: C.line }} />
        <span style={{ letterSpacing: '0.06em' }}>
          {hot.length ? `line ${hot.join('–')}` : '—'}
        </span>
      </div>

      <div
        ref={boxRef}
        style={{
          background: '#1b2536',
          borderRadius: 3,
          padding: '10px 0',
          maxHeight: 260,
          overflow: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        {lines.map((ln, i) => {
          const on = hotSet.has(i + 1)
          return (
            <div
              key={i}
              data-line={i + 1}
              data-hot={on ? '1' : undefined}
              style={{
                display: 'flex',
                gap: 12,
                padding: '1px 14px 1px 0',
                background: on ? 'rgba(184, 67, 58, 0.30)' : 'transparent',
                borderLeft: `3px solid ${on ? C.rust : 'transparent'}`,
                transition: 'background 0.15s',
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11.5,
                  lineHeight: '19px',
                  color: on ? '#f0c9c4' : '#5d6f88',
                  width: 26,
                  textAlign: 'right',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12.3,
                  lineHeight: '19px',
                  color: on ? '#fff' : '#c8d3e0',
                  whiteSpace: 'pre',
                }}
              >
                {ln || ' '}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- lab frame wrapper ---------------- */

export function Lab({ tape, controls, children, vars, trace }) {
  const lang = useLang()
  const f = tape.frame || {}
  const v = vars ? vars(f) : f.vars
  const tr = pick(trace, lang)

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        background: C.card,
        borderRadius: 3,
        padding: '16px 16px 14px',
      }}
    >
      {controls && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 14,
            alignItems: 'center',
          }}
        >
          {controls}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>{children}</div>

      <div
        style={{
          marginTop: 14,
          borderTop: `1px dashed ${C.line}`,
          paddingTop: 10,
        }}
      >
        <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{f.note}</div>
        {v && Object.keys(v).length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              marginTop: 8,
            }}
          >
            {Object.entries(v).map(([k, val]) => (
              <span
                key={k}
                style={{ fontFamily: mono, fontSize: 11.5, color: C.mute }}
              >
                {k} = <b style={{ color: C.ink }}>{String(val)}</b>
              </span>
            ))}
          </div>
        )}
      </div>

      {tr && <TraceCode code={tr.code} active={tr.line(f)} />}

      <Tape tape={tape} />
    </div>
  )
}

/* ---------------- renderer: array row ---------------- */

export function Cell({ v, state = 'idle', sub, w = 46, h = 40, small }) {
  const s = STATE_FILL[state] || STATE_FILL.idle
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: s.bg,
          color: s.fg,
          border: `1.5px solid ${s.bd}`,
          borderRadius: 2,
          fontFamily: mono,
          fontSize: small ? 12 : 14.5,
          fontWeight: 500,
        }}
      >
        {v}
      </div>
      <div
        style={{ fontFamily: mono, fontSize: 10, color: C.mute, height: 12 }}
      >
        {sub}
      </div>
    </div>
  )
}

export function ArrayRow({ vals, states = {}, subs = {}, w = 46, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {label && (
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: C.mute,
            paddingTop: 12,
            minWidth: 44,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        {vals.map((v, i) => (
          <Cell
            key={i}
            v={v}
            w={w}
            state={states[i] || 'idle'}
            sub={subs[i] !== undefined ? subs[i] : i}
          />
        ))}
      </div>
    </div>
  )
}

/* ---------------- renderer: node diagram ---------------- */

export function Diagram({ nodes, edges = [], w = 620, h = 260, r = 18, directed }) {
  // Marker ids must be unique per instance or a second diagram on the page
  // silently reuses the first one's arrowheads.
  const uid = useId().replace(/:/g, '')
  const mPlain = `ar-${uid}`
  const mActive = `arA-${uid}`

  const pos = {}
  nodes.forEach((n) => {
    pos[n.id] = n
  })

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: '100%', maxWidth: w, height: 'auto', overflow: 'visible' }}
    >
      <defs>
        <marker
          id={mPlain}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={C.mute} />
        </marker>
        <marker
          id={mActive}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={C.rust} />
        </marker>
      </defs>

      {edges.map((e, k) => {
        const a = pos[e.a]
        const b = pos[e.b]
        if (!a || !b) return null
        const on = e.state === 'active'
        const dx = b.x - a.x
        const dy = b.y - a.y
        const L = Math.hypot(dx, dy) || 1
        const pad = r + (directed ? 7 : 2)
        const x1 = a.x + (dx / L) * (r + 2)
        const y1 = a.y + (dy / L) * (r + 2)
        const x2 = b.x - (dx / L) * pad
        const y2 = b.y - (dy / L) * pad
        const d = e.curve
          ? `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - (e.curve > 0 ? 52 : -52)} ${x2} ${y2}`
          : `M ${x1} ${y1} L ${x2} ${y2}`
        return (
          <g key={k}>
            <path
              d={d}
              fill="none"
              stroke={on ? C.rust : e.state === 'dim' ? '#e2ddd0' : C.mute}
              strokeWidth={on ? 2.4 : 1.3}
              markerEnd={
                directed
                  ? on
                    ? `url(#${mActive})`
                    : `url(#${mPlain})`
                  : undefined
              }
            />
            {e.label !== undefined && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 6}
                textAnchor="middle"
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fill: on ? C.rust : C.mute,
                }}
              >
                {e.label}
              </text>
            )}
          </g>
        )
      })}

      {nodes.map((n) => {
        const s = STATE_FILL[n.state || 'idle']
        return (
          <g key={n.id}>
            {n.shape === 'box' ? (
              <rect
                x={n.x - r - 6}
                y={n.y - r + 3}
                width={(r + 6) * 2}
                height={(r - 3) * 2}
                rx={2}
                fill={s.bg}
                stroke={s.bd}
                strokeWidth="1.5"
              />
            ) : (
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={s.bg}
                stroke={s.bd}
                strokeWidth="1.5"
              />
            )}
            <text
              x={n.x}
              y={n.y + 4.5}
              textAnchor="middle"
              style={{ fontFamily: mono, fontSize: 13, fill: s.fg }}
            >
              {n.label}
            </text>
            {n.tag && (
              <text
                x={n.x}
                y={n.y + r + 14}
                textAnchor="middle"
                style={{ fontFamily: mono, fontSize: 10, fill: C.mute }}
              >
                {n.tag}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------------- renderer: grid ---------------- */

export function GridView({ grid, states = {}, cell = 34, labels = {} }) {
  return (
    <div style={{ display: 'inline-block' }}>
      {grid.map((row, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {row.map((v, c) => {
            const key = r + ',' + c
            const s = STATE_FILL[states[key] || (v === 1 ? 'dim' : 'idle')]
            return (
              <div
                key={c}
                style={{
                  width: cell,
                  height: cell,
                  border: `1px solid ${C.line}`,
                  margin: 1,
                  background: v === 1 ? '#3d3a33' : s.bg,
                  color: s.fg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: mono,
                  fontSize: 11,
                }}
              >
                {v === 1 ? '' : labels[key] !== undefined ? labels[key] : ''}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ---------------- renderer: dp table ---------------- */

export function TableView({ colHead, rowHead, cells, states = {}, cw = 44 }) {
  return (
    <table style={{ borderCollapse: 'collapse', fontFamily: mono, fontSize: 12.5 }}>
      <tbody>
        <tr>
          <td style={{ width: cw }} />
          {colHead.map((h, c) => (
            <td
              key={c}
              style={{
                width: cw,
                textAlign: 'center',
                color: C.mute,
                fontSize: 11,
                paddingBottom: 3,
              }}
            >
              {h}
            </td>
          ))}
        </tr>
        {cells.map((row, r) => (
          <tr key={r}>
            <td
              style={{
                textAlign: 'center',
                color: C.mute,
                fontSize: 11,
                paddingRight: 4,
              }}
            >
              {rowHead[r]}
            </td>
            {row.map((v, c) => {
              const s = STATE_FILL[states[r + ',' + c] || 'idle']
              return (
                <td
                  key={c}
                  style={{
                    width: cw,
                    height: 30,
                    textAlign: 'center',
                    border: `1px solid ${s.bd}`,
                    background: s.bg,
                    color: s.fg,
                  }}
                >
                  {v === Infinity ? '∞' : v}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ---------------- small pieces ---------------- */

export function Chips({ items, title }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: 30,
      }}
    >
      {title && (
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: C.mute,
            minWidth: 44,
          }}
        >
          {title}
        </span>
      )}
      {items.length === 0 && (
        <span style={{ fontFamily: mono, fontSize: 11.5, color: '#b3ac9e' }}>
          empty
        </span>
      )}
      {items.map((it, k) => {
        const s = STATE_FILL[it.state || 'idle']
        return (
          <span
            key={k}
            style={{
              fontFamily: mono,
              fontSize: 11.5,
              padding: '4px 8px',
              borderRadius: 2,
              background: s.bg,
              color: s.fg,
              border: `1px solid ${s.bd}`,
            }}
          >
            {it.t}
          </span>
        )
      })}
    </div>
  )
}

export function Pick({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {label && (
        <span style={{ fontFamily: mono, fontSize: 11, color: C.mute }}>
          {label}
        </span>
      )}
      {options.map((o) => {
        const val = typeof o === 'object' ? o.v : o
        const txt = typeof o === 'object' ? o.t : o
        return (
          <Btn key={String(val)} onClick={() => onChange(val)} active={value === val}>
            {txt}
          </Btn>
        )
      })}
    </div>
  )
}

/* ---------------- page furniture ---------------- */

export function Section({ label, children, accent }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: accent || C.mute,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>{label}</span>
        <span style={{ flex: 1, height: 1, background: C.line }} />
      </div>
      {children}
    </div>
  )
}

export function CostTable({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  fontFamily: mono,
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: C.mute,
                  fontWeight: 400,
                  padding: '0 14px 6px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k} style={{ borderTop: `1px solid ${C.line}` }}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '7px 14px 7px 0',
                    verticalAlign: 'top',
                    fontFamily: j === 1 ? mono : sans,
                    color: j === 1 ? C.rust : j === 2 ? C.mute : C.ink,
                    whiteSpace: j === 1 ? 'nowrap' : 'normal',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Code({ children }) {
  return (
    <pre
      style={{
        fontFamily: mono,
        fontSize: 12.3,
        lineHeight: 1.62,
        margin: 0,
        padding: '14px 16px',
        background: '#1d2126',
        color: '#e8e3d6',
        borderRadius: 3,
        overflowX: 'auto',
        whiteSpace: 'pre',
        tabSize: 4,
      }}
    >
      {children}
    </pre>
  )
}
