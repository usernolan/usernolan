import { choices } from "@thi.ng/transducers/choices"
// import { range } from "@thi.ng/transducers/range"
// import { map } from "@thi.ng/transducers/map"


/* NOTE: item interfaces, components */

type Choosable<T> =
  Array<T>
  | Array<[x: T, weight: number]>

interface Item {
  id: string,
  spans?: Choosable<number>,
  span?: number,
  tags?: string[],
  types?: string[],
  component: (x: this) => any
}

interface GistItem extends Item {
  textComponent: any[] | Function
}

export interface ImageItem extends Item {
  src: string,
  alt: string
  width: number,
  height: number,
  loading?: string,
  decoding?: string
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

// const defaultSpans: Choosable<number> = [[1, 0.8], [2, 0.1], [3, 0.05], [4, 0.01]]
const defaultSpans: Choosable<number> = [1]

const choiceGen = (arr: Choosable<any>) => {
  if (arr.length === 0) return choices(arr)

  return Array.isArray(arr[0]) ?
    choices(arr.map((x) => x[0]), arr.map((x) => x[1])) :
    choices(arr)
}

const choose = (x: Choosable<any> | IterableIterator<any>) =>
  Array.isArray(x) ?
    choiceGen(x).next().value :
    x.next().value

const choicesFrom = (arr: Choosable<any>) =>
  Array.isArray(arr[0]) ?
    arr.map((x) => x[0]) :
    arr

const weightsFrom = (arr: Choosable<any>) =>
  Array.isArray(arr[0]) ?
    arr.map((x) => x[1]) :
    null

const spanAttrs = (spans: Choosable<number>, span?: number) => ({
  "data-span": span || choose(spans),
  "data-span-choices": spans === defaultSpans ? null : choicesFrom(spans).join(","),
  "data-span-weights": weightsFrom(spans)?.join(",")
})

const groupAttrs = (groups: string[]) => ({
  "data-groups": groups.length === 0 ? null : groups.join(",")
})

const gistComponent = ({
  id, textComponent,
  spans = defaultSpans, span, tags = [], types = []
}: GistItem) => {
  const groups = tags.concat(types)
  return [
    "div",
    {
      id: `item--${id}`,
      class: `item gist ${groups.join(" ")}`,
      ...spanAttrs(spans, span),
      ...groupAttrs(groups)
    },
    Array.isArray(textComponent) ? textComponent : textComponent()
  ]
}

const imageFormats = ["avif", "webp"]
const videoFormats = ["webm", "mp4"]

/* TODO: proceduralize image gen */
const imageComponent = ({
  id, src, alt, width, height,
  loading = "lazy", decoding = "async",
  spans = defaultSpans, span,
  tags = [], types = []
}: ImageItem) => {
  const groups = Array.from(new Set(tags.concat(types, ["item", "image"])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: groups.join(" "),
      ...spanAttrs(spans, span)
    },
    ["picture", {}, ...imageFormats.map((ext) =>
      ["source", { srcset: src.replaceAll("jpeg", ext), type: `image/${ext}` }]),
      ["img", { src, alt, width, height, loading, decoding }]
    ]
  ]
}

const hoverableImageComponent = ({
  id, src, alt, width, height, hoverSrc,
  loading = "lazy", decoding = "async",
  spans = defaultSpans, span, tags = [], types = []
}: HoverableImageItem) => {
  const groups = Array.from(new Set(tags.concat(types, ["item", "image", "hoverable"])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: groups.join(" "),
      ...spanAttrs(spans, span)
    },
    ["picture", {}, ...imageFormats.map((ext) =>
      ["source", { srcset: src.replaceAll("jpeg", ext), type: `image/${ext}` }]),
      ["img", { src, alt, width, height, loading, decoding }]
    ],
    ["video", {
      muted: true, autoplay: true, loop: true, playsinline: true,
      preload: "auto", width, height, alt
    }, ...videoFormats.map((ext) =>
      ["source", { src: hoverSrc.replaceAll("mp4", ext), type: `video/${ext}` }]),
      ["a", { href: hoverSrc }, hoverSrc]
    ]
  ]
}

const quoteComponent = ({
  id, quote, author,
  tags = [], types = []
}: QuoteItem) => {
  const groups = Array.from(new Set(tags.concat(types, ["item", "quote"])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: groups.join(" ")
    },
    ["h2", {}, quote],
    ["p", {}, `—${author}`]
  ]
}

const linkComponent = ({
  id, href, destination, title, author,
  tags = [], types = []
}: LinkItem) => {
  const groups = Array.from(new Set(tags.concat(types, ["item", "link"])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: groups.join(" ")
    },
    ["a", { href },
      ["p", {}, destination],
      ["h2", {}, title],
      author ? ["p", {}, `${author}`] : null
    ]
  ]
}


/* NOTE: items */

type I =
  Item
  | GistItem
  | ImageItem
  | HoverableImageItem
  | QuoteItem
  | LinkItem

/* TODO: revisit ids, alts */
/* TODO: revisit component field */
/* TODO: add pics */
const imageItems: Array<ImageItem | HoverableImageItem> = [
  {
    id: "smixzy-self", tags: ["of-me", "heterochrome"],
    span: 2,
    src: "/jpeg/smixzy.self.jpeg",
    alt: "Me in my favorite clothes.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "nolan-self", tags: ["of-me", "monochrome"],
    src: "/jpeg/nolan.self.jpeg",
    alt: "Me in grayscale",
    width: 800, height: 1204, loading: "eager",
    component: imageComponent
  },

  {
    id: "persevere", tags: ["artifacts", "monochrome"],
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "clouds", tags: ["nature"],
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds and green foothills.",
    width: 800, height: 600, loading: "eager",
    component: imageComponent
  },

  {
    id: "branch", tags: ["nature"],
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "parents", tags: ["of-people"],
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically.",
    width: 800, height: 1015, loading: "eager",
    component: imageComponent
  },

  {
    id: "erica", tags: ["of-people"],
    src: "/jpeg/erica.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "louie", tags: ["of-people"],
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "petals", tags: ["nature"],
    src: "/jpeg/petals.jpeg",
    alt: "Pink flower petals gravitating toward a concrete sidewalk.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "pauszeks", tags: ["of-people"],
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "eli", tags: ["of-people"],
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "david", tags: ["of-people"],
    src: "/jpeg/david.jpeg",
    alt: "My sister's partner-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "watching", tags: ["nature"],
    src: "/jpeg/watching.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "bridge", tags: ["nature"],
    src: "/jpeg/bridge.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek.",
    width: 800, height: 1067, loading: "eager",
    component: imageComponent
  },

  {
    id: "nm8-self", tags: ["of-me", "furniture"],
    src: "/jpeg/nm8.self.jpeg",
    alt: "A robot with a 2x4 soul, visibly dissatisfied with its output.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "at", tags: ["artifacts", "generative", "monochrome"],
    src: "/jpeg/at.jpeg",
    alt: "A three dimensional @ printed in white, black, and mint green PLA.",
    width: 800, height: 1067,
    hoverSrc: "/mp4/at.mp4",
    component: hoverableImageComponent
  },

  {
    id: "table", tags: ["drawing", "furniture"],
    src: "/jpeg/table.jpeg",
    alt: "A diagram of a table on graph paper. A potential table.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "skulls", tags: ["artifacts"],
    src: "/jpeg/skulls.jpeg",
    alt: "Stackable cubic skulls printed in Martha Stewart®-brand PLA. The second greatest gift I've ever received: Martha's memento mori.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "xacto",
    src: "/jpeg/xacto.jpeg",
    alt: "An X-ACTO® knife. Fresh blade.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "buckets",
    src: "/jpeg/buckets.jpeg",
    alt: "Galvanized steel plumbing pipes and fittings sorted into orange buckets, brought to you by Home Depot®.",
    width: 800, height: 600,
    component: imageComponent
  },

  {
    id: "tau",
    src: "/jpeg/tau.jpeg",
    alt: "Unpainted tabletop miniature. Sentient bipedal robot, specifically T'au.",
    width: 800, height: 600,
    component: imageComponent
  },

  {
    id: "rug", tags: ["furniture"],
    src: "/jpeg/rug.jpeg",
    alt: "Green rug, white couch, wood table, gray blanket.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "takach",
    src: "/jpeg/takach.jpeg",
    alt: "Close-up of an etching press registration grid, brought to you by Takach Press®.",
    width: 800, height: 600,
    component: imageComponent
  },

  {
    id: "print", tags: ["drawing"],
    src: "/jpeg/print.jpeg",
    alt: "A screen print hanging on the wall above a large manual screen printing press. Super meaningful to whoever took the picture, at least I get that sense.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "frame",
    src: "/jpeg/frame.jpeg",
    alt: "A rainbow-chromatic striped frame sample sitting on construction paper.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "screw", tags: ["drawing"],
    src: "/jpeg/screw.jpeg",
    alt: "A black ballpoint pen drawing on white graph paper. A vaguely humanoid assemblage of shapes with screw-like rod arms, a stacked box torso, smooth pipe legs, and a plastic floret head. It's worshipping a biblically accurate screw of enormous proportion. In this world, even the most basic fasteners are much larger than people.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "fourth-avenue", tags: ["concrete"],
    src: "/jpeg/fourth-avenue.jpeg",
    alt: "A blue Werner® ladder waiting for the subway at 4th Avenue.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "graphite", tags: ["drawing"],
    src: "/jpeg/graphite.jpeg",
    alt: "A rough graphite sketch of a detached plot of land floating in space, populated by tree-sized lollipops.",
    width: 800, height: 621,
    component: imageComponent
  },

  {
    id: "frames",
    src: "/jpeg/frames.jpeg",
    alt: "A pile of candidate frame samples in front of an entire wall of more frame samples.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "pack",
    src: "/jpeg/pack.jpeg",
    alt: "A pristine dyneema fanny pack for use in the distant future when my current fanny pack falls irreparable.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "di", tags: ["of-people", "dumpsters"],
    src: "/jpeg/di.jpeg",
    alt: "The greatest mother to have ever done it hauling her offspring's garbage through a hardware store.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "concrete", tags: ["concrete", "heterochrome"],
    src: "/jpeg/concrete.jpeg",
    alt: "Soft concrete.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "ass", tags: ["bad-words", "post-its"],
    src: "/jpeg/ass.jpeg",
    alt: "A purple Post-it® with 'ASS DRAG' written on it in caps lock. There's so much more where this came from.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "send-nudes", tags: ["concrete", "dumpsters", "bad-words"],
    src: "/jpeg/send-nudes.jpeg",
    alt: "A quintessential United States Postal Service® mailbox with 'SEND NUDES' painted on the side, right above the logo.",
    width: 800, height: 801,
    component: imageComponent
  },

  {
    id: "instaworthy", tags: ["bad-words"],
    src: "/jpeg/instaworthy.jpeg",
    alt: "An Instagram®-worthy bedside table with 'SHIT IN MY MOUTH' lovingly expressed on the signboard.",
    width: 800, height: 1000,
    component: imageComponent
  },

  {
    id: "fnd-ur-way", tags: ["bad-words"],
    src: "/jpeg/fnd-ur-way.jpeg",
    alt: "A hand-drawn sticker on a road sign that says 'FND UR WAY' under a skull with a staircase leading into the brain compartment.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "face", tags: ["concrete", "bad-words", "monochrome"],
    src: "/jpeg/face.jpeg",
    alt: "The word 'FACE' permanently etched into a concrete sidewalk.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "sunglasses", tags: ["of-people", "concrete"],
    src: "/jpeg/sunglasses.jpeg",
    alt: "The sidewalk shadows of two people holding heart-shaped sunglasses up to sunlight.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "intersection", tags: ["concrete"],
    src: "/jpeg/intersection.jpeg",
    alt: "Shoegazing at an intersection in the sidewalk.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "theme-provider", tags: ["drawing", "post-its", "heterochrome"],
    src: "/jpeg/theme-provider.jpeg",
    alt: "4 partially overlapping, heavily backlit bright pink Post-it® notes.",
    width: 800, height: 1066,
    component: imageComponent
  },

  {
    id: "dumpstergram", tags: ["dumpsters"],
    src: "/jpeg/dumpstergram.jpeg",
    alt: "Two dumpsters in the middle of the woods. Unparalleled vibe.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "post-it", tags: ["post-its", "heterochrome"],
    src: "/jpeg/post-it.jpeg",
    alt: "A closeup of Post-it® notes with more Post-it® notes in the background; not to brag but it's a fresh cabinet pack of Helsinki-themed Greener Notes.",
    width: 800, height: 605,
    component: imageComponent
  },

  {
    id: "sky", tags: ["nature"],
    src: "/jpeg/sky.jpeg",
    alt: "Purple night clouds hushing a busy street.",
    width: 800, height: 600,
    component: imageComponent
  },

  {
    id: "twig", tags: ["nature", "heterochrome"],
    src: "/jpeg/twig.jpeg",
    alt: "Closeup of a twig.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "thrift", tags: ["of-people", "heterochrome"],
    src: "/jpeg/thrift.jpeg",
    alt: "Maximum thrift store saturation.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "manifold", tags: ["drawing", "heterochrome"],
    src: "/jpeg/manifold.jpeg",
    alt: "Sketched amorphous manifold of blue, pink, and green ink.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "coral", tags: ["drawing", "heterochrome"],
    src: "/jpeg/coral.jpeg",
    alt: "Scattered ink-encoded coral.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "chalk", tags: ["drawing", "concrete", "heterochrome"],
    src: "/jpeg/chalk.jpeg",
    alt: "Sidewalk chalk portal to outer space.",
    width: 800, height: 660,
    component: imageComponent
  },

  {
    id: "spray-paint", tags: ["concrete", "heterochrome"],
    src: "/jpeg/spray-paint.jpeg",
    alt: "Spray paint blasted onto the sidewalk during construction.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "monolith", tags: ["concrete", "furniture"],
    src: "/jpeg/monolith.jpeg",
    alt: "A strangely oriented concrete monolith opimitzed for resting up to four asscheeks.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "cable", tags: ["concrete", "bad-words"],
    src: "/jpeg/cable.jpeg",
    alt: "A classic mixup between the street lighting and television cable factions.",
    width: 800, height: 801,
    component: imageComponent
  },

  {
    id: "prof-hos", tags: ["of-people", "concrete"],
    src: "/jpeg/mark.jpeg",
    alt: "Prof. Hos.!!!",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "Oe-self", tags: ["of-me", "generative", "monochrome"],
    src: "/png/Oe.self.png",
    alt: "A selectively randomized, poorly pixelized sapiens approximate peeking out of a previously sealed box.",
    width: 1216, height: 1331,
    component: imageComponent
  },

  {
    id: "scad", tags: ["generative"],
    src: "/png/scad.png",
    alt: "A 3D CAD workspace populated with a repeating sinusoidal wave colorized according to coordinate.",
    width: 3584, height: 1599,
    component: imageComponent
  },

  {
    id: "170", tags: ["generative", "monochrome"],
    src: "/png/rule.170.png",
    alt: "Rule 170: 1D cellular automaton with range = 1, where cells are shaped like keyholes, but I think it's bugged. If you stare long enough it looks like a waterfall and starts to move.",
    width: 1200, height: 1200,
    component: imageComponent
  },

  {
    id: "era", tags: ["nature", "generative", "monochrome"],
    src: "/png/rule.era.png",
    alt: "Imperfectly pixelated flowers falling out of high-contrast background noise.",
    width: 1031, height: 1500,
    component: imageComponent
  },

  {
    id: "green", tags: ["generative"],
    src: "/png/rule.green.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; energetic green background.",
    width: 810, height: 1015,
    component: imageComponent
  },

  {
    id: "pink", tags: ["generative"],
    src: "/png/rule.pink.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; pale-hot pink background.",
    width: 810, height: 1015,
    component: imageComponent
  },

  {
    id: "blue", tags: ["generative"],
    src: "/png/rule.blue.png",
    alt: "I think this is a poor approximation of rule 99; ultra blue background.",
    width: 1200, height: 2800,
    component: imageComponent
  },

  {
    id: "stairs", tags: ["generative", "monochrome"],
    src: "/png/rule.stairs.png",
    alt: "Two bright perfectoids conversing in a noisy universe.",
    width: 500, height: 748,
    component: imageComponent
  },

  {
    id: "150", tags: ["generative", "monochrome"],
    src: "/png/rule.150.png",
    alt: "Rule 150, I think.",
    width: 1200, height: 1200,
    component: imageComponent
  },

  {
    id: "sidewalk", tags: ["nature", "concrete", "monochrome"],
    src: "/jpeg/sidewalk.jpeg",
    alt: "Construction-filtered sunlight projecting a binary pattern on the sidewalk.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "spill", tags: ["monochrome"],
    src: "/jpeg/spill.jpeg",
    alt: "The softest, most gorgeous spill you've ever faced.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "stained", tags: ["concrete", "heterochrome"],
    src: "/jpeg/stained.jpeg",
    alt: "Neon-stained sandstone.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "martini",
    src: "/jpeg/martini.jpeg",
    alt: "A martini efficiently brokering photons.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "midway", tags: ["heterochrome"],
    src: "/jpeg/midway.jpeg",
    alt: "The ultraheterochromatic hallway of Midway International Airport.",
    width: 800, height: 600,
    component: imageComponent
  },

  {
    id: "truck", tags: ["nature", "dumpsters"],
    src: "/jpeg/truck.jpeg",
    alt: "A yellow haul truck on the beach.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "cups",
    src: "/jpeg/turrell.cups.jpeg",
    alt: "Two big gulps discussing Twilight Epiphany.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "epiphany",
    src: "/jpeg/turrell.pink.jpeg",
    alt: "Pink angles.",
    width: 800, height: 1067,
    component: imageComponent
  },

  {
    id: "universal-rectifier", tags: ["bad-words"],
    src: "/jpeg/universal-rectifier.jpeg",
    alt: "A Universal Rectifiers, Inc.® Cathodic Protection Rectifier. A Hometown American Product.",
    width: 800, height: 800,
    component: imageComponent
  },

  {
    id: "observation", tags: ["of-me"],
    src: "/jpeg/turrell.self.jpeg",
    alt: "Observing observation",
    width: 800, height: 1067,
    component: imageComponent
  }
]

const linkItems: Array<LinkItem> = [
  {
    id: "the-mess-were-in", tags: ["nm8"], types: ["link"],
    href: "https://youtu.be/lKXe3HUG2l4",
    destination: "youtube",
    title: "The Mess We're In",
    author: "Joe Armstrong",
    component: linkComponent
  },

  // {
  //   id: "how-to-sweep", tags: ["nm8"], types: ["link"],
  //   href: "https://youtu.be/Kt-VlZpz-8E",
  //   destination: "youtube",
  //   title: "How to Sweep.",
  //   author: "Tom Sachs",
  //   component: linkComponent
  // },

  {
    id: "cool-uris", tags: ["nm8"], types: ["link"],
    href: "https://www.w3.org/Provider/Style/URI",
    destination: "w3.org",
    title: "Cool URIs don't change.",
    author: "Tim BL",
    component: linkComponent
  },

  {
    id: "the-language-of-the-system", tags: ["nm8"], types: ["link"],
    href: "https://youtu.be/ROor6_NGIWU",
    destination: "youtube",
    title: "The Language of the System",
    author: "Rich Hickey",
    component: linkComponent
  },

  {
    id: "the-value-of-values", tags: ["nm8"], types: ["link"],
    href: "https://youtu.be/-6BsiVyC1kM",
    destination: "youtube",
    title: "The Value of Values",
    author: "Rich Hickey",
    component: linkComponent
  },

  {
    id: "just-hard-fail-it", tags: ["nm8"], types: ["link"],
    href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/",
    destination: "usenix",
    title: "Just hard-fail it.",
    author: "James Hamilton",
    component: linkComponent
  },

  {
    id: "worse-is-better", tags: ["nm8", "smixzy"], types: ["link"],
    href: "https://www.dreamsongs.com/RiseOfWorseIsBetter.html",
    destination: "website",
    title: "Worse is Better",
    author: "Richard Gabriel",
    component: linkComponent
  },

  {
    id: "thi-ng", tags: ["nm8", "smixzy"], types: ["link"],
    href: "https://thi.ng/",
    destination: "thi.ng",
    title: "thi.ng",
    author: "Karsten Schmidt",
    component: linkComponent
  },

  {
    id: "toxi", tags: ["nm8", "smixzy"], types: ["artist", "link"],
    href: "https://mastodon.thi.ng/@toxi",
    destination: "mastodon",
    title: ".• Karsten Schmidt",
    component: linkComponent
  },

  {
    id: "mark", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://sugarboypress.com/",
    destination: "website",
    title: ".• Mark Hosford",
    component: linkComponent
  },

  {
    id: "hilma", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://en.wikipedia.org/wiki/Hilma_af_Klint",
    destination: "wikipedia",
    title: ".• Hilma af Klint",
    component: linkComponent
  },

  {
    id: "kandinsky", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://en.wikipedia.org/wiki/Wassily_Kandinsky",
    destination: "wikipedia",
    title: ".• Kandinsky",
    component: linkComponent
  },

  {
    id: "terry-a-davis", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://youtu.be/XkXPqvWJHg4",
    destination: "youtube",
    title: ".• Terry A. Davis",
    component: linkComponent
  },

  {
    id: "moebius", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://www.moebius.fr/Les-Collections.html",
    destination: "website",
    title: ".• Moebius",
    component: linkComponent
  },

  {
    id: "ulises-farinas", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://ulisesfarinas.com/",
    destination: "website",
    title: ".• Ulises Fariñas",
    component: linkComponent
  },

  {
    id: "john-vermilyea", tags: ["smixzy"], types: ["artist", "link"],
    href: "http://www.jonvermilyea.com/",
    destination: "website",
    title: ".• Jon Vermilyea",
    component: linkComponent
  },

  {
    id: "anders-nilsen", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://www.andersbrekhusnilsen.com/booksandcomics",
    destination: "website",
    title: ".• Anders Nilsen",
    component: linkComponent
  },

  {
    id: "jesse-jacobs", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://www.jessejacobsart.com/",
    destination: "website",
    title: ".• Jesse Jacobs",
    component: linkComponent
  },

  {
    id: "steve-axford", tags: ["smixzy"], types: ["artist", "link"],
    href: "https://steveaxford.smugmug.com/",
    destination: "smugmug",
    title: ".• Steve Axford",
    component: linkComponent
  },

  {
    id: "minjeong-an", tags: ["smixzy"], types: ["artist", "link"],
    href: "http://www.myartda.com/",
    destination: "website",
    title: ".• Minjeong An",
    component: linkComponent
  },

  {
    id: "devine-lu-linvega", tags: ["smixzy", "Oe"], types: ["artist", "link"],
    href: "https://wiki.xxiivv.com/site/dinaisth.html",
    destination: "website",
    title: ".• Devine Lu Linvega",
    component: linkComponent
  },

  {
    id: "cakebread", tags: ["smixzy", "Oe"], types: ["artist", "link"],
    href: "http://www.quantumrain.com/",
    destination: "website",
    title: ".• Stephen Cakebread",
    component: linkComponent
  },

  {
    id: "mereology", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/Mereology",
    destination: "wikipedia",
    title: ".Mereology",
    component: linkComponent
  },

  {
    id: "sequent-calculus", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/Sequent_calculus",
    destination: "wikipedia",
    title: ".Sequent Calculus",
    component: linkComponent
  },

  {
    id: "algebraic-structure", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/Algebraic_structure",
    destination: "wikipedia",
    title: ".Algebraic Structure",
    component: linkComponent
  },

  {
    id: "schismogenesis", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/Schismogenesis",
    destination: "wikipedia",
    title: ".Schismogenesis",
    component: linkComponent
  },

  {
    id: "information", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/Information_theory",
    destination: "wikipedia",
    title: ".Information",
    component: linkComponent
  },

  {
    id: "process", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/Process_philosophy",
    destination: "wikipedia",
    title: ".Process",
    component: linkComponent
  },

  {
    id: "bohm", tags: ["Oe"], types: ["link"],
    href: "https://en.wikipedia.org/wiki/David_Bohm",
    destination: "wikipedia",
    title: ".Bohm",
    component: linkComponent
  },

  {
    id: "webring", tags: ["smixzy", "Oe"], types: ["link"],
    href: "https://webring.xxiivv.com/",
    destination: "website",
    title: "{ webring }",
    component: linkComponent
  }
]

const quoteItems: Array<QuoteItem> = [
  {
    id: "claude", tags: ["nolan"], types: ["quote"],
    quote: "My greatest concern was what to call it.",
    author: "Claude Shannon",
    component: quoteComponent
  },

  {
    id: "rich", tags: ["nolan"], types: ["quote"],
    quote: "We don't get to stop the world, especially not to observe it.",
    author: "Rich Hickey",
    component: quoteComponent
  },

  {
    id: "logistic-map", spans: [2, 3], tags: ["nolan"], types: ["quote"],
    quote: "Unpredictability is not randomness, but in some circumstances looks very much like it.",
    author: "Wikipedia; Logistic Map",
    component: quoteComponent
  },

  {
    id: "anw-1", tags: ["nolan"], types: ["quote"],
    quote: "One main factor in the upward trend of animal life has been the power of wandering.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "anw-2", tags: ["nolan"], types: ["quote"],
    quote: "Unlimited possibility and abstract creativity can procure nothing.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "anw-3", tags: ["nolan"], types: ["quote"],
    quote: "A science that hesitates to forget its founders is lost.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "anw-4", tags: ["nolan"], types: ["quote"],
    quote: "We think in generalities, but we live in details.",
    author: "Alfred North Whitehead",
    component: quoteComponent
  },

  {
    id: "fifield", tags: ["nolan"], types: ["quote"],
    quote: "Answer is the dead stop.",
    author: "William Fifield",
    component: quoteComponent
  },

  {
    id: "chris-a", tags: ["nolan"], types: ["quote"],
    quote: "The wholeness is made of parts, the parts are created by the wholeness.",
    author: "Christopher Alexander",
    component: quoteComponent
  },

  {
    id: "rs", tags: ["nolan"], types: ["quote"],
    quote: "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it.",
    author: "R.S.",
    component: quoteComponent
  },

  // {
  //   id: "chapman", spans: [2, 3], tags: ["nolan"], types: ["quote"],
  //   quote: "There can be no fixed method for this; it’s inherently improvisational.",
  //   author: "David Chapman",
  //   component: quoteComponent
  // },

  {
    id: "blizzard", types: ["quote"],
    quote: "Stay awhile, and listen.",
    author: "Deckard Cain",
    component: quoteComponent
  },

  {
    id: "quine", tags: ["nm8"], types: ["quote"],
    quote: "Everything worth saying, and everything else as well, can be said with two characters.",
    author: "Quine",
    component: quoteComponent
  },

  {
    id: "twobfc", tags: ["smixzy"], types: ["quote"],
    quote: "You play through that.",
    author: "2BFC",
    component: quoteComponent
  }
]

const nolanItems: Array<I> = [
  {
    id: "intro", spans: [3], tags: ["nolan"], types: ["gist"],
    textComponent: ["h1", {}, "I'm nolan."],
    component: gistComponent
  }
]

const nm8Items: Array<I> = [
  {
    id: "nm8", spans: [2, 3], tags: ["nm8"], types: ["gist"],
    textComponent: ["p", {}, "I build sketchy websites and primitive furniture. They're beautiful in the same way my sister's dog is beautiful. I promise they're beautiful."],
    component: gistComponent
  },
]

const smixzyItems: Array<I> = [
  {
    id: "smixzy", tags: ["smixzy"], types: ["gist"],
    textComponent: ["h3", {}, "I generate a lot of nonsense, acrylic, and handmade garbage. 🤢"],
    component: gistComponent
  },

  {
    id: "arcane-mage", tags: ["smixzy"], types: ["gist"],
    textComponent: ["p", {}, "Lv. 70 arcane mage"],
    component: gistComponent
  },
]

const OeItems: Array<I> = [
  {
    id: "-•", tags: ["Oe"], types: ["gist"],
    textComponent: ["p", {}, "I think a lot about language, logic, proof, etc.: real game of life hours, you know the one."],
    component: gistComponent
  },

  {
    id: "Oe", tags: ["Oe"], types: ["gist"],
    textComponent: ["p", {}, "observe ∘ explicate"],
    component: gistComponent
  },
]

export const items: Array<I> =
  nolanItems.concat(nm8Items, smixzyItems, OeItems).concat([{
    id: "contact", spans: [2, 3], tags: ["nolan", "nm8", "smixzy", "Oe"], types: ["contact"],
    textComponent: ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"],
    component: gistComponent
  }])


/* NOTE: document components */

const fontHrefRoot = "https://fonts.googleapis.com/css2?family="
const fontHref = fontHrefRoot + "Fragment+Mono:ital@0;1&family=Inter:wght@400;700&display=swap"

const head = [
  "head", {},
  ["meta", { charset: "UTF-8" }],
  ["title", "nolan"],
  ["link", { rel: "icon", href: "/favicon.ico", sizes: "any" }],
  ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  ["meta", { name: "viewport", content: "width=device-width,initial-scale=1.0" }],
  ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
  ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true }],
  ["link", { rel: "preload", as: "style", href: fontHref }],
  ["link", { rel: "stylesheet", media: "print", onload: "this.onload=null;this.removeAttribute('media');", href: fontHref }],
  ["noscript", ["link", { rel: "stylesheet", href: fontHref }]],
  ["meta", { name: "description", content: ".·" }],
  ["meta", { property: "og:title", content: "nolan" }],
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:url", content: "https://usernolan.net" }],
  // ["meta", { property: "og:image", content: "https://usernolan.net/png/Oe.self.png" }]
]

