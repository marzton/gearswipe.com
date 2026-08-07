"use client";

import { useMemo, useState } from "react";

type Product = {
  name: string;
  category: string;
  price: string;
  blurb: string;
  badge: string;
};

type AdminTab =
  | "Licensing Outreach"
  | "Document Uploads"
  | "Business Verification"
  | "Maintenance"
  | "Store Items"
  | "Subscribers"
  | "Sales";

const navigation = [
  "Home",
  "PC Builds",
  "Software",
  "Components",
  "Key Codes",
  "Security Keys",
  "Wearables",
  "Accessories",
];

const products: Product[] = [
  {
    name: "Apex Elite RTX Build",
    category: "PC Builds",
    price: "$1,899",
    blurb:
      "Prebuilt for creators, streamers, and power users who want a clean launch-day option without warehouse lag.",
    badge: "Featured",
  },
  {
    name: "Bitdefender Total Security",
    category: "Software",
    price: "$14.99",
    blurb:
      "Digital checkout, instant handoff, and a clean support story for customers who need protection now.",
    badge: "Instant delivery",
  },
  {
    name: "Precision Parts Rail",
    category: "Components",
    price: "$19.99",
    blurb:
      "Key components and add-ons grouped for fast browsing across current stockless offers and drop-ship lanes.",
    badge: "Fast moving",
  },
  {
    name: "Windows 11 Pro Key",
    category: "Key Codes",
    price: "$5.49",
    blurb:
      "Activation codes, clean receipt flow, and a narrow support surface designed for repeatable fulfillment.",
    badge: "Code product",
  },
  {
    name: "YubiKey 5 NFC",
    category: "Security Keys",
    price: "$25.00",
    blurb:
      "A trust anchor for admins and teams that need practical security without a heavy onboarding journey.",
    badge: "Trusted",
  },
  {
    name: "Meta Glasses",
    category: "Wearables",
    price: "$299",
    blurb:
      "A premium wearable lane for the store, presented alongside related products and accessory bundles.",
    badge: "Lifestyle",
  },
];

const adminTabs: AdminTab[] = [
  "Licensing Outreach",
  "Document Uploads",
  "Business Verification",
  "Maintenance",
  "Store Items",
  "Subscribers",
  "Sales",
];

const outreachQueue = [
  {
    name: "North Circuit Supply",
    status: "Waiting on reply",
    need: "Resale license confirmation",
  },
  {
    name: "Atlas Tech Wholesale",
    status: "Docs attached",
    need: "Vendor onboarding packet",
  },
  {
    name: "Vertex Compliance",
    status: "Ready to send",
    need: "Business verification follow-up",
  },
];

const documentSeed = [
  "resale-certificate.pdf",
  "business-registration.pdf",
  "tax-id-letter.pdf",
  "brand-guidelines.docx",
];

const maintenanceItems = [
  "Refresh key-code inventory every 4 hours",
  "Check checkout latency and payment retries",
  "Confirm support macros still match current offers",
  "Audit product descriptions before new launches",
];

const salesPipeline = [
  { label: "Digital keys", value: 78 },
  { label: "PC builds", value: 64 },
  { label: "Security", value: 52 },
  { label: "Wearables", value: 39 },
  { label: "Parts", value: 72 },
];

