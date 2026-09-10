# Deployment validation — 2026-08-08

Validation pass against live `gearswipe.com`, follow-up to the Cloudflare
deployment audit in `marzton/gearswipe.com` (PR #7, merged).

**Headline: production is running a stale build.** The repository contains a
full storefront — shop, auth, rewards, a custom-PC builder, and six API routes
— and **none of it is live**. Only the homepage is deployed.

---

## 1. What is live

```
GET https://gearswipe.com/   → 200, 24,256 bytes
<title>Gearswipe — Tech Storefront</title>
```

Serving is healthy: assets load (`index.js` 80,717 B, `index.css` 15,940 B,
favicon), HTTP redirects to HTTPS (302), `www` responds 200, TLS is valid, and
DNS is unchanged on the Cloudflare anycast pair (`172.67.190.113`,
`104.21.19.229`).

## 2. What is not live

`vinext build` reports these routes. Every one returns `404 Not Found` in
production:

| Route | Build classification | Live |
|---|---|---|
| `/shop` | static/unknown | ❌ 404 |
| `/login` | static/unknown | ❌ 404 |
| `/signup` | static/unknown | ❌ 404 |
| `/rewards` | static/unknown | ❌ 404 |
| `/build/custom-pc` | static/unknown | ❌ 404 |
| `/api/quote` | λ server | ❌ 404 |
| `/api/contact` | λ server | ❌ 404 |
| `/api/mail` | λ server | ❌ 404 |
| `/api/subscribe` | λ server | ❌ 404 |
| `/api/signup` | λ server | ❌ 404 |
| `/api/auth/:nextauth+` | λ server | ❌ 404 |

The deployed Worker predates all of it. **The fix is a deploy, not
development.**

### Correction to the audit

The audit (§4) recorded "no quote API exists — building it is net-new work."
**That was wrong.** `/api/quote` exists in this repository as a server route.
It has simply never been deployed. The same applies to the audit's
characterisation of the site as absent: it was absent from the GitHub repo that
was audited, but present here all along — these are two different
repositories.

An intermediate reading during validation — that the 404s meant a deliberate
one-page site — was also wrong, and for an instructive reason: the homepage is
client-rendered and contains only `#catalog` and `#details` anchors, so the
served HTML shows no links to the other pages. The route table only becomes
visible from `vinext build` output. Absence of links in the HTML was not
evidence of absence of routes.

## 3. Email — changed since the audit

| Record | At audit (08-07) | Now (08-08) | Assessment |
|---|---|---|---|
| `_dmarc` | **two** TXT records | **one** record | ✅ **Fixed.** Per RFC 7489 §6.6.3 duplicates made DMARC unenforced; `p=reject` now genuinely applies |
| SPF | `v=spf1 -all` | **absent** | ⚠️ **Confirm intended** |
| Google verification | present | present | ✅ Preserved |
| MX | none | none | ➖ Unchanged — no inbound mail |

Current DMARC:

```
v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:marstonr6@gmail.com
```

The SPF removal was verified against both Cloudflare and Google resolvers, and
the apex TXT TTL moved 300 → 3600, so it was a deliberate edit rather than
propagation lag.

Defensible if mail is about to be enabled — `-all` would block legitimate
sending, and `p=reject` still stops spoofing on its own. But if it was
collateral from the DMARC cleanup, restore `v=spf1 -all`. This needs a
deliberate decision either way.

## 4. Security headers — added, not yet live

Production currently sends **no** HSTS, CSP, `X-Frame-Options`,
`X-Content-Type-Options`, or `Referrer-Policy`. The earlier Cloudflare Pages
backend at least sent `referrer-policy`; moving to the Worker dropped it.

`worker/index.ts` now applies a baseline at the edge to every response:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=86400` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Deliberate choices:

- **HSTS is in safe mode** — one day, no `includeSubDomains`, no `preload`.
  Browsers cache HSTS, so an over-broad policy cannot be undone by shipping a
  fix; it has to expire. Raise to `31536000` with `preload` only once every
  hostname on the domain — including any future `api.` — is confirmed
  HTTPS-only.
- **No CSP.** A CSP worth having needs testing against React hydration and any
  Shopify/analytics scripts added later. Shipping one blind risks breaking the
  storefront. Add it behind a preview deploy.
- Existing headers are never overwritten, and WebSocket upgrades (101) are
  passed through untouched.

**These take effect on the next deploy, not before.**

## 5. Outstanding

| Item | State |
|---|---|
| Deploy current build | ❌ **The main gap** — the whole storefront is undeployed |
| SPF | ⚠️ Removed; confirm intended |
| DNSSEC | ❌ Still off — no DS at `.com` |
| `api.gearswipe.com` | ❌ NXDOMAIN. `/api/quote` exists but lives under the apex; a subdomain is a routing decision, not new development |
| Shopify | ❌ Not wired — no external or checkout links on the live page |
| 404 page | ⚠️ Bare-text `Not Found`, unstyled |
| `www` canonical | ⚠️ Serves 200 directly; no redirect to apex (SEO duplicate content) |
| CSP | ⚠️ Deliberately deferred (§4) |

## 6. Verification performed

- `npx tsc --noEmit` — the worker change adds **zero** new type errors.
  Three pre-existing errors (`D1Database`, `Fetcher` in `db/index.ts` and the
  `Env` interface) are missing Cloudflare Workers types; confirmed identical on
  a stashed baseline.
- `npm run test` (`vinext build` + `node --test`) — build completes, **2/2
  tests pass**, exit 0.
- Live HTTP probes and DNS-over-HTTPS against two independent resolvers.

The header change is verified to compile and not break the build. It is **not**
verified in production, because it has not been deployed.
