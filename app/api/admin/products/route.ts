import { db } from "@/db";
import { products } from "@/db/gearswipe-schema";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.select().from(products).orderBy(products.createdAt);
    return Response.json(result);
  } catch (error) {
    console.error("Products GET error:", error);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      brand,
      model,
      category,
      description,
      price,
      currency,
      purchaseLink,
      verdict,
      buildRating,
      designRating,
      comfortRating,
      serviceRating,
      valueRating,
      heroImage,
      detailImages,
      materials,
      construction,
      manufacturing,
      warranty,
      isFeatured,
      isCommerceEnabled,
    } = body;

    if (!name || !slug || !brand) {
      return Response.json(
        { error: "Name, slug, and brand are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(products)
      .values({
        name,
        slug,
        brand,
        model: model || null,
        category: category || "carry",
        description: description || null,
        price: price ? parseFloat(price) : null,
        currency: currency || "USD",
        purchaseLink: purchaseLink || null,
        verdict: verdict || "good_with_caveats",
        buildRating: buildRating || null,
        designRating: designRating || null,
        comfortRating: comfortRating || null,
        serviceRating: serviceRating || null,
        valueRating: valueRating || null,
        heroImage: heroImage || null,
        detailImages: detailImages ? JSON.stringify(detailImages) : "[]",
        materials: materials || null,
        construction: construction || null,
        manufacturing: manufacturing || null,
        warranty: warranty || null,
        isFeatured: isFeatured || false,
        isCommerceEnabled: isCommerceEnabled || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
