import {
  LabCost,
  LabHash,
  LabTwoPtr,
  LabWindow,
  LabPrefix,
  LabBS,
  LabMono,
  LabList,
  LabTree,
  LabHeap,
  LabTrie,
  LabGrid,
  LabTopo,
  LabDSU,
  LabBT,
  LabDP1,
  LabDP2,
  LabIntervals,
  LabBits,
} from './labs.jsx'

// Every module: trace -> invariant -> cost -> C++ -> traps -> problems.
// `g` groups it in the rail, `days` ties it back to the 45-day plan,
// `ml` only renders on the MLE track.

export const MODULES = [
  {
    g: 'Foundations',
    n: 'How to price a solution',
    days: 'Day 1 onward, every single day',
    trigger:
      'Before you write anything, and again before you say "I think that\'s optimal".',
    lab: <LabCost />,
    idea: 'Big-O is not trivia, it is a search filter. The interviewer gives you the constraints for a reason: n tells you which complexity class is expected, which tells you which family of techniques is on the table. Reading n backwards to the intended solution is the fastest legitimate shortcut in an interview.',
    invariant:
      'Constant factors are invisible in O(...), but the shape is not. If two solutions are both O(n log n), talk about them; if one is O(n²) at n = 10⁵, it is simply wrong.',
    cost: [
      ['n ≤ 20', 'O(2ⁿ) or O(n!)', 'subsets, permutations, bitmask DP'],
      ['n ≤ 500', 'O(n³)', 'Floyd–Warshall, interval DP'],
      ['n ≤ 5·10³', 'O(n²)', '2-D DP, pairwise scans'],
      ['n ≤ 10⁶', 'O(n log n)', 'sort, heap, binary search on answer'],
      ['n ≤ 10⁸', 'O(n) or O(log n)', 'single pass, two pointers, math'],
    ],
    costHead: ['constraint', 'budget', 'what it implies'],
    code: `// Amortized vs worst case — say the word "amortized" out loud.
vector<int> v;                 // push_back: amortized O(1), worst case O(n) on realloc
v.reserve(n);                  // do this when you know n. Removes the reallocs.
unordered_map<int,int> m;      // O(1) average, O(n) worst case (adversarial hashing)
map<int,int> ordered;          // O(log n) always, and iterates in sorted order
// Space you forget to count:
// - the recursion stack (depth of DFS = O(n) on a skewed tree)
// - the output itself (usually excluded, but say so)`,
    traps: [
      'Calling a solution O(n) when you sorted inside it. Sorting is O(n log n) and it dominates.',
      'Ignoring the cost of string concatenation in a loop: that is O(n²) hiding in plain sight.',
      'Forgetting recursion stack space when asked for O(1) auxiliary space.',
    ],
    probs: [
      'Every problem — state time and space before you code, then again after.',
    ],
    ml: 'Same reflex, different units: an O(n²) attention block at sequence length 8k is the same conversation as an O(n²) loop at n = 10⁵. Interviewers for MLE roles will ask you to cost a training step or an inference path — parameters, FLOPs per token, memory for activations.',
  },
  {
    g: 'Foundations',
    n: 'Hash maps and sets',
    days: 'Days 1–2',
    trigger:
      '"Have I seen this before?" "How many times?" "Find the pair/complement."',
    lab: <LabHash />,
    idea: 'A hash map is a memory of the things you have already walked past. The universal upgrade it enables: any time a brute force asks "does some earlier element satisfy X relative to me?", the inner loop is a lookup, and O(n²) collapses to O(n).',
    invariant:
      'At the moment you process index i, the map contains exactly the elements of [0, i) — nothing from the future. That is what makes the one-pass version return a valid pair rather than pairing an element with itself.',
    cost: [
      ['insert / find / erase', 'O(1) average, O(n) worst', 'O(n)'],
      ['unordered_set dedupe', 'O(n)', 'O(n)'],
      ['map (red-black tree)', 'O(log n)', 'O(n)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `unordered_map<int,int> seen;              // value -> index
for (int i = 0; i < (int)a.size(); ++i) {
    int need = target - a[i];
    auto it = seen.find(need);
    if (it != seen.end()) return {it->second, i};
    seen[a[i]] = i;                          // insert AFTER the lookup
}
// counting idiom
unordered_map<char,int> cnt;
for (char c : s) ++cnt[c];                   // operator[] default-constructs to 0
// pitfall: operator[] INSERTS. Use .count() / .find() to test membership.
if (cnt.count('x')) {}                       // does not insert
if (cnt['x'] > 0) {}                         // silently inserts 'x' -> 0
// hashing a pair needs a custom hash; the cheap trick is to encode:
unordered_set<long long> pts;
pts.insert(1LL * r * 100000 + c);`,
    traps: [
      'Inserting before looking up, so an element matches itself.',
      'Using operator[] to probe a map and quietly growing it — this changes .size() and breaks later logic.',
      'Assuming unordered_map iteration order is stable. It is not.',
      'Reaching for a map when a fixed-size array works: for lowercase letters, int cnt[26]{} is faster and clearer.',
    ],
    probs: [
      '1 Two Sum',
      '217 Contains Duplicate',
      '242 Valid Anagram',
      '49 Group Anagrams',
      '347 Top K Frequent',
      '128 Longest Consecutive Sequence',
    ],
    ml: 'Feature hashing (the hashing trick) is exactly this structure used to map unbounded categorical vocabulary into a fixed-width vector, trading collisions for memory. Embedding lookup tables are hash maps with learned values.',
  },
  {
    g: 'Foundations',
    n: 'Two pointers',
    days: 'Days 3–4',
    trigger:
      'Sorted input, or a palindrome, or "find a pair/triple", or in-place partitioning.',
    lab: <LabTwoPtr />,
    idea: 'Two indices walking a sorted array, where each comparison lets you throw away an entire row of the n² grid of candidate pairs. The reason it is correct is an exclusion argument, and interviewers want to hear it: if a[l] + a[r] is too small, then a[l] paired with anything ≤ a[r] is also too small, so a[l] is dead.',
    invariant:
      'The answer, if it exists, always lies inside [l, r]. Every move preserves that.',
    cost: [
      ['two-sum on sorted', 'O(n)', 'O(1)'],
      ['3Sum (sort + n scans)', 'O(n²)', 'O(1) beyond sort'],
      ['in-place partition / dedupe', 'O(n)', 'O(1)'],
    ],
    costHead: ['pattern', 'time', 'space'],
    code: `// sorted two-sum
int l = 0, r = n - 1;
while (l < r) {
    int s = a[l] + a[r];
    if (s == target) return {l, r};
    s < target ? ++l : --r;
}
// 3Sum: fix one, two-pointer the rest, and skip duplicates in BOTH places
sort(a.begin(), a.end());
for (int i = 0; i + 2 < n; ++i) {
    if (i && a[i] == a[i-1]) continue;              // skip duplicate anchors
    int l = i + 1, r = n - 1;
    while (l < r) {
        int s = a[i] + a[l] + a[r];
        if (s < 0) ++l;
        else if (s > 0) --r;
        else {
            res.push_back({a[i], a[l], a[r]});
            while (l < r && a[l] == a[l+1]) ++l;     // skip duplicate pairs
            while (l < r && a[r] == a[r-1]) --r;
            ++l; --r;
        }
    }
}
// fast/slow write pointer (remove duplicates in place)
int w = 0;
for (int rd = 0; rd < n; ++rd)
    if (!w || a[rd] != a[w-1]) a[w++] = a[rd];`,
    traps: [
      'Duplicate handling in 3Sum — you must skip at the anchor and after a hit.',
      'Using l <= r when the two pointers must not land on the same element.',
      'Sorting when the problem needs original indices. Sort pairs of (value, index) instead.',
    ],
    probs: [
      '125 Valid Palindrome',
      '167 Two Sum II',
      '15 3Sum',
      '11 Container With Most Water',
      '42 Trapping Rain Water',
    ],
    ml: 'The merge step of two sorted candidate lists — merging retrieval results from a dense and a sparse retriever by score — is the same walk.',
  },
  {
    g: 'Foundations',
    n: 'Sliding window',
    days: 'Days 5–6',
    trigger:
      '"Longest / shortest / count of contiguous subarrays or substrings such that ..."',
    lab: <LabWindow />,
    idea: 'A window [l, r] that only ever moves right. Grow with r, and when the window violates the constraint, shrink from l until it is legal again. Both pointers travel at most n steps each, so the whole thing is O(n) even though it looks like a nested loop.',
    invariant:
      'After each iteration the window [l, r] satisfies the constraint, and no larger window ending at r does. Keep a running summary (a count map, a sum, a distinct counter) so re-checking the constraint is O(1) rather than O(window).',
    cost: [
      ['fixed-size window', 'O(n)', 'O(1) or O(k)'],
      ['variable window', 'O(n) amortized', 'O(alphabet)'],
      ['window with a multiset', 'O(n log k)', 'O(k)'],
    ],
    costHead: ['variant', 'time', 'space'],
    code: `// longest substring with all distinct characters
int last[128]; memset(last, -1, sizeof last);
int best = 0, l = 0;
for (int r = 0; r < (int)s.size(); ++r) {
    if (last[s[r]] >= l) l = last[s[r]] + 1;   // jump, never step back
    last[s[r]] = r;
    best = max(best, r - l + 1);
}
// generic shrink form — use when the constraint is a counter
unordered_map<char,int> cnt; int l = 0, bad = 0, best = 0;
for (int r = 0; r < (int)s.size(); ++r) {
    if (++cnt[s[r]] == 2) ++bad;               // window became illegal
    while (bad > 0) if (--cnt[s[l++]] == 1) --bad;
    best = max(best, r - l + 1);
}
// minimum window: same loop, but record the answer INSIDE the shrink phase`,
    traps: [
      'Moving l backwards. If you ever assign l a smaller value, the O(n) argument dies.',
      'Recomputing the constraint over the whole window each step — that silently makes it O(n²).',
      'For "longest", record the answer after shrinking; for "shortest", record it while shrinking.',
      'Off-by-one in the length: it is r − l + 1 on a closed window.',
    ],
    probs: [
      '3 Longest Substring Without Repeating',
      '424 Longest Repeating Character Replacement',
      '76 Minimum Window Substring',
      '567 Permutation in String',
      '239 Sliding Window Maximum',
    ],
    ml: 'Streaming metric computation over the last k batches, and context-window truncation policies in LLM serving, are the same bookkeeping: maintain an aggregate incrementally instead of recomputing it.',
  },
  {
    g: 'Foundations',
    n: 'Prefix sums and difference arrays',
    days: 'Days 5–6',
    trigger:
      'Repeated range queries, "subarray sums equal to k", or many range updates then one read.',
    lab: <LabPrefix />,
    idea: 'Precompute cumulative totals once so any range answer is a subtraction. The second, less obvious use: combine prefix sums with a hash map to count subarrays with a target sum in one pass, because sum(i..j) = k is the same statement as p[j+1] − p[i] = k.',
    invariant:
      'p[i] = sum of the first i elements, and p[0] = 0. Keeping the extra leading zero is what removes every special case.',
    cost: [
      ['build', 'O(n)', 'O(n)'],
      ['range query', 'O(1)', '—'],
      ['count subarrays = k', 'O(n)', 'O(n)'],
      ['difference array: range add', 'O(1) per update', 'O(n)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `vector<long long> p(n + 1, 0);
for (int i = 0; i < n; ++i) p[i+1] = p[i] + a[i];
long long sum_lr = p[r+1] - p[l];            // inclusive [l, r]
// subarray sum == k, in one pass
unordered_map<long long,int> freq{{0, 1}};   // the empty prefix counts once
long long run = 0; int ans = 0;
for (int x : a) {
    run += x;
    ans += freq[run - k];                    // how many earlier prefixes complete a k-sum
    ++freq[run];
}
// difference array: add v to [l, r] in O(1), then one sweep to materialize
vector<long long> d(n + 1, 0);
d[l] += v; d[r+1] -= v;
for (int i = 1; i < n; ++i) d[i] += d[i-1];`,
    traps: [
      'Overflow. Sums of 10⁵ values up to 10⁹ do not fit in int — use long long.',
      'Forgetting the {0, 1} seed in the hash-map variant, which loses every subarray starting at index 0.',
      'Applying prefix sums to a problem with negative numbers and then also trying to slide a window. Sliding windows need monotonicity; prefix + map does not.',
    ],
    probs: [
      '303 Range Sum Query',
      '560 Subarray Sum Equals K',
      '238 Product of Array Except Self',
      '525 Contiguous Array',
      '304 Range Sum 2D',
    ],
    ml: 'Cumulative distribution tables for weighted sampling, and integral images in vision, are prefix sums in one and two dimensions.',
  },
  {
    g: 'Foundations',
    n: 'Binary search',
    days: 'Days 7–9',
    trigger:
      'Sorted data — or any monotone predicate, even when there is no array at all.',
    lab: <LabBS />,
    idea: 'Stop thinking "find the element" and start thinking "find the boundary". Map the search space to a boolean predicate that is false, false, ..., false, true, ..., true, and binary search finds the first true. That reframing is what unlocks binary search on the answer: guess a capacity, ask "is it feasible?", and shrink.',
    invariant:
      'The answer always lies in the half-open range [lo, hi). The loop while (lo < hi) with hi = mid (never mid − 1) and lo = mid + 1 terminates because the range strictly shrinks every iteration.',
    cost: [
      ['search sorted array', 'O(log n)', 'O(1)'],
      ['binary search on answer', 'O(log(range) × check)', 'O(1)'],
      ['search a rotated array', 'O(log n)', 'O(1)'],
      ['2-D sorted matrix', 'O(log(nm))', 'O(1)'],
    ],
    costHead: ['use', 'time', 'space'],
    code: `// the only template you need — first index where pred is true
int lo = 0, hi = n;                    // half-open [lo, hi)
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;      // never (lo+hi)/2 — that overflows
    if (pred(mid)) hi = mid;           // mid might be the answer
    else lo = mid + 1;                 // mid is definitely not
}
// lo == hi == first true (or n if none)
// STL does this for you and interviewers accept it
auto it = lower_bound(a.begin(), a.end(), x);   // first >= x
auto jt = upper_bound(a.begin(), a.end(), x);   // first  > x
int count_of_x = jt - it;
// binary search on the answer: Koko eating bananas
auto feasible = [&](long long speed) {
    long long h = 0;
    for (int p : piles) h += (p + speed - 1) / speed;   // ceil division
    return h <= H;
};
long long lo = 1, hi = *max_element(piles.begin(), piles.end());
while (lo < hi) { long long m = lo + (hi - lo) / 2; feasible(m) ? hi = m : lo = m + 1; }`,
    traps: [
      'Mixing templates. Pick the half-open one and use it everywhere; hybrid lo <= hi with hi = mid is an infinite loop.',
      '(lo + hi) / 2 overflowing on large int bounds.',
      'In rotated arrays, deciding which half is sorted by comparing a[mid] to a[lo] — and getting the equality case wrong.',
      'Binary searching on a predicate that is not actually monotone. Say out loud why it is monotone before you code.',
    ],
    probs: [
      '704 Binary Search',
      '33 Search in Rotated Sorted Array',
      '153 Find Minimum in Rotated',
      '875 Koko Eating Bananas',
      '4 Median of Two Sorted Arrays',
    ],
    ml: 'Threshold selection on a precision/recall curve is a monotone predicate search. So is finding the largest batch size that fits in memory — feasibility is monotone, so you binary search it instead of guessing.',
  },
  {
    g: 'Foundations',
    n: 'Stacks and monotonic stacks',
    days: 'Days 10–11',
    trigger:
      'Matching / nesting (parentheses, expressions), or "next greater", "previous smaller", "largest rectangle".',
    lab: <LabMono />,
    idea: 'A plain stack handles nesting because the most recent unmatched thing is always the one you resolve first. A monotonic stack is the specialization: keep indices in sorted order and pop them the moment the current element proves they can never be an answer again. Each index is pushed once and popped once, so the nested while loop is still O(n).',
    invariant:
      'For "next greater element", the stack holds indices whose answer is still unknown, and their values are non-increasing from bottom to top. Any element that would violate that ordering is exactly the answer for the elements it displaces.',
    cost: [
      ['push / pop / top', 'O(1)', '—'],
      ['next greater for all n', 'O(n) amortized', 'O(n)'],
      ['largest rectangle in histogram', 'O(n)', 'O(n)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `// next warmer day / next greater element
vector<int> res(n, 0);
stack<int> st;                                  // holds INDICES, not values
for (int i = 0; i < n; ++i) {
    while (!st.empty() && a[i] > a[st.top()]) {
        res[st.top()] = i - st.top();
        st.pop();
    }
    st.push(i);
}
// whatever is left on the stack has no answer
// valid parentheses
unordered_map<char,char> pair_of{{')','('},{']','['},{'}','{'}};
stack<char> s;
for (char c : t) {
    if (pair_of.count(c)) {
        if (s.empty() || s.top() != pair_of[c]) return false;
        s.pop();
    } else s.push(c);
}
return s.empty();                               // do not forget this line`,
    traps: [
      'Storing values instead of indices, then being unable to compute a distance or width.',
      'Forgetting the leftovers on the stack at the end.',
      'Strict vs non-strict comparison (> vs >=) — it decides how ties are handled, and in histogram problems it decides correctness.',
      'Returning true for "(((" because you never checked the stack was empty.',
    ],
    probs: [
      '20 Valid Parentheses',
      '155 Min Stack',
      '739 Daily Temperatures',
      '84 Largest Rectangle in Histogram',
      '853 Car Fleet',
    ],
    ml: 'The autodiff tape is a stack: forward operations push, the backward pass pops in reverse order. Saying that out loud in an MLE interview lands well.',
  },
  {
    g: 'Linked & hierarchical',
    n: 'Linked lists',
    days: 'Days 12–14',
    trigger:
      'Nodes and pointers, in-place reordering, cycle detection, O(1) space required.',
    lab: <LabList />,
    idea: 'Three techniques carry almost every linked list question: the three-pointer reversal, the fast/slow pointer pair, and a dummy head node that removes every special case about the front of the list. There is very little cleverness here and a lot of pointer discipline.',
    invariant:
      'In the reversal loop, the list is always split into two valid lists: everything from prev backwards is reversed, everything from cur forwards is untouched. Nothing is ever dangling except during the single line where you save nxt.',
    cost: [
      ['reverse', 'O(n)', 'O(1)'],
      ['cycle detect (Floyd)', 'O(n)', 'O(1)'],
      ['find middle', 'O(n)', 'O(1)'],
      ['merge k lists with a heap', 'O(N log k)', 'O(k)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `struct ListNode { int val; ListNode* next; ListNode(int v): val(v), next(nullptr) {} };
// reversal
ListNode* prev = nullptr, *cur = head;
while (cur) { ListNode* nxt = cur->next; cur->next = prev; prev = cur; cur = nxt; }
return prev;
// dummy head kills the "what if we delete the first node" case
ListNode dummy(0); dummy.next = head;
ListNode* p = &dummy;
while (p->next) { if (p->next->val == target) p->next = p->next->next; else p = p->next; }
return dummy.next;
// Floyd: cycle detection, and the middle node
ListNode *slow = head, *fast = head;
while (fast && fast->next) {
    slow = slow->next; fast = fast->next->next;
    if (slow == fast) break;                 // cycle
}
// slow is the middle when the loop ends without a meeting`,
    traps: [
      'Dereferencing fast->next->next without checking fast->next.',
      'Overwriting cur->next before saving it.',
      'Returning head instead of prev after a reversal — head is now the tail.',
      'Not drawing the pointers. Draw four boxes on the whiteboard; it is faster than debugging in your head.',
    ],
    probs: [
      '206 Reverse Linked List',
      '141 Linked List Cycle',
      '21 Merge Two Sorted Lists',
      '19 Remove Nth Node From End',
      '143 Reorder List',
      '23 Merge k Sorted Lists',
    ],
    ml: 'Rarely asked directly in MLE loops, but the dummy-head and two-pointer habits show up in stream/batch buffer code.',
  },
  {
    g: 'Linked & hierarchical',
    n: 'Trees, traversals, and BSTs',
    days: 'Days 15–19',
    trigger:
      'Anything with a root, parent/child structure, or the words "depth", "path", "subtree", "ancestor".',
    lab: <LabTree />,
    idea: "Every tree question is a choice of traversal plus a decision about what each node returns to its parent. Pre-order is for building and copying, in-order is the BST's sorted view, post-order is for anything where a node's answer depends on its children, and BFS is for level and shortest-depth questions. The BST adds one extra fact: the whole left subtree is smaller, so a search is a binary search over structure.",
    invariant:
      'For BST validation, the invariant is a range, not a comparison with the parent: every node must lie strictly inside (low, high), and the recursion narrows that range as it descends. Checking only node vs. child passes on invalid trees.',
    cost: [
      ['DFS / BFS traversal', 'O(n)', 'O(h) stack / O(w) queue'],
      ['BST search, insert (balanced)', 'O(log n)', 'O(1) iterative'],
      ['BST search (degenerate)', 'O(n)', '—'],
      ['lowest common ancestor', 'O(n) general, O(h) on BST', 'O(h)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `struct TreeNode { int val; TreeNode *left, *right; };
// post-order: children first, then me. Height and "diameter" both live here.
int height(TreeNode* r, int& best) {
    if (!r) return 0;
    int L = height(r->left, best), R = height(r->right, best);
    best = max(best, L + R);                 // path through r
    return 1 + max(L, R);
}
// BFS by levels — snapshot the size at the top of each round
queue<TreeNode*> q; if (root) q.push(root);
while (!q.empty()) {
    int sz = q.size();
    vector<int> level;
    while (sz--) {
        TreeNode* t = q.front(); q.pop();
        level.push_back(t->val);
        if (t->left) q.push(t->left);
        if (t->right) q.push(t->right);
    }
    out.push_back(level);
}
// BST validity: pass the allowed range down
bool ok(TreeNode* r, long lo, long hi) {
    if (!r) return true;
    if (r->val <= lo || r->val >= hi) return false;
    return ok(r->left, lo, r->val) && ok(r->right, r->val, hi);
}`,
    traps: [
      'Validating a BST by comparing each node only to its immediate parent.',
      'Using INT_MIN / INT_MAX as range sentinels when node values can be INT_MIN. Use long.',
      'Claiming O(log n) on a BST without saying "assuming it is balanced".',
      'Forgetting that recursion depth is O(n) on a skewed tree, which matters if they asked about space.',
    ],
    probs: [
      '104 Maximum Depth',
      '226 Invert Binary Tree',
      '102 Level Order',
      '98 Validate BST',
      '230 Kth Smallest in BST',
      '236 LCA',
      '297 Serialize and Deserialize',
    ],
    ml: 'Decision trees are this structure with a learned split at each node; gradient-boosted ensembles are hundreds of them. Being able to describe inference as a root-to-leaf walk with O(depth) cost is a common MLE follow-up.',
  },
  {
    g: 'Linked & hierarchical',
    n: 'Heaps and priority queues',
    days: 'Days 20–21',
    trigger:
      '"Top k", "k-th largest", "merge k sorted", "median of a stream", or a scheduler.',
    lab: <LabHeap />,
    idea: 'A heap gives you the extreme element in O(1) and maintains that promise in O(log n) per change — strictly less than the full ordering a sort would give you, which is exactly why it is cheaper. The counter-intuitive move for top-k: use a MIN-heap of size k, and evict the smallest whenever it overflows.',
    invariant:
      'Every parent is ≤ both children (min-heap). The array is complete, so height is ⌊log₂ n⌋ and index arithmetic replaces pointers: children of i are 2i+1 and 2i+2.',
    cost: [
      ['push / pop', 'O(log n)', 'O(n)'],
      ['top', 'O(1)', '—'],
      ['build heap from n items', 'O(n)', 'O(1) in place'],
      ['top-k of n', 'O(n log k)', 'O(k)'],
      ['merge k sorted lists', 'O(N log k)', 'O(k)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `priority_queue<int> maxh;                              // default is a MAX-heap
priority_queue<int, vector<int>, greater<int>> minh;   // min-heap: remember greater<>
// top-k largest with a size-k MIN-heap: O(n log k), O(k) space
for (int x : a) { minh.push(x); if ((int)minh.size() > k) minh.pop(); }
// minh.top() is the k-th largest
// custom comparator: "returns true if a should come out AFTER b"
auto cmp = [](const pair<int,int>& x, const pair<int,int>& y) { return x.second > y.second; };
priority_queue<pair<int,int>, vector<pair<int,int>>, decltype(cmp)> pq(cmp);
// Dijkstra is a heap plus a distance array
priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
vector<long long> dist(n, LLONG_MAX);
dist[src] = 0; pq.push({0, src});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;                          // stale entry — skip it
    for (auto [v, w] : adj[u])
        if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
}`,
    traps: [
      'The comparator direction. C++ priority_queue takes a "less" comparator and puts the LARGEST on top — the sign feels backwards the first three times.',
      'Using a max-heap of size n for top-k when a min-heap of size k is asked for.',
      'Forgetting the stale-entry check in Dijkstra, since std::priority_queue has no decrease-key.',
      'Assuming heap iteration is sorted. Only the top is meaningful.',
    ],
    probs: [
      '703 Kth Largest in a Stream',
      '215 Kth Largest Element',
      '347 Top K Frequent',
      '23 Merge k Sorted Lists',
      '295 Find Median from Data Stream',
      '621 Task Scheduler',
    ],
    ml: 'Top-k retrieval over embedding similarity scores, beam search over decoding candidates, and priority replay buffers in RL are all size-k heaps over a stream.',
  },
  {
    g: 'Linked & hierarchical',
    n: 'Tries',
    days: 'Day 21',
    trigger:
      'Many strings sharing prefixes: autocomplete, dictionary lookup, word search on a board.',
    lab: <LabTrie />,
    idea: 'A tree where the path spells the key. Its cost is independent of how many words are stored — insert and lookup are O(length) — which is what a hash map cannot give you for prefix queries. Use it whenever the question is "all words starting with..." rather than "is this exact word present".',
    invariant:
      'Every node represents exactly one prefix, and a boolean flag distinguishes a stored word from a mere waypoint. Shared prefixes are shared nodes; that is both the memory saving and the speed.',
    cost: [
      ['insert word', 'O(L)', 'O(L × Σ) worst'],
      ['search / startsWith', 'O(L)', '—'],
      ['all words with prefix', 'O(L + output)', '—'],
      ['Word Search II (board + trie)', 'O(cells × 4^L)', 'O(total letters)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `struct Trie {
    struct Node { Node* kid[26]{}; bool end = false; };
    Node* root = new Node();
    void insert(const string& w) {
        Node* cur = root;
        for (char c : w) {
            int i = c - 'a';
            if (!cur->kid[i]) cur->kid[i] = new Node();
            cur = cur->kid[i];
        }
        cur->end = true;
    }
    Node* walk(const string& w) {
        Node* cur = root;
        for (char c : w) { cur = cur->kid[c - 'a']; if (!cur) return nullptr; }
        return cur;
    }
    bool search(const string& w)      { Node* n = walk(w); return n && n->end; }
    bool startsWith(const string& p)  { return walk(p) != nullptr; }
};
// array-of-26 is faster than unordered_map per node; say why if asked
// (fixed alphabet, no hashing, contiguous memory)`,
    traps: [
      'Missing the end-of-word flag, so "do" reports as absent inside "dog".',
      'Using a trie when a hash set is enough — if there are no prefix queries, the trie is just slower to write.',
      'Word Search II without pruning dead trie branches, which is the whole reason a trie is used there.',
    ],
    probs: [
      '208 Implement Trie',
      '211 Design Add and Search Words',
      '212 Word Search II',
      '648 Replace Words',
    ],
    ml: 'Byte-pair encoding tokenizers do longest-prefix matching over a learned vocabulary — a trie is the natural structure, and describing tokenization that way is a strong MLE answer.',
  },
  {
    g: 'Graphs',
    n: 'Graph traversal: BFS and DFS',
    days: 'Days 22–26',
    trigger:
      'Grids, islands, connected regions, "shortest number of steps", "can I reach".',
    lab: <LabGrid />,
    idea: 'Both visit every node once; the only difference is the order the frontier is drained. BFS uses a queue and expands in concentric layers, so the first time it touches a node it has found the fewest-edges path. DFS uses a stack or the call stack and dives, which suits connectivity, cycle detection, and anything that wants to build an answer on the way back up.',
    invariant:
      'Mark a node visited when you PUSH it, never when you pop it. Marking on pop lets the same node enter the queue many times and turns O(V+E) into something much worse.',
    cost: [
      ['BFS / DFS', 'O(V + E)', 'O(V)'],
      ['grid of r×c', 'O(rc)', 'O(rc)'],
      ['Dijkstra (heap)', 'O((V+E) log V)', 'O(V)'],
      ['Bellman–Ford (negative edges)', 'O(VE)', 'O(V)'],
    ],
    costHead: ['algorithm', 'time', 'space'],
    code: `const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};
// BFS on a grid — shortest steps
queue<pair<int,int>> q;
vector<vector<int>> dist(R, vector<int>(Cc, -1));
q.push({sr, sc}); dist[sr][sc] = 0;
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int k = 0; k < 4; ++k) {
        int nr = r + dr[k], nc = c + dc[k];
        if (nr < 0 || nc < 0 || nr >= R || nc >= Cc) continue;
        if (grid[nr][nc] == '1' || dist[nr][nc] != -1) continue;
        dist[nr][nc] = dist[r][c] + 1;
        q.push({nr, nc});                       // mark at push time
    }
}
// DFS flood fill — count islands by sinking them
void sink(vector<vector<char>>& g, int r, int c) {
    if (r < 0 || c < 0 || r >= (int)g.size() || c >= (int)g[0].size() || g[r][c] != '1') return;
    g[r][c] = '0';
    for (int k = 0; k < 4; ++k) sink(g, r + dr[k], c + dc[k]);
}
// cycle detection in a DIRECTED graph needs three colours, not a visited set
// 0 = unvisited, 1 = on the current stack, 2 = finished; seeing a 1 means a cycle`,
    traps: [
      'Marking visited on pop instead of push.',
      'Using DFS for a shortest-path question on an unweighted graph.',
      'Using BFS on a weighted graph and calling it shortest — that needs Dijkstra.',
      'Recursive DFS on a 10⁶-cell grid and blowing the stack. Say "I would convert this to an explicit stack".',
      'Forgetting the diagonal cases when the problem says 8-connectivity.',
    ],
    probs: [
      '200 Number of Islands',
      '133 Clone Graph',
      '994 Rotting Oranges',
      '417 Pacific Atlantic Water Flow',
      '127 Word Ladder',
      '743 Network Delay Time',
    ],
    ml: 'Message passing in a graph neural network is BFS by layers: each layer aggregates one more hop of neighbourhood. Data-pipeline DAG execution is the same traversal.',
  },
  {
    g: 'Graphs',
    n: 'Topological sort',
    days: 'Days 23–24',
    trigger:
      'Prerequisites, build order, task scheduling, "is this possible without a cycle".',
    lab: <LabTopo />,
    idea: "Order a directed acyclic graph so every edge points forward. Kahn's algorithm does it with indegrees and a queue and gives cycle detection for free: if you cannot output every node, the remainder is tangled in a cycle. That is the actual answer to Course Schedule.",
    invariant:
      'The queue holds exactly the nodes with no remaining unmet prerequisites. Every node enters the queue at most once, and each edge is relaxed exactly once, so it is O(V + E).',
    cost: [
      ['Kahn (BFS style)', 'O(V + E)', 'O(V)'],
      ['DFS post-order + reverse', 'O(V + E)', 'O(V)'],
      ['cycle detection', 'free with either', '—'],
    ],
    costHead: ['method', 'time', 'space'],
    code: `vector<vector<int>> adj(n);
vector<int> indeg(n, 0);
for (auto& e : edges) { adj[e[1]].push_back(e[0]); ++indeg[e[0]]; }  // watch the direction
queue<int> q;
for (int i = 0; i < n; ++i) if (!indeg[i]) q.push(i);
vector<int> order;
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
}
if ((int)order.size() != n) return {};        // a cycle exists
return order;`,
    traps: [
      'Reversing the edge direction. [a, b] meaning "b before a" is the usual LeetCode convention — restate it out loud before coding.',
      'Forgetting the final size check, which is the entire cycle-detection step.',
      'Using a visited set instead of indegrees and then getting duplicates in the output.',
      'Assuming the order is unique. It usually is not; if they want lexicographically smallest, swap the queue for a priority queue.',
    ],
    probs: [
      '207 Course Schedule',
      '210 Course Schedule II',
      '269 Alien Dictionary',
      '310 Minimum Height Trees',
    ],
    ml: 'Every training pipeline and every computation graph is a DAG that gets topologically ordered before execution; autodiff walks the reverse topological order.',
  },
  {
    g: 'Graphs',
    n: 'Union-Find (disjoint set union)',
    days: 'Days 25–26',
    trigger:
      '"Are these connected?" asked repeatedly, dynamic merging, counting components, cycle detection in an undirected graph, Kruskal\'s MST.',
    lab: <LabDSU />,
    idea: 'A forest where each set is a tree and the root is the set\'s identity. Two optimizations make it effectively constant time: path compression flattens the tree during every find, and union by rank or size stops tall trees forming. Reach for it when edges arrive over time — that is where BFS/DFS would force a full re-traversal.',
    invariant:
      'find(x) returns the same root for every member of a set and only changes when sets merge. It answers connectivity, but unlike BFS it cannot give you the path.',
    cost: [
      ['find / union (both optimizations)', 'O(α(n)) ≈ O(1)', 'O(n)'],
      ['no optimizations', 'O(n) worst', 'O(n)'],
      ["Kruskal's MST", 'O(E log E)', 'O(V)'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `struct DSU {
    vector<int> p, r;
    int comps;
    DSU(int n) : p(n), r(n, 0), comps(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }   // path compression
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;                                   // already together
        if (r[a] < r[b]) swap(a, b);
        p[b] = a;
        if (r[a] == r[b]) ++r[a];
        --comps;
        return true;
    }
};
// counting islands / provinces: build the DSU, unite neighbours, read dsu.comps`,
    traps: [
      'Comparing p[a] == p[b] instead of find(a) == find(b).',
      'Skipping path compression and then claiming near-constant time.',
      'Forgetting that unite returning false is the cycle signal — that is how Redundant Connection works.',
      'Using DSU when the question asks for a path or a distance. It only answers membership.',
    ],
    probs: [
      '547 Number of Provinces',
      '684 Redundant Connection',
      '323 Connected Components',
      '721 Accounts Merge',
      '1584 Min Cost to Connect All Points',
    ],
    ml: 'Connected-component labelling for near-duplicate detection: hash or embed documents, unite the pairs above a similarity threshold, and each component is a dedupe cluster.',
  },
  {
    g: 'Recursion & optimization',
    n: 'Recursion and backtracking',
    days: 'Days 27–29',
    trigger:
      '"All combinations / permutations / subsets", constraint puzzles, "generate every valid ...".',
    lab: <LabBT />,
    idea: 'Backtracking is depth-first search over a tree of decisions, with an explicit undo after each branch. The runtime is the size of that tree, so it is exponential by nature — your leverage is pruning: cut a branch the moment it cannot lead to a valid answer, and say why the cut is safe.',
    invariant:
      'On entry and exit of every recursive call, the mutable state (path, board, counters) is identical. Every push has a matching pop on the way out; that symmetry is the whole discipline.',
    cost: [
      ['subsets', 'O(n · 2ⁿ)', 'O(n) stack'],
      ['permutations', 'O(n · n!)', 'O(n)'],
      ['combination sum', 'O(n^(t/min))', 'O(t)'],
      ['N-Queens', 'O(n!) with pruning', 'O(n)'],
      ['word search on a board', 'O(rc · 4^L)', 'O(L)'],
    ],
    costHead: ['problem', 'time', 'space'],
    code: `// subsets — take / skip
void rec(int i, vector<int>& a, vector<int>& path, vector<vector<int>>& out) {
    if (i == (int)a.size()) { out.push_back(path); return; }
    path.push_back(a[i]);
    rec(i + 1, a, path, out);
    path.pop_back();                 // undo — the line people forget
    rec(i + 1, a, path, out);
}
// combinations with duplicates in the input: sort, then skip equal siblings
sort(a.begin(), a.end());
for (int i = start; i < n; ++i) {
    if (i > start && a[i] == a[i-1]) continue;      // not i > 0
    path.push_back(a[i]);
    rec(i + 1, ...);                                 // i, not i+1, if reuse is allowed
    path.pop_back();
}
// permutations with an in-place swap — O(1) extra beyond the output
void perm(int i, vector<int>& a, vector<vector<int>>& out) {
    if (i == (int)a.size()) { out.push_back(a); return; }
    for (int j = i; j < (int)a.size(); ++j) {
        swap(a[i], a[j]);
        perm(i + 1, a, out);
        swap(a[i], a[j]);            // swap back
    }
}`,
    traps: [
      'Missing the undo, so state leaks into sibling branches.',
      'The duplicate-skip condition: i > start, not i > 0.',
      'Passing the path by value everywhere — correct but quietly O(n) per node; pass by reference and copy only at a leaf.',
      'No pruning at all on a problem that clearly permits it. Interviewers score the prune.',
    ],
    probs: [
      '78 Subsets',
      '46 Permutations',
      '39 Combination Sum',
      '79 Word Search',
      '51 N-Queens',
      '131 Palindrome Partitioning',
    ],
    ml: 'Beam search is backtracking with a width cap; hyperparameter search over a discrete grid is the same tree with pruning by early stopping.',
  },
  {
    g: 'Recursion & optimization',
    n: 'Dynamic programming, one dimension',
    days: 'Days 30–34',
    trigger:
      '"Minimum / maximum / count of ways", overlapping subproblems, a choice at each step.',
    lab: <LabDP1 />,
    idea: 'DP is recursion where you stop re-solving the same subproblem. Get there in three moves: write the brute-force recursion, notice identical arguments recurring, then add a memo — or flip it into a bottom-up table. In an interview, narrate exactly that path; jumping straight to a table looks memorized and collapses the moment they perturb the problem.',
    invariant:
      'You need a state definition you can say in one sentence ("dp[i] = the best answer using the first i items") and a transition that only reads states already computed. If you cannot state it in words, the code will not be right.',
    cost: [
      ['climbing stairs / Fibonacci', 'O(n)', 'O(1) rolling'],
      ['house robber', 'O(n)', 'O(1)'],
      ['coin change', 'O(n · coins)', 'O(n)'],
      ['longest increasing subsequence', 'O(n²) or O(n log n)', 'O(n)'],
      ['word break', 'O(n² · L)', 'O(n)'],
    ],
    costHead: ['problem', 'time', 'space'],
    code: `// coin change — fewest coins to make amount
vector<int> dp(amount + 1, INT_MAX);
dp[0] = 0;
for (int x = 1; x <= amount; ++x)
    for (int c : coins)
        if (c <= x && dp[x - c] != INT_MAX)
            dp[x] = min(dp[x], dp[x - c] + 1);
return dp[amount] == INT_MAX ? -1 : dp[amount];
// house robber — rolling variables, O(1) space
int take = 0, skip = 0;
for (int x : nums) { int t = skip + x; skip = max(skip, take); take = t; }
return max(take, skip);
// LIS in O(n log n): tails[k] = smallest tail of an increasing subsequence of length k+1
vector<int> tails;
for (int x : nums) {
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) tails.push_back(x); else *it = x;
}
return tails.size();       // note: tails is NOT the actual subsequence
// top-down memo, when the bottom-up order is hard to see
unordered_map<int,int> memo;
function<int(int)> f = [&](int i) -> int {
    if (i >= n) return 0;
    if (memo.count(i)) return memo[i];
    return memo[i] = max(f(i + 1), nums[i] + f(i + 2));
};`,
    traps: [
      'dp[x - c] + 1 overflowing when dp[x - c] is INT_MAX. Guard it or use a large sentinel like 1e9.',
      'Wrong iteration order — for "each coin once" (0/1 knapsack) the inner loop must run downward.',
      'Defining the state so it needs information the index does not carry. If the transition needs extra context, the state is incomplete.',
      'Assuming greedy works. Coins {1,3,4} and amount 6 is the counterexample to keep in your pocket.',
    ],
    probs: [
      '70 Climbing Stairs',
      '198 House Robber',
      '322 Coin Change',
      '300 Longest Increasing Subsequence',
      '139 Word Break',
      '152 Maximum Product Subarray',
    ],
    ml: 'Viterbi decoding is a DP over sequence positions; so is the dynamic-programming step inside CTC loss. The framing — optimal substructure over time steps — is identical.',
  },
  {
    g: 'Recursion & optimization',
    n: 'Dynamic programming, two dimensions',
    days: 'Days 33–36',
    trigger: 'Two sequences, or a grid, or a (index, remaining capacity) pair.',
    lab: <LabDP2 />,
    idea: 'The state is a pair, so the table is a grid and the transition reads a small neighbourhood — usually the cell up, the cell left, and the diagonal. Once you can draw the grid and mark which three cells a given cell depends on, the code writes itself, and the space optimization (keep one row) becomes obvious.',
    invariant:
      'Cell (i, j) is the answer for the first i of one input and the first j of the other. Row 0 and column 0 are the empty-input base cases, and getting them right is most of the battle.',
    cost: [
      ['LCS / edit distance', 'O(n·m)', 'O(n·m), or O(m) rolling'],
      ['0/1 knapsack', 'O(n·W)', 'O(W)'],
      ['unique paths on a grid', 'O(n·m)', 'O(m)'],
      ['palindromic substrings (interval DP)', 'O(n²)', 'O(n²)'],
    ],
    costHead: ['problem', 'time', 'space'],
    code: `// longest common subsequence
vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
for (int i = 1; i <= n; ++i)
    for (int j = 1; j <= m; ++j)
        dp[i][j] = (s1[i-1] == s2[j-1]) ? dp[i-1][j-1] + 1
                                        : max(dp[i-1][j], dp[i][j-1]);
return dp[n][m];
// edit distance — three edits, three neighbours
dp[i][j] = (s1[i-1] == s2[j-1])
    ? dp[i-1][j-1]
    : 1 + min({ dp[i-1][j-1],   // replace
                dp[i-1][j],     // delete
                dp[i][j-1] });  // insert
// rolling rows: O(m) space when you only ever read the previous row
vector<int> prev(m + 1, 0), cur(m + 1, 0);
for (int i = 1; i <= n; ++i) { /* fill cur from prev */ swap(prev, cur); }
// interval DP (palindromes): iterate by LENGTH so shorter spans are ready first
for (int len = 2; len <= n; ++len)
    for (int i = 0; i + len - 1 < n; ++i) {
        int j = i + len - 1;
        dp[i][j] = (s[i] == s[j]) && (len == 2 || dp[i+1][j-1]);
    }`,
    traps: [
      'Base row/column left uninitialized, or initialized to 0 when edit distance needs 0..m.',
      'Off-by-one between the string index (i−1) and the table index (i). Keep the +1 padding and be consistent.',
      'Iterating an interval DP by i and j instead of by length, so it reads cells that are not filled yet.',
      'Rolling to one row and then reading a value you already overwrote this iteration.',
    ],
    probs: [
      '1143 Longest Common Subsequence',
      '72 Edit Distance',
      '62 Unique Paths',
      '64 Minimum Path Sum',
      '5 Longest Palindromic Substring',
      '416 Partition Equal Subset Sum',
    ],
    ml: 'Dynamic time warping over two time series is edit distance with a distance function instead of equality — a common signal-processing question in MLE loops.',
  },
  {
    g: 'Recursion & optimization',
    n: 'Greedy and intervals',
    days: 'Days 35–37',
    trigger:
      'Scheduling, meeting rooms, merging ranges, "minimum number of ...", jump games.',
    lab: <LabIntervals />,
    idea: 'Greedy means committing to a locally best choice and never revisiting it. That is only valid when you can argue an exchange: any optimal solution can be rewritten to start with your choice without getting worse. Interval problems are the friendliest greedy family, and they almost always begin with a sort — by start for merging, by end for "how many can I fit".',
    invariant:
      'After sorting by start, an incoming interval can only overlap the most recent block in the output — so one comparison per interval suffices, and the sweep is O(n) after the O(n log n) sort.',
    cost: [
      ['merge intervals', 'O(n log n)', 'O(n)'],
      ['max non-overlapping (sort by end)', 'O(n log n)', 'O(1)'],
      ['meeting rooms II (heap or sweep)', 'O(n log n)', 'O(n)'],
      ['jump game', 'O(n)', 'O(1)'],
    ],
    costHead: ['problem', 'time', 'space'],
    code: `sort(iv.begin(), iv.end());                   // by start
vector<vector<int>> out;
for (auto& in : iv) {
    if (!out.empty() && in[0] <= out.back()[1]) out.back()[1] = max(out.back()[1], in[1]);
    else out.push_back(in);
}
// max non-overlapping intervals: sort by END, not start
sort(iv.begin(), iv.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
int end = INT_MIN, kept = 0;
for (auto& in : iv) if (in[0] >= end) { ++kept; end = in[1]; }
// meeting rooms II — min heap of end times = rooms currently in use
priority_queue<int, vector<int>, greater<int>> ends;
for (auto& in : iv) {
    if (!ends.empty() && ends.top() <= in[0]) ends.pop();
    ends.push(in[1]);
}
return ends.size();
// jump game: track the furthest reachable index
int reach = 0;
for (int i = 0; i < n; ++i) { if (i > reach) return false; reach = max(reach, i + a[i]); }`,
    traps: [
      'Sorting by the wrong key. Merging wants start; "fit the most" wants end. Getting this backwards produces a plausible wrong answer.',
      'Touching vs overlapping: does [1,2] overlap [2,3]? Ask. It changes < to <=.',
      'Asserting a greedy is optimal without an exchange argument. If you cannot make one, do the DP.',
      'Modifying out.back() through a copy instead of a reference.',
    ],
    probs: [
      '56 Merge Intervals',
      '57 Insert Interval',
      '435 Non-overlapping Intervals',
      '253 Meeting Rooms II',
      '55 Jump Game',
      '134 Gas Station',
    ],
    ml: 'Non-maximum suppression in object detection is interval/box merging by score. Scheduling GPU jobs by earliest deadline is the classic greedy.',
  },
  {
    g: 'Recursion & optimization',
    n: 'Bit manipulation',
    days: 'Day 38',
    trigger:
      '"Without extra space", XOR puzzles, subsets of n ≤ 20, sets of small integers.',
    lab: <LabBits />,
    idea: 'Two facts do most of the work. XOR cancels: x ^ x = 0 and x ^ 0 = x, so XOR-ing an array where everything pairs up leaves the loner. And an integer is a subset: bit i means "element i is in", which is what makes bitmask DP over n ≤ 20 possible.',
    invariant:
      'n & (n − 1) always clears exactly the lowest set bit, so looping it runs once per set bit, not once per bit position.',
    cost: [
      ['single number via XOR', 'O(n)', 'O(1)'],
      ['popcount', 'O(set bits)', 'O(1)'],
      ['counting bits 0..n', 'O(n)', 'O(n)'],
      ['bitmask DP over subsets', 'O(2ⁿ · n)', 'O(2ⁿ)'],
    ],
    costHead: ['use', 'time', 'space'],
    code: `x ^ x == 0;  x ^ 0 == x;                 // XOR cancels — the whole trick
int lone = 0; for (int v : a) lone ^= v;  // everything else appears twice
n & (n - 1)      // clear the lowest set bit
n & -n           // isolate the lowest set bit
n | (1 << i)     // set bit i
n & ~(1 << i)    // clear bit i
(n >> i) & 1     // read bit i
__builtin_popcount(n);  __builtin_popcountll(n);
// counting bits for every x in [0, n] — DP on bits
vector<int> dp(n + 1, 0);
for (int i = 1; i <= n; ++i) dp[i] = dp[i >> 1] + (i & 1);
// enumerate every subset of a set of n items
for (int mask = 0; mask < (1 << n); ++mask)
    for (int i = 0; i < n; ++i)
        if (mask & (1 << i)) { /* item i is in this subset */ }`,
    traps: [
      '1 << 31 overflows a signed int. Use 1LL << k for anything past 30.',
      'Right-shifting a negative int is implementation-defined sign extension — use unsigned when you mean a logical shift.',
      'Operator precedence: n & 1 == 0 parses as n & (1 == 0). Parenthesize.',
      'Reaching for bit tricks when a boolean array is clearer. Use them when the problem demands O(1) space or n ≤ 20.',
    ],
    probs: [
      '136 Single Number',
      '191 Number of 1 Bits',
      '338 Counting Bits',
      '268 Missing Number',
      '371 Sum of Two Integers',
      '190 Reverse Bits',
    ],
    ml: 'Quantization is bit packing: int8 and int4 weight layouts, and the pack/unpack shifts that go with them, are exactly these operations at scale.',
  },
]
