import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import type { ProductIdentity } from "../../lib/research/types";

export interface DiscoveryParams {
  requestedBy: string;
  category?: string;
  seedUrls?: string[];
  brand?: string;
}

export interface DiscoveryResult {
  status: "completed";
  candidates: ProductIdentity[];
}

/** Candidate intake only; acquisition and publication remain separate workflows. */
export class GearSwipeDiscoveryWorkflow extends WorkflowEntrypoint<
  unknown,
  DiscoveryParams
> {
  async run(event: WorkflowEvent<DiscoveryParams>, step: WorkflowStep): Promise<DiscoveryResult> {
    const params = event.payload;
    const normalized = await step.do("normalize discovery request", async () => ({
      ...params,
      category: params.category?.trim() || undefined,
      brand: params.brand?.trim() || undefined,
      seedUrls: (params.seedUrls ?? []).filter((url) => /^https?:\/\//i.test(url)),
    }));

    // Discovery is deliberately provenance-safe: without an acquisition adapter,
    // return no invented products and let an operator add verified candidates.
    const candidates = await step.do("score discovered candidates", async () => {
      if (!normalized.brand || !normalized.category) return [];
      return [];
    });

    return { status: "completed", candidates };
  }
}
