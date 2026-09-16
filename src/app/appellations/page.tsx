import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import { getAllAppellationDetails } from '@/lib/data'
import styles from './appellations.module.css'

export const metadata: Metadata = {
  title: 'Wine Appellations Guide | 92 Regions of Origin | wwwine',
  description: 'Explore 92 wine appellations with grape varieties, terroir, tasting profiles, food pairings, vintages, and notable producers.',
  alternates: { canonical: '/appellations' },
  openGraph: {
    title: 'Wine Appellations Guide | wwwine',
    description: 'Static guide pages for 92 wine appellations across the World Wide Wine atlas.',
    type: 'website',
    images: [{ url: '/wwwine-logo.png' }],
  },
}

function excerpt(text: string) {
  return text.length > 150 ? `${text.slice(0, 147).trim()}...` : text
}

export default function AppellationsPage() {
  const appellations = getAllAppellationDetails().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className={styles.page}>
      <LegalHeader />
      <div className={styles.wrap}>
        <Link className={styles.back} href="/">Back to atlas</Link>
        <p className={styles.eyebrow}>wwwine appellations</p>
        <h1 className={styles.title}>Wine Appellations Guide</h1>
        <p className={styles.intro}>
          Explore all 92 appellations in the World Wide Wine atlas, from benchmark European AOCs and DOCs to
          high-altitude New World regions, island vineyards, desert valleys, and ancient wine cultures.
        </p>
        <div className={styles.meta} aria-label="Appellation guide summary">
          <span className={styles.pill}>92 appellations</span>
          <span className={styles.pill}>48 regions</span>
          <span className={styles.pill}>20 countries</span>
        </div>

        <div className={styles.listGrid}>
          {appellations.map(app => (
            <Link key={app.id} className={styles.listCard} href={`/appellations/${app.id}`}>
              <span className={styles.listName}>{app.name}</span>
              <span className={styles.listMeta}>{app.type} | {app.regionName}, {app.country}</span>
              <span className={styles.listDesc}>{excerpt(app.tastingProfile.style || app.description)}</span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
