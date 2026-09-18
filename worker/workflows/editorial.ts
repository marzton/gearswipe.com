import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import type { EvidencePacket } from "../../lib/research/types";

export interface EditorialParams {
  requestedBy: string;
  packet: EvidencePacket;
  title?: string;
}

export interface EditorialResult {
  status: "awaiting-approval" | "rejected" | "approved";
  title: string;
  packet: EvidencePacket;
}

/** Drafting boundary. Publishing requires an explicit operator approval event. */
export class GearSwipeEditorialWorkflow extends WorkflowEntrypoint<unknown, EditorialParams> {
  async run(event: WorkflowEvent<EditorialParams>, step: WorkflowStep): Promise<EditorialResult> {
    const draft = await step.do("prepare editorial draft", async () => ({
      title: event.payload.title?.trim() || `${event.payload.packet.product.name} research`,
      packet: event.payload.packet,
    }));
    const approval = await step.waitForEvent("wait for editorial approval", {
      type: "editorial-approval",
      timeout: "30 days",
    });
    const approved = approval.payload as { approved?: boolean };
    return {
      status: approved.approved === true ? "approved" : "rejected",
      title: draft.title,
      packet: draft.packet,
    };
  }
}
