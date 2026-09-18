# GearSwipe Deployment Architecture

## Overview

GearSwipe uses a modern edge-first architecture managed entirely through the Cloudflare dashboard UI.

> Current production boundary: the storefront Worker (`gearswipe`) is the only
> deployed GearSwipe Worker. The historical quote-worker configuration remains
> source material for a future, separately reviewed API rollout; it is not part
> of the storefront deployment command.

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
    │  Cloudflare Services (Dashboard-configured) │
    │  - D1 (SQLite)                               │
    │  - R2 (Object Storage)                       │
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
**Configuration**: Cloudflare Dashboard UI (not wrangler.toml)

Features:
- Server-side rendering (RSC)
- Image optimization at the edge
- Mail routing (inbound email handling)
- Security headers (HSTS, CSP, CORS policies)
- Session management via Durable Objects

**Deploy**:
```bash
pnpm build
wrangler deploy
```

### 2. Quote API (`api.gearswipe.com`)

**Framework**: TypeScript on Cloudflare Workers  
**Entry point**: `worker/quote-api.ts`  
**Configuration**: Cloudflare Dashboard UI (not wrangler.quote-api.toml)

Endpoints:
- `POST /quote` — Calculate quote from product IDs + quantities
- `GET /quote/:id` — Retrieve stored quote
- `GET /health` — Liveness check

**Deploy**:
```bash
wrangler deploy -c wrangler.quote-api.toml
```

### 3. HostGator (Fallback/Emergency)

For emergencies where Cloudflare is unavailable:

- **Static SPA build** in `dist/` directory
- **Apache .htaccess** for SPA routing (`artifacts/coming-soon/public/.htaccess`)
- **Deploy script**: `scripts/deploy-hostgator.sh`

Only use if Cloudflare Workers are down; primary entry point is always via Cloudflare DNS.

**Deploy**:
```bash
pnpm build
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

# Test production build locally
pnpm start

# Unit/integration tests
pnpm test
```

Build output:
- `.next/` — Next.js build cache
- `dist/` — Static assets (fallback for HostGator)
- Worker bundle — compiled TypeScript for Cloudflare

## Dashboard Configuration (⚠️ All Settings Here)

**⚠️  IMPORTANT: All configuration is done in the Cloudflare dashboard, not in files.**

The `wrangler.toml` files are minimal and only specify entry points. All settings are configured via the UI to avoid conflicts and ensure consistency.

### Storefront Worker Setup

**Cloudflare Dashboard → Workers & Pages → Services → gearswipe**

1. **Routes**: Add routes for `gearswipe.com` and `www.gearswipe.com`
2. **Triggers**: Set up schedule trigger for email routing (optional)
3. **Environment Variables**:
   - `ENVIRONMENT` = `production` (or `staging`)

4. **Service Bindings**:
   - `ASSETS` → Points to static asset namespace
   - `IMAGES` → Points to image optimization service

5. **Database Bindings**:
   - `DB` → set in `wrangler.toml` (`[[d1_databases]]`), not the dashboard. Do
     not add a `DB` binding here — `wrangler deploy` overwrites it from the
     file on every deploy, so a dashboard-side value would be silently
     discarded.

6. **Email Routing**:
   - Enable Email Routing for domain
   - Route inbound mail to worker

### Quote API Worker Setup

**Cloudflare Dashboard → Workers & Pages → Services → gearswipe-quote-api**

1. **Routes**: Add routes for `api.gearswipe.com/*`
2. **Environment Variables**:
   - `SHOPIFY_STOREFRONT_TOKEN` = `your-shopify-token`
   - `SHOPIFY_STORE_URL` = `your-store.myshopify.com`
   - `ENVIRONMENT` = `production`

3. **Database Bindings** (optional):
   - `DB` → D1 database for quote storage

### DNS Configuration

**Cloudflare Dashboard → DNS**

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| A | `@` (root) | Cloudflare Worker | Proxied (Orange) |
| CNAME | `www` | `gearswipe.com` | Proxied (Orange) |
| CNAME | `api` | `gearswipe-quote-api.workers.dev` | Proxied (Orange) |

**Preserve existing records** (MX, TXT, SPF, DKIM, DMARC, CAA, etc.)

