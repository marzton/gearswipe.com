import React from 'react'
import Link from 'next/link'

// Mock vendor data
const mockVendors = [
  {
    id: '1',
    name: 'Dell Technologies',
    type: 'manufacturer',
    status: 'active',
    contact: 'John Smith',
    email: 'partners@dell.com',
    permissions: ['resell', 'advertise', 'product_images'],
    agreementEnd: new Date('2025-06-30'),
  },
  {
    id: '2',
    name: 'NVIDIA',
    type: 'manufacturer',
    status: 'active',
    contact: 'Sarah Chen',
    email: 'business@nvidia.com',
    permissions: ['resell', 'advertise', 'product_images', 'ai_data'],
    agreementEnd: new Date('2025-12-31'),
  },
  {
    id: '3',
    name: 'Corsair',
    type: 'distributor',
    status: 'active',
    contact: 'Mike Johnson',
    email: 'vendors@corsair.com',
    permissions: ['resell', 'advertise', 'pricing_feed'],
    agreementEnd: new Date('2025-09-15'),
  },
  {
    id: '4',
    name: 'AMD',
    type: 'manufacturer',
    status: 'renewal_due',
    contact: 'Lisa Wong',
    email: 'partners@amd.com',
    permissions: ['resell', 'advertise', 'product_images'],
    agreementEnd: new Date('2024-08-15'),
  },
  {
    id: '5',
    name: 'TechSupply Inc',
    type: 'wholesaler',
    status: 'negotiating',
    contact: 'Tom Brown',
    email: 'sales@techsupply.com',
    permissions: [],
    agreementEnd: null,
  },
  {
    id: '6',
    name: 'Electronics Distributor',
    type: 'distributor',
    status: 'contacted',
    contact: 'Unknown',
    email: null,
    permissions: [],
    agreementEnd: null,
  },
]

export default function VendorsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status
  const filteredVendors = statusFilter
    ? mockVendors.filter((v) => v.status === statusFilter)
    : mockVendors

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendors & Partners</h1>
          <p className="text-gray-400">Manage vendor relationships and permissions</p>
        </div>
        <Link href="/admin/vendors/new">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
            Add Vendor
          </button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton
          label="All"
          href="/admin/vendors"
          active={!statusFilter}
          count={mockVendors.length}
        />
        <FilterButton
          label="Active"
          href="/admin/vendors?status=active"
          active={statusFilter === 'active'}
          count={3}
        />
        <FilterButton
          label="Renewal Due"
          href="/admin/vendors?status=renewal_due"
          active={statusFilter === 'renewal_due'}
          count={1}
        />
        <FilterButton
          label="Negotiating"
          href="/admin/vendors?status=negotiating"
          active={statusFilter === 'negotiating'}
          count={1}
        />
        <FilterButton
          label="Contacted"
          href="/admin/vendors?status=contacted"
          active={statusFilter === 'contacted'}
          count={1}
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <Link key={vendor.id} href={`/admin/vendors/${vendor.id}`}>
            <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-900 transition cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
                  <p className="text-xs text-gray-500 uppercase">{vendor.type}</p>
                </div>
                <StatusBadge status={vendor.status} />
              </div>

              {vendor.contact && (
                <div className="mb-4 pb-4 border-b border-gray-800/50 text-sm">
                  <p className="text-gray-400 text-xs mb-1">Contact</p>
                  <p className="text-gray-300">{vendor.contact}</p>
                  {vendor.email && <p className="text-gray-500 text-xs mt-1">{vendor.email}</p>}
                </div>
              )}

              {vendor.permissions.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-800/50">
                  <p className="text-gray-400 text-xs mb-2 uppercase">Permissions</p>
                  <div className="flex gap-1 flex-wrap">
                    {vendor.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {vendor.agreementEnd && (
                <div className="text-xs text-gray-500">
                  Agreement expires {vendor.agreementEnd.toLocaleDateString()}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="border border-gray-800 rounded-lg p-12 text-center bg-gray-900/50">
          <p className="text-gray-400">No vendors found</p>
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

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    prospect: 'bg-gray-500/20 text-gray-400',
    researching: 'bg-blue-500/20 text-blue-400',
    ready_for_outreach: 'bg-cyan-500/20 text-cyan-400',
    contacted: 'bg-orange-500/20 text-orange-400',
    replied: 'bg-yellow-500/20 text-yellow-400',
    negotiating: 'bg-purple-500/20 text-purple-400',
    documents_pending: 'bg-pink-500/20 text-pink-400',
    approved: 'bg-green-500/20 text-green-400',
    active: 'bg-green-500/20 text-green-400',
    renewal_due: 'bg-red-500/20 text-red-400',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
