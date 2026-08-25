import { useState, useMemo } from 'react'
import { C, mono } from './tokens.js'
import { useTape } from './useTape.js'
import { TRACES } from './traces.js'
import {
  Lab,
  ArrayRow,
  Diagram,
  GridView,
  TableView,
  Chips,
  Pick,
} from './ui.jsx'

/* ==================================================================
   GROUP A — foundations
   ================================================================== */

/* --- 01 cost model --- */

const GROWTH = [
  { k: 'O(1)', f: () => 1, c: C.teal },
  { k: 'O(log n)', f: (n) => Math.log2(n), c: '#2f8f86' },
  { k: 'O(n)', f: (n) => n, c: C.amber },
  { k: 'O(n log n)', f: (n) => n * Math.log2(n), c: '#d0761a' },
  { k: 'O(n²)', f: (n) => n * n, c: C.rust },
  { k: 'O(2ⁿ)', f: (n) => Math.pow(2, Math.min(n, 60)), c: C.violet },
]

function fmt(x) {
  if (x < 1000) return String(Math.round(x))
  const u = [
    ['e18', 1e18],
    ['e15', 1e15],
    ['e12', 1e12],
    ['e9', 1e9],
    ['e6', 1e6],
    ['e3', 1e3],
  ]
  for (const [s, d] of u) if (x >= d) return (x / d).toFixed(1) + s
  return String(Math.round(x))
}

