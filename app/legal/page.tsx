import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "../legal-layout";

export const metadata: Metadata = { title: "Legal & Trust | GearSwipe" };

export default function LegalPage() {
  return (
    <LegalLayout title="Legal & Trust" eyebrow="GearSwipe">
      <p>Plain-language information about using GearSwipe and how we handle information submitted through the service.</p>
      <ul className="grid gap-4 sm:grid-cols-3">
        <li><Link href="/privacy" className="block border border-black/15 bg-white p-5 no-underline hover:border-[#FF5A1F]"><strong>Privacy</strong><br />How we handle submitted information.</Link></li>
        <li><Link href="/terms" className="block border border-black/15 bg-white p-5 no-underline hover:border-[#FF5A1F]"><strong>Terms</strong><br />Rules for using GearSwipe.</Link></li>
        <li><Link href="/accessibility" className="block border border-black/15 bg-white p-5 no-underline hover:border-[#FF5A1F]"><strong>Accessibility</strong><br />How to report a barrier.</Link></li>
      </ul>
    </LegalLayout>
  );
}
