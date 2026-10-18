# GearSwipe agent guide

## Read first

`AGENTS.md` is the product and operating contract. GearSwipe is object-first: `gs_id` is canonical; external data is provenance-bearing evidence, not the source of truth. Keep AI-generated interpretation distinct from sourced facts.

## Working model

- App source: `app/`; Cloudflare Worker entry: `worker/index.ts`.
- `wrangler.toml` owns the `DB` (D1) and `ASSETS_R2` binding contract.
- Database migrations live in `migrations/`; generate them with `npm run db:generate` after schema changes.
- Public content exposes only approved/published records. Do not automate publishing, social activity, or external-provider writes.

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm run db:generate
```

## Deployment and safety

- Check the current branch and fetch `origin/main` before starting; preserve unrelated worktree changes.
- `npm run deploy` builds then deploys the Worker. Production deployment, secrets, DNS/routes, and dashboard configuration require human approval.
- Never commit credentials. `AUTH_SECRET` and other runtime values remain Cloudflare-managed secrets; document names only.
- Verify source, CI, deployment/version, bindings, and live endpoints as separate facts.

## Change discipline

Use small reviewable PRs. Update relevant tests and record branch, commit, checks, and any human action needed for handoff.