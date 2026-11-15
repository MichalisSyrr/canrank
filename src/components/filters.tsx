import { useMemo } from 'react'
import { REGION_LABEL, type Drink, type Region } from '../data/catalog'
import { Chips, MultiChips } from './ui'

export interface Scope {
  brands: string[]
  sugar: 'all' | 'free' | 'sugar'
  status: 'all' | 'current' | 'disc'
  flavors: string[]
  region: 'all' | Region
}

export const EMPTY_SCOPE: Scope = { brands: [], sugar: 'all', status: 'all', flavors: [], region: 'all' }

export function inScope(d: Drink, s: Scope): boolean {
  if (s.brands.length && !s.brands.includes(d.brand)) return false
  if (s.sugar === 'free' && !d.sugarFree) return false
  if (s.sugar === 'sugar' && d.sugarFree) return false
  if (s.status === 'current' && d.discontinued) return false
  if (s.status === 'disc' && !d.discontinued) return false
  if (s.flavors.length && !s.flavors.some((f) => d.flavors.includes(f))) return false
  // Custom drinks carry no region, so a region filter never hides them.
  if (s.region !== 'all' && d.regions.length && !d.regions.includes(s.region)) return false
  return true
}

export function scopeCount(s: Scope): number {
  return (
    s.brands.length +
    s.flavors.length +
    (s.sugar !== 'all' ? 1 : 0) +
    (s.status !== 'all' ? 1 : 0) +
    (s.region !== 'all' ? 1 : 0)
  )
}

export function ScopeFields({ drinks, scope, onChange }: { drinks: Drink[]; scope: Scope; onChange: (s: Scope) => void }) {
  const { brands, flavors } = useMemo(() => {
    const count = new Map<string, number>()
    const fl = new Set<string>()
    for (const d of drinks) {
      count.set(d.brand, (count.get(d.brand) ?? 0) + 1)
      d.flavors.forEach((f) => fl.add(f))
    }
    return {
      // Biggest ranges first, so Monster and Red Bull lead.
      brands: [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([b]) => b),
      flavors: [...fl].sort(),
    }
  }, [drinks])

  return (
    <>
      <h3>Sugar</h3>
      <Chips
        label="Sugar"
        value={scope.sugar}
        onChange={(sugar) => onChange({ ...scope, sugar })}
        options={[['all', 'All'], ['free', 'Sugar free'], ['sugar', 'With sugar']]}
      />
      <h3>Availability</h3>
      <Chips
        label="Availability"
        value={scope.status}
        onChange={(status) => onChange({ ...scope, status })}
        options={[['all', 'All'], ['current', 'Still sold'], ['disc', 'Discontinued']]}
      />
      <h3>Region</h3>
      <Chips
        label="Region"
        value={scope.region}
        onChange={(region) => onChange({ ...scope, region })}
        options={[['all', 'Anywhere'], ['E', REGION_LABEL.E], ['U', REGION_LABEL.U], ['J', REGION_LABEL.J]]}
      />
      <h3>Brand</h3>
      <MultiChips label="Brand" options={brands} value={scope.brands} onChange={(b) => onChange({ ...scope, brands: b })} />
      <h3>Flavor</h3>
      <MultiChips label="Flavor" options={flavors} value={scope.flavors} onChange={(f) => onChange({ ...scope, flavors: f })} />
      <button type="button" className="btn block" disabled={!scopeCount(scope)} onClick={() => onChange(EMPTY_SCOPE)}>
        Clear filters
      </button>
    </>
  )
}
