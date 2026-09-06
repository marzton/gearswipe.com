import { desc, eq } from "drizzle-orm";
import { getDb, getRuntimeEnv } from "@/db";
import { contentObjects, intakeAssets } from "@/db/schema";
import { requireOperator } from "@/lib/operator-auth";

const GS_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,63}$/;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

export async function GET() {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const db = getDb();
  const objects = await db.select().from(contentObjects).orderBy(desc(contentObjects.updatedAt)).limit(50);
  return Response.json({ objects });
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const env = getRuntimeEnv();
  if (!env?.ASSETS_R2) return Response.json({ error: "Asset storage is not configured for this runtime." }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const gsId = String(form?.get("gsId") ?? "").trim();
  const title = String(form?.get("title") ?? "").trim();
  const file = form?.get("file");
  if (!GS_ID.test(gsId) || !title || !(file instanceof File)) {
    return Response.json({ error: "gsId, title, and one file are required." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return Response.json({ error: "Files must be between 1 byte and 15 MB." }, { status: 413 });
  }

  const filename = file.name.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 160) || "source-file";
  const objectKey = `gs-intake/${gsId}/${crypto.randomUUID()}-${filename}`;
  const db = getDb();
  await db.insert(contentObjects).values({ gsId, title, status: "intake" }).onConflictDoUpdate({
    target: contentObjects.gsId,
    set: { title, updatedAt: new Date().toISOString() },
  });
  await env.ASSETS_R2.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
  const [asset] = await db.insert(intakeAssets).values({
    id: crypto.randomUUID(), gsId, objectKey, filename,
    contentType: file.type || "application/octet-stream", sizeBytes: file.size,
  }).returning();
  return Response.json({ asset, uploadedBy: operator.email }, { status: 201 });
}
