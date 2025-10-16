import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminGuard from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supaClient'

export default function EventsAdmin(){
  const [title, setTitle] = useState('NSS Temecula Mixer @ Winery')
  const [city, setCity] = useState('Temecula')
  const [startsAt, setStartsAt] = useState(new Date(Date.now()+1000*60*60*24*10).toISOString().slice(0,16))
  const [capacity, setCapacity] = useState(30)
  const [price, setPrice] = useState(0)
  const [events, setEvents] = useState<any[]>([])

  async function load(){
    const { data } = await supabase.from('events').select('*').order('starts_at')
    setEvents(data||[])
  }
  useEffect(()=>{ load() }, [])

  async function createEvent(){
    await supabase.from('events').insert({ title, city, starts_at: new Date(startsAt).toISOString(), capacity: Number(capacity), price_cents: Number(price) })
    load()
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="bg-white rounded-2xl p-4 shadow mb-4">
          <div className="font-semibold mb-2">Create Event</div>
          <div className="grid md:grid-cols-6 gap-3">
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="City" value={city} onChange={setCity} />
            <label className="block mb-3"><span className="text-sm text-gray-600">Starts</span><input type="datetime-local" className="mt-1 w-full rounded-xl border px-3 py-2" value={startsAt} onChange={(e)=>setStartsAt(e.target.value)} /></label>
            <Field label="Capacity" type="number" value={capacity} onChange={setCapacity} />
            <Field label="Price (cents)" type="number" value={price} onChange={setPrice} />
            <div className="flex items-end"><button className="rounded-xl bg-black text-white px-4 py-2" onClick={createEvent}>Add</button></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {events.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{ev.title}</div>
                <span className="text-xs rounded-full border px-2 py-0.5">{new Date(ev.starts_at).toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600">{ev.city} • Capacity: {ev.capacity} • RSVPs: <RSVPCount eventId={ev.id} /></div>
            </div>
          ))}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}

function Field({ label, value, onChange, type='text' }: any){
  return <label className="block mb-3"><span className="text-sm text-gray-600">{label}</span><input className="mt-1 w-full rounded-xl border px-3 py-2" value={value} type={type} onChange={(e)=>onChange(e.target.value)} /></label>
}

function RSVPCount({ eventId }: { eventId: string }){
  const [count, setCount] = useState<number>(0)
  useEffect(() => { (async () => {
    const { count } = await supabase.from('event_rsvps').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    setCount(count||0)
  })() }, [eventId])
  return <>{count}</>
}
