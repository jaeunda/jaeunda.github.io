import { MobileOnly } from "@jackyzha0/quartz"

// The breakpoint mirror of DesktopOnly. Shown wrapping CompactToc, which is the
// component the reading layout actually restricts to narrow viewports.
export const Default = () => <MobileOnly />
