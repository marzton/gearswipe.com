import React from 'react'
import Link from 'next/link'

type HeroImageStatus =
  | 'submitted'
  | 'rights_unknown'
  | 'source_verified'
  | 'license_reviewed'
  | 'approved'
  | 'published'

type Product = {
  id: string
  sku: string
  name: string
  category: string
  price: number
  heroImageStatus: HeroImageStatus | null
  published: boolean
  vendor: string | null
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'PC-GAMING-001',
    name: 'High-End Gaming PC Build',
    category: 'pc_builds',
    price: 3500,
    heroImageStatus: 'approved',
    published: true,
    vendor: 'Dell Technologies',
  },
  {
    id: '2',
    sku: 'PC-WORKSTATION-001',
    name: 'Professional Workstation Build',
    category: 'pc_builds',
    price: 5200,
    heroImageStatus: 'approved',
    published: true,
    vendor: 'Dell Technologies',
  },
  {
    id: '3',
    sku: 'ANTI-NORTON-001',
    name: 'Norton 360 Deluxe License',
    category: 'antivirus_software',
    price: 49.99,
    heroImageStatus: 'approved',
    published: true,
    vendor: null,
  },
  {
    id: '4',
    sku: 'PC-BUDGET-001',
    name: 'Budget Gaming Build',
    category: 'pc_builds',
    price: 1800,
    heroImageStatus: 'rights_unknown',
    published: false,
    vendor: 'TechSupply Inc',
  },
  {
    id: '5',
    sku: 'ANTI-MCAFEE-001',
    name: 'McAfee Total Protection',
    category: 'antivirus_software',
    price: 39.99,
    heroImageStatus: null,
    published: false,
    vendor: null,
  },
  {
    id: '6',
    sku: 'PC-STREAMING-001',
    name: 'Content Creator Build',
    category: 'pc_builds',
    price: 4200,
    heroImageStatus: 'submitted',
    published: false,
    vendor: 'NVIDIA',
  },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-400">Manage product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
            Add Product
          </button>
        </Link>
      </div>

      {/* Products Table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">SKU</th>
              <th className="px-6 py-3 text-left font-semibold">Product Name</th>
              <th className="px-6 py-3 text-left font-semibold">Category</th>
              <th className="px-6 py-3 text-left font-semibold">Price</th>
              <th className="px-6 py-3 text-left font-semibold">Hero Image</th>
              <th className="px-6 py-3 text-left font-semibold">Published</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition">
                <td className="px-6 py-4 font-mono text-xs text-purple-400">{product.sku}</td>
                <td className="px-6 py-4 text-gray-300">{product.name}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{product.category.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 font-semibold text-gray-300">${product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {product.heroImageStatus ? (
                    <HeroImageBadge status={product.heroImageStatus} />
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      product.published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-purple-400 hover:text-purple-300 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <button className="text-gray-500 hover:text-gray-400 text-xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/50 text-sm text-gray-400">
        <p className="font-semibold text-gray-300 mb-2">Publishing Rules:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Can only publish if hero image status is &quot;approved&quot;</li>
          <li>✓ Cannot publish if hero image status is &quot;rights_unknown&quot; or &quot;submitted&quot;</li>
          <li>✓ Cannot publish if hero image is expired</li>
        </ul>
      </div>
    </div>
  )
}

function HeroImageBadge({ status }: { status: HeroImageStatus }) {
  const colors: Record<HeroImageStatus, string> = {
    submitted: 'bg-blue-500/20 text-blue-400',
    rights_unknown: 'bg-red-500/20 text-red-400',
    source_verified: 'bg-cyan-500/20 text-cyan-400',
    license_reviewed: 'bg-orange-500/20 text-orange-400',
    approved: 'bg-green-500/20 text-green-400',
    published: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
