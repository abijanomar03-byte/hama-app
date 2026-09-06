'use client'
import { useRef, useState } from 'react'

export default function LiveCamera({
  label,
  onCapture,
}: {
  label: string
  onCapture: (dataUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('Tap to open your phone camera.')
  const [busy, setBusy] = useState(false)

  const openPhoneCamera = () => {
    inputRef.current?.click()
  }

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setStatus('Adding your live camera photo…')

    if (!file.type.startsWith('image/')) {
      setBusy(false)
      setStatus('Please take a photo with the phone camera.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        setBusy(false)
        setStatus('Could not read the photo. Please try again.')
        return
      }
      onCapture(result)
      setBusy(false)
      setStatus('✓ Photo captured from your phone camera.')
    }
    reader.onerror = () => {
      setBusy(false)
      setStatus('Could not read the photo. Please try again.')
    }
    reader.readAsDataURL(file)
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
        {busy ? 'Adding photo…' : `📷 Take ${label} photo`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ display: 'none' }}
      />
      <div className="status" style={{ marginTop: 10 }}>{status}</div>
    </div>
  )
}
