/*
 * ML system design: the nine-step script, and six cases worked end to end.
 *
 * The script is what you say. The cases are what you say it about. Every
 * case is written in the same order as the script so you can practise by
 * covering the answers and talking through the steps yourself.
 */

export const SCRIPT = [
  {
    n: 1,
    t: 'Scope, out loud',
    min: '0–5',
    say: 'Restate the problem, name the user and the surface, and ask what action the prediction drives. Establish scale with three numbers: users, requests per second at peak, and items in the corpus. Ask for the latency budget and whether this is a new system or a replacement.',
    watch:
      'Do not start listing features. Interviewers score this step on whether you found the constraint that makes the problem hard.',
  },
  {
    n: 2,
    t: 'Name the ML problem',
    min: '5–9',
    say: 'Convert the product ask into a target: what exactly is predicted, for what entity, over what horizon. Say the label out loud and where it comes from. If there is a non-ML baseline that captures most of the value, say so — it is the thing your model must beat.',
    watch:
      'The single most common failure is designing a system before naming the label. If you cannot say where the label comes from, you do not have a problem yet.',
  },
  {
    n: 3,
    t: 'Pick the metrics',
    min: '9–13',
    say: 'One offline metric to train and select on, one online metric that decides whether it ships, and at least one guardrail you refuse to degrade. Say why the offline metric is a reasonable proxy for the online one, and where they would diverge.',
    watch:
      'Bring up the proxy gap yourself. Engagement optimisation that damages retention is the standard trap and interviewers wait for you to notice it.',
  },
  {
    n: 4,
    t: 'Data and labels',
    min: '13–19',
    say: 'Where the training data comes from, how much of it there is, how the label is derived, how long the label takes to arrive, and how you split. Then say what could leak and how the split prevents it.',
    watch:
      'Say "point in time" and mean it: every feature must be computable from what was known at the moment of prediction.',
  },
  {
    n: 5,
    t: 'Features',
    min: '19–25',
    say: 'Group them rather than listing: entity features, counterparty features, interaction history, context (time, device, location), and derived aggregates with their windows. Name which are precomputed and which need request-time computation.',
    watch:
      'For each aggregate, say the window and say where it is computed. This is where training/serving skew gets designed out or designed in.',
  },
  {
    n: 6,
    t: 'Model, with a baseline',
    min: '25–31',
    say: 'Start with the simplest thing that could work and say what it would get you. Then the model you would actually build and the specific reason it beats the baseline. Give the architecture only at the level of detail the problem needs.',
    watch:
      'Proposing a transformer for a problem with 40 tabular features reads as inexperience. Gradient-boosted trees are frequently the right answer and saying so is a strength.',
  },
  {
    n: 7,
    t: 'Draw the serving path',
    min: '31–39',
    say: 'Request in, response out, every hop labelled with its latency. Show the multi-stage funnel if there is one: cheap retrieval over millions, a reranker over hundreds, business rules at the end. Say where the features come from at request time and what happens when that store is down.',
    watch:
      'The fallback path is worth as much as the model. "If the feature store times out at 20ms we serve the popularity baseline" is a senior answer.',
  },
  {
    n: 8,
    t: 'Training and refresh',
    min: '39–44',
    say: 'How often you retrain and what triggers it, how a new model is validated, how it rolls out (shadow, canary, ramp), and how you roll back. Say how model version and feature version are pinned together.',
    watch:
      'Retraining cadence should follow from how fast the data drifts, not from a habit. Fraud is daily; ETA is weekly; a document classifier might be quarterly.',
  },
  {
    n: 9,
    t: 'Failure modes and iteration',
    min: '44–50',
    say: 'Volunteer three ways this system degrades and how you would detect each. Then name the next two things you would build if this shipped and worked.',
    watch:
      'Ending on feedback loops, cold start, and adversaries — before being asked — is what separates a pass from a strong hire.',
  },
]

