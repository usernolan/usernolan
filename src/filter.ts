export const addFilterSelect = (
  container: HTMLElement,
  selector: string,
  id?: string
) => {
  const filterSelect = document.querySelector(id || "select#select--filter") as HTMLSelectElement
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
}
