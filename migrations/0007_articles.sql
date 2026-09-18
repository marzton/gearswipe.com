CREATE TABLE IF NOT EXISTS gearswipe_articles (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  dek TEXT,
  body TEXT NOT NULL,
  hero_image TEXT,
  gs_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS gearswipe_articles_status_published_at ON gearswipe_articles(status, published_at DESC);
