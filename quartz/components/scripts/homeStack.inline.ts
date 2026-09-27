// The home page's group chooser: one tab open, one panel shown.
//
// `HomeStack` renders every panel and marks all but the first `hidden`, so the
// page is correct before this runs and with no script at all. Every tab carries
// its own label and count, so nothing here writes text.

const HS_SWAPPING_CLASS = "is-swapping"
const HS_ENTERING_CLASS = "home-entering"

function hsOpen(group: string, animate: boolean) {
  const root = document.querySelector<HTMLElement>("[data-home-stack]")
  if (!root || group === "") return

  root.querySelectorAll<HTMLButtonElement>(".hs-tab").forEach((tab) => {
    tab.setAttribute("aria-pressed", String((tab.dataset.group ?? "") === group))
  })

  root.querySelectorAll<HTMLElement>(".hs-panel").forEach((panel) => {
    const open = panel.dataset.group === group
    panel.hidden = !open
    if (!open || !animate) return
    // Removing the class, forcing a reflow and re-adding it is what restarts a
    // CSS animation; without the reflow the browser coalesces the two changes
    // and nothing plays from the second switch onwards.
    const grid = panel.querySelector<HTMLElement>(".hs-grid")
    if (!grid) return
    grid.classList.remove(HS_SWAPPING_CLASS)
    void grid.offsetWidth
    grid.classList.add(HS_SWAPPING_CLASS)
  })
}

// The page's entrance is opt-in, and it is opted into here rather than in the
// stylesheet, for two reasons.
//
// Nothing is ever invisible without it. A CSS rule with `backwards` fill holds
// the block at `opacity: 0` from first paint, so a browser that never runs the
// animation shows a blank home page; the server-rendered markup carries no
// class, so it renders finished and this adds the class to replay it.
//
// And it happens once per document. Quartz keeps one document and fires `nav`
// on every SPA navigation, so a reader coming back from a post used to watch
// the home page reassemble itself — the animation punished exactly the reader
// who was browsing. This module's scope outlives those navigations.
let hsEntered = false

document.addEventListener("nav", () => {
  const root = document.querySelector<HTMLElement>("[data-home-stack]")
  if (!root) return

  if (!hsEntered) {
    hsEntered = true
    document.body.classList.add(HS_ENTERING_CLASS)
    window.addCleanup(() => document.body.classList.remove(HS_ENTERING_CLASS))
  }

  // `?layer=storage` opens that tab — the link a post's kicker points at, so
  // the reader lands on the rest of the layer they were just reading. An
  // unknown id is ignored and the page keeps its server-rendered tab.
  const requested = new URLSearchParams(window.location.search).get("layer")
  if (requested && root.querySelector(`.hs-tab[data-group="${CSS.escape(requested)}"]`)) {
    hsOpen(requested, false)
  }

  root.querySelectorAll<HTMLButtonElement>(".hs-tab").forEach((tab) => {
    const handleClick = () => hsOpen(tab.dataset.group ?? "", true)
    tab.addEventListener("click", handleClick)
    window.addCleanup(() => tab.removeEventListener("click", handleClick))
  })
})
