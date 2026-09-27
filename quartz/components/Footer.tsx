import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"
import { socialLinks } from "./socialLinks"

interface Options {
  // One line under the wordmark saying what the site is about.
  note?: string
}

// The three marks, inline so there is no request and no flash, at 16px on
// `currentColor` so they take the link's colour and its hover with it.
const MARKS: Record<string, string> = {
  github:
    '<svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M3.4 1.6a1.8 1.8 0 1 1-.01 3.61A1.8 1.8 0 0 1 3.4 1.6ZM1.85 6.6h3.1V15h-3.1V6.6Zm5.03 0h2.97v1.15h.04c.41-.75 1.42-1.54 2.93-1.54 3.13 0 3.71 2 3.71 4.6V15h-3.09v-3.63c0-.87-.02-1.98-1.25-1.98-1.25 0-1.44.94-1.44 1.91V15H6.88V6.6Z"/></svg>',
  email:
    '<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="1.2" y="3.2" width="13.6" height="9.6" rx="1.2"/><path d="m1.6 4.4 6.4 4.4 6.4-4.4"/></svg>',
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    return (
      // What the site is on the left, how to reach the person who writes it on
      // the right, and one line of credit under both.
      //
      // It carried a name, a role and a status line — `12 posts · last write
      // 2026-06-23` — as well. The status line is a changelog, the role is a
      // CV, and neither is what a reader is at the foot of a page for: they
      // are either leaving or looking for a way to get in touch. Three
      // addresses is the whole of the second column now.
      //
      // The name went with them. `jaeunda.log`, `github.com/jaeunda` and the
      // address all carry it, and a byline under a wordmark that is already
      // the author's handle is the same fact printed twice.
      <footer class={`${displayClass ?? ""}`}>
        <p class="footer-sign">
          <span class="footer-mark">{cfg.pageTitle}</span>
          {opts?.note && <span class="footer-note">{opts.note}</span>}
        </p>
        {/* One list, from `socialLinks`. The layout used to pass its own
            `links` map here, which meant the site's addresses were written
            down in two places and the two had already drifted apart.

            The address in full, with its mark beside it. Three lowercase
            words — `github linkedin email` — were the right length and the
            wrong thing: they read as three more items of chrome in a bar full
            of chrome, and nothing about them said "this is how you reach
            someone". An address is a fact a reader can act on, and the mark
            in front of it is recognised before the text is read. */}
        <ul class="footer-links">
          {socialLinks.map(({ name, url, text, icon }) => {
            const isMailto = url.startsWith("mailto:")
            return (
              <li>
                <a
                  href={url}
                  target={isMailto ? undefined : "_blank"}
                  rel={isMailto ? undefined : "noopener noreferrer"}
                  // The address is the visible label, so the accessible name
                  // says what it is rather than having a screen reader spell
                  // a URL out character by character.
                  aria-label={name}
                >
                  <span
                    class="footer-icon"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: MARKS[icon] ?? "" }}
                  />
                  <span class="footer-addr">{text}</span>
                </a>
              </li>
            )
          })}
        </ul>
        <p class="footer-colophon">
          © {year} {cfg.pageTitle} · {i18n(cfg.locale).components.footer.createdWith.toLowerCase()}{" "}
          <a href="https://quartz.jzhao.xyz/">quartz v{version}</a>
        </p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
