import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { researchEvidence, researchJobs } from "@/db/schema";
import { requireOperator } from "@/lib/operator-auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const { id } = await params;
  const db = getDb();
  const [job] = await db.select().from(researchJobs).where(eq(researchJobs.id, id)).limit(1);
  if (!job) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ job, evidence: await db.select().from(researchEvidence).where(eq(researchEvidence.jobId, id)) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const { id } = await params;
  if ((await request.json() as { action?: string }).action !== "approve_for_draft") return Response.json({ error: "Only approve_for_draft is supported" }, { status: 400 });
  const [job] = await getDb().update(researchJobs).set({ status: "approved_for_draft", updatedAt: new Date().toISOString() }).where(eq(researchJobs.id, id)).returning();
  if (!job) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ job, approvedBy: operator.email });
}
