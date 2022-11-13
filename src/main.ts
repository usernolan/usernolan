import './style.css'
import { $compile } from "@thi.ng/rdom/compile"
import { $switch } from "@thi.ng/rdom/switch"
import { $replace } from "@thi.ng/rdom/replace"
import { reactive, stream } from "@thi.ng/rstream/stream"
import { fromRAF } from "@thi.ng/rstream/raf"
import { CloseMode } from "@thi.ng/rstream/api"
import { sync } from "@thi.ng/rstream/sync"
import { map } from "@thi.ng/transducers/map"
import { take } from "@thi.ng/transducers/take"
import { choices } from "@thi.ng/transducers/choices"

interface Route {
  who: string,
  what: string,
  id?: string
}

const whoAll = ["nolan", "nm8", "Oe", "smixzy"]
const whatAll = ["gist", "gallery", "words", "refs"]

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

const body = document.getElementsByTagName("body")[0]

route.map((r) => body.className =
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
    ...whoAll.map((x) => ["option", { selected: r.who === x }, x])],
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

const paddingTop = reactive(0).map((n) =>
  n.toString().concat("px"), { closeOut: CloseMode.NEVER })

const defaultComponent = async (r: Route) =>
  ["main", { style: { paddingTop } },
    r.id ? `${r.who}/${r.what}/${r.id}` : `${r.who}/${r.what}`]

const nolanGist = async (r: Route) => [
  "main", { style: { paddingTop } },
  ["h1", {}, "I'm nolan."],
  ["h2", {}, "I've been called a reflector. I'm big on computers,\ngraphics, and all forms of animation."],
  ["h3", {}, "This is where I put out online, so stay awhile, and listen.\nEnjoy my post-social AIM profile."],
  ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"]
]

const nolanGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const nolanGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nolanGallery = async (r: Route) => r.id ? nolanGalleryItem(r) : nolanGalleryIndex(r)
const nolanWords = async (r: Route) => `${r.who}/${r.what}`
const nolanRefs = async (r: Route) => `${r.who}/${r.what}`

const nm8Gist = async (r: Route) => [
  "main", { style: { paddingTop } },
  ["h1", {}, "I'm sorry."],
  ["h2", {}, "—about the JavaScript, Inter, and the\nwhole select-nav deal."],
  ["h3", {}, "The web was never meant to be \"cool\" and \"funny\" and \"work\".\nThey have played us for absolute fools."],
  ["p", {}, "like 'animate'. or like 'nms', my initials.\nor like, unrestricted mereological composition."],
]

const nm8GalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const nm8GalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nm8Gallery = async (r: Route) => r.id ? nm8GalleryItem(r) : nm8GalleryIndex(r)
const nm8Words = async (r: Route) => `${r.who}/${r.what}`
const nm8Refs = async (r: Route) => `${r.who}/${r.what}`

// ["°", ".", ",", "·", "_", ":", "?", "'", "<", ">", "\\", "/", "+", "-", "0", "x", "*", " "]
const allChars = ["°", ".", "·", ":", "*", " ", "?"]
const weights =  [0.143, 0.143, 0.143, 0.143, 0.143, 0.286, 0.0143]
const takeChars = (n: number) => [...take(n, choices(allChars, weights))]
const numChars = 9

var prevX = takeChars(numChars)

const OeGist = async (r: Route) => [
  "main", { style: { paddingTop } },
  ["h1", {}, $replace(fromRAF().map((t) => {
    if (t % 12 === 0)
      prevX = takeChars(numChars)
      // prevX = takeChars(1).concat([...take(numTake - 1, prevX)])
    return prevX.join("")
  }))],
  ["h2", {}, "Abstract machines"],
  ["h3", {}, "Process, language, logic, proof, etc..\nReal game of life hours, you know the one."],
  ["p", {}, "observe ∘ explicate"]
]
const OeGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const OeGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const OeGallery = async (r: Route) => r.id ? OeGalleryIndex(r) : OeGalleryItem(r)
const OeWords = async (r: Route) => `${r.who}/${r.what}`
const OeRefs = async (r: Route) => `${r.who}/${r.what}`

const smixzyGist = async (_: Route) => [
  "main", { style: { paddingTop, backgroundImage: fromRAF().map((t) => {
    const x = Math.sin((t - 300) % (2 * Math.PI * 1200) / 333) * 200
    // console.log(x)
    return `radial-gradient(circle at ${x}% 50%, lightblue, #4200af)`
  }) } },
  ["h1",
    // {
    //   style: {
    //     // backgroundImage: fromRAF().map((t) => `linear-gradient(${t % 360}deg, #4400ad, skyblue)`)
    //     // backgroundImage: fromRAF().map((t) => `radial-gradient(circle at ${t % 200 - 100}% 0, #4400ad, skyblue)`)
    //     backgroundImage: fromRAF().map((t) => {
    //       const x = Math.sin((t - 300) % (2 * Math.PI * 1200) / 333) * 500
    //       // console.log(x)
    //       return `radial-gradient(circle at ${x}% 50%, lightblue, #4200af)`
    //     })
    //   }
    // }
   ,
    "I'm garbage."],
  ["h2", {}, "Nonsense \\\\ Acrylic \\\\  Handmade"],
  ["h3", {}, "in any combination. I love my desk.\nSoft immutable. Lv. 60 Arcane Mage."]
]
const smixzyGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const smixzyGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const smixzyGallery = async (r: Route) => r.id ? smixzyGalleryItem(r) : smixzyGalleryIndex(r)
const smixzyWords = async (r: Route) => `${r.who}/${r.what}`
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
      nolanGallery: defaultComponent,
      nolanWords: defaultComponent,
      nolanRefs: defaultComponent,
      nm8Gist,
      nm8Gallery: defaultComponent,
      nm8Words: defaultComponent,
      nm8Refs: defaultComponent,
      OeGist,
      OeGallery: defaultComponent,
      OeWords: defaultComponent,
      OeRefs: defaultComponent,
      smixzyGist,
      smixzyGallery: defaultComponent,
      smixzyWords: defaultComponent,
      smixzyRefs: defaultComponent
    },
    async (err) => ["div", {}, route.map((r) => `ERROR ${err}; ${r.who}/${r.what}`)]
  )
])

rdom.mount(body)

// TODO: window.resize listener
const el = document.getElementsByTagName("nav")[0]
paddingTop.next(el.clientHeight)
