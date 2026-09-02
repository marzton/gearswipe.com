import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { researchEvidence, researchJobs } from "@/db/schema";
import { requireOperator } from "@/lib/operator-auth";
import { searchForResearch } from "@/lib/research/ai-search-agent";

export async function GET() {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const jobs = await getDb().select().from(researchJobs).orderBy(desc(researchJobs.updatedAt)).limit(50);
  return Response.json({ jobs });
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const body = await request.json() as { title?: string; query?: string; gsId?: string; seedUrls?: string[] };
  const title = body.title?.trim() ?? "";
  const query = body.query?.trim() ?? "";
  if (!title || !query) return Response.json({ error: "title and query are required" }, { status: 400 });

  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(researchJobs).values({
    id, title, query, gsId: body.gsId?.trim() ?? "", requestedBy: operator.email,
    status: "running", inputJson: JSON.stringify({ seedUrls: body.seedUrls ?? [] }), resultJson: "{}",
  });
  try {
    const result = await searchForResearch(query);
    await db.update(researchJobs).set({ status: result.state, resultJson: JSON.stringify(result), updatedAt: new Date().toISOString() }).where(eq(researchJobs.id, id));
    if (result.citations.length) await db.insert(researchEvidence).values(result.citations.map((citation) => ({ id: crypto.randomUUID(), jobId: id, ...citation })));
    return Response.json({ id, ...result }, { status: 201 });
  } catch (error) {
    await db.update(researchJobs).set({ status: "failed", errorCode: "ai_search_failed", updatedAt: new Date().toISOString() }).where(eq(researchJobs.id, id));
    console.error("Research retrieval failed", error);
    return Response.json({ id, error: "Research retrieval failed" }, { status: 502 });
  }
}
