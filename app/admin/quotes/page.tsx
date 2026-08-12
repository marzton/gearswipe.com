import React from 'react'
import Link from 'next/link'

// Mock quote data
const mockQuotes = [
  {
    id: '1',
    number: 'GS-2024-001',
    customer: 'John Doe',
    buildType: 'Gaming PC Build',
    price: 3500,
    status: 'awaiting_approval',
    submittedAt: new Date('2024-08-08'),
    estimatedCompletion: new Date('2024-08-25'),
  },
  {
    id: '2',
    number: 'GS-2024-002',
    customer: 'Jane Smith',
    buildType: 'Workstation Build',
    price: 5200,
    status: 'parts_sourced',
    submittedAt: new Date('2024-08-07'),
    estimatedCompletion: new Date('2024-08-22'),
  },
  {
    id: '3',
    number: 'GS-2024-003',
    customer: 'Mike Johnson',
    buildType: 'Budget Gaming Build',
    price: 1800,
    status: 'quote_ready',
    submittedAt: new Date('2024-08-06'),
    estimatedCompletion: new Date('2024-08-20'),
  },
  {
    id: '4',
    number: 'GS-2024-004',
    customer: 'Sarah Chen',
    buildType: 'CAD Workstation',
    price: 7500,
    status: 'assembly',
    submittedAt: new Date('2024-08-05'),
    estimatedCompletion: new Date('2024-08-18'),
  },
  {
    id: '5',
    number: 'GS-2024-005',
    customer: 'Tom Wilson',
    buildType: 'Streaming Build',
    price: 4200,
    status: 'payment_pending',
    submittedAt: new Date('2024-08-04'),
    estimatedCompletion: new Date('2024-08-19'),
  },
  {
    id: '6',
    number: 'GS-2024-006',
    customer: 'Lisa Anderson',
    buildType: 'Gaming PC Build',
    price: 3800,
    status: 'approved',
    submittedAt: new Date('2024-08-03'),
    estimatedCompletion: new Date('2024-08-20'),
  },
]

export default function QuotesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status
  const filteredQuotes = statusFilter
    ? mockQuotes.filter((q) => q.status === statusFilter)
    : mockQuotes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Build Quotes & Orders</h1>
          <p className="text-gray-400">Manage custom PC build requests</p>
        </div>
        <Link href="/admin/quotes/new">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
            New Quote
          </button>
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap overflow-x-auto pb-2">
        <FilterButton
          label="All"
          href="/admin/quotes"
          active={!statusFilter}
          count={mockQuotes.length}
        />
        <FilterButton
          label="Awaiting Approval"
          href="/admin/quotes?status=awaiting_approval"
          active={statusFilter === 'awaiting_approval'}
          count={1}
        />
        <FilterButton
          label="Parts Sourced"
          href="/admin/quotes?status=parts_sourced"
          active={statusFilter === 'parts_sourced'}
          count={1}
        />
        <FilterButton
          label="Quote Ready"
          href="/admin/quotes?status=quote_ready"
          active={statusFilter === 'quote_ready'}
          count={1}
        />
        <FilterButton
          label="Assembly"
          href="/admin/quotes?status=assembly"
          active={statusFilter === 'assembly'}
          count={1}
        />
        <FilterButton
          label="Payment Pending"
          href="/admin/quotes?status=payment_pending"
          active={statusFilter === 'payment_pending'}
          count={1}
        />
      </div>

      {/* Quotes Table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Quote #</th>
              <th className="px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-6 py-3 text-left font-semibold">Build Type</th>
              <th className="px-6 py-3 text-left font-semibold">Price</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Est. Completion</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition">
                <td className="px-6 py-4 font-mono text-sm text-purple-400">{quote.number}</td>
                <td className="px-6 py-4 text-gray-300">{quote.customer}</td>
                <td className="px-6 py-4 text-gray-300">{quote.buildType}</td>
                <td className="px-6 py-4 font-semibold text-gray-300">${quote.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={quote.status} />
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {quote.estimatedCompletion.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/quotes/${quote.id}`}
                    className="text-purple-400 hover:text-purple-300 text-xs font-medium"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredQuotes.length === 0 && (
        <div className="border border-gray-800 rounded-lg p-12 text-center bg-gray-900/50">
          <p className="text-gray-400">No quotes found</p>
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
        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
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
    submitted: 'bg-blue-500/20 text-blue-400',
    under_review: 'bg-orange-500/20 text-orange-400',
    parts_sourced: 'bg-cyan-500/20 text-cyan-400',
    compatibility_checked: 'bg-blue-500/20 text-blue-400',
    quote_ready: 'bg-green-500/20 text-green-400',
    awaiting_approval: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    payment_pending: 'bg-red-500/20 text-red-400',
    procurement: 'bg-purple-500/20 text-purple-400',
    assembly: 'bg-purple-500/20 text-purple-400',
    qa: 'bg-orange-500/20 text-orange-400',
    shipment: 'bg-cyan-500/20 text-cyan-400',
    completed: 'bg-green-500/20 text-green-400',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
