'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="gs-site-header">
      <div className="gs-container gs-site-header-inner">
        <Link href="/" className="gs-site-brand" aria-label="GearSwipe home">
          GEARSWIPE
        </Link>
        <nav className="gs-site-nav" aria-label="Primary navigation">
          <Link href="/store">Store</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/field-tests">Field Tests</Link>
        </nav>
      </div>
      <style jsx>{`
        .gs-site-header {
          border-bottom: 1px solid var(--gs-color-border, #e5e7eb);
          background: var(--gs-color-bg, #fff);
        }
        .gs-site-header-inner {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .gs-site-brand {
          color: inherit;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-decoration: none;
        }
        .gs-site-nav {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .gs-site-nav :global(a) {
          color: inherit;
          text-decoration: none;
          font-size: 0.875rem;
        }
      `}</style>
    </header>
  );
}
