/* Content for the four printable C++ sheets.
   Cell items: {c,k} = a cost chip, {t} = text, {br} = line break.
   Text fields use `backticks` for inline code spans. */

const chip = (c, k) => ({ c, k })
const txt = (t) => ({ t })
const BR = { br: true }

export const CONTAINERS = [
  {
    name: 'vector<T>',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1'), txt('back'), BR, chip('O(n)', 'kn'), txt('middle')],
    find: [chip('O(n)', 'kn')],
    use: 'Default for everything. Contiguous, cache-friendly, sortable.',
  },
  {
    name: 'deque<T>',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1'), txt('both ends')],
    find: [chip('O(n)', 'kn')],
    use: 'Sliding-window max, BFS where you push front, monotonic deque.',
  },
  {
    name: 'string',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1'), txt('back')],
    find: [chip('O(n)', 'kn')],
    use: 'A vector of chars with extras: `substr`, `find`, `+=`.',
  },
  {
    name: 'unordered_map/set',
    access: [txt('—')],
    insert: [chip('O(1)', 'k1'), chip('O(n) worst', 'kbad')],
    find: [chip('O(1)', 'k1')],
    use: 'Seen-before checks, frequency counts, adjacency lists.',
  },
  {
    name: 'map/set',
    access: [txt('—')],
    insert: [chip('O(log n)', 'klog')],
    find: [chip('O(log n)', 'klog')],
    use: 'You need keys in sorted order, or floor/ceiling queries.',
  },
  {
    name: 'multiset<T>',
    access: [txt('—')],
    insert: [chip('O(log n)', 'klog')],
    find: [chip('O(log n)', 'klog')],
    use: 'A heap you can also delete from the middle of.',
  },
  {
    name: 'priority_queue<T>',
    access: [chip('O(1)', 'k1'), txt('top')],
    insert: [chip('O(log n)', 'klog')],
    find: [txt('top only')],
    use: 'Top-k, merge k lists, Dijkstra, task scheduling.',
  },
  {
    name: 'stack / queue',
    access: [chip('O(1)', 'k1')],
    insert: [chip('O(1)', 'k1')],
    find: [txt('end only')],
    use: 'Parentheses, monotonic stack, BFS levels.',
  },
  {
    name: 'array<T,N>',
    access: [chip('O(1)', 'k1')],
    insert: [txt('fixed')],
    find: [chip('O(n)', 'kn')],
    use: 'Trie children `array<Node*,26>`, direction vectors.',
  },
  {
    name: 'bitset<N>',
    access: [chip('O(1)', 'k1')],
    insert: [txt('fixed')],
    find: [chip('O(1)', 'k1')],
    use: 'Subset DP, dense visited flags, `count()` popcount.',
  },
]

export const ALGOS = [
  ['sort(b, e) / sort(b, e, cmp)', chip('O(n log n)', 'kbad'), 'Introsort. `cmp(a,b)` must be true only when a strictly precedes b.'],
  ['stable_sort(b, e)', chip('O(n log²n)', 'kbad'), 'Preserves ties. Needed when a second key was already sorted.'],
  ['nth_element(b, b+k, e)', chip('O(n) avg', 'kn'), 'Quickselect. Kth largest without a full sort — a strong answer to "can you beat n log n?"'],
  ['lower_bound(b, e, x)', chip('O(log n)', 'klog'), 'First element `>= x`. Requires sorted input.'],
  ['upper_bound(b, e, x)', chip('O(log n)', 'klog'), 'First element `> x`. The pair gives you the run of equals.'],
  ['max_element / min_element', chip('O(n)', 'kn'), 'Returns an iterator — dereference it: `*max_element(...)`.'],
  ['accumulate(b, e, 0LL)', chip('O(n)', 'kn'), 'Sum. The init value fixes the type — `0` overflows, `0LL` does not.'],
  ['partial_sum(b, e, out)', chip('O(n)', 'kn'), 'Prefix sums in one line.'],
  ['iota(b, e, 0)', chip('O(n)', 'kn'), 'Fills 0,1,2,… — the union-find parent array.'],
  ['reverse(b, e) / rotate', chip('O(n)', 'kn'), 'In place. `rotate` handles "shift array by k" in one call.'],
  ['v.erase(unique(b,e), v.end())', chip('O(n)', 'kn'), 'Dedupe — only removes adjacent duplicates, so sort first.'],
  ['next_permutation(b, e)', chip('O(n)', 'kn'), 'Next lexicographic arrangement; returns false when it wraps.'],
  ['count / find / fill', chip('O(n)', 'kn'), 'Basics. `find` returns `e` on failure, not `-1`.'],
  ['__gcd(a, b)', chip('O(log n)', 'klog'), 'GCD without writing it. LCM is `a / __gcd(a,b) * b`.'],
]

