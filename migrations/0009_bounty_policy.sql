CREATE TABLE IF NOT EXISTS bounty_revisions (
  id TEXT PRIMARY KEY NOT NULL,
  bounty_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  policy_input_json TEXT NOT NULL,
  policy_disposition TEXT NOT NULL CHECK (policy_disposition IN ('allow', 'reject', 'manual_review', 'governed_not_available_in_phase_0')),
  policy_reason_codes_json TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (bounty_id, revision)
);

CREATE TABLE IF NOT EXISTS bounty_audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  bounty_id TEXT NOT NULL,
  bounty_revision_id TEXT NOT NULL REFERENCES bounty_revisions(id),
  event_type TEXT NOT NULL CHECK (event_type = 'bounty.policy_evaluated'),
  policy_decision_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bounty_audit_events_revision_id ON bounty_audit_events(bounty_revision_id);
