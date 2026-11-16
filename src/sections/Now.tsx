import type { CSSProperties } from 'react'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { currentRole, pipeline, sections, ui } from '../content.ts'

const pad = (n: number) => String(n).padStart(2, '0')

export function Now() {
  return (
    <section id={sections.now.id} className="section now" aria-labelledby={titleId('now')}>
      <div className="container">
        <SectionHeading section="now" />

        <div className="role-card frame" data-reveal="">
          <div className="role-card__main">
            <p className="role-card__period">
              <span className="status-dot" aria-hidden="true" />
              {currentRole.period}
            </p>
            <h3 className="role-card__title">{currentRole.title}</h3>
            <p className="role-card__org">
              <strong>{currentRole.company}</strong>
              <span className="role-card__pipe" aria-hidden="true">
                {ui.pipe}
              </span>
              <span>{currentRole.location}</span>
            </p>
          </div>
          <div className="role-card__client">
            <p>{currentRole.client}</p>
            <p className="role-card__note">{currentRole.note}</p>
          </div>
        </div>

        <h3 className="subhead" data-reveal="">
          {ui.now.pipelineTitle}
        </h3>
        <ol className="pipe">
          {pipeline.map((stage, i) => (
            <li
              key={stage.key}
              className="pipe__stage"
              data-stage={stage.key.toLowerCase()}
              data-reveal=""
              style={{ '--i': i } as CSSProperties}
            >
              <p className="pipe__key">
                <span className="pipe__num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span>{stage.key}</span>
              </p>
              <p className="pipe__title">{stage.title}</p>
              <p className="pipe__detail">{stage.detail}</p>
            </li>
          ))}
        </ol>

        <h3 className="subhead" data-reveal="">
          {ui.now.workTitle}
        </h3>
        <ol className="manifest">
          {currentRole.bullets.map((bullet, i) => (
            <li key={bullet.text} className="manifest__row" data-reveal="">
              <span className="manifest__num" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <h4 className="manifest__label">{bullet.label}</h4>
              <p className="manifest__text">{bullet.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
