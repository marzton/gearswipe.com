import Link from "next/link";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
};

export function LegalLayout({ title, eyebrow, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F2F0EA] px-6 py-10 text-[#111111] sm:px-12 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/15 pb-6">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.12em] hover:text-[#FF5A1F]">
            GearSwipe
          </Link>
          <nav aria-label="Legal navigation" className="flex flex-wrap gap-4 text-sm text-[#5f5f59]">
            <Link href="/privacy" className="hover:text-[#FF5A1F]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#FF5A1F]">Terms</Link>
            <Link href="/accessibility" className="hover:text-[#FF5A1F]">Accessibility</Link>
          </nav>
        </header>
        <article className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FF5A1F]">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
          <div className="mt-10 space-y-7 text-[1rem] leading-7 text-[#34342f] [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_a]:text-[#a63817] [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </article>
        <footer className="border-t border-black/15 py-6 text-sm text-[#5f5f59]">
          <Link href="/legal" className="hover:text-[#FF5A1F]">Legal &amp; trust</Link>
        </footer>
      </div>
    </main>
  );
}
