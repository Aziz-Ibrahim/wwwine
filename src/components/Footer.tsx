import Link from 'next/link'
import Image from 'next/image'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import styles from './Footer.module.css'

interface FooterProps {
  compactOnMobile?: boolean
}

export default function Footer({ compactOnMobile = false }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${compactOnMobile ? styles.compactOnMobile : ''}`}>
      <div className={styles.inner}>

        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brand} aria-label="World Wide Wine home">
            <Image src="/wwwine-logo.png" alt="" width={36} height={36} className={styles.logo} />
            <span>
              <span className={styles.name}>World Wide Wine</span>
              <span className={styles.tagline}>An atlas for the curious palate.</span>
            </span>
          </Link>
        </div>

        <div className={styles.linkGrid}>
          <nav className={styles.linkGroup} aria-label="Explore">
            <span className={styles.groupTitle}>Explore</span>
            <Link href="/" className={styles.footerLink}>Wine atlas</Link>
            <Link href="/appellations" className={styles.footerLink}>Appellations</Link>
            <Link href="/coming-soon?section=guides" className={styles.footerLink}>Wine guides</Link>
          </nav>
          <nav className={styles.linkGroup} aria-label="Company">
            <span className={styles.groupTitle}>Company</span>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
            <Link href="/coming-soon?section=journal" className={styles.footerLink}>Journal</Link>
          </nav>
          <nav className={styles.linkGroup} aria-label="Information">
            <span className={styles.groupTitle}>Information</span>
            <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms</Link>
            <CookieSettingsButton />
          </nav>
        </div>
      </div>
      <div className={styles.bottom}>
        <span className={styles.copyright}>© {new Date().getFullYear()} World Wide Wine</span>
        <nav className={styles.compactLinks} aria-label="Footer navigation">
          <Link href="/about" className={styles.footerLink}>About</Link>
          <Link href="/contact" className={styles.footerLink}>Contact</Link>
          <CookieSettingsButton />
        </nav>
        <a
          href="https://aziz-ibrahim.github.io/my-portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.credit}
          aria-label="Visit the creator's portfolio"
        >
          <span className={styles.creditLabel}>Created by</span>
          <span className={styles.creditLogoWrap}>
            <Image src="/ai-logo.png" alt="" width={52} height={52} className={styles.creditLogo} />
          </span>
        </a>
      </div>
    </footer>
  )
}
