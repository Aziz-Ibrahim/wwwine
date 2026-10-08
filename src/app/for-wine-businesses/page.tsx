import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LegalHeader from '@/components/LegalHeader'
import styles from '../info.module.css'
import businessStyles from './businesses.module.css'

export const metadata: Metadata = {
  title: 'For Wine Businesses | wwwine',
  description: 'A £350 paid pilot: a branded, hosted food-pairing page recommending 20–30 wines from your range, with buying links and one revision.',
  alternates: { canonical: '/for-wine-businesses' },
}

export default function WineBusinessesPage() {
  return <div className={styles.page}>
    <LegalHeader />
    <main className={styles.main}>
      <p className={styles.eyebrow}>For wine businesses</p>
      <h1 className={styles.title}>Turn food inspiration into a wine recommendation.</h1>
      <p className={styles.lead}>Help customers choose from your range with a branded food-pairing page. Start with a £350 paid pilot featuring 20–30 wines and links to buy from you.</p>
      <div className={styles.actions}>
        <Link href="#demo" className={styles.secondary}>See the demo</Link>
        <Link href="/contact" className={styles.primary}>Enquire about the pilot</Link>
      </div>
      <div className={styles.rule} />

      <section id="demo" className={`${styles.grid} ${businessStyles.section}`} aria-labelledby="demo-title">
        <h2 id="demo-title" className={styles.sectionLabel}>Try the demo</h2>
        <div className={styles.copy}>
          <p>Try the existing wwwine food-pairing tool: enter a dish or ingredient to discover matching wine styles. Your pilot would adapt this experience to a sample of your own range, with links to your product pages.</p>
          <Link href="/?view=food" className={businessStyles.demoCard}>
            <Image src="/wine-colours/ruby.png" alt="Ruby-coloured wine in a glass" width={160} height={160} className={businessStyles.demoImage} />
            <div>
              <span className={styles.eyebrow}>Working demo</span>
              <h3>Food & Wine Pairing</h3>
              <p>Try roast lamb, mushrooms or grilled fish and explore the recommendations.</p>
              <span className={businessStyles.demoLink}>Try the pairing tool →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className={`${styles.grid} ${businessStyles.section}`} aria-labelledby="deliverables-title">
        <h2 id="deliverables-title" className={styles.sectionLabel}>Deliverables</h2>
        <div className={styles.copy}>
          <p>The paid pilot has a focused scope:</p>
          <ul className={businessStyles.deliverables}>
            <li><strong>One branded, hosted pairing page</strong><span>Your business identity in a layout that works on phones, tablets and desktops.</span></li>
            <li><strong>20–30 wines from a sample range</strong><span>Food-pairing recommendations using the wine details and sample selection you supply.</span></li>
            <li><strong>Links to buy from you</strong><span>Recommendations link to your existing product pages, where customers can buy.</span></li>
            <li><strong>One revision</strong><span>One round of feedback to refine the page and recommendations within the agreed scope.</span></li>
            <li><strong>Manual stock updates</strong><span>Stock changes are handled manually during the pilot. There is no automatic stock sync.</span></li>
          </ul>
          <p>The pilot covers one page and the agreed sample range. Hosting arrangements, delivery timing and the process for manual updates are confirmed before work starts. Additional wines, pages or integrations can be discussed separately.</p>
        </div>
      </section>

      <section className={`${styles.grid} ${businessStyles.section}`} aria-labelledby="price-title">
        <h2 id="price-title" className={styles.sectionLabel}>Price & enquiry</h2>
        <div className={styles.copy}>
          <h3 className={businessStyles.price}>£350 paid pilot</h3>
          <p>A focused way to try food-pairing recommendations with your own wines before considering a wider rollout.</p>
          <p>Tell us about your business and the sample range you would like to feature. We will confirm the scope and next steps with you.</p>
          <div className={styles.actions}><Link href="/contact" className={styles.primary}>Enquire about the pilot</Link></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
