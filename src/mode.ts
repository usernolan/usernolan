/* TODO: hide select tags when scripting disabled */

export const addModeSelect = (
  id = "select#select--mode"
) => {
  const root = document.querySelector(":root") as HTMLElement
  const modeSelect = document.querySelector(id) as HTMLSelectElement
  if (!modeSelect) return;
  modeSelect.addEventListener(
    "change",
    () => {
      localStorage.setItem("data-color-scheme", modeSelect.value)
      modeSelect.value === "system" ?
        root.removeAttribute("data-color-scheme") :
        root.setAttribute("data-color-scheme", modeSelect.value)
    }
  )
  const restore = localStorage.getItem("data-color-scheme")
  if (restore) {
    modeSelect.value = restore
    modeSelect.dispatchEvent(new Event("change"))
  }
}
