import { intent } from '@/lib/intent'

// Count visible reading time and flush once on navigation or component teardown.
export function observeAppellation(country: string, region: string, name: string, style: string) {
  let started = document.hidden ? null : Date.now()
  let elapsed = 0
  let finished = false
  intent.viewAppellation(country, region, name, style)

  const pause = () => {
    if (started !== null) elapsed += Date.now() - started
    started = null
  }
  const visibility = () => {
    pause()
    if (!document.hidden && !finished) started = Date.now()
  }
  const finish = () => {
    if (finished) return
    pause()
    finished = true
    intent.dwellAppellation(name, country, elapsed / 1000)
  }
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('pagehide', finish)
  return () => {
    finish()
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('pagehide', finish)
  }
}
