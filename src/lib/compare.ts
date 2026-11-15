import type { Drink } from '../data/catalog'
import type { Person } from './data'

export interface GroupRow {
  drink: Drink
  /** Rating per person, aligned with the people array; undefined when not rated. */
  scores: (number | undefined)[]
  count: number
  avg: number
  spread: number
  stdev: number
}

export function groupRows(people: Person[], drinks: Drink[]): GroupRow[] {
  const rows: GroupRow[] = []
  for (const drink of drinks) {
    const scores = people.map((p) => p.ratings.get(drink.id)?.rating)
    const vals = scores.filter((s): s is number => s != null)
    if (!vals.length) continue
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
    rows.push({
      drink,
      scores,
      count: vals.length,
      avg,
      spread: Math.max(...vals) - Math.min(...vals),
      stdev: Math.sqrt(vals.reduce((a, v) => a + (v - avg) ** 2, 0) / vals.length),
    })
  }
  return rows
}

export interface PairStats {
  common: number
  /** Mean absolute difference over common drinks. */
  diff: number
  /** 0 to 100: 100 means identical scores, 0 means always 9 points apart. */
  match: number
  /** Pearson correlation, or null when there is too little data or no variance. */
  corr: number | null
  /** Average of (a - b): positive means a rates higher. */
  bias: number
}

export function pairStats(a: Person, b: Person, allowed?: Set<string>): PairStats | null {
  const xs: number[] = []
  const ys: number[] = []
  for (const [id, r] of a.ratings) {
    if (allowed && !allowed.has(id)) continue
    const o = b.ratings.get(id)
    if (o) {
      xs.push(r.rating)
      ys.push(o.rating)
    }
  }
  const n = xs.length
  if (!n) return null
  const diff = xs.reduce((s, x, i) => s + Math.abs(x - ys[i]), 0) / n
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
    syy += (ys[i] - my) ** 2
  }
  return {
    common: n,
    diff,
    match: Math.round(100 * (1 - diff / 9)),
    corr: n >= 3 && sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null,
    bias: mx - my,
  }
}

export function average(vals: number[]): number | null {
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export const fmt = (n: number | null | undefined, digits = 1): string =>
  n == null ? '–' : n.toFixed(digits).replace(/\.0$/, digits === 1 ? '' : '.0')

/** Score shown the way it was entered: 7 or 7.5. */
export const fmtScore = (n: number | null | undefined): string => (n == null ? '–' : String(n))

/** Red (1) through amber to green (10). */
export function ratingColor(r: number): string {
  const t = Math.min(1, Math.max(0, (r - 1) / 9))
  return `hsl(${Math.round(t * 125)} 82% 56%)`
}
