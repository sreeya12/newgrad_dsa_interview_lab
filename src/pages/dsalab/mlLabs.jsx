import { useState, useMemo } from 'react'
import { C, mono } from './tokens.js'
import { useTape } from './useTape.js'
import { Lab, ArrayRow, TableView, Chips, Pick } from './ui.jsx'
import { ML_TRACES } from './mlTraces.js'

/* ==================================================================
   ML-native lab modules. These only appear on the MLE track.
   Same contract as the SDE labs: a frame generator, a renderer, a trace.
   ================================================================== */

const r2 = (x) => Math.round(x * 100) / 100
const r3 = (x) => Math.round(x * 1000) / 1000

/* ------------------------------------------------------------------
   20 · Gradient descent
   ------------------------------------------------------------------ */

// f(x) = x^2 + 1, so f'(x) = 2x. Small enough to do in your head, which is
// the point: you should be able to predict the next step before you press it.
const f = (x) => x * x + 1
const df = (x) => 2 * x

function gradFrames(lr) {
  const frames = []
  let x = 4
  frames.push({
    x,
    note: `f(x) = x² + 1, so the gradient is f'(x) = 2x. Start at x = 4. The learning rate is the only thing you control here, and it decides whether this converges at all.`,
    vars: { x, 'f(x)': f(x), lr },
    ln: 1,
  })
  for (let i = 0; i < 12; i++) {
    const g = df(x)
    const nx = x - lr * g
    const diverging = Math.abs(nx) > Math.abs(x)
    frames.push({
      x,
      next: nx,
      g,
      note: `Step ${i + 1}: gradient at x = ${r2(x)} is ${r2(g)}. Move against it: x ← ${r2(x)} − ${lr} × ${r2(g)} = ${r2(nx)}. ${
        diverging
          ? 'The step overshot the minimum and landed further away than it started — this is divergence, and no number of steps fixes it.'
          : lr <= 0.15
            ? 'Correct direction, tiny step. This converges, but you will pay for it in epochs.'
            : 'A healthy step: it moved most of the way to the minimum without passing it.'
      }`,
      vars: { x: r2(x), grad: r2(g), 'x next': r2(nx), lr },
      ln: 3,
    })
    x = nx
    if (Math.abs(x) < 0.01 || Math.abs(x) > 1e4) break
  }
  const ok = Math.abs(x) < 0.1
  frames.push({
    x,
    done: true,
    note: ok
      ? `Converged: x ≈ ${r3(x)}, which is the minimum of f. The gradient shrinks as you approach it, so the steps shrink too — that is why plain gradient descent slows down near the bottom, and why momentum exists.`
      : `Did not converge. With lr = ${lr} each step overshoots by more than it gained, so the loss grows without bound. In a real run you see this as a loss that goes to NaN within a few hundred steps.`,
    vars: { 'final x': r3(x), converged: ok ? 'yes' : 'no' },
    ln: 6,
  })
  return frames
}

