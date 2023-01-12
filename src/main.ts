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


/* NOTE: system mode detection */

const prefersDarkModeMatch = window.matchMedia("(prefers-color-scheme: dark)")
const prefersDarkMode = reactive(prefersDarkModeMatch.matches, { closeOut: CloseMode.NEVER })
prefersDarkModeMatch.addEventListener("change", (e) => {
  prefersDarkMode.next(e.matches)
})

// const atMain = (_r: Route, { id, src, alt }: GalleryItem): ComponentLike => {
//   const hovered = reactive(false)
//   const clicked = reactive(false)
//   const state = sync({ src: { hovered, clicked } })
//   return [
//     "main", { id },
//     $replace(state.map((x) =>
//       x.hovered || x.clicked ?
//         ["img", {
//           src: "/gif/at.gif",
//           alt,
//           onclick: () => clicked.next(!x.clicked),
//           onmouseleave: () => hovered.next(false)
//         }] :
//         ["img", {
//           src,
//           alt,
//           onclick: () => clicked.next(!x.clicked),
//           onmouseenter: () => hovered.next(true)
//         }]
//     ))
//   ]
// }

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
  columns?: string[],
  tags?: string[],
  types?: string[],
  component: (x: this) => any
}

interface GistItem extends Item {
  textComponent: any[] | (() => any)
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
const defaultColumns = ["c1", "c2", "c3"]
// const randWeighted(["c1", 0.1], ["c2", 0.5], ["c3", 0.1], ["c9", 0.01])
// const randW = (...arr: [any, number][]) => {
//   const xs = arr.map((x) => x[0])
//   const ws = arr.map((x) => x[1])
//   console.log(xs, ws)
// }

// randW(["x", 0.1], ["y", 0.2], ["z", 0.1])

const gistComponent = ({ id, textComponent, columns = defaultColumns, tags = [], types = [] }: GistItem) => {
  const groups = tags.concat(types)
  return [
    "div",
    {
      id: `item--${id}`,
      class: `item gist ${randNth(columns)} ${groups.join(" ")}`,
      "data-groups": JSON.stringify(groups)
    },
    Array.isArray(textComponent) ? textComponent : textComponent()
  ]
}

/* TODO: onclick toggle expand */
/* TODO: refine class string */
/* TODO: weighted columns */
/* TODO: lazy loaded */
/* NOTE: include type in class so styling doesn't depend on filter */
const imageComponent = ({ id, src, alt, columns = defaultColumns, tags = [], types = [] }: ImageItem) => {
  const groups = tags.concat(types)
  return [
    "div",
    {
      id: `item--${id}`,
      class: `item image ${randNth(columns)} ${groups.join(" ")}`,
      "data-groups": JSON.stringify(groups)
    },
    ["img", { src, alt }]
  ]
}

/* TODO: hoverableImageComponent */

const quoteComponent = ({ id, quote, author, columns = defaultColumns, tags = [], types = [] }: QuoteItem) => {
  const groups = tags.concat(types)
  return [
    "div",
    {
      id: `item--${id}`,
      class: `item quote ${randNth(columns)} ${groups.join(" ")}`,
      "data-groups": JSON.stringify(groups)
    },
    ["h2", {}, quote],
    ["p", {}, `—${author}`]
  ]
}

const linkComponent = ({ id, href, destination, title, author, columns = defaultColumns, tags = [], types = [] }: LinkItem) => {
  const groups = tags.concat(types)
  return [
    "div",
    {
      id: `item--${id}`,
      class: `item link ${randNth(columns)} ${groups.join(" ")}`,
      "data-groups": JSON.stringify(groups)
    },
    ["a", { href },
      ["p", {}, destination],
      ["h2", {}, title],
      author ? ["p", {}, `—${author}`] : null
    ]
  ]
}

type I =
  Item
  | GistItem
  | ImageItem
  | HoverableImageItem
  | QuoteItem
  | LinkItem

const items: Array<I> = [
  {
    id: "intro",
    columns: ["c3"],
    tags: ["nolan"],
    types: ["gist"],
    textComponent: ["h1", {}, "I'm nolan."],
    component: gistComponent
  },

  {
    id: "nm8",
    columns: ["c2", "c3"],
    tags: ["nm8"],
    types: ["gist"],
    textComponent: ["p", {}, "I build sketchy websites and primitive furniture. They're beautiful in the same way my sister's dog is beautiful. I promise they're beautiful."],
    component: gistComponent
  },

  {
    id: "smixzy",
    tags: ["smixzy"],
    types: ["gist"],
    textComponent: ["h3", {}, "I generate a lot of nonsense, acrylic, and handmade garbage. 🤢"],
    component: gistComponent
  },

  {
    id: "arcane-mage",
    tags: ["smixzy"],
    types: ["gist"],
    textComponent: ["p", {}, "Lv. 70 arcane mage"],
    component: gistComponent
  },

  {
    id: "-•",
    tags: ["Oe"],
    types: ["gist"],
    textComponent: ["p", {}, "I think a lot about language, logic, proof, etc.: real game of life hours, you know the one."],
    component: gistComponent
  },

  {
    id: "Oe",
    tags: ["Oe"],
    types: ["gist"],
    textComponent: ["p", {}, "observe ∘ explicate"],
    component: gistComponent
  },

  {
    id: "blizzard",
    types: ["quote"],
    quote: "Stay a while, and listen.",
    author: "Deckard Cain",
    component: quoteComponent
  },

  {
    id: "nolan-self",
    tags: ["nolan"],
    types: ["image"],
    src: `/jpeg/nolan.self.${randNth([1, 2])}.jpeg`,
    alt: "Me in grayscale",
    component: imageComponent
  },

  {
    id: "persevere",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering.",
    component: imageComponent
  },

  {
    id: "clouds",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds and green foothills.",
    component: imageComponent
  },

  {
    id: "parents",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically.",
    component: imageComponent
  },

  {
    id: "erica",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/erica.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture.",
    component: imageComponent
  },

  {
    id: "louie",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention.",
    component: imageComponent
  },

  {
    id: "petals",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/petals.jpeg",
    alt: "Pink flower petals gravitating toward a concrete sidewalk.",
    component: imageComponent
  },

  {
    id: "pauszeks",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers.",
    component: imageComponent
  },

  {
    id: "watching",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/watching.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P.",
    component: imageComponent
  },

  {
    id: "david",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/david.jpeg",
    alt: "My sister's partner-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles.",
    component: imageComponent
  },

  {
    id: "branch",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely.",
    component: imageComponent
  },

  {
    id: "eli",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot.",
    component: imageComponent
  },

  {
    id: "bridge",
    tags: ["nolan"],
    types: ["image"],
    src: "/jpeg/bridge.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek.",
    component: imageComponent
  },

  {
    id: "nm8-self",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/nm8.self.jpeg",
    alt: "A robot with a 2x4 soul, visibly dissatisfied with its output.",
    component: imageComponent
  },

  {
    id: "at",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/at.jpeg",
    alt: "A three dimensional @ printed in white, black, and mint green PLA.",
    component: imageComponent
  },

  {
    id: "table",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/table.jpeg",
    alt: "A diagram of a table on graph paper.\nA potential table.",
    component: imageComponent
  },

  {
    id: "skulls",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/skulls.jpeg",
    alt: "Stackable cubic skulls printed in Martha Stewart®-brand PLA. The second greatest gift I've ever received: Martha's memento mori.",
    component: imageComponent
  },

  {
    id: "xacto",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/xacto.jpeg",
    alt: "An X-ACTO® knife. Fresh blade.",
    component: imageComponent
  },

  {
    id: "buckets",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/buckets.jpeg",
    alt: "Galvanized steel plumbing pipes and fittings sorted into orange buckets, brought to you by Home Depot®.",
    component: imageComponent
  },

  {
    id: "warhammer",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/warhammer.jpeg",
    alt: "Unpainted tabletop miniature. Sentient bipedal robot, specifically T'au.",
    component: imageComponent
  },

  {
    id: "rug",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/rug.jpeg",
    alt: "Green rug, white couch, wood table, gray blanket.",
    component: imageComponent
  },

  {
    id: "takach",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/takach.jpeg",
    alt: "Close-up of an etching press registration grid, brought to you by Takach Press®.",
    component: imageComponent
  },

  {
    id: "print",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/print.jpeg",
    alt: "A screen print hanging on the wall above a large manual screen printing press. Super meaningful to whoever took the picture, at least I get that sense.",
    component: imageComponent
  },

  {
    id: "frame",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/frame.jpeg",
    alt: "A rainbow-chromatic striped frame sample sitting on construction paper.",
    component: imageComponent
  },

  {
    id: "screw",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/screw.jpeg",
    alt: "A black ballpoint pen drawing on white graph paper. A vaguely humanoid assemblage of shapes with screw-like rod arms, a stacked box torso, smooth pipe legs, and a plastic floret head. It's worshipping a biblically accurate screw of enormous proportion. In this world, even the most basic fasteners are much larger than people.",
    component: imageComponent
  },

  {
    id: "fourth-avenue",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/fourth-avenue.jpeg",
    alt: "A blue Werner® ladder waiting for the subway at 4th Avenue.",
    component: imageComponent
  },

  {
    id: "graphite",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/graphite.jpeg",
    alt: "A rough graphite sketch of a detached plot of land floating in space, populated by tree-sized lollipops.",
    component: imageComponent
  },

  {
    id: "frames",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/frames.jpeg",
    alt: "A pile of candidate frame samples in front of an entire wall of more frame samples.",
    component: imageComponent
  },

  {
    id: "pack",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/pack.jpeg",
    alt: "A pristine dyneema fanny pack for use in the distant future when my current fanny pack falls irreparable.",
    component: imageComponent
  },

  {
    id: "di",
    tags: ["nm8"],
    types: ["image"],
    src: "/jpeg/di.jpeg",
    alt: "The greatest mother to have ever done it hauling her offspring's garbage through a hardware store.",
    component: imageComponent
  },

  {
    id: "Oe-self",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/Oe.self.png",
    alt: "A selectively randomized, poorly pixelized sapiens approximate peeking out of a previously sealed box.",
    component: imageComponent
  },

  {
    id: "scad",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/scad.png",
    alt: "A 3D CAD workspace populated with a repeating sinusoidal wave colorized according to coordinate.",
    component: imageComponent
  },

  {
    id: "170",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.170.png",
    alt: "Rule 170: 1D cellular automaton with range = 1, where cells are shaped like keyholes, but I think it's bugged. If you stare long enough it looks like a waterfall and starts to move.",
    component: imageComponent
  },

  {
    id: "era",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.era.png",
    alt: "Imperfectly pixelated flowers falling out of high-contrast background noise.",
    component: imageComponent
  },

  {
    id: "green",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.green.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; energetic green background.",
    component: imageComponent
  },

  {
    id: "pink",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.pink.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; pale-hot pink background.",
    component: imageComponent
  },

  {
    id: "blue",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.blue.png",
    alt: "I think this is a poor approximation of rule 99; ultra blue background.",
    component: imageComponent
  },

  {
    id: "stairs",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.stairs.png",
    alt: "Two bright perfectoids conversing in a noisy universe.",
    component: imageComponent
  },

  {
    id: "150",
    tags: ["Oe"],
    types: ["image"],
    src: "/png/rule.150.png",
    alt: "Rule 150, I think.",
    component: imageComponent
  },

  {
    id: "sidewalk",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/sidewalk.jpeg",
    alt: "Construction-filtered sunlight projecting a binary pattern on the sidewalk.",
    component: imageComponent
  },

  {
    id: "spill",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/spill.jpeg",
    alt: "The softest, most gorgeous spill you've ever faced.",
    component: imageComponent
  },

  {
    id: "stained",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/stained.jpg",
    alt: "Neon-stained sandstone.",
    component: imageComponent
  },

  {
    id: "martini",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/martini.jpeg",
    alt: "A martini efficiently brokering photons.",
    component: imageComponent
  },

  {
    id: "midway",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/midway.jpeg",
    alt: "The ultraheterochromatic hallway of Midway International Airport.",
    component: imageComponent
  },

  {
    id: "truck",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/truck.jpeg",
    alt: "A yellow haul truck on the beach.",
    component: imageComponent
  },

  {
    id: "cups",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/turrell.cups.jpeg",
    alt: "Two big gulps discussing Twilight Epiphany.",
    component: imageComponent
  },

  {
    id: "epiphany",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/turrell.pink.jpeg",
    alt: "Pink angles.",
    component: imageComponent
  },

  {
    id: "universal-rectifier",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/universal-rectifier.jpeg",
    alt: "A Universal Rectifiers, Inc.® Cathodic Protection Rectifier. A Hometown American Product.",
    component: imageComponent
  },

  {
    id: "observation",
    tags: ["Oe"],
    types: ["image"],
    src: "/jpeg/turrell.self.jpeg",
    alt: "Metaobservation to positive consequent.",
    component: imageComponent
  },

  {
    id: "smixzy-self",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/smixzy.self.jpeg",
    alt: "Still me, but in my favorite clothes.",
    component: imageComponent
  },

  {
    id: "concrete",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/concrete.jpeg",
    alt: "Soft concrete.",
    component: imageComponent
  },

  {
    id: "ass",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/ass-drag.jpeg",
    alt: "A purple Post-it® with 'ASS DRAG' written on it in caps lock. There's so much more where this came from.",
    component: imageComponent
  },

  {
    id: "send-nudes",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/send-nudes.jpeg",
    alt: "A quintessential United States Postal Service® mailbox with 'SEND NUDES' painted on the side, right above the logo.",
    component: imageComponent
  },

  {
    id: "instaworthy",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/instaworthy.jpeg",
    alt: "An Instagram®-worthy bedside table with 'SHIT IN MY MOUTH' lovingly expressed on the signboard.",
    component: imageComponent
  },

  {
    id: "fnd-ur-way",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/fnd-ur-way.jpeg",
    alt: "A hand-drawn sticker on a road sign that says 'FND UR WAY' under a skull with a staircase leading into the brain compartment.",
    component: imageComponent
  },

  {
    id: "face",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/face.preview.jpeg",
    alt: "The word 'FACE' permanently etched into a concrete sidewalk.",
    component: imageComponent
  },

  {
    id: "sunglasses",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/sunglasses.jpeg",
    alt: "The sidewalk shadows of two people holding heart-shaped sunglasses up to sunlight.",
    component: imageComponent
  },

  {
    id: "intersection",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/intersection.jpeg",
    alt: "Shoegazing at an intersection in the sidewalk.",
    component: imageComponent
  },

  {
    id: "theme-provider",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/theme-provider.jpeg",
    alt: "4 partially overlapping, heavily backlit bright pink Post-it® notes.",
    component: imageComponent
  },

  {
    id: "dumpstergram",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/dumpstergram.jpeg",
    alt: "Two dumpsters in the middle of the woods. Unparalleled vibe.",
    component: imageComponent
  },

  {
    id: "post-it",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/post-it.jpeg",
    alt: "A closeup of Post-it® notes with more Post-it® notes in the background; not to brag but it's a fresh cabinet pack of Helsinki-themed Greener Notes.",
    component: imageComponent
  },

  {
    id: "sky",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/sky.jpeg",
    alt: "Purple night clouds hushing a busy street.",
    component: imageComponent
  },

  {
    id: "twig",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/twig.jpeg",
    alt: "Closeup of a twig.",
    component: imageComponent
  },

  {
    id: "thrift",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/thrift.jpeg",
    alt: "Maximum thrift store saturation.",
    component: imageComponent
  },

  {
    id: "manifold",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/manifold.jpeg",
    alt: "Sketched amorphous manifold of blue, pink, and green ink.",
    component: imageComponent
  },

  {
    id: "coral",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/coral.jpeg",
    alt: "Scattered ink-encoded coral.",
    component: imageComponent
  },

  {
    id: "chalk",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/chalk.preview.jpeg",
    alt: "Sidewalk chalk portal to outer space.",
    component: imageComponent
  },

  {
    id: "spray-paint",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/spray-paint.jpeg",
    alt: "Spray paint blasted onto the sidewalk during construction.",
    component: imageComponent
  },

  {
    id: "monolith",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/monolith.jpeg",
    alt: "A strangely oriented concrete monolith opimitzed for resting up to four asscheeks.",
    component: imageComponent
  },

  {
    id: "cable",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/cable.jpeg",
    alt: "A classic mixup between the street lighting and television cable factions.",
    component: imageComponent
  },

  {
    id: "prof-hos",
    tags: ["smixzy"],
    types: ["image"],
    src: "/jpeg/mark.jpeg",
    alt: "Prof. Hos.!!!",
    component: imageComponent
  },

  {
    id: "claude",
    tags: ["nolan"],
    types: ["quote"],
    quote: "My greatest concern was what to call it.",
    author: "Claude Shannon",
    component: quoteComponent
  },

  {
    id: "rich",
    tags: ["nolan"],
    types: ["quote"],
    quote: "We don't get to stop the world, especially not to observe it.",
    author: "Rich Hickey",
    component: quoteComponent
  },

  {
    id: "logistic-map",
    tags: ["nolan"],
    types: ["quote"],
    quote: "Unpredictability is not randomness, but in some circumstances looks very much like it.",
    author: "Wikipedia; Logistic Map",
    component: quoteComponent
  },

  {
    id: "anw-1",
    tags: ["nolan"],
    types: ["quote"],
    quote: "One main factor in the upward trend of animal life has been the power of wandering.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "anw-2",
    tags: ["nolan"],
    types: ["quote"],
    quote: "Unlimited possibility and abstract creativity can procure nothing.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "anw-3",
    tags: ["nolan"],
    types: ["quote"],
    quote: "A science that hesitates to forget its founders is lost.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "anw-4",
    tags: ["nolan"],
    types: ["quote"],
    quote: "We think in generalities, but we live in details.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "fifield",
    tags: ["nolan"],
    types: ["quote"],
    quote: "Answer is the dead stop.",
    author: "William Fifield",
    component: quoteComponent
  },

  {
    id: "chris-a",
    tags: ["nolan"],
    types: ["quote"],
    quote: "The wholeness is made of parts, the parts are created by the wholeness.",
    author: "Christopher Alexander",
    component: quoteComponent
  },

  {
    id: "rs",
    tags: ["nolan"],
    types: ["quote"],
    quote: "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it.",
    author: "R.S.",
    component: quoteComponent
  },

  {
    id: "chapman",
    tags: ["nolan"],
    types: ["quote"],
    quote: "There can be no fixed method for this; it’s inherently improvisational.",
    author: "David Chapman",
    component: quoteComponent
  },

  {
    id: "the-mess-were-in",
    tags: ["nm8"],
    types: ["link"],
    href: "https://youtu.be/lKXe3HUG2l4",
    destination: "youtube",
    title: "The Mess We're In",
    author: "Joe Armstrong",
    component: linkComponent
  },

  {
    id: "how-to-sweep",
    tags: ["nm8"],
    types: ["link"],
    href: "https://youtu.be/Kt-VlZpz-8E",
    destination: "youtube",
    title: "How to Sweep.",
    author: "Tom Sachs",
    component: linkComponent
  },

  {
    id: "cool-uris",
    tags: ["nm8"],
    types: ["link"],
    href: "https://www.w3.org/Provider/Style/URI",
    destination: "w3.org",
    title: "Cool URIs don't change.",
    author: "Tim BL",
    component: linkComponent
  },

  {
    id: "the-language-of-the-system",
    tags: ["nm8"],
    types: ["link"],
    href: "https://youtu.be/ROor6_NGIWU",
    destination: "youtube",
    title: "The Language of the System",
    author: "Rich Hickey",
    component: linkComponent
  },

  {
    id: "the-value-of-values",
    tags: ["nm8"],
    types: ["link"],
    href: "https://youtu.be/-6BsiVyC1kM",
    destination: "youtube",
    title: "The Value of Values",
    author: "Rich Hickey",
    component: linkComponent
  },

  {
    id: "just-hard-fail-it",
    tags: ["nm8"],
    types: ["link"],
    href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/",
    destination: "usenix",
    title: "Just hard-fail it.",
    author: "James Hamilton",
    component: linkComponent
  },

  {
    id: "thi-ng",
    tags: ["nm8"],
    types: ["link"],
    href: "https://thi.ng/",
    destination: "thi.ng",
    title: "thi.ng",
    author: "Karsten Schmidt",
    component: linkComponent
  },

  {
    id: "worse-is-better",
    tags: ["nm8"],
    types: ["link"],
    href: "https://www.dreamsongs.com/RiseOfWorseIsBetter.html",
    destination: "website",
    title: "Worse is Better",
    author: "Richard Gabriel",
    component: linkComponent
  },

  {
    id: "quine",
    tags: ["nm8"],
    types: ["quote"],
    quote: "Everything worth saying, and everything else as well, can be said with two characters.",
    author: "Quine",
    component: quoteComponent
  },

  {
    id: "mereology",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/Mereology",
    destination: "wikipedia",
    title: ".Mereology",
    component: linkComponent
  },

  {
    id: "sequent-calculus",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/Sequent_calculus",
    destination: "wikipedia",
    title: ".Sequent Calculus",
    component: linkComponent
  },

  {
    id: "algebraic-structure",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/Algebraic_structure",
    destination: "wikipedia",
    title: ".Algebraic Structure",
    component: linkComponent
  },

  {
    id: "schismogenesis",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/Schismogenesis",
    destination: "wikipedia",
    title: ".Schismogenesis",
    component: linkComponent
  },

  {
    id: "information",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/Information_theory",
    destination: "wikipedia",
    title: ".Information",
    component: linkComponent
  },

  {
    id: "process",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/Process_philosophy",
    destination: "wikipedia",
    title: ".Process",
    component: linkComponent
  },

  {
    id: "bohm",
    tags: ["Oe"],
    types: ["link"],
    href: "https://en.wikipedia.org/wiki/David_Bohm",
    destination: "wikipedia",
    title: ".Bohm",
    component: linkComponent
  },

  {
    id: "mark",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://sugarboypress.com/",
    destination: "website",
    title: ".• Mark Hosford",
    component: linkComponent
  },

  {
    id: "ashlin",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://ashlindolanstudio.com/Home-II",
    destination: "website",
    title: ".• Ashlin Dolan",
    component: linkComponent
  },

  {
    id: "tom",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://www.tomsachs.com/",
    destination: "website",
    title: ".• Tom Sachs",
    component: linkComponent
  },

  {
    id: "hilma",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://en.wikipedia.org/wiki/Hilma_af_Klint",
    destination: "wikipedia",
    title: ".• Hilma af Klint",
    component: linkComponent
  },

  {
    id: "kandinsky",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://en.wikipedia.org/wiki/Wassily_Kandinsky",
    destination: "wikipedia",
    title: ".• Kandinsky",
    component: linkComponent
  },

  {
    id: "toxi",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://mastodon.thi.ng/@toxi",
    destination: "mastodon",
    title: ".• Karsten Schmidt",
    component: linkComponent
  },

  {
    id: "terry-a-davis",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://youtu.be/XkXPqvWJHg4",
    destination: "youtube",
    title: ".• Terry A. Davis",
    component: linkComponent
  },

  {
    id: "moebius",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://www.moebius.fr/Les-Collections.html",
    destination: "website",
    title: ".• Moebius",
    component: linkComponent
  },

  {
    id: "ulises-farinas",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://ulisesfarinas.com/",
    destination: "website",
    title: ".• Ulises Fariñas",
    component: linkComponent
  },

  {
    id: "john-vermilyea",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "http://www.jonvermilyea.com/",
    destination: "website",
    title: ".• Jon Vermilyea",
    component: linkComponent
  },

  {
    id: "anders-nilsen",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://www.andersbrekhusnilsen.com/booksandcomics",
    destination: "website",
    title: ".• Anders Nilsen",
    component: linkComponent
  },

  {
    id: "jesse-jacobs",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://www.jessejacobsart.com/",
    destination: "website",
    title: ".• Jesse Jacobs",
    component: linkComponent
  },

  {
    id: "steve-axford",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://steveaxford.smugmug.com/",
    destination: "smugmug",
    title: ".• Steve Axford",
    component: linkComponent
  },

  {
    id: "minjeong-an",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "http://www.myartda.com/",
    destination: "website",
    title: ".• Minjeong An",
    component: linkComponent
  },

  {
    id: "devine-lu-linvega",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "https://wiki.xxiivv.com/site/dinaisth.html",
    destination: "website",
    title: ".• Devine Lu Linvega",
    component: linkComponent
  },

  {
    id: "cakebread",
    tags: ["smixzy"],
    types: ["artist", "link"],
    href: "http://www.quantumrain.com/",
    destination: "website",
    title: ".• Stephen Cakebread",
    component: linkComponent
  },

  {
    id: "webring",
    tags: ["smixzy"],
    types: ["link"],
    href: "https://webring.xxiivv.com/",
    destination: "website",
    title: "{ webring }",
    component: linkComponent
  },

  {
    id: "twobfc",
    tags: ["smixzy"],
    types: ["quote"],
    quote: "You play through that.",
    author: "2BFC",
    component: quoteComponent
  },

  // TODO: add cowboy
  // TODO: add color waterfall image
]

const tags = [...new Set(items.flatMap((x) => x.tags || []))]
const types = [...new Set(items.flatMap((x) => x.types || []))]

const filterCheckboxComponent = (kind: string) => (x: string) => {
  const id = `filter--${kind}--${x}`
  const label = x === "Oe" ? ".•" : x
  return [
    "div", {},
    ["label", { for: id }, label],
    ["input", { id, type: "checkbox", name: x }]
  ]
}

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
      ...tags.map(filterCheckboxComponent("tag")),
    ],

    ["fieldset.type", {},
      ["legend", {}, "type"],
      ...types.map(filterCheckboxComponent("type"))
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
    [arr[i], arr[j]] = [arr[j], arr[i]]
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


/* TODO: lib */
/* TODO: noscript */
/* TODO: refine querySelectors */

const grid = document.querySelector(".grid-container") as HTMLElement
const filters = document.querySelector("fieldset.filters")

const shuffle = new Shuffle(
  grid,
  {
    itemSelector: '.item',
    sizer: '.sizer'
  }
)

document.querySelector("button.show")?.addEventListener("click", () => {
  const next = grid?.getAttribute("data-grid-columns") === "9" ? "7" : "9"
  const aside = document.querySelector('aside')

  grid?.setAttribute("data-grid-columns", next)
  aside?.classList.toggle("show")
})

const searchResult = (el: HTMLElement, searchInput: HTMLInputElement) => {
  const v = searchInput.value.toLowerCase()
  if ((el.textContent || "").toLowerCase().indexOf(v) >= 0)
    return true

  const imgs = Array.from(el.querySelectorAll('img'))
  return imgs.some((x) => x.alt.toLowerCase().indexOf(v) >= 0
    || x.src.toLowerCase().indexOf(v) >= 0)
}

const compositeFilter = (
  searchInput: HTMLInputElement,
  tagInputArray: HTMLInputElement[],
  typeInputArray: HTMLInputElement[]
) => {
  const tagNames = tagInputArray.filter((x) => x.checked).map((x) => x.name)
  const typeNames = typeInputArray.filter((x) => x.checked).map((x) => x.name)

  return (el: HTMLElement) => {
    const groups = JSON.parse(el.getAttribute("data-groups") || '[]') as string[]
    return (tagNames.length === 0 || tagNames.some((t) => groups.find((x) => x === t)))
      && (typeNames.length === 0 || typeNames.some((t) => groups.find((x) => x === t)))
      && (searchInput?.value.length === 0 || searchResult(el, searchInput))
  }
}

const filterEventListener = (_e: Event) => {
  const searchInput = filters?.querySelector('fieldset.search input[type="search"]')
  const tagInputs = filters?.querySelectorAll('fieldset.tag input[type="checkbox"]') || []
  const typeInputs = filters?.querySelectorAll('fieldset.type input[type="checkbox"]') || []

  const f = compositeFilter(
    searchInput as HTMLInputElement,
    Array.from(tagInputs) as HTMLInputElement[],
    Array.from(typeInputs) as HTMLInputElement[]
  )

  shuffle.filter(f)
}

const debounce = (f: Function, interval: number) => {
  var t: number | undefined = undefined
  return function(this: any) {
    clearTimeout(t)
    t = setTimeout(() => f.apply(this, arguments), interval)
    return t
  }
}

filters?.addEventListener("change", filterEventListener)
filters?.addEventListener("keyup", debounce(filterEventListener, 200))
