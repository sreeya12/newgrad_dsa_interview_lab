# DSA Plan

A React + Vite study hub for new-grad SDE / MLE interview prep. Eight routes, one
design system, every code sample in C++ or Python, all progress stored in the
browser.

## Routes

| Path              | Page          | What it holds                                                       |
| ----------------- | ------------- | ------------------------------------------------------------------- |
| `/`               | Patterns      | 21 pattern cards keyed to the trigger phrase that gives them away   |
| `/leetcode-45`    | LeetCode 45   | 45-day problem plan, review queue, practice method                  |
| `/system-design`  | Design 45     | 45-day design plan, frameworks, 2026 round map                      |
| `/dsa-explained`  | Lab bench     | 19 interactive modules — step a tape through each algorithm         |
| `/cpp-cheatsheet` | C++ sheets    | Four printable C++ reference sheets with figures                    |
| `/python-cheatsheet` | Py sheets  | Four printable Python sheets: costs, stdlib, idioms, gotchas        |
| `/ml-track`       | ML track      | 54 breadth prompts, 6 worked ML system designs, the 50-min script   |
| `/dsa-reference`  | Reference     | Plain-text topic reference: idea, costs, patterns, pitfalls         |

Routing is a ~30-line hash router (`src/router.jsx` + `src/components/Link.jsx`) —
no `react-router` dependency. Add a route by dropping a page in `src/pages/`,
then registering it in `src/routes.js` (nav label) and the `views` map in
`src/App.jsx`.

## The design system

One palette for every page, defined once in `src/index.css`:

```
--paper  #EDF0F3   page ground (with the 26px grid drawn on <body>)
--ink    #16233A   text, nav bar, active chips
--ink2   #4A5A72   secondary text
--line   #C6D1DC   rules and borders
--white  #FBFCFD   card surfaces
--rust   #B8433A   active tab underline, trigger quotes
--accent           per-page: teal on LeetCode, blue on Design
```

Type: **Space Grotesk** for display headings (`.disp`), **IBM Plex Sans** for
body, **IBM Plex Mono** for labels, counters and code. Loaded from Google Fonts
in `index.html`.

Page stylesheets are all scoped to a root class so nothing leaks between pages:
`.log` (both 45-day logs, in `src/pages/log.css`), `.pat` (patterns),
`.cs` (cheat sheet), `.page` (reference and 404), `.mlt` (ML track, nested
inside `.log` so it reuses the log header, tabs and accordions).

## Editing the content

Page prose lives in data files, separate from the components:

- `src/data/patterns.js` — the 21 trigger cards on the home page
- `src/data/leetcode45.js` — phases, 45 days, problem lists, practice method
- `src/data/systemDesign.js` — phases, 45 days, frameworks, round map
- `src/data/cppCheatSheet.js` — cheat-sheet tables, snippets and gotchas
- `src/data/dsaTopics.js` — the plain reference page
- `src/data/pyCheatSheet.js` — the four Python sheets
- `src/data/mlBreadth.js` — the 54 ML breadth prompts, grouped in 8 sections
- `src/data/mlCases.js` — `SCRIPT` (nine steps) and `CASES` (six worked systems)
- `src/pages/dsalab/modules.jsx` — Lab Bench module content

Each of these has a Python twin holding the same content in the other language:
`patternsPy.js`, `dsaTopicsPy.js`, `dsalab/modulesPy.js`. They are keyed by the
same name or id as the original, so a missing key falls back to C++ rather than
rendering blank.

## The Lab Bench

`/dsa-explained` runs a **tape** per module: precomputed frames you can play,
step, or scrub, with the structure redrawn and narrated at each step.

```
src/pages/DsaExplained.jsx      page shell: rail, masthead, sections
src/pages/dsalab/tokens.js      palette + font stacks
src/pages/dsalab/useTape.js     the play / step / scrub transport
src/pages/dsalab/ui.jsx         renderers: ArrayRow, Diagram, GridView, TableView
src/pages/dsalab/labs.jsx       the 19 labs and their frame generators
src/pages/dsalab/traces.js      the C++ each tape walks, + frame -> line mapping
src/pages/dsalab/modules.jsx    the written content
```

Each tape also drives a **trace**: a listing in `src/pages/dsalab/traces.js`
where the line currently executing is highlighted, so the code, the picture and
the state all move together as you step. A trace is `{ cpp: {code, line}, py: {code, line} }`,
where `line` maps the current frame back to a line number (or an array of them).
That keeps the mapping next to the listing it indexes instead of scattered through
the frame generators, and lets the two languages differ where their line counts
do. `TRACES.tree` is a function of the traversal order, so the listing itself
changes when you switch pre/in/post/BFS.

Modules 01 (cost model) and 19 (bit tricks) have no trace: they are live
parameter explorers rather than stepped algorithms. 22 of the 24 modules on the
MLE track are traced.

## The language toggle

The nav carries a C++ / Python switch that drives every code listing in the app:
lab traces, lab teaching code, pattern templates, reference snippets and the ML
depth blocks. It is a tiny external store (`src/prefs.js`) read through
`useSyncExternalStore` rather than a `useLocalStorage` hook, because five pages
have to see the same value — a hook would give each component its own copy.

```js
import { useLang, pick } from '../prefs.js'
const lang = useLang()          // 'cpp' | 'py'
const trace = pick(TRACES.hash, lang)   // falls back to cpp if py is missing
```

## The MLE track

Selecting MLE anywhere (the switch is shared through `dsa.track`) changes three
things, all additive — nothing on the SDE track is hidden or rewritten:

- the Lab Bench rail grows from 19 to 24 with five ML-native modules —
  gradient descent, k-means, softmax and cross-entropy, attention, top-k
  retrieval (`src/pages/dsalab/mlLabs.jsx`, `mlModules.jsx`, `mlTraces.js`)
- each of the 19 SDE modules gains an ML half: what the structure costs in a
  training or serving system, the code as it appears in an ML codebase, the
  production failure modes, and ML drills (`dsalab/mlDepth.js`, rendered by
  `dsalab/mlDepthView.jsx`). That code stays Python whatever the toggle says,
  because that layer is Python everywhere; the page says so rather than
  looking broken
- `/ml-track` carries the breadth bank, the six worked cases and the script

To add a module: write a frame generator plus a `Lab*` component in `labs.jsx`,
add a trace to `traces.js` and pass it as `<Lab trace={TRACES.x}>`, then add an
entry to `MODULES`.

## Saved state

Everything persists to `localStorage`, so it survives reloads but stays on this
browser:

| Key              | What                                                  |
| ---------------- | ----------------------------------------------------- |
| `dsa.track`      | SDE / MLE — shared by all three pages that offer it   |
| `lc45.state`     | per problem: `done` → `flag` → clear                  |
| `sd45.state`     | per task checkbox                                     |
| `dsa.lab.known`  | Lab Bench "mark solid" flags                          |
| `dsa.lang`       | `cpp` / `py` — every code listing in the app          |
| `mlt.known`      | ML breadth prompts answered cold                      |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```
