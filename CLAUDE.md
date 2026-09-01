# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product intent (read `AGENTS.md` in full before non-trivial work)

GearSwipe is an object-intelligence, discovery, publishing, and commerce system — commerce is a
consequence of understanding an object, not the sole goal. `AGENTS.md` is the operating contract
and is more detailed than this file; skim it for the canonical-data principle (`gs_id` is the
canonical identity, external providers are replaceable evidence, AI output must stay
distinguishable from verified evidence), the object-first entity/relationship model, and the
feature decision gates (Discover → Sketch → Prototype → Prove → Integrate → Stabilize → Expand).
When changing code, know which layer you're touching: public surface, canonical data, source
adapter, AI handler, workflow, commerce, identity, or operator tooling.

## Commands

```bash
npm run dev              # vinext dev — local Vite + Miniflare
npm run build             # vinext build — Next.js -> static output + Worker bundle
npm start                 # vinext start
npm test                  # build, then run tests/rendered-html.test.mjs (node:test)
node --test tests/operator-workflow-contract.test.mjs   # run a single test file directly
npm run lint               # eslint . (ignores dist, .next)
npm run db:generate        # drizzle-kit generate — after editing db/schema.ts
```

There is no dedicated typecheck script; TypeScript errors surface during `npm run build`.

Deployment (do not run without explicit user instruction — see "Actions requiring confirmation"):

```bash
npm run deploy             # build + wrangler deploy (storefront Worker)
npm run deploy:workers      # wrangler deploy only
npm run logs                 # wrangler tail (storefront)
npm run logs:api              # wrangler tail -c wrangler.quote-api.toml
```

CI (`.github/workflows/ci.yml`) runs `npm test` plus `wrangler deploy --dry-run` for both the
storefront and quote-API Worker configs — a passing local `npm test` and `npx wrangler deploy
--dry-run` is the bar to match before pushing.

## Architecture

**Stack**: Next.js 16 (App Router, RSC) run through `vinext` (a Vite-based Next-on-Cloudflare
adapter, not plain `next build`), deployed as a Cloudflare Worker (not Pages). `vite.config.ts`
wires the `vinext`, `cloudflare` (from `@cloudflare/vite-plugin`), and a local `sites()` plugin
together; it also simulates the D1/R2 bindings declared in `.openai/hosting.json` for local dev.

**Worker entry point is `worker/index.ts`, not the Next.js app directly.** It wraps
`vinext/server/app-router-entry`, adds baseline security headers to every response
(`withSecurityHeaders`), handles `/_vinext/image` image optimization directly, and implements the
Worker's `email()` handler for Cloudflare Email Routing (inbound mail → `resolveMailRoute` →
`storeMailSubmission` → optional `sendAutoReply`). It stashes `env` on
`globalThis.__GEARSWIPE_ENV__` so code far from the request (e.g. `db/index.ts`,
`lib/research/ai-search-agent.ts`) can reach Worker bindings without threading `env` through every
call. Any unhandled error here becomes an opaque Cloudflare 1101 page for the client, so the
try/catch and `console.error` around `handler.fetch` are load-bearing — don't remove them.

**`wrangler.toml` is deliberately minimal.** Only the `DB` D1 binding lives there (committed on
purpose after a dashboard/wrangler.toml mismatch caused a production outage — see the comment in
the file). Every other binding, env var, route, and setting is managed in the Cloudflare Dashboard
for the `gearswipe` Worker. Do not add routes/vars/other bindings to `wrangler.toml`, and do not
configure a dashboard-side `DB` binding — `wrangler deploy` will silently overwrite it. See
`DEPLOYMENT.md` § Dashboard Configuration for what's configured where. There's a second,
currently-undeployed Worker config (`wrangler.quote-api.toml` → `worker/quote-api.ts`) for a future
`api.gearswipe.com` split; it is validated in CI but not part of the live deployment.

**Three separate Drizzle schema files, not one** — check which one before writing a query:
- `db/schema.ts` — admin queue/store items, mail submissions, newsletter/reward signups, vendor
  licensing, and the operator **research jobs / research evidence** tables. This is the schema
  object `db/index.ts`'s `getDb()` actually binds to drizzle.
- `db/gearswipe-schema.ts` — editorial/product tables used by the public API routes: `products`,
  `comparisons`, `fieldTests`, `articles`, `subscribers`. Imported directly by route handlers
  (`import { products } from "@/db/gearswipe-schema"`), not passed to `getDb()`'s schema param.
- `db/cms-schema.ts` — auth/session/marketplace tables, larger and mostly separate from the above.
- `examples/d1/db/schema.ts` is an unrelated example surface, not part of the app.

`db/index.ts#getDb()` throws if the `DB` binding is missing rather than silently degrading — call
sites are expected to let that propagate or catch it explicitly, not paper over it.

