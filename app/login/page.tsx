"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLoginHint } from "@/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const candidate = searchParams.get("next") || "/admin";
    return candidate.startsWith("/") ? candidate : "/admin";
  }, [searchParams]);
  const [email, setEmail] = useState(adminLoginHint.email);
  const [password, setPassword] = useState(adminLoginHint.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: nextPath,
    });

    if (result?.error) {
      setError("That username or password did not work.");
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-[#f4f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-0 overflow-hidden border border-[#263246] bg-[#10161f] shadow-[0_30px_100px_rgba(0,0,0,0.35)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[260px] border-b border-[#263246] bg-[#0b0f14] lg:min-h-full lg:border-b-0 lg:border-r">
            <Image
              src="/brand/gearswipe-cart-logo.jpg"
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
              Use the standard admin login to access products, vendor licensing, outreach,
              and store operations. No external provider setup is required.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-[#dbe4ee]">Username</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#64768c] focus:border-[#6bb6ff]"
                  autoComplete="email"
                  placeholder="admin@gearswipe.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[#dbe4ee]">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#64768c] focus:border-[#6bb6ff]"
                  autoComplete="current-password"
                  placeholder="gearswipe-admin"
                />
              </label>

              {error ? (
                <p className="border border-[#7f2b2b] bg-[#201013] px-4 py-3 text-sm text-[#ffb6b6]">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-3 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <Link
                  href="/"
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Back to storefront
                </Link>
              </div>
            </form>

            <div className="mt-8 border-t border-[#263246] pt-5 text-sm leading-6 text-[#9aa9bb]">
              <p>
                Local fallback login: <span className="text-[#e8eef6]">admin@gearswipe.com</span> /{" "}
                <span className="text-[#e8eef6]">gearswipe-admin</span>
              </p>
              <p className="mt-1">
                You can change the credentials later with environment variables, but you do
                not need to wire anything up right now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
