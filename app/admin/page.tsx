'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

interface DashboardStats {
  fieldTests: number;
  products: number;
  comparisons: number;
  subscribers: number;
  confirmedSubscribers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [fieldTests, products, comparisons, subscribers] = await Promise.all([
          fetch('/api/admin/field-tests').then((r) => r.json()),
          fetch('/api/admin/products').then((r) => r.json()),
          fetch('/api/admin/comparisons').then((r) => r.json()),
          fetch('/api/admin/subscribers').then((r) => r.json()),
        ]);

        const confirmedSubs = Array.isArray(subscribers)
          ? subscribers.filter((s: { confirmed?: boolean }) => s.confirmed).length
          : 0;

        setStats({
          fieldTests: Array.isArray(fieldTests) ? fieldTests.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          comparisons: Array.isArray(comparisons) ? comparisons.length : 0,
          subscribers: Array.isArray(subscribers) ? subscribers.length : 0,
          confirmedSubscribers: confirmedSubs,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
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

          {loading ? (
            <div>Loading dashboard stats...</div>
          ) : (
            <div className="gs-admin-grid">
              <section className="gs-admin-card">
                <h2>CONTENT OVERVIEW</h2>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Field Tests</span>
                  <span className="gs-stat-value">{stats?.fieldTests || 0}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Products</span>
                  <span className="gs-stat-value">{stats?.products || 0}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Comparisons</span>
                  <span className="gs-stat-value">{stats?.comparisons || 0}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Total Subscribers</span>
                  <span className="gs-stat-value">{stats?.subscribers || 0}</span>
                </div>
                <div className="gs-stat-item">
                  <span className="gs-stat-label">Confirmed Subscribers</span>
                  <span className="gs-stat-value">{stats?.confirmedSubscribers || 0}</span>
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