export function LabCost() {
  const [n, setN] = useState(1000)
  const W = 620,
    H = 200,
    pad = 28
  const xs = []
  for (let e = 0; e <= 24; e++) xs.push(Math.pow(2, e * (Math.log2(1e6) / 24)))
  const yMax = Math.log10(1e12)
  const px = (v) => pad + (Math.log10(v) / 6) * (W - pad * 2)
  const py = (v) =>
    H - pad - (Math.min(Math.log10(Math.max(v, 1)), yMax) / yMax) * (H - pad * 2)

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        background: C.card,
        borderRadius: 3,
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 11, color: C.mute }}>
          n = {n.toLocaleString()}
        </span>
        <input
          type="range"
          min={1}
          max={600}
          value={Math.round(Math.log10(n) * 100)}
          onChange={(e) =>
            setN(Math.max(1, Math.round(Math.pow(10, e.target.value / 100))))
          }
          style={{ flex: 1, minWidth: 180, accentColor: C.rust }}
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={C.line} />
        <line x1={pad} y1={pad - 10} x2={pad} y2={H - pad} stroke={C.line} />
        <text x={pad} y={H - 8} style={{ fontFamily: mono, fontSize: 9, fill: C.mute }}>
          n=1
        </text>
        <text
          x={W - pad - 24}
          y={H - 8}
          style={{ fontFamily: mono, fontSize: 9, fill: C.mute }}
        >
          10⁶
        </text>
        <text x={4} y={pad - 2} style={{ fontFamily: mono, fontSize: 9, fill: C.mute }}>
          10¹²
        </text>
        <line
          x1={px(n)}
          y1={pad - 10}
          x2={px(n)}
          y2={H - pad}
          stroke={C.rust}
          strokeDasharray="3 3"
        />
        <line
          x1={pad}
          y1={py(1e8)}
          x2={W - pad}
          y2={py(1e8)}
          stroke="#c9c2b2"
          strokeDasharray="2 4"
        />
        <text
          x={W - pad - 96}
          y={py(1e8) - 4}
          style={{ fontFamily: mono, fontSize: 9, fill: C.mute }}
        >
          ~1s of compute
        </text>
        {GROWTH.map((g) => (
          <path
            key={g.k}
            fill="none"
            stroke={g.c}
            strokeWidth="1.8"
            d={xs.map((x, i) => `${i ? 'L' : 'M'} ${px(x)} ${py(g.f(x))}`).join(' ')}
          />
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        {GROWTH.map((g) => (
          <span
            key={g.k}
            style={{
              fontFamily: mono,
              fontSize: 11.5,
              color: C.ink,
              display: 'flex',
              gap: 5,
              alignItems: 'center',
            }}
          >
            <i style={{ width: 12, height: 3, background: g.c, display: 'inline-block' }} />
            {g.k} → <b>{fmt(g.f(n))}</b>
          </span>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
        The dashed horizontal line is roughly what a judge machine does in a
        second (~10⁸ simple operations). Any curve above it at your n is a
        solution you should not be writing.
      </div>
    </div>
  )
}

/* --- 02 hashing --- */

function twoSumFrames(a, target) {
  const f = [],
    m = {}
  f.push({
    i: -1,
    map: {},
    note: `Find i < j with a[i] + a[j] = ${target}. The brute force is two nested loops, O(n²). The map turns the inner loop into one lookup.`,
    vars: { target },
  })
  for (let i = 0; i < a.length; i++) {
    const need = target - a[i]
    const hit = m[need] !== undefined
    f.push({
      i,
      map: { ...m },
      probe: need,
      hit,
      note: `At index ${i}, value ${a[i]}. The partner I need is ${need}. Ask the map: is ${need} in there? ${hit ? 'Yes.' : 'No.'}`,
      vars: { i, need, found: hit ? 'index ' + m[need] : '—' },
    })
    if (hit) {
      f.push({
        i,
        map: { ...m },
        probe: need,
        hit: true,
        done: [m[need], i],
        note: `Answer [${m[need]}, ${i}]. One pass over the array, every lookup O(1) average.`,
        vars: { answer: `[${m[need]}, ${i}]` },
      })
      break
    }
    m[a[i]] = i
    f.push({
      i,
      map: { ...m },
      note: `Not there yet — so record ${a[i]} → ${i}. Every value becomes a candidate partner for the indices that come after it.`,
      vars: { 'map.size': Object.keys(m).length },
    })
  }
  return f
}

const HASH_A = [2, 7, 11, 15, 3, 6]

export function LabHash() {
  const [target, setTarget] = useState(21)
  const frames = useMemo(() => twoSumFrames(HASH_A, target), [target])
  const t = useTape(frames)
  const f = t.frame
  const st = {}
  if (f.i >= 0) st[f.i] = 'active'
  if (f.done) {
    st[f.done[0]] = 'done'
    st[f.done[1]] = 'done'
  }

  return (
    <Lab
      tape={t}
      trace={TRACES.hash}
      controls={
        <Pick
          label="target"
          value={target}
          onChange={setTarget}
          options={[9, 13, 21, 8]}
        />
      }
    >
      <ArrayRow vals={HASH_A} states={st} label="a" />
      <div style={{ marginTop: 12 }}>
        <Chips
          title="map"
          items={Object.entries(f.map || {}).map(([k, v]) => ({
            t: `${k} → ${v}`,
            state:
              f.probe !== undefined && Number(k) === f.probe
                ? f.hit
                  ? 'done'
                  : 'idle'
                : 'idle',
          }))}
        />
      </div>
      {f.probe !== undefined && (
        <div style={{ marginTop: 6 }}>
          <Chips
            title="probe"
            items={[{ t: `find(${f.probe})`, state: f.hit ? 'done' : 'probe' }]}
          />
        </div>
      )}
    </Lab>
  )
}

/* --- 03 two pointers --- */

function twoPtrFrames(a, t) {
  let l = 0,
    r = a.length - 1
  const f = []
  f.push({
    l,
    r,
    note: `The array is sorted — that is the whole permission slip. Start wide: l at the smallest, r at the largest.`,
    vars: { target: t },
  })
  while (l < r) {
    const s = a[l] + a[r]
    f.push({
      l,
      r,
      sum: s,
      hit: s === t,
      lt: s < t,
      note:
        s === t
          ? `${a[l]} + ${a[r]} = ${s}. Found it.`
          : s < t
            ? `${a[l]} + ${a[r]} = ${s} < ${t}. a[l] is too small to pair with anything at or below a[r], so it is dead — l++ is the only move that can raise the sum.`
            : `${a[l]} + ${a[r]} = ${s} > ${t}. a[r] is too big for any remaining l, so discard it: r--.`,
      vars: { l, r, sum: s },
    })
    if (s === t) break
    if (s < t) l++
    else r--
  }
  return f
}

const TP_A = [-4, -1, 0, 3, 5, 8, 11, 14]

export function LabTwoPtr() {
  const [target, setTarget] = useState(11)
  const frames = useMemo(() => twoPtrFrames(TP_A, target), [target])
  const t = useTape(frames)
  const f = t.frame,
    st = {},
    sub = {}
  TP_A.forEach((_, i) => {
    if (i < f.l || i > f.r) st[i] = 'dim'
  })
  st[f.l] = f.sum === target ? 'done' : 'active'
  st[f.r] = f.sum === target ? 'done' : 'active'
  sub[f.l] = 'l'
  sub[f.r] = 'r'

  return (
    <Lab
      tape={t}
      trace={TRACES.twoPtr}
      controls={
        <Pick
          label="target"
          value={target}
          onChange={setTarget}
          options={[11, 4, 25, 7]}
        />
      }
    >
      <ArrayRow vals={TP_A} states={st} subs={sub} label="sorted" />
    </Lab>
  )
}

/* --- 04 sliding window --- */

function windowFrames(s) {
  const f = [],
    last = {}
  let l = 0,
    best = 0,
    bi = [0, 0]
  f.push({
    l: 0,
    r: -1,
    best: 0,
    bi: [0, 0],
    note: `Grow r one character at a time. Only shrink from the left when the window breaks the rule ("all characters distinct").`,
    vars: {},
  })
  for (let r = 0; r < s.length; r++) {
    const c = s[r]
    if (last[c] !== undefined && last[c] >= l) {
      const nl = last[c] + 1
      f.push({
        l,
        r,
        best,
        bi: [...bi],
        bad: last[c],
        note: `'${c}' is already inside the window at index ${last[c]}. Jump l straight to ${nl} — l never moves backwards, which is why this is O(n) and not O(n²).`,
        vars: { l, r, violation: c },
      })
      l = nl
    }
    last[c] = r
    const len = r - l + 1
    if (len > best) {
      best = len
      bi = [l, r]
    }
    f.push({
      l,
      r,
      best,
      bi: [...bi],
      note: `Window "${s.slice(l, r + 1)}" is valid, length ${len}. Best so far ${best} ("${s.slice(bi[0], bi[1] + 1)}").`,
      vars: { l, r, len, best },
    })
  }
  return f
}

export function LabWindow() {
  const [s, setS] = useState('abcabcbb')
  const frames = useMemo(() => windowFrames(s), [s])
  const t = useTape(frames)
  const f = t.frame,
    st = {},
    sub = {}
  s.split('').forEach((_, i) => {
    if (i >= f.l && i <= f.r) st[i] = 'win'
    if (i < f.l) st[i] = 'dim'
  })
  if (f.bad !== undefined) st[f.bad] = 'probe'
  if (f.r >= 0) st[f.r] = 'active'
  sub[f.l] = 'l'
  if (f.r >= 0) sub[f.r] = 'r'

  return (
    <Lab
      tape={t}
      trace={TRACES.window}
      controls={
        <Pick
          label="input"
          value={s}
          onChange={setS}
          options={['abcabcbb', 'pwwkew', 'tmmzuxt']}
        />
      }
    >
      <ArrayRow vals={s.split('')} states={st} subs={sub} w={38} label="s" />
    </Lab>
  )
}

/* --- 05 prefix sums --- */

function prefixFrames(a, q) {
  const f = [],
    p = [0]
  f.push({
    p: [...p],
    phase: 'build',
    note: `p[0] = 0 always. p[i] will hold the sum of the first i elements.`,
    vars: {},
  })
  for (let i = 0; i < a.length; i++) {
    p.push(p[i] + a[i])
    f.push({
      p: [...p],
      i,
      phase: 'build',
      note: `p[${i + 1}] = p[${i}] + a[${i}] = ${p[i]} + ${a[i]} = ${p[i + 1]}.`,
      vars: { ['p[' + (i + 1) + ']']: p[i + 1] },
    })
  }
  f.push({
    p: [...p],
    phase: 'query',
    ql: q[0],
    qr: q[1],
    note: `Now any range sum is one subtraction. sum(a[${q[0]}..${q[1]}]) = p[${q[1] + 1}] − p[${q[0]}] = ${p[q[1] + 1]} − ${p[q[0]]} = ${p[q[1] + 1] - p[q[0]]}. O(1) per query after O(n) setup.`,
    vars: { answer: p[q[1] + 1] - p[q[0]] },
  })
  return f
}

const PRE_A = [3, -1, 4, 1, -5, 9, 2]

export function LabPrefix() {
  const [q, setQ] = useState('2,5')
  const frames = useMemo(
    () => prefixFrames(PRE_A, q.split(',').map(Number)),
    [q],
  )
  const t = useTape(frames)
  const f = t.frame,
    sa = {},
    sp = {}
  if (f.phase === 'build' && f.i !== undefined) {
    sa[f.i] = 'active'
    sp[f.i + 1] = 'done'
    sp[f.i] = 'win'
  }
  if (f.phase === 'query') {
    for (let i = f.ql; i <= f.qr; i++) sa[i] = 'win'
    sp[f.ql] = 'probe'
    sp[f.qr + 1] = 'done'
  }

  return (
    <Lab
      tape={t}
      trace={TRACES.prefix}
      controls={
        <Pick
          label="query"
          value={q}
          onChange={setQ}
          options={[
            { v: '2,5', t: 'sum(2..5)' },
            { v: '0,3', t: 'sum(0..3)' },
            { v: '4,6', t: 'sum(4..6)' },
          ]}
        />
      }
    >
      <ArrayRow vals={PRE_A} states={sa} label="a" />
      <div style={{ height: 10 }} />
      <ArrayRow
        vals={(f.p || []).concat(
          Array(Math.max(0, PRE_A.length + 1 - (f.p || []).length)).fill('·'),
        )}
        states={sp}
        label="p"
      />
    </Lab>
  )
}

/* --- 06 binary search --- */

function bsFrames(a, t, mode) {
  const f = []
  let lo = 0,
    hi = a.length
  const pred = (x) => (mode === 'upper' ? x <= t : x < t)
  const desc = mode === 'upper' ? `a[m] <= ${t}` : `a[m] < ${t}`
  f.push({
    lo,
    hi,
    note: `Think of it as a partition, not a hunt. Every element splits into "${desc} is true" (left block) or "false" (right block). The answer is the boundary. Search space [lo, hi) is half-open.`,
    vars: { lo, hi },
  })
  while (lo < hi) {
    const m = lo + Math.floor((hi - lo) / 2)
    const p = pred(a[m])
    f.push({
      lo,
      hi,
      m,
      p,
      note: `m = lo + (hi−lo)/2 = ${m}. Is ${desc}? ${a[m]} → ${p ? 'true' : 'false'}. ${p ? `So the boundary is strictly right of m: lo = m + 1.` : `m might itself be the boundary: hi = m (not m − 1).`}`,
      vars: { lo, hi, m, 'a[m]': a[m] },
    })
    if (p) lo = m + 1
    else hi = m
  }
  const found = a[lo] === t && mode !== 'upper'
  f.push({
    lo,
    hi,
    final: lo,
    note: `lo == hi == ${lo}. ${
      mode === 'upper'
        ? `That is upper_bound: first index with value > ${t}. Count of ${t} = upper − lower.`
        : `That is lower_bound: first index with value >= ${t}. ${found ? `a[${lo}] == ${t}, so the target exists.` : `a[${lo}] != ${t}, so ${t} is absent — this index is where you would insert it.`}`
    }`,
    vars: { result: lo },
  })
  return f
}

const BS_A = [1, 3, 5, 5, 5, 8, 9, 12, 14]

export function LabBS() {
  const [mode, setMode] = useState('lower')
  const [target, setTarget] = useState(5)
  const frames = useMemo(() => bsFrames(BS_A, target, mode), [mode, target])
  const t = useTape(frames)
  const f = t.frame,
    st = {},
    sub = {}
  BS_A.forEach((_, i) => {
    if (i < f.lo || i >= f.hi) st[i] = 'dim'
  })
  if (f.m !== undefined) st[f.m] = f.p ? 'probe' : 'active'
  if (f.final !== undefined && f.final < BS_A.length) st[f.final] = 'done'
  sub[f.lo] = 'lo'
  if (f.hi < BS_A.length) sub[f.hi] = 'hi'
  if (f.m !== undefined) sub[f.m] = 'm'

  return (
    <Lab
      tape={t}
      trace={TRACES.bs}
      controls={
        <>
          <Pick
            label="mode"
            value={mode}
            onChange={setMode}
            options={[
              { v: 'lower', t: 'lower_bound' },
              { v: 'upper', t: 'upper_bound' },
            ]}
          />
          <Pick
            label="target"
            value={target}
            onChange={setTarget}
            options={[5, 6, 1, 14]}
          />
        </>
      }
    >
      <ArrayRow vals={BS_A} states={st} subs={sub} label="sorted" />
    </Lab>
  )
}

/* --- 07 monotonic stack --- */

function monoFrames(T) {
  const st = [],
    res = Array(T.length).fill(0),
    f = []
  f.push({
    st: [],
    res: [...res],
    note: `Stack holds indices whose answer is still unknown. Invariant: their temperatures are non-increasing from bottom to top.`,
    vars: {},
  })
  for (let i = 0; i < T.length; i++) {
    while (st.length && T[i] > T[st[st.length - 1]]) {
      const j = st.pop()
      res[j] = i - j
      f.push({
        i,
        st: [...st],
        res: [...res],
        pop: j,
        note: `${T[i]} > ${T[j]}, so day ${j} finally gets its warmer day: ${i} − ${j} = ${i - j}. Pop it — it can never be the answer for anything further right.`,
        vars: { i, popped: j, ['res[' + j + ']']: i - j },
      })
    }
    st.push(i)
    f.push({
      i,
      st: [...st],
      res: [...res],
      note: `Push ${i}. Each index is pushed once and popped at most once → O(n) total, even though there is a while loop inside a for loop.`,
      vars: { i, 'stack depth': st.length },
    })
  }
  return f
}

const MONO_T = [73, 74, 75, 71, 69, 72, 76, 73]

export function LabMono() {
  const frames = useMemo(() => monoFrames(MONO_T), [])
  const t = useTape(frames)
  const f = t.frame,
    st = {}
  ;(f.st || []).forEach((i) => {
    st[i] = 'queued'
  })
  if (f.i !== undefined) st[f.i] = 'active'
  if (f.pop !== undefined) st[f.pop] = 'done'

  return (
    <Lab tape={t} trace={TRACES.mono}>
      <ArrayRow vals={MONO_T} states={st} label="temps" />
      <div style={{ height: 10 }} />
      <ArrayRow
        vals={f.res || []}
        states={Object.fromEntries(
          (f.res || []).map((v, i) => [i, v ? 'done' : 'idle']),
        )}
        label="answer"
      />
      <div style={{ marginTop: 10 }}>
        <Chips
          title="stack"
          items={(f.st || []).map((i) => ({ t: `${i}:${MONO_T[i]}`, state: 'queued' }))}
        />
      </div>
    </Lab>
  )
}

/* ==================================================================
   GROUP B — linked and hierarchical structures
   ================================================================== */

/* --- 08 linked list: reversal --- */

function revFrames(vals) {
  const n = vals.length
  const links = vals.map((_, i) => (i + 1 < n ? i + 1 : null))
  const f = []
  let prev = null,
    cur = 0
  f.push({
    links: [...links],
    prev,
    cur,
    nxt: links[0],
    note: `Three pointers. prev = the already-reversed part, cur = the node being flipped, nxt = a saved copy of cur->next so the flip does not strand the rest of the list.`,
    vars: { prev: 'null', cur: vals[0] },
  })
  while (cur !== null) {
    const nxt = links[cur]
    f.push({
      links: [...links],
      prev,
      cur,
      nxt,
      step: 'save',
      note: `Save nxt = ${nxt === null ? 'nullptr' : vals[nxt]} FIRST. Overwrite cur->next before saving and you lose the tail — the single most common bug in this problem.`,
      vars: { cur: vals[cur], nxt: nxt === null ? 'null' : vals[nxt] },
    })
    links[cur] = prev
    f.push({
      links: [...links],
      prev,
      cur,
      nxt,
      step: 'relink',
      note: `cur->next = prev. ${vals[cur]} now points at ${prev === null ? 'nullptr' : vals[prev]}.`,
      vars: { cur: vals[cur] },
    })
    prev = cur
    cur = nxt
    f.push({
      links: [...links],
      prev,
      cur,
      nxt,
      step: 'slide',
      note: `Slide both forward: prev = ${vals[prev]}, cur = ${cur === null ? 'nullptr' : vals[cur]}.`,
      vars: { prev: vals[prev], cur: cur === null ? 'null' : vals[cur] },
    })
  }
  f.push({
    links: [...links],
    prev,
    cur: null,
    head: prev,
    note: `cur is null, so prev is the new head. One pass, O(n) time, O(1) extra space — no new nodes allocated.`,
    vars: { 'new head': vals[prev] },
  })
  return f
}

const LIST_VALS = [1, 2, 3, 4, 5]

export function LabList() {
  const frames = useMemo(() => revFrames(LIST_VALS), [])
  const t = useTape(frames)
  const f = t.frame

  const nodes = LIST_VALS.map((v, i) => ({
    id: i,
    x: 62 + i * 104,
    y: 92,
    label: v,
    shape: 'box',
    state:
      i === f.cur ? 'active' : i === f.prev ? 'done' : f.head === i ? 'done' : 'idle',
    tag: i === f.cur ? 'cur' : i === f.prev ? 'prev' : i === f.nxt ? 'nxt' : '',
  }))
  nodes.push({
    id: 'null',
    x: 62 + LIST_VALS.length * 104,
    y: 92,
    label: '∅',
    shape: 'box',
    state: 'dim',
  })
  const edges = (f.links || []).map((tgt, i) => ({
    a: i,
    b: tgt === null ? 'null' : tgt,
    curve: tgt !== null && tgt < i ? 1 : 0,
    state: i === f.cur || i === f.prev ? 'active' : 'idle',
  }))

  return (
    <Lab tape={t} trace={TRACES.list}>
      <Diagram nodes={nodes} edges={edges} w={640} h={150} r={16} directed />
    </Lab>
  )
}

/* --- 09 trees: traversal --- */

const TREE = { 1: [2, 3], 2: [4, 5], 3: [6, 7], 4: [], 5: [], 6: [], 7: [] }
const TPOS = {
  1: [310, 34],
  2: [170, 100],
  3: [450, 100],
  4: [100, 166],
  5: [240, 166],
  6: [380, 166],
  7: [520, 166],
}

function treeFrames(order) {
  const f = [],
    out = []
  const push = (id, note, stack) =>
    f.push({ cur: id, out: [...out], stack: [...stack], note })

  if (order === 'level') {
    const q = [1]
    f.push({
      cur: null,
      out: [],
      stack: [1],
      note: `BFS keeps a queue. Everything at depth d comes out before anything at depth d+1 — that is why BFS gives shortest paths on unweighted graphs.`,
    })
    while (q.length) {
      const sz = q.length
      for (let k = 0; k < sz; k++) {
        const id = q.shift()
        out.push(id)
        TREE[id].forEach((c) => q.push(c))
        push(
          id,
          `Pop ${id}, record it, push its children. Snapshotting the queue size at the top of each round is what separates one level from the next.`,
          q,
        )
      }
    }
    return f
  }

  const walk = (id, stack) => {
    if (order === 'pre') {
      out.push(id)
      push(
        id,
        `Pre-order: record ${id} on the way IN, before touching children. This is the shape you use to serialize or clone a tree.`,
        stack,
      )
    }
    TREE[id].forEach((c, k) => {
      walk(c, [...stack, id])
      if (order === 'in' && k === 0) {
        out.push(id)
        push(
          id,
          `In-order: record ${id} after the left subtree, before the right. On a BST this emits values in sorted order.`,
          stack,
        )
      }
    })
    if (order === 'in' && TREE[id].length === 0) {
      out.push(id)
      push(id, `Leaf ${id} has no left subtree, so it records immediately.`, stack)
    }
    if (order === 'post') {
      out.push(id)
      push(
        id,
        `Post-order: record ${id} only after both subtrees are done. Use this when a node's answer depends on its children — heights, subtree sums, "delete the tree".`,
        stack,
      )
    }
  }

  f.push({
    cur: null,
    out: [],
    stack: [],
    note: `DFS is a recursion, and the call stack is the data structure. The only thing that changes between the three orders is WHERE you put the visit line.`,
  })
  walk(1, [])
  return f
}

export function LabTree() {
  const [order, setOrder] = useState('pre')
  const frames = useMemo(() => treeFrames(order), [order])
  const t = useTape(frames)
  const f = t.frame
  const done = new Set(f.out || [])

  const nodes = Object.keys(TPOS).map((k) => {
    const id = Number(k)
    return {
      id,
      x: TPOS[k][0],
      y: TPOS[k][1],
      label: id,
      state:
        id === f.cur
          ? 'active'
          : done.has(id)
            ? 'done'
            : (f.stack || []).includes(id)
              ? 'queued'
              : 'idle',
    }
  })
  const edges = []
  Object.entries(TREE).forEach(([p, cs]) =>
    cs.forEach((c) => edges.push({ a: Number(p), b: c })),
  )

  return (
    <Lab
      tape={t}
      trace={TRACES.tree(order)}
      controls={
        <Pick
          label="order"
          value={order}
          onChange={setOrder}
          options={[
            { v: 'pre', t: 'pre-order' },
            { v: 'in', t: 'in-order' },
            { v: 'post', t: 'post-order' },
            { v: 'level', t: 'BFS / level' },
          ]}
        />
      }
    >
      <Diagram nodes={nodes} edges={edges} w={620} h={200} r={17} />
      <div style={{ marginTop: 8 }}>
        <Chips
          title="visited"
          items={(f.out || []).map((v) => ({ t: v, state: 'done' }))}
        />
        <Chips
          title={order === 'level' ? 'queue' : 'stack'}
          items={(f.stack || []).map((v) => ({ t: v, state: 'queued' }))}
        />
      </div>
    </Lab>
  )
}

/* --- 10 heap --- */

function heapFrames(init, pushVal) {
  const h = [...init],
    f = []
  const snap = (note, a, b, vars, ln) => f.push({ h: [...h], a, b, note, vars, ln })

  snap(
    `Min-heap as an array: children of i are 2i+1 and 2i+2, parent is (i−1)/2. No pointers, perfect cache behaviour.`,
    -1,
    -1,
    { size: h.length },
    2,
  )
  h.push(pushVal)
  let i = h.length - 1
  snap(
    `push(${pushVal}): append at the end, then sift UP while it is smaller than its parent.`,
    i,
    -1,
    { i },
    2,
  )
  while (i > 0) {
    const p = (i - 1) >> 1
    if (h[p] <= h[i]) {
      snap(
        `Parent ${h[p]} <= ${h[i]}, heap property restored. Depth is log n, so push is O(log n).`,
        i,
        p,
        { i, parent: p },
        6,
      )
      break
    }
    snap(`Parent ${h[p]} > ${h[i]} — swap.`, i, p, { i, parent: p }, 7)
    ;[h[p], h[i]] = [h[i], h[p]]
    i = p
  }

  snap(
    `pop(): the answer is always h[0]. Move the last element to the root, shrink, then sift DOWN.`,
    0,
    h.length - 1,
    { top: h[0] },
    11,
  )
  const top = h[0]
  h[0] = h[h.length - 1]
  h.pop()
  let j = 0
  snap(
    `Removed ${top}. Root is now ${h[0]}, which is almost certainly in the wrong place.`,
    0,
    -1,
    { j },
    12,
  )
  for (;;) {
    const l = 2 * j + 1,
      r = 2 * j + 2
    let s = j
    if (l < h.length && h[l] < h[s]) s = l
    if (r < h.length && h[r] < h[s]) s = r
    if (s === j) {
      snap(`Both children are >= ${h[j]}. Done — the heap is valid again.`, j, -1, { j }, 18)
      break
    }
    snap(
      `Smallest child is h[${s}] = ${h[s]} < ${h[j]}. Swap down. Always swap with the SMALLER child, or you break the property on the other side.`,
      j,
      s,
      { j, child: s },
      19,
    )
    ;[h[j], h[s]] = [h[s], h[j]]
    j = s
  }
  return f
}

export function LabHeap() {
  const frames = useMemo(() => heapFrames([2, 5, 4, 9, 7, 6], 3), [])
  const t = useTape(frames)
  const f = t.frame,
    h = f.h || []
  const W = 600

  const nodes = h.map((v, i) => {
    const d = Math.floor(Math.log2(i + 1))
    const idxInRow = i - (Math.pow(2, d) - 1)
    const slots = Math.pow(2, d)
    return {
      id: i,
      x: (W / (slots + 1)) * (idxInRow + 1),
      y: 30 + d * 62,
      label: v,
      state: i === f.a ? 'active' : i === f.b ? 'probe' : 'idle',
      tag: 'i=' + i,
    }
  })
  const edges = h
    .map((_, i) => (i > 0 ? { a: (i - 1) >> 1, b: i } : null))
    .filter(Boolean)

  const st = {}
  if (f.a >= 0) st[f.a] = 'active'
  if (f.b >= 0) st[f.b] = 'probe'

  return (
    <Lab tape={t} trace={TRACES.heap}>
      <Diagram nodes={nodes} edges={edges} w={W} h={190} r={17} />
      <div style={{ marginTop: 4 }}>
        <ArrayRow vals={h} states={st} label="array" w={40} />
      </div>
    </Lab>
  )
}

/* --- 11 trie --- */

function trieFrames(words) {
  const root = { ch: '', kids: {}, end: false, id: 0 }
  let nid = 1
  const f = []
  const snap = (note, active, path, step) =>
    f.push({
      root: JSON.parse(JSON.stringify(root)),
      note,
      active,
      path: [...path],
      step,
    })

  snap(
    `One root, one edge per character. Words that share a prefix share the path — that shared structure is the entire point.`,
    0,
    [],
  )
  for (const w of words) {
    let cur = root
    const path = [0]
    for (const c of w) {
      if (!cur.kids[c]) {
        cur.kids[c] = { ch: c, kids: {}, end: false, id: nid++ }
        cur = cur.kids[c]
        path.push(cur.id)
        snap(
          `"${w}": no edge '${c}' yet — create a node. Insert costs O(len), independent of how many words are already stored.`,
          cur.id,
          path,
          'create',
        )
      } else {
        cur = cur.kids[c]
        path.push(cur.id)
        snap(
          `"${w}": edge '${c}' already exists — walk it. No new node, prefix reused.`,
          cur.id,
          path,
          'walk',
        )
      }
    }
    cur.end = true
    snap(
      `Mark end-of-word on the last node of "${w}". Without this flag you cannot tell a stored word from a mere prefix.`,
      cur.id,
      path,
      'end',
    )
  }
  return f
}

function layoutTrie(root) {
  const nodes = [],
    edges = []
  let x = 0
  const walk = (n, depth) => {
    const kids = Object.values(n.kids)
    const xs = []
    kids.forEach((k) => {
      xs.push(walk(k, depth + 1))
    })
    const myX = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : x++
    nodes.push({
      id: n.id,
      x: 40 + myX * 74,
      y: 28 + depth * 58,
      label: n.ch || '•',
      end: n.end,
    })
    kids.forEach((k) => edges.push({ a: n.id, b: k.id }))
    return myX
  }
  walk(root, 0)
  return { nodes, edges }
}

export function LabTrie() {
  const frames = useMemo(() => trieFrames(['cat', 'car', 'dog', 'do']), [])
  const t = useTape(frames)
  const f = t.frame
  const { nodes, edges } = useMemo(
    () => (f.root ? layoutTrie(f.root) : { nodes: [], edges: [] }),
    [f.root],
  )
  const dec = nodes.map((n) => ({
    ...n,
    state:
      n.id === f.active
        ? 'active'
        : n.end
          ? 'done'
          : (f.path || []).includes(n.id)
            ? 'queued'
            : 'idle',
    tag: n.end ? 'word' : '',
  }))

  return (
    <Lab tape={t} trace={TRACES.trie}>
      <Diagram nodes={dec} edges={edges} w={520} h={230} r={16} />
    </Lab>
  )
}

/* ==================================================================
   GROUP C — graphs
   ================================================================== */

/* --- 12 BFS / DFS on a grid --- */

const G = [
  [0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1],
  [0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0],
  [1, 1, 0, 0, 0, 0],
]
const START = [0, 0],
  GOAL = [4, 5]

function gridFrames(mode) {
  const R = G.length,
    Cc = G[0].length
  const seen = Array.from({ length: R }, () => Array(Cc).fill(false))
  const dist = {}
  const f = [],
    frontier = [[START[0], START[1], 0]]
  seen[START[0]][START[1]] = true
  const D = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]

  f.push({
    seen: seen.map((r) => [...r]),
    dist: { ...dist },
    frontier: frontier.map((x) => [...x]),
    note:
      mode === 'bfs'
        ? `BFS: a queue, and mark seen at PUSH time. Cells come off in non-decreasing distance order.`
        : `DFS: a stack (or recursion). It commits to one direction as far as it can go, so the first path it finds to the goal is usually not the shortest.`,
  })

  let steps = 0
  while (frontier.length && steps < 90) {
    steps++
    const [r, c, d] = mode === 'bfs' ? frontier.shift() : frontier.pop()
    dist[r + ',' + c] = d
    const found = r === GOAL[0] && c === GOAL[1]
    for (const [dr, dc] of D) {
      const nr = r + dr,
        nc = c + dc
      if (nr < 0 || nc < 0 || nr >= R || nc >= Cc) continue
      if (G[nr][nc] === 1 || seen[nr][nc]) continue
      seen[nr][nc] = true
      frontier.push([nr, nc, d + 1])
    }
    f.push({
      cur: [r, c],
      seen: seen.map((x) => [...x]),
      dist: { ...dist },
      frontier: frontier.map((x) => [...x]),
      found,
      note: found
        ? `Reached the goal at depth ${d}. ${mode === 'bfs' ? 'Because BFS expands in layers, this is provably the shortest path — O(V+E) with no weights involved.' : 'DFS returns whichever route it wandered into first — nothing about it promises shortest. Switch to BFS above and compare the depth it reports.'}`
        : `${mode === 'bfs' ? 'Pop the front' : 'Pop the top'} → (${r},${c}) at depth ${d}. Push its unseen 4-neighbours and mark them seen immediately, so nothing enters the frontier twice.`,
      vars: { 'frontier size': frontier.length, depth: d },
    })
    if (found) break
  }
  return f
}

export function LabGrid() {
  const [mode, setMode] = useState('bfs')
  const frames = useMemo(() => gridFrames(mode), [mode])
  const t = useTape(frames)
  const f = t.frame,
    states = {},
    labels = {}

  ;(f.seen || []).forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) states[r + ',' + c] = 'win'
    }),
  )
  Object.entries(f.dist || {}).forEach(([k, v]) => {
    states[k] = 'done'
    labels[k] = v
  })
  ;(f.frontier || []).forEach(([r, c, d]) => {
    states[r + ',' + c] = 'queued'
    labels[r + ',' + c] = d
  })
  if (f.cur) states[f.cur[0] + ',' + f.cur[1]] = 'active'
  const sKey = START[0] + ',' + START[1]
  if (labels[sKey] === undefined) labels[sKey] = 'S'
  const gKey = GOAL[0] + ',' + GOAL[1]
  if (states[gKey] === undefined) labels[gKey] = 'G'

  return (
    <Lab
      tape={t}
      trace={TRACES.grid}
      controls={
        <Pick
          label="traversal"
          value={mode}
          onChange={setMode}
          options={[
            { v: 'bfs', t: 'BFS (queue)' },
            { v: 'dfs', t: 'DFS (stack)' },
          ]}
        />
      }
    >
      <GridView grid={G} states={states} labels={labels} cell={38} />
      <div style={{ marginTop: 8 }}>
        <Chips
          title="frontier"
          items={(f.frontier || [])
            .slice(0, 10)
            .map(([r, c, d]) => ({ t: `(${r},${c})·${d}`, state: 'queued' }))}
        />
      </div>
    </Lab>
  )
}

