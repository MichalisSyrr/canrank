import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanArt, MultiChips } from '../components/ui'
import { slug, type Drink } from '../data/catalog'
import { useData } from '../lib/data'
import { db } from '../lib/db'

/** Downscale a picked photo so exports stay small (roughly 30 to 60 KB each). */
async function toDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 480 / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.75)
}

export default function AddDrinkPage() {
  const nav = useNavigate()
  const { drinks, profile } = useData()
  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  const [sugarFree, setSugarFree] = useState(false)
  const [discontinued, setDiscontinued] = useState(false)
  const [flavors, setFlavors] = useState<string[]>([])
  const [color, setColor] = useState('#2a2a2a')
  const [accent, setAccent] = useState('#8cd600')
  const [photo, setPhoto] = useState<string>()
  const [error, setError] = useState('')

  const { brands, flavorOptions } = useMemo(
    () => ({
      brands: [...new Set(drinks.map((d) => d.brand))].sort(),
      flavorOptions: [...new Set(drinks.flatMap((d) => d.flavors))].sort(),
    }),
    [drinks],
  )

  const preview: Drink = {
    id: 'preview', brand: brand || '?', line: 'Custom', name, sugarFree, discontinued,
    regions: [], flavors, color, accent, photo, custom: true,
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const b = brand.trim()
    const n = name.trim()
    if (!b || !n) return setError('Enter a brand and a name.')
    const dupe = drinks.find((d) => slug(d.name) === slug(n) || slug(d.name) === slug(`${b} ${n}`))
    if (dupe && !confirm(`"${dupe.name}" is already in the list. Add yours anyway?`)) return
    const id = `c-${profile.id.slice(0, 8)}-${slug(`${b} ${n}`)}-${Date.now().toString(36)}`
    await db.custom.put({ ...preview, id, brand: b, name: n })
    nav(`/drink/${encodeURIComponent(id)}`, { replace: true })
  }

  return (
    <>
      <header className="page-head">
        <button type="button" className="btn" onClick={() => nav(-1)}>‹ Back</button>
        <h1>Add a drink</h1>
      </header>
      <form className="card form" onSubmit={(e) => void submit(e)}>
        <p className="muted small">Custom drinks are included in your JSON export, so friends get them when they import you.</p>
        <label className="field">
          <span>Brand</span>
          <input list="brands" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={60} required />
          <datalist id="brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
        </label>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="e.g. Monster Ultra Something" required />
        </label>
        <label className="check"><input type="checkbox" checked={sugarFree} onChange={(e) => setSugarFree(e.target.checked)} /> Sugar free</label>
        <label className="check"><input type="checkbox" checked={discontinued} onChange={(e) => setDiscontinued(e.target.checked)} /> Discontinued</label>
        <div className="field">
          <span>Flavors</span>
          <MultiChips label="Flavors" options={flavorOptions} value={flavors} onChange={setFlavors} />
        </div>
        <div className="photo-row">
          <CanArt drink={preview} large />
          <div>
            <label className="field">
              <span>Photo (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) toDataUrl(f).then(setPhoto, () => setError('That image could not be read.'))
                }}
              />
            </label>
            {photo ? (
              <button type="button" className="link" onClick={() => setPhoto(undefined)}>Remove photo</button>
            ) : (
              <div className="colors">
                <label>Can <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
                <label>Label <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} /></label>
              </div>
            )}
          </div>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn primary block">Add drink</button>
      </form>
    </>
  )
}
