"use client";

import { useEffect, useState } from "react";

type Article = { id: string; title: string; status: string; gsId: string | null };

export default function AdminArticles() {
  const [items, setItems] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [dek, setDek] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [gsId, setGsId] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/admin/articles").then((r) => r.ok ? r.json() : []).then(setItems);

  useEffect(() => { load(); }, []);

  async function create() {
    const response = await fetch("/api/admin/articles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, dek, heroImage, gsId, body }),
    });
    setMessage(response.ok ? "Draft created. Review before publication." : "Unable to create draft.");
    if (response.ok) {
      setTitle(""); setSlug(""); setDek(""); setHeroImage(""); setGsId(""); setBody(""); load();
    }
  }

  return <main className="gs-admin-dashboard"><div className="gs-container">
    <h1>EDITORIAL CMS</h1>
    <p className="gs-page-description">Draft object-linked articles. Publishing remains an operator decision.</p>
    <section className="gs-admin-card">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="lowercase-hyphenated-slug" />
      <input value={dek} onChange={(e) => setDek(e.target.value)} placeholder="Short standfirst (optional)" />
      <input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="Hero image path (optional; uses GearSwipe brand image)" />
      <input value={gsId} onChange={(e) => setGsId(e.target.value)} placeholder="Canonical gs_id (optional)" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Cited draft body" rows={8} />
      <button disabled={!title || !slug || !body} onClick={create}>Create draft</button><p>{message}</p>
    </section>
    <section className="gs-admin-card"><h2>DRAFT QUEUE</h2>{items.map((item) => <p key={item.id}>{item.title} · {item.status} · {item.gsId || "not linked"}</p>)}</section>
  </div></main>;
}
