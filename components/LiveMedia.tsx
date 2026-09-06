'use client'

import { useRef, useState } from 'react'

type Mode = 'photos' | 'video'

type Props = {
  mode: Mode
  label?: string
  onPhotoCapture: (dataUrl: string) => void
  onVideoCapture: (dataUrl: string, mimeType: string) => void
}

/**
 * Hama deliberately uses the device camera capture control instead of a normal
 * gallery picker. On phones, `capture="environment"` asks the browser to use
 * the rear camera. We do not expose a separate gallery button.
 */
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
    // Allow the same room to be retaken after a rejection.
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
        onPhotoCapture(result)
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
