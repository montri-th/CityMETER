import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { replaceOnce } from "./lib/patch-public.mjs";
import { validatePreviewContract } from "./lib/preview-contract.mjs";
import { languageForPath } from "./lib/route-language.mjs";
import { datasetQr } from "./lib/catalog-qr.mjs";
import { publicFooter, faviconHead } from "./lib/public-shell.mjs";
import {
  catalogInner,
  showcaseInner,
  identityGraph,
  json,
  detailUrl,
  sourcePanel,
  esc,
} from "./lib/catalog-render.mjs";
import { attachArticleNavbar, navbarArticleRoutes } from "./lib/article-navbar.mjs";
import { detailPage } from "./lib/summary-article.mjs";
import { uiIconHead } from "./lib/ui-icon.mjs";
import { materializeUiIconsInBundle, materializeUiIconsInHtml, materializeNavbarIcons } from "./lib/ui-icon-migration.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const catalog = JSON.parse(read("src/catalog.json"));
const projection = JSON.parse(read("data/landom-contributors.json"));
const stories = JSON.parse(read("src/dataset-stories.json"));
const storyByCode = new Map(stories.records.map(story => [story.datasetCode, story]));
if (storyByCode.size !== 43 || catalog.records.some(record => !storyByCode.has(record.datasetCode))) throw Error("Expected an independently authored article for every public data view");
const versionedPublicAssets = new Set([
 "index-public-catalog-r1.js","catalog-enhancements-public-r1.js","unified-navbar-public-r1.js",
 "catalog-public-r1.js","dataset-summary-public-r1.js","catalog-public-r1.css",
 "dataset-summary-public-r1.css","catalog-shell-current-r1.css","navbar-current-r1.css",
 "public-footer-r1.css","ui-icons-current-r1.css","catalog-layout-public-r1.js"
]);
function versionPublicAssets(html) {
 return html.replace(/((?:src|href)="(?:[^"?]*\/)?assets\/)([^"?]+)(?:\?[^" ]*)?"/g,(whole,prefix,file)=>
  versionedPublicAssets.has(file) ? `${prefix}${file}?v=${catalog.contentVersion}-${hash(outputs.get("assets/"+file)).slice(0,12)}"` : whole);
}
const outputs = new Map();
const emit = (path, value) =>
  outputs.set(
    path,
    typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n",
  );
const pinned = {
  "assets/index-qbT50gkr-v18.js":
    "808fa6d1805b61181c8675885e68d3be664dcc50d277df3a3af21d0d85c3bed0",
  "assets/catalog-enhancements-ds-0.9.1-v26.js":
    "f38e255ed8f921ea7beda520fe9d6eff9da0078ef69f892747b8585fad2807d5",
  "assets/unified-navbar-r7-v32.js":
    "461cec2c203236d3a0bf4f73333690b9eec731647e0c78cff8a1bb61e9e00989",
  "assets/unified-navbar-r7-ds-0.9.1-v34.css":
    "4aa2f994dc67e56866a9dc7d4805acfd206d647b33b0112e27ae69de3b2f08a3",
  "assets/index-cqxdfePB.css":
    "96c6366c085d7d36d9f6786f1f77f2bacb279805ff1e3e7fb7743ee30bf0a6e1",
  "assets/citymeter-ds-0.9.1-approach-reveal-v1.js":
    "378c8797958cae7b39311125abe6d759eee6b9056b23c5d59243fb0786d88100",
  "assets/catalog-enhancements-ds-0.9.1-v30.css":
    "7e3ed3a8b600114480e5b5cce63767f3e01c17800876549ec42e0a04b3abe041",
  "assets/landometer-ds/v0.9.7/color-srgb-10.production.css":
    "3d34924a249804c4573da5b136303141b67c47f24a3f00dd5d7b86b521d9dfc8",
};
for (const [path, sha] of Object.entries(pinned))
  if (hash(readFileSync(resolve(root, path))) !== sha)
    throw Error(`Immutable input changed: ${path}`);
if (
  catalog.records.length !== 43 ||
  new Set(catalog.records.map((r) => r.id)).size !== 43
)
  throw Error("Expected 43 unique public records");
