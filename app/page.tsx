import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { FieldTestSignup } from "../components/field-test-signup";

// Scoped to this route rather than the root layout: the rest of the site still
// runs on Space Grotesk / Inter, and these three would otherwise preload on
// every page that does not use them.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GearSwipe — Quality survives the swipe.",
  description:
    "We find products worth owning, test what marketing doesn't, and revisit them after the hype is gone.",
};

const display = "font-[family-name:var(--font-oswald)]";
const body = "font-[family-name:var(--font-plex-sans)]";
const mono = "font-[family-name:var(--font-plex-mono)]";

const LINE = "border-[rgba(17,17,17,0.14)]";

const PRIMARY_BUTTON =
  `${mono} border border-[#111111] bg-[#111111] px-6 py-4 text-xs font-semibold uppercase tracking-[0.09em] ` +
  "text-[#F2F0EA] transition hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-[#111111]";

const SECONDARY_BUTTON =
  `${mono} border border-[#111111] px-6 py-4 text-xs font-semibold uppercase tracking-[0.09em] ` +
  "text-[#111111] transition hover:border-[#FF5A1F] hover:text-[#FF5A1F]";

/** Diagonal-hatched placeholder standing in for unshot product photography. */
function Plate({
  gradient,
  className,
  figure,
  caption,
}: {
  gradient: string;
  className?: string;
  figure: string;
  caption?: string;
}) {
  const style: CSSProperties = {
    backgroundImage:
      "repeating-linear-gradient(135deg, rgba(17,17,17,.05) 0px, rgba(17,17,17,.05) 1px, transparent 1px, transparent 13px), " +
      gradient,
  };

  return (
    <div
      style={style}
      className={`relative border ${LINE} transition group-hover:saturate-[1.15] ${className ?? ""}`}
    >
      <span
        className={`${mono} absolute left-4 top-4 bg-[#F2F0EA] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#FF5A1F]`}
      >
        {figure}
      </span>
      {caption ? (
        <span
          className={`${mono} absolute bottom-4 left-4 bg-[#F2F0EA] px-2 py-1 text-[10px] uppercase tracking-[0.06em] text-[#111111]`}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}

function Eyebrow({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "orange";
}) {
  return (
    <p
      className={`${mono} text-[11px] font-semibold uppercase tracking-[0.12em] ${
        tone === "orange" ? "text-[#FF5A1F]" : "text-[#8B8D8F]"
      }`}
    >
      {children}
    </p>
  );
}

function Rule() {
  return <div className="h-px bg-[rgba(17,17,17,0.14)]" />;
}

function SpecRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-[#F2F0EA] px-5 py-3.5">
      <span
        className={`${mono} text-[10px] uppercase tracking-[0.1em] text-[#8B8D8F]`}
      >
        {label}
      </span>
      <span className={`${mono} text-xs text-[#111111]`}>{value}</span>
    </div>
  );
}

const SHORTLIST = [
  { rank: "01", name: "Black Voyage", kind: "Field test", href: "#black-voyage", pending: false },
  { rank: "02", name: "AirVault", kind: "Comparison", href: "#airvault", pending: false },
  { rank: "03", name: "[ Value pick — TBD ]", kind: "Value pick", href: "#value-pick", pending: true },
  { rank: "04", name: "[ Long term — TBD ]", kind: "Long term", href: "#long-term", pending: true },
];

const CATEGORIES = [
  { title: "Carry", copy: "Backpacks, luggage, briefcases, wallets.", figure: "Fig. 02", href: "#carry", gradient: "linear-gradient(165deg, #E1DCCC 0%, #C3BCA8 100%)" },
  { title: "Wear", copy: "Outerwear, shoes, technical clothing.", figure: "Fig. 03", href: "#wear", gradient: "linear-gradient(165deg, #D8D2C2 0%, #B0A996 100%)" },
  { title: "Tools", copy: "Hand tools, EDC, workshop gear.", figure: "Fig. 04", href: "#tools", gradient: "linear-gradient(165deg, #CFC9B8 0%, #A29B87 100%)" },
  { title: "Home", copy: "Cookware, cutlery, furniture, appliances.", figure: "Fig. 05", href: "#home", gradient: "linear-gradient(165deg, #E4DFD1 0%, #C8C1AC 100%)" },
  { title: "Tech", copy: "Hardware and accessories where build quality matters.", figure: "Fig. 06", href: "#tech", gradient: "linear-gradient(165deg, #D2CCBC 0%, #A8A18C 100%)" },
  { title: "Travel", copy: "Adapters, chargers, packing systems, rain gear.", figure: "Fig. 07", href: "#travel", gradient: "linear-gradient(165deg, #DDD7C9 0%, #B9B29D 100%)" },
];

const METHOD_STEPS = [
  "Research",
  "Buy / Source",
  "Inspect",
  "Use",
  "Abuse",
  "Contact the company",
  "Revisit",
];

const FOOTER_LINKS = [
  { label: "Field Tests", href: "#field-tests" },
  { label: "Compare", href: "#compare" },
  { label: "Worth Owning", href: "#worth-owning" },
  { label: "Heritage", href: "#still-here" },
  { label: "Under the Surface", href: "#under-the-surface" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function HomePage() {
  return (
    <main
      className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable} ${body} min-h-screen bg-[#F2F0EA] text-[#111111]`}
    >
      <header
        className={`flex items-center justify-between border-b ${LINE} px-6 py-6 sm:px-12`}
      >
        <span
          className={`${display} text-[22px] font-bold uppercase tracking-[-0.01em]`}
        >
          GearSwipe
        </span>
        <nav
          className={`${mono} flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.1em] sm:gap-x-8`}
        >
          <a className="transition hover:text-[#FF5A1F]" href="#search">Search</a>
          <a className="transition hover:text-[#FF5A1F]" href="#field-tests">Field Tests</a>
          <a className="transition hover:text-[#FF5A1F]" href="#compare">Compare</a>
          <Link className="transition hover:text-[#FF5A1F]" href="/blog">Journal</Link>
          <Link className="transition hover:text-[#FF5A1F]" href="/shop">Shop</Link>
        </nav>
      </header>

      <section className="px-6 pt-16 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <h1
            className={`${display} max-w-[920px] text-5xl font-bold uppercase leading-[0.95] tracking-[-0.01em] sm:text-7xl lg:text-[92px]`}
          >
            Quality survives the swipe.
          </h1>
          <p className="mt-7 max-w-[540px] text-[19px] leading-[1.65]">
            We find products worth owning, test what marketing doesn&apos;t, and
            revisit them after the hype is gone.
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <a href="#field-tests" className={PRIMARY_BUTTON}>Explore field tests</a>
            <a href="#methodology" className={SECONDARY_BUTTON}>How we test</a>
          </div>

          <Plate
            className="mt-16 h-[360px] sm:h-[560px]"
            gradient="linear-gradient(165deg, #DAD5C8 0%, #B6B0A0 55%, #96917F 100%)"
            figure="Fig. 01"
            caption="Construction detail — Black Voyage Zephyr 60L"
          />
        </div>
      </section>

      <div className="mt-16">
        <Rule />
      </div>

      <section id="field-tests" className="px-6 py-16 sm:px-12">
        <div className="mx-auto grid max-w-[1240px] items-start gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.65fr)] lg:gap-16">
          <div>
            <Eyebrow tone="orange">Current field test — Europe / 2026</Eyebrow>
            <h2
              className={`${display} mt-4 max-w-[640px] text-3xl font-bold uppercase leading-[1.05] tracking-[-0.005em] sm:text-[44px]`}
            >
              One bag. Four cities. Which vacuum backpack actually holds up?
            </h2>
            <p className="mt-5 max-w-[56ch] text-base leading-[1.65]">
              Three bags, one route, real conditions — the ones marketing
              photography never shows you.
            </p>
            <div className={`${mono} mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs`}>
              <span>Black Voyage</span>
              <span className="text-[#8B8D8F]">·</span>
              <span>AirVault</span>
              <span className="text-[#8B8D8F]">·</span>
              <span>Commodity Amazon alternative</span>
            </div>
            <p className={`${mono} mt-5 text-xs uppercase tracking-[0.04em] text-[#8B8D8F]`}>
              Barcelona → Ibiza → Paris → Dublin
            </p>
            <a href="#field-tests" className={`${PRIMARY_BUTTON} mt-7 inline-block`}>
              Follow the test
            </a>
          </div>

          <div className="border border-[#111111] bg-[#F2F0EA]">
            <div className={`border-b ${LINE} px-5 py-4`}>
              <p className={`${mono} text-[11px] uppercase tracking-[0.1em] text-[#8B8D8F]`}>
                Field test
              </p>
              <p className={`${display} mt-0.5 text-lg font-semibold uppercase tracking-[0.01em]`}>
                GS-0018
              </p>
            </div>
            <div className="grid gap-px bg-[rgba(17,17,17,0.14)]">
              <SpecRow
                label="Status"
                value={
                  <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.08em] text-[#FF5A1F]">
                    <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#FF5A1F]" />
                    In progress
                  </span>
                }
              />
              <SpecRow label="Route" value="BCN · IBZ · PAR · DUB" />
              <SpecRow label="Day" value="6 / 14" />
              <SpecRow label="Contenders" value="3" />
              <SpecRow label="Failures logged" value="0" />
            </div>
          </div>
        </div>
      </section>

      <Rule />

      <section id="compare" className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow>The shortlist</Eyebrow>
          <div className={`mt-6 border-t ${LINE}`}>
            {SHORTLIST.map((item) => (
              <a
                key={item.rank}
                href={item.href}
                className={`group flex items-center gap-6 border-b ${LINE} px-1 py-5 transition hover:bg-[rgba(17,17,17,0.045)]`}
              >
                <span className={`${mono} w-7 flex-none text-[13px] text-[#FF5A1F]`}>
                  {item.rank}
                </span>
                <span
                  className={`${display} flex-1 text-[22px] font-semibold uppercase tracking-[-0.005em] ${
                    item.pending ? "text-[#8B8D8F]" : "text-[#111111]"
                  }`}
                >
                  {item.name}
                </span>
                <span
                  className={`${mono} hidden text-[11px] uppercase tracking-[0.08em] text-[#8B8D8F] sm:block`}
                >
                  {item.kind}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Rule />

      <section id="worth-owning" className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <Eyebrow>Worth owning</Eyebrow>
            <p className="max-w-[30ch] text-sm leading-[1.5] text-[#8B8D8F] sm:text-right">
              Not sponsored placement.
              <br />
              Products we would actually buy.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <a key={category.title} href={category.href} className="group block">
                <Plate className="h-[200px]" gradient={category.gradient} figure={category.figure} />
                <p
                  className={`${display} mt-3.5 text-base font-semibold uppercase tracking-[0.02em] transition group-hover:text-[#FF5A1F]`}
                >
                  {category.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-[1.5] text-[#8B8D8F]">
                  {category.copy}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Rule />

      <section
        id="under-the-surface"
        className="bg-[rgba(17,17,17,0.045)] px-6 py-16 sm:px-12"
      >
        <div className="mx-auto grid max-w-[1240px] items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.5fr)] lg:gap-12">
          <div>
            <Eyebrow tone="orange">Under the surface</Eyebrow>
            <h2
              className={`${display} mt-4 max-w-[680px] text-3xl font-bold uppercase leading-[1.08] tracking-[-0.005em] sm:text-[40px]`}
            >
              Why a $200 bag costs $200 — and when it shouldn&apos;t.
            </h2>
            <p className="mt-5 max-w-[60ch] text-[15px] leading-[1.65]">
              YKK vs. generic zippers. Cordura vs. ballistic nylon. Full-grain vs.
              corrected leather. The manufacturing decisions that actually
              determine whether something lasts.
            </p>
            <p className={`${mono} mt-6 text-[11px] uppercase tracking-[0.04em] text-[#8B8D8F]`}>
              Materials <span className="text-[rgba(17,17,17,0.14)]">/</span> Stitching{" "}
              <span className="text-[rgba(17,17,17,0.14)]">/</span> Hardware{" "}
              <span className="text-[rgba(17,17,17,0.14)]">/</span> Warranty{" "}
              <span className="text-[rgba(17,17,17,0.14)]">/</span> Manufacturing
            </p>
          </div>
          <div className="lg:justify-self-end">
            <a href="#under-the-surface" className={`${PRIMARY_BUTTON} inline-block`}>
              Read
            </a>
          </div>
        </div>
      </section>

      <Rule />

      <section id="still-here" className="px-6 py-16 sm:px-12">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <Plate
            className="h-[300px] sm:h-[420px]"
            gradient="linear-gradient(165deg, #C7C0AC 0%, #8F8873 60%, #6E6858 100%)"
            figure="Fig. 08"
            caption="Worn edge detail — 1987 leather briefcase"
          />
          <div>
            <Eyebrow>Still here</Eyebrow>
            <p className="mt-4 max-w-[44ch] text-base leading-[1.65]">
              Objects our families bought decades ago that haven&apos;t needed
              replacing.
            </p>
            <h2
              className={`${display} mt-5 max-w-[520px] text-3xl font-bold uppercase leading-[1.08] tracking-[-0.005em] sm:text-[40px]`}
            >
              The briefcase that outlived its owner.
            </h2>
            <a href="#still-here" className={`${SECONDARY_BUTTON} mt-7 inline-block`}>
              Read the story
            </a>
          </div>
        </div>
      </section>

      <Rule />

      <section id="methodology" className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <Eyebrow tone="orange">Methodology</Eyebrow>
          <h2
            className={`${display} mt-4 max-w-[680px] text-3xl font-bold uppercase tracking-[-0.005em] sm:text-[40px]`}
          >
            We don&apos;t score products after opening the box.
          </h2>

          <div
            className={`mt-10 grid gap-px border ${LINE} bg-[rgba(17,17,17,0.14)] sm:grid-cols-2 lg:grid-cols-4`}
          >
            {METHOD_STEPS.map((step, index) => (
              <div key={step} className="bg-[#F2F0EA] px-5 py-6">
                <span className={`${mono} block text-[13px] text-[#FF5A1F]`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`${display} mt-2 block text-base font-semibold uppercase`}
                >
                  {step}
                </span>
              </div>
            ))}
            <div className="flex items-center bg-[rgba(17,17,17,0.045)] px-5 py-6">
              <a
                href="#review-policy"
                className={`${mono} text-[11px] font-semibold uppercase tracking-[0.08em] transition hover:text-[#FF5A1F]`}
              >
                Our review policy →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Rule />

      <footer className="px-6 pb-10 pt-14 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <div
            className={`grid items-start gap-12 border-b ${LINE} pb-9 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.5fr)]`}
          >
            <div>
              <p className={`${display} text-xl font-bold uppercase tracking-[-0.01em]`}>
                GearSwipe
              </p>
              <p className="mt-3 max-w-[42ch] text-sm leading-[1.6] text-[#8B8D8F]">
                Find it. Test it. Keep what lasts.
              </p>
            </div>
            <FieldTestSignup />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div
              className={`${mono} flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.06em]`}
            >
              {FOOTER_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="transition hover:text-[#FF5A1F]">
                  {link.label}
                </a>
              ))}
            </div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.06em] text-[#8B8D8F]`}>
              © GearSwipe — Quality survives the swipe.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
