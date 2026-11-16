import { useRef, type CSSProperties } from 'react'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { sections, skills } from '../content.ts'
import { useSpotlight } from '../lib/useSpotlight.ts'

export function Skills() {
  const gridRef = useRef<HTMLUListElement>(null)
  useSpotlight(gridRef)

  return (
    <section id={sections.skills.id} className="section skills" aria-labelledby={titleId('skills')}>
      <div className="container">
        <SectionHeading section="skills" />

        <ul ref={gridRef} className="skills__grid">
          {skills.map((group, i) => (
            <li
              key={group.label}
              className="skills__cell"
              data-reveal=""
              style={{ '--i': i % 3 } as CSSProperties}
            >
              <div className="skill" data-spot="">
                <h3 className="skill__label">{group.label}</h3>
                {group.rows.map((row) => (
                  <ul key={row[0].name} className="chips">
                    {row.map((item) =>
                      item.details ? (
                        <li key={item.name} className="chip-group">
                          <span className="chip chip--lead">{item.name}</span>
                          <ul className="chips chips--nested">
                            {item.details.map((detail) => (
                              <li key={detail} className="chip chip--sub">
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : (
                        <li key={item.name} className="chip">
                          {item.name}
                        </li>
                      ),
                    )}
                  </ul>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
