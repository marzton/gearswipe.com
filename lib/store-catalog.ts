export type StoreProductAction = "buy" | "quote";

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  priceLabel: string;
  priceCents: number | null;
  description: string;
  actionLabel: string;
  actionType: StoreProductAction;
  badge: string;
};

export const storeProducts: StoreProduct[] = [
  {
    id: "custom-pc-build",
    name: "Custom PC Build",
    category: "Configured systems",
    priceLabel: "Quote on request",
    priceCents: null,
    description:
      "Choose gaming, CAD, or workstation intent and we’ll turn it into a clean build path with compatibility checks.",
    actionLabel: "Request a build quote",
    actionType: "quote",
    badge: "Build",
  },
  {
    id: "windows-11-pro-key",
    name: "Windows 11 Pro Key",
    category: "Digital delivery",
    priceLabel: "From $5.49",
    priceCents: 549,
    description:
      "Fast digital activation with a checkout path that stays out of your way.",
    actionLabel: "Add to cart",
    actionType: "buy",
    badge: "Instant",
  },
  {
    id: "antivirus-suite",
    name: "Antivirus Suite",
    category: "Digital delivery",
    priceLabel: "From $14.99",
    priceCents: 1499,
    description:
      "Simple protection products for customers who want setup without friction.",
    actionLabel: "Add to cart",
    actionType: "buy",
    badge: "Protected",
  },
  {
    id: "yubikey-5-nfc",
    name: "YubiKey 5 NFC",
    category: "Security hardware",
    priceLabel: "From $25",
    priceCents: 2500,
    description:
      "Authentication hardware for sign-ins, admin access, and device trust.",
    actionLabel: "Add to cart",
    actionType: "buy",
    badge: "Secure",
  },
  {
    id: "ssd-ram-kit",
    name: "SSD + RAM Kit",
    category: "Parts & upgrades",
    priceLabel: "From $19.99",
    priceCents: 1999,
    description:
      "A restrained catalog lane for useful upgrades, not a crowded parts warehouse.",
    actionLabel: "Add to cart",
    actionType: "buy",
    badge: "Upgrade",
  },
  {
    id: "meta-glasses",
    name: "Meta Glasses",
    category: "Consumer tech",
    priceLabel: "From $299",
    priceCents: 29900,
    description:
      "Premium connected gear that sits comfortably beside the core store mix.",
    actionLabel: "Add to cart",
    actionType: "buy",
    badge: "Featured",
  },
] as const;

export const storeCollections = [
  {
    title: "Fixed-price inventory",
    copy:
      "Standard products move through normal add-to-cart checkout with clear pricing and quick delivery.",
  },
  {
    title: "Configured products",
    copy:
      "Custom PC builds and quoted bundles move through inquiry, review, and approval instead of a fake price tag.",
  },
  {
    title: "Rights-aware assets",
    copy:
      "Every image, spec sheet, and vendor asset can be tied to provenance, permissions, and expiry.",
  },
] as const;

export const storeTrustPoints = [
  {
    title: "Minimal, professional layout",
    copy:
      "Clean type, straight borders, and a restrained cadence that reads like a serious retail brand.",
  },
  {
    title: "Mobile-first structure",
    copy:
      "The same system collapses cleanly on smaller screens without cramming the page.",
  },
  {
    title: "Fast path to action",
    copy: "Shop, quote, sign up, or log in without wandering through unnecessary pages.",
  },
] as const;

export const storeCategoryOrder = [
  "All",
  ...new Set(storeProducts.map((product) => product.category)),
] as const;

export function findStoreProduct(productId: string) {
  return storeProducts.find((product) => product.id === productId) ?? null;
}

