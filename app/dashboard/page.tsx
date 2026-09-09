'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) { setMessage('Supabase is not configured.'); setLoading(false); return }
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/auth?next=/dashboard'; return }
      const { data: listings, error } = await sb.from('properties').select('id,hood,area,house_type,rent,vacancy_date,status,created_at').eq('owner_id', data.user.id).order('created_at', { ascending: false })
      if (error) setMessage(error.message); else setRows(listings || [])
      setLoading(false)
    })
  }, [])

  return <main className="page"><section className="section"><div className="container" style={{maxWidth:900}}>
    <div className="section-head"><div><div className="eyebrow">MY HAMA</div><h1 style={{margin:'6px 0'}}>My houses</h1><p className="muted">Track every house you have submitted and its review status.</p></div><Link href="/post" className="btn btn-primary">+ Post another</Link></div>
    {loading ? <div className="panel">Loading…</div> : message ? <div className="notice" style={{color:'#b3261e'}}>{message}</div> : rows.length===0 ? <div className="panel"><h2>No houses yet</h2><p className="muted">When you post a house, it will appear here with its review status.</p><Link href="/post" className="btn btn-primary">Post your house</Link></div> : <div className="grid" style={{gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>{rows.map(r=><div className="panel" key={r.id}><span className="badge">{r.status}</span><h3 style={{margin:'9px 0 5px'}}>{r.house_type} · {r.hood}</h3><div className="muted">{r.area} · KSh {Number(r.rent).toLocaleString()}/month</div><div className="chips"><span className="chip">Vacancy {new Date(r.vacancy_date).toLocaleDateString('en-KE')}</span></div><Link href={`/listing/${r.id}`} className="btn btn-secondary" style={{display:'inline-block',marginTop:12}}>View</Link></div>)}</div>}
  </div></section></main>
}
