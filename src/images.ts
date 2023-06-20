import "./style.css"
import { addFilterSelect } from "./filter.js"
import { addModeSelect } from "./mode.js"

const imagesDiv = document.querySelector("div.images") as HTMLDivElement

if (imagesDiv) {
  imagesDiv.addEventListener(
    "click",
    (e: MouseEvent) => {
      if (!e.target) return;
      const target = e.target as HTMLElement
      const parent = target.closest("div.image")
      if (!parent) return;
      const span = parseInt(parent.getAttribute("data-span") || "1")
      if (span >= 4) {
        parent.removeAttribute("data-span")
      } else {
        parent.setAttribute("data-span", `${span + 1}`)
      }
    }
  )
}

addFilterSelect(imagesDiv, "div.image")
addModeSelect()
