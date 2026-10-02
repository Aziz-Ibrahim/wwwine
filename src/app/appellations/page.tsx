import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import WineRegionBrowser from '@/components/WineRegionBrowser'
import { getWineBrowseEntries } from '@/lib/wine-register'
import styles from './appellations.module.css'

export const metadata: Metadata = {
  title: 'Wine Regions & Appellations | wwwine',
  description: 'Browse wine regions and appellations by country or name, with wine styles, tasting guides and food pairings.',
  alternates: { canonical: '/appellations' },
  openGraph: {
    title: 'Wine Regions & Appellations | wwwine',
    description: 'Explore wine regions, official appellations and tasting guides across the World Wide Wine atlas.',
    type: 'website',
    images: [{ url: '/wwwine-logo.png' }],
  },
}

export default function AppellationsPage({ searchParams }: { searchParams: { country?: string } }) {
  const entries = getWineBrowseEntries()
  const country = entries.some(e => e.countryCode === searchParams.country) ? searchParams.country : ''
  return (
    <main className={styles.page}>
      <LegalHeader />
      <div className={styles.wrap}>
        <Link className={styles.back} href="/">Back to atlas</Link>
        <p className={styles.eyebrow}>wwwine regions & appellations</p>
        <h1 className={styles.title}>Wine Regions & Appellations</h1>
        <p className={styles.intro}>Explore wine-growing places by country or name. Discover official appellations, regional designations and selected guides to the wines they produce.</p>
        <div className={styles.meta} aria-label="Catalogue summary">
          <span className={styles.pill}>{entries.length.toLocaleString('en')} appellations & wine guides</span>
          <span className={styles.pill}>{new Set(entries.map(e => e.countryCode)).size} countries with entries</span>
        </div>
        <details className={styles.coverage}>
          <summary>About the catalogue</summary>
          <p>The catalogue includes regions and appellations with available wine guides. Shared entries group designations that currently lead to the same wine. Each guide describes a representative style; this is not a complete register of official regions.</p>
        </details>
        <aside className={`${styles.affiliateSlot} ${styles.affiliateSlotWide}`} aria-label="Affiliate banner">
          <span className={styles.affiliateLabel}>Affiliate banner</span>
          <div className={styles.affiliateCanvas} data-affiliate-slot="appellations-index-top" />
        </aside>
        <WineRegionBrowser key={country} entries={entries} initialCountry={country} />
      </div>
      <Footer />
    </main>
  )
}
