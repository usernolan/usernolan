import "./style.css"
import { addFilterSelect } from "./filter.js"
import { addModeSelect } from "./mode.js"

const linksDiv = document.querySelector("div.links") as HTMLDivElement

if (linksDiv) {
  addFilterSelect(linksDiv, "div.link")
}

addModeSelect()