const bundlePath = "assets/index-public-catalog-r1.js";
const enhancerPath = "assets/catalog-enhancements-public-r1.js";
const navPath = "assets/unified-navbar-public-r1.js";
function replaceSpan(source, start, end, replacement) {
  const a = source.indexOf(start),
    b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw Error(`Patch span absent: ${start}`);
  return source.slice(0, a) + replacement + source.slice(b);
}
// Only public, plain object/array literals are parsed. No private app implementation is imported.
function literalSpan(source, marker) {
  const a = source.indexOf(marker);
  if (a < 0) throw Error(`Missing literal ${marker}`);
  const start = a + marker.length;
  let depth = 0,
    quote = null,
    escape = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return [start, i + 1];
    }
  }
  throw Error(`Unclosed literal ${marker}`);
}
function replaceLiteral(source, marker, value) {
  const [a, b] = literalSpan(source, marker);
  return source.slice(0, a) + json(value) + source.slice(b);
}
const copyFixes = [
  ["ประชากรจดทะเบียนไม่ใช่ประชากรกลางวัน ผู้อยู่อาศัยจริง หรือข้อมูลสด", ""],
  ["Open Buildings ไม่ใช่ทะเบียนอาคารและอาจไม่ครอบคลุมทุกสิ่งปลูกสร้าง", ""],
  ["รายได้เพียงอย่างเดียวไม่ใช่คุณภาพบริการหรือสุขภาพการคลัง", ""],
  ["จำนวนผู้เยี่ยมเยือนไม่ใช่จำนวนบุคคลไม่ซ้ำ และตัวเลขอาจมีการปรับปรุง", ""],
  ["Registered population is not daytime, resident or live population", ""],
  ["Open Buildings is not a building register and may not cover every structure", ""],
  ["Revenue alone is not service quality or fiscal health", ""],
  ["Visitor counts are not unique people and figures may be revised", ""],

  ["สำรวจตัวอย่างอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยง พร้อมดูขอบเขตและสิ่งที่ยังต้องตรวจ ก่อนเปิดพื้นที่ที่สนใจ", "มองที่ดิน เห็นตลาด เข้าใจผู้คนผ่านแผนที่ เลือกข้อมูลที่ตรงกับคำถาม แล้วเปิดดูพื้นที่ที่สนใจได้ทันที"],
  ["Explore examples across buildings, prices, businesses, people, access and risk, with each record’s scope and checks to make before you open a place.", "See land, markets and everyday life through maps. Choose the data that fits your question and open the place you want to explore."],
  ["แต่ละรายการบอกระดับพื้นที่ที่รองรับได้ หรือสิ่งที่ยังต้องตรวจ", "เริ่มจากภาพรวม แล้วเปิดดูรายละเอียดพื้นที่ที่สนใจ"],
  ["Each record states the spatial level it supports or what still needs checking", "Start with the overview, then explore a place in detail"],
  ["แต่ละรายการระบุขอบเขตแยกกัน", "เลือกเปิดข้อมูลที่ตรงกับคำถามของคุณ"],
  ["Each record states its own scope", "Open the data that fits your question"],
  ["ส่งชื่อพื้นที่และสิ่งที่ต้องตัดสินใจมา ทีมจะช่วยชี้ข้อมูลที่เกี่ยวข้องและสิ่งที่ยังต้องตรวจเพิ่ม", "ส่งชื่อพื้นที่และคำถามมา ทีมจะช่วยเลือกข้อมูลให้ตรงกับเรื่องที่คุณกำลังตัดสินใจ"],
  ["Send us the place and decision. We can point you to the relevant data and what still needs checking.", "Tell us the place and your question. Our team can help you choose the data for your decision."],
  ["เทียบอาคาร ราคา และข้อจำกัดรอบพื้นที่ เพื่อเลือกจุดที่ควรตรวจต่อก่อนลงทุน", "เทียบอาคาร ราคา และบริบทรอบพื้นที่ เพื่อเลือกทำเลที่อยากศึกษาให้ลึกขึ้น"],
  ["Compare buildings, prices and nearby constraints to find the places worth checking before you invest.", "Compare buildings, prices and the surroundings to choose locations you want to explore further."],
  ["ประชากรจดทะเบียน. โครงสร้างอายุ เพศ และความหนาแน่นประชากร. ประชากรจดทะเบียนไม่ใช่ประชากรกลางวัน ผู้อยู่อาศัยจริง หรือข้อมูลสด", "ประชากรตามทะเบียน: ดูโครงสร้างอายุ เพศ และความหนาแน่นบนแผนที่"],
  ["อาคาร 3 มิติที่สวนพลู. พื้นที่อาคารรวม จำนวนอาคาร ความสูง และจำนวนชั้น. Open Buildings ไม่ใช่ทะเบียนอาคารและอาจไม่ครอบคลุมทุกสิ่งปลูกสร้าง", "อาคารสามมิติที่สวนพลู: ดูพื้นที่อาคารรวม จำนวนอาคาร ความสูง และจำนวนชั้น"],
  ["รายได้องค์กรปกครองส่วนท้องถิ่น. เปรียบเทียบแหล่งรายได้ รายได้ต่อคน และรายได้ต่อพื้นที่. รายได้เพียงอย่างเดียวไม่ใช่คุณภาพบริการหรือสุขภาพการคลัง", "รายได้องค์กรปกครองส่วนท้องถิ่น: เปรียบเทียบแหล่งรายได้ รายได้ต่อคน และรายได้ต่อพื้นที่"],
  ["อุปสงค์การท่องเที่ยว. ผู้เยี่ยมเยือน การใช้จ่าย ฤดูกาล และการเปรียบเทียบจังหวัด. จำนวนผู้เยี่ยมเยือนไม่ใช่จำนวนบุคคลไม่ซ้ำ และตัวเลขอาจมีการปรับปรุง", "การท่องเที่ยว: ดูผู้เยี่ยมเยือน การใช้จ่าย ฤดูกาล และเปรียบเทียบจังหวัด"],
  ["Registered population. Age, sex and population-density structure. Registered population is not daytime, resident or live population", "Registered population: age, sex and population density on the map."],
  ["3D buildings in Suan Plu. Gross floor area, building count, height and floors. Open Buildings is not a building register and may not cover every structure", "3D buildings in Suan Phlu: estimated floor area, building count, height and floors."],
  ["Municipal revenue. Revenue sources, revenue per person and revenue per area. Revenue alone is not service quality or fiscal health", "Municipal revenue: compare revenue sources, revenue per person and revenue per area."],
  ["Tourism demand. Visitors, spending, seasonality and province comparison. Visitor counts are not unique people and figures may be revised", "Tourism: explore visitors, spending, seasonality and province comparisons."],

  [
    "ตัวชี้วัดอาคารที่มีใน implementation จริง",
    "เห็นขนาด ความสูง และพื้นที่ใช้สอยโดยประมาณของอาคาร",
  ],
  ["38 มุมมองข้อมูลและโมดูล", "43 มุมมองข้อมูลและโมดูล"],
  ["38 data views and modules", "43 data views and modules"],
  ["เชื่อม 38 มุมมองให้ค้น เทียบ", "เชื่อม 43 มุมมองให้ค้น เทียบ"],
  ["Connects 38 views so people", "Connects 43 views so people"],
  ["มุมมองข้อมูลเมือง 38 รายการ", "มุมมองข้อมูลเมือง 43 รายการ"],
  ["38 city data views", "43 city data views"],
  [
    "Building indicators available in the actual implementation",
    "Explore building size, height and estimated floor area",
  ],
  [
    "Building metrics visible in the working implementation",
    "Explore building size, height and estimated floor area",
  ],
  ["Spatial unit", "Level of detail"],
  ["หน่วยเชิงพื้นที่", "ระดับรายละเอียด"],
];
function fixCopy(value) {
  for (const [old, next] of copyFixes) value = value.replaceAll(old, next);
  return value;
}
let bundle = read("assets/index-qbT50gkr-v18.js");
bundle = replaceLiteral(bundle, "p6=", catalog.groups);
bundle = replaceLiteral(
  bundle,
  "Rt=",
  catalog.records.map((r) => ({
    id: r.id,
    group: r.group,
    th: r.title.th,
    en: r.title.en,
    description: r.description.th,
    kind: "ข้อมูลเชิงพื้นที่",
    href: r.mapUrl,
    previewAvailable: r.preview.available,
  })),
);
bundle = replaceLiteral(bundle, "const y6=Object.freeze(", catalog.tagLabels);
bundle = replaceLiteral(
  bundle,
  ",c0=",
  Object.fromEntries(
    catalog.records.map((r) => [
      r.id,
      {
        tags: r.tags,
        scope: r.scope,
        granularity: r.granularity,
        visualStory: r.description,
        limitation: r.limitation,
      },
    ]),
  ),
);
bundle = replaceSpan(
  bundle,
  "function b6(){",
  "b6();",
  'function b6(){if(Rt.length!==43||new Set(Rt.map(x=>x.id)).size!==43||Object.keys(c0).length!==43||Rt.some(x=>!c0[x.id]))throw new Error("Public catalog registry mismatch");}',
);
// The original interactive decision panels remain React-owned. Their references resolve only to public records.
const [qa, qb] = literalSpan(bundle, "const qt=");
const intents = Function(`"use strict";return (${bundle.slice(qa, qb)})`)().map(
  (x) => ({
    ...x,
    recordIds: x.recordIds.filter((id) => id !== "business-dynamics"),
  }),
);
bundle = replaceLiteral(bundle, "const qt=", intents);
bundle = replaceLiteral(bundle, "z6=", catalog.showcaseIds);
bundle = replaceSpan(
  bundle,
  "function R6(){",
  "function _6(){",
  `function R6(){return typeof window==="undefined"?"th":(${languageForPath.toString()})(window.location.pathname)}`,
);
bundle = bundle.replace(
  '"analysis-brief":"business-dynamics"',
  '"analysis-brief":"buildings"',
);
const catalogs = Object.fromEntries(
  ["th", "en"].map((lang) => [
    lang,
    catalogInner(catalog, lang, projection, lang === "th" ? "./" : "../"),
  ]),
);
const showcases = Object.fromEntries(
  ["th", "en"].map((lang) => [
    lang,
    showcaseInner(catalog, lang, lang === "th" ? "./" : "../"),
  ]),
);
const graphs = Object.fromEntries(
  ["th", "en"].map((lang) => [lang, json(identityGraph(catalog, lang))]),
);
bundle = replaceSpan(
  bundle,
  "function Q6(",
  "function X6(",
  `function Q6({language:c}){return p.jsx("section",{className:"section explorer-section",id:"datasets","aria-labelledby":"datasets-title",ref:n=>{if(n)document.dispatchEvent(new Event("citymeter:catalog-ready"))},dangerouslySetInnerHTML:{__html:${json(catalogs)}[c]}})}\n`,
);
bundle = replaceSpan(
  bundle,
  "function Y6(",
  "const CitymeterP1VisibleLimit",
  `function Y6({language:c}){return p.jsx("section",{className:"section showcase-section",id:"examples","aria-labelledby":"examples-title",dangerouslySetInnerHTML:{__html:${json(showcases)}[c]}})}\n`,
);
bundle = replaceSpan(
  bundle,
  "function L6(){",
  "function _f(",
  `function L6(){const c=document.documentElement.lang==="en"?"en":"th";return p.jsx("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:${json(graphs)}[c]}})}\n`,
);
// One shared footer supplies initial HTML and the React-owned footer.
const footers = Object.fromEntries(["th", "en"].map((lang) => [lang, publicFooter(lang, lang === "th" ? "./" : "../", { kind: "catalog" })]));
const footerContents = Object.fromEntries(Object.entries(footers).map(([lang, html]) => [lang, html.replace(/^<footer[^>]*>/, "").replace(/<\/footer>$/, "")]));
bundle = replaceSpan(bundle, "function K6(", "function J6(", `function K6({language:f}){return p.jsx("footer",{className:"cm-public-footer","aria-labelledby":"cm-footer-title",dangerouslySetInnerHTML:{__html:${json(footerContents)}[f]}})}\n`);
bundle = bundle.replace('["business-dynamics",1],', "");
const [pa, pb] = literalSpan(bundle, "qn=");
const historicalPreviews = Function(
  `"use strict";return (${bundle.slice(pa, pb)})`,
)().filter((x) => x.id !== "business-dynamics");
const previews = catalog.records.filter((record) => record.preview.available).map((record) => {
  const retained = historicalPreviews.find((item) => item.id === record.id);
  return { ...(retained || {}), id: record.id, assetStatus: retained?.assetStatus || "ready", image: record.preview.path, largeImage: record.preview.largePath, previewPath: `/${record.preview.path}`, focusLabel: record.preview.focusLabel };
});
bundle = replaceLiteral(bundle, "qn=", previews);
bundle = replaceSpan(
  bundle,
  ",M6=new Set(Rt.map",
  "const rc=Object.freeze",
  `;const CitymeterValidatePreviewContract=${validatePreviewContract.toString()};CitymeterValidatePreviewContract(Rt,qn);`,
);
bundle = replaceOnce(bundle,
  'previewPath:`/media/previews-v2/${c.id.replaceAll("/","-")}.webp`',
  'previewPath:c.previewPath??`/media/previews-v2/${c.id.replaceAll("/","-")}.webp`',
);
validatePreviewContract(
  catalog.records.map((record) => ({
    id: record.id,
    previewAvailable: record.preview.available,
  })),
  previews,
);
bundle = replaceLiteral(
  bundle,
  "const CitymeterSourceReviewMeta=",
  Object.fromEntries(
    catalog.records.map((r) => [
      `dataset-${r.slug}`,
      {
        status: r.sourceReview.status,
        conceptualPreview: r.preview.conceptual,
      },
    ]),
  ),
);
bundle = replaceLiteral(
  bundle,
  "const CitymeterSourceReviewHtml=",
  Object.fromEntries(
    ["th", "en"].map((lang) => [
      lang,
      Object.fromEntries(
        catalog.records.map((r) => [`dataset-${r.slug}`, sourcePanel(r, lang)]),
      ),
    ]),
  ),
);
// Explicit shared links must select their theme before the retained React shell
// initializes. Storage remains a fallback, and unavailable storage is harmless.
bundle = replaceSpan(bundle, "function _6(){", "function D6(",
  'function _6(){if(typeof window>"u")return"system";const query=new URLSearchParams(window.location.search).get("theme");if(query==="auto")return"system";if(wf.has(query))return query;try{const c=window.localStorage.getItem("lds-theme")||window.localStorage.getItem("citymeter-theme"),f=c==="auto"?"system":c;return wf.has(f)?f:"system"}catch(_){return"system"}}');
