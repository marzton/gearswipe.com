"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Footer signup on the landing page. Posts to the same /api/subscribe
 * endpoint the storefront forms use, with the same workspace field.
 */
export function FieldTestSignup() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("Saving your email...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("workspace", "Gearswipe");

    const response = await fetch("/api/subscribe", {
      method: "POST",
      body: formData,
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response?.ok || !payload?.ok) {
      setStatus("error");
      setMessage(payload?.message ?? "We could not save your subscription.");
      return;
    }

    form.reset();
    setStatus("success");
    setMessage(payload.message ?? "You're on the list.");
  }

  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8B8D8F]">
        Get the next field test
      </p>
      <form onSubmit={submit} className="mt-3 flex border border-[#111111]">
        <label className="sr-only" htmlFor="field-test-email">
          Email address
        </label>
        <input
          id="field-test-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="min-w-0 flex-1 bg-transparent px-3.5 py-3 font-mono text-xs text-[#111111] outline-none placeholder:text-[#8B8D8F]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="border border-[#111111] bg-[#111111] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#F2F0EA] transition hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-[#111111] disabled:opacity-60"
        >
          {status === "submitting" ? "..." : "Subscribe"}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 font-mono text-[11px] ${
            status === "error" ? "text-[#8a1f1f]" : "text-[#8B8D8F]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
