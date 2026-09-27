interface SocialLink {
  // The accessible name, and — lowercased — what the byline prints.
  name: string
  url: string
  icon: string
  // The address in full, never a display name. `Daeun Jang` sat in this field
  // for LinkedIn, so two rows printed a destination and one printed a person.
  //
  // The byline used to print this. Three full addresses stacked in a column is
  // three lines of near-identical text with the one distinguishing word buried
  // in the middle of each; it reads as a paste, not as a signature. It is the
  // link's `title` now, so the address is one hover away and `name` carries
  // the line.
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