export const GOTCHAS = [
  ['`if (mp[k] == 0)` as a check', 'Inserts `k` with value 0. Your map grows; `size()` lies.', 'Use `mp.count(k)` or `mp.find(k)` to read.'],
  ['`i < v.size() - 1` on empty v', '`size()` is unsigned — `0-1` wraps to a huge number. Loop runs forever.', '`i + 1 < v.size()`, or cast to `int`.'],
  ['`(lo + hi) / 2`', 'Overflows once indices exceed ~2·10⁹, and on sum-space binary search.', '`lo + (hi - lo) / 2`.'],
  ['`int` sum of large arrays', 'Silent overflow, wrong answer on the big test only.', '`long long`, and `accumulate(..., 0LL)`.'],
  ['Erasing while range-for-ing', 'Iterator invalidation, undefined behavior.', '`it = mp.erase(it)` in a manual loop.'],
  ['Holding `int& x = v[0]` then `push_back`', 'Reallocation leaves a dangling reference.', 'Store the index, or `reserve()` first.'],
  ['Reversed `priority_queue` comparator', 'You get a max-heap when you wanted a min-heap.', 'See Fig. 3. Test with three values before trusting it.'],
  ['`ms.erase(value)` on a multiset', 'Erases every copy, not one.', '`ms.erase(ms.find(value))`.'],
  ['Deep recursion on a skewed tree', 'Stack overflow at ~10⁴–10⁵ frames.', 'Convert to an explicit stack, or mention the risk out loud.'],
  ['Uninitialized local `int x;`', 'Garbage value; passes locally, fails on the judge.', 'Always initialize: `int x = 0;`'],
  ['`unique()` without sorting', 'Only adjacent duplicates go away.', '`sort` then `erase(unique(...), end())`.'],
]

