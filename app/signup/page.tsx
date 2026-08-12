"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function SignupPage() {
  const [message, setMessage] = useState("Join with email to get 100 points.");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("Creating your rewards profile...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspace", "Gearswipe");

    const response = await fetch("/api/signup", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string; pointsAwarded?: number }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "We could not create the signup.");
      setLoading(false);
      return;
    }

    form.reset();
    setMessage(`${payload.message ?? "Welcome aboard."} ${payload.pointsAwarded ?? 100} points ready.`);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#fbfbf8] text-[#111111]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#deded7] py-4">
          <Link href="/" className="text-sm uppercase tracking-[0.42em] text-[#7a7a74]">
            Gearswipe
          </Link>
          <Link href="/rewards" className="border border-[#deded7] px-3 py-2 text-sm">
            Rewards
          </Link>
        </header>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#7a7a74]">Sign up</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">
              Create a clean rewards account.
            </h1>
            <p className="mt-4 text-base leading-8 text-[#5f5f59]">
              Use one simple sign-up to unlock points, checkout updates, and account
              access later.
            </p>
            <p className="mt-6 border border-[#deded7] bg-white px-4 py-3 text-sm text-[#5f5f59]">
              {message}
            </p>
          </div>

          <form onSubmit={submit} className="border border-[#deded7] bg-white p-5 sm:p-6">
            <label className="grid gap-2">
              <span className="text-sm text-[#44443f]">Name</span>
              <input
                name="name"
                required
                className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                placeholder="Your name"
              />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-[#44443f]">Email</span>
              <input
                name="email"
                type="email"
                required
                className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                placeholder="you@example.com"
              />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-[#44443f]">Primary interest</span>
              <input
                name="interest"
                className="border border-[#dcdcd6] px-3 py-3 text-[15px] outline-none transition focus:border-[#111111]"
                placeholder="Builds, keys, security, parts..."
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626] disabled:opacity-70"
            >
              {loading ? "Joining..." : "Join rewards"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
