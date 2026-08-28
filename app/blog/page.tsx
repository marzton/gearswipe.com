"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Article = { id: string; title: string; slug: string; dek: string | null; heroImage: string | null; gsId: string | null; publishedAt: string | null };

export default function BlogPage() {
  const [items, setItems] = useState<Article[]>([]);
  useEffect(() => { fetch("/api/articles").then((r) => r.ok ? r.json() : []).then(setItems).catch(() => setItems([])); }, []);
  return <main className="min-h-screen bg-[#F2F0EA] px-6 py-12 text-[#111111] sm:px-12">
    <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[#111111] pb-6">
      <Link href="/" className="text-xl font-bold uppercase">GearSwipe</Link><Link href="/admin" className="text-xs font-semibold uppercase tracking-widest">Operator</Link>
    </header>
    <section className="mx-auto max-w-6xl py-14"><p className="text-xs font-semibold uppercase tracking-widest text-[#FF5A1F]">Journal</p><h1 className="mt-4 max-w-3xl text-5xl font-bold uppercase leading-none sm:text-7xl">Objects, evidence, and what survives use.</h1></section>
    <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">{items.length ? items.map((article) => <article key={article.id} className="border border-[#111111] bg-white"><Image src={article.heroImage || "/brand/gearswipe-logo-dark.jpg"} alt={article.title} width={1200} height={675} className="aspect-[16/9] w-full object-cover" /><div className="p-6"><p className="text-xs uppercase tracking-widest text-[#FF5A1F]">{article.gsId || "Editorial"}</p><h2 className="mt-3 text-3xl font-bold uppercase"><Link href={`/blog/${article.slug}`} className="hover:text-[#FF5A1F]">{article.title}</Link></h2><p className="mt-3 leading-7 text-[#555]">{article.dek}</p></div></article>) : <p className="border border-dashed border-[#777] p-8 text-[#555]">No published articles yet. Operators can prepare the first cited draft in Admin.</p>}</section>
  </main>;
}
