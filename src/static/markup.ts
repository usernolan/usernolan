/* NOTE: item interfaces, components */

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

const imageFormats = ["avif", "webp"]
const videoFormats = ["webm", "mp4"]

/* TODO: proceduralize image gen */
const imageComponent = ({
  id, src, alt, width, height, span, hoverSrc,
  loading = "lazy", decoding = "async", tags = []
}: ImageItem) => {
  const classes = Array.from(new Set(["image", ...(hoverSrc ? ["hoverable"] : [])].concat(tags)))
  return [
    "div",
    {
      id: `image--${id}`,
      class: classes.join(" "),
      ...{ "data-span": span || null }
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
  const classes = Array.from(new Set(["quote"].concat(tags)))
  return [
    "div",
    {
      id: `quote--${id}`,
      class: classes.join(" ")
    },
    ["h2", {}, quote],
    ["p", {}, `${author}`]
  ]
}

const linkComponent = ({
  id, href, destination, title, author, tags = []
}: LinkItem) => {
  const classes = Array.from(new Set(["link"].concat(tags)))
  return [
    "div",
    {
      id: `link--${id}`,
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
    id: "nolan-6", tags: ["of-me"],
    src: "/jpeg/nolan.6.jpeg",
    alt: "Me eating soup at Han Bat.",
    width: 800, height: 1067,
    span: 2
  },

  {
    id: "nolan-1", tags: ["of-me", "heterochrome"],
    src: "/jpeg/nolan.1.jpeg",
    alt: "Me in my favorite clothes.",
    width: 800, height: 1067,
  },

  {
    id: "nolan-2", tags: ["of-me", "monochrome"],
    src: "/jpeg/nolan.2.jpeg",
    alt: "Me in grayscale.",
    width: 800, height: 1204,
  },

  {
    id: "persevere", tags: ["artifacts", "bad-words", "monochrome"],
    src: "/jpeg/persevere.jpeg",
    alt: "A large poster on an empty wall that reads 'PERSEVERE' in painted lettering.",
    width: 800, height: 1067,
  },

  {
    id: "clouds", tags: ["nature"],
    src: "/jpeg/clouds.jpeg",
    alt: "Heavy clouds and green foothills.",
    width: 800, height: 600,
  },

  {
    id: "branch", tags: ["nature"],
    src: "/jpeg/branch.jpeg",
    alt: "A branch of a tree that seems to branch indefinitely.",
    width: 800, height: 1067,
  },

  {
    id: "parents", tags: ["of-people"],
    src: "/jpeg/parents.jpeg",
    alt: "My parents interacting extremely typically.",
    width: 800, height: 1015,
  },

  {
    id: "erica-1", tags: ["of-people"],
    src: "/jpeg/erica.1.jpeg",
    alt: "My sister across the table taking a picture of me taking a picture of her, which is this picture.",
    width: 800, height: 1067,
  },

  {
    id: "louie", tags: ["of-people"],
    src: "/jpeg/louie.jpeg",
    alt: "My dog in the passenger seat politely requesting attention.",
    width: 800, height: 1067,
  },

  {
    id: "petals", tags: ["nature", "concrete"],
    src: "/jpeg/petals.jpeg",
    alt: "Pink flower petals gravitating toward a concrete sidewalk.",
    width: 800, height: 1067,
  },

  {
    id: "pauszeks", tags: ["of-people"],
    src: "/jpeg/pauszeks.jpeg",
    alt: "Two brothers walking through a small mountain town with fresh coffee; one peace sign, one cheers.",
    width: 800, height: 1067,
  },

  {
    id: "eli", tags: ["of-people"],
    src: "/jpeg/eli.jpeg",
    alt: "Black sand washing into cloudy Pacific infinity; a familiar bummer in the foreground utterly ruining the shot.",
    width: 800, height: 1067,
  },

  {
    id: "david", tags: ["of-people"],
    src: "/jpeg/david.jpeg",
    alt: "My sister's partner-of-significant-duration (my brother-in-vibe?) flaunting nothing on the way back from a rickety vantage overlooking a suburb of Los Angeles.",
    width: 800, height: 1067,
  },

  {
    id: "watching-1", tags: ["nature"],
    src: "/jpeg/watching.1.jpeg",
    alt: "A lonely closed-circuit camera surveilling an empty parking lot labeled Lot P.",
    width: 800, height: 1067,
  },

  {
    id: "bridge-1", tags: ["nature"],
    src: "/jpeg/bridge.1.jpeg",
    alt: "Admiring my shoes on a narrow bridge above a rapid creek.",
    width: 800, height: 1067,
  },

  {
    id: "nolan-3", tags: ["of-me", "furniture"],
    src: "/jpeg/nolan.3.jpeg",
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
    id: "four-avenue", tags: ["concrete"],
    src: "/jpeg/four-avenue.jpeg",
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
    id: "di-1", tags: ["of-people"],
    src: "/jpeg/di.1.jpeg",
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
    id: "ass-drag", tags: ["bad-words", "post-its"],
    src: "/jpeg/ass-drag.jpeg",
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
    id: "shit-in-my-mouth", tags: ["bad-words"],
    src: "/jpeg/shit-in-my-mouth.jpeg",
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
    id: "dumpstergrams", tags: ["dumpsters"],
    src: "/jpeg/dumpstergrams.jpeg",
    alt: "Two dumpsters in the middle of the woods. Unparalleled vibe.",
    width: 800, height: 1067
  },

  {
    id: "post-it-1", tags: ["post-its", "heterochrome"],
    src: "/jpeg/post-it.1.jpeg",
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
    id: "stained", tags: ["concrete", "heterochrome"],
    src: "/jpeg/stained.jpeg",
    alt: "Neon-stained sandstone.",
    width: 800, height: 1067
  },

  {
    id: "nolan-4", tags: ["of-me", "generative", "monochrome", "invertible"],
    src: "/png/nolan.4.png",
    alt: "A selectively randomized, poorly pixelized sapiens approximate peeking out of a previously sealed box.",
    width: 1216, height: 1331
  },

  {
    id: "170", tags: ["generative", "monochrome", "invertible"],
    src: "/png/rule.170.png",
    alt: "Rule 170: 1D cellular automaton with range = 1, where cells are shaped like keyholes, but I think it's bugged. If you stare long enough it looks like a waterfall and starts to move.",
    width: 1200, height: 1200
  },

  {
    id: "150", tags: ["generative", "monochrome", "invertible"],
    src: "/png/rule.150.png",
    alt: "Rule 150, I think.",
    width: 1200, height: 1200
  },

  {
    id: "scad", tags: ["generative"],
    src: "/png/scad.png",
    alt: "A 3D CAD workspace populated with a repeating sinusoidal wave colorized according to coordinate.",
    width: 3584, height: 1599
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
    id: "era", tags: ["nature", "generative", "monochrome"],
    src: "/png/rule.era.png",
    alt: "Imperfectly pixelated flowers falling out of high-contrast background noise.",
    width: 1031, height: 1500
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
    src: "/jpeg/turrell.nolan.jpeg",
    alt: "Observing observation",
    width: 800, height: 1067
  },

  {
    id: "nolan-5", tags: ["of-me"],
    src: "/jpeg/nolan.5.jpeg",
    alt: "Me hugging a massive neon flamingo you'd only find in Las Vegas.",
    width: 800, height: 1423
  },

  {
    id: "mamnoon-1",
    src: "/jpeg/mamnoon.1.jpeg",
    alt: "Neon shelves.",
    width: 800, height: 1067
  },

  {
    id: "karnage-kube", tags: ["bad-words"],
    src: "/jpeg/karnage-kube.jpeg",
    alt: "A bottle of wine named Karnage Kube.",
    width: 800, height: 1067
  },

  {
    id: "voidz",
    src: "/jpeg/voidz.jpeg",
    alt: "The lead guitarist of The Voidz lit in RGB, out of focus.",
    width: 800, height: 1067
  },

  {
    id: "bookshelf", tags: ["furniture"],
    src: "/jpeg/bookshelf.jpeg",
    alt: "A wall-sized bookshelf made out of plywood and plumbing pipes against brick.",
    width: 800, height: 1067
  },

  {
    id: "cutting-mat", tags: ["furniture"],
    src: "/jpeg/cutting-mat.jpeg",
    alt: "A massive black cutting mat on desk wood with a 1 inch grid.",
    width: 800, height: 1067
  },

  {
    id: "one-way", tags: ["nature", "bad-words"],
    src: "/jpeg/one-way.jpeg",
    alt: "A fence for shepharding hikers with a 'ONE WAY' sign hanging by a thread.",
    width: 800, height: 1067
  },

  {
    id: "postage", tags: ["nature", "dumpsters"],
    src: "/jpeg/postage.jpeg",
    alt: "A singular unaddressed mailbox in front of a crumbling, overgrown stone wall.",
    width: 800, height: 1067
  },

  {
    id: "cave-stairs", tags: ["nature"],
    src: "/jpeg/cave-stairs.jpeg",
    alt: "A stairway leading out of a dark cave toward bright sunlight.",
    width: 800, height: 1067
  },

  {
    id: "bed-yarn",
    src: "/jpeg/bed-yarn.jpeg",
    alt: "The yarn package manager running installation on a bedside laptop at night.",
    width: 800, height: 800
  },

  {
    id: "mbp", tags: ["furniture"],
    src: "/jpeg/mbp.jpeg",
    alt: "A pristine macbook on an acrylic surface.",
    width: 800, height: 1067
  },

  {
    id: "moraine", tags: ["nature"],
    src: "/jpeg/moraine.jpeg",
    alt: "Shoegazing at lake moraine.",
    width: 800, height: 1067
  },

  {
    id: "banff", tags: ["nature"],
    src: "/jpeg/banff.jpeg",
    alt: "The summit of a hike I wasn't prepared for.",
    width: 800, height: 1067
  },

  {
    id: "nz", tags: ["nature"],
    src: "/jpeg/nz.jpeg",
    alt: "The rolling hills of New Zealand.",
    width: 800, height: 600
  },

  {
    id: "chromacreek", tags: ["nature", "heterochrome"],
    src: "/jpeg/chromacreek.jpeg",
    alt: "A supersaturated mountain creek.",
    width: 800, height: 1067
  },

  {
    id: "mamnoon-2", tags: ["heterochrome"],
    src: "/jpeg/mamnoon.2.jpeg",
    alt: "A colorful translucent awning.",
    width: 800, height: 1067
  },

  {
    id: "orbitals", tags: ["drawing", "heterochrome"],
    src: "/jpeg/orbitals.jpeg",
    alt: "Oil pastel and acrylic ink in orbital concentric circles.",
    width: 800, height: 1067
  },

  {
    id: "far-fetched", tags: ["artifacts", "bad-words"],
    src: "/jpeg/far-fetched.jpeg",
    alt: "A colorloaded poster by Jesse Jacobs that says 'FAR FETCHED'.",
    width: 800, height: 1067
  },

  {
    id: "pencil-dust", tags: ["drawing"],
    src: "/jpeg/pencil-dust.jpeg",
    alt: "Omnichromal colored pencil shavings amassed in a growing pile.",
    width: 800, height: 1067
  },

  {
    id: "di-2", tags: ["of-people"],
    src: "/jpeg/di.2.jpeg",
    alt: "Diane arriving at her favorite restaurant for dinner.",
    width: 800, height: 800
  },

  {
    id: "chuks",
    src: "/jpeg/chuks.jpeg",
    alt: "Go to tacos chukis if you're in Seattle.",
    width: 800, height: 800
  },

  {
    id: "daisies", tags: ["nature"],
    src: "/jpeg/daisies.jpeg",
    alt: "Daisies speckling tall grass.",
    width: 800, height: 1067
  },

  {
    id: "bridge-2", tags: ["nature"],
    src: "/jpeg/bridge.2.jpeg",
    alt: "Admiring my shoes on a log bridge over a lush creek.",
    width: 800, height: 1067
  },

  {
    id: "tim", tags: ["of-people", "nature"],
    src: "/jpeg/tim.jpeg",
    alt: "A portal made of sticks into a sacred grove, apparently; Tim checking it out.",
    width: 800, height: 1067
  },

  {
    id: "coast", tags: ["nature"],
    src: "/jpeg/coast.jpeg",
    alt: "Looking at my shoes overlooking a rocky coast.",
    width: 800, height: 1067
  },

  {
    id: "trash", tags: ["bad-words", "monochrome"],
    src: "/jpeg/trash.jpeg",
    alt: "A sign that reads 'PLEASE DO NOT PUT TRASH IN TOILETS, IT IS EXTREMELY DIFFICULT TO GET OUT'.",
    width: 800, height: 600
  },

  {
    id: "bird-house", tags: ["nature"],
    src: "/jpeg/bird-house.jpeg",
    alt: "An extremely high-traffic bird house next to a quiet river.",
    width: 800, height: 1067
  },

  {
    id: "crater-lake", tags: ["nature"],
    src: "/jpeg/crater-lake.jpeg",
    alt: "The sky inverted against crater lake.",
    width: 800, height: 1067
  },

  {
    id: "watching-2", tags: ["monochrome"],
    src: "/jpeg/watching.2.jpeg",
    alt: "A closed-circuit camera surveilling an empty school during summer break.",
    width: 800, height: 879
  },

  {
    id: "watching-3", tags: ["monochrome"],
    src: "/jpeg/watching.3.jpeg",
    alt: "A closed-circuit camera surrounded by graffiti watching for vandals.",
    width: 800, height: 1066
  },

  {
    id: "hydrant-1", tags: ["concrete", "dumpsters"],
    src: "/jpeg/hydrant.1.jpeg",
    alt: "A blue-capped fire hydrant planted within the textures of crossing the street.",
    width: 800, height: 800
  },

  {
    id: "arboretum", tags: ["nature", "heterochrome"],
    src: "/jpeg/arboretum.jpeg",
    alt: "Trees in an arboretum, where they clearly belong.",
    width: 800, height: 1067
  },

  {
    id: "hot-sauce-and-panko", tags: ["bad-words", "heterochrome"],
    src: "/jpeg/hot-sauce-and-panko.jpeg",
    alt: "A streetcorner restaurant sign that says 'HOT SAUCE AND PANKO'.",
    width: 800, height: 1067
  },

  {
    id: "infinity-repeating", tags: ["nature", "heterochrome"],
    src: "/jpeg/infinity-repeating.jpeg",
    alt: "A seemingly prehistoric succulent among dozens of identical siblings.",
    width: 800, height: 1067
  },

  {
    id: "hydrant-2", tags: ["concrete", "dumpsters"],
    src: "/jpeg/hydrant.2.jpeg",
    alt: "A chrome fire hydrant emerging from angular concrete.",
    width: 800, height: 1067
  },

  {
    id: "cowboy-1", tags: ["of-people", "nature"],
    src: "/jpeg/cowboy.1.jpeg",
    alt: "Cowboy taking a shit.",
    width: 800, height: 947
  },

  {
    id: "hydrant-3", tags: ["nature", "concrete", "dumpsters"],
    src: "/jpeg/hydrant.3.jpeg",
    alt: "A yellow fire hydrant sprouting out of tall grass.",
    width: 800, height: 1059
  },

  {
    id: "post-it-2", tags: ["post-its"],
    src: "/jpeg/post-it.2.jpeg",
    alt: "A mostly full box of Helsinki-themed Post-it® notes, like pastel steps to the gates of the mind.",
    width: 800, height: 800
  },

  {
    id: "sidewalk-dot", tags: ["concrete"],
    src: "/jpeg/sidewalk-dot.jpeg",
    alt: "Sidewalk textures.",
    width: 800, height: 1067
  },

  {
    id: "erica-2", tags: ["of-people", "nature"],
    src: "/jpeg/erica.2.jpeg",
    alt: "Erica decked out in dog park apparel.",
    width: 800, height: 1067
  },

  {
    id: "cowboy-2", tags: ["of-people"],
    src: "/jpeg/cowboy.2.jpeg",
    alt: "Cowmin at the dog park.",
    width: 800, height: 959
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
    id: "cool-uris", tags: ["technology", "ideas"],
    href: "https://www.w3.org/Provider/Style/URI",
    destination: "w3.org",
    title: "Cool URIs don't change",
    author: "Tim BL"
  },

  {
    id: "how-to-sweep", tags: ["ideas"],
    href: "https://youtu.be/Kt-VlZpz-8E",
    destination: "youtube",
    title: "How to Sweep.",
    author: "Tom Sachs"
  },

  {
    id: "the-value-of-values", tags: ["technology"],
    href: "https://youtu.be/-6BsiVyC1kM",
    destination: "youtube",
    title: "The Value of Values",
    author: "Rich Hickey"
  },

  {
    id: "the-language-of-the-system", tags: ["technology"],
    href: "https://youtu.be/ROor6_NGIWU",
    destination: "youtube",
    title: "The Language of the System",
    author: "Rich Hickey"
  },

  {
    id: "just-hard-fail-it", tags: ["technology", "ideas"],
    href: "https://www.usenix.org/legacy/event/lisa07/tech/full_papers/hamilton/hamilton_html/",
    destination: "usenix",
    title: "Just hard-fail it.",
    author: "James Hamilton"
  },

  {
    id: "worse-is-better", tags: ["technology", "ideas"],
    href: "https://www.dreamsongs.com/RiseOfWorseIsBetter.html",
    destination: "website",
    title: "Worse is Better",
    author: "Richard Gabriel"
  },

  {
    id: "systems-design-1", tags: ["technology", "ideas"],
    href: "https://apenwarr.ca/log/20201227",
    destination: "website",
    title: "Systems design explains the world: volume 1",
    author: "Avery Pennarun"
  },

  {
    id: "systems-design-2", tags: ["technology"],
    href: "https://apenwarr.ca/log/20230415",
    destination: "website",
    title: "Systems design 2: What we hope we know",
    author: "Avery Pennarun"
  },

  {
    id: "thi-ng", tags: ["technology"],
    href: "https://thi.ng/",
    destination: "website",
    title: "thi.ng",
    author: "Karsten Schmidt"
  },

  {
    id: "mark", tags: ["artists"],
    href: "https://sugarboypress.com/",
    destination: "website",
    title: ".• Mark Hosford"
  },

  {
    id: "hilma", tags: ["artists"],
    href: "https://en.wikipedia.org/wiki/Hilma_af_Klint",
    destination: "wikipedia",
    title: ".• Hilma af Klint"
  },

  {
    id: "kandinsky", tags: ["artists"],
    href: "https://en.wikipedia.org/wiki/Wassily_Kandinsky",
    destination: "wikipedia",
    title: ".• Kandinsky"
  },

  {
    id: "moebius", tags: ["artists"],
    href: "https://www.moebius.fr/Les-Collections.html",
    destination: "website",
    title: ".• Moebius"
  },

  {
    id: "caza", tags: ["artists"],
    href: "https://en.wikipedia.org/wiki/Caza",
    destination: "wikipedia",
    title: ".• Caza"
  },

  {
    id: "ulises-farinas", tags: ["artists"],
    href: "https://ulisesfarinas.com/",
    destination: "website",
    title: ".• Ulises Fariñas"
  },

  {
    id: "john-vermilyea", tags: ["artists"],
    href: "http://www.jonvermilyea.com/",
    destination: "website",
    title: ".• Jon Vermilyea"
  },

  {
    id: "anders-nilsen", tags: ["artists"],
    href: "https://www.andersbrekhusnilsen.com/booksandcomics",
    destination: "website",
    title: ".• Anders Nilsen"
  },

  {
    id: "jesse-jacobs", tags: ["artists"],
    href: "https://www.jessejacobsart.com/",
    destination: "website",
    title: ".• Jesse Jacobs"
  },

  {
    id: "minjeong-an", tags: ["artists"],
    href: "http://www.myartda.com/",
    destination: "website",
    title: ".• Minjeong An"
  },

  {
    id: "terry-a-davis", tags: ["technology", "artists"],
    href: "https://youtu.be/XkXPqvWJHg4",
    destination: "youtube",
    title: ".• Terry A. Davis"
  },

  {
    id: "toxi", tags: ["technology", "artists"],
    href: "https://mastodon.thi.ng/@toxi",
    destination: "mastodon",
    title: ".• Karsten Schmidt"
  },

  {
    id: "amanda-ghassaei", tags: ["technology", "artists"],
    href: "https://amandaghassaei.com/",
    destination: "website",
    title: ".• Amanda Ghassaei"
  },

  {
    id: "devine-lu-linvega", tags: ["technology", "artists"],
    href: "https://wiki.xxiivv.com/site/dinaisth.html",
    destination: "website",
    title: ".• Devine Lu Linvega"
  },

  {
    id: "cakebread", tags: ["technology", "artists"],
    href: "http://www.quantumrain.com/",
    destination: "website",
    title: ".• Stephen Cakebread"
  },

  {
    id: "eskil-steenberg", tags: ["technology", "artists"],
    href: "http://www.quelsolaar.com/",
    destination: "website",
    title: ".• Eskil Steenberg"
  },

  {
    id: "mereology", tags: ["philosophy", "ideas"],
    href: "https://en.wikipedia.org/wiki/Mereology",
    destination: "wikipedia",
    title: ".Mereology"
  },

  {
    id: "sequent-calculus", tags: ["ideas"],
    href: "https://en.wikipedia.org/wiki/Sequent_calculus",
    destination: "wikipedia",
    title: ".Sequent Calculus"
  },

  {
    id: "algebraic-structure", tags: ["ideas"],
    href: "https://en.wikipedia.org/wiki/Algebraic_structure",
    destination: "wikipedia",
    title: ".Algebraic Structure"
  },

  {
    id: "schismogenesis", tags: ["ideas"],
    href: "https://en.wikipedia.org/wiki/Schismogenesis",
    destination: "wikipedia",
    title: ".Schismogenesis"
  },

  {
    id: "information", tags: ["technology", "ideas"],
    href: "https://en.wikipedia.org/wiki/Information_theory",
    destination: "wikipedia",
    title: ".Information"
  },

  {
    id: "process", tags: ["philosophy", "ideas"],
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
    id: "synchronicity", tags: ["ideas"],
    href: "https://en.wikipedia.org/wiki/Synchronicity",
    destination: "wikipedia",
    title: ".Synchronicity"
  },

  {
    id: "goblin-manifesto", tags: ["ideas"],
    href: "https://maya.land/goblin/",
    destination: "website",
    title: ".• Goblin Manifesto"
  },

  {
    id: "collision-course", tags: ["ideas"],
    href: "https://zandercutt.com/2018/12/06/the-world-is-on-a-collision-course-with-itself/",
    destination: "website",
    title: "The World Is on a Collision Course With Itself"
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
    id: "rs",
    quote: "These build on themselves. You notice that anything you are aware of is in the process of changing as you notice it.",
    author: "R.S."
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
    id: "fifield",
    quote: "Answer is the dead stop.",
    author: "William Fifield"
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
  ["meta", { property: "og:image", content: "https://usernolan.net/jpeg/nolan.6.jpeg" }]
]

const modeSelect = [
  "div.select--mode", {},
  ["select#select--mode", {},
    ["option", {}, "system"],
    ["option", {}, "light"],
    ["option", {}, "dark"]
  ],
  ["label", { for: "select--mode" }, "mode"],
]

export const index = [
  ["!DOCTYPE", "html"],
  ["html", { lang: "en" },
    head("nolan"),
    ["body", {},
      ["main", {},
        ["div.header", {},
          ["h1", {}, "i'm nolan"],
          ["div.controls", {},
            ["div.select--ghost", {},
              ["select", {}],],
            modeSelect
          ]
        ],
        ["div.images", {}, imageComponent(imageItems[0])],
        ["div.links", {},
          ["a", { href: "/images/" }, "images"],
          ["a", { href: "/links/" }, "links"],
          ["a", { href: "/quotes/" }, "quotes"],
          ["a", { href: "/pdf/resume.pdf", target: "_blank" }, "cv"]
        ],
        ["p", {}, "you may be thinking \"no but this site is archaic garbage??? i'm going back to fortnite,\" and it is, and you should stay. it's beautiful in the same way my ",
          ["a", { href: imageItems.find((x) => x.id === "cowboy-2")?.src }, "sister's dog"],
          " is beautiful. it's so beautiful. it's better than fortnite."]
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
      ["main", {},
        ["div.header", {},
          ["a", { href: "/" }, "home"],
          ["div.controls", {},
            ["div.select--filter", {},
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
              ],
              ["label", { for: "select--filter" }, "filter"]
            ],
            modeSelect
          ]
        ],
        ["div.images", {}, ...imageItems.map(imageComponent)]
      ],
      ["script", { type: "module", src: "/src/index.ts" }]
    ]
  ]
]

export const links = [
  ["!DOCTYPE", "html"],
  ["html", { lang: "en" },
    head("nolan - links"),
    ["body", {},
      ["main", {},
        ["div.header", {},
          ["a", { href: "/" }, "home"],
          ["div.controls", {},
            ["div.select--filter", {},
              ["select#select--filter", {},
                ["option", {}, "all"],
                ["option", {}, "technology"],
                ["option", {}, "philosophy"],
                ["option", {}, "artists"],
                ["option", {}, "ideas"]
              ],
              ["label", { for: "select--filter" }, "filter"]
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
      ["main", {},
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
