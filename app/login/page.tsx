import Image from "next/image";

export const metadata = {
  title: "Login — Gearswipe",
  description: "Continue into the Gearswipe admin and access workflow.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0b0f14] text-[#f4f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 border border-[#263246] bg-[#10161f] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <div className="overflow-hidden border border-[#263246] bg-[#0b0f14]">
            <Image
              src="/brand/gearswipe-logo-dark.jpg"
              alt="Gearswipe logo"
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#8191a5]">
                Identity
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                Continue into Gearswipe.
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[#b4c0cf]">
                Use the admin path for operations, inventory, and store controls.
                The access route stays separate from the public storefront.
              </p>
            </div>

            <div className="grid gap-3">
              <a
                href="/admin"
                className="border border-[#6bb6ff] bg-[#6bb6ff] px-4 py-3 text-sm font-medium text-[#081018] transition hover:bg-[#89c7ff]"
              >
                Continue to admin
              </a>
              <a
                href="/api/mail?workspace=Gearswipe"
                className="border border-[#263246] bg-[#0f141c] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                View mail routing
              </a>
              <a
                href="/"
                className="border border-[#263246] px-4 py-3 text-sm font-medium text-[#dbe4ee] transition hover:border-[#6bb6ff] hover:text-white"
              >
                Back to storefront
              </a>
            </div>

            <div className="grid gap-3 border-t border-[#263246] pt-5 text-sm text-[#9aa9bb] sm:grid-cols-3">
              <div>
                <p className="text-white">Support</p>
                <p className="mt-1">support@gearswipe.com</p>
              </div>
              <div>
                <p className="text-white">Access</p>
                <p className="mt-1">access@gearswipe.com</p>
              </div>
              <div>
                <p className="text-white">Updates</p>
                <p className="mt-1">updates@gearswipe.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