/* TODO: revisit image filenames */
const main = [
  "main", {},
  ["div.header", {},
    ["h1", {}, "i'm nolan"],
    ["div.controls", {},
      ["div.select", {},
        ["label", { for: "select--mode" }, "mode: "],
        ["select#select--mode", {},
          ["option", {}, "system"],
          ["option", {}, "light"],
          ["option", {}, "dark"],
          // ["option", {}, "multi"]
        ]]]
  ],
  ["div.images", {}, imageItems[0].component(imageItems[0] as any)],
  ["div.links", {},
    ["a", { href: "/images/" }, "images"],
    ["a", { href: "/links/" }, "links"],
    ["a", { href: "/quotes/" }, "quotes"],
    ["a", { href: "/pdf/resume.pdf", target: "_blank" }, "cv"]
  ],
  ["p", {},
    `I build sketchy websites and primitive furniture. They're beautiful in the
  same way my sister's dog is beautiful. I promise they're beautiful.`],
]

const body = [
  "body", {},
  main,
  ["script", { type: "module", src: "/src/index.ts" }]
]

const root = [
  "html", { lang: "en" },
  head,
  body
]

export const index = [
  ["!DOCTYPE", "html"],
  root
]

export const images = [
  ["!DOCTYPE", "html"],
  head,
  ["body", {},
    ["main.images", {},
      ["div.header", {},
        ["a", { href: "/" }, "home"],
        ["div.controls", {},
          ["div.select--filter", {},
            ["label", { for: "select--filter" }, "filter: "],
            ["select#select--filter", {},
              ["option", {}, "all"],
              ["option", { value: "of-me" }, "of me"],
              ["option", { value: "of-people" }, "of people"],
              ["option", {}, "artifacts"],
              ["option", {}, "drawing"],
              ["option", {}, "nature"],
              ["option", {}, "concrete"],
              ["option", {}, "dumpsters"],
              ["option", {}, "furniture"],
              ["option", { value: "bad-words" }, "bad words"],
              ["option", {}, "post-its"],
              ["option", {}, "generative"],
              ["option", {}, "monochrome"],
              ["option", {}, "heterochrome"]
            ]
          ],
          ["div.select--mode", {},
            ["label", { for: "select--mode" }, "mode: "],
            ["select#select--mode", {},
              ["option", {}, "system"],
              ["option", {}, "light"],
              ["option", {}, "dark"]
            ]
          ]
        ]
      ],
      ["div.images", {}, ...imageItems.map((x) => x.component(x as any))]
    ],
    ["script", { type: "module", src: "/src/images.ts" }]
  ]
]

