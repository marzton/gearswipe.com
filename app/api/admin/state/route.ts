import { desc, eq } from "drizzle-orm";
import { requireOperator } from "@/lib/operator-auth";
import { getDb } from "../../../../db";
import {
  adminQueueItems,
  adminStoreItems,
  vendorLicensingItems,
} from "../../../../db/schema";
import {
  type AdminWorkspace,
  adminWorkspaces,
  seedAdminState,
} from "../../../../lib/admin-data";

type AdminItemKind = "queue" | "store";
type VendorOperationKind = "vendor";

function normalizeWorkspace(value: string | null): AdminWorkspace {
  if (value === "Gold Shore") return "Gold Shore";
  return "Gearswipe";
}

function isMissingDb(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : "";
  return message.includes("DB") || message.includes("no such table");
}

async function loadState(workspace: AdminWorkspace) {
  try {
    const db = getDb();
    const [queueRows, storeRows, vendorRows] = await Promise.all([
      db
        .select()
        .from(adminQueueItems)
        .where(eq(adminQueueItems.workspace, workspace))
        .orderBy(desc(adminQueueItems.updatedAt), desc(adminQueueItems.id))
        .limit(50),
      db
        .select()
        .from(adminStoreItems)
        .where(eq(adminStoreItems.workspace, workspace))
        .orderBy(desc(adminStoreItems.updatedAt), desc(adminStoreItems.id))
        .limit(50),
      db
        .select()
        .from(vendorLicensingItems)
        .where(eq(vendorLicensingItems.workspace, workspace))
        .orderBy(desc(vendorLicensingItems.updatedAt), desc(vendorLicensingItems.id))
        .limit(50),
    ]);

    return {
      workspace,
      queueItems: queueRows,
      storeItems: storeRows,
      vendorItems: vendorRows,
      source: "db",
    };
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    const seed = seedAdminState(workspace);
    return {
      workspace,
      ...seed,
      source: "seed",
    };
  }
}

export async function GET(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const url = new URL(request.url);
  const workspace = normalizeWorkspace(url.searchParams.get("workspace"));
  const state = await loadState(workspace);
  return Response.json({
    workspaces: adminWorkspaces,
    ...state,
  });
}

