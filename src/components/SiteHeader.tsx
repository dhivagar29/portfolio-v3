import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { identity, sectionOrder, sections, ui } from '../content.ts'
import { useActiveSection } from '../lib/useActiveSection.ts'
import { Monogram } from './Icons.tsx'
import { Magnetic } from './Magnetic.tsx'
import { sectionIndex } from './SectionHeading.tsx'

const MENU_ID = 'site-menu'

export function SiteHeader() {
  const ids = useMemo(() => sectionOrder.map((key) => sections[key].id), [])
  const active = useActiveSection(ids)
  const activeKey = sectionOrder.find((key) => sections[key].id === active)
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Scroll progress hairline and the "scrolled" state of the bar.
  useEffect(() => {
    const header = headerRef.current
    const progress = progressRef.current
    if (!header || !progress) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progress.style.transform = `scaleX(${ratio.toFixed(4)})`
      header.toggleAttribute('data-scrolled', window.scrollY > 12)
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

  // Mobile menu: lock scrolling, keep focus inside, close on Escape or when the layout goes wide.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const button = buttonRef.current
    if (!panel || !button) return
    document.documentElement.setAttribute('data-menu-open', '')
    const items = () => [button, ...Array.from(panel.querySelectorAll<HTMLElement>('a[href]'))]
    items()[1]?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.focus()
        return
      }
      if (event.key !== 'Tab') return
      const list = items()
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      } else if (!list.includes(current as HTMLElement)) {
        event.preventDefault()
        first.focus()
      }
    }
    const wide = window.matchMedia('(min-width: 1180px)')
    const onWide = () => wide.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      document.documentElement.removeAttribute('data-menu-open')
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  return (
    <header ref={headerRef} className="site-header" data-open={open ? '' : undefined}>
      <div className="site-header__bar">
        <a className="brand" href={`#${sections.top.id}`} aria-label={ui.homeLabel}>
          <Monogram className="brand__mark" />
          <span className="brand__name">{identity.name}</span>
        </a>

        <p className="site-header__where" aria-hidden="true" data-on={activeKey ? '' : undefined}>
          <span className="site-header__where-index">{activeKey ? sectionIndex(activeKey) : ''}</span>
          <span>{activeKey ? sections[activeKey].nav : ''}</span>
        </p>

        <nav className="nav" aria-label={ui.navLabel}>
          <ul className="nav__list">
            {sectionOrder.map((key) => (
              <li key={key}>
                <a
                  className="nav__link"
                  href={`#${sections[key].id}`}
                  aria-current={active === sections[key].id ? 'location' : undefined}
                >
                  <span className="nav__index" aria-hidden="true">
                    {sectionIndex(key)}
                  </span>
                  {sections[key].nav}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Magnetic className="site-header__toggle-wrap" strength={0.2}>
          <button
            ref={buttonRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-toggle__label">{open ? ui.menuClose : ui.menuOpen}</span>
            <span className="menu-toggle__icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </Magnetic>
      </div>
      <span ref={progressRef} className="site-header__progress" aria-hidden="true" />

      <div
        ref={panelRef}
        id={MENU_ID}
        className="menu"
        role="dialog"
        aria-modal="true"
        aria-label={ui.menuTitle}
        data-open={open ? '' : undefined}
      >
        <ul className="menu__list">
          {sectionOrder.map((key, i) => (
            <li key={key} style={{ '--i': i } as CSSProperties}>
              <a
                className="menu__link"
                href={`#${sections[key].id}`}
                aria-current={active === sections[key].id ? 'location' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="menu__index" aria-hidden="true">
                  {sectionIndex(key)}
                </span>
                {sections[key].nav}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
