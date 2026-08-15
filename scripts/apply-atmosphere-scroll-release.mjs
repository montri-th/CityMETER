import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-15-atmosphere-scroll-v17";

function replaceRequired(source, before, after, label) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`${label}: expected exactly one match; found ${occurrences}`);
  return source.replace(before, after);
}

function replaceFunction(source, startMarker, nextMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(nextMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`${label}: compiled function boundary not found`);
  return source.slice(0, start) + replacement + source.slice(end);
}

function supporterMarkup(prefix, language) {
  const label = language === "th"
    ? "หน่วยงานและเครื่องหมายรับรองที่เกี่ยวข้อง"
    : "Related programme and certification marks";
  const accountAlt = language === "th" ? "บัญชีบริการดิจิทัล" : "Digital Service Account";
  return `<div class="supporter-logos supporter-logos-footer" role="group" aria-label="${label}"><span class="supporter-logo-cell supporter-logo-cell-depa"><img class="supporter-logo supporter-logo-depa" src="${prefix}media/supporters/depa.png" alt="depa" width="2160" height="1350" loading="lazy" decoding="async"/></span><span class="supporter-logo-cell supporter-logo-cell-dsure"><img class="supporter-logo supporter-logo-dsure" src="${prefix}media/supporters/dsure-software.png" alt="dSURE Software" width="1014" height="1465" loading="lazy" decoding="async"/></span><span class="supporter-logo-cell supporter-logo-cell-account"><img class="supporter-logo supporter-logo-account" src="${prefix}media/supporters/digital-service-account.png" alt="${accountAlt}" width="2298" height="1042" loading="lazy" decoding="async"/></span></div>`;
}

function footerHtml(prefix, language) {
  const th = language === "th";
  return `<footer class="site-footer"><div class="wide-container footer-grid"><div class="footer-brand"><a class="landometer-brand" href="https://landometer.com" aria-label="Landometer"><img src="${prefix}media/landometer-logo-horizontal.png" alt="Landometer" width="1800" height="494"/></a><p>${th ? "ข้อมูลพื้นที่สำหรับคัดกรอง เปรียบเทียบ และตรวจต่อก่อนตัดสินใจ" : "Place data for screening, comparison and the checks that come before a decision"}</p>${supporterMarkup(prefix, language)}</div><div class="footer-meta"><nav aria-label="Footer"><a href="#datasets">${th ? "ข้อมูล CityMETER" : "CityMETER data"}</a><a href="https://landometer.com" target="_blank" rel="noreferrer">${th ? "ติดต่อ Landometer" : "Contact Landometer"}</a><a href="#top">${th ? "กลับด้านบน" : "Back to top"}</a></nav><small>© 2026 Landometer</small></div></div></footer>`;
}

