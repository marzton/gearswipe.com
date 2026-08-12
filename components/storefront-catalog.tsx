"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addToCart, getCartCount, readCart } from "../lib/cart";
import {
  storeCategoryOrder,
  storeProducts,
  type StoreProduct,
} from "../lib/store-catalog";

type StorefrontCatalogProps = {
  eyebrow: string;
  title: string;
  description: string;
  showCartSummary?: boolean;
  products?: ReadonlyArray<StoreProduct>;
};

export function StorefrontCatalog({
  eyebrow,
  title,
  description,
  showCartSummary = true,
  products = storeProducts,
}: StorefrontCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<(typeof storeCategoryOrder)[number]>("All");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCart = () => setCartCount(getCartCount(readCart()));
    const handleCartChange = () => syncCart();
    syncCart();
    window.addEventListener("gearswipe-cart-changed", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("gearswipe-cart-changed", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  const categories = useMemo(() => {
    const allowed = new Set(products.map((product) => product.category));
    return storeCategoryOrder.filter((category) => category === "All" || allowed.has(category));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <section className="grid gap-4 border-t border-[#deded7] py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="border border-[#deded7] bg-white p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5f59]">{description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`border px-3 py-2 text-sm transition ${
                activeCategory === category
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#deded7] bg-white text-[#111111] hover:border-[#111111]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border border-[#ededeb] bg-[#fafaf8] px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#7a7a74]">Cart</p>
            <p className="text-sm text-[#5f5f59]">{cartCount} item{cartCount === 1 ? "" : "s"} saved</p>
          </div>
          <Link
            href="/cart"
            className="border border-[#111111] bg-[#111111] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#262626]"
          >
            View cart
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <article key={product.id} className="flex h-full flex-col border border-[#deded7] bg-white p-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#ededeb] pb-3">
              <span className="border border-[#deded7] bg-[#fafaf8] px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-[#5f5f59]">
                {product.category}
              </span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#7a7a74]">
                {product.badge}
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 pt-4">
              <div>
                <h3 className="text-xl font-medium text-[#111111]">{product.name}</h3>
                <p className="mt-2 text-sm leading-7 text-[#5f5f59]">{product.description}</p>
              </div>

              <div className="flex items-end justify-between gap-3 border-t border-[#ededeb] pt-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#7a7a74]">
                    {product.actionType === "quote" ? "Pricing" : "From"}
                  </p>
                  <p className="text-2xl font-semibold text-[#111111]">{product.priceLabel}</p>
                </div>

                {product.actionType === "quote" ? (
                  <Link
                    href="/build/custom-pc"
                    className="border border-[#111111] px-3 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
                  >
                    {product.actionLabel}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product.id, 1);
                      setCartCount((current) => current + 1);
                    }}
                    className="border border-[#111111] px-3 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
                  >
                    {product.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {showCartSummary ? (
        <div className="border border-[#deded7] bg-[#fafaf8] p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Checkout lane</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
                Fixed-price items can move straight to request checkout.
              </h3>
            </div>
            <Link
              href="/cart"
              className="border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
            >
              Open cart and checkout
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
