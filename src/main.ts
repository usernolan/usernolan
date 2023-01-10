import "./style.css"
import type { ComponentLike } from "@thi.ng/rdom/api"
import { $compile } from "@thi.ng/rdom/compile"
import { $switch } from "@thi.ng/rdom/switch"
import { $replace } from "@thi.ng/rdom/replace"
import { reactive } from "@thi.ng/rstream/stream"
import { fromRAF } from "@thi.ng/rstream/raf"
import { CloseMode } from "@thi.ng/rstream/api"
import { sync } from "@thi.ng/rstream/sync"
import { take } from "@thi.ng/transducers/take"
import { repeatedly } from "@thi.ng/transducers/repeatedly"
import { choices } from "@thi.ng/transducers/choices"
import Shuffle from "shufflejs"
import { serialize } from "@thi.ng/hiccup"


/* NOTE: routing */

interface Route {
  who: string,
  what: string,
  id?: string
}

/* TODO: revisit, string literal type */
const whoAll = ["nolan", "nm8", "Oe", "smixzy"]
const whatAll = ["gist", "gallery", "reference"]

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
    who: arr[1] || whoAll[0], /* TODO: string literal types, validation */
    what: arr[2] || whatAll[0],
    id: arr[3]
  }
}

const route = reactive(routeFromHash(location.hash))

route.map((r) => document.body.className =
  r.id ?
    `${r.who} ${r.what} id ${r.id}` :
    `${r.who} ${r.what}`)


/* NOTE: scroll restoration special case */

/* TODO: find an alternative to doing this manually e.g. plain HTML and common
modules to avoid repeatedly loading rdom, etc. */
const scrollPositions: any = { nolan: 0, nm8: 0, Oe: 0, smixzy: 0 }

window.addEventListener("hashchange", (e) => {
  const old = routeFromHash(e.oldURL)
  const r = routeFromHash(e.newURL)

  if (old.what === "gallery" && !old.id)
    scrollPositions[old.who] = window.scrollY

  if (r.what === "gallery" && !r.id)
    setTimeout(() => window.scrollTo(0, scrollPositions[r.who] || 0))

  route.next(r)
})


/* NOTE: system mode detection */

const prefersDarkModeMatch = window.matchMedia("(prefers-color-scheme: dark)")
const prefersDarkMode = reactive(prefersDarkModeMatch.matches, { closeOut: CloseMode.NEVER })
prefersDarkModeMatch.addEventListener("change", (e) => {
  prefersDarkMode.next(e.matches)
})


/* NOTE: top-level nav component */

/* ALT: read each selection onchange rather than react to route */
const navComponent = (r: Route) => [
  "nav", {},
  ["__COMMENT__", "Ah! I'm glad you're here. If you're wondering what on earth is going on with this website, no you aren't, so am I, and you should wikipedia the Internal Family Systems Model. Lastly if you're like me, your keyboard should work approximately the way you want it to. Welcome!"],
  ["select.who",
    {
      onchange: (e: { target: HTMLSelectElement }) => {
        const v = e?.target?.value === "Oə" ? "Oe" : e?.target?.value
        location.hash = `#/${v || "nolan"}/${r.what || "gist"}`
        window.scrollTo(0, 0)
      }
    },
    ...whoAll.map((x) => ["option", { selected: r.who === x }, x === "Oe" ? "Oə" : x])
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


/* NOTE: gallery interfaces, data, state, components */

interface GalleryItem {
  id: string,
  src: string,
  alt: string,
  preview?: (r: Route, x: GalleryItem) => ComponentLike
  main?: (r: Route, x: GalleryItem, xs: GalleryItem[]) => ComponentLike
  aside?: (r: Route, x: GalleryItem, xs: GalleryItem[]) => ComponentLike
}

const atMain = (_r: Route, { id, src, alt }: GalleryItem): ComponentLike => {
  const hovered = reactive(false)
  const clicked = reactive(false)
  const state = sync({ src: { hovered, clicked } })
  return [
    "main", { id },
    $replace(state.map((x) =>
      x.hovered || x.clicked ?
        ["img", {
          src: "/gif/at.gif",
          alt,
          onclick: () => clicked.next(!x.clicked),
          onmouseleave: () => hovered.next(false)
        }] :
        ["img", {
          src,
          alt,
          onclick: () => clicked.next(!x.clicked),
          onmouseenter: () => hovered.next(true)
        }]
    ))
  ]
}

const DEFAULT_NUM_GALLERY_COLUMNS_INDEX = 1
const numGalleryColumnsAll = [2, 3, 5, 8]
const numGalleryColumnsIndex = reactive(DEFAULT_NUM_GALLERY_COLUMNS_INDEX, { closeOut: CloseMode.NEVER })
const galleryColumns = numGalleryColumnsIndex.map((i) => numGalleryColumnsAll[i], { closeOut: CloseMode.NEVER })
const filterValue = reactive(0, { closeOut: CloseMode.NEVER })

/* TODO: undefined checks */
/* TODO: debounce */
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
    ["div", { id: "zoom-controls", class: "zoom-controls" },
      ["button", { type: "button", title: "Zoom in.", onclick: decNumGalleryColumnsIndex }, "+"],
      ["button", { type: "button", title: "Zoom out.", onclick: incNumGalleryColumnsIndex }, "-"],
      ["label", { for: "zoom-controls" }, "zoom"],
    ],
    ["div.filter-controls", {},
      ["input#filter-range", {
        title: "Increase and decrease filter intensity.",
        type: "range", value: filterValue, min: "0", max: "100", step: "1",
        oninput: (e: { target: { value: number } }) => {
          filterValue.next(e.target.value)
        },
        onchange: (e: { target: { value: number } }) => {
          filterValue.next(e.target.value)
        }
      }],
      ["label", { for: "filter-range" }, "filter"]]
  ]
]

