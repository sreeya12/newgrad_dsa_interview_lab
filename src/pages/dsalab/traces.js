/* ==================================================================
   Traces — the code each tape is actually walking, in both languages.

   Every entry is { cpp: {code, line}, py: {code, line} }. `line` maps the
   current frame back to the line (or lines) of that listing being executed,
   so stepping the tape moves the highlight. Line numbers are 1-based, and the
   two languages get separate mappings because the listings differ in length.

   These are deliberately separate from the teaching `code` block in
   modules.jsx: that one shows several related snippets, while this one is a
   single routine that corresponds 1:1 with what the visualization does.
   ================================================================== */

export const TRACES = {
  /* --- 02 hash map --- */
  hash: {
    cpp: {
      code: `unordered_map<int,int> seen;          // value -> index
for (int i = 0; i < n; ++i) {
    int need = target - a[i];
    auto it = seen.find(need);
    if (it != seen.end())
        return {it->second, i};
    seen[a[i]] = i;                   // insert AFTER the lookup
}
return {};`,
      line: (f) => (f.done ? 6 : f.probe !== undefined ? 4 : f.i >= 0 ? 7 : 1),
    },
    py: {
      code: `seen = {}                             # value -> index
for i, x in enumerate(a):
    need = target - x
    j = seen.get(need)
    if j is not None:
        return [j, i]
    seen[x] = i                       # insert AFTER the lookup
return []`,
      line: (f) => (f.done ? 6 : f.probe !== undefined ? 4 : f.i >= 0 ? 7 : 1),
    },
  },

  /* --- 03 two pointers --- */
  twoPtr: {
    cpp: {
      code: `int l = 0, r = n - 1;
while (l < r) {
    int s = a[l] + a[r];
    if (s == target) return {l, r};
    if (s < target) ++l;              // a[l] can never be part of the answer
    else            --r;              // a[r] can never be part of the answer
}`,
      line: (f) => (f.sum === undefined ? 1 : f.hit ? 4 : f.lt ? 5 : 6),
    },
    py: {
      code: `l, r = 0, len(a) - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return [l, r]
    if s < target: l += 1             # a[l] can never be part of the answer
    else:          r -= 1             # a[r] can never be part of the answer`,
      line: (f) => (f.sum === undefined ? 1 : f.hit ? 4 : f.lt ? 5 : 6),
    },
  },

  /* --- 04 sliding window --- */
  window: {
    cpp: {
      code: `int last[128]; memset(last, -1, sizeof last);
int l = 0, best = 0;
for (int r = 0; r < (int)s.size(); ++r) {
    if (last[s[r]] >= l)
        l = last[s[r]] + 1;           // jump l, never step it back
    last[s[r]] = r;
    best = max(best, r - l + 1);
}`,
      line: (f) => (f.r < 0 ? 2 : f.bad !== undefined ? 5 : 7),
    },
    py: {
      code: `last = {}
l = best = 0
for r, c in enumerate(s):
    if last.get(c, -1) >= l:
        l = last[c] + 1               # jump l, never step it back
    last[c] = r
    best = max(best, r - l + 1)`,
      line: (f) => (f.r < 0 ? 2 : f.bad !== undefined ? 5 : 7),
    },
  },

  /* --- 05 prefix sums --- */
  prefix: {
    cpp: {
      code: `vector<long long> p(n + 1, 0);        // p[0] = 0 is the whole trick
for (int i = 0; i < n; ++i)
    p[i + 1] = p[i] + a[i];

// any range, afterwards, in O(1):
long long sum = p[qr + 1] - p[ql];`,
      line: (f) => (f.phase === 'query' ? 6 : f.i !== undefined ? 3 : 1),
    },
    py: {
      code: `p = [0] * (n + 1)                     # p[0] = 0 is the whole trick
for i, x in enumerate(a):
    p[i + 1] = p[i] + x

# any range, afterwards, in O(1):
total = p[qr + 1] - p[ql]`,
      line: (f) => (f.phase === 'query' ? 6 : f.i !== undefined ? 3 : 1),
    },
  },

  /* --- 06 binary search --- */
  bs: {
    cpp: {
      code: `int lo = 0, hi = n;                   // half-open [lo, hi)
while (lo < hi) {
    int m = lo + (hi - lo) / 2;       // never (lo+hi)/2 — that overflows
    if (pred(a[m])) lo = m + 1;       // boundary is strictly right of m
    else            hi = m;           // m might itself be the boundary
}
return lo;`,
      line: (f) =>
        f.final !== undefined ? 7 : f.m === undefined ? 1 : f.p ? 4 : 5,
    },
    py: {
      code: `lo, hi = 0, n                         # half-open [lo, hi)
while lo < hi:
    m = (lo + hi) // 2                # Python ints: no overflow to dodge
    if pred(a[m]): lo = m + 1         # boundary is strictly right of m
    else:          hi = m             # m might itself be the boundary

return lo`,
      line: (f) =>
        f.final !== undefined ? 7 : f.m === undefined ? 1 : f.p ? 4 : 5,
    },
  },

  /* --- 07 monotonic stack --- */
  mono: {
    cpp: {
      code: `vector<int> res(n, 0);
stack<int> st;                        // indices, values non-increasing
for (int i = 0; i < n; ++i) {
    while (!st.empty() && T[i] > T[st.top()]) {
        int j = st.top(); st.pop();
        res[j] = i - j;               // j's answer is finally known
    }
    st.push(i);
}`,
      line: (f) => (f.i === undefined ? 2 : f.pop !== undefined ? 6 : 8),
    },
    py: {
      code: `res = [0] * n
st = []                               # indices, values non-increasing
for i, t in enumerate(T):
    while st and t > T[st[-1]]:
        j = st.pop()
        res[j] = i - j                # j's answer is finally known
    st.append(i)`,
      line: (f) => (f.i === undefined ? 2 : f.pop !== undefined ? 6 : 7),
    },
  },

  /* --- 08 linked list reversal --- */
  list: {
    cpp: {
      code: `ListNode *prev = nullptr, *cur = head;
while (cur) {
    ListNode* nxt = cur->next;        // save FIRST, or you strand the tail
    cur->next = prev;
    prev = cur;
    cur  = nxt;
}
return prev;                          // cur is null, prev is the new head`,
      line: (f) => {
        if (f.head !== undefined) return 8
        if (f.step === 'save') return 3
        if (f.step === 'relink') return 4
        if (f.step === 'slide') return [5, 6]
        return 1
      },
    },
    py: {
      code: `prev, cur = None, head
while cur:
    nxt = cur.next                    # save FIRST, or you strand the tail
    cur.next = prev
    prev = cur
    cur = nxt

return prev                           # cur is None, prev is the new head`,
      line: (f) => {
        if (f.head !== undefined) return 8
        if (f.step === 'save') return 3
        if (f.step === 'relink') return 4
        if (f.step === 'slide') return [5, 6]
        return 1
      },
    },
  },

  /* --- 09 tree traversal (listing depends on the chosen order) --- */
  tree: (order) =>
    order === 'level'
      ? {
          cpp: {
            code: `queue<Node*> q; if (root) q.push(root);
while (!q.empty()) {
    int sz = q.size();                // snapshot: one round = one level
    while (sz--) {
        Node* t = q.front(); q.pop();
        visit(t);
        if (t->left)  q.push(t->left);
        if (t->right) q.push(t->right);
    }
}`,
            line: (f) => (f.cur === null || f.cur === undefined ? 1 : 6),
          },
          py: {
            code: `q = deque([root]) if root else deque()
while q:
    sz = len(q)                       # snapshot: one round = one level
    for _ in range(sz):
        t = q.popleft()
        visit(t)
        if t.left:  q.append(t.left)
        if t.right: q.append(t.right)`,
            line: (f) => (f.cur === null || f.cur === undefined ? 1 : 6),
          },
        }
      : {
          cpp: {
            code: `void dfs(Node* n) {
    if (!n) return;
    visit(n);            // <-- PRE-order records here
    dfs(n->left);
    visit(n);            // <-- IN-order records here
    dfs(n->right);
    visit(n);            // <-- POST-order records here
}`,
            line: (f) => {
              if (f.cur === null || f.cur === undefined) return 2
              return order === 'pre' ? 3 : order === 'in' ? 5 : 7
            },
          },
          py: {
            code: `def dfs(n):
    if not n: return
    visit(n)             # <-- PRE-order records here
    dfs(n.left)
    visit(n)             # <-- IN-order records here
    dfs(n.right)
    visit(n)             # <-- POST-order records here`,
            line: (f) => {
              if (f.cur === null || f.cur === undefined) return 2
              return order === 'pre' ? 3 : order === 'in' ? 5 : 7
            },
          },
        },

  /* --- 10 heap (frames carry an explicit line; both listings are aligned) --- */
  heap: {
    cpp: {
      code: `// push(x): append, then sift UP
h.push_back(x);
int i = h.size() - 1;
while (i > 0) {
    int p = (i - 1) / 2;
    if (h[p] <= h[i]) break;          // heap property restored
    swap(h[p], h[i]);
    i = p;
}
// pop(): root out, last element in, then sift DOWN
int top = h[0];
h[0] = h.back(); h.pop_back();
int j = 0;
for (;;) {
    int l = 2*j + 1, r = 2*j + 2, s = j;
    if (l < h.size() && h[l] < h[s]) s = l;
    if (r < h.size() && h[r] < h[s]) s = r;
    if (s == j) break;                // both children are larger
    swap(h[j], h[s]);                 // always the SMALLER child
    j = s;
}`,
      line: (f) => f.ln,
    },
    py: {
      code: `# push(x): append, then sift UP   (heapq.heappush does all of this)
h.append(x)
i = len(h) - 1
while i > 0:
    p = (i - 1) // 2
    if h[p] <= h[i]: break            # heap property restored
    h[p], h[i] = h[i], h[p]
    i = p

# pop(): root out, last element in, then sift DOWN
top = h[0]
h[0] = h.pop()
j = 0
while True:
    l, r, s = 2*j + 1, 2*j + 2, j
    if l < len(h) and h[l] < h[s]: s = l
    if r < len(h) and h[r] < h[s]: s = r
    if s == j: break                  # both children are larger
    h[j], h[s] = h[s], h[j]           # always the SMALLER child
    j = s`,
      line: (f) => f.ln,
    },
  },

  /* --- 11 trie --- */
  trie: {
    cpp: {
      code: `Node* cur = root;
for (char c : w) {
    int i = c - 'a';
    if (!cur->kid[i])
        cur->kid[i] = new Node();     // no edge yet: create one
    cur = cur->kid[i];                // edge exists: reuse the prefix
}
cur->end = true;                      // without this flag, "do" is invisible`,
      line: (f) => {
        if (f.step === 'create') return 5
        if (f.step === 'walk') return 6
        if (f.step === 'end') return 8
        return 1
      },
    },
    py: {
      code: `cur = root
for c in w:
    i = ord(c) - ord('a')
    if cur.kid[i] is None:
        cur.kid[i] = Node()           # no edge yet: create one
    cur = cur.kid[i]                  # edge exists: reuse the prefix

cur.end = True                        # without this flag, "do" is invisible`,
      line: (f) => {
        if (f.step === 'create') return 5
        if (f.step === 'walk') return 6
        if (f.step === 'end') return 8
        return 1
      },
    },
  },

  /* --- 12 grid BFS / DFS --- */
  grid: {
    cpp: {
      code: `frontier.push({sr, sc, 0});
seen[sr][sc] = true;
while (!frontier.empty()) {
    auto [r, c, d] = frontier.take(); // front for BFS, top for DFS
    if (r == gr && c == gc) return d;
    for (auto [dr, dc] : DIRS) {
        int nr = r + dr, nc = c + dc;
        if (off_grid || wall || seen[nr][nc]) continue;
        seen[nr][nc] = true;          // mark at PUSH time, not at pop
        frontier.push({nr, nc, d + 1});
    }
}`,
      line: (f) => (f.cur === undefined ? 2 : f.found ? 5 : [4, 9]),
    },
    py: {
      code: `frontier = deque([(sr, sc, 0)])
seen[sr][sc] = True
while frontier:
    r, c, d = frontier.popleft() if bfs else frontier.pop()
    if (r, c) == (gr, gc): return d
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if off_grid or wall or seen[nr][nc]: continue
        seen[nr][nc] = True           # mark at PUSH time, not at pop
        frontier.append((nr, nc, d + 1))`,
      line: (f) => (f.cur === undefined ? 2 : f.found ? 5 : [4, 9]),
    },
  },

  /* --- 13 topological sort --- */
  topo: {
    cpp: {
      code: `for (auto& [u, vs] : adj)
    for (int v : vs) ++indeg[v];
for (auto& [u, _] : adj)
    if (!indeg[u]) q.push(u);         // no prerequisites: takeable now
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) q.push(v);
}
return order.size() == n ? order : {};   // short output means a cycle`,
      line: (f) => {
        if (f.done) return 11
        if (f.edge) return 9
        if (f.cur !== undefined) return 7
        return [2, 4]
      },
    },
    py: {
      code: `for u, vs in adj.items():
    for v in vs: indeg[v] += 1
for u in adj:
    if indeg[u] == 0: q.append(u)     # no prerequisites: takeable now
while q:
    u = q.popleft()
    order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
return order if len(order) == n else []   # short output means a cycle`,
      line: (f) => {
        if (f.done) return 11
        if (f.edge) return [9, 10]
        if (f.cur !== undefined) return 7
        return [2, 4]
      },
    },
  },

  /* --- 14 union-find --- */
  dsu: {
    cpp: {
      code: `int find(int x) {
    if (p[x] == x) return x;
    return p[x] = find(p[x]);         // path compression, on the way out
}
bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;         // this edge would close a cycle
    if (r[a] < r[b]) swap(a, b);      // union by rank: shallower goes under
    p[b] = a;
    if (r[a] == r[b]) ++r[a];
    return true;
}`,
      line: (f) => {
        if (f.step === 'compress') return 3
        if (f.step === 'cycle') return 7
        if (f.step === 'swap') return [8, 9]
        if (f.step === 'attach') return [9, 10]
        return undefined
      },
    },
    py: {
      code: `def find(x):
    if p[x] == x: return x
    p[x] = find(p[x])                 # path compression, on the way out
    return p[x]

def unite(a, b):
    a, b = find(a), find(b)
    if a == b: return False           # this edge would close a cycle
    if r[a] < r[b]: a, b = b, a       # union by rank: shallower goes under
    p[b] = a
    if r[a] == r[b]: r[a] += 1
    return True`,
      line: (f) => {
        if (f.step === 'compress') return 3
        if (f.step === 'cycle') return 8
        if (f.step === 'swap') return [9, 10]
        if (f.step === 'attach') return [10, 11]
        return undefined
      },
    },
  },

  /* --- 15 backtracking --- */
  bt: {
    cpp: {
      code: `void rec(int i) {
    if (i == n) { out.push_back(path); return; }
    path.push_back(a[i]);             // choose
    rec(i + 1);
    path.pop_back();                  // un-choose  <- the forgotten line
    rec(i + 1);                       // skip
}`,
      line: (f) => {
        if (f.undo) return 5
        if (f.leaf) return 2
        if (f.node) return 3
        return undefined
      },
    },
    py: {
      code: `def rec(i):
    if i == n: out.append(path[:]); return   # copy, or every row aliases
    path.append(a[i])                 # choose
    rec(i + 1)
    path.pop()                        # un-choose  <- the forgotten line
    rec(i + 1)                        # skip`,
      line: (f) => {
        if (f.undo) return 5
        if (f.leaf) return 2
        if (f.node) return 3
        return undefined
      },
    },
  },

  /* --- 16 DP, one dimension --- */
  dp1: {
    cpp: {
      code: `vector<int> dp(amount + 1, INF);
dp[0] = 0;                            // everything else starts unreachable
for (int x = 1; x <= amount; ++x)
    for (int c : coins) {
        if (c > x) continue;
        if (dp[x - c] + 1 < dp[x])
            dp[x] = dp[x - c] + 1;    // this coin is an improvement
    }
return dp[amount];`,
      line: (f) => {
        if (f.done) return 9
        if (f.x === undefined) return [1, 2]
        return f.better ? 7 : 6
      },
    },
    py: {
      code: `dp = [INF] * (amount + 1)
dp[0] = 0                             # everything else starts unreachable
for x in range(1, amount + 1):
    for c in coins:
        if c > x: continue
        if dp[x - c] + 1 < dp[x]:
            dp[x] = dp[x - c] + 1     # this coin is an improvement

return dp[amount]`,
      line: (f) => {
        if (f.done) return 9
        if (f.x === undefined) return [1, 2]
        return f.better ? 7 : 6
      },
    },
  },

  /* --- 17 DP, two dimensions --- */
  dp2: {
    cpp: {
      code: `vector<vector<int>> dp(n+1, vector<int>(m+1, 0));
for (int i = 1; i <= n; ++i)
    for (int j = 1; j <= m; ++j)
        dp[i][j] = (s1[i-1] == s2[j-1])
                 ? dp[i-1][j-1] + 1            // extend the diagonal
                 : max(dp[i-1][j], dp[i][j-1]); // drop one character
return dp[n][m];`,
      line: (f) => {
        if (f.done) return 7
        if (f.i === undefined) return 1
        return f.match ? 5 : 6
      },
    },
    py: {
      code: `dp = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    for j in range(1, m + 1):
        if s1[i-1] == s2[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1              # extend the diagonal
        else:
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])   # drop one character
return dp[n][m]`,
      line: (f) => {
        if (f.done) return 8
        if (f.i === undefined) return 1
        return f.match ? 5 : 7
      },
    },
  },

  /* --- 18 intervals --- */
  intervals: {
    cpp: {
      code: `sort(iv.begin(), iv.end());           // by start
vector<Interval> out;
for (auto& [s, e] : iv) {
    if (!out.empty() && s <= out.back().end)
        out.back().end = max(out.back().end, e);   // overlap: extend
    else
        out.push_back({s, e});                     // no overlap: new block
}`,
      line: (f) => {
        if (f.done || f.cur === undefined) return 1
        return f.merge ? 5 : 7
      },
    },
    py: {
      code: `iv.sort()                             # by start
out = []
for s, e in iv:
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)            # overlap: extend
    else:
        out.append([s, e])                         # no overlap: new block`,
      line: (f) => {
        if (f.done || f.cur === undefined) return 1
        return f.merge ? 5 : 7
      },
    },
  },
}
