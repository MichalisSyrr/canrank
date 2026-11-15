import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CanArt, Empty, RatingInput, Score, Tags } from '../components/ui'
import { REGION_LABEL } from '../data/catalog'
import { average, fmtScore, ratingColor } from '../lib/compare'
import { useData } from '../lib/data'
import { db, setRating, SUB_KEYS, SUB_LABEL, toggleWishlist } from '../lib/db'

export default function DrinkPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { drinkById, me, people, ready } = useData()
  const drink = drinkById.get(id)
  const mine = me.ratings.get(id)
  const [note, setNote] = useState(mine?.note ?? '')
  const [showSub, setShowSub] = useState(false)

  // Pick up the stored note once the database has loaded (or after a restore).
  useEffect(() => {
    setNote(mine?.note ?? '')
  }, [mine?.note])

  if (!drink) {
    return ready ? <Empty>That drink does not exist any more. <Link to="/">Back to the list</Link></Empty> : null
  }

  const others = people.filter((p) => !p.isMe && p.ratings.has(id))
  const all = people.map((p) => p.ratings.get(id)?.rating).filter((v): v is number => v != null)
  const avg = average(all)
  const wished = me.wishlist.has(id)
  const hasSub = !!mine?.sub && Object.keys(mine.sub).length > 0
  const wanting = people.filter((p) => !p.isMe && p.wishlist.has(id))

  async function removeCustom() {
    if (!confirm(`Delete "${drink!.name}" and your rating for it?`)) return
    await db.transaction('rw', db.custom, db.ratings, db.wishlist, async () => {
      await Promise.all([db.custom.delete(id), db.ratings.delete(id), db.wishlist.delete(id)])
    })
    nav('/')
  }

  return (
    <>
      <header className="page-head">
        <button type="button" className="btn" onClick={() => nav(-1)}>‹ Back</button>
      </header>

      <section className="hero" style={{ '--c': drink.color } as CSSProperties}>
        <CanArt drink={drink} large />
        <div className="hero-text">
          <p className="brand">{drink.brand}{drink.line !== 'Custom' && drink.line !== 'Core' ? ` · ${drink.line}` : ''}</p>
          <h1>{drink.name}</h1>
          <p className="tags"><Tags drink={drink} /></p>
          {drink.aka && <p className="small">Also sold as: {drink.aka.join(', ')}</p>}
          <p className="muted small">
            {[
              drink.flavors.join(', '),
              drink.regions.map((r) => REGION_LABEL[r]).join(', '),
              drink.year ? `since ${drink.year}` : '',
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
      </section>

      <section className="card">
        <div className="rate-head">
          <h2>My rating</h2>
          <span className={`big-score${mine ? '' : ' unset'}`} style={mine ? { background: ratingColor(mine.rating) } : undefined}>
            {mine ? fmtScore(mine.rating) : '–'}<small>/10</small>
          </span>
        </div>
        <RatingInput label="rating" value={mine?.rating} onChange={(rating) => void setRating(id, { rating })} />
        <div className="scale" aria-hidden="true">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <span key={n}>{n}</span>)}</div>
        {!mine && <p className="muted small">Drag the slider or tap + to rate. You can change it any time.</p>}

        {mine && (
          <>
            <label className="field">
              <span>Notes</span>
              <textarea
                rows={2}
                maxLength={1000}
                placeholder="What did you think?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => note !== (mine.note ?? '') && void setRating(id, { note: note.trim() || undefined })}
              />
            </label>

            <button type="button" className="link" aria-expanded={showSub || hasSub} onClick={() => setShowSub(!showSub)}>
              {showSub || hasSub ? 'Detailed scores' : '+ Add detailed scores (optional)'}
            </button>
            {(showSub || hasSub) && (
              <div className="subs">
                {SUB_KEYS.map((k) => (
                  <div key={k} className="sub">
                    <span className="sub-label">{SUB_LABEL[k]}</span>
                    <RatingInput
                      compact
                      label={SUB_LABEL[k]}
                      value={mine.sub?.[k]}
                      onChange={(v) => void setRating(id, { sub: { ...mine.sub, [k]: v } })}
                    />
                    <span className="sub-val">{fmtScore(mine.sub?.[k])}</span>
                  </div>
                ))}
                {hasSub && (
                  <button type="button" className="link" onClick={() => { void setRating(id, { sub: undefined }); setShowSub(false) }}>
                    Clear detailed scores
                  </button>
                )}
              </div>
            )}

            <p className="muted small">Last updated {new Date(mine.updatedAt).toLocaleDateString()}</p>
            <button
              type="button"
              className="btn danger"
              onClick={() => confirm('Remove your rating for this drink?') && void db.ratings.delete(id)}
            >
              Remove rating
            </button>
          </>
        )}

        {!mine && (
          <button type="button" className={`btn block${wished ? ' primary' : ''}`} aria-pressed={wished} onClick={() => void toggleWishlist(id)}>
            {wished ? '★ On your want-to-try list' : '☆ Want to try'}
          </button>
        )}
      </section>

      <section className="card">
        <div className="rate-head">
          <h2>Friends</h2>
          {avg != null && all.length > 1 && <span className="muted">Group average {avg.toFixed(1)} ({all.length})</span>}
        </div>
        {others.length === 0 && <p className="muted">None of your friends has rated this yet.</p>}
        {others
          .sort((a, b) => b.ratings.get(id)!.rating - a.ratings.get(id)!.rating)
          .map((p) => {
            const r = p.ratings.get(id)!
            return (
              <div key={p.id} className="friend-rating">
                <Score value={r.rating} />
                <div>
                  <strong>{p.name}</strong>
                  {mine && <span className="muted small"> {delta(r.rating - mine.rating)}</span>}
                  {r.note && <p className="note">{r.note}</p>}
                  {r.sub && (
                    <p className="muted small">
                      {SUB_KEYS.filter((k) => r.sub![k] != null).map((k) => `${SUB_LABEL[k]} ${r.sub![k]}`).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        {wanting.length > 0 && <p className="muted small">Want to try: {wanting.map((p) => p.name).join(', ')}</p>}
      </section>

      {drink.custom && !drink.owner && (
        <button type="button" className="btn danger block" onClick={() => void removeCustom()}>Delete this custom drink</button>
      )}
    </>
  )
}

function delta(d: number): string {
  if (d === 0) return 'same as you'
  return `${Math.abs(d)} ${d > 0 ? 'higher' : 'lower'} than you`
}
