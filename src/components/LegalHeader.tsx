'use client'

import { useState } from 'react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import styles from './LegalHeader.module.css'

const navItems: { label: string; href: Route }[] = [
  { label: 'Atlas', href: '/?view=map' },
  { label: 'Food', href: '/?view=food' },
  { label: 'Match', href: '/?view=match' },
  { label: 'Compare', href: '/?view=compare' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function LegalHeader() {
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

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
          {navItems.map(item => (
            <Link
              key={item.label}
              className={`${styles.pageLink} ${pathname === item.href ? styles.active : ''}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
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
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(open => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>
      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile navigation">
          {navItems.map(item => (
            <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