const defaultGalleryItemPreview = (r: Route, { id, src, alt }: GalleryItem) => [
  "div.gallery-item", { id },
  ["a", { href: `#/${r.who}/gallery/${id}` },
    ["img", { src, alt }]
  ]
]

const galleryItemPreview = (r: Route, x: GalleryItem) =>
  x.preview ?
    x.preview(r, x) :
    defaultGalleryItemPreview(r, x)

const galleryId = (r: Route, xs: GalleryItem[]) => {
  const x = xs.find((x) => x.id === r.id)! /* TODO: not found */
  return x.main ?
    x.main(r, x, xs) : [
      "main", { id: x.id },
      ["img", { src: x.src, alt: x.alt }]
    ]
}

const galleryIdAside = (r: Route, xs: GalleryItem[]) => {
  const i = xs.findIndex((x) => x.id === r.id)
  if (i < 0) return ["aside", {}] /* TODO: not found */

  const x = xs[i]
  if (x.aside) return x.aside(r, x, xs)

  const { alt } = xs[i]
  const max = xs.length - 1
  const prev = i === 0 ? max : i - 1
  const next = i === max ? 0 : i + 1

  return [
    "aside", {},
    ["nav", {},
      ["a", { href: `#/${r.who}/gallery/${xs[prev].id}` }, "< prev"],
      ["a", { href: `#/${r.who}/gallery` }, "gallery"],
      ["a", { href: `#/${r.who}/gallery/${xs[next].id}` }, "next >"]],
    ["p", {}, alt]
  ]
}

interface GalleryOpts {
  xs: GalleryItem[]
  filter: (v: number) => string,
}

const gallery = (r: Route, opts: GalleryOpts) => [
  "main", {},
  ["div.gallery-container",
    {
      "data-gallery-columns": galleryColumns,
      style: {
        filter: filterValue.map(opts.filter)
      }
    },
    ...opts.xs.map((i) => galleryItemPreview(r, i))
  ]
]


/* NOTE: primary components */

// const filter = (v: number) => `grayscale(${v}%)`
// const filter = (v: number) => `contrast(${100 + v * 0.5}%) saturate(${1 - v / 100})`
// const filter = (v: number) => `invert(${v}%)`
// const filter = (v: number) => `saturate(1.125) hue-rotate(${(v / 100) * 360}deg)`

// const allChars = ["°", ".", "·", ":", "*", " ", "?"]
// const weights = [0.143, 0.143, 0.143, 0.143, 0.143, 0.286, 0.0143]
// const takeChars = (n: number) => [...take(n, choices(allChars, weights))]
// const numChars = 9
// var OeChars = takeChars(numChars)

// ["h2", {}, $replace(fromRAF().map((t) => {
//   if (t % 12 === 0) OeChars = takeChars(numChars)
//   return OeChars.join("")
// }))],

// const offset = 300
// const period = 2 * Math.PI * 1200
// const rate = 333
// const rangePct = 300

// {
//   style: {
//     backgroundImage: fromRAF().map((t) => {
//       const x = Math.sin((t - offset) % period / rate) * rangePct
//       return prefersDarkMode.deref() ?
//         `radial-gradient(circle at ${x}% 50%, lightgreen, lightblue)` :
//         `radial-gradient(circle at ${x}% 50%, lightblue, #4200af)`
//     })
//   }
// }

interface Item {
  id: string,
  component: (x: this) => any
  groups?: string[],
}

interface ImageItem extends Item {
  src: string,
  alt: string
}

interface HoverableImageItem extends ImageItem {
  hoverSrc: string
}

interface QuoteItem extends Item {
  quote: string,
  author: string
}

interface LinkItem extends Item {
  href: string,
  destination: string,
  title: string,
  author?: string
}

const randNth = (arr: Array<any>) => arr[Math.floor(Math.random() * arr.length)]
const columnClasses = ["c1", "c2", "c3"]
const columnWeights = [0.66, 0.33, 0.11, 0.055, 0.0275, 0.0275, 0.01375, 0.01375, 0.0065375]
const aspectRatios = ["16 / 9", "3 / 2", "1 / 1", "4 / 3", "5 / 6", "3 / 4"]

