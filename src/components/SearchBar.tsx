'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { search } from '@/lib/search'
import type { SearchResult } from '@/lib/search'
import styles from './SearchBar.module.css'

const TYPE_ICON: Record<string, string> = {
  country:     '🌍',
  region:      '📍',
  appellation: '🍷',
  grape:       '🍇',
}

interface Props {
  onResult: (result: SearchResult) => void
}

export default function SearchBar({ onResult }: Props) {
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [active,  setActive]  = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)

  // run search on every keystroke
  useEffect(() => {
    setResults(search(query))
    setActive(-1)
  }, [query])

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const commit = useCallback((r: SearchResult) => {
    onResult(r)
    setQuery('')
    setResults([])
    setOpen(false)
  }, [onResult])

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActive((a: number) => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setActive((a: number) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter')      { if (active >= 0 && results[active]) commit(results[active]) }
    if (e.key === 'Escape')     { setOpen(false); setQuery('') }
  }

  const showDropdown = open && query.length >= 2

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {/* collapsed: just a search icon button */}
      {!open && (
        <button
          className={styles.iconBtn}
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
          </svg>
        </button>
      )}

      {/* expanded: input + optional dropdown */}
      {open && (
        <div className={styles.expanded}>
          <div className={styles.inputWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
            </svg>
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="Country, region, appellation or grape…"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={onKey}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => { setQuery(''); inputRef.current?.focus() }}>✕</button>
            )}
            <button className={styles.closeBtn} onClick={() => { setOpen(false); setQuery('') }}>✕</button>
          </div>

          {showDropdown && (
            <div className={styles.dropdown}>
              {results.length === 0 ? (
                <div className={styles.noResults}>
                  <span className={styles.noResultsIcon}>🔍</span>
                  <span className={styles.noResultsText}>No results for <em>"{query}"</em></span>
                  <span className={styles.noResultsSub}>Try a country, region, appellation or grape variety</span>
                </div>
              ) : (
                results.map((r: SearchResult, i: number) => (
                  <button
                    key={`${r.type}-${r.label}-${i}`}
                    className={`${styles.result} ${i === active ? styles.resultActive : ''}`}
                    onMouseDown={() => commit(r)}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className={styles.resultIcon}>{TYPE_ICON[r.type]}</span>
                    <span className={styles.resultText}>
                      <span className={styles.resultLabel}>{r.label}</span>
                      <span className={styles.resultSub}>{r.sublabel}</span>
                    </span>
                    <span className={styles.resultType}>{r.type}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
