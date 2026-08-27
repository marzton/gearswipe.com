import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import {
  type AcquisitionRoute,
  type EvidencePacket,
  type ProductResearchParams,
  type ProductResearchResult,
} from "../../lib/research/types";
import {
  persistEvidencePacket,
  researchArtifactPrefix,
  type ResearchStorageEnv,
} from "../../lib/research/storage";

interface ResearchWorkflowEnv extends ResearchStorageEnv {}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "product";
}

function chooseAcquisitionRoute(params: ProductResearchParams): AcquisitionRoute {
  if (params.forceAcquisitionRoute) return params.forceAcquisitionRoute;
  if (params.seedUrls?.length) return "WEB_RESEARCH";
  return "WATCH";
}

/**
 * Durable backbone for GearSwipe product research.
 *
 * This intentionally stops short of pretending the crawler / AI Search stack is
 * already wired. The steps establish stable checkpoints, artifact naming, and
 * the human acquisition boundary that Discovery and Targeted Search can reuse.
 */
export class GearSwipeProductResearchWorkflow extends WorkflowEntrypoint<
  ResearchWorkflowEnv,
  ProductResearchParams
> {
  async run(
    event: WorkflowEvent<ProductResearchParams>,
    step: WorkflowStep,
  ): Promise<ProductResearchResult> {
    const params = event.payload;
    const productSlug = slugify(`${params.product.brand ?? ""}-${params.product.name}`);
    const artifactPrefix = researchArtifactPrefix(productSlug, event.instanceId);

    const normalizedProduct = await step.do("normalize product identity", async () => ({
      ...params.product,
      name: params.product.name.trim(),
      brand: params.product.brand?.trim() || undefined,
      company: params.product.company?.trim() || undefined,
    }));

    const route = await step.do("choose research route", async () =>
      chooseAcquisitionRoute({ ...params, product: normalizedProduct }),
    );

    let acquisitionEvidence: { received: boolean; notes?: string } | undefined;
    if (
      route === "BUY" ||
      route === "RETAIL_VISIT" ||
      route === "REQUEST_LOANER" ||
      route === "REQUEST_SAMPLE" ||
      route === "SEEK_SPONSORSHIP" ||
      route === "CONTACT_BRAND"
    ) {
      const eventResult = await step.waitForEvent("wait for acquisition or field evidence", {
        type: "acquisition-ready",
        timeout: "30 days",
      });
      acquisitionEvidence = eventResult.payload as {
        received: boolean;
        notes?: string;
      };
    }

    const packet = await step.do("assemble evidence packet shell", async (): Promise<EvidencePacket> => ({
      product: normalizedProduct,
      sources: (params.seedUrls ?? []).map((url, index) => ({
        id: `seed-${index + 1}`,
        url,
        retrievedAt: new Date().toISOString(),
        kind: "other",
        primary: false,
      })),
      claims: [],
      provenanceSummary: acquisitionEvidence?.notes,
      overallConfidence: 0,
      recommendedRoute: route,
      artifactPrefix,
    }));

    await step.do("persist evidence packet", async () => {
      await persistEvidencePacket(this.env, packet);
    });

    if (route === "REJECT") return { status: "rejected", packet };

    if (
      route !== "WEB_RESEARCH" &&
      route !== "WATCH" &&
      acquisitionEvidence?.received !== true
    ) {
      return { status: "waiting-for-acquisition", packet };
    }

    return { status: "completed", packet };
  }
}
