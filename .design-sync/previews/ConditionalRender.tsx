import { ConditionalRender } from "@jackyzha0/quartz"

// Renders its wrapped component only when a predicate passes. Shown wrapping
// ArticleTitle with the layout condition (slug !== "index"), so it renders.
export const Default = () => <ConditionalRender />
