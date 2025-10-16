import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supaClient'

export default function AdminGuard({ children }: { children: React.ReactNode }){
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setOk(false); return }
    const { data } = await supabase.from('users').select('role').eq('id', user.id).limit(1)
    setOk(data?.[0]?.role === 'admin')
  })() }, [])

  if(ok === null) return <div className="p-6 text-sm">Checking admin…</div>
  if(!ok) return <div className="p-6 text-sm">You are not an admin. Set your role to <b>admin</b> in Supabase and refresh.</div>
  return <>{children}</>
}
