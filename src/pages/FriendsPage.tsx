import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRScan, QRShow } from '../components/qr'
import { Empty, Sheet } from '../components/ui'
import { pairStats } from '../lib/compare'
import { useData } from '../lib/data'
import { db } from '../lib/db'
import { buildExport, encodeQR, importFriend, parseImport, restoreOwn, shareFile, type ExportFile } from '../lib/share'

type Msg = { kind: 'ok' | 'error'; text: string }

export default function FriendsPage() {
  const { friends, people, me, profile } = useData()
  const fileInput = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<Msg>()
  const [qr, setQr] = useState<{ parts: string[]; skipped: number }>()
  const [scanning, setScanning] = useState(false)

  const stats = useMemo(
    () => new Map(people.filter((p) => !p.isMe).map((p) => [p.id, pairStats(me, p)])),
    [people, me],
  )

  const needName = !profile.name

  async function handle(file: ExportFile, source: 'file' | 'qr') {
    try {
      let res = await importFriend(file, source)
      if (res.kind === 'self') {
        if (source === 'file' && confirm('This is your own export. Restore it on this device? It replaces your current ratings.')) {
          await restoreOwn(file)
          setMsg({ kind: 'ok', text: `Restored ${file.ratings.length} of your own ratings.` })
        } else {
          setMsg({ kind: 'error', text: 'That is your own data, not a friend.' })
        }
        return
      }
      if (res.kind === 'older') {
        if (!confirm(`You already have newer data from ${res.friend.name}. Replace it with this older export?`)) return
        res = await importFriend(file, source, true)
      }
      if (res.kind === 'added' || res.kind === 'updated') {
        setMsg({
          kind: 'ok',
          text: `${res.kind === 'added' ? 'Added' : 'Updated'} ${res.friend.name}: ${res.friend.ratings.length} ratings.`,
        })
      }
    } catch (e) {
      setMsg({ kind: 'error', text: (e as Error).message })
    }
  }

  async function onFile(f: File | undefined) {
    if (!f) return
    try {
      if (f.size > 20_000_000) throw new Error('That file is too large to be a ratings export.')
      await handle(parseImport(await f.text()), 'file')
    } catch (e) {
      setMsg({ kind: 'error', text: (e as Error).message })
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function showQr() {
    try {
      setQr(encodeQR(await buildExport()))
    } catch (e) {
      setMsg({ kind: 'error', text: (e as Error).message })
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Friends</h1>
      </header>

      {msg && <p className={msg.kind === 'ok' ? 'notice' : 'error'} role="status">{msg.text}</p>}

      <section className="card">
        <h2>Share my ratings</h2>
        {needName && <p className="error">Set your name on the <Link to="/me">My ratings</Link> tab first, so friends know whose ratings these are.</p>}
        <p className="muted small">
          Send the file through any chat app, or let a friend scan your code. Sending again later updates you in their list.
        </p>
        <div className="btn-row">
          <button type="button" className="btn primary" disabled={needName || me.ratings.size === 0} onClick={() => void buildExport().then(shareFile)}>
            Share JSON file
          </button>
          <button type="button" className="btn" disabled={needName || me.ratings.size === 0} onClick={() => void showQr()}>
            Show QR code
          </button>
        </div>
        {me.ratings.size === 0 && <p className="muted small">Rate at least one drink first.</p>}
      </section>

      <section className="card">
        <h2>Add or update a friend</h2>
        <div className="btn-row">
          <button type="button" className="btn primary" onClick={() => fileInput.current?.click()}>Import JSON file</button>
          <button type="button" className="btn" onClick={() => setScanning(true)}>Scan QR code</button>
        </div>
        <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        <p className="muted small">The file also works as a backup: importing your own export restores your ratings.</p>
      </section>

      <h2 className="section-title">Friends list</h2>
      {friends.length === 0 && <Empty>No friends yet. Import a file or scan a code to add one.</Empty>}
      <div className="list">
        {friends.map((f) => {
          const s = stats.get(f.id)
          return (
            <div key={f.id} className="row static">
              <span className="avatar">{f.name.slice(0, 1).toUpperCase()}</span>
              <span className="row-main">
                <span className="row-title">{f.name}</span>
                <span className="row-sub">
                  {f.ratings.length} ratings · updated {new Date(f.exportedAt).toLocaleDateString()}
                  {f.source === 'qr' ? ' · via QR' : ''}
                </span>
                <span className="row-sub">
                  {s ? `${s.match}% taste match on ${s.common} shared drinks` : 'No drinks in common yet'}
                </span>
              </span>
              <button
                type="button"
                className="btn danger"
                aria-label={`Remove ${f.name}`}
                onClick={() => confirm(`Remove ${f.name} from your friends list?`) && void db.friends.delete(f.id)}
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>
      {friends.length > 0 && <Link to="/compare" className="btn block">Compare ratings</Link>}

      {qr && (
        <Sheet title="My ratings as QR" onClose={() => setQr(undefined)}>
          <QRShow parts={qr.parts} />
          <p className="muted small">
            The code carries scores and your want-to-try list. Notes, detailed scores and custom drinks
            {qr.skipped ? ` (${qr.skipped} of your ratings)` : ''} only travel in the JSON file.
          </p>
        </Sheet>
      )}
      {scanning && (
        <Sheet title="Scan a friend's code" onClose={() => setScanning(false)}>
          <QRScan onResult={(file) => { setScanning(false); void handle(file, 'qr') }} />
        </Sheet>
      )}
    </>
  )
}
