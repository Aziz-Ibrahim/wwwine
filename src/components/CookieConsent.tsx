'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './CookieConsent.module.css'

const CONSENT_KEY = 'wwwine-cookie-consent'

type ConsentChoice = 'accepted' | 'declined'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const openPreferences = () => setVisible(true)

    try {
      const saved = window.localStorage.getItem(CONSENT_KEY)
      setVisible(saved !== 'accepted' && saved !== 'declined')
    } catch {
      setVisible(false)
    }

    window.addEventListener('wwwine:open-consent', openPreferences)
    return () => window.removeEventListener('wwwine:open-consent', openPreferences)
  }, [])

  function save(choice: ConsentChoice) {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice)
    } catch {
      // Consent storage is best-effort; tracking remains disabled without it.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside className={styles.banner} aria-label="Cookie consent">
      <div className={styles.copy}>
        <p className={styles.title}>Privacy preferences</p>
        <p className={styles.text}>
          wwwine uses essential local storage for site preferences. With your consent, it also collects anonymous
          behavioural data about searches, wine views, comparisons, quiz results, and similar usage signals.
        </p>
        <Link className={styles.link} href="/privacy">Read the Privacy Policy</Link>
      </div>
      <div className={styles.actions}>
        <button className={styles.secondary} type="button" onClick={() => save('declined')}>
          Decline
        </button>
        <button className={styles.primary} type="button" onClick={() => save('accepted')}>
          Accept analytics
        </button>
      </div>
    </aside>
  )
}