function buildMainBundle() {
  const sourcePath = join(root, "assets/index-qbT50gkr-v5.js");
  const targetPath = join(root, "assets/index-qbT50gkr-v6.js");
  let source = readFileSync(sourcePath, "utf8");

  const showcaseComponent = 'function Y6({language:c,text:f}){const g=z6.map(lc);return p.jsx("section",{className:"section showcase-section",id:"examples","aria-labelledby":"examples-title",children:p.jsxs(p.Fragment,{children:[p.jsx("div",{className:"showcase-atmosphere",children:p.jsx("div",{className:"wide-container",children:p.jsx(oc,{eyebrow:f.highlightsSection.eyebrow,title:f.highlightsSection.title,intro:f.highlightsSection.intro,id:"examples-title"})})}),p.jsx("div",{className:"wide-container showcase-content",children:p.jsx("div",{className:"showcase-grid",children:g.map((s,d)=>{const h=sc(s);return p.jsxs("article",{className:d<2?"showcase-card showcase-card-wide":"showcase-card","data-pillar":s.group,children:[p.jsxs("a",{className:"showcase-image",href:s.href,target:"_blank",rel:"noreferrer",children:[p.jsx("img",{src:ca(h.previewPath),alt:c==="th"?`ตัวอย่าง ${s.th}`:`${s.en} example`,width:"1200",height:"750",loading:"lazy",decoding:"async"}),p.jsx("span",{className:"preview-focus-label",children:h.focusLabel[c]})]}),p.jsxs("div",{className:"showcase-copy",children:[p.jsx("span",{className:"record-group",children:s.group.toUpperCase()}),p.jsx("h3",{children:c==="th"?s.th:s.en}),p.jsx("p",{children:s.marketing.visualStory[c]}),p.jsx("div",{className:"feature-tags",children:s.marketing.featureTags.slice(0,3).map(A=>p.jsx("span",{children:A[c]},A.id))}),p.jsxs("div",{className:"scope-line",children:[p.jsx(gf,{size:19,"aria-hidden":"true"}),p.jsx("span",{children:s.marketing.evidencedScope[c]})]}),p.jsxs("a",{className:"inline-action",href:s.href,target:"_blank",rel:"noreferrer",children:[f.highlightsSection.openMap,p.jsx(Yl,{size:18,weight:"bold"})]})]})]},s.id)})})})]})})}';
  source = replaceFunction(source, "function Y6({language:c,text:f})", "function G6(", showcaseComponent, "showcase atmosphere component");

  const footerComponent = 'function K6({text:c,language:f}){const g=f==="th"?"หน่วยงานและเครื่องหมายรับรองที่เกี่ยวข้อง":"Related programme and certification marks",s=f==="th"?"บัญชีบริการดิจิทัล":"Digital Service Account";return p.jsx("footer",{className:"site-footer",children:p.jsxs("div",{className:"wide-container footer-grid",children:[p.jsxs("div",{className:"footer-brand",children:[p.jsx(_f,{}),p.jsx("p",{children:c.footer.summary}),p.jsxs("div",{className:"supporter-logos supporter-logos-footer",role:"group","aria-label":g,children:[p.jsx("span",{className:"supporter-logo-cell supporter-logo-cell-depa",children:p.jsx("img",{className:"supporter-logo supporter-logo-depa",src:ca("media/supporters/depa.png"),alt:"depa",width:"2160",height:"1350",loading:"lazy",decoding:"async"})}),p.jsx("span",{className:"supporter-logo-cell supporter-logo-cell-dsure",children:p.jsx("img",{className:"supporter-logo supporter-logo-dsure",src:ca("media/supporters/dsure-software.png"),alt:"dSURE Software",width:"1014",height:"1465",loading:"lazy",decoding:"async"})}),p.jsx("span",{className:"supporter-logo-cell supporter-logo-cell-account",children:p.jsx("img",{className:"supporter-logo supporter-logo-account",src:ca("media/supporters/digital-service-account.png"),alt:s,width:"2298",height:"1042",loading:"lazy",decoding:"async"})})]})]}),p.jsxs("div",{className:"footer-meta",children:[p.jsxs("nav",{"aria-label":"Footer",children:[p.jsx("a",{href:"#datasets",children:c.footer.datasets}),p.jsx("a",{href:"https://landometer.com",target:"_blank",rel:"noreferrer",children:c.footer.contact}),p.jsx("a",{href:"#top",children:c.footer.backToTop})]}),p.jsx("small",{children:c.footer.copyright(new Date().getFullYear())})]})]})})}';
  source = replaceFunction(source, "function K6({text:c})", "function J6(", footerComponent, "stable footer component");
  source = replaceRequired(source, 'p.jsx(K6,{text:E})', 'p.jsx(K6,{text:E,language:f})', "footer language binding");

  for (const contract of [
    'className:"showcase-atmosphere"',
    'className:"supporter-logos supporter-logos-footer"',
    'className:"footer-meta"',
    'p.jsx(K6,{text:E,language:f})'
  ]) {
    if (!source.includes(contract)) throw new Error(`Compiled atmosphere/footer contract is missing: ${contract}`);
  }
  writeFileSync(targetPath, source);
}

