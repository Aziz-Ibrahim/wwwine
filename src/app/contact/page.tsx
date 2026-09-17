import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import ContactForm from '@/components/ContactForm'
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
          <p>For editorial corrections, partnerships, product feedback, or general enquiries, send a message below. Please include the relevant region or appellation when reporting atlas information.</p>
          <ContactForm />
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
