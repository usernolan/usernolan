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
import { choices } from "@thi.ng/transducers/choices"


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
  ["__COMMENT__", "Ah! I'm glad you're here. If you're wondering wtf is going on with this website, no you aren't, so am I, and you should wikipedia the Internal Family Systems Model. Lastly if you're like me, your keyboard should work approximately the way you want it to. Welcome!!"],
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

const nolanGalleryItems: GalleryItem[] = [
  {
    id: "self",
    src: "/jpeg/nolan.self.jpeg",
    alt: "Me in grayscale."
  },

  {
    id: "persevere",
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering."
  },

  {
    id: "clouds",
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds and green foothills."
  },

  {
    id: "parents",
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically."
  },

  {
    id: "erica",
    src: "/jpeg/erica.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture."
  },

  {
    id: "louie",
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention."
  },

  {
    id: "petals",
    src: "/jpeg/petals.jpeg",
    alt: "Pink flower petals gravitating toward a concrete sidewalk."
  },

  {
    id: "pauszeks",
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers."
  },

  {
    id: "watching",
    src: "/jpeg/watching.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P."
  },

  {
    id: "david",
    src: "/jpeg/david.jpeg",
    alt: "My sister's partner-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles."
  },

  {
    id: "branch",
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely."
  },

  {
    id: "eli",
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot."
  },

  {
    id: "bridge",
    src: "/jpeg/bridge.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek."
  }
]

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

const nm8GalleryItems: GalleryItem[] = [
  {
    id: "self",
    src: "/jpeg/nm8.self.jpeg",
    alt: "A robot with a 2x4 soul, visibly dissatisfied with its output."
  },

  {
    id: "at",
    src: "/jpeg/at.jpeg",
    alt: "A three dimensional @ printed in white, black, and mint green PLA.",
    main: atMain
  },

  {
    id: "table",
    src: "/jpeg/table.jpeg",
    alt: "A diagram of a table on graph paper.\nA potential table."
  },

  {
    id: "skulls",
    src: "/jpeg/skulls.jpeg",
    alt: "Stackable cubic skulls printed in Martha Stewart®-brand PLA. The second greatest gift I've ever received: Martha's memento mori."
  },

  {
    id: "xacto",
    src: "/jpeg/xacto.jpeg",
    alt: "An X-ACTO® knife. Fresh blade."
  },

  {
    id: "buckets",
    src: "/jpeg/buckets.jpeg",
    alt: "Galvanized steel plumbing pipes and fittings sorted into orange buckets, brought to you by Home Depot®."
  },

  {
    id: "warhammer",
    src: "/jpeg/warhammer.jpeg",
    alt: "Unpainted tabletop miniature. Sentient bipedal robot, specifically T'au."
  },

  {
    id: "rug",
    src: "/jpeg/rug.jpeg",
    alt: "Green rug, white couch, wood table, gray blanket."
  },

  {
    id: "takach",
    src: "/jpeg/takach.jpeg",
    alt: "Close-up of an etching press registration grid, brought to you by Takach Press®."
  },

  {
    id: "print",
    src: "/jpeg/print.jpeg",
    alt: "A screen print hanging on the wall above a large manual screen printing press. Super meaningful to whoever took the picture, at least I get that sense."
  },

  {
    id: "frame",
    src: "/jpeg/frame.jpeg",
    alt: "A rainbow-chromatic striped frame sample sitting on construction paper."
  },

  {
    id: "screw",
    src: "/jpeg/screw.jpeg",
    alt: "A black ballpoint pen drawing on white graph paper. A vaguely humanoid assemblage of shapes with screw-like rod arms, a stacked box torso, smooth pipe legs, and a plastic floret head. It's worshipping a biblically accurate screw of enormous proportion. In this world, even the most basic fasteners are much larger than people."
  },

  {
    id: "4-avenue",
    src: "/jpeg/4-avenue.jpeg",
    alt: "A blue Werner® ladder waiting for the subway at 4th Avenue."
  },

  {
    id: "graphite",
    src: "/jpeg/graphite.jpeg",
    alt: "A rough graphite sketch of a detached plot of land floating in space, populated by tree-sized lollipops."
  },

  {
    id: "frames",
    src: "/jpeg/frames.jpeg",
    alt: "A pile of candidate frame samples in front of an entire wall of more frame samples."
  },

  {
    id: "pack",
    src: "/jpeg/pack.jpeg",
    alt: "A pristine dyneema fanny pack for use in the distant future when my current fanny pack falls irreparable."
  },

  {
    id: "di",
    src: "/jpeg/di.jpeg",
    alt: "The greatest mother to have ever done it hauling her offspring's garbage through a hardware store."
  }
]

