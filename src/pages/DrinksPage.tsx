import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EMPTY_SCOPE, inScope, scopeCount, ScopeFields, type Scope } from '../components/filters'
import { Chips, DrinkRow, Empty, Score, Sheet } from '../components/ui'
import { average } from '../lib/compare'
import { useData, useStored } from '../lib/data'

type Mine = 'all' | 'rated' | 'unrated' | 'wish'
type Sort = 'brand' | 'name' | 'mine' | 'friends' | 'new'

interface ListState extends Scope {
  mine: Mine
  sort: Sort
}

const INITIAL: ListState = { ...EMPTY_SCOPE, mine: 'all', sort: 'brand' }

export default function DrinksPage() {
  const { drinks, me, people } = useData()
  const [state, setState] = useStored<ListState>('list', INITIAL)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const friendAvg = useMemo(() => {
    const m = new Map<string, number>()
    const friends = people.filter((p) => !p.isMe)
    for (const d of drinks) {
      const a = average(friends.map((f) => f.ratings.get(d.id)?.rating).filter((v): v is number => v != null))
      if (a != null) m.set(d.id, a)
    }
    return m
  }, [drinks, people])

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    const out = drinks.filter((d) => {
      if (!inScope(d, state)) return false
      const rated = me.ratings.has(d.id)
      if (state.mine === 'rated' && !rated) return false
      if (state.mine === 'unrated' && rated) return false
      if (state.mine === 'wish' && !me.wishlist.has(d.id)) return false
      if (words.length) {
        const hay = `${d.brand} ${d.name} ${d.line} ${d.flavors.join(' ')} ${d.aka?.join(' ') ?? ''}`.toLowerCase()
        if (!words.every((w) => hay.includes(w))) return false
      }
      return true
    })
    const byName = (a: (typeof out)[number], b: (typeof out)[number]) => a.name.localeCompare(b.name)
    const desc = (get: (id: string) => number | undefined) => (a: (typeof out)[number], b: (typeof out)[number]) =>
      (get(b.id) ?? -1) - (get(a.id) ?? -1) || byName(a, b)
    if (state.sort === 'name') out.sort(byName)
    else if (state.sort === 'mine') out.sort(desc((id) => me.ratings.get(id)?.rating))
    else if (state.sort === 'friends') out.sort(desc((id) => friendAvg.get(id)))
    else if (state.sort === 'new') out.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || byName(a, b))
    // 'brand' keeps catalog order: brand, then product line.
    return out
  }, [drinks, state, q, me, friendAvg])

  const active = scopeCount(state)
  const grouped = state.sort === 'brand'

  return (
    <>
      <header className="page-head">
        <h1 className="wordmark">Can<span>Rank</span></h1>
        <Link to="/add" className="btn">+ Add drink</Link>
      </header>

      <div className="toolbar">
        <input
          type="search"
          placeholder={`Search ${drinks.length} drinks`}
          aria-label="Search drinks"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className={`btn${active ? ' primary' : ''}`} onClick={() => setOpen(true)}>
          Filters{active ? ` (${active})` : ''}
        </button>
      </div>

      <Chips
        label="My status"
        value={state.mine}
        onChange={(mine) => setState({ ...state, mine })}
        options={[['all', 'All'], ['rated', 'Rated'], ['unrated', 'Not rated'], ['wish', 'Want to try']]}
      />

      <div className="list-meta">
        <span>{list.length} drinks</span>
        <label>
          Sort{' '}
          <select value={state.sort} onChange={(e) => setState({ ...state, sort: e.target.value as Sort })}>
            <option value="brand">Brand</option>
            <option value="name">Name</option>
            <option value="mine">My rating</option>
            <option value="friends">Friends' average</option>
            <option value="new">Newest</option>
          </select>
        </label>
      </div>

      {list.length === 0 && (
        <Empty>
          No drinks match. <button type="button" className="link" onClick={() => { setState(INITIAL); setQ('') }}>Clear search and filters</button> or{' '}
          <Link to="/add">add a missing drink</Link>.
        </Empty>
      )}

      <div className="list">
        {list.map((d, i) => {
          const mine = me.ratings.get(d.id)?.rating
          const fa = friendAvg.get(d.id)
          const head = grouped && (i === 0 || list[i - 1].brand !== d.brand || list[i - 1].line !== d.line)
          return (
            <div key={d.id} className="list-item">
              {head && <h2 className="group-head">{d.brand}<span>{d.line}</span></h2>}
              <DrinkRow
                drink={d}
                right={
                  <>
                    {fa != null && <span className="friend-avg" title="Friends' average">{fa.toFixed(1)}</span>}
                    {mine != null ? <Score value={mine} /> : me.wishlist.has(d.id) ? <span className="wish-dot" title="Want to try">★</span> : <Score value={null} />}
                  </>
                }
              />
            </div>
          )
        })}
      </div>

      {open && (
        <Sheet title="Filters" onClose={() => setOpen(false)}>
          <ScopeFields drinks={drinks} scope={state} onChange={(s) => setState({ ...state, ...s })} />
        </Sheet>
      )}
    </>
  )
}
