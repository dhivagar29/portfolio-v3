import { links, ui } from '../content.ts'

/** The GitHub and website links on a single line: `github.com/dhivagar29 · dhivagar.in`. */
export function LinksLine({ className }: { className?: string }) {
  return (
    <p className={className ? `links-line ${className}` : 'links-line'}>
      <a href={links.github.href} rel="me">
        {links.github.display}
      </a>
      {` ${ui.separator} `}
      <a href={links.website.href} rel="me">
        {links.website.display}
      </a>
    </p>
  )
}
