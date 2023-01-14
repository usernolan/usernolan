import "./style.css"
// import { take } from "@thi.ng/transducers/take"
// import { repeatedly } from "@thi.ng/transducers/repeatedly"
// import { choices } from "@thi.ng/transducers/choices"
import Shuffle from "shufflejs"

/* TODO: quote formatting */
/* TODO: noscript */
/* TODO: refine querySelectors */
/* TODO: revisit top level naming; els etc. */
/* TODO: undo, back, state history, sharing */
/* TODO: inline css */
/* TODO: client randomization */
/* NOTE: css import? can that be used? */


/* NOTE: shuffle, isotope, grid */

const grid = document.querySelector(".grid-container") as HTMLElement

const shuffle = new Shuffle(
  grid,
  {
    itemSelector: '.item',
    sizer: '.sizer',
    delimiter: ","
  }
)


/* NOTE: utils */

const debounce = (f: Function, interval: number) => {
  var t: NodeJS.Timeout | number | undefined = undefined
  return function(this: any) {
    clearTimeout(t)
    t = setTimeout(() => f.apply(this, arguments), interval)
    return t
  }
}


/* NOTE: image resize, alt */

const images = grid.querySelectorAll('.image') as NodeListOf<HTMLElement>

const defaultSpanStr = '2'
const maxSpan = 3 /* TODO: screen size */

const modSpanEventListener = (e: MouseEvent) => {
  const el = (e.target as HTMLElement).closest('.image') as HTMLElement
  const prev = parseInt(el.getAttribute('data-span') || defaultSpanStr)
  const next = e.shiftKey ?
    prev === 1 ? maxSpan : prev - 1 :
    prev === maxSpan ? 1 : prev + 1

  el.setAttribute('data-span', `${next}`)
  shuffle.layout()
}

images.forEach((x) =>
  x.addEventListener('click', modSpanEventListener))

var mouseTarget: HTMLElement | undefined = undefined
document.addEventListener('mousemove', (e: MouseEvent) => {
  mouseTarget = e.target as HTMLElement
})

/* TODO: additional key commands; generalize listeners */
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === "Shift" && mouseTarget?.matches('.image *'))
    mouseTarget.closest('.image')?.classList.add('cursorZoomOut')

  if (e.key === "Alt" && mouseTarget?.matches('.image *'))
    e.shiftKey ? // ALT: alt+a, like cmd+a
      images.forEach((x) => x.classList.toggle('showAlt')) :
      mouseTarget.closest('.image')?.classList.toggle('showAlt')
})

document.addEventListener('keyup', (e: KeyboardEvent) => {
  if (e.key === "Shift" && mouseTarget?.matches('.image *'))
    mouseTarget.closest('.image')?.classList.remove('cursorZoomOut')
})


/* NOTE: hoverable images */

const hoverableImgs = grid.querySelectorAll('.hoverable img') as NodeListOf<HTMLImageElement>

const swapImgSrcsEventListener = (e: MouseEvent) => {
  const el = e.target as HTMLImageElement
  const src = el.src

  el.src = el.getAttribute('data-hover-src') || src
  el.setAttribute('data-hover-src', src)
}

hoverableImgs.forEach((x) => {
  x.addEventListener('mouseenter', swapImgSrcsEventListener)
  x.addEventListener('mouseleave', swapImgSrcsEventListener)
})


/* NOTE: controls toggle */

const showControlsButton = document.querySelector("button.show") as HTMLButtonElement
const aside = document.querySelector('aside') as HTMLElement

showControlsButton?.addEventListener("click", () => {
  grid?.classList.toggle("controls-showing")
  aside?.classList.toggle("show")
})


/* NOTE: filters */

const filters = aside.querySelector("fieldset.filters") as HTMLFieldSetElement

