import type { EvidencePacket } from "./types";

export interface ResearchStorageEnv {
  RESEARCH_ASSETS?: R2Bucket;
}

export function researchArtifactPrefix(productSlug: string, instanceId: string): string {
  return `research/products/${productSlug}/${instanceId}`;
}

export async function putResearchArtifact(
  env: ResearchStorageEnv,
  key: string,
  body: string | ArrayBuffer | ArrayBufferView | ReadableStream,
  contentType = "application/octet-stream",
): Promise<void> {
  if (!env.RESEARCH_ASSETS) return;

  await env.RESEARCH_ASSETS.put(key, body, {
    httpMetadata: { contentType },
  });
}

export async function persistEvidencePacket(
  env: ResearchStorageEnv,
  packet: EvidencePacket,
): Promise<void> {
  if (!env.RESEARCH_ASSETS) return;

  await putResearchArtifact(
    env,
    `${packet.artifactPrefix}/evidence-packet.json`,
    JSON.stringify(packet, null, 2),
    "application/json; charset=utf-8",
  );
}
