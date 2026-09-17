'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import styles from './LegalHeader.module.css'

export default function LegalHeader() {
  const { theme, toggle } = useTheme()

  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Back to wwwine atlas">
        <Image src="/wwwine-logo.png" alt="" width={40} height={40} className={styles.logoImg} priority />
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>World Wide Wine</span>
          <span className={styles.brandSubtitle}>An Atlas of Wine</span>
        </div>
      </Link>

      <div className={styles.right}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link className={styles.pageLink} href="/about">About</Link>
          <Link className={styles.pageLink} href="/contact">Contact</Link>
          <Link className={styles.atlasLink} href="/">Open atlas</Link>
        </nav>
        <button
          className={styles.themeBtn}
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
