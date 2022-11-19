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

const DEFAULT_NUM_GALLERY_COLUMNS_INDEX = 1
const numGalleryColumnsAll = [2, 3, 5, 8, 13]
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
        ["img", {
          src: "/jpeg/nolan.self.jpeg",
          style: {
            "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "persevere",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/persevere" },
        ["img", {
          src: "/jpeg/persevere.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "cloud-cover",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/cloud-cover" },
        ["img", {
          src: "/jpeg/cloud-cover.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "parents",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/parents" },
        ["img", {
          src: "/jpeg/parents.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "sister",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/sister" },
        ["img", {
          src: "/jpeg/sister.jpeg",
          style: {
            "object-position": "0 30%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "louie",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/louie" },
        ["img", {
          src: "/jpeg/louie.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "petals",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/petals" },
        ["img", {
          src: "/jpeg/petals.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "boice",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/boice" },
        ["img", {
          src: "/jpeg/boice.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "watching",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/watching" },
        ["img", {
          src: "/jpeg/watching.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "dae-wee.3",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/dae-wee.3" },
        ["img", {
          src: "/jpeg/dae-wee.3.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "branch",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/branch" },
        ["img", {
          src: "/jpeg/branch.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "eli.4",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/eli.4" },
        ["img", {
          src: "/jpeg/eli.7.jpeg",
          style: {
            "object-position": "0 50%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  // {
  //   id: "light-squared",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/light-squared" },
  //       ["img", {
  //         src: "/jpeg/light-squared.7.jpeg",
  //         style: {
  //           // "object-position": "0 62.5%",
  //           // "border-top-right-radius": "1rem"
  //         }
  //       }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  // {
  //   id: "half-and-half",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/half-and-half" },
  //       ["img", {
  //         src: "/jpeg/half-and-half.jpeg",
  //         style: {
  //           // "object-position": "15% 0",
  //           // "border-top-right-radius": "1rem"
  //         }
  //       }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  {
    id: "bridge",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/bridge" },
        ["img", {
          src: "/jpeg/bridge.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  // {
  //   id: "beach-violation",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/beach-violation" },
  //       ["img", {
  //         src: "/jpeg/beach-violation.jpeg",
  //         style: {
  //           "object-position": "0 100%",
  //           // "border-top-right-radius": "1rem"
  //         }
  //       }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  // {
  //   id: "facade",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/facade" },
  //       ["img", {
  //         src: "/jpeg/facade.jpeg",
  //         style: {
  //           // "object-position": "15% 0",
  //           // "border-top-right-radius": "1rem"
  //         }
  //       }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  // {
  //   id: "footprints",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/footprints" },
  //       ["img", {
  //         src: "/jpeg/footprints.jpeg",
  //         style: {
  //           // "object-position": "15% 0",
  //           // "border-top-right-radius": "1rem"
  //         }
  //       }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

]

/* TODO: lollipop on wood */
const nm8GalleryItems: Iterable<GalleryItem> = [
  {
    id: "self",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nm8/gallery/self" },
        ["img", {
          src: "/jpeg/nm8.self.jpeg",
          style: { "object-position": "0 56%" }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "at-dot",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/at-dot" },
        ["img", {
          src: "/jpeg/at-dot.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "table.2",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/table.2" },
        ["img", {
          src: "/jpeg/table.2.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "couch.2",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/couch.2" },
        ["img", {
          src: "/jpeg/couch.2.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "skulls",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/skulls" },
        ["img", {
          src: "/jpeg/skulls.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "xacto",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/xacto" },
        ["img", {
          src: "/jpeg/xacto.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "buckets",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/buckets" },
        ["img", {
          src: "/jpeg/buckets.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "warhammer",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/warhammer" },
        ["img", {
          src: "/jpeg/warhammer.jpeg",
          style: {
            "object-position": "72.5%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "rug",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/rug" },
        ["img", {
          src: "/jpeg/rug.jpeg",
          style: {
            // "object-position": "72.5% 50%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "takach",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/takach" },
        ["img", {
          src: "/jpeg/takach.jpeg",
          style: {
            // "object-position": "0 70%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "print",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/print" },
        ["img", {
          src: "/jpeg/print.jpeg",
          style: {
            // "object-position": "0 70%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "sophisticated",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/sophisticated" },
        ["img", {
          src: "/jpeg/sophisticated.jpeg",
          style: {
            // "object-position": "72.5% 50%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "frame",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/frame" },
        ["img", {
          src: "/jpeg/frame.jpeg",
          style: {
            // "object-position": "0 70%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "screw",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/screw" },
        ["img", {
          src: "/jpeg/screw.jpeg",
          style: {
            // "object-position": "0 70%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "4-avenue",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/4-avenue" },
        ["img", {
          src: "/jpeg/4-avenue.jpeg",
          style: {
            "object-position": "0 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "graphite-lollipops",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/graphite-lollipops" },
        ["img", {
          src: "/jpeg/graphite-lollipops.jpeg",
          style: {
            "object-position": "0 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "frames",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/frames" },
        ["img", {
          src: "/jpeg/frames.jpeg",
          style: {
            "object-position": "100% 50%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  // {
  //   id: "wash",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/wash" },
  //       ["img", {
  //         src: "/jpeg/wash.jpeg",
  //         style: {
  //           // "object-position": "100% 50%",
  //           // "border-top-right-radius": "1rem"
  //         }
  //       }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  {
    id: "fanny",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/fanny" },
        ["img", {
          src: "/jpeg/fanny.jpeg",
          style: {
            "object-position": "100% 50%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  // {
  //   id: "coffee",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/coffee" },
  //      ["img", {
  //        src: "/jpeg/coffee.jpeg",
  //        style: {
  //          // "object-position": "100% 50%",
  //          // "border-top-right-radius": "1rem"
  //        }
  //      }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  // {
  //   id: "ink",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/nolan/gallery/ink" },
  //      ["img", {
  //        src: "/jpeg/ink.jpeg",
  //        style: {
  //          // "object-position": "100% 50%",
  //          // "border-top-right-radius": "1rem"
  //        }
  //      }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  {
    id: "dinm8",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/dinm8" },
        ["img", {
          src: "/jpeg/dinm8.jpeg",
          style: {
            "object-position": "0 33%",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

]

const OeGalleryItems: Iterable<GalleryItem> = [
  {
    id: "self",
    previewComponent: () => ["div.gallery-item", {}],
    pageComponent: () => ["div", {}]
  },

  {
    id: "inf",
    previewComponent: () => [
      "div.gallery-item", {
        style: {
          border: "1px dashed white",
          "border-radius": "2.5%"
        }
      }
    ],
    pageComponent: () => ["div", {}]
  }
]

/* TODO: lollipop on wood */
/* TODO: brain dump computer art (old macbook) */
/* TODO: old macbook automata */
const smixzyGalleryItems: Iterable<GalleryItem> = [
  {
    id: "self",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/self" },
        ["img", {
          src: "/jpeg/smixzy.self.jpeg",
          style: {
            "object-position": "0 33%",
            "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "ass-drag",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/ass-drag" },
        ["img", {
          src: "/jpeg/ass-drag.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "send-nudes",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/send-nudes" },
        ["img", {
          src: "/jpeg/send-nudes.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "shit-in-my-mouth",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/shit-in-my-mouth" },
        ["img", {
          src: "/jpeg/shit-in-my-mouth.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "fnd-ur-way",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/fnd-ur-way" },
        ["img", {
          src: "/jpeg/fnd-ur-way.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "evolve-now",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/evolve-now" },
        ["img", {
          src: "/jpeg/evolve-now.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },


  {
    id: "face",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/face" },
        ["img", {
          src: "/jpeg/face.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "sunglass-love",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/sunglass-love" },
        ["img", {
          src: "/jpeg/sunglass-love.jpeg",
          style: {
            "object-position": "0 0",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "cross-roads",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/cross-roads" },
        ["img", {
          src: "/jpeg/cross-roads.jpeg",
          style: {
            // "object-position": "0 0",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "theme-provider",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/theme-provider" },
        ["img", {
          src: "/jpeg/theme-provider.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "dumpster-gram",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/dumpster-gram" },
        ["img", {
          src: "/jpeg/dumpster-gram.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "post-it",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/post-it" },
        ["img", {
          src: "/jpeg/post-it.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "sky",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/sky" },
        ["img", {
          src: "/jpeg/sky.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "hyper-branch",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/hyper-branch" },
        ["img", {
          src: "/jpeg/hyper-branch.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  // {
  //   id: "new-balanced",
  //   previewComponent: () => [
  //     "div.gallery-item", {},
  //     ["a", { href: "#/smixzy/gallery/new-balanced" },
  //      ["img", {
  //        src: "/jpeg/new-balanced.jpeg",
  //        style: {
  //          // "object-position": "0 33%",
  //          // "border-radius": "50%"
  //        }
  //      }]
  //     ]
  //   ],
  //   pageComponent: () => ["div", {}]
  // },

  {
    id: "chalk",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/chalk" },
        ["img", {
          src: "/jpeg/chalk.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "orb-birth",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/orb-birth" },
        ["img", {
          src: "/jpeg/orb-birth.2.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "coral",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/coral" },
        ["img", {
          src: "/jpeg/coral.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

  {
    id: "thrift",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/smixzy/gallery/thrift" },
        ["img", {
          src: "/jpeg/thrift.2.jpeg",
          style: {
            // "object-position": "0 33%",
            // "border-radius": "50%"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },


  {
    id: "mark",
    previewComponent: () => [
      "div.gallery-item", {},
      ["a", { href: "#/nolan/gallery/mark" },
        ["img", {
          src: "/jpeg/mark.jpeg",
          style: {
            // "object-position": "15% 0",
            // "border-top-right-radius": "1rem"
          }
        }]
      ]
    ],
    pageComponent: () => ["div", {}]
  },

]

/* TODO: compute lazily, cache */
const galleryItemMaps = new Map([
  ["nolan", new Map(map((i) => [i.id, i], nolanGalleryItems))],
  ["nm8", new Map(map((i) => [i.id, i], nm8GalleryItems))],
  ["Oe", new Map(map((i) => [i.id, i], OeGalleryItems))],
  ["smixzy", new Map(map((i) => [i.id, i], smixzyGalleryItems))]
])

const gallery = (r: Route, galleryItemMap: Map<string, GalleryItem>) => [
  "main", {},
  ["div.gallery-container", { "data-gallery-columns": galleryColumns },
    ...map((i) => i.previewComponent(r, galleryItemMap), galleryItemMap.values())]
]

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
    ["button", { onclick: decNumGalleryColumnsIndex }, "+"],
    ["button", { onclick: incNumGalleryColumnsIndex }, "-"]]
]

const nolanGist = async (r: Route) => [
  "main", {},
  ["h1", {}, "I'm nolan."],
  ["h2", {}, "I've been called a reflector. I'm into computers,\ngraphics, and all forms of animation."],
  ["h3", {}, "This is where I programmatically put out on the internet, so stay awhile, and listen. Enjoy my post-social AIM profile."],
  ["a", { href: "mailto:nolan@usernolan.net" }, "nolan@usernolan.net"]
]
/* TODO: contact? */

/* TODO: not found */
const galleryComponent = (r: Route) => {
  const m = galleryItemMaps.get(r.who) || galleryItemMaps.get(whoAll[0])!
  return r.id ?
    m.get(r.id)?.pageComponent(r, m) || gallery(r, m) :
    gallery(r, m)
}

const nolanGallery = async (r: Route) => galleryComponent(r)
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
const nm8Gallery = async (r: Route) => galleryComponent(r)
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
const OeGallery = async (r: Route) => galleryComponent(r)
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
const smixzyGallery = async (r: Route) => galleryComponent(r)
const smixzyGalleryAside = async (r: Route) => galleryControls()
const smixzyReference = async (r: Route) => `${r.who}/${r.what}`

const capitalize = (s: string) => s.replace(/^\w/, c => c.toUpperCase())

const rdom = $compile([
  "div.rdom-root", {},
  $replace(route.map(navComponent)),
  /* ALT: ...$switch(,,,); return [main, aside] */
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
