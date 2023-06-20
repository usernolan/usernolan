import { choices } from "@thi.ng/transducers/choices"


/* NOTE: item interfaces, components */

type Choosable<T> =
  Array<T>
  | Array<[x: T, weight: number]>

interface Item {
  id: string,
  tags?: string[]
}

export interface ImageItem extends Item {
  src: string,
  alt: string
  width: number,
  height: number,
  loading?: string,
  decoding?: string
  spans?: Choosable<number>,
  span?: number,
  hoverSrc?: string
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

const imageFormats = ["avif", "webp"]
const videoFormats = ["webm", "mp4"]

/* TODO: proceduralize image gen */
const imageComponent = ({
  id, src, alt, width, height,
  loading = "lazy", decoding = "async",
  spans = defaultSpans, span,
  tags = [],
  hoverSrc
}: ImageItem) => {
  const classes = Array.from(new Set(tags.concat(["item", "image", hoverSrc ? "hoverable" : ""])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: classes.join(" "),
      ...spanAttrs(spans, span)
    },
    ["picture", {}, ...imageFormats.map((ext) =>
      ["source", { srcset: src.replaceAll("jpeg", ext), type: `image/${ext}` }]),
      ["img", { src, alt, width, height, loading, decoding }]
    ],
    hoverSrc ? [
      "video", {
        muted: true, autoplay: true, loop: true, playsinline: true,
        preload: "auto", width, height, alt
      }, ...videoFormats.map((ext) =>
        ["source", { src: hoverSrc.replaceAll("mp4", ext), type: `video/${ext}` }]),
      ["a", { href: hoverSrc }, hoverSrc]
    ] : null
  ]
}

const quoteComponent = ({
  id, quote, author, tags = []
}: QuoteItem) => {
  const classes = Array.from(new Set(tags.concat(["item", "quote"])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: classes.join(" ")
    },
    ["h2", {}, quote],
    ["p", {}, `—${author}`]
  ]
}

const linkComponent = ({
  id, href, destination, title, author, tags = []
}: LinkItem) => {
  const classes = Array.from(new Set(tags.concat(["item", "link"])))
  return [
    "div",
    {
      id: `item--${id}`,
      class: classes.join(" ")
    },
    ["a", { href },
      ["p", {}, destination],
      ["h2", {}, title],
      author ? ["p", {}, `${author}`] : null
    ]
  ]
}


/* NOTE: items */

/* TODO: revisit ids, alts, filenames */
/* TODO: revisit component field */
/* TODO: add pics */
export const imageItems: Array<ImageItem> = [
  {
    id: "self-1", tags: ["of-me", "heterochrome"],
    src: "/jpeg/smixzy.self.jpeg",
    alt: "Me in my favorite clothes.",
    width: 800, height: 1067,
    loading: "eager",
    span: 2
  },

  {
    id: "self-2", tags: ["of-me", "monochrome"],
    src: "/jpeg/nolan.self.jpeg",
    alt: "Me in grayscale.",
    width: 800, height: 1204,
    loading: "eager"
  },

  {
    id: "persevere", tags: ["artifacts", "monochrome"],
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "clouds", tags: ["nature"],
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds and green foothills.",
    width: 800, height: 600,
    loading: "eager"
  },

  {
    id: "branch", tags: ["nature"],
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "parents", tags: ["of-people"],
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically.",
    width: 800, height: 1015,
    loading: "eager"
  },

  {
    id: "erica", tags: ["of-people"],
    src: "/jpeg/erica.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "louie", tags: ["of-people"],
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "petals", tags: ["nature"],
    src: "/jpeg/petals.jpeg",
    alt: "Pink flower petals gravitating toward a concrete sidewalk.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "pauszeks", tags: ["of-people"],
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "eli", tags: ["of-people"],
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "david", tags: ["of-people"],
    src: "/jpeg/david.jpeg",
    alt: "My sister's partner-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "watching", tags: ["nature"],
    src: "/jpeg/watching.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "bridge", tags: ["nature"],
    src: "/jpeg/bridge.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek.",
    width: 800, height: 1067,
    loading: "eager"
  },

  {
    id: "self-3", tags: ["of-me", "furniture"],
    src: "/jpeg/nm8.self.jpeg",
    alt: "A robot with a 2x4 soul, visibly dissatisfied with its output.",
    width: 800, height: 1067
  },

  {
    id: "at", tags: ["artifacts", "generative", "monochrome"],
    src: "/jpeg/at.jpeg",
    alt: "A three dimensional @ printed in white, black, and mint green PLA.",
    width: 800, height: 1067,
    hoverSrc: "/mp4/at.mp4"
  },

  {
    id: "table", tags: ["drawing", "furniture"],
    src: "/jpeg/table.jpeg",
    alt: "A diagram of a table on graph paper. A potential table.",
    width: 800, height: 1067
  },

  {
    id: "skulls", tags: ["artifacts"],
    src: "/jpeg/skulls.jpeg",
    alt: "Stackable cubic skulls printed in Martha Stewart®-brand PLA. The second greatest gift I've ever received: Martha's memento mori.",
    width: 800, height: 800
  },

  {
    id: "xacto",
    src: "/jpeg/xacto.jpeg",
    alt: "An X-ACTO® knife. Fresh blade.",
    width: 800, height: 1067
  },

  {
    id: "buckets",
    src: "/jpeg/buckets.jpeg",
    alt: "Galvanized steel plumbing pipes and fittings sorted into orange buckets, brought to you by Home Depot®.",
    width: 800, height: 600
  },

  {
    id: "tau",
    src: "/jpeg/tau.jpeg",
    alt: "Unpainted tabletop miniature. Sentient bipedal robot, specifically T'au.",
    width: 800, height: 600
  },

  {
    id: "rug", tags: ["furniture"],
    src: "/jpeg/rug.jpeg",
    alt: "Green rug, white couch, wood table, gray blanket.",
    width: 800, height: 1067
  },

  {
    id: "takach",
    src: "/jpeg/takach.jpeg",
    alt: "Close-up of an etching press registration grid, brought to you by Takach Press®.",
    width: 800, height: 600
  },

  {
    id: "print", tags: ["drawing"],
    src: "/jpeg/print.jpeg",
    alt: "A screen print hanging on the wall above a large manual screen printing press. Super meaningful to whoever took the picture, at least I get that sense.",
    width: 800, height: 1067
  },

  {
    id: "frame",
    src: "/jpeg/frame.jpeg",
    alt: "A multichromatic striped frame sample sitting on construction paper.",
    width: 800, height: 1067
  },

  {
    id: "screw", tags: ["drawing"],
    src: "/jpeg/screw.jpeg",
    alt: "A black ballpoint pen drawing on white graph paper. A vaguely humanoid assemblage of shapes with screw-like rod arms, a stacked box torso, smooth pipe legs, and a plastic floret head. It's worshipping a biblically accurate screw of enormous proportion. In this world, even the most basic fasteners are much larger than people.",
    width: 800, height: 1067
  },

  {
    id: "fourth-avenue", tags: ["concrete"],
    src: "/jpeg/fourth-avenue.jpeg",
    alt: "A blue Werner® ladder waiting for the subway at 4th Avenue.",
    width: 800, height: 1067
  },

  {
    id: "graphite", tags: ["drawing"],
    src: "/jpeg/graphite.jpeg",
    alt: "A rough graphite sketch of a detached plot of land floating in space, populated by tree-sized lollipops.",
    width: 800, height: 621
  },

  {
    id: "frames",
    src: "/jpeg/frames.jpeg",
    alt: "A pile of candidate frame samples in front of an entire wall of more frame samples.",
    width: 800, height: 1067
  },

  {
    id: "pack",
    src: "/jpeg/pack.jpeg",
    alt: "A pristine dyneema fanny pack.",
    width: 800, height: 1067
  },

  {
    id: "di", tags: ["of-people", "dumpsters"],
    src: "/jpeg/di.jpeg",
    alt: "The greatest mother to have ever done it hauling her offspring's garbage through Home Depot®.",
    width: 800, height: 1067
  },

  {
    id: "concrete", tags: ["concrete", "heterochrome"],
    src: "/jpeg/concrete.jpeg",
    alt: "Soft concrete.",
    width: 800, height: 800
  },

  {
    id: "ass", tags: ["bad-words", "post-its"],
    src: "/jpeg/ass.jpeg",
    alt: "A purple Post-it® with 'ASS DRAG' written on it in caps lock. There's so much more where this came from.",
    width: 800, height: 800
  },

  {
    id: "send-nudes", tags: ["concrete", "dumpsters", "bad-words"],
    src: "/jpeg/send-nudes.jpeg",
    alt: "A quintessential United States Postal Service® mailbox with 'SEND NUDES' painted on the side, right above the logo.",
    width: 800, height: 801
  },

  {
    id: "instaworthy", tags: ["bad-words"],
    src: "/jpeg/instaworthy.jpeg",
    alt: "An Instagram®-worthy bedside table with 'SHIT IN MY MOUTH' lovingly expressed on the signboard.",
    width: 800, height: 1000
  },

  {
    id: "fnd-ur-way", tags: ["bad-words"],
    src: "/jpeg/fnd-ur-way.jpeg",
    alt: "A hand-drawn sticker on a road sign that says 'FND UR WAY' under a skull with a staircase leading into the brain compartment.",
    width: 800, height: 1067
  },

  {
    id: "face", tags: ["concrete", "bad-words", "monochrome"],
    src: "/jpeg/face.jpeg",
    alt: "The word 'FACE' permanently etched into a concrete sidewalk.",
    width: 800, height: 800
  },

  {
    id: "sunglasses", tags: ["of-people", "concrete"],
    src: "/jpeg/sunglasses.jpeg",
    alt: "The sidewalk shadows of two people holding heart-shaped sunglasses up to sunlight.",
    width: 800, height: 1067
  },

  {
    id: "intersection", tags: ["concrete"],
    src: "/jpeg/intersection.jpeg",
    alt: "Shoegazing at an intersection in the sidewalk.",
    width: 800, height: 1067
  },

  {
    id: "theme-provider", tags: ["drawing", "post-its", "heterochrome"],
    src: "/jpeg/theme-provider.jpeg",
    alt: "4 partially overlapping, heavily backlit bright pink Post-it® notes.",
    width: 800, height: 1066
  },

  {
    id: "dumpstergram", tags: ["dumpsters"],
    src: "/jpeg/dumpstergram.jpeg",
    alt: "Two dumpsters in the middle of the woods. Unparalleled vibe.",
    width: 800, height: 1067
  },

  {
    id: "post-it", tags: ["post-its", "heterochrome"],
    src: "/jpeg/post-it.jpeg",
    alt: "A closeup of Post-it® notes with more Post-it® notes in the background; not to brag but it's a fresh cabinet pack of Helsinki-themed Greener Notes.",
    width: 800, height: 605
  },

  {
    id: "sky", tags: ["nature"],
    src: "/jpeg/sky.jpeg",
    alt: "Purple night clouds hushing a busy street.",
    width: 800, height: 600
  },

  {
    id: "twig", tags: ["nature", "heterochrome"],
    src: "/jpeg/twig.jpeg",
    alt: "Closeup of a twig.",
    width: 800, height: 1067
  },

  {
    id: "thrift", tags: ["of-people", "heterochrome"],
    src: "/jpeg/thrift.jpeg",
    alt: "Maximum thrift store saturation.",
    width: 800, height: 800
  },

  {
    id: "manifold", tags: ["drawing", "heterochrome"],
    src: "/jpeg/manifold.jpeg",
    alt: "Sketched amorphous manifold of blue, pink, and green ink.",
    width: 800, height: 800
  },

  {
    id: "coral", tags: ["drawing", "heterochrome"],
    src: "/jpeg/coral.jpeg",
    alt: "Scattered ink-encoded coral.",
    width: 800, height: 1067
  },

  {
    id: "chalk", tags: ["drawing", "concrete", "heterochrome"],
    src: "/jpeg/chalk.jpeg",
    alt: "Sidewalk chalk portal to outer space.",
    width: 800, height: 660
  },

  {
    id: "spray-paint", tags: ["concrete", "heterochrome"],
    src: "/jpeg/spray-paint.jpeg",
    alt: "Spray paint blasted onto the sidewalk during construction.",
    width: 800, height: 800
  },

  {
    id: "monolith", tags: ["concrete", "furniture"],
    src: "/jpeg/monolith.jpeg",
    alt: "A concrete sidewalk monolith optimized for resting up to four asscheeks.",
    width: 800, height: 800
  },

  {
    id: "cable", tags: ["concrete", "bad-words"],
    src: "/jpeg/cable.jpeg",
    alt: "A classic mixup between the street lighting and television cable factions.",
    width: 800, height: 801
  },

  {
    id: "prof-hos", tags: ["of-people", "concrete"],
    src: "/jpeg/mark.jpeg",
    alt: "Prof. Hos.!!!",
    width: 800, height: 1067
  },

  {
    id: "self-4", tags: ["of-me", "generative", "monochrome", "invertible"],
    src: "/png/Oe.self.png",
    alt: "A selectively randomized, poorly pixelized sapiens approximate peeking out of a previously sealed box.",
    width: 1216, height: 1331
  },

  {
    id: "scad", tags: ["generative"],
    src: "/png/scad.png",
    alt: "A 3D CAD workspace populated with a repeating sinusoidal wave colorized according to coordinate.",
    width: 3584, height: 1599
  },

  {
    id: "170", tags: ["generative", "monochrome", "invertible"],
    src: "/png/rule.170.png",
    alt: "Rule 170: 1D cellular automaton with range = 1, where cells are shaped like keyholes, but I think it's bugged. If you stare long enough it looks like a waterfall and starts to move.",
    width: 1200, height: 1200
  },

  {
    id: "era", tags: ["nature", "generative", "monochrome"],
    src: "/png/rule.era.png",
    alt: "Imperfectly pixelated flowers falling out of high-contrast background noise.",
    width: 1031, height: 1500
  },

  {
    id: "green", tags: ["generative"],
    src: "/png/rule.green.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; energetic green background.",
    width: 810, height: 1015
  },

  {
    id: "pink", tags: ["generative"],
    src: "/png/rule.pink.png",
    alt: "A grid of thin vertical lines with a unique fingerprint identified by empty grid coordinates; pale-hot pink background.",
    width: 810, height: 1015
  },

  {
    id: "blue", tags: ["generative"],
    src: "/png/rule.blue.png",
    alt: "I think this is a poor approximation of rule 99; ultra blue background.",
    width: 1200, height: 2800
  },

  {
    id: "stairs", tags: ["generative", "monochrome"],
    src: "/png/rule.stairs.png",
    alt: "Two bright perfectoids conversing in a noisy universe.",
    width: 500, height: 748
  },

  {
    id: "150", tags: ["generative", "monochrome", "invertible"],
    src: "/png/rule.150.png",
    alt: "Rule 150, I think.",
    width: 1200, height: 1200
  },

  {
    id: "sidewalk", tags: ["nature", "concrete", "monochrome"],
    src: "/jpeg/sidewalk.jpeg",
    alt: "Construction-filtered sunlight projecting a binary pattern on the sidewalk.",
    width: 800, height: 800
  },

  {
    id: "spill", tags: ["monochrome"],
    src: "/jpeg/spill.jpeg",
    alt: "The softest, most gorgeous spill you've ever faced.",
    width: 800, height: 800
  },

  {
    id: "stained", tags: ["concrete", "heterochrome"],
    src: "/jpeg/stained.jpeg",
    alt: "Neon-stained sandstone.",
    width: 800, height: 1067
  },

  {
    id: "martini",
    src: "/jpeg/martini.jpeg",
    alt: "A martini efficiently brokering photons.",
    width: 800, height: 1067
  },

  {
    id: "midway", tags: ["heterochrome"],
    src: "/jpeg/midway.jpeg",
    alt: "The ultraheterochromatic hallway of Midway International Airport.",
    width: 800, height: 600
  },

  {
    id: "truck", tags: ["nature", "dumpsters"],
    src: "/jpeg/truck.jpeg",
    alt: "A yellow haul truck on the beach.",
    width: 800, height: 800
  },

  {
    id: "cups",
    src: "/jpeg/turrell.cups.jpeg",
    alt: "Two big gulps discussing Twilight Epiphany.",
    width: 800, height: 1067
  },

  {
    id: "epiphany",
    src: "/jpeg/turrell.pink.jpeg",
    alt: "Pink angles.",
    width: 800, height: 1067
  },

  {
    id: "universal-rectifier", tags: ["bad-words"],
    src: "/jpeg/universal-rectifier.jpeg",
    alt: "A Universal Rectifiers, Inc.® Cathodic Protection Rectifier. A Hometown American Product.",
    width: 800, height: 800
  },

  {
    id: "observation", tags: ["of-me"],
    src: "/jpeg/turrell.self.jpeg",
    alt: "Observing observation",
    width: 800, height: 1067
  }
]

const linkItems: Array<LinkItem> = [
  {
    id: "the-mess-were-in", tags: ["technology"],
    href: "https://youtu.be/lKXe3HUG2l4",
    destination: "youtube",
    title: "The Mess We're In",
    author: "Joe Armstrong"
  },

  {
    id: "cool-uris", tags: ["technology", "philosophy"],
    href: "https://www.w3.org/Provider/Style/URI",
    destination: "w3.org",
    title: "Cool URIs don't change.",
    author: "Tim BL"
  },

  /* TODO: are we there yet */

  {
    id: "the-language-of-the-system", tags: ["technology"],
    href: "https://youtu.be/ROor6_NGIWU",
    destination: "youtube",
    title: "The Language of the System",
    author: "Rich Hickey"
  },

  {
    id: "the-value-of-values", tags: ["technology", "philosophy"],
    href: "https://youtu.be/-6BsiVyC1kM",
    destination: "youtube",
    title: "The Value of Values",
    author: "Rich Hickey"
  },

  {
    id: "just-hard-fail-it", tags: ["technology", "philosophy"],
    href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/",
    destination: "usenix",
    title: "Just hard-fail it.",
    author: "James Hamilton"
  },

  {
    id: "worse-is-better", tags: ["technology", "philosophy"],
    href: "https://www.dreamsongs.com/RiseOfWorseIsBetter.html",
    destination: "website",
    title: "Worse is Better",
    author: "Richard Gabriel"
  },

  {
    id: "how-to-sweep", tags: ["philosophy"],
    href: "https://youtu.be/Kt-VlZpz-8E",
    destination: "youtube",
    title: "How to Sweep.",
    author: "Tom Sachs"
  },

  {
    id: "thi-ng", tags: ["technology"],
    href: "https://thi.ng/",
    destination: "website",
    title: "thi.ng",
    author: "Karsten Schmidt"
  },

  {
    id: "mark", tags: ["artist"],
    href: "https://sugarboypress.com/",
    destination: "website",
    title: ".• Mark Hosford"
  },

  {
    id: "hilma", tags: ["artist"],
    href: "https://en.wikipedia.org/wiki/Hilma_af_Klint",
    destination: "wikipedia",
    title: ".• Hilma af Klint"
  },

  {
    id: "kandinsky", tags: ["artist"],
    href: "https://en.wikipedia.org/wiki/Wassily_Kandinsky",
    destination: "wikipedia",
    title: ".• Kandinsky"
  },


  {
    id: "moebius", tags: ["artist", "comic"],
    href: "https://www.moebius.fr/Les-Collections.html",
    destination: "website",
    title: ".• Moebius"
  },

  {
    id: "caza", tags: ["artist", "comic"],
    href: "https://en.wikipedia.org/wiki/Caza",
    destination: "wikipedia",
    title: ".• Caza"
  },

  {
    id: "ulises-farinas", tags: ["artist", "comic"],
    href: "https://ulisesfarinas.com/",
    destination: "website",
    title: ".• Ulises Fariñas"
  },

  {
    id: "john-vermilyea", tags: ["artist", "comic"],
    href: "http://www.jonvermilyea.com/",
    destination: "website",
    title: ".• Jon Vermilyea"
  },

  {
    id: "anders-nilsen", tags: ["artist", "comic"],
    href: "https://www.andersbrekhusnilsen.com/booksandcomics",
    destination: "website",
    title: ".• Anders Nilsen"
  },

  {
    id: "jesse-jacobs", tags: ["artist", "comic"],
    href: "https://www.jessejacobsart.com/",
    destination: "website",
    title: ".• Jesse Jacobs"
  },

  {
    id: "minjeong-an", tags: ["artist"],
    href: "http://www.myartda.com/",
    destination: "website",
    title: ".• Minjeong An"
  },

  {
    id: "terry-a-davis", tags: ["technology", "philosophy", "artist"],
    href: "https://youtu.be/XkXPqvWJHg4",
    destination: "youtube",
    title: ".• Terry A. Davis"
  },

  {
    id: "toxi", tags: ["technology", "artist"],
    href: "https://mastodon.thi.ng/@toxi",
    destination: "mastodon",
    title: ".• Karsten Schmidt"
  },

  {
    id: "devine-lu-linvega", tags: ["technology", "philosophy", "artist"],
    href: "https://wiki.xxiivv.com/site/dinaisth.html",
    destination: "website",
    title: ".• Devine Lu Linvega"
  },

  {
    id: "cakebread", tags: ["technology", "artist"],
    href: "http://www.quantumrain.com/",
    destination: "website",
    title: ".• Stephen Cakebread"
  },

  {
    id: "mereology", tags: ["philosophy", "idea"],
    href: "https://en.wikipedia.org/wiki/Mereology",
    destination: "wikipedia",
    title: ".Mereology"
  },

  {
    id: "sequent-calculus", tags: ["idea"],
    href: "https://en.wikipedia.org/wiki/Sequent_calculus",
    destination: "wikipedia",
    title: ".Sequent Calculus"
  },

  {
    id: "algebraic-structure", tags: ["idea"],
    href: "https://en.wikipedia.org/wiki/Algebraic_structure",
    destination: "wikipedia",
    title: ".Algebraic Structure"
  },

  /* TODO: synchronicity */

  {
    id: "schismogenesis", tags: ["idea"],
    href: "https://en.wikipedia.org/wiki/Schismogenesis",
    destination: "wikipedia",
    title: ".Schismogenesis"
  },

  {
    id: "information", tags: ["philosophy", "idea"],
    href: "https://en.wikipedia.org/wiki/Information_theory",
    destination: "wikipedia",
    title: ".Information"
  },

  {
    id: "process", tags: ["philosophy", "idea"],
    href: "https://en.wikipedia.org/wiki/Process_philosophy",
    destination: "wikipedia",
    title: ".Process"
  },

  {
    id: "bohm", tags: ["philosophy"],
    href: "https://en.wikipedia.org/wiki/David_Bohm",
    destination: "wikipedia",
    title: ".Bohm"
  },

  {
    id: "webring",
    href: "https://webring.xxiivv.com/",
    destination: "website",
    title: "{ webring }"
  }
]

const quoteItems: Array<QuoteItem> = [
  {
    id: "claude",
    quote: "My greatest concern was what to call it.",
    author: "Claude Shannon"
  },

  {
    id: "rich",
    quote: "We don't get to stop the world, especially not to observe it.",
    author: "Rich Hickey"
  },

  {
    id: "chris-a",
    quote: "The wholeness is made of parts, the parts are created by the wholeness.",
    author: "Christopher Alexander"
  },

  {
    id: "logistic-map",
    quote: "Unpredictability is not randomness, but in some circumstances looks very much like it.",
    author: "Wikipedia; Logistic Map"
  },

  {
    id: "anw-1",
    quote: "One main factor in the upward trend of animal life has been the power of wandering.",
    author: "Alfred North Whitehead"
  },

  {
    id: "anw-2",
    quote: "Unlimited possibility and abstract creativity can procure nothing.",
    author: "Alfred North Whitehead"
  },

  {
    id: "anw-3",
    quote: "A science that hesitates to forget its founders is lost.",
    author: "Alfred North Whitehead"
  },

  {
    id: "anw-4",
    quote: "We think in generalities, but we live in details.",
    author: "Alfred North Whitehead"
  },

  {
    id: "fifield",
    quote: "Answer is the dead stop.",
    author: "William Fifield"
  },

  {
    id: "rs",
    quote: "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it.",
    author: "R.S."
  },

  {
    id: "quine",
    quote: "Everything worth saying, and everything else as well, can be said with two characters.",
    author: "Quine"
  },

  {
    id: "blizzard",
    quote: "Stay awhile, and listen.",
    author: "Deckard Cain"
  },

  {
    id: "twobfc",
    quote: "You play through that.",
    author: "2BFC"
  }
]


/* NOTE: document components */

const fontHrefRoot = "https://fonts.googleapis.com/css2?family="
const fontHref = fontHrefRoot + "Inter:wght@400;700&display=swap"

const head = (title: string) => [
  "head", {},
  ["meta", { charset: "UTF-8" }],
  ["title", title],
  ["link", { rel: "icon", href: "/favicon.ico", sizes: "any" }],
  ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  ["meta", { name: "viewport", content: "width=device-width,initial-scale=1.0" }],
  ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
  ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true }],
  ["link", { rel: "preload", as: "style", href: fontHref }],
  ["link", { rel: "stylesheet", media: "print", onload: "this.onload=null;this.removeAttribute('media');", href: fontHref }],
  ["noscript", ["link", { rel: "stylesheet", href: fontHref }]],
  ["meta", { name: "description", content: ".·" }],
  ["meta", { property: "og:title", content: title }],
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:url", content: "https://usernolan.net" }],
  ["meta", { property: "og:image", content: "https://usernolan.net/jpeg/smixzy.self.jpeg" }]
]