/* --- 13 topological sort --- */

const DAG = { A: ['C'], B: ['C', 'D'], C: ['E'], D: ['F'], E: ['F'], F: [] }
const DPOS = {
  A: [60, 50],
  B: [60, 150],
  C: [210, 50],
  D: [210, 150],
  E: [360, 50],
  F: [510, 100],
}

function topoFrames() {
  const indeg = {}
  Object.keys(DAG).forEach((k) => (indeg[k] = 0))
  Object.values(DAG).forEach((vs) => vs.forEach((v) => indeg[v]++))
  const q = Object.keys(DAG).filter((k) => indeg[k] === 0)
  const out = [],
    f = []

  f.push({
    indeg: { ...indeg },
    q: [...q],
    out: [],
    note: `Kahn's algorithm. indegree[v] = how many prerequisites v still has. Anything at 0 is takeable right now.`,
  })
  while (q.length) {
    const u = q.shift()
    out.push(u)
    f.push({
      cur: u,
      indeg: { ...indeg },
      q: [...q],
      out: [...out],
      note: `${u} has no unmet prerequisites — take it. Now remove its outgoing edges.`,
      vars: { taken: out.join(' ') },
    })
    for (const v of DAG[u]) {
      indeg[v]--
      if (indeg[v] === 0) q.push(v)
      f.push({
        cur: u,
        edge: [u, v],
        indeg: { ...indeg },
        q: [...q],
        out: [...out],
        note: `indegree[${v}] drops to ${indeg[v]}.${indeg[v] === 0 ? ` It is now unblocked — enqueue it.` : ` Still blocked.`}`,
        vars: { ['indeg[' + v + ']']: indeg[v] },
      })
    }
  }
  f.push({
    indeg: { ...indeg },
    q: [],
    out: [...out],
    done: true,
    note: `Output has ${out.length} of ${Object.keys(DAG).length} nodes. If it were fewer, the leftovers would form a cycle — that is exactly how Course Schedule detects impossibility. O(V+E).`,
    vars: { order: out.join(' → ') },
  })
  return f
}

