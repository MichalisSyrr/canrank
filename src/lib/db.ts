import Dexie, { type Table } from 'dexie'
import type { Drink } from '../data/catalog'

export const SUB_KEYS = ['taste', 'sweetness', 'aftertaste', 'design'] as const
export type SubKey = (typeof SUB_KEYS)[number]
export const SUB_LABEL: Record<SubKey, string> = {
  taste: 'Taste',
  sweetness: 'Sweetness',
  aftertaste: 'Aftertaste',
  design: 'Can design',
}
export type SubScores = Partial<Record<SubKey, number>>

export interface Rating {
  drinkId: string
  /** 1 to 10 in half steps. */
  rating: number
  sub?: SubScores
  note?: string
  updatedAt: number
}

export interface Friend {
  id: string
  name: string
  importedAt: number
  exportedAt: number
  source: 'file' | 'qr'
  ratings: Rating[]
  wishlist: string[]
  custom: Drink[]
}

class AppDB extends Dexie {
  ratings!: Table<Rating, string>
  wishlist!: Table<{ drinkId: string; addedAt: number }, string>
  custom!: Table<Drink, string>
  friends!: Table<Friend, string>

  constructor() {
    super('canrank')
    this.version(1).stores({
      ratings: 'drinkId',
      wishlist: 'drinkId',
      custom: 'id',
      friends: 'id',
    })
  }
}

export const db = new AppDB()

// Ask the browser not to evict our data under storage pressure (best effort).
void navigator.storage?.persist?.()

export interface Profile {
  id: string
  name: string
}

const PROFILE_KEY = 'canrank.profile'

export function getProfile(): Profile {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null')
    if (p && typeof p.id === 'string' && typeof p.name === 'string') return p
  } catch {
    // fall through and create a fresh profile
  }
  const p: Profile = { id: crypto.randomUUID(), name: '' }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  return p
}

export function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  window.dispatchEvent(new Event('canrank-profile'))
}

export function clampRating(n: number): number {
  return Math.min(10, Math.max(1, Math.round(n * 2) / 2))
}

export async function setRating(drinkId: string, patch: Partial<Omit<Rating, 'drinkId' | 'updatedAt'>>) {
  await db.transaction('rw', db.ratings, db.wishlist, async () => {
    const prev = await db.ratings.get(drinkId)
    const rating = patch.rating ?? prev?.rating
    if (rating == null) return
    await db.ratings.put({ ...prev, ...patch, drinkId, rating: clampRating(rating), updatedAt: Date.now() })
    await db.wishlist.delete(drinkId)
  })
}

export async function toggleWishlist(drinkId: string) {
  const has = await db.wishlist.get(drinkId)
  if (has) await db.wishlist.delete(drinkId)
  else await db.wishlist.put({ drinkId, addedAt: Date.now() })
}