const OeGalleryItems: GalleryItem[] = [
  {
    id: "self",
    src: "/png/Oe.self.png",
    alt: "A selectively randomized, poorly pixelized sapiens approximate peeking out of a previously sealed box."
  },

  {
    id: "automata-1",
    src: "/png/automata.1.png",
    alt: "The inverse of next.",
    main: (_r: Route, { id }: GalleryItem) => ["main", { id }]
  },

  {
    id: "automata-2",
    src: "/png/automata.2.png",
    alt: "The inverse of prev.",
    main: (_r: Route, { id }: GalleryItem) => ["main", { id }]
  },

  {
    id: "scad",
    src: "/png/scad.png",
    alt: "A 3D CAD workspace populated with a repeating sinusoidal wave colorized according to coordinate."
  },

  {
    id: "170",
    src: "/png/rule.170.png",
    alt: "Rule 170: 1D cellular automaton with range = 1, where cells are shaped like keyholes, but I think it's bugged. If you stare long enough it looks like a waterfall and starts to move."
  },

  {
    id: "era",
    src: "/png/rule.era.png",
    alt: "Imperfectly pixelated flowers falling out of high-contrast background noise."
  },

  {
    id: "green",
    src: "/png/rule.green.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; energetic green background."
  },

  {
    id: "pink",
    src: "/png/rule.pink.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; pale-hot pink background."
  },

  {
    id: "blue",
    src: "/png/rule.blue.png",
    alt: "I think this is a poor approximation of rule 99; ultra blue background."
  },

  {
    id: "stairs",
    src: "/png/rule.stairs.png",
    alt: "Two bright perfectoids conversing in a noisy universe."
  },

  {
    id: "150",
    src: "/png/rule.150.png",
    alt: "Rule 150, I think."
  },

  {
    id: "n",
    src: "/png/n.png",
    alt: "An abstract division of components."
  },

  {
    id: "u",
    src: "/png/u.png",
    alt: "A complementary division of components."
  },

  {
    id: "sidewalk",
    src: "/jpeg/sidewalk.jpeg",
    alt: "Construction-filtered sunlight projecting a binary pattern on the sidewalk."
  },

  {
    id: "spill",
    src: "/jpeg/spill.jpeg",
    alt: "The softest, most gorgeous spill you've ever faced."
  },

  {
    id: "stained",
    src: "/jpeg/stained.jpg",
    alt: "Neon-stained sandstone."
  },

  {
    id: "martini",
    src: "/jpeg/martini.jpeg",
    alt: "A martini efficiently brokering photons."
  },

  {
    id: "midway",
    src: "/jpeg/midway.jpeg",
    alt: "The ultraheterochromatic hallway of Midway International Airport."
  },

  {
    id: "truck",
    src: "/jpeg/truck.jpeg",
    alt: "A yellow haul truck on the beach."
  },

  {
    id: "cups",
    src: "/jpeg/turrell.cups.jpeg",
    alt: "Two big gulps discussing Twilight Epiphany."
  },

  {
    id: "epiphany",
    src: "/jpeg/turrell.pink.jpeg",
    alt: "Pink angles."
  },

  {
    id: "universal-rectifier",
    src: "/jpeg/universal-rectifier.jpeg",
    alt: "A Universal Rectifiers, Inc.® Cathodic Protection Rectifier. A Hometown American Product."
  },

  {
    id: "observation",
    src: "/jpeg/turrell.self.jpeg",
    alt: "Metaobservation to positive consequent."
  },
]

