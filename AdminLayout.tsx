import React from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-black text-white grid place-content-center font-bold">NSS</div>
            <div className="font-semibold">No Swipe Society — Admin</div>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="rounded-full border px-3 py-1" href="/admin">Dashboard</Link>
            <Link className="rounded-full border px-3 py-1" href="/admin/people">People</Link>
            <Link className="rounded-full border px-3 py-1" href="/admin/matches">Matches</Link>
            <Link className="rounded-full border px-3 py-1" href="/admin/events">Events</Link>
            <Link className="rounded-full border px-3 py-1" href="/admin/reports">Reports</Link>
            <Link className="rounded-full border px-3 py-1" href="/admin/memberships">Memberships</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
