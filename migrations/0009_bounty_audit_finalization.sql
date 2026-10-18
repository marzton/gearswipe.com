CREATE TABLE bounty_revisions (
  id TEXT PRIMARY KEY NOT NULL,
  bounty_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  collision_window_ms INTEGER NOT NULL CHECK (collision_window_ms >= 0),
  tie_policy TEXT NOT NULL CHECK (tie_policy IN ('earliest_authoritative_receipt', 'lowest_submission_uuid')),
  locked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (bounty_id, revision)
);

CREATE TABLE audit_events (
  receipt_id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_uuid TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'bounty.created', 'bounty.published', 'claim.created', 'claim.released',
    'submission.created', 'submission.evidence_added', 'submission.finalized',
    'submission.verified', 'submission.accepted', 'dispute.opened',
    'dispute.resolved', 'payout.authorized', 'payout.completed',
    'moderation.hold_placed', 'moderation.hold_released', 'bounty.closed'
  )),
  actor_ref TEXT NOT NULL,
  bounty_id TEXT,
  related_entity_id TEXT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_id TEXT NOT NULL UNIQUE,
  correlation_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  provenance_pointer TEXT NOT NULL
);

CREATE INDEX audit_events_bounty_receipt ON audit_events (bounty_id, receipt_id);
CREATE INDEX audit_events_correlation ON audit_events (correlation_id, receipt_id);

-- SQLite/D1 has no table-level APPEND ONLY permission. These guards make an
-- attempted mutation fail even if application code accidentally issues one.
CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON audit_events
BEGIN SELECT RAISE(ABORT, 'audit_events is append-only'); END;
CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON audit_events
BEGIN SELECT RAISE(ABORT, 'audit_events is append-only'); END;

CREATE TABLE bounty_finalizations (
  bounty_revision_id TEXT PRIMARY KEY NOT NULL REFERENCES bounty_revisions(id),
  winning_submission_id TEXT NOT NULL,
  receipt_id INTEGER NOT NULL UNIQUE REFERENCES audit_events(receipt_id),
  request_id TEXT NOT NULL UNIQUE,
  finalized_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER bounty_revisions_no_update_after_lock BEFORE UPDATE ON bounty_revisions
BEGIN SELECT RAISE(ABORT, 'locked bounty revisions are immutable'); END;
CREATE TRIGGER bounty_revisions_no_delete_after_lock BEFORE DELETE ON bounty_revisions
BEGIN SELECT RAISE(ABORT, 'locked bounty revisions are immutable'); END;
CREATE TRIGGER bounty_finalizations_no_update BEFORE UPDATE ON bounty_finalizations
BEGIN SELECT RAISE(ABORT, 'bounty finalizations are immutable'); END;
CREATE TRIGGER bounty_finalizations_no_delete BEFORE DELETE ON bounty_finalizations
BEGIN SELECT RAISE(ABORT, 'bounty finalizations are immutable'); END;
