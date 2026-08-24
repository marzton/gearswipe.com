"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { StorefrontCatalog } from "../../components/storefront-catalog";
import { siteGraphLinks } from "../../lib/admin-data";
import { storeCollections, storeTrustPoints } from "../../lib/store-catalog";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden border border-[#d8d8d3] bg-white">
        <Image
          src="/brand/gearswipe-cart-logo.jpg"
          alt="Gearswipe cart logo"
          fill
          sizes="44px"
          className="object-cover"
          priority
        />
      </div>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#7a7a74]">
          Gearswipe
        </p>
        <p className="text-sm text-[#111111]">Minimal gear store</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">
      {children}
    </p>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#deded7] py-3 last:border-b-0">
      <span className="text-sm text-[#76766f]">{label}</span>
      <span className="text-sm font-medium text-[#101010]">{value}</span>
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
      ? "border-[#b8d8c2] bg-[#eef7ef] text-[#1c5536]"
      : status === "error"
        ? "border-[#efc1c1] bg-[#f8efef] text-[#8a1f1f]"
        : "border-[#deded7] bg-white text-[#76766f]";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={submitContact}
        className="border border-[#deded7] bg-white p-5 shadow-[0_1px_0_rgba(16,16,16,0.03)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ededeb] pb-4">
          <div>
            <SectionLabel>Contact</SectionLabel>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
              Talk to Gearswipe
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-7 text-[#5f5f59]">
              Ask about store setup, product sourcing, vendor licensing, or a custom
              build quote.
            </p>
          </div>
          <p className={`border px-3 py-2 text-sm ${statusClass(contactState.status)}`}>
            {contactState.message || "Messages route to the right support inbox."}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-[#44443f]">Name</span>
              <input
                name="name"
                className="border border-[#dcdcd6] px-3 py-3 text-[15px] text-[#111111] outline-none transition focus:border-[#111111]"
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-[#44443f]">Email</span>
              <input
                name="email"
                type="email"
                className="border border-[#dcdcd6] px-3 py-3 text-[15px] text-[#111111] outline-none transition focus:border-[#111111]"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-[#44443f]">Company</span>
            <input
              name="company"
              className="border border-[#dcdcd6] px-3 py-3 text-[15px] text-[#111111] outline-none transition focus:border-[#111111]"
              placeholder="Optional"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-[#44443f]">Subject</span>
            <input
              name="subject"
              className="border border-[#dcdcd6] px-3 py-3 text-[15px] text-[#111111] outline-none transition focus:border-[#111111]"
              placeholder="Product question, quote, vendor partnership..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-[#44443f]">Message</span>
            <textarea
              name="message"
              rows={5}
              className="border border-[#dcdcd6] px-3 py-3 text-[15px] text-[#111111] outline-none transition focus:border-[#111111]"
              placeholder="Tell us what you need..."
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
          >
            Send message
          </button>
          <Link
            href="/signup"
            className="border border-[#dcdcd6] px-4 py-3 text-sm text-[#111111] transition hover:border-[#111111]"
          >
            Join rewards
          </Link>
        </div>
      </form>

      <div className="grid gap-4">
        <form
          onSubmit={submitSubscribe}
          className="border border-[#deded7] bg-[#fafaf8] p-5 sm:p-6"
        >
          <SectionLabel>Rewards signup</SectionLabel>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
            Get 100 points on join
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5f5f59]">
            Early members get points, order updates, and launch access without
            cluttering your inbox.
          </p>
          <p className={`mt-4 border px-3 py-2 text-sm ${statusClass(subscribeState.status)}`}>
            {subscribeState.message || "Clean signup. Fast reward entry."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="email"
              type="email"
              className="border border-[#dcdcd6] bg-white px-3 py-3 text-[15px] text-[#111111] outline-none transition focus:border-[#111111]"
              placeholder="Email address"
            />
            <button
              type="submit"
              className="border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
            >
              Join now
            </button>
          </div>
        </form>

        <div className="border border-[#deded7] bg-white p-5 sm:p-6">
          <SectionLabel>Store snapshot</SectionLabel>
          <div className="mt-4 overflow-hidden border border-[#ededeb] bg-[#fafaf8] p-4">
            <Image
              src="/brand/gearswipe-logo-dark.jpg"
              alt="Gearswipe logo"
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 grid">
            <StatusLine label="Rewards" value="100 points signup" />
            <StatusLine label="Access" value="Shop, quote, admin" />
            <StatusLine label="Style" value="Minimal retail" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="border-b border-[#deded7] bg-[#fbfbf8] py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <BrandMark />

            <nav className="flex flex-wrap items-center gap-2">
              <Link
                href="/shop"
                className="border border-[#deded7] px-3 py-2 text-sm text-[#111111] transition hover:border-[#111111]"
              >
                Shop
              </Link>
              <Link
                href="/rewards"
                className="border border-[#deded7] px-3 py-2 text-sm text-[#111111] transition hover:border-[#111111]"
              >
                Rewards
              </Link>
              <Link
                href="/signup"
                className="border border-[#deded7] px-3 py-2 text-sm text-[#111111] transition hover:border-[#111111]"
              >
                Sign up
              </Link>
              <Link
                href="/cart"
                className="border border-[#deded7] px-3 py-2 text-sm text-[#111111] transition hover:border-[#111111]"
              >
                Cart
              </Link>
              <Link
                href="/login"
                className="border border-[#deded7] px-3 py-2 text-sm text-[#111111] transition hover:border-[#111111]"
              >
                Login
              </Link>
              <Link
                href="/admin"
                className="border border-[#111111] bg-[#111111] px-3 py-2 text-sm text-white transition hover:bg-[#262626]"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:py-10">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <SectionLabel>Gearswipe</SectionLabel>
              <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-[-0.07em] sm:text-6xl lg:text-7xl">
                A minimal tech store for products, builds, and trusted gear.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f5f59] sm:text-lg">
                Gearswipe keeps the storefront tight: buy what has a price, request a quote
                for custom systems, and move through a professional checkout flow that feels
                deliberate on desktop and mobile.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
                >
                  Shop products
                </Link>
                <Link
                  href="/signup"
                  className="border border-[#deded7] px-4 py-3 text-sm text-[#111111] transition hover:border-[#111111]"
                >
                  Join rewards
                </Link>
                <Link
                  href="/login"
                  className="border border-[#deded7] px-4 py-3 text-sm text-[#111111] transition hover:border-[#111111]"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {storeTrustPoints.map((item) => (
                <div key={item.title} className="border border-[#deded7] bg-white p-4">
                  <p className="text-sm font-medium text-[#111111]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#5f5f59]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#deded7] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[#ededeb] pb-3">
              <div>
                <SectionLabel>Featured surface</SectionLabel>
                <p className="mt-2 text-lg font-medium text-[#111111]">
                  Clean catalog, quick decisions
                </p>
              </div>
              <span className="border border-[#111111] bg-[#111111] px-2 py-1 text-xs text-white">
                Live
              </span>
            </div>

            <div className="mt-4 overflow-hidden border border-[#ededeb] bg-[#fafaf8]">
              <Image
                src="/brand/gearswipe-cart-logo.jpg"
                alt="Gearswipe cart logo"
                width={1200}
                height={1200}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="mt-4 grid gap-3">
              <div className="border border-[#ededeb] p-4">
                <StatusLine label="Fixed-price" value="Inventory, keys, accessories" />
                <StatusLine label="Quoted" value="Custom PC builds and bundles" />
                <StatusLine label="Rewards" value="Points for members" />
              </div>
            </div>
          </div>
        </section>

        <StorefrontCatalog
          eyebrow="Collections"
          title="Products that fit the store's actual purpose."
          description="Fixed-price products move through add-to-cart checkout, while custom systems stay on a quote path."
          showCartSummary={false}
        />

        <section className="grid gap-4 border-t border-[#deded7] py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border border-[#deded7] bg-white p-5 sm:p-6">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
              A simple path for store, quote, and admin work.
            </h2>
            <div className="mt-4 grid gap-3">
              <StatusLine label="Fixed-price items" value="Add to cart, checkout, ship" />
              <StatusLine label="Custom builds" value="Requirements, quote, approval" />
              <StatusLine label="Rewards" value="Signup, points, member access" />
              <StatusLine label="Admin" value="Login, vendor rights, publish control" />
            </div>
          </div>

          <div className="border border-[#deded7] bg-[#fafaf8] p-5 sm:p-6">
            <SectionLabel>Collections</SectionLabel>
            <div className="mt-3 grid gap-4">
            {storeCollections.map((collection) => (
              <div key={collection.title} className="border border-[#deded7] bg-white p-4">
                <p className="text-base font-medium text-[#111111]">{collection.title}</p>
                <p className="mt-2 text-sm leading-7 text-[#5f5f59]">{collection.copy}</p>
              </div>
            ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#deded7] py-8">
          <MailForms />
        </section>

        <section className="border-t border-[#deded7] py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Connected sites</SectionLabel>
              <h2 className="mt-2 text-2xl font-semibold text-[#111111]">
                Purposeful links only
              </h2>
            </div>
            <p className="text-sm text-[#5f5f59]">Standalone brands, not a router</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {siteGraphLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border border-[#deded7] bg-white p-4 transition hover:border-[#111111]"
              >
                <p className="text-lg font-medium text-[#111111]">{link.label}</p>
                <p className="mt-1 text-sm text-[#5f5f59]">{link.note}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-auto border-t border-[#deded7] py-5 text-sm text-[#5f5f59]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Gearswipe is a focused tech storefront for practical products.</p>
            <p className="text-[#111111]">Standalone brand. Clean presentation.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
