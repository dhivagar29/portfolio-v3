import { sectionOrder, sections, ui, type SectionKey } from '../content.ts'

const pad = (n: number) => String(n).padStart(2, '0')

/** Two-digit position of a section on the page, e.g. "03". */
export const sectionIndex = (key: SectionKey) => pad(sectionOrder.indexOf(key as never) + 1)

export const titleId = (key: SectionKey) => `${sections[key].id}-title`

export function SectionHeading({ section }: { section: SectionKey }) {
  const { kicker, title } = sections[section]
  return (
    <header className="sec-head">
      <p className="kicker" data-reveal>
        <span className="kicker__index">{sectionIndex(section)}</span>
        <span className="kicker__slash" aria-hidden="true">
          {ui.slash}
        </span>
        <span>{kicker}</span>
      </p>
      <h2 id={titleId(section)} className="sec-title" data-reveal="rise">
        {title}
      </h2>
    </header>
  )
}