export const SNIPPETS = {
  pairKeys: `// pair keys without writing a hash
unordered_map<long long,int> seen;
auto enc = [](int r, int c){ return r * 1000LL + c; };
seen[enc(r,c)]++;`,

  declaring: `vector<int> a(n, 0);
vector<vector<int>> g(R, vector<int>(C, 0));   // grid
vector<bool> vis(n, false);                     // bit-packed!
vector<vector<int>> adj(n);                     // graph
priority_queue<int> maxh;                        // max-heap
priority_queue<int, vector<int>, greater<int>> minh;
priority_queue<pair<int,int>, vector<pair<int,int>>,
               greater<>> pq;                    // Dijkstra
const int dr[4]{1,-1,0,0}, dc[4]{0,0,1,-1};      // 4-dir`,

  boundIdx: `// index from an iterator
int i = lower_bound(v.begin(), v.end(), x) - v.begin();
// exists?
bool has = binary_search(v.begin(), v.end(), x);`,

  comparators: `// sort: by second desc, tie-break first asc
sort(v.begin(), v.end(), [](auto& a, auto& b){
    if (a.second != b.second) return a.second > b.second;
    return a.first < b.first;
});
// heap of (dist,node), smallest dist on top
auto cmp = [](auto& a, auto& b){ return a.first > b.first; };
priority_queue<P, vector<P>, decltype(cmp)> pq(cmp);`,

  recursiveLambda: `// recursive lambda — captures by reference, no member needed
function<int(int)> dfs = [&](int u) {
    int best = 0;
    for (int v : adj[u]) best = max(best, dfs(v));
    return best + 1;
};
// C++23 alternative: auto dfs = [&](this auto&& self, int u){...}`,

  captures: `[&]   // capture everything by reference — the default for LeetCode
[=]   // by copy; silently expensive with big vectors
[&g, n] // explicit; use when the interviewer asks about captures
for (auto& [k, v] : freq) { ... }   // structured binding, C++17
auto [q, r] = div(a, b);`,

  strings: `s.substr(i, len)        // LENGTH, not end index
s.find("ab")            // npos if absent, not -1
if (s.find(t) != string::npos) ...
s.push_back(c); s += t; s.pop_back();
reverse(s.begin(), s.end());
stoi(s); stoll(s); stod(s);   // throws on garbage
to_string(42);
int d = c - '0';        // char digit -> int
char c = 'a' + i;       // int -> letter
isalnum(c); isdigit(c); tolower(c);
// split on spaces
istringstream is(s); string w;
while (is >> w) out.push_back(w);
// 26-letter frequency signature
array<int,26> f{};
for (char c : s) ++f[c - 'a'];`,

  hashmaps: `++mp[k];                // default-constructs 0 first — fine here
if (mp.count(k)) ...    // read-only check
auto it = mp.find(k);   // one lookup instead of two
if (it != mp.end()) use(it->second);
mp.erase(k);
for (auto& [k, v] : mp) ...
// insert only if absent
mp.emplace(k, v);       // no-op if k exists
mp[k] = v;              // overwrites
// grouping
unordered_map<string, vector<string>> groups;
groups[key].push_back(word);   // vector auto-created`,

  grids: `int R = g.size(), C = g[0].size();
const int dr[4]{1,-1,0,0}, dc[4]{0,0,1,-1};
for (int k = 0; k < 4; ++k) {
    int nr = r + dr[k], nc = c + dc[k];
    if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
    ...
}
// 8 directions: add the diagonals
const int d8r[8]{1,1,1,0,0,-1,-1,-1},
          d8c[8]{-1,0,1,-1,1,-1,0,1};`,

  numbers: `#include <climits>
INT_MAX  2147483647     LLONG_MAX  ~9.2e18
INT_MIN -2147483648
int mid = lo + (hi - lo) / 2;    // never (lo+hi)/2
long long prod = 1LL * a * b;    // promote BEFORE multiply
// integer division truncates toward zero
-7 / 2 == -3;  -7 % 2 == -1;
// ceiling division of positives
int up = (a + b - 1) / b;
// safe "infinity" you can still add to
const int INF = 1e9;             // not INT_MAX`,

  bits: `n & (n - 1)        // clear lowest set bit
n & (-n)           // isolate lowest set bit
n >> i & 1         // read bit i
n |= 1 << i;       // set bit i
n &= ~(1 << i);    // clear bit i
n ^= 1 << i;       // flip bit i
__builtin_popcount(x)     // set bits, unsigned int
__builtin_popcountll(x)   // 64-bit version
__builtin_ctz(x)          // trailing zeros (x != 0)
__builtin_clz(x)          // leading zeros
1LL << 40         // 1 << 40 is UB on 32-bit int
// enumerate all subsets of an n-element set
for (int mask = 0; mask < (1 << n); ++mask) ...
// enumerate submasks of mask
for (int s = mask; s; s = (s - 1) & mask) ...`,

  sorting: `// vector<vector<int>> sorts lexicographically already
sort(iv.begin(), iv.end());              // by start
sort(iv.begin(), iv.end(),
     [](auto& a, auto& b){ return a[1] < b[1]; });  // by end
// sort indices, not the data
vector<int> idx(n); iota(idx.begin(), idx.end(), 0);
sort(idx.begin(), idx.end(),
     [&](int a, int b){ return score[a] > score[b]; });
// counting sort when values are bounded (beats n log n)
vector<int> cnt(1001, 0);
for (int x : v) ++cnt[x];`,

  loops: `for (int x : v)        // copy — fine for int
for (auto& row : grid) // reference — required to mutate
for (const auto& s : words)  // no copy of each string`,

  structs: `struct ListNode {
    int val; ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};
struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
// dummy head: removes every edge case at the front
ListNode dummy(0); dummy.next = head;
ListNode* prev = &dummy;
// ... rewire ...
return dummy.next;`,

  dsu: `vector<int> p(n), sz(n, 1);
iota(p.begin(), p.end(), 0);
function<int(int)> find = [&](int x){
    return p[x] == x ? x : p[x] = find(p[x]);
};
auto unite = [&](int a, int b){
    a = find(a); b = find(b);
    if (a == b) return false;          // cycle
    if (sz[a] < sz[b]) swap(a, b);
    p[b] = a; sz[a] += sz[b];
    return true;
};`,

  trie: `struct Node {
    array<Node*,26> ch{};   // {} -> all nullptr
    bool end = false;
};
Node* root = new Node();
Node* cur = root;
for (char c : w) {
    int i = c - 'a';
    if (!cur->ch[i]) cur->ch[i] = new Node();
    cur = cur->ch[i];
}
cur->end = true;`,

  pairHash: `struct PairHash {
    size_t operator()(const pair<int,int>& p) const {
        return hash<long long>()(
            (long long)p.first << 32 ^ p.second);
    }
};
unordered_set<pair<int,int>, PairHash> seen;`,
}

export const PERF = [
  '`v.reserve(n)` before a big fill — kills repeated reallocation.',
  'Pass by `const&`, never by value, in recursive helpers.',
  '`emplace_back(a, b)` constructs in place; `push_back({a,b})` builds then moves.',
  'Prefer `unordered_map` over `map` unless you need order — the log factor is real.',
  'For heavy console I/O: `ios::sync_with_stdio(false); cin.tie(nullptr);` (rarely needed on LeetCode, standard in contests).',
]

export const ORDERED_VS_UNORDERED = [
  '`unordered_*` is a hash table: O(1) average, O(n) worst on adversarial keys. Say this if asked about guarantees.',
  '`map/set` is a red-black tree: everything O(log n), iteration is sorted, and you get `lower_bound` as a member.',
  'Iteration order of `unordered_*` is unspecified — never rely on it, and never print it in an expected-output problem.',
  'No standard hash for `pair`. Encode as `(long long)a * K + b`, or use `map`, or write a hash functor.',
]
