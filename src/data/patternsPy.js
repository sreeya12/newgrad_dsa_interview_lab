/* Python twins for the pattern templates, keyed by card name. */

export const CARD_CODE_PY = {
  'One-pass hash map': `seen = {}                             # value -> index
for i, x in enumerate(a):
    need = target - x
    if need in seen:                  # one lookup, not count() + []
        return [seen[need], i]
    seen[x] = i                       # insert AFTER the check`,

  'Two pointers on sorted input': `nums.sort()
res = []
for i in range(len(nums) - 2):
    if i and nums[i] == nums[i-1]: continue   # skip dup anchors
    l, r = i + 1, len(nums) - 1
    while l < r:
        s = nums[i] + nums[l] + nums[r]
        if s < 0: l += 1
        elif s > 0: r -= 1
        else:
            res.append([nums[i], nums[l], nums[r]])
            while l < r and nums[l] == nums[l+1]: l += 1
            l += 1; r -= 1`,

  'Variable sliding window': `from collections import Counter
cnt, l, best = Counter(), 0, 0
for r, c in enumerate(s):
    cnt[c] += 1
    while cnt[c] > 1:                 # invariant: no repeats
        cnt[s[l]] -= 1
        l += 1
    best = max(best, r - l + 1)`,

  'Prefix sum + hash map': `from collections import defaultdict
cnt = defaultdict(int)
cnt[0] = 1                            # the empty prefix counts once
run = res = 0
for x in nums:
    run += x
    res += cnt[run - k]               # careful: defaultdict inserts a 0 here
    cnt[run] += 1`,

  'Monotonic stack': `st = []                               # indices, values increasing
for i, h_i in enumerate(h):
    while st and h_i < h[st[-1]]:
        top = st.pop()
        left = st[-1] if st else -1
        best = max(best, h[top] * (i - left - 1))
    st.append(i)`,

  'Binary search on the answer': `def ok(speed):
    return sum(-(-p // speed) for p in piles) <= H   # -(-a//b) = ceil

lo, hi = 1, max(piles)
while lo < hi:                        # lo is the answer at the end
    mid = (lo + hi) // 2
    if ok(mid): hi = mid
    else:       lo = mid + 1`,

  'Rotated / partitioned binary search': `while lo <= hi:
    mid = (lo + hi) // 2
    if nums[mid] == target: return mid
    if nums[lo] <= nums[mid]:                       # left half sorted
        if nums[lo] <= target < nums[mid]: hi = mid - 1
        else:                              lo = mid + 1
    else:                                           # right half sorted
        if nums[mid] < target <= nums[hi]: lo = mid + 1
        else:                              hi = mid - 1`,

  'Top-k with a heap': `import heapq
pq = []                               # heapq is always a MIN-heap
for x in nums:
    heapq.heappush(pq, x)
    if len(pq) > k: heapq.heappop(pq) # evict the smallest
return pq[0]                          # kth largest
# or, when k is small and you want one line:
return heapq.nlargest(k, nums)[-1]`,

  'Two heaps for a running median': `import heapq
lo, hi = [], []                       # lo is a MAX-heap via negation

def add(x):
    heapq.heappush(lo, -x)
    heapq.heappush(hi, -heapq.heappop(lo))    # funnel through
    if len(hi) > len(lo):
        heapq.heappush(lo, -heapq.heappop(hi))

def median():
    return -lo[0] if len(lo) > len(hi) else (-lo[0] + hi[0]) / 2`,

  'Post-order with a side channel': `best = float('-inf')

def gain(n):                          # returns: best downward path
    nonlocal best
    if not n: return 0
    l = max(gain(n.left),  0)         # negatives are never worth taking
    r = max(gain(n.right), 0)
    best = max(best, n.val + l + r)   # the "through this node" case
    return n.val + max(l, r)`,

  Trie: `class Node:
    __slots__ = ('kid', 'word')
    def __init__(self):
        self.kid = {}                 # a dict beats a 26-slot list in Python
        self.word = ''                # non-empty marks a terminal

def insert(root, w):
    cur = root
    for c in w:
        if c not in cur.kid: cur.kid[c] = Node()
        cur = cur.kid[c]
    cur.word = w`,

  Backtracking: `def dfs(start, path):
    res.append(path[:])               # COPY, or every row aliases one list
    for i in range(start, len(nums)):
        if i > start and nums[i] == nums[i-1]: continue   # dedupe
        path.append(nums[i])
        dfs(i + 1, path)
        path.pop()                    # un-choose`,

  'Multi-source BFS': `from collections import deque
q = deque((r, c) for r in range(R) for c in range(C) if grid[r][c] == 2)
t = 0
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))
while q:
    for _ in range(len(q)):           # one level = one minute
        r, c = q.popleft()
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < R and 0 <= nc < C): continue
            if grid[nr][nc] != 1: continue
            grid[nr][nc] = 2
            q.append((nr, nc))
    if q: t += 1`,

  'Topological sort (Kahn)': `from collections import deque
adj = [[] for _ in range(n)]
indeg = [0] * n
for a, b in edges:
    adj[b].append(a); indeg[a] += 1

q = deque(i for i in range(n) if not indeg[i])
order = []
while q:
    u = q.popleft(); order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
return order if len(order) == n else []           # cycle check`,

  'Union find': `p = list(range(n))
sz = [1] * n

def find(x):                          # iterative: no recursion limit to hit
    while p[x] != x:
        p[x] = p[p[x]]                # path halving
        x = p[x]
    return x

def unite(a, b):
    a, b = find(a), find(b)
    if a == b: return False           # already connected
    if sz[a] < sz[b]: a, b = b, a
    p[b] = a; sz[a] += sz[b]
    return True`,

  Dijkstra: `import heapq
dist = [float('inf')] * n
dist[src] = 0
pq = [(0, src)]
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]: continue          # stale
    for v, w in adj[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heapq.heappush(pq, (dist[v], v))`,

  '1-D DP over positions': `INF = float('inf')
dp = [INF] * (amount + 1)
dp[0] = 0
for a in range(1, amount + 1):
    for c in coins:
        if c <= a and dp[a - c] + 1 < dp[a]:
            dp[a] = dp[a - c] + 1
return -1 if dp[amount] == INF else dp[amount]`,

  '2-D DP over two sequences': `dp = [[0] * (n + 1) for _ in range(m + 1)]   # comprehension, NOT [[0]*n]*m
for i in range(1, m + 1):
    for j in range(1, n + 1):
        if a[i-1] == b[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1
        else:
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])
return dp[m][n]`,

  'Interval sweep': `iv.sort(key=lambda x: x[1])           # by end time
end, kept = float('-inf'), 0
for s, e in iv:
    if s >= end:
        kept += 1; end = e
return len(iv) - kept                 # removals needed`,

  'XOR and bit counting': `x = 0
for v in nums: x ^= v                 # pairs cancel, the loner survives

def bits(n):
    c = 0
    while n:
        n &= n - 1                    # clears lowest set bit
        c += 1
    return c
# Python 3.10+: n.bit_count() does this in one call`,

  'Weighted and reservoir sampling': `# weighted: build prefix sums once, then binary search a roll
from itertools import accumulate
from bisect import bisect_left
import random
pre = list(accumulate(w))
def pick():
    return bisect_left(pre, random.randrange(pre[-1]) + 1)

# reservoir, k = 1 — one pass, O(1) space, stream of unknown length
res, seen = None, 0
for x in stream:
    seen += 1
    if random.randrange(seen) == 0: res = x`,
}
