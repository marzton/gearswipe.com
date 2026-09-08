# GearSwipe Bounty Hunter — Build Handoff

Status: Phase 0 implementation branch active.

## Source of truth
Read in this order before coding:
1. Google Drive — 00 - GS Cortex Agent Bootstrap Canon
2. Google Drive — GearSwipe Bounty Hunter — Canonical Product & Agent Manifest
3. Google Drive — GearSwipe Bounty Hunter — Portable Implementation Prompt
4. Linear project — GearSwipe Bounty Hunter
5. Linear Phase 0 issues — GOL-11 through GOL-14

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
