import { SiteHeader } from './components/SiteHeader.tsx'
import { ui } from './content.ts'
import { useReveal } from './lib/useReveal.ts'
import { About } from './sections/About.tsx'
import { Certifications } from './sections/Certifications.tsx'
import { Contact } from './sections/Contact.tsx'
import { Education } from './sections/Education.tsx'
import { Experience } from './sections/Experience.tsx'
import { Hero } from './sections/Hero.tsx'
import { Now } from './sections/Now.tsx'
import { Projects } from './sections/Projects.tsx'
import { Skills } from './sections/Skills.tsx'

export default function App() {
  useReveal()

  return (
    <>
      <a className="skip-link" href="#main">
        {ui.skipLink}
      </a>
      <div className="backdrop" aria-hidden="true" />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Now />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Education />
      </main>
      <Contact />
    </>
  )
}