const smixzyGalleryItems: GalleryItem[] = [
  {
    id: "self",
    src: "/jpeg/smixzy.self.jpeg",
    alt: "Still me, but in my favorite clothes."
  },

  {
    id: "concrete",
    src: "/jpeg/concrete.jpeg",
    alt: "Soft concrete."
  },

  {
    id: "ass",
    src: "/jpeg/ass-drag.jpeg",
    alt: "A purple Post-it® with 'ASS DRAG' written on it in caps lock. There's so much more where this came from."
  },

  {
    id: "send-nudes",
    src: "/jpeg/send-nudes.jpeg",
    alt: "A quintessential United States Postal Service® mailbox with 'SEND NUDES' painted on the side, right above the logo."
  },

  {
    id: "instaworthy",
    src: "/jpeg/instaworthy.jpeg",
    alt: "An Instagram®-worthy bedside table with 'SHIT IN MY MOUTH' lovingly expressed on the signboard."
  },

  {
    id: "fnd-ur-way",
    src: "/jpeg/fnd-ur-way.jpeg",
    alt: "A hand-drawn sticker on a road sign that says 'FND UR WAY' under a skull with a staircase leading into the brain compartment."
  },

  {
    id: "face",
    src: "/jpeg/face.preview.jpeg",
    alt: "The word 'FACE' permanently etched into a concrete sidewalk.",
    main: (_r: Route, { id, alt }: GalleryItem) => [
      "main", { id },
      ["img", { src: "/jpeg/face.jpeg", alt }]
    ]
  },

  {
    id: "sunglasses",
    src: "/jpeg/sunglasses.jpeg",
    alt: "The sidewalk shadows of two people holding heart-shaped sunglasses up to sunlight."
  },

  {
    id: "intersection",
    src: "/jpeg/intersection.jpeg",
    alt: "Shoegazing at an intersection in the sidewalk."
  },

  {
    id: "theme-provider",
    src: "/jpeg/theme-provider.jpeg",
    alt: "4 partially overlapping, heavily backlit bright pink Post-it® notes."
  },

  {
    id: "dumpstergram",
    src: "/jpeg/dumpstergram.jpeg",
    alt: "Two dumpsters in the middle of the woods. Unparalleled vibe."
  },

  {
    id: "post-it",
    src: "/jpeg/post-it.jpeg",
    alt: "A closeup of Post-it® notes with more Post-it® notes in the background; not to brag but it's a fresh cabinet pack of Helsinki-themed Greener Notes."
  },

  {
    id: "sky",
    src: "/jpeg/sky.jpeg",
    alt: "Purple night clouds hushing a busy street."
  },

  {
    id: "twig",
    src: "/jpeg/twig.jpeg",
    alt: "Closeup of a twig."
  },

  {
    id: "thrift",
    src: "/jpeg/thrift.jpeg",
    alt: "Maximum thrift store saturation."
  },

  {
    id: "manifold",
    src: "/jpeg/manifold.jpeg",
    alt: "Sketched amorphous manifold of blue, pink, and green ink."
  },

  {
    id: "coral",
    src: "/jpeg/coral.jpeg",
    alt: "Scattered ink-encoded coral."
  },

  {
    id: "chalk",
    src: "/jpeg/chalk.preview.jpeg",
    alt: "Sidewalk chalk portal to outer space.",
    main: (_r: Route, { id, alt }: GalleryItem) => [
      "main", { id },
      ["img", { src: "/jpeg/chalk.jpeg", alt }]
    ]
  },

  {
    id: "spray-paint",
    src: "/jpeg/spray-paint.jpeg",
    alt: "Spray paint blasted onto the sidewalk during construction."
  },

  {
    id: "monolith",
    src: "/jpeg/monolith.jpeg",
    alt: "A strangely oriented concrete monolith opimitzed for resting up to four asscheeks."
  },


  {
    id: "cable",
    src: "/jpeg/cable.jpeg",
    alt: "A classic mixup between the street lighting and television cable factions."
  },

  {
    id: "mark",
    src: "/jpeg/mark.jpeg",
    alt: "Prof. Hos.!!!"
    // aside: (r, x, xs) => ["aside", {}] /* TODO: add link to aside */
  }
]

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

const nolanGist = async (_r: Route) => [
  "main", {},
  ["h1", {}, "I'm nolan."],
  ["h2", {}, "I've been called a reflector. I'm into computers, graphics, and all forms of animation."],
  ["h3", {}, "This is where I programmatically put out on the internet, so stay awhile, and listen. Enjoy my post-social AIM profile."],
  ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"]
]

