# GearSwipe Cloudflare research runtime

This branch carries over the useful runtime patterns from the Cloudflare Workflows Starter and R2 Explorer reference apps without replacing the existing Vinext storefront or creating additional public Workers.

## Cherry-picked patterns

### Workflows Starter

- `WorkflowEntrypoint` as the durable process boundary.
- Named `step.do()` checkpoints.
- `step.waitForEvent()` for human / acquisition boundaries.
- Stable workflow instance IDs as part of artifact provenance.

The reference starter also uses a Durable Object + WebSocket status UI. That is intentionally **not** copied yet: GearSwipe should first use native Workflow instance status and only add a status Durable Object if the admin UI proves it needs push updates.

### R2 Explorer

The reference R2 Explorer is a thin wrapper over an R2 binding and is read-only by default. GearSwipe does **not** need a second explorer Worker in production. We only carry over the storage idea and key hierarchy.

Research artifacts use this prefix:

```text
research/products/{product-slug}/{workflow-instance-id}/
```

The first durable artifact is:

```text
evidence-packet.json
```

Later artifacts can include manufacturer pages, manuals, screenshots, source packets, field-test media, and campaign assets beneath the same instance prefix.

## Cloudflare bindings required before activation

The current repository intentionally keeps `wrangler.toml` minimal and says dashboard configuration is authoritative. Do not silently change that deployment contract in this PR.

Add these to the existing `gearswipe` Worker in Cloudflare when the implementation is ready to activate:

1. Workflow binding
   - Binding: `GS_PRODUCT_RESEARCH`
   - Workflow name: `gearswipe-product-research`
   - Class: `GearSwipeProductResearchWorkflow`

2. R2 bucket binding
   - Binding: `RESEARCH_ASSETS`
   - Bucket: a dedicated GearSwipe research bucket, not the reference bucket

Do not attach the reference bucket `goldshore-r2-explorer-reference` to production.

## Next integrations

`GS_PRODUCT_RESEARCH` is deliberately the shared core before open-ended discovery.

Future callers:

```text
GS_DISCOVERY -----------\
                         -> GS_PRODUCT_RESEARCH -> GS_EDITORIAL
GS_TARGETED_SEARCH -----/
manual product intake --/
```

The next implementation phase should add actual source acquisition through Browser Run / AI Search, claim extraction, confidence scoring, D1 persistence, and an authenticated API surface to create/status/signal Workflow instances.
