import { LANGS, useLang, setLang } from '../prefs.js'

/* One switch, read by every page that shows code. */
export default function LangToggle() {
  const lang = useLang()

  return (
    <div className="lang-toggle" role="group" aria-label="Code language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          className={lang === l.id ? 'on' : ''}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