const modeSelect = [
  "div.select--mode", {},
  ["label", { for: "select--mode" }, "mode: "],
  ["select#select--mode", {},
    ["option", {}, "system"],
    ["option", {}, "light"],
    ["option", {}, "dark"]
  ]
]

export const index = [
  ["!DOCTYPE", "html"],
  ["html", { lang: "en" },
    head("nolan"),
    ["body", {},
      [
        "main", {},
        ["div.header", {},
          ["h1", {}, "i'm nolan"],
          ["div.controls", {}, modeSelect]
        ],
        ["div.images", {}, imageComponent(imageItems[0])],
        ["div.links", {},
          ["a", { href: "/images/" }, "images"],
          ["a", { href: "/links/" }, "links"],
          ["a", { href: "/quotes/" }, "quotes"],
          ["a", { href: "/pdf/resume.pdf", target: "_blank" }, "cv"]
        ],
        ["p", {},
          `I build sketchy websites and primitive furniture. They're beautiful
in the same way my sister's dog is beautiful; I promise they're beautiful.`],
      ],
      ["script", { type: "module", src: "/src/index.ts" }]
    ]
  ]
]

export const images = [
  ["!DOCTYPE", "html"],
  ["html", { lang: "en" },
    head("nolan - images"),
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
            modeSelect
          ]
        ],
        ["div.images", {}, ...imageItems.map(imageComponent)]
      ],
      ["script", { type: "module", src: "/src/images.ts" }]
    ]
  ]
]

