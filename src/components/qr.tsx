import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { decodeQR, parseQRPart, type ExportFile } from '../lib/share'

/** Shows the parts one after another; a single part just stays put. */
export function QRShow({ parts }: { parts: string[] }) {
  const [urls, setUrls] = useState<string[]>([])
  const [i, setI] = useState(0)

  useEffect(() => {
    let live = true
    Promise.all(parts.map((p) => QRCode.toDataURL(p, { errorCorrectionLevel: 'L', margin: 2, scale: 6 }))).then(
      (u) => live && setUrls(u),
    )
    return () => { live = false }
  }, [parts])

  useEffect(() => {
    if (parts.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % parts.length), 700)
    return () => clearInterval(t)
  }, [parts.length])

  if (!urls.length) return <p className="muted">Building code…</p>
  return (
    <div className="qr-show">
      {/* QR codes need a white background whatever the theme. */}
      <img src={urls[i % urls.length]} alt="QR code with your ratings" />
      {parts.length > 1 && (
        <p className="muted small">
          Code {(i % urls.length) + 1} of {parts.length}. Keep the screen steady: your friend's phone collects them all automatically.
        </p>
      )}
    </div>
  )
}

export function QRScan({ onResult }: { onResult: (file: ExportFile) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<[number, number]>([0, 0])
  const done = useRef(onResult)
  done.current = onResult

  useEffect(() => {
    let stream: MediaStream | undefined
    let raf = 0
    let stopped = false
    const chunks = new Map<number, string>()
    let total = 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!

    const tick = () => {
      if (stopped) return
      const v = video.current
      if (v && v.readyState >= 2 && v.videoWidth) {
        // Scan at reduced size: plenty for a QR code and much faster.
        const scale = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight))
        canvas.width = Math.round(v.videoWidth * scale)
        canvas.height = Math.round(v.videoHeight * scale)
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const part = parseQRPart(jsQR(img.data, img.width, img.height)?.data ?? '')
        if (part) {
          if (part.total !== total) {
            chunks.clear()
            total = part.total
          }
          if (!chunks.has(part.index)) {
            chunks.set(part.index, part.chunk)
            setProgress([chunks.size, total])
          }
          if (chunks.size === total) {
            try {
              done.current(decodeQR(Array.from({ length: total }, (_, k) => chunks.get(k + 1)!)))
              return
            } catch (e) {
              setError((e as Error).message)
              chunks.clear()
            }
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open the camera here. Use the JSON file instead.')
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then((s) => {
          if (stopped) return s.getTracks().forEach((t) => t.stop())
          stream = s
          if (video.current) {
            video.current.srcObject = s
            void video.current.play().catch(() => {})
          }
          raf = requestAnimationFrame(tick)
        })
        .catch(() => setError('Camera access was blocked. Allow the camera for this site, or use the JSON file instead.'))
    }

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="qr-scan">
      <video ref={video} playsInline muted />
      {error ? (
        <p className="error" role="alert">{error}</p>
      ) : (
        <p className="muted small">
          {progress[1] > 1 ? `Collected ${progress[0]} of ${progress[1]} codes…` : "Point the camera at your friend's code."}
        </p>
      )}
    </div>
  )
}
