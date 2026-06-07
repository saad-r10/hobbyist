import { describe, it, expect } from 'vitest'
import { parseCSV, splitCSVLine, parseLetterboxd, parseGoodreads } from '../utils/csvParsers.js'

describe('splitCSVLine', () => {
  it('splits a simple line', () => {
    expect(splitCSVLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted fields containing commas', () => {
    expect(splitCSVLine('"Hello, World",foo,bar')).toEqual(['Hello, World', 'foo', 'bar'])
  })

  it('handles escaped quotes inside quoted fields', () => {
    expect(splitCSVLine('"He said ""hi""",next')).toEqual(['He said "hi"', 'next'])
  })

  it('handles empty fields', () => {
    expect(splitCSVLine('a,,c')).toEqual(['a', '', 'c'])
  })
})

describe('parseCSV', () => {
  it('parses header and rows', () => {
    const csv = 'Name,Year\nInception,2010\nDune,2021'
    const rows = parseCSV(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ Name: 'Inception', Year: '2010' })
    expect(rows[1]).toEqual({ Name: 'Dune', Year: '2021' })
  })

  it('skips blank lines', () => {
    const csv = 'Name,Year\nInception,2010\n\nDune,2021\n'
    expect(parseCSV(csv)).toHaveLength(2)
  })

  it('handles Windows-style CRLF line endings', () => {
    const csv = 'Name,Year\r\nInception,2010\r\n'
    const rows = parseCSV(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].Name).toBe('Inception')
  })

  it('trims header whitespace', () => {
    const csv = ' Name , Year \nInception,2010'
    const rows = parseCSV(csv)
    expect(rows[0].Name).toBe('Inception')
  })
})

describe('parseLetterboxd', () => {
  const letterboxdCsv = `Date,Name,Year,Letterboxd URI,Rating
2023-01-15,Inception,2010,https://boxd.it/abc,4.5
2023-02-20,The Matrix,1999,https://boxd.it/def,5
2023-03-01,Bad Movie,2020,https://boxd.it/ghi,
`

  it('parses films with ratings', () => {
    const items = parseLetterboxd(letterboxdCsv)
    expect(items).toHaveLength(3)
    expect(items[0]).toMatchObject({ title: 'Inception', type: 'film', rating: 4.5 })
    expect(items[1]).toMatchObject({ title: 'The Matrix', type: 'film', rating: 5 })
  })

  it('sets rating to null when empty', () => {
    const items = parseLetterboxd(letterboxdCsv)
    const bad = items.find(i => i.title === 'Bad Movie')
    expect(bad.rating).toBeNull()
  })

  it('uses Year as subtitle', () => {
    const items = parseLetterboxd(letterboxdCsv)
    expect(items[0].subtitle).toBe('2010')
  })

  it('deduplicates rewatches', () => {
    const csv = `Date,Name,Year,Letterboxd URI,Rating
2022-01-01,Inception,2010,,4
2023-01-01,Inception,2010,,5
`
    const items = parseLetterboxd(csv)
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Inception')
  })

  it('skips rows with out-of-range ratings', () => {
    const csv = `Date,Name,Year,Letterboxd URI,Rating
2023-01-01,Good Film,2020,,3
2023-01-01,Bad Rating,2020,,6
`
    const items = parseLetterboxd(csv)
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Good Film')
  })

  it('returns empty array for empty CSV', () => {
    expect(parseLetterboxd('Date,Name,Year,Letterboxd URI,Rating\n')).toEqual([])
  })
})

describe('parseGoodreads', () => {
  const goodreadsCsv = `Title,Author,My Rating,Date Read,Exclusive Shelf
Dune,Frank Herbert,5,2023/01/15,read
"The Hitchhiker's Guide to the Galaxy",Douglas Adams,4,2022/06/10,read
Unread Book,Someone,0,,to-read
Currently Reading,Other,0,,currently-reading
Unrated Read,Author X,0,2023/05/01,read
`

  it('parses books from the read shelf', () => {
    const items = parseGoodreads(goodreadsCsv)
    const titles = items.map(i => i.title)
    expect(titles).toContain('Dune')
    expect(titles).toContain("The Hitchhiker's Guide to the Galaxy")
  })

  it('skips non-read shelves', () => {
    const items = parseGoodreads(goodreadsCsv)
    const titles = items.map(i => i.title)
    expect(titles).not.toContain('Unread Book')
    expect(titles).not.toContain('Currently Reading')
  })

  it('sets author as subtitle', () => {
    const items = parseGoodreads(goodreadsCsv)
    const dune = items.find(i => i.title === 'Dune')
    expect(dune.subtitle).toBe('Frank Herbert')
  })

  it('sets rating to null when Goodreads rating is 0', () => {
    const items = parseGoodreads(goodreadsCsv)
    const unrated = items.find(i => i.title === 'Unrated Read')
    expect(unrated.rating).toBeNull()
  })

  it('sets type to book for all items', () => {
    const items = parseGoodreads(goodreadsCsv)
    expect(items.every(i => i.type === 'book')).toBe(true)
  })

  it('handles titles with commas (quoted CSV)', () => {
    const items = parseGoodreads(goodreadsCsv)
    const hitch = items.find(i => i.title.includes("Hitchhiker"))
    expect(hitch).toBeDefined()
  })
})
