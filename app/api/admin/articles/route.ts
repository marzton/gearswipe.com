import { auth } from "@/auth";
import { getDb } from "@/db";
import { articles } from "@/db/gearswipe-schema";

const requireOperator = async () => {
  const session = await auth();
  return session?.user?.role === "admin";
};

export async function GET() {
  if (!(await requireOperator())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await getDb().select().from(articles).orderBy(articles.updatedAt));
  } catch (error) {
    console.error("Articles GET error:", error);
    return Response.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireOperator())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.title !== "string" || typeof body.slug !== "string" || typeof body.body !== "string") {
    return Response.json({ error: "title, slug, and body are required" }, { status: 400 });
  }
  const title = body.title.trim();
  const slug = body.slug.trim().toLowerCase();
  if (!title || !body.body.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return Response.json({ error: "Use a title, body, and lowercase hyphenated slug" }, { status: 400 });
  }
  const heroImage = typeof body.heroImage === "string" && body.heroImage.trim().startsWith("/")
    ? body.heroImage.trim()
    : "/brand/gearswipe-logo-dark.svg";
  try {
    const result = await getDb().insert(articles).values({
      title, slug, body: body.body.trim(),
      dek: typeof body.dek === "string" ? body.dek : null,
      heroImage,
      gsId: typeof body.gsId === "string" ? body.gsId : null,
      // Creation is deliberately draft-only. A separate, review-gated
      // publishing action should be wired to the Production Desk before
      // editorial records become public.
      status: "draft", publishedAt: null,
      createdAt: new Date(), updatedAt: new Date(),
    }).returning();
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Articles POST error:", error);
    return Response.json({ error: "Failed to create article" }, { status: 500 });
  }
}