function formatCategory(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function Sparkline({ values }: { values: number[] }) {
  const points = values
    .map((value, index) => `${index * 22},${72 - value}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 110 72"
      className="h-20 w-full text-cyan-300"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<AdminTab>("Licensing Outreach");
  const [documents, setDocuments] = useState(documentSeed);
  const [verification, setVerification] = useState({
    business: true,
    payout: false,
    domain: true,
    support: false,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        query.trim().length === 0 ||
        [product.name, product.category, product.blurb, product.badge]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query]);

  const catalogGroups = ["All", ...new Set(products.map((product) => product.category))];

  return (
    <main className="min-h-screen bg-[#04060b] text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_30%),radial-gradient(circle_at_80%_18%,_rgba(168,85,247,0.18),_transparent_26%),linear-gradient(180deg,_#070b12_0%,_#05070d_48%,_#030408_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:grid-cols-[240px_minmax(0,1fr)_240px] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                <span className="text-xl font-semibold">G</span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">
                  Gearswipe
                </p>
                <p className="text-sm text-slate-300">
                  Digital tech store + operations console
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-full border border-white/12 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-black/20">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M16 16l4 4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, brands, or fulfillment lanes..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                aria-label="Search products"
              />
              <kbd className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-400 md:inline">
                ⌘K
              </kbd>
            </label>

            <div className="flex items-center justify-between gap-3 text-sm text-slate-300 lg:justify-end">
              <a className="hover:text-cyan-200" href="#catalog">
                Catalog
              </a>
              <a className="hover:text-cyan-200" href="#operations">
                Admin
              </a>
              <a className="hover:text-cyan-200" href="#support">
                Support
              </a>
              <a
                href="#operations"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
              >
                <span>Cart</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1.5 text-[11px] font-semibold text-slate-950">
                  2
                </span>
              </a>
            </div>
          </header>

          <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden rounded-[1.75rem] border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:block">
              <p className="mb-4 text-[11px] uppercase tracking-[0.36em] text-slate-400">
                Store lanes
              </p>
              <nav className="space-y-1 text-sm">
                {navigation.map((item, index) => (
                  <a
                    key={item}
                    href={index === 0 ? "#home" : `#${formatCategory(item)}`}
                    className={[
                      "flex items-center justify-between rounded-2xl px-3 py-3 transition",
                      index === 0
                        ? "bg-cyan-300/10 text-cyan-200"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span>{item}</span>
                    <span className="text-[11px] text-slate-500">→</span>
                  </a>
                ))}
              </nav>

              <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-slate-950/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.36em] text-slate-500">
                  Fulfillment
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Dropship-ready product lanes, instant digital delivery, and a
                  clean admin stack for store ops.
                </p>
              </div>
            </aside>

            <div className="space-y-4">
              <section
                id="home"
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b12]/90 shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                <div className="grid gap-6 p-6 lg:grid-cols-[1.08fr_0.92fr] lg:p-8">
                  <div className="flex flex-col justify-between gap-8">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">
                        Digital products. Real margin.
                      </p>
                      <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                        Sell tech that
                        <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                          ships without stock on hand.
                        </span>
                      </h1>
                      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                        Gearswipe is a storefront for PC builds, antivirus
                        software, parts, key codes, YubiKeys, Meta glasses, and
                        related tech goods — backed by an admin console for
                        outreach, verification, uploads, maintenance, and
                        sales.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="#catalog"
                        className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                      >
                        Shop products
                      </a>
                      <a
                        href="#operations"
                        className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                      >
                        Open admin
                      </a>
                      <a
                        href="#support"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                      >
                        Partner support
                      </a>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Instant delivery", "Codes and software land immediately."],
                        ["No inventory burden", "Launch products without holding stock."],
                        ["Ops-ready", "Admin tools for store and compliance work."],
                      ].map(([title, text]) => (
                        <div
                          key={title}
                          className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4"
                        >
                          <p className="text-sm font-medium text-white">
                            {title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.96),rgba(4,6,11,0.96))] p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.36em] text-slate-500">
                          Storefront preview
                        </p>
                        <p className="mt-2 text-lg font-medium text-white">
                          Launch-day product desk
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                        Live
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4">
                      <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/6 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                              Featured lane
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">
                              Apex Elite RTX Build
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                              A polished hero build for creators and power users
                              who want a premium purchase path without
                              warehouse complexity.
                            </p>
                          </div>
                          <p className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-cyan-200">
                            $1,899
                          </p>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {[
                            "Verified vendor intake",
                            "Instant digital alternatives",
                            "Flexible category bundles",
                            "Compliance-first receipts",
                          ].map((item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["Orders today", "126", "+18%"],
                          ["Digital margin", "72%", "+6%"],
                          ["Open support tickets", "4", "-2"],
                          ["Verification progress", "83%", "+11%"],
                        ].map(([label, value, delta]) => (
                          <div
                            key={label}
                            className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4"
                          >
                            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              {label}
                            </p>
                            <div className="mt-3 flex items-end justify-between gap-4">
                              <p className="text-2xl font-semibold text-white">
                                {value}
                              </p>
                              <p className="text-sm text-emerald-300">
                                {delta}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="catalog"
                className="rounded-[2rem] border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">
                      Catalog
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                      Products built for an inventory-light model.
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catalogGroups.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setActiveCategory(group)}
                        aria-pressed={activeCategory === group}
                        className={[
                          "rounded-full border px-4 py-2 text-sm transition",
                          activeCategory === group
                            ? "border-cyan-300/60 bg-cyan-300 text-slate-950"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-white",
                        ].join(" ")}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.name}
                      className="group rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5 transition hover:border-cyan-300/30 hover:bg-slate-950/70"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-slate-500">
                            {product.category}
                          </p>
                          <h3 className="mt-3 text-xl font-semibold text-white">
                            {product.name}
                          </h3>
                        </div>
                        <p className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">
                          {product.badge}
                        </p>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        {product.blurb}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4">
                        <p className="text-2xl font-semibold text-white">
                          {product.price}
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition group-hover:border-cyan-300/40 group-hover:text-white"
                        >
                          Add to cart
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section
                id="operations"
                className="rounded-[2rem] border border-white/10 bg-[#050810]/92 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6"
              >
                <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">
                      Admin interface
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                      Licensing, uploads, verification, and sales in one place.
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Subscribers", "9,672"],
                      ["Sales", "$84.9k"],
                      ["Tickets", "4 open"],
                      ["Verification", "83%"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
                          {label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-3">
                    <p className="px-3 py-2 text-[11px] uppercase tracking-[0.36em] text-slate-500">
                      Console lanes
                    </p>
                    <div className="space-y-1">
                      {adminTabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          aria-pressed={activeTab === tab}
                          className={[
                            "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition",
                            activeTab === tab
                              ? "bg-cyan-300/10 text-cyan-200"
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                          ].join(" ")}
                        >
                          <span>{tab}</span>
                          <span className="text-[11px] text-slate-500">→</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5">
                    {activeTab === "Licensing Outreach" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Outreach composer
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Keep vendor conversations moving.
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                            Draft follow-ups, track replies, and keep licensing
                            conversations tied to product lanes that need
                            approval or proof.
                          </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                            <label className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              Message
                            </label>
                            <textarea
                              className="mt-3 h-40 w-full resize-none rounded-[1.15rem] border border-white/10 bg-slate-950/70 p-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600"
                              defaultValue="Hello, we’re building a retail lane around verified tech products and need confirmation on your reseller or distribution terms. Attached are our documents and current storefront context."
                              aria-label="Licensing outreach message"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                              >
                                Send follow-up
                              </button>
                              <button
                                type="button"
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                              >
                                Save draft
                              </button>
                            </div>
                          </div>

                          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              Queue
                            </p>
                            <div className="mt-4 space-y-3">
                              {outreachQueue.map((item) => (
                                <div
                                  key={item.name}
                                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"
                                >
                                  <p className="text-sm font-medium text-white">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-400">
                                    {item.need}
                                  </p>
                                  <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
                                    {item.status}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "Document Uploads" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Upload center
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Store the paperwork that keeps the business moving.
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-slate-400">
                            Keep tax, resale, legal, and vendor documents in one
                            place so verification and support can move quickly.
                          </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-dashed border-cyan-300/25 bg-cyan-300/6 p-5">
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/65 px-5 py-10 text-center">
                            <span className="text-sm font-medium text-white">
                              Drop files here or click to attach
                            </span>
                            <span className="text-sm text-slate-400">
                              PDFs, images, and office docs for verification and
                              vendor outreach.
                            </span>
                            <input
                              type="file"
                              multiple
                              className="sr-only"
                              onChange={(event) => {
                                const files = Array.from(
                                  event.currentTarget.files ?? [],
                                ).map((file) => file.name);
                                if (files.length > 0) {
                                  setDocuments((current) => [...current, ...files]);
                                }
                              }}
                              aria-label="Upload business documents"
                            />
                          </label>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {documents.map((document) => (
                              <div
                                key={document}
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                              >
                                {document}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "Business Verification" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Verification checklist
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Show the store is legitimate before it scales.
                          </h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {(
                            [
                              ["business", "Business registration complete"],
                              ["payout", "Payment method connected"],
                              ["domain", "Domain and SSL confirmed"],
                              ["support", "Support policy published"],
                            ] as const
                          ).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                setVerification((current) => ({
                                  ...current,
                                  [key]: !current[key],
                                }))
                              }
                              className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-left"
                            >
                              <span
                                className={[
                                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                                  verification[key]
                                    ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                                    : "border-white/15 bg-slate-950 text-slate-500",
                                ].join(" ")}
                                aria-hidden="true"
                              >
                                {verification[key] ? "✓" : "•"}
                              </span>
                              <span className="text-sm leading-6 text-slate-200">
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "Maintenance" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Maintenance queue
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Keep the store healthy and current.
                          </h3>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                            <div className="space-y-3">
                              {maintenanceItems.map((item, index) => (
                                <div
                                  key={item}
                                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                                >
                                  <span className="text-sm text-slate-300">
                                    {index + 1}. {item}
                                  </span>
                                  <span className="text-[11px] uppercase tracking-[0.28em] text-emerald-200">
                                    Open
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              Status
                            </p>
                            <Sparkline values={[30, 44, 38, 54, 48, 63, 58]} />
                            <p className="text-sm leading-7 text-slate-400">
                              Checkout and maintenance signals are stable, with
                              a recent bump in digital product activity.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "Store Items" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Store catalog controls
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Edit offers, availability, and pricing.
                          </h3>
                        </div>

                        <div className="overflow-hidden rounded-[1.25rem] border border-white/10">
                          <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-slate-500">
                            <span>Item</span>
                            <span>Status</span>
                            <span>Price</span>
                            <span>Action</span>
                          </div>
                          {filteredProducts.map((product) => (
                            <div
                              key={product.name}
                              className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] items-center border-t border-white/10 px-4 py-4 text-sm"
                            >
                              <span className="text-slate-100">{product.name}</span>
                              <span className="text-cyan-200">Active</span>
                              <span className="text-slate-300">{product.price}</span>
                              <button
                                type="button"
                                className="justify-self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "Subscribers" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Audience
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Keep the list warm for drops and updates.
                          </h3>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              Segments
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {[
                                "Prebuilt buyers",
                                "Software repeat customers",
                                "Business verification leads",
                                "Accessory bundle watchers",
                              ].map((segment) => (
                                <div
                                  key={segment}
                                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-slate-300"
                                >
                                  {segment}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              Subscriber growth
                            </p>
                            <div className="mt-4 space-y-3">
                              {[
                                ["Jan", 46],
                                ["Feb", 58],
                                ["Mar", 61],
                                ["Apr", 72],
                                ["May", 84],
                              ].map(([month, value]) => (
                                <div
                                  key={month}
                                  className="flex items-center gap-3"
                                >
                                  <span className="w-8 text-xs text-slate-500">
                                    {month}
                                  </span>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                                      style={{ width: `${value}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "Sales" && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.36em] text-cyan-200/70">
                            Sales pulse
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-white">
                            Read what is moving and where margin sits.
                          </h3>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                            <div className="space-y-4">
                              {salesPipeline.map((item) => (
                                <div key={item.label}>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-300">
                                      {item.label}
                                    </span>
                                    <span className="text-white">{item.value}%</span>
                                  </div>
                                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-500"
                                      style={{ width: `${item.value}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              Revenue mix
                            </p>
                            <div className="mt-4">
                              <Sparkline values={[24, 30, 28, 42, 39, 52, 61]} />
                            </div>
                            <p className="text-sm leading-7 text-slate-400">
                              Digital goods are carrying the highest velocity,
                              with PC builds and parts showing the best upsell
                              path.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    id="support"
                    className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5"
                  >
                    <p className="text-[11px] uppercase tracking-[0.36em] text-slate-500">
                      Support lane
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      For store setup, partner onboarding, and vendor follow-up.
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      The admin surface keeps operational work visible, so the
                      store stays practical even as product lines expand.
                    </p>

                    <div className="mt-5 space-y-3">
                      {[
                        "Licensing outreach",
                        "Business verification",
                        "Document upload review",
                        "Maintenance triage",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
                        >
                          <span>{item}</span>
                          <span className="text-emerald-300">Ready</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <footer className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-white/4 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Gearswipe is presented as a standalone storefront and
                  operations surface, not a routing hub for the rest of the
                  portfolio.
                </p>
                <div className="flex flex-wrap gap-3 text-slate-300">
                  <a href="#home" className="hover:text-white">
                    Back to top
                  </a>
                  <span className="hidden text-slate-600 sm:inline">•</span>
                  <span>Gold Shore support context only</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
