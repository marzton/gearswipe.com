import Link from "next/link";
import { Header } from "@/components/Header";
import { getAdminEmail } from "@/lib/admin-auth";
import { loadAdminModuleStatuses } from "./modules";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const email = await getAdminEmail();
  const modules = await loadAdminModuleStatuses(Boolean(email));

  return <>
    <Header />
    <main className="gs-admin-shell">
      <div className="gs-container">
        <header className="gs-page-header gs-admin-shell-header">
          <p className="gs-admin-eyebrow">Operator tooling</p>
          <h1>GearSwipe operations</h1>
          <p className="gs-page-description">Choose a focused module. Canonical facts, evidence, publishing, and commercial controls remain separate responsibilities.</p>
          <p className="gs-admin-access"><strong>Authorization:</strong> {email ? `Operator access verified for ${email}` : "Authorization required"}</p>
        </header>

        <nav className="gs-admin-module-grid" aria-label="Operator modules">
          {modules.map(({ module, status }) => (
            <Link className="gs-admin-module" href={module.href} key={module.href}>
              <div className="gs-admin-module-heading">
                <h2>{module.label}</h2>
                {module.beta ? <span className="gs-admin-beta">Beta</span> : null}
              </div>
              <p>{module.description}</p>
              <dl>
                <div><dt>Status</dt><dd><span className={`gs-admin-status gs-admin-status-${status.kind}`}>{status.label}</span></dd></div>
                <div><dt>Runtime</dt><dd>{module.dependency}</dd></div>
              </dl>
              <p className="gs-admin-status-detail">{status.detail}</p>
              <span className="gs-admin-module-action">Open module →</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  </>;
}
