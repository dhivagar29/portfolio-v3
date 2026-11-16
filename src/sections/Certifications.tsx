import { useEffect, useRef, type CSSProperties } from 'react'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { certifications, sections, ui } from '../content.ts'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion.ts'

export function Certifications() {
  const cardRef = useRef<HTMLElement>(null)

  // Tilt and sheen on the featured card.
  useEffect(() => {
    const card = cardRef.current
    if (!card || !hasFinePointer() || prefersReducedMotion()) return
    const onMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      card.style.setProperty('--px', `${(x * 100).toFixed(1)}%`)
      card.style.setProperty('--py', `${(y * 100).toFixed(1)}%`)
      card.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
      card.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`)
      card.setAttribute('data-tilt', '')
    }
    const onLeave = () => {
      card.style.setProperty('--ry', '0deg')
      card.style.setProperty('--rx', '0deg')
      card.removeAttribute('data-tilt')
    }
    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerleave', onLeave)
    return () => {
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const { featured, others } = certifications

  return (
    <section
      id={sections.certifications.id}
      className="section certs"
      aria-labelledby={titleId('certifications')}
    >
      <div className="container">
        <SectionHeading section="certifications" />

        <div className="certs__grid">
          <div className="certs__feature" data-reveal="">
            <article ref={cardRef} className="cert-card">
              <svg className="cert-card__seal" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
                <circle cx="100" cy="100" r="96" />
                <circle cx="100" cy="100" r="78" strokeDasharray="2 7" />
                <circle cx="100" cy="100" r="58" />
                <circle cx="100" cy="100" r="34" strokeDasharray="14 6" />
                <path d="M100 4v24M100 172v24M4 100h24M172 100h24" />
              </svg>
              <p className="cert-card__year">{featured.year}</p>
              <h3 className="cert-card__name">{featured.name}</h3>
            </article>
          </div>

          <div className="certs__rest">
            <h3 className="subhead subhead--flush" data-reveal="">
              {ui.certifications.listTitle}
            </h3>
            <ul className="certs__list">
              {others.map((cert, i) => (
                <li
                  key={cert.name}
                  className="certs__row"
                  data-reveal=""
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className="certs__year">{cert.year}</span>
                  <span className="certs__name">{cert.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
