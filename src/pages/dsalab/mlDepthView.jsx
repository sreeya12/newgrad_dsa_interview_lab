import { C, mono } from './tokens.js'
import { Section, CostTable, Code } from './ui.jsx'
import { ML_DEPTH } from './mlDepth.js'

/* The MLE-track depth block that hangs under "Where this shows up in ML".
   Additive: modules with no entry (the ML-native ones, which already carry
   their own cost/code/traps) render exactly as before.

   The code here is Python on purpose and does not follow the global toggle:
   feature pipelines, training loops and eval scripts are Python in every shop
   you would interview at, so a C++ transliteration would teach the wrong
   thing. The note below says so rather than leaving it looking like a bug. */

export default function MlDepth({ name, lang }) {
  const d = ML_DEPTH[name]
  if (!d) return null
  const code = (lang === 'py' && d.codePy) || d.code

  return (
    <>
      <Section label="What it costs in ML" accent={C.violet}>
        <CostTable head={d.costHead} rows={d.cost} />
      </Section>

      <Section label="In an ML codebase" accent={C.violet}>
        <Code>{code}</Code>
        {lang !== 'py' && (
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: C.mute,
              marginTop: 6,
            }}
          >
            Python regardless of the toggle — this layer is Python everywhere.
          </div>
        )}
      </Section>

      <Section label="Where this breaks in production" accent={C.violet}>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            fontSize: 14.3,
            lineHeight: 1.62,
          }}
        >
          {d.traps.map((t, k) => (
            <li key={k} style={{ marginBottom: 5 }}>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="ML drills" accent={C.violet}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {d.probs.map((p) => (
            <span
              key={p}
              style={{
                fontFamily: mono,
                fontSize: 12,
                padding: '5px 9px',
                borderRadius: 2,
                border: `1px solid #cec6e2`,
                background: '#efecf6',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </Section>
    </>
  )
}
