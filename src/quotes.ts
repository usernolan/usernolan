import "./style.css"
// import "./quotes.css"
import { addFilterSelect } from "./filter.js"

const quotesDiv = document.querySelector("div.quotes") as HTMLDivElement
addFilterSelect(quotesDiv, "div.quote")
