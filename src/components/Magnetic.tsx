import { useEffect, useRef, type ReactNode } from 'react'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion.ts'

interface MagneticProps {
  children: ReactNode
  /** Fraction of the pointer offset the child follows. */
  strength?: number
  className?: string
}

/** Pulls its child a little toward the pointer; springs back on leave. */
export function Magnetic({ children, strength = 0.28, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (event.clientX - (rect.left + rect.width / 2)) * strength
      const y = (event.clientY - (rect.top + rect.height / 2)) * strength
      el.style.setProperty('--mag-x', `${x.toFixed(1)}px`)
      el.style.setProperty('--mag-y', `${y.toFixed(1)}px`)
      el.setAttribute('data-pulled', '')
    }
    const onLeave = () => {
      el.style.setProperty('--mag-x', '0px')
      el.style.setProperty('--mag-y', '0px')
      el.removeAttribute('data-pulled')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])

  return (
    <span ref={ref} className={className ? `magnetic ${className}` : 'magnetic'}>
      {children}
    </span>
  )
}
