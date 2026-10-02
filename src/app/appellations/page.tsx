import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import WineRegionBrowser from '@/components/WineRegionBrowser'
import { getWineBrowseEntries, wineRegister, registerSources } from '@/lib/wine-register'
import styles from './appellations.module.css'

export const metadata: Metadata = {
  title: 'Wine Regions & Appellations | wwwine',
  description: 'Browse wine regions and appellations by country or name, with official register sources and selected tasting guides.',
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
          <span className={styles.pill}>{wineRegister.length.toLocaleString('en')} registered designations</span>
          <span className={styles.pill}>{new Set(entries.map(e => e.countryCode)).size} countries with entries</span>
        </div>
        <details className={styles.coverage}>
          <summary>Sources and coverage</summary>
          <p>This catalogue is expanding toward worldwide coverage. It is not yet a complete list of every country’s official regions. Designations can overlap and include regions, subregions and broader areas. A tasting guide describes a representative wine style.</p>
          <ul>{registerSources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a>: {source.recordCount.toLocaleString('en')} entries. {source.scope} Checked {source.checkedAt}.</li>)}</ul>
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