// const exampleComponent = (x: Item) => {
//   const col = [...take(1, choices(columnClasses, columnWeights))][0]
//   const ar = [...take(1, choices(aspectRatios))][0]
//   const isImage = Math.random() >= 0.5
//   const isAspect = Math.random() >= 0.5
//   return [
//     "div.example",
//     {
//       id: `item--${x.id}`,
//       class: `item ${col}`,
//       style: {
//         "aspect-ratio": isAspect ? `${ar}` : "none",
//       },
//       "data-groups": JSON.stringify(["none"])
//     },
//     isImage ?
//       `${x.id} :: ${col} :: ${isAspect ? ar : "none"}` :
//       ["img",
//         {
//           src: randNth(srcs),
//           style: {
//             "object-fit": "cover",
//             width: "100%",
//             height: "100%",
//             // "object-position": "50% 10%"
//           }
//         }
//       ]
//   ]
// }

// const exampleItems = [
//   ...repeatedly((i) => (
//     {
//       id: `id${i}`,
//       component: exampleComponent
//     }
//   ), 20)
// ]

/* TODO: onclick toggle expand */
const imageComponent = (columnClass?: string) => ({ id, src, alt, groups }: ImageItem) => [
  "div",
  {
    id: `item--${id}`,
    class: `item image ${groups ? groups.join(" ") : ""} ${columnClass ? columnClass : randNth(columnClasses)}`,
    "data-groups": JSON.stringify(groups)
  },
  ["img", { src, alt }]
]

const quoteComponent = (columnClass?: string) => ({ id, quote, author, groups }: QuoteItem) => [
  "div",
  {
    id: `item--${id}`,
    class: `item quote ${groups ? groups.join(" ") : ""} ${columnClass ? columnClass : randNth(columnClasses)}`,
    "data-groups": JSON.stringify(groups)
  },
  ["h2", {}, quote],
  ["p", {}, `—${author}`]
]

const linkComponent = (columnClass?: string) => ({ id, href, destination, title, author, groups }: LinkItem) => [
  "div",
  {
    id: `item--${id}`,
    class: `item link ${groups ? groups.join(" ") : ""} ${columnClass ? columnClass : randNth(columnClasses)}`,
    "data-groups": JSON.stringify(groups)
  },
  ["a", { href },
    ["p", {}, destination],
    ["h2", {}, title],
    author ? ["p", {}, `—${author}`] : null
  ]
]

type I =
  Item
  | ImageItem
  | HoverableImageItem
  | QuoteItem
  | LinkItem

