import "./style.css"
import { choices } from "@thi.ng/transducers/choices"
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
  return function(this: any, ...args: any) {
    clearTimeout(t)
    t = setTimeout(() => f.apply(this, args), interval)
    return t
  }
}

const orientationMedia = window.matchMedia('(orientation: portrait)')
var isPortrait = orientationMedia.matches

orientationMedia.addEventListener('change', (e) =>
  isPortrait = e.matches)


/* NOTE: image resize, alt */

const images = grid.querySelectorAll('.image') as NodeListOf<HTMLElement>

const defaultSpanStr = '2'
const maxSpan = 3 /* TODO: screen size */

/* TODO: show hint when trying to resize randomized */
const modSpanEventListener = (e: MouseEvent) => {
  if (isPortrait && shuffle.lastSort?.randomize)
    return

  const el = (e.target as HTMLElement).closest('.image') as HTMLElement
  const prev = parseInt(el.getAttribute('data-span') || defaultSpanStr)
  const next = e.shiftKey ?
    prev === 1 ? maxSpan : prev - 1 :
    prev === maxSpan ? 1 : prev + 1

  el.setAttribute('data-span', `${next}`)
  shuffle.layout()

  const block =
    isPortrait && grid?.classList.contains('controls-showing') ?
      "start" : "nearest"

  setTimeout(() =>
    el.scrollIntoView({ behavior: "smooth", block }),
    (shuffle.options.speed || 250) * 2
  )
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
    mouseTarget.closest('.image')?.classList.add('cursor-zoom-out')

  if (e.key === "Alt" && mouseTarget?.matches('.image *'))
    e.shiftKey ? // ALT: alt+a, like cmd+a
      images.forEach((x) => x.classList.toggle('show-alt')) :
      mouseTarget.closest('.image')?.classList.toggle('show-alt')
})

document.addEventListener('keyup', (e: KeyboardEvent) => {
  if (e.key === "Shift" && mouseTarget?.matches('.image *'))
    mouseTarget.closest('.image')?.classList.remove('cursor-zoom-out')
})


/* NOTE: hoverable images */

const hoverableImgs = grid.querySelectorAll('.hoverable img') as NodeListOf<HTMLImageElement>

const swapImgSrcsEventListener = (e: MouseEvent | TouchEvent) => {
  const el = e.target as HTMLImageElement
  const src = el.src

  el.src = el.getAttribute('data-hover-src') || src
  el.setAttribute('data-hover-src', src)
}

/* TODO: mouse, touch detection */
hoverableImgs.forEach((x) => {
  x.addEventListener('mouseenter', swapImgSrcsEventListener)
  x.addEventListener('touchstart', swapImgSrcsEventListener)
  x.addEventListener('mouseleave', swapImgSrcsEventListener)
})


/* NOTE: controls toggle */

const showControlsButton = document.querySelector("button.show-controls") as HTMLButtonElement
const aside = document.querySelector('aside') as HTMLElement

showControlsButton?.addEventListener("click", () => {
  if (!isPortrait) {
    const span = showControlsButton?.querySelector('span')
    if (span) span.innerHTML = span?.innerHTML === "+" ? "-" : "+"
    grid?.classList.toggle("controls-showing")
    aside?.classList.toggle("controls-showing")
  }
})

var showControlsButtonTouchStartY: number | null = null
var asideHeightStart = aside?.clientHeight
var asideHeightTouchMoved: boolean | null = null

const snapAsideHeight = () => {
  const b = showControlsButton.clientHeight
  const vh = window.innerHeight / 100

  if (aside?.clientHeight >= window.innerHeight - (b + 2 * vh)) {
    aside.style.height = `${window.innerHeight - (b + 4 * vh)}px`
  } else if (aside?.clientHeight <= 8 * vh) {
    aside.style.height = "0px"
  }
}

const defaultAsideHeightStyle = () =>
  `${(window.innerHeight / 100) * 42}px`

showControlsButton?.addEventListener("touchstart", (e) => {
  if (isPortrait) {
    showControlsButtonTouchStartY = e.touches[0].clientY
    asideHeightStart = aside?.clientHeight
  }
})

showControlsButton?.addEventListener("touchmove", (e) => {
  e.preventDefault() // NOTE: cancel scroll
  if (isPortrait) {
    aside.style.transition = "none"

    const d = (showControlsButtonTouchStartY || e.touches[0].clientY) - e.touches[0].clientY
    const h = asideHeightStart + d

    aside.style.height = `${h}px`
    asideHeightTouchMoved = true
  }
})

