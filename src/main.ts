import './style.css'
import { $compile } from "@thi.ng/rdom/compile"
import { $switch } from "@thi.ng/rdom/switch"
import { $replace } from "@thi.ng/rdom/replace"
import { reactive, stream } from "@thi.ng/rstream/stream"
import { fromRAF } from "@thi.ng/rstream/raf"
import { fromDOMEvent } from "@thi.ng/rstream/event"
import { CloseMode } from "@thi.ng/rstream/api"
import { sync } from "@thi.ng/rstream/sync"
import { map } from "@thi.ng/transducers/map"
import { take } from "@thi.ng/transducers/take"
import { choices } from "@thi.ng/transducers/choices"
import { range } from "@thi.ng/transducers/range"

interface Route {
  who: string,
  what: string,
  id?: string
}

const whoAll = ["nolan", "nm8", "Oe", "smixzy"]
const whatAll = ["gist", "gallery", "refs"]

const routeFromHash = (s: string): Route => {
  const i = s.indexOf("#")

  if (i === -1) {
    return {
      who: whoAll[0],
      what: whatAll[0]
    }
  }

  const arr = s.substring(i).split("/")

  return {
    who: arr[1] || whoAll[0],
    what: arr[2] || whatAll[0],
    id: arr[3]
  }
}

const route = reactive(routeFromHash(location.hash))

window.addEventListener("hashchange", (e) =>
  route.next(routeFromHash(e.newURL)))

route.map((r) => document.body.className =
  r.id ? `${r.who} ${r.what} ${r.id}` : `${r.who} ${r.what}`)

const navComponent = (r: Route) => [
  "nav", {},
  ["select.who",
    {
      onchange: (e: { target: HTMLSelectElement }) => {
        location.hash = `#/${e?.target?.value || "nolan"}/${r.what || "gist"}`
        window.scrollTo(0, 0)
      }
    },
    ...whoAll.map((x) => ["option", { selected: r.who === x }, x])
  ],
  ["select.what",
    {
      onchange: (e: { target: HTMLSelectElement }) => {
        location.hash = `#/${r.who || "nolan"}/${e?.target?.value || "gist"}`
        window.scrollTo(0, 0)
      }
    },
    ...whatAll.map((x) => ["option", { selected: r.what === x }, x])
  ]
]

const paddingTopPx = reactive(0) /* TODO: rename; navHeight */
const paddingTop =
  paddingTopPx.map((n) => `${n}px`, { closeOut: CloseMode.NEVER })

const defaultComponent = async (r: Route) =>
  ["main", { style: { paddingTop } },
    r.id ?
      `${r.who}/${r.what}/${r.id}` :
      `${r.who}/${r.what}`]

const DEFAULT_NUM_GRID_COLUMNS = 5
const MAX_NUM_GRID_COLUMNS = 20
const GRID_GAP_PX = 5
const numGridColumns = reactive(DEFAULT_NUM_GRID_COLUMNS)
const gridItemWidth = numGridColumns.map((n) => {
  const container = document.getElementsByClassName("grid-container")[0]
  if (!container)
    return "0px"
  const w = (container.clientWidth - (n * GRID_GAP_PX)) / n
  return `${w}px`
}, { closeOut: CloseMode.NEVER })

const grid = () => [
  "div.grid-container", {},
  ...map((n) => [
    "div.grid-item",
    { style: { width: gridItemWidth } },
    n
  ], range(25))
]

const decNumGridColumns = () => {
  const n = numGridColumns.deref() || DEFAULT_NUM_GRID_COLUMNS
  n <= 1 ?
    numGridColumns.next(MAX_NUM_GRID_COLUMNS) :
    numGridColumns.next(n - 1)
}
const incNumGridColumns = () => {
  const n = numGridColumns.deref() || DEFAULT_NUM_GRID_COLUMNS
  numGridColumns.next((n % MAX_NUM_GRID_COLUMNS) + 1)
}

// const gridControlTop =
//   sync({ src: { paddingTopPx, scroll: fromDOMEvent(window, "scroll") } })
//     .map((x) => {
//       const n = Math.max(x.paddingTopPx - window.scrollY, 0)
//       return n === 0 ? "0.25rem" : `${n}px` /* TODO: margin instead of 0.25rem */
//     })

const gridControls = () => [
  "div.grid-controls",
  {}
  // {
  //   style: {
  //     top: paddingTop
  //   }
  // }
  ,
  ["button", { onclick: decNumGridColumns }, "+"],
  ["button", { onclick: incNumGridColumns }, "-"]
]

const nolanGist = async (r: Route) => [
  "main", { style: { paddingTop } },
  ["h1", {}, "I'm nolan."],
  ["h2", {}, "I've been called a reflector. I'm big on computers,\ngraphics, and all forms of animation."],
  ["h3", {}, "This is where I put out on the internet, so stay awhile, and listen.\nEnjoy my post-social AIM profile."],
  ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"]
]

