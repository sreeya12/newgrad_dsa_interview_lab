// Design tokens for the DS&A Lab Bench.
// These now mirror the app-wide palette in index.css so the lab reads as part
// of the same log rather than a separate tool. The state fills (active / done /
// queued / probe) stay high-contrast against the paper background.

export const C = {
  ink: '#16233a',
  paper: '#edf0f3',
  card: '#fbfcfd',
  line: '#c6d1dc',
  rust: '#b8433a',
  teal: '#127b63',
  amber: '#b07a18',
  violet: '#4b3f7a',
  mute: '#4a5a72',
}

export const STATE_FILL = {
  idle: { bg: '#fbfcfd', fg: C.ink, bd: C.line },
  active: { bg: C.rust, fg: '#fff', bd: C.rust },
  done: { bg: C.teal, fg: '#fff', bd: C.teal },
  queued: { bg: '#f4e3c0', fg: C.ink, bd: C.amber },
  probe: { bg: C.violet, fg: '#fff', bd: C.violet },
  win: { bg: '#d7e8e4', fg: C.ink, bd: C.teal },
  dim: { bg: '#e6ebf0', fg: '#9aa8ba', bd: '#dce3ea' },
}

export const mono =
  '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
export const sans =
  '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, sans-serif'
export const disp = '"Space Grotesk", "IBM Plex Sans", ui-sans-serif, sans-serif'