showControlsButton?.addEventListener("touchend", () => {
  if (isPortrait) {
    aside.style.transition = ""
    snapAsideHeight()

    const isClosed = aside.style.height === "0px"
    if (asideHeightTouchMoved) {
      const prev = isClosed ?
        defaultAsideHeightStyle()  // NOTE: snapped down
        : aside.style.height

      aside?.setAttribute('data-previous-height', prev)
      showControlsButtonTouchStartY = null
      asideHeightTouchMoved = false;
    } else {
      if (isClosed) {
        aside.style.height =
          aside?.getAttribute('data-previous-height')
          || defaultAsideHeightStyle()
      } else {
        aside?.setAttribute('data-previous-height', aside.style.height)
        aside.style.height = "0px"
      }
    }

    const span = showControlsButton?.querySelector('span')
    if (span) span.innerHTML = isClosed ? "+" : "-"
    if (isClosed) {
      grid?.classList.remove("controls-showing")
      aside?.classList.remove("controls-showing")
    } else {
      grid?.classList.add("controls-showing")
      aside?.classList.add("controls-showing")
    }
  }
})


/* NOTE: filters */

const filtersFieldset = aside.querySelector("fieldset.filters") as HTMLFieldSetElement
const searchFilterInput = filtersFieldset?.querySelector('fieldset.search input[type="search"]') as HTMLInputElement
const tagFilterInputs = filtersFieldset?.querySelectorAll('fieldset.tag input[type="checkbox"]') as NodeListOf<HTMLInputElement>
const typeFilterInputs = filtersFieldset?.querySelectorAll('fieldset.type input[type="checkbox"]') as NodeListOf<HTMLInputElement>

const searchResult = (el: HTMLElement) => {
  const v = searchFilterInput?.value.toLowerCase()
  if ((el.textContent || "").toLowerCase().indexOf(v) >= 0)
    return true

  const imgs = Array.from(el.querySelectorAll('img'))
  return imgs.some((x) =>
    x.src.toLowerCase().indexOf(v) >= 0 ||
    x.alt.toLowerCase().indexOf(v) >= 0)
}

const compositeFilter = (el: HTMLElement) => {
  const checkedTags = Array.from(tagFilterInputs).filter((x) => x.checked).map((x) => x.name)
  const checkedTypes = Array.from(typeFilterInputs).filter((x) => x.checked).map((x) => x.name)
  const groups = (el.getAttribute("data-groups") || "").split(",")

  return (checkedTags.length === 0 || checkedTags.some((x) => groups.find((y) => x === y)))
    && (checkedTypes.length === 0 || checkedTypes.some((x) => groups.find((y) => x === y)))
    && (searchFilterInput?.value.length === 0 || searchResult(el))
}

const filterEventListener =
  () => shuffle.filter(compositeFilter)

filtersFieldset?.addEventListener('input', debounce(filterEventListener, 120))


/* NOTE: filter actions */

const randomizeCheckboxInput = (input: HTMLInputElement) => {
  if (Math.random() >= 0.5) {
    input.click()
  }
}

const resetCheckboxInput = (input: HTMLInputElement) => {
  if (input.checked) {
    input.click()
  }
}

filtersFieldset?.querySelector('button[id$="randomize"]')
  ?.addEventListener('click', () => {
    tagFilterInputs.forEach(randomizeCheckboxInput)
    typeFilterInputs.forEach(randomizeCheckboxInput)
  })

filtersFieldset?.querySelector('button[id$="invert"]')
  ?.addEventListener('click', () => {
    tagFilterInputs.forEach((x) => x.click())
    typeFilterInputs.forEach((x) => x.click())
  })

filtersFieldset?.querySelector('button[id$="reset"]')
  ?.addEventListener('click', () => {
    searchFilterInput.value = ""
    tagFilterInputs.forEach(resetCheckboxInput)
    typeFilterInputs.forEach(resetCheckboxInput)
    filtersFieldset.dispatchEvent(new Event('input'))
  })


/* NOTE: mode, color-scheme */

const root = document.querySelector(':root') as HTMLElement
const modeFieldset = aside?.querySelector('fieldset.mode')

