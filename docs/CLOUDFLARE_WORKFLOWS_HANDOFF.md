# GearSwipe Cloudflare Workflows Handoff

## Objective

Implement GearSwipe as a product-intelligence system using Cloudflare Workflows without creating a separate Worker or repository per workflow.

The existing `gearswipe` Worker remains the application runtime. Workflow bindings are added to its Wrangler configuration and exported workflow classes live in this repository.

## Workflow topology

### `GS_DISCOVERY` / `gearswipe-discovery`
Open-ended discovery. Finds products that may deserve GearSwipe attention.

Input examples:
- category/domain seed
- source seed URL
- brand/manufacturer seed
- editorial theme

Stages:
1. discover candidate sources/products
2. resolve canonical product identity
3. resolve manufacturer/company
4. resolve provenance / era / intended use
5. gather evidence
6. score evidence quality and GearSwipe relevance
7. choose disposition

Disposition enum:
- `REJECT`
- `WATCH`
- `WEB_RESEARCH`
- `BUY`
- `RETAIL_VISIT`
- `REQUEST_LOANER`
- `SEEK_SPONSORSHIP`
- `REQUEST_SAMPLE`
- `CONTACT_BRAND`

Output should be a qualified candidate, not an article.

### `GS_TARGETED_SEARCH` / `gearswipe-targeted-search`
Intent-driven search such as "find a backpack for 3-day travel under $300".

Stages:
1. normalize user constraints
2. discover candidate products
3. filter hard constraints
4. retrieve evidence
5. compare/rank
6. return shortlist
7. optionally promote selected candidate into `GS_PRODUCT_RESEARCH`

### `GS_PRODUCT_RESEARCH` / `gearswipe-product-research`
Deep research on a selected product.

Stages:
1. establish canonical identity
2. manufacturer/company provenance
3. era/history
4. intended use
5. specifications and manufacturer claims
6. independent evidence
7. community evidence
8. market/value evidence
9. field evidence if available
10. contradiction/confidence analysis
11. acquisition decision if web evidence is insufficient
12. produce evidence packet

Acquisition branch may pause using `waitForEvent()` for events such as:
- `loaner_approved`
- `product_received`
- `field_test_completed`
- `brand_response_received`

### `GS_EDITORIAL` / `gearswipe-editorial`
Consumes a completed evidence packet.

Stages:
1. determine editorial thesis
2. outline
3. draft
4. claim/source verification
5. human editorial approval
6. publish article
7. generate social derivatives
8. create campaign assets/metadata

Do not automatically publish directly from discovery.

## Shared evidence contract

Every material claim should retain:

```ts
type EvidenceRecord = {
  claim: string;
  sourceUrl: string;
  sourceType: 'manufacturer' | 'manual' | 'retailer' | 'press' | 'community' | 'archive' | 'field-test' | 'other';
  publisher?: string;
  sourceDate?: string;
  retrievedAt: string;
  manufacturerRelationship?: 'primary' | 'independent' | 'unknown';
  retrievalMethod: 'ai-search' | 'browser' | 'api' | 'manual' | 'owned-archive';
  supportsClaim: boolean;
  confidence: number;
  notes?: string;
};
```

AI Search is retrieval, not provenance authority. Provenance must remain attached to source records.

## Cloudflare capability ownership

Initially keep these capabilities on the existing `gearswipe` Worker:
- Workflows
- D1 for canonical product/evidence/editorial records
- R2 for manuals, images, screenshots, source packets and field-test assets
- Workers AI for classification/synthesis
- AI Search for retrieval when configured
- Browser binding only when browser automation code exists
- Queue(s) for fan-out jobs that should not block workflow steps

Do not create `gearswipe-api`, `gearswipe-agent`, `gearswipe-mcp`, or one Worker per Workflow unless scale/security later demonstrates a need.

## Workflow vs Queue rule

Use a Workflow when:
- the process has dependent stages;
- completed stages must survive retries/crashes;
- it may wait on external events/human approval.

Use a Queue for:
- fan-out crawling;
- image processing;
- cache refresh;
- webhook execution;
- one-off enrichment;
- independent background jobs.

Workflow coordinates the process; Queue distributes work.

## Suggested source layout

```text
src/
  workflows/
    discovery.ts
    targeted-search.ts
    product-research.ts
    editorial.ts
    shared/
      evidence.ts
      confidence.ts
      provenance.ts
      acquisition.ts
      types.ts
```

## Suggested Wrangler declarations

Adapt these to the repository's authoritative Wrangler file. Do not create another Worker solely for them.

```toml
[[workflows]]
binding = "GS_DISCOVERY"
name = "gearswipe-discovery"
class_name = "GearSwipeDiscoveryWorkflow"

[[workflows]]
binding = "GS_TARGETED_SEARCH"
name = "gearswipe-targeted-search"
class_name = "GearSwipeTargetedSearchWorkflow"

[[workflows]]
binding = "GS_PRODUCT_RESEARCH"
name = "gearswipe-product-research"
class_name = "GearSwipeProductResearchWorkflow"

[[workflows]]
binding = "GS_EDITORIAL"
name = "gearswipe-editorial"
class_name = "GearSwipeEditorialWorkflow"
```

## Implementation guardrails for Codex / Claude

1. Inspect the actual live GearSwipe Worker/Pages deployment contract before editing Wrangler.
2. Do not create a new repository or Worker merely because the Cloudflare template UI does so.
3. Preserve the existing Vinext/Next application unless a concrete incompatibility requires migration.
4. Add Workflow classes in a feature branch first.
5. Use `step.do()` for durable/retryable units; keep steps idempotent.
6. Persist business state in D1, not Workflow engine internals.
7. Never let AI-generated claims lose source URLs and provenance metadata.
8. Put publication behind explicit human approval until confidence policy is proven.
9. Keep `GS_TARGETED_SEARCH` distinct from open-ended `GS_DISCOVERY`, but let both feed `GS_PRODUCT_RESEARCH`.
10. Do not modify production Cloudflare bindings until Wrangler and current dashboard state are reconciled.

## Recommended implementation order

1. Create common types/evidence schema.
2. Implement `GS_PRODUCT_RESEARCH` first because both discovery and targeted search converge into it.
3. Add `GS_TARGETED_SEARCH` with a narrow backpack-style test case.
4. Add `GS_DISCOVERY` candidate scoring.
5. Add `GS_EDITORIAL` with human approval boundary.
6. Add AI Search/Browser/Queue integrations one at a time with explicit provenance handling.
7. Add admin status UI only after workflow instance APIs are stable.
