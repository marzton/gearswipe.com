import { getDb } from "@/db";
import { comparisons, products } from "@/db/gearswipe-schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const comparison = await db
      .select()
      .from(comparisons)
      .where(eq(comparisons.id, params.id))
      .limit(1);

    if (!comparison.length) {
      return Response.json({ error: "Comparison not found" }, { status: 404 });
    }

    const comp = comparison[0];
    const productIds = JSON.parse(comp.productIds || "[]") as string[];

    const comparedProducts = productIds.length
      ? await db.select().from(products).where(inArray(products.id, productIds))
      : [];

    return Response.json({
      ...comp,
      products: comparedProducts.map((p) => ({
        ...p,
        detailImages: JSON.parse(p.detailImages || "[]"),
      })),
      categories: JSON.parse(comp.comparisonCategories || "[]"),
    });
  } catch (error) {
    console.error("Comparison GET error:", error);
    return Response.json({ error: "Failed to fetch comparison" }, { status: 500 });
  }
}