const searchResult = (el: HTMLElement, searchInput: HTMLInputElement) => {
  const v = searchInput?.value.toLowerCase()
  if ((el.textContent || "").toLowerCase().indexOf(v) >= 0)
    return true

  const imgs = Array.from(el.querySelectorAll('img'))
  return imgs.some((x) =>
    x.src.toLowerCase().indexOf(v) >= 0 ||
    x.alt.toLowerCase().indexOf(v) >= 0)
}

const compositeFilter = (
  searchInput: HTMLInputElement,
  tagInputArray: HTMLInputElement[],
  typeInputArray: HTMLInputElement[]
) => {
  const tagNames = tagInputArray.filter((x) => x.checked).map((x) => x.name)
  const typeNames = typeInputArray.filter((x) => x.checked).map((x) => x.name)

  return (el: HTMLElement) => {
    const groups = (el.getAttribute("data-groups") || "").split(",")
    return (tagNames.length === 0 || tagNames.some((t) => groups.find((x) => x === t)))
      && (typeNames.length === 0 || typeNames.some((t) => groups.find((x) => x === t)))
      && (searchInput?.value.length === 0 || searchResult(el, searchInput))
  }
}

/* TODO: refactor forEach */
const filterEventListener = (_e: Event) => {
  const searchInput = filters?.querySelector('fieldset.search input[type="search"]')
  const tagInputs = filters?.querySelectorAll('fieldset.tag input[type="checkbox"]')
  const typeInputs = filters?.querySelectorAll('fieldset.type input[type="checkbox"]')

  const f = compositeFilter(
    searchInput as HTMLInputElement,
    Array.from(tagInputs || []) as HTMLInputElement[],
    Array.from(typeInputs || []) as HTMLInputElement[]
  )

  shuffle.filter(f)
}

filters?.addEventListener('input', debounce(filterEventListener, 120))


/* NOTE: mode, color-scheme */

const root = document.querySelector(':root') as HTMLElement

const modeChangeEventListener = (e: Event) => {
  const v = (e?.target as HTMLInputElement)?.value

  v === 'system' ?
    root.removeAttribute('data-color-scheme') :
    root.setAttribute('data-color-scheme', v)
}

document.querySelector('fieldset.mode')?.addEventListener('change', modeChangeEventListener)


/* NOTE: color */

const colorFieldset = aside.querySelector('fieldset.color')
const rangeInputs = colorFieldset?.querySelectorAll('input[type="range"]') as NodeListOf<HTMLInputElement>
const contrastStyle = document.createElement('style')

document.head.appendChild(contrastStyle)

/* NOTE: filter causes issues when applied to parent of position: fixed child; block creation */
const colorChangeEventListener = (_e: Event) => {
  const c = rangeInputs?.item(0).value
  const s = rangeInputs?.item(1).value
  const h = rangeInputs?.item(2).value
  const i = rangeInputs?.item(3).value

  root.style.filter = `saturate(${s}%) hue-rotate(${h}deg) invert(${i}%)`
  contrastStyle.innerText = `main, div.controls { filter: contrast(${c}%); }`
}

colorFieldset?.addEventListener('input', colorChangeEventListener)


/* NOTE: layout */

const layoutFieldset = aside.querySelector("fieldset.layout") as HTMLFieldSetElement
// const items = grid.querySelectorAll(".item") as NodeListOf<HTMLElement>

layoutFieldset?.querySelector('button[id$="randomize"]')
  ?.addEventListener('click', () =>
    shuffle.sort({ randomize: true }))

// layoutFieldset?.querySelector('button[id$="resize"]')
//   ?.addEventListener('click', (e: Event) => {
//     items.forEach
//   })

layoutFieldset?.querySelector('button[id$="toggle-alt-text"]')
  ?.addEventListener('click', () =>
    images.forEach((x) => x.classList.toggle('showAlt')))

layoutFieldset?.querySelector('button[id$="reset"]')
  ?.addEventListener('click', () =>
    // TODO: original span
    shuffle.sort({}))
