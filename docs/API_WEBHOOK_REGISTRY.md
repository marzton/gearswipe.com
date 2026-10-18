# GearSwipe / Cortex Webhook Registry

Status: Phase 0 canonical integration naming and secret-reference registry.

## Important correction

The original generic manifest route:

`POST /v1/webhooks/payment-provider`

was intended as a provider-agnostic placeholder for a future payment provider. It must **not** be used for OpenAI API event webhooks.

Provider-specific routes are preferred once the provider is known.

## Canonical webhook routes

| Provider / purpose | Route | Secret binding / verifier reference | Notes |
|---|---|---|---|
| OpenAI API project events | `POST /v1/webhooks/openai` | `OPENAI_WEBHOOK_SECRET` | Handles OpenAI response/eval/realtime/safety events. Verify signature against raw request body before parsing. |
| Stripe | `POST /v1/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` | Reserved for future Stripe marketplace/funding/payout events. |
| PayPal | `POST /v1/webhooks/paypal` | `PAYPAL_WEBHOOK_ID` plus provider-specific credentials | Reserved for future PayPal webhook verification. Do not assume Stripe-style HMAC semantics. |
| Identity provider | `POST /v1/webhooks/identity-provider` | provider-specific secret/reference | Keep generic only while provider remains abstract. |
| External verifier | `POST /v1/webhooks/external-verifier` | provider-specific secret/reference | For approved evidence verification services. |

## OpenAI endpoint naming

In the OpenAI Platform UI, use a descriptive endpoint name such as:

`OpenAI API Events — Cortex Prod`

Recommended production URL:

`https://cortex.goldshore.ai/v1/webhooks/openai`

Do not name this webhook `Payment Provider`.

## OpenAI event subscriptions

Initial useful events for Cortex:

- `response.completed`
- `response.failed`
- `response.cancelled`
- `response.incomplete`
- `safety.alert.created`

Optional when used:

- `eval.run.succeeded`
- `eval.run.failed`
- `eval.run.canceled`
- `realtime.call.incoming` only when inbound Realtime/SIP handling is implemented

## Secret storage policy

Raw webhook signing secrets must **not** be stored in:

- GitHub source files
- GitHub Actions plaintext config
- Cloudflare KV
- Google Drive
- Linear
- prompts
- logs

For the current GearSwipe/Cortex Cloudflare stack, raw webhook secrets should live in the Cloudflare Worker secret store / environment-secret mechanism for the worker serving `cortex.goldshore.ai`.

Canonical binding names:

- `OPENAI_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_WEBHOOK_ID` (identifier/reference only; store any actual provider credentials separately)

Use the same binding name in each environment and isolate values by environment where possible, instead of appending `_PROD` / `_PREVIEW` in code.

## KV usage

KV may store only non-secret webhook metadata/cache, for example:

Key: `webhook:openai:config`

Suggested value fields:

```json
{
  "provider": "openai",
  "route": "/v1/webhooks/openai",
  "environment": "production",
  "enabled_event_types": [
    "response.completed",
    "response.failed",
    "response.cancelled",
    "response.incomplete",
    "safety.alert.created"
  ],
  "secret_ref": "OPENAI_WEBHOOK_SECRET",
  "status": "configured",
  "policy_version": "phase0-v1"
}
```

The raw secret value must never appear in KV.

## Receiver requirements

All webhook handlers must:

1. Read the raw request body.
2. Verify provider signature/authentication before trusting payload content.
3. Reject invalid signatures.
4. Extract provider event ID and event type.
5. Deduplicate/replay-protect using provider event ID plus internal audit/event record.
6. Write an append-only audit event.
7. Enqueue heavy work where appropriate.
8. Return `2xx` quickly after safe acceptance.
9. Never log raw secrets or unnecessary PII.

## OpenAI processing map

- `response.completed` → correlate OpenAI response with Cortex task/job and mark result available.
- `response.failed` → mark failed and apply retry/alert policy.
- `response.cancelled` → mark canceled.
- `response.incomplete` → mark partial/incomplete and apply retry/escalation policy.
- `eval.run.*` → update evaluation registry if eval workflows are enabled.
- `safety.alert.created` → route to policy/moderation/security queue.
- `realtime.call.incoming` → route only when explicit realtime call handling exists.

## Manifest interpretation

The initial REST contract entries:

- `POST /v1/webhooks/payment-provider`
- `POST /v1/webhooks/identity-provider`
- `POST /v1/webhooks/external-verifier`

are interface placeholders, not instructions to route every third-party webhook through those names.

Once a concrete provider is selected, use provider-specific routes and document the mapping here.

## Handoff requirement

Claude, Codex, and other agents must read this registry before implementing webhook handlers or provider integrations.
