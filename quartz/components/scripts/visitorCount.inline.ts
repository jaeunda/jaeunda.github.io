document.addEventListener("nav", () => {
  const el = document.querySelector<HTMLElement>(".visitor-count")
  if (!el) return

  const workerUrl = el.dataset.workerUrl
  if (!workerUrl) return

  const valueEl = el.querySelector<HTMLElement>(".visitor-count-value")
  if (!valueEl) return

  fetch(workerUrl)
    .then((r) => r.json())
    .then(({ visitors }: { visitors: number }) => {
      valueEl.textContent = visitors.toLocaleString("en-US")
      el.removeAttribute("aria-hidden")
    })
    .catch(() => {
      el.setAttribute("aria-hidden", "true")
      el.style.display = "none"
    })
})
