import { prefersReducedMotion, useIsoLayoutEffect } from './motion.ts'

/**
 * Scroll reveals. Elements marked with `data-reveal` stay fully visible in the
 * prerendered HTML; only once this runs are the ones still below the viewport
 * hidden and then revealed as they scroll in. Without JavaScript, or with
 * reduced motion, nothing is ever hidden.
 */
export function useReveal() {
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

    const root = document.documentElement
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const viewport = window.innerHeight
    const pending: HTMLElement[] = []
    for (const el of elements) {
      if (el.hasAttribute('data-revealed')) continue
      if (el.getBoundingClientRect().top < viewport * 0.95) el.setAttribute('data-revealed', 'instant')
      else pending.push(el)
    }
    root.classList.add('reveal-on')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-revealed', '')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    for (const el of pending) observer.observe(el)

    return () => {
      observer.disconnect()
      root.classList.remove('reveal-on')
    }
  }, [])
}
