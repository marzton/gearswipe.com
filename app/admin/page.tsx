"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type AdminQueueItem,
  type AdminStoreItem,
  type AdminWorkspace,
  adminWorkspaces,
  siteGraphLinks,
} from "../../lib/admin-data";

type AdminResponse = {
  workspace: AdminWorkspace;
  queueItems: AdminQueueItem[];
  storeItems: AdminStoreItem[];
  source: "db" | "seed";
};

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-[#263246] bg-[#10161f] p-4">
      <p className="text-[11px] uppercase tracking-[0.35em] text-[#8191a5]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#9aa9bb]">{note}</p>
    </div>
  );
}

const queueStatusPresets = ["Drafting", "Ready", "Pending", "Scheduled", "Active", "Archived"];
const storeStatePresets = ["Featured", "Instant", "Tracked", "Ready", "Active", "Paused"];

function nextPreset(current: string, presets: string[]) {
  const index = presets.indexOf(current);
  return presets[(index + 1) % presets.length] ?? presets[0];
}

function buildPipelineInsight(
  workspace: AdminWorkspace,
  queueItems: AdminQueueItem[],
  storeItems: AdminStoreItem[],
) {
  const activeLicenseRequests = queueItems.filter((item) =>
    /license|licensing|key|activation/i.test(`${item.title} ${item.detail} ${item.owner}`),
  );
  const activeStoreOffers = storeItems.filter((item) =>
    /license|key|software|security/i.test(`${item.name} ${item.channel} ${item.state}`),
  );

  if (workspace !== "Gearswipe") {
    return {
      title: "Gold Shore workflow",
      body:
        "Prioritize trust, contract intake, and document handling. AI can summarize incoming requests and route them into the right owner lane.",
      action: "Focus on contracts and verification",
    };
  }

  if (activeLicenseRequests.length > 0) {
    return {
      title: "License pipeline is active",
      body:
        `${activeLicenseRequests.length} license-related queue items are waiting on review. AI can draft outreach, surface missing metadata, and route approval notes.`,
      action: "Review license outreach",
    };
  }

  if (activeStoreOffers.length > 0) {
    return {
      title: "Products are ready for license handling",
      body:
        `${activeStoreOffers.length} catalog entries look like license-adjacent products. AI can classify them into outreach, fulfillment, or support lanes.`,
      action: "Classify store items",
    };
  }

  return {
    title: "Ready for license intake",
    body:
      "Create a product/license queue item and let AI organize the follow-up path, vendor response, and handoff details.",
    action: "Seed license pipeline",
  };
}