**Auth**: NextAuth v5 (`auth.ts`), Google OAuth as the real provider plus an opt-in Credentials
provider gated to `NODE_ENV !== "production"` and `GEARSWIPE_ENABLE_LOCAL_CREDENTIALS=true` (local
dev only — `tests/operator-workflow-contract.test.mjs` asserts no default credential ships).
Session strategy is JWT; role (`admin`/`user`) is derived at `jwt`/`session` callback time from
`GEARSWIPE_ADMIN_EMAILS`, not stored as a separate DB flag. `proxy.ts` is the edge-level gate for
`/admin/:path*` and `/api/admin/:path*` (redirects to `/login`, or 401s for API routes), but
`lib/admin-auth.ts` (`requireAdminAuth`, page-level, redirects) and `lib/operator-auth.ts`
(`requireOperator`, API-route-level, returns a 401 `Response`) re-check `session.user.role ===
"admin"` inside route/page code too — the comment in `operator-auth.ts` explains why: "route-level
protection remains effective even if deployment middleware is omitted." Keep both layers when
adding new admin/operator routes. In practice only `app/api/admin/research/jobs/route.ts`,
`[id]/route.ts`, and `app/api/admin/state/route.ts` import the shared `requireOperator` helper;
the rest of `app/api/admin/*` (`articles`, `comparisons`, `field-tests`, `products`, `subscribers`,
`campaigns/send`) duplicate an equivalent `session.user.role === "admin"` check inline via `auth()`
instead of importing it — an existing inconsistency, not a security gap, but prefer importing
`requireOperator` from `lib/operator-auth.ts` for new routes rather than adding another inline copy.

A separate `app/chatgpt-auth.ts` implements optional/required "Sign in with ChatGPT" against
headers injected by the OpenAI Sites hosting platform's Dispatch layer
(`oai-authenticated-user-email` etc.) — unrelated to the NextAuth/admin system above. Dispatch owns
`/signin-with-chatgpt`, `/signout-with-chatgpt`, and `/callback`; don't implement app routes at
those paths. Pages using it need `export const dynamic = "force-dynamic"` since they depend on
per-request identity headers.

**AI research pipeline is evidence-only by design**, enforced by
`tests/operator-workflow-contract.test.mjs`:
- `lib/research/ai-search-agent.ts#searchForResearch` only calls `namespace.get(instanceName).search(...)`
  against the `AI_SEARCH` binding — retrieval only. It must never call `.create()` / index /
  publish / mutate canonical facts; the contract test greps for that.
- `worker/workflows/product-research.ts` (`GearSwipeProductResearchWorkflow`, a Cloudflare
  Workflow) is the durable backbone: normalizes product identity, picks an `AcquisitionRoute`
  (`WATCH` / `WEB_RESEARCH` / `BUY` / `RETAIL_VISIT` / `REQUEST_LOANER` / `REQUEST_SAMPLE` /
  `SEEK_SPONSORSHIP` / `CONTACT_BRAND` / `REJECT`), and for routes needing physical acquisition
  uses `step.waitForEvent(..., { timeout: "30 days" })` before assembling an `EvidencePacket`. It
  intentionally stops short of a wired crawler/AI Search stack — it establishes checkpoints and
  the human-acquisition boundary for later steps to build on.
- `app/api/admin/research/jobs/route.ts` must stay behind `requireOperator` and persist results
  into `researchEvidence`, never directly into canonical tables — AI output is reviewable evidence,
  not truth. Read the assertions in `tests/operator-workflow-contract.test.mjs` before touching any
  of these three files; they encode contracts the tests check via source-pattern matching, not
  behavior, so a refactor that changes wording/structure can break CI even if behavior is
  unchanged.

**Content sources**: Sanity CMS (`lib/sanity-client.ts`, `@sanity/client`) is used alongside the D1
tables above for some editorial content — see `SANITY_SETUP.md` before wiring new Sanity queries.

**Mail routing**: inbound Cloudflare Email Routing messages are classified by `lib/mail-routing.ts`
(`resolveMailRoute(workspace, formType)`) into workspace ("Gearswipe" vs "Gold Shore") and form
type (contact/quote/subscribe/auth), stored via `lib/mail-store.ts`, and optionally acknowledged
via `lib/email-service.ts#sendAutoReply`. This repo shares mail infrastructure conventions with a
sibling "Gold Shore" brand/workspace referenced throughout (`docs/`, `AGENTS.md`) — GearSwipe is
the storefront brand; cross-site routing/DNS/ownership canon lives outside this repo (see
`README.md`).

**Deployment topology** (`DEPLOYMENT.md` has the full diagram/runbook): Cloudflare edge → Worker
(`gearswipe`, this repo, `worker/index.ts`) → D1/R2/Email Routing, all dashboard-configured except
the one `wrangler.toml` D1 binding. HostGator is a static-only emergency fallback, not a routing
hub. `npm run deploy:hostgator` builds and runs `scripts/deploy-hostgator.sh` for that path only.

## Conventions from `AGENTS.md` worth internalizing

- Categories/taxonomy are generated views over an entity+relationship graph, not the source of
  truth — avoid rigid category-tree modeling in new schema work.
- Complex role-specific tooling (Contributor Studio, Collector Vault, Seller Console, Research
  Workspace, Moderation, Sponsor Portal, Admin/Operator) must not leak into the default public
  experience; build role-specific UI only when the role actually needs it.
- Timeline/Lens views must not ship the full knowledge graph to the browser — use
  viewport-specific, bounded payloads.
- Commercial actors may buy placement/sponsorship/referral surface area; they never get to own
  canonical metadata, historical conclusions, taxonomy, moderation outcomes, provenance, or
  editorial deletion rights.
- Frontend stays simple, mobile-first, responsive, PWA-friendly; avoid dashboard-first public UX
  and transaction friction.

## Actions requiring confirmation

Treat these as requiring explicit user go-ahead, consistent with `AGENTS.md`'s "prefer small
reversible PRs" and this repo's history of dashboard/config drift causing outages:
- `wrangler deploy` / `npm run deploy` / `npm run deploy:workers` / `npm run deploy:hostgator`
- Any edit to `wrangler.toml` beyond the existing `DB` binding, or to Cloudflare Dashboard settings
- Changes to `GEARSWIPE_ADMIN_EMAILS`, `AUTH_SECRET`, or other production secrets/env vars
