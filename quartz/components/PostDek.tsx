import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// The line under a post's title: the question the post answers, from its own
// `description` frontmatter — the sentence the home index and the rows already
// print under the title. Without it a reader arriving on a post met the title
// and then the first paragraph, with nothing saying what the next hour was for.
//
// Only the author's own sentence: Quartz fills `fileData.description` from the
// body when the frontmatter has none, and the opening paragraph printed twice
// is not a dek.
export default (() => {
  const PostDek: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const dek = fileData.frontmatter?.description
    if (typeof dek !== "string" || dek.trim() === "") return null
    return <p class="post-dek">{dek}</p>
  }

  return PostDek
}) satisfies QuartzComponentConstructor
