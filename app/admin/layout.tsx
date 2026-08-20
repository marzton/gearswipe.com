import React from 'react'
import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'admin' && session.user.role !== 'editor') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-purple-400">
              GearSwipe Admin
            </Link>
            <div className="flex gap-1">
              <NavLink href="/admin">Dashboard</NavLink>
              <NavLink href="/admin/assets">Assets</NavLink>
              <NavLink href="/admin/vendors">Vendors</NavLink>
              <NavLink href="/admin/quotes">Quotes</NavLink>
              <NavLink href="/admin/products">Products</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{session.user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
    >
      {children}
    </Link>
  )
}
