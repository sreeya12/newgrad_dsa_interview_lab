import {
  CONTAINERS,
  ALGOS,
  GOTCHAS,
  SNIPPETS,
  PERF,
  ORDERED_VS_UNORDERED,
} from '../data/cppCheatSheet.js'
import './cheatsheet.css'

/* `backticks` in the content become <code> spans. */
function Rich({ text }) {
  return text.split('`').map((part, i) =>
    i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>,
  )
}

/* Cost chips, plain text and line breaks inside one table cell. */
function Cell({ items }) {
  return items.map((it, i) => {
    if (it.br) return <br key={i} />
    if (it.c)
      return (
        <span key={i} className={`chip ${it.k}`} style={i ? { marginLeft: 3 } : undefined}>
          {it.c}
        </span>
      )
    return <span key={i}>{i ? ' ' : ''}{it.t}</span>
  })
}

/* Dim everything after // on a line, so the comments read as annotations. */
function Code({ children }) {
  return (
    <pre>
      {children.split('\n').map((line, i) => {
        const at = line.indexOf('//')
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

function Sheet({ title, n, children }) {
  return (
    <section className="sheet">
      <div className="sheethead">
        <h1>{title}</h1>
        <span className="pg">Sheet {n} of 4</span>
      </div>
      {children}
      <div className="foot">
        <span>C++ for LeetCode</span>
        <span>
          Sheet {n} — {title}
        </span>
      </div>
    </section>
  )
}

export default function CppCheatSheet() {
  return (
    <div className="cs">
      <div className="bar">
        <b>C++ for LeetCode</b>
        <span>Four sheets. Prints to Letter or A4 — figures and colour chips included.</span>
        <button type="button" onClick={() => window.print()}>
          Print
        </button>
      </div>

      {/* ============================ SHEET 1 ============================ */}
      <Sheet title="Containers & what they cost" n={1}>
        <p className="lede">
          Pick the container out loud before you write the loop. Naming the cost is half the
          interview.
        </p>

        <figure className="fig">
          <figcaption>Fig. 1 — choosing a container under interview pressure</figcaption>
          <svg viewBox="0 0 700 168" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="66" width="112" height="30" className="sv-l" />
            <text x="60" y="79" className="sv-tl" textAnchor="middle">What do you need</text>
            <text x="60" y="90" className="sv-tl" textAnchor="middle">from the data?</text>
            <path d="M116 81 H150" className="sv-l" />
            <path d="M150 20 V142" className="sv-lr" />

            <path d="M150 20 H182" className="sv-l" />
            <rect x="182" y="8" width="146" height="24" className="sv-l" />
            <text x="188" y="24" className="sv-tl">key → value, fast lookup</text>
            <path d="M328 20 H360" className="sv-l" />
            <rect x="360" y="6" width="146" height="28" className="sv-l" />
            <text x="366" y="18" className="sv-t">unordered_map</text>
            <text x="366" y="29" className="sv-tl">O(1) avg · no order</text>
            <path d="M506 20 H538" className="sv-lr" />
            <text x="542" y="17" className="sv-tl">need sorted keys,</text>
            <text x="542" y="27" className="sv-tl">ranges? → map</text>

            <path d="M150 55 H182" className="sv-l" />
            <rect x="182" y="43" width="146" height="24" className="sv-l" />
            <text x="188" y="59" className="sv-tl">index access, growth at end</text>
            <path d="M328 55 H360" className="sv-l" />
            <rect x="360" y="41" width="146" height="28" className="sv-l" />
            <text x="366" y="53" className="sv-t">vector</text>
            <text x="366" y="64" className="sv-tl">default choice · contiguous</text>
            <path d="M506 55 H538" className="sv-lr" />
            <text x="542" y="52" className="sv-tl">both ends?</text>
            <text x="542" y="62" className="sv-tl">→ deque</text>

            <path d="M150 90 H182" className="sv-l" />
            <rect x="182" y="78" width="146" height="24" className="sv-l" />
            <text x="188" y="94" className="sv-tl">only the best element</text>
            <path d="M328 90 H360" className="sv-l" />
            <rect x="360" y="76" width="146" height="28" className="sv-l" />
            <text x="366" y="88" className="sv-t">priority_queue</text>
            <text x="366" y="99" className="sv-tl">top-k · scheduling · Dijkstra</text>
            <path d="M506 90 H538" className="sv-lr" />
            <text x="542" y="87" className="sv-tl">need to erase</text>
            <text x="542" y="97" className="sv-tl">arbitrary? → multiset</text>

            <path d="M150 125 H182" className="sv-l" />
            <rect x="182" y="113" width="146" height="24" className="sv-l" />
            <text x="188" y="129" className="sv-tl">order of arrival matters</text>
            <path d="M328 125 H360" className="sv-l" />
            <rect x="360" y="111" width="146" height="28" className="sv-l" />
            <text x="366" y="123" className="sv-t">stack / queue</text>
            <text x="366" y="134" className="sv-tl">DFS · BFS · monotonic</text>
            <path d="M506 125 H538" className="sv-lr" />
            <text x="542" y="122" className="sv-tl">sliding window max?</text>
            <text x="542" y="132" className="sv-tl">→ deque</text>

            <text x="4" y="160" className="sv-tl">
              Solid arrow = the common answer. Hairline = the follow-up the interviewer asks next.
            </text>
          </svg>
        </figure>

        <h2>
          <span>Container reference</span>
          <em>avg case unless noted</em>
        </h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: '19%' }}>Container</th>
              <th style={{ width: '11%' }}>Access</th>
              <th style={{ width: '13%' }}>Insert</th>
              <th style={{ width: '13%' }}>Find / erase</th>
              <th>Reach for it when</th>
            </tr>
            {CONTAINERS.map((c) => (
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
              <span>Ordered vs unordered</span>
            </h2>
            <ul>
              {ORDERED_VS_UNORDERED.map((l) => (
                <li key={l}>
                  <Rich text={l} />
                </li>
              ))}
            </ul>
            <Code>{SNIPPETS.pairKeys}</Code>
          </div>
          <div>
            <h2>
              <span>Declaring things fast</span>
            </h2>
            <Code>{SNIPPETS.declaring}</Code>
            <div className="note">
              <b>vector&lt;bool&gt; is not a vector.</b> It packs bits, so{' '}
              <code>auto&amp; b = v[i]</code> does not give you a real reference. For a visited
              grid it is fine; if you need references, use <code>vector&lt;char&gt;</code>.
            </div>
          </div>
        </div>
      </Sheet>

      {/* ============================ SHEET 2 ============================ */}
      <Sheet title="Algorithms & comparators" n={2}>
        <p className="lede">
          Everything here is one <code>#include &lt;algorithm&gt;</code> away. Knowing four of
          these saves you fifteen lines under pressure.
        </p>

        <h2>
          <span>&lt;algorithm&gt; and &lt;numeric&gt;</span>
          <em>the ones that actually come up</em>
        </h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: '29%' }}>Call</th>
              <th style={{ width: '12%' }}>Cost</th>
              <th>What it does / when</th>
            </tr>
            {ALGOS.map(([call, cost, note]) => (
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
              <figcaption>Fig. 2 — lower_bound vs upper_bound with duplicates</figcaption>
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
                <text x="46" y="86" className="sv-t" textAnchor="middle">lower_bound(2) = 1</text>
                <path d="M154 74 V62" className="sv-l" />
                <path d="M154 92 V78" className="sv-lr" />
                <text x="200" y="100" className="sv-t" textAnchor="middle">upper_bound(2) = 4</text>
                <text x="250" y="45" className="sv-tl">count of 2s =</text>
                <text x="250" y="56" className="sv-tl">upper − lower = 3</text>
              </svg>
            </figure>
            <div className="note">
              <b>On a set or map, use the member.</b> <code>s.lower_bound(x)</code> is O(log n);{' '}
              <code>std::lower_bound(s.begin(),…)</code> degrades to O(n) because the iterators
              are not random access.
            </div>
            <Code>{SNIPPETS.boundIdx}</Code>
          </div>

          <div>
            <figure className="fig">
              <figcaption>Fig. 3 — priority_queue comparator orientation</figcaption>
              <svg viewBox="0 0 340 104" xmlns="http://www.w3.org/2000/svg">
                <text x="6" y="12" className="sv-t">priority_queue&lt;int&gt;</text>
                <text x="6" y="23" className="sv-tl">default less&lt;&gt; → MAX at top</text>
                <rect x="18" y="30" width="30" height="18" className="sv-l" />
                <text x="33" y="43" className="sv-t" textAnchor="middle">9</text>
                <path d="M33 48 L14 62 M33 48 L52 62" className="sv-l" />
                <rect x="0" y="62" width="28" height="18" className="sv-l" />
                <text x="14" y="75" className="sv-t" textAnchor="middle">6</text>
                <rect x="38" y="62" width="28" height="18" className="sv-l" />
                <text x="52" y="75" className="sv-t" textAnchor="middle">4</text>
                <text x="6" y="95" className="sv-tl">top() = 9</text>

                <path d="M110 8 V98" className="sv-lr" />
                <text x="128" y="12" className="sv-t">…, greater&lt;int&gt;&gt;</text>
                <text x="128" y="23" className="sv-tl">→ MIN at top (top-k, Dijkstra)</text>
                <rect x="140" y="30" width="30" height="18" className="sv-l" />
                <text x="155" y="43" className="sv-t" textAnchor="middle">4</text>
                <path d="M155 48 L136 62 M155 48 L174 62" className="sv-l" />
                <rect x="122" y="62" width="28" height="18" className="sv-l" />
                <text x="136" y="75" className="sv-t" textAnchor="middle">6</text>
                <rect x="160" y="62" width="28" height="18" className="sv-l" />
                <text x="174" y="75" className="sv-t" textAnchor="middle">9</text>
                <text x="128" y="95" className="sv-tl">top() = 4</text>

                <path d="M210 8 V98" className="sv-lr" />
                <text x="224" y="20" className="sv-tl">The rule that trips people:</text>
                <text x="224" y="34" className="sv-tl">cmp(a,b) == true means</text>
                <text x="224" y="46" className="sv-tl">a has LOWER priority than b,</text>
                <text x="224" y="58" className="sv-tl">so it comes out LATER.</text>
                <text x="224" y="76" className="sv-tl">It reads backwards from sort().</text>
              </svg>
            </figure>
            <Code>{SNIPPETS.comparators}</Code>
          </div>
        </div>

        <h2>
          <span>Lambdas &amp; recursion inside a method</span>
        </h2>
        <div className="cols">
          <div>
            <Code>{SNIPPETS.recursiveLambda}</Code>
          </div>
          <div>
            <Code>{SNIPPETS.captures}</Code>
          </div>
        </div>
      </Sheet>

      {/* ============================ SHEET 3 ============================ */}
      <Sheet title="Idioms you'll type every day" n={3}>
        <div className="cols">
          <div>
            <h2>
              <span>Strings</span>
            </h2>
            <Code>{SNIPPETS.strings}</Code>
            <h2>
              <span>Hash maps</span>
            </h2>
            <Code>{SNIPPETS.hashmaps}</Code>
            <h2>
              <span>Grids</span>
            </h2>
            <Code>{SNIPPETS.grids}</Code>
          </div>
          <div>
            <h2>
              <span>Numbers &amp; limits</span>
            </h2>
            <Code>{SNIPPETS.numbers}</Code>
            <h2>
              <span>Bit tricks</span>
            </h2>
            <Code>{SNIPPETS.bits}</Code>
            <h2>
              <span>Sorting recipes</span>
            </h2>
            <Code>{SNIPPETS.sorting}</Code>
            <h2>
              <span>Reading input structures</span>
            </h2>
            <Code>{SNIPPETS.loops}</Code>
          </div>
        </div>
      </Sheet>

      {/* ============================ SHEET 4 ============================ */}
      <Sheet title="Gotchas & boilerplate" n={4}>
        <p className="lede">
          Nine of the ten wrong answers you will submit are on this first list. Read it after a
          failed test case before you re-read your logic.
        </p>

        <h2>
          <span>Bugs that cost real interviews</span>
        </h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: '33%' }}>The mistake</th>
              <th style={{ width: '30%' }}>What happens</th>
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
              <span>Given structures — memorize these</span>
            </h2>
            <Code>{SNIPPETS.structs}</Code>
            <h2>
              <span>Union find</span>
            </h2>
            <Code>{SNIPPETS.dsu}</Code>
          </div>
          <div>
            <h2>
              <span>Trie node</span>
            </h2>
            <Code>{SNIPPETS.trie}</Code>
            <h2>
              <span>Custom hash for pair</span>
            </h2>
            <Code>{SNIPPETS.pairHash}</Code>
            <h2>
              <span>Performance, if TLE hits</span>
            </h2>
            <ul>
              {PERF.map((l) => (
                <li key={l}>
                  <Rich text={l} />
                </li>
              ))}
            </ul>
            <div className="note">
              <b>Say the complexity before you are asked.</b> Finish every problem with one
              sentence: time, space, and what dominates. It costs five seconds and it is scored.
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
