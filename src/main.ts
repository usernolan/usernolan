import './style.css'
import { $compile } from "@thi.ng/rdom/compile"
import { $klist } from "@thi.ng/rdom/klist"
import { reactive } from "@thi.ng/rstream/stream"
import { sync } from "@thi.ng/rstream/sync"
import { EVENT_ROUTE_CHANGED, HTMLRouter } from "@thi.ng/router"

const routes = [
  { id: "gist-default", match: ["nolan", "gist"] },
  { id: "gist", match: ["?who", "gist"] },
  { id: "gallery", match: ["?who", "gallery"] },
  { id: "gallery-item", match: ["?who", "gallery", "?gid"] },
  { id: "refs", match: ["?who", "refs"] },
  { id: "quotes", match: ["?who", "quotes"] }
]
// {id: "generic", match: ["?who", "?what"]} ...
// {id: "nolan-gist", match: ["nolan", "gist"]} ...

const routerConfig = {
  useFragment: true,
  defaultRouteID: routes[0].id,
  routes: routes
}

const router = new HTMLRouter(routerConfig)
router.start()

// TODO: load from url
const who = reactive(router.current?.params?.who || "nolan")
const what = reactive(router.current?.id.split("-")[0] || "gist")

const page = sync({ src: { who, what } })

const whoAll = ["nolan", "nm8", "Oe", "smixzy"]
const whatAll = ["gist", "gallery", "refs", "quotes"]

const whoElse = who.map((x) => whoAll.filter((y) => x != y))
const whatElse = what.map((x) => whatAll.filter((y) => x != y))

router.addListener(EVENT_ROUTE_CHANGED, (e) => {
  console.log(e)
  who.next(e?.value?.params?.who || "nolan")
  what.next(e?.value?.id.split("-")[0] || "gist")
})

const whoHovered = reactive(false);
const whoClicked = reactive(false);
const whatHovered = reactive(false);
const whatClicked = reactive(false);

const whoNav = sync({ src: { whoHovered, whoClicked } })
const whatNav = sync({ src: { whatHovered, whatClicked } })

/*
const whoNavComponent = [
  "nav",
  {
    class: whoNav.map((x) => x.whoHovered || x.whoClicked ? "expanded" : ""),
    onmouseenter: () => whoHovered.next(true),
    onmouseleave: () => whoHovered.next(false)
  },
  ["button", { onclick: () => whoClicked.next(!whoClicked.deref()) }, who],
  $klist(
    whoElse,
    "ul",
    {},
    (x) => ["li", {}, ["a", { href: what.map((y) => `/#/${x}/${y}`), onclick: () => whoClicked.next(false) }, x]],
    (x) => x)
]

const whatNavComponent = [
  "nav",
  {
    class: whatNav.map((x) => x.whatHovered || x.whatClicked ? "expanded" : ""),
    onmouseenter: () => whatHovered.next(true),
    onmouseleave: () => whatHovered.next(false)
  },
  ["button", { onclick: () => whatClicked.next(!whatClicked.deref()) }, what],
  $klist(
    whatElse,
    "ul",
    {},
    (x) => ["li", {}, ["a", { href: who.map((y) => `/#/${y}/${x}`), onclick: () => whatClicked.next(false) }, x]],
    (x) => x)
]
*/

const app = $compile([
  "div", { class: page.map((x) => `rdom-root ${x.who} ${x.what}`) },
  // ["div.nav-container", {}, whoNavComponent, whatNavComponent],
  ["div.nav-container", {},
    ["nav", {},
      ["select.who",
        {
          onchange: (e: { target: HTMLSelectElement }) => {
            router.routeTo(`#/${e.target.value}/${what.deref()}`)
          }
        },
        ["option", {}, "nolan"],
        ["option", {}, "nm8"],
        ["option", {}, "Oe"],
        ["option", {}, "smixzy"]],
      ["select.what",
        {
          onchange: (e: { target: HTMLSelectElement }) => {
            router.routeTo(`#/${who.deref()}/${e.target.value}`)
          }
        },
        ["option", {}, "gist"],
        ["option", {}, "gallery"],
        ["option", {}, "quotes"],
        ["option", {}, "refs"]]]],
  ["main", {}, page.map((x) => `${x.who}/${x.what}`)]
])

app.mount(document.getElementById("app")!)