function buildEnhancementScript() {
  const sourcePath = join(root, "assets/catalog-enhancements-v16.js");
  const targetPath = join(root, "assets/catalog-enhancements-v17.js");
  let source = readFileSync(sourcePath, "utf8");

  source = replaceRequired(
    source,
    '  const reducedMotion = globalThis.matchMedia\n    ? globalThis.matchMedia("(prefers-reduced-motion: reduce)")\n    : { matches: false };\n',
    '  const reducedMotion = globalThis.matchMedia\n    ? globalThis.matchMedia("(prefers-reduced-motion: reduce)")\n    : { matches: false };\n  const coarsePointer = globalThis.matchMedia\n    ? globalThis.matchMedia("(pointer: coarse)")\n    : { matches: false };\n',
    "coarse-pointer motion guard"
  );
  source = replaceRequired(
    source,
    '    if (reducedMotion.matches || typeof Element.prototype.animate !== "function") {\n      pendingLayoutMotion = null;\n      globalThis.__CITYMETER_MOTION_DEBUG__ = {\n        reason: "reduced-motion",\n',
    '    if (reducedMotion.matches || coarsePointer.matches || typeof Element.prototype.animate !== "function") {\n      pendingLayoutMotion = null;\n      globalThis.__CITYMETER_MOTION_DEBUG__ = {\n        reason: coarsePointer.matches ? "coarse-pointer" : "reduced-motion",\n',
    "touch layout-motion suppression"
  );
  source = replaceRequired(
    source,
    "        duration: 0,\n        reducedMotion: true,\n",
    "        duration: 0,\n        reducedMotion: reducedMotion.matches,\n        coarsePointer: coarsePointer.matches,\n",
    "motion debug state accuracy"
  );
  source = replaceRequired(
    source,
    `  function enhanceFooterBranding() {
    const footerLead = document.querySelector(".site-footer .footer-grid > div:first-child");
    if (!footerLead) return;
    footerLead.querySelector(".supporter-lockup-footer")?.remove();
    let supporter = footerLead.querySelector(".supporter-logos-footer");
    if (!supporter) {
      supporter = createSupporterLogos("footer");
      footerLead.append(supporter);
    }
  }

`,
    "",
    "late footer injection removal"
  );
  source = replaceRequired(source, "    enhanceHero();\n    enhanceFooterBranding();\n", "    enhanceHero();\n", "footer enhancement call removal");
  source = source.replaceAll("20260815-performance-clarity-v16", "20260815-atmosphere-scroll-v17");

  if (source.includes("function enhanceFooterBranding") || source.includes("enhanceFooterBranding();")) {
    throw new Error("Late footer branding injection remains");
  }
  if (!source.includes('globalThis.matchMedia("(pointer: coarse)")')) {
    throw new Error("Touch layout-motion guard was not applied");
  }
  writeFileSync(targetPath, source);
}

