const ACTIVE_CLASS = "active"

function applyTagIndexFilter(tag: string | null) {
  const chips = document.querySelectorAll<HTMLAnchorElement>("[data-tag-index-chip]")
  const sections = document.querySelectorAll<HTMLElement>("[data-tag-index-section]")

  chips.forEach((chip) => {
    chip.classList.toggle(ACTIVE_CLASS, tag !== null && chip.dataset.tag === tag)
  })

  sections.forEach((section) => {
    section.hidden = tag !== null && section.dataset.tag !== tag
  })
}

function getTagIndexFilterFromURL(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get("tag")
}

function setTagIndexFilterInURL(tag: string | null) {
  const url = new URL(window.location.href)
  if (tag) url.searchParams.set("tag", tag)
  else url.searchParams.delete("tag")
  window.history.replaceState({}, "", url.toString())
}

document.addEventListener("nav", () => {
  const initial = getTagIndexFilterFromURL()
  applyTagIndexFilter(initial)

  document.querySelectorAll<HTMLAnchorElement>("[data-tag-index-chip]").forEach((chip) => {
    const handleChipClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
      e.preventDefault()
      e.stopPropagation()

      const tag = chip.dataset.tag!
      const next = chip.classList.contains(ACTIVE_CLASS) ? null : tag
      applyTagIndexFilter(next)
      setTagIndexFilterInURL(next)
    }

    chip.addEventListener("click", handleChipClick)
    window.addCleanup(() => chip.removeEventListener("click", handleChipClick))
  })
})
