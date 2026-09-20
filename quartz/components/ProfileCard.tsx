import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { socialLinks } from "./socialLinks"
import style from "./styles/profileCard.inline.scss"
import { classNames } from "../util/lang"

// The home masthead byline, and the only place the site states who writes it.
// Reading pages carry no profile at all — the left rail there is the outline.
//
// The three destinations are pills carrying the whole address, which is the
// `.pf-caps` vocabulary from the portfolio page. See the stylesheet for the
// three earlier versions of this row and what each of them got wrong.
//
// The portfolio is deliberately not one of the rows. `content/portfolio-it.md`
// is `unlisted: true` and stays that way: it is a link the author attaches to a
// job application, not a page this site sends readers to. Nothing on the blog
// links to it — not the nav, not this byline, not the footer.
const ProfileCard: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "profile-card")}>
      <p class="profile-byline">
        <span class="profile-name">장다은</span>
        <span class="profile-role">Systems &amp; Infrastructure</span>
      </p>
      <ul class="profile-links">
        {socialLinks.map(({ name, url, text }) => {
          const isMailto = url.startsWith("mailto:")
          return (
            <li>
              <a
                href={url}
                target={isMailto ? undefined : "_blank"}
                rel={isMailto ? undefined : "noopener noreferrer"}
                class="profile-link"
                // The visible label is an address; the accessible name says
                // what it is, so a screen reader does not read a URL aloud
                // character by character to say "GitHub".
                aria-label={name}
              >
                {text}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

ProfileCard.css = style
export default (() => ProfileCard) satisfies QuartzComponentConstructor
