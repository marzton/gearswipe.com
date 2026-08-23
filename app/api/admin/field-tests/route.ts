import { db } from "@/db";
import { fieldTests } from "@/db/gearswipe-schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.select().from(fieldTests).orderBy(fieldTests.createdAt);
    return Response.json(result);
  } catch (error) {
    console.error("Field tests GET error:", error);
    return Response.json({ error: "Failed to fetch field tests" }, { status: 500 });
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
      title,
      slug,
      subtitle,
      description,
      testType,
      methodology,
      status,
      startDate,
      endDate,
      locations,
      daysActive,
      countriesVisited,
      flightsCompleted,
      failureCount,
      heroImage,
      content,
    } = body;

    if (!title || !slug) {
      return Response.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(fieldTests)
      .values({
        title,
        slug,
        subtitle: subtitle || null,
        description,
        testType: testType || "backpack",
        methodology: methodology || "gearswipe-standard",
        status: status || "upcoming",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        locations: locations ? JSON.stringify(locations) : "[]",
        daysActive: daysActive || 0,
        countriesVisited: countriesVisited || 0,
        flightsCompleted: flightsCompleted || 0,
        failureCount: failureCount || 0,
        heroImage: heroImage || null,
        content: content || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Field tests POST error:", error);
    return Response.json({ error: "Failed to create field test" }, { status: 500 });
  }
}
