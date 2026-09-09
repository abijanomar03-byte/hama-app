'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HOODS } from '@/lib/locations'
import NativeCapture from '@/components/NativeCapture'
import { getSupabase } from '@/lib/supabase'

const ALL_ROOMS = ['Sitting Room', 'Bedroom', 'Kitchen', 'Washroom'] as const
type Room = typeof ALL_ROOMS[number]
const ROOM_TO_KEY: Record<Room, string> = { 'Sitting Room':'sitting_room', Bedroom:'bedroom', Kitchen:'kitchen', Washroom:'washroom' }

type MediaChoice = 'photos' | 'video'

export default function Post() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [hood, setHood] = useState('')
  const [area, setArea] = useState('')
  const [type, setType] = useState('Bedsitter')
  const [rent, setRent] = useState('')
  const [vacancy, setVacancy] = useState('30')
  const [water, setWater] = useState('Daily')
  const [security, setSecurity] = useState('Good')
  const [internet, setInternet] = useState('Fibre available')
  const [parking, setParking] = useState('No')
  const [mediaChoice, setMediaChoice] = useState<MediaChoice>('photos')
  const [roomIndex, setRoomIndex] = useState(0)
  const [photos, setPhotos] = useState<Partial<Record<Room, string>>>({})
  const [video, setVideo] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [successId, setSuccessId] = useState<string | null>(null)

  const requiredRooms = type === 'Bedsitter' ? (['Sitting Room', 'Kitchen', 'Washroom'] as const) : ALL_ROOMS
  const currentRoom = requiredRooms[Math.min(roomIndex, requiredRooms.length - 1)]
  const photosComplete = requiredRooms.every(r => !!photos[r])
  const readyToPublish = !!hood && !!area && !!rent && (mediaChoice === 'video' ? !!video : photosComplete)
  const areas = useMemo(() => hood ? ((HOODS[hood as keyof typeof HOODS] || []) as readonly string[]) : [], [hood])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) { setError('Supabase is not configured yet. Add the Vercel Supabase environment variables first.'); setReady(true); return }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/auth?next=/post'); return }
      setUserId(data.user.id); setReady(true)
    })
  }, [router])

  function handlePhoto(dataUrl: string) {
    setPhotos(prev => ({ ...prev, [currentRoom]: dataUrl }))
    if (roomIndex < requiredRooms.length - 1) setTimeout(() => setRoomIndex(i => i + 1), 0)
  }

  function handleVideo(dataUrl: string) { setVideo(dataUrl) }

  async function publish() {
    setError('')
    if (!userId) { router.push('/auth?next=/post'); return }
    if (!hood || !area || !rent || Number(rent) <= 0 || !(mediaChoice === 'video' ? !!video : photosComplete)) { setError('Complete every item above before publishing.'); return }
    const supabase = getSupabase()
    if (!supabase) { setError('Supabase is not configured yet.'); return }
    setPublishing(true)
    try {
      const vacancyDate = new Date()
      vacancyDate.setDate(vacancyDate.getDate() + Number(vacancy))
      const { data: property, error: insertError } = await supabase.from('properties').insert({
        owner_id: userId, hood, area, house_type: type, rent: Number(rent), deposit: Number(rent),
        vacancy_date: vacancyDate.toISOString().slice(0, 10), water, security, road: '5 min walk', internet,
        parking, status: 'pending'
      }).select().single()
      if (insertError || !property) throw insertError || new Error('Could not create the listing.')

      if (mediaChoice === 'video' && video) {
        const blob = await (await fetch(video)).blob()
        const path = `${userId}/${property.id}/walkthrough.${blob.type.includes('webm') ? 'webm' : 'mp4'}`
        const { error: uploadError } = await supabase.storage.from('property-media').upload(path, blob, { contentType: blob.type || 'video/mp4', upsert: true })
        if (uploadError) throw uploadError
        const { error: mediaError } = await supabase.from('property_media').insert({ property_id: property.id, room_type: null, media_type: 'video', storage_path: path, captured_at: new Date().toISOString(), ai_verified: false })
        if (mediaError) throw mediaError
      } else {
        for (const roomName of requiredRooms) {
          const dataUrl = photos[roomName]
          if (!dataUrl) throw new Error(`${roomName} photo is missing.`)
          const blob = await (await fetch(dataUrl)).blob()
          const path = `${userId}/${property.id}/${ROOM_TO_KEY[roomName]}.jpg`
          const { error: uploadError } = await supabase.storage.from('property-media').upload(path, blob, { contentType: 'image/jpeg', upsert: true })
          if (uploadError) throw uploadError
          const { error: mediaError } = await supabase.from('property_media').insert({ property_id: property.id, room_type: roomName, media_type: 'photo', storage_path: path, captured_at: new Date().toISOString(), ai_verified: false })
          if (mediaError) throw mediaError
        }
      }
      setSuccessId(property.id)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong while publishing.'
      console.error('HAMA PUBLISH ERROR', e)
      setError(message)
    } finally { setPublishing(false) }
  }

  if (!ready) return <main className="page"><section className="section"><div className="container"><div className="panel">Checking your account…</div></div></section></main>

  if (successId) return <main className="page"><section className="section"><div className="container" style={{maxWidth:760}}><div className="panel">
    <div className="eyebrow">HAMA</div><h1>✓ House submitted</h1>
    <p className="muted">Your listing is saved as <strong>pending review</strong>. It will not appear publicly until a Hama reviewer approves it.</p>
    <div className="notice"><strong>What happens next?</strong><br/>We review the details and captures, then publish the house when it meets Hama's listing standards.</div>
    <Link href="/dashboard" className="btn btn-secondary" style={{display:'inline-block',marginTop:14}}>View my submitted houses</Link>
  </div></div></section></main>

  return <main className="page"><section className="section"><div className="container"><div className="two">
    <div className="panel">
      <div className="eyebrow">I'M MOVING OUT</div><h1>Post your house</h1>
      <p className="muted">Post after giving notice to move out. Your listing stays private until Hama reviews it.</p>
      <div className="form">
        <div><label>Where do you stay?</label><select className="field" style={{width:'100%'}} value={hood} onChange={e=>{const next=e.target.value; setHood(next); const nextAreas=(next?(HOODS[next as keyof typeof HOODS]||[]):[]) as readonly string[]; setArea(next && nextAreas.length===0 ? next : '')}}><option value="">Choose a hood</option>{Object.keys(HOODS).map(h=><option key={h}>{h}</option>)}</select></div>
        {hood && areas.length>0 && <div><label>Area</label><select className="field" style={{width:'100%'}} value={area} onChange={e=>setArea(e.target.value)}><option value="">Choose an area</option>{areas.map(a=><option key={a}>{a}</option>)}</select></div>}
        {hood && areas.length===0 && <div><label>Area</label><input className="field" style={{width:'100%'}} value={area} readOnly /></div>}
        <div><label>House type</label><select className="field" style={{width:'100%'}} value={type} onChange={e=>{setType(e.target.value);setRoomIndex(0);setPhotos({})}}><option>Bedsitter</option><option>1 Bedroom</option><option>2 Bedrooms</option></select></div>
        <div><label>Monthly rent</label><input className="field" style={{width:'100%'}} value={rent} onChange={e=>setRent(e.target.value)} placeholder="e.g. 16000" inputMode="numeric" /></div>
        <div><label>Vacancy</label><select className="field" style={{width:'100%'}} value={vacancy} onChange={e=>setVacancy(e.target.value)}><option value="0">Vacant now</option><option value="5">Vacant in 5 days</option><option value="10">Vacant in 10 days</option><option value="15">Vacant in 15 days</option><option value="30">Vacant in 30 days</option></select></div>
        <div><label>Water</label><select className="field" style={{width:'100%'}} value={water} onChange={e=>setWater(e.target.value)}><option>Daily</option><option>Sometimes</option><option>Rare</option></select></div>
        <div><label>Security</label><select className="field" style={{width:'100%'}} value={security} onChange={e=>setSecurity(e.target.value)}><option>Good</option><option>Average</option><option>Poor</option></select></div>
        <div><label>Internet</label><select className="field" style={{width:'100%'}} value={internet} onChange={e=>setInternet(e.target.value)}><option>Fibre available</option><option>Mobile data only</option><option>None nearby</option></select></div>
        <div><label>Parking</label><select className="field" style={{width:'100%'}} value={parking} onChange={e=>setParking(e.target.value)}><option>Yes</option><option>No</option></select></div>
      </div>
    </div>

    <div className="panel">
      <div className="eyebrow">MEDIA</div><h2 style={{margin:'6px 0'}}>Show the house</h2>
      <p className="muted">Choose <strong>one</strong> method. Your captures are accepted immediately and manually reviewed before the house goes public.</p>
      <div className="controls" style={{display:'flex',gap:8,marginBottom:14}}>
        <button type="button" className={mediaChoice==='photos'?'btn btn-primary':'btn btn-secondary'} onClick={()=>{setMediaChoice('photos');setVideo(null)}} style={{flex:1}}>📷 Room photos</button>
        <button type="button" className={mediaChoice==='video'?'btn btn-primary':'btn btn-secondary'} onClick={()=>{setMediaChoice('video');setPhotos({})}} style={{flex:1}}>🎥 One video</button>
      </div>

      {mediaChoice==='photos' ? <>
        <div className="chips" style={{marginBottom:12}}>{requiredRooms.map((r,i)=><button type="button" key={r} className="chip" onClick={()=>setRoomIndex(i)} style={{background: roomIndex===i?'#e7f6ef':'#f2f4f7',border: roomIndex===i?'2px solid var(--green)':'1px solid transparent'}}>{photos[r]?'✅':'⭕'} {r}</button>)}</div>
        {currentRoom && <div><div className="notice" style={{marginBottom:10}}><strong>Next: {currentRoom}</strong><br/>Take a clear photo of this room with your phone camera.</div><NativeCapture label={currentRoom} kind="photo" onCapture={handlePhoto}/></div>}
        <div className="rooms" style={{marginTop:14}}>{requiredRooms.map(r=>photos[r]?<div className="room" key={r}><img src={photos[r]} alt={r}/><div className="rt">{r} · captured</div></div>:null)}</div>
      </> : <>
        {video ? <div><video src={video} controls playsInline style={{width:'100%',borderRadius:14,background:'#111',maxHeight:360}}/><div className="notice" style={{marginTop:10,color:'var(--green)'}}>✓ Walkthrough captured. You don't need room photos.</div></div> : <><div className="notice" style={{marginBottom:10}}><strong>One short walkthrough</strong><br/>Use your phone camera to record the whole house in one continuous video.</div><NativeCapture label="walkthrough" kind="video" onCapture={handleVideo}/></>}
      </>}

      <div className="notice" style={{marginTop:14}}><strong>Before you publish</strong><div style={{display:'grid',gap:7,marginTop:9}}>
        <div>{hood?'✅':'⭕'} Location selected</div><div>{area?'✅':'⭕'} Area selected</div><div>{rent?'✅':'⭕'} Monthly rent entered</div>{mediaChoice==='video'?<div>{video?'✅':'⭕'} Walkthrough video captured</div>:requiredRooms.map(r=><div key={r}>{photos[r]?'✅':'⭕'} {r} photo captured</div>)}
      </div>{!readyToPublish&&<div style={{marginTop:8,fontSize:12,color:'#667085'}}>Complete the items above to publish your house.</div>}</div>
      {error&&<div className="notice" style={{marginTop:10,color:'#b3261e'}}>{error}</div>}
      <button type="button" className="btn btn-primary" style={{width:'100%',marginTop:14}} disabled={!readyToPublish||publishing} onClick={publish}>{publishing?'Publishing…':'Publish house'}</button>
    </div>
  </div></div></section></main>
}
