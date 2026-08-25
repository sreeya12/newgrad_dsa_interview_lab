/* Content for the four printable Python sheets.
   Cell items: {c,k} = a cost chip, {t} = text, {br} = line break.
   Text fields use `backticks` for inline code spans. */

const chip = (c, k) => ({ c, k })
const txt = (t) => ({ t })
const BR = { br: true }

export const STRUCTURES = [
  {
    name: 'list',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1'), txt('append'), BR, chip('O(n)', 'kn'), txt('insert(0)')],
    find: [chip('O(n)', 'kn')],
    use: 'The default. Dynamic array, not a linked list — `pop(0)` is O(n), which is what `deque` exists for.',
  },
  {
    name: 'deque',
    access: [chip('O(n)', 'kn'), txt('middle')],
    insert: [chip('O(1)', 'k1'), txt('both ends')],
    find: [chip('O(n)', 'kn')],
    use: 'Every BFS queue. `popleft()` is the whole reason. Also `maxlen=` for a fixed window.',
  },
  {
    name: 'dict',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1')],
    find: [chip('O(1)', 'k1')],
    use: 'Insertion-ordered since 3.7, and you can rely on that. Missing key on `d[k]` raises.',
  },
  {
    name: 'set / frozenset',
    access: [txt('—')],
    insert: [chip('O(1)', 'k1')],
    find: [chip('O(1)', 'k1')],
    use: 'Membership, dedupe, and `&` `|` `-` `^` for intersect / union / difference.',
  },
  {
    name: 'Counter',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1')],
    find: [chip('O(1)', 'k1')],
    use: 'A dict subclass. `Counter(s)` is a whole counting loop; `most_common(k)` is top-k.',
  },
  {
    name: 'defaultdict',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1')],
    find: [chip('O(1)', 'k1')],
    use: 'Grouping and adjacency lists: `adj[u].append(v)` with no setup.',
  },
  {
    name: 'heapq (on a list)',
    access: [chip('O(1)', 'k1'), txt('h[0]')],
    insert: [chip('O(log n)', 'klog')],
    find: [txt('top only')],
    use: 'ALWAYS a min-heap. Negate for a max-heap. `heapify` is O(n).',
  },
  {
    name: 'tuple',
    access: [chip('O(1)', 'k1')],
    insert: [txt('immutable')],
    find: [chip('O(n)', 'kn')],
    use: 'Hashable, so `(r, c)` is a dict/set key with no encoding trick. Compares lexicographically.',
  },
  {
    name: 'str',
    access: [chip('O(1)', 'k1')],
    insert: [txt('immutable')],
    find: [chip('O(n·m)', 'kn')],
    use: 'Immutable: `s += x` in a loop is O(n²). Build a list, then `"".join(parts)`.',
  },
  {
    name: 'SortedList',
    access: [chip('O(log n)', 'klog')],
    insert: [chip('O(log n)', 'klog')],
    find: [chip('O(log n)', 'klog')],
    use: 'From `sortedcontainers`, not the stdlib. Say it exists, then ask if you may use it.',
  },
]

export const STDLIB = [
  ['collections.deque', chip('O(1)', 'k1'), 'Both-ended queue. `popleft` is why BFS is O(V+E) and not O(V²).'],
  ['collections.Counter', chip('O(n)', 'kn'), 'Counting in one call. `most_common(k)`, and it subtracts: `c1 - c2`.'],
  ['collections.defaultdict', chip('O(1)', 'k1'), 'Grouping without `setdefault`. Watch it: reading a key inserts it.'],
  ['heapq.heappush / heappop', chip('O(log n)', 'klog'), 'Min-heap only. `nlargest(k, it)` and `nsmallest` are there too.'],
  ['bisect_left / bisect_right', chip('O(log n)', 'klog'), 'Binary search on a sorted list. `key=` supported since 3.10.'],
  ['itertools.accumulate', chip('O(n)', 'kn'), 'Prefix sums in one line; takes any binary function.'],
  ['itertools.pairwise', chip('O(n)', 'kn'), 'Adjacent pairs — 3.10+. Removes a whole class of index bugs.'],
  ['itertools.product / permutations', chip('O(output)', 'kbad'), 'Nested loops and orderings without the recursion.'],
  ['itertools.groupby', chip('O(n)', 'kn'), 'Runs of equal adjacent items. Sort first, or it will surprise you.'],
  ['functools.cache', chip('O(1)', 'k1'), 'Memoize a recursive DP. Arguments must be hashable — no lists.'],
  ['functools.reduce', chip('O(n)', 'kn'), 'Fold. `reduce(operator.xor, nums)` is Single Number.'],
  ['math.gcd / math.lcm', chip('O(log n)', 'klog'), 'No need to write Euclid. `math.isqrt` for exact integer roots.'],
  ['math.comb / math.perm', chip('O(k)', 'kn'), 'Exact binomials with no overflow and no float error.'],
  ['sorted(it, key=...)', chip('O(n log n)', 'kbad'), 'Stable. Sort twice for multi-key order, least significant first.'],
  ['enumerate / zip', chip('O(n)', 'kn'), 'Index and value together; `zip(a, a[1:])` walks adjacent pairs.'],
  ['divmod(a, b)', chip('O(1)', 'k1'), 'Quotient and remainder in one call — digit problems love it.'],
]

