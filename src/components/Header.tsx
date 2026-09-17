'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { AppView } from '@/types'
import type { SearchResult } from '@/lib/search'
import { useTheme } from '@/components/ThemeProvider'
import SearchBar from '@/components/SearchBar'
import styles from './Header.module.css'

interface Props {
  view: AppView
  onViewChange: (v: AppView) => void
  onSearchResult: (r: SearchResult) => void
}

const NAV: { key: AppView; label: string; icon: string }[] = [
  { key: 'map',     label: 'Atlas',   icon: '🗺' },
  { key: 'food',    label: 'Food',    icon: '🍽' },
  { key: 'match',   label: 'Match',   icon: '✨' },
  { key: 'compare', label: 'Compare', icon: '⚖' },
]

export default function Header({ view, onViewChange, onSearchResult }: Props) {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef  = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click — but explicitly ignore clicks ON the burger button
  // (the burger's own onClick handles toggle; without this exclusion mousedown
  //  closes the menu then onClick reopens it, making the X appear broken)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current   && !menuRef.current.contains(target) &&
        burgerRef.current && !burgerRef.current.contains(target)
      ) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const navigate = (v: AppView) => { onViewChange(v); setMenuOpen(false) }

  return (
    <>
      <header className={styles.header}>
        {/* Brand */}
        <button className={styles.brand} type="button" onClick={() => navigate('map')} aria-label="Open the wine atlas">
          <Image src="/wwwine-logo.png" alt="wwwine" width={40} height={40} className={styles.logoImg} priority />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>World Wide Wine</span>
            <span className={styles.brandSubtitle}>An Atlas of Wine</span>
          </div>
        </button>

        {/* Right cluster */}
        <div className={styles.right}>
          <nav className={styles.desktopNav}>
            {NAV.map(n => (
              <button
                key={n.key}
                className={`${styles.navBtn} ${view === n.key ? styles.active : ''}`}
                onClick={() => onViewChange(n.key)}
              >{n.label}</button>
            ))}
          </nav>

          <span className={styles.navDivider} aria-hidden="true" />
          <Link href="/about" className={styles.utilityLink}>About</Link>

          <SearchBar onResult={r => { onSearchResult(r); setMenuOpen(false) }} />

          {/* Theme toggle */}
          <button className={styles.themeBtn} onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Burger — ref added for outside-click exclusion */}
          <button
            ref={burgerRef}
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className={styles.mobileMenu} ref={menuRef}>
          <nav className={styles.mobileNav}>
            {NAV.map(n => (
              <button
                key={n.key}
                className={`${styles.mobileNavBtn} ${view === n.key ? styles.mobileActive : ''}`}
                onClick={() => navigate(n.key)}
              >
                <span className={styles.mobileIcon}>{n.icon}</span>
                <span className={styles.mobileLabel}>{n.label}</span>
                {view === n.key && <span className={styles.mobileTick}>✓</span>}
              </button>
            ))}
            <div className={styles.mobileRule} />
            <Link href="/about" className={styles.mobilePageLink} onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" className={styles.mobilePageLink} onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
        </div>
      )}

      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />}
    </>
  )
}
