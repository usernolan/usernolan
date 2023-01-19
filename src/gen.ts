import { writeFileSync } from "node:fs"
import { argv } from "node:process"
import { serialize } from "@thi.ng/hiccup"
import { document } from "./markup.js" // NOTE: ts-node-esm requires .js ext
import beautify from "js-beautify" // NOTE: named import unsupported


/* NOTE: generate index */

const raw = serialize(document)

const data = argv.find((x) => x === '--release') ? raw
  : beautify.html_beautify(raw, { indent_size: 2 })

writeFileSync("index.html", data)
