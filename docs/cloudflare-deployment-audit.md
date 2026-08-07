# GearSwipe Cloudflare Deployment Audit

**Date:** 2026-08-07
**Zone:** gearswipe.com
**Cloudflare account:** Gold Shore Labs (`f77de112d2019e5456a3198a8bb50bd2`)
**Status:** ⛔ **HALTED — no changes applied.** Two stop conditions were met.

---

## 0. Stop conditions triggered

The deployment was halted before any DNS or configuration change was made.

| # | Stop condition | Finding |
|---|---|---|
| 1 | **Nothing to deploy** | This repository contains no website. Every commit on every branch contains only `README.md`, `LICENSE`, `SECURITY.md`, and `.github/*`. There is no HTML, framework, build config, `wrangler.toml`, or Pages config anywhere in history. |
| 2 | **Origin cannot be verified** | The only candidate origin (`50.87.146.6`) is a real HostGator host but is **not a valid origin** — it 301-redirects back to `https://gearswipe.com/`. Pointing DNS at it creates an infinite redirect loop. |

A third, pre-existing production defect was found and is documented below (duplicate DMARC record). It was **not** corrected, because correcting it modifies an email record.

---

## 1. DNS inventory

### Method and limitation

No Cloudflare API token is present in this environment, and the Cloudflare MCP server exposes no DNS endpoints. This inventory was therefore built from **live public DNS resolution**, cross-checked against two independent resolvers (Cloudflare `1.1.1.1` and Google `8.8.8.8`), plus authenticated Workers metadata via MCP.

**This means the inventory is complete for records that resolve publicly, but cannot see:**
- records that exist in the zone but were not guessed by name (subdomain enumeration was dictionary-based),
- the true origin behind proxied (orange-cloud) records,
- record-level proxy status, TTL-as-configured, and comments/tags.

A full authoritative export still requires `GET /zones/{zone_id}/dns_records` with a scoped API token. **Treat this inventory as accurate but not provably exhaustive.**

### gearswipe.com — resolved records

| Type | Name | Value | TTL | Notes |
|---|---|---|---|---|
| NS | `gearswipe.com` | `george.ns.cloudflare.com`, `mia.ns.cloudflare.com` | 86400 | Zone is fully delegated to Cloudflare |
| SOA | `gearswipe.com` | `george.ns.cloudflare.com dns.cloudflare.com` | 1800 | serial 2409574814 |
| A | `gearswipe.com` | `172.67.190.113`, `104.21.19.229` | 300 | Cloudflare anycast — **proxied**, origin hidden |
| AAAA | `gearswipe.com` | `2606:4700:3035::6815:13e5`, `2606:4700:3037::ac43:be71` | 300 | Cloudflare anycast — **proxied** |
| A | `www.gearswipe.com` | `172.67.190.113`, `104.21.19.229` | 300 | Same anycast pair as apex — **proxied** |
| TXT | `gearswipe.com` | `google-site-verification=vkR9r6ZOkdiNIT8X3ZUkX06aaEXdSisMsTsNnhLzZ38` | 300 | 🔒 Ownership verification — preserve |
| TXT | `gearswipe.com` | `v=spf1 -all` | 300 | 🔒 SPF: domain sends **no** mail — preserve |
| TXT | `_dmarc.gearswipe.com` | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:marstonr6@gmail.com` | — | 🔒 DMARC — preserve |
| TXT | `_dmarc.gearswipe.com` | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;` | — | ⚠️ **DUPLICATE** — see §3.1 |
| TXT | `google._domainkey.gearswipe.com` | `v=DKIM1; p=` | — | 🔒 DKIM with empty key = explicitly revoked selector — preserve |
| **MX** | `gearswipe.com` | **none** | — | ⚠️ No inbound mail configured (NOERROR/NODATA, not NXDOMAIN) |
| **CAA** | `gearswipe.com` | **none** | — | No certificate-authority restriction |
| **DS** | `gearswipe.com` (at `.com`) | **none** | — | ⚠️ **DNSSEC not enabled** |
| SRV | — | none found | — | None discovered |

**Subdomains probed and confirmed absent (NXDOMAIN):** `api`, `shop`, `store`, `staging`, `preview`, `admin`, `mail`, `app`, `cdn`, `quote`.

### Email posture summary

gearswipe.com is currently configured as a **non-mailing domain**: no MX (receives nothing), `v=spf1 -all` (authorizes no senders), a revoked DKIM selector, and `p=reject` DMARC. This is internally consistent and appears deliberate. **There is no live production mail flow on this domain to break** — but the records themselves are load-bearing anti-spoofing controls and must be preserved exactly.

