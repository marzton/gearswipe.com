"use client";

import { useMemo, useState } from "react";

type Product = {
  name: string;
  category: string;
  price: string;
  copy: string;
  badge: string;
};

const products: Product[] = [
  {
    name: "Apex RTX Build",
    category: "PC Builds",
    price: "$1,899",
    copy:
      "A clean creator-ready desktop tuned for buyers who want performance without the warehouse overhead.",
    badge: "Featured",
  },
  {
    name: "Windows 11 Pro Key",
    category: "Digital Licenses",
    price: "$5.49",
    copy:
      "Instant checkout for the software lane that needs fast delivery and a low-touch support path.",
    badge: "Instant delivery",
  },
  {
    name: "YubiKey 5 NFC",
    category: "Security",
    price: "$25",
    copy:
      "A compact trust item for teams that want security hardware with a simple, familiar buying flow.",
    badge: "Trusted",
  },
  {
    name: "Total Protection Suite",
    category: "Software",
    price: "$14.99",
    copy:
      "Antivirus, privacy, and device protection packaged for quick fulfillment and easy renewal.",
    badge: "Fast moving",
  },
  {
    name: "Parts Rail",
    category: "Components",
    price: "$19.99",
    copy:
      "Accessories and upgrade parts organized for fast browsing across low-inventory product lanes.",
    badge: "Builder pick",
  },
  {
    name: "Meta Glasses",
    category: "Wearables",
    price: "$299",
    copy:
      "A premium consumer lane kept visually restrained so the product, not the page, does the talking.",
    badge: "Lifestyle",
  },
];

const categories = ["All", ...new Set(products.map((product) => product.category))];

const trustCards = [
  {
    title: "Fast delivery",
    copy: "Codes, licenses, and digital goods can move without inventory drag.",
  },
  {
    title: "Resale-ready",
    copy: "Clear product lanes for builders, operators, and small teams.",
  },
  {
    title: "Support separated",
    copy: "The storefront stays customer-facing while ops stay compact and private.",
  },
];

const opsNotes = [
  "Licensing outreach and vendor follow-up",
  "Document uploads and business verification",
  "Store maintenance and catalog refresh",
  "Subscribers, sales, and fulfillment review",
];

