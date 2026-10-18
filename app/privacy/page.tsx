import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "../legal-layout";

export const metadata: Metadata = {
  title: "Privacy Notice | GearSwipe",
  description: "How GearSwipe handles information submitted through its website and sign-in service.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Notice" eyebrow="Legal · Last updated September 1, 2026">
      <p>This notice explains how GearSwipe handles information when you use our public website, contact forms, newsletter or rewards signups, and account sign-in.</p>
      <h2>Information we receive</h2>
      <p>We receive information you choose to provide, including your name, email address, company, message, and stated interest when you submit a contact, newsletter, or rewards form. When you sign in with Google, we receive the identity information needed to operate your session, such as your email address, display name, and account identifier.</p>
      <h2>How we use information</h2>
      <p>We use submitted information to respond to requests, administer sign-in and rewards participation, send requested communications, operate and secure the site, prevent abuse, and maintain appropriate business records. We do not use a form submission as consent to unrelated marketing. Promotional messages include an available unsubscribe method where required.</p>
      <h2>Cookies and service providers</h2>
      <p>We and our infrastructure providers may use cookies or similar storage necessary for security, sign-in sessions, and site operation. Google processes sign-in according to its own privacy practices. Hosting, database, email, and security providers may process limited information on our behalf to operate the service.</p>
      <h2>Retention and choices</h2>
      <p>We retain information only for as long as reasonably needed to provide the requested service, maintain security, resolve disputes, meet legal obligations, or keep required records. Depending on applicable law, you may have rights to request access, correction, deletion, or information about how your personal information is handled.</p>
      <h2>Security and updates</h2>
      <p>We use reasonable administrative and technical measures designed to protect information. No online service can guarantee absolute security. We may update this notice as the service or legal requirements change; the effective date above will be updated when we do.</p>
      <h2>Contact</h2>
      <p>For privacy questions, contact <a href="mailto:admin@gearswipe.com">admin@gearswipe.com</a>. Do not send passwords, API keys, payment credentials, or other secrets by email. You can also use the <Link href="/store">GearSwipe contact form</Link>.</p>
    </LegalLayout>
  );
}
