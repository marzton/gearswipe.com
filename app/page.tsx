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
    name: "Custom PC Build",
    category: "Custom PCs",
    price: "From $1,499",
    copy:
      "Performance-focused desktop builds for creators, gamers, and operators who want a clean buying path.",
    badge: "Featured",
  },
  {
    name: "Windows 11 Pro Key",
    category: "Digital Licenses",
    price: "From $5.49",
    copy:
      "Fast-moving activation keys for devices that need a quick setup without the warehouse overhead.",
    badge: "Instant delivery",
  },
  {
    name: "Antivirus Software",
    category: "Digital Licenses",
    price: "From $14.99",
    copy:
      "Protection plans and device security bundles packaged for simple checkout and easy renewal.",
    badge: "Protection",
  },
  {
    name: "YubiKey 5 NFC",
    category: "Security Hardware",
    price: "From $25",
    copy:
      "A compact security lane for customers who want trusted hardware with low-friction fulfillment.",
    badge: "Trusted",
  },
  {
    name: "Upgrade Parts Rail",
    category: "Parts",
    price: "From $19.99",
    copy:
      "Memory, storage, cables, and small parts for the kind of inventory that can be refreshed quickly.",
    badge: "Builder pick",
  },
  {
    name: "Meta Glasses",
    category: "Wearables",
    price: "From $299",
    copy:
      "A premium consumer lane kept sharp and minimal so the product stays at center stage.",
    badge: "Lifestyle",
  },
];

const categories = ["All", ...new Set(products.map((product) => product.category))];

const storeNotes = [
  {
    title: "No-stock friendly",
    copy: "Digital goods, fulfillment-light products, and curated hardware stay easy to keep current.",
  },
  {
    title: "Serious presentation",
    copy: "The storefront feels technical and direct without turning into a dashboard or a spec sheet.",
  },
  {
    title: "Built to browse fast",
    copy: "The layout stays clear on mobile, with sharp contrast and compact product rails.",
  },
];

const laneRows = [
  ["PC builds", "Custom desktop offers for higher-ticket buyers."],
  ["License keys", "Software activations with simple delivery."],
  ["Security gear", "Trusted hardware and privacy tools."],
  ["Upgrade parts", "Small components and add-ons with quick turnarounds."],
];

function MiniWave({ values }: { values: number[] }) {
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
        strokeLinecap="square"
        strokeLinejoin="miter"
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
        <header className="sticky top-3 z-20 border border-[#1c2734] bg-[#0a1119] px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center border border-[#1a8fff]/45 bg-[#0d1520] text-[10px] font-semibold tracking-[0.38em] text-[#f5f7fa]">
                GS
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[#8fa3b8]">
                  Gearswipe
                </p>
                <p className="text-sm text-[#b8c7d6]">
                  A store for builds, keys, hardware, parts, and practical tech
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 border border-[#182433] bg-[#0d1520] px-3 py-2 text-sm text-[#8fa3b8]">
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
                  strokeLinecap="square"
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
                Shop
              </a>
              <a
                href="#details"
                className="border border-[#182433] px-3 py-2 text-[#e5eef8] transition hover:border-[#1a8fff] hover:text-white"
              >
                Details
              </a>
              <a
                href="#catalog"
                className="border border-[#1a8fff] bg-[#1a8fff] px-3 py-2 font-medium text-white transition hover:bg-[#2a95ff]"
              >
                Browse store
              </a>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-8">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[#8fa3b8]">
                Tech goods, no warehouse drama
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                A storefront for
                <span className="block bg-gradient-to-r from-[#1a8fff] via-[#8ec2ff] to-[#f5f7fa] bg-clip-text text-transparent">
                  tech that moves cleanly.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b8c7d6]">
                Gearswipe sells custom PC builds, software licenses, security
                hardware, upgrade parts, and other tech products that do not
                need a warehouse full of stock to stay current.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {storeNotes.map((item) => (
                <div
                  key={item.title}
                  className="border border-[#182433] bg-[#0d1520] px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#8fa3b8]">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 border border-[#182433] bg-[#0d1520] p-4">
            <div className="flex items-center justify-between border-b border-[#182433] pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#8fa3b8]">
                  Storefront snapshot
                </p>
                <p className="mt-1 text-lg font-medium text-white">
                  Curated for quick browsing
                </p>
              </div>
              <span className="border border-[#1a8fff]/30 bg-[#1a8fff]/10 px-2 py-1 text-xs text-[#8ec2ff]">
                Live
              </span>
            </div>

            <div className="grid gap-3 border border-[#182433] bg-[#0a1119] p-3">
              {laneRows.map(([label, copy]) => (
                <div
                  key={label}
                  className="grid gap-2 border-b border-[#182433] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <span className="text-xs uppercase tracking-[0.25em] text-[#1a8fff]">
                      Ready
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-[#b8c7d6]">{copy}</p>
                </div>
              ))}
            </div>

            <div className="border border-[#182433] bg-[#0a1119] p-3">
              <MiniWave values={[34, 52, 58, 46, 73]} />
              <div className="mt-3 flex items-center justify-between text-sm text-[#8fa3b8]">
                <span>Store signal</span>
                <span className="text-white">Steady demand</span>
              </div>
            </div>
          </div>
        </section>

        <section id="catalog" className="py-4">
          <div className="flex flex-col gap-3 border-t border-[#182433] pt-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[#8fa3b8]">
                Catalog
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                Built around products people actually buy.
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
                      View offer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="details"
          className="mt-8 grid gap-4 border-t border-[#182433] py-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="border border-[#182433] bg-[#0d1520] p-4">
            <p className="text-xs uppercase tracking-[0.5em] text-[#8fa3b8]">
              Why it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Sharp enough to feel technical, simple enough to shop.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#b8c7d6]">
              The layout stays product-first: clear category lanes, strong
              contrast, and a compact presentation that works on desktop and
              mobile without feeling like a spec sheet.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-[#182433] bg-[#0d1520] p-4">
              <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                Support context
              </p>
              <p className="mt-2 text-lg font-medium text-white">
                Product-first, with back office kept light.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7d6]">
                Gearswipe can sit alongside the broader portfolio without
                turning into a hub page or a router for other brands.
              </p>
            </div>

            <div className="border border-[#182433] bg-[#0d1520] p-4">
              <p className="text-xs uppercase tracking-[0.45em] text-[#8fa3b8]">
                Portfolio note
              </p>
              <p className="mt-2 text-lg font-medium text-white">
                Standalone storefront, not the whole network.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b8c7d6]">
                Gold Shore remains background context only while Gearswipe keeps
                its own shopping identity and tone.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-[#182433] py-5 text-sm text-[#8fa3b8]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Gearswipe sells tech products in a sharp, inventory-light storefront.</p>
            <p className="text-white">Gold Shore context stays secondary.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
