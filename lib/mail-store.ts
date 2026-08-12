import { desc, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { getDb } from "../db";
import type { MailFormType, MailWorkspace } from "./mail-routing";
import { mailRouteSummary, resolveMailRoute } from "./mail-routing";

export type MailSubmissionRecord = {
  workspace: MailWorkspace;
  formType: MailFormType;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

type MailStoreRow = {
  id: number;
  workspace: string;
  formType: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  routeAlias: string;
  routedTo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function isMissingDb(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : "";
  return message.includes("DB") || message.includes("no such table");
}

export async function storeMailSubmission(record: MailSubmissionRecord) {
  const route = resolveMailRoute(record.workspace, record.formType);

  try {
    const db = getDb();
    const [row] = await db
      .insert(schema.mailSubmissions)
      .values({
        workspace: record.workspace,
        formType: record.formType,
        name: record.name,
        email: record.email,
        company: record.company,
        subject: record.subject,
        message: record.message,
        routeAlias: route.alias,
        routedTo: route.to.join(", "),
        status: "queued",
      })
      .returning();

    return {
      source: "db" as const,
      route: mailRouteSummary(route),
      row,
    };
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return {
      source: "seed" as const,
      route: mailRouteSummary(route),
      row: {
        id: 0,
        workspace: record.workspace,
        formType: record.formType,
        name: record.name,
        email: record.email,
        company: record.company,
        subject: record.subject,
        message: record.message,
        routeAlias: route.alias,
        routedTo: route.to.join(", "),
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies MailStoreRow,
    };
  }
}

export async function listRecentMailSubmissions(workspace: MailWorkspace) {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.mailSubmissions)
      .where(eq(schema.mailSubmissions.workspace, workspace))
      .orderBy(desc(schema.mailSubmissions.updatedAt), desc(schema.mailSubmissions.id))
      .limit(20);
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return [];
  }
}

export async function storeNewsletterSignup(record: {
  workspace: MailWorkspace;
  email: string;
}) {
  const route = resolveMailRoute(record.workspace, "subscribe");

  try {
    const db = getDb();
    const [row] = await db
      .insert(schema.newsletterSignups)
      .values({
        workspace: record.workspace,
        email: record.email,
        status: "pending",
        routeAlias: route.alias,
        routedTo: route.to.join(", "),
      })
      .returning();

    return {
      source: "db" as const,
      route: mailRouteSummary(route),
      row,
    };
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return {
      source: "seed" as const,
      route: mailRouteSummary(route),
      row: {
        id: 0,
        workspace: record.workspace,
        email: record.email,
        status: "pending",
        routeAlias: route.alias,
        routedTo: route.to.join(", "),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
