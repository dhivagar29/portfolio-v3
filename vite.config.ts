import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import react from '@vitejs/plugin-react'
import { build, defineConfig, type HtmlTagDescriptor, type Plugin, type ResolvedConfig } from 'vite'
import { meta } from './src/content.ts'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Fills the <title>, description and Open Graph placeholders in index.html from src/content.ts. */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replaceAll('__SITE_TITLE__', escapeHtml(meta.title))
          .replaceAll('__SITE_DESCRIPTION__', escapeHtml(meta.description)),
    },
  }
}

/** Preloads the fonts used above the fold so text does not reflow when they arrive. */
function preloadFonts(names: string[]): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {})
        const tags: HtmlTagDescriptor[] = []
        for (const name of names) {
          const file = files.find((f) => path.basename(f).startsWith(name) && f.endsWith('.woff2'))
          if (!file) continue
          tags.push({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
            injectTo: 'head',
          })
        }
        return tags
      },
    },
  }
}

/**
 * Renders the app to static HTML after the client build and writes it into
 * dist/index.html, so the page has real content before (and without) JavaScript.
 * The browser then hydrates it.
 */
function prerender(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'prerender',
    apply: (_config, env) => env.command === 'build' && !env.isSsrBuild,
    configResolved(resolved) {
      config = resolved
    },
    async closeBundle() {
      const tmpDir = path.resolve(config.root, 'node_modules/.prerender')
      const htmlFile = path.resolve(config.root, config.build.outDir, 'index.html')
      try {
        await build({
          configFile: false,
          root: config.root,
          logLevel: 'warn',
          plugins: [react()],
          build: {
            ssr: path.resolve(config.root, 'src/entry-server.tsx'),
            outDir: tmpDir,
            emptyOutDir: true,
            copyPublicDir: false,
            minify: false,
            rolldownOptions: { output: { entryFileNames: 'entry-server.mjs' } },
          },
        })
        const entry = pathToFileURL(path.join(tmpDir, 'entry-server.mjs')).href
        const { render } = (await import(`${entry}?t=${Date.now()}`)) as { render: () => string }
        const template = await readFile(htmlFile, 'utf8')
        const marker = '<div id="root"></div>'
        if (!template.includes(marker)) throw new Error('prerender: root marker not found in index.html')
        await writeFile(htmlFile, template.replace(marker, () => `<div id="root">${render()}</div>`))
        config.logger.info('prerendered index.html')
      } finally {
        await rm(tmpDir, { recursive: true, force: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    siteMeta(),
    preloadFonts([
      'space-grotesk-latin-700-normal',
      'space-grotesk-latin-500-normal',
      'jetbrains-mono-latin-500-normal',
      'inter-latin-400-normal',
    ]),
    prerender(),
  ],
  build: {
    target: 'es2022',
    cssMinify: true,
  },
})