export const links = [
  ["!DOCTYPE", "html"],
  head,
  ["body", {},
    ["main.links", {},
      ["div.header", {},
        ["a", { href: "/" }, "home"],
        ["div.controls", {},
          ["div.select--filter", {},
            ["label", { for: "select--filter" }, "filter: "],
            ["select#select--filter", {},
              ["option", {}, "all"]
            ]
          ],
          ["div.select--mode", {},
            ["label", { for: "select--mode" }, "mode: "],
            ["select#select--mode", {},
              ["option", {}, "system"],
              ["option", {}, "light"],
              ["option", {}, "dark"]
            ]
          ]
        ]
      ],
      ["div.links", {}, ...linkItems.map((x) => x.component(x as any))]
    ],
    ["script", { type: "module", src: "/src/links.ts" }]
  ]
]

export const quotes = [
  ["!DOCTYPE", "html"],
  head,
  ["body", {},
    ["main.quotes", {},
      ["div.header", {},
        ["a", { href: "/" }, "home"],
        ["div.controls", {},
          ["div.select--filter", {},
            ["label", { for: "select--filter" }, "filter: "],
            ["select#select--filter", {},
              ["option", {}, "all"]
            ]
          ],
          ["div.select--mode", {},
            ["label", { for: "select--mode" }, "mode: "],
            ["select#select--mode", {},
              ["option", {}, "system"],
              ["option", {}, "light"],
              ["option", {}, "dark"]
            ]
          ]
        ]
      ],
      ["div.quotes", {}, ...quoteItems.map((x) => x.component(x as any))]
    ],
    ["script", { type: "module", src: "/src/quotes.ts" }]
  ]
]
