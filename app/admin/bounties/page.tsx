import Link from "next/link";
import { adminModules, loadAdminModuleStatuses } from "../modules";

export const dynamic = "force-dynamic";

export default async function AdminBountiesPage() {
  const entries = await loadAdminModuleStatuses(true);
  const bounty = entries.find(({ module }) => module.href === "/admin/bounties");
  const definition = adminModules.find((module) => module.href === "/admin/bounties");

  return <main className="gs-admin-shell"><div className="gs-container gs-admin-bounty">
    <p className="gs-admin-eyebrow">Operator module · Beta</p>
    <h1>Bounty Hunter Beta</h1>
    <p className="gs-page-description">A bounded operator view of GearSwipe&apos;s bounty contracts. This surface does not expose moderation, precise-location, settlement, or governance controls to public discovery.</p>

    <section className="gs-admin-card">
      <h2>Module status</h2>
      <p><span className={`gs-admin-status gs-admin-status-${bounty?.status.kind ?? "error"}`}>{bounty?.status.label ?? "Status unavailable"}</span></p>
      <p>{bounty?.status.detail}</p>
      <p><strong>Runtime:</strong> {definition?.dependency}</p>
    </section>

    <section className="gs-admin-card">
      <h2>Beta boundary</h2>
      <ul>
        <li>Claims remain separate from evidence and retain provenance.</li>
        <li>Acceptance policy is versioned and locked for active hunts.</li>
        <li>Review, disputes, payouts, and sensitive location actions require explicit governance.</li>
        <li>No real-money settlement or public operator controls are enabled here.</li>
      </ul>
    </section>

    <Link href="/admin" className="gs-admin-module-action">← Back to operator modules</Link>
  </div></main>;
}
