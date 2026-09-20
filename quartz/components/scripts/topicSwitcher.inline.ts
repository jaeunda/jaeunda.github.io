// The Topics page: one wrapped strip of subjects, one panel of posts.
//
// The chips are real links to `/tags/topic/<name>`, and this intercepts a plain
// left click to switch the panel in place. That keeps the page working with no
// script at all — the first panel is rendered open and every other subject is
// one navigation away — and it keeps Cmd/Ctrl/Shift/middle-click opening the
// full subject page, which is what a link is expected to do.
//
// The strip used to scroll sideways with a step button at each end, which
// needed centring, disabled-state syncing and an arrow-key handler. The chips
// wrap now, so Tab already walks them and all of that is gone.

function tsChips(root: HTMLElement): HTMLAnchorElement[] {
  return [...root.querySelectorAll<HTMLAnchorElement>(".topic-chip")]
}

function tsSelect(root: HTMLElement, topic: string) {
  tsChips(root).forEach((chip) => {
    if (chip.dataset.topic === topic) {
      chip.setAttribute("aria-current", "true")
    } else {
      chip.removeAttribute("aria-current")
    }
  })

  root.querySelectorAll<HTMLElement>(".topic-panel").forEach((panel) => {
    panel.hidden = panel.dataset.topic !== topic
  })
}

document.addEventListener("nav", () => {
  const root = document.querySelector<HTMLElement>("[data-topic-switcher]")
  if (!root) return

  tsChips(root).forEach((chip) => {
    const handleClick = (event: MouseEvent) => {
      // Anything but a plain left click is the reader asking for the link.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      event.preventDefault()
      if (chip.dataset.topic) tsSelect(root, chip.dataset.topic)
    }
    chip.addEventListener("click", handleClick)
    window.addCleanup(() => chip.removeEventListener("click", handleClick))
  })
})
