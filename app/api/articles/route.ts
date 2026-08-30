import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { articles } from "@/db/gearswipe-schema";

export async function GET() {
  try {
    const result = await getDb().select().from(articles)
      .where(eq(articles.status, "published")).orderBy(desc(articles.publishedAt));
    return Response.json(result);
  } catch (error) {
    console.error("Public articles GET error:", error);
    return Response.json({ error: "Articles are unavailable" }, { status: 503 });
  }
}
