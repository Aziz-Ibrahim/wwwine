import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Terms of Use | wwwine',
  description: 'The terms that govern use of wwwine, the World Wide Wine atlas.',
}

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <LegalHeader />
      <div className={styles.wrap}>
        <Link className={styles.back} href="/">Back to atlas</Link>
        <p className={styles.eyebrow}>wwwine</p>
        <h1 className={styles.title}>Terms of Use</h1>
        <p className={styles.intro}>
          These terms govern access to and use of wwwine, including the wine atlas, pairing tools, matching tools,
          comparison features, and any related intelligence views.
        </p>
        <p className={styles.updated}>Last updated: 15 September 2026</p>

        <section className={styles.section}>
          <h2>Using wwwine</h2>
          <p>You may use wwwine for personal research, learning, and wine discovery. You agree not to misuse the
            site, interfere with its operation, attempt unauthorised access, scrape at unreasonable volume, or use
            the service in a way that violates applicable law.</p>
        </section>

        <section className={styles.section}>
          <h2>Wine Information</h2>
          <p>wwwine provides educational and discovery information about wine regions, appellations, grape styles,
            food pairing, and related topics. It is not professional, medical, legal, financial, or alcohol-safety
            advice. You are responsible for complying with the alcohol laws and age restrictions that apply where
            you live.</p>
        </section>

        <section className={styles.section}>
          <h2>Accounts And Access</h2>
          <p>Most of wwwine can be used without an account. Some intelligence or business features may require an
            access key, paid relationship, or separate agreement. You must keep any access credentials confidential
            and use them only as authorised.</p>
        </section>

        <section className={styles.section}>
          <h2>Intellectual Property</h2>
          <p>The wwwine name, interface, written content, design, software, datasets, and generated insights belong
            to wwwine or its licensors unless stated otherwise. You may not copy, redistribute, sell, or create a
            competing dataset from the service without permission.</p>
        </section>

        <section className={styles.section}>
          <h2>Third-Party Links</h2>
          <p>wwwine may link to third-party websites, merchants, affiliates, or resources. Those services are
            independent from wwwine, and their own terms and privacy policies apply. wwwine is not responsible for
            third-party products, availability, pricing, fulfilment, or content.</p>
        </section>

        <section className={styles.section}>
          <h2>Availability</h2>
          <p>wwwine is provided on an as-is and as-available basis. Features may change, be interrupted, or be
            removed. To the extent permitted by law, wwwine does not provide warranties that the service will be
            uninterrupted, error-free, or suitable for a particular purpose.</p>
        </section>

        <section className={styles.section}>
          <h2>Liability</h2>
          <p>To the extent permitted by law, wwwine and its operator will not be liable for indirect, incidental,
            consequential, special, or punitive damages, or for losses arising from reliance on wine information,
            third-party links, outages, or unauthorised use of the service.</p>
        </section>

        <section className={styles.section}>
          <h2>Changes And Contact</h2>
          <p>These terms may be updated as wwwine evolves. Continued use of the site after changes means you accept
            the updated terms. Questions can be sent to <a href="mailto:hello@wwwine.com">hello@wwwine.com</a>.</p>
        </section>

        <nav className={styles.bottomNav} aria-label="Legal page navigation">
          <Link className={styles.back} href="/">Back to atlas</Link>
        </nav>
      </div>
      <Footer />
    </main>
  )
}
