import Image from "next/image";

export const metadata = {
  title: "Signing in — Gearswipe",
  description: "Authentication handoff for Gearswipe access.",
};

export default function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect_uri?: string };
}) {
  const error = searchParams.error;
  const redirect = searchParams.redirect_uri || "/admin";

  return (
    <main className="min-h-screen bg-[#0b0f14] text-[#f4f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full border border-[#263246] bg-[#10161f] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="overflow-hidden border border-[#263246] bg-[#0b0f14]">
              <Image
                src="/brand/gearswipe-cart-logo.jpg"
                alt="Gearswipe cart logo"
                width={1200}
                height={1200}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Authentication
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                {error ? "Sign-in failed." : "Finishing your login."}
              </h1>
              <p className="mt-4 text-lg leading-8 text-[#b4c0cf]">
                {error
                  ? `The provider returned ${error}. You can retry the admin flow or go back to the storefront.`
                  : `Your session is being finalized. Redirecting you to ${redirect}.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={error ? "/login" : redirect}
                  className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-3 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
                >
                  {error ? "Try again" : "Continue"}
                </a>
                <a
                  href="/"
                  className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
                >
                  Back to storefront
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
