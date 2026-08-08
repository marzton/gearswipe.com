"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { siteGraphLinks } from "../lib/admin-data";

type Product = {
  name: string;
  category: string;
  price: string;
  copy: string;
  cta: string;
  tone: "buy" | "quote" | "secure";
};

const products: Product[] = [
  {
    name: "Custom PC Build",
    category: "Configured systems",
    price: "Quote on request",
    copy:
      "Choose gaming, CAD, or workstation intent and we’ll turn it into a clean build path with compatibility checks.",
    cta: "Request a build quote",
    tone: "quote",
  },
  {
    name: "Windows 11 Pro Key",
    category: "Digital delivery",
    price: "From $5.49",
    copy: "Fast digital activation with a checkout path that stays out of your way.",
    cta: "Buy now",
    tone: "buy",
  },
  {
    name: "Antivirus Suite",
    category: "Digital delivery",
    price: "From $14.99",
    copy: "Simple protection products for customers who want setup without friction.",
    cta: "Buy now",
    tone: "buy",
  },
  {
    name: "YubiKey 5 NFC",
    category: "Security hardware",
    price: "From $25",
    copy: "Authentication hardware for sign-ins, admin access, and device trust.",
    cta: "Buy now",
    tone: "secure",
  },
  {
    name: "SSD + RAM Kit",
    category: "Parts & upgrades",
    price: "From $19.99",
    copy: "A restrained catalog lane for useful upgrades, not a crowded parts warehouse.",
    cta: "View kit",
    tone: "buy",
  },
  {
    name: "Meta Glasses",
    category: "Consumer tech",
    price: "From $299",
    copy: "Premium connected gear that sits comfortably beside the core store mix.",
    cta: "View details",
    tone: "buy",
  },
];

const collections = [
  {
    title: "Fixed-price inventory",
    copy:
      "Standard products move through normal add-to-cart checkout with clear pricing and quick delivery.",
  },
  {
    title: "Configured products",
    copy:
      "Custom PC builds and quoted bundles move through inquiry, review, and approval instead of a fake price tag.",
  },
  {
    title: "Rights-aware assets",
    copy:
      "Every image, spec sheet, and vendor asset can be tied to provenance, permissions, and expiry.",
  },
];

const trustPoints = [
  {
    title: "Minimal, professional layout",
    copy: "Clean type, straight borders, and a restrained cadence that reads like a serious retail brand.",
  },
  {
    title: "Mobile-first structure",
    copy: "The same system collapses cleanly on smaller screens without cramming the page.",
  },
  {
    title: "Fast path to action",
    copy: "Shop, quote, sign up, or log in without wandering through unnecessary pages.",
  },
];

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

function BrandMarkDark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden border border-[#444444] bg-[#1a1a1a] rounded">
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
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#8b5cf6]">
          Gearswipe
        </p>
        <p className="text-sm text-[#e0e0e0]">Tech store</p>
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

function StatusLineDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#333333] py-3 last:border-b-0">
      <span className="text-sm text-[#909090]">{label}</span>
      <span className="text-sm font-semibold text-[#e0e0e0]">{value}</span>
    </div>
  );
}

