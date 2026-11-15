import { CATALOG_BY_HASH, CATALOG_BY_ID, hash24, resolveId, type Drink } from '../data/catalog'
import { clampRating, db, getProfile, SUB_KEYS, type Friend, type Rating, type SubScores } from './db'

export interface ExportFile {
  app: 'canrank'
  v: 1
  user: { id: string; name: string }
  exportedAt: number
  ratings: Rating[]
  wishlist: string[]
  custom: Drink[]
}

export async function buildExport(): Promise<ExportFile> {
  const [ratings, wishlist, custom] = await Promise.all([
    db.ratings.toArray(),
    db.wishlist.toArray(),
    db.custom.toArray(),
  ])
  const p = getProfile()
  return {
    app: 'canrank',
    v: 1,
    user: { id: p.id, name: p.name || 'Anonymous' },
    exportedAt: Date.now(),
    ratings,
    wishlist: wishlist.map((w) => w.drinkId),
    custom,
  }
}

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '')
const HEX = /^#[0-9a-f]{3,8}$/i

function cleanRating(r: unknown): Rating | null {
  if (!r || typeof r !== 'object') return null
  const o = r as Record<string, unknown>
  if (typeof o.drinkId !== 'string' || typeof o.rating !== 'number' || !Number.isFinite(o.rating)) return null
  const out: Rating = {
    drinkId: resolveId(o.drinkId.slice(0, 120)),
    rating: clampRating(o.rating),
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : 0,
  }
  if (o.note) out.note = str(o.note, 1000)
  if (o.sub && typeof o.sub === 'object') {
    const sub: SubScores = {}
    for (const k of SUB_KEYS) {
      const v = (o.sub as Record<string, unknown>)[k]
      if (typeof v === 'number' && Number.isFinite(v)) sub[k] = clampRating(v)
    }
    if (Object.keys(sub).length) out.sub = sub
  }
  return out
}

function cleanCustom(d: unknown, owner: string): Drink | null {
  if (!d || typeof d !== 'object') return null
  const o = d as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.name !== 'string' || !o.name.trim()) return null
  // A custom drink may never shadow a built-in one.
  if (CATALOG_BY_ID.has(o.id) || !o.id.startsWith('c-')) return null
  const photo = typeof o.photo === 'string' && o.photo.startsWith('data:image/') && o.photo.length < 600_000 ? o.photo : undefined
  return {
    id: o.id.slice(0, 120),
    brand: str(o.brand, 60) || 'Other',
    line: 'Custom',
    name: str(o.name, 100),
    sugarFree: o.sugarFree === true,
    discontinued: o.discontinued === true,
    regions: [],
    flavors: Array.isArray(o.flavors) ? o.flavors.filter((f) => typeof f === 'string').slice(0, 8) : [],
    color: HEX.test(str(o.color, 9)) ? (o.color as string) : '#333333',
    accent: HEX.test(str(o.accent, 9)) ? (o.accent as string) : '#ffffff',
    photo,
    custom: true,
    owner,
  }
}

/** Validates untrusted JSON text. Throws an Error with a user-facing message. */
export function parseImport(text: string): ExportFile {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const o = data as Record<string, unknown>
  if (!o || o.app !== 'canrank') throw new Error('That is not a CanRank export.')
  if (o.v !== 1) throw new Error('This export was made by a newer version of the app. Update first.')
  const user = o.user as Record<string, unknown> | undefined
  if (!user || typeof user.id !== 'string' || !user.id) throw new Error('The export has no user id.')
  const name = str(user.name, 40) || 'Friend'
  const ratings = (Array.isArray(o.ratings) ? o.ratings : []).map(cleanRating).filter((r): r is Rating => !!r)
  return {
    app: 'canrank',
    v: 1,
    user: { id: user.id.slice(0, 64), name },
    exportedAt: typeof o.exportedAt === 'number' ? o.exportedAt : Date.now(),
    ratings,
    wishlist: (Array.isArray(o.wishlist) ? o.wishlist : [])
      .filter((w): w is string => typeof w === 'string')
      .map((w) => resolveId(w.slice(0, 120))),
    custom: (Array.isArray(o.custom) ? o.custom : [])
      .map((c) => cleanCustom(c, name))
      .filter((c): c is Drink => !!c),
  }
}

export type ImportResult =
  | { kind: 'self' }
  | { kind: 'added' | 'updated' | 'older'; friend: Friend }

/** Adds the friend, or replaces their previous data if we already have them. */
export async function importFriend(file: ExportFile, source: Friend['source'], allowOlder = false): Promise<ImportResult> {
  if (file.user.id === getProfile().id) return { kind: 'self' }
  const prev = await db.friends.get(file.user.id)
  const friend: Friend = {
    id: file.user.id,
    name: file.user.name,
    importedAt: Date.now(),
    exportedAt: file.exportedAt,
    source,
    ratings: file.ratings,
    wishlist: file.wishlist,
    // A QR code carries no custom drinks; keep the ones from an earlier file import.
    custom: source === 'qr' && prev ? prev.custom : file.custom,
  }
  if (prev && prev.exportedAt > file.exportedAt && !allowOlder) return { kind: 'older', friend }
  if (source === 'qr' && prev) {
    // QR codes carry no notes or sub-scores either: keep those where the score is unchanged.
    const old = new Map(prev.ratings.map((r) => [r.drinkId, r]))
    friend.ratings = file.ratings.map((r) => {
      const o = old.get(r.drinkId)
      return o && o.rating === r.rating ? { ...o } : r
    })
    const known = new Set(file.ratings.map((r) => r.drinkId))
    const customIds = new Set(prev.custom.map((c) => c.id))
    friend.ratings.push(...prev.ratings.filter((r) => customIds.has(r.drinkId) && !known.has(r.drinkId)))
  }
  await db.friends.put(friend)
  return { kind: prev ? 'updated' : 'added', friend }
}

