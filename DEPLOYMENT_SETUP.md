# Gearswipe.com Deployment Setup

## Current Architecture
- **Primary**: Cloudflare Workers (`gs-web` and `gs-quote-api`)
- **Fallback**: GitHub Pages (static SPA)
- **DNS**: Cloudflare (proxied)

## Phase 2: Infrastructure Repair

### Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Where to Find |
|------------|-------------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers edit permission | Cloudflare Dashboard → Profile → API Tokens → Create Token (use "Edit Cloudflare Workers" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Cloudflare Dashboard → Workers → Overview (shown at top) |
| `CLOUDFLARE_ZONE_ID` | DNS zone ID for gearswipe.com | Cloudflare Dashboard → DNS (gearswipe.com) → Zone ID (shown in sidebar) |

**Important**: The API token must have these permissions:
- Workers Scripts: Edit
- Workers Routes: Edit
- Cache Purge: Purge

### Step 2: Cloudflare Dashboard Configuration

After secrets are set, configure the following in Cloudflare Dashboard:

#### 2a. Workers Routes (gearswipe.com)
Navigate to: **Cloudflare Dashboard → Workers & Pages → gearswipe**
1. Add route: `gearswipe.com/*` → Points to `gearswipe` Worker
2. Add route: `www.gearswipe.com/*` → Points to `gearswipe` Worker

#### 2b. Workers Routes (api.gearswipe.com)
Navigate to: **Cloudflare Dashboard → Workers & Pages → gearswipe-quote-api**
1. Add route: `api.gearswipe.com/*` → Points to `gearswipe-quote-api` Worker

#### 2c. Worker Bindings (gearswipe)
**Cloudflare Dashboard → Workers & Pages → gearswipe → Settings → Bindings**

Add the following bindings (if not already present):
- `DB` → D1 database
- `ASSETS` → R2 bucket (gs-assets)
- `IMAGES` → Image optimization service
- `EMAIL` → Email service binding (if mail routing enabled)

#### 2d. Worker Bindings (gearswipe-quote-api)
**Cloudflare Dashboard → Workers & Pages → gearswipe-quote-api → Settings → Bindings**

Add bindings for:
- Shopify integration keys (set as secrets via dashboard)
- D1 database (if quote storage needed)

#### 2e. Environment Variables
**Per Worker** → **Settings → Environment Variables**

**For gearswipe Worker:**
- `ENVIRONMENT` = `production`

**For gearswipe-quote-api Worker:**
- `ENVIRONMENT` = `production`
- `SHOPIFY_STORE_URL` = Your Shopify store URL
- `SHOPIFY_STOREFRONT_TOKEN` = Your Shopify storefront API token (must be set as a secret, not plain text)

#### 2f. SSL/TLS Configuration
**Cloudflare Dashboard → SSL/TLS**
1. **Encryption Mode**: Full (Strict) — requires valid certificate at origin
2. **Always Use HTTPS**: On
3. **Automatic HTTPS Rewrites**: On
4. **Minimum TLS Version**: 1.2

#### 2g. DNS Records (Verify)
**Cloudflare Dashboard → DNS**

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | @ | 192.0.2.1 (Cloudflare Worker) | Orange (Proxied) |
| CNAME | www | gearswipe.com | Orange (Proxied) |
| CNAME | api | gearswipe-quote-api.workers.dev | Orange (Proxied) |

### Step 3: Validate Deployment

After secrets and dashboard configuration are complete:

1. **Trigger deployment**:
   - Go to GitHub → Actions → "Deploy to Production"
   - Click "Run workflow" on the main branch

2. **Monitor workflow**:
   - Watch both `deploy-cloudflare` and `deploy-github-pages` jobs
   - Check for any errors in logs

3. **Test the site**:
   ```bash
   # Test main site
   curl -I https://gearswipe.com
   # Expected: 200 OK, Cloudflare headers present

   # Test API
   curl -I https://api.gearswipe.com/health
   # Expected: 200 OK with Cloudflare headers
   ```

4. **Verify cache purge**:
   - Cloudflare Dashboard → Caching → Cache Rules
   - Confirm cache was purged after deployment

### Step 4: Monitor for Issues

After deployment, check:
1. **Cloudflare Analytics** → Request volume, error rates
2. **Worker Logs** → `wrangler tail` for real-time logs
3. **GitHub Pages** → Should serve as fallback if Workers go down

## Fallback: GitHub Pages

GitHub Pages is deployed alongside Cloudflare Workers as an emergency fallback. If Cloudflare Workers are unavailable:

1. Update DNS A record to GitHub Pages IP (if needed)
2. Site will serve static SPA from GitHub Pages
3. This is not recommended for production but provides disaster recovery

## Troubleshooting

### Workers not deploying
```bash
wrangler deploy --dry-run  # Test locally
wrangler whoami            # Verify authentication
wrangler deployments list  # Check deployment history
```

### 522 Error (Origin Unreachable)
- Verify routes are added in Cloudflare Dashboard
- Check that workers are deployed: `wrangler deployments list`
- Verify Worker environment variables are set

### Cache issues
Purge manually via:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://gearswipe.com/*"]}'
```

### Rollback
```bash
wrangler rollback              # Rollback main Worker
wrangler rollback -c wrangler.quote-api.toml  # Rollback quote API
```

## Next Steps (Phase 3)

After deployment and validation:
1. Monitor error rates for 24+ hours
2. Set up alerting for Worker errors
3. Test quote API with real Shopify data
4. Perform load testing on both workers
5. Document any custom configuration done in dashboard