export default function AdminPage() {
  const [workspace, setWorkspace] = useState<AdminWorkspace>("Gearswipe");
  const [search, setSearch] = useState("");
  const [queueItems, setQueueItems] = useState<AdminQueueItem[]>([]);
  const [storeItems, setStoreItems] = useState<AdminStoreItem[]>([]);
  const [source, setSource] = useState<AdminResponse["source"]>("seed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueDraft, setQueueDraft] = useState({
    title: "",
    owner: "Operations",
    status: "Drafting",
    detail: "",
  });
  const [storeDraft, setStoreDraft] = useState({
    name: "",
    channel: "Storefront",
    state: "Featured",
    value: "",
  });

  async function loadWorkspace(activeWorkspace: AdminWorkspace) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/state?workspace=${encodeURIComponent(activeWorkspace)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as AdminResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load admin state");
      }
      setWorkspace(payload.workspace);
      setQueueItems(payload.queueItems);
      setStoreItems(payload.storeItems);
      setSource(payload.source);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin state");
      setQueueItems([]);
      setStoreItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace(workspace);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  const filteredQueue = useMemo(() => {
    const term = search.trim().toLowerCase();
    return queueItems.filter((item) => {
      if (!term) return true;
      return [item.title, item.owner, item.status, item.detail]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [queueItems, search]);

  const filteredStore = useMemo(() => {
    const term = search.trim().toLowerCase();
    return storeItems.filter((item) => {
      if (!term) return true;
      return [item.name, item.channel, item.state, item.value]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [search, storeItems]);

  const pipelineInsight = useMemo(
    () => buildPipelineInsight(workspace, queueItems, storeItems),
    [queueItems, storeItems, workspace],
  );

  async function createQueueItem() {
    const response = await fetch("/api/admin/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace,
        kind: "queue",
        ...queueDraft,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create queue item");
      return;
    }

    setQueueDraft({
      title: "",
      owner: "Operations",
      status: "Drafting",
      detail: "",
    });
    await loadWorkspace(workspace);
  }

  async function createStoreItem() {
    const response = await fetch("/api/admin/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace,
        kind: "store",
        ...storeDraft,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create store item");
      return;
    }

    setStoreDraft({
      name: "",
      channel: "Storefront",
      state: "Featured",
      value: "",
    });
    await loadWorkspace(workspace);
  }

  async function updateQueueStatus(id: number, status: string) {
    const response = await fetch("/api/admin/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace,
        kind: "queue",
        id,
        status,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Unable to update queue item");
      return;
    }

    await loadWorkspace(workspace);
  }

  async function updateStoreState(id: number, state: string) {
    const response = await fetch("/api/admin/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace,
        kind: "store",
        id,
        state,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Unable to update store item");
      return;
    }

    await loadWorkspace(workspace);
  }

  function seedLicensePipeline() {
    setQueueDraft({
      title: "Licensing outreach",
      owner: "AI triage",
      status: "Drafting",
      detail:
        "Review product license requests, draft follow-up, and hand off unresolved items to the right owner.",
    });
    setSearch("license");
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-[#f4f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 border border-[#263246] bg-[#10161f]/96 px-4 py-3 backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Admin console
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                Operations for storefront, trust, and maintenance.
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {adminWorkspaces.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setWorkspace(item)}
                  className={`border px-3 py-2 text-sm transition ${
                    workspace === item
                      ? "border-[#6bb6ff] bg-[#6bb6ff]/10 text-white"
                      : "border-[#263246] bg-[#0b0f14] text-[#b4c0cf] hover:border-[#6bb6ff]/60 hover:text-white"
                  }`}
                  >
                    {item}
                  </button>
              ))}
              <button
                type="button"
                onClick={seedLicensePipeline}
                className="border border-[#6bb6ff] bg-[#6bb6ff] px-3 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
              >
                Seed license pipeline
              </button>
              <label className="flex items-center gap-3 border border-[#263246] bg-[#0b0f14] px-3 py-2 text-sm text-[#9aa9bb]">
                <span className="text-[#6bb6ff]">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks, products, docs"
                  className="w-52 bg-transparent text-sm text-[#f4f7fb] outline-none placeholder:text-[#78879a]"
                  aria-label="Search admin items"
                />
              </label>
            </div>
          </div>
        </header>

        <section className="grid gap-4 py-6 lg:grid-cols-4">
          <StatCard
            label="Open queues"
            value={String(filteredQueue.length).padStart(2, "0")}
            note="Licensing, docs, verification, and maintenance stay visible."
          />
          <StatCard
            label="Store items"
            value={String(filteredStore.length).padStart(2, "0")}
            note="The current mix is kept lean and practical."
          />
          <StatCard
            label="Workspace"
            value={workspace}
            note="Switch between Gearswipe commerce and Gold Shore work."
          />
          <StatCard
            label="Source"
            value={loading ? "Loading" : source}
            note={error ?? "This surface is ready for connected backend wiring."}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              AI assist
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {pipelineInsight.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b4c0cf]">
              {pipelineInsight.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={seedLicensePipeline}
                className="border border-[#6bb6ff] bg-[#6bb6ff] px-3 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
              >
                {pipelineInsight.action}
              </button>
              <a
                href="/login"
                className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Login route
              </a>
            </div>
          </div>
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              Product license pipeline
            </p>
            <div className="mt-3 grid gap-3">
              <StatusLine label="Draft" value="AI triage" />
              <StatusLine label="Review" value="Owner approval" />
              <StatusLine label="Fulfill" value="Delivery / key handoff" />
              <StatusLine label="Archive" value="Receipt + audit trail" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                  Queue
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {workspace} tasks
                </h2>
              </div>
              <span className="border border-[#6bb6ff]/30 bg-[#6bb6ff]/10 px-2 py-1 text-xs text-[#93cfff]">
                {filteredQueue.length} visible
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 border border-[#263246] bg-[#0b0f14] p-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Title</span>
                  <input
                    value={queueDraft.title}
                    onChange={(event) =>
                      setQueueDraft((draft) => ({ ...draft, title: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    placeholder="Licensing outreach"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Owner</span>
                  <input
                    value={queueDraft.owner}
                    onChange={(event) =>
                      setQueueDraft((draft) => ({ ...draft, owner: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Status</span>
                  <select
                    value={queueDraft.status}
                    onChange={(event) =>
                      setQueueDraft((draft) => ({ ...draft, status: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                  >
                    {queueStatusPresets.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Detail</span>
                  <input
                    value={queueDraft.detail}
                    onChange={(event) =>
                      setQueueDraft((draft) => ({ ...draft, detail: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    placeholder="Short operational note"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => void createQueueItem()}
                    className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                  >
                    Add queue item
                  </button>
                </div>
              </div>

              {filteredQueue.map((item) => (
                <article
                  key={item.id}
                  className="border border-[#263246] bg-[#0b0f14] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#9aa9bb]">{item.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#dbe4ee]">{item.owner}</p>
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#6bb6ff]">
                        {item.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void updateQueueStatus(item.id, "Active")}
                      className="border border-[#263246] px-3 py-2 text-sm text-white transition hover:border-[#6bb6ff] hover:bg-[#6bb6ff] hover:text-[#081018]"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateQueueStatus(item.id, "Assigned")}
                      className="border border-[#263246] px-3 py-2 text-sm text-[#b4c0cf] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateQueueStatus(item.id, "Archived")}
                      className="border border-[#263246] px-3 py-2 text-sm text-[#b4c0cf] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void updateQueueStatus(item.id, nextPreset(item.status, queueStatusPresets))
                      }
                      className="border border-[#263246] px-3 py-2 text-sm text-[#b4c0cf] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Advance
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="border border-[#263246] bg-[#10161f] p-4">
              <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                    Uploads
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Document intake
                  </h2>
                </div>
                <span className="text-sm text-[#9aa9bb]">PDF, PNG, JPG</span>
              </div>
              <label className="mt-4 flex cursor-pointer flex-col gap-2 border border-dashed border-[#40506a] bg-[#0b0f14] p-4 text-sm text-[#b4c0cf]">
                <span className="text-white">Drop files here</span>
                <span>Upload contracts, licenses, IDs, or proof docs.</span>
                <input type="file" className="sr-only" multiple />
              </label>
            </div>

            <div className="border border-[#263246] bg-[#10161f] p-4">
              <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                    Catalog
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {workspace} items
                  </h2>
                </div>
                <span className="text-sm text-[#9aa9bb]">Lean set</span>
              </div>

              <div className="mt-4 grid gap-3 border border-[#263246] bg-[#0b0f14] p-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Name</span>
                  <input
                    value={storeDraft.name}
                    onChange={(event) =>
                      setStoreDraft((draft) => ({ ...draft, name: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    placeholder="New product"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Channel</span>
                  <input
                    value={storeDraft.channel}
                    onChange={(event) =>
                      setStoreDraft((draft) => ({ ...draft, channel: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">State</span>
                  <select
                    value={storeDraft.state}
                    onChange={(event) =>
                      setStoreDraft((draft) => ({ ...draft, state: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                  >
                    {storeStatePresets.map((stateOption) => (
                      <option key={stateOption} value={stateOption}>
                        {stateOption}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Value</span>
                  <input
                    value={storeDraft.value}
                    onChange={(event) =>
                      setStoreDraft((draft) => ({ ...draft, value: event.target.value }))
                    }
                    className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    placeholder="From $0"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => void createStoreItem()}
                    className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                  >
                    Add store item
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {filteredStore.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#263246] bg-[#0b0f14] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-white">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-[#9aa9bb]">
                          {item.channel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#dbe4ee]">{item.value}</p>
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[#6bb6ff]">
                          {item.state}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void updateStoreState(item.id, "Featured")}
                        className="border border-[#263246] px-3 py-2 text-sm text-white transition hover:border-[#6bb6ff] hover:bg-[#6bb6ff] hover:text-[#081018]"
                      >
                        Promote
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateStoreState(item.id, "Tracked")}
                        className="border border-[#263246] px-3 py-2 text-sm text-[#b4c0cf] transition hover:border-[#6bb6ff] hover:text-white"
                      >
                        Track
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateStoreState(item.id, "Paused")}
                        className="border border-[#263246] px-3 py-2 text-sm text-[#b4c0cf] transition hover:border-[#6bb6ff] hover:text-white"
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void updateStoreState(item.id, nextPreset(item.state, storeStatePresets))
                        }
                        className="border border-[#263246] px-3 py-2 text-sm text-[#b4c0cf] transition hover:border-[#6bb6ff] hover:text-white"
                      >
                        Advance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              Subscribers
            </p>
            <p className="mt-2 text-xl font-medium text-white">Email queue</p>
            <p className="mt-3 text-sm leading-7 text-[#b4c0cf]">
              Track leads, buyers, and follow-ups without leaving the admin
              surface.
            </p>
          </div>
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              Sales
            </p>
            <p className="mt-2 text-xl font-medium text-white">Orders and totals</p>
            <p className="mt-3 text-sm leading-7 text-[#b4c0cf]">
              Keep digital and physical sales visible with a clean path to
              reconciliation.
            </p>
          </div>
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              Maintenance
            </p>
            <p className="mt-2 text-xl font-medium text-white">
              Backups and checks
            </p>
            <p className="mt-3 text-sm leading-7 text-[#b4c0cf]">
              Keep restore copies, deploy notes, and service checks in one
              control path.
            </p>
          </div>
        </section>

        <section className="mt-6 border border-[#263246] bg-[#10161f] p-4">
          <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Connected sites
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Cross-links across the brand graph
              </h2>
            </div>
            <span className="text-sm text-[#9aa9bb]">Purposeful links only</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {siteGraphLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border border-[#263246] bg-[#0b0f14] p-4 transition hover:border-[#6bb6ff] hover:bg-[#10161f]"
              >
                <p className="text-lg font-medium text-white">{link.label}</p>
                <p className="mt-1 text-sm text-[#9aa9bb]">{link.note}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-auto border-t border-[#263246] py-5 text-sm text-[#9aa9bb]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>One admin surface for Gearswipe and Gold Shore.</p>
            <p className="text-white">Operational, not ornamental.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
