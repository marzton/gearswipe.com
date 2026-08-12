"use client";

import Link from "next/link";
import { StorefrontCatalog } from "../../components/storefront-catalog";
import { storeProducts } from "../../lib/store-catalog";

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#deded7] py-4">
          <Link href="/" className="text-sm uppercase tracking-[0.42em] text-[#7a7a74]">
            Gearswipe
          </Link>
          <div className="flex gap-2">
            <Link href="/cart" className="border border-[#deded7] px-3 py-2 text-sm">
              Cart
            </Link>
            <Link href="/signup" className="border border-[#deded7] px-3 py-2 text-sm">
              Sign up
            </Link>
            <Link
              href="/admin"
              className="border border-[#111111] bg-[#111111] px-3 py-2 text-sm text-white"
            >
              Admin
            </Link>
          </div>
        </header>

        <section className="py-8">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Shop</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">The clean catalog.</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5f59]">
            Fixed-price products move directly to cart checkout. Custom systems open a quote
            workflow instead of pretending to have a static price.
          </p>
        </section>

        <StorefrontCatalog
          eyebrow="Store inventory"
          title="Shop by category."
          description="Pick fixed-price items, keep custom builds in the quote lane, and move straight to checkout when you’re ready."
          products={storeProducts}
        />
      </div>
    </main>
  );
}
