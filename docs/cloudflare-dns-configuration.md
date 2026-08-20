# Cloudflare DNS Configuration for HostGator Origin

This guide configures Cloudflare to proxy gearswipe.com to the HostGator origin.

## Prerequisites

- HostGator hosting is active and confirmed responsive
- Current HostGator server IP is known (ask HostGator support for the shared server IP or dedicated IP)
- SSL certificate is valid on the HostGator origin
- Current Cloudflare zone is under your control and active

## DNS Records

After confirming HostGator origin details, apply the following DNS records in Cloudflare:

### Apex Domain (required)

| Type | Name | Content | Proxy | TTL |
| --- | --- | --- | --- | --- |
| A | `@` | `<HOSTGATOR_IP>` | Proxied (Orange cloud) | Auto |

Example: `A @ 192.0.2.100 Proxied`

### WWW Subdomain (required)

| Type | Name | Content | Proxy | TTL |
| --- | --- | --- | --- | --- |
| CNAME | `www` | `gearswipe.com` | Proxied (Orange cloud) | Auto |

This ensures `www.gearswipe.com` redirects to the apex.

### Quote API (if using Cloudflare Workers)

| Type | Name | Content | Proxy | TTL |
| --- | --- | --- | --- | --- |
| CNAME | `api` | `<WORKER_HOSTNAME>` | Proxied (Orange cloud) | Auto |

Example: `CNAME api quote-worker-abc123.workers.dev Proxied`

## Preserved Records

**Do not modify or delete** the following:

- MX records (email routing)
- TXT records (SPF, ownership verification)
- DKIM records (email authentication)
- DMARC record (single record only; delete duplicates if present)
- CAA records (certificate authority authorization)
- Any unrelated subdomains (e.g., `mail.gearswipe.com`)

## SSL/TLS Settings

In **Cloudflare > SSL/TLS**:

1. **Encryption mode**: Set to **Full (strict)** once HostGator has a valid SSL certificate
   - Full (strict) requires a valid certificate at the origin
   - Do not use Flexible unless the origin has no certificate (temporary only)

2. **Recommended settings**:
   - Always Use HTTPS: **On**
   - Automatic HTTPS Rewrites: **On**
   - Minimum TLS Version: **1.2**
   - HSTS: **Do not enable** until the site is stable (HSTS is cached indefinitely by browsers and cannot be revoked)

## Performance & Caching

In **Cloudflare > Caching**:

1. **Cache static assets aggressively**
   - Set Cache-Control headers in the build (Vite handles this via asset hashing)
   - Cloudflare will cache `dist/assets/` files for 1 year
   - HTML and API responses should have short/no cache

2. **API responses (Quote API)**
   - Cache-Control: no-cache or max-age=0
   - These should always reach the origin

3. **HTML (index.html)**
   - Cache-Control: max-age=0 or no-cache
   - Ensures SPA updates are seen immediately after deployment

## Validation Steps

After applying DNS changes:

1. **Wait for DNS propagation** (5–15 minutes typical, can be longer)

2. **Test apex over HTTPS**:
   ```bash
   curl -I https://gearswipe.com
   # Expected: HTTP/2 200 or 301 (redirect to www)
   ```

3. **Test www over HTTPS**:
   ```bash
   curl -I https://www.gearswipe.com
   # Expected: HTTP/2 200
   ```

4. **Test deep links** (SPA routing via .htaccess):
   ```bash
   curl -I https://gearswipe.com/browse
   curl -I https://gearswipe.com/product/test
   curl -I https://gearswipe.com/compare
   # All should return HTTP/2 200 (served as index.html)
   ```

5. **Check certificate**:
   ```bash
   openssl s_client -connect gearswipe.com:443 -servername gearswipe.com
   # Should show a valid certificate (Cloudflare or HostGator origin)
   ```

6. **Test API endpoint** (if Quote API deployed):
   ```bash
   curl -I https://api.gearswipe.com/quote
   # Expected: HTTP/2 200 or expected API response
   ```

## Email Validation

Ensure mail is unaffected:

```bash
nslookup -type=MX gearswipe.com
# Should return existing MX records, unmodified
```

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `NXDOMAIN` or timeout | DNS not propagated yet | Wait 5–15 minutes, refresh DNS cache |
| `502 Bad Gateway` | Origin unreachable | Verify HostGator IP is correct; test origin directly by IP |
| Certificate error | Wrong origin cert or TLS mode mismatch | Set mode to Full (not Flexible); verify origin certificate |
| Pages served from Cloudflare cache | Origin unreachable but cache has stale content | Purge Cloudflare cache, wait for fresh fetch from origin |
| Deep links return 404 | .htaccess missing or incorrect | Verify `.htaccess` is in the HostGator web root; test via SSH/FTP |

## Rollback Plan

If the HostGator origin fails after DNS cutover:

1. **Immediate**: Restore the previous apex A record in Cloudflare (DNS will point back to the old origin)
2. **Optional**: Purge Cloudflare cache to avoid serving stale content
3. **After**: Investigate HostGator issues (SSL, disk space, process restart) before re-pointing

Record the original apex target before making changes.

## References

- [Cloudflare DNS setup guide](https://developers.cloudflare.com/dns/setup/)
- [HostGator shared hosting documentation](https://support.hostgator.com/)
- [Apache .htaccess SPA routing](https://router.vuejs.org/guide/deployment.html#apache)
