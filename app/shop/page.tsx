"use client";

import Link from "next/link";

const products = [
  ["Custom PC Build", "Quote on request", "Builds"],
  ["Windows 11 Pro Key", "From $5.49", "Digital"],
  ["Antivirus Suite", "From $14.99", "Digital"],
  ["YubiKey 5 NFC", "From $25", "Security"],
  ["SSD + RAM Kit", "From $19.99", "Parts"],
  ["Meta Glasses", "From $299", "Wearables"],
];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#deded7] py-4">
          <Link href="/" className="text-sm uppercase tracking-[0.42em] text-[#7a7a74]">
            Gearswipe
          </Link>
          <div className="flex gap-2">
            <Link href="/signup" className="border border-[#deded7] px-3 py-2 text-sm">
              Sign up
            </Link>
            <Link href="/admin" className="border border-[#111111] bg-[#111111] px-3 py-2 text-sm text-white">
              Admin
            </Link>
          </div>
        </header>

        <section className="py-8">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Shop</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">The clean catalog.</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5f59]">
            Fixed-price products move directly to checkout. Custom systems open a quote
            workflow instead of pretending to have a static price.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map(([name, price, category]) => (
            <article key={name} className="border border-[#deded7] bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#7a7a74]">{category}</p>
              <h2 className="mt-3 text-xl font-medium">{name}</h2>
              <p className="mt-2 text-sm text-[#5f5f59]">Minimal product presentation and a direct buying path.</p>
              <div className="mt-4 flex items-center justify-between border-t border-[#ededeb] pt-4">
                <span className="text-2xl font-semibold">{price}</span>
                {name === "Custom PC Build" ? (
                  <Link href="/build/custom-pc" className="border border-[#111111] px-3 py-2 text-sm">
                    View
                  </Link>
                ) : (
                  <button type="button" className="border border-[#111111] px-3 py-2 text-sm">
                    View
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
