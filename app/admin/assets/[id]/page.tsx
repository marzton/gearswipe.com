import React from 'react'
import Link from 'next/link'

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mock data - replace with actual database query
  const asset = {
    id,
    type: 'hero_render',
    source: 'ai_generated',
    status: 'submitted',
    product: 'PC Build - Gaming',
    creator: 'AI System',
    acquisitionDate: new Date('2024-08-08'),
    licenseType: 'proprietary',
    attributionRequired: false,
    linkedProducts: ['Gaming PC Build', 'Streaming PC Build'],
    generatedDislosure: 'Concept configuration shown — final components and appearance may vary',
    allowedUses: ['commercial', 'resale', 'marketing'],
    expirationDate: new Date('2025-08-08'),
    statusReason: null,
    approvalNotes: '',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/assets" className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block">
            ← Back to Assets
          </Link>
          <h1 className="text-3xl font-bold">Asset Review</h1>
        </div>
        <StatusIndicator status={asset.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Preview */}
          <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50">
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Image Preview</p>
                <p className="text-gray-600 text-xs mt-1">[Asset image would display here]</p>
              </div>
            </div>
          </div>

          {/* Asset Details */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Asset Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailRow label="Type" value={asset.type.replace(/_/g, ' ')} />
              <DetailRow label="Source" value={asset.source.replace(/_/g, ' ')} />
              <DetailRow label="Created" value={asset.acquisitionDate.toLocaleDateString()} />
              <DetailRow label="Creator" value={asset.creator} />
              <DetailRow label="License Type" value={asset.licenseType} />
              <DetailRow label="Attribution Required" value={asset.attributionRequired ? 'Yes' : 'No'} />
            </div>
          </div>

          {/* Licensing Information */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Licensing</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400 mb-2">Allowed Uses</p>
                <div className="flex gap-2 flex-wrap">
                  {asset.allowedUses.map((use) => (
                    <span key={use} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Expiration Date</p>
                <p className="text-gray-300">{asset.expirationDate?.toLocaleDateString()}</p>
              </div>
              {asset.generatedDislosure && (
                <div>
                  <p className="text-gray-400 mb-2">Generated Content Notice</p>
                  <p className="text-gray-300 bg-gray-800/50 p-3 rounded border-l-2 border-pink-500">
                    {asset.generatedDislosure}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linked Products */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Linked Products</h2>
            <div className="space-y-2">
              {asset.linkedProducts.map((product) => (
                <div key={product} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                  <span className="text-sm">{product}</span>
                  <span className="text-xs text-gray-500">Can be hero image</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Approval */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition">
                Approve Asset
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition">
                Needs Review
              </button>
              <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition">
                Reject
              </button>
            </div>
          </div>

          {/* Status Workflow */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Approval Workflow</h3>
            <div className="space-y-3 text-sm">
              <WorkflowStep status="submitted" label="Submitted" active={true} />
              <WorkflowStep status="rights_unknown" label="Rights Unknown" active={false} />
              <WorkflowStep status="source_verified" label="Source Verified" active={false} />
              <WorkflowStep status="license_reviewed" label="License Reviewed" active={false} />
              <WorkflowStep status="approved" label="Approved" active={false} />
              <WorkflowStep status="published" label="Published" active={false} />
            </div>
          </div>

          {/* Approval Notes */}
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="font-semibold mb-4">Approval Notes</h3>
            <textarea
              placeholder="Add notes about this asset's licensing..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              rows={4}
              defaultValue={asset.approvalNotes}
            />
            <button className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-gray-300 font-medium">{value}</p>
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    submitted: 'bg-blue-500/20 text-blue-400',
    rights_unknown: 'bg-yellow-500/20 text-yellow-400',
    source_verified: 'bg-cyan-500/20 text-cyan-400',
    license_reviewed: 'bg-orange-500/20 text-orange-400',
    approved: 'bg-green-500/20 text-green-400',
    published: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function WorkflowStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded ${active ? 'bg-purple-600/30 border border-purple-500' : 'text-gray-500'}`}>
      <div className={`w-4 h-4 rounded-full border-2 ${active ? 'border-purple-400 bg-purple-500' : 'border-gray-600'}`} />
      <span className="text-xs">{label}</span>
    </div>
  )
}
