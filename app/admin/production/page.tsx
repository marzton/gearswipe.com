'use client';

import { type ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

type Asset = { id: string; name: string; url: string; kind: string };

/** Production desk module: local previews, server-backed research, human gate. */
export default function ProductionDeskPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [gsId, setGsId] = useState('');
  const [notice, setNotice] = useState('Add media, then request a cited research brief. Publishing is never automatic.');
  const [jobId, setJobId] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const ready = useMemo(() => ({ intake: assets.length > 0, research: Boolean(jobId), verified }), [assets, jobId, verified]);

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []).map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name, kind: file.type || 'file', url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '' }));
    setAssets((current) => [...current, ...incoming]);
    if (incoming.length) setNotice(`${incoming.length} file${incoming.length === 1 ? '' : 's'} staged locally. Nothing is uploaded by this control.`);
  }

  async function requestResearch() {
    if (!title.trim() || !query.trim()) return setNotice('Title and research question are required.');
    setNotice('Requesting cited evidence…');
    const response = await fetch('/api/admin/research/jobs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: title.trim(), query: query.trim(), gsId: gsId.trim() }) });
    const body = await response.json() as { id?: string; error?: string; state?: string };
    if (!response.ok) return setNotice(body.error ?? 'Research request failed.');
    setJobId(body.id ?? null);
    setNotice(body.state === 'needs_configuration' ? 'Job saved; AI Search is not configured for this runtime.' : 'Evidence retrieved. Review citations before drafting.');
  }

  async function approveResearch() {
    if (!jobId) return;
    const response = await fetch(`/api/admin/research/jobs/${jobId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'approve_for_draft' }) });
    setNotice(response.ok ? 'Research approved for drafting. Storefront and social publishing remain locked.' : 'Approval failed.');
    if (response.ok) setVerified(true);
  }

  return <><Header /><main className="gs-container" style={{ padding: '2rem 0 4rem' }}><p className="text-sm uppercase tracking-[0.2em] text-slate-500">Operator</p><h1>Production desk</h1><p>Object-first intake, cited research, and human verification for GearSwipe.</p><p role="status" style={{ margin: '1rem 0', padding: '0.75rem', border: '1px solid var(--gs-color-border)' }}>{notice}</p>
    <section className="gs-admin-card" style={{ marginTop: '1.5rem' }}><h2>1. Intake preview</h2><label>Choose images or scans<input type="file" multiple accept="image/*,.pdf,.tif,.tiff,.heic,.webp" onChange={addFiles} /></label><div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>{assets.map((asset) => <div key={asset.id} style={{ width: 150, border: '1px solid var(--gs-color-border)', padding: '.5rem' }}>{asset.url ? <img src={asset.url} alt={asset.name} style={{ width: '100%', height: 90, objectFit: 'cover' }} /> : <div style={{ height: 90, display: 'grid', placeItems: 'center', background: '#eee' }}>{asset.kind.toUpperCase()}</div>}<small>{asset.name}</small></div>)}</div></section>
    <section className="gs-admin-card" style={{ marginTop: '1.5rem' }}><h2>2. Cited research</h2><input placeholder="Object title" value={title} onChange={(event) => setTitle(event.target.value)} /><input placeholder="Canonical gs_id (optional)" value={gsId} onChange={(event) => setGsId(event.target.value)} /><textarea placeholder="Research question" value={query} onChange={(event) => setQuery(event.target.value)} style={{ minHeight: 100 }} /><button onClick={() => void requestResearch()}>Request evidence</button>{jobId ? <p style={{ marginTop: '.75rem' }}>Job <code>{jobId}</code> created. <Link href={`/admin/research`}>Review evidence →</Link></p> : null}</section>
    <section className="gs-admin-card" style={{ marginTop: '1.5rem' }}><h2>3. Release gate</h2><ul><li>Intake: {ready.intake ? 'ready' : 'waiting'}</li><li>Research: {ready.research ? 'ready' : 'waiting'}</li><li>Human verification: {ready.verified ? 'verified' : 'required'}</li></ul><button disabled={!jobId || verified} onClick={() => void approveResearch()}>{verified ? 'Verified for draft' : 'Record human verification'}</button><p style={{ marginTop: '.75rem' }}>No storefront listing, social post, or external publication is performed by this module.</p></section>
  </main></>;
}
