"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

const useCases = ["Gaming", "CAD", "AI", "Workstation"];

const presets = [
  "Quiet black tower",
  "Windowed RGB",
  "Minimal pro build",
  "Portable SFF",
];

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="border border-[#deded7] bg-[#fafaf8] px-2 py-1 text-xs uppercase tracking-[0.26em] text-[#5f5f59]">
      {children}
    </span>
  );
}

export default function CustomPcBuildPage() {
  const [message, setMessage] = useState("Tell us what you want and we’ll turn it into a quote.");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState({
    name: "",
    email: "",
    budget: "",
    cpu: "",
    gpu: "",
    workload: "",
    aesthetic: "",
    storage: "",
    monitor: "",
    partsOwned: "",
    notes: "",
  });

  const estimateLabel = useMemo(() => {
    const budget = brief.budget.trim();
    if (!budget) return "Quote range pending";
    const numeric = budget.match(/\d[\d,]*/g);
    if (!numeric?.length) return budget;
    return `${budget} • review with compatibility check`;
  }, [brief.budget]);

  const briefSummary = useMemo(
    () => [
      { label: "Budget", value: brief.budget || "Pending" },
      { label: "CPU", value: brief.cpu || "No preference" },
      { label: "GPU", value: brief.gpu || "No preference" },
      { label: "Workload", value: brief.workload || "Not set" },
      { label: "Aesthetic", value: brief.aesthetic || "Not set" },
      { label: "Storage / RAM", value: brief.storage || "Not set" },
      { label: "Monitor", value: brief.monitor || "Not set" },
      { label: "Parts owned", value: brief.partsOwned || "None noted" },
    ],
    [brief],
  );

  function updateField(field: keyof typeof brief, value: string) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("Reviewing build requirements...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspace", "Gearswipe");

    const response = await fetch("/api/quote", {
      method: "POST",
      body: formData,
    });

        const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "We could not save the quote request.");
      setLoading(false);
      return;
    }

    form.reset();
    setBrief({
      name: "",
      email: "",
      budget: "",
      cpu: "",
      gpu: "",
      workload: "",
      aesthetic: "",
      storage: "",
      monitor: "",
      partsOwned: "",
      notes: "",
    });
    setMessage(payload.message ?? "Quote request saved.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#deded7] py-4">
          <Link href="/" className="text-sm uppercase tracking-[0.42em] text-[#7a7a74]">
            Gearswipe
          </Link>
          <div className="flex gap-2">
            <Link href="/shop" className="border border-[#deded7] px-3 py-2 text-sm">
              Shop
            </Link>
            <Link href="/signup" className="border border-[#111111] bg-[#111111] px-3 py-2 text-sm text-white">
              Join rewards
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:py-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">
              Build quote
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.07em] sm:text-6xl">
              Custom PC builds with a clean request path.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5f59]">
              Pick the intent, share your budget, and tell us what you already own. We’ll
              route the request into a proper quote workflow instead of forcing a fake
              fixed price.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {useCases.map((item) => (
                <Pill key={item}>{item}</Pill>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-sm font-medium text-[#111111]">Representative image</p>
                <p className="mt-2 text-sm leading-7 text-[#5f5f59]">
                  Use the gallery to show the kind of system you want, not a promise of exact
                  final parts.
                </p>
              </div>
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-sm font-medium text-[#111111]">Quote workflow</p>
                <p className="mt-2 text-sm leading-7 text-[#5f5f59]">
                  Requirements → compatibility review → parts list → quote → approval →
                  build.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[#deded7] bg-white p-4 sm:p-5">
            <div className="overflow-hidden border border-[#ededeb] bg-[#fafaf8]">
              <Image
                src="/brand/gearswipe-logo-dark.svg"
                alt="Gearswipe logo"
                width={1200}
                height={1200}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="mt-4 grid gap-2">
              <Pill>Hero render</Pill>
              <Pill>Internal component view</Pill>
              <Pill>Delivery image</Pill>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-[#deded7] py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-[#deded7] bg-[#fafaf8] p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">
              Why it feels different
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
              Built for serious requests.
            </h2>
            <div className="mt-4 grid gap-3">
              {presets.map((preset) => (
                <div key={preset} className="border border-[#deded7] bg-white p-4">
                  <p className="text-sm font-medium">{preset}</p>
                  <p className="mt-2 text-sm leading-7 text-[#5f5f59]">
                    Representative build imagery and component direction can be tailored
                    around this look.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <form onSubmit={submit} className="border border-[#deded7] bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#ededeb] pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">
                  Request a quote
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                  Tell us the build brief
                </h2>
              </div>
              <p className="border border-[#deded7] bg-[#fafaf8] px-3 py-2 text-sm text-[#5f5f59]">
                {message}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Name</span>
                  <input
                    name="name"
                    value={brief.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={brief.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    required
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Budget</span>
                  <input
                    name="budget"
                    value={brief.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="$1,500 - $2,000"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">CPU preference</span>
                  <input
                    name="cpu"
                    value={brief.cpu}
                    onChange={(event) => updateField("cpu", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="Intel / AMD / no preference"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">GPU preference</span>
                  <input
                    name="gpu"
                    value={brief.gpu}
                    onChange={(event) => updateField("gpu", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="NVIDIA / AMD / no preference"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Workload</span>
                  <input
                    name="workload"
                    value={brief.workload}
                    onChange={(event) => updateField("workload", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="Gaming, CAD, AI, editing..."
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Aesthetic</span>
                  <input
                    name="aesthetic"
                    value={brief.aesthetic}
                    onChange={(event) => updateField("aesthetic", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="Minimal, RGB, stealth, etc."
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Storage / RAM</span>
                  <input
                    name="storage"
                    value={brief.storage}
                    onChange={(event) => updateField("storage", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="2TB SSD, 32GB RAM..."
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Monitor requirements</span>
                  <input
                    name="monitor"
                    value={brief.monitor}
                    onChange={(event) => updateField("monitor", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="Need monitor? What size/resolution?"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-[#44443f]">Parts you already own</span>
                  <input
                    name="partsOwned"
                    value={brief.partsOwned}
                    onChange={(event) => updateField("partsOwned", event.target.value)}
                    className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                    placeholder="Case, GPU, peripherals..."
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm text-[#44443f]">Additional notes</span>
                <textarea
                  name="message"
                  value={brief.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  rows={5}
                  className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                  placeholder="Anything else we should know?"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626] disabled:opacity-70"
              >
                {loading ? "Sending..." : "Request build quote"}
              </button>
              <Link href="/shop" className="border border-[#deded7] px-4 py-3 text-sm">
                Back to catalog
              </Link>
            </div>
          </form>

            <aside className="border border-[#deded7] bg-[#fafaf8] p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">
                Live brief
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                {brief.workload || "Your build brief"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#5f5f59]">{estimateLabel}</p>
              <div className="mt-4 grid gap-2">
                {briefSummary.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 border-b border-[#e6e6df] py-2 last:border-b-0">
                    <span className="text-sm text-[#7a7a74]">{item.label}</span>
                    <span className="text-sm font-medium text-[#111111]">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border border-[#deded7] bg-white p-4">
                <p className="text-sm font-medium text-[#111111]">Next step</p>
                <p className="mt-2 text-sm leading-7 text-[#5f5f59]">
                  Submit this brief and it becomes a quote request routed to Gearswipe
                  admin in real time.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
