import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import { getAllAppellationDetails } from '@/lib/data'
import styles from './appellations.module.css'

export const metadata: Metadata = {
  title: 'Wine Appellations Guide | 122 Regions of Origin | wwwine',
  description: 'Explore 122 wine appellations with grape varieties, terroir, tasting profiles, food pairings, vintages, and notable producers.',
  alternates: { canonical: '/appellations' },
  openGraph: {
    title: 'Wine Appellations Guide | wwwine',
    description: 'Static guide pages for 122 wine appellations across the World Wide Wine atlas.',
    type: 'website',
    images: [{ url: '/wwwine-logo.png' }],
  },
}

function excerpt(text: string) {
  return text.length > 150 ? `${text.slice(0, 147).trim()}...` : text
}

export default function AppellationsPage() {
  const appellations = getAllAppellationDetails().sort((a, b) => a.name.localeCompare(b.name))
  const regionCount = new Set(appellations.map(app => app.regionId)).size
  const countryCount = new Set(appellations.map(app => app.countryCode)).size
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const groups = alphabet.map(letter => ({
    letter,
    appellations: appellations.filter(app =>
      app.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().startsWith(letter)
    ),
  }))

  return (
    <main className={styles.page}>
      <LegalHeader />
      <div className={styles.wrap}>
        <Link className={styles.back} href="/">Back to atlas</Link>
        <p className={styles.eyebrow}>wwwine appellations</p>
        <h1 className={styles.title}>Wine Appellations Guide</h1>
        <p className={styles.intro}>
          Explore all {appellations.length} appellations in the World Wide Wine atlas, from benchmark European AOCs and DOCs to
          high-altitude New World regions, island vineyards, desert valleys, and ancient wine cultures.
        </p>
        <div className={styles.meta} aria-label="Appellation guide summary">
          <span className={styles.pill}>{appellations.length} appellations</span>
          <span className={styles.pill}>{regionCount} regions</span>
          <span className={styles.pill}>{countryCount} countries</span>
        </div>

        <aside className={`${styles.affiliateSlot} ${styles.affiliateSlotWide}`} aria-label="Affiliate banner">
          <span className={styles.affiliateLabel}>Affiliate banner</span>
          <div className={styles.affiliateCanvas} data-affiliate-slot="appellations-index-top" />
        </aside>

        <nav className={styles.alphabetIndex} aria-label="Browse appellations by letter" id="alphabet-index">
          <div className={styles.alphabetLetters}>
            {groups.map(group => group.appellations.length > 0 ? (
              <a key={group.letter} className={styles.letterLink} href={`#letter-${group.letter}`} aria-label={`Appellations beginning with ${group.letter}`}>
                {group.letter}
              </a>
            ) : (
              <span key={group.letter} className={styles.letterDisabled} aria-label={`No appellations beginning with ${group.letter}`}>
                {group.letter}
              </span>
            ))}
          </div>
        </nav>

        {groups.filter(group => group.appellations.length > 0).map(group => (
          <section key={group.letter} className={styles.letterSection} aria-labelledby={`letter-${group.letter}`}>
            <div className={styles.letterHeading}>
              <h2 id={`letter-${group.letter}`} tabIndex={-1}>{group.letter}</h2>
            </div>
            <div className={styles.listGrid}>
          {group.appellations.map(app => (
            <Link key={app.id} className={styles.listCard} href={`/appellations/${app.id}`}>
              <span className={styles.listImageWrap}>
                <Image
                  className={styles.listImage}
                  src={app.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 860px) 112px, 128px"
                />
              </span>
              <span className={styles.listCopy}>
                <span className={styles.listName}>{app.name}</span>
                <span className={styles.listMeta}>{app.type} | {app.regionName}, {app.country}</span>
                <span className={styles.listDesc}>{excerpt(app.tastingProfile.style || app.description)}</span>
              </span>
            </Link>
          ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </main>
  )
}