export function LabTopo() {
  const frames = useMemo(() => topoFrames(), [])
  const t = useTape(frames)
  const f = t.frame
  const taken = new Set(f.out || [])

  const nodes = Object.keys(DPOS).map((k) => ({
    id: k,
    x: DPOS[k][0],
    y: DPOS[k][1],
    label: k,
    state:
      k === f.cur
        ? 'active'
        : taken.has(k)
          ? 'done'
          : (f.q || []).includes(k)
            ? 'queued'
            : 'idle',
    tag: 'in ' + (f.indeg ? f.indeg[k] : 0),
  }))
  const edges = []
  Object.entries(DAG).forEach(([u, vs]) =>
    vs.forEach((v) =>
      edges.push({
        a: u,
        b: v,
        state:
          f.edge && f.edge[0] === u && f.edge[1] === v
            ? 'active'
            : taken.has(u)
              ? 'dim'
              : 'idle',
      }),
    ),
  )

  return (
    <Lab tape={t} trace={TRACES.topo}>
      <Diagram nodes={nodes} edges={edges} w={580} h={200} r={17} directed />
      <div style={{ marginTop: 6 }}>
        <Chips title="queue" items={(f.q || []).map((v) => ({ t: v, state: 'queued' }))} />
        <Chips title="order" items={(f.out || []).map((v) => ({ t: v, state: 'done' }))} />
      </div>
    </Lab>
  )
}

