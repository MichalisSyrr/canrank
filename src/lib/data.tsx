import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CATALOG, resolveId, type Drink } from '../data/catalog'
import { db, getProfile, type Friend, type Profile, type Rating } from './db'

export interface Person {
  id: string
  name: string
  isMe: boolean
  ratings: Map<string, Rating>
  wishlist: Set<string>
}

interface Data {
  ready: boolean
  profile: Profile
  me: Person
  friends: Friend[]
  /** Me first, then friends by name. */
  people: Person[]
  drinks: Drink[]
  drinkById: Map<string, Drink>
}

const Ctx = createContext<Data | null>(null)

/** Index ratings by current drink id. If two old ids were merged into one drink, the newer rating wins. */
function byDrink(ratings: Rating[]): Map<string, Rating> {
  const m = new Map<string, Rating>()
  for (const r of ratings) {
    const id = resolveId(r.drinkId)
    const prev = m.get(id)
    if (!prev || r.updatedAt >= prev.updatedAt) m.set(id, id === r.drinkId ? r : { ...r, drinkId: id })
  }
  return m
}

export function useProfile(): Profile {
  const [p, setP] = useState(getProfile)
  useEffect(() => {
    const on = () => setP(getProfile())
    window.addEventListener('canrank-profile', on)
    return () => window.removeEventListener('canrank-profile', on)
  }, [])
  return p
}

export function DataProvider({ children }: { children: ReactNode }) {
  const profile = useProfile()
  const ratings = useLiveQuery(() => db.ratings.toArray())
  const wishlist = useLiveQuery(() => db.wishlist.toArray())
  const custom = useLiveQuery(() => db.custom.toArray())
  const friends = useLiveQuery(() => db.friends.toArray())

  const value = useMemo<Data>(() => {
    const me: Person = {
      id: profile.id,
      name: profile.name || 'Me',
      isMe: true,
      ratings: byDrink(ratings ?? []),
      wishlist: new Set((wishlist ?? []).map((w) => resolveId(w.drinkId))),
    }
    const fs = [...(friends ?? [])].sort((a, b) => a.name.localeCompare(b.name))
    const people: Person[] = [
      me,
      ...fs.map((f) => ({
        id: f.id,
        name: f.name,
        isMe: false,
        ratings: byDrink(f.ratings),
        wishlist: new Set(f.wishlist.map(resolveId)),
      })),
    ]
    const drinkById = new Map(CATALOG.map((d) => [d.id, d]))
    for (const f of fs) for (const c of f.custom) if (!drinkById.has(c.id)) drinkById.set(c.id, { ...c, owner: f.name })
    for (const c of custom ?? []) drinkById.set(c.id, c)
    return {
      ready: !!(ratings && wishlist && custom && friends),
      profile,
      me,
      friends: fs,
      people,
      drinks: [...drinkById.values()],
      drinkById,
    }
  }, [profile, ratings, wishlist, custom, friends])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData(): Data {
  const d = useContext(Ctx)
  if (!d) throw new Error('useData outside DataProvider')
  return d
}

/** useState that remembers its value in localStorage. */
export function useStored<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`canrank.${key}`)
      return raw == null ? initial : { ...initial, ...JSON.parse(raw) }
    } catch {
      return initial
    }
  })
  return [
    v,
    (next: T) => {
      setV(next)
      localStorage.setItem(`canrank.${key}`, JSON.stringify(next))
    },
  ]
}
