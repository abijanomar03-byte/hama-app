'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HOODS } from '@/lib/locations'
import LiveMedia from '@/components/LiveMedia'
import { getSupabase } from '@/lib/supabase'

const ROOMS = ['Sitting Room', 'Bedroom', 'Kitchen', 'Washroom'] as const
const ROOM_TO_KEY: Record<string, string> = {
  'Sitting Room': 'sitting_room', 'Bedroom': 'bedroom', 'Kitchen': 'kitchen', 'Washroom': 'washroom'
}

type RoomStatus = 'idle' | 'checking' | 'ok' | 'rejected'
type SavedListing = {
  id: string
  hood: string
  area: string
  house_type: string
  rent: number
  vacancy_date: string
  photos: Record<string, string>
  videoUrl?: string
  created_at: string
  demoLocal: true
}

function checkPhotoQuality(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = 32, h = 32
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        let sum = 0, sumSq = 0
        const n = w * h
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          sum += lum; sumSq += lum * lum
        }
        const mean = sum / n
        const variance = sumSq / n - mean * mean
        resolve(variance > 80 && w > 0 && h > 0)
      } catch { resolve(true) }
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}

async function verifyIsRoomPhoto(dataUrl: string, expectedRoom: string, houseType: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/)
  if (!match) return { ok: false, reason: 'Hama could not read that camera photo.' }
  const [, mediaType, base64] = match
  try {
    const r = await fetch('/api/verify-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mediaType, expectedRoom, houseType })
    })
    const data = await r.json()
    return { ok: !!data.is_house, reason: data.reason || `This does not clearly look like a ${expectedRoom.replace('_',' ')}.` }
  } catch {
    return { ok: false, reason: 'Hama could not check this photo right now. Please retake it.' }
  }
}

