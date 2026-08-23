/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { resolveMailRoute } from "../lib/mail-routing";
import { sendAutoReply } from "../lib/email-service";
import { storeMailSubmission } from "../lib/mail-store";

export { GearSwipeProductResearchWorkflow } from "./workflows/product-research";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  EMAIL?: {
    send(input: {
      to: string | string[];
      from: { email: string; name?: string };
      subject: string;
      text: string;
      html: string;
      replyTo?: string;
      headers?: Record<string, string>;
    }): Promise<unknown>;
  };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

// Baseline security headers applied to every response at the edge.
//
// HSTS is deliberately in "safe mode": a one-day max-age with no
// includeSubDomains and no preload. Browsers cache HSTS, so a long or
// preloaded policy cannot be undone by shipping a fix — it has to expire.
// Raise to 31536000 with preload only once every hostname on the domain,
// including any future api. subdomain, is confirmed HTTPS-only.
//
// Content-Security-Policy is intentionally NOT set here. A CSP strict enough
// to be worth having would need testing against React hydration and any
// Shopify/analytics scripts added later; shipping one blind would risk
// breaking the storefront. Add it deliberately, behind a preview deploy.
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=86400",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function withSecurityHeaders(response: Response): Response {
  // WebSocket upgrades (101) carry no body and cannot be reconstructed.
  if (response.status === 101 || (response as Response & { webSocket?: unknown }).webSocket) {
    return response;
  }

  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    // Never clobber a header the app set deliberately.
    if (!headers.has(name)) headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    (globalThis as typeof globalThis & { __GEARSWIPE_ENV__?: Env }).__GEARSWIPE_ENV__ = env;
    const url = new URL(request.url);

    try {
      if (url.pathname === "/_vinext/image") {
        const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
        const imageResponse = await handleImageOptimization(request, {
          fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
            return result.response();
          },
        }, allowedWidths);
        return withSecurityHeaders(imageResponse);
      }

      return withSecurityHeaders(await handler.fetch(request, env, ctx));
    } catch (error) {
      // Without this, anything thrown here reaches the client as Cloudflare
      // error 1101 -- an opaque page with no way to tell what broke. Log the
      // cause so `wrangler tail` still shows it, and answer with a status the
      // caller can actually act on.
      console.error(`Unhandled error serving ${url.pathname}:`, error);

      return withSecurityHeaders(
        Response.json({ error: "Service temporarily unavailable" }, { status: 503 }),
      );
    }
  },

  async email(message: {
    from: string;
    to: string;
    headers: Headers;
    raw: ReadableStream<Uint8Array>;
  }, env: Env, ctx: ExecutionContext): Promise<void> {
    (globalThis as typeof globalThis & { __GEARSWIPE_ENV__?: Env }).__GEARSWIPE_ENV__ = env;

    const route = resolveMailRoute(
      message.to.includes("goldshore") ? "Gold Shore" : "Gearswipe",
      message.to.includes("quote")
        ? "quote"
        : message.to.includes("subscribe")
          ? "subscribe"
          : message.to.includes("access") || message.to.includes("admin")
            ? "auth"
            : "contact",
    );

    const rawText = await new Response(message.raw).text();
    const subject = message.headers.get("subject") || "";
    const extractedSubject =
      rawText.match(/^Subject:\s*(.*)$/im)?.[1]?.trim() || subject;
    const extractedReplyTo =
      rawText.match(/^Reply-To:\s*(.*)$/im)?.[1]?.trim() || message.from;

    await storeMailSubmission({
      workspace: route.workspace,
      formType: route.formType,
      name: "",
      email: extractedReplyTo,
      company: "",
      subject: extractedSubject,
      message: rawText.slice(0, 8000),
    }).catch(() => null);

    if (env.EMAIL) {
      await sendAutoReply({
        to: message.from,
        from: route.from,
        subject: `Re: ${extractedSubject || "Your message"}`,
        workspace: route.workspace,
        body:
          `Thanks — we received your ${route.formType} message for ${route.workspace}.\n\n` +
          `We’ve logged it and routed it to the right inbox.\n\n` +
          `Route: ${route.alias} → ${route.to.join(", ")}`,
      }).catch(() => null);
    }

    ctx.waitUntil(Promise.resolve());
  },
};

export default worker;
