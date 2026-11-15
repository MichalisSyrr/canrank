import { CATALOG_SOURCE } from './catalogSource'
import images from './images.json'

export type Region = 'U' | 'E' | 'J'

export interface Drink {
  id: string
  brand: string
  line: string
  name: string
  sugarFree: boolean
  discontinued: boolean
  regions: Region[]
  flavors: string[]
  color: string
  accent: string
  year?: number
  /** Other names the same drink is or was sold under. */
  aka?: string[]
  /** Official product photo, when one is known. */
  img?: string
  /** Higher-resolution version for the detail view, when the source offers one. */
  imgLg?: string
  /** Data URL photo, custom drinks only. */
  photo?: string
  custom?: boolean
  /** For friends' custom drinks: who added it. */
  owner?: string
}

export const REGION_LABEL: Record<Region, string> = {
  U: 'North America',
  E: 'Europe',
  J: 'Japan / Asia',
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Old id -> current id. Add an entry whenever a catalog drink is renamed. */
const ID_ALIASES: Record<string, string> = {
  'monster-papillon': 'monster-monarch',
  'monster-lewis-hamilton-zero-sugar': 'monster-top-speed-zero-sugar',
  'monster-khaos-original-50-juice': 'monster-khaotic',
  'monster-m-80': 'monster-ripper',
  'monster-mixxd': 'monster-mixxd-punch',
  'monster-maxx-super-dry': 'monster-nitro-super-dry',
  'monster-ultra-white-zero-ultra': 'monster-ultra-white',
  'red-bull-amber-edition-strawberry-apricot': 'red-bull-apricot-edition-apricot-strawberry',
  'red-bull-green-edition-dragon-fruit': 'red-bull-green-edition-cactus-fruit',
  'red-bull-winter-edition-pear-cinnamon': 'red-bull-ruby-edition-spiced-pear',
  'red-bull-summer-edition-kiwi-twist': 'red-bull-green-edition-kiwi-apple',
  'rockstar-pure-zero-mango-guava': 'rockstar-pure-zero-tangerine-mango-guava-strawberry',
  'nos-loaded-cherry': 'nos-cherried-out',
}

export function resolveId(id: string): string {
  return ID_ALIASES[id] ?? id
}

const imageMap = images as Record<string, string>

function parse(): Drink[] {
  const out: Drink[] = []
  let brand = ''
  let line = ''
  for (const raw of CATALOG_SOURCE.split('\n')) {
    const row = raw.trim()
    if (!row) continue
    if (row.startsWith('#')) {
      brand = row.slice(1).trim()
      continue
    }
    if (row.startsWith('>')) {
      line = row.slice(1).split('|')[0].trim()
      continue
    }
    const [name, flags = '', flavors = '', colors = '', year = '', aka = ''] = row.split('|').map((p) => p.trim())
    const [color = '#222222', accent = '#ffffff'] = colors.split(',')
    const global = flags.includes('G')
    const regions = (['U', 'E', 'J'] as Region[]).filter((r) => global || flags.includes(r))
    const id = slug(name.toLowerCase().startsWith(brand.toLowerCase()) ? name : `${brand} ${name}`)
    out.push({
      id,
      brand,
      line,
      name,
      sugarFree: flags.includes('s'),
      discontinued: flags.includes('x'),
      regions,
      flavors: flavors ? flavors.split(',') : [],
      color,
      accent,
      year: year ? Number(year) : undefined,
      aka: aka ? aka.split(';').map((a) => a.trim()) : undefined,
      img: imageMap[id],
      imgLg: imageMap[id]?.replace('/m/260x0', '/m/520x0'),
    })
  }
  return out
}

export const CATALOG: Drink[] = parse()
export const CATALOG_BY_ID = new Map(CATALOG.map((d) => [d.id, d]))

/** 24-bit FNV-1a, used to reference catalog drinks compactly in QR codes. */
export function hash24(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return ((h >>> 24) ^ h) & 0xffffff
}

export const CATALOG_BY_HASH = new Map(CATALOG.map((d) => [hash24(d.id), d]))
// QR codes made before a merge still carry the old id's hash.
for (const [old, id] of Object.entries(ID_ALIASES)) {
  const d = CATALOG_BY_ID.get(id)
  if (d && !CATALOG_BY_HASH.has(hash24(old))) CATALOG_BY_HASH.set(hash24(old), d)
}

if (import.meta.env.DEV) {
  if (CATALOG_BY_ID.size !== CATALOG.length) console.error('Catalog has duplicate ids')
  if (CATALOG_BY_HASH.size !== CATALOG.length + Object.keys(ID_ALIASES).length) console.error('Catalog has a QR hash collision')
  for (const id of Object.values(ID_ALIASES)) if (!CATALOG_BY_ID.has(id)) console.error(`Alias points at a missing drink: ${id}`)
}