Note the contrast with sibling domains in the same account, which *do* run live mail via Cloudflare Email Routing (see §1.1). If gearswipe.com is *supposed* to receive mail, that is a separate gap to raise with the owner — not something this deployment should silently introduce.

### 1.1 Additional domains — READ ONLY, not modified

Inspected for context only, per instruction. **No changes proposed or made.**

| Domain | NS | Mail | Notes |
|---|---|---|---|
| `goldshore.org` | `casey`/`fiona`.ns.cloudflare.com | Cloudflare Email Routing (`route1-3.mx.cloudflare.net`) | Live mail. Verifications: Google, Apple ×2, OpenAI, Twilio, Cloudflare SSO/OAuth. SPF `include:_spf.mx.cloudflare.net ~all` |
| `armsway.com` | `brady`/`luciana`.ns.cloudflare.com | Cloudflare Email Routing | Live mail. SPF includes iCloud + MailChannels |
| `goldshore.foundation` | **none** | — | Does not resolve at all — no NS delegation. Either unregistered or not delegated |

### 1.2 Workers inventory (authenticated, via MCP)

23 Workers exist in the Gold Shore Labs account. Those relevant to gearswipe.com:

| Worker | Last modified | Relevance |
|---|---|---|
| `gs-web-prod` | **2026-08-07 15:30** | Likely bound to the apex — modified hours before this audit |
| `gs-gateway-prod` | **2026-08-07 15:30** | Modified same window |
| `gs-api-prod` | **2026-08-07 15:29** | Modified same window |
| `gs-api` | **2026-08-07 15:14** | Modified same window |
| `gs-www-redirect-production`, `gs-www-redirect-prod` | 2026-07-19 / 06-30 | ⚠️ Two near-identical www-redirect Workers — likely one is obsolete |
| `gs-api-preview`, `gs-api-staging`, `gs-web` | Jul 2026 | Non-production |
| `gs-mail`, `gs-email-router` | Jul 2026 | ⚠️ Mail-related Workers exist despite no MX record |
| `gs-signals`, `gs-signals-prod`, `gs-admin`, `gs-trading-prod`, `gs-risk-radar`, `gs-todo`, `goldclaw`, `goldshore-ai`, `armsway-com`, `banproof-me`, `banproof-me-prod`, `partners-in-pools` | various | Other properties — out of scope |

The MCP server does not expose Worker **route bindings**, so which Worker answers `gearswipe.com/*` could not be confirmed authoritatively. Four production Workers were modified within ~2 hours of this audit, which means **someone or something else is actively changing this environment right now.**

---

## 2. Architecture determination

**Neither Option A (Pages) nor Option B (HostGator). Production is Cloudflare Workers, and it is serving nothing.**

Evidence:

```
GET https://gearswipe.com/            → 404, content-length: 0
GET https://gearswipe.com/index.html  → 404, content-length: 0
GET https://gearswipe.com/health      → 404, content-length: 0
GET https://gearswipe.com/api/health  → 404, content-length: 0
GET https://gearswipe.com/api/quote   → 404, content-length: 0
GET https://gearswipe.com/shop        → 404, content-length: 0
GET https://gearswipe.com/products    → 404, content-length: 0
GET https://gearswipe.com/robots.txt  → 200, 1836 bytes
```

Response headers on the 404s:

```
server: cloudflare
cf-cache-status: DYNAMIC
access-control-allow-origin: *
cache-control: no-store
referrer-policy: strict-origin-when-cross-origin
alt-svc: h3=":443"; ma=86400
```

Interpretation:

- `cf-cache-status: DYNAMIC` + `access-control-allow-origin: *` + `cache-control: no-store` is a **Worker** response signature, not Pages static hosting and not an origin pull. Cloudflare Pages returns a styled 404 page with a body; this returns zero bytes.
- **The 200 on `/robots.txt` is a false positive.** Its content is Cloudflare's *managed* robots.txt (the AI-crawler-control feature — `Content-Signal: search=yes,ai-train=no`, blocking GPTBot/ClaudeBot/CCBot etc.). It is injected by Cloudflare's edge, **not served by the site**. It is the only path that returns a body, which confirms there is no application behind the hostname.
- Therefore: DNS, TLS, and proxying are all healthy. **There is simply no application bound to the hostname.**

### The HostGator IP — verified, and verified *unusable*

The prompt flagged `50.87.146.6` as not-to-be-used-unless-confirmed. It was tested:

