"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  type AdminQueueItem,
  type AdminStoreItem,
  type AdminVendorItem,
  type AdminWorkspace,
  emailSetupChecklist,
  adminWorkspaces,
  mailRouteMatrix,
  siteGraphLinks,
} from "../../lib/admin-data";

type AdminResponse = {
  workspace: AdminWorkspace;
  queueItems: AdminQueueItem[];
  storeItems: AdminStoreItem[];
  vendorItems: AdminVendorItem[];
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

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#263246] py-3 last:border-b-0">
      <span className="text-sm text-[#9aa9bb]">{label}</span>
      <span className="text-sm font-medium text-[#f4f7fb]">{value}</span>
    </div>
  );
}

const queueStatusPresets = ["Drafting", "Ready", "Pending", "Scheduled", "Active", "Archived"];
const storeStatePresets = ["Featured", "Instant", "Tracked", "Ready", "Active", "Paused"];

function nextPreset(current: string, presets: string[]) {
  const index = presets.indexOf(current);
  return presets[(index + 1) % presets.length] ?? presets[0];
}

const vendorStages = [
  "Prospect",
  "Researching",
  "Ready for Outreach",
  "Contacted",
  "Replied",
  "Application Required",
  "Negotiating",
  "Documents Pending",
  "Approved Vendor",
  "Integration Pending",
  "Active",
  "Renewal Due",
  "Rejected",
];