const nolanGalleryIndex = (r: Route) => [
  "main", { style: { paddingTop } },
  gridControls(),
  grid()
]

const nolanGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nolanGallery = async (r: Route) => r.id ? nolanGalleryItem(r) : nolanGalleryIndex(r)
const nolanRefs = async (r: Route) => `${r.who}/${r.what}`

const nm8Gist = async (r: Route) => [
  "main", { style: { paddingTop } },
  ["h1", {}, "I'm sorry."],
  ["h2", {}, "...about the JavaScript, Inter, and the\nwhole select-nav deal."],
  ["h3", {}, "The web was never meant to be \"cool\" and \"work well\".\nThey have played us for absolute fools."],
  ["p", {}, "like animate. or like nms, my initials.\n also mereological composition."],
]

const nm8GalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const nm8GalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nm8Gallery = async (r: Route) => r.id ? nm8GalleryItem(r) : nm8GalleryIndex(r)
const nm8Refs = async (r: Route) => `${r.who}/${r.what}`

const allChars = ["°", ".", "·", ":", "*", " ", "?"]
const weights = [0.143, 0.143, 0.143, 0.143, 0.143, 0.286, 0.0143]
const takeChars = (n: number) => [...take(n, choices(allChars, weights))]
const numChars = 9

// var prevCharsLinear = takeChars(1).concat([...take(numChars - 1, prevCharsLinear)])
var prevChars = takeChars(numChars)

const OeGist = async (r: Route) => [
  "main", { style: { paddingTop } },
  ["h1", {}, $replace(fromRAF().map((t) => {
    if (t % 12 === 0) prevChars = takeChars(numChars)
    return prevChars.join("")
  }))],
  ["h2", {}, ".Process\n.Abstract machines"],
  ["h3", {}, "Language, logic, proof, etc.\nReal game of life hours, you know the one."],
  ["p", {}, "observe ∘ explicate"]
]
const OeGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const OeGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const OeGallery = async (r: Route) => r.id ? OeGalleryIndex(r) : OeGalleryItem(r)
const OeRefs = async (r: Route) => `${r.who}/${r.what}`

const offset = 300
const period = 2 * Math.PI * 1200
const rate = 333
const rangePct = 200

const prefersDarkModeMatch = window.matchMedia("(prefers-color-scheme: dark)")
const prefersDarkMode = reactive(prefersDarkModeMatch.matches)
prefersDarkModeMatch.addEventListener("change", (e) => {
  prefersDarkMode.next(e.matches)
})

const smixzyGist = async (_: Route) => [
  "main", {
    style: {
      paddingTop,
      backgroundImage: fromRAF().map((t) => {
        const x = Math.sin((t - offset) % period / rate) * rangePct
        return prefersDarkMode.deref() ?
          `radial-gradient(circle at ${x}% 50%, lightgreen, lightblue)` :
          `radial-gradient(circle at ${x}% 50%, lightblue, #4200af)`
      })
    }
  },
  ["h1", {}, "I'm garbage."],
  ["h2", {}, "Nonsense \\\\ Acrylic \\\\  Handmade"],
  ["h3", {}, "in any combination. I love my desk.\nSoft immutable. Lv. 60 Arcane Mage."]
]
const smixzyGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const smixzyGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const smixzyGallery = async (r: Route) => r.id ? smixzyGalleryItem(r) : smixzyGalleryIndex(r)
const smixzyRefs = async (r: Route) => `${r.who}/${r.what}`

const capitalize = (s: string) => s.replace(/^\w/, c => c.toUpperCase())

const rdom = $compile([
  "div.rdom-root", {},
  $replace(route.map(navComponent)),
  $switch(
    route,
    (r) => `${r.who}${capitalize(r.what)}`,
    {
      nolanGist,
      nolanGallery,
      nolanRefs: defaultComponent,
      nm8Gist,
      nm8Gallery: defaultComponent,
      nm8Refs: defaultComponent,
      OeGist,
      OeGallery: defaultComponent,
      OeRefs: defaultComponent,
      smixzyGist,
      smixzyGallery: defaultComponent,
      smixzyRefs: defaultComponent
    },
    async (err) => ["div", {}, route.map((r) => `ERROR ${err}; ${r.who}/${r.what}`)]
  )
])

rdom.mount(document.body)

// TODO: window.resize listener
// TODO: "layout"
const navElement = document.getElementsByTagName("nav")[0]
setTimeout(() => paddingTopPx.next(navElement.clientHeight))
// setTimeout(() => gridControlTop.next(navElement.clientHeight))
setTimeout(() => numGridColumns.next(DEFAULT_NUM_GRID_COLUMNS))
