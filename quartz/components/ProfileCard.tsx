import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { socialLinks } from "./socialLinks"
import style from "./styles/profileCard.inline.scss"
import { classNames } from "../util/lang"

function linkLabel(name: string): string {
  return name === "Email" ? "e-mail" : name.toLowerCase()
}

const ProfileCard: QuartzComponent = (
  props: QuartzComponentProps & { explorerProfile?: boolean },
) => {
  return (
    <div
      class={classNames(
        props.displayClass,
        "profile-card",
        ...(props.explorerProfile ? ["explorer-profile"] : []),
      )}
    >
      <div class="profile-eyebrow">Profile</div>
      <div class="profile-name">Daeun Jang</div>
      <div class="profile-interest">
        Systems & Infrastructure
        <br />
        Linux · Databases · Runtimes
      </div>
      <div class="profile-links">
        {socialLinks.map(({ name, url, text }) => {
          const isMailto = url.startsWith("mailto:")
          return (
            <a
              href={url}
              target={isMailto ? undefined : "_blank"}
              rel={isMailto ? undefined : "noopener noreferrer"}
              class="profile-link-row"
            >
              <span class="profile-link-label">{linkLabel(name)}</span>
              <span class="profile-link-value">{text}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

ProfileCard.css = style
export default (() => ProfileCard) satisfies QuartzComponentConstructor
