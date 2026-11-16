import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { education, sections } from '../content.ts'

export function Education() {
  return (
    <section
      id={sections.education.id}
      className="section education"
      aria-labelledby={titleId('education')}
    >
      <div className="container">
        <SectionHeading section="education" />
        <p className="education__line frame" data-reveal="">
          {education}
        </p>
      </div>
    </section>
  )
}
