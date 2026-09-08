import "server-only";

import { count } from "drizzle-orm";
import { getDb, getRuntimeEnv } from "@/db";
import { articles } from "@/db/gearswipe-schema";
import { contentObjects, researchJobs } from "@/db/schema";

export type AdminModuleHref =
  | "/admin/products"
  | "/admin/quotes"
  | "/admin/vendors"
  | "/admin/assets"
  | "/admin/research"
  | "/admin/production"
  | "/admin/articles"
  | "/admin/bounties";

export type AdminModuleStatusKind =
  | "ready"
  | "empty"
  | "unauthorized"
  | "unavailable"
  | "error";

export type AdminModuleStatus = {
  kind: AdminModuleStatusKind;
  label: string;
  detail: string;
  count?: number;
};

export type AdminModule = {
  href: AdminModuleHref;
  label: string;
  description: string;
  dependency: string;
  beta?: boolean;
  loadStatus: () => Promise<AdminModuleStatus>;
};

const prototypeStatus = (count: number): Promise<AdminModuleStatus> =>
  Promise.resolve({
    kind: "ready",
    label: "Prototype data",
    detail: `${count} local records available; no runtime binding required.`,
    count,
  });

async function d1Count(
  label: string,
  query: () => Promise<Array<{ value: number }>>,
): Promise<AdminModuleStatus> {
  const rows = await query();
  const value = Number(rows[0]?.value ?? 0);
  return value === 0
    ? { kind: "empty", label: "No data yet", detail: `${label} storage is available and currently empty.`, count: 0 }
    : { kind: "ready", label: "Available", detail: `${value} ${label.toLowerCase()} record${value === 1 ? "" : "s"} available.`, count: value };
}

export const adminModules: readonly AdminModule[] = [
  {
    href: "/admin/products",
    label: "Products",
    description: "Review the operator product catalog and publishing readiness.",
    dependency: "Server-rendered prototype dataset",
    loadStatus: () => prototypeStatus(6),
  },
  {
    href: "/admin/quotes",
    label: "Quotes & Orders",
    description: "Track custom build requests through their current stage.",
    dependency: "Server-rendered prototype dataset",
    loadStatus: () => prototypeStatus(6),
  },
  {
    href: "/admin/vendors",
    label: "Vendors & Partners",
    description: "Review relationships, permissions, and agreement status.",
    dependency: "Server-rendered prototype dataset",
    loadStatus: () => prototypeStatus(6),
  },
  {
    href: "/admin/assets",
    label: "Product Assets",
    description: "Review provenance, licensing, and publication state.",
    dependency: "Server-rendered prototype dataset",
    loadStatus: () => prototypeStatus(5),
  },
  {
    href: "/admin/research",
    label: "Research Workspace",
    description: "Retrieve source evidence for human review without changing canonical facts.",
    dependency: "D1; AI Search required only when starting retrieval",
    loadStatus: () => d1Count("Research job", () => getDb().select({ value: count() }).from(researchJobs)),
  },
  {
    href: "/admin/production",
    label: "Production Desk",
    description: "Move object intake through cited research and a human release gate.",
    dependency: "D1 and ASSETS_R2 for uploads",
    loadStatus: async () => {
      if (!getRuntimeEnv()?.ASSETS_R2) {
        return { kind: "unavailable", label: "Upload binding unavailable", detail: "ASSETS_R2 is required for production uploads; local staging remains available." };
      }
      return d1Count("Intake object", () => getDb().select({ value: count() }).from(contentObjects));
    },
  },
  {
    href: "/admin/articles",
    label: "Editorial CMS",
    description: "Prepare object-linked drafts while keeping publication operator-controlled.",
    dependency: "D1",
    loadStatus: () => d1Count("Article", () => getDb().select({ value: count() }).from(articles)),
  },
  {
    href: "/admin/bounties",
    label: "Bounty Hunter Beta",
    description: "Inspect the governed bounty contract boundary before operator workflows expand.",
    dependency: "D1 bounty migrations",
    beta: true,
    loadStatus: async () => {
      const database = getRuntimeEnv()?.DB;
      if (!database) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
      const row = await database.prepare("SELECT count(*) AS value FROM bounties").first<{ value: number }>();
      const value = Number(row?.value ?? 0);
      return value === 0
        ? { kind: "empty", label: "No bounties yet", detail: "The beta contract tables are available and currently empty.", count: 0 }
        : { kind: "ready", label: "Beta available", detail: `${value} governed bounty record${value === 1 ? "" : "s"} available.`, count: value };
    },
  },
] as const;

function unavailableStatus(error: unknown): AdminModuleStatus {
  const message = error instanceof Error ? error.message : String(error);
  if (/binding|DB|D1|no such table|not configured/i.test(message)) {
    return {
      kind: "unavailable",
      label: "Runtime unavailable",
      detail: "A required runtime binding or migration is not available in this environment.",
    };
  }
  return { kind: "error", label: "Status check failed", detail: "The module remains linked, but its status could not be loaded." };
}

export async function loadAdminModuleStatuses(authorized: boolean) {
  if (!authorized) {
    return adminModules.map((module) => ({
      module,
      status: { kind: "unauthorized", label: "Authorization required", detail: "Operator access could not be verified." } satisfies AdminModuleStatus,
    }));
  }

  const results = await Promise.allSettled(adminModules.map((module) => module.loadStatus()));
  return adminModules.map((module, index) => ({
    module,
    status: results[index].status === "fulfilled" ? results[index].value : unavailableStatus(results[index].reason),
  }));
}
