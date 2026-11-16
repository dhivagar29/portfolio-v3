import type { ReactNode } from 'react'
import type { ProjectGlyph } from '../content.ts'

/** All icons are decorative: the text next to them carries the meaning. */
const base = {
  'aria-hidden': true,
  focusable: false,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function Monogram({ className }: { className?: string }) {
  return (
    <svg {...base} className={className} viewBox="0 0 64 64" strokeWidth={5.5}>
      <path className="monogram__d" d="M13 19v26h6c7.2 0 13-5.8 13-13s-5.8-13-13-13z" />
      <path className="monogram__k" d="M39.5 19v26M52 19 40.5 32 52 45" />
    </svg>
  )
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" strokeWidth={1.75}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" strokeWidth={1.75}>
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  )
}

export function ArrowUp({ className }: { className?: string }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" strokeWidth={1.75}>
      <path d="M12 20V5M6 11l6-6 6 6" />
    </svg>
  )
}

/** Abstract marks for the open-source tools. No figures or sample data. */
const glyphs: Record<ProjectGlyph, ReactNode> = {
  // Gauge arc with a needle.
  score: (
    <>
      <path d="M8 34a16 16 0 1 1 32 0" />
      <path d="M8 34h4M36 34h4M24 18v4M12.7 22.7l2.8 2.8M35.3 22.7l-2.8 2.8" opacity=".55" />
      <path d="M24 34l7-9" />
      <circle cx="24" cy="34" r="2" />
    </>
  ),
  // Receipt with a tick.
  receipt: (
    <>
      <path d="M13 8h22v32l-4-3-3.5 3-3.5-3-3.5 3-3.5-3-4 3z" />
      <path d="M18 16h12M18 22h7" opacity=".55" />
      <path d="M18.5 30l3.5 3.5 7.5-8" />
    </>
  ),
  // Shield with a keyhole.
  trust: (
    <>
      <path d="M24 7l14 5v10c0 9-6 15.5-14 19-8-3.5-14-10-14-19V12z" />
      <circle cx="24" cy="21" r="3.5" />
      <path d="M24 24.5V31" />
    </>
  ),
  // Stacked policy sheets.
  policy: (
    <>
      <path d="M24 8l16 8-16 8-16-8z" />
      <path d="M8 24l16 8 16-8M8 32l16 8 16-8" opacity=".55" />
    </>
  ),
  // Seal with a tick.
  signed: (
    <>
      <circle cx="24" cy="21" r="12" />
      <path d="M18.5 21l4 4 7-8" />
      <path d="M17 31.5V42l7-4 7 4V31.5" opacity=".55" />
    </>
  ),
  // Map pin.
  pin: (
    <>
      <path d="M24 42s12-11.5 12-21a12 12 0 1 0-24 0c0 9.5 12 21 12 21z" />
      <circle cx="24" cy="21" r="4.5" />
    </>
  ),
  // Lens over step bars.
  lens: (
    <>
      <path d="M8 38V26M15 38V18M22 38v-8" opacity=".55" />
      <circle cx="29" cy="20" r="9" />
      <path d="M35.5 26.5 42 33" />
    </>
  ),
}

export function ProjectMark({ glyph, className }: { glyph: ProjectGlyph; className?: string }) {
  return (
    <svg {...base} className={className} viewBox="0 0 48 48" strokeWidth={1.6}>
      {glyphs[glyph]}
    </svg>
  )
}
