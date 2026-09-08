# GearSwipe Cloudflare Access setup and change record

## Scope and ownership

This runbook governs the **operator identity/edge-access layer**. It does not
change the public storefront, the canonical object model, or application-level
authorization. Cloudflare Access is the first gate; the Worker still validates
the Access JWT and the GearSwipe admin allowlist.

The public storefront must remain anonymous. A commercial or inherited Gold
Shore Access application must never make GearSwipe's public content private.

## Required production boundary

The self-hosted application named `GearSwipe Admin` may contain only these
public hostnames:

| Hostname | Path | Required | Reason |
| --- | --- | --- | --- |
| `gearswipe.com` | `/admin` | yes | Protect the route root exactly. |
| `gearswipe.com` | `/admin/*` | yes | Protect all operator pages below the root. |
| `gearswipe.com` | `/api/admin/*` | conditional | Include only while admin APIs are intentionally edge-protected. The application also returns `401` without authenticated admin context. |

Do not use `/admin*`: it is broader than the intended route boundary. Do not
add the apex without a path, `/*`, `/login`, `/login*`, or a wildcard hostname.
`www.gearswipe.com` is not an operator hostname and must remain public.

Application-side protection currently has the same boundary: middleware
matches `/admin/:path*` and `/api/admin/:path*`, while the admin layout performs
the second authorization check. `/login` is not an application route and must
not be placed behind Access.

## Governed dashboard procedure

Changes require a Cloudflare identity permitted to administer both Zero Trust
and the `gearswipe.com` zone. Before editing anything:

1. Export or screenshot the existing application and policy configuration for
   rollback. Do not commit user emails, tokens, session cookies, or screenshots
   containing identity data.
2. In **Zero Trust → Access → Applications**, inspect every self-hosted
   application. Search each application's public hostnames, not just its name,
   for:
   - `gearswipe.com` and `www.gearswipe.com`;
   - `*.gearswipe.com`;
   - an apex or wildcard application inherited from Gold Shore that can match
     GearSwipe;
   - `/*`, `/login*`, or any path overlapping `/`, `/blog`, `/shop`, or the
     public bounty beta.
3. Record all matching applications in the sanitized inventory below. Remove
   GearSwipe hostnames from inherited portfolio-wide applications rather than
   relying on application precedence.
4. Edit `GearSwipe Admin` so its public hostnames are exactly the table in
   **Required production boundary**. Preserve the existing allow policy and
   configured identity provider unless the approved change says otherwise.
5. Save the application, then record the application ID, policy ID/revision,
   UTC deployment time, and rollback snapshot reference. Application and policy
   IDs are configuration identifiers and may be recorded; identity records may
   not.

### Sanitized application inventory

| Application | Application ID | Public hostname/path | Policy revision | Result |
| --- | --- | --- | --- | --- |
| _Pending privileged dashboard inspection_ | _Not observed_ | _Not observed_ | _Not observed_ | **Not verified** |

## Access log audit

In **Zero Trust → Logs → Access**, query a window spanning immediately before
and after deployment. Filter separately for `/admin` and `/login`. Record one
row per distinct outcome, removing user email, IP address, user ID, device ID,
and session identifiers.

| UTC time | Requested hostname/path | Matched application | Policy/revision | Identity provider | Decision |
| --- | --- | --- | --- | --- | --- |
| _Pending privileged log access_ | `/admin` | _Not observed_ | _Not observed_ | _Not observed_ | **Not verified** |
| _Pending privileged log access_ | `/login` | _Not observed_ | _Not observed_ | _Not observed_ | **Not verified** |

The expected `/admin` row matches `GearSwipe Admin`. The expected `/login` row
matches no Access application because login is public/application-owned. If
`/login` matches an inherited application, stop validation and remove that
overlap before proceeding.

## DNS and Worker routing audit

In **DNS → Records**, inspect the apex and `www` records without changing mail,
TXT, DKIM, DMARC, CAA, or unrelated subdomains. In **Workers & Pages →
gearswipe → Settings → Domains & Routes**, confirm `gearswipe.com` is the active
custom domain/route for the intended `gearswipe` Worker. A proxied public A/AAAA
answer proves only that Cloudflare is in front; it does **not** prove the Worker
rather than a stale GCP load balancer receives the request.

Record the apex record content and Worker route in the private change evidence,
then put only the non-sensitive conclusion here:

| Check | Expected | Recorded result |
| --- | --- | --- |
| Apex DNS | Proxied by Cloudflare | Public DNS returned Cloudflare anycast A/AAAA addresses on 2026-09-08; origin/Worker binding **not verified** without zone access. |
| Worker custom domain/route | `gearswipe.com` → `gearswipe` | **Not verified**; no authenticated Cloudflare session was available. |
| Stale GCP origin/load balancer | No active apex route | **Not verified**; proxied DNS cannot establish origin ownership. |

## Post-deployment validation

Use a new private browser session with no Access cookies. Preserve status,
`Location`, and hostname/path evidence, but do not preserve cookies or identity
headers.

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
Server-side authorizeOperator() verifies the Access assertion
  ↓
Email in allowlist (admin@goldshore.org, admin@gearswipe.com)?
  → Yes: Render admin panel
  → No: Redirect to /login
