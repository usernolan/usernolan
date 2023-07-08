import "./style.css"
import { addFilterSelect } from "./filter.js"
import { addModeSelect } from "./mode.js"

const toggleSize = (el: Element) => {
  const span = el.getAttribute("data-span")
  if (!span || (span && parseInt(span) < 4)) {
    if (span) el.setAttribute("data-init-span", span)
    el.setAttribute("data-span", "4")
  } else {
    const initSpan = el.getAttribute("data-init-span")
    if (initSpan) {
      el.setAttribute("data-span", initSpan)
      el.removeAttribute("data-init-span")
    } else {
      el.removeAttribute("data-span")
    }
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" })
}

const imagesDiv = document.querySelector("div.images") as HTMLDivElement

imagesDiv?.addEventListener(
  "click",
  (e: MouseEvent) => {
    if (!e.target) return;
    const target = e.target as HTMLElement
    const parent = target.closest("div.image")
    if (parent) toggleSize(parent)
  }
)

addFilterSelect(imagesDiv, "div.image")
addModeSelect()

if (location.hash) {
  const el = document.querySelector(location.hash)
  if (el) {
    toggleSize(el)
    el.querySelector("img")?.addEventListener(
      "load",
      () => el.scrollIntoView({ behavior: "smooth", block: "center" })
    )
  }
}
