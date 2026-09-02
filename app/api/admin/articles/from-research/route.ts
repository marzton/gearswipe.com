import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { researchEvidence, researchJobs } from "@/db/schema";
import { articles } from "@/db/gearswipe-schema";
import { requireOperator } from "@/lib/operator-auth";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);

/** Creates a reviewable, citation-preserving draft. It does not publish or call an LLM. */
export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const body = await request.json().catch(() => null) as { jobId?: string } | null;
  if (!body?.jobId) return Response.json({ error: "jobId is required" }, { status: 400 });
  const db = getDb();
  const [job] = await db.select().from(researchJobs).where(eq(researchJobs.id, body.jobId)).limit(1);
  if (!job) return Response.json({ error: "Research job not found" }, { status: 404 });
  if (!["needs_review", "approved_for_draft"].includes(job.status)) {
    return Response.json({ error: "Research job is not ready for drafting" }, { status: 409 });
  }
  const evidence = await db.select().from(researchEvidence).where(eq(researchEvidence.jobId, job.id));
  const slug = `${slugify(job.title) || "gearswipe-object"}-${job.id.slice(0, 8)}`;
  const citations = evidence.length
    ? evidence.map((item, index) => `${index + 1}. ${item.title || item.sourceUrl}\n   ${item.excerpt}\n   Source: ${item.sourceUrl}`).join("\n\n")
    : "No citations were returned. This draft requires additional research before review.";
  const draftBody = `## Research brief\n\n${job.query}\n\n## Evidence\n\n${citations}\n\n## Operator review\n\nThis is a generated draft scaffold created by ${operator.email}. Verify every claim and complete the editorial draft before publication.`;
  const [draft] = await db.insert(articles).values({
    title: job.title, slug, dek: `Reviewable research draft for ${job.gsId || "an unlinked object"}.`,
    body: draftBody, heroImage: "/brand/gearswipe-logo-dark.svg", gsId: job.gsId || null,
    status: "draft", publishedAt: null, createdAt: new Date(), updatedAt: new Date(),
  }).returning();
  return Response.json({ draft }, { status: 201 });
}
