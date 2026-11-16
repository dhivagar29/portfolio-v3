import { useEffect, useRef } from 'react'
import { pipeline } from '../content.ts'
import { useReducedMotion } from '../lib/motion.ts'

/**
 * Decorative orbit / pipeline backdrop. The scene code is loaded on demand
 * after first paint and only draws while the hero is on screen.
 */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced === null) return
    let stop: (() => void) | undefined
    let cancelled = false

    import('../canvas/orbitScene.ts')
      .then(({ startOrbitScene }) => {
        if (cancelled) return
        const fontFamily = getComputedStyle(canvas).fontFamily || 'monospace'
        stop = startOrbitScene(canvas, {
          stages: pipeline.map((stage) => stage.key),
          reducedMotion: reduced,
          fontFamily,
        })
        canvas.setAttribute('data-ready', '')
      })
      .catch(() => {
        /* The backdrop is optional: the page is complete without it. */
      })

    return () => {
      cancelled = true
      stop?.()
    }
  }, [reduced])

  return <canvas ref={ref} className="hero__canvas" aria-hidden="true" />
}
