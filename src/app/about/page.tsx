import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import styles from '../info.module.css'

export const metadata: Metadata = {
  title: 'About | wwwine',
  description: 'The story and purpose behind the World Wide Wine interactive atlas.',
}

export default function AboutPage() {
  return <div className={styles.page}>
    <LegalHeader />
    <main className={styles.main}>
      <p className={styles.eyebrow}>About wwwine</p>
      <h1 className={styles.title}>The world of wine, made easier to explore.</h1>
      <p className={styles.lead}>World Wide Wine is an interactive atlas for discovering the places, grapes, traditions, and producers that give every bottle its sense of origin.</p>
      <div className={styles.rule} />
      <section className={styles.grid}>
        <h2 className={styles.sectionLabel}>Our purpose</h2>
        <div className={styles.copy}>
          <p>Wine can feel needlessly difficult. wwwine connects geography with flavour, turning regions and appellations into a visual journey that rewards curiosity at every level.</p>
          <p>The atlas brings together <strong>regional context, tasting profiles, food pairings, vintages, and notable producers</strong> in one focused experience. It is built for the moment when you want to understand not only what is in the glass, but why it tastes the way it does.</p>
          <div className={styles.actions}><Link href="/" className={styles.primary}>Explore the atlas</Link><Link href="/appellations" className={styles.secondary}>Browse appellations</Link></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
