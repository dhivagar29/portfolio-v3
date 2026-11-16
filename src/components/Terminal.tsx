import { useEffect, useRef, useState } from 'react'
import { ui } from '../content.ts'
import { prefersReducedMotion } from '../lib/motion.ts'

interface TerminalLine {
  cmd: string
  out: string
}

interface TerminalProps {
  title: string
  label: string
  lines: readonly TerminalLine[]
}

/**
 * A terminal that types its commands when scrolled into view. The complete
 * text is always in the DOM (untyped parts are only hidden), so the panel
 * keeps its size and reads fine without JavaScript or with reduced motion.
 */
export function Terminal({ title, label, lines }: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null)
  // `line` is the command being typed; lines.length means everything is shown.
  const [cursor, setCursor] = useState({ line: lines.length, chars: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return
    let timer = 0
    let line = 0
    let chars = 0
    setCursor({ line: 0, chars: 0 })

    const tick = () => {
      if (line >= lines.length) return
      if (chars < lines[line].cmd.length) {
        chars += 1
        setCursor({ line, chars })
        timer = window.setTimeout(tick, 46 + Math.random() * 54)
      } else {
        line += 1
        chars = 0
        setCursor({ line, chars })
        timer = window.setTimeout(tick, 420)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        timer = window.setTimeout(tick, 500)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [lines])

  const done = cursor.line >= lines.length

  return (
    <div ref={ref} className="terminal" role="img" aria-label={label}>
      <div className="terminal__bar" aria-hidden="true">
        <span className="terminal__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal__title">{title}</span>
      </div>
      <div className="terminal__body" aria-hidden="true">
        {lines.map((entry, i) => {
          const typed = i < cursor.line ? entry.cmd.length : i === cursor.line ? cursor.chars : 0
          const started = i <= cursor.line
          return (
            <div key={entry.cmd} className="terminal__entry">
              <p className="terminal__cmd" data-hidden={started ? undefined : ''}>
                <span className="terminal__prompt">{ui.prompt}</span>
                <span>{entry.cmd.slice(0, typed)}</span>
                {i === cursor.line && <span className="caret" />}
                <span className="terminal__rest">{entry.cmd.slice(typed)}</span>
              </p>
              <p className="terminal__out" data-hidden={i < cursor.line ? undefined : ''}>
                {entry.out}
              </p>
            </div>
          )
        })}
        <p className="terminal__cmd" data-hidden={done ? undefined : ''}>
          <span className="terminal__prompt">{ui.prompt}</span>
          <span className="caret" />
        </p>
      </div>
    </div>
  )
}
