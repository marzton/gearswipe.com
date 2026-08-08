# GearSwipe Deployment Architecture

## Overview

GearSwipe uses a modern edge-first architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare (Global Edge)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  DNS, DDoS protection, cache, rate limiting          │  │
│  │  SSL/TLS termination (Full Strict)                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ▼                               ▼
    ┌──────────────┐           ┌──────────────────┐
    │ gearswipe.com        │  │  api.gearswipe.com   │
    │  (Storefront)        │  │  (Quote API)     │
    └──────────────┘           └──────────────────┘
          ▼                               ▼
    ┌──────────────┐           ┌──────────────────┐
    │  Worker      │           │  Quote Worker    │
    │  (Vinext)    │           │  (TypeScript)    │
    └──────────────┘           └──────────────────┘
         │ ▼                              │
    ┌──────────────────────────────────────────────┐
    │  Cloudflare Services                         │
    │  - D1 (SQLite)                               │
    │  - R2 (Object Storage)                       │
    │  - Durable Objects (sessions)                │
    │  - Email Routing (inbound mail)              │
    │  - Analytics                                 │
    └──────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────────────┐
    │  HostGator (Fallback / Static Origin)        │
    │  - Static SPA build (emergency cutover)      │
    │  - .htaccess for SPA routing                 │
    └──────────────────────────────────────────────┘
```

## Components

### 1. Main Storefront (`gearswipe.com`)

**Framework**: Next.js 16 with Vinext (edge runtime)  
**Deployment**: Cloudflare Workers  
**Entry point**: `worker/index.ts`

Features:
- Server-side rendering (RSC)
- Image optimization at the edge
- Mail routing (inbound email handling)
- Security headers (HSTS, CSP, CORS policies)
- Session management via Durable Objects
- Tailwind CSS styling

**Deploy**:
```bash
npm run build
wrangler deploy -c wrangler.toml --env production
```

### 2. Quote API (`api.gearswipe.com`)

**Framework**: TypeScript on Cloudflare Workers  
**Entry point**: `worker/quote-api.ts`  
**Database**: D1 (optional, for quote storage)

Endpoints:
- `POST /quote` — Calculate quote from product IDs + quantities
- `GET /quote/:id` — Retrieve stored quote
- `GET /health` — Liveness check

**Deploy**:
```bash
wrangler deploy -c wrangler.quote-api.toml --env production
```

### 3. HostGator (Fallback/Emergency)

For emergencies where Cloudflare is unavailable:

- **Static SPA build** in `dist/` directory
- **Apache .htaccess** for SPA routing (`artifacts/coming-soon/public/.htaccess`)
- **Deploy script**: `scripts/deploy-hostgator.sh`

Only use if Cloudflare Workers are down; primary entry point is always via Cloudflare DNS.

**Deploy**:
```bash
npm run build
export HOSTGATOR_USER=... HOSTGATOR_HOST=... HOSTGATOR_DOCROOT=...
bash scripts/deploy-hostgator.sh
```

## Build Process

```bash
# Install dependencies
pnpm install

# Development (local Vite + Miniflare)
pnpm dev

# Production build (Next.js → static output + Worker bundle)
pnpm build

# Test production build
pnpm start

# Unit/integration tests
pnpm test
```

Build output:
- `.next/` — Next.js build cache
- `dist/` — Static assets (fallback for HostGator)
- Worker bundle — compiled TypeScript for Cloudflare

## Deployment Flow

### 1. Staging

Deploy to staging subdomain for testing:

```bash
wrangler deploy -c wrangler.toml --env staging
wrangler deploy -c wrangler.quote-api.toml --env staging
```

Test at `https://staging.gearswipe.com` and `https://api.staging.gearswipe.com`

### 2. Production

Once staging is verified:

```bash
wrangler deploy -c wrangler.toml --env production
wrangler deploy -c wrangler.quote-api.toml --env production
```

Deployed to `https://gearswipe.com` and `https://api.gearswipe.com`

### 3. DNS & Routing

Cloudflare DNS configuration:

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| A | `@` | Cloudflare Worker | Proxied |
| CNAME | `www` | `gearswipe.com` | Proxied |
| CNAME | `api` | `gearswipe-quote-api.workers.dev` | Proxied |

**Note**: DNS points directly to Cloudflare Workers. HostGator is only used as an emergency static fallback if the Worker is unavailable.

## Environment Configuration

### Main Worker (`wrangler.toml`)

Required bindings (set in Cloudflare dashboard):
- `ASSETS` — Static asset fetcher
- `IMAGES` — Image optimization service
- `DB` (optional) — D1 database
- `EMAIL` (optional) — Email routing service

Environment variables:
- `ENVIRONMENT` — "production" or "staging"

### Quote API Worker (`wrangler.quote-api.toml`)

Required bindings:
- `DB` (optional) — Quote storage

Environment variables:
- `SHOPIFY_STOREFRONT_TOKEN` — Shopify Storefront API token
- `SHOPIFY_STORE_URL` — Shopify store domain (e.g., `mystore.myshopify.com`)

## Scaling & Performance

### Caching

- **Static assets** (hashed filenames): Cache indefinitely
- **HTML (index.html)**: Cache for 0s (always fresh)
- **API responses**: No cache (always hit origin)
- **Cloudflare cache**: Purge via dashboard or API on deploy

### Rate Limiting

Quote API rate limits (prevent abuse):
- 100 requests/minute per IP
- 1000 requests/hour per IP

Configure in Cloudflare dashboard → Security → Rate limiting.

### Monitoring

- **Cloudflare Analytics** — Request volume, cache hit ratio, error rates
- **Worker Logs** — Real-time log streaming (`wrangler tail`)
- **Error Tracking** — Via mail routing and D1 logging

## Troubleshooting

### Worker deployment fails

```bash
wrangler deploy --env production 2>&1 | head -50
```

Check:
- Wrangler version: `wrangler --version`
- Authentication: `wrangler login`
- Account ID: `wrangler whoami`

### Quote API 502 errors

```bash
# Test endpoint
curl -X POST https://api.gearswipe.com/quote \
  -H "Content-Type: application/json" \
  -d '{"productIds":["1"],"quantities":[1]}'

# Check logs
wrangler tail -c wrangler.quote-api.toml --env production
```

### Site slow after deploy

```bash
# Purge Cloudflare cache
curl -X POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache \
  -H "Authorization: Bearer {api_token}" \
  -d '{"files":["https://gearswipe.com/*"]}'
```

### Switch to HostGator fallback (emergency only)

```bash
# Update Cloudflare DNS A record to HostGator IP
# Apex: 192.0.2.100 (example)
# www: gearswipe.com (unchanged)

# Verify
curl -I https://gearswipe.com
# Should resolve through HostGator after DNS TTL expires
```

## Rollback

### Workers

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --env production
```

### DNS

```bash
# Restore previous DNS records
# Cloudflare dashboard → DNS → Revert to snapshot
```

## References

- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)
- [Vinext docs](https://github.com/cloudflare/next-on-pages)
- [D1 database](https://developers.cloudflare.com/d1/)
- [Email routing](https://developers.cloudflare.com/email-routing/)
