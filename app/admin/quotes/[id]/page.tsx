import React from 'react'
import Link from 'next/link'

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mock quote data - replace with actual database query
  const quote = {
    id,
    number: 'GS-2024-001',
    status: 'awaiting_approval',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
    },
    buildType: 'Gaming PC Build',
    submittedAt: new Date('2024-08-08'),
    requirements: {
      budget: 3500,
      cpuPreference: 'Intel',
      gpuPreference: 'NVIDIA RTX 4080',
      workload: 'gaming',
      aesthetic: 'RGB gaming',
      storage: '1TB NVMe SSD + 2TB HDD',
      ram: '32GB DDR5',
      monitorIncluded: true,
      existingComponents: 'Has mouse and keyboard',
      notes: 'Wants high FPS at 1440p for competitive gaming',
    },
    bom: [
      { part: 'Intel i9-13900K', qty: 1, cost: 589, subtotal: 589 },
      { part: 'NVIDIA RTX 4080', qty: 1, cost: 1199, subtotal: 1199 },
      { part: 'MSI Z790 Motherboard', qty: 1, cost: 349, subtotal: 349 },
      { part: 'Corsair 32GB DDR5 RAM', qty: 1, cost: 189, subtotal: 189 },
      { part: 'Samsung 980 Pro 1TB NVMe', qty: 1, cost: 129, subtotal: 129 },
      { part: 'Seagate 2TB HDD', qty: 1, cost: 49, subtotal: 49 },
      { part: 'NZXT Kraken AIO Cooler', qty: 1, cost: 159, subtotal: 159 },
      { part: 'Corsair 850W PSU', qty: 1, cost: 149, subtotal: 149 },
      { part: 'NZXT H7 Flow Case', qty: 1, cost: 139, subtotal: 139 },
      { part: 'LG 27" 1440p 144Hz Monitor', qty: 1, cost: 349, subtotal: 349 },
    ],
    pricing: {
      estimatedCost: 3751,
      quotedPrice: 4299,
      margin: 14.6,
    },
    assignedTo: 'robert@gearswipe.com',
    milestones: {
      assemblyStart: null,
      qaCompleted: null,
      shipped: null,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/quotes" className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block">
            ← Back to Quotes
          </Link>
          <h1 className="text-3xl font-bold">Quote {quote.number}</h1>
        </div>
        <StatusIndicator status={quote.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Name</p>
                <p className="text-gray-300 font-medium">{quote.customer.name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Email</p>
                <p className="text-gray-300 font-medium">{quote.customer.email}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Phone</p>
                <p className="text-gray-300 font-medium">{quote.customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Submitted</p>
                <p className="text-gray-300 font-medium">{quote.submittedAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Requirements</h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Budget" value={`$${quote.requirements.budget.toLocaleString()}`} />
                <InfoItem label="CPU Preference" value={quote.requirements.cpuPreference} />
                <InfoItem label="GPU Preference" value={quote.requirements.gpuPreference} />
                <InfoItem label="Workload" value={quote.requirements.workload} />
                <InfoItem label="Aesthetic" value={quote.requirements.aesthetic} />
                <InfoItem label="Monitor Included" value={quote.requirements.monitorIncluded ? 'Yes' : 'No'} />
              </div>
              <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-400 mb-2">Additional Notes</p>
                <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{quote.requirements.notes}</p>
              </div>
            </div>
          </div>

          {/* Bill of Materials */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Bill of Materials</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-400">Part</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-400">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-400">Cost</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-400">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.bom.map((item, i) => (
                    <tr key={i} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                      <td className="px-3 py-2 text-gray-300">{item.part}</td>
                      <td className="px-3 py-2 text-right text-gray-400">{item.qty}</td>
                      <td className="px-3 py-2 text-right text-gray-400">${item.cost}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-300">${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 text-right text-sm">
              <p className="text-gray-400">
                Estimated Cost: <span className="text-gray-300 font-semibold">${quote.pricing.estimatedCost}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Pricing Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Cost:</span>
                <span className="font-medium">${quote.pricing.estimatedCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-800">
                <span className="text-gray-400">Quoted Price:</span>
                <span className="text-lg font-bold text-purple-400">${quote.pricing.quotedPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Margin:</span>
                <span className="text-green-400 font-semibold">{quote.pricing.margin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Status Workflow */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Workflow</h3>
            <div className="space-y-2 text-sm">
              <WorkflowStep status="submitted" label="Submitted" active={true} completed={true} />
              <WorkflowStep status="under_review" label="Under Review" active={true} completed={false} />
              <WorkflowStep status="parts_sourced" label="Parts Sourced" active={false} completed={false} />
              <WorkflowStep status="quote_ready" label="Quote Ready" active={false} completed={false} />
              <WorkflowStep status="awaiting_approval" label="Awaiting Approval" active={false} completed={false} />
              <WorkflowStep status="approved" label="Approved" active={false} completed={false} />
              <WorkflowStep status="assembly" label="Assembly" active={false} completed={false} />
              <WorkflowStep status="qa" label="QA Testing" active={false} completed={false} />
              <WorkflowStep status="shipment" label="Shipment" active={false} completed={false} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition">
                Approve Quote
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                Start Assembly
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
                Send to Customer
              </button>
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                Add Notes
              </button>
            </div>
          </div>

          {/* Assignment */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Assignment</h3>
            <div className="text-sm">
              <p className="text-gray-400 mb-2">Assigned To</p>
              <p className="text-gray-300 bg-gray-800/50 px-3 py-2 rounded">{quote.assignedTo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 mb-1 text-xs uppercase">{label}</p>
      <p className="text-gray-300 font-medium">{value}</p>
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    submitted: 'bg-blue-500/20 text-blue-400',
    under_review: 'bg-orange-500/20 text-orange-400',
    awaiting_approval: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    assembly: 'bg-purple-500/20 text-purple-400',
    completed: 'bg-green-500/20 text-green-400',
  }

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function WorkflowStep({
  status,
  label,
  active,
  completed,
}: {
  status: string
  label: string
  active: boolean
  completed?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded transition ${active ? 'bg-purple-600/30 border border-purple-500' : 'text-gray-500'}`}>
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          completed
            ? 'bg-green-500 border-green-500'
            : active
              ? 'border-purple-400 bg-purple-500'
              : 'border-gray-600'
        }`}
      >
        {completed && <span className="text-white text-xs">✓</span>}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  )
}
