import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EMPTY_SCOPE, inScope, scopeCount, ScopeFields, type Scope } from '../components/filters'
import { Chips, DrinkRow, Empty, Score, Sheet } from '../components/ui'
import type { Drink } from '../data/catalog'
import { average, fmtScore, groupRows, pairStats, ratingColor, type GroupRow } from '../lib/compare'
import { useData, useStored, type Person } from '../lib/data'

type Mode = 'board' | 'h2h' | 'matrix' | 'match' | 'recs' | 'brands'
type BoardSort = 'top' | 'bottom' | 'divisive' | 'agreed' | 'popular'

interface State {
  /** Ids of people left out of the comparison. */
  excluded: string[]
  scope: Scope
  mode: Mode
  sort: BoardSort
  minRaters: number
  a: string
  b: string
}

const INITIAL: State = { excluded: [], scope: EMPTY_SCOPE, mode: 'board', sort: 'top', minRaters: 1, a: '', b: '' }
const LIMIT = 100

export default function ComparePage() {
  const { people, drinks, friends } = useData()
  const [st, setSt] = useStored<State>('compare', INITIAL)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const selected = useMemo(() => people.filter((p) => !st.excluded.includes(p.id)), [people, st.excluded])
  const scoped = useMemo(() => drinks.filter((d) => inScope(d, st.scope)), [drinks, st.scope])
  const scopedIds = useMemo(() => new Set(scoped.map((d) => d.id)), [scoped])
  const rows = useMemo(() => groupRows(selected, scoped), [selected, scoped])

  if (friends.length === 0) {
    return (
      <>
        <header className="page-head"><h1>Compare</h1></header>
        <Empty>Add a friend first: go to <Link to="/friends">Friends</Link> and import their file or scan their code.</Empty>
      </>
    )
  }

  const active = scopeCount(st.scope)
  const toggle = (id: string) =>
    setSt({ ...st, excluded: st.excluded.includes(id) ? st.excluded.filter((x) => x !== id) : [...st.excluded, id] })

  return (
    <>
      <header className="page-head">
        <h1>Compare</h1>
        <button type="button" className={`btn${active ? ' primary' : ''}`} onClick={() => setFiltersOpen(true)}>
          Filters{active ? ` (${active})` : ''}
        </button>
      </header>

      <div className="chips wrap" role="group" aria-label="People to include">
        {people.map((p) => {
          const on = !st.excluded.includes(p.id)
          return (
            <button key={p.id} type="button" className={`chip person${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggle(p.id)}>
              {p.isMe ? `${p.name} (me)` : p.name}
            </button>
          )
        })}
      </div>

      <Chips
        label="Comparison"
        value={st.mode}
        onChange={(mode) => setSt({ ...st, mode })}
        options={[
          ['board', 'Leaderboard'],
          ['h2h', 'Head to head'],
          ['matrix', 'Grid'],
          ['match', 'Taste match'],
          ['recs', 'Recommendations'],
          ['brands', 'Brands & sugar'],
        ]}
      />

      {selected.length === 0 ? (
        <Empty>Select at least one person above.</Empty>
      ) : st.mode === 'board' ? (
        <Board rows={rows} people={selected} st={st} setSt={setSt} />
      ) : st.mode === 'h2h' ? (
        <HeadToHead people={people} scoped={scoped} scopedIds={scopedIds} st={st} setSt={setSt} />
      ) : st.mode === 'matrix' ? (
        <Matrix rows={rows} people={selected} />
      ) : st.mode === 'match' ? (
        <TasteMatch people={selected} scopedIds={scopedIds} />
      ) : st.mode === 'recs' ? (
        <Recs people={selected} scoped={scoped} />
      ) : (
        <Brands people={selected} scoped={scoped} />
      )}

      {filtersOpen && (
        <Sheet title="Compare within" onClose={() => setFiltersOpen(false)}>
          <ScopeFields drinks={drinks} scope={st.scope} onChange={(scope) => setSt({ ...st, scope })} />
        </Sheet>
      )}
    </>
  )
}

function More({ total }: { total: number }) {
  return total > LIMIT ? <p className="muted small">Showing the first {LIMIT} of {total}. Narrow it down with Filters.</p> : null
}

// ---- Leaderboard -------------------------------------------------------------

function Board({ rows, people, st, setSt }: { rows: GroupRow[]; people: Person[]; st: State; setSt: (s: State) => void }) {
  const needTwo = st.sort === 'divisive' || st.sort === 'agreed'
  const min = Math.min(people.length, Math.max(st.minRaters, needTwo ? 2 : 1))
  const list = useMemo(() => {
    const out = rows.filter((r) => r.count >= min)
    const name = (a: GroupRow, b: GroupRow) => a.drink.name.localeCompare(b.drink.name)
    const sorters: Record<BoardSort, (a: GroupRow, b: GroupRow) => number> = {
      top: (a, b) => b.avg - a.avg || b.count - a.count || name(a, b),
      bottom: (a, b) => a.avg - b.avg || b.count - a.count || name(a, b),
      divisive: (a, b) => b.spread - a.spread || b.stdev - a.stdev || name(a, b),
      agreed: (a, b) => a.spread - b.spread || b.count - a.count || b.avg - a.avg,
      popular: (a, b) => b.count - a.count || b.avg - a.avg || name(a, b),
    }
    return out.sort(sorters[st.sort])
  }, [rows, min, st.sort])

  return (
    <>
      <div className="list-meta">
        <label>
          Sort{' '}
          <select value={st.sort} onChange={(e) => setSt({ ...st, sort: e.target.value as BoardSort })}>
            <option value="top">Highest average</option>
            <option value="bottom">Lowest average</option>
            <option value="divisive">Most divisive</option>
            <option value="agreed">Most agreed on</option>
            <option value="popular">Most rated</option>
          </select>
        </label>
        <label>
          Rated by{' '}
          <select value={min} onChange={(e) => setSt({ ...st, minRaters: Number(e.target.value) })}>
            {people.map((_, i) => (
              <option key={i} value={i + 1} disabled={needTwo && i === 0}>
                {i + 1 === people.length && i > 0 ? 'everyone' : `${i + 1}+`}
              </option>
            ))}
          </select>
        </label>
      </div>
      {list.length === 0 && <Empty>No drinks rated by {min === 1 ? 'anyone' : `at least ${min} of the selected people`} here.</Empty>}
      <div className="list">
        {list.slice(0, LIMIT).map((r, i) => (
          <DrinkRow
            key={r.drink.id}
            drink={r.drink}
            sub={
              <>
                <span className="rank">#{i + 1}</span>
                <span className="mini-scores">
                  {people.map((p, k) =>
                    r.scores[k] == null ? null : (
                      <span key={p.id} title={p.name}>
                        {p.name.slice(0, 3)} <b>{fmtScore(r.scores[k])}</b>
                      </span>
                    ),
                  )}
                </span>
              </>
            }
            right={
              <>
                {needTwo && <span className="friend-avg" title="Gap between highest and lowest">±{r.spread}</span>}
                <Score value={r.avg} digits={1} />
              </>
            }
          />
        ))}
      </div>
      <More total={list.length} />
    </>
  )
}

// ---- Head to head ------------------------------------------------------------

function HeadToHead({
  people, scoped, scopedIds, st, setSt,
}: { people: Person[]; scoped: Drink[]; scopedIds: Set<string>; st: State; setSt: (s: State) => void }) {
  const a = people.find((p) => p.id === st.a) ?? people[0]
  const b = people.find((p) => p.id === st.b && p.id !== a.id) ?? people.find((p) => p.id !== a.id)!
  const [view, setView] = useState<'gap' | 'love' | 'hate' | 'onlyA' | 'onlyB'>('gap')
  const stats = useMemo(() => pairStats(a, b, scopedIds), [a, b, scopedIds])

  const list = useMemo(() => {
    const both = scoped
      .map((d) => ({ d, x: a.ratings.get(d.id)?.rating, y: b.ratings.get(d.id)?.rating }))
      .filter((r) => r.x != null || r.y != null)
    const common = both.filter((r) => r.x != null && r.y != null) as { d: Drink; x: number; y: number }[]
    switch (view) {
      case 'gap':
        return common.sort((p, q) => Math.abs(q.x - q.y) - Math.abs(p.x - p.y) || q.x + q.y - p.x - p.y)
      case 'love':
        return common.filter((r) => r.x >= 7.5 && r.y >= 7.5).sort((p, q) => q.x + q.y - p.x - p.y)
      case 'hate':
        return common.filter((r) => r.x <= 4.5 && r.y <= 4.5).sort((p, q) => p.x + p.y - q.x - q.y)
      case 'onlyA':
        return both.filter((r) => r.x != null && r.y == null).sort((p, q) => q.x! - p.x!)
      case 'onlyB':
        return both.filter((r) => r.y != null && r.x == null).sort((p, q) => q.y! - p.y!)
    }
  }, [scoped, a, b, view])

  const pick = (key: 'a' | 'b', current: Person, other: Person) => (
    <select aria-label={key === 'a' ? 'First person' : 'Second person'} value={current.id} onChange={(e) => setSt({ ...st, [key]: e.target.value })}>
      {people.filter((p) => p.id !== other.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  )

  return (
    <>
      <div className="h2h-pick">{pick('a', a, b)}<span>vs</span>{pick('b', b, a)}</div>
      {stats ? (
        <div className="stat-row">
          <div className="stat"><b>{stats.match}%</b><span>taste match</span></div>
          <div className="stat"><b>{stats.common}</b><span>shared drinks</span></div>
          <div className="stat"><b>{stats.diff.toFixed(1)}</b><span>avg gap</span></div>
        </div>
      ) : (
        <p className="muted">These two have no drinks in common here yet.</p>
      )}
      {stats && (
        <p className="muted small">
          {Math.abs(stats.bias) < 0.25
            ? 'They score about equally generously.'
            : `${stats.bias > 0 ? a.name : b.name} scores ${Math.abs(stats.bias).toFixed(1)} higher on average.`}
          {stats.corr != null && ` Correlation ${stats.corr.toFixed(2)} (1 = same ranking, -1 = opposite).`}
        </p>
      )}
      <Chips
        label="Head to head view"
        value={view}
        onChange={setView}
        options={[
          ['gap', 'Biggest disagreements'],
          ['love', 'Both love'],
          ['hate', 'Both dislike'],
          ['onlyA', `Only ${a.name}`],
          ['onlyB', `Only ${b.name}`],
        ]}
      />
      {list.length === 0 && <Empty>Nothing in this list.</Empty>}
      <div className="list">
        {list.slice(0, LIMIT).map((r) => (
          <DrinkRow
            key={r.d.id}
            drink={r.d}
            right={
              <span className="duel">
                <Score value={r.x} dim={r.x != null && r.y != null && r.x < r.y} />
                <Score value={r.y} dim={r.x != null && r.y != null && r.y < r.x} />
              </span>
            }
          />
        ))}
      </div>
      {list.length > 0 && <p className="muted small">Scores: {a.name} on the left, {b.name} on the right.</p>}
      <More total={list.length} />
    </>
  )
}

// ---- Grid --------------------------------------------------------------------

function Matrix({ rows, people }: { rows: GroupRow[]; people: Person[] }) {
  const [sort, setSort] = useState<number>(-1) // -1 = average, otherwise person index
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        sort < 0 ? b.avg - a.avg : (b.scores[sort] ?? -1) - (a.scores[sort] ?? -1) || b.avg - a.avg,
      ),
    [rows, sort],
  )
  if (!rows.length) return <Empty>No ratings here yet.</Empty>
  return (
    <>
      <p className="muted small">Tap a column to sort by it.</p>
      <div className="matrix-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th scope="col">Drink</th>
              <th scope="col"><button type="button" className={sort < 0 ? 'on' : ''} onClick={() => setSort(-1)}>Avg</button></th>
              {people.map((p, i) => (
                <th key={p.id} scope="col">
                  <button type="button" className={sort === i ? 'on' : ''} onClick={() => setSort(i)} title={p.name}>{p.name.slice(0, 6)}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, LIMIT * 2).map((r) => (
              <tr key={r.drink.id}>
                <th scope="row"><Link to={`/drink/${encodeURIComponent(r.drink.id)}`}>{r.drink.name}</Link></th>
                <td className="avg">{r.avg.toFixed(1)}</td>
                {r.scores.map((s, i) => (
                  <td key={i} style={s == null ? undefined : { background: ratingColor(s), color: 'var(--ink)' }}>{fmtScore(s)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ---- Taste match ---------------------------------------------------------------

function TasteMatch({ people, scopedIds }: { people: Person[]; scopedIds: Set<string> }) {
  const pairs = useMemo(() => {
    const out = []
    for (let i = 0; i < people.length; i++)
      for (let j = i + 1; j < people.length; j++) {
        const s = pairStats(people[i], people[j], scopedIds)
        if (s) out.push({ a: people[i], b: people[j], s })
      }
    return out.sort((x, y) => y.s.match - x.s.match || y.s.common - x.s.common)
  }, [people, scopedIds])

  if (people.length < 2) return <Empty>Select at least two people.</Empty>
  if (!pairs.length) return <Empty>Nobody here has rated the same drink yet.</Empty>
  return (
    <>
      <p className="muted small">
        Match is based on the average gap between two people's scores for the drinks both rated. Few shared drinks means a shaky number.
      </p>
      <table className="table card-table">
        <thead><tr><th>Pair</th><th className="num">Shared</th><th className="num">Avg gap</th><th className="num">Match</th></tr></thead>
        <tbody>
          {pairs.map(({ a, b, s }) => (
            <tr key={a.id + b.id}>
              <td>{a.name} &amp; {b.name}</td>
              <td className="num">{s.common}</td>
              <td className="num">{s.diff.toFixed(1)}</td>
              <td className="num"><span className="score" style={{ background: ratingColor(1 + (s.match / 100) * 9) }}>{s.match}%</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

// ---- Recommendations -----------------------------------------------------------

function Recs({ people, scoped }: { people: Person[]; scoped: Drink[] }) {
  const { me } = useData()
  const friends = people.filter((p) => !p.isMe)
  const [view, setView] = useState<'forMe' | 'wish' | 'forThem'>('forMe')

  const list = useMemo(() => {
    if (view === 'forThem') {
      // My favourites that selected friends have not tried.
      return scoped
        .map((d) => ({ d, mine: me.ratings.get(d.id)?.rating, who: friends.filter((f) => !f.ratings.has(d.id)) }))
        .filter((r) => r.mine != null && r.mine >= 7.5 && r.who.length > 0)
        .sort((a, b) => b.mine! - a.mine! || b.who.length - a.who.length)
        .map((r) => ({ d: r.d, score: r.mine!, text: `Not tried by ${r.who.map((f) => f.name).join(', ')}` }))
    }
    return scoped
      .filter((d) => !me.ratings.has(d.id) && (view !== 'wish' || me.wishlist.has(d.id)))
      .map((d) => {
        const by = friends.filter((f) => f.ratings.has(d.id))
        return { d, by, avg: average(by.map((f) => f.ratings.get(d.id)!.rating)) }
      })
      .filter((r) => r.avg != null)
      .sort((a, b) => b.avg! - a.avg! || b.by.length - a.by.length)
      .map((r) => ({
        d: r.d,
        score: r.avg!,
        text: r.by.map((f) => `${f.name} ${fmtScore(f.ratings.get(r.d.id)!.rating)}`).join(' · ') + (me.wishlist.has(r.d.id) ? ' · ★ on your list' : ''),
      }))
  }, [view, scoped, me, friends])

  if (!friends.length) return <Empty>Select at least one friend.</Empty>
  return (
    <>
      <Chips
        label="Recommendation type"
        value={view}
        onChange={setView}
        options={[['forMe', 'I should try'], ['wish', 'From my want-to-try'], ['forThem', 'They should try']]}
      />
      {list.length === 0 && <Empty>Nothing to suggest here yet.</Empty>}
      <div className="list">
        {list.slice(0, LIMIT).map((r) => (
          <DrinkRow key={r.d.id} drink={r.d} sub={<span className="muted">{r.text}</span>} right={<Score value={r.score} digits={1} />} />
        ))}
      </div>
      <More total={list.length} />
    </>
  )
}

// ---- Brands & sugar ------------------------------------------------------------

function Brands({ people, scoped }: { people: Person[]; scoped: Drink[] }) {
  const table = useMemo(() => {
    const groups: { label: string; test: (d: Drink) => boolean; section: string }[] = [
      { section: 'Overall', label: 'All drinks', test: () => true },
      { section: 'Sugar', label: 'Sugar free', test: (d) => d.sugarFree },
      { section: 'Sugar', label: 'With sugar', test: (d) => !d.sugarFree },
      { section: 'Availability', label: 'Still sold', test: (d) => !d.discontinued },
      { section: 'Availability', label: 'Discontinued', test: (d) => d.discontinued },
      ...[...new Set(scoped.map((d) => d.brand))].map((brand) => ({ section: 'Brand', label: brand, test: (d: Drink) => d.brand === brand })),
    ]
    return groups
      .map((g) => {
        const ds = scoped.filter(g.test)
        const cells = people.map((p) => {
          const vals = ds.map((d) => p.ratings.get(d.id)?.rating).filter((v): v is number => v != null)
          return { avg: average(vals), n: vals.length }
        })
        return { ...g, cells, total: cells.reduce((s, c) => s + c.n, 0) }
      })
      .filter((g) => g.total > 0)
  }, [people, scoped])

  if (!table.length) return <Empty>No ratings here yet.</Empty>
  return (
    <>
      <p className="muted small">Average score per person, with the number of drinks rated underneath.</p>
      <div className="matrix-wrap">
        <table className="matrix brands">
          <thead>
            <tr>
              <th scope="col">Group</th>
              {people.map((p) => <th key={p.id} scope="col" title={p.name}>{p.name.slice(0, 6)}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((g, i) => (
              <tr key={g.section + g.label} className={i > 0 && table[i - 1].section !== g.section ? 'sep' : ''}>
                <th scope="row">{g.label}</th>
                {g.cells.map((c, k) => (
                  <td key={k} style={c.avg == null ? undefined : { background: ratingColor(c.avg), color: 'var(--ink)' }}>
                    {c.avg == null ? '–' : c.avg.toFixed(1)}
                    {c.n > 0 && <small>{c.n}</small>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
