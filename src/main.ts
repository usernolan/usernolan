import "./style.css"
import type { ComponentLike } from "@thi.ng/rdom/api"
import { $compile } from "@thi.ng/rdom/compile"
import { $switch } from "@thi.ng/rdom/switch"
import { $replace } from "@thi.ng/rdom/replace"
import { reactive, stream } from "@thi.ng/rstream/stream"
import { fromRAF } from "@thi.ng/rstream/raf"
import { fromDOMEvent } from "@thi.ng/rstream/event"
import { CloseMode } from "@thi.ng/rstream/api"
import { sync } from "@thi.ng/rstream/sync"
import { tweenNumber } from "@thi.ng/rstream/tween"
import { map } from "@thi.ng/transducers/map"
import { transduce } from "@thi.ng/transducers/transduce"
import { push } from "@thi.ng/transducers/push"
import { take } from "@thi.ng/transducers/take"
import { choices } from "@thi.ng/transducers/choices"
import { range } from "@thi.ng/transducers/range"

interface Route {
  who: string,
  what: string,
  id?: string
}

/* TODO: revisit, string literal type */
/* TODO: keybinds for nav; {shift, alt} {arrows, hjkl}, "next" vs. "down", "deeper" */
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

/* TODO: find an alternative to doing this manually e.g. plain HTML and common
modules to avoid repeatedly loading rdom, etc. */
const scrollPositions = { nolan: 0, nm8: 0, Oe: 0, smixzy: 0 }

window.addEventListener("hashchange", (e) => {
  const old = routeFromHash(e.oldURL)
  const r = routeFromHash(e.newURL)

  if (old.what === "gallery" && !old.id)
    scrollPositions[old.who] = window.scrollY

  if (r.what === "gallery" && !r.id)
    setTimeout(() => window.scrollTo(0, scrollPositions[r.who] || 0))

  route.next(r)
})

const prefersDarkModeMatch = window.matchMedia("(prefers-color-scheme: dark)")
const prefersDarkMode = reactive(prefersDarkModeMatch.matches, { closeOut: CloseMode.NEVER })
prefersDarkModeMatch.addEventListener("change", (e) => {
  prefersDarkMode.next(e.matches)
})

