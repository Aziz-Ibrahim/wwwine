import type { Metadata } from 'next'
import Link from 'next/link'
import LegalHeader from '@/components/LegalHeader'
import styles from '../info.module.css'

export const metadata: Metadata = { title: 'Coming Soon | wwwine' }

const labels: Record<string, string> = { guides: 'Wine guides', journal: 'The journal', cellar: 'My cellar' }

export default function ComingSoonPage({ searchParams }: { searchParams: { section?: string } }) {
  const label = labels[searchParams.section ?? ''] ?? 'This section'
  return <div className={styles.page}>
    <LegalHeader />
    <main className={styles.coming}>
      <p className={styles.eyebrow}>In the works</p>
      <h1 className={styles.title}>{label} is coming soon.</h1>
      <p className={styles.lead}>We are preparing something considered and useful. Until then, there is plenty more to discover across the atlas.</p>
      <div className={styles.actions}><Link href="/" className={styles.primary}>Return to the atlas</Link><Link href="/appellations" className={styles.secondary}>Browse appellations</Link></div>
    </main>
  </div>
}