```
PTR 6.146.87.50.in-addr.arpa          → gator3003.hostgator.com.
curl -H 'Host: gearswipe.com' http://50.87.146.6/  → 301 → https://gearswipe.com/
curl (no Host override)  http://50.87.146.6/       → 302 → http://50.87.146.6/404.html
curl -L -H 'Host: gearswipe.com' ...               → final https://gearswipe.com/ → 404, 0 bytes
```

**It is genuinely a HostGator server, and it genuinely still has a vhost for gearswipe.com — but that vhost only redirects back to Cloudflare.** It hosts no content.

⛔ **Option B is not merely unverified, it is actively unsafe.** Setting `A @ → 50.87.146.6` proxied through Cloudflare would produce:

```
client → Cloudflare → HostGator → 301 https://gearswipe.com/ → Cloudflare → HostGator → ∞
```

An infinite redirect loop, i.e. a hard outage. This is exactly the failure the "do not use unless confirmed as current" guard existed to prevent. **HostGator is a decommissioned origin. Do not point DNS at it.**

---

## 3. Risk assessment

### 3.1 🔴 HIGH — Duplicate DMARC record silently disables DMARC

`_dmarc.gearswipe.com` returns **two** TXT records. Confirmed against both Cloudflare and Google resolvers.

Per **RFC 7489 §6.6.3**, when a DMARC query returns more than one record beginning `v=DMARC1`, receivers **must treat the domain as having no DMARC record at all.** The `p=reject` policy is therefore **not being enforced today.** The domain is spoofable despite appearing locked down.

The two records differ only in the `rua=` reporting address, so this is almost certainly an accidental duplicate from an earlier edit.

**Not fixed in this pass** — it is an email record, and the brief mandates a stop rather than an unattended edit. The fix is a one-record deletion and is specified in §4. It should be done deliberately, and it is worth doing soon: this is a live security gap independent of any deployment.

### 3.2 🔴 HIGH — Nothing to deploy

No site code exists in this repository. Any "deployment" would publish an empty site over a hostname that is already live. There is no artifact, no build, and no preview to validate.

### 3.3 🔴 HIGH — Concurrent modification of production

`gs-web-prod`, `gs-gateway-prod`, `gs-api-prod`, and `gs-api` were all modified on 2026-08-07 between 15:14 and 15:30 UTC — within about two hours of this audit. Another actor (person, CI pipeline, or agent) is changing production concurrently. **Applying DNS changes now risks colliding with in-flight work.** Establish who owns those changes before touching the zone.

### 3.4 🟠 MEDIUM — DNSSEC not enabled

No DS record is published at the `.com` parent. The zone is unsigned and vulnerable to DNS spoofing/cache poisoning. Enabling it is a two-step operation (enable in Cloudflare, then publish the DS at the registrar); enabling in-zone without publishing the DS achieves nothing, and publishing a mismatched DS makes the domain **resolve nowhere globally**. This is the single highest-blast-radius item on the list and must not be rushed.

### 3.5 🟠 MEDIUM — Apex and www are independent A records

`www` is a separate A record pointing at the same anycast pair, not a CNAME to the apex. It will not track apex changes. Any apex IP change must be mirrored to `www` or the two will diverge. The brief's own target state (`CNAME www → gearswipe.com`) does not match what is deployed.

### 3.6 🟡 LOW — Redundant www-redirect Workers

`gs-www-redirect-production` and `gs-www-redirect-prod` both exist. One is very likely obsolete. Deleting the wrong one breaks www redirection. Identify routes before removing either.

### 3.7 🟡 LOW — No CAA records

Any public CA may issue for this domain. Adding CAA reduces mis-issuance risk but will break future certificate issuance if it omits an issuer actually in use (currently Google Trust Services via Cloudflare Universal SSL, plus Let's Encrypt as Cloudflare's fallback). Low urgency; get the issuer set right before adding.

### 3.8 🟡 LOW — Mail Workers with no MX

`gs-mail` and `gs-email-router` exist but no MX record routes anything to them. Either dead code or an incomplete mail setup. Worth clarifying — it may indicate mail was intended and never finished.

### 3.9 ⚪ INFO — Already-healthy items

TLS is valid (`CN=gearswipe.com`, Google Trust Services WE1, TLS 1.3, expires 2026-09-26). HTTP/2 negotiated, HTTP/3 advertised via `alt-svc`. `referrer-policy` already set. These need no action.

---

## 4. Proposed changes

**None applied.** All items below are proposals requiring explicit approval.

### Tier 0 — Do first, independent of any deployment