/* --- 14 union-find --- */

function dsuFrames(ops, n) {
  const p = Array.from({ length: n }, (_, i) => i),
    r = Array(n).fill(0)
  const f = []

  const find = (x, log) => {
    const path = []
    while (p[x] !== x) {
      path.push(x)
      x = p[x]
    }
    if (log && path.length > 1) {
      path.forEach((y) => (p[y] = x))
      f.push({
        p: [...p],
        step: 'compress',
        note: `Path compression: everything on the path from ${path[0]} now points straight at the root ${x}. Later finds on this branch are O(1).`,
        hi: [...path, x],
      })
    }
    return x
  }

  f.push({
    p: [...p],
    note: `Every element starts as its own root. parent[i] == i means "I am a root".`,
  })
  for (const [a, b] of ops) {
    const ra = find(a, true),
      rb = find(b, true)
    if (ra === rb) {
      f.push({
        p: [...p],
        hi: [a, b],
        step: 'cycle',
        note: `find(${a}) == find(${b}) == ${ra}. Already in the same set — adding this edge would close a cycle. This is how you detect cycles in an undirected graph.`,
      })
      continue
    }
    if (r[ra] < r[rb]) {
      p[ra] = rb
      f.push({
        p: [...p],
        hi: [ra, rb],
        step: 'swap',
        note: `union(${a},${b}): attach the shallower root ${ra} under ${rb}. Union by rank keeps trees flat.`,
      })
    } else {
      const tie = r[ra] === r[rb]
      p[rb] = ra
      if (tie) r[ra]++
      f.push({
        p: [...p],
        hi: [rb, ra],
        step: 'attach',
        note: `union(${a},${b}): attach root ${rb} under ${ra}.${tie ? ' Ranks were equal, so rank of ' + ra + ' is now ' + r[ra] + '.' : ''}`,
      })
    }
  }
  const roots = new Set(p.map((_, i) => find(i, false)))
  f.push({
    p: [...p],
    note: `Distinct roots = ${roots.size} connected components. With both rank and path compression, each operation is O(α(n)) — under 5 for any n you will ever see.`,
    vars: { components: roots.size },
  })
  return f
}

