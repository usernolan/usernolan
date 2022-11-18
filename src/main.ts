import './style.css'
import type { ComponentLike } from "@thi.ng/rdom/api"
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

/* TODO: enums */
const whoAll = ["nolan", "nm8", "Oe", "smixzy"]
const whatAll = ["gist", "gallery", "reference"]

enum Who {
  Nolan = "nolan",
  Nm8 = "nm8",
  Oe = "Oe",
  Smixzy = "smixzy"
}

enum What {
  Gist = "gist",
  Gallery = "gallery",
  Reference = "reference"
}

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
  r.id ?
    `${r.who} ${r.what} ${r.id}` :
    `${r.who} ${r.what}`)

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

const defaultComponent = async (r: Route) =>
  ["main", {}, r.id ? `${r.who}/${r.what}/${r.id}` : `${r.who}/${r.what}`]

const DEFAULT_NUM_GALLERY_COLUMNS_INDEX = 2
const numGalleryColumnsAll = [1, 2, 3, 5, 8, 13, 21]
const numGalleryColumnsIndex = reactive(DEFAULT_NUM_GALLERY_COLUMNS_INDEX, { closeOut: CloseMode.NEVER })
const galleryColumns = numGalleryColumnsIndex.map((i) => numGalleryColumnsAll[i], { closeOut: CloseMode.NEVER })
/* TODO: review CloseMode */

interface GalleryItem {
  id: string,
  previewComponent: (r: Route, xs: Map<string, GalleryItem>) => ComponentLike,
  pageComponent: (r: Route, xs: Map<string, GalleryItem>) => ComponentLike
}

const nolanGalleryItems: Iterable<GalleryItem> = [
  {
    id: "self",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/self" },
        ["img", { src: "/jpg/nolan.4.jpg" }]]
    ],
    pageComponent: () => ["div", {}]
  }
]

const nolanGalleryItemMap =
  new Map(map((i) => [i.id, i], nolanGalleryItems))

const gallery = (r: Route, galleryItemMap: Map<string, GalleryItem>) => [
  "main", {},
  ["div.gallery-container", { "data-gallery-columns": galleryColumns },
    ...map((i) => i.previewComponent(r, galleryItemMap), galleryItemMap.values())]
]

/* TODO: undefined checks */
const decNumGalleryColumnsIndex = () => {
  const i = numGalleryColumnsIndex.deref()!
  i === 0 ?
    numGalleryColumnsIndex.next(numGalleryColumnsAll.length - 1) :
    numGalleryColumnsIndex.next(i - 1)
}
const incNumGalleryColumnsIndex = () => {
  const i = numGalleryColumnsIndex.deref()!
  numGalleryColumnsIndex.next((i + 1) % numGalleryColumnsAll.length)
}

const galleryControls = () => [
  "aside", {},
  ["div.gallery-controls", {},
    ["button", { onclick: decNumGalleryColumnsIndex }, "+"],
    ["button", { onclick: incNumGalleryColumnsIndex }, "-"]]
]

const nolanGist = async (r: Route) => [
  "main", {},
  ["h1", {}, "I'm nolan."],
  ["h2", {}, "I've been called a reflector. I'm into computers,\ngraphics, and all forms of animation."],
  ["h3", {}, "This is where I textually put out on the internet, so stay awhile, and listen. Enjoy my post-social AIM profile."],
  ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"]
]
/* TODO: contact? */

const nolanGallery = async (r: Route) =>
  r.id ?
    nolanGalleryItemMap.get(r.id)?.pageComponent(r, nolanGalleryItemMap) || gallery(r, nolanGalleryItemMap) :
    gallery(r, nolanGalleryItemMap)

const galleryItemMaps = new Map([
  ["nolan", nolanGalleryItemMap],
  ["nm8", nolanGalleryItemMap],
  ["Oe", nolanGalleryItemMap],
  ["smixzy", nolanGalleryItemMap]
])

const galleryItemObj = {
  nolan: nolanGalleryItemMap,
  nm8: nolanGalleryItemMap,
  Oe: nolanGalleryItemMap,
  smixzy: nolanGalleryItemMap
}

const galleryComponent = async (r: Route) => {
  // const m = galleryItemMaps.get(r.who) || galleryItemMaps.get(whoAll[0])!
  const m = galleryItemObj[r.who] || galleryItemObj[whoAll[0]]!
  r.id ?
    m.get(r.id)?.pageComponent(r, m) || gallery(r, m) :
    gallery(r, m)
}

const nolanGalleryAside = async (r: Route) => galleryControls()
const nolanReference = async (r: Route) => `${r.who}/${r.what}`

const nm8Gist = async (r: Route) => [
  "main", {},
  ["h1", {}, "I'm sorry."],
  ["h2", {}, "...about the JavaScript, Inter, and the\nwhole select-nav deal."],
  ["h3", {}, "The web was never meant to be \"cool\" and \"work well.\"\nThey have played us for absolute fools."],
  ["p", {}, "like animate. or like my initials, nms.\n also mereological composition."],
]

const nm8GalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const nm8GalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nm8Gallery = async (r: Route) => r.id ? nm8GalleryItem(r) : galleryIndex(r)
const nm8GalleryAside = async (r: Route) => galleryControls()
const nm8Reference = async (r: Route) => `${r.who}/${r.what}`

const allChars = ["°", ".", "·", ":", "*", " ", "?"]
const weights = [0.143, 0.143, 0.143, 0.143, 0.143, 0.286, 0.0143]
const takeChars = (n: number) => [...take(n, choices(allChars, weights))]
const numChars = 9

// var prevCharsLinear = takeChars(1).concat([...take(numChars - 1, prevCharsLinear)])
var prevChars = takeChars(numChars)

const OeGist = async (r: Route) => [
  "main", {},
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
const OeGallery = async (r: Route) => r.id ? OeGalleryItem(r) : galleryIndex(r)
const OeGalleryAside = async (r: Route) => galleryControls()
const OeReference = async (r: Route) => `${r.who}/${r.what}`

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
const smixzyGallery = async (r: Route) => r.id ? smixzyGalleryItem(r) : galleryIndex(r)
const smixzyGalleryAside = async (r: Route) => galleryControls()
const smixzyReference = async (r: Route) => `${r.who}/${r.what}`

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
      nolanReference: defaultComponent,
      nm8Gist,
      nm8Gallery,
      nm8Reference: defaultComponent,
      OeGist,
      OeGallery,
      OeReference: defaultComponent,
      smixzyGist,
      smixzyGallery,
      smixzyReference: defaultComponent
    },
    async (err) => ["div", {}, route.map((r) => `ERROR ${err}; ${r.who}/${r.what}`)]
  ),
  $switch(
    route,
    (r) => r.id ? "nothing" : `${r.who}${capitalize(r.what)}Aside`, /* TODO: fix aside for gallery item */
    {
      nolanGalleryAside,
      nm8GalleryAside,
      OeGalleryAside,
      smixzyGalleryAside
    },
    async () => ["aside", {}]
  )
])

rdom.mount(document.body)

// TODO: window.resize listener
// TODO: "layout"; route listener
// const navElement = document.getElementsByTagName("nav")[0]
// setTimeout(() => paddingTop.next(navElement.clientHeight))
// setTimeout(() => numGalleryColumnsIndex.next(DEFAULT_NUM_GALLERY_COLUMNS_INDEX))