| # | Change | Rationale | Risk |
|---|---|---|---|
| 0.1 | Delete **one** of the two `_dmarc` TXT records — keep the one **with** `rua=mailto:marstonr6@gmail.com`, delete the bare one | Restores DMARC enforcement (§3.1) | Low — but it is an email record; requires sign-off |
| 0.2 | Export the full authoritative zone via API and re-run this inventory | Closes the enumeration gap in §1 | None (read-only) |
| 0.3 | Identify the owner of the 2026-08-07 Worker changes | Avoid collision (§3.3) | None |

### Tier 1 — Blocked until a site exists

| # | Change | Blocked on |
|---|---|---|
| 1.1 | Build/commit the actual website | Site code does not exist |
| 1.2 | Create Pages project **or** confirm the existing Worker as the web target | 1.1 + route ownership |
| 1.3 | Bind `gearswipe.com` + `www.gearswipe.com` to the deployment | 1.2 |
| 1.4 | Configure preview deployments | 1.2 |

### Tier 2 — Safe hardening, after Tier 1 validates

SSL Full (Strict); Always Use HTTPS; HSTS in **safe mode** (short `max-age`, no `preload`, no `includeSubDomains` until sibling hosts are confirmed HTTPS-only); TLS 1.3 (already active); Brotli; HTTP/3 (already advertised); cache rules; security headers; bot protection.

⚠️ **Auto Minify is deprecated and was removed by Cloudflare** — do not attempt to enable it. ⚠️ **Rocket Loader must stay off** until there is a site to regression-test; it reorders script execution and commonly breaks SPA hydration and third-party checkout scripts.

### Tier 3 — Requires registrar coordination

DNSSEC: enable in Cloudflare, then publish the DS record at the registrar, then verify. Do not do this in the same change window as anything else.

### API subdomain (`api.gearswipe.com`)

**Blocker documented, per instruction.** `api.gearswipe.com` does not resolve, and no quote API source exists in this repository. However, Workers named `gs-api`, `gs-api-prod`, `gs-api-staging`, and `gs-api-preview` **do** exist in the account and three were modified today — so a quote API may well exist, deployed from **a different repository**. Locate that repository before creating any `api.` record; provisioning one here risks shadowing working infrastructure.

---

## 5. Rollback plan

Current state is captured below as executable restore commands. **Because no change was applied, these are pre-recorded restore points, not undo steps for work performed.**

Requires: `CF_API_TOKEN` (Zone.DNS:Edit) and `ZONE_ID`. Never commit these values.

### 5.0 Capture full backup before any change (run this first)

```bash
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=500" \
  > gearswipe-dns-backup-$(date +%Y%m%dT%H%M%SZ).json
```

This is the authoritative rollback source — it captures proxy status, TTLs, and record IDs that public resolution cannot see.

### 5.1 Restore apex A records

```bash
# Proxy status assumed ON (orange cloud) — confirm against the 5.0 backup before running
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"A","name":"gearswipe.com","content":"172.67.190.113","ttl":300,"proxied":true}'
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"A","name":"gearswipe.com","content":"104.21.19.229","ttl":300,"proxied":true}'
```

### 5.2 Restore www A records

```bash
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"A","name":"www.gearswipe.com","content":"172.67.190.113","ttl":300,"proxied":true}'
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"A","name":"www.gearswipe.com","content":"104.21.19.229","ttl":300,"proxied":true}'
```

### 5.3 Restore email + verification records (critical path)

```bash
# SPF
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"TXT","name":"gearswipe.com","content":"v=spf1 -all","ttl":300}'

# Google site verification
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"TXT","name":"gearswipe.com","content":"google-site-verification=vkR9r6ZOkdiNIT8X3ZUkX06aaEXdSisMsTsNnhLzZ38","ttl":300}'

# DMARC — record to KEEP
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"TXT","name":"_dmarc.gearswipe.com","content":"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:marstonr6@gmail.com","ttl":300}'

# DKIM (revoked selector — restore exactly as-is)
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"TXT","name":"google._domainkey.gearswipe.com","content":"v=DKIM1; p=","ttl":300}'
```

**To fully revert change 0.1** (restore the duplicate DMARC, re-breaking DMARC — only if the deletion causes unforeseen fallout):

```bash
curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"TXT","name":"_dmarc.gearswipe.com","content":"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;","ttl":300}'
```

### 5.4 MX rollback

**No MX records exist.** Correct rollback for MX is therefore: **ensure none exist.** If any MX record appears on this zone and was not deliberately added, it was not part of the captured baseline and should be removed.

### 5.5 Non-DNS rollback

