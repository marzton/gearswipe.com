# GearSwipe Agent Operating Contract

This repository is the public GearSwipe product surface. Agents working here must preserve the distinction between canonical GearSwipe data and external source evidence.

## Product intent

GearSwipe is an object-intelligence, discovery, publishing, and commerce system. Commerce is one possible consequence of understanding an object; it is not the sole product goal.

Core public surfaces:
- Explore: discover objects and stories with very low friction.
- Object: understand one thing deeply.
- Buy: complete a transaction with minimal steps.
- Timeline/Lens: explore temporal, spatial, and relational context progressively.
- Collections: save, follow, and curate.
- Consign: submit interesting objects through a guided flow.

Auxiliary role surfaces:
- Contributor Studio
- Collector Vault
- Seller Console
- Research Workspace
- Moderation
- Sponsor Portal
- Admin/Operator

Complex role-specific tooling must not leak into the default public experience.

## Canonical data principle

External providers are replaceable evidence sources. They do not own GearSwipe entities.

The canonical identity is `gs_id`.

Every imported datum should preserve:
- source provider
- source identifier and URL when available
- retrieval timestamp
- license / attribution requirements
- confidence
- normalization version
- provenance / evidence linkage

Provider-specific fields must not leak into the canonical object schema except through explicitly versioned source metadata.

## Object-first model

Prefer entities + relationships over rigid category trees.

Primary entity classes may include:
- object
- event
- person
- organization
- place
- work
- material
- technology
- concept
- market observation
- source / evidence record

Relationships should be explicit and typed, e.g.:
- created_by
- owned_by
- used_in
- advertised_in
- depicts
- preceded
- influenced
- contradicts
- corroborates
- derived_from
- located_at

Categories are generated views, not the source of truth.

## Timeline / Lens rule

Chronology is a coordinate, not the whole model. Timeline/Lens views should progressively reveal temporal, spatial, semantic, and evidentiary relationships using level-of-detail rendering.

Do not send the complete knowledge graph to the browser. Prefer viewport-specific payloads and bounded rendering.

## Accountability and contribution

GearSwipe should favor persistent accountable identity over anonymous reputation systems.

Public pseudonyms may be allowed while a verified account remains behind contributions where required by policy.

Reputation should derive from contribution quality and review history, not popularity alone.

Do not implement ideological or demographic reputation logic. Moderate observable conduct and evidence quality.

## Commerce and sponsorship boundaries

Commercial actors may purchase placement, campaign participation, referral opportunities, sponsorship, and other bounded surfaces.

They must not own or override:
- canonical metadata
- historical conclusions
- taxonomy / ontology
- moderation outcomes
- provenance
- user identity data
- editorial deletion rights

Money may purchase surface area, not ontology.

## AI usage

AI should enrich selectively rather than continuously research every node.

Use queued, idempotent handlers for expensive operations. Cache outputs. Record model, prompt/version, source set, timestamps, confidence, and cost metadata where practical.

AI-generated claims must be distinguishable from verified source evidence.

## Cost discipline

Optimize for a solo-founder system with low fixed burn. Avoid premature vendor lock-in and paid data dependencies.

Default sequence:
1. canonical object model
2. evidence/provenance
3. identity/audit trail
4. relationship graph
5. temporal/spatial coordinates
6. one zoomable visualization prototype
7. one complete real-world vertical slice
8. contribution workflow
9. reputation/verification
10. commercial expansion

## Feature decision gates

Use: Discover -> Sketch -> Prototype -> Prove -> Integrate -> Stabilize -> Expand.

Also allow Park and Reject.

A component is stable enough to become a dependency when its responsibility, input/output contract, failure behavior, and tests for material risk are understood.

Reject or park work that creates a second source of truth, premature schema commitments, unnecessary centralization, or complexity without measurable user value.

## Frontend expectations

The public product should remain simple, mobile-first, responsive, and PWA-friendly before native apps are considered.

Avoid dashboard-first public UX, visual rainbow taxonomies, excessive card grids, and transaction friction.

Build role-specific auxiliary interfaces only when the role needs them.

## Agent workflow

Before modifying code:
1. Read `README.md`, this file, relevant docs under `docs/`, and existing route/data contracts.
2. Inspect the current implementation before proposing architectural replacement.
3. State which layer is being changed: public surface, canonical data, source adapter, AI handler, workflow, commerce, identity, or operator tooling.
4. Prefer small reversible PRs.
5. Add or update tests for changed contracts.
6. Run `npm run lint`, `npm test`, and `npm run build` when changes permit.
7. Never commit secrets.

For OpenAI-backed runtime code, use `OPENAI_API_KEY` from the runtime secret store. Never place keys in source, examples, logs, issue text, or client bundles.

For Cloudflare deployment, use bindings and secrets rather than hard-coded credentials.
