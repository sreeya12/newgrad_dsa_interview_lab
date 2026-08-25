/*
 * ML depth for the MLE track: the second half of each module.
 * Every key matches a MODULES[].n string in src/pages/dsalab/modules.jsx
 * exactly. Where the module teaches the CS, this teaches what the same
 * structure costs, breaks, and is worth once it is in a training or
 * serving system.
 */

export const ML_DEPTH = {
  'How to price a solution': {
    code: `# Cost a decoder-only transformer before you write the training loop.
d, L, V, S = 4096, 32, 128000, 8192      # width, layers, vocab, sequence length
params = 12 * L * d * d + V * d          # attention + MLP blocks, plus embeddings
print(params / 1e9, "B params")

# Forward FLOPs per token is about 2 * params: one multiply-add per weight.
# The backward pass costs roughly twice the forward.
flops_fwd = 2 * params
flops_step = 3 * flops_fwd               # fwd + bwd, per token, per step

# Attention is the term that does not scale with params. It scales with S.
attn_flops = 4 * L * S * d               # per token: the QK product and the AV product
print(attn_flops / flops_fwd)            # share of the budget that grows with context

# Memory is the constraint that actually stops you:
bytes_per_param = 2 + 4 + 4 + 4          # bf16 weight, fp32 master, Adam m and v
print(params * bytes_per_param / 1e9, "GB of weights and optimizer state")

# Wall clock: divide by the FLOPs the accelerator sustains, never by peak.
tokens = 300e9
sustained = 989e12 * 0.4                 # 40 percent model FLOPs utilisation
print(tokens * flops_step / sustained / 3600, "GPU-hours")`,
    cost: [
      ['forward pass', '2 x params FLOPs per token', 'one multiply-add per weight'],
      ['training step', '6 x params FLOPs per token', 'forward plus backward'],
      ['attention term', '4 x layers x seq x d per token', 'grows with context, not params'],
      ['Adam state', '14 bytes per param', 'bf16 weight, fp32 master, m and v'],
      ['activations', 'batch x seq x d x layers', 'what recompute trades away'],
    ],
    costHead: ['item', 'cost model', 'what drives it'],
    traps: [
      'Quoting peak FLOPs off the spec sheet. Real utilisation is 30 to 50 percent, so any estimate built on peak is two to three times optimistic.',
      'Costing the model and forgetting the data path. If the input pipeline delivers fewer samples per second than the accelerator consumes, your step time is a disk number, not a FLOPs number.',
      'Ignoring the attention term because it is negligible at sequence length 2k. At the length you actually serve it can dominate.',
      'Reporting parameter count as memory. Weights, gradients, optimizer state and activations are four separate allocations, and only one of them is the parameter count.',
    ],
    probs: [
      'Compute params, FLOPs per token and optimizer bytes for a 7B model from width, depth and vocab alone.',
      'Explain where the 6N FLOPs per token figure comes from and when it stops being accurate.',
      'Given a measured step time and a token count, decide whether you are compute bound, memory bound or input bound.',
    ],
  },

  'Hash maps and sets': {
    code: `import hashlib
import numpy as np

# A vocabulary is a hash map from string to row index in an embedding table.
vocab = {}
def fit(docs):
    for doc in docs:
        for tok in doc.split():
            if tok not in vocab:            # test membership, do not assign
                vocab[tok] = len(vocab)     # ids stay dense and start at 0

# The hashing trick skips the vocabulary and hashes into a fixed width. You
# never store the strings, so the table cannot grow at serving time.
DIM = 2 ** 20
def hashed_ids(tokens):
    out = np.empty(len(tokens), dtype=np.int64)
    for i, t in enumerate(tokens):
        # A stable hash. Python str hash is salted per process and gives
        # different ids in training and in the serving container.
        h = hashlib.blake2b(t.encode(), digest_size=8).digest()
        out[i] = int.from_bytes(h, "big") % DIM
    return out

# Embedding lookup is a gather: one map read per token, then one row copy.
E = np.random.randn(DIM, 64).astype(np.float32)
ids = hashed_ids("the cat sat on the mat".split())
pooled = E[ids].mean(axis=0)                # bag of embeddings, one gather kernel`,
    cost: [
      ['embedding table', 'rows x dim x 4 bytes', '1M x 64 fp32 is 256 MB'],
      ['lookup per token', 'one hash plus one row copy', 'dim x 4 bytes of memory traffic'],
      ['hashing trick', 'constant in vocabulary size', 'you pay in collisions instead of memory'],
      ['collision rate', 'about 1 - exp(-v / DIM)', 'v distinct features into DIM buckets'],
      ['gradient for a batch', 'unique ids x dim', 'sparse, so scatter-add, never a dense update'],
    ],
    costHead: ['item', 'cost', 'note'],
    traps: [
      'Using the built-in str hash for feature hashing. It is salted per process, so training and serving disagree and the model reads rows that mean nothing.',
      'Building the vocabulary over the full dataset before splitting. The ids then encode counts drawn from the test set.',
      'Letting the vocabulary grow at serving time. New ids point past the end of a table sized at training time, so every unseen token has to land on a reserved UNK row.',
      'Materialising a dense gradient for a million-row embedding table when the batch touched two hundred rows.',
    ],
    probs: [
      'Implement feature hashing with a stable hash and measure the collision rate as you shrink the table.',
      'Explain what happens to a token seen for the first time in production, under both the vocabulary and the hashing designs.',
      'Write the sparse gradient update for an embedding table and compare its cost to the dense one.',
    ],
  },

  'Two pointers': {
    code: `# Fuse a dense retriever and a BM25 retriever. Both return lists sorted by
# score, descending, so the merge is the two-pointer walk. The wrinkle: the
# two scores are not on the same scale, so you cannot compare them directly.
def merge_by_score(dense, sparse, k):
    i = j = 0
    seen, out = set(), []
    while len(out) < k and (i < len(dense) or j < len(sparse)):
        take_dense = j >= len(sparse) or (
            i < len(dense) and dense[i][1] >= sparse[j][1])
        doc, s = dense[i] if take_dense else sparse[j]
        i, j = (i + 1, j) if take_dense else (i, j + 1)
        if doc in seen:                     # the same doc can be in both lists
            continue
        seen.add(doc)
        out.append((doc, s))
    return out

# Reciprocal rank fusion dodges the scale problem: fuse on position, not score.
def rrf(lists, k, c=60):
    score = {}
    for lst in lists:
        for rank, (doc, _) in enumerate(lst):
            score[doc] = score.get(doc, 0.0) + 1.0 / (c + rank + 1)
    return sorted(score.items(), key=lambda kv: -kv[1])[:k]`,
    cost: [
      ['merge two ranked lists', 'len(dense) + len(sparse) comparisons', 'no model called, pure bookkeeping'],
      ['dedupe by doc id', 'one set of ids', 'cheap next to holding the vectors'],
      ['cross-encoder rerank of the top-k', 'k forward passes', 'this dominates, so keep k small'],
      ['recall of the fused list', 'union of the two recalls', 'only if k is wide enough to hold both'],
    ],
    costHead: ['step', 'cost', 'note'],
    traps: [
      'Comparing a cosine similarity against a BM25 score as if they were the same quantity. Normalise per list, or fuse on rank instead.',
      'Measuring recall@k before dedup and precision after it. Pick one point in the pipeline and measure everything there.',
      'Dropping a duplicate but keeping its rank slot, so the fused list comes back shorter than k.',
      'Fusing at k = 10 and evaluating the reranker at k = 100. The reranker can only reorder what the merge let through.',
    ],
    probs: [
      'Implement score fusion and reciprocal rank fusion, then compare recall@50 on the same query set.',
      'Explain why the merged list needs a dedup pass and where in the pipeline you measure recall.',
    ],
  },

  'Sliding window': {
    code: `import numpy as np
from collections import deque

# A rolling feature: mean spend over the last 24 hours, per user. What matters
# is that batch and stream produce the same number for the same event, so write
# the update once and call it from both paths.
class RollingMean:
    def __init__(self, window_s):
        self.window_s = window_s
        self.q = deque()                    # (timestamp, value), oldest on the left
        self.total = 0.0

    def update(self, ts, value):
        # Evict first, then read, then admit. The feature for THIS event must
        # not include this event, or the label leaks into its own feature.
        while self.q and self.q[0][0] <= ts - self.window_s:
            self.total -= self.q.popleft()[1]
        feature = self.total / len(self.q) if self.q else 0.0
        self.q.append((ts, value))
        self.total += value
        return feature

def backfill(events):                       # events sorted by EVENT time
    r = RollingMean(86400)
    return np.array([r.update(ts, v) for ts, v in events], dtype=np.float32)

# One pass, O(1) amortised per event, and serving calls the identical method.
# A pandas rolling().mean() written separately for training is a second
# implementation, and it will drift from this one.`,
    cost: [
      ['per event update', 'O(1) amortised', 'one evict, one admit'],
      ['backfill of n events', 'one pass, n updates', 'no rescan per window'],
      ['naive recompute per event', 'n x window', 'the version that dies at 10^8 events'],
      ['online state per key', 'window length x 16 bytes', 'multiply by active users for the feature store'],
    ],
    costHead: ['path', 'cost', 'note'],
    traps: [
      'Two implementations of one feature, SQL for training and application code for serving. They diverge and the model degrades quietly, with no error anywhere.',
      'Including the current event in its own window, so the feature has already seen the label.',
      'Evicting by row count when the window is defined in time. Event rates vary, so those are not the same window.',
      'Backfilling in arrival order rather than event time. Late-arriving data then produces a feature value the serving path can never reproduce.',
    ],
    probs: [
      'Implement a rolling aggregate once, drive it from both a batch backfill and a stream, and assert the two outputs match row for row.',
      'Explain why the current event is excluded from its own window.',
    ],
  },

  'Prefix sums and difference arrays': {
    code: `import numpy as np

# Negative sampling: draw tokens in proportion to a smoothed unigram
# distribution. Build the cumulative table once, then every draw is a search.
counts = np.array([500, 120, 90, 40, 5], dtype=np.float64)
p = counts ** 0.75                     # the word2vec smoothing exponent
p /= p.sum()
cdf = np.cumsum(p)                     # prefix sums, the whole trick
cdf[-1] = 1.0                          # guard the tail against float drift

rng = np.random.default_rng(0)
def sample(n):
    u = rng.random(n)
    return np.searchsorted(cdf, u, side="right")    # O(log V) per draw

# The same idea reads a whole precision/recall curve in one pass instead of
# one pass per k: sort by score once, then accumulate the labels.
scores = rng.random(10000)
labels = (rng.random(10000) < 0.1).astype(np.int64)
order = np.argsort(-scores)
y = labels[order]
tp = np.cumsum(y)                                    # positives inside the top i
precision_at = tp / np.arange(1, len(y) + 1)         # every k, one pass
recall_at = tp / tp[-1]`,
    cost: [
      ['build the cdf over vocab V', 'O(V) once, V x 8 bytes', 'rebuild per epoch, not per batch'],
      ['one negative sample', 'O(log V) search', 'against O(V) for a fresh normalise'],
      ['alias table alternative', 'O(V) build, O(1) draw', 'worth it past a few million draws'],
      ['precision and recall at every k', 'one sort plus one cumsum', 'not one pass per k'],
    ],
    costHead: ['operation', 'cost', 'note'],
    traps: [
      'Rebuilding the cumulative table inside the training loop when the counts have not changed.',
      'Running cumsum in float32 over millions of elements. The tail loses precision and the last buckets stop being reachable. Accumulate in float64.',
      'Sampling negatives without excluding the positive, so the model is taught to push a correct pair apart.',
      'Computing precision at k with a fresh sort per k when one cumulative pass gives you the entire curve.',
    ],
    probs: [
      'Build a smoothed unigram sampler with cumsum and searchsorted, then check the empirical frequencies against p.',
      'Compute precision and recall at every k with a single cumulative pass and plot the curve.',
    ],
  },

  'Binary search': {
    code: `import numpy as np

# 1. Pick the score threshold that reaches a target precision. Precision is not
# monotone in the threshold on a finite sample, but the size of the predicted
# positive set is, so search on rank and read the threshold off a sorted array.
def threshold_for_precision(scores, labels, target=0.9):
    order = np.argsort(-scores)
    y = labels[order]
    prec = np.cumsum(y) / np.arange(1, len(y) + 1)
    ok = np.flatnonzero(prec >= target)
    if ok.size == 0:
        return None                        # no operating point reaches it
    return float(scores[order][ok[-1]])    # the widest set that still holds

# 2. Largest batch size that fits. Feasibility is monotone: if b fits, so does
# b - 1. That is the only property binary search needs.
def largest_batch(fits, lo=1, hi=4096):
    while lo < hi:
        mid = lo + (hi - lo + 1) // 2      # bias up: we want the last feasible one
        if fits(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo

# fits(b) must run a real forward AND backward step and catch the OOM. Deriving
# it from a formula is how you OOM at hour nine of a training run.`,
    cost: [
      ['threshold sweep on a sorted split', 'one sort plus one cumsum', 'yields every operating point at once'],
      ['threshold search by re-evaluation', 'log2(range) evaluations', 'each one is a full scoring pass'],
      ['batch size probe to 4096', 'about 12 probes', 'each probe is one fwd plus bwd step'],
      ['calibration on n examples', 'n forward passes per probe', 'why you calibrate on a subsample'],
    ],
    costHead: ['task', 'cost', 'note'],
    traps: [
      'Binary searching a predicate that is not monotone. Precision at a threshold wobbles on a small validation set, so search on sorted rank instead.',
      'Tuning the threshold on the split you report on. A threshold is a fitted parameter and it needs its own held-out data.',
      'Finding the largest batch that fits a forward pass, then hitting OOM on the backward pass or on the first step that allocates optimizer state.',
      'A probe that leaves cached allocations behind, so later probes see less free memory than a clean run would and you settle on a batch that is too small.',
    ],
    probs: [
      'Implement threshold selection for a target precision and state which split each number came from.',
      'Write the largest-feasible-batch search with a real probe, and explain why fits must be monotone.',
    ],
  },

  'Stacks and monotonic stacks': {
    code: `# Reverse-mode autodiff is a stack. The forward pass pushes one record per
# operation; the backward pass pops them in reverse and accumulates gradients.
class Tape:
    def __init__(self):
        self.records = []                  # (inputs, output, local grad fn)

class Var:
    def __init__(self, v, tape):
        self.v, self.tape, self.grad = v, tape, 0.0

    def __mul__(self, o):
        out = Var(self.v * o.v, self.tape)
        # The local partials read self.v and o.v, which is exactly why the
        # forward values have to stay alive until backward runs.
        self.tape.records.append(((self, o), out,
                                  lambda g: (g * o.v, g * self.v)))
        return out

    def __add__(self, o):
        out = Var(self.v + o.v, self.tape)
        self.tape.records.append(((self, o), out, lambda g: (g, g)))
        return out

def backward(tape, loss):
    loss.grad = 1.0
    for inputs, out, local in reversed(tape.records):     # pop order
        for inp, g in zip(inputs, local(out.grad)):
            inp.grad += g                  # accumulate: a var used twice gets both`,
    cost: [
      ['tape length', 'one record per op', 'thousands per transformer layer'],
      ['saved activations', 'batch x seq x d x 2 bytes per kept tensor', 'the real memory cost, not the records'],
      ['gradient checkpointing', 'about 1.3x forward FLOPs', 'drops most saved tensors, recomputes them'],
      ['backward pass', 'about 2x the forward FLOPs', 'two partials per op'],
    ],
    costHead: ['item', 'cost', 'note'],
    traps: [
      'Keeping a reference to a loss tensor across iterations, so the previous tape is never freed and memory climbs one step at a time until it does not.',
      'Assigning gradients instead of accumulating them. A tensor consumed by two branches needs both contributions summed.',
      'Running an evaluation loop without disabling grad, which builds a tape you never use and roughly doubles memory.',
      'An in-place operation on a tensor the backward pass saved. The stored value is now the wrong one and the gradient is silently wrong.',
    ],
    probs: [
      'Implement a short reverse-mode tape for add and multiply and check it against a finite difference.',
      'Explain what gradient checkpointing drops and what it recomputes, in terms of the tape.',
    ],
  },

  'Linked lists': {
    code: `from collections import OrderedDict

# The place pointer discipline earns its keep in serving: an LRU cache in front
# of an expensive model. A hash map for O(1) lookup over a doubly linked list
# for O(1) eviction of the least recently used entry.
class EmbeddingCache:
    def __init__(self, capacity, compute, model_version):
        self.d = OrderedDict()             # map over a doubly linked list
        self.cap = capacity
        self.compute = compute             # the model call you are avoiding
        self.ver = model_version           # part of the key, never optional
        self.hits = self.misses = 0

    def get(self, text):
        key = (self.ver, text)
        if key in self.d:
            self.d.move_to_end(key)        # O(1) relink, not a re-sort
            self.hits += 1
            return self.d[key]
        self.misses += 1
        v = self.compute(text)
        self.d[key] = v
        if len(self.d) > self.cap:
            self.d.popitem(last=False)     # evict the oldest
        return v

    def hit_rate(self):
        return self.hits / max(1, self.hits + self.misses)

# The same shape holds a paged KV cache: fixed-size blocks on a free list, a map
# from sequence id to its block chain, and eviction when the pool runs dry.`,
    cost: [
      ['cache hit', 'one map lookup plus one relink', 'microseconds'],
      ['cache miss', 'one model forward', 'milliseconds, three orders of magnitude worse'],
      ['capacity', 'entries x dim x 4 bytes', '100k x 768 fp32 is about 300 MB'],
      ['effective latency', 'hit_rate x hit + (1 - hit_rate) x miss', 'the only latency number worth quoting'],
    ],
    costHead: ['event', 'cost', 'note'],
    traps: [
      'Caching an embedding without the model version in the key. After a redeploy the cache serves vectors from the old model into the new index.',
      'Quoting mean latency for a cached service. The miss path is the tail, so report p99 as well.',
      'Sizing the cache from the number of distinct keys rather than the working set. Most traffic is a small head, and a small cache usually gets most of the win.',
      'An unbounded cache inside a serving process. It never fails on a benchmark and it does fail in production.',
    ],
    probs: [
      'Implement an LRU embedding cache and measure hit rate and p99 latency against a replayed request log.',
      'Explain what belongs in the cache key besides the input text.',
    ],
  },

  'Trees, traversals, and BSTs': {
    code: `import numpy as np

# A trained decision tree is four flat arrays, not a graph of node objects.
# Flat arrays are what make inference cache friendly.
feature = np.array([0, 2, -1, -1, -1], dtype=np.int32)      # -1 marks a leaf
thresh = np.array([0.5, 1.2, 0.0, 0.0, 0.0], dtype=np.float32)
left = np.array([1, 3, -1, -1, -1], dtype=np.int32)
right = np.array([2, 4, -1, -1, -1], dtype=np.int32)
leafval = np.array([0.0, 0.0, -0.3, 0.7, 0.1], dtype=np.float32)

def predict_one(x):
    node = 0
    while feature[node] >= 0:              # a root-to-leaf walk, O(depth)
        f = feature[node]
        node = left[node] if x[f] <= thresh[node] else right[node]
    return leafval[node]

# An ensemble sums those walks. Depth is 6 to 8, so cost is trees x depth and
# the work is branch prediction and cache misses, not floating point.
def predict(X, ensemble, lr=0.1, base=0.0):
    out = np.full(len(X), base, dtype=np.float32)
    for tree in ensemble:
        out += lr * np.fromiter((tree(x) for x in X), np.float32, len(X))
    return out

# Missing values take a third path: each split stores a default direction
# learned from training statistics, so NaN does not fall through by accident.`,
    cost: [
      ['one tree, one row', 'depth comparisons', '6 to 8, and no matrix multiply anywhere'],
      ['500-tree ensemble, one row', 'about 4000 comparisons', 'branchy, so latency is cache bound'],
      ['model size', 'nodes x 20 bytes', '500 trees of 63 nodes is under 1 MB'],
      ['finding one split', 'features x rows', 'histogram binning cuts it to features x bins'],
    ],
    costHead: ['operation', 'cost', 'note'],
    traps: [
      'Assuming a deeper tree costs more at inference. Depth is logarithmic in leaves and tiny; the number of trees is what you pay for.',
      'Encoding a high-cardinality category as an integer and letting the tree split on it. The ordering is arbitrary, so the splits fit noise.',
      'Imputing missing values with a mean before training, which discards the fact that the value was missing. That fact is often the strongest feature you had.',
      'Comparing a boosted-tree baseline against a neural model without matching the feature preprocessing. Most of the gap is usually the features, not the model.',
    ],
    probs: [
      'Implement flat-array tree inference and time it against a per-row walk over node objects.',
      'Explain why a gradient-boosted ensemble is latency bound rather than FLOP bound.',
    ],
  },

  'Heaps and priority queues': {
    code: `import heapq
import numpy as np

# Top-k over embedding similarities. The streaming version keeps a size-k
# MIN-heap, so memory is O(k) no matter how many vectors you scan.
def topk_stream(query, chunks, k=10):
    heap = []                                   # (score, doc_id), min at [0]
    for offset, block in chunks:                # block: (m, d) float32, normalised
        sims = block @ query
        for i, s in enumerate(sims):
            if len(heap) < k:
                heapq.heappush(heap, (float(s), offset + i))
            elif s > heap[0][0]:
                heapq.heapreplace(heap, (float(s), offset + i))
    return sorted(heap, reverse=True)

# In memory, argpartition beats the heap: O(n), and it runs in C.
def topk_numpy(query, X, k=10):
    sims = X @ query
    idx = np.argpartition(-sims, k)[:k]         # unordered top-k
    return idx[np.argsort(-sims[idx])]          # sort only k of them

# The heap version is what you want when the index does not fit in memory, or
# when partial results arrive from several shards and you merge as they land.`,
    cost: [
      ['exact scan of n vectors', 'n x d multiply-adds', '1M x 768 is 1.5 GFLOP per query'],
      ['size-k heap over the scan', 'n pushes worst case, O(k) memory', 'streams over shards, never holds n scores'],
      ['argpartition top-k', 'O(n) in C', 'needs all n scores resident'],
      ['ANN index', 'sublinear, approximate', 'trades recall for latency, so recall must be measured'],
    ],
    costHead: ['method', 'cost', 'note'],
    traps: [
      'Serving top-k from an index that has not been rebuilt since the embedding model was redeployed. Old and new vectors are not in the same space.',
      'Taking dot products of vectors that are not normalised, so long vectors win regardless of angle.',
      'Reporting recall@k of an approximate index against its own results instead of against an exact brute-force scan.',
      'Ties at the k-th score broken by insertion order, so the result list shuffles between runs and an A/B test reads as noise.',
    ],
    probs: [
      'Implement top-k retrieval with a size-k heap, then compare timing and output against np.argpartition.',
      'Measure ANN recall@10 against an exact scan on the same query set and state the latency you bought with it.',
    ],
  },

  'Tries': {
    code: `# A WordPiece style tokenizer does longest-prefix matching against a learned
# vocabulary. A trie makes each step cost the length of the match instead of a
# scan over the whole vocabulary.
class TokenTrie:
    def __init__(self):
        self.root = {}

    def add(self, piece, token_id):
        node = self.root
        for ch in piece:
            node = node.setdefault(ch, {})
        node["#"] = token_id               # end marker, distinct from a waypoint

    def longest_prefix(self, text, start):
        node, best, i = self.root, None, start
        while i < len(text) and text[i] in node:
            node = node[text[i]]
            i += 1
            if "#" in node:
                best = (node["#"], i)      # remember the longest match so far
        return best

def encode(trie, text, unk_id=0):
    out, i = [], 0
    while i < len(text):
        hit = trie.longest_prefix(text, i)
        if hit is None:                    # nothing in the vocab starts here
            out.append(unk_id)
            i += 1                         # a byte-level vocab makes this dead code
        else:
            out.append(hit[0])
            i = hit[1]
    return out`,
    cost: [
      ['encode one token', 'characters matched', 'independent of vocabulary size'],
      ['tokens per word', 'about 1.3 for English', 'closer to 3 for code and non-Latin scripts'],
      ['cost of a token', 'one model forward pass', 'tokenizer choice moves your serving bill directly'],
      ['trie memory', 'nodes x per-node overhead', 'a 50k vocab is tens of MB in Python, KB packed in C'],
    ],
    costHead: ['item', 'cost', 'note'],
    traps: [
      'Changing the vocabulary without retraining the embedding table. Token ids are positions in that table and they do not survive a revocab.',
      'Measuring context length in characters. The budget is tokens, and the ratio differs by three times across languages.',
      'Normalising text (case folding, unicode form) in training but not at serving. The same input then produces a different id sequence.',
      'Assuming greedy longest-prefix matching reproduces the BPE merge order the vocabulary was trained with. It does not, and the model saw the merges.',
    ],
    probs: [
      'Build a longest-prefix tokenizer over a small vocabulary and count tokens per word on English text and on source code.',
      'Explain why the tokenizer and the embedding table have to be versioned together.',
    ],
  },

  'Graph traversal: BFS and DFS': {
    code: `import torch

# One message-passing layer is BFS frontier expansion done for every node at
# once: gather along edges, scatter-add into destinations, then transform.
def gcn_layer(h, edge_index, W):
    # h: (N, d). edge_index: (2, E), row 0 source, row 1 destination.
    src, dst = edge_index[0], edge_index[1]
    msgs = h.index_select(0, src)                  # gather, one row per edge
    agg = torch.zeros_like(h)
    agg.index_add_(0, dst, msgs)                   # scatter-add, the aggregation
    deg = torch.zeros(h.size(0), dtype=h.dtype, device=h.device)
    deg.index_add_(0, dst, torch.ones(dst.numel(), dtype=h.dtype))
    agg = agg / deg.clamp(min=1.0).unsqueeze(1)    # mean, so degree does not set scale
    return torch.relu(agg @ W)

# L layers means every node has seen its L-hop neighbourhood, which is the same
# statement as BFS to depth L. At average degree 20, three hops touch 8000 nodes
# per seed, so production GNNs sample a fixed fan-out per hop instead.
def sample_block(adj, seeds, fanout):
    frontier = seeds
    for f in fanout:                               # e.g. [10, 10, 5], one per layer
        picked = []
        for u in frontier.tolist():
            nb = adj[u]
            picked.append(nb[torch.randperm(len(nb))[:f]])
        frontier = torch.unique(torch.cat(picked))
    return frontier`,
    cost: [
      ['one layer, full graph', 'E gathers plus N x d x d FLOPs', 'edges drive memory traffic, nodes drive FLOPs'],
      ['L-hop receptive field', 'degree^L nodes per seed', '20^3 is 8000, and that is the blowup'],
      ['fan-out [10, 10, 5]', '500 nodes per seed, fixed', 'what makes minibatch training possible at all'],
      ['scatter-add', 'one atomic per edge', 'usually the bottleneck on GPU, not the matmul'],
    ],
    costHead: ['step', 'cost', 'note'],
    traps: [
      'Sum aggregation with no degree normalisation, so high-degree nodes dominate and activations blow up after two layers.',
      'Splitting train and test by node without removing the edges that cross the split. Message passing walks straight over the boundary and test nodes absorb training labels.',
      'Full-graph training on a graph that fits today. Sampling is a different code path, so build it before the graph outgrows the machine.',
      'Adding layers to buy capacity. Past three or four hops every node sees most of the graph and the representations collapse together.',
    ],
    probs: [
      'Implement one mean-aggregation layer with gather and scatter-add, then check it against a dense adjacency matmul.',
      'Explain what a fan-out of [10, 10] changes about the gradient compared with full-neighbourhood aggregation.',
    ],
  },

  'Topological sort': {
    code: `from collections import deque

# A computation graph is a DAG. The forward pass runs in topological order, the
# backward pass in the reverse of it, and the size check is the cycle detector.
def topo_order(nodes, deps):
    indeg = {v: len(deps.get(v, ())) for v in nodes}
    users = {v: [] for v in nodes}
    for v, ds in deps.items():
        for d in ds:
            users[d].append(v)
    q = deque(v for v in nodes if indeg[v] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in users[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    if len(order) != len(nodes):
        raise ValueError("cycle in the graph")     # a stage that never runs
    return order

# The order you choose sets peak activation memory. Reference-count each value
# and free it the moment its last consumer has run.
def run(nodes, deps, fns):
    remaining = {v: 0 for v in nodes}
    for v, ds in deps.items():
        for d in ds:
            remaining[d] += 1
    cache = {}
    for v in topo_order(nodes, deps):
        cache[v] = fns[v](*[cache[d] for d in deps.get(v, ())])
        for d in deps.get(v, ()):
            remaining[d] -= 1
            if remaining[d] == 0:
                del cache[d]                       # nothing reads it again
    return cache`,
    cost: [
      ['order V ops with E edges', 'O(V + E), once per graph', 'cached across steps, not paid per batch'],
      ['peak activation memory', 'max live tensors under the chosen order', 'the order sets this number'],
      ['backward pass order', 'the reverse of the forward order', 'no second sort needed'],
      ['recompute under checkpointing', 'about 1.3x forward FLOPs', 'trades that fixed peak for time'],
    ],
    costHead: ['item', 'cost', 'note'],
    traps: [
      'Two valid topological orders with very different peak memory. If you did not choose the order, you did not choose the memory.',
      'A retraining DAG whose feature stage and label stage read different partition dates. Everything runs green and the model trains on a join that saw the future.',
      'Adding a node and dropping the final size check, so a new cyclic dependency shows up as a stage that quietly never runs instead of as an error.',
      'Hard-coding downstream steps against one ordering when several are valid. Pin the order explicitly if anything depends on it.',
    ],
    probs: [
      'Implement Kahn ordering with reference counting that frees each activation as soon as its last consumer has run.',
      'Explain why the backward pass is the reverse topological order and what it needs the forward pass to have kept.',
    ],
  },

  'Union-Find (disjoint set union)': {
    code: `import numpy as np

class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.sz = [1] * n

    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]          # path halving
            x = self.p[x]
        return x

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.sz[a] < self.sz[b]:
            a, b = b, a
        self.p[b] = a
        self.sz[a] += self.sz[b]
        return True

# Training-set dedup: bucket documents by MinHash band, union every pair in a
# bucket that clears the threshold, keep one document per connected component.
def dedupe(sigs, buckets, thresh=0.8):
    dsu = DSU(len(sigs))
    for docs in buckets.values():                  # docs: candidate indices
        for i in range(len(docs)):
            for j in range(i + 1, len(docs)):
                a, b = docs[i], docs[j]
                if float(np.mean(sigs[a] == sigs[b])) >= thresh:
                    dsu.union(a, b)                # estimated Jaccard
    keep = {}
    for i in range(len(sigs)):
        keep.setdefault(dsu.find(i), i)            # deterministic representative
    return sorted(keep.values())`,
    cost: [
      ['union and find', 'near constant', 'negligible beside the similarity check'],
      ['candidate pairs from LSH', 'sum of bucket size squared', 'one oversized bucket dominates the whole job'],
      ['MinHash signature', 'permutations x tokens', '128 permutations is the usual setting'],
      ['transitive merging', 'clusters chain', 'A~B and B~C merge even when A and C share little'],
    ],
    costHead: ['step', 'cost', 'note'],
    traps: [
      'Deduping after the train/test split instead of before it. Near-duplicates then straddle the split and every reported metric is inflated.',
      'Ignoring transitivity. Union-Find merges chains, so a pairwise threshold of 0.8 can build a cluster whose two ends have almost nothing in common.',
      'One enormous LSH bucket of boilerplate turning the pair check into a quadratic job that never finishes.',
      'Picking an arbitrary representative per cluster. Choose deterministically, or the dataset changes between runs and nothing is reproducible.',
    ],
    probs: [
      'Cluster a document set with MinHash banding plus Union-Find, then report the cluster size distribution and the largest bucket.',
      'Explain how near-duplicate leakage across a train/test split inflates a reported metric, with a number.',
    ],
  },

  'Recursion and backtracking': {
    code: `import numpy as np

# Beam search is backtracking with a width cap: expand every live hypothesis,
# score the continuations, prune back to beam_size, repeat.
def beam_search(step_fn, bos, eos, beam=4, max_len=64, alpha=0.6):
    live = [(0.0, [bos])]                          # (sum of log probs, tokens)
    done = []
    for _ in range(max_len):
        cands = []
        for score, seq in live:
            logp = step_fn(seq)                    # (V,) LOG probabilities
            for t in np.argpartition(-logp, beam)[:beam]:
                cands.append((score + float(logp[t]), seq + [int(t)]))
        cands.sort(key=lambda c: -c[0])
        live = []
        for score, seq in cands[:beam]:
            if seq[-1] == eos:
                # length normalise before comparing finished to unfinished
                done.append((score / len(seq) ** alpha, seq))
            else:
                live.append((score, seq))
        if not live:
            break
    return max(done, key=lambda c: c[0])[1] if done else live[0][1]

# Sum log probabilities, never multiply probabilities. At length 64 the product
# underflows float32 and every hypothesis scores exactly zero.`,
    cost: [
      ['one decode step', 'beam forward passes', 'batch them: one matmul, not four'],
      ['full decode of length L', 'beam x L forward passes', 'greedy is the baseline you have to beat'],
      ['KV cache', 'beam x L x layers x 2 x d x 2 bytes', 'per request, and it is the memory that limits concurrency'],
      ['beam reorder', 'an index gather, not a copy', 'copying the cache is most of a naive decode latency'],
    ],
    costHead: ['item', 'cost', 'note'],
    traps: [
      'Multiplying probabilities instead of summing log probabilities. Long sequences underflow and the ranking turns into noise.',
      'Comparing a finished hypothesis against an unfinished one with no length normalisation, which biases output towards short sequences.',
      'Physically copying the KV cache whenever the beams reorder, instead of reordering an index tensor.',
      'Reporting beam-search quality for a system that ships sampling. They are different decoders and they score differently.',
    ],
    probs: [
      'Implement beam search with length normalisation and compare its output to greedy decoding on the same model.',
      'Explain what the KV cache holds per beam and how you reorder it without copying.',
    ],
  },

  'Dynamic programming, one dimension': {
    code: `import numpy as np

# Viterbi: the most likely tag sequence under an HMM or a linear-chain CRF.
# One DP over positions, exactly the 1-D table you know, with state
# (position, tag) and a backpointer so you can reconstruct the path.
def viterbi(emit, trans, start):
    # emit: (T, K) log P(observation | tag). trans: (K, K) log P(next | prev).
    T, K = emit.shape
    dp = np.full((T, K), -np.inf, dtype=np.float64)
    bp = np.zeros((T, K), dtype=np.int32)
    dp[0] = start + emit[0]
    for t in range(1, T):
        score = dp[t - 1][:, None] + trans         # (K, K), broadcast, no inner loop
        bp[t] = np.argmax(score, axis=0)
        dp[t] = score[bp[t], np.arange(K)] + emit[t]
    path = [int(np.argmax(dp[-1]))]
    for t in range(T - 1, 0, -1):
        path.append(int(bp[t, path[-1]]))          # walk the backpointers
    return path[::-1]

# Everything is in log space. The forward algorithm is the same recursion with
# logsumexp in place of max, and that is the CRF loss you differentiate.`,
    cost: [
      ['Viterbi, T steps and K tags', 'T x K x K adds', 'cheap next to the encoder that produced emit'],
      ['CTC forward, T frames, L labels', 'T x 2L states', 'the loss, not the decode'],
      ['backpointer memory', 'T x K int32', 'the only reason this is not O(K) space'],
      ['beam-pruned Viterbi', 'T x beam x K', 'what you use when K is a full vocabulary'],
    ],
    costHead: ['algorithm', 'cost', 'note'],
    traps: [
      'Working in probability space. Over 500 frames the products underflow float32, so stay in log space and use logsumexp.',
      'Keeping the running maximum and no backpointers, so you know the best score and cannot produce the sequence it belongs to.',
      'Confusing the max recursion (Viterbi, the decode) with the sum recursion (forward, the loss). Training on the max path is a different objective.',
      'Letting a padded batch into the recursion. Padding frames carry real emission scores and shift the argmax unless you mask them.',
    ],
    probs: [
      'Implement Viterbi in log space with backpointers, then implement the forward recursion with logsumexp and confirm the forward score is at least the Viterbi score.',
      'Explain what the CTC forward recursion sums over and why a blank symbol is needed.',
    ],
  },

  'Dynamic programming, two dimensions': {
    code: `import numpy as np

# Dynamic time warping: edit distance where equality becomes a distance and the
# three neighbours are the same three cells you already know.
def dtw(a, b, band=None):
    n, m = len(a), len(b)
    D = np.full((n + 1, m + 1), np.inf, dtype=np.float64)
    D[0, 0] = 0.0                                  # only this cell, not the row
    for i in range(1, n + 1):
        lo, hi = 1, m
        if band is not None:                       # Sakoe-Chiba: stay near the diagonal
            centre = i * m // n
            lo, hi = max(1, centre - band), min(m, centre + band)
        for j in range(lo, hi + 1):
            cost = abs(a[i - 1] - b[j - 1])        # any metric goes here
            D[i, j] = cost + min(D[i - 1, j - 1],  # match
                                 D[i - 1, j],      # a advances
                                 D[i, j - 1])      # b advances
    return D[n, m]

# Unbanded is n x m: two 10-second signals at 100 Hz is a million cells per
# pair, and a pairwise matrix over 5000 series is 12 billion. The band cuts that
# to n x 2w and doubles as a regulariser, since it forbids an alignment that
# stretches one second of signal across thirty.`,
    cost: [
      ['DTW, unbanded', 'n x m cells', '1000 x 1000 is 10^6 per pair'],
      ['DTW with band w', 'n x 2w cells', 'w = 0.1n is about five times cheaper'],
      ['pairwise over N series', 'N^2 / 2 DTW calls', 'the term that actually kills the job'],
      ['rolling row', 'O(m) memory', 'only if you do not need the alignment path back'],
    ],
    costHead: ['variant', 'cost', 'note'],
    traps: [
      'Running DTW on raw amplitudes with no per-series z-normalisation. You end up measuring offset and scale rather than shape.',
      'Comparing raw DTW distances across pairs of different lengths. Normalise by path length, or the longest series always looks furthest away.',
      'Keeping one rolling row and then being asked for the alignment path. The path needs the full table, or a divide-and-conquer reconstruction.',
      'Computing the full pairwise matrix in Python loops. Screen with a cheap lower bound first and run full DTW only on the pairs that survive.',
    ],
    probs: [
      'Implement banded DTW and show what the band forbids on a pair that unbanded DTW happily aligns.',
      'Explain why edit distance and DTW are the same recursion, and exactly what changes in the cell update.',
    ],
  },

  'Greedy and intervals': {
    code: `import numpy as np

# Intersection over union on axis-aligned boxes is two interval overlaps, one
# per axis, multiplied together.
def iou(box, boxes):
    # box: (4,) as x1, y1, x2, y2. boxes: (N, 4).
    x1 = np.maximum(box[0], boxes[:, 0])
    y1 = np.maximum(box[1], boxes[:, 1])
    x2 = np.minimum(box[2], boxes[:, 2])
    y2 = np.minimum(box[3], boxes[:, 3])
    inter = np.clip(x2 - x1, 0, None) * np.clip(y2 - y1, 0, None)
    area = lambda b: (b[..., 2] - b[..., 0]) * (b[..., 3] - b[..., 1])
    return inter / (area(box) + area(boxes) - inter + 1e-9)

# Non-maximum suppression is the interval greedy: sort by score, keep the top
# box, delete everything it overlaps, repeat. The exchange argument is the
# assumption that a lower-scoring overlapping box is the same object.
def nms(boxes, scores, thresh=0.5):
    order = np.argsort(-scores)
    keep = []
    while order.size:
        i = order[0]
        keep.append(int(i))
        if order.size == 1:
            break
        order = order[1:][iou(boxes[i], boxes[order[1:]]) < thresh]
    return keep`,
    cost: [
      ['IoU, one box against N', 'N x 8 comparisons', 'vectorised, no Python loop'],
      ['NMS over N boxes', 'N x kept typical, N^2 worst', 'kept is usually under a hundred'],
      ['NMS per class', 'multiply by the class count', 'the term people forget at 1000 classes'],
      ['pre-NMS top-k', 'sort N, keep 1000', 'bounds the quadratic before it starts'],
    ],
    costHead: ['step', 'cost', 'note'],
    traps: [
      'Running NMS across classes rather than per class, which deletes a real person standing in front of a real car.',
      'Treating the IoU threshold as a constant. It trades precision against recall directly and has to be tuned on validation like any other parameter.',
      'Mixing box formats. Half the code uses x1y1x2y2 and half uses centre-width-height, and the bug is silent because the numbers stay plausible.',
      'Skipping the pre-NMS top-k on a model that emits 100k proposals per image, then finding the quadratic step is the whole latency budget.',
    ],
    probs: [
      'Implement vectorised IoU and greedy NMS, then check the kept set against a library implementation.',
      'Explain what soft-NMS changes about the greedy step and when that helps.',
    ],
  },

  'Bit manipulation': {
    code: `import numpy as np

# Symmetric int8 quantisation: one scale per output channel, weights stored as
# int8 and dequantised on the fly. Bit packing with a scale attached.
def quantize_per_channel(W):
    # W: (out, in) float32. One scale per ROW, never one for the whole matrix.
    scale = np.abs(W).max(axis=1, keepdims=True) / 127.0
    q = np.clip(np.rint(W / scale), -127, 127).astype(np.int8)
    return q, scale.astype(np.float32)

def dequantize(q, scale):
    return q.astype(np.float32) * scale

# int4 has no numpy dtype, so you pack two values per byte by hand.
def pack_int4(q):                          # q: values in [-8, 7], even length
    lo = q[0::2].astype(np.uint8) & 0x0F
    hi = (q[1::2].astype(np.uint8) & 0x0F) << 4
    return lo | hi

def unpack_int4(packed):
    lo, hi = packed & 0x0F, packed >> 4
    out = np.empty(packed.size * 2, dtype=np.int8)
    out[0::2] = np.where(lo > 7, lo - 16, lo)      # sign extend the nibble
    out[1::2] = np.where(hi > 7, hi - 16, hi)
    return out

# Memory is the point: 7B params is 28 GB in fp32, 14 in bf16, 7 in int8 and
# 3.5 in int4. That is the difference between two accelerators and one.`,
    cost: [
      ['fp32 weights', '4 bytes per parameter', '7B is 28 GB'],
      ['int8 per channel', '1 byte plus one fp32 scale per row', '7B is about 7 GB'],
      ['int4 packed', '0.5 bytes plus a scale per group', 'group size 128 is the usual setting'],
      ['dequant', 'one multiply per weight', 'still a win, because the bottleneck is bandwidth'],
    ],
    costHead: ['format', 'cost', 'note'],
    traps: [
      'One global scale for a whole weight matrix. A single outlier channel sets it and everything else rounds toward zero.',
      'Quantising weights, measuring perplexity, and calling it done. Activation outliers are what actually break int8 in transformers.',
      'Forgetting sign extension when unpacking a nibble. A 4-bit value above 7 is negative, and skipping that turns a small negative weight into a large positive one.',
      'Benchmarking a quantised model at batch size one and concluding it is fast everywhere. At large batch the kernel is compute bound and the dequant overhead shows up.',
    ],
    probs: [
      'Implement per-channel int8 quantise and dequantise, then measure relative error against a single global scale.',
      'Pack and unpack int4 with correct sign extension and round-trip a random tensor.',
      'Explain why memory bandwidth rather than FLOPs is what quantisation buys back at batch size one.',
    ],
  },
}