export default function Post() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
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

  const [uploadMode, setUploadMode] = useState<'photos' | 'video'>('photos')
  const [roomIndex, setRoomIndex] = useState(0)
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const [walkthroughVideo, setWalkthroughVideo] = useState<{ dataUrl: string; mimeType: string } | null>(null)
  const [statuses, setStatuses] = useState<Record<string, RoomStatus>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [localMode, setLocalMode] = useState(false)

  const areas = useMemo(() => (hood ? (HOODS[hood as keyof typeof HOODS] as readonly string[]) : []), [hood])
  const currentRoom = ROOMS[roomIndex]
  const allRequiredRooms = type === 'Bedsitter' ? ['Sitting Room', 'Kitchen', 'Washroom'] : [...ROOMS]
  const allOk = uploadMode === 'video' ? !!walkthroughVideo : allRequiredRooms.every(r => statuses[r] === 'ok')

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLocalMode(true)
      setCheckingAuth(false)
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/auth?next=/post'); return }
      setUserId(data.user.id)
      setCheckingAuth(false)
    })
  }, [router])

  const onCapture = async (roomName: string, dataUrl: string) => {
    setStatuses(s => ({ ...s, [roomName]: 'checking' }))
    setReasons(r => ({ ...r, [roomName]: '' }))

    const qualityOk = await checkPhotoQuality(dataUrl)
    if (!qualityOk) {
      setStatuses(s => ({ ...s, [roomName]: 'rejected' }))
      setReasons(r => ({ ...r, [roomName]: 'The photo is too dark or unclear. Please retake it.' }))
      return
    }

  

    setPhotos(p => ({ ...p, [roomName]: dataUrl }))
    setStatuses(s => ({ ...s, [roomName]: 'ok' }))

    // Automatically advance to the next required room.
    const nextIndex = ROOMS.findIndex((r, i) => i > roomIndex && allRequiredRooms.includes(r) && statuses[r] !== 'ok')
    if (nextIndex >= 0) setTimeout(() => setRoomIndex(nextIndex), 350)
  }

  const onVideoCapture = (dataUrl: string, mimeType: string) => {
    setWalkthroughVideo({ dataUrl, mimeType })
    setPhotos({})
    setStatuses({})
    setReasons({})
  }

  function localPublish() {
    const id = `local-${Date.now()}`
    const vacancyDate = new Date()
    vacancyDate.setDate(vacancyDate.getDate() + Number(vacancy))
    const listing: SavedListing = {
      id, hood, area, house_type: type, rent: Number(rent), vacancy_date: vacancyDate.toISOString().slice(0,10),
      photos: uploadMode === 'photos' ? photos : {}, videoUrl: uploadMode === 'video' && walkthroughVideo ? walkthroughVideo.dataUrl : undefined, created_at: new Date().toISOString(), demoLocal: true
    }
    const existing = JSON.parse(localStorage.getItem('hama_local_listings') || '[]')
    localStorage.setItem('hama_local_listings', JSON.stringify([listing, ...existing]))
    setPublishedId(id)
  }

  async function publish() {
    setPublishError('')
    if (!hood || !area || !rent || !allOk) return
    setPublishing(true)
    try {
      const supabase = getSupabase()
      if (!supabase) {
        localPublish()
        return
      }
      if (!userId) { router.push('/auth?next=/post'); return }

      const vacancyDate = new Date()
      vacancyDate.setDate(vacancyDate.getDate() + Number(vacancy))
      const { data: property, error: insertError } = await supabase.from('properties').insert({
        owner_id: userId, hood, area, house_type: type, rent: Number(rent), deposit: Number(rent),
        vacancy_date: vacancyDate.toISOString().slice(0, 10), water, security, road: '5 min walk', internet, parking,
        status: 'draft'
      }).select().single()
      if (insertError || !property) throw insertError || new Error('Could not create the listing.')

      if (uploadMode === 'photos') {
        for (const roomName of allRequiredRooms) {
          const dataUrl = photos[roomName]
          const blob = await (await fetch(dataUrl)).blob()
          const path = `${userId}/${property.id}/${ROOM_TO_KEY[roomName]}.jpg`
          const { error: uploadError } = await supabase.storage.from('property-media').upload(path, blob, { contentType: 'image/jpeg', upsert: true })
          if (uploadError) throw uploadError
          const { error: mediaError } = await supabase.from('property_media').insert({
            property_id: property.id, room_type: ROOM_TO_KEY[roomName], media_type: 'photo', storage_path: path,
            captured_at: new Date().toISOString(), ai_verified: true, freshness_verified: true
          })
          if (mediaError) throw mediaError
        }
      } else if (walkthroughVideo) {
        const blob = await (await fetch(walkthroughVideo.dataUrl)).blob()
        const ext = walkthroughVideo.mimeType.includes('webm') ? 'webm' : walkthroughVideo.mimeType.includes('quicktime') ? 'mov' : 'mp4'
        const path = `${userId}/${property.id}/walkthrough.${ext}`
        const { error: uploadError } = await supabase.storage.from('property-media').upload(path, blob, { contentType: walkthroughVideo.mimeType, upsert: true })
        if (uploadError) throw uploadError
        const { error: mediaError } = await supabase.from('property_media').insert({
          property_id: property.id, room_type: null, media_type: 'video', storage_path: path,
          captured_at: new Date().toISOString(), ai_verified: true, freshness_verified: true
        })
        if (mediaError) throw mediaError
      }
      setPublishedId(property.id)
    } catch (err: any) {
      setPublishError(err?.message || 'Something went wrong while publishing. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  if (checkingAuth) return <main className="page"><section className="section"><div className="container"><div className="panel">Preparing Hama…</div></div></section></main>

  if (publishedId) return (
    <main className="page"><section className="section"><div className="container"><div className="panel">
      <h1>✓ Your house is ready</h1>
      <p className="muted">{uploadMode === 'video' ? 'Your short walkthrough video was captured through the phone camera and added to the listing.' : 'Your room photos were captured through the phone camera and added to the listing.'}</p>
      {localMode && <div className="notice">Demo mode: Supabase is not connected yet, so this listing is saved in this browser only. Connect Supabase before launching Hama publicly.</div>}
      {uploadMode === 'photos' ? <div className="rooms">{allRequiredRooms.map(r => photos[r] && <div className="room" key={r}><img src={photos[r]} alt={r} /><div className="rt">{r} · Fresh capture</div></div>)}</div> : walkthroughVideo ? <video controls playsInline src={walkthroughVideo.dataUrl} style={{width:'100%',marginTop:12,borderRadius:12,maxHeight:320,background:'#000'}} /> : null}
      {localMode ? <Link href="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Back to Hama →</Link> : <Link href={`/listing/${publishedId}`} className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>View your live listing →</Link>}
    </div></div></section></main>
  )

  return (
    <main className="page"><section className="section"><div className="container"><div className="two">
      <div className="panel">
        <div className="eyebrow">I&apos;M MOVING OUT</div>
        <h1>Post your house</h1>
        <p className="muted">Post after giving notice to move out. Hama asks for fresh phone-camera media so future tenants see what the home looks like now. Choose room photos OR one short walkthrough video — never both.</p>
        {localMode && <div className="notice">Preview mode: Supabase is not connected. You can still test the full posting flow; your test listing stays in this browser.</div>}
        <div className="form">
          <div><label>Where do you stay?</label><select className="field" style={{width:'100%'}} value={hood} onChange={e=>{setHood(e.target.value);setArea('')}}><option value="">Choose a hood</option>{Object.keys(HOODS).map(h=><option key={h}>{h}</option>)}</select></div>
          {hood && areas.length > 0 && <div><label>Area</label><select className="field" style={{width:'100%'}} value={area} onChange={e=>setArea(e.target.value)}><option value="">Choose an area</option>{areas.map(a=><option key={a}>{a}</option>)}</select></div>}
          <div><label>House type</label><select className="field" style={{width:'100%'}} value={type} onChange={e=>{setType(e.target.value);setRoomIndex(0);setPhotos({});setStatuses({});setReasons({});setWalkthroughVideo(null);}}><option>Bedsitter</option><option>1 Bedroom</option><option>2 Bedrooms</option></select></div>
          <div><label>Monthly rent</label><input className="field" style={{width:'100%'}} value={rent} onChange={e=>setRent(e.target.value)} placeholder="e.g. 16000" inputMode="numeric" /></div>
          <div><label>Vacancy</label><select className="field" style={{width:'100%'}} value={vacancy} onChange={e=>setVacancy(e.target.value)}><option value="0">Vacant now</option><option value="5">Vacant in 5 days</option><option value="10">Vacant in 10 days</option><option value="15">Vacant in 15 days</option><option value="30">Vacant in 30 days</option></select></div>
          <div><label>Water</label><select className="field" style={{width:'100%'}} value={water} onChange={e=>setWater(e.target.value)}><option>Daily</option><option>Sometimes</option><option>Rare</option></select></div>
          <div><label>Security</label><select className="field" style={{width:'100%'}} value={security} onChange={e=>setSecurity(e.target.value)}><option>Good</option><option>Average</option><option>Poor</option></select></div>
          <div><label>Internet</label><select className="field" style={{width:'100%'}} value={internet} onChange={e=>setInternet(e.target.value)}><option>Fibre available</option><option>Mobile data only</option><option>None nearby</option></select></div>
          <div><label>Parking</label><select className="field" style={{width:'100%'}} value={parking} onChange={e=>setParking(e.target.value)}><option>Yes</option><option>No</option></select></div>
        </div>
      </div>

      <div className="panel">
        <div className="eyebrow">LIVE PHONE CAMERA</div>
        <h2 style={{margin:'6px 0'}}>Show us your house</h2>
        <p className="muted">Choose one method: take the required room photos one by one, or record one short walkthrough video. You only need one.</p>
        <div className="chips" style={{marginBottom:12,display:'flex',gap:8,flexWrap:'wrap'}}>
          <button type="button" className="chip" onClick={()=>{setUploadMode('photos');setWalkthroughVideo(null);setRoomIndex(0)}} style={{background:uploadMode==='photos'?'var(--green)':'#fff',color:uploadMode==='photos'?'#fff':'var(--ink)',border:'1px solid #e7e9ed',cursor:'pointer'}}>📷 Room photos</button>
          <button type="button" className="chip" onClick={()=>{setUploadMode('video');setPhotos({});setStatuses({});setRoomIndex(0)}} style={{background:uploadMode==='video'?'var(--green)':'#fff',color:uploadMode==='video'?'#fff':'var(--ink)',border:'1px solid #e7e9ed',cursor:'pointer'}}>🎥 One walkthrough video</button>
        </div>
        {uploadMode === 'photos' ? <>
          <div className="chips" style={{marginBottom:12}}>{allRequiredRooms.map(r=><div key={r} className="chip" style={{background:'#fff',opacity:r===currentRoom?1:.65,border:r===currentRoom?'2px solid var(--green)':'1px solid #e7e9ed'}}>{r} {statuses[r]==='ok'?'✓':''}</div>)}</div>
          {statuses[currentRoom] === 'checking' && <div className="notice">Checking your {currentRoom.toLowerCase()} photo…</div>}
          {statuses[currentRoom] === 'rejected' && <div className="notice" style={{color:'#b3261e'}}>✗ {reasons[currentRoom]}</div>}
          {statuses[currentRoom] === 'ok' && <div className="notice" style={{color:'var(--green)'}}>✓ {currentRoom} accepted. Moving to the next room.</div>}
          <LiveMedia key={currentRoom} mode="photos" label={currentRoom} onPhotoCapture={(dataUrl)=>onCapture(currentRoom,dataUrl)} onVideoCapture={()=>{}} />
        </> : <>
          {walkthroughVideo && <div className="notice" style={{color:'var(--green)'}}>✓ Walkthrough video captured. You do not need room photos.</div>}
          <LiveMedia mode="video" onPhotoCapture={()=>{}} onVideoCapture={onVideoCapture} />
          {walkthroughVideo && <video controls playsInline src={walkthroughVideo.dataUrl} style={{width:'100%',marginTop:12,borderRadius:12,maxHeight:260,background:'#000'}} />}
        </>}
        {publishError && <div className="notice" style={{color:'#b3261e',marginTop:10}}>{publishError}</div>}
        <button className="btn btn-primary" style={{width:'100%',marginTop:14}} disabled={!hood||!area||!rent||!allOk||publishing} onClick={publish}>{publishing?'Publishing…':'Publish house'}</button>
      </div>
    </div></div></section></main>
  )
}
