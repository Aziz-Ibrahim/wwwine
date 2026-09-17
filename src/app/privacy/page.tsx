import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy | wwwine',
  description: 'How wwwine handles anonymous behavioural data, preference storage, and privacy rights.',
}

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <LegalHeader />
      <div className={styles.wrap}>
        <Link className={styles.back} href="/">Back to atlas</Link>
        <p className={styles.eyebrow}>wwwine</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.intro}>
          wwwine collects anonymous behavioural data that is necessary for the atlas and wine-intent features to
          understand which wines, regions, searches, and tools people find useful.
        </p>
        <p className={styles.updated}>Last updated: 15 September 2026</p>

        <section className={styles.section}>
          <h2>Who We Are</h2>
          <p>wwwine is an interactive wine atlas created by Aziz Ibrahim. You can contact the operator through the{' '}
            <Link href="/contact">contact form</Link>.</p>
        </section>

        <section className={styles.section}>
          <h2>What We Collect</h2>
          <p>wwwine collects anonymous behavioural events such as viewed countries, wine regions and appellations,
            searches, food pairing queries, comparison activity, quiz results, affiliate click intent, dwell-time
            buckets, timestamps, timezone, and a random session ID for the current visit.</p>
          <p>wwwine does not ask for an account, and the behavioural event stream is not designed to collect names,
            email addresses, postal addresses, phone numbers, IP addresses, user agents, or precise device
            fingerprinting data.</p>
          <p>If you use the contact form, wwwine collects the name, email address, contact reason, and message that
            you choose to provide. This information is kept separately from anonymous behavioural events and is used
            only to review and respond to your enquiry.</p>
        </section>

        <section className={styles.section}>
          <h2>Cookies And Local Storage</h2>
          <p>wwwine uses local storage for essential preferences, including theme choice and whether you have seen
            the privacy preferences panel. Anonymous behavioural data is sent to the wwwine intent endpoint because
            it is treated as necessary for the service.</p>
          <p>You can review this information at any time by using the Privacy preferences control in the site footer.</p>
        </section>

        <section className={styles.section}>
          <h2>Why We Use Data</h2>
          <p>Anonymous behavioural data helps wwwine:</p>
          <ul>
            <li>Understand which regions, appellations, searches, and pairings are useful.</li>
            <li>Improve the atlas, matching tools, and wine comparison experience.</li>
            <li>Create aggregated wine-intelligence reports without identifying individual visitors.</li>
            <li>Measure broad purchase intent, such as interest in merchant or affiliate actions.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Legal Basis</h2>
          <p>In the UK and European Economic Area, anonymous behavioural measurement is treated as necessary for the
            operation and improvement of wwwine&apos;s wine-intent features. Essential preference storage is used because
            it is necessary to remember choices you make while using the site.</p>
        </section>

        <section className={styles.section}>
          <h2>Sharing And Retention</h2>
          <p>wwwine may use aggregated, anonymised insights commercially, including in private intelligence
            dashboards or reports. Raw behavioural events are not sold as personal data.</p>
          <p>Behavioural data is intended to be retained for up to 90 days before deletion or aggregation. Because
            the data is anonymous, it may not be possible to identify or delete a specific visitor&apos;s events
            after they have been collected.</p>
          <p>Contact messages are accessible only through the private administration dashboard and are retained only
            for as long as reasonably necessary to handle the enquiry, maintain an appropriate correspondence record,
            or meet legal obligations.</p>
        </section>

        <section className={styles.section}>
          <h2>Your Rights</h2>
          <p>Depending on where you live, you may have rights to access, correct, delete, restrict, or object to
            processing of personal data. Because wwwine is designed not to collect directly identifying data, some
            rights may be limited where the site cannot reasonably connect anonymous events to you.</p>
          <p>For privacy questions or requests, use the <Link href="/contact">contact form</Link> and select Privacy request.</p>
        </section>

        <nav className={styles.bottomNav} aria-label="Legal page navigation">
          <Link className={styles.back} href="/">Back to atlas</Link>
        </nav>
      </div>
      <Footer />
    </main>
  )
}
