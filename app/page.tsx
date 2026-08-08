"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { siteGraphLinks } from "../lib/admin-data";

type Product = {
  name: string;
  category: string;
  price: string;
  copy: string;
  tag: string;
};

const products: Product[] = [
  {
    name: "Custom PC Build",
    category: "Builds",
    price: "From $1,499",
    copy:
      "A configured desktop offer for gaming, editing, or work setups that need a clear buying path.",
    tag: "Featured",
  },
  {
    name: "Windows 11 Pro Key",
    category: "Digital licenses",
    price: "From $5.49",
    copy:
      "A simple activation lane for systems that need software unlocked without the usual clutter.",
    tag: "Instant delivery",
  },
  {
    name: "Antivirus Suite",
    category: "Digital licenses",
    price: "From $14.99",
    copy:
      "Security software packaged for fast checkout, easy renewal, and everyday device coverage.",
    tag: "Protection",
  },
  {
    name: "YubiKey 5 NFC",
    category: "Security hardware",
    price: "From $25",
    copy:
      "Hardware authentication for sign-ins, admin accounts, and higher-trust access flows.",
    tag: "Trusted",
  },
  {
    name: "SSD + RAM Upgrade Kit",
    category: "Parts",
    price: "From $19.99",
    copy:
      "Refresh items for the common upgrade jobs that keep a store useful without heavy stock.",
    tag: "Builder pick",
  },
  {
    name: "Meta Glasses",
    category: "Wearables",
    price: "From $299",
    copy:
      "Connected consumer gear kept in the mix as a premium option alongside the core catalog.",
    tag: "Lifestyle",
  },
];

const categories = ["All", ...new Set(products.map((product) => product.category))];

const collections = [
  {
    title: "Digital licenses",
    copy:
      "Software keys and access products with an emphasis on quick delivery and low-friction setup.",
  },
  {
    title: "Custom builds",
    copy:
      "PC offers and configured systems for buyers who want a serious product without a complex journey.",
  },
  {
    title: "Security hardware",
    copy:
      "YubiKeys, auth tools, and privacy-minded devices that fit naturally into a technical storefront.",
  },
];

const trustPoints = [
  {
    title: "Clean checkout flow",
    copy: "The buying path stays short, direct, and easy to follow.",
  },
  {
    title: "Mobile-friendly catalog",
    copy: "The layout keeps its shape on phones without feeling cramped.",
  },
  {
    title: "Focused product mix",
    copy: "Enough variety to shop well, not so much that it feels noisy.",
  },
];

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#263246] py-3 last:border-b-0">
      <span className="text-sm text-[#9aa9bb]">{label}</span>
      <span className="text-sm font-medium text-[#f4f7fb]">{value}</span>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#263246] bg-[#0b0f14]">
        <Image
          src="/brand/gearswipe-cart-logo.jpg"
          alt="Gearswipe cart logo"
          fill
          sizes="48px"
          className="object-cover"
          priority
        />
      </div>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
          Gearswipe
        </p>
        <p className="text-sm text-[#dbe4ee]">Focused tech store</p>
      </div>
    </div>
  );
}

