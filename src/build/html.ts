import { writeFileSync } from "node:fs"
import { argv } from "node:process"
import { serialize } from "@thi.ng/hiccup"
import { index, images } from "../static/markup.js" // NOTE: ts-node-esm requires .js ext
import beautify from "js-beautify" // NOTE: named import unsupported


/* TODO: refine `any[]` */
const asHtml = (data: any[]) => argv.find((x) => x === "--release") ?
  serialize(data) :
  beautify.html_beautify(serialize(data), { indent_size: 2 })

writeFileSync("index.html", asHtml(index))
writeFileSync("images/index.html", asHtml(images))
