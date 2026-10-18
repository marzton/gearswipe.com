import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import type { ProductIdentity } from "../../lib/research/types";

export interface TargetedSearchParams {
  requestedBy: string;
  query: string;
  candidates?: ProductIdentity[];
}

export interface TargetedSearchResult {
  status: "completed";
  query: string;
  shortlist: ProductIdentity[];
}

/** Deterministic shortlist checkpoint; retrieval adapters can be added later. */
export class GearSwipeTargetedSearchWorkflow extends WorkflowEntrypoint<
  unknown,
  TargetedSearchParams
> {
  async run(event: WorkflowEvent<TargetedSearchParams>, step: WorkflowStep): Promise<TargetedSearchResult> {
    const query = await step.do("normalize search intent", async () => event.payload.query.trim());
    const shortlist = await step.do("filter candidate products", async () =>
      (event.payload.candidates ?? []).filter((candidate) => candidate.name.trim().length > 0).slice(0, 20),
    );
    return { status: "completed", query, shortlist };
  }
}
