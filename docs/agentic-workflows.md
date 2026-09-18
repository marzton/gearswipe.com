# GearSwipe Agentic Workflow Architecture

## Goal

Give Codex and runtime agents enough product, data, workflow, and safety context to extend GearSwipe without turning the product into an aggregator, a dashboard-first admin tool, or a provider-owned marketplace.

## Layers

### 1. Public surfaces
- Explore
- Object
- Search
- Timeline / Lens
- Collections
- Buy
- Consign

### 2. Auxiliary role surfaces
- Contributor Studio
- Collector Vault
- Seller Console
- Research Workspace
- Moderation
- Sponsor Portal
- Admin / Operator

### 3. Canonical domain
- `gs_id`
- object identity
- evidence / provenance
- typed relationships
- temporal / spatial coordinates
- ownership / availability state
- market observations
- source attribution

### 4. Source adapters
Adapters normalize external systems into evidence. Initial examples:
- Wikidata / Wikimedia
- museum / archive open data
- commerce comparison sources
- manufacturer information
- affiliate/referral sources

The system must continue functioning when any individual adapter is disabled.

### 5. Agentic handlers
Handlers perform bounded tasks and return typed outputs. Suggested families:

- `intake.identify`
  - inputs: media refs, optional owner notes
  - outputs: candidate entities, confidence, object boundaries

- `research.enrich`
  - inputs: `gs_id`, research question, source policy
  - outputs: claims, citations/evidence refs, unresolved questions

- `translation.translate`
  - inputs: source text/image region, language hints
  - outputs: original transcription, literal translation, natural translation, confidence

- `graph.link`
  - inputs: `gs_id`, candidate related entities
  - outputs: typed proposed relationships with reasons/evidence

- `market.observe`
  - inputs: `gs_id`, source adapters
  - outputs: market observations; never directly overwrite canonical value

- `compare.explain`
  - inputs: current object + alternatives
  - outputs: explainable comparison dimensions and tradeoffs

- `publish.compose`
  - inputs: canonical object + verified evidence + audience/surface
  - outputs: surface-specific content without changing canonical truth

- `moderation.review`
  - inputs: contribution, evidence, policy context
  - outputs: recommendation and audit record; human escalation where required

- `cost.guard`
  - inputs: requested job, estimated tokens/browser/API calls
  - outputs: allow/defer/escalate based on per-job and daily budgets

## Handler contract

Every asynchronous handler should support:
- idempotency key
- job id
- `gs_id` when object-scoped
- actor / initiator
- input schema version
- output schema version
- created / started / completed timestamps
- status and retry count
- source/evidence refs
- cost accounting fields
- model/provider metadata when AI is used
- error category without secret leakage

## Workflow state

Suggested job states:

`queued -> running -> needs_review | complete | failed | parked`

A handler should not silently mutate canonical claims from probabilistic output. Proposed claims and relationships enter a review/verification path before becoming canonical where material.

## Event vocabulary

Use explicit events rather than hidden coupling. Examples:

- `object.intake.requested`
- `object.created`
- `object.media.added`
- `research.requested`
- `research.completed`
- `claim.proposed`
- `claim.verified`
- `relationship.proposed`
- `relationship.verified`
- `market.refresh.requested`
- `market.observation.created`
- `publication.requested`
- `publication.completed`
- `contribution.submitted`
- `moderation.required`

## Cloudflare execution shape

Preferred mapping:
- Workers: HTTP/API entrypoints and lightweight orchestration
- D1: canonical relational records, job metadata, audit records
- R2: original media, derivatives, research artifacts
- Queues: asynchronous work dispatch
- Workflows: durable multi-step work requiring retries/waits
- Vectorize or equivalent: semantic retrieval only where it demonstrably improves discovery/research
- Cache: stable normalized source responses and generated derivatives

Do not require every service for MVP. Start with the smallest set that preserves the contracts.

## OpenAI execution shape

Use OpenAI through a server-side handler only. Never call privileged model APIs directly from the browser.

Recommended pattern:

`UI/API -> job record -> queue/workflow -> OpenAI handler -> structured result -> evidence/review -> canonical update`

Store enough provenance to reproduce or challenge AI-generated conclusions. Keep model output separate from source evidence.

## Codex implementation workflow

For a new feature:

1. Read `AGENTS.md` and this document.
2. Identify the layer and existing contract touched.
3. Search for the current implementation before creating new abstractions.
4. Write a small implementation plan in the PR description.
5. Prefer additive schemas and adapters over provider-specific rewrites.
6. Add tests for the public contract or handler schema.
7. Run lint/test/build.
8. Record deployment/binding changes explicitly.
9. Keep the PR reversible.

For source integrations:

1. Define the normalized evidence shape first.
2. Add an adapter behind an interface.
3. Add caching/rate-limit behavior.
4. Add attribution/license metadata.
5. Add fixture tests.
6. Do not couple public components directly to provider responses.

For AI handlers:

1. Define the typed input/output contract first.
2. Decide which fields are evidence, inference, or presentation.
3. Add cost/retry limits.
4. Use server-side secrets only.
5. Add deterministic fixtures/mocks for tests where possible.
6. Human-review material historical/provenance/market claims before canonical promotion when confidence is insufficient.

## Skills and tool routing

Codex should use specialized skills when relevant:
- Build Web Apps frontend app builder for new or redesigned visual surfaces
- frontend testing/debugging for rendered UI verification
- React best practices for React/Next performance work
- OpenAI Developers skills for Agents SDK / OpenAI API work
- Cloudflare skills for Workers, D1, R2, Queues, Workflows and deployment concerns

Tools are implementation aids; repository contracts remain authoritative.

## First vertical slice

Use a small real GearSwipe collection to prove the architecture end-to-end:

1. intake media
2. create canonical objects
3. attach evidence
4. enrich selectively
5. link time/place/people/organizations
6. publish object surfaces
7. render one Timeline/Lens neighborhood
8. expose comparison/availability only when relevant
9. record costs and founder effort

Success means the object becomes easier to understand, publish, compare, and transact without creating a second source of truth.
