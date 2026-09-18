# Bounty submission and evidence contract

This contract belongs to the canonical data and contribution-workflow layers.
It deliberately does not extend `research_evidence`: operator search citations
and hunter-submitted bounty evidence have different ownership, rights, custody,
and review lifecycles.

## Identity and ownership

`bounty_id`, `submission_id`, `hunter_id`, and `evidence_id` are stable GearSwipe
identifiers. A submission belongs to exactly one bounty and one accountable
hunter. Every evidence record belongs to exactly one submission. A bounty links
to canonical entities only through `bounty_entity_links.gs_id`; provider fields
remain evidence provenance and never become canonical object attributes.

## Evidence states

Every ingest records its origin, type, source coordinates, capture time when
known, server receipt time, rights basis, uploader assertions, normalization
version, verification state, confidence, redaction state, and provenance. Empty
provider coordinates mean the evidence was not imported from a provider; they
must not be invented.

Originals and derivatives are separate evidence rows. A derivative points to
its source evidence record, receives its own storage key and hashes, and never
replaces or mutates the original. Redaction similarly creates a derivative and
an append-only redaction event so the disclosure history survives later review.

Media and metadata hashes demonstrate the integrity of a particular stored
digital state. **They do not demonstrate that its content is factually true.**
Verification remains an explicit, reviewable judgment supported by checks and
provenance.

## Append-only history

Custody events, automated checks, reviewer actions, and redaction events are
append-only ledgers. Corrections are new records: reviewer actions can point to
the action they supersede, while custody events use per-evidence sequence
numbers. Migration triggers reject updates and deletes from these ledgers.
