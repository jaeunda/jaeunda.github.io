import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { socialLinks } from "./socialLinks"
import style from "./styles/profileCard.inline.scss"
import { classNames } from "../util/lang"

const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>`
const emailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`

const icons: Record<string, string> = {
  github: githubIcon,
  email: emailIcon,
}

const ProfileCard: QuartzComponent = (props: QuartzComponentProps & { explorerProfile?: boolean }) => {
  return (
    <div class={classNames("profile-card", props.explorerProfile && "explorer-profile")}>
      <div class="profile-avatar">
        <img src="https://github.com/jaeunda.png" alt="profile" />
      </div>
      <div class="profile-name">Daeun Jang</div>
      <div class="profile-bio">Soongsil Univ.</div>
      <div class="profile-socials">
        {socialLinks.map(({ name, url, icon }) => (
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name} dangerouslySetInnerHTML={{ __html: icons[icon] ?? name }} />
        ))}
      </div>
    </div>
  )
}

ProfileCard.css = style
export default (() => ProfileCard) satisfies QuartzComponentConstructor
