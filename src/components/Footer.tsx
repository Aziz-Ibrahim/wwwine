import Link from 'next/link'
import Image from 'next/image'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import styles from './Footer.module.css'

interface FooterProps {
  compactOnMobile?: boolean
}

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/wwwine.co.uk/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61594993596073' },
]

function SocialIcon({ label }: { label: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    {label === 'Instagram' ? <>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </> : <path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5c-.6-.1-1.8-.3-3.2-.3C11.5 1.2 10 3.3 10 6.5V9H7v4h3v9z" fill="currentColor" />}
  </svg>
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
          <nav className={styles.socialLinks} aria-label="Social media">
            {socialLinks.map(({ label, href }) => (
              <a key={label} href={href} className={`${styles.footerLink} ${styles.socialLink}`} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}><SocialIcon label={label} />{label}</a>
            ))}
          </nav>
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
            <Link href={{ pathname: '/for-wine-businesses' }} className={styles.footerLink}>For wine businesses</Link>
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
        <span className={styles.copyrightLine}>
          <span className={styles.copyright}>© {new Date().getFullYear()} World Wide Wine</span>
          <span className={styles.copyrightDivider} aria-hidden="true">/</span>
          <span className={styles.version}>v6.4.1</span>
        </span>
        <nav className={styles.compactLinks} aria-label="Footer navigation">
          <Link href="/about" className={styles.footerLink}>About</Link>
          <Link href={{ pathname: '/for-wine-businesses' }} className={styles.footerLink}>For wine businesses</Link>
          <Link href="/contact" className={styles.footerLink}>Contact</Link>
          <CookieSettingsButton />
          {socialLinks.map(({ label, href }) => (
            <a key={label} href={href} className={`${styles.footerLink} ${styles.socialLink}`} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}><SocialIcon label={label} />{label}</a>
          ))}
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