function Sparkline({ values }: { values: number[] }) {
  const points = values
    .map((value, index) => `${index * 22},${72 - value}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 110 72"
      className="h-20 w-full text-[#1a8fff]"
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = [
        product.name,
        product.category,
        product.copy,
        product.badge,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        query.trim().length === 0 || searchText.includes(query.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query]);

  return (
    <main className="min-h-screen bg-[#080d14] text-[#f5f7fa]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 border border-[#1e2d3d] bg-[#0d1520]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center border border-[#1e2d3d] bg-[#182433] text-sm font-semibold text-[#1a8fff]">
                GS
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                  Gearswipe
                </p>
                <p className="text-sm text-[#8fa3b8]">
                  Tech store for builds, keys, security, and accessories
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 border border-[#182433] bg-[#141f2e] px-3 py-2 text-sm text-[#8fa3b8]">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-[#1a8fff]"
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
                placeholder="Search products, categories, or brands"
                className="w-full bg-transparent text-sm text-[#f5f7fa] outline-none placeholder:text-[#8fa3b8]"
                aria-label="Search products"
              />
            </label>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a
                href="#catalog"
                className="border border-[#182433] px-3 py-2 text-[#e5eef8] transition hover:border-[#1a8fff] hover:text-white"
              >
                Browse
              </a>
              <a
                href="#operations"
                className="border border-[#182433] px-3 py-2 text-[#e5eef8] transition hover:border-[#1a8fff] hover:text-white"
              >
                Operations
              </a>
              <a
                href="#catalog"
                className="border border-[#1a8fff] bg-[#1a8fff] px-3 py-2 font-medium text-white transition hover:bg-[#2a95ff]"
              >
                Request quote
              </a>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 py-6 lg:grid-cols-[1.12fr_0.88fr] lg:py-8">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                Digital products, clean margins
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Sell the tech people
                <span className="block bg-gradient-to-r from-[#1a8fff] to-[#f5f7fa] bg-clip-text text-transparent">
                  actually want to buy.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b8c7d6]">
                Gearswipe is a dark retail storefront for PC builds, digital
                licenses, security hardware, wearables, and other low-friction
                tech products that ship fast and stay easy to manage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {trustCards.map((item) => (
                <div
                  key={item.title}
                  className="border border-[#182433] bg-[#0d1520] px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-[#8fa3b8]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 border border-[#182433] bg-[#0d1520] p-4">
            <div className="flex items-center justify-between border-b border-[#182433] pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#8fa3b8]">
                  Featured lanes
                </p>
                <p className="mt-1 text-lg font-medium text-white">
                  Built for modern resale
                </p>
              </div>
              <span className="border border-[#1a8fff]/30 bg-[#1a8fff]/10 px-2 py-1 text-xs text-[#8ec2ff]">
                Live
              </span>
            </div>
            {[
              ["PC builds", "Premium desktop offers with clear positioning."],
              ["Digital keys", "Instant fulfillment and low support overhead."],
              ["Security gear", "Hardware and protection products with trust."],
            ].map(([label, copy]) => (
              <div
                key={label}
                className="grid gap-2 border border-[#182433] bg-[#141f2e] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#1a8fff]">
                    Ready
                  </span>
                </div>
                <p className="text-sm text-[#b8c7d6]">{copy}</p>
              </div>
            ))}
            <div className="border border-[#182433] bg-[#141f2e] p-3">
              <Sparkline values={[34, 52, 58, 46, 73]} />
              <div className="mt-3 flex items-center justify-between text-sm text-[#8fa3b8]">
                <span>Sales momentum</span>
                <span className="text-white">Upward</span>
              </div>
            </div>
          </div>
        </section>

        <section id="catalog" className="py-4">
          <div className="flex flex-col gap-3 border-t border-[#182433] pt-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                Catalog
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                A lean lineup of products that move.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`border px-3 py-2 text-sm transition ${
                    activeCategory === category
                      ? "border-[#1a8fff] bg-[#1a8fff]/10 text-white"
                      : "border-[#182433] bg-[#0d1520] text-[#b8c7d6] hover:border-[#1a8fff]/60 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.name}
                className="flex h-full flex-col border border-[#182433] bg-[#0d1520] p-4"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#182433] pb-3">
                  <span className="border border-[#1a8fff]/30 bg-[#1a8fff]/10 px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-[#8ec2ff]">
                    {product.badge}
                  </span>
                  <span className="text-sm text-[#8fa3b8]">{product.category}</span>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 pt-4">
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#b8c7d6]">
                      {product.copy}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-3 border-t border-[#182433] pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-[#8fa3b8]">
                        From
                      </p>
                      <p className="text-2xl font-semibold text-white">
                        {product.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="border border-[#1a8fff] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a8fff] hover:text-white"
                    >
                      Get quote
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="operations"
          className="mt-8 grid gap-4 border-t border-[#182433] py-6 lg:grid-cols-[0.92fr_1.08fr]"
        >
          <div className="border border-[#182433] bg-[#0d1520] p-4">
            <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
              Operations
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              A compact control surface behind the store.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#b8c7d6]">
              Licensing, uploads, verification, and maintenance stay available
              without taking over the storefront narrative.
            </p>
            <div className="mt-5 grid gap-3">
              {opsNotes.map((note) => (
                <div
                  key={note}
                  className="border border-[#182433] bg-[#141f2e] px-3 py-2 text-sm text-white"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-[#182433] bg-[#0d1520] p-4">
              <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                Support
              </p>
              <p className="mt-2 text-lg font-medium text-white">
                Product-first, not overloaded.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7d6]">
                The page stays focused on what Gearswipe offers: practical tech
                goods with a store flow that feels clear on mobile and desktop.
              </p>
            </div>

            <div className="border border-[#182433] bg-[#0d1520] p-4">
              <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                Availability
              </p>
              <p className="mt-2 text-lg font-medium text-white">
                No-stock lanes, shipped cleanly.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7d6]">
                Inventory-light offers make the site easier to keep current and
                easier to browse on the go.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-[#182433] py-5 text-sm text-[#8fa3b8]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Gearswipe is a standalone store surface built for tech products.</p>
            <p className="text-white">Gold Shore support context only.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
