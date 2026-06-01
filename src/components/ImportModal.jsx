import { useState, useRef } from 'react'
import { X, Upload, BookOpen, Film, AlertCircle, Check, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { post } from '../api/client.js'

// ── CSV parser (handles quoted fields with commas inside) ─────────────────

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const headers = splitCSVLine(lines[0])
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const vals = splitCSVLine(line)
    const row = {}
    headers.forEach((h, j) => { row[h.trim()] = (vals[j] || '').trim() })
    rows.push(row)
  }
  return rows
}

function splitCSVLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

// ── Letterboxd parser ─────────────────────────────────────────────────────
// Expects ratings.csv or diary.csv from Letterboxd export ZIP
// ratings.csv columns: Date, Name, Year, Letterboxd URI, Rating
// diary.csv columns:   Date, Name, Year, Letterboxd URI, Rating, Rewatch, Tags, Watched Date

function parseLetterboxd(text) {
  const rows = parseCSV(text)
  const items = []
  const seen = new Set()

  for (const row of rows) {
    const title = row['Name'] || row['name']
    if (!title) continue
    const key = title.toLowerCase()
    if (seen.has(key)) continue // deduplicate (diary may have rewatches)
    seen.add(key)

    const ratingRaw = row['Rating'] || row['rating'] || ''
    const rating = ratingRaw ? parseFloat(ratingRaw) : null

    const dateRaw = row['Watched Date'] || row['Date'] || row['date'] || ''
    const consumedAt = dateRaw ? new Date(dateRaw).toISOString() : null

    const year = row['Year'] || row['year'] || ''
    const subtitle = year ? year : ''

    if (isNaN(rating) || (rating !== null && (rating < 0.5 || rating > 5))) continue

    items.push({
      title,
      subtitle,
      type: 'film',
      rating: rating || null,
      consumedAt,
    })
  }

  return items
}

// ── Goodreads parser ──────────────────────────────────────────────────────
// Expects goodreads_library_export.csv
// Key columns: Title, Author, My Rating, Date Read, Exclusive Shelf

function parseGoodreads(text) {
  const rows = parseCSV(text)
  const items = []

  for (const row of rows) {
    const title = row['Title'] || row['title']
    if (!title) continue

    const shelf = row['Exclusive Shelf'] || ''
    // Only import read books, skip to-read/currently-reading
    if (shelf && shelf !== 'read') continue

    const author = row['Author'] || row['Author l-f'] || ''
    const ratingRaw = row['My Rating'] || '0'
    const rating = parseInt(ratingRaw, 10)
    // Goodreads: 0 = not rated, 1-5 = rating
    const finalRating = rating > 0 ? rating : null

    const dateRaw = row['Date Read'] || row['date_read'] || ''
    const consumedAt = dateRaw ? new Date(dateRaw).toISOString() : null

    items.push({
      title: title.trim(),
      subtitle: author.trim(),
      type: 'book',
      rating: finalRating,
      consumedAt: consumedAt && !isNaN(new Date(dateRaw)) ? consumedAt : null,
    })
  }

  return items
}

// ── Main component ─────────────────────────────────────────────────────────

const PLATFORMS = {
  letterboxd: {
    label: 'Letterboxd',
    icon: Film,
    color: '#00AC34',
    type: 'film',
    accept: '.csv',
    instructions: [
      'Go to letterboxd.com → Settings → Import & Export',
      'Click "Export your data" — you\'ll receive a .zip via email',
      'Open the zip and upload the ratings.csv file here',
    ],
    note: 'Imports your rated films. Unrated watched films are also accepted (from diary.csv).',
    parse: parseLetterboxd,
  },
  goodreads: {
    label: 'Goodreads',
    icon: BookOpen,
    color: '#553B08',
    type: 'book',
    accept: '.csv',
    instructions: [
      'Go to goodreads.com → My Books',
      'Click "Import and Export" in the left sidebar',
      'Click "Export Library" and download the CSV',
      'Upload the downloaded goodreads_library_export.csv here',
    ],
    note: 'Only "read" shelf books are imported. Ratings are on Goodreads\' 1–5 scale.',
    parse: parseGoodreads,
  },
}

