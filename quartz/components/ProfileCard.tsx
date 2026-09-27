import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { socialLinks } from "./socialLinks"
import style from "./styles/profileCard.inline.scss"
import { classNames } from "../util/lang"

// The home masthead byline, and the only place the site states who writes it.
// Reading pages carry no profile at all — the left rail there is the outline.
//
// Three levels, in one column beside the statement: the name, the role under
// it in the machine's voice, then a rule and the three destinations. The rule
// is the boundary — who this is, and then how to reach them — and the levels
// are what the block was missing when it ran as one flat line of a name, a
// role and three full URLs.
//
// The portfolio is deliberately not one of the rows. `content/portfolio-it.md`
// is `unlisted: true` and stays that way: it is a link the author attaches to a
// job application, not a page this site sends readers to. Nothing on the blog
// links to it — not the nav, not this byline, not the footer.
const ProfileCard: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "profile-card")}>
      <p class="profile-byline">
        <span class="profile-name">Daeun Jang</span>
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
                // The visible label and the accessible name are the same word
                // now, so nothing has to be reconciled; the address rides
                // along as the tooltip.
                aria-label={name}
                title={text}
              >
                {name.toLowerCase()}
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
