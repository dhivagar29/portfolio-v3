import { useEffect, useState } from 'react'
import { identity, ui } from '../content.ts'
import { prefersReducedMotion } from '../lib/motion.ts'

/** Current time in IST. Decorative; ticks per second (per minute with reduced motion). */
export function Clock() {
  const [time, setTime] = useState<string>(ui.clockPlaceholder)

  useEffect(() => {
    const calm = prefersReducedMotion()
    let format: Intl.DateTimeFormat
    try {
      format = new Intl.DateTimeFormat('en-GB', {
        timeZone: identity.timezoneId,
        hour: '2-digit',
        minute: '2-digit',
        second: calm ? undefined : '2-digit',
        hour12: false,
      })
    } catch {
      return
    }
    const update = () => setTime(format.format(new Date()))
    update()
    const timer = window.setInterval(update, calm ? 30_000 : 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <span className="clock" aria-hidden="true">
      {time}
    </span>
  )
}