const modeChangeEventListener = (e: Event) => {
  const v = (e?.target as HTMLInputElement)?.value

  v === 'system' ?
    root.removeAttribute('data-color-scheme') :
    root.setAttribute('data-color-scheme', v)
}

modeFieldset?.addEventListener('change', modeChangeEventListener)


/* NOTE: color */
/* TODO: tween? */

const colorFieldset = aside.querySelector('fieldset.color')
const colorRangeInputs = colorFieldset?.querySelectorAll('input[type="range"]') as NodeListOf<HTMLInputElement>

const contrastStyle = document.createElement('style')
document.head.appendChild(contrastStyle)

/* NOTE: filter causes issues when applied to parent of fixed position child; block creation */
const colorChangeEventListener = () => {
  const c = colorRangeInputs?.item(0).value
  const s = colorRangeInputs?.item(1).value
  const h = colorRangeInputs?.item(2).value
  const i = colorRangeInputs?.item(3).value
  const f = `contrast(${c}%) hue-rotate(${h}deg) saturate(${s}%)`

  root.style.filter = `invert(${i}%) ${f}`
  contrastStyle.innerText = `div.controls { filter: ${f}; }`
}

colorFieldset?.addEventListener('input', colorChangeEventListener)


/* NOTE: color actions */

const randomizeRangeInput = (input: HTMLInputElement) => {
  const min = parseInt(input.min || "0")
  const max = parseInt(input.max || "100")
  const r = Math.floor(Math.random() * (max - min) + min)
  const x =
    input.name === "invert" && (42 < r && r < 56) ?
      r < 50 ? "0" : "100"
      : `${r}`

  input.value = x
  colorFieldset?.dispatchEvent(new Event('input'))
}

const invertRangeInput = (input: HTMLInputElement) => {
  const max = parseInt(input.max || "100")
  const min = parseInt(input.min || "0")
  const v = parseInt(input.value)

  input.value = `${max - v + min}`
  colorFieldset?.dispatchEvent(new Event('input'))
}

const resetRangeInput = (input: HTMLInputElement) => {
  input.value = input.getAttribute('data-value-init') || "50"
  colorFieldset?.dispatchEvent(new Event('input'))
}

colorFieldset?.querySelector('button[id$="randomize"]')
  ?.addEventListener('click', () =>
    colorRangeInputs.forEach(randomizeRangeInput))

colorFieldset?.querySelector('button[id$="invert"]')
  ?.addEventListener('click', () =>
    colorRangeInputs.forEach(invertRangeInput))

colorFieldset?.querySelector('button[id$="reset"]')
  ?.addEventListener('click', () =>
    colorRangeInputs.forEach(resetRangeInput))


/* NOTE: layout actions */

const layoutFieldset = aside.querySelector("fieldset.layout") as HTMLFieldSetElement
const items = grid.querySelectorAll(".item") as NodeListOf<HTMLElement>

const defaultSpanChoicesStr = "1,2,3"

const spanChoices = (el: HTMLElement) =>
  (el.getAttribute('data-span-choices') || defaultSpanChoicesStr)
    .split(",")
    .map((el) => parseInt(el))

const spanWeights = (el: HTMLElement) =>
  el.getAttribute('data-span-weights')
    ?.split(",")
    .map((el) => parseFloat(el))

const respan = (el: HTMLElement) => {
  const cs = spanChoices(el)
  const ws = spanWeights(el)
  const next = choices(cs, ws).next().value || defaultSpanStr

  if (!el.getAttribute('data-span-init')) {
    el.setAttribute('data-span-init', el.getAttribute('data-span') || defaultSpanStr)
  }

  el.setAttribute('data-span', next)
}

const resetSpan = (el: HTMLElement) => {
  const init = el.getAttribute('data-span-init')
  if (init) el.setAttribute('data-span', init)
}

layoutFieldset?.querySelector('button[id$="randomize"]')
  ?.addEventListener('click', () => {
    items.forEach(respan)
    shuffle.sort({ randomize: true })
  })

layoutFieldset?.querySelector('button[id$="toggle-alt-text"]')
  ?.addEventListener('click', () =>
    images.forEach((x) => x.classList.toggle('show-alt')))

layoutFieldset?.querySelector('button[id$="reset"]')
  ?.addEventListener('click', () => {
    items.forEach(resetSpan)
    images.forEach((x) => x.classList.remove('show-alt'))
    shuffle.sort({})
  })
