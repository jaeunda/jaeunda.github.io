import { Comments } from "@jackyzha0/quartz"

// giscus mount point. The thread itself is an iframe injected by giscus at
// runtime from a GitHub Discussions backend, so nothing renders statically —
// this card shows the container the embed attaches to.
export const Default = () => <Comments />
