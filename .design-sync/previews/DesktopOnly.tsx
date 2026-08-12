import { DesktopOnly } from "@jackyzha0/quartz"

// Hides its child below the desktop breakpoint. Shown wrapping ProfileCard,
// exactly as quartz.layout.ts mounts it.
export const Default = () => <DesktopOnly />
