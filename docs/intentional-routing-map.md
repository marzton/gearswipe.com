# Intentional routing map

This is a Gearswipe-facing mirror of the canonical routing source at
`E:\GitHub\marzton\goldshore-ai\docs\canonical-sites-routing.md`.
Keep that GitHub-backed doc as the single source of truth.

The tables below are still useful locally for quick reference, but they should
follow the canonical doc whenever the two differ.

## Active Sites hostnames

| Domain | Status | Notes |
| --- | --- | --- |
| gearswipe.com | active | Primary Gearswipe storefront |
| www.gearswipe.com | active | Canonical www alias |
| goldshore.ai | active | Gold Shore public brand surface |
| www.goldshore.ai | active | Alias for the public brand surface |
| goldshore.org | active | Org/trust surface |
| www.goldshore.org | active | Alias for the org surface |
| admin.goldshore.ai | active | Admin surface on Sites |
| admin.goldshore.org | active | Admin surface on Sites |
| banproof.me | active | Verification / proof surface |
| www.banproof.me | active | Alias for verification surface |
| armsway.com | active | Primary Armsway surface |
| rmarston.com | active | Founder identity surface |
| www.rmarston.com | active | Alias for founder surface |
| fortune-fund.com | active | Financial brand surface |
| www.fortune-fund.com | active | Alias for financial surface |

## Pending / blocked hostnames

| Domain | Status | Blocker |
| --- | --- | --- |
| www.armsway.com | active in Sites | The hostname belongs to the Armsway Sites project; validation is still settling |
| solefoodny.com | active in Sites | The hostname belongs to the Sole Food NY Sites project; the apex still needs registrar-side handling |
| www.solefoodny.com | active in Sites | The hostname belongs to the Sole Food NY Sites project |

## Explicitly external

| Domain | Status | Notes |
| --- | --- | --- |
| partners-in-pools.com | external / client site | Gold Shore docs mark this as external to the repo, so it is not part of the Sites migration target |
| www.partners-in-pools.com | redirect / client alias | Same external ownership note as the apex |

## Notes

- Gearswipe is not the router or umbrella for the rest of the portfolio.
- The public brand sites now belong on Sites.
- The Gold Shore service subdomains still belong to Workers, Pages, Access, or
  Email Routing where the infra docs say they do.
- `partners-in-pools.com` is intentionally external.
- `solefoodny.com` is already a Sites hostname, but the registrar-managed apex
  record still needs external handling.
- `www.armsway.com` is already a Sites hostname; the remaining issue is only
  validation settling, not migration status.