function buildEnhancementStyles() {
  const sourcePath = join(root, "assets/catalog-enhancements-v16.css");
  const targetPath = join(root, "assets/catalog-enhancements-v17.css");
  let source = readFileSync(sourcePath, "utf8");

  source = source.replace(
    "/* CityMETER performance, full-frame media and categorical pillar layer — 2026-08-15 */",
    "/* CityMETER governed atmosphere cadence and iPhone scroll-end layer — 2026-08-15 */"
  );
  source = replaceRequired(
    source,
    ":root {\n  --motion-duration-feedback: 120ms;",
    `:root {
  /* Canonical atmosphere recipes and complete foreground contracts from
     Landometer Design System v0.8.9. These describe journey moments only;
     they never encode Land / Location / Living or any data state. */
  --atmosphere-measure: linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%);
  --atmosphere-measure-primary: #ffffff;
  --atmosphere-measure-secondary: #f1f4ef;
  --atmosphere-measure-separator: #f1f4ef;
  --atmosphere-measure-focus-inner: #182327;
  --atmosphere-measure-focus-outer: #ffffff;
  --atmosphere-ground: linear-gradient(135deg, #C4E0EE 0%, #B2E2E2 50%, #CCE6D0 100%);
  --atmosphere-ground-primary: #182327;
  --atmosphere-ground-secondary: #293337;
  --atmosphere-ground-separator: #182327;
  --atmosphere-ground-focus-inner: #ffffff;
  --atmosphere-ground-focus-outer: #182327;
  --atmosphere-cultivate: linear-gradient(135deg, #EB8182 0%, #F5A06F 50%, #EBC573 100%);
  --atmosphere-cultivate-primary: #182327;
  --atmosphere-cultivate-secondary: #293337;
  --atmosphere-cultivate-separator: #182327;
  --atmosphere-cultivate-focus-inner: #ffffff;
  --atmosphere-cultivate-focus-outer: #182327;
  --motion-duration-feedback: 120ms;`,
    "light atmosphere tokens"
  );
  source = replaceRequired(
    source,
    '[data-theme="dark"] {\n  --section-surface-decision: #11191d;',
    `[data-theme="dark"] {
  --atmosphere-measure: linear-gradient(135deg, #89CEF6 0%, #5ECAD6 50%, #6CD5B3 100%);
  --atmosphere-measure-primary: #182327;
  --atmosphere-measure-secondary: #293337;
  --atmosphere-measure-separator: #182327;
  --atmosphere-measure-focus-inner: #ffffff;
  --atmosphere-measure-focus-outer: #182327;
  --atmosphere-ground: linear-gradient(135deg, #0F5773 0%, #006A6A 50%, #1F744F 100%);
  --atmosphere-ground-primary: #ffffff;
  --atmosphere-ground-secondary: #f1f4ef;
  --atmosphere-ground-separator: #f1f4ef;
  --atmosphere-ground-focus-inner: #182327;
  --atmosphere-ground-focus-outer: #ffffff;
  --atmosphere-cultivate: linear-gradient(135deg, #F7CBC7 0%, #FBD1B6 50%, #F1E0B4 100%);
  --atmosphere-cultivate-primary: #182327;
  --atmosphere-cultivate-secondary: #293337;
  --atmosphere-cultivate-separator: #182327;
  --atmosphere-cultivate-focus-inner: #ffffff;
  --atmosphere-cultivate-focus-outer: #182327;
  --section-surface-decision: #11191d;`,
    "dark atmosphere tokens"
  );
  source = replaceRequired(
    source,
    `html,
body {
  overscroll-behavior-y: none;
}

body {
  min-width: 0;
}
`,
    `html,
body {
  overscroll-behavior-y: none;
}

/* iOS can expose the root canvas during native elastic pull even when the
   document ends exactly at the footer. Paint that canvas with the footer
   surface, and keep normal document scrolling, sticky headers and anchors. */
html,
body,
#root {
  background: var(--section-surface-footer);
}

body {
  min-width: 0;
}

#root {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

#root > main {
  flex: 1 0 auto;
}

#root > .site-footer {
  flex: 0 0 auto;
}
`,
    "root scroll-end paint contract"
  );
  source = replaceRequired(
    source,
    `/* v0.8.9 Measure deep: governed opening/closure atmosphere with protected
   Brand Blue as the exact first stop. */
.hero,
.handoff-section {
  background: linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%);
}
`,
    `/* Three major atmosphere records across a long route: Measure for entry,
   Ground for orientation and Cultivate for closure. Flat evidence-led scenes
   separate every moment; cards remain opaque local surfaces. */
.hero {
  background: var(--atmosphere-measure);
  color: var(--atmosphere-measure-primary);
}

.hero :is(h1, .brand-promise, .hero-text-link) {
  color: var(--atmosphere-measure-primary);
}

.hero :is(.hero-support, .eyebrow-on-dark) {
  color: var(--atmosphere-measure-secondary);
}

.hero :is(a, button):focus-visible {
  outline-color: var(--atmosphere-measure-focus-outer);
  box-shadow: 0 0 0 2px var(--atmosphere-measure-focus-inner);
}

/* The proof rail is an opaque nested surface, independent of the Measure
   theme pair. */
.hero-proof-rail {
  border-color: #7c8a84;
  background: #11191d;
}

.hero-proof-item {
  background: #172126;
}

.showcase-section.section {
  padding-block: 0;
  background: var(--section-surface-showcase);
}

.showcase-atmosphere {
  background: var(--atmosphere-ground);
  color: var(--atmosphere-ground-primary);
  padding-block: clamp(82px, 9vw, 132px) clamp(50px, 5vw, 76px);
}

.showcase-atmosphere .section-heading {
  margin-bottom: 0;
}

.showcase-atmosphere :is(h2, .eyebrow) {
  color: var(--atmosphere-ground-primary);
}

.showcase-atmosphere .section-heading > p:last-child {
  color: var(--atmosphere-ground-secondary);
}

.showcase-content {
  padding-block: clamp(50px, 6vw, 92px) clamp(82px, 9vw, 156px);
}

.handoff-section {
  background: var(--atmosphere-cultivate);
  color: var(--atmosphere-cultivate-primary);
}

.handoff-section :is(.handoff-copy h2, .eyebrow-on-dark) {
  color: var(--atmosphere-cultivate-primary);
}

.handoff-copy > p:not(.eyebrow):not(.share-feedback),
.handoff-section .share-feedback {
  color: var(--atmosphere-cultivate-secondary);
}

.handoff-shot {
  border-color: var(--atmosphere-cultivate-separator);
}

.handoff-section .qr-card {
  --text: #182327;
  --text-secondary: #293337;
  --text-meta: #293337;
  --accent: #176b82;
  --card: #ffffff;
  --border: #7d877f;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
}

.handoff-section .qr-card figcaption {
  color: var(--text);
}

.handoff-section .qr-card figcaption svg {
  color: var(--accent);
}

.handoff-section :is(a, button):focus-visible {
  outline-color: var(--atmosphere-cultivate-focus-outer);
  box-shadow: 0 0 0 2px var(--atmosphere-cultivate-focus-inner);
}
`,
    "governed atmosphere cadence"
  );
  source = replaceRequired(
    source,
    `.hero-page-qr {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  width: fit-content;
  max-width: 100%;
  margin-top: 20px;
  padding: 9px 16px 9px 9px;
  border: 1px solid rgba(255, 255, 255, .38);
  border-radius: 18px;
  background: rgba(7, 37, 47, .42);
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .14);
  backdrop-filter: blur(10px);
}
`,
    `.hero-page-qr {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  width: fit-content;
  max-width: 100%;
  margin-top: 20px;
  padding: 9px 16px 9px 9px;
  border: 1px solid #7c8a84;
  border-radius: 18px;
  background: #11191d;
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .14);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
`,
    "opaque hero QR contract"
  );
  source = replaceRequired(
    source,
    `.hero-page-qr-copy span {
  color: rgba(255, 255, 255, .76);
  font-size: .78rem;
}
`,
    `.hero-page-qr-copy span {
  color: #f1f4ef;
  font-size: .78rem;
}
`,
    "hero QR secondary foreground"
  );
  source = replaceRequired(
    source,
    `.site-footer {
  overflow-x: clip;
  background: var(--section-surface-footer);
  padding-block: 34px;
}

.site-footer .footer-grid {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: clamp(32px, 6vw, 84px);
  row-gap: 16px;
  max-width: 1120px;
}

.site-footer .footer-grid > * {
  min-width: 0;
}

.site-footer .footer-grid nav {
  align-self: start;
  justify-content: flex-end;
  flex-wrap: wrap;
  max-width: 420px;
}

.site-footer .footer-grid > small {
  grid-column: 2;
  justify-self: end;
}
`,
    `.site-footer {
  overflow-x: clip;
  background: var(--section-surface-footer);
  padding-block-start: 34px;
  padding-block-end: max(34px, env(safe-area-inset-bottom, 0px));
}

.site-footer .footer-grid {
  grid-template-columns: minmax(0, 1fr) minmax(260px, auto);
  align-items: start;
  column-gap: clamp(32px, 6vw, 84px);
  max-width: 1120px;
}

.site-footer .footer-grid > * {
  min-width: 0;
}

.site-footer .footer-meta {
  display: grid;
  justify-items: end;
  gap: 12px;
}

.site-footer .footer-grid nav {
  justify-content: flex-end;
  flex-wrap: wrap;
  max-width: 420px;
}

.site-footer .footer-meta > small {
  justify-self: end;
}
`,
    "stable footer grid"
  );
  source = replaceRequired(
    source,
    `  .site-footer .footer-grid nav {
    justify-content: flex-start;
  }

  .site-footer .footer-grid > small {
    grid-column: 1;
    justify-self: start;
  }
`,
    `  .site-footer .footer-meta {
    justify-items: start;
  }

  .site-footer .footer-grid nav {
    justify-content: flex-start;
  }

  .site-footer .footer-meta > small {
    justify-self: start;
  }
`,
    "mobile footer grid"
  );

  for (const contract of [
    "--atmosphere-measure",
    "--atmosphere-ground",
    "--atmosphere-cultivate",
    ".showcase-atmosphere",
    "env(safe-area-inset-bottom, 0px)",
    "background: var(--section-surface-footer)"
  ]) {
    if (!source.includes(contract)) throw new Error(`Atmosphere/scroll CSS contract is missing: ${contract}`);
  }
  writeFileSync(targetPath, source);
}

