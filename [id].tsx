import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminGuard from '../../../components/admin/AdminGuard'
import { supabase } from '../../../lib/supaClient'

export default function MatchDetailPage(){
  const router = useRouter()
  const { id } = router.query as { id: string }
  const [match, setMatch] = useState<any>(null)
  const [users, setUsers] = useState<Record<string, any>>({})
  const [feedback, setFeedback] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])

  useEffect(() => { if(!id) return; (async () => {
    const m = await supabase.from('matches').select('*').eq('id', id).single()
    setMatch(m.data)
    if(m.data){
      const uids = [m.data.user_a, m.data.user_b]
      const u = await supabase.from('users').select('id,name,email,city,photos').in('id', uids)
      const map: Record<string, any> = {}
      ;(u.data||[]).forEach(r => map[r.id] = r)
      setUsers(map)
      const d = await supabase.from('decisions').select('*').eq('match_id', id)
      setDecisions(d.data||[])
      const f = await supabase.from('feedback').select('*').eq('match_id', id).order('created_at', { ascending: false })
      setFeedback(f.data||[])
    }
  })() }, [id])

  async function setStatus(status: 'success'|'pass'|'pending'|'intro'){
    if(!match) return
    await supabase.from('matches').update({ status }).eq('id', match.id)
    const m = await supabase.from('matches').select('*').eq('id', match.id).single()
    setMatch(m.data)
  }

  const A = match ? users[match.user_a] : null
  const B = match ? users[match.user_b] : null

  return (
    <AdminGuard>
      <AdminLayout>
        {!match ? (
          <div className="p-4 text-sm">Loading match…</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Match Detail</div>
                <span className="text-xs rounded-full border px-2 py-0.5">{match.status}</span>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <div className="font-medium">Why we matched them</div>
                <p>{match.reason || '—'}</p>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <PersonCard u={A} label="User A" />
                <PersonCard u={B} label="User B" />
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium mb-2">Decisions</div>
                <ul className="text-sm list-disc ml-4">
                  {decisions.map(d => (
                    <li key={d.user_id}><b>{users[d.user_id]?.name || d.user_id}</b>: {d.decision} <span className="text-xs text-gray-500">({new Date(d.decided_at).toLocaleString()})</span></li>
                  ))}
                  {decisions.length===0 && <li className="text-gray-600">No decisions yet.</li>}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow">
              <div className="text-sm font-semibold">Actions</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <button className="rounded-xl border px-3 py-2" onClick={()=>setStatus('pending')}>Set Pending</button>
                <button className="rounded-xl border px-3 py-2" onClick={()=>setStatus('intro')}>Set Intro</button>
                <button className="rounded-xl border px-3 py-2" onClick={()=>setStatus('pass')}>Mark Pass</button>
                <button className="rounded-xl bg-black text-white px-3 py-2" onClick={()=>setStatus('success')}>Mark Success</button>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold mb-2">Feedback</div>
                <ul className="space-y-3">
                  {feedback.map(f => (
                    <li key={f.id} className="rounded-xl border p-3">
                      <div className="text-xs text-gray-500 mb-1">{users[f.user_id]?.name || f.user_id} • {new Date(f.created_at).toLocaleString()}</div>
                      <div className="text-sm"><b>{f.score}/10</b> — {f.notes || '—'}</div>
                    </li>
                  ))}
                  {feedback.length===0 && <li className="text-sm text-gray-600">No feedback yet.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  )
}

function PersonCard({ u, label }: any){
  if(!u) return <div className="rounded-2xl border p-4">Loading…</div>
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex items-start gap-3 mt-1">
        <img src={(u.photos&&u.photos[0])||'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1200'} className="h-14 w-14 rounded-xl object-cover" />
        <div>
          <div className="font-medium">{u.name}</div>
          <div className="text-xs text-gray-600">{u.email} • {u.city||'—'}</div>
        </div>
      </div>
    </div>
  )
}
