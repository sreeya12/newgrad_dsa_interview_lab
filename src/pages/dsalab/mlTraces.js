/* Traces for the ML lab modules. Frames carry an explicit `ln`, and the two
   listings are line-aligned so one mapping serves both languages.
   The Python side is NumPy, because that is what you would actually write;
   the C++ side is plain loops, because that is what the maths says. */

const byLn = (f) => f.ln

export const ML_TRACES = {
  gradient: {
    py: {
      code: `x = 4.0                               # wherever you initialised
for step in range(epochs):
    g = 2 * x                         # df/dx for f(x) = x^2 + 1
    x -= lr * g                       # move AGAINST the gradient
    if abs(g) < tol: break

return x`,
      line: byLn,
    },
    cpp: {
      code: `double x = 4.0;                       // wherever you initialised
for (int step = 0; step < epochs; ++step) {
    double g = 2 * x;                 // df/dx for f(x) = x^2 + 1
    x -= lr * g;                      // move AGAINST the gradient
    if (fabs(g) < tol) break;
}
return x;`,
      line: byLn,
    },
  },

  kmeans: {
    py: {
      code: `cent = init_centroids(X, k)           # k-means++ in anything real
for _ in range(max_iter):
    # assign: nearest centroid for every point   O(n * k * d)
    d = ((X[:, None, :] - cent[None, :, :]) ** 2).sum(-1)
    new = d.argmin(1)
    if (new == assign).all(): break   # nothing moved: converged
    assign = new
    # update: centroid becomes the mean of what it got
    cent = np.array([X[assign == i].mean(0) for i in range(k)])

return assign, cent`,
      line: byLn,
    },
    cpp: {
      code: `auto cent = init_centroids(X, k);     // k-means++ in anything real
for (int it = 0; it < max_iter; ++it) {
    // assign: nearest centroid for every point   O(n * k * d)
    bool changed = false;
    for (int i = 0; i < n; ++i) {
        int best = argmin_dist(X[i], cent);
        if (best != assign[i]) { assign[i] = best; changed = true; }
    }
    if (!changed) break;              // nothing moved: converged
    recompute_means(cent, X, assign); // centroid = mean of what it got
}
return assign;`,
      line: byLn,
    },
  },

  softmax: {
    py: {
      code: `z = logits / temperature
z = z - z.max()                       # shift-invariant, and stops overflow
e = np.exp(z)
p = e / e.sum()                       # now positive and summing to 1

loss = -np.log(p[true_label])         # cross-entropy looks at ONE entry
# in practice: F.cross_entropy(logits, y) fuses all of this and stays stable`,
      line: byLn,
    },
    cpp: {
      code: `for (auto& v : z) v /= temperature;
double mx = *max_element(z.begin(), z.end());   // stops overflow
for (auto& v : z) v = exp(v - mx);
double s = accumulate(z.begin(), z.end(), 0.0);
for (auto& v : z) v /= s;             // now positive and summing to 1

double loss = -log(z[true_label]);    // cross-entropy looks at ONE entry`,
      line: byLn,
    },
  },

  attention: {
    py: {
      code: `d = Q.shape[-1]
scores = Q @ K.T                      # n x n — this is the quadratic term
scores = scores / math.sqrt(d)        # or softmax saturates as d grows
scores = scores.masked_fill(mask, float('-inf'))   # BEFORE the softmax
# encoder: no mask at all
w = scores.softmax(dim=-1)            # each row sums to 1
out = w @ V                           # n x d_v, same length as the input
return out`,
      line: byLn,
    },
    cpp: {
      code: `int d = dim(Q);
auto scores = matmul_T(Q, K);         // n x n — this is the quadratic term
scale(scores, 1.0 / sqrt(d));         // or softmax saturates as d grows
apply_causal_mask(scores);            // set j > i to -inf, BEFORE softmax
// encoder: no mask at all
softmax_rows(scores);                 // each row sums to 1
auto out = matmul(scores, V);         // n x d_v, same length as the input
return out;`,
      line: byLn,
    },
  },

  topk: {
    py: {
      code: `import heapq
heap = []                             # MIN-heap of size k
for name, vec in items:
    s = cosine(query, vec)
    if len(heap) < k:
        heapq.heappush(heap, (s, name))
    elif s > heap[0][0]:              # beat the weakest kept item
        heapq.heapreplace(heap, (s, name))
return sorted(heap, reverse=True)     # O(n log k), never O(n log n)`,
      line: byLn,
    },
    cpp: {
      code: `priority_queue<pair<double,string>,
               vector<pair<double,string>>,
               greater<>> heap;       // MIN-heap of size k
for (auto& [name, vec] : items) {
    double s = cosine(query, vec);
    if ((int)heap.size() < k) heap.push({s, name});
    else if (s > heap.top().first) {  // beat the weakest kept item
        heap.pop(); heap.push({s, name});
    }
}
// drain into a vector and reverse: O(n log k), never O(n log n)`,
      line: byLn,
    },
  },
}
