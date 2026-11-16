import type { CSSProperties } from 'react'
import { ArrowRight } from '../components/Icons.tsx'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { Terminal } from '../components/Terminal.tsx'
import { sections, stats, summary, ui } from '../content.ts'

export function About() {
  return (
    <section id={sections.about.id} className="section about" aria-labelledby={titleId('about')}>
      <div className="container">
        <SectionHeading section="about" />

        <div className="about__grid">
          <div className="about__copy">
            <p className="about__lead" data-reveal="">
              {summary.lead}
            </p>
            {summary.paragraphs.map((paragraph, i) => (
              <p
                key={paragraph}
                className="about__p"
                data-reveal=""
                style={{ '--i': i + 1 } as CSSProperties}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="about__side" data-reveal="">
            <Terminal
              title={ui.about.terminalTitle}
              label={ui.about.terminalLabel}
              lines={ui.about.terminal}
            />
          </div>
        </div>

        <ul className="stats" aria-label={ui.about.statsLabel}>
          {stats.map((stat, i) => (
            <li
              key={stat.caption}
              className="stat"
              data-reveal=""
              style={{ '--i': i } as CSSProperties}
            >
              <p className="stat__figure">
                <span className="stat__value">{stat.value}</span>
                {stat.to && (
                  <>
                    <ArrowRight className="stat__arrow" />
                    <span className="sr-only">{stat.toLabel}</span>
                    <span className="stat__value">{stat.to}</span>
                  </>
                )}
                <span className="stat__unit">{stat.unit}</span>
              </p>
              <p className="stat__caption">{stat.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
