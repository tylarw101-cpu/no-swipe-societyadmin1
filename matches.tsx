import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminGuard from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supaClient'

export default function MatchesAdmin(){
  const [clients, setClients] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [list, setList] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [candidateId, setCandidateId] = useState('')
  const [reason, setReason] = useState('Shared values, distance under 25 miles, compatible faith priorities.')

  async function load(){
    const cu = await supabase.from('users').select('id,name,email').eq('role','client')
    const ca = await supabase.from('users').select('id,name').eq('role','candidate')
    const m = await supabase.from('matches').select('*').order('created_at', { ascending:false })
    setClients(cu.data||[]); setCandidates(ca.data||[]); setList(m.data||[])
    setClientId(cu.data?.[0]?.id||''); setCandidateId(ca.data?.[0]?.id||'')
  }
  useEffect(()=>{ load() }, [])

  async function push(){
    if(!clientId || !candidateId) return
    await supabase.from('matches').insert({ user_a: clientId, user_b: candidateId, reason })
    load()
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="bg-white rounded-2xl p-4 shadow mb-4">
          <div className="font-semibold mb-2">Push a curated match</div>
          <div className="grid md:grid-cols-4 gap-3">
            <select className="rounded-xl border px-3 py-2" value={clientId} onChange={(e)=>setClientId(e.target.value)}>
              {clients.map(c=> <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
            <select className="rounded-xl border px-3 py-2" value={candidateId} onChange={(e)=>setCandidateId(e.target.value)}>
              {candidates.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="rounded-xl border px-3 py-2 md:col-span-2" value={reason} onChange={(e)=>setReason(e.target.value)} />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="rounded-xl bg-black text-white px-4 py-2" onClick={push}>Send Match</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {list.map(m => (
            <Link key={m.id} href={`/admin/matches/${m.id}`} className="bg-white rounded-2xl p-4 shadow block hover:ring-1 hover:ring-black/10">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{m.user_a.slice(0,6)}… ↔ {m.user_b.slice(0,6)}…</div>
                <span className="text-xs rounded-full border px-2 py-0.5">{m.status}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{new Date(m.created_at).toLocaleString()}</div>
              <div className="mt-2 text-sm">Reason: {m.reason}</div>
              <div className="mt-3 text-xs text-stone-600 underline">Open match detail →</div>
            </Link>
          ))}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}
