CREATE TABLE IF NOT EXISTS gearswipe_content_objects (
  gs_id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'researching', 'draft', 'review', 'published')),
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gearswipe_intake_assets (
  id TEXT PRIMARY KEY NOT NULL,
  gs_id TEXT NOT NULL REFERENCES gearswipe_content_objects(gs_id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS gearswipe_intake_assets_gs_id ON gearswipe_intake_assets(gs_id);
