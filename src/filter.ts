/* TODO: hide select tags when scripting disabled */
/* TODO: restore previous per page */

export const addFilterSelect = (
  container: Element,
  selector: string,
  id = "select#select--filter"
) => {
  const filterSelect = document.querySelector(id) as HTMLSelectElement
  if (!filterSelect) return;
  filterSelect.addEventListener(
    "change",
    () => container.querySelectorAll(selector).forEach((el) => {
      if (filterSelect.value === "all") {
        el.classList.remove("display-none")
      } else if (el.matches(`[class*="${filterSelect.value}"]`)) {
        el.classList.remove("display-none")
      } else {
        el.classList.add("display-none")
      }
    })
  )
  const restore = "all"
  filterSelect.value = restore
  filterSelect.dispatchEvent(new Event("change"))
}
