import {
  STRUCTURES,
  STDLIB,
  GOTCHAS,
  SNIPPETS,
  PERF,
  DICT_VS_SET,
} from '../data/pyCheatSheet.js'
import { Rich, Cell, Code, Sheet } from './sheetui.jsx'
import './cheatsheet.css'

/* Python comments start with #, so the Code helper needs telling. */
const Py = ({ children }) => <Code comment="#">{children}</Code>

export default function PythonCheatSheet() {
  return (
    <div className="cs">
      <div className="bar">
        <b>Python for LeetCode</b>
        <span>Four sheets. Prints to Letter or A4 — figures and colour chips included.</span>
        <button type="button" onClick={() => window.print()}>
          Print
        </button>
      </div>

      {/* ============================ SHEET 1 ============================ */}
      <Sheet title="Structures & what they cost" n={1} foot="Python for LeetCode">
        <p className="lede">
          Python gives you fewer containers than C++ and better defaults. The whole game is
          knowing which builtin already does your loop.
        </p>

        <figure className="fig">
          <figcaption>Fig. 1 — choosing a structure under interview pressure</figcaption>
          <svg viewBox="0 0 700 168" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="66" width="112" height="30" className="sv-l" />
            <text x="60" y="79" className="sv-tl" textAnchor="middle">What do you need</text>
            <text x="60" y="90" className="sv-tl" textAnchor="middle">from the data?</text>
            <path d="M116 81 H150" className="sv-l" />
            <path d="M150 20 V142" className="sv-lr" />

            <path d="M150 20 H182" className="sv-l" />
            <rect x="182" y="8" width="146" height="24" className="sv-l" />
            <text x="188" y="24" className="sv-tl">key → value, or seen-before</text>
            <path d="M328 20 H360" className="sv-l" />
            <rect x="360" y="6" width="146" height="28" className="sv-l" />
            <text x="366" y="18" className="sv-t">dict / set</text>
            <text x="366" y="29" className="sv-tl">O(1) avg · insertion-ordered</text>
            <path d="M506 20 H538" className="sv-lr" />
            <text x="542" y="17" className="sv-tl">just counting?</text>
            <text x="542" y="27" className="sv-tl">→ Counter</text>

            <path d="M150 55 H182" className="sv-l" />
            <rect x="182" y="43" width="146" height="24" className="sv-l" />
            <text x="188" y="59" className="sv-tl">index access, growth at end</text>
            <path d="M328 55 H360" className="sv-l" />
            <rect x="360" y="41" width="146" height="28" className="sv-l" />
            <text x="366" y="53" className="sv-t">list</text>
            <text x="366" y="64" className="sv-tl">default choice · pop(0) is O(n)</text>
            <path d="M506 55 H538" className="sv-lr" />
            <text x="542" y="52" className="sv-tl">popping the front?</text>
            <text x="542" y="62" className="sv-tl">→ deque</text>

            <path d="M150 90 H182" className="sv-l" />
            <rect x="182" y="78" width="146" height="24" className="sv-l" />
            <text x="188" y="94" className="sv-tl">only the best element</text>
            <path d="M328 90 H360" className="sv-l" />
            <rect x="360" y="76" width="146" height="28" className="sv-l" />
            <text x="366" y="88" className="sv-t">heapq</text>
            <text x="366" y="99" className="sv-tl">min-heap only · negate for max</text>
            <path d="M506 90 H538" className="sv-lr" />
            <text x="542" y="87" className="sv-tl">k is small and fixed?</text>
            <text x="542" y="97" className="sv-tl">→ nlargest</text>

            <path d="M150 125 H182" className="sv-l" />
            <rect x="182" y="113" width="146" height="24" className="sv-l" />
            <text x="188" y="129" className="sv-tl">sorted, with inserts</text>
            <path d="M328 125 H360" className="sv-l" />
            <rect x="360" y="111" width="146" height="28" className="sv-l" />
            <text x="366" y="123" className="sv-t">bisect on a list</text>
            <text x="366" y="134" className="sv-tl">O(log n) find · O(n) insert</text>
            <path d="M506 125 H538" className="sv-lr" />
            <text x="542" y="122" className="sv-tl">need O(log n) inserts?</text>
            <text x="542" y="132" className="sv-tl">→ SortedList (3rd party)</text>

            <text x="4" y="160" className="sv-tl">
              Solid arrow = the common answer. Hairline = the follow-up the interviewer asks next.
            </text>
          </svg>
        </figure>

        <h2>
          <span>Structure reference</span>
          <em>avg case unless noted</em>
        </h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: '19%' }}>Structure</th>
              <th style={{ width: '12%' }}>Access</th>
              <th style={{ width: '14%' }}>Insert</th>
              <th style={{ width: '11%' }}>Find</th>
              <th>Reach for it when</th>
            </tr>
            {STRUCTURES.map((c) => (
              <tr key={c.name}>
                <td>
                  <code>{c.name}</code>
                </td>
                <td className="c">
                  <Cell items={c.access} />
                </td>
                <td className="c">
                  <Cell items={c.insert} />
                </td>
                <td className="c">
                  <Cell items={c.find} />
                </td>
                <td>
                  <Rich text={c.use} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cols">
          <div>
            <h2>
              <span>dict and set, specifically</span>
            </h2>
            <ul>
              {DICT_VS_SET.map((l) => (
                <li key={l}>
                  <Rich text={l} />
                </li>
              ))}
            </ul>
            <Py>{SNIPPETS.io}</Py>
          </div>
          <div>
            <h2>
              <span>Building things correctly</span>
            </h2>
            <Py>{SNIPPETS.building}</Py>
            <div className="note">
              <b>[[0] * m] * n is the bug you will write once.</b> The outer{' '}
              <code>*&nbsp;n</code> copies the <em>reference</em>, so all n rows are one list and{' '}
              <code>g[1][2] = 5</code> sets column 2 in every row. Always use the comprehension.
            </div>
          </div>
        </div>
      </Sheet>

      {/* ============================ SHEET 2 ============================ */}
      <Sheet title="The standard library" n={2} foot="Python for LeetCode">
        <p className="lede">
          Most Python interview answers are shorter because a builtin already did the loop.
          Knowing six of these is worth more than any syntax trick.
        </p>

        <h2>
          <span>What to import</span>
          <em>the ones that actually come up</em>
        </h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: '30%' }}>Call</th>
              <th style={{ width: '12%' }}>Cost</th>
              <th>What it does / when</th>
            </tr>
            {STDLIB.map(([call, cost, note]) => (
              <tr key={call}>
                <td>
                  <code>{call}</code>
                </td>
                <td className="c">
                  <span className={`chip ${cost.k}`}>{cost.c}</span>
                </td>
                <td>
                  <Rich text={note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cols">
          <div>
            <figure className="fig">
              <figcaption>Fig. 2 — bisect_left vs bisect_right with duplicates</figcaption>
              <svg viewBox="0 0 340 108" xmlns="http://www.w3.org/2000/svg">
                {[1, 2, 2, 2, 5, 7].map((v, i) => (
                  <g key={i}>
                    <rect x={10 + i * 36} y="34" width="36" height="26" className="sv-l" />
                    <text x={28 + i * 36} y="51" className="sv-t" textAnchor="middle">
                      {v}
                    </text>
                    <text x={28 + i * 36} y="26" className="sv-t" textAnchor="middle">
                      {i}
                    </text>
                  </g>
                ))}
                <text x="10" y="18" className="sv-tl">index</text>
                <path d="M46 74 V62" className="sv-l" />
                <text x="46" y="86" className="sv-t" textAnchor="middle">bisect_left(2) = 1</text>
                <path d="M154 74 V62" className="sv-l" />
                <path d="M154 92 V78" className="sv-lr" />
                <text x="200" y="100" className="sv-t" textAnchor="middle">bisect_right(2) = 4</text>
                <text x="250" y="45" className="sv-tl">count of 2s =</text>
                <text x="250" y="56" className="sv-tl">right − left = 3</text>
              </svg>
            </figure>
            <div className="note">
              <b>bisect takes a key since 3.10.</b> Before that you had to build a parallel list
              of keys, which is why so much old code decorates and undecorates. Say which version
              you are assuming.
            </div>
            <Py>{SNIPPETS.memo}</Py>
          </div>

          <div>
            <figure className="fig">
              <figcaption>Fig. 3 — heapq is a min-heap, always</figcaption>
              <svg viewBox="0 0 340 104" xmlns="http://www.w3.org/2000/svg">
                <text x="6" y="12" className="sv-t">heappush(h, x)</text>
                <text x="6" y="23" className="sv-tl">smallest is always h[0]</text>
                <rect x="18" y="30" width="30" height="18" className="sv-l" />
                <text x="33" y="43" className="sv-t" textAnchor="middle">4</text>
                <path d="M33 48 L14 62 M33 48 L52 62" className="sv-l" />
                <rect x="0" y="62" width="28" height="18" className="sv-l" />
                <text x="14" y="75" className="sv-t" textAnchor="middle">6</text>
                <rect x="38" y="62" width="28" height="18" className="sv-l" />
                <text x="52" y="75" className="sv-t" textAnchor="middle">9</text>
                <text x="6" y="95" className="sv-tl">h[0] = 4</text>

                <path d="M110 8 V98" className="sv-lr" />
                <text x="128" y="12" className="sv-t">heappush(h, -x)</text>
                <text x="128" y="23" className="sv-tl">negate for a max-heap</text>
                <rect x="140" y="30" width="30" height="18" className="sv-l" />
                <text x="155" y="43" className="sv-t" textAnchor="middle">-9</text>
                <path d="M155 48 L136 62 M155 48 L174 62" className="sv-l" />
                <rect x="122" y="62" width="28" height="18" className="sv-l" />
                <text x="136" y="75" className="sv-t" textAnchor="middle">-6</text>
                <rect x="160" y="62" width="28" height="18" className="sv-l" />
                <text x="174" y="75" className="sv-t" textAnchor="middle">-4</text>
                <text x="128" y="95" className="sv-tl">-h[0] = 9</text>

                <path d="M210 8 V98" className="sv-lr" />
                <text x="224" y="20" className="sv-tl">There is no comparator.</text>
                <text x="224" y="34" className="sv-tl">Push a tuple whose natural</text>
                <text x="224" y="46" className="sv-tl">order is the order you want,</text>
                <text x="224" y="58" className="sv-tl">with a tiebreaker before any</text>
                <text x="224" y="70" className="sv-tl">object that cannot compare.</text>
              </svg>
            </figure>
            <Py>{SNIPPETS.heap}</Py>
          </div>
        </div>

        <h2>
          <span>Comprehensions &amp; unpacking</span>
        </h2>
        <div className="cols">
          <div>
            <Py>{SNIPPETS.comprehensions}</Py>
          </div>
          <div>
            <Py>{SNIPPETS.unpacking}</Py>
          </div>
        </div>
      </Sheet>

      {/* ============================ SHEET 3 ============================ */}
      <Sheet title="Idioms you'll type every day" n={3} foot="Python for LeetCode">
        <div className="cols">
          <div>
            <h2>
              <span>Strings</span>
            </h2>
            <Py>{SNIPPETS.strings}</Py>
            <h2>
              <span>Sorting</span>
            </h2>
            <Py>{SNIPPETS.sorting}</Py>
            <h2>
              <span>Grids</span>
            </h2>
            <Py>{SNIPPETS.grids}</Py>
          </div>
          <div>
            <h2>
              <span>Numbers &amp; division</span>
            </h2>
            <Py>{SNIPPETS.numbers}</Py>
            <h2>
              <span>BFS, the shape you reuse</span>
            </h2>
            <Py>{SNIPPETS.bfs}</Py>
            <h2>
              <span>Union find</span>
            </h2>
            <Py>{SNIPPETS.dsu}</Py>
          </div>
        </div>
      </Sheet>

      {/* ============================ SHEET 4 ============================ */}
      <Sheet title="Gotchas & boilerplate" n={4} foot="Python for LeetCode">
        <p className="lede">
          Python has fewer ways to crash than C++ and more ways to be quietly wrong. These are
          the quiet ones.
        </p>

        <h2>
          <span>Bugs that cost real interviews</span>
        </h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: '30%' }}>The mistake</th>
              <th style={{ width: '33%' }}>What happens</th>
              <th>The fix</th>
            </tr>
            {GOTCHAS.map(([mistake, what, fix]) => (
              <tr key={mistake}>
                <td>
                  <Rich text={mistake} />
                </td>
                <td>
                  <Rich text={what} />
                </td>
                <td>
                  <Rich text={fix} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cols">
          <div>
            <h2>
              <span>Classes you will be handed</span>
            </h2>
            <Py>{SNIPPETS.classes}</Py>
            <h2>
              <span>What Python actually costs</span>
            </h2>
            <Py>{SNIPPETS.timing}</Py>
          </div>
          <div>
            <h2>
              <span>If TLE hits</span>
            </h2>
            <ul>
              {PERF.map((l) => (
                <li key={l}>
                  <Rich text={l} />
                </li>
              ))}
            </ul>
            <div className="note">
              <b>Say the complexity before you are asked.</b> Then, in Python, say the constant
              too: &ldquo;this is O(n log n), and the sort is in C so it will be fast; the O(n)
              loop above it is the part I would rewrite if we needed more.&rdquo;
            </div>
            <div className="note">
              <b>Ask before importing anything exotic.</b> `collections`, `heapq`, `bisect`,
              `itertools`, `functools` and `math` are always fine. `sortedcontainers` and `numpy`
              are not in the stdlib — name them, then ask.
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
