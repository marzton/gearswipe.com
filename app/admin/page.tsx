'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  type DashboardSummaryResponse,
  isDashboardSummaryResponse,
} from '@/lib/admin-dashboard';

type DashboardState =
  | { status: 'loading' }
  | { status: 'success'; summary: DashboardSummaryResponse }
  | { status: 'access-denied' }
  | { status: 'missing-binding' }
  | { status: 'upstream-failure' };

export default function AdminDashboard() {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: { Accept: 'application/json' },
        });
        const body: unknown = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 403) {
          setState({ status: 'access-denied' });
        } else if (response.status === 503 &&
          (body as { error?: { code?: string } } | null)?.error?.code === 'D1_BINDING_MISSING') {
          setState({ status: 'missing-binding' });
        } else if (!response.ok || !isDashboardSummaryResponse(body)) {
          setState({ status: 'upstream-failure' });
        } else {
          setState({ status: 'success', summary: body });
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
        setState({ status: 'upstream-failure' });
      }
    }

    loadStats();
  }, []);

  return (
    <>
      <Header />
      <div className="gs-admin-dashboard">
        <div className="gs-container">
          <header className="gs-page-header">
            <h1>ADMIN DASHBOARD</h1>
            <p className="gs-page-description">Manage all Gearswipe content and campaigns.</p>
          </header>

          {state.status === 'loading' && <div role="status">Loading dashboard stats...</div>}
          {state.status === 'access-denied' && (
            <div role="alert">Access denied. Sign in with an authorized operator account.</div>
          )}
          {state.status === 'missing-binding' && (
            <div role="alert">Dashboard storage is not configured. The D1 binding is missing.</div>
          )}
          {state.status === 'upstream-failure' && (
            <div role="alert">Dashboard statistics are temporarily unavailable. Try again later.</div>
          )}
          {state.status === 'success' && (
            <div className="gs-admin-grid">
              <section className="gs-admin-card">
                <h2>CONTENT OVERVIEW</h2>
                {state.summary.health.status === 'degraded' && (
                  <p role="alert">
                    Some modules are unavailable ({state.summary.degradedCodes.join(', ')}).
                  </p>
                )}
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Field Tests</span>
                  <span className="gs-stat-value">{state.summary.counts.fieldTests ?? 'Unavailable'}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Products</span>
                  <span className="gs-stat-value">{state.summary.counts.products ?? 'Unavailable'}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Comparisons</span>
                  <span className="gs-stat-value">{state.summary.counts.comparisons ?? 'Unavailable'}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Total Subscribers</span>
                  <span className="gs-stat-value">{state.summary.counts.subscribers ?? 'Unavailable'}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Confirmed Subscribers</span>
                  <span className="gs-stat-value">{state.summary.counts.confirmedSubscribers ?? 'Unavailable'}</span>
                </div>
              </section>

              <section className="gs-admin-card">
                <h2>MANAGEMENT</h2>
                <nav className="gs-admin-nav">
                  <Link href="/admin/field-tests" className="gs-admin-link">
                    Field Tests →
                  </Link>
                  <Link href="/admin/products" className="gs-admin-link">
                    Products →
                  </Link>
                  <Link href="/admin/comparisons" className="gs-admin-link">
                    Comparisons →
                  </Link>
                  <Link href="/admin/subscribers" className="gs-admin-link">
                    Subscribers →
                  </Link>
                  <Link href="/admin/campaigns" className="gs-admin-link">
                    Email Campaigns →
                  </Link>
                  <Link href="/admin/research" className="gs-admin-link">
                    Research Workspace →
                  </Link>
                  <Link href="/admin/production" className="gs-admin-link">
                    Production Desk →
                  </Link>
                  <Link href="/admin/articles" className="gs-admin-link">
                    Editorial CMS →
                  </Link>
                </nav>
              </section>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .gs-admin-dashboard {
          min-height: 100vh;
          padding: var(--gs-space-8) 0;
          background-color: var(--gs-color-bg);
        }

        .gs-admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--gs-space-6);
          margin-top: var(--gs-space-8);
        }

        .gs-admin-card {
          padding: var(--gs-space-6);
          border: 1px solid var(--gs-color-border);
          background: white;
        }

        .gs-admin-card h2 {
          font-size: var(--gs-font-size-lg);
          margin-bottom: var(--gs-space-4);
          text-transform: uppercase;
          letter-spacing: var(--gs-letter-spacing-wide);
        }

        .gs-stat-item {
          display: flex;
          justify-content: space-between;
          padding: var(--gs-space-2) 0;
          border-bottom: 1px solid var(--gs-color-border-light);
        }

        .gs-stat-item:last-child {
          border-bottom: none;
        }

        .gs-stat-label {
          font-size: var(--gs-font-size-sm);
          color: var(--gs-color-text-secondary);
        }

        .gs-stat-value {
          font-size: var(--gs-font-size-md);
          font-weight: 600;
          color: var(--gs-color-primary);
        }

        .gs-admin-nav {
          display: flex;
          flex-direction: column;
          gap: var(--gs-space-3);
        }

        .gs-admin-link {
          padding: var(--gs-space-3);
          text-decoration: none;
          color: var(--gs-color-primary);
          border: 1px solid var(--gs-color-border);
          transition: all 0.2s;
        }

        .gs-admin-link:hover {
          background-color: var(--gs-color-bg);
          border-color: var(--gs-color-primary);
        }
      `}</style>
    </>
  );
}
