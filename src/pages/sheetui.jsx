/* Shared building blocks for the printable reference sheets.
   Used by both CppCheatSheet and PythonCheatSheet. */

/* `backticks` in the content become <code> spans. */
export function Rich({ text }) {
  return text
    .split('`')
    .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>))
}

/* Cost chips, plain text and line breaks inside one table cell. */
export function Cell({ items }) {
  return items.map((it, i) => {
    if (it.br) return <br key={i} />
    if (it.c)
      return (
        <span key={i} className={`chip ${it.k}`} style={i ? { marginLeft: 3 } : undefined}>
          {it.c}
        </span>
      )
    return (
      <span key={i}>
        {i ? ' ' : ''}
        {it.t}
      </span>
    )
  })
}

/* Dim everything after a comment marker, so comments read as annotations. */
export function Code({ children, comment = '//' }) {
  return (
    <pre>
      {children.split('\n').map((line, i) => {
        const at = line.indexOf(comment)
        return (
          <span key={i}>
            {at === -1 ? (
              line
            ) : (
              <>
                {line.slice(0, at)}
                <span className="cm">{line.slice(at)}</span>
              </>
            )}
            {'\n'}
          </span>
        )
      })}
    </pre>
  )
}

export function Sheet({ title, n, of = 4, foot, children }) {
  return (
    <section className="sheet">
      <div className="sheethead">
        <h1>{title}</h1>
        <span className="pg">
          Sheet {n} of {of}
        </span>
      </div>
      {children}
      <div className="foot">
        <span>{foot}</span>
        <span>
          Sheet {n} — {title}
        </span>
      </div>
    </section>
  )
}