const nolanGallery = async (r: Route) => {
  const filter = (v: number) => `grayscale(${v}%)`
  const xs = nolanGalleryItems
  return gallery(r, { xs, filter })
}
const nolanGalleryAside = async (_r: Route) => galleryControls()
const nolanGalleryId = async (r: Route) => galleryId(r, nolanGalleryItems)
const nolanGalleryIdAside = async (r: Route) => galleryIdAside(r, nolanGalleryItems)

const nolanReference = async (_r: Route) => [
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
      ["p", {}, "—Christopher Alexander",
        ["__COMMENT__", "I mean I had to... It's Chrissy A.!"]]
    ],

    ["li", {},
      ["h2", {}, "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it."],
      ["p", {}, "—R.S."]
    ]
  ]
]

const nm8Gist = async (_r: Route) => [
  "main", {},
  ["h1", {}, "I'm sorry."],
  ["h2", {}, "...about the JavaScript, Inter, and the whole select-nav deal."],
  ["h3", {}, "The web was never meant to be \"cool\" and \"work well.\" They have played us for absolute fools."],
  ["p", {}, "like 'animate'. or like my initials, nms. also mereological composition."]
]

const nm8Gallery = async (r: Route) => {
  const filter = (v: number) => `contrast(${100 + v * 0.5}%) saturate(${1 - v / 100})`
  const xs = nm8GalleryItems
  return gallery(r, { xs, filter })
}
const nm8GalleryAside = async (_r: Route) => galleryControls()
const nm8GalleryId = async (r: Route) => galleryId(r, nm8GalleryItems)
const nm8GalleryIdAside = async (r: Route) => galleryIdAside(r, nm8GalleryItems)

