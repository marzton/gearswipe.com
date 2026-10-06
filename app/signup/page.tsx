"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function SignupPage() {
  const [stage, setStage] = useState<"form" | "code">("form");
  const [message, setMessage] = useState("Join with email to get 100 points.");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("Sending your verification code...");

    const formData = new FormData(event.currentTarget);
    formData.set("workspace", "Gearswipe");
    const email = String(formData.get("email") ?? "");

    const response = await fetch("/api/signup", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "We could not start the signup.");
      setLoading(false);
      return;
    }

    setPendingEmail(email);
    setMessage(payload.message ?? "Check your email for a 6-digit verification code.");
    setStage("code");
    setLoading(false);
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("Verifying...");

    const response = await fetch("/api/signup/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, code }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string; pointsAwarded?: number }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.message ?? "We could not verify that code.");
      setLoading(false);
      return;
    }

    setMessage(`${payload.message ?? "Welcome aboard."} ${payload.pointsAwarded ?? 100} points ready.`);
    setStage("form");
    setCode("");
    setPendingEmail("");
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

          {stage === "form" ? (
            <form onSubmit={submitDetails} className="border border-[#deded7] bg-white p-5 sm:p-6">
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
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitCode} className="border border-[#deded7] bg-white p-5 sm:p-6">
              <p className="text-sm text-[#5f5f59]">
                We sent a 6-digit code to <strong>{pendingEmail}</strong>.
              </p>
              <label className="mt-4 grid gap-2">
                <span className="text-sm text-[#44443f]">Verification code</span>
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="border border-[#dcdcd6] px-3 py-3 text-center text-[20px] tracking-[0.5em] outline-none transition focus:border-[#111111]"
                  placeholder="000000"
                />
              </label>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="mt-5 border border-[#111111] bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626] disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify and join"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("form");
                  setCode("");
                  setMessage("Join with email to get 100 points.");
                }}
                className="mt-3 w-full border border-[#deded7] px-4 py-3 text-sm text-[#5f5f59] transition hover:border-[#111111] hover:text-[#111111]"
              >
                Use a different email
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