/** Replaces this device's own data with a backup made from the same profile. */
export async function restoreOwn(file: ExportFile) {
  await db.transaction('rw', db.ratings, db.wishlist, db.custom, async () => {
    await Promise.all([db.ratings.clear(), db.wishlist.clear(), db.custom.clear()])
    await db.ratings.bulkPut(file.ratings)
    await db.wishlist.bulkPut(file.wishlist.map((drinkId) => ({ drinkId, addedAt: Date.now() })))
    await db.custom.bulkPut(file.custom.map((c) => ({ ...c, owner: undefined })))
  })
}

export async function shareFile(file: ExportFile) {
  const safe = file.user.name.replace(/[^\w-]+/g, '_') || 'me'
  const name = `canrank-${safe}.json`
  const blob = new Blob([JSON.stringify(file)], { type: 'application/json' })
  const f = new File([blob], name, { type: 'application/json' })
  if (navigator.canShare?.({ files: [f] })) {
    try {
      await navigator.share({ files: [f], title: 'My energy drink ratings' })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      // otherwise fall back to a plain download
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
}

// ---- QR transfer -----------------------------------------------------------
// Binary payload (no notes, sub-scores or custom drinks, to keep codes small):
//   [1] version  [16] user uuid  [1] name length  [n] name utf-8
//   [4] exportedAt (seconds)  [2] entry count
//   entries: [3] drink hash  [1] value (0 = wishlist, otherwise rating * 2)
// The base64url text is split into parts "EDR1.<index>.<total>.<chunk>".

const QR_PREFIX = 'EDR1'
const QR_CHUNK = 500

function b64urlEncode(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

export function encodeQR(file: ExportFile): { parts: string[]; skipped: number } {
  const entries: [number, number][] = []
  let skipped = 0
  for (const r of file.ratings) {
    if (CATALOG_BY_ID.has(r.drinkId)) entries.push([hash24(r.drinkId), Math.round(r.rating * 2)])
    else skipped++
  }
  for (const w of file.wishlist) if (CATALOG_BY_ID.has(w)) entries.push([hash24(w), 0])

  const hex = file.user.id.replace(/-/g, '')
  if (!/^[0-9a-f]{32}$/i.test(hex)) throw new Error('Profile id is not a UUID')
  const name = new TextEncoder().encode(file.user.name).slice(0, 60)
  const bytes = new Uint8Array(1 + 16 + 1 + name.length + 4 + 2 + entries.length * 4)
  const view = new DataView(bytes.buffer)
  let o = 0
  bytes[o++] = 1
  for (let i = 0; i < 16; i++) bytes[o++] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  bytes[o++] = name.length
  bytes.set(name, o)
  o += name.length
  view.setUint32(o, Math.floor(file.exportedAt / 1000))
  o += 4
  view.setUint16(o, entries.length)
  o += 2
  for (const [h, v] of entries) {
    bytes[o++] = h >>> 16
    bytes[o++] = (h >>> 8) & 0xff
    bytes[o++] = h & 0xff
    bytes[o++] = v
  }
  const text = b64urlEncode(bytes)
  const total = Math.max(1, Math.ceil(text.length / QR_CHUNK))
  const parts = Array.from(
    { length: total },
    (_, i) => `${QR_PREFIX}.${i + 1}.${total}.${text.slice(i * QR_CHUNK, (i + 1) * QR_CHUNK)}`,
  )
  return { parts, skipped }
}

export function parseQRPart(text: string): { index: number; total: number; chunk: string } | null {
  const m = /^EDR1\.(\d+)\.(\d+)\.([\w-]*)$/.exec(text)
  if (!m) return null
  const index = Number(m[1])
  const total = Number(m[2])
  if (index < 1 || index > total || total > 50) return null
  return { index, total, chunk: m[3] }
}

export function decodeQR(chunks: string[]): ExportFile {
  let bytes: Uint8Array
  try {
    bytes = b64urlDecode(chunks.join(''))
  } catch {
    throw new Error('The QR code could not be read.')
  }
  const view = new DataView(bytes.buffer)
  try {
    let o = 0
    if (bytes[o++] !== 1) throw new Error('version')
    const hex = Array.from(bytes.slice(o, o + 16), (b) => b.toString(16).padStart(2, '0')).join('')
    o += 16
    const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    const nameLen = bytes[o++]
    const name = new TextDecoder().decode(bytes.slice(o, o + nameLen)) || 'Friend'
    o += nameLen
    const exportedAt = view.getUint32(o) * 1000
    o += 4
    const count = view.getUint16(o)
    o += 2
    if (bytes.length !== o + count * 4) throw new Error('length')
    const ratings: Rating[] = []
    const wishlist: string[] = []
    for (let i = 0; i < count; i++, o += 4) {
      const drink = CATALOG_BY_HASH.get((bytes[o] << 16) | (bytes[o + 1] << 8) | bytes[o + 2])
      if (!drink) continue // a drink this app version does not know yet
      const v = bytes[o + 3]
      if (v === 0) wishlist.push(drink.id)
      else ratings.push({ drinkId: drink.id, rating: clampRating(v / 2), updatedAt: exportedAt })
    }
    return { app: 'canrank', v: 1, user: { id, name }, exportedAt, ratings, wishlist, custom: [] }
  } catch {
    throw new Error('The QR code is damaged or from a newer app version.')
  }
}
