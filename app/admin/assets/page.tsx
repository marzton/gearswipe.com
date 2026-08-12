import React from 'react'
import Link from 'next/link'

// Mock data - replace with actual database queries
const mockAssets = [
  {
    id: '1',
    type: 'hero_render',
    source: 'ai_generated',
    status: 'submitted',
    product: 'PC Build - Gaming',
    createdAt: new Date('2024-08-08'),
    reviewer: null,
  },
  {
    id: '2',
    type: 'product_photo',
    source: 'vendor',
    status: 'rights_unknown',
    product: 'AMD Ryzen CPU',
    createdAt: new Date('2024-08-07'),
    reviewer: null,
  },
  {
    id: '3',
    type: 'internal_build',
    source: 'original',
    status: 'license_reviewed',
    product: 'Custom PC Build',
    createdAt: new Date('2024-08-06'),
    reviewer: 'admin@gearswipe.com',
  },
  {
    id: '4',
    type: 'brand_asset',
    source: 'manufacturer',
    status: 'approved',
    product: 'NVIDIA GPU',
    createdAt: new Date('2024-08-05'),
    reviewer: 'admin@gearswipe.com',
  },
  {
    id: '5',
    type: 'product_photo',
    source: 'customer',
    status: 'published',
    product: 'Customer Build Photo',
    createdAt: new Date('2024-08-04'),
    reviewer: 'admin@gearswipe.com',
  },
]

export default function AssetsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status
  const filteredAssets = statusFilter
    ? mockAssets.filter((a) => a.status === statusFilter)
    : mockAssets

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Product Assets</h1>
        <p className="text-gray-400">Manage product images and licensing</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton
          label="All"
          href="/admin/assets"
          active={!statusFilter}
        />
        <FilterButton
          label="Submitted"
          href="/admin/assets?status=submitted"
          active={statusFilter === 'submitted'}
          count={1}
        />
        <FilterButton
          label="Rights Unknown"
          href="/admin/assets?status=rights_unknown"
          active={statusFilter === 'rights_unknown'}
          count={1}
        />
        <FilterButton
          label="License Reviewed"
          href="/admin/assets?status=license_reviewed"
          active={statusFilter === 'license_reviewed'}
          count={1}
        />
        <FilterButton
          label="Approved"
          href="/admin/assets?status=approved"
          active={statusFilter === 'approved'}
          count={1}
        />
        <FilterButton
          label="Published"
          href="/admin/assets?status=published"
          active={statusFilter === 'published'}
          count={1}
        />
      </div>

      {/* Assets Table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Asset</th>
              <th className="px-6 py-3 text-left font-semibold">Type</th>
              <th className="px-6 py-3 text-left font-semibold">Source</th>
              <th className="px-6 py-3 text-left font-semibold">Product</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-xs">
                    IMG
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300 capitalize">{asset.type.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-6 py-4">
                  <SourceBadge source={asset.source} />
                </td>
                <td className="px-6 py-4 text-gray-300">{asset.product}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={asset.status} />
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/assets/${asset.id}`}
                    className="text-purple-400 hover:text-purple-300 text-xs font-medium"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAssets.length === 0 && (
        <div className="border border-gray-800 rounded-lg p-12 text-center bg-gray-900/50">
          <p className="text-gray-400">No assets found</p>
        </div>
      )}
    </div>
  )
}

function FilterButton({
  label,
  href,
  active,
  count,
}: {
  label: string
  href: string
  active: boolean
  count?: number
}) {
  return (
    <Link href={href}>
      <button
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          active
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        {label}
        {count !== undefined && <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">{count}</span>}
      </button>
    </Link>
  )
}

function SourceBadge({ source }: { source: string }) {
  const colors: { [key: string]: string } = {
    original: 'bg-green-500/20 text-green-400',
    vendor: 'bg-blue-500/20 text-blue-400',
    manufacturer: 'bg-purple-500/20 text-purple-400',
    stock: 'bg-orange-500/20 text-orange-400',
    ai_generated: 'bg-pink-500/20 text-pink-400',
    customer: 'bg-cyan-500/20 text-cyan-400',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[source] || 'bg-gray-800 text-gray-400'}`}>
      {source.replace(/_/g, ' ')}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    submitted: 'bg-blue-500/20 text-blue-400',
    rights_unknown: 'bg-yellow-500/20 text-yellow-400',
    source_verified: 'bg-cyan-500/20 text-cyan-400',
    license_reviewed: 'bg-orange-500/20 text-orange-400',
    approved: 'bg-green-500/20 text-green-400',
    published: 'bg-purple-500/20 text-purple-400',
    expiring: 'bg-red-500/20 text-red-400',
    archived: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