export const GOTCHAS = [
  ['`[[0] * m] * n`', 'Makes n references to ONE row. Writing `g[1][2]` writes every row.', '`[[0] * m for _ in range(n)]`'],
  ['`def f(a, seen=[])`', 'The default is created once and shared across every call.', '`def f(a, seen=None)` then `seen = seen or []`'],
  ['`d[k]` on a missing key', 'Raises `KeyError` — Python does not insert a default like C++ does.', '`d.get(k, default)` or `k in d`'],
  ['`defaultdict(int)[k]` as a check', 'Reading DOES insert. `len(d)` grows behind your back.', 'Use `k in d` for a read-only test.'],
  ['`for x in a: a.remove(x)`', 'Mutating while iterating skips elements silently.', 'Iterate a copy `a[:]`, or build a new list.'],
  ['`a.pop(0)` in a loop', 'O(n) each time, so an O(n) algorithm becomes O(n²).', '`collections.deque` and `popleft()`.'],
  ['`s += c` in a loop', 'Strings are immutable, so this is O(n²).', 'Collect into a list, then `"".join(parts)`.'],
  ['Recursing on `a[1:]`', 'Each slice copies — a hidden O(n²) and O(n²) memory.', 'Pass an index, never a slice.'],
  ['Deep recursion', 'Default limit is 1000 frames; a 10⁵-node skewed tree crashes.', '`sys.setrecursionlimit(300000)` or go iterative.'],
  ['`0.1 + 0.2 != 0.3`', 'Binary floats. Equality on floats is a coin flip.', '`math.isclose(a, b)` or use `Fraction` / integers.'],
  ['`x is y` on ints', 'Small ints are cached, big ones are not, so `is` works then stops.', 'Use `==` for values, `is` only for `None`.'],
  ['`copy.copy(grid)`', 'Shallow: the inner rows are still shared.', '`copy.deepcopy`, or a comprehension per row.'],
  ['`lambda: i` in a loop', 'Late binding: every closure sees the final `i`.', '`lambda i=i: i` to bind at definition time.'],
  ['`sort()` vs `sorted()`', '`a.sort()` returns `None` and mutates; assigning it loses your data.', '`a.sort()` alone, or `b = sorted(a)`.'],
]

