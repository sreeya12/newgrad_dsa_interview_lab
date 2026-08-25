/*
 * ML breadth: the questions an MLE screen actually opens with.
 * Each one is a prompt you should be able to answer out loud in under a
 * minute. The answer is written the way you would say it, not the way a
 * textbook would print it — short, concrete, and with the number or the
 * failure mode that shows you have done it rather than read about it.
 */

export const BREADTH = [
  {
    sec: 'Framing a problem as ML',
    blurb:
      'Half the interview is deciding what to predict. Candidates who jump to a model architecture before naming the label lose here.',
    qs: [
      {
        q: 'A PM says "use ML to reduce customer churn." What do you ask before agreeing?',
        a: 'What action follows the prediction, and what is the label. If the only action is a discount email, the useful target is not "will churn" but "will this email change whether they churn" — an uplift problem, not a classification one. Then: what is the prediction horizon (churn within 30 days?), who is in the eligible population, and what does a false positive cost. A churn model nobody acts on is a dashboard.',
      },
      {
        q: 'When is a heuristic the right answer instead of a model?',
        a: 'When the rule captures most of the signal, the volume is too low to learn from, the cost of being wrong is high enough that you need to explain every decision, or you have no labels yet. Ship the heuristic, log its decisions, and you have both a baseline and a labelled dataset. Most successful ML systems started as a rule with logging.',
      },
      {
        q: 'How do you turn a ranking problem into a training objective?',
        a: 'Pointwise treats each item as an independent classification (did the user click) and is easiest to train and serve. Pairwise learns from a preference between two items and optimises something closer to ordering. Listwise scores a whole slate against a ranking metric like NDCG. Production ranking is usually pointwise for the first-stage retrieval and pairwise or listwise for the reranker, because the reranker sees few enough items to afford it.',
      },
      {
        q: 'What is the difference between the offline metric and the business metric, and why does it matter?',
        a: 'Offline metrics (AUC, NDCG, RMSE) are proxies computed on logged data. The business metric (revenue, retention, session length) is what the company cares about. They diverge whenever the model changes what data gets logged — a recommender that shows different items changes which items get feedback. This is why every serious team ships behind an A/B test even when the offline metric moved a lot.',
      },
      {
        q: 'Classification or regression for predicting delivery time?',
        a: 'Regression on the duration, but the loss matters more than the head. Squared error treats being 10 minutes early the same as 10 minutes late; users do not. Quantile regression on the 0.9 quantile gives you an ETA you beat 90% of the time, which is what a delivery promise actually needs. Naming the asymmetry is the whole answer.',
      },
      {
        q: 'You have no labels. What are your options?',
        a: 'Weak supervision (write labelling functions and combine them), heuristic labels from downstream behaviour (a return means the recommendation was wrong), a small hand-labelled seed plus active learning on the uncertain cases, transfer from a pretrained model with a lightly tuned head, or self-supervision on the raw data. Say which one you would try first and why, rather than listing all five.',
      },
    ],
  },

  {
    sec: 'Data and labels',
    blurb:
      'Everything downstream inherits the mistakes made here. This is the section where seniority shows.',
    qs: [
      {
        q: 'What is label leakage, and give a concrete example.',
        a: 'A feature that would not be available at prediction time, or that is derived from the label itself. Classic case: predicting fraud with a "chargeback_amount" column that is only populated after fraud is confirmed. Subtler case: a rolling average that includes the current event, so the feature for a transaction is computed from that transaction. Leakage shows up as an offline AUC that is suspiciously high and a production model that is worthless.',
      },
      {
        q: 'How do you split data when the observations are not independent?',
        a: 'Split along whatever axis the correlation runs on. Time series split by time, never at random. Multiple rows per user split by user. Medical images split by patient, not by image. If the same entity appears on both sides of the split, the model can memorise the entity and your validation number is fiction.',
      },
      {
        q: 'Your training set is 99.9% negatives. What do you do?',
        a: 'First: nothing to the data — check whether the metric is the problem. AUC-PR and calibration survive imbalance fine; accuracy does not. If the negative class is so large that training is slow, downsample negatives and correct the intercept afterward, or weight the loss. Do not blindly SMOTE tabular fraud data: it interpolates between real transactions and creates points that could not occur.',
      },
      {
        q: 'What is training/serving skew and how do you prevent it structurally?',
        a: 'The same feature computed differently in the training job and the serving path — a different default for nulls, a different time window, a stale lookup table. Prevent it by computing the feature once in shared code called by both paths, or by logging the exact feature vector at serving time and training on those logs. Comparing feature distributions between the two paths daily is the cheap detector.',
      },
      {
        q: 'How do you detect that your model has gone stale in production?',
        a: 'Three layers. Input drift: population stability index or a KS test on each feature versus the training distribution. Prediction drift: the score distribution shifting even when inputs look stable. Outcome drift: measured accuracy on labels as they arrive, which is the only one that actually proves degradation but arrives late. Alert on the first two, confirm with the third.',
      },
      {
        q: 'Why is a delayed label a design problem and not just an inconvenience?',
        a: 'If a chargeback can arrive 90 days after the transaction, then any dataset less than 90 days old has fraud mislabelled as legitimate. Training on it teaches the model that recent fraud is fine. You either wait out the maturity window and accept staleness, or model the label as censored and train on what is known so far.',
      },
      {
        q: 'A feature is highly predictive but you decide not to use it. When and why?',
        a: 'When it is a proxy for a protected attribute (zip code standing in for race), when it will not exist at serving time, when it comes from a source you cannot rely on, or when it creates a feedback loop — a recommender feature counting past impressions will simply amplify whatever it showed yesterday. Naming feedback loops unprompted is a strong signal.',
      },
    ],
  },

  {
    sec: 'Classical models',
    blurb:
      'Gradient-boosted trees still win on tabular data. Knowing exactly why is a differentiator.',
    qs: [
      {
        q: 'Why do gradient-boosted trees beat neural nets on tabular data?',
        a: 'Trees are invariant to monotone feature transforms, handle mixed scales and missing values natively, and split on the exact thresholds that matter rather than approximating them with smooth functions. Tabular data is mostly axis-aligned structure with no translation invariance to exploit, so the inductive bias of a neural net buys nothing. Neural nets win once you have high-cardinality categoricals worth embedding or a second modality to fuse.',
      },
      {
        q: 'Bagging versus boosting, in one breath each.',
        a: 'Bagging trains deep, high-variance trees independently on bootstrap samples and averages them: it reduces variance, parallelises perfectly, and is hard to overfit with more trees. Boosting trains shallow trees sequentially, each on the residual of the last: it reduces bias, is sensitive to the learning rate, and does overfit with too many rounds — which is why boosting needs early stopping and random forests do not.',
      },
      {
        q: 'What does regularisation actually do to a linear model?',
        a: 'L2 shrinks all coefficients toward zero proportionally, which stabilises the fit when features are correlated — it splits the weight across collinear features rather than picking one arbitrarily. L1 pushes coefficients to exactly zero because the gradient of the penalty does not vanish at the origin, giving you feature selection. Elastic net is the compromise when you have correlated groups you want selected together.',
      },
      {
        q: 'When is logistic regression the right production model?',
        a: 'When you need calibrated probabilities out of the box, when you have to explain each decision to a regulator, when the feature count is huge and sparse (text bag-of-words, ad IDs), when retraining must be cheap and online, or when the baseline needs to ship this week. A well-featurised logistic regression is a serious competitor, not a strawman.',
      },
      {
        q: 'What is calibration, and how do you fix a miscalibrated model?',
        a: 'A model is calibrated if among all cases scored 0.7, about 70% are positive. Boosted trees and neural nets with modern training are usually overconfident. Fix with Platt scaling (fit a logistic on the scores) or isotonic regression (a monotone step function, needs more data but assumes less) — always fit on a held-out set, never on training scores. It matters whenever the score feeds a threshold with a real cost attached.',
      },
      {
        q: 'Explain the bias-variance decomposition without the equations.',
        a: 'Bias is the error you would still have with infinite data because your model class cannot express the truth. Variance is how much your fitted model would change if you resampled the training set. More capacity trades bias for variance; regularisation and more data trade the other way. The practical use is diagnostic: high training error means bias, a large train/validation gap means variance, and they need opposite fixes.',
      },
    ],
  },

  {
    sec: 'Training and optimisation',
    blurb:
      'The questions here are mostly "your loss did something weird, what happened".',
    qs: [
      {
        q: 'Your training loss is NaN at step 400. Walk through the diagnosis.',
        a: 'Check the learning rate first — divergence is the common cause and shows as loss climbing before it goes NaN. Then look for a log or divide with a zero argument (log of a softmax output that underflowed, a division by a batch count that can be zero). Then mixed precision: fp16 overflows around 65k, so check whether the loss scaler is on. Then bad data: a single infinite or absurd feature value. Reproduce by training on the one batch that broke it.',
      },
      {
        q: 'Why does batch normalisation behave differently at training and inference?',
        a: 'At training it normalises with the statistics of the current batch and updates a running average. At inference it uses the running average, because a single request has no batch to compute statistics from. This is why batch norm breaks with batch size 1 or 2, why it interacts badly with distributed training unless you sync it, and why layer norm — which normalises across features within one example — is what transformers use.',
      },
      {
        q: 'What does the learning-rate warmup actually fix?',
        a: 'Early in training the adaptive optimiser has almost no history, so Adam\'s second-moment estimate is tiny and its effective step is enormous. Warmup keeps those first steps small until the estimates settle. It matters most with large batches and with transformers, where a bad first few hundred steps can put the model in a region it never recovers from.',
      },
      {
        q: 'Adam versus SGD with momentum — when do you pick which?',
        a: 'Adam converges fast with little tuning and handles sparse or badly scaled gradients, so it is the default for transformers, embeddings, and anything with wildly different gradient magnitudes per parameter. SGD with momentum plus a cosine schedule often generalises slightly better on vision convnets and is what large-scale image training still uses. AdamW — decoupling weight decay from the adaptive step — is the one you actually want when you say Adam.',
      },
      {
        q: 'You doubled the batch size. What else must change?',
        a: 'Scale the learning rate — linearly is the usual rule, square-root for some setups — and lengthen the warmup. Fewer steps per epoch means fewer optimiser updates, so wall-clock gains do not automatically mean faster convergence. Also recheck batch norm behaviour and any per-batch loss normalisation.',
      },
      {
        q: 'How do you train a model that does not fit on one GPU?',
        a: 'In order of complexity: gradient accumulation (a big effective batch out of small ones, no extra memory for activations), gradient checkpointing (recompute activations in the backward pass, roughly 30% slower for a large memory win), mixed precision, then sharding — ZeRO/FSDP splits optimiser state, gradients, and parameters across devices. Pipeline and tensor parallelism come last because they change the model code, not just the training loop.',
      },
      {
        q: 'What is the actual point of dropout, and why is it rare in transformers now?',
        a: 'Dropout is an ensemble over subnetworks and a strong regulariser when data is scarce relative to parameters. Large language models train on so much data, for so few epochs, that overfitting is not the binding constraint — so dropout mostly costs compute. It comes back for fine-tuning on small datasets, where overfitting is the whole problem again.',
      },
    ],
  },

  {
    sec: 'Deep learning and architectures',
    blurb:
      'You need to be able to draw attention on a whiteboard and say what each shape is.',
    qs: [
      {
        q: 'Write out scaled dot-product attention and justify every term.',
        a: 'softmax(QKᵀ / √d) V. QKᵀ is every query scored against every key, an n×n matrix — that is the quadratic cost. Dividing by √d keeps the dot products from growing with dimension, which would push the softmax into a saturated regime with vanishing gradients. Softmax turns each row into a distribution over positions. Multiplying by V takes the weighted average of the value vectors, so the output has the same sequence length and the value dimension.',
      },
      {
        q: 'Why multiple heads instead of one big attention?',
        a: 'One softmax produces one distribution per position, so a single head has to commit to one relationship — it cannot attend to the syntactic subject and the topic at the same time. Splitting the width into h heads gives h independent attention patterns at the same total cost, and the concatenation is projected back to the model width. Empirically different heads specialise, and pruning shows many are redundant.',
      },
      {
        q: 'What does a residual connection do for the gradient?',
        a: 'It gives the gradient an identity path back to earlier layers, so the derivative through a block is 1 plus the block\'s own derivative rather than a product of small numbers. That is what makes 100-layer networks trainable. It also means an untrained block starts near the identity, so adding depth does not immediately hurt.',
      },
      {
        q: 'Why does a transformer need positional encoding at all?',
        a: 'Attention is a weighted sum over positions and is permutation-equivariant: shuffle the tokens and the outputs shuffle with them, unchanged. Without position information "dog bites man" and "man bites dog" produce the same set of representations. Learned absolute embeddings were the original answer; RoPE, which rotates queries and keys by an angle proportional to position, is what most current models use because it makes relative position fall out of the dot product and extrapolates better.',
      },
      {
        q: 'What is the KV cache and what does it cost?',
        a: 'During autoregressive generation, the keys and values for previous tokens do not change, so you store them and only compute Q, K, V for the new token — turning each step from O(n²) into O(n). The cost is memory: 2 × layers × heads × head_dim × sequence_length × bytes per token, per sequence in the batch. At long context this dominates GPU memory and caps your batch size, which is why grouped-query attention and paged attention exist.',
      },
      {
        q: 'Encoder, decoder, or encoder-decoder — how do you choose?',
        a: 'Encoder-only (BERT-style, bidirectional, no causal mask) for classification, retrieval embeddings, and anything where you see the whole input at once. Decoder-only (GPT-style, causal mask) for generation and, in practice, for almost everything now because scale plus prompting subsumes the rest. Encoder-decoder (T5) when input and output are genuinely different sequences and cross-attention helps: translation, summarisation of a fixed document.',
      },
      {
        q: 'Why do convolutions still exist given attention works?',
        a: 'A convolution hardcodes locality and translation invariance, which is exactly right for images and costs O(n) instead of O(n²). Attention must learn that structure from data, so vision transformers need far more data or heavy augmentation to match a convnet. In practice the winning image models are hybrids: convolutional stems for early local features, attention for global mixing.',
      },
    ],
  },

  {
    sec: 'LLMs, embeddings and RAG',
    blurb:
      'Every MLE loop in 2026 has one of these. Vague answers here are very visible.',
    qs: [
      {
        q: 'What is the difference between fine-tuning, LoRA, and prompting — and when is each right?',
        a: 'Prompting changes nothing and iterates in seconds; use it until it demonstrably fails. LoRA freezes the base weights and learns low-rank updates to the attention projections — around 1% of the parameters, so it trains on one GPU and you can hot-swap adapters per customer. Full fine-tuning updates everything, needs optimiser state for every parameter, and is worth it only for a large domain shift with a lot of data. Order of attempt: prompt, then retrieve, then LoRA, then full.',
      },
      {
        q: 'Your RAG system returns confident nonsense. Where do you look?',
        a: 'Separate retrieval failure from generation failure by checking whether the correct passage was in the retrieved set at all. If it was not, the problem is chunking (context split across a boundary), the embedding model (domain vocabulary it never saw), or the query (a user question that looks nothing like the answer text — fix with query rewriting or hypothetical document embeddings). If it was retrieved and the model still made something up, the prompt is not constraining it to the context and needs explicit grounding plus a citation requirement.',
      },
      {
        q: 'How do you chunk documents, and why is it not obvious?',
        a: 'Fixed-size chunks with overlap are the baseline. The failure is that the answer straddles a boundary or that a chunk loses the heading that made it interpretable. Better: split on structure (sections, paragraphs), keep a parent-document pointer so you can retrieve the small chunk but pass the larger parent to the model, and prepend the document title and section path to each chunk before embedding. Chunk size trades retrieval precision against context sufficiency.',
      },
      {
        q: 'Dense retrieval or BM25?',
        a: 'BM25 matches exact terms and is unbeatable on rare tokens — error codes, product SKUs, surnames — with no training and cheap updates. Dense embeddings match meaning and handle paraphrase. Their failures are uncorrelated, so hybrid with reciprocal rank fusion beats either, and a cross-encoder reranker over the top 50 beats the hybrid. That three-stage shape (cheap recall, fusion, expensive rerank) is the answer to most retrieval design questions.',
      },
      {
        q: 'Why is a cross-encoder more accurate than a bi-encoder, and why can you not just use it everywhere?',
        a: 'A bi-encoder embeds query and document separately, so documents are precomputed and search is an ANN lookup — but the two never interact until a dot product at the end. A cross-encoder feeds query and document through the model together, so every query token attends to every document token, which is far more accurate. It also means one forward pass per candidate at query time, so it cannot score millions. Use it as a reranker over a few dozen.',
      },
      {
        q: 'How do you evaluate an LLM feature when there is no single right answer?',
        a: 'Build a fixed eval set of real inputs early — a few hundred is enough to detect regressions. Layer the metrics: deterministic checks for anything checkable (valid JSON, citation exists in the context, no PII), an LLM judge with a rubric and a fixed reference for the subjective part, and a human-labelled slice you trust to audit the judge. Never let the judge be the same model version you are evaluating without checking it against humans first.',
      },
      {
        q: 'A model serves fine at low traffic and falls over under load. What is the fix?',
        a: 'Continuous (in-flight) batching: instead of waiting for a whole batch to finish, evict finished sequences and admit new ones every step, which keeps the GPU saturated when generations have wildly different lengths. Then paged attention so KV cache memory is not fragmented into unusable holes, quantisation to fit more concurrent sequences, and separating prefill from decode because they are compute-bound and memory-bound respectively.',
      },
      {
        q: 'What is speculative decoding?',
        a: 'A small draft model generates several tokens ahead; the large model verifies them in one forward pass, since scoring k tokens costs about the same as generating one when you are memory-bound. Accepted tokens are kept, the first rejection resets. It is exact — the output distribution matches the large model — and typically gives 2 to 3× on latency, with the gain depending on how often the draft agrees.',
      },
    ],
  },

  {
    sec: 'Evaluation and experimentation',
    blurb:
      'The number that decides whether your model ships. Get the metric wrong and the rest of the work is decoration.',
    qs: [
      {
        q: 'Precision, recall, F1, AUC-ROC, AUC-PR — which one and when?',
        a: 'Precision when a false positive is expensive (blocking a legitimate transaction). Recall when a false negative is expensive (missing a tumour). F1 only when you genuinely weight them equally, which is rarer than its popularity suggests. AUC-ROC summarises ranking across all thresholds but is optimistic under heavy imbalance because the huge negative class makes the false-positive rate move slowly. AUC-PR is the honest one at 1-in-10,000 base rates.',
      },
      {
        q: 'Explain NDCG as if to a PM.',
        a: 'It scores a ranked list by how much relevance you put near the top. Each result contributes its relevance divided by the log of its position, so position 1 is worth much more than position 10 — matching the fact that people rarely scroll. Dividing by the best possible arrangement normalises it to 0–1 so lists of different lengths compare. It is the standard ranking metric because it handles graded relevance, not just click/no-click.',
      },
      {
        q: 'Your A/B test shows +0.3% with p = 0.04. Do you ship?',
        a: 'Not on that alone. Ask how many metrics and slices were tested — one significant result out of twenty is what you would expect by chance. Ask whether the effect size clears the minimum you predeclared as worth the complexity. Check for novelty effects by looking at the trend over the test window, and check whether the result holds in the major segments. Then check the guardrails: latency, error rate, and the metrics you did not want to move.',
      },
      {
        q: 'What breaks the independence assumption in an A/B test, and what do you do about it?',
        a: 'Network effects (a social feature changes the experience of users in the control group), marketplace effects (a ranking change moves supply that both arms share), and repeat exposure of the same user. Fixes: randomise at the cluster level (city, social community) rather than the user, use switchback tests that alternate arms over time windows in a marketplace, and always randomise consistently on a stable ID so a user does not switch arms mid-session.',
      },
      {
        q: 'How do you evaluate a ranking model offline when you only logged what the old model showed?',
        a: 'You have a biased sample — items the old model never showed have no feedback. Counterfactual estimators (inverse propensity scoring) reweight logged outcomes by the probability the old policy showed that item, which needs those propensities logged at serving time. Cheaper and very common: reserve a small random-traffic slice as an unbiased holdout. Say the words "position bias" — the top slot gets clicks partly because it is the top slot.',
      },
      {
        q: 'What is a guardrail metric and why does every launch need one?',
        a: 'A metric you do not expect to improve but refuse to let degrade — p99 latency, crash rate, unsubscribes, support tickets. It exists because optimising a single objective reliably finds a shortcut that damages something unmeasured: a model that boosts engagement by promoting outrage, or a recall improvement that doubles inference cost. Predeclare the threshold that blocks the launch.',
      },
    ],
  },

  {
    sec: 'Production and serving',
    blurb:
      'What separates someone who has run a model from someone who has trained one.',
    qs: [
      {
        q: 'What does a feature store actually solve?',
        a: 'One definition of each feature, used by both the training job and the serving path, so skew cannot creep in. Point-in-time correct joins for training, so a feature is computed from data available at that moment rather than from today\'s table. A low-latency online store for serving and a large offline store for training, kept consistent. Plus reuse and lineage across teams. If you have one model and one feature pipeline, you do not need one.',
      },
      {
        q: 'How do you roll out a new model version safely?',
        a: 'Shadow first: serve the old model, run the new one on the same traffic, log both, compare distributions and latency with no user impact. Then a small percentage canary with automatic rollback wired to the guardrails. Then ramp. Keep the previous version loadable for an instant rollback, and version the model together with the feature code that feeds it — rolling back a model onto new features is its own outage.',
      },
      {
        q: 'Where does latency actually go in a serving path, and how do you cut it?',
        a: 'Usually feature fetching, not the model. Measure before optimising: network hops to the feature store, deserialisation, the forward pass, and post-processing. Fixes in order of payoff: cache and batch feature lookups, precompute anything that does not depend on the request, use a cheap first-stage model to shrink the candidate set, quantise or distil the expensive model, then dynamic batching on the GPU. Report p99, not the mean — the mean hides exactly the requests that annoy users.',
      },
      {
        q: 'Batch or real-time inference?',
        a: 'Batch when the input does not depend on the current request and the prediction stays valid for hours — daily churn scores, nightly recommendations, precomputed embeddings. Real-time when the request carries information the prediction needs (the search query, the transaction) or freshness is the product. The hybrid is standard: precompute embeddings and candidate sets in batch, do the light ranking at request time.',
      },
      {
        q: 'How do you monitor a model that has no immediate labels?',
        a: 'Watch the things you can see now: input feature distributions against training, prediction distribution over time, the rate of fallback to the default path, feature null rates, and latency. Add a small hand-labelled sample reviewed weekly. Set the alert on the derivative — a feature whose null rate jumps from 1% to 20% overnight is an upstream schema change, and you will know days before the accuracy metric does.',
      },
      {
        q: 'What is model distillation and when is it worth the effort?',
        a: 'Train a small student to match the large teacher\'s output distribution rather than the hard labels — the soft probabilities carry information about which classes are similar, so the student learns more per example than it would from the labels alone. Worth it when the large model works but cannot meet a latency or cost budget, and when you have a lot of unlabelled data to push through the teacher. It is the standard answer to "great, now make it 10× cheaper".',
      },
      {
        q: 'A model that was fine for months suddenly gets worse. Name four causes.',
        a: 'An upstream schema or pipeline change silently nulling a feature. Real distribution shift (a new user segment, a competitor\'s promotion, a season). A feedback loop where the model\'s own output became its training data. And an adversary adapting — in fraud and spam, degradation is not drift, it is someone reading your decisions and moving around them.',
      },
    ],
  },
]