const items: Array<I> = [
  {
    id: "intro",
    groups: ["nolan", "gist"],
    component: ({ id, groups }: Item) => [
      "div",
      {
        id: `item--${id}`,
        class: "item gist c3", // TODO: add groups to class
        "data-groups": JSON.stringify(groups)
      },
      ["h1", {}, "I'm nolan."],
    ]
  },

  {
    id: "nm8",
    groups: ["nm8", "gist"],
    component: ({ id, groups }: Item) => [
      "div",
      {
        id: `item--${id}`,
        class: `item ${groups ? groups.join(" ") : ""} ${randNth(["c2", "c3"])}`,
        "data-groups": JSON.stringify(groups)
      },
      ["p", {}, "I build sketchy websites and primitive furniture. They're beautiful in the same way my sister's dog is beautiful. I promise they're beautiful."]
    ]
  },

  {
    id: "smixzy",
    groups: ["smixzy", "gist"],
    component: ({ id, groups }: Item) => [
      "div",
      {
        id: `item--${id}`,
        class: `item ${groups ? groups.join(" ") : ""} ${randNth(["c1", "c2", "c3"])}`,
        "data-groups": JSON.stringify(groups)
      },
      ["h3", {}, "I generate a lot of nonsense, acrylic, and handmade garbage. 🤢"]
    ]
  },

  {
    id: "arcane-mage",
    groups: ["smixzy", "gist"],
    component: ({ id, groups }: Item) => [
      "div",
      {
        id: `item--${id}`,
        class: `item ${groups ? groups.join(" ") : ""} ${randNth(["c1", "c2", "c3"])}`,
        "data-groups": JSON.stringify(groups)
      },
      ["p", {}, "Lv. 70 arcane mage"]
    ]
  },

  {
    id: ".•",
    groups: [".•", "gist"],
    component: ({ id, groups }: Item) => [
      "div",
      {
        id: `item--${id}`,
        class: `item gist Oe ${randNth(["c1", "c2", "c3"])}`,
        "data-groups": JSON.stringify(groups)
      },
      ["p", {}, "I think a lot about language, logic, proof, etc.: real game of life hours, you know the one."]
    ]
  },

  {
    id: "Oe",
    groups: [".•", "gist"],
    component: ({ id, groups }: Item) => [
      "div",
      {
        id: `item--${id}`,
        class: `item gist Oe ${randNth(["c2", "c3"])}`,
        "data-groups": JSON.stringify(groups)
      },
      ["p", {}, "observe ∘ explicate"]
    ]
  },

  {
    id: "blizzard",
    groups: ["quote"],
    quote: "Stay a while, and listen.",
    author: "Deckard Cain",
    component: quoteComponent()
  },

  {
    id: "nolan-self",
    groups: ["nolan", "image"],
    src: `/jpeg/nolan.self.${randNth([1, 2])}.jpeg`,
    alt: "Me in grayscale",
    component: imageComponent()
  },

  {
    id: "persevere",
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering.",
    component: imageComponent()
  },

  {
    id: "clouds",
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds and green foothills.",
    component: imageComponent()
  },

  {
    id: "parents",
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically.",
    component: imageComponent()
  },

  {
    id: "erica",
    src: "/jpeg/erica.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture.",
    component: imageComponent()
  },

  {
    id: "louie",
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention.",
    component: imageComponent()
  },

  {
    id: "petals",
    src: "/jpeg/petals.jpeg",
    alt: "Pink flower petals gravitating toward a concrete sidewalk.",
    component: imageComponent()
  },

  {
    id: "pauszeks",
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers.",
    component: imageComponent()
  },

  {
    id: "watching",
    src: "/jpeg/watching.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P.",
    component: imageComponent()
  },

  {
    id: "david",
    src: "/jpeg/david.jpeg",
    alt: "My sister's partner-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles.",
    component: imageComponent()
  },

  {
    id: "branch",
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely.",
    component: imageComponent()
  },

  {
    id: "eli",
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot.",
    component: imageComponent()
  },

  {
    id: "bridge",
    src: "/jpeg/bridge.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek.",
    component: imageComponent()
  },

  {
    id: "self",
    src: "/jpeg/nm8.self.jpeg",
    alt: "A robot with a 2x4 soul, visibly dissatisfied with its output.",
    component: imageComponent()
  },

  {
    id: "at",
    src: "/jpeg/at.jpeg",
    alt: "A three dimensional @ printed in white, black, and mint green PLA.",
    component: imageComponent()
  },

  {
    id: "table",
    src: "/jpeg/table.jpeg",
    alt: "A diagram of a table on graph paper.\nA potential table.",
    component: imageComponent()
  },

  {
    id: "skulls",
    src: "/jpeg/skulls.jpeg",
    alt: "Stackable cubic skulls printed in Martha Stewart®-brand PLA. The second greatest gift I've ever received: Martha's memento mori.",
    component: imageComponent()
  },

  {
    id: "xacto",
    src: "/jpeg/xacto.jpeg",
    alt: "An X-ACTO® knife. Fresh blade.",
    component: imageComponent()
  },

  {
    id: "buckets",
    src: "/jpeg/buckets.jpeg",
    alt: "Galvanized steel plumbing pipes and fittings sorted into orange buckets, brought to you by Home Depot®.",
    component: imageComponent()
  },

  {
    id: "warhammer",
    src: "/jpeg/warhammer.jpeg",
    alt: "Unpainted tabletop miniature. Sentient bipedal robot, specifically T'au.",
    component: imageComponent()
  },

  {
    id: "rug",
    src: "/jpeg/rug.jpeg",
    alt: "Green rug, white couch, wood table, gray blanket.",
    component: imageComponent()
  },

  {
    id: "takach",
    src: "/jpeg/takach.jpeg",
    alt: "Close-up of an etching press registration grid, brought to you by Takach Press®.",
    component: imageComponent()
  },

  {
    id: "print",
    src: "/jpeg/print.jpeg",
    alt: "A screen print hanging on the wall above a large manual screen printing press. Super meaningful to whoever took the picture, at least I get that sense.",
    component: imageComponent()
  },

  {
    id: "frame",
    src: "/jpeg/frame.jpeg",
    alt: "A rainbow-chromatic striped frame sample sitting on construction paper.",
    component: imageComponent()
  },

  {
    id: "screw",
    src: "/jpeg/screw.jpeg",
    alt: "A black ballpoint pen drawing on white graph paper. A vaguely humanoid assemblage of shapes with screw-like rod arms, a stacked box torso, smooth pipe legs, and a plastic floret head. It's worshipping a biblically accurate screw of enormous proportion. In this world, even the most basic fasteners are much larger than people.",
    component: imageComponent()
  },

  {
    id: "4-avenue",
    src: "/jpeg/4-avenue.jpeg",
    alt: "A blue Werner® ladder waiting for the subway at 4th Avenue.",
    component: imageComponent()
  },

  {
    id: "graphite",
    src: "/jpeg/graphite.jpeg",
    alt: "A rough graphite sketch of a detached plot of land floating in space, populated by tree-sized lollipops.",
    component: imageComponent()
  },

  {
    id: "frames",
    src: "/jpeg/frames.jpeg",
    alt: "A pile of candidate frame samples in front of an entire wall of more frame samples.",
    component: imageComponent()
  },

  {
    id: "pack",
    src: "/jpeg/pack.jpeg",
    alt: "A pristine dyneema fanny pack for use in the distant future when my current fanny pack falls irreparable.",
    component: imageComponent()
  },

  {
    id: "di",
    src: "/jpeg/di.jpeg",
    alt: "The greatest mother to have ever done it hauling her offspring's garbage through a hardware store.",
    component: imageComponent()
  },

  {
    id: "self",
    src: "/png/Oe.self.png",
    alt: "A selectively randomized, poorly pixelized sapiens approximate peeking out of a previously sealed box.",
    component: imageComponent()
  },

  {
    id: "scad",
    src: "/png/scad.png",
    alt: "A 3D CAD workspace populated with a repeating sinusoidal wave colorized according to coordinate.",
    component: imageComponent()
  },

  {
    id: "170",
    src: "/png/rule.170.png",
    alt: "Rule 170: 1D cellular automaton with range = 1, where cells are shaped like keyholes, but I think it's bugged. If you stare long enough it looks like a waterfall and starts to move.",
    component: imageComponent()
  },

  {
    id: "era",
    src: "/png/rule.era.png",
    alt: "Imperfectly pixelated flowers falling out of high-contrast background noise.",
    component: imageComponent()
  },

  {
    id: "green",
    src: "/png/rule.green.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; energetic green background.",
    component: imageComponent()
  },

  {
    id: "pink",
    src: "/png/rule.pink.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; pale-hot pink background.",
    component: imageComponent()
  },

  {
    id: "blue",
    src: "/png/rule.blue.png",
    alt: "I think this is a poor approximation of rule 99; ultra blue background.",
    component: imageComponent()
  },

  {
    id: "stairs",
    src: "/png/rule.stairs.png",
    alt: "Two bright perfectoids conversing in a noisy universe.",
    component: imageComponent()
  },

  {
    id: "150",
    src: "/png/rule.150.png",
    alt: "Rule 150, I think.",
    component: imageComponent()
  },

  {
    id: "sidewalk",
    src: "/jpeg/sidewalk.jpeg",
    alt: "Construction-filtered sunlight projecting a binary pattern on the sidewalk.",
    component: imageComponent()
  },

  {
    id: "spill",
    src: "/jpeg/spill.jpeg",
    alt: "The softest, most gorgeous spill you've ever faced.",
    component: imageComponent()
  },

  {
    id: "stained",
    src: "/jpeg/stained.jpg",
    alt: "Neon-stained sandstone.",
    component: imageComponent()
  },

  {
    id: "martini",
    src: "/jpeg/martini.jpeg",
    alt: "A martini efficiently brokering photons.",
    component: imageComponent()
  },

  {
    id: "midway",
    src: "/jpeg/midway.jpeg",
    alt: "The ultraheterochromatic hallway of Midway International Airport.",
    component: imageComponent()
  },

  {
    id: "truck",
    src: "/jpeg/truck.jpeg",
    alt: "A yellow haul truck on the beach.",
    component: imageComponent()
  },

  {
    id: "cups",
    src: "/jpeg/turrell.cups.jpeg",
    alt: "Two big gulps discussing Twilight Epiphany.",
    component: imageComponent()
  },

  {
    id: "epiphany",
    src: "/jpeg/turrell.pink.jpeg",
    alt: "Pink angles.",
    component: imageComponent()
  },

  {
    id: "universal-rectifier",
    src: "/jpeg/universal-rectifier.jpeg",
    alt: "A Universal Rectifiers, Inc.® Cathodic Protection Rectifier. A Hometown American Product.",
    component: imageComponent()
  },

  {
    id: "observation",
    src: "/jpeg/turrell.self.jpeg",
    alt: "Metaobservation to positive consequent.",
    component: imageComponent()
  },

  {
    id: "self",
    src: "/jpeg/smixzy.self.jpeg",
    alt: "Still me, but in my favorite clothes.",
    component: imageComponent()
  },

  {
    id: "concrete",
    src: "/jpeg/concrete.jpeg",
    alt: "Soft concrete.",
    component: imageComponent()
  },

  {
    id: "ass",
    src: "/jpeg/ass-drag.jpeg",
    alt: "A purple Post-it® with 'ASS DRAG' written on it in caps lock. There's so much more where this came from.",
    component: imageComponent()
  },

  {
    id: "send-nudes",
    src: "/jpeg/send-nudes.jpeg",
    alt: "A quintessential United States Postal Service® mailbox with 'SEND NUDES' painted on the side, right above the logo.",
    component: imageComponent()
  },

  {
    id: "instaworthy",
    src: "/jpeg/instaworthy.jpeg",
    alt: "An Instagram®-worthy bedside table with 'SHIT IN MY MOUTH' lovingly expressed on the signboard.",
    component: imageComponent()
  },

  {
    id: "fnd-ur-way",
    src: "/jpeg/fnd-ur-way.jpeg",
    alt: "A hand-drawn sticker on a road sign that says 'FND UR WAY' under a skull with a staircase leading into the brain compartment.",
    component: imageComponent()
  },

  {
    id: "face",
    src: "/jpeg/face.preview.jpeg",
    alt: "The word 'FACE' permanently etched into a concrete sidewalk.",
    component: imageComponent()
  },

  {
    id: "sunglasses",
    src: "/jpeg/sunglasses.jpeg",
    alt: "The sidewalk shadows of two people holding heart-shaped sunglasses up to sunlight.",
    component: imageComponent()
  },

  {
    id: "intersection",
    src: "/jpeg/intersection.jpeg",
    alt: "Shoegazing at an intersection in the sidewalk.",
    component: imageComponent()
  },

  {
    id: "theme-provider",
    src: "/jpeg/theme-provider.jpeg",
    alt: "4 partially overlapping, heavily backlit bright pink Post-it® notes.",
    component: imageComponent()
  },

  {
    id: "dumpstergram",
    src: "/jpeg/dumpstergram.jpeg",
    alt: "Two dumpsters in the middle of the woods. Unparalleled vibe.",
    component: imageComponent()
  },

  {
    id: "post-it",
    src: "/jpeg/post-it.jpeg",
    alt: "A closeup of Post-it® notes with more Post-it® notes in the background; not to brag but it's a fresh cabinet pack of Helsinki-themed Greener Notes.",
    component: imageComponent()
  },

  {
    id: "sky",
    src: "/jpeg/sky.jpeg",
    alt: "Purple night clouds hushing a busy street.",
    component: imageComponent()
  },

  {
    id: "twig",
    src: "/jpeg/twig.jpeg",
    alt: "Closeup of a twig.",
    component: imageComponent()
  },

  {
    id: "thrift",
    src: "/jpeg/thrift.jpeg",
    alt: "Maximum thrift store saturation.",
    component: imageComponent()
  },

  {
    id: "manifold",
    src: "/jpeg/manifold.jpeg",
    alt: "Sketched amorphous manifold of blue, pink, and green ink.",
    component: imageComponent()
  },

  {
    id: "coral",
    src: "/jpeg/coral.jpeg",
    alt: "Scattered ink-encoded coral.",
    component: imageComponent()
  },

  {
    id: "chalk",
    src: "/jpeg/chalk.preview.jpeg",
    alt: "Sidewalk chalk portal to outer space.",
    component: imageComponent()
  },

  {
    id: "spray-paint",
    src: "/jpeg/spray-paint.jpeg",
    alt: "Spray paint blasted onto the sidewalk during construction.",
    component: imageComponent()
  },

  {
    id: "monolith",
    src: "/jpeg/monolith.jpeg",
    alt: "A strangely oriented concrete monolith opimitzed for resting up to four asscheeks.",
    component: imageComponent()
  },

  {
    id: "cable",
    src: "/jpeg/cable.jpeg",
    alt: "A classic mixup between the street lighting and television cable factions.",
    component: imageComponent()
  },

  {
    id: "prof-hos",
    src: "/jpeg/mark.jpeg",
    alt: "Prof. Hos.!!!",
    component: imageComponent()
  },

  {
    id: "claude",
    quote: "My greatest concern was what to call it.",
    author: "Claude Shannon",
    component: quoteComponent()
  },

  {
    id: "rich",
    quote: "We don't get to stop the world, especially not to observe it.",
    author: "Rich Hickey",
    component: quoteComponent()
  },

  {
    id: "logistic-map",
    quote: "Unpredictability is not randomness, but in some circumstances looks very much like it.",
    author: "Wikipedia; Logistic Map",
    component: quoteComponent()
  },

  {
    id: "anw-1",
    quote: "One main factor in the upward trend of animal life has been the power of wandering.",
    author: "Alfred North Whitehead",
    component: quoteComponent()
  },

  {
    id: "anw-2",
    quote: "Unlimited possibility and abstract creativity can procure nothing.",
    author: "Alfred North Whitehead",
    component: quoteComponent()
  },

  {
    id: "anw-3",
    quote: "A science that hesitates to forget its founders is lost.",
    author: "Alfred North Whitehead",
    component: quoteComponent()
  },

  {
    id: "anw-4",
    quote: "We think in generalities, but we live in details.",
    author: "Alfred North Whitehead",
    component: quoteComponent()
  },

  {
    id: "fifield",
    quote: "Answer is the dead stop.",
    author: "William Fifield",
    component: quoteComponent()
  },

  {
    id: "chris-a",
    quote: "The wholeness is made of parts, the parts are created by the wholeness.",
    author: "Christopher Alexander",
    component: quoteComponent()
  },

  {
    id: "rs",
    quote: "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it.",
    author: "R.S.",
    component: quoteComponent()
  },

  {
    id: "chapman",
    quote: "There can be no fixed method for this; it’s inherently improvisational.",
    author: "David Chapman",
    component: quoteComponent()
  },

  {
    id: "the-mess-were-in",
    href: "https://youtu.be/lKXe3HUG2l4",
    destination: "youtube",
    title: "The Mess We're In",
    author: "Joe Armstrong",
    component: linkComponent()
  },

  {
    id: "how-to-sweep",
    href: "https://youtu.be/Kt-VlZpz-8E",
    destination: "youtube",
    title: "How to Sweep.",
    author: "Tom Sachs",
    component: linkComponent()
  },

  {
    id: "cool-uris",
    href: "https://www.w3.org/Provider/Style/URI",
    destination: "w3.org",
    title: "Cool URIs don't change.",
    author: "Tim BL",
    component: linkComponent()
  },

  {
    id: "the-language-of-the-system",
    href: "https://youtu.be/ROor6_NGIWU",
    destination: "youtube",
    title: "The Language of the System",
    author: "Rich Hickey",
    component: linkComponent()
  },

  {
    id: "the-value-of-values",
    href: "https://youtu.be/-6BsiVyC1kM",
    destination: "youtube",
    title: "The Value of Values",
    author: "Rich Hickey",
    component: linkComponent()
  },

  {
    id: "just-hard-fail-it",
    href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/",
    destination: "usenix",
    title: "Just hard-fail it.",
    author: "James Hamilton",
    component: linkComponent()
  },

  {
    id: "thi-ng",
    href: "https://thi.ng/",
    destination: "thi.ng",
    title: "thi.ng",
    author: "Karsten Schmidt",
    component: linkComponent()
  },

  {
    id: "worse-is-better",
    href: "https://www.dreamsongs.com/RiseOfWorseIsBetter.html",
    destination: "website",
    title: "Worse is Better",
    author: "Richard Gabriel",
    component: linkComponent()
  },

  {
    id: "quine",
    quote: "Everything worth saying, and everything else as well, can be said with two characters.",
    author: "Quine",
    component: quoteComponent()
  },

  {
    id: "mereology",
    href: "https://en.wikipedia.org/wiki/Mereology",
    destination: "wikipedia",
    title: ".Mereology",
    groups: ["Oe"],
    component: linkComponent()
  },

  {
    id: "sequent-calculus",
    href: "https://en.wikipedia.org/wiki/Sequent_calculus",
    destination: "wikipedia",
    title: ".Sequent Calculus",
    groups: ["Oe"],
    component: linkComponent()
  },

  {
    id: "algebraic-structure",
    href: "https://en.wikipedia.org/wiki/Algebraic_structure",
    destination: "wikipedia",
    title: ".Algebraic Structure",
    groups: ["Oe"],
    component: linkComponent()
  },

  {
    id: "schismogenesis",
    href: "https://en.wikipedia.org/wiki/Schismogenesis",
    destination: "wikipedia",
    title: ".Schismogenesis",
    groups: ["Oe"],
    // columns: ["c2", "c3"],
    component: linkComponent()
  },

  {
    id: "information",
    href: "https://en.wikipedia.org/wiki/Information_theory",
    destination: "wikipedia",
    title: ".Information",
    groups: ["Oe"],
    component: linkComponent()
  },

  {
    id: "process",
    href: "https://en.wikipedia.org/wiki/Process_philosophy",
    destination: "wikipedia",
    title: ".Process",
    groups: ["Oe"],
    component: linkComponent()
  },

  {
    id: "bohm",
    href: "https://en.wikipedia.org/wiki/David_Bohm",
    destination: "wikipedia",
    title: ".Bohm",
    groups: ["Oe"],
    component: linkComponent()
  },

  {
    id: "mark",
    href: "https://sugarboypress.com/",
    destination: "website",
    title: ".• Mark Hosford",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "ashlin",
    href: "https://ashlindolanstudio.com/Home-II",
    destination: "website",
    title: ".• Ashlin Dolan",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "tom",
    href: "https://www.tomsachs.com/",
    destination: "website",
    title: ".• Tom Sachs",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "hilma",
    href: "https://en.wikipedia.org/wiki/Hilma_af_Klint",
    destination: "wikipedia",
    title: ".• Hilma af Klint",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "kandinsky",
    href: "https://en.wikipedia.org/wiki/Wassily_Kandinsky",
    destination: "wikipedia",
    title: ".• Kandinsky",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "toxi",
    href: "https://mastodon.thi.ng/@toxi",
    destination: "mastodon",
    title: ".• Karsten Schmidt",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "terry-a-davis",
    href: "https://youtu.be/XkXPqvWJHg4",
    destination: "youtube",
    title: ".• Terry A. Davis",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "moebius",
    href: "https://www.moebius.fr/Les-Collections.html",
    destination: "website",
    title: ".• Moebius",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "ulises-farinas",
    href: "https://ulisesfarinas.com/",
    destination: "website",
    title: ".• Ulises Fariñas",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "john-vermilyea",
    href: "http://www.jonvermilyea.com/",
    destination: "website",
    title: ".• Jon Vermilyea",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "anders-nilsen",
    href: "https://www.andersbrekhusnilsen.com/booksandcomics",
    destination: "website",
    title: ".• Anders Nilsen",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "jesse-jacobs",
    href: "https://www.jessejacobsart.com/",
    destination: "website",
    title: ".• Jesse Jacobs",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "james-paterson",
    href: "https://www.instagram.com/presstube/",
    destination: "instagram",
    title: ".• James Paterson",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "steve-axford",
    href: "https://steveaxford.smugmug.com/",
    destination: "smugmug",
    title: ".• Steve Axford",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "minjeong-an",
    href: "http://www.myartda.com/",
    destination: "website",
    title: ".• Minjeong An",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "devine-lu-linvega",
    href: "https://wiki.xxiivv.com/site/dinaisth.html",
    destination: "website",
    title: ".• Devine Lu Linvega",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "cakebread",
    href: "http://www.quantumrain.com/",
    destination: "website",
    title: ".• Stephen Cakebread",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "webring",
    href: "https://webring.xxiivv.com/",
    destination: "website",
    title: "{ webring }",
    groups: ["smixzy", "artist", "link"],
    component: linkComponent()
  },

  {
    id: "2bfc-1",
    quote: "You play through that.",
    author: "2BFC",
    component: quoteComponent()
  },
]

