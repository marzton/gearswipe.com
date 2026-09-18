import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { articles } from "@/db/gearswipe-schema";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const [article] = await getDb().select().from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.status, "published"))).limit(1);
    return article ? Response.json(article) : Response.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Public article GET error:", error);
    return Response.json({ error: "Article is unavailable" }, { status: 503 });
  }
}
