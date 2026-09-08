# GearSwipe CF Access IdP Setup Guide

## Overview

GearSwipe admin routes now use **Cloudflare Access Identity Provider (CF Access)** for authentication instead of Google OAuth. CF Access handles identity verification at the edge and injects authenticated user headers into requests.

## Architecture

```
User → gearswipe.com/admin
  ↓
CF Access Policy checks authentication
  ↓
If not authenticated:
  → Show CF Access login page
  → User signs in with Google (or other provider)
  ↓
CF Access validates against email policy
  ↓
If email matches policy:
  → Injects headers:
     - CF-Access-Authenticated-User-Email: user@example.com
     - CF-Access-Authenticated-User-Id: xxxxx
  ↓
Request reaches /admin with CF headers
  ↓
Server-side requireAdminAuth() reads headers
  ↓
Email in allowlist (admin@goldshore.org, admin@gearswipe.com)?
  → Yes: Render admin panel
  → No: Redirect to /login
```

## Configuration Steps

### Phase 1: Create CF Access Application

**Location**: Cloudflare Dashboard → Zero Trust → Applications

**Steps**:
1. Click **+ Add an application**
2. Select **Self-hosted**

**Application Settings**:
```
Name:               GearSwipe Admin
Domain:             gearswipe.com
Path:               /admin*
```

3. Click **Next** to configure policies

### Phase 2: Create Authentication Policy

**Action**: Allow
**Rules**:
```
AND
  Identity Provider: Google
AND
  Email matches: Regex: ^(admin@goldshore\.org|admin@gearswipe\.com)$
```

**To add the rule**:
1. Click **+ Add a rule**
2. Select **Identity Provider**
3. Choose **Google**
4. Click **+ Add another condition**
5. Select **Email**
6. Choose **matches regex**
7. Enter: `^(admin@goldshore\.org|admin@gearswipe\.com)$`

8. Click **Save application**

### Phase 3: Verify Application Created

In CF Access Applications list, you should see:
```
Name:       GearSwipe Admin
Domain:     gearswipe.com/admin*
Status:     ✅ Active
```

## Testing

### Local Testing (Before CF Deployment)
```bash
# Local dev: CF Access not available
npm run dev
# Visit http://localhost:3000/admin
# Should redirect to /login (CF headers not present)
# Local NextAuth fallback should work (if Google creds set)
```

### Staging Testing (With CF Enabled)
```bash
# Deploy to staging subdomain with CF Access enabled
wrangler deploy --env preview
# Visit https://staging.gearswipe.com/admin
# Should show CF Access login page
# Sign in with Google (email: admin@goldshore.org)
# Should grant access to /admin
```

### Production Testing
```bash
# After verifying staging:
wrangler deploy --env prod
# Visit https://gearswipe.com/admin
# Should show CF Access login page
# Sign in with Google
# Should grant access if email in allowlist
```

## Troubleshooting

### Issue: "Access Denied" after signing in

**Cause**: Email not in CF Access policy

**Fix**:
1. Cloudflare Dashboard → Zero Trust → Applications → GearSwipe Admin
2. Edit policy rules
3. Add email to regex: `^(admin@goldshore\.org|admin@gearswipe\.com|newemail@example\.com)$`

### Issue: "Configuration error" when accessing /admin

**Cause**: CF Access policy not active or path mismatch

**Fix**:
1. Verify application domain: `gearswipe.com`
2. Verify path: `/admin*` (wildcard catches `/admin`, `/admin/users`, etc.)
3. Verify policy has at least one rule configured

### Issue: Stuck on "Sign in with Google" page

**Cause**: Google OAuth not configured in CF Access

**Fix**:
1. Cloudflare Dashboard → Zero Trust → Settings → Authentication
2. Ensure **Google** is listed under "Add an identity provider"
3. Verify Google OAuth credentials are configured (may auto-configure if org has Google workspace)

### Issue: Local dev can't access /admin

**Expected**: CF Access headers not present locally
**Workaround**: Set local Google OAuth env vars (if needed for testing):
```bash
export AUTH_GOOGLE_ID=your-google-client-id
export AUTH_GOOGLE_SECRET=your-google-client-secret
```

## Admin Email Allowlist

**Location**: Environment variable (fallback only)

The admin email list is hardcoded in `lib/admin-auth.ts`:
```typescript
const ADMIN_EMAILS = new Set([
  "admin@goldshore.org",
  "admin@gearswipe.com"
]);
```

**To add admins**:
1. **Primary way**: Update CF Access policy regex in Cloudflare Dashboard
2. **Secondary way** (dev only): Update `GEARSWIPE_ADMIN_EMAILS` env var in `.env` or Cloudflare Worker settings

**Example**: Add `operator@gearswipe.com` to admins
```
CF Access Policy Regex: ^(admin@goldshore\.org|admin@gearswipe\.com|operator@gearswipe\.com)$
```

## Admin Session Management

### Getting Current Admin Email
```typescript
// In server components or API routes
import { getAdminEmail } from "@/lib/admin-auth";

const email = await getAdminEmail();
console.log(`Logged in as: ${email}`);
```

### Protecting Routes
```typescript
// In app/admin/layout.tsx (already done)
import { requireAdminAuth } from "@/lib/admin-auth";

export default async function AdminLayout({ children }) {
  await requireAdminAuth();  // Redirects if not admin
  return children;
}
```

## Monitoring & Audit Logs

### CF Access Logs
**Location**: Cloudflare Dashboard → Analytics & Logs → Access

Logs show:
- User email
- Authentication timestamp
- Policy evaluated
- Allow/Deny decision

**Example log entry**:
```
User:     admin@goldshore.org
Action:   Allowed
Reason:   Matched policy: GearSwipe Admin
Time:     2026-09-02 10:30:45 UTC
```

### Admin Action Audit
Apps also log admin actions to D1:
```sql
SELECT * FROM audit_events
WHERE actor = 'admin@goldshore.org'
  AND action LIKE 'admin.%'
ORDER BY occurred_at DESC;
```

## Rollback Plan

If CF Access causes issues:

1. **Disable CF Access policy**:
   - Cloudflare Dashboard → Zero Trust → Applications
   - Delete "GearSwipe Admin" application

2. **Re-enable Google OAuth** (if needed):
   - Set env vars: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
   - Redeploy: `wrangler deploy --env prod`

3. **Time to rollback**: <5 minutes

## Next Steps

1. ✅ Code deployed (CF Access headers supported)
2. **Create CF Access application** (this guide)
3. **Test on staging** subdomain
4. **Deploy to production**
5. **Monitor** access logs for issues
6. **Remove** NextAuth Google OAuth config (optional, after verifying CF works)

---

**For questions**, see:
- [Cloudflare Access Docs](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/)
- [CF Access with Custom Apps](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/)
