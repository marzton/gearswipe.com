import { getDb } from "@/db";
import { comparisons } from "@/db/gearswipe-schema";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const result = await db
      .select()
      .from(comparisons)
      .orderBy(comparisons.createdAt);
    return Response.json(result);
  } catch (error) {
    console.error("Comparisons GET error:", error);
    return Response.json({ error: "Failed to fetch comparisons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const {
      title,
      slug,
      description,
      productIds,
      comparisonCategories,
      content,
      heroImage,
      pick,
      pickReason,
      status,
    } = body;

    if (!title || !slug || !productIds?.length) {
      return Response.json(
        { error: "Title, slug, and at least 2 product IDs are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(comparisons)
      .values({
        title,
        slug,
        description: description || null,
        productIds: JSON.stringify(productIds),
        comparisonCategories: JSON.stringify(
          comparisonCategories || [
            "Construction",
            "Materials",
            "Hardware",
            "Ergonomics",
            "Capacity",
            "Weight",
            "Repairability",
            "Warranty",
            "Company support",
            "Price",
            "Value over time",
          ]
        ),
        content: content || null,
        heroImage: heroImage || null,
        pick: pick || null,
        pickReason: pickReason || null,
        status: status || "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Comparisons POST error:", error);
    return Response.json({ error: "Failed to create comparison" }, { status: 500 });
  }
}
