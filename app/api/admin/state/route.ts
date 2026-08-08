import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminQueueItems, adminStoreItems } from "../../../../db/schema";
import {
  type AdminWorkspace,
  adminWorkspaces,
  seedAdminState,
} from "../../../../lib/admin-data";

type AdminItemKind = "queue" | "store";

function normalizeWorkspace(value: string | null): AdminWorkspace {
  if (value === "Gold Shore") return "Gold Shore";
  return "Gearswipe";
}

function isMissingDb(error: unknown): boolean {
  const message = error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : "";
  return message.includes("DB") || message.includes("no such table");
}

async function loadState(workspace: AdminWorkspace) {
  try {
    const db = getDb();
    const [queueRows, storeRows] = await Promise.all([
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
    ]);

    return {
      workspace,
      queueItems: queueRows,
      storeItems: storeRows,
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
  const url = new URL(request.url);
  const workspace = normalizeWorkspace(url.searchParams.get("workspace"));
  const state = await loadState(workspace);
  return Response.json({
    workspaces: adminWorkspaces,
    ...state,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    workspace?: string;
    kind?: AdminItemKind;
    title?: string;
    owner?: string;
    status?: string;
    detail?: string;
    name?: string;
    channel?: string;
    state?: string;
    value?: string;
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
  const body = (await request.json()) as {
    workspace?: string;
    kind?: AdminItemKind;
    id?: number;
    status?: string;
    state?: string;
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
