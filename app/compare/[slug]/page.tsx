'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';

interface ComparisonProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  verdict: string;
  price?: number;
  currency?: string;
  materials?: string;
  construction?: string;
  warranty?: string;
  heroImage?: string;
  [key: string]: any;
}

interface ComparisonData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  products: ComparisonProduct[];
  categories: string[];
  pick?: string;
  pickReason?: string;
}

export default function ComparisonDetailPage({ params }: { params: { slug: string } }) {
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadComparison() {
      try {
        const comparisonsRes = await fetch('/api/comparisons?limit=100');
        const comparisons = await comparisonsRes.json();
        const comp = comparisons.find((c: any) => c.slug === params.slug);

        if (!comp) {
          setError('Comparison not found');
          setLoading(false);
          return;
        }

        const detailRes = await fetch(`/api/comparisons/${comp.id}`);
        if (!detailRes.ok) throw new Error('Failed to load comparison');
        const data = await detailRes.json();
        setComparison(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison');
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [params.slug]);

  if (loading) return <div>Loading comparison...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!comparison) return <div>Comparison not found</div>;

  return (
    <>
      <Header />
      <article className="gs-comparison-detail">
        <div className="gs-container">
          <header className="gs-article-header">
            <h1 className="gs-article-title">{comparison.title}</h1>
            <p className="gs-article-description">{comparison.description}</p>
          </header>

          {comparison.content && (
            <section className="gs-section">
              <div dangerouslySetInnerHTML={{ __html: comparison.content }} />
            </section>
          )}

          <section className="gs-section gs-comparison-table">
            <h2 className="gs-section-label">SIDE-BY-SIDE COMPARISON</h2>
            <div className="gs-comparison-grid">
              <div className="gs-comparison-col gs-comparison-header">
                <h3>CATEGORY</h3>
              </div>
              {comparison.products.map((product) => (
                <div key={product.id} className="gs-comparison-col gs-comparison-product-header">
                  <h3>{product.brand}</h3>
                  <p className="gs-product-name">{product.name}</p>
                  {product.heroImage && (
                    <div className="gs-comparison-product-image">
                      <Image
                        src={product.heroImage}
                        alt={`${product.brand} ${product.name}`}
                        fill
                        className="gs-img"
                      />
                    </div>
                  )}
                </div>
              ))}

              {comparison.categories.map((category) => (
                <div key={category}>
                  <div className="gs-comparison-col gs-comparison-category">
                    <strong>{category}</strong>
                  </div>
                  {comparison.products.map((product) => (
                    <div key={`${product.id}-${category}`} className="gs-comparison-col">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: product[category.toLowerCase().replace(/ /g, '_')] || '—',
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {comparison.pick && (
            <section className="gs-section gs-comparison-pick">
              <h2 className="gs-section-label">GEARSWIPE PICK</h2>
              {comparison.products
                .filter((p) => p.id === comparison.pick)
                .map((product) => (
                  <div key={product.id} className="gs-pick-card">
                    <h3>{product.brand} {product.name}</h3>
                    <p className="gs-pick-reason">{comparison.pickReason}</p>
                  </div>
                ))}
            </section>
          )}

          <footer className="gs-article-footer">
            <Link href="/compare" className="gs-btn gs-btn-secondary">
              ← BACK TO COMPARISONS
            </Link>
          </footer>
        </div>
      </article>

      <style jsx>{`
        .gs-comparison-detail {
          padding: var(--gs-space-8) 0;
          background-color: var(--gs-color-bg);
        }

        .gs-comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--gs-space-3);
          border: 1px solid var(--gs-color-border);
          background: white;
        }

        .gs-comparison-col {
          padding: var(--gs-space-4);
          border-right: 1px solid var(--gs-color-border);
        }

        .gs-comparison-col:last-child {
          border-right: none;
        }

        .gs-comparison-header {
          background: var(--gs-color-primary);
          color: white;
          font-weight: 600;
        }

        .gs-comparison-product-header {
          text-align: center;
          border-top: 2px solid var(--gs-color-primary);
        }

        .gs-product-name {
          font-size: var(--gs-font-size-sm);
          color: var(--gs-color-text-secondary);
          margin-top: var(--gs-space-2);
        }

        .gs-comparison-product-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          margin-top: var(--gs-space-3);
        }

        .gs-comparison-category {
          background: var(--gs-color-bg);
          border-top: 1px solid var(--gs-color-border);
        }

        .gs-pick-card {
          padding: var(--gs-space-6);
          border: 1px solid var(--gs-color-border);
          background: white;
        }

        .gs-pick-reason {
          margin: var(--gs-space-3) 0;
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
