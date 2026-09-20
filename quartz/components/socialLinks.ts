interface SocialLink {
  name: string
  url: string
  icon: string
  // What the reader sees, and the whole of the pill's label: the address in
  // full, never a display name. `Daeun Jang` sat in this field for LinkedIn, so
  // two rows printed a destination and one printed a person.
  text: string
}

// Ordered the way the byline reads them: what I build, where I work, how to
// reach me. There is deliberately no portfolio row — see `ProfileCard`.
export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/jaeunda",
    icon: "github",
    text: "github.com/jaeunda",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/jaeunda/",
    icon: "linkedin",
    text: "linkedin.com/in/jaeunda",
  },
  {
    name: "Email",
    url: "mailto:jaeunda@gmail.com",
    icon: "email",
    text: "jaeunda@gmail.com",
  },
]