export const links = [
  ["!DOCTYPE", "html"],
  ["html", { lang: "en" },
    head("nolan - links"),
    ["body", {},
      ["main.links", {},
        ["div.header", {},
          ["a", { href: "/" }, "home"],
          ["div.controls", {},
            ["div.select--filter", {},
              ["label", { for: "select--filter" }, "filter: "],
              ["select#select--filter", {},
                ["option", {}, "all"],
                ["option", {}, "technology"],
                ["option", {}, "philosophy"],
                ["option", {}, "artist"],
                ["option", {}, "comic"],
                ["option", {}, "idea"]
              ]
            ],
            modeSelect
          ]
        ],
        ["div.links", {}, ...linkItems.map(linkComponent)]
      ],
      ["script", { type: "module", src: "/src/links.ts" }]
    ]
  ]
]

export const quotes = [
  ["!DOCTYPE", "html"],
  ["html", { lang: "en" },
    head("nolan - quotes"),
    ["body", {},
      ["main.quotes", {},
        ["div.header", {},
          ["a", { href: "/" }, "home"],
          ["div.controls", {}, modeSelect]
        ],
        ["div.quotes", {}, ...quoteItems.map(quoteComponent)]
      ],
      ["script", { type: "module", src: "/src/index.ts" }]
    ]
  ]
]
