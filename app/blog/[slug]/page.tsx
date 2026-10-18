"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Article = { title: string; dek: string | null; body: string; heroImage: string | null; gsId: string | null };

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [state, setState] = useState<"loading" | "missing" | "ready">("loading");

  useEffect(() => {
    fetch(`/api/articles/${encodeURIComponent(params.slug)}`).then(async (response) => {
      if (!response.ok) { setState("missing"); return; }
      setArticle(await response.json()); setState("ready");
    }).catch(() => setState("missing"));
  }, [params.slug]);

  if (state === "loading") return <main className="min-h-screen bg-[#F2F0EA] p-12">Loading journal entry…</main>;
  if (!article) return <main className="min-h-screen bg-[#F2F0EA] p-12"><Link href="/blog">← Back to Journal</Link><p className="mt-8">This entry is unavailable.</p></main>;

  return <article className="min-h-screen bg-[#F2F0EA] px-6 py-12 text-[#111111] sm:px-12">
    <header className="mx-auto max-w-4xl"><Link href="/blog" className="text-xs font-semibold uppercase tracking-widest text-[#FF5A1F]">← Journal</Link>
      <p className="mt-10 text-xs font-semibold uppercase tracking-widest">{article.gsId || "Editorial"}</p><h1 className="mt-4 text-5xl font-bold uppercase leading-none sm:text-7xl">{article.title}</h1>{article.dek && <p className="mt-6 max-w-3xl text-xl leading-8 text-[#555]">{article.dek}</p>}</header>
    <Image src={article.heroImage || "/brand/gearswipe-logo-dark.svg"} alt={article.title} width={1600} height={900} className="mx-auto mt-12 aspect-video max-w-4xl object-cover" />
    <div className="mx-auto max-w-3xl whitespace-pre-wrap py-12 text-lg leading-8">{article.body}</div>
  </article>;
}
