import './style.css'
import { $compile } from "@thi.ng/rdom/compile"
import { $switch } from "@thi.ng/rdom/switch"
import { $replace } from "@thi.ng/rdom/replace"
import { reactive, stream } from "@thi.ng/rstream/stream"
import { sync } from "@thi.ng/rstream/sync"
import { map } from "@thi.ng/transducers/map"

interface Route {
  who: string,
  what: string,
  id?: string
}

const whoAll = ["nolan", "nm8", "Oe", "smixzy"]
const whatAll = ["gist", "gallery", "refs", "quotes"]

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

window.addEventListener("hashchange", (e) => {
  console.log(e)
  route.next(routeFromHash(e.newURL))
})

const body = document.getElementsByTagName("body")[0]

route.map((r) => body.className = `${r.who} ${r.what}`)

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

const nolanGist = async (r: Route) => `${r.who}/${r.what}`
const nolanGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const nolanGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nolanGallery = async (r: Route) => r.id ? nolanGalleryItem(r) : nolanGalleryIndex(r)
const nolanRefs = async (r: Route) => `${r.who}/${r.what}`
const nolanQuotes = async (r: Route) => `${r.who}/${r.what}`

const nm8Gist = async (r: Route) => `${r.who}/${r.what}`
const nm8GalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const nm8GalleryItem = (r: Route) => `${r.who}/${r.what} item`
const nm8Gallery = async (r: Route) => r.id ? nm8GalleryItem(r) : nm8GalleryIndex(r)
const nm8Refs = async (r: Route) => `${r.who}/${r.what}`
const nm8Quotes = async (r: Route) => `${r.who}/${r.what}`

const OeGist = async (r: Route) => `${r.who}/${r.what}`
const OeGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const OeGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const OeGallery = async (r: Route) => r.id ? OeGalleryIndex(r) : OeGalleryItem(r)
const OeRefs = async (r: Route) => `${r.who}/${r.what}`
const OeQuotes = async (r: Route) => `${r.who}/${r.what}`

const smixzyGist = async (r: Route) => `${r.who}/${r.what}`
const smixzyGalleryIndex = (r: Route) => `${r.who}/${r.what} index`
const smixzyGalleryItem = (r: Route) => `${r.who}/${r.what} item`
const smixzyGallery = async (r: Route) => r.id ? smixzyGalleryItem(r) : smixzyGalleryIndex(r)
const smixzyRefs = async (r: Route) => `${r.who}/${r.what}`
const smixzyQuotes = async (r: Route) => `${r.who}/${r.what}`

const paddingTop = reactive(0).map((n) => n.toString().concat("px"))
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
      nolanRefs,
      nolanQuotes,
      nm8Gist,
      nm8Gallery,
      nm8Refs,
      nm8Quotes,
      OeGist,
      OeGallery,
      OeRefs,
      OeQuotes,
      smixzyGist,
      smixzyGallery,
      smixzyRefs,
      smixzyQuotes
    },
    async (err) => ["div", {}, route.map((r) => `ERROR ${err}; ${r.who}/${r.what}`)]
  )
  // ["main", { style: { paddingTop } },
  //   $switch(
  //     route,
  //     (r) => `${r.who}${capitalize(r.what)}`,
  //     {
  //       nolanGist,
  //       nolanGallery,
  //       nolanRefs,
  //       nolanQuotes,
  //       nm8Gist,
  //       nm8Gallery,
  //       nm8Refs,
  //       nm8Quotes,
  //       OeGist,
  //       OeGallery,
  //       OeRefs,
  //       OeQuotes,
  //       smixzyGist,
  //       smixzyGallery,
  //       smixzyRefs,
  //       smixzyQuotes
  //     },
  //     async (err) => ["div", {}, route.map((r) => `ERROR ${err}; ${r.who}/${r.what}`)]
  //   )
  // ]
])

rdom.mount(body)

// TODO: window.resize listener
const el = document.getElementsByTagName("nav")[0]
paddingTop.next(el.clientHeight)
