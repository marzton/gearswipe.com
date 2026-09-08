import Link from "next/link";

export const metadata = {
  title: "Access restricted — GearSwipe",
  description: "The requested operator area is restricted.",
};

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section
        aria-labelledby="access-denied-title"
        className="w-full max-w-xl border border-white/15 bg-[#101720]/95 p-8 shadow-2xl sm:p-12"
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6bb6ff]">
          GearSwipe operator access
        </p>
        <h1 id="access-denied-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Access restricted
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-[#b7c2ce]">
          This area is available only to authorized GearSwipe operators. No
          changes were made.
        </p>
        <Link
          className="mt-8 inline-flex border border-[#6bb6ff] px-5 py-3 text-sm font-semibold text-[#f4f7fb] transition hover:bg-[#6bb6ff] hover:text-[#0b0f14] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6bb6ff]"
          href="/"
        >
          Return to GearSwipe
        </Link>
      </section>
    </main>
  );
}