| Change | Rollback |
|---|---|
| Pages/Worker custom domain binding | Remove the custom domain from the project; DNS reverts to prior record |
| SSL mode change | Restore prior mode (capture with `GET /zones/$ZONE_ID/settings/ssl` first) |
| HSTS | Set `max-age=0` and wait out the previously-served max-age — **browsers that already cached the header cannot be un-pinned**, which is why safe mode matters |
| DNSSEC | Remove DS at registrar **first**, wait for parent TTL, then disable in Cloudflare — reversing this order breaks resolution globally |
| Rocket Loader / cache rules | Toggle off; purge cache |

---

## 6. Deployment summary

**No deployment performed. No DNS record created, modified, or deleted. No Cloudflare setting changed. No Worker deployed.**

Every action taken was read-only: public DNS resolution, unauthenticated HTTP probes, and authenticated read-only Cloudflare MCP calls.

| Requirement | Outcome |
|---|---|
| Audit existing zone | ✅ Complete, with the enumeration caveat in §1 |
| Preserve non-web records | ✅ Nothing touched |
| Deploy website safely | ⛔ Blocked — no site code exists |
| Never break email | ✅ No email record modified. Pre-existing DMARC defect found and reported, not altered |
| Never overwrite DNS without verification | ✅ Nothing overwritten |
| Rollback plan before changes | ✅ §5 |
| API as `api.gearswipe.com` | ⛔ Blocker documented (§4) |
| Security hardening | ⛔ Deferred — hardening an empty hostname is premature |
| DNSSEC | ⛔ Deferred — requires registrar coordination (§3.4) |

---

## 7. Final validation report

Validation of the *current* production state, run against live DNS and HTTPS.

| Check | Result | Detail |
|---|---|---|
| Homepage | ❌ **FAIL** | `GET /` → 404, 0 bytes |
| Deep links | ❌ **FAIL** | All probed paths → 404, 0 bytes |
| SPA routing | ❌ **N/A** | No application deployed |
| 404 handling | ⚠️ **DEGRADED** | Returns 404 correctly but with an empty body — no error page |
| API endpoint | ❌ **FAIL** | `api.gearswipe.com` NXDOMAIN; `/api/*` → 404 |
| SSL certificate | ✅ **PASS** | `CN=gearswipe.com`, Google Trust Services WE1, TLS 1.3, valid to 2026-09-26 |
| Redirects | ⚠️ **UNVERIFIED** | No redirect observed from apex; www-redirect Workers exist but routes unconfirmed |
| WWW redirect | ❌ **FAIL** | `www` returns 404 directly — it does **not** redirect to apex |
| Caching | ⚠️ **N/A** | `cf-cache-status: DYNAMIC`, `cache-control: no-store` — nothing cacheable exists |
| No redirect loops | ✅ **PASS (current)** | None today — **but Option B would create one** (§2) |
| DNS resolution | ✅ **PASS** | Apex, www, A + AAAA all resolve via Cloudflare anycast |
| HTTP/2 | ✅ **PASS** | Negotiated via ALPN |
| HTTP/3 | ✅ **PASS** | `alt-svc: h3=":443"` advertised |
| DNSSEC | ❌ **FAIL** | No DS record at `.com` |
| SPF | ✅ **PASS** | `v=spf1 -all` present and unambiguous |
| DMARC | ❌ **FAIL** | Duplicate records ⇒ policy unenforced per RFC 7489 §6.6.3 |
| MX | ⚠️ **NONE** | No inbound mail — consistent with SPF `-all`, may or may not be intended |

**Overall: the infrastructure layer is healthy and the application layer is empty.** DNS, TLS, proxying, and HTTP/2+3 all work correctly. There is no website behind them.

---

## 8. Recommended next steps

1. **Confirm who modified the four production Workers on 2026-08-07** before any change to this zone (§3.3).
2. **Fix the duplicate DMARC record** (§4, item 0.1) — a live security gap, independent of deployment, and a one-record deletion.
3. **Locate the real gearswipe.com site source.** It is not in this repository. Given `gs-web-prod` exists and was updated today, the site is likely deployed from elsewhere. Identify that repository before building anything new here — otherwise a "deployment" from this repo would overwrite working production with nothing.
4. **Locate the quote API source** for the same reason (§4).
5. **Provision a scoped Cloudflare API token** (Zone.DNS:Edit + Zone.Settings:Edit) so a full authoritative zone export can close the §1 gap.
6. Only then proceed to Tier 1–3.

**Do not point DNS at `50.87.146.6`.** It is a decommissioned HostGator origin that redirects to Cloudflare; using it causes an infinite redirect loop and a hard outage.
