'use client'
import { useRef, useState } from 'react'

type Kind = 'photo' | 'video'

function resizeImageDataUrl(dataUrl: string, maxDimension: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) { height = Math.round((height / width) * maxDimension); width = maxDimension }
          else { width = Math.round((width / height) * maxDimension); height = maxDimension }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(dataUrl); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch { resolve(dataUrl) }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function NativeCapture({ label, kind, onCapture }: { label: string; kind: Kind; onCapture: (dataUrl: string, mime: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function openCamera() {
    setError('')
    input.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const maxBytes = kind === 'video' ? 60 * 1024 * 1024 : 12 * 1024 * 1024
    if (file.size > maxBytes) {
      setError(kind === 'video' ? 'Please record a video under 60 MB.' : 'Please take a photo under 12 MB.')
      return
    }
    setBusy(true)
    setError('')

    if (kind === 'video') {
      const objectUrl = URL.createObjectURL(file)
      onCapture(objectUrl, file.type || 'video/mp4')
      setBusy(false)
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const result = String(reader.result || '')
      if (!result.startsWith('data:image/')) {
        setError('We could not read that photo. Please try again.')
        setBusy(false)
        return
      }
      // Shrink real phone photos (often 5-10MB) before they're uploaded --
      // faster on mobile data, smaller Supabase storage usage, faster to
      // load later when someone views the listing.
      const resized = await resizeImageDataUrl(result, 1280, 0.82)
      onCapture(resized, 'image/jpeg')
      setBusy(false)
    }
    reader.onerror = () => {
      setBusy(false)
      setError('We could not read that photo. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={openCamera} disabled={busy}>
        {busy ? 'Adding capture…' : kind === 'photo' ? `📷 Take ${label} photo` : '🎥 Record walkthrough'}
      </button>
      <input
        ref={input}
        type="file"
        accept={kind === 'photo' ? 'image/*' : 'video/*'}
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {error && <div className="notice" style={{ marginTop: 8, color: '#b3261e' }}>{error}</div>}
    </div>
  )
}
