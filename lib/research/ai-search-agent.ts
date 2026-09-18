import { getRuntimeEnv } from "@/db";

export type ResearchCitation = { sourceUrl: string; title: string; excerpt: string; score: number };
type SearchResult = { chunks?: Array<{ score?: number; content?: string; text?: string; metadata?: { url?: string; title?: string } }> };
type SearchInstance = { search(input: { messages: Array<{ role: "user"; content: string }>; ai_search_options: { retrieval: { retrieval_type: "hybrid"; max_num_results: number } } }): Promise<SearchResult> };
type SearchNamespace = { get(instanceName: string): SearchInstance };

/** Retrieval-only: never indexes data, creates instances, publishes, or mutates canonical facts. */
export async function searchForResearch(query: string): Promise<{ state: "needs_configuration" | "needs_review"; citations: ResearchCitation[] }> {
  const namespace = getRuntimeEnv()?.AI_SEARCH as SearchNamespace | undefined;
  const instanceName = process.env.GEARSWIPE_AI_SEARCH_INSTANCE?.trim();
  if (!namespace || !instanceName) return { state: "needs_configuration", citations: [] };
  const result = await namespace.get(instanceName).search({
    messages: [{ role: "user", content: query }],
    ai_search_options: { retrieval: { retrieval_type: "hybrid", max_num_results: 8 } },
  });
  return {
    state: "needs_review",
    citations: (result.chunks ?? []).map((chunk) => ({
      sourceUrl: chunk.metadata?.url ?? "",
      title: chunk.metadata?.title ?? "",
      excerpt: (chunk.content ?? chunk.text ?? "").slice(0, 2000),
      score: Number.isFinite(chunk.score) ? Number(chunk.score) : 0,
    })),
  };
}
