import { useEffect, useRef } from 'react'
import { ArrowRight } from '../components/Icons.tsx'
import { Clock } from '../components/Clock.tsx'
import { HeroCanvas } from '../components/HeroCanvas.tsx'
import { LinksLine } from '../components/LinksLine.tsx'
import { Magnetic } from '../components/Magnetic.tsx'
import { TypedRotator } from '../components/Typed.tsx'
import { identity, links, sections, ui } from '../content.ts'
import { hasFinePointer } from '../lib/motion.ts'

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [first, ...rest] = identity.name.split(' ')

  // Pointer "torch" that fills the outlined surname where the cursor is.
  useEffect(() => {
    const name = nameRef.current
    if (!name || !hasFinePointer()) return
    const target = name.querySelector<HTMLElement>('[data-torch]')
    if (!target) return
    const onMove = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect()
      target.style.setProperty('--tx', `${event.clientX - rect.left}px`)
      target.style.setProperty('--ty', `${event.clientY - rect.top}px`)
      target.setAttribute('data-lit', '')
    }
    const onLeave = () => target.removeAttribute('data-lit')
    name.addEventListener('pointermove', onMove)
    name.addEventListener('pointerleave', onLeave)
    return () => {
      name.removeEventListener('pointermove', onMove)
      name.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section id={sections.top.id} className="hero" aria-labelledby="hero-name">
      <HeroCanvas />
      <div className="hero__scan" aria-hidden="true" />

      <div className="container hero__inner">
        <p className="hero__eyebrow">
          <span className="hero__eyebrow-role">{identity.positioning.role}</span>
          <span className="hero__eyebrow-pipe">{` ${ui.pipe} `}</span>
          <span className="hero__eyebrow-stack">
            {identity.positioning.stack.join(` ${ui.separator} `)}
          </span>
        </p>

        <h1 id="hero-name" ref={nameRef} className="hero__name">
          <span className="hero__name-line">
            <span className="hero__name-word">{first}</span>
          </span>{' '}
          <span className="hero__name-line">
            <span className="hero__name-word hero__name-word--outline" data-torch="">
              {rest.join(' ')}
            </span>
          </span>
        </h1>

        <p className="hero__title">
          <span className="hero__role">{identity.headline.title}</span>{' '}
          <span className="hero__at">{identity.headline.joiner}</span>{' '}
          <strong className="hero__org">{identity.headline.company}</strong>
        </p>

        <LinksLine className="hero__links" />

        <div className="hero__actions">
          <Magnetic>
            <a className="btn btn--primary" href={`#${sections.projects.id}`}>
              <span>{ui.hero.primaryCta}</span>
              <ArrowRight className="btn__icon" />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="btn btn--ghost" href={links.email.href}>
              <span>{ui.hero.secondaryCta}</span>
            </a>
          </Magnetic>
        </div>

        <div className="hero__status">
          <p className="hero__loc">
            <span className="status-dot" aria-hidden="true" />
            <span>{identity.location}</span>
            <span className="hero__loc-zone">{identity.timezone}</span>
            <Clock />
          </p>
          <p className="hero__tagline">
            <span className="sr-only">{identity.taglines.join(' ')}</span>
            <span className="hero__tagline-prompt" aria-hidden="true">
              {ui.taglinePrompt}
            </span>
            <TypedRotator phrases={identity.taglines} />
          </p>
        </div>
      </div>

      <a className="hero__cue" href={`#${sections.about.id}`}>
        <span>{ui.scrollCue}</span>
        <span className="hero__cue-line" aria-hidden="true" />
      </a>
    </section>
  )
}