export function LabDSU() {
  const frames = useMemo(
    () =>
      dsuFrames(
        [
          [0, 1],
          [2, 3],
          [1, 3],
          [4, 5],
          [6, 7],
          [5, 7],
          [0, 2],
        ],
        8,
      ),
    [],
  )
  const t = useTape(frames)
  const f = t.frame,
    p = f.p || []

  const nodes = p.map((_, i) => ({
    id: i,
    x: 50 + (i % 8) * 68,
    y: 40 + Math.floor(i / 8) * 80,
    label: i,
    state: (f.hi || []).includes(i) ? 'active' : p[i] === i ? 'done' : 'idle',
    tag: p[i] === i ? 'root' : '',
  }))
  const edges = p
    .map((par, i) =>
      par !== i
        ? {
            a: i,
            b: par,
            curve: 1,
            state: (f.hi || []).includes(i) ? 'active' : 'idle',
          }
        : null,
    )
    .filter(Boolean)

  return (
    <Lab tape={t} trace={TRACES.dsu}>
      <Diagram nodes={nodes} edges={edges} w={600} h={130} r={16} directed />
      <ArrayRow
        vals={p}
        states={Object.fromEntries(
          p.map((par, i) => [
            i,
            (f.hi || []).includes(i) ? 'active' : par === i ? 'done' : 'idle',
          ]),
        )}
        label="parent"
        w={40}
      />
    </Lab>
  )
}

