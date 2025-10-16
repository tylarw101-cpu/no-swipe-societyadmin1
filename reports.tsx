import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminGuard from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supaClient'

export default function ReportsAdmin(){
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all'|'open'|'reviewing'|'closed'>('open')

  async function load(){
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    setRows(data||[])
  }
  useEffect(()=>{ load() }, [])

  const filtered = useMemo(() => rows.filter(r =>
    (status==='all' || r.status===status) &&
    ((r.reason||'').toLowerCase().includes(q.toLowerCase()) || (r.details||'').toLowerCase().includes(q.toLowerCase()))
  ), [rows, q, status])

  async function setReportStatus(id:string, next:'open'|'reviewing'|'closed'){
    await supabase.from('reports').update({ status: next, resolved_at: next==='closed'? new Date().toISOString(): null }).eq('id', id)
    load()
  }

  async function addAdminNote(id:string){
    const note = prompt('Add admin note:')
    if(note===null) return
    await supabase.from('reports').update({ admin_notes: ((rows.find(r=>r.id===id)?.admin_notes)||'') + `\n${new Date().toLocaleString()}: ${note}` }).eq('id', id)
    load()
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-3 flex items-center gap-2">
          <input className="rounded-xl border px-3 py-2 flex-1" placeholder="Search reasons/details…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="rounded-xl border px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow border">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.reason}</div>
                <span className="text-xs rounded-full border px-2 py-0.5">{r.status}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{new Date(r.created_at).toLocaleString()}</div>
              <div className="text-sm mt-2 whitespace-pre-wrap">{r.details||'—'}</div>
              <div className="mt-2 text-xs text-gray-600">Reporter: {r.reporter_id}</div>
              {r.target_id && <div className="text-xs text-gray-600">Target: {r.target_id}</div>}
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <button className="rounded-xl border px-3 py-1" onClick={()=>setReportStatus(r.id,'reviewing')}>Mark Reviewing</button>
                <button className="rounded-xl border px-3 py-1" onClick={()=>setReportStatus(r.id,'closed')}>Close</button>
                <button className="rounded-xl border px-3 py-1" onClick={()=>addAdminNote(r.id)}>Add Note</button>
              </div>
              {r.admin_notes && (
                <div className="mt-3 bg-stone-50 rounded-xl p-2 text-xs whitespace-pre-wrap">{r.admin_notes}</div>
              )}
            </div>
          ))}
          {filtered.length===0 && <div className="text-sm text-gray-600">No reports.</div>}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}
