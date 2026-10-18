import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

function insertFixture(db) {
  db.exec(`
    INSERT INTO gearswipe_content_objects (gs_id, title) VALUES ('gs_object_1', 'Test object');
    INSERT INTO bounty_hunters (hunter_id, account_subject) VALUES ('hunter_1', 'account_1');
    INSERT INTO bounties (bounty_id, title) VALUES ('bounty_1', 'Document this object');
    INSERT INTO bounty_entity_links (bounty_id, gs_id) VALUES ('bounty_1', 'gs_object_1');
    INSERT INTO bounty_submissions (submission_id, bounty_id, hunter_id) VALUES ('submission_1', 'bounty_1', 'hunter_1');
    INSERT INTO bounty_evidence (
      evidence_id, submission_id, record_kind, evidence_type, origin, source_url,
      captured_at, received_at, storage_key, media_hash, metadata_hash,
      geolocation_precision_meters, rights_basis, uploader_assertions_json,
      normalization_version, provenance_json
    ) VALUES (
      'evidence_original', 'submission_1', 'original', 'image', 'hunter_capture',
      'https://example.test/source', '2026-01-01T00:00:00Z', '2026-01-01T00:01:00Z',
      'originals/evidence_original', 'sha256:media', 'sha256:metadata', 10,
      'uploader-owned', '{"capturedByUploader":true}', 'bounty-evidence/v1',
      '{"intakeRequestId":"request_1"}'
    );
  `);
}

async function database() {
  const db = new DatabaseSync(":memory:");
  db.exec(await source("migrations/0008_content_intake.sql"));
  db.exec(await source("migrations/0009_bounty_evidence.sql"));
  insertFixture(db);
  return db;
}

test("bounty evidence has required provenance fields and owns a submission", async () => {
  const db = await database();
  const evidence = db.prepare("SELECT * FROM bounty_evidence WHERE evidence_id = ?").get("evidence_original");
  for (const field of [
    "submission_id", "evidence_type", "origin", "source_url", "captured_at",
    "received_at", "media_hash", "metadata_hash", "geolocation_precision_meters",
    "rights_basis", "uploader_assertions_json", "verification_state",
    "confidence_basis_points", "redaction_state", "normalization_version", "provenance_json",
  ]) assert.notEqual(evidence[field], undefined, `${field} must be represented`);

  assert.throws(() => db.exec(`
    INSERT INTO bounty_evidence (
      evidence_id, submission_id, record_kind, evidence_type, origin, storage_key,
      media_hash, metadata_hash, rights_basis, normalization_version
    ) VALUES ('orphan', 'missing', 'original', 'image', 'hunter_upload', 'x', 'x', 'x', 'owned', 'v1');
  `), /FOREIGN KEY constraint failed/);
  db.close();
});

test("redaction retains an original, a derivative, and immutable history", async () => {
  const db = await database();
  db.exec(`
    INSERT INTO bounty_evidence (
      evidence_id, submission_id, record_kind, derivative_of_evidence_id,
      evidence_type, origin, storage_key, media_hash, metadata_hash, rights_basis,
      redaction_state, normalization_version
    ) VALUES (
      'evidence_redacted', 'submission_1', 'derivative', 'evidence_original',
      'image', 'gearswipe_derivative', 'derivatives/evidence_redacted',
      'sha256:redacted-media', 'sha256:redacted-metadata', 'uploader-owned',
      'redacted', 'bounty-evidence/v1'
    );
    INSERT INTO bounty_evidence_redaction_events (
      redaction_event_id, evidence_id, derivative_evidence_id, actor_id, reason
    ) VALUES ('redaction_1', 'evidence_original', 'evidence_redacted', 'reviewer_1', 'private address');
  `);

  assert.equal(db.prepare("SELECT count(*) AS count FROM bounty_evidence").get().count, 2);
  assert.equal(db.prepare("SELECT count(*) AS count FROM bounty_evidence_redaction_events").get().count, 1);
  assert.throws(
    () => db.exec("UPDATE bounty_evidence_redaction_events SET reason = 'changed' WHERE redaction_event_id = 'redaction_1'"),
    /redaction events are append-only/,
  );
  db.close();
});

test("research evidence remains a separate operator-research contract", async () => {
  const schema = await source("db/schema.ts");
  const researchBlock = schema.slice(schema.indexOf("export const researchEvidence"), schema.indexOf("export const contentObjects"));
  assert.doesNotMatch(researchBlock, /bounty|hunter|redaction|custody/);
});