/* ==================================================================
   GROUP D — recursion, optimization, bits
   ================================================================== */

/* --- 15 backtracking --- */

function btFrames(a) {
  const f = [],
    out = [],
    path = []
  const nodeId = (depth, taken) => depth + ':' + taken.join('')

  const rec = (i, taken) => {
    f.push({
      node: nodeId(i, taken),
      path: [...path],
      out: out.map((x) => [...x]),
      enter: true,
      leaf: i === a.length,
      note:
        i === a.length
          ? `Depth ${i} — no more choices. Record the subset {${path.join(',')}}.`
          : `At index ${i}. Two branches: take ${a[i]}, or skip it. The recursion tree has 2ⁿ leaves, which is why subsets is O(n·2ⁿ).`,
    })
    if (i === a.length) {
      out.push([...path])
      return
    }
    path.push(a[i])
    rec(i + 1, [...taken, 1])
    path.pop()
    f.push({
      node: nodeId(i, taken),
      path: [...path],
      out: out.map((x) => [...x]),
      undo: true,
      note: `Back at index ${i}. Undo the choice — pop ${a[i]} off the path. Forgetting this pop is the classic backtracking bug: state leaks into sibling branches.`,
    })
    rec(i + 1, [...taken, 0])
  }

  rec(0, [])
  f.push({
    node: null,
    path: [],
    out: out.map((x) => [...x]),
    note: `All ${out.length} = 2³ subsets, including the empty one. The work is one node per recursive call — 2^(n+1) − 1 nodes — and O(n) to copy each leaf, so O(n · 2ⁿ).`,
    vars: { subsets: out.length },
  })
  return f
}

function btLayout(n) {
  const nodes = [],
    edges = []
  let leaf = 0
  const build = (depth, taken) => {
    const id = depth + ':' + taken.join('')
    if (depth === n) {
      const x = leaf++
      nodes.push({ id, x, y: depth, taken })
      return x
    }
    const a = build(depth + 1, [...taken, 1])
    const b = build(depth + 1, [...taken, 0])
    const x = (a + b) / 2
    nodes.push({ id, x, y: depth, taken })
    edges.push({
      a: id,
      b: depth + 1 + ':' + [...taken, 1].join(''),
      label: '+',
    })
    edges.push({
      a: id,
      b: depth + 1 + ':' + [...taken, 0].join(''),
      label: '−',
    })
    return x
  }
  build(0, [])
  return { nodes, edges }
}

const BT_A = [1, 2, 3]

export function LabBT() {
  const frames = useMemo(() => btFrames(BT_A), [])
  const t = useTape(frames)
  const f = t.frame
  const { nodes, edges } = useMemo(() => btLayout(BT_A.length), [])

  const dec = nodes.map((n) => ({
    id: n.id,
    x: 34 + n.x * 76,
    y: 26 + n.y * 56,
    label:
      n.taken
        .map((v, i) => (v ? BT_A[i] : ''))
        .filter(Boolean)
        .join(',') || '∅',
    state: n.id === f.node ? 'active' : 'idle',
  }))

  return (
    <Lab tape={t} trace={TRACES.bt}>
      <Diagram nodes={dec} edges={edges} w={640} h={210} r={17} />
      <div style={{ marginTop: 6 }}>
        <Chips title="path" items={(f.path || []).map((v) => ({ t: v, state: 'active' }))} />
        <Chips
          title="output"
          items={(f.out || []).map((s) => ({
            t: '{' + s.join(',') + '}',
            state: 'done',
          }))}
        />
      </div>
    </Lab>
  )
}

/* --- 16 DP 1D --- */

function coinFrames(coins, amt) {
  const dp = Array(amt + 1).fill(Infinity)
  dp[0] = 0
  const f = []
  f.push({
    dp: [...dp],
    note: `dp[x] = fewest coins summing to exactly x. dp[0] = 0, everything else starts unreachable (∞). Note greedy fails here: 6 = 4+1+1 is three coins, the optimum is 3+3.`,
    vars: { coins: coins.join(',') },
  })
  for (let x = 1; x <= amt; x++) {
    for (const c of coins) {
      if (c > x) continue
      const cand = dp[x - c] + 1
      const better = cand < dp[x]
      f.push({
        dp: [...dp],
        x,
        from: x - c,
        coin: c,
        better,
        note: `dp[${x}] via coin ${c}: dp[${x - c}] + 1 = ${dp[x - c] === Infinity ? '∞' : dp[x - c] + 1}. ${better ? `Better than the current ${dp[x] === Infinity ? '∞' : dp[x]} — take it.` : `Not better than ${dp[x] === Infinity ? '∞' : dp[x]} — keep what we had.`}`,
        vars: { x, coin: c },
      })
      if (better) dp[x] = cand
    }
  }
  f.push({
    dp: [...dp],
    done: true,
    note: `dp[${amt}] = ${dp[amt]}. Every subproblem solved once and reused: O(amount × coins) time, O(amount) space. The naive recursion re-solves the same amounts exponentially often.`,
    vars: { answer: dp[amt] },
  })
  return f
}

export function LabDP1() {
  const frames = useMemo(() => coinFrames([1, 3, 4], 6), [])
  const t = useTape(frames)
  const f = t.frame,
    st = {}
  if (f.x !== undefined) {
    st[f.x] = f.better ? 'done' : 'active'
    st[f.from] = 'probe'
  }
  if (f.done) st[6] = 'done'

  return (
    <Lab tape={t} trace={TRACES.dp1}>
      <ArrayRow
        vals={(f.dp || []).map((v) => (v === Infinity ? '∞' : v))}
        states={st}
        label="dp"
        w={44}
      />
    </Lab>
  )
}

/* --- 17 DP 2D --- */

