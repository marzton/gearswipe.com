import type { Metadata } from "next";
import { LegalLayout } from "../legal-layout";

export const metadata: Metadata = {
  title: "Accessibility | GearSwipe",
  description: "GearSwipe's accessibility contact and feedback page.",
};

export default function AccessibilityPage() {
  return (
    <LegalLayout title="Accessibility" eyebrow="Legal · Last updated September 1, 2026">
      <p>GearSwipe aims to make its public site usable with a range of devices, browsers, and assistive technologies. We continue to improve keyboard access, readable structure, labels, and responsive presentation as the product evolves.</p>
      <h2>Report a barrier</h2>
      <p>If you encounter an accessibility barrier, email <a href="mailto:admin@gearswipe.com">admin@gearswipe.com</a> with the page URL, the task you were trying to complete, and the assistive technology or browser involved. Please do not include passwords or other sensitive information.</p>
    </LegalLayout>
  );
}