const controls = () => [
  "div.controls", {},
  ["fieldset.filters", {},
    ["legend", {}, "filters"],

    ["fieldset.search", {},
      ["legend", {}, "search"],
      ["input", { type: "search" }]
    ],

    ["fieldset.tag", {},
      ["legend", {}, "tag"],
      ["div", {},
        ["label", { for: "filter--tag--nolan" }, "nolan"],
        ["input#filter--tag--nolan", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--tag--nm8" }, "nm8"],
        ["input#filter--tag--nm8", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--tag--smixzy" }, "smixzy"],
        ["input#filter--tag--smixzy", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--tag--Oe" }, ".•"],
        ["input#filter--tag--Oe", { type: "checkbox" }]
      ]
    ],

    ["fieldset.type", {},
      ["legend", {}, "type"],
      ["div", {},
        ["label", { for: "filter--type--gist" }, "gist"],
        ["input#filter--type--gist", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--type--image" }, "image"],
        ["input#filter--type--image", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--type--link" }, "link"],
        ["input#filter--type--link", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--type--quote" }, "quote"],
        ["input#filter--type--quote", { type: "checkbox" }]],
      ["div", {},
        ["label", { for: "filter--type--artist" }, "artist"],
        ["input#filter--type--artist", { type: "checkbox" }]
      ]
    ]
  ],

  ["fieldset.mode", {},
    ["legend", {}, "mode"],
    ["div", {},
      ["label", { for: "mode--system" }, "system"],
      ["input#mode--system", { type: "radio", name: "mode" }]],
    ["div", {},
      ["label", { for: "mode--light" }, "light"],
      ["input#mode--light", { type: "radio", name: "mode" }]],
    ["div", {},
      ["label", { for: "mode--dark" }, "dark"],
      ["input#mode--dark", { type: "radio", name: "mode" }]
    ]
  ],

  ["fieldset.color", {},
    ["legend", {}, "color"],
    ["div", {},
      ["label", { for: "color--contrast" }, "contrast"],
      ["input#color--contrast", { type: "range" }]],
    ["div", {},
      ["label", { for: "color--saturation" }, "saturation"],
      ["input#color--saturation", { type: "range" }]],
    ["div", {},
      ["label", { for: "color--hue" }, "hue"],
      ["input#color--hue", { type: "range" }]],
    ["div", {},
      ["label", { for: "color--invert" }, "invert"],
      ["input#color--invert", { type: "range" }]
    ]
  ],

  ["fieldset.layout", {},
    ["legend", {}, "layout"],
    ["button", {}, "randomize"]
  ],

  // TODO: sort
]

const shuffleArray = (arr: Array<any>) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr
}

const root = [
  "div.body", {},
  ["main", { class: "grid-container", "data-grid-columns": "9" },
    ...shuffleArray(items.slice(0)).map((x) => x.component(x as any)),
    ["div.sizer.c1", {}]
  ],
  ["aside", {},
    ["button.show", {}, "+"],
    controls()
  ]
]

const rdom = $compile(root)
await rdom.mount(document.body)


/* NOTE: lib */
/* TODO: noscript */

const shuffle = new Shuffle(
  document.querySelector(".grid-container")!,
  {
    itemSelector: '.item',
    sizer: '.sizer'
    // group: "intro"
  }
)

const tags = ["nolan"]
const types = ["gist"]
const groups = ["nolan", "gist"]

const afilter: boolean = (el: HTMLElement) => {
  const attr = el.getAttribute("data-groups") || "[]"
  const groups = JSON.parse(attr) as string[]
  return (tags.length === 0 || tags.some((t) => groups.find((x) => x === t)))
    && (types.length === 0 || types.some((t) => groups.find((x) => x === t)))
}

// shuffle.filter("intro")

const grid = document.querySelector(".grid-container")
const aside = document.querySelector("aside")

document.querySelector("button.show")?.addEventListener("click", () => {
  aside?.classList.toggle("show")
  const next = grid?.getAttribute("data-grid-columns") === "9" ? "7" : "9"
  grid?.setAttribute("data-grid-columns", next)
})

document.querySelectorAll("fieldset").forEach((el) =>
  el.addEventListener("change", console.log))
