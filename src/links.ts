import "./style.css"
// import "./links.css"
import { addFilterSelect } from "./filter.js"

const linksDiv = document.querySelector("div.links") as HTMLDivElement
addFilterSelect(linksDiv, "div.link")