export function LabGradient() {
  const [lr, setLr] = useState(0.3)
  const frames = useMemo(() => gradFrames(lr), [lr])
  const t = useTape(frames)
  const fr = t.frame

  const W = 560,
    H = 220,
    pad = 30
  const X = (v) => pad + ((v + 5) / 10) * (W - pad * 2)
  const Y = (v) => H - pad - (Math.min(v, 27) / 27) * (H - pad * 2)
  const curve = []
  for (let v = -5; v <= 5; v += 0.25) curve.push(`${curve.length ? 'L' : 'M'} ${X(v)} ${Y(f(v))}`)

  return (
    <Lab
      tape={t}
      trace={ML_TRACES.gradient}
      controls={
        <Pick
          label="learning rate"
          value={lr}
          onChange={setLr}
          options={[
            { v: 0.1, t: '0.1 slow' },
            { v: 0.3, t: '0.3 good' },
            { v: 0.9, t: '0.9 bouncy' },
            { v: 1.05, t: '1.05 diverges' },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={C.line} />
        <line x1={X(0)} y1={pad - 12} x2={X(0)} y2={H - pad} stroke={C.line} strokeDasharray="2 4" />
        <path d={curve.join(' ')} fill="none" stroke={C.mute} strokeWidth="1.6" />
        <text x={X(0) + 4} y={H - pad + 12} className="" style={{ fontFamily: mono, fontSize: 9, fill: C.mute }}>
          minimum
        </text>

        {fr.next !== undefined && (
          <path
            d={`M ${X(fr.x)} ${Y(f(fr.x))} L ${X(fr.next)} ${Y(f(fr.next))}`}
            stroke={C.rust}
            strokeWidth="1.6"
            strokeDasharray="4 3"
            fill="none"
          />
        )}
        {fr.next !== undefined && Math.abs(fr.next) <= 5 && (
          <circle cx={X(fr.next)} cy={Y(f(fr.next))} r="5" fill="none" stroke={C.rust} strokeWidth="1.5" />
        )}
        {Math.abs(fr.x) <= 5 && (
          <circle cx={X(fr.x)} cy={Y(f(fr.x))} r="6" fill={fr.done ? C.teal : C.rust} />
        )}
        {Math.abs(fr.x) > 5 && (
          <text x={W - pad - 90} y={pad} style={{ fontFamily: mono, fontSize: 11, fill: C.rust }}>
            x is off the chart
          </text>
        )}
      </svg>
    </Lab>
  )
}

/* ------------------------------------------------------------------
   21 · k-means
   ------------------------------------------------------------------ */

const PTS = [
  [1.0, 1.4], [1.4, 1.0], [0.8, 0.9], [1.6, 1.6],
  [4.2, 1.2], [4.6, 1.6], [4.9, 0.9], [4.3, 1.8],
  [2.6, 4.4], [3.0, 4.8], [2.2, 4.9], [3.2, 4.2],
]

function dist2(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}

function kmeansFrames(init) {
  // Two starts: a fair one, and a deliberately bad one that converges to a
  // worse solution — which is the entire argument for k-means++.
  let cent =
    init === 'bad'
      ? [[1.0, 1.4], [1.4, 1.0], [3.0, 4.8]]
      : [[1.0, 1.4], [4.9, 0.9], [3.0, 4.8]]
  const frames = []
  let assign = PTS.map(() => -1)

  frames.push({
    cent: cent.map((c) => [...c]),
    assign: [...assign],
    note:
      init === 'bad'
        ? `Three centroids, two of them started inside the same real cluster. k-means will still converge — to a split of that cluster and a merge of two others. It cannot recover, because every step only ever decreases the objective.`
        : `Three centroids, one near each real cluster. Two steps repeat until nothing moves: assign every point to its nearest centroid, then move each centroid to the mean of what it got.`,
    vars: { k: 3, points: PTS.length },
    ln: 1,
  })

  for (let it = 0; it < 6; it++) {
    const next = PTS.map((p) =>
      cent.reduce((best, c, i) => (dist2(p, c) < dist2(p, cent[best]) ? i : best), 0),
    )
    const changed = next.some((v, i) => v !== assign[i])
    assign = next
    frames.push({
      cent: cent.map((c) => [...c]),
      assign: [...assign],
      phase: 'assign',
      note: `Assign: every point takes the nearest centroid. ${
        changed
          ? 'Some points changed hands, so another round is needed.'
          : 'No point changed hands — the assignment is stable, so the algorithm has converged.'
      } This step is O(n · k · d), and it is where all the time goes at scale.`,
      vars: { iteration: it + 1, 'changed?': changed ? 'yes' : 'no' },
      ln: 4,
    })
    if (!changed) break

    const nc = cent.map((_, i) => {
      const mine = PTS.filter((_, j) => assign[j] === i)
      if (!mine.length) return cent[i]
      return [
        mine.reduce((s, p) => s + p[0], 0) / mine.length,
        mine.reduce((s, p) => s + p[1], 0) / mine.length,
      ]
    })
    const moved = nc.reduce((s, c, i) => s + Math.sqrt(dist2(c, cent[i])), 0)
    cent = nc
    frames.push({
      cent: cent.map((c) => [...c]),
      assign: [...assign],
      phase: 'update',
      note: `Update: each centroid jumps to the mean of the points assigned to it. Total movement this round: ${r2(moved)}. The objective (sum of squared distances) can only go down, which is why k-means always terminates — and also why it cannot escape a bad start.`,
      vars: { iteration: it + 1, 'centroid movement': r2(moved) },
      ln: 7,
    })
  }

  frames.push({
    cent: cent.map((c) => [...c]),
    assign: [...assign],
    done: true,
    note:
      init === 'bad'
        ? `Converged to a wrong answer. The real clusters are still there; k-means just cannot see them from where it started. Fixes, in order of what an interviewer wants to hear: k-means++ initialisation, then several restarts keeping the best objective.`
        : `Converged. Say the caveats out loud: k must be chosen in advance, the clusters it finds are spherical and equally sized by construction, and the result depends on the initialisation.`,
    vars: { iterations: Math.ceil(frames.length / 2) },
    ln: 9,
  })
  return frames
}

const CLUSTER_COLOR = [C.rust, C.teal, C.violet]

export function LabKMeans() {
  const [init, setInit] = useState('good')
  const frames = useMemo(() => kmeansFrames(init), [init])
  const t = useTape(frames)
  const fr = t.frame

  const W = 420,
    H = 240,
    pad = 26
  const X = (v) => pad + (v / 6) * (W - pad * 2)
  const Y = (v) => H - pad - (v / 6) * (H - pad * 2)

  return (
    <Lab
      tape={t}
      trace={ML_TRACES.kmeans}
      controls={
        <Pick
          label="init"
          value={init}
          onChange={setInit}
          options={[
            { v: 'good', t: 'spread out' },
            { v: 'bad', t: 'two in one cluster' },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={C.line} />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={C.line} />
        {PTS.map((p, i) => {
          const a = (fr.assign || [])[i]
          return (
            <circle
              key={i}
              cx={X(p[0])}
              cy={Y(p[1])}
              r="5"
              fill={a >= 0 ? CLUSTER_COLOR[a] : '#fff'}
              stroke={a >= 0 ? CLUSTER_COLOR[a] : C.mute}
              strokeWidth="1.4"
              opacity={a >= 0 ? 0.85 : 1}
            />
          )
        })}
        {(fr.cent || []).map((c, i) => (
          <g key={i}>
            <path
              d={`M ${X(c[0]) - 7} ${Y(c[1])} L ${X(c[0]) + 7} ${Y(c[1])} M ${X(c[0])} ${Y(c[1]) - 7} L ${X(c[0])} ${Y(c[1]) + 7}`}
              stroke={CLUSTER_COLOR[i]}
              strokeWidth="2.4"
            />
            <circle cx={X(c[0])} cy={Y(c[1])} r="10" fill="none" stroke={CLUSTER_COLOR[i]} strokeWidth="1.4" />
          </g>
        ))}
        <text x={pad} y={pad - 8} style={{ fontFamily: mono, fontSize: 10, fill: C.mute }}>
          {fr.phase === 'assign' ? 'assign step' : fr.phase === 'update' ? 'update step' : fr.done ? 'converged' : 'start'}
        </text>
      </svg>
    </Lab>
  )
}

/* ------------------------------------------------------------------
   22 · Softmax and cross-entropy
   ------------------------------------------------------------------ */

const LOGITS = [2.0, 1.0, 0.1, 3.0]
const TRUE_LABEL = 3

function softmaxFrames(temp) {
  const z = LOGITS.map((v) => v / temp)
  const mx = Math.max(...z)
  const shifted = z.map((v) => v - mx)
  const ex = shifted.map(Math.exp)
  const sum = ex.reduce((a, b) => a + b, 0)
  const probs = ex.map((v) => v / sum)
  const loss = -Math.log(probs[TRUE_LABEL])

  return [
    {
      vals: z.map(r2),
      stage: 'logits',
      note: `Raw logits, divided by the temperature (${temp}). They are unbounded scores, not probabilities — nothing here sums to 1 and nothing is positive by construction.`,
      vars: { temperature: temp },
      ln: 1,
    },
    {
      vals: shifted.map(r2),
      stage: 'shift',
      hi: z.indexOf(mx),
      note: `Subtract the max (${r2(mx)}) from every logit. This changes nothing mathematically — softmax is shift-invariant — but it guarantees the largest exponent is exp(0) = 1, so nothing overflows. Skipping this line is how you get NaN on large logits.`,
      vars: { max: r2(mx) },
      ln: 2,
    },
    {
      vals: ex.map(r3),
      stage: 'exp',
      note: `Exponentiate. Now everything is positive, and the gaps between logits have become ratios: a difference of 1 in logit space is a factor of e ≈ 2.72 in probability space.`,
      vars: { sum: r3(sum) },
      ln: 3,
    },
    {
      vals: probs.map(r3),
      stage: 'probs',
      hi: probs.indexOf(Math.max(...probs)),
      note: `Divide by the sum. These are probabilities: positive and summing to 1. Note what temperature did — a low temperature sharpens toward one-hot, a high one flattens toward uniform, and the argmax never changes.`,
      vars: { sum: r3(probs.reduce((a, b) => a + b, 0)), max: r3(Math.max(...probs)) },
      ln: 4,
    },
    {
      vals: probs.map(r3),
      stage: 'loss',
      hi: TRUE_LABEL,
      done: true,
      note: `Cross-entropy for true class ${TRUE_LABEL} is −log(${r3(probs[TRUE_LABEL])}) = ${r3(loss)}. It only ever looks at the probability of the correct class — every other output affects the loss only through the normalising sum. In practice you never compute this separately: log-softmax fuses the two steps and stays stable.`,
      vars: { 'p(true)': r3(probs[TRUE_LABEL]), loss: r3(loss) },
      ln: 6,
    },
  ]
}

export function LabSoftmax() {
  const [temp, setTemp] = useState(1)
  const frames = useMemo(() => softmaxFrames(temp), [temp])
  const t = useTape(frames)
  const fr = t.frame

  const vals = fr.vals || []
  const maxAbs = Math.max(...vals.map((v) => Math.abs(v)), 0.001)
  const st = {}
  if (fr.hi !== undefined) st[fr.hi] = fr.stage === 'loss' ? 'done' : 'probe'

  return (
    <Lab
      tape={t}
      trace={ML_TRACES.softmax}
      controls={
        <Pick
          label="temperature"
          value={temp}
          onChange={setTemp}
          options={[
            { v: 0.5, t: '0.5 sharp' },
            { v: 1, t: '1.0' },
            { v: 2, t: '2.0 flat' },
          ]}
        />
      }
    >
      <ArrayRow vals={vals} states={st} label={fr.stage} w={70} />
      <div style={{ display: 'flex', gap: 4, marginTop: 10, marginLeft: 54, alignItems: 'flex-end', height: 70 }}>
        {vals.map((v, i) => (
          <div
            key={i}
            style={{
              width: 70,
              height: Math.max(2, (Math.abs(v) / maxAbs) * 66),
              background: i === fr.hi ? C.rust : i === TRUE_LABEL && fr.stage === 'loss' ? C.teal : '#c3d0de',
              border: `1px solid ${i === fr.hi ? C.rust : C.line}`,
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <Chips
          title="class"
          items={LOGITS.map((_, i) => ({
            t: i === TRUE_LABEL ? `${i} ← true` : String(i),
            state: i === TRUE_LABEL ? 'done' : 'idle',
          }))}
        />
      </div>
    </Lab>
  )
}

/* ------------------------------------------------------------------
   23 · Scaled dot-product attention
   ------------------------------------------------------------------ */

const TOKENS = ['the', 'cat', 'sat', 'down']
const Q = [[1, 0], [0.8, 0.6], [0, 1], [0.6, 0.8]]
const K = [[1, 0], [0.9, 0.4], [0.1, 1], [0.5, 0.9]]
const V = [[10, 0], [0, 10], [5, 5], [2, 8]]

function matmulT(a, b) {
  return a.map((ra) => b.map((rb) => ra.reduce((s, x, i) => s + x * rb[i], 0)))
}

function attnFrames(causal) {
  const d = 2
  const raw = matmulT(Q, K)
  const scaled = raw.map((r) => r.map((x) => x / Math.sqrt(d)))
  const masked = scaled.map((r, i) => r.map((x, j) => (causal && j > i ? -Infinity : x)))
  const weights = masked.map((r) => {
    const mx = Math.max(...r.filter((x) => x !== -Infinity))
    const ex = r.map((x) => (x === -Infinity ? 0 : Math.exp(x - mx)))
    const s = ex.reduce((a, b) => a + b, 0)
    return ex.map((x) => x / s)
  })
  const out = weights.map((w) => V[0].map((_, c) => w.reduce((s, wv, i) => s + wv * V[i][c], 0)))

  return [
    {
      m: raw.map((r) => r.map(r2)),
      stage: 'scores = Q · Kᵀ',
      note: `Every query row dotted with every key row. Cell (i, j) is "how much does token i want to look at token j". This matrix is n × n, which is exactly why attention is quadratic in sequence length — at 8k tokens that is 64M cells per head, per layer.`,
      vars: { shape: `${TOKENS.length} × ${TOKENS.length}` },
      ln: 2,
    },
    {
      m: scaled.map((r) => r.map(r2)),
      stage: 'scaled by 1/√d',
      note: `Divide by √d (here √2 ≈ 1.41). Without this the dot products grow with dimension, softmax saturates, and the gradients vanish. It is one line and it is the difference between training and not training.`,
      vars: { d, 'divisor': r2(Math.sqrt(d)) },
      ln: 3,
    },
    {
      m: masked.map((r) => r.map((x) => (x === -Infinity ? '−∞' : r2(x)))),
      stage: causal ? 'causal mask applied' : 'no mask',
      mask: causal,
      note: causal
        ? `Positions to the right are set to −∞ before the softmax, so they receive exactly zero weight. −∞ and not a large negative number, and before the softmax and not after — masking afterwards leaves the probabilities unnormalised.`
        : `No mask: every token may attend to every other, including the future. This is what an encoder does. A decoder must not, or it trivially cheats at next-token prediction.`,
      ln: causal ? 4 : 5,
    },
    {
      m: weights.map((r) => r.map(r3)),
      stage: 'softmax over each row',
      rows: true,
      note: `Softmax along each row, so every row sums to 1. Read row i as a distribution: where token "${TOKENS[0]}" through "${TOKENS[3]}" each spend their attention. These weights are what people plot when they show you an attention map.`,
      vars: { 'row sums': '1.000' },
      ln: 6,
    },
    {
      m: out.map((r) => r.map(r2)),
      stage: 'output = weights · V',
      done: true,
      note: `Each output row is a weighted average of the value vectors, using that row's attention weights. Note the shape: n × d_v, the same length as the input. That is why you can stack these — and why the KV cache exists, since at generation time the K and V rows for past tokens never change.`,
      vars: { shape: `${TOKENS.length} × 2` },
      ln: 7,
    },
  ]
}

export function LabAttention() {
  const [causal, setCausal] = useState(true)
  const frames = useMemo(() => attnFrames(causal), [causal])
  const t = useTape(frames)
  const fr = t.frame

  const states = {}
  const m = fr.m || []
  m.forEach((row, i) =>
    row.forEach((v, j) => {
      if (fr.mask && j > i) states[`${i},${j}`] = 'dim'
      else if (fr.rows && v >= 0.4) states[`${i},${j}`] = 'done'
      else if (fr.done) states[`${i},${j}`] = 'win'
    }),
  )

  return (
    <Lab
      tape={t}
      trace={ML_TRACES.attention}
      controls={
        <Pick
          label="mask"
          value={causal}
          onChange={setCausal}
          options={[
            { v: true, t: 'causal (decoder)' },
            { v: false, t: 'none (encoder)' },
          ]}
        />
      }
    >
      <div style={{ fontFamily: mono, fontSize: 11, color: C.mute, marginBottom: 6 }}>
        {fr.stage}
      </div>
      <TableView
        colHead={fr.done ? ['v₀', 'v₁'] : TOKENS}
        rowHead={TOKENS}
        cells={m}
        states={states}
        cw={62}
      />
    </Lab>
  )
}

/* ------------------------------------------------------------------
   24 · Top-k retrieval
   ------------------------------------------------------------------ */

const ITEMS = [
  ['doc-a', [0.9, 0.1]], ['doc-b', [0.2, 0.98]], ['doc-c', [0.7, 0.7]],
  ['doc-d', [0.95, 0.3]], ['doc-e', [0.1, 0.2]], ['doc-f', [0.6, 0.85]],
  ['doc-g', [0.99, 0.05]], ['doc-h', [0.35, 0.4]],
]
const QUERY = [0.85, 0.4]

function cosine(a, b) {
  const dot = a[0] * b[0] + a[1] * b[1]
  const na = Math.hypot(...a)
  const nb = Math.hypot(...b)
  return dot / (na * nb)
}

function topkFrames(k) {
  const frames = []
  const heap = [] // kept sorted ascending; heap[0] is the weakest kept
  frames.push({
    heap: [],
    note: `Score every item against the query, but keep only the best k. The move is a MIN-heap of size k: its root is the weakest thing you are still holding, so one comparison tells you whether a new item is worth keeping.`,
    vars: { k, items: ITEMS.length },
    ln: 1,
  })
  ITEMS.forEach(([name, vec], i) => {
    const s = cosine(QUERY, vec)
    const full = heap.length >= k
    const beats = !full || s > heap[0].s
    frames.push({
      i,
      score: r3(s),
      heap: heap.map((h) => ({ ...h })),
      beats,
      full,
      note: `${name}: cosine similarity ${r3(s)}. ${
        !full
          ? `The heap is not full yet, so keep it unconditionally.`
          : beats
            ? `That beats the weakest kept item (${r3(heap[0].s)}), so push it and evict the root.`
            : `That does not beat the weakest kept item (${r3(heap[0].s)}), so discard it without touching the heap. Most items take this branch, which is why the heap stays at size k.`
      }`,
      vars: { item: name, score: r3(s), 'heap size': heap.length },
      ln: !full ? 4 : beats ? 6 : 3,
    })
    if (beats) {
      heap.push({ name, s })
      heap.sort((a, b) => a.s - b.s)
      if (heap.length > k) heap.shift()
    }
  })
  const best = [...heap].sort((a, b) => b.s - a.s)
  frames.push({
    heap: heap.map((h) => ({ ...h })),
    done: true,
    note: `Top ${k}: ${best.map((h) => `${h.name} (${r3(h.s)})`).join(', ')}. Cost is O(n log k), not O(n log n) — you never sorted the other items. At real scale you do not score all n either: an ANN index gives you a few hundred candidates first, and this heap ranks those. That two-stage shape is the answer to almost every retrieval design question.`,
    vars: { cost: 'O(n log k)' },
    ln: 8,
  })
  return frames
}

export function LabTopK() {
  const [k, setK] = useState(3)
  const frames = useMemo(() => topkFrames(k), [k])
  const t = useTape(frames)
  const fr = t.frame

  const kept = new Set((fr.heap || []).map((h) => h.name))
  const st = {}
  const subs = {}
  ITEMS.forEach(([name], i) => {
    if (kept.has(name)) st[i] = 'done'
    subs[i] = name.slice(4)
  })
  if (fr.i !== undefined) st[fr.i] = fr.beats ? 'active' : 'dim'

  return (
    <Lab
      tape={t}
      trace={ML_TRACES.topk}
      controls={
        <Pick label="k" value={k} onChange={setK} options={[2, 3, 4]} />
      }
    >
      <ArrayRow
        vals={ITEMS.map(([, v]) => r2(cosine(QUERY, v)))}
        states={st}
        subs={subs}
        label="cos sim"
        w={54}
      />
      <div style={{ marginTop: 12 }}>
        <Chips
          title={`heap (${(fr.heap || []).length}/${k})`}
          items={(fr.heap || []).map((h, idx) => ({
            t: `${h.name} ${r3(h.s)}`,
            state: idx === 0 && (fr.heap || []).length >= k ? 'queued' : 'done',
          }))}
        />
        <div style={{ fontFamily: mono, fontSize: 10.5, color: C.mute, marginTop: 4 }}>
          the amber chip is the heap root — the weakest item you are still holding
        </div>
      </div>
    </Lab>
  )
}
