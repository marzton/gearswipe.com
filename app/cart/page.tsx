"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  clearCart,
  formatMoney,
  getCartCount,
  readCart,
  removeFromCart,
  setCartQuantity,
  summarizeCart,
} from "../../lib/cart";

export default function CartPage() {
  const [cartEntries, setCartEntries] = useState(() => readCart());
  const [message, setMessage] = useState("Review your items and request checkout.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncCart = () => setCartEntries(readCart());
    const handleCartChange = () => syncCart();
    syncCart();
    window.addEventListener("gearswipe-cart-changed", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("gearswipe-cart-changed", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  const summary = useMemo(() => summarizeCart(cartEntries), [cartEntries]);

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("Sending your checkout request...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("cart", JSON.stringify(summary.lines));
    formData.set("workspace", "Gearswipe");

    const response = await fetch("/api/checkout", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "We could not send the request.");
      setLoading(false);
      return;
    }

    form.reset();
    clearCart();
    setCartEntries([]);
    setMessage(payload.message ?? "Checkout request sent.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#deded7] py-4">
          <Link href="/" className="text-sm uppercase tracking-[0.42em] text-[#7a7a74]">
            Gearswipe
          </Link>
          <Link href="/shop" className="border border-[#deded7] px-3 py-2 text-sm">
            Shop
          </Link>
        </header>

        <section className="grid gap-6 py-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Cart</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">
              Review your Gearswipe order.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5f59]">
              Fixed-price products can move through a clean request checkout. Quote items
              stay visible so custom builds can be handled separately.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#7a7a74]">Items</p>
                <p className="mt-2 text-2xl font-semibold">{getCartCount(cartEntries)}</p>
              </div>
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#7a7a74]">Subtotal</p>
                <p className="mt-2 text-2xl font-semibold">{formatMoney(summary.subtotalCents)}</p>
              </div>
            </div>
          </div>

          <div className="border border-[#deded7] bg-white p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Status</p>
            <p className="mt-2 border border-[#deded7] bg-[#fafaf8] px-4 py-3 text-sm text-[#5f5f59]">
              {message}
            </p>
            <div className="mt-4 space-y-3">
              {summary.lines.length === 0 ? (
                <p className="text-sm leading-7 text-[#5f5f59]">
                  Your cart is empty. Add a few items from the shop first.
                </p>
              ) : (
                summary.lines.map((line) => (
                  <article key={line.productId} className="border border-[#deded7] bg-[#fafaf8] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-medium text-[#111111]">{line.name}</p>
                        <p className="mt-1 text-sm text-[#5f5f59]">{line.category}</p>
                      </div>
                      <p className="text-sm font-medium text-[#111111]">
                        {line.lineTotalCents === null ? line.priceLabel : formatMoney(line.lineTotalCents)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCartQuantity(line.productId, line.quantity - 1);
                          setCartEntries(readCart());
                        }}
                        className="border border-[#deded7] px-3 py-2 text-sm"
                      >
                        -
                      </button>
                      <span className="min-w-10 text-sm text-[#5f5f59]">Qty {line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCartQuantity(line.productId, line.quantity + 1);
                          setCartEntries(readCart());
                        }}
                        className="border border-[#deded7] px-3 py-2 text-sm"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(line.productId);
                          setCartEntries(readCart());
                        }}
                        className="border border-[#111111] px-3 py-2 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-[#deded7] py-8 lg:grid-cols-[1fr_0.95fr]">
          <form onSubmit={submitCheckout} className="border border-[#deded7] bg-white p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Checkout request</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
              Send your cart to Gearswipe
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#5f5f59]">
              This queues a purchase review and hands the cart to the store team.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-[#44443f]">Name</span>
                <input
                  name="name"
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
                  required
                  className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-sm text-[#44443f]">Notes</span>
              <textarea
                name="message"
                rows={5}
                className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                placeholder="Shipping details, timing, build questions..."
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || summary.lines.length === 0}
                className="border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626] disabled:opacity-70"
              >
                {loading ? "Sending..." : "Request checkout"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setCartEntries([]);
                }}
                className="border border-[#deded7] px-4 py-3 text-sm"
              >
                Empty cart
              </button>
            </div>
          </form>

          <aside className="border border-[#deded7] bg-[#fafaf8] p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Summary</p>
            <div className="mt-4 space-y-3">
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-sm text-[#5f5f59]">Fixed-price items</p>
                <p className="mt-2 text-xl font-semibold text-[#111111]">{summary.fixedLineCount}</p>
              </div>
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-sm text-[#5f5f59]">Quote items</p>
                <p className="mt-2 text-xl font-semibold text-[#111111]">{summary.quoteLineCount}</p>
              </div>
              <div className="border border-[#deded7] bg-white p-4">
                <p className="text-sm text-[#5f5f59]">Subtotal</p>
                <p className="mt-2 text-xl font-semibold text-[#111111]">{formatMoney(summary.subtotalCents)}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