```

## Configuration Steps

### Runtime bindings

Configure these server-only text bindings for every deployed environment in
**Workers & Pages → gearswipe → Settings → Variables and Secrets**:

- `CLOUDFLARE_ACCESS_TEAM_DOMAIN`: the complete Access team domain, for example
  `your-team.cloudflareaccess.com` (not the protected application hostname).
- `CLOUDFLARE_ACCESS_AUDIENCE`: the Access application **AUD tag** shown on the
  application's overview/configuration page.

Neither value is an authentication credential, so encrypted secrets are not
required; keeping both as server-side bindings prevents deployment identity
configuration from entering source or client bundles. Use environment-specific
values for preview and production. The runtime deliberately has no default and
rejects Access assertions when either binding is absent.

The verifier downloads the team's JWK set from
`https://<team-domain>/cdn-cgi/access/certs`, selects the `RS256` key by the
token header's `kid`, and refreshes its bounded one-hour cache when a new `kid`
appears during key rotation.

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
# Local NextAuth fallback works only when explicitly enabled (see below)
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
export GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK=true
```

## Admin Email Allowlist

**Location**: `GEARSWIPE_ADMIN_EMAILS`. The same normalized allowlist is used by
the proxy, pages, and APIs through `lib/operator-auth.ts`.

**To add admins**:
1. **Primary way**: Update CF Access policy regex in Cloudflare Dashboard
2. **Application enforcement**: Update `GEARSWIPE_ADMIN_EMAILS` in the runtime
   secret/configuration store. Keep it aligned with the Access policy.

**Example**: Add `operator@gearswipe.com` to admins
```
CF Access Policy Regex: ^(admin@goldshore\.org|admin@gearswipe\.com|operator@gearswipe\.com)$
```

## Admin Session Management

Production must configure `CLOUDFLARE_ACCESS_AUD` with the Access application
AUD tag. Assertions with the wrong issuer, audience, signature, or lifetime are
rejected. `CLOUDFLARE_TEAM_NAME` defaults to `gearswipe`.

NextAuth is never a production operator credential. For local development it
must be opted into with `GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK=true`; local
credentials additionally require `GEARSWIPE_ENABLE_LOCAL_CREDENTIALS=true` and
the existing local email/password variables. The session must have the admin
role and its email must be in `GEARSWIPE_ADMIN_EMAILS`.

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

Acceptance criteria:

- `/`, `/blog`, `/shop`, and the deployed bounty beta path render without an
  Access challenge.
- `/admin` redirects to the Cloudflare Access authentication flow.
- After successful authentication, the browser returns to the exact original
  `https://gearswipe.com/admin` URL (not `/`, `/login`, or another hostname).
- `/login` does not trigger Access. At present it may return the application's
  normal not-found response because there is no `/login` route.
- If `/api/admin/*` remains in the Access application, an anonymous request is
  challenged at the edge. Otherwise the application must return `401`.

### Validation record

| URL | Expected anonymous result | Recorded result |
| --- | --- | --- |
| `https://gearswipe.com/` | Public | **Not verified**: execution environment's outbound proxy returned `403` before reaching Cloudflare. |
| `https://gearswipe.com/blog` | Public | **Not verified**: same environment limitation. |
| `https://gearswipe.com/shop` | Public | **Not verified**: same environment limitation. |
| Future public bounty beta | Public | **Not runnable**: no public route/path is deployed in this branch. |
| `https://gearswipe.com/admin` | Access challenge | **Not verified**: same environment limitation. |
| Successful sign-in return | Original `/admin` URL | **Not verified**: requires an approved interactive identity session. |

## Deployment record

This section is intentionally explicit: the 2026-09-08 repository run had no
authenticated Cloudflare dashboard/API session (`wrangler whoami` reported
unauthenticated). Therefore no governed dashboard change was applied and no
application ID, policy revision, Access log result, or deployment timestamp can
be truthfully recorded yet. Do not interpret this documentation commit as a
Cloudflare deployment.

| Field | Value |
| --- | --- |
| Access application ID | **Pending privileged inspection** |
| Protected paths | Intended: `/admin`, `/admin/*`; conditional: `/api/admin/*` |
| Policy ID/revision | **Pending privileged inspection** |
| Dashboard deployment timestamp (UTC) | **Not deployed** |
| Change evidence | **Pending** |

The operator who performs the dashboard change must replace the pending values
in the same change window and rerun every validation above.

## Rollback procedure

1. Open `GearSwipe Admin` in **Zero Trust → Access → Applications**.
2. Restore the pre-change public-hostname list and policy revision from the
   private snapshot recorded before deployment. Prefer restoring the application
   over deleting it so IDs and audit continuity remain intact.
3. If the incident is an accidental storefront challenge, first remove or
   disable the broad/apex/wildcard application capturing public routes; do not
   weaken the application-level admin allowlist.
4. Confirm `/`, `/blog`, `/shop`, and the bounty beta are anonymous again, then
   confirm `/admin` has returned to the prior known behavior.
5. Record rollback UTC time, actor in the restricted change system, restored
   policy revision, reason, and validation result. Do not put personal identity
   data in this repository.

Application authentication remains defense in depth during an Access rollback:
admin pages redirect unauthenticated users to `/`, and admin APIs return `401`.
If Access must be temporarily removed, monitor the application audit trail and
restore the exact-path edge policy as soon as the incident is resolved.
