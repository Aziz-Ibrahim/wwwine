'use client'

import Image from 'next/image'
import type { AppView } from '@/types'
import styles from './Header.module.css'

interface Props {
  view: AppView
  onViewChange: (v: AppView) => void
}

export default function Header({ view, onViewChange }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Image
          src="/wwwine-logo.png"
          alt="wwwine — World Wide Wine Atlas"
          width={160}
          height={160}
          className={styles.logoImg}
          priority
        />
      </div>

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
    </header>
  )
}
