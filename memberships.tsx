import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminGuard from '../../components/admin/AdminGuard'

export default function Memberships(){
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')

  useEffect(() => { (async () => {
    const res = await fetch('/api/admin/memberships')
    const json = await res.json()
    setRows(json.memberships||[])
  })() }, [])

  const filtered = useMemo(() => rows.filter((r:any)=> (r.email||'').toLowerCase().includes(q.toLowerCase())), [rows, q])

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-3 flex items-center gap-2">
          <input className="rounded-xl border px-3 py-2 flex-1" placeholder="Search by email…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <a className="rounded-xl border px-3 py-2" href="/admin">Back to Dashboard</a>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="text-lg font-semibold mb-3">Memberships ($39.99/mo)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Interval</th>
                  <th className="py-2 pr-4">Renews</th>
                  <th className="py-2 pr-4">Customer</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r:any) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">{r.email || '—'}</td>
                    <td className="py-2 pr-4"><span className="rounded-full border px-2 py-0.5 text-xs">{r.status}</span></td>
                    <td className="py-2 pr-4">{r.amount ? `$${(r.amount/100).toFixed(2)}` : '—'}</td>
                    <td className="py-2 pr-4">{r.interval || '—'}</td>
                    <td className="py-2 pr-4">{r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : '—'}</td>
                    <td className="py-2 pr-4 text-xs">{r.customer}</td>
                  </tr>
                ))}
                {filtered.length===0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={6}>No memberships found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}
