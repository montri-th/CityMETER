import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buildId = "ui-20260830-09";
const receiptId = "2026-08-30-citymeter-unified-nav-r7-v31";
const checkOnly = process.argv.includes("--check");
const criticalHeaderExclusivityStyle = '    <style id="lm-header-exclusivity">#root>.site-header{display:none!important}.lm-menu-shell[hidden],.lm-js-fallback-nav[hidden]{display:none!important}</style>';

function count(source, needle) {
  return source.split(needle).length - 1;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function navMarkup(language, assetPrefix) {
  const th = language === "th";
  const currentCitymeterUrl = th
    ? "https://montri-th.github.io/CityMETER/"
    : "https://montri-th.github.io/CityMETER/en/";
  const copy = th ? {
    skip: "ข้ามไปเนื้อหาหลัก",
    mainNav: "เมนูหลักของ Landometer",
    contact: "คุยกับเรา",
    openMenu: "เปิดเมนู",
    closeMenu: "ปิดเมนู",
    menu: "เมนู Landometer",
    localLabel: "ในหน้านี้",
    localAria: "ส่วนต่าง ๆ ในหน้า CityMETER",
    decision: "เลือกโจทย์",
    examples: "ดูตัวอย่าง",
    datasets: "ข้อมูลทั้งหมด",
    ecosystem: "Landometer ecosystem",
    ecosystemAria: "เว็บไซต์ใน Landometer ecosystem",
    homeDesc: "หน้าแรก · ผลิตภัณฑ์และบริการ",
    citymeterDesc: "มุมมองข้อมูลเมือง 38 รายการ",
    citywikiDesc: "คู่มือย่าน 45 พื้นที่",
    landomDesc: "ผู้คนที่ร่วมสร้าง Landometer",
    here: "· อยู่ที่นี่",
    all: "เปิด landometer.com — ผลิตภัณฑ์ทั้งหมด",
    fallback: "ทางลัดสำรอง"
  } : {
    skip: "Skip to main content",
    mainNav: "Landometer primary navigation",
    contact: "Contact us",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Landometer menu",
    localLabel: "On this page",
    localAria: "Sections on the CityMETER page",
    decision: "Choose a question",
    examples: "See examples",
    datasets: "All data",
    ecosystem: "Landometer ecosystem",
    ecosystemAria: "Sites in the Landometer ecosystem",
    homeDesc: "Home · products and services",
    citymeterDesc: "38 city data views",
    citywikiDesc: "Guides to 45 areas",
    landomDesc: "People who build Landometer",
    here: "· You are here",
    all: "Open landometer.com — all products",
    fallback: "Fallback shortcuts"
  };

  const localLink = (href, id, icon, label, copyKey) => `
          <a class="lm-page-link" href="${href}" data-lm-scrollspy-link="${id}" data-lm-menu-close>
            <span class="lm-icon" aria-hidden="true">${icon}</span>
            <span data-lm-copy="${copyKey}">${label}</span>
          </a>`;
  const railLink = (href, id, icon, label, copyKey) => `
      <a href="${href}" data-lm-scrollspy-link="${id}" data-lm-rail-label="${copyKey}" data-label="${label}" aria-label="${label}" title="${label}">
        <span class="lm-icon" aria-hidden="true">${icon}</span>
      </a>`;

  return `
    <header class="lm-site-header" data-lm-nav data-nav-preset="citymeter">
      <a class="lm-skip-link" href="#main-content" data-lm-copy="skip">${copy.skip}</a>
      <div class="lm-nav-viewport">
        <div class="lm-nav-row">
          <a class="lm-brand" href="https://landometer.com/" aria-label="Landometer" title="Landometer">
            <span class="lm-brand__lockup">
              <img class="lm-brand__symbol" src="${assetPrefix}assets/landometer-symbol-color.png" width="1601" height="1601" alt="" />
              <span class="lm-brand__wordmark" lang="en">Landometer</span>
            </span>
          </a>
          <span class="lm-product-lockup" aria-label="CityMETER">
            <span class="lm-product-divider" aria-hidden="true">/</span>
            <span class="lm-product-name" lang="en">CityMETER</span>
          </span>
          <nav class="lm-header-actions" aria-label="${copy.mainNav}" data-lm-aria="mainNav">
            <a class="lm-header-link lm-desktop-only" href="${currentCitymeterUrl}" aria-current="page">CityMETER</a>
            <a class="lm-header-link lm-desktop-only" href="https://landometer.com/v3/citywiki">CityWiki</a>
            <span class="lm-nav-cta lm-desktop-only">
              <a class="lm-secondary-button" href="https://montri-th.github.io/rebuild02/#contact" data-lm-copy="contact">${copy.contact}</a>
              <span class="lm-nav-cta__sweep" aria-hidden="true" data-lm-copy="contact">${copy.contact}</span>
            </span>
            <button class="lm-menu-toggle" type="button" data-lm-menu-open aria-haspopup="dialog" aria-expanded="false" aria-controls="lm-site-menu" aria-label="${copy.openMenu}" title="${copy.openMenu}">
              <span class="lm-icon" aria-hidden="true" data-lm-menu-icon>menu</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
    <div class="lm-menu-shell" data-lm-menu-shell hidden>
      <button class="lm-menu-backdrop" type="button" data-lm-menu-close tabindex="-1" aria-hidden="true"></button>
      <div class="lm-menu-panel" id="lm-site-menu" role="dialog" aria-modal="false" aria-label="${copy.menu}" data-lm-aria="menu" tabindex="-1">
        <div class="lm-menu-group lm-menu-mobile-only">
          <p class="lm-menu-label" data-lm-copy="localLabel">${copy.localLabel}</p>
          <nav class="lm-menu-links" aria-label="${copy.localAria}" data-lm-aria="localAria">${localLink("#decisions", "decisions", "checklist", copy.decision, "decision")}${localLink("#examples", "examples", "visibility", copy.examples, "examples")}${localLink("#datasets", "datasets", "database", copy.datasets, "datasets")}
          </nav>
          <div class="lm-menu-cta-wrap">
            <span class="lm-nav-cta">
              <a class="lm-secondary-button" href="https://montri-th.github.io/rebuild02/#contact" data-lm-menu-close data-lm-copy="contact">${copy.contact}</a>
              <span class="lm-nav-cta__sweep" aria-hidden="true" data-lm-copy="contact">${copy.contact}</span>
            </span>
          </div>
        </div>
        <div class="lm-menu-group lm-menu-divider">
          <p class="lm-menu-label lm-menu-label--ecosystem" data-lm-copy="ecosystem">${copy.ecosystem}</p>
          <nav class="lm-menu-links" aria-label="${copy.ecosystemAria}" data-lm-aria="ecosystemAria">
            <a class="lm-ecosystem-link" href="https://montri-th.github.io/rebuild02/">
              <span class="lm-ecosystem-copy"><strong>Landometer</strong><small data-lm-copy="homeDesc">${copy.homeDesc}</small></span>
            </a>
            <a class="lm-ecosystem-link" href="${currentCitymeterUrl}" aria-current="page">
              <span class="lm-ecosystem-copy"><strong>CityMETER</strong><small data-lm-copy="citymeterDesc">${copy.citymeterDesc}</small></span>
              <span class="lm-ecosystem-current" data-lm-copy="here">${copy.here}</span>
            </a>
            <a class="lm-ecosystem-link" href="https://landometer.com/v3/citywiki">
              <span class="lm-ecosystem-copy"><strong>CityWiki</strong><small data-lm-copy="citywikiDesc">${copy.citywikiDesc}</small></span>
            </a>
            <a class="lm-ecosystem-link" href="https://montri-th.github.io/Landom/">
              <span class="lm-ecosystem-copy"><strong>Landom</strong><small data-lm-copy="landomDesc">${copy.landomDesc}</small></span>
            </a>
          </nav>
        </div>
        <a class="lm-menu-all" href="https://landometer.com/" data-lm-copy="all">${copy.all}</a>
      </div>
    </div>
    <nav class="lm-bookmark-rail" aria-label="${copy.localAria}" data-lm-aria="localAria">${railLink("#decisions", "decisions", "checklist", copy.decision, "decision")}${railLink("#examples", "examples", "visibility", copy.examples, "examples")}${railLink("#datasets", "datasets", "database", copy.datasets, "datasets")}
    </nav>
    <nav class="lm-noscript-nav lm-js-fallback-nav" aria-label="${copy.fallback}" data-lm-aria="fallback">
      <a href="#decisions" data-lm-copy="decision">${copy.decision}</a>
      <a href="#examples" data-lm-copy="examples">${copy.examples}</a>
      <a href="#datasets" data-lm-copy="datasets">${copy.datasets}</a>
      <a href="https://montri-th.github.io/rebuild02/#contact" data-lm-copy="contact">${copy.contact}</a>
      <a href="https://montri-th.github.io/rebuild02/">Landometer</a>
      <a href="https://landometer.com/v3/citywiki">CityWiki</a>
      <a href="https://montri-th.github.io/Landom/">Landom</a>
    </nav>
`;
}

function hardenedNavMarkup(language, assetPrefix) {
  const markup = navMarkup(language, assetPrefix);
  const fallbackPattern = /<nav class="lm-noscript-nav lm-js-fallback-nav" aria-label="([^"]+)" data-lm-aria="fallback">([\s\S]*?)<\/nav>/;
  const match = markup.match(fallbackPattern);
  assert(match, "Generated fail-open navigation contract drifted");
  return markup.replace(
    fallbackPattern,
    `<nav class="lm-noscript-nav lm-js-fallback-nav" aria-label="${match[1]}" hidden>${match[2]}</nav>\n    <noscript><nav class="lm-noscript-nav" data-lm-noscript-fallback aria-label="${match[1]}">${match[2]}</nav></noscript>`
  );
}

