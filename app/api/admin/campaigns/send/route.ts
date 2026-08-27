import { db } from "@/db";
import { subscribers } from "@/db/gearswipe-schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

interface EmailProvider {
  send(options: {
    to: string | string[];
    from: { email: string; name?: string };
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<unknown>;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      subject,
      text,
      html,
      type, // 'fieldTests', 'comparisons', 'heritage', 'manufacturing', or 'all'
      from = { email: "updates@gearswipe.com", name: "Gearswipe" },
      replyTo = "support@gearswipe.com",
    } = body;

    if (!subject || !text || !html) {
      return Response.json(
        { error: "Subject, text, and html are required" },
        { status: 400 }
      );
    }

    // Build subscriber filter based on campaign type
    let condition;
    switch (type) {
      case "fieldTests":
        condition = and(
          eq(subscribers.subscribedToFieldTests, true),
          eq(subscribers.confirmed, true)
        );
        break;
      case "comparisons":
        condition = and(
          eq(subscribers.subscribedToComparisons, true),
          eq(subscribers.confirmed, true)
        );
        break;
      case "heritage":
        condition = and(
          eq(subscribers.subscribedToHeritage, true),
          eq(subscribers.confirmed, true)
        );
        break;
      case "manufacturing":
        condition = and(
          eq(subscribers.subscribedToManufacturing, true),
          eq(subscribers.confirmed, true)
        );
        break;
      default:
        condition = eq(subscribers.confirmed, true);
    }

    // Get subscribers
    const targetSubscribers = await db
      .select({ email: subscribers.email })
      .from(subscribers)
      .where(condition);

    if (!targetSubscribers.length) {
      return Response.json({ sent: 0, failed: 0 });
    }

    const emails = targetSubscribers.map((s) => s.email);

    // Try to send via EMAIL provider (Cloudflare Email API)
    // This will be available if configured in wrangler.toml
    const env = (globalThis as any).__GEARSWIPE_ENV__;
    let sent = 0;
    let failed = 0;

    if (env?.EMAIL) {
      const emailProvider = env.EMAIL as EmailProvider;
      try {
        await emailProvider.send({
          to: emails,
          from,
          subject,
          text,
          html,
          replyTo,
        });
        sent = emails.length;
      } catch (error) {
        console.error("Email send error:", error);
        failed = emails.length;
      }
    } else {
      // If no EMAIL provider, just log that emails would be sent
      console.warn("EMAIL provider not configured. Would have sent to:", emails);
      sent = emails.length; // Mark as sent for now since we're in development
    }

    return Response.json({
      sent,
      failed,
      targetedType: type || "all",
      recipientCount: emails.length,
    });
  } catch (error) {
    console.error("Campaign send error:", error);
    return Response.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
