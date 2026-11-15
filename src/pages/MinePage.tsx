import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chips, DrinkRow, Empty, Score } from '../components/ui'
import { average, ratingColor } from '../lib/compare'
import { useData } from '../lib/data'
import { saveProfile } from '../lib/db'
import { getTheme, setTheme, type Theme } from '../lib/theme'

export default function MinePage() {
  const { me, drinkById, profile } = useData()
  const [tab, setTab] = useState<'ranking' | 'stats' | 'wish'>('ranking')
  const [theme, setT] = useState<Theme>(getTheme)
  const [name, setName] = useState(profile.name)

  const rated = useMemo(
    () =>
      [...me.ratings.values()]
        .map((r) => ({ r, drink: drinkById.get(r.drinkId) }))
        .filter((x): x is { r: typeof x.r; drink: NonNullable<typeof x.drink> } => !!x.drink)
        .sort((a, b) => b.r.rating - a.r.rating || a.drink.name.localeCompare(b.drink.name)),
    [me, drinkById],
  )
  const wish = [...me.wishlist].map((id) => drinkById.get(id)).filter((d) => !!d)

  const stats = useMemo(() => {
    const avgOf = (xs: typeof rated) => average(xs.map((x) => x.r.rating))
    const hist = Array.from({ length: 10 }, (_, i) => rated.filter((x) => Math.ceil(x.r.rating) === i + 1).length)
    const brands = new Map<string, number[]>()
    for (const x of rated) brands.set(x.drink.brand, [...(brands.get(x.drink.brand) ?? []), x.r.rating])
    return {
      avg: avgOf(rated),
      sf: avgOf(rated.filter((x) => x.drink.sugarFree)),
      sugar: avgOf(rated.filter((x) => !x.drink.sugarFree)),
      disc: rated.filter((x) => x.drink.discontinued).length,
      hist,
      brands: [...brands.entries()]
        .map(([brand, v]) => ({ brand, n: v.length, avg: average(v)! }))
        .sort((a, b) => b.avg - a.avg),
    }
  }, [rated])
  const histMax = Math.max(1, ...stats.hist)

  return (
    <>
      <header className="page-head">
        <h1>My ratings</h1>
      </header>

      <section className="card settings">
        <label className="field">
          <span>Your name (shown to friends)</span>
          <input
            value={name}
            maxLength={40}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() !== profile.name && saveProfile({ ...profile, name: name.trim() })}
          />
        </label>
        <div className="field">
          <span>Theme</span>
          <Chips
            label="Theme"
            value={theme}
            onChange={(t) => { setTheme(t); setT(t) }}
            options={[['dark', 'Dark'], ['light', 'Light']]}
          />
        </div>
      </section>

      <div className="stat-row">
        <div className="stat"><b>{rated.length}</b><span>rated</span></div>
        <div className="stat"><b>{stats.avg?.toFixed(1) ?? '–'}</b><span>average</span></div>
        <div className="stat"><b>{wish.length}</b><span>want to try</span></div>
      </div>

      <Chips
        label="View"
        value={tab}
        onChange={setTab}
        options={[['ranking', 'Ranking'], ['stats', 'Stats'], ['wish', 'Want to try']]}
      />

      {tab === 'ranking' && (
        <div className="list">
          {rated.length === 0 && <Empty>Nothing rated yet. <Link to="/">Pick a drink</Link> to start.</Empty>}
          {rated.map(({ r, drink }, i) => (
            <DrinkRow
              key={drink.id}
              drink={drink}
              sub={<><span className="rank">#{i + 1}</span><span className="brand">{drink.brand}</span>{r.note && <span className="muted"> · {r.note}</span>}</>}
              right={<Score value={r.rating} />}
            />
          ))}
        </div>
      )}

      {tab === 'stats' && (rated.length === 0 ? <Empty>Rate a few drinks to see statistics.</Empty> : (
        <>
          <section className="card">
            <h2>Score distribution</h2>
            <div className="hist" role="img" aria-label="Number of drinks per score">
              {stats.hist.map((n, i) => (
                <div key={i} className="hist-col">
                  <span className="hist-n">{n || ''}</span>
                  <div className="hist-bar" style={{ height: `${(n / histMax) * 100}%`, background: ratingColor(i + 1) }} />
                  <span className="hist-x">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="muted small">Half scores are counted with the next whole number (7.5 counts as 8).</p>
          </section>
          <section className="card">
            <h2>Sugar</h2>
            <table className="table">
              <tbody>
                <tr><td>Sugar free</td><td className="num"><Score value={stats.sf} digits={1} /></td></tr>
                <tr><td>With sugar</td><td className="num"><Score value={stats.sugar} digits={1} /></td></tr>
                <tr><td>Discontinued drinks rated</td><td className="num">{stats.disc}</td></tr>
              </tbody>
            </table>
          </section>
          <section className="card">
            <h2>By brand</h2>
            <table className="table">
              <thead><tr><th>Brand</th><th className="num">Rated</th><th className="num">Average</th></tr></thead>
              <tbody>
                {stats.brands.map((b) => (
                  <tr key={b.brand}><td>{b.brand}</td><td className="num">{b.n}</td><td className="num"><Score value={b.avg} digits={1} /></td></tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ))}

      {tab === 'wish' && (
        <div className="list">
          {wish.length === 0 && <Empty>Mark drinks as “Want to try” and they show up here.</Empty>}
          {wish.map((d) => <DrinkRow key={d.id} drink={d} />)}
        </div>
      )}
    </>
  )
}
