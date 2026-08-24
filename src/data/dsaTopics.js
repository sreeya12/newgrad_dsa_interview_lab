// DSA explained: one entry per topic. `signal` is the phrase in a problem
// statement that should make you reach for it.

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'linear', label: 'Linear' },
  { id: 'recursive', label: 'Recursive' },
  { id: 'hierarchical', label: 'Trees & heaps' },
  { id: 'graph', label: 'Graphs' },
  { id: 'optimisation', label: 'DP & greedy' },
]

export const topics = [
  {
    id: 'arrays',
    cat: 'linear',
    name: 'Arrays & dynamic arrays',
    idea:
      'A contiguous block of memory with O(1) indexing. A dynamic array (vector) doubles its capacity when full, which makes push_back amortised O(1) - most pushes are free, the occasional one copies everything.',
    signal: 'Anything with an index, a sequence, or "in place".',
    costs: [
      ['Index', 'O(1)'],
      ['Push back', 'O(1) amortised'],
      ['Insert / erase in the middle', 'O(n)'],
      ['Search unsorted', 'O(n)'],
    ],
    patterns: [
      'In-place modification with a write pointer that lags the read pointer.',
      'Reverse-the-whole-thing-then-reverse-parts for rotations.',
      'Using the array itself as a hash table when values are bounded by n (mark index i by negating a[i]).',
    ],
    pitfalls: [
      'Iterator invalidation after a reallocation - a saved pointer into a vector is dead after push_back.',
      'Erasing while iterating forward. Iterate backwards or use erase-remove.',
    ],
    code: `// Two-pointer in-place removal: keep everything != val
int write = 0;
for (int read = 0; read < (int)v.size(); ++read)
    if (v[read] != val) v[write++] = v[read];
v.resize(write);`,
  },
  {
    id: 'hashing',
    cat: 'linear',
    name: 'Hash tables',
    idea:
      'A key is hashed to a bucket index, giving average O(1) lookup. Collisions are handled by chaining or open addressing. Worst case is O(n) when everything collides, which is why adversarial inputs can break naive hashes.',
    signal: '"Have I seen this before?", "count the occurrences", "find a pair that sums to".',
    costs: [
      ['Insert / find / erase (average)', 'O(1)'],
      ['Insert / find / erase (worst)', 'O(n)'],
      ['Space', 'O(n)'],
    ],
    patterns: [
      'Complement lookup: for Two Sum, store what you have seen and look for target - x.',
      'Frequency map, then bucket by count for top-k in O(n).',
      'Canonical key: sort the characters of a string to group anagrams.',
      'Prefix sum in a map to count subarrays with a target sum.',
    ],
    pitfalls: [
      'map[key] inserts a default value just by reading it. Use find or count to test.',
      'Reaching for a hash map when a fixed array of size 26 or 128 is faster and simpler.',
    ],
    code: `unordered_map<int,int> seen;              // value -> index
for (int i = 0; i < (int)nums.size(); ++i) {
    int need = target - nums[i];
    if (seen.count(need)) return {seen[need], i};
    seen[nums[i]] = i;
}`,
  },
  {
    id: 'two-pointers',
    cat: 'linear',
    name: 'Two pointers',
    idea:
      'Two indices walk the array under a rule that guarantees you never need to revisit. Converging pointers work on sorted data; same-direction pointers implement fast/slow scans.',
    signal: 'Sorted input, palindromes, pairs or triplets, partitioning.',
    costs: [
      ['Time', 'O(n) after sorting'],
      ['Space', 'O(1)'],
    ],
    patterns: [
      'Converging: left and right move inward based on a comparison (Two Sum II, Container With Most Water).',
      'Fast and slow: cycle detection, finding the middle of a list.',
      'Three-way partition: Dutch national flag for Sort Colors.',
    ],
    pitfalls: [
      'Forgetting to skip duplicates in 3Sum, which produces duplicate triplets.',
      'Moving the wrong pointer in Container With Most Water - always move the shorter side.',
    ],
    code: `sort(nums.begin(), nums.end());
for (int i = 0; i + 2 < (int)nums.size(); ++i) {
    if (i > 0 && nums[i] == nums[i-1]) continue;
    int l = i + 1, r = (int)nums.size() - 1;
    while (l < r) {
        int sum = nums[i] + nums[l] + nums[r];
        if (sum < 0) ++l;
        else if (sum > 0) --r;
        else { out.push_back({nums[i], nums[l], nums[r]});
               while (l < r && nums[l] == nums[l+1]) ++l;
               ++l; --r; }
    }
}`,
  },
  {
    id: 'sliding-window',
    cat: 'linear',
    name: 'Sliding window',
    idea:
      'A contiguous range [l, r] that expands on the right and contracts on the left. Each index enters and leaves at most once, so the whole scan is O(n) even though it looks nested.',
    signal: '"Longest / shortest / count of contiguous subarray or substring with property X".',
    costs: [
      ['Time', 'O(n)'],
      ['Space', 'O(k) for the window state'],
    ],
    patterns: [
      'Variable window: grow right, then while the window is invalid, shrink left.',
      'Fixed window of size k: add r, remove r - k, record.',
      'Monotonic deque inside the window for the running max (Sliding Window Maximum).',
    ],
    pitfalls: [
      'Recording the answer at the wrong moment - decide whether it is after growing or after shrinking, and be consistent.',
      'Applying it to a problem with negative numbers where growing the window does not monotonically help.',
    ],
    code: `int l = 0, best = 0;
unordered_map<char,int> cnt;
for (int r = 0; r < (int)s.size(); ++r) {
    cnt[s[r]]++;
    while (cnt[s[r]] > 1) cnt[s[l++]]--;     // shrink until valid
    best = max(best, r - l + 1);
}`,
  },
  {
    id: 'prefix-sums',
    cat: 'linear',
    name: 'Prefix sums & difference arrays',
    idea:
      'Precompute cumulative totals so any range query becomes one subtraction. The difference array is the mirror image: it makes range updates O(1) and defers the cost to one final pass.',
    signal: '"Sum of a range", "count subarrays summing to k", "apply many range updates".',
    costs: [
      ['Build', 'O(n)'],
      ['Range query', 'O(1)'],
      ['Range update (difference array)', 'O(1)'],
    ],
    patterns: [
      'prefix[i+1] = prefix[i] + a[i], then sum(l..r) = prefix[r+1] - prefix[l].',
      'Prefix sum plus a hash map counts subarrays with a target sum in one pass.',
      'Prefix XOR for "subarray with XOR = k"; prefix modulo for divisibility questions.',
      '2-D prefix sums (summed-area tables) for submatrix queries.',
    ],
    pitfalls: [
      'Off-by-one on the prefix array size - use n + 1 with prefix[0] = 0 and the indexing gets easier.',
      'Integer overflow. Use long long for the prefix array.',
    ],
    code: `vector<ll> pre(n + 1, 0);
for (int i = 0; i < n; ++i) pre[i+1] = pre[i] + a[i];
ll rangeSum = pre[r+1] - pre[l];

// Count subarrays with sum == k
unordered_map<ll,int> seen{{0, 1}};
ll run = 0; int ans = 0;
for (int x : a) { run += x; ans += seen[run - k]; seen[run]++; }`,
  },
  {
    id: 'binary-search',
    cat: 'linear',
    name: 'Binary search',
    idea:
      'Halve the search space each step using a monotone predicate. The array does not have to be sorted - what has to be monotone is the yes/no answer. That reframing is what unlocks "binary search on the answer".',
    signal: 'Sorted input, or "minimise the maximum", "maximise the minimum", "smallest value that works".',
    costs: [
      ['Time', 'O(log n) x cost of the predicate'],
      ['Space', 'O(1)'],
    ],
    patterns: [
      'Search on value: find the target index.',
      'Search on answer: define feasible(x), find the boundary where it flips.',
      'lower_bound / upper_bound for insertion points and counting duplicates.',
      'Search a rotated array by deciding which half is sorted first.',
    ],
    pitfalls: [
      '(lo + hi) / 2 overflows. Write lo + (hi - lo) / 2.',
      'Mixing inclusive and exclusive bounds mid-problem, causing infinite loops. Pick one convention and never deviate.',
    ],
    code: `// Smallest x in [lo, hi] with feasible(x) true
int lo = 1, hi = maxAns;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (feasible(mid)) hi = mid;
    else               lo = mid + 1;
}
return lo;`,
  },
  {
    id: 'stacks',
    cat: 'linear',
    name: 'Stacks & monotonic stacks',
    idea:
      'LIFO. A monotonic stack keeps its contents sorted by popping anything that violates the order, which finds "the next greater / previous smaller element" for every index in a single O(n) pass.',
    signal: 'Matching pairs, undo, "next greater", histogram areas, expression parsing.',
    costs: [
      ['Push / pop / top', 'O(1)'],
      ['Monotonic stack scan', 'O(n) total - each index pushed and popped once'],
    ],
    patterns: [
      'Bracket matching and expression evaluation.',
      'Monotonic decreasing stack for "next greater element".',
      'Largest Rectangle in Histogram: pop while the current bar is shorter, and the popped bar extends to here.',
      'Iterative DFS when recursion depth is a risk.',
    ],
    pitfalls: [
      'Storing values when you need indices. Almost always push indices.',
      'Forgetting to drain the stack after the loop ends.',
    ],
    code: `// Next greater element to the right, for every index
vector<int> res(n, -1);
stack<int> st;                                // holds indices
for (int i = 0; i < n; ++i) {
    while (!st.empty() && a[st.top()] < a[i]) { res[st.top()] = a[i]; st.pop(); }
    st.push(i);
}`,
  },
  {
    id: 'linked-lists',
    cat: 'linear',
    name: 'Linked lists',
    idea:
      'Nodes linked by pointers. You buy O(1) insertion and deletion at a known position and pay with O(n) access and terrible cache behaviour. In interviews they are a test of careful pointer manipulation, not of data structure choice.',
    signal: 'The problem hands you a ListNode, or requires O(1) removal given a node.',
    costs: [
      ['Access by position', 'O(n)'],
      ['Insert / delete at a known node', 'O(1)'],
      ['Search', 'O(n)'],
    ],
    patterns: [
      'Dummy head node so you never special-case the front.',
      'Fast and slow pointers for the middle, cycle detection, and the cycle entry point.',
      'Reverse in place with prev / curr / next.',
      'Hash map from old node to new node for deep-copying a list with random pointers.',
    ],
    pitfalls: [
      'Losing the rest of the list by reassigning next before saving it.',
      'Not handling the empty list and single-node cases.',
    ],
    code: `ListNode *prev = nullptr, *curr = head;
while (curr) {
    ListNode *nxt = curr->next;   // save first
    curr->next = prev;
    prev = curr;
    curr = nxt;
}
return prev;`,
  },
  {
    id: 'recursion',
    cat: 'recursive',
    name: 'Recursion & divide and conquer',
    idea:
      'Solve a smaller instance and combine. Divide and conquer splits into independent halves; the recurrence T(n) = 2T(n/2) + O(n) gives O(n log n), which is where merge sort and quicksort come from.',
    signal: 'Self-similar structure: trees, sorted halves, nested definitions.',
    costs: [
      ['Merge sort', 'O(n log n) time, O(n) space'],
      ['Quickselect', 'O(n) average, O(n^2) worst'],
      ['Stack depth', 'O(depth) - a real constraint past ~10^5'],
    ],
    patterns: [
      'Define the base case first, then trust the recursion for the rest.',
      'Return one value, accumulate another in a reference parameter, when you need both a local and a global answer.',
      'Quickselect for kth-largest without sorting everything.',
    ],
    pitfalls: [
      'Missing or wrong base case gives infinite recursion and a stack overflow.',
      'Recomputing the same subproblem - that is the moment to add memoisation and call it DP.',
    ],
    code: `int quickselect(vector<int> &a, int l, int r, int k) {   // kth smallest, 0-indexed
    if (l == r) return a[l];
    int p = partition(a, l, r);
    if (k == p) return a[p];
    return k < p ? quickselect(a, l, p - 1, k)
                 : quickselect(a, p + 1, r, k);
}`,
  },
  {
    id: 'backtracking',
    cat: 'recursive',
    name: 'Backtracking',
    idea:
      'Systematic search over a decision tree: choose, explore, un-choose. Pruning is what makes it tractable - the difference between an accepted and a timed-out solution is almost always the pruning rule, not the traversal.',
    signal: '"All combinations", "all permutations", "all valid ways", constraint puzzles.',
    costs: [
      ['Subsets', 'O(n * 2^n)'],
      ['Permutations', 'O(n * n!)'],
      ['Space', 'O(depth) for the recursion plus the current path'],
    ],
    patterns: [
      'One template: for each choice - make it, recurse, undo it.',
      'Sort first, then skip nums[i] == nums[i-1] at the same depth to avoid duplicate results.',
      'Mark the grid cell as visited before recursing and restore it after.',
      'Prune early: if the partial sum already exceeds the target, return.',
    ],
    pitfalls: [
      'Forgetting to undo the choice, which leaks state into sibling branches.',
      'Copying the path at every node when you only need it at the leaves.',
    ],
    code: `void dfs(int start, vector<int> &path) {
    out.push_back(path);
    for (int i = start; i < n; ++i) {
        if (i > start && a[i] == a[i-1]) continue;   // dedup
        path.push_back(a[i]);
        dfs(i + 1, path);
        path.pop_back();
    }
}`,
  },
  {
    id: 'sorting',
    cat: 'linear',
    name: 'Sorting',
    idea:
      'Comparison sorts cannot beat O(n log n) - that is a proven lower bound. Counting and radix sorts beat it by not comparing, at the cost of assuming bounded keys.',
    signal: 'Order matters, or sorting makes a later step trivially greedy or two-pointer.',
    costs: [
      ['sort (introsort)', 'O(n log n), not stable'],
      ['stable_sort', 'O(n log n), stable, may allocate'],
      ['Counting sort', 'O(n + k) for keys in [0, k)'],
      ['nth_element', 'O(n) average'],
    ],
    patterns: [
      'Sort by start time for interval problems, by end time for greedy scheduling.',
      'Custom comparator to encode a tie-break rule.',
      'Sort then dedup with unique + erase.',
      'partial_sort or a size-k heap when you only need the top k.',
    ],
    pitfalls: [
      'A comparator that is not a strict weak ordering (using <= instead of <) is undefined behaviour and can crash.',
      'Assuming sort is stable. It is not.',
    ],
    code: `sort(v.begin(), v.end(), [](const Item &a, const Item &b) {
    if (a.score != b.score) return a.score > b.score;
    return a.id < b.id;
});`,
  },
  {
    id: 'heaps',
    cat: 'hierarchical',
    name: 'Heaps & priority queues',
    idea:
      'A complete binary tree stored in an array where every parent beats its children. You get the extreme element in O(1) and pay O(log n) to insert or remove it. Building from an existing array is O(n), not O(n log n).',
    signal: '"Top k", "kth largest", "merge k sorted", "always process the smallest next", running median.',
    costs: [
      ['Peek', 'O(1)'],
      ['Push / pop', 'O(log n)'],
      ['Heapify an array', 'O(n)'],
    ],
    patterns: [
      'Top-k: keep a min-heap of size k, so memory is O(k) and time is O(n log k).',
      'k-way merge: heap of the current head of each list.',
      'Two heaps (max-heap for the low half, min-heap for the high half) for a running median.',
      'Dijkstra and Prim are both "process the cheapest frontier item next".',
    ],
    pitfalls: [
      'C++ priority_queue is a max-heap by default - the single most common heap bug.',
      'Using a heap of size n when a heap of size k would do.',
    ],
    code: `priority_queue<int, vector<int>, greater<int>> minHeap;   // size-k min-heap
for (int x : nums) {
    minHeap.push(x);
    if ((int)minHeap.size() > k) minHeap.pop();
}
return minHeap.top();                                     // kth largest`,
  },
  {
    id: 'trees',
    cat: 'hierarchical',
    name: 'Binary trees & BSTs',
    idea:
      'A tree is recursion made visible. A BST adds the invariant that everything left is smaller and everything right is larger, which makes in-order traversal produce sorted output and search O(height). Balanced means height is O(log n); degenerate means O(n).',
    signal: 'The input is a TreeNode, or the data is hierarchical, or you need sorted order plus dynamic inserts.',
    costs: [
      ['BST search / insert / erase', 'O(h): O(log n) balanced, O(n) degenerate'],
      ['Any traversal', 'O(n) time, O(h) space'],
    ],
    patterns: [
      'Pre-order to copy or serialise, in-order for sorted output in a BST, post-order when children must be resolved first.',
      'BFS with an explicit level-size counter for level-order answers.',
      'Return one value up while updating a global best - Binary Tree Maximum Path Sum.',
      'Validate a BST with (min, max) bounds passed down, never by comparing to the parent alone.',
    ],
    pitfalls: [
      'Validating a BST with only a local parent check - it passes on trees that are not BSTs.',
      'Forgetting the null base case, or that a single node has depth 1 not 0 (check the problem definition).',
    ],
    code: `bool valid(TreeNode *n, long lo, long hi) {
    if (!n) return true;
    if (n->val <= lo || n->val >= hi) return false;
    return valid(n->left, lo, n->val) && valid(n->right, n->val, hi);
}`,
  },
  {
    id: 'tries',
    cat: 'hierarchical',
    name: 'Tries',
    idea:
      'A tree keyed by characters, where the path from the root spells the string. Lookup costs O(length) regardless of how many words are stored, and every prefix is a node you can hang data off.',
    signal: 'Prefix queries, autocomplete, word dictionaries, wildcard search over many words.',
    costs: [
      ['Insert / search', 'O(L) for a word of length L'],
      ['Space', 'O(total characters x alphabet), can be heavy'],
    ],
    patterns: [
      'Store an is_word flag on nodes, not only on leaves.',
      'Cache the top-k completions on each prefix node for autocomplete.',
      'Combine a trie with grid DFS to search many words at once (Word Search II).',
      'Bitwise trie over 32 bits for maximum-XOR problems.',
    ],
    pitfalls: [
      'Allocating a 26-pointer array per node for a sparse alphabet - use a hash map per node instead.',
      'Forgetting to prune trie branches once matched in Word Search II, which makes it time out.',
    ],
    code: `struct Node { Node* next[26] = {}; bool word = false; };

void insert(Node *root, const string &s) {
    Node *cur = root;
    for (char c : s) {
        int i = c - 'a';
        if (!cur->next[i]) cur->next[i] = new Node();
        cur = cur->next[i];
    }
    cur->word = true;
}`,
  },
  {
    id: 'graphs',
    cat: 'graph',
    name: 'Graph traversal - BFS & DFS',
    idea:
      'BFS explores in rings and therefore finds the fewest-edges path on an unweighted graph. DFS goes deep and is the natural fit for connectivity, cycle detection and anything defined recursively. Grids are graphs where the edges are implicit.',
    signal: 'Connections, reachability, islands, shortest hops, "is it possible to get from A to B".',
    costs: [
      ['BFS / DFS', 'O(V + E)'],
      ['Space', 'O(V) for visited plus the frontier'],
    ],
    patterns: [
      'Multi-source BFS: seed the queue with every source at distance 0 (Rotting Oranges, Walls and Gates).',
      'Mark visited when you enqueue, not when you dequeue, or nodes get queued many times.',
      'Bidirectional BFS halves the explored space when you know both endpoints.',
      'DFS from the border inward to invert a "surrounded region" question.',
    ],
    pitfalls: [
      'Using DFS for shortest path on an unweighted graph. It does not give the shortest path.',
      'Recursion depth on a 1000x1000 grid - convert to an iterative stack.',
    ],
    code: `queue<pair<int,int>> q;
vector<vector<int>> dist(rows, vector<int>(cols, -1));
for (auto &s : sources) { q.push(s); dist[s.first][s.second] = 0; }
const int dr[4]{-1,1,0,0}, dc[4]{0,0,-1,1};
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int d = 0; d < 4; ++d) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (dist[nr][nc] != -1 || grid[nr][nc] == WALL) continue;
        dist[nr][nc] = dist[r][c] + 1;
        q.push({nr, nc});
    }
}`,
  },
  {
    id: 'toposort',
    cat: 'graph',
    name: 'Topological sort',
    idea:
      'A linear ordering of a DAG where every edge points forward. Kahn algorithm repeatedly removes nodes with indegree zero; if any node survives, the graph had a cycle. That cycle detection is often the actual question.',
    signal: 'Prerequisites, build order, task dependencies, "is this schedule possible".',
    costs: [
      ['Time', 'O(V + E)'],
      ['Space', 'O(V + E)'],
    ],
    patterns: [
      'Kahn BFS with an indegree array - easiest to write and it detects cycles for free.',
      'DFS with three colours (unvisited / in-stack / done) when you want the cycle itself.',
      'Layer-by-layer processing gives the minimum number of semesters or rounds.',
    ],
    pitfalls: [
      'Building the edges backwards. Write down which direction "a before b" means before you code.',
      'Forgetting that the answer is only valid if you output all V nodes.',
    ],
    code: `vector<int> indeg(n, 0);
for (auto &[u, v] : edges) { adj[u].push_back(v); indeg[v]++; }
queue<int> q;
for (int i = 0; i < n; ++i) if (!indeg[i]) q.push(i);
vector<int> order;
while (!q.empty()) {
    int u = q.front(); q.pop(); order.push_back(u);
    for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
}
bool acyclic = (int)order.size() == n;`,
  },
  {
    id: 'union-find',
    cat: 'graph',
    name: 'Union-find (disjoint set union)',
    idea:
      'Tracks a partition into disjoint sets with two operations: which set is x in, and merge these two sets. With path compression and union by rank the amortised cost is inverse-Ackermann - effectively constant.',
    signal: 'Dynamic connectivity, "are these in the same group", counting components, Kruskal MST.',
    costs: [
      ['find / union (amortised)', 'O(alpha(n)) - effectively O(1)'],
      ['Space', 'O(n)'],
    ],
    patterns: [
      'Count components: start at n, decrement on every successful union.',
      'Detect a redundant edge: the first union that returns false is the cycle-closing edge.',
      'Kruskal: sort edges by weight, union greedily, stop after n - 1 merges.',
      'Single-linkage clustering is exactly Kruskal stopped early.',
    ],
    pitfalls: [
      'Skipping path compression, which degrades find to O(n) on adversarial input.',
      'Using it for directed-graph connectivity. It only models undirected relationships.',
    ],
    code: `int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (r[a] < r[b]) swap(a, b);
    p[b] = a; if (r[a] == r[b]) ++r[a];
    return true;
}`,
  },
  {
    id: 'shortest-paths',
    cat: 'graph',
    name: 'Weighted shortest paths',
    idea:
      'Dijkstra greedily settles the closest unsettled node and is correct only with non-negative weights. Bellman-Ford relaxes every edge V-1 times, tolerates negative weights, and detects negative cycles. Floyd-Warshall computes all pairs in O(V^3).',
    signal: 'Edges have costs, and you need the cheapest route, minimum delay, or maximum probability path.',
    costs: [
      ['Dijkstra with a binary heap', 'O((V + E) log V)'],
      ['Bellman-Ford', 'O(V * E)'],
      ['Floyd-Warshall', 'O(V^3)'],
    ],
    patterns: [
      'Dijkstra with lazy deletion: skip a popped node whose stored distance is stale.',
      'When state is more than "which node" (fuel left, stops used), make the state a tuple and run Dijkstra over the expanded graph.',
      'Bellman-Ford with a stop limit is the clean answer to Cheapest Flights Within K Stops.',
      '0-1 BFS with a deque when weights are only 0 or 1.',
    ],
    pitfalls: [
      'Running Dijkstra with negative edges. It silently returns wrong answers.',
      'Not using long long for accumulated distances.',
    ],
    code: `priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>> pq;
vector<ll> d(n, LLONG_MAX);
d[src] = 0; pq.push({0, src});
while (!pq.empty()) {
    auto [du, u] = pq.top(); pq.pop();
    if (du > d[u]) continue;                 // stale entry
    for (auto [v, w] : adj[u])
        if (du + w < d[v]) { d[v] = du + w; pq.push({d[v], v}); }
}`,
  },
  {
    id: 'greedy',
    cat: 'optimisation',
    name: 'Greedy',
    idea:
      'Take the locally best option and never reconsider. It works only when the problem has the greedy-choice property, meaning a locally optimal choice is part of some globally optimal solution. When you cannot argue that, you need DP.',
    signal: 'Scheduling, interval selection, "minimum number of X", making change with well-behaved denominations.',
    costs: [
      ['Usually', 'O(n log n) - dominated by the sort'],
      ['Space', 'O(1) to O(n)'],
    ],
    patterns: [
      'Sort by end time to fit the most non-overlapping intervals.',
      'Track a running best-reachable index for jump problems.',
      'Exchange argument: show that swapping any non-greedy choice for the greedy one does not make the answer worse.',
      'Heap-based greedy when the best next option changes as you go.',
    ],
    pitfalls: [
      'Assuming greedy works because it passes the samples. Try to construct a counterexample first.',
      'Sorting by the wrong key - start time versus end time completely changes the answer.',
    ],
    code: `sort(iv.begin(), iv.end(),
     [](auto &a, auto &b) { return a[1] < b[1]; });   // by END time
int end = INT_MIN, keep = 0;
for (auto &x : iv) if (x[0] >= end) { end = x[1]; ++keep; }
return (int)iv.size() - keep;                          // removals needed`,
  },
  {
    id: 'dp',
    cat: 'optimisation',
    name: 'Dynamic programming',
    idea:
      'Recursion plus memory. It applies when the problem has optimal substructure (the best answer is built from best answers to subproblems) and overlapping subproblems (the same subproblem recurs). Complexity is number of states times work per state - say both out loud before you code.',
    signal: '"Count the ways", "minimum or maximum cost", "is it possible", and a brute force that recomputes.',
    costs: [
      ['Time', 'states x transitions'],
      ['Space', 'O(states), often reducible to one or two rows'],
    ],
    patterns: [
      'Define dp[i] in a sentence first. Ambiguity in the definition is where DP goes wrong.',
      'Top-down memoisation is easier to derive; bottom-up is easier to space-optimise.',
      '0/1 knapsack: iterate capacity downward. Unbounded knapsack: iterate upward.',
      'Two-string DP (LCS, edit distance) is a grid where each cell compares one character pair.',
      'Interval DP (Burst Balloons, matrix chain) loops over length, then left, then a split point.',
      'Bitmask DP when n <= 20 and the state is a subset.',
    ],
    pitfalls: [
      'Skipping the state definition and coding the transition from intuition.',
      'Wrong loop order in knapsack, which silently allows reusing an item.',
      'Space-optimising before the naive version is correct.',
    ],
    code: `// Coin change: fewest coins to make amount
vector<int> dp(amount + 1, INT_MAX);
dp[0] = 0;
for (int a = 1; a <= amount; ++a)
    for (int c : coins)
        if (c <= a && dp[a - c] != INT_MAX)
            dp[a] = min(dp[a], dp[a - c] + 1);
return dp[amount] == INT_MAX ? -1 : dp[amount];`,
  },
  {
    id: 'bits',
    cat: 'optimisation',
    name: 'Bit manipulation',
    idea:
      'Integers as arrays of bits. XOR is self-inverse (x ^ x == 0), which cancels pairs. Subtracting one flips the lowest set bit and everything below it, which is the source of most bit tricks.',
    signal: 'Constraints mention n <= 20 (subsets), or the problem is about parity, pairs, or subsets.',
    costs: [
      ['Bit ops', 'O(1)'],
      ['Enumerate all subsets of n items', 'O(2^n)'],
      ['Enumerate all subsets of all masks', 'O(3^n)'],
    ],
    patterns: [
      'XOR everything to find the single unpaired element.',
      'x & (x - 1) clears the lowest set bit - loop it to count bits in O(popcount).',
      'Bitmask as a set for DP over subsets.',
      '1 << i for membership tests; always 1LL past 31 bits.',
    ],
    pitfalls: [
      'Shifting by 32 or more on a 32-bit int is undefined behaviour.',
      'Right-shifting a negative signed int is implementation-defined.',
      'Operator precedence: & and | bind looser than ==, so parenthesise.',
    ],
    code: `int single = 0;
for (int x : nums) single ^= x;              // pairs cancel

int bits = 0;
for (int x = mask; x; x &= x - 1) ++bits;    // popcount

for (int sub = mask; sub; sub = (sub - 1) & mask) { /* every subset */ }`,
  },
  {
    id: 'intervals',
    cat: 'linear',
    name: 'Intervals',
    idea:
      'Ranges on a line. Almost every interval problem starts by sorting, and the choice of sort key (start versus end) is the whole solution. The sweep-line view - convert each interval into a +1 event and a -1 event - solves the counting variants.',
    signal: 'Meetings, bookings, ranges, overlaps, "minimum rooms needed".',
    costs: [
      ['Sort + single pass', 'O(n log n)'],
      ['Sweep line with a heap', 'O(n log n)'],
    ],
    patterns: [
      'Sort by start to merge overlapping intervals.',
      'Sort by end to keep the maximum number of non-overlapping intervals.',
      'Min-heap of end times for "how many rooms" (Meeting Rooms II).',
      'Sweep line: sort all endpoints, +1 on a start, -1 on an end, track the running maximum.',
    ],
    pitfalls: [
      'Deciding too late whether touching endpoints ([1,2] and [2,3]) count as overlapping. Ask.',
      'Merging in place while iterating and losing intervals.',
    ],
    code: `sort(iv.begin(), iv.end());
vector<vector<int>> out;
for (auto &x : iv) {
    if (!out.empty() && x[0] <= out.back()[1])
        out.back()[1] = max(out.back()[1], x[1]);
    else out.push_back(x);
}`,
  },
]
