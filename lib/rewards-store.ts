import { desc, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { getDb } from "../db";
import type { MailWorkspace } from "./mail-routing";

type RewardRecord = {
  workspace: MailWorkspace;
  name: string;
  email: string;
  interest: string;
};

function isMissingDb(error: unknown) {
  const message =
    error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : "";
  return message.includes("DB") || message.includes("no such table");
}

export async function storeRewardSignup(record: RewardRecord) {
  try {
    const db = getDb();
    const [row] = await db
      .insert(schema.rewardSignups)
      .values({
        workspace: record.workspace,
        name: record.name,
        email: record.email,
        interest: record.interest,
        points: 100,
        status: "pending",
      })
      .returning();

    return {
      source: "db" as const,
      pointsAwarded: row.points,
      row,
    };
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return {
      source: "seed" as const,
      pointsAwarded: 100,
      row: {
        id: 0,
        workspace: record.workspace,
        name: record.name,
        email: record.email,
        interest: record.interest,
        points: 100,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }
}

export async function listRecentRewardSignups(workspace: MailWorkspace) {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.rewardSignups)
      .where(eq(schema.rewardSignups.workspace, workspace))
      .orderBy(desc(schema.rewardSignups.updatedAt), desc(schema.rewardSignups.id))
      .limit(10);
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return [];
  }
}
