'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import type { WineBrowseEntry } from '@/lib/wine-register'
import { normalizeWineName } from '@/lib/wine-names'
import styles from '@/app/appellations/appellations.module.css'

export default function WineRegionBrowser({ entries, initialCountry = '' }: { entries: WineBrowseEntry[]; initialCountry?: string }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState(initialCountry)
  const countries = useMemo(() => [...new Map(entries.map(e => [e.countryCode, e.country])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [entries])
  const filtered = useMemo(() => {
    const q = normalizeWineName(query)
    return entries.filter(e => (!country || e.countryCode === country) && (!q || [e.name, ...e.aliases, e.country, e.area || ''].some(n => normalizeWineName(n).includes(q))))
  }, [entries, country, query])
  const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']
  const groups = letters.map(letter => ({ letter, entries: filtered.filter(e => {
    const first = normalizeWineName(e.name)[0]?.toUpperCase()
    return letter === '#' ? !/^[A-Z]$/.test(first || '') : first === letter
  }) }))

  return <>
    <div className={styles.browseFilters}>
      <label>Find a region
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or alternative spelling" />
      </label>
      <label>Country
        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
    </div>
    <p className={styles.browseCount} role="status">{filtered.length.toLocaleString('en')} regions, appellations and wine guides</p>
    <nav className={styles.alphabetIndex} aria-label="Browse regions by letter">
      <div className={styles.alphabetLetters}>
        {groups.map(group => group.entries.length ? <a key={group.letter} className={styles.letterLink} href={`#letter-${group.letter === '#' ? 'other' : group.letter}`} aria-label={`Names beginning with ${group.letter === '#' ? 'other characters' : group.letter}`}>{group.letter}</a> : <span key={group.letter} className={styles.letterDisabled}>{group.letter}</span>)}
      </div>
    </nav>
    {!filtered.length && <p className={styles.intro}>No matching entries. Try another name or country.</p>}
    {groups.filter(g => g.entries.length).map(group => <section key={group.letter} className={styles.letterSection} aria-labelledby={`letter-${group.letter === '#' ? 'other' : group.letter}`}>
      <div className={styles.letterHeading}><h2 id={`letter-${group.letter === '#' ? 'other' : group.letter}`} tabIndex={-1}>{group.letter}</h2></div>
      <ul className={styles.registerGrid}>
        {group.entries.map(entry => <li key={entry.id}>
          <Link className={styles.registerCard} href={entry.href as Route}>
            <span className={styles.listName}>{entry.name}</span>
            <span className={styles.registerMeta}>{entry.country} · {entry.designation} · {entry.level}</span>
            {entry.area && <span className={styles.registerMeta}>{entry.area}</span>}
            {entry.hasGuide && <span className={styles.guideBadge}>Tasting guide</span>}
          </Link>
        </li>)}
      </ul>
    </section>)}
  </>
}
