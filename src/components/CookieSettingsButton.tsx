'use client'

import styles from './Footer.module.css'

export default function CookieSettingsButton() {
  return (
    <button
      className={styles.legalButton}
      type="button"
      onClick={() => window.dispatchEvent(new Event('wwwine:open-consent'))}
    >
      Privacy choices
    </button>
  )
}