bundle = materializeUiIconsInBundle(fixCopy(bundle));
emit(bundlePath, bundle);
let enhancer = read("assets/catalog-enhancements-ds-0.9.1-v26.js");
enhancer = replaceOnce(
  enhancer,
  "function enhanceCard(card) {",
  'function enhanceCard(card) {\n    if (card.dataset.catalogOwner === "public-registry") return;',
);
enhancer = replaceOnce(
  enhancer,
  "if (examplesIntro && examplesIntro.textContent !== text.examplesIntro) examplesIntro.textContent = text.examplesIntro;",
  "// Public showcase copy is owned by the shared renderer.",
);
emit(enhancerPath, enhancer);
emit(navPath, materializeNavbarIcons(navbarArticleRoutes(fixCopy(read("assets/unified-navbar-r7-v32.js")))));
emit("assets/catalog-public-r1.js", read("src/runtime/catalog.js"));
emit("assets/dataset-summary-public-r1.js", read("src/runtime/summary.js"));
emit("assets/catalog-public-r1.css", read("src/styles/catalog.css") + "\n" + read("src/styles/catalog-layout-handoff.css") + "\n" + read("src/styles/catalog-color-handoff.css"));
emit("assets/catalog-layout-public-r1.js", read("src/runtime/catalog-layout.js"));
emit("assets/dataset-summary-public-r1.css", read("src/styles/summary.css"));
emit("assets/catalog-shell-current-r1.css", read("src/styles/shell-current.css") + "\n" + read("src/styles/handoff-tokens.css"));
emit("assets/navbar-current-r1.css", read("src/styles/navbar-current.css"));
emit("assets/public-footer-r1.css", read("src/styles/public-footer.css"));
emit("assets/ui-icons-current-r1.css", read("src/styles/ui-icons.css"));
const qrRecords = catalog.records.map((record) => {
  const path = `media/qr/datasets/${record.slug}.svg`;
  const svg = datasetQr(record.mapUrl);
  emit(path, svg);
  return { id: record.id, url: record.mapUrl, file: path, sha256: hash(svg) };
});
emit("data/catalog-qr.json", { schemaVersion: "1.0.0", contentVersion: catalog.contentVersion, quietZoneModules: 4, errorCorrection: "M", records: qrRecords });
const publicCatalog = {
  ...catalog,
  contributorProjection: projection.canonicalUrl,
  records: catalog.records.map((r) => ({
    ...r,
    detailUrl: {
      th: detailUrl(catalog, r, "th"),
      en: detailUrl(catalog, r, "en"),
    },
    contributors: projection.byModuleSlug[`dataset-${r.slug}`] || [],
  })),
};
emit("data/catalog.json", publicCatalog);
emit("data/dataset-stories.json", stories);
const sourceReview = {
  schemaVersion: "1.0.0",
  reviewedAt: catalog.updatedAt,
  records: catalog.records.map((r) => ({
    id: `dataset-${r.slug}`,
    citymeterUrl: r.mapUrl,
    status: r.sourceReview.status,
    ownerTh: r.sourceReview.owner.th,
    ownerEn: r.sourceReview.owner.en,
    sourceTh: r.sourceReview.source.th,
    sourceEn: r.sourceReview.source.en,
    periodTh: r.sourceReview.period?.th || null,
    periodEn: r.sourceReview.period?.en || null,
    benefitTh: r.description.th,
    benefitEn: r.description.en,
    readingTh: r.limitation.th,
    readingEn: r.limitation.en,
    official: r.sourceReview.official.map((x) => ({
      labelTh: x.label.th,
      labelEn: x.label.en,
      url: x.url,
    })),
    gd: r.sourceReview.gd.map((x) => ({
      labelTh: x.label.th,
      labelEn: x.label.en,
      url: x.url,
    })),
    conceptualPreview: r.preview.conceptual,
  })),
};
emit("data/catalog-source-review.json", sourceReview);
for (const lang of ["th", "en"]) {
  const base = lang === "th" ? "./" : "../";
  let html = read(`src/templates/index.${lang}.html`);
  const legacyFooter = html.match(/<footer\b[\s\S]*?<\/footer>/g) || [];
  if (legacyFooter.length !== 1) throw Error("Expected one initial catalog footer");
  html = replaceOnce(html, legacyFooter[0], footers[lang]);
  const legacyIcons = html.match(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>/g) || [];
  if (legacyIcons.length !== 1) throw Error("Expected one historical external favicon");
  html = replaceOnce(html, legacyIcons[0], faviconHead(base));
  html = replaceOnce(
    html,
    "{{CATALOG}}",
    `<section class="section explorer-section" id="datasets" aria-labelledby="datasets-title">${catalogs[lang]}</section>`,
  );
  html = replaceOnce(
    html,
    "{{SHOWCASE}}",
    `<section class="section showcase-section" id="examples" aria-labelledby="examples-title">${showcases[lang]}</section>`,
  );
  html = replaceOnce(
    html,
    "{{JSONLD}}",
    `<script type="application/ld+json">${graphs[lang]}</script>`,
  );
  html = replaceOnce(
    html,
    "{{SOURCES}}",
    `<script id="citymeter-source-review-data" type="application/json">${json(sourceReview)}</script>`,
  );
  html = replaceOnce(
    html,
    "{{CONTRIBUTORS}}",
    `<script id="citymeter-contributor-data" type="application/json">${json({ records: [] })}</script><script id="citymeter-public-contributors" type="application/json">${json(projection)}</script>`,
  );
  html = html
    .replaceAll("assets/index-qbT50gkr-v18.js", bundlePath)
    .replaceAll("assets/catalog-enhancements-ds-0.9.1-v26.js", enhancerPath)
    .replaceAll("assets/unified-navbar-r7-v32.js", navPath)
    .replaceAll("assets/catalog-enhancements-ds-0.9.1-v30.css", "assets/catalog-shell-current-r1.css")
    .replaceAll("assets/unified-navbar-r7-ds-0.9.1-v34.css", "assets/navbar-current-r1.css")
    .replaceAll(
      "assets/landometer-ds/v0.9.1/color-srgb-05.production.css",
      "assets/landometer-ds/v0.9.7/color-srgb-10.production.css",
    );
  html = html
    .replace(
      'data-ds-version="0.9.1"',
      'data-ds-version="0.9.7" data-ds-coverage="catalog-and-details; current-ui-color-projection; retained-shell-behavior"',
    )
    .replace(
      'name="landometer:ds-version" content="0.9.1"',
      'name="landometer:ds-version" content="0.9.7"',
    )
    .replace(
      'name="landometer:color-set" content="color-srgb-05"',
      'name="landometer:color-set" content="color-srgb-10"',
    )
    .replace(
      'content="ui-20260905-ds091-public-v6"',
      'content="2026-10-10-catalog-masonry-summary-r3"',
    )
    .replace(
      /    <meta name="(?:landometer:release-receipt|citymeter:release-receipt|citymeter:contributor-[^"]+)"[^>]*>\n/g,
      "",
    )
    .replace(
      'name="citymeter:catalog-version" content="2026-08-14"',
      `name="citymeter:catalog-version" content="${catalog.contentVersion}"`,
    );
  html = html.replace(
    "</head>",
    `<link rel="alternate" type="application/json" href="${base}data/catalog.json" title="CityMETER public catalog"/>\n<link rel="stylesheet" href="${base}assets/catalog-public-r1.css"/>\n<link rel="stylesheet" href="${base}assets/public-footer-r1.css"/>\n<script defer src="${base}assets/catalog-public-r1.js"></script><script defer src="${base}assets/catalog-layout-public-r1.js"></script>\n</head>`,
  );
  for (const record of catalog.records) {
    const anchor = new RegExp(
      `(<a\\b[^>]*href="#dataset-${record.slug}"[^>]*>)[^<]*(</a>)`,
      "g",
    );
    html = html.replace(
      anchor,
      (_match, before, after) => before + esc(record.title[lang]) + after,
    );
  }
  html = materializeUiIconsInHtml(fixCopy(html)).replace("</head>",uiIconHead(base)+"</head>");
  emit(lang === "th" ? "index.html" : "en/index.html", versionPublicAssets(html));
  for (const record of catalog.records)
    emit(
      `${lang === "en" ? "en/" : ""}datasets/${record.slug}/index.html`,
      versionPublicAssets(attachArticleNavbar(detailPage(catalog, record, lang, projection, storyByCode.get(record.datasetCode), stories.records), lang, record.slug)),
    );
}
const urls = [
  "",
  "en/",
  ...catalog.records.flatMap((r) => [
    `datasets/${r.slug}/`,
    `en/datasets/${r.slug}/`,
  ]),
];
emit(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((p) => `<url><loc>${catalog.canonicalBase}${p}</loc><lastmod>${catalog.updatedAt}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
emit(
  "robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${catalog.canonicalBase}sitemap.xml\n`,
);
emit(
  "llms.txt",
  `# CityMETER\n\nCityMETER brings 43 public data views into three peer lenses: Land, Location and Living. Read source, period, unit, coverage and limitations before using a view for a decision.\n\n- [Thai catalog](${catalog.canonicalBase})\n- [English catalog](${catalog.canonicalBase}en/)\n- [Structured catalog](${catalog.canonicalBase}data/catalog.json): bilingual descriptions, source references, unknowns, map start URLs and public contributors.\n- [Public contributor projection](${projection.canonicalUrl})\n\n## Interpretation\nObserved branch or registration shares describe their selected records, not sales, revenue or the whole market. Demand proxies are not observed demand. Locale Insight is a contextual prior for planning and validation, not official population, eligibility, legal boundary, risk or observed behaviour. Missing data is not zero. Historical event archives are CreativeWork records; they are not live incident feeds. Source-review dates are editorial checks, not ingestion timestamps, freshness guarantees or data licences.\n\n## Data views\n${catalog.records.map((r) => `- [${r.title.en}](${detailUrl(catalog, r, "en")}): ${r.description.en}`).join("\n")}\n`,
);
const authored = [
  "src/catalog.json",
  "src/dataset-stories.json",
  "src/templates/index.th.html",
  "src/templates/index.en.html",
  "src/runtime/catalog.js",
  "src/runtime/summary.js",
  "src/styles/catalog.css",
  "src/styles/catalog-layout-handoff.css",
  "src/styles/catalog-color-handoff.css",
  "src/styles/handoff-tokens.css",
  "src/runtime/catalog-layout.js",
  "scripts/lib/article-navbar.mjs",
  "scripts/lib/article-facts.mjs",
  "scripts/lib/article-facts.json",
  "src/styles/public-footer.css",
  "src/styles/summary.css",
  "src/styles/shell-current.css",
  "src/styles/navbar-current.css",
  "data/landom-contributors.json",
  "data/dataset-preview-assets-20261010.json",
  "scripts/lib/catalog-render.mjs",
  "scripts/lib/summary-article.mjs",
  "scripts/lib/public-shell.mjs",
  "scripts/lib/ui-icon.mjs",
  "scripts/lib/ui-icon-migration.mjs",
  "src/styles/ui-icons.css",
  "data/ui-icon-assets-20261010.json",
  "data/public-footer-social.json",
  "data/public-shell-assets.json",
  "data/government-source-provenance-20261010.json",
  "data/factory-hotel-source-provenance-20261010.json",
  "data/story-snapshot-assets-20261010.json",
  "scripts/lib/patch-public.mjs",
  "scripts/lib/preview-contract.mjs",
  "scripts/lib/route-language.mjs",
  "scripts/lib/catalog-qr.mjs",
  "scripts/build-catalog.mjs",
];
const uiIconAssets = JSON.parse(read("data/ui-icon-assets-20261010.json"));
for (const asset of [...uiIconAssets.files,uiIconAssets.font,uiIconAssets.license]) {
  const bytes = readFileSync(resolve(root,asset.path));
  if (hash(bytes)!==asset.sha256 || (asset.bytes!==undefined && bytes.length!==asset.bytes)) throw Error(`UI icon asset drift: ${asset.path}`);
  authored.push(asset.path);
}
const publicShellAssets = JSON.parse(read("data/public-shell-assets.json"));
for (const asset of publicShellAssets.files) {
  const bytes = readFileSync(resolve(root, asset.file));
  if (bytes.length !== asset.bytes || hash(bytes) !== asset.sha256) throw Error(`Public shell asset drift: ${asset.file}`);
  authored.push(asset.file);
}
for (const asset of JSON.parse(read("data/story-snapshot-assets-20261010.json")).assets) {
  const bytes = readFileSync(resolve(root, asset.path));
  if (bytes.length !== asset.bytes || hash(bytes) !== asset.sha256) throw Error(`Story snapshot drift: ${asset.path}`);
  authored.push(asset.path);
}
const manifest = {
  schemaVersion: "1.0.0",
  contentVersion: catalog.contentVersion,
  ds: catalog.authority,
  immutableInputs: pinned,
  authoredInputs: Object.fromEntries(
    authored.map((p) => [p, hash(readFileSync(resolve(root, p)))]),
  ),
  generatedOutputs: Object.fromEntries(
    [...outputs].map(([p, v]) => [p, hash(v)]),
  ),
  counts: {
    publicRecords: 43,
    detailPages: 86,
    groups: Object.fromEntries(catalog.groups.map((g) => [g.id, g.count])),
  },
  ownerModel: {
    catalog:
      "Shared HTML renderer in initial HTML and React Q6; native search, group lanes, disclosures, static QR and bounded motion enhancement.",
    showcase: "Shared HTML renderer in initial HTML and React Y6.",
    footer: "Shared publicFooter renderer in initial HTML, React K6, and dataset summaries; unchanged verified portfolio icons and footer assets.",
    discovery: "Shared minimal identity graph in initial HTML and React L6.",
    shell:
      "Retained public React controls and navbar; historical media and immutable assets retained.",
  },
};
emit("data/catalog-build.json", manifest);
let failures = [];
for (const [path, value] of outputs) {
  const dest = resolve(root, path);
  if (check) {
    if (!existsSync(dest) || readFileSync(dest, "utf8") !== value)
      failures.push(path);
  } else {
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, value);
  }
}
if (failures.length)
  throw Error(`Generated output is stale: ${failures.join(", ")}`);
console.log(
  `${check ? "Checked" : "Generated"} ${outputs.size} outputs; 43 public records, 86 localized detail pages.`,
);
