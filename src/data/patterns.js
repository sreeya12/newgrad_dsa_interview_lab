/* Companion reference to the 45-day log: what to reach for, and the C++ that
   goes with it. Keyed by the phrase in a prompt that gives the pattern away. */

export const CARDS = [
  {
    g: 'Arrays',
    name: 'One-pass hash map',
    trigger: 'Find a pair / has it appeared before / count of each',
    move: "Store what you've seen as you go, and check for the complement before inserting. Two passes work but one pass is what interviewers expect.",
    big: 'O(n) time, O(n) space',
    canon: '1. Two Sum · 217. Contains Duplicate',
    code: `unordered_map<int,int> seen;               // value -> index
for (int i = 0; i < n; ++i) {
    auto it = seen.find(target - nums[i]);  // find(), not count()+[]
    if (it != seen.end()) return {it->second, i};
    seen[nums[i]] = i;
}`,
  },
  {
    g: 'Arrays',
    name: 'Two pointers on sorted input',
    trigger: 'Array is sorted / find a triplet summing to zero / closest pair',
    move: 'Shrink from both ends using the sortedness as your decision rule. Sort first if the problem lets you, then skip duplicates explicitly.',
    big: 'O(n log n) to sort, O(n) per scan',
    canon: '15. 3Sum · 11. Container With Most Water',
    code: `sort(nums.begin(), nums.end());
for (int i = 0; i + 2 < n; ++i) {
    if (i && nums[i] == nums[i-1]) continue;   // skip dup anchors
    int l = i + 1, r = n - 1;
    while (l < r) {
        int s = nums[i] + nums[l] + nums[r];
        if (s < 0) ++l;
        else if (s > 0) --r;
        else { res.push_back({nums[i],nums[l],nums[r]});
               while (l < r && nums[l] == nums[l+1]) ++l;
               ++l; --r; }
    }
}`,
  },
  {
    g: 'Arrays',
    name: 'Variable sliding window',
    trigger: 'Longest / shortest contiguous something satisfying a constraint',
    move: 'Expand right unconditionally, contract left while the window is invalid. Record the answer at the point where the window is valid.',
    big: 'O(n) — each index enters and leaves once',
    canon: '3. Longest Substring Without Repeating · 76. Minimum Window Substring',
    code: `int l = 0, best = 0;
unordered_map<char,int> cnt;
for (int r = 0; r < n; ++r) {
    ++cnt[s[r]];
    while (cnt[s[r]] > 1) --cnt[s[l++]];   // invariant: no repeats
    best = max(best, r - l + 1);
}`,
  },
  {
    g: 'Arrays',
    name: 'Prefix sum + hash map',
    trigger: 'Number of subarrays summing to k / balanced substring',
    move: 'Store counts of prefix sums seen so far. A subarray sums to k when prefix[r] - k has appeared before. Seed the map with {0,1}.',
    big: 'O(n) time, O(n) space',
    canon: '560. Subarray Sum Equals K',
    code: `unordered_map<long long,int> cnt{{0,1}};
long long run = 0; int res = 0;
for (int x : nums) {
    run += x;
    res += cnt[run - k];      // careful: this inserts a 0 if absent
    ++cnt[run];
}`,
  },
  {
    g: 'Stacks',
    name: 'Monotonic stack',
    trigger: 'Next greater / previous smaller / largest rectangle / span',
    move: 'Keep indices in a stack whose values are increasing (or decreasing). Popping is the moment you resolve an answer for the popped index.',
    big: 'O(n) — each index pushed and popped once',
    canon: '739. Daily Temperatures · 84. Largest Rectangle in Histogram',
    code: `stack<int> st;                       // holds indices, values increasing
for (int i = 0; i < n; ++i) {
    while (!st.empty() && h[i] < h[st.top()]) {
        int top = st.top(); st.pop();
        int left = st.empty() ? -1 : st.top();
        best = max(best, h[top] * (i - left - 1));
    }
    st.push(i);
}`,
  },
  {
    g: 'Search',
    name: 'Binary search on the answer',
    trigger: "Minimize the maximum / smallest k such that it's feasible / rate or capacity",
    move: 'When the answer space is monotone (feasible above some threshold, infeasible below), binary search the answer and write a separate feasibility check.',
    big: 'O(n log range)',
    canon: '875. Koko Eating Bananas · 1011. Capacity To Ship Packages',
    code: `auto ok = [&](long long speed) {
    long long h = 0;
    for (int p : piles) h += (p + speed - 1) / speed;
    return h <= H;
};
long long lo = 1, hi = *max_element(piles.begin(), piles.end());
while (lo < hi) {                     // lo is the answer at the end
    long long mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid; else lo = mid + 1;
}`,
  },
  {
    g: 'Search',
    name: 'Rotated / partitioned binary search',
    trigger: 'Sorted but rotated / find the pivot / search in a shifted array',
    move: 'One half is always properly sorted. Identify which, then decide whether the target lives in it.',
    big: 'O(log n)',
    canon: '33. Search in Rotated Sorted Array · 153. Find Minimum in Rotated',
    code: `while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    if (nums[lo] <= nums[mid]) {                  // left half sorted
        if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
        else lo = mid + 1;
    } else {                                      // right half sorted
        if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
        else hi = mid - 1;
    }
}`,
  },
  {
    g: 'Heaps',
    name: 'Top-k with a heap',
    trigger: 'k largest / k closest / k most frequent, especially streaming',
    move: "Keep a min-heap of size k for the k largest. Mention bucket sort as the O(n) alternative when the value range is bounded — that's the follow-up.",
    big: 'O(n log k)',
    canon: '215. Kth Largest Element · 973. K Closest Points',
    code: `priority_queue<int, vector<int>, greater<int>> pq;   // min-heap
for (int x : nums) {
    pq.push(x);
    if ((int)pq.size() > k) pq.pop();   // evict the smallest
}
return pq.top();                        // kth largest`,
  },
  {
    g: 'Heaps',
    name: 'Two heaps for a running median',
    trigger: 'Median from a stream / balance two halves',
    move: 'Max-heap for the lower half, min-heap for the upper. Rebalance so sizes differ by at most one.',
    big: 'O(log n) insert, O(1) query',
    canon: '295. Find Median from Data Stream',
    code: `priority_queue<int> lo;                                 // max-heap
priority_queue<int, vector<int>, greater<int>> hi;      // min-heap
void add(int x) {
    lo.push(x);
    hi.push(lo.top()); lo.pop();          // funnel through
    if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
}`,
  },
  {
    g: 'Trees',
    name: 'Post-order with a side channel',
    trigger: "Diameter / max path sum / any 'best anywhere in the tree' question",
    move: 'The recursive function returns what the parent can use; the global best is updated inside. Confusing these two is the most common tree bug.',
    big: 'O(n)',
    canon: '543. Diameter · 124. Binary Tree Maximum Path Sum',
    code: `int best = INT_MIN;
int gain(TreeNode* n) {                 // returns: best downward path
    if (!n) return 0;
    int l = max(gain(n->left),  0);     // negatives are never worth taking
    int r = max(gain(n->right), 0);
    best = max(best, n->val + l + r);   // the "through this node" case
    return n->val + max(l, r);
}`,
  },
  {
    g: 'Trees',
    name: 'Trie',
    trigger: 'Prefix / autocomplete / dictionary of words / word search on a board',
    move: "Fixed 26-way children array beats a hash map for speed. Store the word itself at terminal nodes when you'll need to emit it.",
    big: 'O(len) per insert or lookup',
    canon: '208. Implement Trie · 212. Word Search II',
    code: `struct Node {
    array<Node*,26> ch{};      // value-initialized to nullptr
    string word;               // non-empty marks a terminal
};
void insert(Node* root, const string& w) {
    Node* cur = root;
    for (char c : w) {
        int i = c - 'a';
        if (!cur->ch[i]) cur->ch[i] = new Node();
        cur = cur->ch[i];
    }
    cur->word = w;
}`,
  },
  {
    g: 'Recursion',
    name: 'Backtracking',
    trigger: 'All combinations / all permutations / partitions / place n things',
    move: 'Choose, recurse, un-choose. Sort first when duplicates exist, and skip an element if it equals the previous one at the same depth.',
    big: 'Exponential — say the bound out loud, e.g. O(n · 2ⁿ)',
    canon: '78. Subsets · 39. Combination Sum · 131. Palindrome Partitioning',
    code: `void dfs(int start, vector<int>& path) {
    res.push_back(path);
    for (int i = start; i < n; ++i) {
        if (i > start && nums[i] == nums[i-1]) continue;  // dedupe
        path.push_back(nums[i]);
        dfs(i + 1, path);
        path.pop_back();                                  // un-choose
    }
}`,
  },
  {
    g: 'Graphs',
    name: 'Multi-source BFS',
    trigger: 'Minutes until all cells are X / nearest source for every cell',
    move: 'Push every source into the queue before you start. Levels of the BFS are units of time.',
    big: 'O(rows · cols)',
    canon: '994. Rotting Oranges · 542. 01 Matrix',
    code: `queue<pair<int,int>> q;
for (int r = 0; r < R; ++r)
  for (int c = 0; c < C; ++c)
    if (grid[r][c] == 2) q.push({r,c});
int t = 0;
const int dr[4]{1,-1,0,0}, dc[4]{0,0,1,-1};
while (!q.empty()) {
    int sz = q.size();                       // one level = one minute
    while (sz--) { auto [r,c] = q.front(); q.pop();
        for (int k = 0; k < 4; ++k) { int nr=r+dr[k], nc=c+dc[k];
            if (nr<0||nc<0||nr>=R||nc>=C||grid[nr][nc]!=1) continue;
            grid[nr][nc] = 2; q.push({nr,nc}); } }
    if (!q.empty()) ++t;
}`,
  },
  {
    g: 'Graphs',
    name: 'Topological sort (Kahn)',
    trigger: 'Prerequisites / build order / can this be scheduled',
    move: "Count in-degrees, queue the zeros, peel. If you emit fewer than n nodes there's a cycle — that's usually the actual question.",
    big: 'O(V + E)',
    canon: '207. Course Schedule · 210. Course Schedule II',
    code: `vector<vector<int>> adj(n); vector<int> indeg(n, 0);
for (auto& e : edges) { adj[e[1]].push_back(e[0]); ++indeg[e[0]]; }
queue<int> q;
for (int i = 0; i < n; ++i) if (!indeg[i]) q.push(i);
vector<int> order;
while (!q.empty()) {
    int u = q.front(); q.pop(); order.push_back(u);
    for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
}
return (int)order.size() == n ? order : vector<int>{};   // cycle check`,
  },
  {
    g: 'Graphs',
    name: 'Union find',
    trigger: 'Connected components / redundant edge / accounts merge / is it a tree',
    move: 'Path compression plus union by size. If a union returns false, the edge closes a cycle.',
    big: 'Near O(1) amortized per operation',
    canon: '684. Redundant Connection · 323. Connected Components',
    code: `vector<int> p(n), sz(n, 1);
iota(p.begin(), p.end(), 0);
function<int(int)> find = [&](int x) {
    return p[x] == x ? x : p[x] = find(p[x]);      // path compression
};
bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;                      // already connected
    if (sz[a] < sz[b]) swap(a, b);
    p[b] = a; sz[a] += sz[b];
    return true;
}`,
  },
  {
    g: 'Graphs',
    name: 'Dijkstra',
    trigger: 'Cheapest / fastest path with non-negative weights',
    move: "Min-heap of (dist, node), skip stale entries. If weights can be negative or there's a hop limit, switch to Bellman-Ford.",
    big: 'O(E log V)',
    canon: '743. Network Delay Time · 787. Cheapest Flights Within K Stops',
    code: `priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
vector<int> dist(n, INT_MAX);
dist[src] = 0; pq.push({0, src});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;                   // stale
    for (auto [v, w] : adj[u])
        if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
}`,
  },
  {
    g: 'DP',
    name: '1-D DP over positions',
    trigger: "Ways to reach / max you can take with a restriction / can you form",
    move: "Say the state in one English sentence before writing code: 'dp[i] is the best answer considering the first i elements'. Then the transition writes itself.",
    big: 'O(n) or O(n·k) time, often O(1) space after rolling',
    canon: '198. House Robber · 322. Coin Change · 139. Word Break',
    code: `vector<int> dp(amount + 1, INT_MAX);
dp[0] = 0;
for (int a = 1; a <= amount; ++a)
    for (int c : coins)
        if (c <= a && dp[a - c] != INT_MAX)
            dp[a] = min(dp[a], dp[a - c] + 1);
return dp[amount] == INT_MAX ? -1 : dp[amount];`,
  },
  {
    g: 'DP',
    name: '2-D DP over two sequences',
    trigger: 'Edit distance / common subsequence / interleaving / matching two strings',
    move: 'dp[i][j] compares prefixes. Fill a 3×3 table by hand for a tiny input before coding — it catches base-case errors in seconds.',
    big: 'O(mn) time, O(min(m,n)) space if rolled',
    canon: '1143. LCS · 72. Edit Distance',
    code: `vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
for (int i = 1; i <= m; ++i)
    for (int j = 1; j <= n; ++j)
        dp[i][j] = (a[i-1] == b[j-1])
                 ? dp[i-1][j-1] + 1
                 : max(dp[i-1][j], dp[i][j-1]);
return dp[m][n];`,
  },
  {
    g: 'Greedy',
    name: 'Interval sweep',
    trigger: 'Merge / minimum rooms / maximum non-overlapping / scheduling',
    move: 'Sort by start to merge, sort by end to maximize how many fit. Say which one you chose and why — that sentence is the proof.',
    big: 'O(n log n)',
    canon: '56. Merge Intervals · 435. Non-overlapping Intervals · 253. Meeting Rooms II',
    code: `sort(iv.begin(), iv.end(),
     [](auto& a, auto& b){ return a[1] < b[1]; });   // by end time
int end = INT_MIN, kept = 0;
for (auto& x : iv)
    if (x[0] >= end) { ++kept; end = x[1]; }
return (int)iv.size() - kept;                        // removals needed`,
  },
  {
    g: 'Bits',
    name: 'XOR and bit counting',
    trigger: 'Every element appears twice except one / missing number / count set bits',
    move: "XOR cancels pairs and is its own inverse. n & (n-1) clears the lowest set bit — that's Brian Kernighan's trick.",
    big: 'O(n) or O(1) per number',
    canon: '136. Single Number · 191. Number of 1 Bits · 338. Counting Bits',
    code: `int x = 0;
for (int v : nums) x ^= v;          // pairs cancel, the loner survives
int bits(uint32_t n) {
    int c = 0;
    while (n) { n &= (n - 1); ++c; }   // clears lowest set bit
    return c;
}`,
  },
  {
    g: 'MLE',
    name: 'Weighted and reservoir sampling',
    trigger: 'Pick an index proportional to weight / sample from a stream of unknown length',
    move: "Prefix sums plus binary search for weighted picks. Reservoir sampling when you can't hold the stream. These show up in MLE loops far more than in SDE ones.",
    big: 'O(log n) per weighted pick, O(1) space for reservoir',
    canon: '528. Random Pick with Weight · 382. Linked List Random Node',
    code: `// weighted: build prefix sums once, then binary search a roll
partial_sum(w.begin(), w.end(), back_inserter(pre));
int pick() {
    int r = rand() % pre.back() + 1;
    return lower_bound(pre.begin(), pre.end(), r) - pre.begin();
}
// reservoir, k = 1
int res, seen = 0;
for (int x : stream) if (rand() % (++seen) == 0) res = x;`,
  },
]
