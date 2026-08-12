import { PinnedPosts } from "@jackyzha0/quartz"

// The 2-column featured grid currently mounted on the home page
// (quartz.layout.ts:12). It renders only posts with `featured: true` in
// frontmatter — no post in content/ sets that today, so the bound fixture
// marks the four most recent as featured. See .design-sync/NOTES.md.
export const Default = () => <PinnedPosts />
