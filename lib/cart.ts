import { findStoreProduct } from "./store-catalog";

export const CART_STORAGE_KEY = "gearswipe-cart-v1";

export type CartEntry = {
  productId: string;
  quantity: number;
};

export type CartLine = CartEntry & {
  name: string;
  category: string;
  priceLabel: string;
  priceCents: number | null;
  description: string;
  lineTotalCents: number | null;
  actionType: "buy" | "quote";
};

export type CartSummary = {
  subtotalCents: number;
  itemCount: number;
  fixedLineCount: number;
  quoteLineCount: number;
  lines: CartLine[];
};

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(99, Math.floor(quantity));
}

export function readCart(): CartEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartEntry[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        productId: String(item.productId || ""),
        quantity: normalizeQuantity(Number(item.quantity)),
      }))
      .filter((item) => item.productId);
  } catch {
    return [];
  }
}

export function writeCart(entries: CartEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent("gearswipe-cart-changed"));
}

export function addToCart(productId: string, quantity = 1) {
  const current = readCart();
  const nextQuantity = normalizeQuantity(quantity);
  const existing = current.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity = normalizeQuantity(existing.quantity + nextQuantity);
    writeCart([...current]);
    return;
  }

  writeCart([...current, { productId, quantity: nextQuantity }]);
}

export function setCartQuantity(productId: string, quantity: number) {
  const current = readCart();
  const normalized = normalizeQuantity(quantity);
  const next = current
    .map((item) => (item.productId === productId ? { ...item, quantity: normalized } : item))
    .filter(Boolean);

  writeCart(next);
}

export function removeFromCart(productId: string) {
  writeCart(readCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount(entries: CartEntry[] = readCart()) {
  return entries.reduce((sum, item) => sum + normalizeQuantity(item.quantity), 0);
}

export function summarizeCart(entries: CartEntry[]): CartSummary {
  const lines = entries
    .map((entry) => {
      const product = findStoreProduct(entry.productId);
      if (!product) return null;

      const quantity = normalizeQuantity(entry.quantity);
      const lineTotalCents =
        typeof product.priceCents === "number" ? product.priceCents * quantity : null;

      return {
        productId: product.id,
        quantity,
        name: product.name,
        category: product.category,
        priceLabel: product.priceLabel,
        priceCents: product.priceCents,
        description: product.description,
        lineTotalCents,
        actionType: product.actionType,
      } satisfies CartLine;
    })
    .filter((item): item is CartLine => item !== null);

  return {
    lines,
    itemCount: lines.reduce((sum, item) => sum + item.quantity, 0),
    fixedLineCount: lines.filter((item) => item.priceCents !== null).length,
    quoteLineCount: lines.filter((item) => item.actionType === "quote").length,
    subtotalCents: lines.reduce((sum, item) => sum + (item.lineTotalCents ?? 0), 0),
  };
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

