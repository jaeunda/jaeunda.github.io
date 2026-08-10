import { Backlinks } from "@jackyzha0/quartz"

// Lists pages that link to the current note. content/ has no note-to-note
// links yet, so the bound fixture points two real posts at this article.
//
// There is deliberately no empty-state cell: Backlinks defaults to
// hideWhenEmpty, so with no inbound links it renders nothing at all.
export const Default = () => <Backlinks />
