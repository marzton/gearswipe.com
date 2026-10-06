"use client";

import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0b0f14] text-[#f4f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-0 overflow-hidden border border-[#263246] bg-[#10161f] shadow-[0_30px_100px_rgba(0,0,0,0.35)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[260px] border-b border-[#263246] bg-[#0b0f14] lg:min-h-full lg:border-b-0 lg:border-r">
            <Image
              src="/brand/gearswipe-cart-logo.svg"
              alt="Gearswipe cart logo"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
              Admin access
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Sign in to Gearswipe
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#b4c0cf]">
              Admin access is gated by Cloudflare Access. If you landed here instead of on the
              Access sign-in prompt, your account has not been granted access yet — request it
              from the GearSwipe operator.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/"
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Back to storefront
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-[#263246] pt-5 text-sm leading-6 text-[#9aa9bb]">
              Access is managed through the same Cloudflare Access team as goldshore.ai. If your
              account is not approved, request access from the GearSwipe operator.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