export const SNIPPETS = {
  io: `import sys
input = sys.stdin.readline        # the built-in input() is slow in contests
n = int(input())
a = list(map(int, input().split()))
print(*a)                         # unpacks: prints space-separated
sys.setrecursionlimit(300000)     # default 1000 is a frame count, not memory`,

  building: `a = [0] * n                       # fine: ints are immutable
g = [[0] * m for _ in range(n)]   # a grid — NEVER [[0] * m] * n
seen = [[False] * m for _ in range(n)]
adj = [[] for _ in range(n)]      # same rule: no [[]] * n
from collections import defaultdict
adj = defaultdict(list)           # or this, when nodes are not 0..n-1
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))
D8 = [(r, c) for r in (-1, 0, 1) for c in (-1, 0, 1) if (r, c) != (0, 0)]`,

  comprehensions: `[x * 2 for x in a if x > 0]              # map + filter
{c: i for i, c in enumerate(s)}          # dict comprehension
{x for x in a}                           # set — {} alone is an empty DICT
sum(1 for x in a if pred(x))             # count without building a list
any(pred(x) for x in a); all(...)        # short-circuits
next((x for x in a if pred(x)), None)    # first match, or a default
[y for row in grid for y in row]         # flatten: loops read left to right`,

  strings: `s[::-1]                           # reverse
s.split(); s.split(',')           # split() with no args splits on any run of space
"".join(parts)                    # the ONLY way to build a string in a loop
s.strip(); s.lower(); s.isalnum()
ord(c) - ord('a')                 # char -> 0..25
chr(ord('a') + i)                 # back again
s.count('ab'); s.find('ab')       # find returns -1, index() raises
f"{x:.3f}  {x:>5}  {x:04d}"       # format spec: precision, align, pad
from collections import Counter
Counter(s) == Counter(t)          # anagram check in one line`,

  sorting: `a.sort()                          # in place, returns None
b = sorted(a, reverse=True)
items.sort(key=lambda x: (-x.score, x.name))   # score desc, then name asc
# sort is STABLE, so two passes give multi-key order:
items.sort(key=lambda x: x.name)               # secondary first
items.sort(key=lambda x: -x.score)             # primary second
idx = sorted(range(n), key=lambda i: score[i]) # sort indices, not data
from functools import cmp_to_key
a.sort(key=cmp_to_key(lambda x, y: ...))       # only if you truly need it`,

  unpacking: `a, b = b, a                       # swap, no temp
first, *rest = a
r, c = divmod(i, cols)            # flat index -> grid coords
for i, (x, y) in enumerate(points): pass
d = {**d1, **d2}                  # merge; d1 | d2 in 3.9+
x = y = 0                         # careful: fine for ints, aliases for lists`,

  grids: `R, C = len(g), len(g[0])
for r in range(R):
    for c in range(C):
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < R and 0 <= nc < C): continue
            ...
# chained comparison 0 <= nr < R is one expression, not two`,

  bfs: `from collections import deque
q = deque([(sr, sc)])
dist = {(sr, sc): 0}
while q:
    r, c = q.popleft()
    for dr, dc in DIRS:
        nxt = (r + dr, c + dc)
        if nxt in dist: continue
        dist[nxt] = dist[(r, c)] + 1
        q.append(nxt)
# a dict keyed by tuple doubles as the visited set and the distance table`,

  heap: `import heapq
h = []
heapq.heappush(h, (dist, node))   # tuples compare left to right
d, u = heapq.heappop(h)
h[0]                              # peek
heapq.heapify(a)                  # O(n)
heapq.nlargest(k, a, key=len)     # top-k without managing a heap
# max-heap: negate
heapq.heappush(h, -x); biggest = -heapq.heappop(h)
# never push a raw object that cannot be compared — add a tiebreaker:
heapq.heappush(h, (-score, seq, obj))`,

  memo: `from functools import cache, lru_cache

@cache                            # unbounded; 3.9+
def f(i, j):
    if i == 0 or j == 0: return 0
    ...

@lru_cache(maxsize=None)          # the older spelling, same thing
def g(state): ...
# arguments must be HASHABLE: pass tuples, not lists.
# f.cache_clear() between test cases, or stale answers leak across them.`,

  classes: `class Node:
    __slots__ = ('val', 'next')   # less memory, faster attribute access
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

from dataclasses import dataclass
@dataclass(order=True)            # gives __init__, __repr__, and comparisons
class Item:
    score: float
    name: str = ''`,

  dsu: `p = list(range(n))
sz = [1] * n

def find(x):
    while p[x] != x:
        p[x] = p[p[x]]            # path halving — iterative, no stack limit
        x = p[x]
    return x

def unite(a, b):
    a, b = find(a), find(b)
    if a == b: return False
    if sz[a] < sz[b]: a, b = b, a
    p[b] = a; sz[a] += sz[b]
    return True`,

  numbers: `float('inf'); float('-inf')       # no INT_MAX games, and inf + 1 is inf
7 // 2 == 3;  -7 // 2 == -4       # floor division, NOT truncation like C++
-7 % 2 == 1                       # modulo follows the divisor's sign
int(-7 / 2) == -3                 # this is C++-style truncation
-(-a // b)                        # ceiling division of positives
divmod(a, b)
pow(a, b, m)                      # modular exponentiation, built in
# ints are unbounded: no overflow, but big ints get slow.
# when a problem wants 32-bit wraparound:
x &= 0xFFFFFFFF
if x >= 1 << 31: x -= 1 << 32`,

  timing: `# rough CPython budget: ~10^6 to 10^7 simple operations per second,
# roughly 50-100x slower than C++. Same big-O, very different wall clock.
# If a plan is 10^8 operations, it passes in C++ and times out here.
# What actually buys you speed:
#   - move the loop into a builtin: sum(), max(), any(), "".join()
#   - a set/dict lookup instead of a list scan
#   - avoid rebuilding strings and slices inside loops
#   - local variable lookups beat attribute lookups in a hot loop`,
}

export const PERF = [
  'Move the inner loop into a builtin (`sum`, `max`, `min`, `any`, `"".join`) — those run in C.',
  '`x in some_set` is O(1); `x in some_list` is O(n). This is the single most common accidental O(n²).',
  'Bind hot attributes to locals before a loop: `push = heap.append` beats `heap.append` inside it.',
  'Prefer a comprehension to `append` in a loop — it avoids one method lookup per item.',
  '`sys.stdin.readline` over `input()` when there is a lot of input; the difference is real.',
  'A `deque` for anything popped from the front; a `list` only for a stack.',
]

export const DICT_VS_SET = [
  '`dict` preserves insertion order (guaranteed since 3.7) — unlike C++ `unordered_map`, you may rely on it.',
  '`set` and `dict` are the same hash table underneath; both are O(1) average and O(n) worst case.',
  'Tuples are hashable, so `(r, c)` works as a key directly. No encoding trick needed.',
  'Lists are not hashable. To key on a list, convert: `tuple(sorted(word))` is the anagram signature.',
  '`frozenset` is hashable, so a set of sets is `set()` of `frozenset()`.',
]