export const CASES = [
  {
    id: 'feed',
    name: 'Recommendation feed',
    prompt: 'Design the home feed for a short-video app.',
    scale: [
      ['users', '200M monthly, 80M daily'],
      ['corpus', '500M videos, 5M new per day'],
      ['traffic', '~50k feed requests/sec at peak'],
      ['budget', '150ms p99 for the whole feed'],
    ],
    blocks: [
      {
        k: 'Frame it',
        v: 'The action is "what 10 videos go in the next page of the feed". That makes it ranking, not classification, and it is a slate — the items are chosen together, so diversity is part of the objective rather than an afterthought.',
      },
      {
        k: 'Label',
        v: 'Not the click. A click on a thumbnail is noisy and rewards clickbait. Use a weighted engagement label: completed watch, watch time over video length, like, share, follow — with negative weight on skips under 2 seconds and on "not interested". Say the weights are a product decision you would tune, not a constant you invented.',
      },
      {
        k: 'Metrics',
        v: 'Offline: NDCG on the weighted label, plus AUC per objective head. Online: daily watch time per active user and next-day return rate. Guardrails: p99 latency, share of impressions from creators outside the top 1%, and reported-content rate. Watch time alone drives the system toward long, low-quality video.',
      },
      {
        k: 'Features',
        v: 'User: long-term interest embedding, recent 50 interactions as a sequence, demographics, device. Video: creator embedding, audio and visual embeddings, topic, age since upload, aggregate engagement rate. Cross: has the user watched this creator, cosine between user and video embedding. Context: hour, session position, connection speed.',
      },
      {
        k: 'Model',
        v: 'Two stages. Retrieval: a two-tower model — user tower and item tower trained with in-batch negatives and sampled softmax — so item vectors are precomputed and the query is an ANN lookup over HNSW. Ranking: a multi-task network with shared bottom layers and one head per objective (watch, like, share, skip), combined at serving with the product weights. Multi-task because the objectives share structure and the rare ones (share) would not train alone.',
      },
      {
        k: 'Serving',
        v: '500M → retrieval from several sources in parallel (ANN over embeddings, followed creators, trending, fresh-content pool) → ~1000 candidates → light filter for already-seen and blocked → ranker scores ~500 → diversity pass (no more than 2 per creator, cap per topic) → 10 items. Embeddings and item features precomputed nightly and refreshed for new uploads within minutes; user sequence features assembled at request time from an online store.',
      },
      {
        k: 'Training',
        v: 'Ranker retrained daily on the last 30 days of logged impressions with their labels; retrieval towers weekly. Item embeddings recomputed for anything uploaded since the last run. Shadow the new ranker for a day, canary at 1%, ramp over a week.',
      },
      {
        k: 'What goes wrong',
        v: 'Feedback loop: the model only ever sees feedback on what it showed, so its own bias compounds. Mitigate with a small fraction of randomised exploration traffic, logged propensities, and an explicit fresh-content pool. Cold start for new videos: rely on content embeddings and creator priors until enough impressions accumulate, and reserve a guaranteed impression budget for new uploads. Popularity collapse: without a diversity pass the feed converges on the same few creators for everyone.',
      },
    ],
  },

  {
    id: 'search',
    name: 'Search ranking',
    prompt: 'Design search for a large e-commerce catalogue.',
    scale: [
      ['corpus', '300M listings'],
      ['traffic', '20k queries/sec at peak'],
      ['tail', '40% of queries seen fewer than 5 times'],
      ['budget', '200ms p99 end to end'],
    ],
    blocks: [
      {
        k: 'Frame it',
        v: 'Ranking with a hard relevance constraint: unlike a feed, showing something irrelevant is a visible failure, not just a wasted slot. The head of the query distribution can be memorised; the tail cannot, and the tail is where the money leaks.',
      },
      {
        k: 'Label',
        v: 'A graded label from the funnel: purchase > add to cart > click with long dwell > click > impression. Purchases are sparse and biased toward cheap items, so train on the graded target rather than purchase alone. Correct for position bias — clicks at rank 1 are inflated — by learning a position prior and dropping the position feature at inference.',
      },
      {
        k: 'Metrics',
        v: 'Offline: NDCG@10 on the graded label plus a human-rated relevance set of a few thousand query/item pairs, which is the only thing that catches "engaging but wrong". Online: purchases per search session and search abandonment rate. Guardrails: p99 latency, zero-result rate, and relevance on the human set — it must not regress even if clicks go up.',
      },
      {
        k: 'Features',
        v: 'Text match: BM25 on title, description, and category; exact-match flags for model numbers and brands. Semantic: query and item embedding cosine. Item: price relative to category median, rating, review count, sales velocity, seller quality, image quality, in-stock. Query: length, category intent classifier, ambiguity signal. Personal: user\'s past category and price affinity — kept light so results stay explainable.',
      },
      {
        k: 'Model',
        v: 'Three stages. Retrieval: hybrid — BM25 (crucial for the tail and for exact SKUs) fused with dense ANN retrieval via reciprocal rank fusion, giving ~1000 candidates. Ranking: LambdaMART / gradient-boosted trees on a few hundred features. Trees, not a neural net: the features are tabular, mostly monotone, and the model must be debuggable when a merchant asks why their listing dropped. Rerank: a cross-encoder over the top 50 for relevance on the tail, where lexical overlap is weakest.',
      },
      {
        k: 'Serving',
        v: 'Query → spell correction and query understanding (category intent, brand and attribute extraction) → parallel BM25 and ANN retrieval → fusion → filter on availability and shipping region → GBDT scores 1000 in ~15ms → cross-encoder on top 50 in ~30ms → business rules (sponsored slots, seller diversity) → 24 results. Head queries cached whole with a short TTL, which is a large fraction of traffic for almost no work.',
      },
      {
        k: 'Training',
        v: 'Weekly full retrain of the ranker on the last 90 days of judged sessions; the cross-encoder monthly. Index updates continuously — a listing going out of stock must leave the results in seconds, so availability is a filter applied at query time, never a feature baked into the index.',
      },
      {
        k: 'What goes wrong',
        v: 'Position bias baked into training makes the model learn to reproduce yesterday\'s ranking. Seller manipulation: keyword stuffing in titles and review farming, which is an adversarial loop that needs its own detection. Seasonal drift: a query like "boots" means something different in July. And the tail — where a purely behavioural model has no signal, so lexical and semantic matching have to carry it.',
      },
    ],
  },

  {
    id: 'ctr',
    name: 'Ads click-through prediction',
    prompt: 'Design CTR prediction for an ad auction.',
    scale: [
      ['traffic', '1M auction requests/sec'],
      ['features', 'billions of sparse IDs'],
      ['base rate', '~1% CTR'],
      ['budget', '10ms for the whole auction'],
    ],
    blocks: [
      {
        k: 'Frame it',
        v: 'This is not a ranking problem, it is a calibration problem. The predicted probability is multiplied by the bid to decide the auction and the price charged, so being systematically 20% high costs real money even when the ranking is perfect. Say that in the first minute.',
      },
      {
        k: 'Label',
        v: 'Click within an attribution window after an impression. Impressions are logged at serving with the exact feature vector, so training data is generated by the system itself — no offline join, no skew. Conversion labels arrive much later and feed a separate model in the same stack.',
      },
      {
        k: 'Metrics',
        v: 'Offline: log loss, and calibration measured as predicted-over-actual by decile — AUC alone is not enough because it is invariant to monotone rescaling, which is exactly the error that matters here. Online: revenue per thousand requests. Guardrails: p99 latency, advertiser-level delivery fairness, and the fraction of budget spent by small advertisers.',
      },
      {
        k: 'Features',
        v: 'Sparse IDs dominate: ad ID, campaign, advertiser, creative, user ID, publisher, placement, and crosses of these. Dense: historical CTR at several aggregation levels with smoothing toward the parent (an ad with 3 impressions should inherit its campaign\'s rate), recency, hour of day, device. Position is a feature at training and fixed at inference.',
      },
      {
        k: 'Model',
        v: 'Embeddings for the sparse IDs feeding a modest MLP — the Wide-and-Deep shape, where the wide part memorises specific ID crosses and the deep part generalises to unseen ones. Trained online or near-online with FTRL or a streaming variant, because a campaign launched an hour ago must get a reasonable estimate. The embedding table is the whole system: hundreds of gigabytes, sharded across parameter servers, with hashing and frequency cutoffs for the long tail.',
      },
      {
        k: 'Serving',
        v: 'Request → candidate ads from targeting filters (a fast inverted index, not a model) → a few hundred candidates → embedding lookups from a sharded in-memory store → one batched forward pass → predicted CTR × bid = expected value → auction and second-price billing. The entire path is single-digit milliseconds, so the model is small on purpose. Any candidate whose embedding lookup misses falls back to the campaign-level smoothed rate.',
      },
      {
        k: 'Training',
        v: 'Continuous. Impressions stream into the trainer within minutes and the model updates incrementally, with a full retrain periodically to reset accumulated drift. Two calibration layers: a global one, and per-slice corrections for large publishers whose traffic is unlike the average.',
      },
      {
        k: 'What goes wrong',
        v: 'Delayed feedback: an impression with no click yet is not necessarily a negative, and treating it as one biases the model downward — model the delay explicitly. Cold-start advertisers get no impressions because they have no estimate and get no estimate because they have no impressions, which needs explicit exploration budget. Click fraud shifts the label distribution. And the auction is a feedback loop: the model decides what gets shown, so it only ever learns about ads it already likes.',
      },
    ],
  },

  {
    id: 'fraud',
    name: 'Payment fraud detection',
    prompt: 'Design real-time fraud detection for a payments platform.',
    scale: [
      ['traffic', '10k transactions/sec'],
      ['base rate', '~0.1% fraudulent'],
      ['budget', '50ms, in the payment path'],
      ['label delay', 'chargebacks up to 90 days'],
    ],
    blocks: [
      {
        k: 'Frame it',
        v: 'Adversarial, extremely imbalanced, delayed-label, and in the critical path of a transaction that must not be slow. The output is not a binary decision but a score feeding three actions: approve, challenge with step-up authentication, or block. Framing it as three outcomes rather than two is what makes the cost analysis possible.',
      },
      {
        k: 'Label',
        v: 'Confirmed chargebacks and verified fraud reports — which arrive up to 90 days late, so any recent window is undercounted and cannot be used naively for training or for measuring. Manual review decisions give a faster, weaker label. Blocked transactions have no outcome at all: you never learn whether they were actually fraud, which is a permanent hole in the data.',
      },
      {
        k: 'Metrics',
        v: 'Offline: AUC-PR, and recall at the false-positive rate the business will tolerate — usually stated as "catch X% of fraud value while declining under Y% of good transactions". Weight by amount, because catching a hundred £5 frauds is worth less than one £5,000 fraud. Online: fraud loss in currency, plus the false-decline rate, which is the metric that quietly costs more than the fraud does.',
      },
      {
        k: 'Features',
        v: 'Transaction: amount relative to the user\'s history, currency, merchant category, card entry mode. Velocity aggregates over multiple windows — transactions in the last minute, hour, day, per card, per device, per IP, per shipping address. Entity: account age, verification status, past chargebacks. Graph: how many other accounts share this device, this address, this card BIN — rings are visible in the graph long before any single transaction looks odd. Context: is the location plausible given the last transaction\'s time and place.',
      },
      {
        k: 'Model',
        v: 'Gradient-boosted trees as the workhorse: tabular features, needs to be explainable to a review team and to a regulator, and retrains fast. Layered with rules for the known-bad patterns (a rule fires in microseconds and is auditable), and an unsupervised anomaly component for novel attacks with no labels yet. A graph model over the shared-entity network catches organised rings that the per-transaction model cannot see.',
      },
      {
        k: 'Serving',
        v: 'Transaction → rules engine first, since a hit ends the decision immediately → feature fetch from the online store, with velocity counters kept in Redis and updated on write → model scores in ~10ms → thresholds map the score onto approve / challenge / block. Fallback on any timeout: a conservative rules-only decision, because failing open loses money and failing closed loses customers, and the choice must be deliberate.',
      },
      {
        k: 'Training',
        v: 'Weekly retraining on data mature enough for its labels to be trustworthy — meaning the training window ends 90 days ago, with the recent period used only for drift monitoring. Thresholds re-tuned more often than the model, since the operating point is where the business trades loss against friction.',
      },
      {
        k: 'What goes wrong',
        v: 'Adversarial adaptation: attackers probe with small transactions to find the threshold, so degradation is deliberate rather than accidental and monitoring must look for probing patterns. Blocked-transaction blindness: the model never learns from its own rejections, so a small allow-through sample on borderline scores is worth its cost. Concept drift at a holiday, when legitimate spending suddenly looks anomalous. And per-segment fairness: a model that declines a demographic at a much higher rate is a legal problem regardless of its AUC.',
      },
    ],
  },

  {
    id: 'eta',
    name: 'Delivery time prediction',
    prompt: 'Design the ETA shown to a customer ordering food delivery.',
    scale: [
      ['traffic', '5k orders/sec at peak'],
      ['budget', '100ms at checkout'],
      ['horizon', '20–60 minute predictions'],
      ['update', 're-predict every 30s after order'],
    ],
    blocks: [
      {
        k: 'Frame it',
        v: 'Regression with an asymmetric cost — being 10 minutes late is far worse than being 10 minutes early — and a self-fulfilling one, because the ETA you show changes whether the customer orders and how the courier is dispatched. It is also a sum of stages, and modelling them separately is usually better than one end-to-end number.',
      },
      {
        k: 'Label',
        v: 'Actual elapsed time from order placement to delivery, available within about an hour: unusually fast and clean feedback compared with most ML problems. Decompose it into restaurant preparation, courier assignment wait, pickup travel, and delivery travel, because each stage has different drivers and different variance.',
      },
      {
        k: 'Metrics',
        v: 'Not RMSE. Use quantile loss at the quantile the product promises — predict the time you beat 90% of the time — plus the on-time rate as the headline, and mean absolute error as a secondary. Online: on-time delivery percentage and order completion rate at checkout. Guardrail: the ETA must not be so padded that customers abandon.',
      },
      {
        k: 'Features',
        v: 'Restaurant: historical preparation time by hour and by item, current open-order count, kitchen capacity. Order: item count, whether items are cooked to order, total value. Supply: couriers available within a radius right now, current utilisation, mean assignment wait over the last 15 minutes. Route: distance, historical travel time on that corridor at this hour, live traffic. Context: weather, day of week, whether a large local event is on.',
      },
      {
        k: 'Model',
        v: 'Gradient-boosted trees with a quantile objective, one model per stage, summed with an uncertainty budget rather than a naive addition of point estimates. Tabular features with strong monotone relationships and a need to explain why an ETA is long — trees fit the problem. A sequence model over the courier\'s recent trajectory can improve the in-flight update but is not where to start.',
      },
      {
        k: 'Serving',
        v: 'At checkout: features from an online store where supply and restaurant counters are updated continuously → per-stage predictions → sum plus buffer → a rounded range shown to the user. After the order: re-predict every 30 seconds using the real state (has the restaurant confirmed, is a courier assigned, where are they) and update the customer only when the change is material — flickering ETAs erode trust faster than a slightly wrong one.',
      },
      {
        k: 'Training',
        v: 'Daily retraining on the last 60 days, which is fast because labels mature in an hour. Time-based split, never random: leaking tomorrow\'s traffic conditions into today\'s training set inflates every offline number. Separate models or explicit features per city, since travel-time dynamics do not transfer between them.',
      },
      {
        k: 'What goes wrong',
        v: 'The feedback loop: a padded ETA reduces orders, which reduces courier supply, which makes the true time worse. Restaurant cold start with no preparation history — back off to a category prior. Rare high-impact events (a storm, a stadium emptying) where the model has almost no training examples and needs an explicit override. And the temptation to optimise the average, which produces a system that is on time exactly half the time.',
      },
    ],
  },

  {
    id: 'rag',
    name: 'Retrieval-augmented assistant',
    prompt: 'Design an assistant that answers questions over a company\'s internal documents.',
    scale: [
      ['corpus', '5M documents, updated continuously'],
      ['users', '50k employees, ~200k queries/day'],
      ['budget', '2s to first token'],
      ['constraint', 'answers must cite their source'],
    ],
    blocks: [
      {
        k: 'Frame it',
        v: 'Retrieval quality sets the ceiling: the generator cannot answer from a passage it never received. So the design effort goes into retrieval and evaluation, not prompt wording. Two hard requirements shape everything — permissions must be enforced per user, and every claim must carry a citation.',
      },
      {
        k: 'Label',
        v: 'There is no natural label, so manufacture one. Build an eval set of a few hundred real questions with the correct source documents identified by hand, which measures retrieval directly. For answer quality, collect thumbs and, more usefully, whether the user clicked into the cited source or re-asked the question — a rephrase within 30 seconds is a strong negative.',
      },
      {
        k: 'Metrics',
        v: 'Retrieval: recall@k on the eval set — is the right passage in the context at all. Generation: groundedness (every claim traceable to a retrieved passage, checked by an LLM judge and audited against humans), citation accuracy, and refusal rate on questions the corpus genuinely cannot answer. Online: resolution rate and the rate of escalation to a human. Guardrails: p95 time to first token, and zero cross-permission leaks.',
      },
      {
        k: 'Features',
        v: 'Chunk-level: embedding, BM25 terms, document title and section path prepended before embedding so a chunk is interpretable alone, document recency, author team, document type, and the ACL. Query-level: rewritten query, extracted entities, and a classifier for whether this is a lookup, a how-to, or a comparison — the three need different retrieval depths.',
      },
      {
        k: 'Model',
        v: 'Hybrid retrieval (BM25 plus dense embeddings, fused) over chunks, then a cross-encoder reranker over the top 50, then a generation model given the top 8 passages with an explicit instruction to answer only from context and cite. Fine-tune the embedding model on in-domain query/passage pairs harvested from the eval set and from click data — internal jargon and product code names are exactly what an off-the-shelf embedder has never seen.',
      },
      {
        k: 'Serving',
        v: 'Query → rewrite using conversation history so follow-ups resolve → parallel BM25 and ANN retrieval, both filtered by the user\'s ACL at query time, never after → fusion → cross-encoder rerank ~40ms → assemble context → stream the answer with citations. Cache aggressively on normalised query plus permission group. Documents re-embedded on change through a queue, with deletions propagated immediately because a stale index that answers from a deleted document is a compliance incident.',
      },
      {
        k: 'Training',
        v: 'The embedding model is fine-tuned quarterly or when a new domain lands; the reranker similarly. The eval set is the real artefact and it grows continuously — every reported bad answer becomes a permanent test case. Every prompt or model change runs against the full set before it ships, which is the only defence against a change that fixes one case and breaks nine.',
      },
      {
        k: 'What goes wrong',
        v: 'Permission leakage through the cache or through a filter applied after retrieval instead of during it. Stale or contradictory documents where two versions of a policy both retrieve well and the model picks one silently — prefer recency and surface the conflict. Chunk boundaries splitting the answer. Confident answers to questions the corpus cannot support, which is why an explicit "I could not find this" path has to be trained and measured rather than hoped for.',
      },
    ],
  },
]
