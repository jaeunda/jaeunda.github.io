import { FolderContent } from "@jackyzha0/quartz"

// A folder index page. content/ is flat, so the bound fixture nests the real
// posts under a "notes" folder to exercise the listing.
export const Default = () => <FolderContent />
