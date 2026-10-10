/* Native search over the same public records rendered before and after hydration. */
(() => {
  if (window.__citymeterPublicCatalog) return;
  window.__citymeterPublicCatalog = true;
  const normalize = (value) =>
    String(value)
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  function apply(section) {
    if (!section) return;
    const query = normalize(
      section.querySelector("[data-catalog-search]")?.value || "",
    )
      .split(/\s+/)
      .filter(Boolean);
    const selected =
      section.querySelector('[data-catalog-group][aria-pressed="true"]')
        ?.dataset.catalogGroup || "all";
    let count = 0;
    section
      .querySelectorAll('[data-catalog-owner="public-registry"]')
      .forEach((card) => {
        const match =
          (selected === "all" || card.dataset.group === selected) &&
          query.every((term) => card.dataset.search.includes(term));
        card.hidden = !match;
        if (match) count++;
      });
    const status = section.querySelector("[data-catalog-count]");
    if (status) status.textContent = `${status.dataset.label}: ${count}`;
    const empty = section.querySelector("[data-catalog-empty]");
    if (empty) empty.hidden = count !== 0;
  }
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-catalog-search]"))
      apply(event.target.closest("#datasets"));
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest(
      "[data-catalog-group], [data-catalog-reset]",
    );
    if (!button) return;
    const section = button.closest("#datasets");
    if (!section) return;
    const group = button.dataset.catalogGroup || "all";
    section
      .querySelectorAll("[data-catalog-group]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.catalogGroup === group),
        ),
      );
    if (button.hasAttribute("data-catalog-reset")) {
      const search = section.querySelector("[data-catalog-search]");
      search.value = "";
      search.focus();
    }
    apply(section);
  });
})();
