# Cloudflare and GitHub audit — 2026-08-09

## Scope and evidence

This repository-level audit covers the Cloudflare Worker manifests, deployment
runbook, Worker entry points, GitHub ownership and dependency-update controls,
and automated validation. It does not claim to verify account-level settings:
the audit environment had neither GitHub authentication nor a usable
Cloudflare session. The dashboard checks below therefore remain release-owner
actions.

## Findings addressed

### GitHub validation was not enforced by repository automation

There was no workflow to verify pull requests. The new CI workflow uses the
project's required Node.js version and runs deterministic installation, the
production-build test suite, and dry-run bundling of both Cloudflare Workers.
Workflow permissions are read-only, action revisions are
pinned to immutable commits, duplicate runs are cancelled, and the job has a
finite timeout.

The existing lint and TypeScript checks do not pass on the audited baseline, so
they are not represented as enforced controls. Track their current failures as
remediation work and add both commands to CI once the baseline is clean; do not
represent them as required checks before then.

Configure the repository's `main` branch ruleset to require the
`Validate application and Workers` check and at least one approving review.
Also require Code Owner review for deployment-sensitive changes.

### GitHub Actions dependencies were not tracked

Dependabot covered npm packages only. It now checks GitHub Actions monthly so
pinned action revisions can receive reviewed upgrades without accepting
mutable tags at execution time.

### Cloudflare-sensitive ownership was incomplete

Code ownership covered only the primary Wrangler manifest. It now also covers
the quote API manifest, both Worker entry points, and the deployment runbook.

## Cloudflare dashboard checks required

Because Cloudflare settings are intentionally dashboard-managed, an owner must
verify these controls directly before the next production deployment:

- Confirm `gearswipe.com`, `www.gearswipe.com`, and `api.gearswipe.com/*` are
  attached only to the intended Workers and preview deployments have no
  production routes.
- Confirm `workers.dev` exposure matches policy for both Workers. Disable it if
  the services should be reachable only through custom domains.
- Confirm production secrets are encrypted secrets, not plaintext variables;
  rotate Shopify, email, and authentication credentials on the documented
  schedule and remove unused values.
- Confirm the storefront has the `ASSETS`, `IMAGES`, and required `DB`/email
  bindings, and the quote service has only its required bindings.
- Confirm zone SSL mode is Full (Strict), minimum TLS is 1.2 or newer, Always
  Use HTTPS is enabled, and the current one-day HSTS policy is intentional.
- Confirm rate limiting protects quote creation and authentication endpoints,
  while cache rules bypass authenticated and API responses.
- Confirm Worker logs do not retain message bodies, credentials, session data,
  or other customer data longer than necessary; set explicit retention.
- Confirm account members use MFA, deployment access is least-privilege, API
  tokens are scoped to the required account/zone resources, and audit logs are
  reviewed.

Record the reviewer, date, and dashboard evidence in the deployment ticket.
Do not copy secret values or customer data into GitHub.

## GitHub settings checks required

- Enable secret scanning, push protection, Dependabot alerts, and private
  vulnerability reporting where supported by the repository plan.
- Set the default `GITHUB_TOKEN` permission to read-only and allow write access
  only in explicitly reviewed workflows.
- Require pull requests, Code Owner review, conversation resolution, signed
  commits if organizational policy requires them, and the CI check on `main`.
- Restrict Actions to approved publishers and require full-length commit SHA
  pinning at the organization or repository level.
- Review collaborators, deploy keys, webhooks, GitHub Apps, environments, and
  Actions secrets; remove stale access and protect production with reviewers.

## Residual risks

The Worker manifests intentionally omit routes, bindings, and environment
configuration, so repository review cannot detect dashboard drift. CI dry runs
prove that source and manifests bundle; they do not prove that production DNS,
bindings, secrets, access controls, or branch rules match this document.