function MailForms() {
  const [contactState, setContactState] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [subscribeState, setSubscribeState] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactState({ status: "submitting", message: "Routing your message..." });

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspace", "Gearswipe");

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setContactState({
        status: "error",
        message: payload?.message ?? "We could not send the request.",
      });
      return;
    }

    form.reset();
    setContactState({
      status: "success",
      message: payload.message ?? "Message routed successfully.",
    });
  }

  async function submitSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribeState({ status: "submitting", message: "Saving your email..." });

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspace", "Gearswipe");

    const response = await fetch("/api/subscribe", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setSubscribeState({
        status: "error",
        message: payload?.message ?? "We could not save your subscription.",
      });
      return;
    }

    form.reset();
    setSubscribeState({
      status: "success",
      message: payload.message ?? "Subscription saved.",
    });
  }

  const statusClass = (status: string) =>
    status === "success"
      ? "border-[#2b7a5c] bg-[#143125] text-[#a4f0cf]"
      : status === "error"
        ? "border-[#7b2d2d] bg-[#2a1111] text-[#ffb4b4]"
        : "border-[#263246] bg-[#0b0f14] text-[#9aa9bb]";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <form
        onSubmit={submitContact}
        className="border border-[#263246] bg-[#10161f] p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#263246] pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              Contact
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              Start a direct conversation with Gearswipe.
            </h3>
          </div>
          <span className="border border-[#6bb6ff]/30 bg-[#6bb6ff]/10 px-2 py-1 text-xs text-[#93cfff]">
            Routed
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-[#c7d3df]">
            Name
            <input
              name="name"
              required
              className="border border-[#263246] bg-[#0b0f14] px-3 py-3 text-white outline-none transition placeholder:text-[#6f7e91] focus:border-[#6bb6ff]"
              placeholder="Your name"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#c7d3df]">
            Email
            <input
              name="email"
              type="email"
              required
              className="border border-[#263246] bg-[#0b0f14] px-3 py-3 text-white outline-none transition placeholder:text-[#6f7e91] focus:border-[#6bb6ff]"
              placeholder="you@company.com"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#c7d3df]">
            Company
            <input
              name="company"
              className="border border-[#263246] bg-[#0b0f14] px-3 py-3 text-white outline-none transition placeholder:text-[#6f7e91] focus:border-[#6bb6ff]"
              placeholder="Optional"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#c7d3df]">
            Subject
            <input
              name="subject"
              className="border border-[#263246] bg-[#0b0f14] px-3 py-3 text-white outline-none transition placeholder:text-[#6f7e91] focus:border-[#6bb6ff]"
              placeholder="Build quote, partnership, or support"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm text-[#c7d3df]">
          Message
          <textarea
            name="message"
            required
            rows={5}
            className="border border-[#263246] bg-[#0b0f14] px-3 py-3 text-white outline-none transition placeholder:text-[#6f7e91] focus:border-[#6bb6ff]"
            placeholder="Tell us what you need, what you’re buying, and any timing details."
          />
        </label>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`border px-3 py-2 text-sm ${statusClass(contactState.status)}`}>
            {contactState.message || "Messages route to the right support inbox."}
          </p>
          <button
            type="submit"
            className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-3 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
          >
            Send message
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        <form
          onSubmit={submitSubscribe}
          className="border border-[#263246] bg-[#10161f] p-4 sm:p-5"
        >
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
            Subscribe
          </p>
          <h3 className="mt-2 text-xl font-medium text-white">
            Get store updates, launches, and product notes.
          </h3>
          <label className="mt-4 grid gap-2 text-sm text-[#c7d3df]">
            Email
            <input
              name="email"
              type="email"
              required
              className="border border-[#263246] bg-[#0b0f14] px-3 py-3 text-white outline-none transition placeholder:text-[#6f7e91] focus:border-[#6bb6ff]"
              placeholder="you@email.com"
            />
          </label>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className={`border px-3 py-2 text-sm ${statusClass(subscribeState.status)}`}>
              {subscribeState.message || "We keep the list short and relevant."}
            </p>
            <button
              type="submit"
              className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
            >
              Subscribe
            </button>
          </div>
        </form>

        <div className="border border-[#263246] bg-[#10161f] p-4">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
            Mail routing
          </p>
          <div className="mt-3 grid gap-3">
            <StatusLine label="Contact" value="support@gearswipe.com" />
            <StatusLine label="Subscribe" value="updates@gearswipe.com" />
            <StatusLine label="Access" value="access@gearswipe.com" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.category,
        product.copy,
        product.tag,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = search.length === 0 || searchable.includes(search);
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query]);

  return (
    <main className="min-h-screen bg-[#0b0f14] text-[#f4f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 border border-[#263246] bg-[#10161f]/96 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <BrandMark />
              <p className="text-sm text-[#b4c0cf]">
                Curated tech, keys, parts, and build-ready gear.
              </p>
            </div>

            <label className="flex items-center gap-3 border border-[#263246] bg-[#0b0f14] px-3 py-2 text-sm text-[#9aa9bb]">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-[#6bb6ff]"
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
                placeholder="Search builds, keys, hardware"
                className="w-full bg-transparent text-sm text-[#f4f7fb] outline-none placeholder:text-[#78879a]"
                aria-label="Search products"
              />
            </label>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a
                href="#catalog"
                className="border border-[#263246] px-3 py-2 text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Catalog
              </a>
              <a
                href="#collections"
                className="border border-[#263246] px-3 py-2 text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Collections
              </a>
              <a
                href="/admin"
                className="border border-[#263246] px-3 py-2 text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Admin
              </a>
              <a
                href="/login"
                className="border border-[#263246] px-3 py-2 text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Login
              </a>
              <a
                href="#contact"
                className="border border-[#6bb6ff] bg-[#6bb6ff] px-3 py-2 font-medium text-[#081018] transition hover:bg-[#89c7ff]"
              >
                Browse now
              </a>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-8">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                Curated tech for
                <span className="block text-[#93cfff]">
                  builds, licenses, and gear.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b4c0cf]">
                Gearswipe is a focused storefront for custom PC builds,
                software keys, security hardware, upgrade parts, and connected
                tech products that belong in a clean checkout-first catalog.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#catalog"
                  className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-3 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                >
                  Shop the catalog
                </a>
                <a
                  href="#collections"
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  See collections
                </a>
                <a
                  href="/admin"
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Open admin
                </a>
              </div>
            </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {trustPoints.map((item) => (
              <div
                key={item.title}
                className="border border-[#263246] bg-[#10161f] px-4 py-3"
              >
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#9aa9bb]">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
          </div>

          <div
            id="collections"
            className="grid gap-4 border border-[#263246] bg-[#10161f] p-4"
          >
            <div className="flex items-center justify-between border-b border-[#263246] pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                  Store snapshot
                </p>
                <p className="mt-1 text-lg font-medium text-white">
                  A clean catalog, built for quick decisions
                </p>
              </div>
              <span className="border border-[#6bb6ff]/40 bg-[#6bb6ff]/10 px-2 py-1 text-xs text-[#93cfff]">
                Live
              </span>
            </div>

            <div className="grid gap-3 border border-[#263246] bg-[#0b0f14] p-3">
              {collections.map((collection) => (
                <div
                  key={collection.title}
                  className="border-b border-[#263246] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">
                      {collection.title}
                    </p>
                    <span className="text-xs uppercase tracking-[0.26em] text-[#6bb6ff]">
                      Ready
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#b4c0cf]">
                    {collection.copy}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-[#263246] bg-[#0b0f14] p-3">
              <StatusLine label="Fulfillment" value="Digital and physical" />
              <StatusLine label="Audience" value="Builders and buyers" />
              <StatusLine label="Focus" value="Clear, practical, current" />
            </div>
          </div>
        </section>

        <section id="catalog" className="py-4">
          <div className="flex flex-col gap-3 border-t border-[#263246] pt-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Catalog
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                Products that fit the store’s actual purpose.
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
                      ? "border-[#6bb6ff] bg-[#6bb6ff]/10 text-white"
                      : "border-[#263246] bg-[#10161f] text-[#b4c0cf] hover:border-[#6bb6ff]/60 hover:text-white"
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
                className="flex h-full flex-col border border-[#263246] bg-[#10161f] p-4"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#263246] pb-3">
                  <span className="border border-[#6bb6ff]/30 bg-[#6bb6ff]/10 px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-[#93cfff]">
                    {product.tag}
                  </span>
                  <span className="text-sm text-[#9aa9bb]">
                    {product.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 pt-4">
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#b4c0cf]">
                      {product.copy}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-3 border-t border-[#263246] pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-[#8191a5]">
                        From
                      </p>
                      <p className="text-2xl font-semibold text-white">
                        {product.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="border border-[#263246] px-3 py-2 text-sm font-medium text-white transition hover:border-[#6bb6ff] hover:bg-[#6bb6ff] hover:text-[#081018]"
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
          id="contact"
          className="mt-8 grid gap-4 border-t border-[#263246] py-6"
        >
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border border-[#263246] bg-[#10161f] p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                About Gearswipe
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                A storefront with a sharper edge.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#b4c0cf]">
                The brand stays product-first: practical tech, clean presentation,
                and a visual system that feels like a focused web store instead of
                a general-purpose portal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/admin"
                  className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Gearswipe admin
                </a>
                <a
                  href="/login"
                  className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Login
                </a>
                <a
                  href="https://www.goldshore.ai"
                  className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Gold Shore
                </a>
                <a
                  href="https://www.rmarston.com"
                  className="border border-[#263246] px-3 py-2 text-sm text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  R. Marston
                </a>
              </div>
              <div className="mt-5 overflow-hidden border border-[#263246] bg-[#0b0f14]">
                <Image
                  src="/brand/gearswipe-logo-dark.jpg"
                  alt="Gearswipe logo"
                  width={1200}
                  height={1200}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <MailForms />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-[#263246] bg-[#10161f] p-4">
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Purchase mix
              </p>
              <p className="mt-2 text-lg font-medium text-white">
                Digital goods, hardware, and parts in one place.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b4c0cf]">
                Enough variety to be useful, but still tight enough to feel like
                one coherent storefront.
              </p>
            </div>

            <div className="border border-[#263246] bg-[#10161f] p-4">
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Portfolio note
              </p>
              <p className="mt-2 text-lg font-medium text-white">
                Gearswipe stands on its own.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#b4c0cf]">
                Broader brand context can sit in the background without turning
                this homepage into a network router.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-[#263246] py-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Connected sites
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Cross-links across the brand graph
              </h2>
            </div>
            <p className="text-sm text-[#9aa9bb]">Purposeful links only</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {siteGraphLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border border-[#263246] bg-[#10161f] p-4 transition hover:border-[#6bb6ff] hover:bg-[#0f141c]"
              >
                <p className="text-lg font-medium text-white">{link.label}</p>
                <p className="mt-1 text-sm text-[#9aa9bb]">{link.note}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-auto border-t border-[#263246] py-5 text-sm text-[#9aa9bb]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Gearswipe is a focused tech storefront for practical products.</p>
            <p className="text-white">Standalone brand. Clean presentation.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
