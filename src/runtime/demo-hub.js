// CityMETER demo hub: read `at` from this page's address and hand it to every demo link. Without JavaScript the links
// open each demo's start page. The area code is checked against the production path pattern before it is used.
(() => {
  const config = JSON.parse(document.getElementById("demo-hub-config")?.textContent || "{}");
  const status = document.getElementById("hub-area-status");
  if (!config.pattern || !status) return;
  const raw = new URLSearchParams(location.search).get("at");
  const at = raw && new RegExp(config.pattern).test(raw) ? raw : "";
  for (const link of document.querySelectorAll("a.hub-area[data-at]")) {
    if (link.dataset.at === at) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
  if (raw && !at) { status.textContent = config.text.bad; return; }
  if (!at) return;
  const name = config.areas?.[at];
  status.textContent = name ? config.text.known.replace("{name}", name).replace("{at}", at) : config.text.code.replace("{at}", at);
  for (const link of document.querySelectorAll("a[data-demo]")) {
    // `at` first, as the demos write their address; a demo opened in English keeps `lang=en` after it.
    const url = new URL(link.getAttribute("href"), location.href), rest = new URLSearchParams(url.search);
    rest.delete("at");
    url.search = `?at=${encodeURIComponent(at)}${rest.toString() ? `&${rest}` : ""}`;
    link.href = url.href.replace(/%2F/g, "/");
  }
  // The language switch keeps the area too.
  const other = document.querySelector("a[data-hub-lang]");
  if (other) { const url = new URL(other.getAttribute("href"), location.href); url.searchParams.set("at", at); other.href = url.href.replace(/%2F/g, "/"); }
})();
