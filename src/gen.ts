import * as fs from "node:fs"
import { serialize } from "@thi.ng/hiccup"
import { document } from "./markup.js" // NOTE: ts-node-esm requires .js ext


/* NOTE: generate index */

fs.writeFileSync("index.html", serialize(document))
