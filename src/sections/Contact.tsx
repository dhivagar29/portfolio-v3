import { ArrowUp, ArrowUpRight, Monogram } from '../components/Icons.tsx'
import { LinksLine } from '../components/LinksLine.tsx'
import { Magnetic } from '../components/Magnetic.tsx'
import { SectionHeading, titleId } from '../components/SectionHeading.tsx'
import { identity, links, sections, ui } from '../content.ts'

const profiles = [links.github, links.linkedin, links.x, links.website]

export function Contact() {
  return (
    <footer id={sections.contact.id} className="section contact" aria-labelledby={titleId('contact')}>
      <div className="container">
        <SectionHeading section="contact" />

        <div className="contact__email-wrap" data-reveal="">
          <p className="label">{ui.contact.emailLabel}</p>
          <Magnetic strength={0.06}>
            <a className="contact__email" href={links.email.href}>
              {links.email.display}
            </a>
          </Magnetic>
        </div>

        <div className="contact__grid" data-reveal="">
          <div>
            <p className="label">{ui.contact.locationLabel}</p>
            <p className="contact__value">{`${identity.location} (${identity.timezone})`}</p>
          </div>
          <div>
            <p className="label" id="profiles-label">
              {ui.contact.profilesLabel}
            </p>
            <ul className="contact__profiles" aria-labelledby="profiles-label">
              {profiles.map((profile) => (
                <li key={profile.href}>
                  <a className="chip-link chip-link--lg" href={profile.href} rel="me">
                    <span>{profile.label}</span>
                    <ArrowUpRight className="chip-link__icon" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <LinksLine className="contact__links" />

        <p className="contact__tagline">{identity.taglines[1]}</p>

        <div className="contact__base">
          <p className="contact__sign">
            <Monogram className="brand__mark" />
            <span>{identity.name}</span>
          </p>
          <a className="text-link" href={`#${sections.top.id}`}>
            <span>{ui.backToTop}</span>
            <ArrowUp className="text-link__icon" />
          </a>
        </div>
      </div>
    </footer>
  )
}
