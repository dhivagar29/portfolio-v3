import { useEffect, type RefObject } from 'react'
import { hasFinePointer } from './motion.ts'

/**
 * Pointer-follow highlight for a group of panels. Writes the pointer position
 * (relative to each `[data-spot]` child) into `--mx` / `--my`.
 */
export function useSpotlight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const group = ref.current
    if (!group || !hasFinePointer()) return
    let frame = 0
    let x = 0
    let y = 0
    const paint = () => {
      frame = 0
      for (const el of group.querySelectorAll<HTMLElement>('[data-spot]')) {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${x - rect.left}px`)
        el.style.setProperty('--my', `${y - rect.top}px`)
      }
    }
    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      group.setAttribute('data-spot-active', '')
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onLeave = () => group.removeAttribute('data-spot-active')
    group.addEventListener('pointermove', onMove)
    group.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      group.removeEventListener('pointermove', onMove)
      group.removeEventListener('pointerleave', onLeave)
    }
  }, [ref])
}