export default function ImportModal({ onClose, onImported }) {
  const [platform, setPlatform] = useState(null)
  const [preview, setPreview] = useState(null) // { items, error }
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null) // { imported, skipped }
  const [showInstructions, setShowInstructions] = useState(false)
  const fileRef = useRef(null)

  const config = platform ? PLATFORMS[platform] : null

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const items = config.parse(ev.target.result)
        if (!items.length) {
          setPreview({ items: [], error: 'No valid items found in this file. Make sure you\'re uploading the correct CSV.' })
        } else {
          setPreview({ items, error: null })
        }
      } catch (err) {
        setPreview({ items: [], error: `Failed to parse file: ${err.message}` })
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!preview?.items?.length) return
    setImporting(true)
    try {
      const res = await post('/import', { source: platform, items: preview.items })
      setResult(res)
      onImported?.()
    } catch (err) {
      setPreview(p => ({ ...p, error: err.message || 'Import failed' }))
    } finally {
      setImporting(false)
    }
  }

  function reset() {
    setPlatform(null)
    setPreview(null)
    setResult(null)
    setShowInstructions(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const withRating = preview?.items?.filter(i => i.rating != null).length ?? 0
  const withDate = preview?.items?.filter(i => i.consumedAt).length ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-t08 overflow-hidden" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-t08">
          <div>
            <h3 className="font-display text-lg font-semibold">Import your history</h3>
            <p className="text-xs text-t40 mt-0.5">Bring in ratings from other platforms</p>
          </div>
          <button onClick={onClose} className="text-t40 hover:text-t70 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">

          {/* Success state */}
          {result && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(122,158,126,0.2)' }}>
                <Check size={28} style={{ color: '#7A9E7E' }} />
              </div>
              <h4 className="font-display text-xl font-semibold mb-1">Import complete!</h4>
              <p className="text-t60 text-sm mb-1">
                <span style={{ color: '#7A9E7E' }} className="font-semibold">{result.imported}</span> items imported
                {result.skipped > 0 && <span className="text-t40"> · {result.skipped} skipped (duplicates)</span>}
              </p>
              <p className="text-xs text-t30 mb-6">Your Stats tab has been updated.</p>
              <div className="flex gap-2">
                <button onClick={reset} className="btn-ghost flex-1">Import more</button>
                <button onClick={onClose} className="btn-primary flex-1">Done</button>
              </div>
            </div>
          )}

          {/* Platform picker */}
          {!result && !platform && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PLATFORMS).map(([id, p]) => {
                const Icon = p.icon
                return (
                  <button key={id} onClick={() => { setPlatform(id); setShowInstructions(true) }}
                    className="rounded-xl p-4 text-left border border-t08 hover:border-themed/20 transition-all"
                    style={{ background: 'var(--surface-03)' }}>
                    <Icon size={22} className="mb-2" style={{ color: p.color }} />
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{p.label}</p>
                    <p className="text-xs text-t40 mt-0.5 capitalize">{p.type}s</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Platform selected — upload flow */}
          {!result && platform && (
            <>
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-t40 hover:text-t70 transition-colors">
                ← Choose different platform
              </button>

              {/* Instructions toggle */}
              <div className="rounded-xl border border-t08 overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3 text-sm"
                  onClick={() => setShowInstructions(s => !s)}>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>How to export from {config.label}</span>
                  {showInstructions ? <ChevronUp size={15} className="text-t40" /> : <ChevronDown size={15} className="text-t40" />}
                </button>
                {showInstructions && (
                  <div className="px-4 pb-4 border-t border-t06" style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <ol className="mt-3 space-y-2">
                      {config.instructions.map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-t60">
                          <span className="shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
                            style={{ background: 'var(--accent-15)', color: '#E8A020' }}>{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-3 text-xs text-t30 border-t border-t06 pt-3">{config.note}</p>
                  </div>
                )}
              </div>

              {/* File drop zone */}
              {!preview && (
                <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-t15 hover:border-[#E8A020]/50 transition-colors py-8 cursor-pointer"
                  style={{ background: 'rgba(232,160,32,0.03)' }}>
                  <Upload size={24} className="text-t30" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-t70">Click to upload your CSV</p>
                    <p className="text-xs text-t30 mt-0.5">
                      {platform === 'letterboxd' ? 'ratings.csv or diary.csv' : 'goodreads_library_export.csv'}
                    </p>
                  </div>
                  <input ref={fileRef} type="file" accept={config.accept} className="hidden" onChange={handleFile} />
                </label>
              )}

              {/* Parse error */}
              {preview?.error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#E87070]/30 bg-[#E87070]/08 p-3.5 text-sm text-[#E87070]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Parse error</p>
                    <p className="text-xs mt-0.5 opacity-80">{preview.error}</p>
                    <label className="inline-block mt-2 text-xs underline cursor-pointer opacity-70 hover:opacity-100">
                      Try a different file
                      <input ref={fileRef} type="file" accept={config.accept} className="hidden" onChange={handleFile} />
                    </label>
                  </div>
                </div>
              )}

              {/* Preview */}
              {preview?.items?.length > 0 && (
                <>
                  <div className="rounded-xl border border-t08 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-t06" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{preview.items.length.toLocaleString()} items found</p>
                        <p className="text-xs text-t40 mt-0.5">
                          {withRating} rated · {withDate} with dates
                        </p>
                      </div>
                      <label className="text-xs text-[#E8A020]/70 hover:text-[#E8A020] cursor-pointer transition-colors">
                        Change file
                        <input ref={fileRef} type="file" accept={config.accept} className="hidden" onChange={(e) => { setPreview(null); handleFile(e) }} />
                      </label>
                    </div>

                    {/* Sample rows */}
                    <div className="divide-y divide-[#F5F0E8]/04">
                      {preview.items.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                          <config.icon size={13} className="shrink-0 text-t30" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-t90 truncate">{item.title}</p>
                            {item.subtitle && <p className="text-xs text-t40 truncate">{item.subtitle}</p>}
                          </div>
                          {item.rating && (
                            <span className="text-xs font-semibold shrink-0" style={{ color: '#E8A020' }}>{item.rating}★</span>
                          )}
                        </div>
                      ))}
                      {preview.items.length > 5 && (
                        <div className="px-4 py-2 text-xs text-center text-t30">
                          + {preview.items.length - 5} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={handleImport} disabled={importing}
                    className="btn-primary w-full flex items-center justify-center gap-2">
                    {importing
                      ? <><Loader2 size={15} className="animate-spin" /> Importing…</>
                      : `Import ${preview.items.length.toLocaleString()} ${config.type}s`
                    }
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