export async function POST(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const body = (await request.json()) as {
    workspace?: string;
    kind?: AdminItemKind | VendorOperationKind;
    title?: string;
    owner?: string;
    status?: string;
    detail?: string;
    name?: string;
    channel?: string;
    state?: string;
    value?: string;
    company?: string;
    vendorType?: string;
    contactName?: string;
    contactTitle?: string;
    email?: string;
    phone?: string;
    website?: string;
    territory?: string;
    productCategories?: string;
    minimumOrderRequirements?: string;
    dealerResellerApplicationUrl?: string;
    currentRelationshipStatus?: string;
    documents?: string;
    catalogApiAvailability?: string;
    productImageRights?: string;
    trademarkLogoPermissions?: string;
    pricingFeedPermissions?: string;
    aiDataProcessingPermissions?: string;
    agreementEffectiveDate?: string;
    agreementExpirationDate?: string;
    aiVendorBrief?: string;
    outreachEmail?: string;
    requestedPermissions?: string;
    notes?: string;
  };

  const workspace = normalizeWorkspace(body.workspace ?? null);
  const kind = body.kind ?? "queue";

  try {
    const db = getDb();

    if (kind === "queue") {
      const title = body.title?.trim() ?? "";
      const owner = body.owner?.trim() ?? "";
      const status = body.status?.trim() ?? "";
      const detail = body.detail?.trim() ?? "";

      if (!title || !owner || !status) {
        return Response.json(
          { error: "title, owner, and status are required" },
          { status: 400 },
        );
      }

      const [row] = await db
        .insert(adminQueueItems)
        .values({ workspace, title, owner, status, detail })
        .returning();

      return Response.json({ item: row }, { status: 201 });
    }

    if (kind === "store") {
      const name = body.name?.trim() ?? "";
      const channel = body.channel?.trim() ?? "";
      const state = body.state?.trim() ?? "";
      const value = body.value?.trim() ?? "";

      if (!name || !channel || !state) {
        return Response.json(
          { error: "name, channel, and state are required" },
          { status: 400 },
        );
      }

      const [row] = await db
        .insert(adminStoreItems)
        .values({ workspace, name, channel, state, value })
        .returning();

      return Response.json({ item: row }, { status: 201 });
    }

    const company = body.company?.trim() ?? "";
    const vendorType = body.vendorType?.trim() ?? "";
    const contactName = body.contactName?.trim() ?? "";
    const contactTitle = body.contactTitle?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const website = body.website?.trim() ?? "";
    const territory = body.territory?.trim() ?? "";
    const productCategories = body.productCategories?.trim() ?? "";
    const minimumOrderRequirements = body.minimumOrderRequirements?.trim() ?? "";
    const dealerResellerApplicationUrl = body.dealerResellerApplicationUrl?.trim() ?? "";
    const currentRelationshipStatus = body.currentRelationshipStatus?.trim() ?? "Prospect";
    const documents = body.documents?.trim() ?? "";
    const catalogApiAvailability = body.catalogApiAvailability?.trim() ?? "Unknown";
    const productImageRights = body.productImageRights?.trim() ?? "Pending";
    const trademarkLogoPermissions = body.trademarkLogoPermissions?.trim() ?? "Pending";
    const pricingFeedPermissions = body.pricingFeedPermissions?.trim() ?? "Pending";
    const aiDataProcessingPermissions = body.aiDataProcessingPermissions?.trim() ?? "Pending";
    const agreementEffectiveDate = body.agreementEffectiveDate?.trim() ?? "";
    const agreementExpirationDate = body.agreementExpirationDate?.trim() ?? "";
    const aiVendorBrief = body.aiVendorBrief?.trim() ?? "";
    const outreachEmail = body.outreachEmail?.trim() ?? "";
    const requestedPermissions = body.requestedPermissions?.trim() ?? "";
    const notes = body.notes?.trim() ?? "";

    if (!company || !vendorType) {
      return Response.json(
        { error: "company and vendorType are required" },
        { status: 400 },
      );
    }

    const [row] = await db
      .insert(vendorLicensingItems)
      .values({
        workspace,
        company,
        vendorType,
        contactName,
        contactTitle,
        email,
        phone,
        website,
        territory,
        productCategories,
        minimumOrderRequirements,
        dealerResellerApplicationUrl,
        currentRelationshipStatus,
        documents,
        catalogApiAvailability,
        productImageRights,
        trademarkLogoPermissions,
        pricingFeedPermissions,
        aiDataProcessingPermissions,
        agreementEffectiveDate,
        agreementExpirationDate,
        aiVendorBrief,
        outreachEmail,
        requestedPermissions,
        notes,
      })
      .returning();

    return Response.json({ item: row }, { status: 201 });
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return Response.json(
      {
        error:
          "D1 storage is not available in this environment yet. Add the DB binding and run the migration to persist admin workflows.",
      },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const operator = await requireOperator();
  if (operator instanceof Response) return operator;
  const body = (await request.json()) as {
    workspace?: string;
    kind?: AdminItemKind | VendorOperationKind;
    id?: number;
    status?: string;
    state?: string;
    currentRelationshipStatus?: string;
    catalogApiAvailability?: string;
    productImageRights?: string;
    trademarkLogoPermissions?: string;
    pricingFeedPermissions?: string;
    aiDataProcessingPermissions?: string;
    agreementEffectiveDate?: string;
    agreementExpirationDate?: string;
  };

  const workspace = normalizeWorkspace(body.workspace ?? null);
  const id = Number(body.id);

  if (!Number.isFinite(id)) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const db = getDb();

    if (body.kind === "store") {
      const state = body.state?.trim() ?? "";
      if (!state) {
        return Response.json({ error: "state is required" }, { status: 400 });
      }

      const [row] = await db
        .update(adminStoreItems)
        .set({ state, updatedAt: sqlNow() })
        .where(eq(adminStoreItems.id, id))
        .returning();

      return Response.json({ item: row, workspace });
    }

    if (body.kind === "vendor") {
      const currentRelationshipStatus = body.currentRelationshipStatus?.trim() ?? "";
      if (!currentRelationshipStatus) {
        return Response.json(
          { error: "currentRelationshipStatus is required" },
          { status: 400 },
        );
      }

      const [row] = await db
        .update(vendorLicensingItems)
        .set({
          currentRelationshipStatus,
          catalogApiAvailability: body.catalogApiAvailability?.trim() ?? "Unknown",
          productImageRights: body.productImageRights?.trim() ?? "Pending",
          trademarkLogoPermissions: body.trademarkLogoPermissions?.trim() ?? "Pending",
          pricingFeedPermissions: body.pricingFeedPermissions?.trim() ?? "Pending",
          aiDataProcessingPermissions: body.aiDataProcessingPermissions?.trim() ?? "Pending",
          agreementEffectiveDate: body.agreementEffectiveDate?.trim() ?? "",
          agreementExpirationDate: body.agreementExpirationDate?.trim() ?? "",
          updatedAt: sqlNow(),
        })
        .where(eq(vendorLicensingItems.id, id))
        .returning();

      return Response.json({ item: row, workspace });
    }

    const status = body.status?.trim() ?? "";
    if (!status) {
      return Response.json({ error: "status is required" }, { status: 400 });
    }

    const [row] = await db
      .update(adminQueueItems)
      .set({ status, updatedAt: sqlNow() })
      .where(eq(adminQueueItems.id, id))
      .returning();

    return Response.json({ item: row, workspace });
  } catch (error) {
    if (!isMissingDb(error)) throw error;
    return Response.json(
      {
        error:
          "D1 storage is not available in this environment yet. Add the DB binding and run the migration to persist admin workflows.",
      },
      { status: 503 },
    );
  }
}

function sqlNow() {
  return new Date().toISOString();
}
