import "./style.css"
import "./images.css"
import { addFilterSelect } from "./filter.js"

/* TODO: restore from localStorage, cookie, etc. */
/* TODO: query params */
/* TODO: hide select tags when scripting disabled */

const imagesDiv = document.querySelector("div.images") as HTMLDivElement

imagesDiv.addEventListener(
  "click",
  (e: MouseEvent) => {
    if (!e.target) return;
    const target = e.target as HTMLElement
    const parent = target.closest("div.image")
    if (!parent) return;
    const span = parseInt(parent.getAttribute("data-span") || "1")
    if (span >= 4) {
      parent!.setAttribute("data-span", "1")
    } else {
      parent!.setAttribute("data-span", `${span + 1}`)
    }
  }
)

addFilterSelect(imagesDiv, "div.image")
