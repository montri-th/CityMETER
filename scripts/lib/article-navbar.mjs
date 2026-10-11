import { readFileSync } from "node:fs";
import { materializeUiIconsInHtml } from "./ui-icon-migration.mjs";

// Reuse the public CityMETER shell rather than the handoff prototype's
// unrelated web-component implementation. Initial HTML also works without JS.
export function articleNavbar(lang, slug) {
  const template = readFileSync(new URL(`../../src/templates/index.${lang}.html`, import.meta.url), "utf8");
  const start = template.indexOf('<header class="lm-site-header"');
  const end = template.indexOf('<div id="root">', start);
  if (start < 0 || end < 0) throw Error("Public navigation template absent");
  const base = lang === "en" ? "../../../" : "../../";
  let html = template.slice(start, end)
    .replace(/<nav class="lm-bookmark-rail"[\s\S]*?<\/nav>/, "")
    .replace(/(?:\.\/|\.\.\/)assets\//g, base + 'assets/')
    .replaceAll('href="./?lang=th"', `href="${base}datasets/${slug}/?lang=th"`)
    .replaceAll('href="../?lang=th"', `href="${base}datasets/${slug}/?lang=th"`)
    .replaceAll('href="./en/?lang=en"', `href="${base}en/datasets/${slug}/?lang=en"`)
    .replaceAll('href="./?lang=en"', `href="${base}en/datasets/${slug}/?lang=en"`)
    .replaceAll('href="#decisions"', `href="${base}${lang === 'en' ? 'en/' : ''}#decisions"`)
    .replaceAll('href="#examples"', `href="${base}${lang === 'en' ? 'en/' : ''}#examples"`)
    .replaceAll('href="#datasets"', `href="${base}${lang === 'en' ? 'en/' : ''}#datasets"`)
    .replaceAll('มุมมองข้อมูลเมือง 38 รายการ', 'มุมมองข้อมูลเมือง 43 รายการ')
    .replaceAll('38 city data views', '43 city data views');
  html = html.replace(/data-lm-copy="localLabel">[^<]+/g, `>${lang === 'en' ? 'Explore CityMETER' : 'สำรวจ CityMETER'}`).replace(/data-lm-aria="localAria"/g, '');
  return materializeUiIconsInHtml(html).replace(/^[ \t]+$/gm, "").trim();
}

export function navbarArticleRoutes(runtime) {
  const marker = '    var basePath = url.pathname';
  if (runtime.split(marker).length !== 2) throw Error("Navbar language-route adapter changed");
  runtime = runtime.replace("  installPreferences();", `  var explicitTheme = normalizedTheme(new URLSearchParams(window.location.search).get("theme"));
  if (explicitTheme) root.dataset.themePreference = explicitTheme;
  installPreferences();`);
  return runtime.replace(marker, `    var articleRoute = /^(.*?)(?:en\\/)?datasets\\/([^/]+)\\/(?:index\\.html)?$/.exec(url.pathname);
    if (articleRoute) {
      url.pathname = articleRoute[1] + (target === "en" ? "en/" : "") + "datasets/" + articleRoute[2] + "/";
      url.searchParams.set("lang", target);
      return url.href;
    }
${marker}`);
}

export function attachArticleNavbar(html, lang, slug) {
  const base = lang === "en" ? "../../../" : "../../";
  const headers = html.match(/<header class="catalog-detail-header"[\s\S]*?<\/header>/g) || [];
  if (headers.length !== 1) throw Error("Article navigation integration span changed");
  return html.replace(headers[0], () => articleNavbar(lang, slug)).replace('</head>', `<link rel="stylesheet" href="${base}assets/navbar-current-r1.css">
<style>.lm-menu-shell[hidden],.lm-js-fallback-nav[hidden]{display:none!important}.catalog-detail-page .lm-product-name{color:var(--text)}.catalog-detail-page .lm-product-lockup{margin-inline-end:auto}</style>
<script defer src="${base}assets/unified-navbar-public-r1.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script></head>`);
}