function updatePage(path, language, assetPrefix) {
  const file = join(root, path);
  let html = readFileSync(file, "utf8");
  const marker = `content="${receiptId}"`;

  if (!html.includes(marker)) {
    const oldHtmlTag = `<html lang="${language}">`;
    const newHtmlTag = `<html lang="${language}" data-ds="landometer" data-ds-version="0.9.0" data-ds-profile="campaign.public" data-delivery-mode="static-initial-html" data-evidence-status="source_limited" data-visibility="public" data-indexable="true">`;
    assert(count(html, oldHtmlTag) === 1, `${path}: unexpected html identity tag`);
    html = html.replace(oldHtmlTag, newHtmlTag);

    const themeMeta = '    <meta name="theme-color" content="#176b82" />';
    const receiptMetas = `${themeMeta}\n    <meta name="landometer:ds-version" content="0.9.0" />\n    <meta name="landometer:color-set" content="color-srgb-05" />\n    <meta name="landometer:artifact-build" content="${buildId}" />\n    <meta name="landometer:release-receipt" content="${receiptId}" />`;
    assert(count(html, themeMeta) === 1, `${path}: theme-color insertion point drifted`);
    html = html.replace(themeMeta, receiptMetas);

    const stylesheet = `    <link rel="stylesheet" href="${assetPrefix}assets/catalog-enhancements-v25.css">`;
    const navAssets = `${stylesheet}\n    <link rel="preload" as="image" href="${assetPrefix}assets/landometer-symbol-color.png" />\n    <link rel="preload" as="font" href="${assetPrefix}assets/material-symbols-rounded-citymeter-nav-outline-r1.ttf" type="font/ttf" crossorigin />\n    <link rel="preload" as="font" href="${assetPrefix}assets/material-symbols-rounded-citymeter-nav-filled-r1.ttf" type="font/ttf" crossorigin />\n${criticalHeaderExclusivityStyle}\n    <link rel="stylesheet" href="${assetPrefix}assets/unified-navbar-r7-v30.css" />\n    <script defer src="${assetPrefix}assets/unified-navbar-r7-v31.js"></script>`;
    assert(count(html, stylesheet) === 1, `${path}: active stylesheet insertion point drifted`);
    html = html.replace(stylesheet, navAssets);

    const rootOpen = '    <div id="root">';
    assert(count(html, rootOpen) === 1, `${path}: #root insertion point drifted`);
    html = html.replace(rootOpen, `${hardenedNavMarkup(language, assetPrefix)}${rootOpen}`);
  }

  const expectedShell = hardenedNavMarkup(language, assetPrefix);
  let shellStart = html.indexOf('\n    <header class="lm-site-header"');
  let rootStart = html.indexOf('    <div id="root">');
  assert(shellStart >= 0 && rootStart > shellStart, `${path}: standalone shell boundary drifted`);
  if (html.slice(shellStart, rootStart) !== expectedShell) {
    assert(!checkOnly, `${path}: standalone shell bytes drifted from deterministic markup`);
    html = `${html.slice(0, shellStart)}${expectedShell}${html.slice(rootStart)}`;
  }

  html = html.replace(' data-build-card-version="0.9.0" data-manifest-version="2.1" data-token-schema-version="6"', "");

  const outlinePreload = `    <link rel="preload" as="font" href="${assetPrefix}assets/material-symbols-rounded-citymeter-nav-outline-r1.ttf" type="font/ttf" crossorigin />`;
  const filledPreload = `    <link rel="preload" as="font" href="${assetPrefix}assets/material-symbols-rounded-citymeter-nav-filled-r1.ttf" type="font/ttf" crossorigin />`;
  if (!html.includes(filledPreload)) {
    assert(count(html, outlinePreload) === 1, `${path}: outline icon-font preload drifted`);
    html = html.replace(outlinePreload, `${outlinePreload}\n${filledPreload}`);
  }

  if (!html.includes(criticalHeaderExclusivityStyle)) {
    const navStylesheet = `    <link rel="stylesheet" href="${assetPrefix}assets/unified-navbar-r7-v30.css" />`;
    assert(count(html, navStylesheet) === 1, `${path}: unified navbar stylesheet drifted`);
    html = html.replace(navStylesheet, `${criticalHeaderExclusivityStyle}\n${navStylesheet}`);
  }

  if (!html.includes('themeMeta.setAttribute("content", theme === "dark" ? "#11191D" : "#F6F7F3")')) {
    const colorSchemeLine = "          document.documentElement.style.colorScheme = theme;";
    const themeColorSync = `${colorSchemeLine}\n          const themeMeta = document.querySelector('meta[name="theme-color"]');\n          if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#11191D" : "#F6F7F3");`;
    assert(count(html, colorSchemeLine) === 1, `${path}: first-paint theme resolver drifted`);
    html = html.replace(colorSchemeLine, themeColorSync);
  }

  if (!html.includes("data-lm-noscript-fallback")) {
    const fallbackPattern = /<nav class="lm-noscript-nav lm-js-fallback-nav" aria-label="([^"]+)">([\s\S]*?)<\/nav>/;
    const match = html.match(fallbackPattern);
    assert(match, `${path}: fail-open navigation migration point drifted`);
    html = html.replace(
      fallbackPattern,
      `<nav class="lm-noscript-nav lm-js-fallback-nav" aria-label="${match[1]}" hidden>${match[2]}</nav>\n    <noscript><nav class="lm-noscript-nav" data-lm-noscript-fallback aria-label="${match[1]}">${match[2]}</nav></noscript>`
    );
  }

  const plainNavScript = `<script defer src="${assetPrefix}assets/unified-navbar-r7-v31.js"></script>`;
  const hardenedNavScript = `<script defer src="${assetPrefix}assets/unified-navbar-r7-v31.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script>`;
  if (html.includes(plainNavScript)) html = html.replace(plainNavScript, hardenedNavScript);

  html = html.replace('<main id="main-content" tabindex="-1">', '<main id="main-content">');

  assert(count(html, marker) === 1, `${path}: missing unified-nav receipt`);
  assert(!html.includes("data-build-card-version=") && !html.includes("data-manifest-version=") && !html.includes("data-token-schema-version="), `${path}: unverified machine-package identity must not be claimed`);
  assert(count(html, 'themeMeta.setAttribute("content", theme === "dark" ? "#11191D" : "#F6F7F3")') === 1, `${path}: first-paint theme-color sync drifted`);
  assert(count(html, 'class="lm-site-header"') === 1, `${path}: unified header count drifted`);
  assert(count(html, 'data-lm-menu-open') === 1, `${path}: unified menu button count drifted`);
  assert(count(html, 'class="lm-bookmark-rail"') === 1, `${path}: bookmark rail count drifted`);
  assert(count(html, "data-lm-noscript-fallback") === 1, `${path}: no-JS fallback count drifted`);
  assert(count(html, 'data-lm-scrollspy-link="decisions"') === 2, `${path}: decisions link parity drifted`);
  assert(count(html, 'data-lm-scrollspy-link="examples"') === 2, `${path}: examples link parity drifted`);
  assert(count(html, 'data-lm-scrollspy-link="datasets"') === 2, `${path}: datasets link parity drifted`);
  assert(count(html, 'id="lm-header-exclusivity"') === 1, `${path}: critical header exclusivity rule drifted`);
  assert(html.includes('#root>.site-header{display:none!important}'), `${path}: legacy header CSS-failure guard is missing`);
  assert(html.includes('<main id="main-content">'), `${path}: skip-link target is missing`);
  assert(count(html, outlinePreload) === 1 && count(html, filledPreload) === 1, `${path}: icon-font preload parity drifted`);
  shellStart = html.indexOf('\n    <header class="lm-site-header"');
  rootStart = html.indexOf('    <div id="root">');
  assert(shellStart >= 0 && rootStart > shellStart, `${path}: standalone shell boundary drifted`);
  assert(html.slice(shellStart, rootStart) === hardenedNavMarkup(language, assetPrefix), `${path}: standalone shell bytes drifted from deterministic markup`);

  if (!checkOnly) {
    const temporary = `${file}.tmp-${process.pid}`;
    writeFileSync(temporary, html);
    renameSync(temporary, file);
  }
}

updatePage("index.html", "th", "./");
updatePage("en/index.html", "en", "../");

console.log(`${checkOnly ? "Checked" : "Applied"} ${receiptId} to TH and EN`);
