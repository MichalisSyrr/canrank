import { useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Drink } from '../data/catalog'
import { fmt, ratingColor } from '../lib/compare'

/** Product photo when we have one, otherwise a can drawn in the drink's colours. */
export function CanArt({ drink, large }: { drink: Drink; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  const src = drink.photo ?? (large ? drink.imgLg ?? drink.img : drink.img)
  const h = large ? 190 : 52
  return (
    <span className={`can-tile${large ? ' lg' : ''}`} style={{ '--c': drink.color } as CSSProperties}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        <DrawnCan drink={drink} height={h} />
      )}
    </span>
  )
}

function DrawnCan({ drink, height }: { drink: Drink; height: number }) {
  const gid = `g-${drink.id}`
  return (
    <svg width={height * 0.62} height={height} viewBox="0 0 62 100" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".3" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
      </defs>
      <path d="M14 6h34l5 8v74l-5 8H14l-5-8V14z" fill={drink.color} />
      <rect x="9" y="40" width="44" height="22" fill={drink.accent} opacity=".92" />
      <text x="31" y="56" textAnchor="middle" fontSize="15" fontWeight="800" fill={drink.color} fontFamily="system-ui, sans-serif">
        {drink.brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}
      </text>
      <path d="M14 6h34l5 8v74l-5 8H14l-5-8V14z" fill={`url(#${gid})`} />
      <rect x="14" y="3" width="34" height="4" rx="1.5" fill="#b8bec6" />
      <rect x="14" y="94" width="34" height="3" rx="1.5" fill="#8d949c" />
    </svg>
  )
}

export function Score({ value, digits, dim }: { value: number | null | undefined; digits?: number; dim?: boolean }) {
  if (value == null) return <span className="score empty">–</span>
  return (
    <span className={`score${dim ? ' dim' : ''}`} style={{ background: ratingColor(value) }}>
      {digits == null ? value : fmt(value, digits)}
    </span>
  )
}

export function Tags({ drink }: { drink: Drink }) {
  return (
    <>
      {drink.sugarFree && <span className="tag sf">Sugar free</span>}
      {drink.discontinued && <span className="tag disc">Discontinued</span>}
      {drink.custom && <span className="tag custom">{drink.owner ? `Added by ${drink.owner}` : 'Custom'}</span>}
    </>
  )
}

export function DrinkRow({ drink, right, sub }: { drink: Drink; right?: ReactNode; sub?: ReactNode }) {
  return (
    <Link to={`/drink/${encodeURIComponent(drink.id)}`} className="row">
      <CanArt drink={drink} />
      <span className="row-main">
        <span className="row-title">{drink.name}</span>
        <span className="row-sub">{sub ?? <><span className="brand">{drink.brand}</span><Tags drink={drink} /></>}</span>
      </span>
      {right != null && <span className="row-right">{right}</span>}
    </Link>
  )
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly (readonly [T, string])[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" className={`chip${v === value ? ' on' : ''}`} aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

export function MultiChips({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly string[]
  value: string[]
  onChange: (v: string[]) => void
  label?: string
}) {
  return (
    <div className="chips wrap" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            className={`chip${on ? ' on' : ''}`}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="btn" onClick={onClose}>Done</button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>
}

/** 1 to 10 slider in half steps with nudge buttons. value undefined = not rated yet. */
export function RatingInput({
  value,
  onChange,
  label,
  compact,
}: {
  value: number | undefined
  onChange: (v: number) => void
  label: string
  compact?: boolean
}) {
  const v = value ?? 5.5
  return (
    <div className={`rating-input${compact ? ' compact' : ''}`}>
      <button type="button" className="btn round" aria-label={`Lower ${label}`} onClick={() => onChange(Math.max(1, (value ?? 5.5) - 0.5))}>−</button>
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={v}
        aria-label={label}
        className={value == null ? 'unset' : ''}
        style={value == null ? undefined : ({ '--fill': ratingColor(v) } as CSSProperties)}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => value == null && onChange(v)}
      />
      <button type="button" className="btn round" aria-label={`Raise ${label}`} onClick={() => onChange(Math.min(10, (value ?? 5) + 0.5))}>+</button>
    </div>
  )
}