const nm8Reference = async (_r: Route) => [
  "main", {},
  ["ul", {},
    ["li", {},
      ["a", { href: "https://youtu.be/lKXe3HUG2l4" },
        ["p", {}, "youtube"],
        ["h2", {}, "The Mess We're In"],
        ["p", {}, "—Joe Armstrong"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/Kt-VlZpz-8E" },
        ["p", {}, "youtube"],
        ["h2", {}, "How to Sweep."],
        ["p", {}, "—Tom Sachs"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.w3.org/Provider/Style/URI" },
        ["p", {}, "w3.org"],
        ["h2", {}, "Cool URIs don't change"],
        ["p", {}, "—Tim BL"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/ROor6_NGIWU" },
        ["p", {}, "youtube"],
        ["h2", {}, "The Language of the System"],
        ["p", {}, "—Rich Hickey"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/-6BsiVyC1kM" },
        ["p", {}, "youtube"],
        ["h2", {}, "The Value of Values"],
        ["p", {}, "—Rich Hickey"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/" },
        ["p", {}, "usenix"],
        ["h2", {}, "Just hard-fail it."],
        ["p", {}, "—James Hamilton"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://thi.ng/" },
        ["p", {}, "thi.ng"],
        ["h2", {}, "thi.ng"],
        ["p", {}, "—Karsten Schmidt"]
      ]
    ],

    ["li", {},
      ["h2", {}, "Everything worth saying, and everything else as well, can be said with two characters."],
      ["p", {}, "—Quine"]
    ]
  ]
]

const allChars = ["°", ".", "·", ":", "*", " ", "?"]
const weights = [0.143, 0.143, 0.143, 0.143, 0.143, 0.286, 0.0143]
const takeChars = (n: number) => [...take(n, choices(allChars, weights))]
const numChars = 9
var OeChars = takeChars(numChars)

const OeGist = async (_r: Route) => [
  "main", {},
  ["h1", {}, $replace(fromRAF().map((t) => {
    if (t % 12 === 0) OeChars = takeChars(numChars)
    return OeChars.join("")
  }))],
  ["h2", {}, ".Abstract machines\n.Process"],
  ["h3", {}, "Language, logic, proof, etc.: real game of life hours, you know the one."],
  ["p", {}, "observe ∘ explicate"]
]

const OeGallery = async (r: Route) => {
  const filter = (v: number) => `invert(${v}%)`
  const xs = OeGalleryItems
  return gallery(r, { xs, filter })
}
const OeGalleryAside = async (_r: Route) => galleryControls()
const OeGalleryId = async (r: Route) => galleryId(r, OeGalleryItems)
const OeGalleryIdAside = async (r: Route) => galleryIdAside(r, OeGalleryItems)

const OeReference = async (_r: Route) => [
  "main", {},
  ["ul", {},
    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Mereology" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".Mereology"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Sequent_calculus" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".Sequent Calculus"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Algebraic_structure" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".Algebraic Structure"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Information_theory" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".Information"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Process_philosophy" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".Process"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/David_Bohm" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".Bohm"]
      ]
    ]
  ]
]

const offset = 300
const period = 2 * Math.PI * 1200
const rate = 333
const rangePct = 300

const smixzyGist = async (_r: Route) => [
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
  ["h3", {}, "in any combinatorial. I love my desk. Soft immutability. Lv. 70 arcane mage."],
  ["p", {}, "Where concrete?"],
]

const smixzyGallery = async (r: Route) => {
  const filter = (v: number) => `saturate(1.125) hue-rotate(${(v / 100) * 360}deg)`
  const xs = smixzyGalleryItems
  return gallery(r, { xs, filter })
}
const smixzyGalleryAside = async (_r: Route) => galleryControls()
const smixzyGalleryId = async (r: Route) => galleryId(r, smixzyGalleryItems)
const smixzyGalleryIdAside = async (r: Route) => galleryIdAside(r, smixzyGalleryItems)

const smixzyReference = async (_r: Route) => [
  "main", {},
  ["__COMMENT__", "Meet my friends. Hilma af Klint for example."],
  ["ul", {},
    ["li", {},
      ["a", { href: "https://sugarboypress.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Mark Hosford"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://ashlindolanstudio.com/Home-II" },
        ["p", {}, "website"],
        ["h2", {}, ".· Ashlin Dolan"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.tomsachs.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Tom Sachs"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Hilma_af_Klint" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".· Hilma af Klint"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://en.wikipedia.org/wiki/Wassily_Kandinsky" },
        ["p", {}, "wikipedia"],
        ["h2", {}, ".· Wassily Kandinsky"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://mastodon.thi.ng/@toxi" },
        ["p", {}, "mastodon"],
        ["h2", {}, ".· Karsten Schmidt"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://youtu.be/XkXPqvWJHg4" },
        ["p", {}, "youtube"],
        ["h2", {}, ".· Terry A. Davis"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://jeffsoto.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Jeff Soto"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.moebius.fr/Les-Collections.html" },
        ["p", {}, "website"],
        ["h2", {}, ".· Moebius"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://ulisesfarinas.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Ulises Fariñas"]
      ]
    ],

    ["li", {},
      ["a", { href: "http://www.jonvermilyea.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Jon Vermilyea"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.andersbrekhusnilsen.com/booksandcomics" },
        ["p", {}, "website"],
        ["h2", {}, ".· Anders Nilsen"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.jessejacobsart.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Jesse Jacobs"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.instagram.com/presstube/" },
        ["p", {}, "instagram"],
        ["h2", {}, ".· James Paterson"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://www.thadrussell.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Thad Russell"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://steveaxford.smugmug.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Steve Axford"]
      ]
    ],

    ["li", {},
      ["a", { href: "http://www.myartda.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Minjeong An"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://wiki.xxiivv.com/site/dinaisth.html" },
        ["p", {}, "website"],
        ["h2", {}, ".· Devine Lu Linvega"]
      ]
    ],

    ["li", {},
      ["a", { href: "http://www.quantumrain.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· Stephen Cakebread"]
      ]
    ],

    ["li", {},
      ["a", { href: "https://webring.xxiivv.com/" },
        ["p", {}, "website"],
        ["h2", {}, ".· { webring }"]
      ]
    ],

    ["li", {},
      ["h2", {}, "You play through that."],
      ["p", {}, "—2BFC"]
    ],

    ["__COMMENT__", "No, I... won't be doing that. —2BFC"]
  ]
]

const capitalize = (s: string) => s.replace(/^\w/, c => c.toUpperCase())
const routeKeyFn = (r: Route) =>
  r.id ?
    `${r.who}${capitalize(r.what)}Id` :
    `${r.who}${capitalize(r.what)}`

const errorComponent = async (err: Error) => [
  "main.error", {},
  ["h1", {}, "who?"],
  ["h2", {}, "I don't recognize this route. Are you messing with me?"],
  ["h3", {}, `Get out of here with your ${err}.`],
  ["p", {}, "Drinkin' outta cups...get real."]
]

const rdom = $compile([
  "div.rdom-root", {},
  $replace(route.map(navComponent)),
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
    errorComponent
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


/* NOTE: keyboard interaction */

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const r = route.deref()

  /* NOTE: primary nav */
  if (e.key === "h") {
    if (r?.what === "gallery" && r?.id) {
      location.hash = document
        .getElementsByTagName("aside")[0]
        .getElementsByTagName("nav")[0]
        .getElementsByTagName("a")[0].hash
    } else {
      const idx = whoAll.findIndex((x) => x === r?.who)
      const prev = whoAll[(idx <= 0 ? whoAll.length : idx) - 1]
      location.hash = `#/${prev || "nolan"}/${r?.what || "gist"}`
      window.scrollTo(0, 0)
    }
  }

  if (e.key === "j") {
    if (r?.what === "gallery" && !r?.id) {
      location.hash = document
        .getElementsByClassName("gallery-container")[0]
        .getElementsByTagName("a")[0].hash
    } else {
      const idx = whatAll.findIndex((x) => x === r?.what)
      const next = whatAll[idx >= whatAll.length - 1 ? 0 : idx + 1]
      location.hash = `#/${r?.who || "nolan"}/${next || "gist"}`
      window.scrollTo(0, 0)
    }
  }

  if (e.key === "k") {
    if (r?.what === "gallery" && r?.id) {
      location.hash = `#/${r?.who || "nolan"}/gallery`
    } else {
      const idx = whatAll.findIndex((x) => x === r?.what)
      const prev = whatAll[(idx <= 0 ? whatAll.length : idx) - 1]
      location.hash = `#/${r?.who || "nolan"}/${prev || "gist"}`
      window.scrollTo(0, 0)
    }
  }

  if (e.key === "l") {
    if (r?.what === "gallery" && r?.id) {
      location.hash = document
        .getElementsByTagName("aside")[0]
        .getElementsByTagName("nav")[0]
        .getElementsByTagName("a")[2].hash
    } else {
      const idx = whoAll.findIndex((x) => x === r?.who)
      const next = whoAll[idx >= whoAll.length - 1 ? 0 : idx + 1]
      location.hash = `#/${next || "nolan"}/${r?.what || "gist"}`
      window.scrollTo(0, 0)
    }
  }

  /* NOTE: gallery zoom */
  if (e.key === "=" && r?.what === "gallery" && !r?.id) {
    decNumGalleryColumnsIndex()
  }

  if (e.key === "-" && r?.what === "gallery" && !r?.id) {
    incNumGalleryColumnsIndex()
  }

  /* NOTE: gallery filter */
  if (e.key === "." && r?.what === "gallery" && !r?.id) {
    const cur = filterValue.deref() || 0
    filterValue.next((cur + 2) % 100)
  }

  if (e.key === "," && r?.what === "gallery" && !r?.id) {
    const cur = filterValue.deref() || 0
    filterValue.next(cur <= 0 ? 100 : cur - 2)
  }

  /* NOTE: gallery navigation */
  if (e.key.match(/[1-9]/) && r?.what === "gallery" && !r?.id) {
    location.hash = document
      .getElementsByClassName("gallery-container")[0]
      .getElementsByTagName("a")[parseInt(e.key) - 1].hash
  }
})


/* NOTE: preloads */

const preloadLinkFromGalleryItem = (x: GalleryItem) => {
  const el = document.createElement("link")
  el.rel = "preload"
  el.as = "image"
  el.href = x.src
  return el
}
for (const xs of [nolanGalleryItems, nm8GalleryItems, OeGalleryItems, smixzyGalleryItems]) {
  document.head.append(...xs.map(preloadLinkFromGalleryItem))
}
