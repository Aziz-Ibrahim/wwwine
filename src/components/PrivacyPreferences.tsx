'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './PrivacyPreferences.module.css'

const PREFERENCES_KEY = 'wwwine-privacy-preferences'

export default function PrivacyPreferences() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const openPreferences = () => setVisible(true)

    try {
      const saved = window.localStorage.getItem(PREFERENCES_KEY)
      setVisible(saved !== 'acknowledged')
    } catch {
      setVisible(false)
    }

    window.addEventListener('wwwine:open-preferences', openPreferences)
    return () => window.removeEventListener('wwwine:open-preferences', openPreferences)
  }, [])

  function save() {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, 'acknowledged')
    } catch {
      // Preference storage is best-effort.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside className={styles.banner} aria-label="Privacy preferences">
      <div className={styles.copy}>
        <p className={styles.title}>Privacy preferences</p>
        <p className={styles.text}>
          wwwine uses essential local storage for site preferences and collects anonymous behavioural data required
          to run its wine-intent features, including searches, wine views, comparisons, quiz results, and similar
          usage signals. This panel does not collect directly identifying data.
        </p>
        <Link className={styles.link} href="/privacy">Read the Privacy Policy</Link>
      </div>
      <div className={styles.actions}>
        <button className={styles.primary} type="button" onClick={save}>
          Save preferences
        </button>
      </div>
    </aside>
  )
}
