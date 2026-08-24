import { getDb } from "@/db";
import { subscribers } from "@/db/gearswipe-schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 500);
    const skip = parseInt(searchParams.get("skip") || "0");
    const confirmed = searchParams.get("confirmed");

    let query = db.select().from(subscribers);

    if (confirmed === "true") {
      query = query.where(eq(subscribers.confirmed, true));
    } else if (confirmed === "false") {
      query = query.where(eq(subscribers.confirmed, false));
    }

    const result = await query
      .orderBy(subscribers.createdAt)
      .limit(limit)
      .offset(skip);

    return Response.json(result);
  } catch (error) {
    console.error("Subscribers GET error:", error);
    return Response.json({ error: "Failed to fetch subscribers" }, { status: 500 });
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
      email,
      subscribedToFieldTests,
      subscribedToComparisons,
      subscribedToHeritage,
      subscribedToManufacturing,
      confirmed,
    } = body;

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length) {
      return Response.json(
        { error: "Subscriber already exists" },
        { status: 409 }
      );
    }

    const result = await db
      .insert(subscribers)
      .values({
        email: email.toLowerCase(),
        subscribedToFieldTests: subscribedToFieldTests ?? true,
        subscribedToComparisons: subscribedToComparisons ?? true,
        subscribedToHeritage: subscribedToHeritage ?? true,
        subscribedToManufacturing: subscribedToManufacturing ?? true,
        confirmed: confirmed ?? false,
        unsubscribed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Subscribers POST error:", error);
    return Response.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}
