const ACTIVE_CLASS = "active"
const HIDDEN_CLASS = "is-hidden"

function applyFilter(tag: string | null) {
  const cards = document.querySelectorAll<HTMLElement>("[data-home-recent] [data-tags]")
  const chips = document.querySelectorAll<HTMLAnchorElement>("[data-home-tagcloud] [data-tag]")
  const countEl = document.querySelector<HTMLElement>("[data-recent-count]")
  const filterBar = document.querySelector<HTMLElement>("[data-active-filter]")
  const filterTagEl = document.querySelector<HTMLElement>("[data-active-filter-tag]")
  const emptyEl = document.querySelector<HTMLElement>("[data-recent-empty]")

  chips.forEach((c) => {
    if (tag && c.dataset.tag === tag) c.classList.add(ACTIVE_CLASS)
    else c.classList.remove(ACTIVE_CLASS)
  })

  let shown = 0
  cards.forEach((card) => {
    const cardTags = (card.dataset.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const match = tag === null || cardTags.includes(tag)
    card.classList.toggle(HIDDEN_CLASS, !match)
    if (match) shown += 1
  })

  if (countEl) countEl.textContent = String(shown)

  if (filterBar && filterTagEl) {
    if (tag) {
      filterTagEl.textContent = `#${tag}`
      filterBar.hidden = false
    } else {
      filterBar.hidden = true
    }
  }

  if (emptyEl) emptyEl.hidden = shown !== 0
}

function getTagFromURL(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get("tag")
}

function setTagInURL(tag: string | null) {
  const url = new URL(window.location.href)
  if (tag) url.searchParams.set("tag", tag)
  else url.searchParams.delete("tag")
  window.history.replaceState({}, "", url.toString())
}

document.addEventListener("nav", () => {
  const initial = getTagFromURL()
  if (initial) applyFilter(initial)

  document.querySelectorAll<HTMLAnchorElement>("[data-home-tagcloud] [data-tag]").forEach((chip) => {
    const handleChipClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
      e.preventDefault()
      e.stopPropagation()
      const tag = chip.dataset.tag!
      const next = chip.classList.contains(ACTIVE_CLASS) ? null : tag
      applyFilter(next)
      setTagInURL(next)
    }
    chip.addEventListener("click", handleChipClick)
    window.addCleanup(() => chip.removeEventListener("click", handleChipClick))
  })

  const clearBtn = document.querySelector<HTMLButtonElement>("[data-active-filter-clear]")
  if (clearBtn) {
    const handleClear = () => {
      applyFilter(null)
      setTagInURL(null)
    }
    clearBtn.addEventListener("click", handleClear)
    window.addCleanup(() => clearBtn.removeEventListener("click", handleClear))
  }
})
