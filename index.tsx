import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminGuard from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supaClient'

export default function AdminDashboard(){
  const [stats, setStats] = useState<any>({users:0, verified:0, matches:0, intro:0, pass:0, events:0})

  useEffect(() => { (async () => {
    const users = await supabase.from('users').select('id, verified')
    const matches = await supabase.from('matches').select('id, status')
    const events = await supabase.from('events').select('id')
    setStats({
      users: users.data?.length||0,
      verified: (users.data||[]).filter(u=>u.verified).length,
      matches: matches.data?.length||0,
      intro: (matches.data||[]).filter(m=>m.status==='intro').length,
      pass: (matches.data||[]).filter(m=>m.status==='pass').length,
      events: events.data?.length||0,
    })
  })() }, [])

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="grid md:grid-cols-6 gap-4">
          <Stat label="Users" value={stats.users} />
          <Stat label="Verified" value={stats.verified} />
          <Stat label="Matches" value={stats.matches} />
          <Stat label="Intros" value={stats.intro} />
          <Stat label="Passed" value={stats.pass} />
          <Stat label="Events" value={stats.events} />
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}

function Stat({ label, value }: any){
  return <div className="bg-white rounded-2xl p-5 shadow"><div className="text-sm text-gray-600">{label}</div><div className="text-2xl font-semibold">{value}</div></div>
}
