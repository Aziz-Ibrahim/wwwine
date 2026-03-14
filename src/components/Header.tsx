'use client'

import Image from 'next/image'
import type { AppView } from '@/types'
import type { SearchResult } from '@/lib/search'
import SearchBar from '@/components/SearchBar'
import styles from './Header.module.css'

interface Props {
  view: AppView
  onViewChange: (v: AppView) => void
  onSearchResult: (r: SearchResult) => void
}

export default function Header({ view, onViewChange, onSearchResult }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Image
          src="/wwwine-logo.png"
          alt="wwwine"
          width={52}
          height={52}
          className={styles.logoImg}
          priority
        />
        <div className={styles.brandText}>
          <div className={styles.brandTitle}>World Wide Wine</div>
          <div className={styles.brandSubtitle}>An Atlas of Wine</div>
        </div>
      </div>

      <div className={styles.right}>
        <SearchBar onResult={onSearchResult} />
        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${view === 'map' ? styles.active : ''}`}
            onClick={() => onViewChange('map')}
          >
            Atlas
          </button>
          <button
            className={`${styles.navBtn} ${view === 'compare' ? styles.active : ''}`}
            onClick={() => onViewChange('compare')}
          >
            Compare
          </button>
        </nav>
      </div>
    </header>
  )
}
