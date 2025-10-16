import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminGuard from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supaClient'

export default function People(){
  const [tab, setTab] = useState<'people'|'blocked'>('people')
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [userMap, setUserMap] = useState<Record<string, any>>({})

  async function loadPeople(){
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setRows(data||[])
  }
  async function loadBlocks(){
    const { data } = await supabase.from('blocks').select('*').order('created_at', { ascending: false })
    setBlocks(data||[])
    const ids = Array.from(new Set((data||[]).flatMap((b:any)=>[b.blocker_id,b.blocked_id]).filter(Boolean)))
    if(ids.length){
      const u = await supabase.from('users').select('id,name,email').in('id', ids)
      const map: Record<string, any> = {}
      ;(u.data||[]).forEach((r:any)=> map[r.id]=r)
      setUserMap(map)
    }
  }

  useEffect(()=>{ loadPeople(); loadBlocks() }, [])

  const filtered = useMemo(()=> rows.filter(u => (u.name+u.email+(u.city||'')).toLowerCase().includes(q.toLowerCase())), [rows, q])

  async function toggleVerify(u:any){
    await supabase.from('users').update({ verified: !u.verified }).eq('id', u.id)
    loadPeople()
  }

  async function addCandidate(){
    const name = prompt('Candidate name?')
    if(!name) return
    const email = prompt('Candidate email?') || `${name.toLowerCase().replace(/\s+/g,'')}@example.com`
    await supabase.from('users').insert({ id: crypto.randomUUID(), name, email, role:'candidate', verified:false, photos: [] })
    loadPeople()
  }

  async function remove(u:any){
    if(!confirm('Remove this user?')) return
    await supabase.from('users').delete().eq('id', u.id)
    loadPeople()
  }

  async function unblock(b:any){
    if(!confirm('Unblock this user pair?')) return
    await supabase.from('blocks').delete().eq('blocker_id', b.blocker_id).eq('blocked_id', b.blocked_id)
    loadBlocks()
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-3 flex items-center gap-2">
          <input className="rounded-xl border px-3 py-2 flex-1" placeholder="Search people…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className={`rounded-xl px-3 py-2 border ${tab==='people'?'bg-black text-white':''}`} onClick={()=>setTab('people')}>People</button>
          <button className={`rounded-xl px-3 py-2 border ${tab==='blocked'?'bg-black text-white':''}`} onClick={()=>setTab('blocked')}>Blocked</button>
          {tab==='people' && <button className="rounded-xl bg-black text-white px-4 py-2" onClick={addCandidate}>Add Candidate</button>}
        </div>

        {tab==='people' ? (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(u => (
              <div key={u.id} className="bg-white rounded-2xl p-4 shadow">
                <div className="flex items-start gap-3">
                  <img src={(u.photos&&u.photos[0])||'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1200'} className="h-16 w-16 rounded-xl object-cover"/>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{u.name||'—'}</div>
                      {u.verified && <span className="text-xs rounded-full border px-2 py-0.5">Verified</span>}
                      <span className="text-xs rounded-full border px-2 py-0.5">{u.role}</span>
                    </div>
                    <div className="text-xs text-gray-600">{u.email} • {u.city||'—'} • Age: {u.dob ? age(u.dob): '—'}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-xl border px-3 py-1" onClick={()=>toggleVerify(u)}>{u.verified?'Unverify':'Verify'}</button>
                      <button className="rounded-xl border px-3 py-1" onClick={()=>{
                        const next = prompt('Update short bio/notes:', u.bio||'')
                        if(next===null) return
                        supabase.from('users').update({ bio: next }).eq('id', u.id).then(loadPeople)
                      }}>Edit</button>
                      <button className="rounded-xl border px-3 py-1" onClick={()=>remove(u)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="text-lg font-semibold mb-3">Blocked Pairs</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr>
                    <th className="py-2 pr-4">Blocker</th>
                    <th className="py-2 pr-4">Blocked</th>
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b:any)=> (
                    <tr key={`${b.blocker_id}-${b.blocked_id}`} className="border-t">
                      <td className="py-2 pr-4">{fmtUser(userMap[b.blocker_id])}</td>
                      <td className="py-2 pr-4">{fmtUser(userMap[b.blocked_id])}</td>
                      <td className="py-2 pr-4">{new Date(b.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right"><button className="rounded-full border px-3 py-1" onClick={()=>unblock(b)}>Unblock</button></td>
                    </tr>
                  ))}
                  {blocks.length===0 && <tr><td className="py-4 text-gray-500" colSpan={4}>No blocks found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  )
}

function age(dob:string){ const d=new Date(dob), t=new Date(); let a=t.getFullYear()-d.getFullYear(); const m=t.getMonth()-d.getMonth(); if(m<0||(m===0&&t.getDate()<d.getDate())) a--; return a }
function fmtUser(u:any){ return u ? `${u.name||'—'} (${u.email||u.id})` : '—' }
