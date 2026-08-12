import React from 'react'
import Link from 'next/link'

export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Marketplace operations overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Pending Assets" value="12" href="/admin/assets?status=submitted" />
        <MetricCard label="Active Vendors" value="8" href="/admin/vendors?status=active" />
        <MetricCard label="Open Quotes" value="24" href="/admin/quotes?status=under_review" />
        <MetricCard label="Products" value="156" href="/admin/products" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-4">Recent Asset Submissions</h2>
          <div className="space-y-3">
            <ActivityItem
              title="PC Build Hero Image"
              status="submitted"
              timestamp="2 hours ago"
            />
            <ActivityItem
              title="AMD CPU Product Photo"
              status="rights_unknown"
              timestamp="4 hours ago"
            />
            <ActivityItem
              title="Custom Build Render"
              status="license_reviewed"
              timestamp="6 hours ago"
            />
            <ActivityItem
              title="Storage Component Image"
              status="approved"
              timestamp="1 day ago"
            />
          </div>
          <Link
            href="/admin/assets"
            className="text-sm text-purple-400 hover:text-purple-300 mt-4 inline-block"
          >
            View all assets →
          </Link>
        </div>

        <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-4">Recent Quote Activity</h2>
          <div className="space-y-3">
            <ActivityItem
              title="High-End Gaming Build - $3,500"
              status="awaiting_approval"
              timestamp="30 mins ago"
            />
            <ActivityItem
              title="Workstation Build - $5,200"
              status="parts_sourced"
              timestamp="2 hours ago"
            />
            <ActivityItem
              title="Budget Gaming Build - $1,800"
              status="quote_ready"
              timestamp="3 hours ago"
            />
            <ActivityItem
              title="CAD Workstation - $7,500"
              status="assembly"
              timestamp="1 day ago"
            />
          </div>
          <Link
            href="/admin/quotes"
            className="text-sm text-purple-400 hover:text-purple-300 mt-4 inline-block"
          >
            View all quotes →
          </Link>
        </div>
      </div>

      {/* Vendor Pipeline */}
      <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
        <h2 className="text-lg font-semibold mb-4">Vendor Pipeline Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-center">
          <PipelineStage stage="Prospects" count={12} />
          <PipelineStage stage="Researching" count={5} />
          <PipelineStage stage="Contacted" count={3} />
          <PipelineStage stage="Negotiating" count={2} />
          <PipelineStage stage="Approved" count={8} />
          <PipelineStage stage="Active" count={8} />
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-900 transition cursor-pointer">
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <p className="text-3xl font-bold text-purple-400">{value}</p>
      </div>
    </Link>
  )
}

function ActivityItem({
  title,
  status,
  timestamp,
}: {
  title: string
  status: string
  timestamp: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-b-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    submitted: 'bg-blue-500/20 text-blue-400',
    rights_unknown: 'bg-yellow-500/20 text-yellow-400',
    license_reviewed: 'bg-orange-500/20 text-orange-400',
    approved: 'bg-green-500/20 text-green-400',
    awaiting_approval: 'bg-orange-500/20 text-orange-400',
    parts_sourced: 'bg-blue-500/20 text-blue-400',
    quote_ready: 'bg-green-500/20 text-green-400',
    assembly: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function PipelineStage({ stage, count }: { stage: string; count: number }) {
  return (
    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <p className="text-sm text-gray-400 mb-2">{stage}</p>
      <p className="text-2xl font-bold text-purple-400">{count}</p>
    </div>
  )
}
