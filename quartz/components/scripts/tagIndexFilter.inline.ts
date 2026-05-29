const TAG_INDEX_ACTIVE_CLASS = "active"
const DEFAULT_PREFIX = "topic"

function prefixFromTag(tag: string | null): string {
  return tag?.split("/").at(0) ?? DEFAULT_PREFIX
}

function firstAvailablePrefix(): string {
  return (
    document.querySelector<HTMLButtonElement>("[data-tag-index-tab]")?.dataset.tagIndexTab ??
    DEFAULT_PREFIX
  )
}

function applyTagIndexFilter(tag: string | null, prefix = firstAvailablePrefix()) {
  const chips = document.querySelectorAll<HTMLAnchorElement>("[data-tag-index-chip]")
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-tag-index-tab]")
  const chipGroups = document.querySelectorAll<HTMLElement>("[data-tag-index-chip-group]")
  const sections = document.querySelectorAll<HTMLElement>("[data-tag-index-section]")
  const allPosts = document.querySelector<HTMLElement>("[data-tag-index-all-posts]")
  const activePrefix = tag ? prefixFromTag(tag) : prefix

  chips.forEach((chip) => {
    chip.classList.toggle(TAG_INDEX_ACTIVE_CLASS, tag !== null && chip.dataset.tag === tag)
  })

  tabs.forEach((tab) => {
    const active = tab.dataset.tagIndexTab === activePrefix
    tab.classList.toggle(TAG_INDEX_ACTIVE_CLASS, active)
    tab.setAttribute("aria-selected", String(active))
  })

  chipGroups.forEach((group) => {
    group.hidden = group.dataset.tagIndexChipGroup !== activePrefix
  })

  sections.forEach((section) => {
    section.hidden = tag === null || section.dataset.tag !== tag
  })

  if (allPosts) allPosts.hidden = tag !== null
}

function getTagIndexFilterFromURL(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get("tag")
}

function getTagIndexPrefixFromURL(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get("group")
}

function setTagIndexFilterInURL(tag: string | null, prefix: string | null = null) {
  const url = new URL(window.location.href)
  if (tag) {
    url.searchParams.set("tag", tag)
    url.searchParams.delete("group")
  } else {
    url.searchParams.delete("tag")
    if (prefix && prefix !== firstAvailablePrefix()) url.searchParams.set("group", prefix)
    else url.searchParams.delete("group")
  }
  window.history.replaceState({}, "", url.toString())
}

document.addEventListener("nav", () => {
  const initial = getTagIndexFilterFromURL()
  const initialPrefix = initial
    ? prefixFromTag(initial)
    : (getTagIndexPrefixFromURL() ?? firstAvailablePrefix())
  applyTagIndexFilter(initial, initialPrefix)

  document.querySelectorAll<HTMLButtonElement>("[data-tag-index-tab]").forEach((tab) => {
    const handleTabClick = () => {
      const prefix = tab.dataset.tagIndexTab ?? firstAvailablePrefix()
      applyTagIndexFilter(null, prefix)
      setTagIndexFilterInURL(null, prefix)
    }

    tab.addEventListener("click", handleTabClick)
    window.addCleanup(() => tab.removeEventListener("click", handleTabClick))
  })

  document.querySelectorAll<HTMLAnchorElement>("[data-tag-index-chip]").forEach((chip) => {
    const handleChipClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
      e.preventDefault()
      e.stopPropagation()

      const tag = chip.dataset.tag!
      const next = chip.classList.contains(TAG_INDEX_ACTIVE_CLASS) ? null : tag
      applyTagIndexFilter(next, prefixFromTag(tag))
      setTagIndexFilterInURL(next, prefixFromTag(tag))
    }

    chip.addEventListener("click", handleChipClick)
    window.addCleanup(() => chip.removeEventListener("click", handleChipClick))
  })
})
