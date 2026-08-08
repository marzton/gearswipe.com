# GearSwipe HostGator + Cloudflare Deployment

## Target architecture

- Source of truth: GitHub (`marzton/gearswipe.com`)
- Build workspace: Replit / local pnpm workspace
- Static origin: HostGator Apache hosting
- Edge/DNS/TLS: Cloudflare
- Commerce: Shopify Storefront API
- Quote API: separate HTTPS endpoint (recommended: Cloudflare Worker at `api.gearswipe.com`)

## Frontend build

Build the storefront and upload the contents of the generated static output directory to the HostGator web root for `gearswipe.com`.

The application is a client-rendered Vite SPA. Apache must use the committed `.htaccess` fallback so deep links such as `/browse`, `/compare`, `/quote`, and `/product/...` resolve through `index.html`.

## HostGator requirements

Before production cutover, confirm in the current HostGator account:

1. Hosting service is active.
2. `gearswipe.com` is added to the hosting account as the correct domain/addon domain.
3. Current shared/dedicated server IP is known.
4. SSL certificate is active on the HostGator origin.
5. The document root is known and writable.

Do not use historical server IPs without current verification.

## Cloudflare DNS target

After the current HostGator server IP is verified:

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| A | `@` | `<CURRENT_HOSTGATOR_IP>` | Proxied |
| CNAME | `www` | `gearswipe.com` | Proxied |
| CNAME | `api` | `<QUOTE_WORKER_HOSTNAME>` | Proxied, if using Cloudflare Worker |

Preserve existing MX, TXT, SPF, DKIM, DMARC, ownership-verification, and unrelated subdomain records.

## Cloudflare SSL/TLS

Preferred mode: **Full (strict)** after HostGator has a valid origin certificate.

Do not use Flexible unless there is no working HTTPS certificate at the origin and only as a temporary fallback.

Recommended edge settings:

- Always Use HTTPS: enabled
- Automatic HTTPS Rewrites: enabled where compatible
- Brotli: enabled
- HTTP/3: enabled
- Cache static hashed assets aggressively
- Do not cache dynamic API responses

## Shopify

Build-time variables must be configured before the production storefront is built. Do not commit real credentials.

The Storefront token is suitable for browser-side storefront usage only when created/configured for that purpose. Never expose Shopify Admin API credentials in the client bundle.

## Quote API

HostGator static hosting cannot execute the existing Cloudflare Pages Function. Recommended production arrangement:

- frontend: `https://gearswipe.com`
- quote API: `https://api.gearswipe.com`
- implementation: standalone Cloudflare Worker

Set the storefront API base to the Worker hostname during the production build.

## Cutover checklist

- [ ] Replit source imported into GitHub integration branch
- [ ] Production build succeeds from GitHub source
- [ ] `.htaccess` is present in the deployed web root
- [ ] HostGator origin responds by IP/temporary URL
- [ ] HostGator SSL is valid
- [ ] Current HostGator IP confirmed
- [ ] Quote endpoint deployed and tested
- [ ] Shopify storefront credentials configured
- [ ] Cloudflare DNS records reviewed
- [ ] DNS cutover performed
- [ ] Apex and `www` return 200 over HTTPS
- [ ] Deep-link refresh tested
- [ ] Quote submission tested
- [ ] Product/catalog calls tested
- [ ] Existing mail/DNS records remain intact

## Rollback

Before changing the apex record, record the existing DNS target. If the HostGator origin fails after cutover, restore the previous apex/www target in Cloudflare and purge only affected cache entries if needed.
