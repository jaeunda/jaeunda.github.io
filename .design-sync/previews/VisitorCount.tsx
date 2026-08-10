import { VisitorCount } from "@jackyzha0/quartz"

// Per-page visitor counter. The number is fetched from a Cloudflare Worker at
// runtime, so the card shows the shell it fetches into.
export const Default = () => <VisitorCount />
