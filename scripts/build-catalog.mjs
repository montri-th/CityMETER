import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { replaceOnce } from "./lib/patch-public.mjs";
import { validatePreviewContract } from "./lib/preview-contract.mjs";
import { languageForPath } from "./lib/route-language.mjs";
import { datasetQr } from "./lib/catalog-qr.mjs";
import {
  catalogInner,
  showcaseInner,
  identityGraph,
  detailPage,
  json,
  detailUrl,
  sourcePanel,
  esc,
} from "./lib/catalog-render.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const catalog = JSON.parse(read("src/catalog.json"));
const projection = JSON.parse(read("data/landom-contributors.json"));
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
bundle = bundle.replace('["business-dynamics",1],', "");
const [pa, pb] = literalSpan(bundle, "qn=");
const previews = Function(
  `"use strict";return (${bundle.slice(pa, pb)})`,
)().filter((x) => x.id !== "business-dynamics");
bundle = replaceLiteral(bundle, "qn=", previews);
bundle = replaceSpan(
  bundle,
  ",M6=new Set(Rt.map",
  "const rc=Object.freeze",
  `;const CitymeterValidatePreviewContract=${validatePreviewContract.toString()};CitymeterValidatePreviewContract(Rt,qn);`,
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
bundle = fixCopy(bundle);
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
emit(navPath, fixCopy(read("assets/unified-navbar-r7-v32.js")));
emit("assets/catalog-public-r1.js", read("src/runtime/catalog.js"));
emit("assets/dataset-summary-public-r1.js", read("src/runtime/summary.js"));
emit("assets/catalog-public-r1.css", read("src/styles/catalog.css"));
emit("assets/catalog-shell-current-r1.css", read("src/styles/shell-current.css"));
emit("assets/navbar-current-r1.css", read("src/styles/navbar-current.css"));
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
    `<link rel="alternate" type="application/json" href="${base}data/catalog.json" title="CityMETER public catalog"/>\n<link rel="stylesheet" href="${base}assets/catalog-public-r1.css"/>\n<script defer src="${base}assets/catalog-public-r1.js"></script>\n</head>`,
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
  html = fixCopy(html);
  emit(lang === "th" ? "index.html" : "en/index.html", html);
  for (const record of catalog.records)
    emit(
      `${lang === "en" ? "en/" : ""}datasets/${record.slug}/index.html`,
      detailPage(catalog, record, lang, projection),
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
  "src/templates/index.th.html",
  "src/templates/index.en.html",
  "src/runtime/catalog.js",
  "src/runtime/summary.js",
  "src/styles/catalog.css",
  "src/styles/shell-current.css",
  "src/styles/navbar-current.css",
  "data/landom-contributors.json",
  "scripts/lib/catalog-render.mjs",
  "scripts/lib/patch-public.mjs",
  "scripts/lib/preview-contract.mjs",
  "scripts/lib/route-language.mjs",
  "scripts/lib/catalog-qr.mjs",
  "scripts/build-catalog.mjs",
];
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
