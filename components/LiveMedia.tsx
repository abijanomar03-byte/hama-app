
'use client'

import { useRef, useState } from 'react'

type Mode = 'photos' | 'video'

type Props = {
  mode: Mode
  label?: string
  onPhotoCapture: (dataUrl: string) => void
  onVideoCapture: (dataUrl: string, mimeType: string) => void
}

/** Resizes+recompresses a captured photo so it stays well under serverless
 *  request-size limits (a full-resolution phone photo can be 5-10MB, which
 *  inflates further once base64-encoded). Returns a JPEG data URL. */
function resizeImageDataUrl(dataUrl: string, maxDimension: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height / width) * maxDimension)
            width = maxDimension
          } else {
            width = Math.round((width / height) * maxDimension)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(dataUrl); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function LiveMedia({ mode, label, onPhotoCapture, onVideoCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(
    mode === 'photos'
      ? `Use your phone camera to take the ${label || 'room'} photo.`
      : 'Use your phone camera to record one short walkthrough.'
  )

  const openPhoneCamera = () => inputRef.current?.click()

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBusy(true)
    try {
      if (mode === 'photos') {
        if (!file.type.startsWith('image/')) {
          setStatus('Please take a photo with your phone camera.')
          return
        }
        setStatus('Adding your camera photo…')
      } else {
        if (!file.type.startsWith('video/')) {
          setStatus('Please record a video with your phone camera.')
          return
        }
        setStatus('Adding your walkthrough video…')
      }

      const result = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unreadable capture'))
        reader.onerror = () => reject(reader.error || new Error('Could not read capture'))
        reader.readAsDataURL(file)
      })

      if (mode === 'photos') {
        const resized = await resizeImageDataUrl(result, 1280, 0.82)
        onPhotoCapture(resized)
        setStatus('✓ Camera photo captured.')
      } else {
        onVideoCapture(result, file.type || 'video/mp4')
        setStatus('✓ Walkthrough captured.')
      }
    } catch {
      setStatus('Could not read that capture. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 10 }}
        disabled={busy}
        onClick={openPhoneCamera}
      >
        {busy ? 'Processing…' : mode === 'photos' ? `📷 Take ${label || 'room'} photo` : '🎥 Record walkthrough'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={mode === 'photos' ? 'image/*' : 'video/*'}
        capture="environment"
        onChange={handleCapture}
        style={{ display: 'none' }}
      />
      <div className="status" style={{ marginTop: 10 }}>{status}</div>
    </div>
  )
}