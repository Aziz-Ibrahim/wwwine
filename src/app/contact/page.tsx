import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import styles from '../info.module.css'

export const metadata: Metadata = {
  title: 'Contact | wwwine',
  description: 'Get in touch with World Wide Wine.',
}

export default function ContactPage() {
  return <div className={styles.page}>
    <LegalHeader />
    <main className={styles.main}>
      <p className={styles.eyebrow}>Contact</p>
      <h1 className={styles.title}>Let&apos;s talk wine.</h1>
      <p className={styles.lead}>Found a detail worth refining, have a region to recommend, or want to discuss a collaboration? We would be glad to hear from you.</p>
      <div className={styles.rule} />
      <section className={styles.grid}>
        <h2 className={styles.sectionLabel}>Start a conversation</h2>
        <div className={styles.copy}>
          <p>For editorial corrections, partnerships, product feedback, or general enquiries, email us directly. Please include the relevant region or appellation when reporting atlas information.</p>
          <div className={styles.actions}><a href="mailto:hello@wwwine.com" className={styles.primary}>hello@wwwine.com</a><a href="https://github.com/Aziz-Ibrahim" target="_blank" rel="noopener noreferrer" className={styles.secondary}>GitHub ↗</a></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
