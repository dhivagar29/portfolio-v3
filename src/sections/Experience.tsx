import { useEffect, useRef } from 'react'
import { ArrowUp } from '../components/Icons.tsx'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { currentRole, earlierRoles, sections, ui, type Bullet } from '../content.ts'
import { prefersReducedMotion } from '../lib/motion.ts'

function BulletText({ bullet }: { bullet: Bullet }) {
  const { text, highlight } = bullet
  const at = highlight ? text.indexOf(highlight) : -1
  if (!highlight || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <em className="figure">{highlight}</em>
      {text.slice(at + highlight.length)}
    </>
  )
}

export function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null)

  // Fill the rail as the timeline scrolls through the viewport.
  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline) return
    if (prefersReducedMotion()) {
      timeline.style.setProperty('--progress', '1')
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const rect = timeline.getBoundingClientRect()
      const ratio = (window.innerHeight * 0.62 - rect.top) / Math.max(1, rect.height)
      timeline.style.setProperty('--progress', Math.min(1, Math.max(0, ratio)).toFixed(4))
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])

  const roles = [currentRole, ...earlierRoles]

  return (
    <section
      id={sections.experience.id}
      className="section experience"
      aria-labelledby={titleId('experience')}
    >
      <div className="container">
        <SectionHeading section="experience" />

        <div ref={timelineRef} className="timeline">
          <span className="timeline__rail" aria-hidden="true">
            <span className="timeline__fill" />
          </span>
          <ol className="timeline__list">
            {roles.map((role, i) => (
              <li
                key={role.company}
                className="timeline__item"
                data-current={i === 0 ? '' : undefined}
                data-reveal=""
              >
                <span className="timeline__node" aria-hidden="true" />
                <div className="timeline__meta">
                  <p className="timeline__period">{role.period}</p>
                  <p className="timeline__place">{role.location}</p>
                </div>
                <div className="timeline__body">
                  <h3 className="timeline__title">{role.title}</h3>
                  <p className="timeline__company">{role.company}</p>
                  {role.client && <p className="timeline__client">{role.client}</p>}
                  {i === 0 ? (
                    <>
                      {role.note && <p className="timeline__client">{role.note}</p>}
                      <a className="text-link" href={`#${sections.now.id}`}>
                        <span>{ui.experience.currentPointer}</span>
                        <ArrowUp className="text-link__icon" />
                      </a>
                    </>
                  ) : (
                    <ul className="timeline__bullets">
                      {role.bullets.map((bullet) => (
                        <li key={bullet.text}>
                          <BulletText bullet={bullet} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