const permissionOptions = [
  "Authorized reseller/dealer status",
  "Permission to advertise products",
  "Product catalog/feed access",
  "Pricing and inventory API/feed",
  "Product photography/media usage",
  "Brand/logo usage",
  "Technical specifications",
  "Dropshipping/fulfillment",
  "Wholesale purchasing",
  "Warranty support",
  "Marketplace resale",
  "AI-assisted catalog ingestion",
];

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
  const [vendorItems, setVendorItems] = useState<AdminVendorItem[]>([]);
  const [source, setSource] = useState<AdminResponse["source"]>("seed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVendorTab, setActiveVendorTab] = useState<
    "Prospects" | "Outreach" | "Active Agreements"
  >("Prospects");
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
  const [vendorDraft, setVendorDraft] = useState({
    company: "",
    vendorType: "Manufacturer",
    contactName: "",
    contactTitle: "",
    email: "",
    phone: "",
    website: "",
    territory: "",
    productCategories: "",
    minimumOrderRequirements: "",
    dealerResellerApplicationUrl: "",
    currentRelationshipStatus: "Prospect",
    documents: "",
    catalogApiAvailability: "Unknown",
    productImageRights: "Pending",
    trademarkLogoPermissions: "Pending",
    pricingFeedPermissions: "Pending",
    aiDataProcessingPermissions: "Pending",
    agreementEffectiveDate: "",
    agreementExpirationDate: "",
    aiVendorBrief: "",
    outreachEmail: "",
    requestedPermissions: permissionOptions.join("; "),
    notes: "",
  });

  async function loadWorkspace(activeWorkspace: AdminWorkspace): Promise<AdminResponse> {
    const response = await fetch(
      `/api/admin/state?workspace=${encodeURIComponent(activeWorkspace)}`,
      { cache: "no-store" },
    );
    const payload = (await response.json()) as AdminResponse & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to load admin state");
    }
    return payload;
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await loadWorkspace(workspace);
        if (cancelled) return;
        setWorkspace(payload.workspace);
        setQueueItems(payload.queueItems);
        setStoreItems(payload.storeItems);
        setVendorItems(payload.vendorItems ?? []);
        setSource(payload.source);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load admin state");
        setQueueItems([]);
        setStoreItems([]);
        setVendorItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  const filteredVendorItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const tabFilters = {
      Prospects: new Set([
        "Prospect",
        "Researching",
        "Ready for Outreach",
        "Contacted",
        "Replied",
        "Application Required",
        "Negotiating",
        "Documents Pending",
      ]),
      Outreach: new Set([
        "Ready for Outreach",
        "Contacted",
        "Replied",
        "Application Required",
        "Negotiating",
        "Documents Pending",
      ]),
      "Active Agreements": new Set([
        "Approved Vendor",
        "Integration Pending",
        "Active",
        "Renewal Due",
      ]),
    } as const;

    return vendorItems.filter((item) => {
      const matchesTab = tabFilters[activeVendorTab].has(item.currentRelationshipStatus);
      if (!matchesTab) return false;
      if (!term) return true;
      return [
        item.company,
        item.vendorType,
        item.contactName,
        item.contactTitle,
        item.email,
        item.website,
        item.territory,
        item.productCategories,
        item.currentRelationshipStatus,
        item.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [activeVendorTab, search, vendorItems]);

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

  async function createVendorItem() {
    const response = await fetch("/api/admin/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace,
        kind: "vendor",
        ...vendorDraft,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to create vendor item");
      return;
    }

    setVendorDraft({
      company: "",
      vendorType: "Manufacturer",
      contactName: "",
      contactTitle: "",
      email: "",
      phone: "",
      website: "",
      territory: "",
      productCategories: "",
      minimumOrderRequirements: "",
      dealerResellerApplicationUrl: "",
      currentRelationshipStatus: "Prospect",
      documents: "",
      catalogApiAvailability: "Unknown",
      productImageRights: "Pending",
      trademarkLogoPermissions: "Pending",
      pricingFeedPermissions: "Pending",
      aiDataProcessingPermissions: "Pending",
      agreementEffectiveDate: "",
      agreementExpirationDate: "",
      aiVendorBrief: "",
      outreachEmail: "",
      requestedPermissions: permissionOptions.join("; "),
      notes: "",
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

  async function updateVendorStatus(
    id: number,
    currentRelationshipStatus: string,
    extras?: Partial<Pick<AdminVendorItem,
      | "catalogApiAvailability"
      | "productImageRights"
      | "trademarkLogoPermissions"
      | "pricingFeedPermissions"
      | "aiDataProcessingPermissions"
      | "agreementEffectiveDate"
      | "agreementExpirationDate"
    >>,
  ) {
    const response = await fetch("/api/admin/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace,
        kind: "vendor",
        id,
        currentRelationshipStatus,
        ...extras,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Unable to update vendor item");
      return;
    }

    await loadWorkspace(workspace);
  }

  function draftVendorBrief() {
    const normalized = vendorDraft.company || "the vendor";
    const categoryLine = vendorDraft.productCategories || "the relevant products";
    setVendorDraft((draft) => ({
      ...draft,
      aiVendorBrief:
        `Research ${normalized} to determine whether they operate a dealer, reseller, distributor, affiliate, or marketplace program. ` +
        `Confirm the right contact department, identify products relevant to GearSwipe, and request the permissions needed for ${categoryLine}. ` +
        `Treat product data, images, specs, and feeds as separate rights from normal sales authorization.`,
      outreachEmail:
        draft.outreachEmail ||
        `Subject: Authorized Dealer / Vendor Partnership — GearSwipe\n\nHello [Name/Team],\n\nMy name is Robert Marston and I'm developing GearSwipe, a technology and equipment commerce platform operated through Gold Shore.\n\nWe're currently establishing relationships with manufacturers, distributors, and authorized suppliers for several product categories, including ${categoryLine}.\n\nI'd like to discuss becoming an authorized third-party dealer/vendor for ${normalized} and understand your requirements for reseller approval.\n\nWe're particularly interested in obtaining authorized access to applicable product catalogs, specifications, pricing/inventory feeds, approved product imagery and brand assets, along with the rights required to market and sell your products through GearSwipe.\n\nOur catalog and merchandising workflow uses AI-assisted systems for product organization, compatibility analysis, search, and customer recommendations. We'd therefore also like to understand any requirements or restrictions governing automated use of your approved catalog data and media.\n\nCould you direct me to the appropriate dealer, reseller, distribution, or channel-partnership contact and provide any application materials?\n\nBest,\nRobert Marston\nGearSwipe / Gold Shore\ngearswipe.com`,
    }));
    setError(null);
  }

  function togglePermission(permission: string) {
    setVendorDraft((draft) => {
      const current = draft.requestedPermissions
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);
      const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];
      return { ...draft, requestedPermissions: next.join("; ") };
    });
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
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setWorkspace(item);
                  }}
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
            label="Vendor records"
            value={String(vendorItems.length).padStart(2, "0")}
            note="Prospects, outreach, and active agreements stay separate."
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
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Sign out
              </button>
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

        <section className="border border-[#263246] bg-[#10161f] p-4">
          <div className="flex flex-col gap-4 border-b border-[#263246] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Partner & Vendor Licensing
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                Vendor licensing, outreach, and commercial rights.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#b4c0cf]">
                Manage the path from prospect to active vendor, including dealer programs,
                catalog data access, image rights, trademark permissions, AI/data-processing
                rights, renewal dates, and attached agreements.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["Prospects", "Outreach", "Active Agreements"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveVendorTab(tab)}
                  className={`border px-3 py-2 text-sm transition ${
                    activeVendorTab === tab
                      ? "border-[#6bb6ff] bg-[#6bb6ff]/10 text-white"
                      : "border-[#263246] bg-[#0b0f14] text-[#b4c0cf] hover:border-[#6bb6ff]/60 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-3">
              {filteredVendorItems.map((vendor) => (
                <article key={vendor.id} className="border border-[#263246] bg-[#0b0f14] p-4">
                  <div className="flex flex-col gap-3 border-b border-[#263246] pb-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-[#9aa9bb]">{vendor.vendorType}</p>
                      <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                        {vendor.company}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[#b4c0cf]">
                        {vendor.aiVendorBrief || "Generate a vendor brief to capture who they are, what they sell, and what rights Gearswipe needs."}
                      </p>
                    </div>
                    <span className="border border-[#6bb6ff]/30 bg-[#6bb6ff]/10 px-2 py-1 text-xs text-[#93cfff]">
                      {vendor.currentRelationshipStatus}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="grid gap-2 text-sm text-[#b4c0cf]">
                      <p><span className="text-white">Contact:</span> {vendor.contactName || "—"} {vendor.contactTitle ? `· ${vendor.contactTitle}` : ""}</p>
                      <p><span className="text-white">Email:</span> {vendor.email || "—"}</p>
                      <p><span className="text-white">Phone:</span> {vendor.phone || "—"}</p>
                      <p><span className="text-white">Website:</span> {vendor.website || "—"}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-[#b4c0cf]">
                      <p><span className="text-white">Territory:</span> {vendor.territory || "—"}</p>
                      <p><span className="text-white">Categories:</span> {vendor.productCategories || "—"}</p>
                      <p><span className="text-white">MOQ:</span> {vendor.minimumOrderRequirements || "—"}</p>
                      <p><span className="text-white">Application:</span> {vendor.dealerResellerApplicationUrl || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="border border-[#263246] bg-[#10161f] p-3">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-[#8191a5]">
                        Rights summary
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-[#b4c0cf]">
                        <StatusLine label="Catalog/API" value={vendor.catalogApiAvailability} />
                        <StatusLine label="Images" value={vendor.productImageRights} />
                        <StatusLine label="Trademark" value={vendor.trademarkLogoPermissions} />
                        <StatusLine label="Pricing feed" value={vendor.pricingFeedPermissions} />
                        <StatusLine label="AI/data" value={vendor.aiDataProcessingPermissions} />
                      </div>
                    </div>
                    <div className="border border-[#263246] bg-[#10161f] p-3">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-[#8191a5]">
                        Agreement
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-[#b4c0cf]">
                        <p><span className="text-white">Effective:</span> {vendor.agreementEffectiveDate || "—"}</p>
                        <p><span className="text-white">Expiration:</span> {vendor.agreementExpirationDate || "—"}</p>
                        <p><span className="text-white">Docs:</span> {vendor.documents || "—"}</p>
                        <p><span className="text-white">Notes:</span> {vendor.notes || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void updateVendorStatus(vendor.id, "Researching")}
                      className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Research
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateVendorStatus(vendor.id, "Ready for Outreach")}
                      className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Ready for outreach
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateVendorStatus(vendor.id, "Negotiating")}
                      className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Negotiating
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateVendorStatus(vendor.id, "Approved Vendor")}
                      className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateVendorStatus(vendor.id, "Active")}
                      className="border border-[#6bb6ff] bg-[#6bb6ff] px-3 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                    >
                      Activate
                    </button>
                  </div>
                </article>
              ))}

              {filteredVendorItems.length === 0 ? (
                <div className="border border-dashed border-[#40506a] bg-[#0b0f14] p-4 text-sm text-[#9aa9bb]">
                  No vendor records match this tab yet. Seed a prospect record or switch tabs.
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="border border-[#263246] bg-[#0b0f14] p-4">
                <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                      Vendor brief
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      Research first, then outreach
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={draftVendorBrief}
                    className="border border-[#6bb6ff] bg-[#6bb6ff] px-3 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                  >
                    Generate brief
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Company / brand</span>
                    <input
                      value={vendorDraft.company}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, company: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="Dell Technologies"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Vendor type</span>
                    <select
                      value={vendorDraft.vendorType}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, vendorType: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    >
                      <option>Manufacturer</option>
                      <option>Distributor</option>
                      <option>Wholesaler</option>
                      <option>Reseller program</option>
                      <option>Affiliate</option>
                      <option>Marketplace supplier</option>
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Contact name</span>
                    <input
                      value={vendorDraft.contactName}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, contactName: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="Partner programs"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Title</span>
                    <input
                      value={vendorDraft.contactTitle}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, contactTitle: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="Channel Sales"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Email</span>
                    <input
                      value={vendorDraft.email}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, email: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="partner@company.com"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Phone</span>
                    <input
                      value={vendorDraft.phone}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, phone: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-[#b4c0cf]">Website</span>
                    <input
                      value={vendorDraft.website}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, website: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Territory</span>
                    <input
                      value={vendorDraft.territory}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, territory: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="US, Global, NA"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Product categories</span>
                    <input
                      value={vendorDraft.productCategories}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, productCategories: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="PCs, keys, software"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Minimum order requirements</span>
                    <input
                      value={vendorDraft.minimumOrderRequirements}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, minimumOrderRequirements: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-[#b4c0cf]">Dealer/reseller application URL</span>
                    <input
                      value={vendorDraft.dealerResellerApplicationUrl}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, dealerResellerApplicationUrl: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Relationship status</span>
                    <select
                      value={vendorDraft.currentRelationshipStatus}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, currentRelationshipStatus: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    >
                      {vendorStages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Catalog/API availability</span>
                    <select
                      value={vendorDraft.catalogApiAvailability}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, catalogApiAvailability: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    >
                      <option>Unknown</option>
                      <option>Yes</option>
                      <option>No</option>
                      <option>Requested</option>
                      <option>Confirmed</option>
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Effective date</span>
                    <input
                      value={vendorDraft.agreementEffectiveDate}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, agreementEffectiveDate: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="YYYY-MM-DD"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-[#b4c0cf]">Expiration date</span>
                    <input
                      value={vendorDraft.agreementExpirationDate}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, agreementExpirationDate: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="YYYY-MM-DD"
                    />
                  </label>
                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-[#b4c0cf]">Documents</span>
                    <input
                      value={vendorDraft.documents}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, documents: event.target.value }))
                      }
                      className="border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="MSA, reseller application, MAP policy"
                    />
                  </label>
                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-[#b4c0cf]">AI vendor brief</span>
                    <textarea
                      value={vendorDraft.aiVendorBrief}
                      onChange={(event) =>
                        setVendorDraft((draft) => ({ ...draft, aiVendorBrief: event.target.value }))
                      }
                      className="min-h-28 border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                      placeholder="Research who they are and what rights we need."
                    />
                  </label>
                </div>

                <div className="mt-4 border-t border-[#263246] pt-4">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#8191a5]">
                    Requested permissions
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {permissionOptions.map((permission) => {
                      const checked = vendorDraft.requestedPermissions.includes(permission);
                      return (
                        <label
                          key={permission}
                          className="flex items-start gap-3 border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-[#dbe4ee]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(permission)}
                            className="mt-1 accent-[#6bb6ff]"
                          />
                          <span>{permission}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label className="mt-4 grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">AI / outreach draft</span>
                  <textarea
                    value={vendorDraft.outreachEmail}
                    onChange={(event) =>
                      setVendorDraft((draft) => ({ ...draft, outreachEmail: event.target.value }))
                    }
                    className="min-h-44 border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    placeholder="Subject: Authorized Dealer / Vendor Partnership — GearSwipe"
                  />
                </label>

                <label className="mt-4 grid gap-2">
                  <span className="text-sm text-[#b4c0cf]">Notes</span>
                  <textarea
                    value={vendorDraft.notes}
                    onChange={(event) =>
                      setVendorDraft((draft) => ({ ...draft, notes: event.target.value }))
                    }
                    className="min-h-24 border border-[#263246] bg-[#10161f] px-3 py-2 text-sm text-white outline-none"
                    placeholder="MAP, territory limits, product image rights, and renewal reminders."
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={draftVendorBrief}
                    className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                  >
                    Generate vendor brief
                  </button>
                  <button
                    type="button"
                    onClick={() => void createVendorItem()}
                    className="border border-[#6bb6ff] bg-[#6bb6ff] px-3 py-2 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                  >
                    Save vendor record
                  </button>
                </div>
              </div>

              <div className="border border-[#263246] bg-[#0b0f14] p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#8191a5]">
                  Workflow path
                </p>
                <div className="mt-3 grid gap-3">
                  <StatusLine label="Prospect" value="Research and qualification" />
                  <StatusLine label="Outreach" value="Draft, review, and send" />
                  <StatusLine label="Authorization" value="Rights and agreement review" />
                  <StatusLine label="Active" value="Catalog + media + feed permissions" />
                  <StatusLine label="Renewal" value="Expiration tracking and review" />
                </div>
              </div>
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

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-[#263246] bg-[#10161f] p-4">
            <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                  Mail routing
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  HostGator and Cloudflare mail lanes
                </h2>
              </div>
              <span className="text-sm text-[#9aa9bb]">Operational path</span>
            </div>

            <div className="mt-4 grid gap-3">
              {mailRouteMatrix.map((route) => (
                <div key={route.address} className="border border-[#263246] bg-[#0b0f14] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-medium text-white">{route.purpose}</p>
                      <p className="mt-1 text-sm text-[#9aa9bb]">{route.address}</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.32em] text-[#6bb6ff]">
                      {route.route}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#b4c0cf]">
                    Targets: <span className="text-white">{route.targets}</span>
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#9aa9bb]">{route.provider}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#263246] bg-[#10161f] p-4">
            <div className="flex items-end justify-between gap-3 border-b border-[#263246] pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                  Setup checklist
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  What still needs to be configured
                </h2>
              </div>
              <span className="text-sm text-[#9aa9bb]">Cloudflare → HostGator</span>
            </div>

            <div className="mt-4 grid gap-3">
              {emailSetupChecklist.map((step, index) => (
                <div key={step} className="border border-[#263246] bg-[#0b0f14] p-4">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#6bb6ff]">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f4f7fb]">{step}</p>
                </div>
              ))}
            </div>
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