route.map((r) => document.body.className =
  r.id ?
    `${r.who} ${r.what} id ${r.id}` :
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

/* TODO: load/persist relevant state to localstorage */
const DEFAULT_NUM_GALLERY_COLUMNS_INDEX = 1
const numGalleryColumnsAll = [/*1,*/ 2, 3, 5, 8]
const numGalleryColumnsIndex = reactive(DEFAULT_NUM_GALLERY_COLUMNS_INDEX, { closeOut: CloseMode.NEVER })
const galleryColumns = numGalleryColumnsIndex.map((i) => numGalleryColumnsAll[i], { closeOut: CloseMode.NEVER })
/* TODO: review CloseMode */

interface GalleryItem {
  id: string,
  src?: string,
  alt?: string,
  href?: string,
  style?: object, /* TODO: take style attribs type from rdom/hiccup */
  preview?: (i: GalleryItem) => ComponentLike
  main?: (i: GalleryItem) => ComponentLike
  aside?: (i: GalleryItem) => ComponentLike
}

const nolanGalleryItems: GalleryItem[] = [

  {
    id: "self",
    src: "/jpeg/nolan.self.jpeg",
    alt: "Me in grayscale.",
    style: { "object-position": "15% 0" }
  },

  {
    id: "persevere",
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering.",
  },

  {
    id: "clouds",
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds over lush foothills.",
  },

  {
    id: "parents",
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically.",
  },

  {
    id: "erica",
    src: "/jpeg/erica.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture.",
    style: { "object-position": "0 30%" }
  },

  {
    id: "louie",
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention.",
    style: { "object-position": "0 30%" }
  },

  {
    id: "petals",
    src: "/jpeg/petals.jpeg",
    alt: "Pale pink flower petals gathering near a concrete sidewalk.",
  },

  {
    id: "pauszeks",
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers.",
  },

  {
    id: "watching",
    src: "/jpeg/watching.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P.",
  },

  {
    id: "david",
    src: "/jpeg/david.jpeg",
    alt: "My sister's boyfriend-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles.",
  },

  {
    id: "branch",
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely.",
  },

  {
    id: "eli",
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot.",
  },

  {
    id: "bridge",
    src: "/jpeg/bridge.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek.",
  }

  // {
  //   id: "beach",
  //   src: "/jpeg/beach.jpeg",
  //   alt: "A secluded and rocky beach where I had been resting my eyes until immediately before becoming the bewildered subject of this photograph.",
  // },

]

const atDotMain = ({ src, alt }: GalleryItem): ComponentLike => {
  const hovered = reactive(false)
  const clicked = reactive(false)
  const state = sync({ src: { hovered, clicked } })
  return [
    "main", {},
    $replace(state.map((x) =>
      x.hovered || x.clicked ?
        ["img", {
          src: "/gif/at-dot.gif",
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
    )),
  ]
}

/* TODO: lollipop on wood */
/* TODO: rearrange, cluster, add furniture, cluster drawings, etc., organize by 3s */
const nm8GalleryItems: GalleryItem[] = [

  {
    id: "self",
    src: "/jpeg/nm8.self.jpeg",
    alt: "A robot with a 2x4 soul, visibly dissatisfied with its output.",
    style: { "object-position": "0 56%" }
  },

  /* TODO: at-dot gif */
  {
    id: "at-dot",
    src: "/jpeg/at-dot.jpeg",
    alt: "A three dimensional @ printed in white, black, and mint green PLA.",
    main: atDotMain
  },

  {
    id: "table",
    src: "/jpeg/table.jpeg",
    alt: "A diagram of a table on graph paper.\nA potential table."
  },

  {
    id: "couch",
    src: "/jpeg/couch.jpeg",
    alt: "The smallest but cleanest living room you've ever been in; cloudy day."
  },

  {
    id: "skulls",
    src: "/jpeg/skulls.jpeg",
    alt: "Stackable cubic skulls printed in Martha Stewart®-themed PLA. The second greatest gift I've ever received: Memento mori d'Martha."
  },

  {
    id: "xacto",
    src: "/jpeg/xacto.jpeg",
    alt: "An X-ACTO® knife. Fresh blade."
  },

  {
    id: "buckets",
    src: "/jpeg/buckets.jpeg",
    alt: "Galvanized steel plumbing pipes and couplings sorted into resoundingly orange buckets, brought to you by Home Depot®."
  },

  {
    id: "warhammer",
    src: "/jpeg/warhammer.jpeg",
    alt: "Unpainted tabletop miniature. Sentient bipedal robot vibe, specifically T'au.",
    style: { "object-position": "72.5%" }
  },

  {
    id: "rug",
    src: "/jpeg/rug.jpeg",
    alt: "Green rug, white couch, wooden table, gray blanket. But I'm not a rapper."
  },

  {
    id: "takach",
    src: "/jpeg/takach.jpeg",
    alt: "Close-up of an etching press registration grid, brought to you by Takach Press®."
  },

  {
    id: "print",
    src: "/jpeg/print.jpeg",
    alt: "A screen print hanging on the wall above a large manual screen printing press. There is a lot of meaning here to whoever took the picture, at least I get that sense. Who can be sure, really?"
  },

  {
    id: "frame",
    src: "/jpeg/frame.jpeg",
    alt: "A fearlessly rainbow-striped frame sample sitting on immaculate construction paper."
  },

  {
    id: "screw",
    src: "/jpeg/screw.jpeg",
    alt: "A black ballpoint pen drawing on white graph paper. It looks like a vaguely humanoid assemblage of shapes with screw-like rods for arms, stacked boxes for a torso, smooth pipe legs, and a plastic floret head. It's staring at a biblically accurate screw. In this world, even the most basic fasteners are much larger than people."
  },

  {
    id: "4-avenue",
    src: "/jpeg/4-avenue.jpeg",
    alt: "A gorgeous blue Werner® ladder waiting for the subway at 4th Avenue.",
    style: { "object-position": "0 0" }
  },

  {
    id: "graphite",
    src: "/jpeg/graphite.jpeg",
    alt: "A rough graphite sketch of a detached plot of land floating in space populated by tree-sized lollipops.",
    style: { "object-position": "0 0" }
  },

  {
    id: "frames",
    src: "/jpeg/frames.jpeg",
    alt: "A pile of candidate frame samples in front of an entire wall of more frame samples.",
    style: { "object-position": "100% 50%" }
  },

  {
    id: "pack",
    src: "/jpeg/pack.jpeg",
    alt: "A pristine dyneema fanny pack for use in the distant future, when my current fanny pack of a similar varietal falls irreparable."
  },

  {
    id: "tom",
    src: "/jpeg/tom.jpeg",
    alt: "Tom Sachs yawning on a tour of the Budweiser® factory."
  },

  {
    id: "dinm8",
    src: "/jpeg/dinm8.jpeg",
    alt: "The greatest mother to have ever lived hauling her son's garbage through a hardware store, smiling.",
    style: { "object-position": "50% 33.33%" }
  }

]

const lemniscatePoint = (t: number) => {
  const a = 0.5
  const sin_t = Math.sin(t)
  const cos_t = Math.cos(t)
  const sin_t2 = sin_t * sin_t
  const x = (a * cos_t) / (sin_t2 + 1)
  const y = (a * sin_t * cos_t) / (sin_t2 + 1)
  return [x, y]
}
/* TODO: compute perimeter length approximation */

const lemniscatePoints = transduce(map(lemniscatePoint), push(), range(0, Math.PI * 2 + 0.1, 0.1))
const strokeDashOffset = reactive(0, { closeOut: CloseMode.NEVER })

/* TODO: refine sizing, rounding, tween; css */
const lemniscateSvg = () => [
  "svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 2.5 2.5",
    style: {
      "pointer-events": "none",
      transition: "stroke-dashoffset 80ms ease",
      height: "100%",
      width: "100%"
    }
  },
  ["g",
    {
      fill: "transparent",
      stroke: prefersDarkMode.map((x) => x ? "black" : "white"),
      "stroke-width": "0.0125px",
      "stroke-linecap": "round"
    },
    ["polyline", {
      points: lemniscatePoints,
      transform: "translate(1.25 1.25)",
      style: {
        "stroke-dasharray": "1.311 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311",
        "stroke-dashoffset": tweenNumber(strokeDashOffset, 0, 0.05)
      }
    }]
  ]
]

const lemniscatePreview = (): ComponentLike => {
  const toggle = () => strokeDashOffset.next(strokeDashOffset.deref() === 0 ? 1.311 : 0)
  return [
    "div.gallery-item", {
      /* TODO: onmousemove, map x,y into (-1.311, 1.311) */
      /* TODO: onclick */
      /* TODO: invert/"show" on hover */
      onmouseenter: toggle,
      onmouseout: toggle
    },
    lemniscateSvg()
  ]
}

const OeGalleryItems: GalleryItem[] = [

  {
    id: "self",
    preview: () => [
      "div.gallery-item", {},
      ["div", { style: { width: "100%", "aspect-ratio": "1 / 1" } }]
    ]
  },

  /* TODO: interactive, dark mode, id page */
  {
    id: "inf",
    preview: lemniscatePreview
  },

  {
    id: "self",
    preview: () => [
      "div.gallery-item", {},
      ["div", { style: { width: "100%", "aspect-ratio": "1 / 1" } }]
    ]
  },

  // /* TODO: change inversion, match lemniscate */
  // {
  //   id: "orbs",
  //   src: "/jpeg/orbs.jpeg",
  //   alt: ""
  // },

  {
    id: "scad",
    src: "/png/scad.png",
    alt: "A 3D modeling workspace populated with a repeating sinusoidal wave pattern colorized according to coordinate."
  },

  {
    id: "guy",
    src: "/jpeg/abstract-guy.jpeg",
    alt: ""
  },

  {
    id: "era",
    src: "/png/era.png",
    alt: "A black and white digital image of what looks like imperfectly pixelated flowers falling out of a pattern of random background noise."
  },

  {
    id: "green",
    src: "/jpeg/abstract-green.jpeg",
    alt: ".. *°* _"
  },

  {
    id: "pink",
    src: "/jpeg/abstract-pink.jpeg",
    alt: ""
  },

  /* TODO: rename jpeg, add rules to id page */
  /* TODO: png? higher quality */
  {
    id: "rule.blue",
    src: "/jpeg/abstract-blue-rule.jpeg",
    alt: "*.·-_ ?"
  },

  {
    id: "abstract-stairs",
    src: "/png/abstract-stairs.png",
    alt: ""
  },

  {
    id: "abstract-white-rule",
    src: "/jpeg/abstract-white-rule.jpeg",
    alt: ""
  },

  // {
  //   id: "in-the-flowers",
  //   src: "/jpeg/in-the-flowers.jpeg",
  //   alt: ""
  // },

  {
    id: "n",
    src: "/png/n.png",
    alt: ""
  },

  {
    id: "u",
    src: "/png/u.png",
    alt: ""
  },

  {
    id: "sidewalk",
    src: "/jpeg/sidewalk.jpeg",
    alt: ""
  },

  {
    id: "closet",
    src: "/jpeg/closet.jpeg",
    alt: ""
  },

  {
    id: "stained-glass",
    src: "/jpeg/stained-glass.jpeg",
    alt: ""
  },

  {
    id: "martini",
    src: "/jpeg/martini.jpeg",
    alt: "That's a martini."
  },

  {
    id: "midway",
    src: "/jpeg/midway.jpeg",
    alt: ""
  },

  {
    id: "truck",
    src: "/jpeg/truck.jpeg",
    alt: ""
  },

  {
    id: "rice",
    src: "/jpeg/rice.jpeg",
    alt: ""
  },

  {
    id: "rice-pink",
    src: "/jpeg/rice-pink.jpeg",
    alt: ""
  },

  {
    id: "universal-rect",
    src: "/jpeg/universal-rect.jpeg",
    alt: ""
  },

  // {
  //   id: "color-creek",
  //   src: "/jpeg/color-creek.jpeg",
  //   alt: ""
  // },

  {
    id: "rice-self",
    src: "/jpeg/rice-self.jpeg",
    alt: ""
  },

  // /* TODO: change inversion, match lemniscate */
  // {
  //   id: "orbs",
  //   src: "/jpeg/orbs.jpeg",
  //   alt: ""
  // },

]

const smixzyGalleryItems: GalleryItem[] = [

  {
    id: "self",
    src: "/jpeg/smixzy.self.jpeg",
    alt: "",
    style: {
      "object-position": "0 33%",
      "border-radius": "50%"
    }
  },

  {
    id: "ass-drag",
    src: "/jpeg/ass-drag.jpeg",
    alt: ""
  },

  {
    id: "send-nudes",
    src: "/jpeg/send-nudes.jpeg",
    alt: ""
  },

  {
    id: "shit-in-my-mouth",
    src: "/jpeg/shit-in-my-mouth.jpeg",
    alt: ""
  },

  {
    id: "fnd-ur-way",
    src: "/jpeg/fnd-ur-way.jpeg",
    alt: ""
  },

  {
    id: "evolve-now",
    src: "/jpeg/evolve-now.jpeg",
    alt: ""
  },

  /* TODO: use face.jpeg for id */
  {
    id: "face",
    src: "/jpeg/face.2.jpeg",
    alt: ""
    // style: { "object-position": "100% 0" }
  },

  {
    id: "sunglass-love",
    src: "/jpeg/sunglass-love.jpeg",
    alt: "",
    style: { "object-position": "0 0" }
  },

  {
    id: "cross-roads",
    src: "/jpeg/cross-roads.jpeg",
    alt: ""
  },

  {
    id: "theme-provider",
    src: "/jpeg/theme-provider.jpeg",
    alt: ""
  },

  {
    id: "dumpster-gram",
    src: "/jpeg/dumpster-gram.jpeg",
    alt: ""
  },

  {
    id: "post-it",
    src: "/jpeg/post-it.jpeg",
    alt: ""
  },

  {
    id: "sky",
    src: "/jpeg/sky.jpeg",
    alt: ""
  },

  {
    id: "hyper-branch",
    src: "/jpeg/hyper-branch.jpeg",
    alt: ""
  },

  // {
  //   id: "new-balanced",
  //   src: "/jpeg/new-balanced.jpeg",
  //   alt: ""
  // },

  {
    id: "thrift",
    src: "/jpeg/thrift.jpeg",
    alt: ""
  },

  {
    id: "orb-birth",
    src: "/jpeg/orb-birth.jpeg",
    alt: ""
  },

  {
    id: "coral",
    src: "/jpeg/coral.jpeg",
    alt: ""
  },

  {
    id: "chalk",
    src: "/jpeg/chalk.jpeg",
    alt: ""
  },

  {
    id: "spray-paint",
    src: "/jpeg/spray-paint.jpeg",
    alt: ""
  },

  {
    id: "seating",
    src: "/jpeg/seating.jpeg",
    alt: ""
  },

  {
    id: "concrete",
    src: "/jpeg/concrete.jpeg",
    alt: ""
  },

  {
    id: "cable-tv",
    src: "/jpeg/cable-tv.jpeg",
    alt: ""
  },

  {
    id: "mark",
    src: "/jpeg/mark.jpeg",
    alt: "",
    style: { "border-radius": "50%" }
  }

]

/* TODO: eliminate filtered? ensure gallery resize performance */
const filtered = reactive(true)
const filterValue = reactive(0)
const galleryFilter = sync({ src: { filtered, filterValue }, closeOut: CloseMode.NEVER })

/* TODO: undefined checks */
/* TODO: debounce */
const decNumGalleryColumnsIndex = () => {
  // filtered.next(false)
  // setTimeout(() => filtered.next(true), 220)
  const i = numGalleryColumnsIndex.deref()!
  i === 0 ?
    numGalleryColumnsIndex.next(numGalleryColumnsAll.length - 1) :
    numGalleryColumnsIndex.next(i - 1)
}
const incNumGalleryColumnsIndex = () => {
  // filtered.next(false)
  // setTimeout(() => filtered.next(true), 220)
  const i = numGalleryColumnsIndex.deref()!
  numGalleryColumnsIndex.next((i + 1) % numGalleryColumnsAll.length)
}

const galleryControls = () => [
  "aside", {},
  ["div.gallery-controls", {},
    /* TODO: labels, accessibility, aria */
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

const nolanGist = async (r: Route) => [
  "main", {},
  ["h1", {}, "I'm nolan."],
  ["h2", {}, "I've been called a reflector. I'm into computers,\ngraphics, and all forms of animation."],
  ["h3", {}, "This is where I programmatically put out on the internet, so stay awhile and listen. Enjoy my post-social AIM profile."],
  ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"]
  /* TODO: contact? */
]

const defaultGalleryItemPreview = (r: Route, { id, href, src, style, alt }: GalleryItem) => [
  "div.gallery-item", id ? { id } : {},
  ["a", { href: href || `#/${r.who}/gallery/${id}` },
    ["img", { src, alt, style }]
  ]
]

const galleryItemPreview = (r: Route, i: GalleryItem) =>
  i.preview ?
    i.preview(i) :
    defaultGalleryItemPreview(r, i)

const nolanGalleryId = async (r: Route) => {
  /* TODO: not found */
  const { src, alt } = nolanGalleryItems.find((x) => x.id === r.id)!
  return [
    "main", {},
    ["img", { src, alt }]
  ]
}

/* TODO: prev/next */
const nolanGalleryIdAside = async (r: Route) => [
  "aside", {},
  ["p", {}, nolanGalleryItems.find((x) => x.id === r.id)?.alt]
]

const nm8GalleryId = async (r: Route) => {
  /* TODO: not found */
  const { src, alt } = nm8GalleryItems.find((x) => x.id === r.id)!
  return [
    "main", {},
    ["img", { src, alt }]
  ]
}

/* TODO: prev/next */
const nm8GalleryIdAside = async (r: Route) => [
  "aside", {},
  ["p", {}, nm8GalleryItems.find((x) => x.id === r.id)?.alt]
]

const OeGalleryId = async (r: Route) => {
  /* TODO: not found */
  const { src, alt } = OeGalleryItems.find((x) => x.id === r.id)!
  return [
    "main", {},
    ["img", { src, alt }]
  ]
}

/* TODO: prev/next */
const OeGalleryIdAside = async (r: Route) => [
  "aside", {},
  ["p", {}, OeGalleryItems.find((x) => x.id === r.id)?.alt]
]


const smixzyGalleryId = async (r: Route) => {
  /* TODO: not found */
  const { src, alt } = smixzyGalleryItems.find((x) => x.id === r.id)!
  return [
    "main", {},
    ["img", { src, alt }]
  ]
}

/* TODO: prev/next */
const smixzyGalleryIdAside = async (r: Route) => [
  "aside", {},
  ["p", {}, smixzyGalleryItems.find((x) => x.id === r.id)?.alt]
]

const nolanGallery = async (r: Route) => [
  "main", {},
  ["div.gallery-container",
    {
      "data-gallery-columns": galleryColumns,
      style: {
        filter: galleryFilter.map((x) =>
          x.filtered ? `grayscale(${x.filterValue}%)` : "none")
      }
    },
    ...nolanGalleryItems.map((i) => galleryItemPreview(r, i))
    // ...nolanGalleryItems.map(galleryItemPreview)
  ]
]

const nolanGalleryAside = async (r: Route) => galleryControls()

const nolanReference = async (r: Route) => [
  "main", {},
  ["ul", {},
    ["li", {},
      ["h2", {}, "My greatest concern was what to call it."],
      ["p", {}, "—Claude Shannon"]
    ],

    ["li", {},
      ["h2", {}, "We don't get to stop the world, especially not to observe it."],
      ["p", {}, "—Rich Hickey"]
    ],

    ["li", {},
      ["h2", {}, "Unpredictability is not randomness, but in some circumstances looks very much like it."],
      ["p", {}, "—Wikipedia; Logistic Map"]
    ],

    ["li", {},
      ["h2", {}, "One main factor in the upward trend of animal life has been the power of wandering."],
      ["p", {}, "—Alfred North Whitehead"]
    ],

    ["li", {},
      ["h2", {}, "Unlimited possibility and abstract creativity can procure nothing."],
      ["p", {}, "—Alfred North Whitehead"]
    ],

    ["li", {},
      ["h2", {}, "A science that hesitates to forget its founders is lost."],
      ["p", {}, "—Alfred North Whitehead"]
    ],

    ["li", {},
      ["h2", {}, "We think in generalities, but we live in details."],
      ["p", {}, "—Alfred North Whitehead"]
    ],

    ["li", {},
      ["h2", {}, "Answer is the dead stop."],
      ["p", {}, "—William Fifield"]
    ],

    ["li", {},
      ["h2", {}, "The wholeness is made of parts, the parts are created by the wholeness."],
      ["p", {}, "—Christopher Alexander"]
    ],

    ["li", {},
      ["h2", {}, "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it."],
      ["p", {}, "—R.S."]
    ],
  ]
]

const nm8Gist = async (r: Route) => [
  "main", {},
  ["h1", {}, "I'm sorry."],
  ["h2", {}, "...about the JavaScript, Inter, and the\nwhole select-nav deal."],
  ["h3", {}, "The web was never meant to be \"cool\" and \"work well.\"\nThey have played us for absolute fools."],
  ["p", {}, "like animate. or like my initials, nms.\n also mereological composition."],
]

/* TODO: eliminate filtered, optimize filters */
const nm8Gallery = async (r: Route) => [
  "main", {},
  ["div.gallery-container",
    {
      "data-gallery-columns": galleryColumns,
      style: {
        filter: galleryFilter.map((x) =>
          x.filtered ?
            `contrast(${100 + x.filterValue * 0.5}%) saturate(${1 - x.filterValue / 100})` :
            "none")
      }
    },
    ...nm8GalleryItems.map((i) => galleryItemPreview(r, i))
  ]
]

const nm8GalleryAside = async (r: Route) => galleryControls()

/* TODO: datafy the references */
const nm8Reference = async (r: Route) => [
  "main", {},
  ["ul", {},
    ["li", {},
      ["a", { href: "https://youtu.be/lKXe3HUG2l4" },
        ["h2", {}, "The Mess We're In"],
        ["p", {}, "—Joe Armstrong"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/Kt-VlZpz-8E" },
        ["h2", {}, "How to Sweep."],
        ["p", {}, "—Tom Sachs"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.w3.org/Provider/Style/URI" },
        ["h2", {}, "Cool URIs don't change"],
        ["p", {}, "—Tim BL"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/ROor6_NGIWU" },
        ["h2", {}, "The Language of the System"],
        ["p", {}, "—Rich Hickey"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/-6BsiVyC1kM" },
        ["h2", {}, "The Value of Values"],
        ["p", {}, "—Rich Hickey"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/" },
        ["h2", {}, "Just hard-fail it."],
        ["p", {}, "—James Hamilton"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://thi.ng/" },
        ["h2", {}, "thi.ng"],
        ["p", {}, "—Karsten Schmidt"]
      ]
    ],

    ["li", {},
      ["h2", {}, "Everything worth saying, and everything else as well, can be said with two characters."],
      ["p", {}, "—Quine"]
    ],
  ]
]

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
  ["h2", {}, ".Abstract machines\n.Process"],
  ["h3", {}, "Language, logic, proof, etc.\nReal game of life hours, you know the one."],
  ["p", {}, "observe ∘ explicate"]
]

const OeGallery = async (r: Route) => [
  "main", {},
  ["div.gallery-container",
    {
      "data-gallery-columns": galleryColumns,
      style: {
        filter: galleryFilter.map((x) =>
          x.filtered ? `invert(${x.filterValue}%)` : "none")
      }
    },
    ...OeGalleryItems.map((i) => galleryItemPreview(r, i))
  ]
]

const OeGalleryAside = async (r: Route) => galleryControls()

const OeReference = async (r: Route) => [
  "main", {},
  ["ul", {},
    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Mereology" },
        ["h2", {}, ".Mereology"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Sequent_calculus" },
        ["h2", {}, ".Sequent Calculus"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Algebraic_structure" },
        ["h2", {}, ".Algebraic Structure"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Information_theory" },
        ["h2", {}, ".Information"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Process_philosophy" },
        ["h2", {}, ".Process"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/David_Bohm" },
        ["h2", {}, ".Bohm"]
      ]
    ]
  ]
]

const offset = 300
const period = 2 * Math.PI * 1200
const rate = 333
const rangePct = 200

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
  ["h3", {}, "in any combination. I love my desk.\nSoft immutability. Lv. 70 Arcane Mage."],
  ["p", {}, "Where concrete?"]
]

const smixzyGallery = async (r: Route) => [
  "main", {},
  ["div.gallery-container",
    {
      "data-gallery-columns": galleryColumns,
      style: {
        filter: galleryFilter.map((x) =>
          x.filtered ? `saturate(1.5) hue-rotate(${(x.filterValue / 100) * 360}deg)` : "none")
      }
    },
    ...smixzyGalleryItems.map((i) => galleryItemPreview(r, i))
  ]
]

const smixzyGalleryAside = async (r: Route) => galleryControls()

const smixzyReference = async (r: Route) => [
  "main", {},
  ["ul", {},
    ["li", {},
      ["a", { href: "https://sugarboypress.com/" },
        ["h2", {}, ".· Mark Hosford"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://ashlindolanstudio.com/Home-II" },
        ["h2", {}, ".· Ashlin Dolan"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.tomsachs.com/" },
        ["h2", {}, ".· Tom Sachs"]
      ]
    ],

    /* TODO: find better link */
    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Hilma_af_Klint" },
        ["h2", {}, ".· Hilma af Klint"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://twitter.com/toxi" },
        ["h2", {}, ".· Karsten Schmidt"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/XkXPqvWJHg4" },
        ["h2", {}, ".· Terry A. Davis"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://jeffsoto.com/" },
        ["h2", {}, ".· Jeff Soto"]
      ]
    ],

    /* TODO: find better link */
    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Jean_Giraud" },
        ["h2", {}, ".· Moebius"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://ulisesfarinas.com/" },
        ["h2", {}, ".· Ulises Fariñas"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.thadrussell.com/" },
        ["h2", {}, ".· Thad Russell"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://steveaxford.smugmug.com/" },
        ["h2", {}, ".· Steve Axford"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.bachor.com/pothole-installations-c1g1y" },
        ["h2", {}, ".· Jim Bachor"]
      ]
    ],

    ["li", {},
      ["a", { href: "http://www.myartda.com/" },
        ["h2", {}, ".· Minjeong An"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://wiki.xxiivv.com/site/dinaisth.html" },
        ["h2", {}, ".· Devine Lu Linvega"]
      ]
    ],

    ["li", {},
      ["a", { href: "http://www.quantumrain.com/" },
        ["h2", {}, ".· Stephen Cakebread"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.jessejacobsart.com/" },
        ["h2", {}, ".· Jesse Jacobs"]
      ]
    ],

    ["li", {},
      ["h2", {}, "You play through that."],
      ["p", {}, "—2BFC"]
    ],

    // ["li", {},
    //   ["h2", {}, "No, I... won't be doing that."],
    //   ["p", {}, "—2BFC"]
    // ],

    ["li", {},
      ["a", { href: "https://webring.xxiivv.com/" },
        ["h2", {}, "{ webring }"]
      ]
    ],
  ]
]

const capitalize = (s: string) => s.replace(/^\w/, c => c.toUpperCase())
const routeKeyFn = (r: Route) =>
  r.id ?
    `${r.who}${capitalize(r.what)}Id` :
    `${r.who}${capitalize(r.what)}`

const rdom = $compile([
  "div.rdom-root", {},
  $replace(route.map(navComponent)),
  /* ALT: ...$switch(,,,); return [main, aside] */
  $switch(
    route,
    routeKeyFn,
    {
      nolanGist,
      nolanGallery,
      nolanGalleryId,
      nolanReference,
      nm8Gist,
      nm8Gallery,
      nm8GalleryId,
      nm8Reference,
      OeGist,
      OeGallery,
      OeGalleryId,
      OeReference,
      smixzyGist,
      smixzyGallery,
      smixzyGalleryId,
      smixzyReference
    },
    async (err) => ["div", {}, route.map((r) => `ERROR ${err}; ${r.who}/${r.what}`)] /* TODO: fix, not found */
  ),
  $switch(
    route,
    (r) => `${routeKeyFn(r)}Aside`,
    {
      nolanGalleryAside,
      nolanGalleryIdAside,
      nm8GalleryAside,
      nm8GalleryIdAside,
      OeGalleryAside,
      OeGalleryIdAside,
      smixzyGalleryAside,
      smixzyGalleryIdAside
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
