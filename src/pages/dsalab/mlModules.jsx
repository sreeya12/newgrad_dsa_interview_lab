import {
  LabGradient,
  LabKMeans,
  LabSoftmax,
  LabAttention,
  LabTopK,
} from './mlLabs.jsx'

/* ML-native modules. Appended to the rail only on the MLE track — these are
   the from-scratch implementations that ML coding rounds actually ask for. */

export const MODULES_ML = [
  {
    g: 'ML from scratch',
    n: 'Gradient descent',
    days: 'Days 4–5 (ML add-on)',
    trigger:
      'Any "implement training" prompt, and every follow-up that starts "what if the loss goes to NaN".',
    lab: <LabGradient />,
    idea: 'Move against the gradient, scaled by a learning rate. That is the whole algorithm. Everything else in an optimizer — momentum, Adam, schedules — exists because this plain version is either too slow or unstable, and being able to say which of those two you are fixing is the interview.',
    invariant:
      'Each step decreases the loss only if the step is small enough relative to the curvature. For f(x) = x², any learning rate below 1 converges, exactly 1 oscillates forever, and above 1 diverges. Set the rate too high and no number of epochs saves you.',
    cost: [
      ['One step, n parameters', 'O(n)', 'O(n) for the gradient'],
      ['One epoch, m examples', 'O(m · n)', 'O(batch · n) activations'],
      ['Momentum / RMSProp', 'O(n)', 'O(n) extra state'],
      ['Adam', 'O(n)', 'O(2n) extra state'],
    ],
    costHead: ['what', 'time', 'memory'],
    code: `// plain gradient descent, one parameter
double x = init;
for (int step = 0; step < epochs; ++step) {
    double g = grad(x);
    x -= lr * g;
}
// momentum: keep a velocity, so consistent gradients accelerate
double v = 0;
v = beta * v + (1 - beta) * g;
x -= lr * v;
// Adam: momentum on the gradient AND on its square, both bias-corrected
m = b1 * m + (1 - b1) * g;
s = b2 * s + (1 - b2) * g * g;
x -= lr * (m / (1 - pow(b1, t))) / (sqrt(s / (1 - pow(b2, t))) + eps);`,
    codePy: `# plain gradient descent, vectorised
w = np.zeros(n)
for step in range(epochs):
    g = grad(w)                       # dL/dw, same shape as w
    w -= lr * g

# momentum: keep a velocity, so consistent gradients accelerate
v = beta * v + (1 - beta) * g
w -= lr * v

# Adam: momentum on the gradient AND on its square, both bias-corrected
m = b1 * m + (1 - b1) * g
s = b2 * s + (1 - b2) * g * g
w -= lr * (m / (1 - b1**t)) / (np.sqrt(s / (1 - b2**t)) + eps)

# always verify a hand-written gradient numerically before trusting it:
num = (loss(w + eps) - loss(w - eps)) / (2 * eps)
assert abs(num - g) < 1e-5`,
    traps: [
      'Adding the gradient instead of subtracting it. The loss climbs smoothly and it looks like a bad learning rate.',
      'Not scaling the learning rate when you change the batch size. Larger batches give lower-variance gradients, so they tolerate — and need — a larger rate.',
      'Forgetting Adam\'s bias correction. The first few steps are far too small without it, which reads as "slow to start".',
      'Reporting that a model "did not converge" without checking whether the loss diverged or just plateaued. They are different bugs with different fixes.',
    ],
    probs: [
      'Implement SGD, momentum and Adam from scratch',
      'Write a numerical gradient check and use it on your own backprop',
      'Explain what warmup fixes and why cosine decay follows it',
    ],
    ml: 'The follow-up is almost always "your loss is NaN at step 300, what do you check?". Answer in order: learning rate too high, an exploding gradient with no clipping, a log or divide of something that reached zero, and mixed precision overflowing in fp16.',
  },

  {
    g: 'ML from scratch',
    n: 'k-means',
    days: 'Day 3 (ML add-on)',
    trigger:
      '"Cluster these", "group similar items", or any unsupervised prompt where you must pick the number of groups.',
    lab: <LabKMeans />,
    idea: 'Two steps repeated: assign every point to its nearest centroid, then move every centroid to the mean of what it got. Each step can only decrease the total squared distance, so it always terminates — and for the same reason it can never climb out of a bad start.',
    invariant:
      'The objective (sum of squared distances to the assigned centroid) is non-increasing at every step. That guarantees termination but guarantees nothing about quality: it converges to a local minimum determined entirely by the initialisation.',
    cost: [
      ['One assign step', 'O(n · k · d)', 'the expensive half'],
      ['One update step', 'O(n · d)', '—'],
      ['Full run', 'O(iters · n · k · d)', 'O(n + k·d)'],
      ['k-means++ init', 'O(n · k · d)', 'worth it every time'],
    ],
    costHead: ['step', 'time', 'note'],
    code: `// assign: nearest centroid for every point
for (int i = 0; i < n; ++i) {
    int best = 0;
    double bd = 1e18;
    for (int c = 0; c < k; ++c) {
        double d = dist2(X[i], cent[c]);
        if (d < bd) { bd = d; best = c; }
    }
    assign[i] = best;
}
// update: centroid becomes the mean of its members
// repeat until no assignment changes`,
    codePy: `def kmeans(X, k, iters=100):
    cent = kmeans_plusplus(X, k)             # NOT random points
    assign = np.full(len(X), -1)
    for _ in range(iters):
        # assign — one broadcast, no Python loop
        d = ((X[:, None, :] - cent[None, :, :]) ** 2).sum(-1)
        new = d.argmin(1)
        if (new == assign).all():
            break                            # converged
        assign = new
        # update — mean of each cluster
        for i in range(k):
            pts = X[assign == i]
            if len(pts):                     # guard: a cluster can empty out
                cent[i] = pts.mean(0)
    return assign, cent

# picking k: the elbow of the objective, or silhouette score.
# "I would try k in 2..10 and look at both" is a fine answer.`,
    traps: [
      'Random initial points instead of k-means++. It converges to a visibly worse answer often enough that interviewers use it as the tell.',
      'Not handling an empty cluster. The mean of nothing is NaN and it poisons every subsequent step.',
      'Forgetting to standardise features first. k-means measures Euclidean distance, so a feature in dollars dominates one in years.',
      'Claiming it finds "the" clusters. It finds spherical, roughly equal-sized ones — say that before they ask.',
    ],
    probs: [
      'Implement k-means with k-means++ init',
      'Add the empty-cluster guard and explain when it fires',
      'Explain how you would choose k, and what the elbow actually shows',
    ],
    ml: 'Expect "why not use this for the recommendation candidate step?" — because cosine similarity on embeddings, plus an ANN index, gives you neighbours without forcing every item into exactly one bucket.',
  },

  {
    g: 'ML from scratch',
    n: 'Softmax and cross-entropy',
    days: 'Day 6 (ML add-on)',
    trigger:
      'Any classifier, any language model head, and every "why is my loss NaN" question.',
    lab: <LabSoftmax />,
    idea: 'Softmax turns unbounded scores into a distribution; cross-entropy scores that distribution against the truth. The pair is so common that every framework fuses them into one op — and knowing why they are fused (numerical stability) is the point of the question.',
    invariant:
      'Softmax is shift-invariant: subtracting any constant from every logit leaves the output unchanged. That is what lets you subtract the max for free, which caps the largest exponent at 1 and makes overflow impossible.',
    cost: [
      ['Softmax over C classes', 'O(C)', 'O(C)'],
      ['Cross-entropy', 'O(1) after softmax', 'reads one entry'],
      ['Gradient (fused)', 'O(C)', 'it is just p − y'],
      ['LM head, vocab 50k', 'O(50k) per token', 'the dominant matmul'],
    ],
    costHead: ['operation', 'time', 'space'],
    code: `// numerically stable softmax
double mx = *max_element(z.begin(), z.end());
double s = 0;
for (auto& v : z) { v = exp(v - mx); s += v; }
for (auto& v : z) v /= s;

double loss = -log(z[label]);

// the gradient of fused softmax + cross-entropy is beautifully simple:
//   dL/dz = p - onehot(label)
for (int c = 0; c < C; ++c) grad[c] = z[c] - (c == label);`,
    codePy: `def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)    # shift-invariant, stops overflow
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)

def cross_entropy(logits, y):
    p = softmax(logits)
    return -np.log(p[np.arange(len(y)), y]).mean()

# the gradient of the FUSED op is just p - onehot(y):
grad = softmax(logits)
grad[np.arange(len(y)), y] -= 1
grad /= len(y)

# in practice never write the pair yourself — the fused version keeps the
# log inside the exp and never materialises a probability near zero:
#   torch.nn.functional.cross_entropy(logits, y)   # takes LOGITS, not probs`,
    traps: [
      'Passing probabilities to a loss that expects logits. It runs, it trains badly, and nothing errors.',
      'Skipping the max subtraction. Fine on toy data, NaN the moment a logit reaches ~750.',
      'Softmax over the wrong axis. Check that your rows sum to 1, not your columns.',
      'Using softmax for a multi-label problem. Independent labels need per-class sigmoid plus binary cross-entropy.',
    ],
    probs: [
      'Implement stable softmax and cross-entropy in NumPy',
      'Derive dL/dz for the fused op and check it numerically',
      'Explain what temperature does to sampling, and what it does not',
    ],
    ml: 'Common follow-up: "your model is 95% accurate but the probabilities are all near 0.99 — is that a problem?" Yes, if anything downstream uses the score as a probability. That is calibration, and the fix is temperature scaling on a held-out set.',
  },

  {
    g: 'ML from scratch',
    n: 'Attention',
    days: 'Days 22–23 (ML add-on)',
    trigger:
      'Any transformer question, any "implement attention", and every LLM serving design round.',
    lab: <LabAttention />,
    idea: 'Every token asks every other token how relevant it is, softmaxes those scores into weights, and takes a weighted average of their values. Three matmuls and one softmax. The whole architecture is that, stacked, with the shape preserved so it can be stacked.',
    invariant:
      'After the softmax every row sums to 1, so each output is a convex combination of value vectors — it can never leave their span. The mask must be applied before the softmax, or the remaining weights do not renormalise and no longer sum to 1.',
    cost: [
      ['Scores Q · Kᵀ', 'O(n² · d)', 'O(n²) — the memory wall'],
      ['Softmax', 'O(n²)', 'in place'],
      ['Output w · V', 'O(n² · d)', 'O(n · d)'],
      ['With KV cache, per new token', 'O(n · d)', 'O(n · d) cache'],
      ['FlashAttention', 'same FLOPs', 'O(n) — never materialises n²'],
    ],
    costHead: ['stage', 'time', 'memory'],
    code: `// scaled dot-product attention, one head
auto scores = matmul_T(Q, K);            // n x n
scale(scores, 1.0 / sqrt(d));            // or softmax saturates
apply_causal_mask(scores);               // j > i becomes -inf
softmax_rows(scores);
auto out = matmul(scores, V);            // n x d_v

// multi-head: split d into h heads, run the above per head, concatenate,
// then one more linear. Same FLOPs, but each head can attend differently.`,
    codePy: `def attention(Q, K, V, mask=None):
    d = Q.shape[-1]
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d)   # (..., n, n)
    if mask is not None:
        scores = scores.masked_fill(mask, float('-inf'))   # BEFORE softmax
    w = scores.softmax(-1)                # each row sums to 1
    return w @ V, w

# causal mask: nothing may see the future
mask = torch.triu(torch.ones(n, n, dtype=torch.bool), diagonal=1)

# multi-head, in the shape everyone writes it:
#   (B, n, d) -> (B, h, n, d/h) -> attention -> (B, n, d) -> out_proj
Q = Q.view(B, n, h, d // h).transpose(1, 2)`,
    traps: [
      'Masking after the softmax. The zeros are right but the surviving weights no longer sum to 1.',
      'Masking with a large negative number instead of −inf. In fp16, −1e9 overflows and you get NaN.',
      'Forgetting the 1/√d. It trains anyway on toy dimensions, then stops working when you scale d.',
      'Quoting attention as O(n) because "each token attends once". It is O(n²) in both time and memory, and at 8k context that memory is the binding constraint.',
    ],
    probs: [
      'Implement scaled dot-product attention with a causal mask',
      'Extend it to multi-head and check the output shape',
      'Explain the KV cache: what is stored, what it saves, how big it gets',
    ],
    ml: 'The serving follow-up is where this pays: with a KV cache, generating token n costs O(n · d) instead of O(n² · d), but the cache itself is 2 · layers · heads · n · d_head floats per sequence — which is what actually limits your batch size on a GPU.',
  },

  {
    g: 'ML from scratch',
    n: 'Top-k retrieval',
    days: 'Days 20–21 (ML add-on)',
    trigger:
      '"Find the most similar", recommendation candidate generation, RAG retrieval, and any nearest-neighbour prompt.',
    lab: <LabTopK />,
    idea: 'Score candidates against a query and keep only the best k, using a min-heap of size k so the weakest kept item is always one comparison away. This is the DSA top-k pattern with embeddings substituted for numbers — which is exactly how to introduce it in an interview.',
    invariant:
      'The heap holds the k best items seen so far, and its root is the weakest of them. Any new item either beats the root and replaces it, or is discarded untouched — so the heap never grows past k regardless of how many items you stream through it.',
    cost: [
      ['Exact top-k over n items', 'O(n · d + n log k)', 'O(k)'],
      ['Sorting everything instead', 'O(n log n)', 'O(n) — do not'],
      ['ANN index (HNSW/IVF)', 'O(log n) approx', 'O(n · d) index'],
      ['Two-stage: ANN then rank', 'O(log n + m log k)', 'the real answer'],
    ],
    costHead: ['approach', 'time', 'space'],
    code: `// min-heap of size k: the root is the weakest thing you are keeping
priority_queue<pair<double,int>,
               vector<pair<double,int>>, greater<>> h;
for (int i = 0; i < n; ++i) {
    double s = cosine(q, item[i]);
    if ((int)h.size() < k) h.push({s, i});
    else if (s > h.top().first) { h.pop(); h.push({s, i}); }
}
// O(n log k), and you never sorted the n - k items you threw away`,
    codePy: `import heapq

def top_k(query, items, k):
    heap = []                                # MIN-heap of size k
    for i, vec in enumerate(items):
        s = cosine(query, vec)
        if len(heap) < k:
            heapq.heappush(heap, (s, i))
        elif s > heap[0][0]:                 # beat the weakest kept
            heapq.heapreplace(heap, (s, i))
    return sorted(heap, reverse=True)

# vectorised, when everything fits in memory:
sims = (M @ q) / (np.linalg.norm(M, axis=1) * np.linalg.norm(q))
idx = np.argpartition(-sims, k)[:k]          # O(n), not O(n log n)
idx = idx[np.argsort(-sims[idx])]            # then sort just those k

# normalise once up front and cosine becomes a plain dot product:
M = M / np.linalg.norm(M, axis=1, keepdims=True)`,
    traps: [
      'Using a max-heap of size n for top-k. It works and it wastes memory proportional to n instead of k.',
      'Recomputing vector norms inside the loop. Normalise the matrix once and cosine is a dot product.',
      'Forgetting a tiebreaker when pushing tuples. Two equal scores make Python compare the payloads, and it raises if they are not comparable.',
      'Presenting exact search as the design. At real scale it is ANN for candidates then exact ranking of a few hundred — say the two stages.',
    ],
    probs: [
      'Implement top-k with a size-k heap, then again with argpartition',
      'Explain recall@k and how you would measure your ANN index against exact search',
      'Design the two-stage retrieval path for a 100M-item catalogue',
    ],
    ml: 'The design follow-up is always recall: an ANN index trades exactness for latency, so you measure recall@k against a brute-force ground truth on a sample and pick the operating point. "I would tune it until recall@100 is above 0.95" is a much better answer than naming an index.',
  },
]
