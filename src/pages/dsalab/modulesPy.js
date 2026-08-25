/* ==================================================================
   Python twins for each module's teaching code block, keyed by module name.

   Not transliterated C++: where Python changes the advice, the Python version
   says so — dict.get over operator[], heapq being a min-heap, functools.cache,
   sys.setrecursionlimit, the aliasing trap when you append a mutable path.
   ================================================================== */

export const MODULE_CODE_PY = {
  'How to price a solution': `# Know what the built-ins actually cost — most Python "slow" is a hidden O(n).
a = []                    # append: amortized O(1); insert(0, x): O(n)
a.pop()                   # O(1) from the end; a.pop(0) is O(n) — use deque
x in some_list            # O(n).  x in some_set / some_dict: O(1) average
s += "x"                  # inside a loop this is O(n^2) — build a list, "".join it
sorted(a)                 # O(n log n), stable (unlike C++ sort)
# Space you forget to count:
# - the recursion stack (default limit is 1000 frames, not a memory limit)
# - slicing copies: a[1:] is O(n), so recursing on a[1:] is a hidden O(n^2)
# CPython is roughly 50-100x slower than C++ per operation. Same big-O,
# but a 10^8-operation plan that passes in C++ will time out here.`,

  'Hash maps and sets': `seen = {}                                # value -> index
for i, x in enumerate(a):
    need = target - x
    if need in seen:
        return [seen[need], i]
    seen[x] = i                          # insert AFTER the lookup

# counting idioms
from collections import Counter, defaultdict
cnt = Counter(s)                         # the whole loop in one call
cnt.most_common(3)                       # top-k without sorting everything
groups = defaultdict(list)
groups[key].append(word)                 # list auto-created

# pitfall: d[k] on a missing key RAISES; it does not insert like C++.
d.get(k, 0)                              # safe read with a default
d.setdefault(k, []).append(v)            # read-or-create in one step
# but defaultdict(int)[k] DOES insert on read — same C++ trap, new clothes:
dd = defaultdict(int)
if dd[k] == 0: pass                      # k now exists, len(dd) changed

# tuples are hashable, so grid coordinates need no encoding trick
pts = set()
pts.add((r, c))`,

  'Two pointers': `# sorted two-sum
l, r = 0, len(a) - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return [l, r]
    if s < target: l += 1
    else:          r -= 1

# 3Sum: fix one, two-pointer the rest, skip duplicates in BOTH places
a.sort()
res = []
for i in range(len(a) - 2):
    if i and a[i] == a[i-1]: continue            # skip duplicate anchors
    l, r = i + 1, len(a) - 1
    while l < r:
        s = a[i] + a[l] + a[r]
        if s < 0: l += 1
        elif s > 0: r -= 1
        else:
            res.append([a[i], a[l], a[r]])
            while l < r and a[l] == a[l+1]: l += 1   # skip duplicate pairs
            while l < r and a[r] == a[r-1]: r -= 1
            l += 1; r -= 1

# fast/slow write pointer (remove duplicates in place)
w = 0
for x in a:
    if not w or x != a[w-1]:
        a[w] = x; w += 1
del a[w:]`,

  'Sliding window': `# longest substring with all distinct characters
last = {}
l = best = 0
for r, c in enumerate(s):
    if last.get(c, -1) >= l:
        l = last[c] + 1                  # jump, never step back
    last[c] = r
    best = max(best, r - l + 1)

# generic shrink form — use when the constraint is a counter
from collections import Counter
cnt, l, bad, best = Counter(), 0, 0, 0
for r, c in enumerate(s):
    cnt[c] += 1
    if cnt[c] == 2: bad += 1             # window became illegal
    while bad:
        cnt[s[l]] -= 1
        if cnt[s[l]] == 1: bad -= 1
        l += 1
    best = max(best, r - l + 1)

# minimum window: same loop, but record the answer INSIDE the shrink phase
# do NOT rebuild the window with s[l:r+1] each step — that slice is O(n)
# and turns the whole scan into O(n^2). Track indices, slice once at the end.`,

  'Prefix sums and difference arrays': `from itertools import accumulate
p = [0] + list(accumulate(a))            # p[0] = 0 removes every special case
range_sum = p[r+1] - p[l]                # inclusive [l, r]

# subarray sum == k, in one pass
from collections import defaultdict
freq = defaultdict(int); freq[0] = 1     # the empty prefix counts once
run = ans = 0
for x in a:
    run += x
    ans += freq[run - k]                 # earlier prefixes that complete a k-sum
    freq[run] += 1

# difference array: add v to [l, r] in O(1), then one sweep to materialize
d = [0] * (n + 1)
d[l] += v; d[r+1] -= v
out = list(accumulate(d[:n]))

# no overflow to worry about here — Python ints are arbitrary precision.
# That removes a whole class of C++ bugs and adds a cost: big ints are slow.`,

  'Binary search': `# the only template you need — first index where pred is true
lo, hi = 0, n                            # half-open [lo, hi)
while lo < hi:
    mid = (lo + hi) // 2                 # no overflow: Python ints are unbounded
    if pred(mid): hi = mid               # mid might be the answer
    else:         lo = mid + 1           # mid is definitely not
# lo == hi == first true (or n if none)

# the stdlib does this for you, and interviewers accept it
from bisect import bisect_left, bisect_right, insort
i = bisect_left(a, x)                    # first index >= x
j = bisect_right(a, x)                   # first index  > x
count_of_x = j - i
# Python 3.10+: bisect takes a key, so no more decorate-sort-undecorate
i = bisect_left(rows, target, key=lambda r: r.score)

# binary search on the answer: Koko eating bananas
def feasible(speed):
    return sum(-(-p // speed) for p in piles) <= H   # -(-a//b) is ceil div
lo, hi = 1, max(piles)
while lo < hi:
    m = (lo + hi) // 2
    if feasible(m): hi = m
    else:           lo = m + 1`,

  'Stacks and monotonic stacks': `# next warmer day / next greater element
res = [0] * n
st = []                                  # holds INDICES, not values
for i, t in enumerate(T):
    while st and t > T[st[-1]]:
        j = st.pop()
        res[j] = i - j
    st.append(i)
# whatever is left on the stack has no answer

# valid parentheses
pair_of = {')': '(', ']': '[', '}': '{'}
st = []
for c in t:
    if c in pair_of:
        if not st or st.pop() != pair_of[c]:
            return False
    else:
        st.append(c)
return not st                            # do not forget this line

# a list IS the stack: append / pop / st[-1]. Never use pop(0) — that is
# O(n) and is what collections.deque exists for.`,

  'Linked lists': `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

# reversal — the tuple assignment does the save-first for you
prev, cur = None, head
while cur:
    cur.next, prev, cur = prev, cur, cur.next
return prev
# written out, so you can say what each step does:
#   nxt = cur.next; cur.next = prev; prev = cur; cur = nxt

# dummy head kills the "what if we delete the first node" case
dummy = ListNode(0, head)
p = dummy
while p.next:
    if p.next.val == target: p.next = p.next.next
    else:                    p = p.next
return dummy.next

# Floyd: cycle detection, and the middle node
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast: break               # cycle — use "is", not "=="`,

  'Trees, traversals, and BSTs': `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

# post-order: children first, then me. Height and diameter both live here.
best = 0
def height(r):
    global best
    if not r: return 0
    L, R = height(r.left), height(r.right)
    best = max(best, L + R)              # path through r
    return 1 + max(L, R)
# nonlocal/global is the usual answer; a one-element list or self.best also works

# BFS by levels — snapshot the size at the top of each round
from collections import deque
q, out = deque([root] if root else []), []
while q:
    level = []
    for _ in range(len(q)):
        t = q.popleft()
        level.append(t.val)
        if t.left:  q.append(t.left)
        if t.right: q.append(t.right)
    out.append(level)

# BST validity: pass the allowed range down. float('-inf') / float('inf')
# beat sentinels — Python has no INT_MIN edge case to trip over.
def ok(r, lo=float('-inf'), hi=float('inf')):
    if not r: return True
    if not (lo < r.val < hi): return False
    return ok(r.left, lo, r.val) and ok(r.right, r.val, hi)

# recursion limit is 1000 by default: a skewed 10^5-node tree WILL crash.
import sys; sys.setrecursionlimit(300000)`,

  'Heaps and priority queues': `import heapq
h = []
heapq.heappush(h, x); heapq.heappop(h)   # heapq is ALWAYS a min-heap
h[0]                                     # peek, O(1)
heapq.heapify(a)                         # O(n), in place

# max-heap: negate on the way in and out. There is no max-heap in the stdlib.
heapq.heappush(h, -x)
largest = -heapq.heappop(h)

# top-k largest with a size-k MIN-heap: O(n log k), O(k) space
for x in a:
    heapq.heappush(h, x)
    if len(h) > k: heapq.heappop(h)
kth_largest = h[0]
heapq.nlargest(k, a)                     # or just this, when k is small

# "custom comparator": there is none. Push a tuple whose natural order is
# the order you want, and put a tiebreaker before any non-comparable payload.
heapq.heappush(pq, (-score, seq, item))  # seq stops it comparing items

# Dijkstra is a heap plus a distance array
dist = [float('inf')] * n
dist[src] = 0
pq = [(0, src)]
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]: continue             # stale entry — skip it
    for v, w in adj[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heapq.heappush(pq, (dist[v], v))`,

  Tries: `class Node:
    __slots__ = ('kid', 'end')           # cuts per-node memory noticeably
    def __init__(self):
        self.kid, self.end = {}, False

class Trie:
    def __init__(self): self.root = Node()

    def insert(self, w):
        cur = self.root
        for c in w:
            if c not in cur.kid: cur.kid[c] = Node()
            cur = cur.kid[c]
        cur.end = True

    def walk(self, w):
        cur = self.root
        for c in w:
            cur = cur.kid.get(c)
            if cur is None: return None

        return cur

    def search(self, w):      n = self.walk(w); return bool(n and n.end)
    def startsWith(self, p):  return self.walk(p) is not None

# a dict per node beats a 26-slot list here: Python lists of None cost more
# than a small dict, and the alphabet is rarely actually 26.`,

  'Graph traversal: BFS and DFS': `from collections import deque
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))

# BFS on a grid — shortest steps
dist = [[-1] * C for _ in range(R)]
q = deque([(sr, sc)]); dist[sr][sc] = 0
while q:
    r, c = q.popleft()
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if not (0 <= nr < R and 0 <= nc < C): continue
        if grid[nr][nc] == '1' or dist[nr][nc] != -1: continue
        dist[nr][nc] = dist[r][c] + 1
        q.append((nr, nc))               # mark at push time

# DFS flood fill — count islands by sinking them
def sink(r, c):
    if not (0 <= r < R and 0 <= c < C) or grid[r][c] != '1': return
    grid[r][c] = '0'
    for dr, dc in DIRS: sink(r + dr, c + dc)

# cycle detection in a DIRECTED graph needs three colours, not a visited set
# 0 = unvisited, 1 = on the current stack, 2 = finished; seeing a 1 is a cycle

# NEVER use a list as the queue. q.pop(0) is O(n) and turns BFS into O(n^2).
# On a 10^6-cell grid, convert recursive DFS to an explicit stack — 1000 frames
# is the default recursion ceiling and you will hit it.`,

  'Topological sort': `from collections import deque
adj = [[] for _ in range(n)]
indeg = [0] * n
for a, b in edges:                       # [a, b] means "b before a"
    adj[b].append(a); indeg[a] += 1

q = deque(i for i in range(n) if not indeg[i])
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)

return order if len(order) == n else []  # short output means a cycle

# lexicographically smallest order: swap the deque for a heap
import heapq
h = [i for i in range(n) if not indeg[i]]
heapq.heapify(h)
# ... heapq.heappop(h) / heapq.heappush(h, v)`,

  'Union-Find (disjoint set union)': `class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.sz = [1] * n
        self.comps = n

    def find(self, x):                   # iterative: no recursion limit to hit
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]    # path halving
            x = self.p[x]
        return x

    def unite(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b: return False          # already together — this edge is a cycle
        if self.sz[a] < self.sz[b]: a, b = b, a
        self.p[b] = a
        self.sz[a] += self.sz[b]
        self.comps -= 1
        return True

# counting islands / provinces: build the DSU, unite neighbours, read .comps
# path halving in a while loop is the Python-friendly compression: full
# recursive compression can blow the stack on a long chain.`,

  'Recursion and backtracking': `# subsets — take / skip
def rec(i, path, out):
    if i == len(a):
        out.append(path[:])              # COPY. append(path) aliases one list.
        return
    path.append(a[i])
    rec(i + 1, path, out)
    path.pop()                           # undo — the line people forget
    rec(i + 1, path, out)

# combinations with duplicates in the input: sort, then skip equal siblings
a.sort()
def rec(start, path):
    out.append(path[:])
    for i in range(start, len(a)):
        if i > start and a[i] == a[i-1]: continue   # not i > 0
        path.append(a[i])
        rec(i + 1, path)                 # i, not i+1, if reuse is allowed
        path.pop()

# permutations with an in-place swap
def perm(i):
    if i == len(a): out.append(a[:]); return
    for j in range(i, len(a)):
        a[i], a[j] = a[j], a[i]
        perm(i + 1)
        a[i], a[j] = a[j], a[i]          # swap back

# itertools has these, and saying so is fine — then write it anyway:
from itertools import permutations, combinations, product`,

  'Dynamic programming, one dimension': `# coin change — fewest coins to make amount
INF = float('inf')
dp = [INF] * (amount + 1)
dp[0] = 0
for x in range(1, amount + 1):
    for c in coins:
        if c <= x and dp[x - c] + 1 < dp[x]:
            dp[x] = dp[x - c] + 1
return -1 if dp[amount] == INF else dp[amount]
# float('inf') + 1 is still inf, so there is no overflow guard to write here

# house robber — rolling variables, O(1) space
take = skip = 0
for x in nums:
    take, skip = skip + x, max(skip, take)
return max(take, skip)

# LIS in O(n log n): tails[k] = smallest tail of an increasing subsequence
from bisect import bisect_left
tails = []
for x in nums:
    i = bisect_left(tails, x)
    if i == len(tails): tails.append(x)
    else:               tails[i] = x
return len(tails)                        # tails is NOT the actual subsequence

# top-down memo, when the bottom-up order is hard to see
from functools import cache
@cache                                   # arguments must be hashable
def f(i):
    if i >= n: return 0
    return max(f(i + 1), nums[i] + f(i + 2))`,

  'Dynamic programming, two dimensions': `# longest common subsequence
dp = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    for j in range(1, m + 1):
        if s1[i-1] == s2[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1
        else:
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])
return dp[n][m]
# BUILD THE GRID WITH A COMPREHENSION. [[0]*m]*n makes n references to ONE
# row, so writing dp[1][2] writes every row. This is the classic Python bug.

# edit distance — three edits, three neighbours
dp[i][j] = dp[i-1][j-1] if s1[i-1] == s2[j-1] else 1 + min(
    dp[i-1][j-1],    # replace
    dp[i-1][j],      # delete
    dp[i][j-1])      # insert

# rolling rows: O(m) space when you only read the previous row
prev = [0] * (m + 1)
for i in range(1, n + 1):
    cur = [0] * (m + 1)
    # ... fill cur from prev ...
    prev = cur

# interval DP (palindromes): iterate by LENGTH so shorter spans are ready
for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length - 1
        dp[i][j] = s[i] == s[j] and (length == 2 or dp[i+1][j-1])`,

  'Greedy and intervals': `iv.sort()                                # by start
out = []
for s, e in iv:
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)
    else:
        out.append([s, e])

# max non-overlapping intervals: sort by END, not start
iv.sort(key=lambda x: x[1])
end, kept = float('-inf'), 0
for s, e in iv:
    if s >= end:
        kept += 1; end = e

# meeting rooms II — min heap of end times = rooms currently in use
import heapq
ends = []
for s, e in sorted(iv):
    if ends and ends[0] <= s: heapq.heappop(ends)
    heapq.heappush(ends, e)
return len(ends)

# jump game: track the furthest reachable index
reach = 0
for i, x in enumerate(a):
    if i > reach: return False
    reach = max(reach, i + x)

# sort is stable, so a second sort on a different key preserves the first —
# that is how you get multi-key ordering without writing a comparator.`,

  'Bit manipulation': `x ^ x == 0;  x ^ 0 == x                   # XOR cancels — the whole trick
lone = 0
for v in a: lone ^= v                    # everything else appears twice

n & (n - 1)      # clear the lowest set bit
n & -n           # isolate the lowest set bit
n | (1 << i)     # set bit i
n & ~(1 << i)    # clear bit i
(n >> i) & 1     # read bit i
n.bit_count()    # popcount, Python 3.10+ (or bin(n).count('1'))
n.bit_length()   # position of the highest set bit

# counting bits for every x in [0, n] — DP on bits
dp = [0] * (n + 1)
for i in range(1, n + 1):
    dp[i] = dp[i >> 1] + (i & 1)

# enumerate every subset of a set of n items
for mask in range(1 << n):
    for i in range(n):
        if mask & (1 << i): pass         # item i is in this subset

# Python ints are unbounded and two's-complement-infinite: 1 << 40 is fine,
# there is no 32-bit overflow, and -1 has infinitely many leading 1 bits.
# That last one bites on problems that expect 32-bit wraparound:
result &= 0xFFFFFFFF                     # mask back to 32 bits
if result >= 1 << 31: result -= 1 << 32  # then reinterpret as signed`,
}
