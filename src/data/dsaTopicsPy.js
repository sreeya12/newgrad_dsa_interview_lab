/* Python twins for the reference page snippets, keyed by topic id. */

export const TOPIC_CODE_PY = {
  arrays: `# Two-pointer in-place removal: keep everything != val
w = 0
for x in v:
    if x != val:
        v[w] = x
        w += 1
del v[w:]
# a list is a dynamic array: append is amortized O(1), insert(0, x) is O(n)`,

  hashing: `seen = {}                              # value -> index
for i, x in enumerate(nums):
    need = target - x
    if need in seen:
        return [seen[need], i]
    seen[x] = i
# d[k] on a missing key RAISES (unlike C++). d.get(k, default) is the safe read,
# and defaultdict(int)[k] DOES insert on read — the same growth trap.`,

  'two-pointers': `nums.sort()
for i in range(len(nums) - 2):
    if i and nums[i] == nums[i-1]: continue
    l, r = i + 1, len(nums) - 1
    while l < r:
        s = nums[i] + nums[l] + nums[r]
        if s < 0: l += 1
        elif s > 0: r -= 1
        else:
            out.append([nums[i], nums[l], nums[r]])
            while l < r and nums[l] == nums[l+1]: l += 1
            l += 1; r -= 1`,

  'sliding-window': `l, best = 0, 0
cnt = {}
for r, c in enumerate(s):
    cnt[c] = cnt.get(c, 0) + 1
    while cnt[c] > 1:                  # shrink until valid
        cnt[s[l]] -= 1
        l += 1
    best = max(best, r - l + 1)
# never rebuild the window with s[l:r+1] each step — that slice is O(n)`,

  'prefix-sums': `from itertools import accumulate
pre = [0] + list(accumulate(a))
range_sum = pre[r+1] - pre[l]

# Count subarrays with sum == k
from collections import defaultdict
seen = defaultdict(int); seen[0] = 1
run = ans = 0
for x in a:
    run += x
    ans += seen[run - k]
    seen[run] += 1
# no overflow to guard: Python ints are arbitrary precision`,

  'binary-search': `# Smallest x in [lo, hi] with feasible(x) true
lo, hi = 1, max_ans
while lo < hi:
    mid = (lo + hi) // 2               # no overflow to dodge
    if feasible(mid): hi = mid
    else:             lo = mid + 1
return lo

from bisect import bisect_left, bisect_right
i = bisect_left(a, x)                  # first index >= x
count_of_x = bisect_right(a, x) - i`,

  stacks: `# Next greater element to the right, for every index
res = [-1] * n
st = []                                # holds indices
for i, x in enumerate(a):
    while st and a[st[-1]] < x:
        res[st.pop()] = x
    st.append(i)
# a list is the stack. Never pop(0) — that is O(n); use collections.deque.`,

  'linked-lists': `prev, cur = None, head
while cur:
    nxt = cur.next                     # save first
    cur.next = prev
    prev = cur
    cur = nxt
return prev
# the idiomatic one-liner does the same thing:
#   cur.next, prev, cur = prev, cur, cur.next`,

  recursion: `def quickselect(a, l, r, k):           # kth smallest, 0-indexed
    if l == r: return a[l]
    p = partition(a, l, r)
    if k == p: return a[p]
    return quickselect(a, l, p - 1, k) if k < p else quickselect(a, p + 1, r, k)

import sys
sys.setrecursionlimit(300000)          # default is 1000 frames, not memory`,

  backtracking: `def dfs(start, path):
    out.append(path[:])                # COPY, or every row aliases one list
    for i in range(start, n):
        if i > start and a[i] == a[i-1]: continue   # dedupe
        path.append(a[i])
        dfs(i + 1, path)
        path.pop()`,

  sorting: `items.sort(key=lambda x: (-x.score, x.id))   # score desc, then id asc
# Python's sort IS stable, so a second sort preserves the first ordering —
# that is how you get multi-key order without writing a comparator.
# There is no strict-weak-ordering footgun here: you supply a key, not a
# comparison. functools.cmp_to_key exists if you truly need a comparator.`,

  heaps: `import heapq
h = []                                 # heapq is ALWAYS a min-heap
for x in nums:
    heapq.heappush(h, x)
    if len(h) > k: heapq.heappop(h)
return h[0]                            # kth largest

# max-heap: negate going in and coming out
heapq.heappush(h, -x); largest = -heapq.heappop(h)
# "custom comparator": push a tuple whose natural order is the order you want`,

  trees: `def valid(n, lo=float('-inf'), hi=float('inf')):
    if not n: return True
    if not (lo < n.val < hi): return False
    return valid(n.left, lo, n.val) and valid(n.right, n.val, hi)
# float('-inf') removes the INT_MIN sentinel problem C++ has entirely`,

  tries: `class Node:
    __slots__ = ('kid', 'word')
    def __init__(self):
        self.kid, self.word = {}, False

def insert(root, s):
    cur = root
    for c in s:
        if c not in cur.kid: cur.kid[c] = Node()
        cur = cur.kid[c]
    cur.word = True`,

  graphs: `from collections import deque
DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
q = deque(sources)
dist = [[-1] * cols for _ in range(rows)]
for r, c in sources: dist[r][c] = 0
while q:
    r, c = q.popleft()
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if not (0 <= nr < rows and 0 <= nc < cols): continue
        if dist[nr][nc] != -1 or grid[nr][nc] == WALL: continue
        dist[nr][nc] = dist[r][c] + 1
        q.append((nr, nc))
# deque, not a list: list.pop(0) makes BFS O(n^2)`,

  toposort: `from collections import deque
indeg = [0] * n
for u, v in edges:
    adj[u].append(v); indeg[v] += 1
q = deque(i for i in range(n) if not indeg[i])
order = []
while q:
    u = q.popleft(); order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
acyclic = len(order) == n`,

  'union-find': `def find(x):
    while p[x] != x:
        p[x] = p[p[x]]                 # path halving, iterative
        x = p[x]
    return x

def unite(a, b):
    a, b = find(a), find(b)
    if a == b: return False
    if r[a] < r[b]: a, b = b, a
    p[b] = a
    if r[a] == r[b]: r[a] += 1
    return True`,

  'shortest-paths': `import heapq
d = [float('inf')] * n
d[src] = 0
pq = [(0, src)]
while pq:
    du, u = heapq.heappop(pq)
    if du > d[u]: continue             # stale entry
    for v, w in adj[u]:
        if du + w < d[v]:
            d[v] = du + w
            heapq.heappush(pq, (d[v], v))`,

  greedy: `iv.sort(key=lambda x: x[1])            # by END time
end, keep = float('-inf'), 0
for s, e in iv:
    if s >= end:
        end = e; keep += 1
return len(iv) - keep                  # removals needed`,

  dp: `# Coin change: fewest coins to make amount
INF = float('inf')
dp = [INF] * (amount + 1)
dp[0] = 0
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
return -1 if dp[amount] == INF else dp[amount]
# inf + 1 is still inf, so there is no overflow guard to write

from functools import cache
@cache                                 # memoize a top-down version for free
def f(i): ...`,

  bits: `lone = 0
for x in nums: lone ^= x               # pairs cancel

bits = 0
x = mask
while x:
    x &= x - 1                         # clear the lowest set bit
    bits += 1
# or just: mask.bit_count()  (Python 3.10+)

for sub in range(mask, 0, -1):         # careful: this is NOT submask iteration
    pass
sub = mask                             # this is:
while sub:
    sub = (sub - 1) & mask

# Python ints have no 32-bit wraparound. When a problem expects it:
res &= 0xFFFFFFFF
if res >= 1 << 31: res -= 1 << 32`,

  intervals: `iv.sort()
out = []
for s, e in iv:
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)
    else:
        out.append([s, e])`,
}
