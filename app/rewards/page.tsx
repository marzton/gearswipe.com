import Link from "next/link";

const tiers = [
  ["Join", "100 points", "Signup bonus for new members."],
  ["Shop", "1 point / $1", "Earn on eligible orders."],
  ["Refer", "250 points", "Rewarded when a referral converts."],
];

export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#deded7] py-4">
          <Link href="/" className="text-sm uppercase tracking-[0.42em] text-[#7a7a74]">
            Gearswipe
          </Link>
          <Link href="/signup" className="border border-[#111111] bg-[#111111] px-3 py-2 text-sm text-white">
            Join rewards
          </Link>
        </header>

        <section className="py-8">
          <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Rewards</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">Points that feel earned.</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5f59]">
            Keep the program simple: earn points when you sign up, shop, and refer.
            No clutter, no confusing badges.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {tiers.map(([title, value, copy]) => (
            <article key={title} className="border border-[#deded7] bg-white p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#7a7a74]">{title}</p>
              <h2 className="mt-3 text-3xl font-semibold">{value}</h2>
              <p className="mt-2 text-sm leading-7 text-[#5f5f59]">{copy}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
