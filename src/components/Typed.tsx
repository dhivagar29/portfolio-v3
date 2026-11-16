import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion.ts'

/**
 * Types and erases a short list of phrases in a loop. Starts from the first
 * phrase fully shown (which is also what the prerendered page and
 * reduced-motion visitors see). The longest phrase reserves the space, so
 * nothing around it moves. Visual only: pair it with a text alternative.
 */
export function TypedRotator({ phrases }: { phrases: readonly string[] }) {
  const [text, setText] = useState(phrases[0])
  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), '')

  useEffect(() => {
    if (prefersReducedMotion() || phrases.length < 2) return
    let index = 0
    let length = phrases[0].length
    let erasing = true
    let timer = window.setTimeout(tick, 3200)

    function tick() {
      const phrase = phrases[index]
      let delay: number
      if (erasing) {
        length -= 1
        delay = 28
        if (length <= 0) {
          length = 0
          erasing = false
          index = (index + 1) % phrases.length
          delay = 380
        }
        setText(phrase.slice(0, length))
      } else {
        length += 1
        delay = 58 + Math.random() * 46
        setText(phrase.slice(0, length))
        if (length >= phrase.length) {
          erasing = true
          delay = 3200
        }
      }
      timer = window.setTimeout(tick, delay)
    }

    return () => window.clearTimeout(timer)
  }, [phrases])

  return (
    <span className="typed" aria-hidden="true">
      <span className="typed__ghost">{longest}</span>
      <span className="typed__live">
        {text}
        <span className="caret" />
      </span>
    </span>
  )
}
