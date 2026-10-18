"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset?: (id?: string) => void } }
}

const SITEKEY = "0x4AAAAAAEkVpaq3YNYtRhMY";

export function TurnstileField({ action }: { action: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const render = () => {
      if (container.current && window.turnstile && !container.current.dataset.rendered) {
        window.turnstile.render(container.current, { sitekey: SITEKEY, action });
        container.current.dataset.rendered = "1";
      }
    };
    render();
    const script = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    if (!script) {
      const element = document.createElement("script");
      element.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      element.async = true;
      element.defer = true;
      element.addEventListener("load", render);
      document.head.appendChild(element);
    } else script.addEventListener("load", render);
  }, [action]);
  return <div ref={container} className="mt-4" aria-label="Bot verification" />;
}
