import { useRef, type CSSProperties } from 'react'
import { ArrowUpRight, ProjectMark } from '../components/Icons.tsx'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { links, openSource, sections, ui } from '../content.ts'
import { useSpotlight } from '../lib/useSpotlight.ts'

const pad = (n: number) => String(n).padStart(2, '0')
const repoPath = (url: string) => new URL(url).pathname.replace(/^\//, '')

export function Projects() {
  const gridRef = useRef<HTMLUListElement>(null)
  useSpotlight(gridRef)

  return (
    <section
      id={sections.projects.id}
      className="section projects"
      aria-labelledby={titleId('projects')}
    >
      <div className="container">
        <SectionHeading section="projects" />
        <p className="sec-lede" data-reveal="">
          {openSource.intro.before}
          <a className="inline-link" href={links.github.href}>
            {links.github.display}
          </a>
          {openSource.intro.after}
        </p>

        <ul ref={gridRef} className="projects__grid">
          {openSource.projects.map((project, i) => (
            <li
              key={project.name}
              className="projects__cell"
              data-reveal=""
              style={{ '--i': i % 3 } as CSSProperties}
            >
              <article className="project" data-spot="">
                <div className="project__top">
                  <ProjectMark glyph={project.glyph} className="project__mark" />
                  <span className="project__index" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                </div>
                <h3 className="project__name">{project.name}</h3>
                <p className="project__repo">{repoPath(project.code)}</p>
                <p className="project__desc">{project.description}</p>
                <p className="project__links">
                  <a
                    className="chip-link"
                    href={project.code}
                    aria-label={`${project.name}: ${ui.projects.codeLabel}`}
                  >
                    <span>{ui.projects.code}</span>
                    <ArrowUpRight className="chip-link__icon" />
                  </a>
                  {project.live && (
                    <a
                      className="chip-link chip-link--live"
                      href={project.live}
                      aria-label={`${project.name}: ${ui.projects.liveLabel}`}
                    >
                      <span>{ui.projects.live}</span>
                      <ArrowUpRight className="chip-link__icon" />
                    </a>
                  )}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