function updateHtml(page) {
  const path = join(root, page);
  const language = page === "index.html" ? "th" : "en";
  const prefix = language === "th" ? "./" : "../";
  let source = readFileSync(path, "utf8");

  source = source
    .replaceAll("index-qbT50gkr-v5.js", "index-qbT50gkr-v6.js")
    .replaceAll("catalog-enhancements-v16.css", "catalog-enhancements-v17.css")
    .replaceAll("catalog-enhancements-v16.js", "catalog-enhancements-v17.js")
    .replaceAll("2026-08-15-performance-clarity-v16", releaseReceipt);

  const showcasePattern = /(<section class="section showcase-section"[^>]*>)<div class="wide-container">(<div class="section-heading">[\s\S]*?<\/div>)<div class="showcase-grid">/;
  if (showcasePattern.test(source)) {
    source = source.replace(
      showcasePattern,
      '$1<div class="showcase-atmosphere"><div class="wide-container">$2</div></div><div class="wide-container showcase-content"><div class="showcase-grid">'
    );
  }

  const footerPattern = /<footer class="site-footer">[\s\S]*?<\/footer>/;
  if (!footerPattern.test(source)) throw new Error(`${page}: footer boundary not found`);
  source = source.replace(footerPattern, footerHtml(prefix, language));

  if ((source.match(/class="showcase-atmosphere"/g) || []).length !== 1) {
    throw new Error(`${page}: expected one Ground orientation band`);
  }
  if ((source.match(/class="supporter-logos supporter-logos-footer"/g) || []).length !== 1) {
    throw new Error(`${page}: stable footer supporters are missing or duplicated`);
  }
  if (!source.includes('class="footer-meta"') || !source.includes(releaseReceipt)) {
    throw new Error(`${page}: footer/release receipt contract is incomplete`);
  }
  writeFileSync(path, source);
}

buildMainBundle();
buildEnhancementScript();
buildEnhancementStyles();
updateHtml("index.html");
updateHtml("en/index.html");

console.log(`Applied CityMETER ${releaseReceipt}`);
