PRAGMA foreign_keys = ON;

CREATE TABLE bounty_hunters (
  hunter_id TEXT PRIMARY KEY NOT NULL,
  account_subject TEXT NOT NULL UNIQUE,
  public_handle TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bounties (
  bounty_id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bounty_entity_links (
  bounty_id TEXT NOT NULL REFERENCES bounties(bounty_id) ON DELETE CASCADE,
  gs_id TEXT NOT NULL REFERENCES gearswipe_content_objects(gs_id) ON DELETE RESTRICT,
  relationship TEXT NOT NULL DEFAULT 'seeks_evidence_for',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (bounty_id, gs_id)
);

CREATE TABLE bounty_submissions (
  submission_id TEXT PRIMARY KEY NOT NULL,
  bounty_id TEXT NOT NULL REFERENCES bounties(bounty_id) ON DELETE RESTRICT,
  hunter_id TEXT NOT NULL REFERENCES bounty_hunters(hunter_id) ON DELETE RESTRICT,
  statement TEXT NOT NULL DEFAULT '',
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX bounty_submissions_bounty_hunter ON bounty_submissions(bounty_id, hunter_id);

CREATE TABLE bounty_evidence (
  evidence_id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL REFERENCES bounty_submissions(submission_id) ON DELETE RESTRICT,
  record_kind TEXT NOT NULL CHECK (record_kind IN ('original', 'derivative')),
  derivative_of_evidence_id TEXT REFERENCES bounty_evidence(evidence_id) ON DELETE RESTRICT,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('image', 'video', 'audio', 'document', 'web', 'testimony', 'other')),
  origin TEXT NOT NULL CHECK (origin IN ('hunter_capture', 'hunter_upload', 'external_source', 'gearswipe_derivative')),
  source_provider TEXT NOT NULL DEFAULT '',
  source_identifier TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  captured_at TEXT,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  retrieved_at TEXT,
  storage_key TEXT NOT NULL,
  media_hash TEXT NOT NULL,
  metadata_hash TEXT NOT NULL,
  latitude TEXT,
  longitude TEXT,
  geolocation_precision_meters INTEGER CHECK (geolocation_precision_meters IS NULL OR geolocation_precision_meters >= 0),
  rights_basis TEXT NOT NULL,
  attribution TEXT NOT NULL DEFAULT '',
  uploader_assertions_json TEXT NOT NULL DEFAULT '{}',
  verification_state TEXT NOT NULL DEFAULT 'unreviewed' CHECK (verification_state IN ('unreviewed', 'checking', 'verified', 'rejected', 'inconclusive')),
  confidence_basis_points INTEGER NOT NULL DEFAULT 0 CHECK (confidence_basis_points BETWEEN 0 AND 10000),
  redaction_state TEXT NOT NULL DEFAULT 'unredacted' CHECK (redaction_state IN ('unredacted', 'redaction_requested', 'redacted')),
  normalization_version TEXT NOT NULL,
  provenance_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((record_kind = 'original' AND derivative_of_evidence_id IS NULL) OR (record_kind = 'derivative' AND derivative_of_evidence_id IS NOT NULL))
);
CREATE INDEX bounty_evidence_submission ON bounty_evidence(submission_id);
CREATE TRIGGER bounty_derivative_same_submission
BEFORE INSERT ON bounty_evidence
WHEN NEW.derivative_of_evidence_id IS NOT NULL
  AND (SELECT submission_id FROM bounty_evidence WHERE evidence_id = NEW.derivative_of_evidence_id) <> NEW.submission_id
BEGIN
  SELECT RAISE(ABORT, 'derivative evidence must belong to the source submission');
END;

CREATE TABLE bounty_evidence_custody_events (
  custody_event_id TEXT PRIMARY KEY NOT NULL,
  evidence_id TEXT NOT NULL REFERENCES bounty_evidence(evidence_id) ON DELETE RESTRICT,
  sequence INTEGER NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  from_location TEXT NOT NULL DEFAULT '',
  to_location TEXT NOT NULL DEFAULT '',
  state_hash TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (evidence_id, sequence)
);

CREATE TABLE bounty_evidence_automated_checks (
  automated_check_id TEXT PRIMARY KEY NOT NULL,
  evidence_id TEXT NOT NULL REFERENCES bounty_evidence(evidence_id) ON DELETE RESTRICT,
  check_type TEXT NOT NULL,
  handler_version TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'inconclusive', 'error')),
  confidence_basis_points INTEGER NOT NULL DEFAULT 0 CHECK (confidence_basis_points BETWEEN 0 AND 10000),
  output_json TEXT NOT NULL DEFAULT '{}',
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX bounty_checks_evidence ON bounty_evidence_automated_checks(evidence_id);

CREATE TABLE bounty_evidence_reviewer_actions (
  reviewer_action_id TEXT PRIMARY KEY NOT NULL,
  evidence_id TEXT NOT NULL REFERENCES bounty_evidence(evidence_id) ON DELETE RESTRICT,
  reviewer_id TEXT NOT NULL,
  action TEXT NOT NULL,
  previous_state TEXT NOT NULL,
  resulting_state TEXT NOT NULL,
  rationale TEXT NOT NULL,
  supersedes_action_id TEXT REFERENCES bounty_evidence_reviewer_actions(reviewer_action_id) ON DELETE RESTRICT,
  acted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX bounty_reviewer_actions_evidence ON bounty_evidence_reviewer_actions(evidence_id);

CREATE TABLE bounty_evidence_redaction_events (
  redaction_event_id TEXT PRIMARY KEY NOT NULL,
  evidence_id TEXT NOT NULL REFERENCES bounty_evidence(evidence_id) ON DELETE RESTRICT,
  derivative_evidence_id TEXT NOT NULL REFERENCES bounty_evidence(evidence_id) ON DELETE RESTRICT,
  actor_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  regions_json TEXT NOT NULL DEFAULT '[]',
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (evidence_id <> derivative_evidence_id)
);
CREATE INDEX bounty_redactions_evidence ON bounty_evidence_redaction_events(evidence_id);
CREATE TRIGGER bounty_redaction_derivative_valid
BEFORE INSERT ON bounty_evidence_redaction_events
WHEN NOT EXISTS (
  SELECT 1 FROM bounty_evidence source
  JOIN bounty_evidence derivative ON derivative.evidence_id = NEW.derivative_evidence_id
  WHERE source.evidence_id = NEW.evidence_id
    AND derivative.derivative_of_evidence_id = source.evidence_id
    AND derivative.submission_id = source.submission_id
)
BEGIN
  SELECT RAISE(ABORT, 'redaction must reference a derivative in the same submission');
END;

-- These ledgers are append-only. Corrections must be represented by later rows.
CREATE TRIGGER bounty_custody_no_update BEFORE UPDATE ON bounty_evidence_custody_events BEGIN SELECT RAISE(ABORT, 'custody events are append-only'); END;
CREATE TRIGGER bounty_custody_no_delete BEFORE DELETE ON bounty_evidence_custody_events BEGIN SELECT RAISE(ABORT, 'custody events are append-only'); END;
CREATE TRIGGER bounty_checks_no_update BEFORE UPDATE ON bounty_evidence_automated_checks BEGIN SELECT RAISE(ABORT, 'automated checks are append-only'); END;
CREATE TRIGGER bounty_checks_no_delete BEFORE DELETE ON bounty_evidence_automated_checks BEGIN SELECT RAISE(ABORT, 'automated checks are append-only'); END;
CREATE TRIGGER bounty_reviews_no_update BEFORE UPDATE ON bounty_evidence_reviewer_actions BEGIN SELECT RAISE(ABORT, 'reviewer actions are append-only'); END;
CREATE TRIGGER bounty_reviews_no_delete BEFORE DELETE ON bounty_evidence_reviewer_actions BEGIN SELECT RAISE(ABORT, 'reviewer actions are append-only'); END;
CREATE TRIGGER bounty_redactions_no_update BEFORE UPDATE ON bounty_evidence_redaction_events BEGIN SELECT RAISE(ABORT, 'redaction events are append-only'); END;
CREATE TRIGGER bounty_redactions_no_delete BEFORE DELETE ON bounty_evidence_redaction_events BEGIN SELECT RAISE(ABORT, 'redaction events are append-only'); END;