function lcsFrames(s1, s2) {
  const n = s1.length,
    m = s2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  const f = []
  f.push({
    dp: dp.map((r) => [...r]),
    note: `dp[i][j] = length of the longest common subsequence of the first i chars of "${s1}" and the first j of "${s2}". Row 0 and column 0 are 0 — an empty string shares nothing.`,
  })
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const match = s1[i - 1] === s2[j - 1]
      dp[i][j] = match
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
      f.push({
        dp: dp.map((r) => [...r]),
        i,
        j,
        match,
        note: match
          ? `'${s1[i - 1]}' == '${s2[j - 1]}' → extend the diagonal: dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
          : `'${s1[i - 1]}' != '${s2[j - 1]}' → drop one character and take the better option: max(up ${dp[i - 1][j]}, left ${dp[i][j - 1]}) = ${dp[i][j]}.`,
        vars: { i, j, ['dp[' + i + '][' + j + ']']: dp[i][j] },
      })
    }
  f.push({
    dp: dp.map((r) => [...r]),
    done: true,
    note: `Answer is the bottom-right cell: ${dp[n][m]}. O(n·m) time and space; since each row only reads the row above, you can compress to O(m) space — mention that even if you do not code it.`,
    vars: { answer: dp[n][m] },
  })
  return f
}

const LCS_1 = 'abcde',
  LCS_2 = 'ace'

export function LabDP2() {
  const frames = useMemo(() => lcsFrames(LCS_1, LCS_2), [])
  const t = useTape(frames)
  const f = t.frame,
    st = {}
  if (f.i !== undefined) {
    st[f.i + ',' + f.j] = 'active'
    if (f.match) st[f.i - 1 + ',' + (f.j - 1)] = 'probe'
    else {
      st[f.i - 1 + ',' + f.j] = 'probe'
      st[f.i + ',' + (f.j - 1)] = 'probe'
    }
  }
  if (f.done) st[LCS_1.length + ',' + LCS_2.length] = 'done'

  return (
    <Lab tape={t} trace={TRACES.dp2}>
      <TableView
        colHead={['ø', ...LCS_2.split('')]}
        rowHead={['ø', ...LCS_1.split('')]}
        cells={f.dp || []}
        states={st}
      />
    </Lab>
  )
}

/* --- 18 intervals --- */

function mergeFrames(iv) {
  const a = [...iv].sort((x, y) => x[0] - y[0])
  const out = [],
    f = []
  f.push({
    a,
    out: [],
    note: `Sort by start first. Almost every interval problem opens with a sort — the O(n log n) is unavoidable and the rest is a linear sweep.`,
  })
  for (const [s, e] of a) {
    if (out.length && s <= out[out.length - 1][1]) {
      const prev = out[out.length - 1]
      f.push({
        a,
        out: out.map((x) => [...x]),
        cur: [s, e],
        merge: true,
        note: `[${s},${e}] starts at or before the end of [${prev[0]},${prev[1]}] → they overlap. Extend the end to max(${prev[1]}, ${e}).`,
      })
      prev[1] = Math.max(prev[1], e)
    } else {
      f.push({
        a,
        out: out.map((x) => [...x]),
        cur: [s, e],
        note: out.length
          ? `[${s},${e}] starts after the last block ends — no overlap, so start a new block.`
          : `First block: [${s},${e}].`,
      })
      out.push([s, e])
    }
  }
  f.push({
    a,
    out: out.map((x) => [...x]),
    done: true,
    note: `${out.length} merged intervals. Because the list is sorted by start, you only ever need to compare against the LAST block in the output.`,
    vars: { result: out.map((x) => '[' + x + ']').join(' ') },
  })
  return f
}

const IV = [
  [1, 3],
  [8, 10],
  [2, 6],
  [15, 18],
  [9, 12],
]

export function LabIntervals() {
  const frames = useMemo(() => mergeFrames(IV), [])
  const t = useTape(frames)
  const f = t.frame
  const scale = (x) => 20 + x * 30

  return (
    <Lab tape={t} trace={TRACES.intervals}>
      <svg viewBox="0 0 620 190" style={{ width: '100%', maxWidth: 620 }}>
        <line x1={20} y1={170} x2={600} y2={170} stroke={C.line} />
        {Array.from({ length: 20 }).map((_, k) => (
          <g key={k}>
            <line x1={scale(k)} y1={166} x2={scale(k)} y2={174} stroke={C.line} />
            <text
              x={scale(k)}
              y={186}
              textAnchor="middle"
              style={{ fontFamily: mono, fontSize: 9, fill: C.mute }}
            >
              {k}
            </text>
          </g>
        ))}
        {(f.a || []).map(([s, e], k) => {
          const on = f.cur && f.cur[0] === s && f.cur[1] === e
          return (
            <rect
              key={k}
              x={scale(s)}
              y={24 + k * 22}
              width={scale(e) - scale(s)}
              height={14}
              rx={2}
              fill={on ? C.rust : '#e8e3d6'}
              stroke={on ? C.rust : C.line}
            />
          )
        })}
        {(f.out || []).map(([s, e], k) => (
          <rect
            key={'o' + k}
            x={scale(s)}
            y={140}
            width={scale(e) - scale(s)}
            height={16}
            rx={2}
            fill={C.teal}
            opacity={0.85}
          />
        ))}
        <text x={2} y={20} style={{ fontFamily: mono, fontSize: 10, fill: C.mute }}>
          sorted
        </text>
        <text x={2} y={136} style={{ fontFamily: mono, fontSize: 10, fill: C.mute }}>
          merged
        </text>
      </svg>
    </Lab>
  )
}

/* --- 19 bit manipulation --- */

export function LabBits() {
  const [n, setN] = useState(44)
  const bits = n.toString(2).padStart(8, '0').split('')
  const flip = (i) => setN(n ^ (1 << (7 - i)))

  const rows = [
    ['n', n, 'the number'],
    [
      'n & (n-1)',
      n & (n - 1),
      'clears the lowest set bit — loop this to count bits in O(popcount)',
    ],
    ['n & -n', n & -n, 'isolates the lowest set bit'],
    ['n | (n+1)', n | (n + 1), 'sets the lowest zero bit'],
    ['n >> 1', n >> 1, 'divide by two, floor'],
    ['n ^ 0b1111', n ^ 15, 'XOR flips exactly the bits set in the mask'],
    [
      '__builtin_popcount(n)',
      (n.toString(2).match(/1/g) || []).length,
      'compiler intrinsic — one instruction',
    ],
  ]

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        background: C.card,
        borderRadius: 3,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {bits.map((b, i) => (
          <div
            key={i}
            onClick={() => flip(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                flip(i)
              }
            }}
            style={{
              width: 42,
              height: 46,
              cursor: 'pointer',
              borderRadius: 2,
              border: `1.5px solid ${b === '1' ? C.rust : C.line}`,
              background: b === '1' ? C.rust : '#fffdf8',
              color: b === '1' ? '#fff' : C.mute,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: mono,
              fontSize: 15,
            }}
          >
            {b}
            <span style={{ fontSize: 9, opacity: 0.75 }}>2^{7 - i}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 8,
            fontFamily: mono,
            fontSize: 12,
            color: C.mute,
          }}
        >
          click a bit
        </div>
      </div>

      {/* Two nowrap mono columns plus prose will not fit a phone; let the
          table scroll inside its own box rather than push the page wide. */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}
        >
          <tbody>
          {rows.map(([k, v, why]) => (
            <tr key={k} style={{ borderTop: `1px solid ${C.line}` }}>
              <td
                style={{
                  fontFamily: mono,
                  padding: '6px 8px 6px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                {k}
              </td>
              <td
                style={{
                  fontFamily: mono,
                  padding: '6px 8px',
                  color: C.rust,
                  whiteSpace: 'nowrap',
                }}
              >
                {String(v)}{' '}
                <span style={{ color: C.mute }}>
                  = {(v >>> 0).toString(2).padStart(8, '0')}
                </span>
              </td>
              <td style={{ padding: '6px 0', color: C.mute }}>{why}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
