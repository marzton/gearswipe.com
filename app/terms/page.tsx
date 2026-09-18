import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "../legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service | GearSwipe",
  description: "Terms for using GearSwipe websites, public content, forms, and account services.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" eyebrow="Legal · Last updated September 1, 2026">
      <p>These terms apply when you access GearSwipe websites, public content, forms, rewards features, and account services. Additional terms presented for a specific purchase, promotion, or partner program control if they conflict with these website terms.</p>
      <h2>Using GearSwipe</h2>
      <p>You may use GearSwipe for lawful informational, shopping, and account purposes. Do not interfere with the service, bypass access controls, submit malicious code, impersonate another person, use another person&apos;s account, or use protected areas without authorization.</p>
      <h2>Accounts and access</h2>
      <p>Some features require a Google identity or another approved sign-in method. You are responsible for activity under your account and should promptly report suspected unauthorized use. We may limit or revoke access to protect the service or enforce these terms.</p>
      <h2>Content and product information</h2>
      <p>GearSwipe content, design, software, and original analysis are protected by applicable intellectual-property laws. Product descriptions, availability, pricing, compatibility, and promotions may change. Confirm important product details before relying on them or completing a transaction.</p>
      <h2>Third-party services</h2>
      <p>Third-party links, identity providers, sellers, and integrations are governed by their own terms and privacy practices. GearSwipe does not control their content, availability, or policies.</p>
      <h2>Availability and changes</h2>
      <p>We may update, suspend, or discontinue features. Public content and services are provided on an “as available” basis unless separate written terms say otherwise. We may update these terms by publishing a revised effective date.</p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent to <a href="mailto:admin@gearswipe.com">admin@gearswipe.com</a> or through the <Link href="/store">contact form</Link>. Do not send credentials or payment information by email.</p>
    </LegalLayout>
  );
}
