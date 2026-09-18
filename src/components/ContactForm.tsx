'use client'

import { FormEvent, useState } from 'react'
import styles from './ContactForm.module.css'

const REASONS = [
  'Atlas correction',
  'Region suggestion',
  'Partnership',
  'Product feedback',
  'Press enquiry',
  'Privacy request',
  'Other',
]

export default function ContactForm() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    const formEl = event.currentTarget          // ← save ref before any await
    const form = new FormData(formEl)
    const payload = Object.fromEntries(form.entries())

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send your message.')
      formEl.reset()                             // ← use saved ref, not event.currentTarget
      setMessage('')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message.')
      setStatus('error')
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Name</span>
          <input name="name" type="text" minLength={2} maxLength={80} autoComplete="name" required />
        </label>
        <label className={styles.field}>
          <span>Email address</span>
          <input name="email" type="email" maxLength={254} autoComplete="email" required />
        </label>
      </div>

      <label className={styles.field}>
        <span>Reason for contact</span>
        <select name="reason" defaultValue="" required>
          <option value="" disabled>Select a reason</option>
          {REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
        </select>
      </label>

      <label className={`${styles.field} ${styles.honeypot}`} aria-hidden="true">
        <span>Website</span>
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <label className={styles.field}>
        <span>Message</span>
        <textarea
          name="message"
          minLength={10}
          maxLength={250}
          rows={6}
          value={message}
          onChange={event => setMessage(event.target.value)}
          required
        />
        <span className={styles.counter}>{message.length}/250</span>
      </label>

      <div className={styles.submitRow}>
        <button className={styles.submit} type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send message'}
        </button>
        <div className={styles.feedback} aria-live="polite">
          {status === 'success' && <span className={styles.success}>Message received. We will be in touch.</span>}
          {status === 'error' && <span className={styles.error}>{error}</span>}
        </div>
      </div>
    </form>
  )
}
