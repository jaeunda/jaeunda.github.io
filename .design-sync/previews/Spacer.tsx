import { PageTitle, Spacer } from "@jackyzha0/quartz"

// Spacer draws nothing on its own — it is a vertical gap. Shown between two
// real sidebar components so the gap it introduces is visible, which is how
// quartz.layout.ts:44 uses it.
export const BetweenSidebarItems = () => (
  <div>
    <PageTitle />
    <Spacer />
    <PageTitle />
  </div>
)
