const modules = [
  {
    eyebrow: "Signal intake",
    title: "Institutional-grade market context",
    description:
      "A product surface for serious traders who want cleaner readouts on order flow, momentum shifts, and market structure without digging through noise.",
  },
  {
    eyebrow: "Decision support",
    title: "Fast, focused interpretation",
    description:
      "Gearswipe is designed to compress information into something operational: a tighter view of what is moving, what matters, and what deserves attention now.",
  },
  {
    eyebrow: "Trust layer",
    title: "Proof before polish",
    description:
      "The experience emphasizes provenance, access control, and confident communication so the product feels credible before it feels flashy.",
  },
];

const signals = [
  "Market structure snapshots",
  "Activity and volume context",
  "Priority watchlist filtering",
  "Lightweight access request flow",
];

const portfolioNotes = [
  "Gold Shore: parent enterprise and governance context",
  "banproof.me: trust and verification surface",
  "goldshore.ai: AI and automation capability support",
  "rmarston.com: founder credibility and identity",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070d] text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.18),_transparent_28%),linear-gradient(180deg,_#07101d_0%,_#05070d_48%,_#03050a_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
          <header className="flex items-center justify-between gap-4 border-b border-white/8 pb-5 text-xs uppercase tracking-[0.34em] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.95)]" />
              <span>Gearswipe</span>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              <span>AI trading intelligence</span>
              <span className="text-cyan-300/80">Launch access</span>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-medium uppercase tracking-[0.35em] text-cyan-300/80">
                Built for traders who want the edge first
              </p>
              <h1 className="max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                The unfair advantage, without the clutter.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                Gearswipe is a product-first AI trading intelligence platform:
                a focused surface for traders who want faster context, cleaner
                signals, and a more disciplined path from observation to
                action.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#access"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#05070d]"
                >
                  Request access
                </a>
                <a
                  href="#product"
                  className="inline-flex items-center justify-center rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#05070d]"
                >
                  See the product
                </a>
              </div>

              <dl className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ["Low-noise", "A tighter read on movement and relevance"],
                  ["Fast signal", "Short-form context that keeps attention on trade decisions"],
                  ["Trusted frame", "Proof-led presentation instead of hype-first branding"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/4 p-4 backdrop-blur-sm"
                  >
                    <dt className="text-xs uppercase tracking-[0.28em] text-slate-400">
                      {label}
                    </dt>
                    <dd className="mt-3 text-sm leading-6 text-slate-200">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/12 bg-[#08111d]/90 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Signal deck</span>
                  <span className="text-emerald-300">Online</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">
                      Active focus
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold text-white">
                          Market context
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                          A disciplined product layer for reading the market
                          faster, not a crowded dashboard of everything at once.
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-200">
                        Ready
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {signals.map((signal) => (
                      <div
                        key={signal}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                          <span className="h-2 w-2 rounded-full bg-cyan-300" />
                          {signal}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-t border-white/8 bg-[#03050a]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300/80">
                Product focus
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Clear enough to act on, restrained enough to trust.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                The page stays intentionally lean: strong positioning, a few
                concrete modules, and a call to request access. That keeps the
                site aligned with the product without turning it into a
                portfolio index.
              </p>
            </div>

            <div className="grid gap-4">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="rounded-3xl border border-white/10 bg-white/4 p-6 transition hover:border-cyan-300/25 hover:bg-white/6"
                >
                  <p className="text-xs uppercase tracking-[0.34em] text-cyan-300/80">
                    {module.eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {module.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    {module.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="access" className="border-t border-white/8 bg-[#05070d]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/6 to-white/3 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300/80">
                Access
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                Request a closer look.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
                The first release keeps the request path simple and
                low-friction: one clear CTA, one clear purpose, and no excess
                navigation.
              </p>

              <form className="mt-8 space-y-3">
                <label className="sr-only" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email for access"
                  className="w-full rounded-full border border-white/12 bg-slate-950/70 px-5 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
                />
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#05070d]"
                >
                  Request access
                </button>
              </form>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
                  Portfolio note
                </p>
                <p className="mt-3 text-base leading-7 text-slate-300">
                  Gearswipe sits inside a broader Gold Shore-backed portfolio,
                  but it is being presented here as a standalone trading
                  intelligence product. The surrounding properties support the
                  ecosystem; they do not replace the core product story.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
                  Supporting properties
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {portfolioNotes.map((note) => (
                    <div
                      key={note}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm leading-6 text-slate-300"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
