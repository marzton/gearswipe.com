# Operator research runtime

This branch adds an operator-only research surface at `/admin/research` and
`/api/admin/research/jobs`. It is deliberately retrieval-only.

## Required deployment configuration

Set these runtime secrets/variables before enabling the interface:

- `AUTH_SECRET` (or `NEXTAUTH_SECRET`)
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `GEARSWIPE_ADMIN_EMAILS` as a comma-separated allowlist
- `GEARSWIPE_AI_SEARCH_INSTANCE` once an approved index exists

Bind `AI_SEARCH` to the intended Cloudflare AI Search namespace. The agent
uses `namespace.get(instance).search()` with hybrid retrieval and returns
source fragments for human review. It never creates an index, uploads source
material, publishes content, enables commerce, or alters canonical facts.

Apply `migrations/0002_operator_research_jobs.sql` to the GearSwipe D1 database
before using the endpoint. Production binding changes and OAuth-client creation
remain separate, reviewed operations.
