import { useState, useMemo } from 'react'
import { topics, categories } from '../data/dsaTopics.js'

function Topic({ topic, open, onToggle }) {
  return (
    <article className={`day${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="day-head"
        aria-expanded={open}
        onClick={() => onToggle(open ? null : topic.id)}
      >
        <span className="day-title">{topic.name}</span>
        <span className="day-meta">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="day-body">
          <p style={{ fontSize: '15px', margin: '14px 0' }}>{topic.idea}</p>

          <p className="day-focus">
            <strong>Reach for it when: </strong>
            {topic.signal}
          </p>

          <p className="subhead">Costs</p>
          <div className="table-wrap">
            <table>
              <tbody>
                {topic.costs.map(([what, cost]) => (
                  <tr key={what}>
                    <td>{what}</td>
                    <td>
                      <code>{cost}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="subhead">Patterns</p>
          <ul className="bullets">
            {topic.patterns.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <p className="subhead">Where people go wrong</p>
          <ul className="bullets">
            {topic.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <p className="subhead">C++</p>
          <pre>
            <code>{topic.code}</code>
          </pre>
        </div>
      )}
    </article>
  )
}

export default function DsaReference() {
  const [cat, setCat] = useState('all')
  const [open, setOpen] = useState(topics[0].id)
  const [query, setQuery] = useState('')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return topics.filter((t) => {
      if (cat !== 'all' && t.cat !== cat) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.idea.toLowerCase().includes(q) ||
        t.signal.toLowerCase().includes(q)
      )
    })
  }, [cat, query])

  return (
    <main className="page">
      <header className="page-header">
        <p className="page-eyebrow">Reference</p>
        <h1>DSA explained</h1>
        <p className="page-lede">
          Every core data structure and algorithm in one place: the idea in
          plain words, the phrase in a problem statement that should make you
          reach for it, the real costs, the patterns built on top of it, and
          the mistakes that cost people offers.
        </p>
      </header>

      <div className="toolbar">
        <div className="seg" role="group" aria-label="Category">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cat === c.id ? 'is-on' : ''}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <input
          className="btn"
          type="search"
          placeholder="Search topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: '200px' }}
        />

        <span className="spacer" />
        <span className="section-note" style={{ margin: 0 }}>
          {shown.length} of {topics.length}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="section-note">Nothing matches that search.</p>
      ) : (
        shown.map((topic) => (
          <Topic
            key={topic.id}
            topic={topic}
            open={open === topic.id}
            onToggle={setOpen}
          />
        ))
      )}
    </main>
  )
}
