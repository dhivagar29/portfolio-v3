import { useEffect, useLayoutEffect, useState } from 'react'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'

/** useLayoutEffect in the browser, useEffect during the build-time prerender. */
export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia(FINE_POINTER_QUERY).matches

/** Tracks the reduced-motion preference. `null` until the first client effect has run. */
export function useReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null)
  useEffect(() => {
    const query = window.matchMedia(REDUCED_QUERY)
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
