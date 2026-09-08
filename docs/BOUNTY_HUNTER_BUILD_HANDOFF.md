# GearSwipe Bounty Hunter — GOL-11 build handoff

Status: repository handoff recovered; implementation has not started.

## Authoritative repository record

- Repository: <https://github.com/marzton/gearswipe.com>
- Source branch: `feature/bounty-hunter-phase-0`
- Source commit: [`cc88da2c8f272116d43bfa1f010846299eba52ed`](https://github.com/marzton/gearswipe.com/commit/cc88da2c8f272116d43bfa1f010846299eba52ed)
- Intended implementation branch: `feature/bounty-hunter-phase-0`
- Base recorded by the source handoff: `main`

The full source SHA is the reachable commit requested for this handoff. GitHub's
repository refs expose it as the head of `feature/bounty-hunter-phase-0`; it adds
this file on top of `71dac452476495dfd8c113cf9de26d1d386b5f8b`.

This repository record is authoritative for code and checked-in contracts. No
repository-visible export or immutable link currently verifies Google Drive,
Linear, GitLab, deployed-runtime, or provider state, so this handoff makes no
claim about their current contents or status.

## GOL-11 scope available from the repository

The recovered source labels GOL-11 as the first Phase 0 item but does not include
an issue export or durable issue URL. Until its external acceptance criteria are
checked into the repository, the smallest defensible repository-grounded scope
is the Phase 0 contract foundation:

- define typed bounty, evidence, acceptance-policy, submission, and append-only
  audit-event contracts;
- keep claims separate from evidence and retain source/provenance metadata;
- version and lock material acceptance criteria when a hunt begins;
- define server-issued UTC receipt time, monotonic event identity,
  deterministic concurrency/tie behavior, and idempotency requirements for
  state-changing or settlement operations;
- provide fixtures and contract tests before adding a public workflow; and
- use mock/sandbox settlement only—no real-money payout, production IAM/secret
  change, destructive migration, or physical recovery campaign.

The broader proposed lifecycle is:

`POST → QUALIFY → MATCH → HUNT → CAPTURE EVIDENCE → SUBMIT → VERIFY → ACCEPT / DISPUTE → PAYOUT → REPUTATION → ARCHIVE / REDISCOVER`

That lifecycle is context, not evidence that every stage belongs in GOL-11.

## Runtime capabilities verified in this checkout

The following statements are limited to repository-visible implementation and
tests; they do **not** assert that any deployed binding or provider resource
exists:

- The application is a Vinext/Next full-stack app with a Cloudflare Worker entry
  point and Node compatibility enabled in `wrangler.toml`.
- The Worker exports discovery, targeted-search, product-research, and editorial
  Workflow classes. The Vite Cloudflare configuration declares all four local
  Workflow bindings.
- Product research uses durable `step.do()` checkpoints, can wait for an
  `acquisition-ready` event, creates an evidence-packet shell, and can persist it
  through an optional `RESEARCH_ASSETS` R2 binding.
- Editorial waits for an explicit `editorial-approval` event. Discovery refuses
  to invent candidates without an acquisition adapter, and targeted search only
  filters supplied candidates.
- `wrangler.toml` declares a `DB` D1 binding and an `ASSETS_R2` bucket binding.
  The repository also contains D1 migrations and authenticated operator research
  routes.
- The AI Search adapter is retrieval-only, returns `needs_configuration` when
  its binding or instance name is absent, and leaves returned citations for
  human review.
- Repository tests cover the production-auth defaults and the retrieval-only
  operator research boundary. They are not Bounty Hunter contract tests.

## Known documentation/runtime drift

- `docs/cloudflare-research-runtime.md` says `wrangler.toml` is intentionally
  minimal and dashboard configuration is authoritative. The checked-in Wrangler
  file now explicitly declares `DB` and `ASSETS_R2`, while Workflow declarations
  live in `vite.config.ts` because Vinext generates the deploy configuration.
- The research workflow writes only when `RESEARCH_ASSETS` is present, but the
  checked-in Wrangler R2 binding is named `ASSETS_R2`. No repository-visible
  alias connects those names.
- `docs/CLOUDFLARE_WORKFLOWS_HANDOFF.md` suggests workflow code under
  `src/workflows/`; the implementation is under `worker/workflows/`.
- The product-research implementation currently creates an empty claim set from
  seed URLs. Browser/AI acquisition, claim extraction, confidence scoring, D1
  persistence, and workflow instance create/status/signal APIs remain described
  as future integrations.
- Existing research/product contracts use product identity rather than the
  repository's canonical `gs_id` object identity. Bounty work must not create a
  second source of truth or silently treat provider identifiers as canonical.

## Approval requirements

Before implementation expands beyond contracts and fixtures, obtain and record
repository-visible approval for:

1. the exact GOL-11 acceptance criteria and the boundary with later Phase 0 work;
2. any canonical schema or migration, especially destructive or irreversible
   changes;
3. any production binding, route, IAM, secret, OAuth-client, or deployment
   change;
4. any real-money settlement or payout capability and any physical
   retrieval/treasure contract; and
5. publication or promotion of AI-assisted conclusions—editorial publication
   remains behind explicit human approval.

Never commit credentials. Runtime secrets must come from the runtime secret
store, and Cloudflare credentials must use bindings/secrets rather than source.

## Smallest next action

Add one repository-native `GOL-11` contract test fixture that expresses a single
information/evidence bounty with: a canonical `gs_id`, separately linked claim
and evidence records, source URL/provider/retrieval/license/confidence/
normalization provenance, a versioned acceptance policy, deterministic receipt
and tie fields, an idempotency key, and append-only audit events. Make the test
fail against a minimal TypeScript schema; do not add routes, migrations,
settlement, provider calls, or public UI in that change.

After each implementation session, update this handoff with the task, objective,
repository/branch/commit, completed and remaining work, tests, decisions,
artifacts, blockers, approvals, and recommended next action. Repository evidence
must take precedence over stale prose, and drift must be recorded rather than
silently reconciled.
# GearSwipe Bounty Hunter — Build Handoff

Status: Phase 0 implementation branch active.

## Source of truth
Read in this order before coding:
1. Google Drive — 00 - GS Cortex Agent Bootstrap Canon
2. Google Drive — GearSwipe Bounty Hunter — Canonical Product & Agent Manifest
3. Google Drive — GearSwipe Bounty Hunter — Portable Implementation Prompt
4. GitHub — `docs/API_WEBHOOK_REGISTRY.md`
5. Linear project — GearSwipe Bounty Hunter
6. Linear Phase 0 issues — GOL-11 through GOL-14

## Active repo / branch
- Repo: `marzton/gearswipe.com`
- Branch: `feature/bounty-hunter-phase-0`
- Base: `main`

## Phase 0 objective
Lock bounty/evidence contracts and policy, typed schemas, initial REST surface, append-only event/audit model, mobile-first bounty intake/discovery/submission prototype, deterministic concurrency/tie behavior, and test fixtures.

Use mock/sandbox settlement only. Do not activate real-money payouts, production IAM/secrets changes, destructive migrations, or physical treasure/recovery campaigns in Phase 0.

## Core workflow
`POST → QUALIFY → MATCH → HUNT → CAPTURE EVIDENCE → SUBMIT → VERIFY → ACCEPT / DISPUTE → PAYOUT → REPUTATION → ARCHIVE / REDISCOVER`

## Critical invariants
- Claims are not facts; evidence is stored separately.
- AI output alone is not evidence.
- Material acceptance criteria are versioned and locked after a hunt begins.
- Server-generated UTC receipt times and monotonic event IDs are authoritative.
- Mutating financial/state endpoints are idempotent.
- Audit events are append-only and version policy/rubric references.
- Default bounty output is information/evidence.
- Physical retrieval and treasure hunts are separate governed contract types.
- Runtime evidence overrides stale prose; record drift rather than silently reconciling it.

## Webhook/provider correction
The initial manifest route `POST /v1/webhooks/payment-provider` is a generic future payment-provider placeholder. It is not the correct receiver for OpenAI API events.

Canonical concrete-provider route for OpenAI:
- `POST /v1/webhooks/openai`

OpenAI webhook signing secret reference:
- `OPENAI_WEBHOOK_SECRET`

Raw webhook secrets belong in the Cloudflare Worker secret store/environment secret mechanism for the worker serving `cortex.goldshore.ai`. Do not store raw secrets in GitHub, KV, Drive, Linear, prompts, or logs.

Read `docs/API_WEBHOOK_REGISTRY.md` for provider-specific routes, secret-reference naming, receiver requirements, and event routing before implementing any webhook integration.

## GitLab
GitLab is intended as Beta/testing mirror. No GearSwipe GitLab project was visible to the connected account as of 2026-09-08. Do not depend on GitLab CI until a project is created/imported and its path/pipeline are recorded in Linear GOL-14.

## Required session handoff
Persist after each build session:
- task / issue ID
- objective
- repo/path
- environment
- branch
- commit SHA
- completed work
- remaining work
- tests/evidence
- blockers
- decisions
- artifacts
- approval requirements
- recommended next capability/agent

Claude and Codex should begin from this file plus the Drive canon and Linear issues, not from chat memory.