### SSL/TLS Configuration

**Cloudflare Dashboard → SSL/TLS**

1. **Encryption Mode**: Full (Strict)
   - Requires valid certificate at origin (HostGator fallback)

2. **Recommended Settings**:
   - Always Use HTTPS: **On**
   - Automatic HTTPS Rewrites: **On**
   - Minimum TLS Version: **1.2**
   - HSTS: **Do not enable** until site is production-stable
     - Once enabled, cannot be disabled (browsers cache forever)

### Caching & Performance

**Cloudflare Dashboard → Caching**

1. **Cache Rules**:
   - Static assets (`/assets/*`): Cache for 1 year
   - HTML: No-cache (always fresh)
   - API (`/api/*`): No-cache

2. **Purge Options**:
   - Purge all: On every production deploy
   - Or purge by URL: Target specific assets

## Deployment Flow

### 1. Local Development

```bash
pnpm dev        # Local Vite server with Miniflare
# Test at http://localhost:3000
```

### 2. Build

```bash
pnpm build      # Next.js + Worker bundle
# Output: .next/, dist/, bundled worker code
```

### 3. Deploy to Workers

```bash
# Deploy main storefront
wrangler deploy

# Deploy Quote API
wrangler deploy -c wrangler.quote-api.toml
```

That's it! No configuration files to edit. Settings are in the dashboard.

### 4. Verify Deployment

```bash
# Check main site
curl -I https://gearswipe.com
# Expected: 200, security headers present

# Check Quote API
curl -I https://api.gearswipe.com/health
# Expected: 200 with JSON response
```

## Scaling & Performance

### Caching Strategy

- **Static assets** (hashed filenames): Cache indefinitely (1 year)
- **HTML (index.html)**: Cache for 0s (always fresh)
- **API responses**: No cache (always hit origin)

Set via **Cloudflare Dashboard → Caching → Cache Rules**

### Rate Limiting

Quote API rate limits (configured in dashboard):
- 100 requests/minute per IP
- 1000 requests/hour per IP

Configure via **Cloudflare Dashboard → Security → Rate limiting**

### Monitoring

- **Analytics**: Cloudflare Dashboard → Analytics
  - Request volume, cache hit ratio, error rates
- **Worker Logs**: 
  ```bash
  wrangler tail
  wrangler tail -c wrangler.quote-api.toml
  ```
- **Error Tracking**: D1 logs + mail routing archives

## Troubleshooting

### Worker deployment fails

```bash
wrangler deploy 2>&1 | head -50
```

Check:
- Wrangler version: `wrangler --version`
- Authentication: `wrangler login`
- Account ID: `wrangler whoami`

### Site returns 404

- Verify routes are added in dashboard (Workers → Services → gearswipe → Routes)
- Check DNS A/CNAME records (DNS tab)
- Purge cache (Caching → Purge Cache → Purge Everything)

### Quote API 502 errors

```bash
# Test endpoint locally
curl -X POST http://localhost:8787/quote \
  -H "Content-Type: application/json" \
  -d '{"productIds":["1"],"quantities":[1]}'

# Check live logs
wrangler tail -c wrangler.quote-api.toml
```

Verify environment variables are set in dashboard:
- `SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_STORE_URL`

### Site slow after deploy

Purge Cloudflare cache:
- Dashboard → Caching → Purge Cache → Purge Everything

Or via API:
```bash
curl -X POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache \
  -H "Authorization: Bearer {api_token}" \
  -d '{"files":["https://gearswipe.com/*"]}'
```

### Switch to HostGator fallback (emergency only)

1. **Update DNS A record** (Cloudflare → DNS):
   - Change apex from Worker to HostGator IP (e.g., `192.0.2.100`)
2. **Verify**:
   ```bash
   curl -I https://gearswipe.com
   # Should serve static SPA after TTL expires (~5 min)
   ```
3. **Restore**:
   - When Workers recover, restore A record to Cloudflare Worker

## Rollback

### Workers Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

### DNS Rollback

Dashboard → DNS → View DNS records history → Restore previous snapshot

## References

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)
- [Wrangler CLI docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Email Routing](https://developers.cloudflare.com/email-routing/)
