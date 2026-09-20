// Home page layer tabs. One layer is always open — there is no "All", because
// the archive link beside the tabs already goes everywhere — so a click selects
// rather than toggles, and clicking the open tab leaves it open.
//
// `HomeStack` renders the opening layer server-side — the rows of other layers
// ship with `is-hidden` — so the page is correct before this runs and with no
// script at all. Every tab carries its own blurb, so nothing here writes text.

const HS_HIDDEN_CLASS = "is-hidden"
const HS_SWAPPING_CLASS = "is-swapping"
const HS_ENTERING_CLASS = "home-entering"

// The stagger has to finish before the reader does. Uncapped, the six-row
// Storage tab ran a 24ms ladder plus a 300ms rise — 420ms of list still
// arriving after the click that asked for it. Past this many rows every
// remaining row shares the last delay and they land together.
const HS_STAGGER_CAP = 4

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

function hsApplyLayer(layer: string, animate: boolean) {
  const root = document.querySelector<HTMLElement>("[data-home-stack]")
  if (!root || layer === "") return

  // The rows are re-numbered from the top of what is now visible. The stagger
  // used to be a `nth-child` ladder, which counts every hidden row of every
  // other layer too, so the first row of the last layer started 200ms late.
  let visible = 0
  root.querySelectorAll<HTMLElement>(".post-row[data-layer]").forEach((row) => {
    const hidden = row.dataset.layer !== layer
    row.classList.toggle(HS_HIDDEN_CLASS, hidden)
    if (hidden) {
      row.style.removeProperty("--hs-i")
    } else {
      row.style.setProperty("--hs-i", String(Math.min(visible, HS_STAGGER_CAP)))
      visible += 1
    }
  })

  root.querySelectorAll<HTMLButtonElement>(".hs-layer").forEach((button) => {
    button.setAttribute("aria-pressed", String((button.dataset.layer ?? "") === layer))
  })

  const index = root.querySelector<HTMLElement>(".hs-index")
  if (!index || !animate) return
  // Removing the class, forcing a reflow and re-adding it is what restarts a
  // CSS animation; without the reflow the browser coalesces the two changes and
  // nothing plays from the second switch onwards.
  index.classList.remove(HS_SWAPPING_CLASS)
  void index.offsetWidth
  index.classList.add(HS_SWAPPING_CLASS)
}

document.addEventListener("nav", () => {
  const root = document.querySelector<HTMLElement>("[data-home-stack]")
  if (!root) return

  if (!hsEntered) {
    hsEntered = true
    document.body.classList.add(HS_ENTERING_CLASS)
    window.addCleanup(() => document.body.classList.remove(HS_ENTERING_CLASS))
  }

  root.querySelectorAll<HTMLButtonElement>(".hs-layer").forEach((button) => {
    const handleClick = () => hsApplyLayer(button.dataset.layer ?? "", true)
    button.addEventListener("click", handleClick)
    window.addCleanup(() => button.removeEventListener("click", handleClick))
  })
})