function MailFormsDark() {
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
      ? "border-[#86efac]/30 bg-[#86efac]/10 text-[#86efac]"
      : status === "error"
        ? "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]"
        : "border-[#666666] bg-transparent text-[#909090]";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={submitContact}
        className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-6 rounded-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#333333] pb-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">Contact</p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Get in touch
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-7 text-[#909090]">
              Questions about products, custom builds, vendor partnerships, or store setup.
            </p>
          </div>
          <p className={`border px-3 py-2 text-xs rounded whitespace-nowrap font-medium ${statusClass(contactState.status)}`}>
            {contactState.message || "We respond quickly"}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#e0e0e0]">Name</span>
              <input
                name="name"
                className="border border-[#444444] bg-[#0f0f0f]/50 px-3 py-3 text-[15px] text-white outline-none transition focus:border-[#8b5cf6] rounded placeholder-[#666666]"
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#e0e0e0]">Email</span>
              <input
                name="email"
                type="email"
                className="border border-[#444444] bg-[#0f0f0f]/50 px-3 py-3 text-[15px] text-white outline-none transition focus:border-[#8b5cf6] rounded placeholder-[#666666]"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#e0e0e0]">Company</span>
            <input
              name="company"
              className="border border-[#444444] bg-[#0f0f0f]/50 px-3 py-3 text-[15px] text-white outline-none transition focus:border-[#8b5cf6] rounded placeholder-[#666666]"
              placeholder="Optional"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#e0e0e0]">Subject</span>
            <input
              name="subject"
              className="border border-[#444444] bg-[#0f0f0f]/50 px-3 py-3 text-[15px] text-white outline-none transition focus:border-[#8b5cf6] rounded placeholder-[#666666]"
              placeholder="Product question, quote, vendor partnership..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#e0e0e0]">Message</span>
            <textarea
              name="message"
              rows={5}
              className="border border-[#444444] bg-[#0f0f0f]/50 px-3 py-3 text-[15px] text-white outline-none transition focus:border-[#8b5cf6] rounded placeholder-[#666666]"
              placeholder="Tell us what you need..."
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="border border-[#8b5cf6] bg-[#8b5cf6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7c3aed] rounded"
          >
            Send message
          </button>
          <Link
            href="/signup"
            className="border border-[#444444] px-5 py-3 text-sm font-medium text-[#e0e0e0] transition hover:border-[#8b5cf6] hover:text-[#8b5cf6] rounded"
          >
            Join rewards
          </Link>
        </div>
      </form>

      <div className="grid gap-4">
        <form
          onSubmit={submitSubscribe}
          className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-6 rounded-lg"
        >
          <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">Rewards signup</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            100 points on join
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#909090]">
            Early members get points, order updates, and launch access.
          </p>
          <p className={`mt-4 border px-3 py-2 text-xs rounded font-medium ${statusClass(subscribeState.status)}`}>
            {subscribeState.message || "No spam. Clean signup."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              name="email"
              type="email"
              className="border border-[#444444] bg-[#0f0f0f]/50 px-3 py-3 text-[15px] text-white outline-none transition focus:border-[#8b5cf6] rounded placeholder-[#666666]"
              placeholder="Email address"
            />
            <button
              type="submit"
              className="border border-[#8b5cf6] bg-[#8b5cf6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7c3aed] rounded"
            >
              Join now
            </button>
          </div>
        </form>

        <div className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-6 rounded-lg">
          <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">Store info</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-[#333333] bg-[#0a0a0a]">
            <Image
              src="/brand/gearswipe-logo-dark.jpg"
              alt="Gearswipe logo"
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 grid gap-3">
            <StatusLineDark label="Rewards" value="100 points signup" />
            <StatusLineDark label="Access" value="Shop, quote, admin" />
            <StatusLineDark label="Style" value="Precision retail" />
          </div>
        </div>
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

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [],
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0f0f0f] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="border-b border-[#333333] bg-[rgba(10,10,10,0.7)] py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <BrandMarkDark />

            <nav className="flex flex-wrap items-center gap-2">
              <Link
                href="/shop"
                className="px-3 py-2 text-sm text-[#e0e0e0] transition hover:text-[#8b5cf6]"
              >
                Shop
              </Link>
              <Link
                href="/rewards"
                className="px-3 py-2 text-sm text-[#e0e0e0] transition hover:text-[#8b5cf6]"
              >
                Rewards
              </Link>
              <Link
                href="/signup"
                className="px-3 py-2 text-sm text-[#e0e0e0] transition hover:text-[#8b5cf6]"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="px-3 py-2 text-sm text-[#e0e0e0] transition hover:text-[#8b5cf6]"
              >
                Login
              </Link>
              <Link
                href="/admin"
                className="border border-[#8b5cf6] bg-[#8b5cf6] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#7c3aed]"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:py-16">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 text-sm text-[#a78bfa] mb-4">
                <span className="h-2 w-2 rounded-full bg-[#8b5cf6]"></span>
                Gearswipe
              </div>
              <h1 className="mt-4 max-w-3xl text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
                Tech store built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]">precision</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#b0b0b0] sm:text-lg">
                Gearswipe handles what matters: fixed-price products move fast, custom PC builds get proper quotes, and every asset is tied to provenance. Professional checkout on every device.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="border border-[#8b5cf6] bg-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7c3aed] hover:border-[#7c3aed]"
                >
                  Shop now
                </Link>
                <Link
                  href="/signup"
                  className="border border-[#444444] px-6 py-3 text-sm font-semibold text-[#e0e0e0] transition hover:border-[#8b5cf6] hover:text-[#8b5cf6]"
                >
                  Join rewards
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {trustPoints.map((item) => (
                <div key={item.title} className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-5 rounded-lg hover:border-[#8b5cf6]/30 transition">
                  <p className="text-sm font-semibold text-[#e0e0e0]">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-[#909090]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-6 rounded-lg overflow-hidden group hover:border-[#8b5cf6]/30 transition">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-[#333333] pb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">Featured</p>
                  <p className="mt-2 text-xl font-bold text-[#e0e0e0]">
                    Clean catalog
                  </p>
                </div>
                <span className="border border-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 text-xs uppercase tracking-widest text-[#8b5cf6]">
                  Live
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-[#333333] bg-[#0a0a0a]">
                <Image
                  src="/brand/gearswipe-cart-logo.jpg"
                  alt="Gearswipe cart logo"
                  width={1200}
                  height={1200}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="border border-[#333333] bg-[#0f0f0f]/50 p-4 rounded">
                  <StatusLineDark label="Fixed-price" value="Inventory, keys, accessories" />
                  <StatusLineDark label="Quoted" value="Custom PC builds and bundles" />
                  <StatusLineDark label="Rewards" value="Points for members" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#333333] py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">Catalog</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
                Shop by category
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-medium transition rounded ${
                    activeCategory === category
                      ? "border border-[#8b5cf6] bg-[#8b5cf6] text-white"
                      : "border border-[#444444] bg-transparent text-[#e0e0e0] hover:border-[#8b5cf6] hover:text-[#8b5cf6]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.name} className="flex h-full flex-col border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-5 rounded-lg hover:border-[#8b5cf6]/30 transition group">
                <div className="flex items-center justify-between gap-3 border-b border-[#333333] pb-4 mb-4">
                  <span className="border border-[#444444] bg-[#0f0f0f]/50 px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-[#909090] rounded">
                    {product.category}
                  </span>
                  <span
                    className={`text-xs uppercase tracking-[0.28em] font-semibold ${
                      product.tone === "quote"
                        ? "text-[#fbbf24]"
                        : product.tone === "secure"
                          ? "text-[#86efac]"
                          : "text-[#a0aec0]"
                    }`}
                  >
                    {product.tone === "quote" ? "Build" : product.tone === "secure" ? "Secure" : "Ready"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#8b5cf6] transition">{product.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#b0b0b0]">{product.copy}</p>
                  </div>

                  <div className="flex items-end justify-between gap-3 border-t border-[#333333] pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-[#8b5cf6]">
                        {product.tone === "quote" ? "Pricing" : "From"}
                      </p>
                      <p className="text-xl font-bold text-white">{product.price}</p>
                    </div>
                    {product.tone === "quote" ? (
                      <Link
                        href="/build/custom-pc"
                        className="border border-[#8b5cf6] px-3 py-2 text-sm font-semibold text-[#8b5cf6] transition hover:bg-[#8b5cf6] hover:text-white rounded"
                      >
                        {product.cta}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="border border-[#8b5cf6] px-3 py-2 text-sm font-semibold text-[#8b5cf6] transition hover:bg-[#8b5cf6] hover:text-white rounded"
                      >
                        {product.cta}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-[#333333] py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-6 rounded-lg">
            <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">How it works</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Simple paths for every need
            </h2>
            <div className="mt-6 grid gap-4">
              <StatusLineDark label="Fixed-price items" value="Add to cart, checkout, ship" />
              <StatusLineDark label="Custom builds" value="Requirements, quote, approval" />
              <StatusLineDark label="Rewards" value="Signup, points, member access" />
              <StatusLineDark label="Admin" value="Login, vendor rights, publish control" />
            </div>
          </div>

          <div className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-6 rounded-lg">
            <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">What we handle</p>
            <div className="mt-3 grid gap-4">
              {collections.map((collection) => (
                <div key={collection.title} className="border border-[#333333] bg-[#0f0f0f]/50 p-4 rounded hover:border-[#8b5cf6]/30 transition">
                  <p className="text-sm font-bold text-white">{collection.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#909090]">{collection.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#333333] py-12">
          <MailFormsDark />
        </section>

        <section className="border-t border-[#333333] py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">Connected</p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Part of our ecosystem
              </h2>
            </div>
            <p className="text-sm text-[#909090]">Carefully curated partner sites</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {siteGraphLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border border-[#333333] bg-[#1a1a1a]/60 backdrop-blur-sm p-5 rounded-lg transition hover:border-[#8b5cf6]/30 hover:bg-[#1a1a1a] group"
              >
                <p className="text-base font-bold text-white group-hover:text-[#8b5cf6] transition">{link.label}</p>
                <p className="mt-2 text-sm text-[#909090]">{link.note}</p>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-auto border-t border-[#333333] py-6 text-sm text-[#909090]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Gearswipe — precision tech storefront</p>
            <p className="text-[#e0e0e0]">Professional. Focused. Intentional.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
