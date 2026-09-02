# GearSwipe Deployment Checklist

**Objective**: Get gearswipe.com live on Cloudflare Workers (2 hours)  
**Date Started**: 2026-08-23  
**Target Completion**: Today

---

## Step 1: Get Cloudflare Credentials (10 minutes)

### 1a: Get API Token
1. Go to **Cloudflare Dashboard** → https://dash.cloudflare.com
2. Click your **profile icon** (top right) → **Profile**
3. Click **API Tokens** (left sidebar)
4. Click **Create Token** → Select **Edit Cloudflare Workers** template
5. Confirm permissions:
   - ✅ Account: Workers Scripts (Edit)
   - ✅ Account: Workers Routes (Edit)
   - ✅ Zone: Cache Purge (Purge)
6. Click **Create Token**
7. **COPY the token** (you'll only see it once)

### 1b: Get Account ID
1. Stay in Cloudflare Dashboard
2. Go to **Workers & Pages** (top left menu)
3. Click **Overview**
4. Look for **Account ID** in the right sidebar
5. **COPY the Account ID**

### 1c: Get Zone ID (for gearswipe.com)
1. Go to **DNS** tab for gearswipe.com
2. Look at the right sidebar
3. Find **Zone ID**
4. **COPY the Zone ID**

You now have 3 credentials. Keep them safe (don't share publicly).

---

## Step 2: Add GitHub Secrets (5 minutes)

1. Go to your GitHub repo: **marzton/gearswipe-com**
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Add Secret #1: CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: Paste the API token from Step 1a
- Click **Add secret**

### Add Secret #2: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: Paste the Account ID from Step 1b
- Click **Add secret**

### Add Secret #3: CLOUDFLARE_ZONE_ID
- **Name**: `CLOUDFLARE_ZONE_ID`
- **Value**: Paste the Zone ID from Step 1c
- Click **Add secret**

✅ Verify all 3 secrets appear in the list

---

## Step 3: Configure Cloudflare Dashboard (15 minutes)

### 3a: Add Worker Routes (gearswipe)
1. Go to **Cloudflare Dashboard**
2. Click **Workers & Pages** → **Services** (or **gearswipe** if listed)
3. Look for **gearswipe** worker
4. Click on it
5. Go to **Routes** tab
6. Click **Add route**

Add these routes:
- Route: `gearswipe.com/*` → Worker: `gearswipe`
- Route: `www.gearswipe.com/*` → Worker: `gearswipe`

### 3b: Add Worker Routes (quote API)
1. Go to **Workers & Pages** → **Services** → **gearswipe-quote-api**
2. Go to **Routes** tab
3. Add route:
   - Route: `api.gearswipe.com/*` → Worker: `gearswipe-quote-api`

### 3c: Verify DNS Records
1. Go to **DNS** tab for gearswipe.com
2. Check these records exist:
   - **A record** for `@` (apex/root) pointing to Cloudflare
   - **CNAME** for `www` → `gearswipe.com`
   - **CNAME** for `api` → `gearswipe-quote-api.workers.dev`

If they don't exist, create them (all should be **Proxied** / Orange cloud icon)

### 3d: SSL/TLS Configuration
1. Go to **SSL/TLS** tab
2. Set **Encryption Mode** to **Full (Strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

---

## Step 4: Trigger Deployment (2 minutes)

### Option A: Via GitHub Actions (Recommended)
1. Go to GitHub repo
2. Click **Actions** tab
3. Click **Deploy to Production (Cloudflare + GitHub Pages Fallback)**
4. Click **Run workflow** → **Run workflow**
5. Watch the workflow run

### Option B: Push a Commit
1. Make a small commit and push to `main`
```bash
cd gearswipe-com
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

Either way, the workflow will:
- Build the site
- Deploy to Cloudflare Workers (gearswipe + quote-api)
- Deploy to GitHub Pages (fallback)
- Purge Cloudflare cache

---

## Step 5: Verify Deployment (5 minutes)

Wait 2-3 minutes for deployment to complete, then test:

### Test Main Site
```bash
curl -I https://gearswipe.com
```

Expected response:
- Status: **200 OK** (or 301/302 redirect)
- Headers should include: `server: cloudflare`
- No **522 Connection Timeout**

### Test Quote API
```bash
curl -I https://api.gearswipe.com/health
```

Expected:
- Status: **200 OK**
- Response body contains: `{"status":"ok"}`

### Visit in Browser
- Go to **https://gearswipe.com** in your browser
- Site should load without errors
- Check browser console for errors

### Check GitHub Actions
- Go to **Actions** tab
- Both jobs should show **✅ passed**:
  - `deploy-cloudflare`
  - `deploy-github-pages`

---

## Troubleshooting

### Issue: 522 Connection Timeout
**Cause**: Worker routes not added to Cloudflare Dashboard  
**Fix**: Go to Cloudflare Dashboard → Workers → Add routes for `gearswipe.com/*` and `www.gearswipe.com/*`

### Issue: Workflow fails with "API Token invalid"
**Cause**: Secret name misspelled or value incorrect  
**Fix**: Double-check secret names in GitHub Settings → Secrets:
- `CLOUDFLARE_API_TOKEN` (exact spelling)
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ZONE_ID`

### Issue: Site loads but shows 404
**Cause**: Worker routes not correctly configured  
**Fix**: Verify routes in Cloudflare → Workers → Services → gearswipe → Routes

### Issue: Deployment stuck/not running
**Cause**: Workflow may have failed silently  
**Fix**: Check Actions tab for errors, re-run manually

---

## Post-Deployment

### ✅ When Deployment Succeeds
1. Site is live at https://gearswipe.com
2. Email signup available
3. Current site serves users
4. Ready for Phase 3 content creation

### 📧 Next: Start Phase 3
Begin writing backpack test series:
1. Article 1: "Why I'm Not Buying a $39 Vacuum Backpack"
2. Article 2: "Black Voyage vs AirVault vs Commodity"
3. Article 3: "One Bag. Four Cities. Which Actually Holds Up?"
4. Article 4: "Was It Actually Worth Buying?" (30-day follow-up)

See `PHASE_3_CONTENT_FRAMEWORK.md` for templates.

---

## Timeline

- **Now**: Deploy current site (2 hours)
- **This week**: Write backpack test articles
- **Next 2 weeks**: Photograph products, create 20-product catalog
- **Weeks 5-12**: Manufacturing articles, admin dashboard, QA, launch

---

**Status**: Ready to deploy  
**Questions?**: See `DEPLOYMENT_SETUP.md` for more detail
