export function parseCSV(text) {
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

export function splitCSVLine(line) {
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

export function parseLetterboxd(text) {
  const rows = parseCSV(text)
  const items = []
  const seen = new Set()

  for (const row of rows) {
    const title = row['Name'] || row['name']
    if (!title) continue
    const key = title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const ratingRaw = row['Rating'] || row['rating'] || ''
    const rating = ratingRaw ? parseFloat(ratingRaw) : null

    const dateRaw = row['Watched Date'] || row['Date'] || row['date'] || ''
    const consumedAt = dateRaw ? new Date(dateRaw).toISOString() : null

    const year = row['Year'] || row['year'] || ''
    const subtitle = year ? year : ''

    if (isNaN(rating) || (rating !== null && (rating < 0.5 || rating > 5))) continue

    items.push({ title, subtitle, type: 'film', rating: rating || null, consumedAt })
  }

  return items
}

export function parseGoodreads(text) {
  const rows = parseCSV(text)
  const items = []

  for (const row of rows) {
    const title = row['Title'] || row['title']
    if (!title) continue

    const shelf = row['Exclusive Shelf'] || ''
    if (shelf && shelf !== 'read') continue

    const author = row['Author'] || row['Author l-f'] || ''
    const ratingRaw = row['My Rating'] || '0'
    const rating = parseInt(ratingRaw, 10)
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
