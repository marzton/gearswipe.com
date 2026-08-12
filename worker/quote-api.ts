/**
 * Quote API Worker — standalone service at api.gearswipe.com
 *
 * Handles quote requests, calculations, and integrations with external services.
 * Separates the API layer from the storefront for independent scaling and deployment.
 */

interface Env {
  DB?: D1Database;
  SHOPIFY_STOREFRONT_TOKEN?: string;
  SHOPIFY_STORE_URL?: string;
}

interface QuoteRequest {
  productIds: string[];
  quantities: number[];
  shippingAddress?: {
    country: string;
    state?: string;
    postal_code?: string;
  };
}

interface QuoteResponse {
  id: string;
  timestamp: string;
  items: Array<{
    product_id: string;
    quantity: number;
    base_price: number;
    extended_price: number;
  }>;
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  currency: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://gearswipe.com",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // POST /quote — calculate quote from request
    if (url.pathname === "/quote" && request.method === "POST") {
      return handleQuoteRequest(request, env);
    }

    // GET /quote/:id — retrieve previously submitted quote
    if (url.pathname.match(/^\/quote\/[a-f0-9-]+$/) && request.method === "GET") {
      return handleGetQuote(request, env);
    }

    // GET /health — liveness check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};

async function handleQuoteRequest(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as QuoteRequest;

    if (!body.productIds || body.productIds.length === 0) {
      return jsonResponse({ error: "productIds required" }, 400);
    }

    if (!body.quantities || body.quantities.length !== body.productIds.length) {
      return jsonResponse({ error: "quantities must match productIds length" }, 400);
    }

    // Fetch product data from Shopify
    const products = await fetchProductsFromShopify(body.productIds, env);

    // Calculate quote
    const quote = calculateQuote(products, body.quantities, body.shippingAddress);

    // Store quote in D1 if available
    if (env.DB) {
      await storeQuote(env.DB, quote);
    }

    return jsonResponse(quote);
  } catch (error) {
    console.error("Quote calculation error:", error);
    return jsonResponse({ error: "Failed to calculate quote" }, 500);
  }
}

async function handleGetQuote(request: Request, env: Env): Promise<Response> {
  const quoteId = new URL(request.url).pathname.split("/").pop();

  if (!env.DB || !quoteId) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  try {
    const stmt = env.DB.prepare("SELECT * FROM quotes WHERE id = ?");
    const quote = await stmt.bind(quoteId).first<QuoteResponse>();

    if (!quote) {
      return jsonResponse({ error: "Quote not found" }, 404);
    }

    return jsonResponse(quote);
  } catch (error) {
    console.error("Quote retrieval error:", error);
    return jsonResponse({ error: "Failed to retrieve quote" }, 500);
  }
}

function calculateQuote(
  products: Array<{ id: string; title: string; price: number }>,
  quantities: number[],
  shippingAddress?: QuoteRequest["shippingAddress"]
): QuoteResponse {
  const items = products.map((product, index) => ({
    product_id: product.id,
    quantity: quantities[index],
    base_price: product.price,
    extended_price: product.price * quantities[index],
  }));

  const subtotal = items.reduce((sum, item) => sum + item.extended_price, 0);

  // Tax estimation (simplified; integrate real tax engine if needed)
  const tax = shippingAddress ? subtotal * 0.08 : 0;

  // Shipping (simplified; integrate real shipping calculator if needed)
  const shipping = subtotal > 500 ? 0 : 25;

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    items,
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    currency: "USD",
  };
}

async function fetchProductsFromShopify(
  productIds: string[],
  env: Env
): Promise<Array<{ id: string; title: string; price: number }>> {
  if (!env.SHOPIFY_STOREFRONT_TOKEN || !env.SHOPIFY_STORE_URL) {
    throw new Error("Shopify credentials not configured");
  }

  // Placeholder: In production, query Shopify Storefront API
  // This would fetch product details (price, availability) from Shopify
  return productIds.map((id, index) => ({
    id,
    title: `Product ${id}`,
    price: 100 + index * 50,
  }));
}

async function storeQuote(db: D1Database, quote: QuoteResponse): Promise<void> {
  const stmt = db.prepare(
    `INSERT INTO quotes (id, timestamp, data) VALUES (?, ?, ?)`
  );
  await stmt.bind(quote.id, quote.timestamp, JSON.stringify(quote)).run();
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://gearswipe.com",
    },
  });
}
