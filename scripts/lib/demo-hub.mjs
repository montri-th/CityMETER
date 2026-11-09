// The CityMETER demo hub: one page per language that links every demo on GitHub Pages and hands one area (`at`, a
// production path such as BKK/D/1039) to all of them. Content comes from src/demo-hub.json; this module only renders.
// The demos and this page are noindex, nofollow (owner 2026-11-08: demo pages stay out of search engines).
import { esc, json } from "./catalog-render.mjs";
import { publicFooter, faviconHead } from "./public-shell.mjs";
import { uiIcon, uiIconHead } from "./ui-icon.mjs";
import { themeBootstrap } from "./summary-article.mjs";

export const HUB_PATHS = { th: "demos/", en: "en/demos/" };
// A production area path: province code, then optionally one level (D district, S subdistrict, M local unit,
// L locale) and its id. The demos clamp it to the levels they carry.
export const AT_PATTERN = "^[A-Z]{2,4}(?:/(?:D|S|M)/[0-9]{2,10}|/L/[0-9a-f-]{36})?$";

const copy = {
  th: {
    title: "เดโม CityMETER 14 ชุดข้อมูล",
    description: "เปิดเดโม CityMETER ทั้ง 14 ชุดข้อมูลที่พื้นที่เดียวกัน: เลือกพื้นที่ครั้งเดียว แล้วทุกลิงก์จะเปิดพื้นที่นั้น",
    eyebrow: "CityMETER · เดโม",
    h1: "เดโม CityMETER",
    lead: (n) => `${n} ชุดข้อมูลในรูปแบบต้นแบบบน GitHub Pages ใช้รหัสพื้นที่ชุดเดียวกับ CityMETER บน landometer.com เลือกพื้นที่ที่นี่ครั้งเดียว แล้วลิงก์เดโมทุกชุดด้านล่างจะเปิดพื้นที่นั้น`,
    notes: [
      "เดโมเป็นต้นแบบสำหรับทดลองและพัฒนาต่อ ไม่ใช่ CityMETER ฉบับใช้งานจริง",
      "อ่านที่มา ช่วงเวลา และข้อจำกัดในหน้าเดโมแต่ละชุดก่อนใช้ตัวเลข",
      "หน้าเดโมยังเป็นภาษาไทย ยกเว้น Office ที่อ่านเป็นภาษาอังกฤษได้ด้วย (คำแปลฉบับร่าง)",
    ],
    areaTitle: "พื้นที่ที่จะเปิด",
    areaNone: "ยังไม่ได้เลือกพื้นที่ ลิงก์จะเปิดหน้าแรกของแต่ละเดโม",
    areaKnown: (name, at) => `ทุกลิงก์เปิด${name} (${at})`,
    areaCode: (at) => `ทุกลิงก์เปิดพื้นที่รหัส ${at}`,
    areaBad: "รหัสพื้นที่ในลิงก์อ่านไม่ได้ ลิงก์จะเปิดหน้าแรกของแต่ละเดโม",
    country: "ทั้งประเทศ",
    areaHint: "ในเดโม ตัวเลือกชุดข้อมูลบนหัวเว็บก็พาพื้นที่เดิมไปด้วย · ถ้าเดโมไม่มีระดับพื้นที่นั้น จะเปิดระดับที่ใกล้ที่สุดที่มี · บางชุดข้อมูลอาจไม่มีรายการในพื้นที่ที่เลือก",
    count: (n) => `${n} ชุด`,
    open: "เปิดเดโม",
    openName: (name) => `เปิดเดโม ${name} (เว็บ GitHub Pages)`,
    catalogLabel: "ในแค็ตตาล็อก",
    noCatalog: "ยังไม่มีหน้าในแค็ตตาล็อกนี้",
    code: "รหัสชุดข้อมูล",
    noCode: "ยังไม่มีในทะเบียน",
    question: "คำถามที่ช่วยตอบ",
    devTitle: "สำหรับนักพัฒนา",
    dev: (hub) => [
      `ทุกเดโมใช้ชุดโค้ดกลาง ${hub.shell.name} ${hub.shell.version} ไบต์เดียวกัน รายการและกลุ่มบนหน้านี้ตรงกับตัวเลือกชุดข้อมูลบนหัวเว็บของเดโม (${hub.shell.list})`,
      "ที่อยู่หน้าเว็บของเดโม: d (รหัสชุดข้อมูล) · at (พื้นที่ เช่น BKK/D/1039 ตรงกับ /v3/citymeter/BKK/D/1039 ของ production) · e (สิ่งที่เปิด) · n (เครือข่าย) · f.* (ตัวกรอง) · focus · view · v3d · cam",
      hub.catalogDiffers.length
        ? `กลุ่ม Land · Location · Living ตามทะเบียนชุดข้อมูล (${hub.registry.tab} อ่าน ${hub.registry.readAtTh}) ซึ่งต่างจากหมวดของแค็ตตาล็อกนี้ ${hub.catalogDiffers.length} ชุด: ${hub.catalogDiffers.map((d) => `${d.name} (แค็ตตาล็อก ${d.catalog})`).join(" · ")}`
        : `กลุ่ม Land · Location · Living ตามทะเบียนชุดข้อมูล (${hub.registry.tab} อ่าน ${hub.registry.readAtTh}) ตรงกับหมวดของแค็ตตาล็อกนี้ทุกชุดที่มีหน้าในแค็ตตาล็อก`,
      "คำถามของแต่ละชุดคัดตรงจาก meta description ของหน้าเดโม",
      "search engine ไม่เก็บหน้าเดโมและหน้านี้ (noindex)",
    ],
    json: "รายการนี้แบบ JSON",
    nav: "เมนู",
    // Visible text; on a phone the extra word is hidden so the header fits one line (the name keeps CityMETER).
    catalogHome: '<span class="hub-nav-extra">ข้อมูล</span>CityMETER',
    other: "English",
  },
  en: {
    title: "CityMETER demos: 14 datasets",
    description: "Open all 14 CityMETER demos at the same area: pick an area once and every link opens it.",
    eyebrow: "CityMETER · demos",
    h1: "CityMETER demos",
    lead: (n) => `${n} datasets as prototypes on GitHub Pages, using the same area codes as CityMETER on landometer.com. Pick an area here once, and every demo link below opens that area.`,
    notes: [
      "The demos are prototypes for trials and further development, not the production CityMETER.",
      "Read each demo's sources, period and limitations before using its numbers.",
      "The demos are in Thai for now; Office also reads in English (a draft translation), and its link here opens it in English. The English lines on this page are drafts.",
    ],
    areaTitle: "Area to open",
    areaNone: "No area chosen: the links open each demo's start page.",
    areaKnown: (name, at) => `Every link opens ${name} (${at}).`,
    areaCode: (at) => `Every link opens the area coded ${at}.`,
    areaBad: "The area code in this link cannot be read: the links open each demo's start page.",
    country: "Whole country",
    areaHint: "Inside a demo, the dataset picker in the header keeps the area too. A demo without that level opens the nearest level it has. Some datasets may have no records in the chosen area.",
    count: (n) => `${n} ${n === 1 ? "dataset" : "datasets"}`,
    open: "Open demo",
    openName: (name) => `Open the ${name} demo (GitHub Pages site)`,
    catalogLabel: "In the catalog",
    noCatalog: "no page in this catalog yet",
    code: "Dataset code",
    noCode: "not in the registry yet",
    question: "Question it helps answer",
    devTitle: "For developers",
    dev: (hub) => [
      `Every demo runs the same bytes of the shared code ${hub.shell.name} ${hub.shell.version}; the list and groups on this page match the dataset picker in the demos' header (${hub.shell.list}).`,
      "Demo address: d (dataset code) · at (area, e.g. BKK/D/1039, which is /v3/citymeter/BKK/D/1039 in production) · e (the thing open) · n (a network) · f.* (filters) · focus · view · v3d · cam.",
      hub.catalogDiffers.length
        ? `Land · Location · Living follow the dataset registry (${hub.registry.tab}, read ${hub.registry.readAt}), which differs from this catalog's lenses for ${hub.catalogDiffers.length} datasets: ${hub.catalogDiffers.map((d) => `${d.name} (catalog: ${d.catalog})`).join(" · ")}.`
        : `Land · Location · Living follow the dataset registry (${hub.registry.tab}, read ${hub.registry.readAt}), as this catalog's lenses do for every demo with a catalog page.`,
      "Each question is quoted from the demo page's meta description (Thai); the English line under it is a draft.",
      "Search engines do not index the demos or this page (noindex).",
    ],
    json: "This list as JSON",
    nav: "Navigation",
    catalogHome: 'CityMETER<span class="hub-nav-extra">data</span>',
    other: "ไทย",
  },
};

const groupLabel = { Land: "Land", Location: "Location", Living: "Living" };
const pillar = (group) => group.toLowerCase();

/** Validate the authored hub data against the catalog it links into; throws on any gap (fail closed). */
export function checkDemoHub(hub, catalog) {
  const fail = (m) => { throw Error(`Demo hub: ${m}`); };
  if (!Array.isArray(hub.demos) || hub.demos.length !== hub.shell.demos) fail(`expected ${hub.shell.demos} demos`);
  const paths = new Set(), groups = new Set(["Land", "Location", "Living"]);
  const byCode = new Map(catalog.records.map((r) => [r.datasetCode, r]));
  for (const d of hub.demos) {
    if (!/^[a-z]+$/.test(d.path) || paths.has(d.path)) fail(`bad or repeated path ${d.path}`);
    paths.add(d.path);
    if (!groups.has(d.group)) fail(`${d.path}: group ${d.group}`);
    if (d.code !== null && !/^[A-Za-z]+$/.test(d.code)) fail(`${d.path}: code`);
    for (const f of ["question", "summary"]) if (!d[f]?.th) fail(`${d.path}: ${f}.th`);
    if (!d.questionDraft?.en) fail(`${d.path}: questionDraft.en`);
    if (d.catalog && !byCode.has(d.catalog)) fail(`${d.path}: catalog code ${d.catalog} is not in src/catalog.json`);
    if (d.catalog && d.catalog !== d.code) fail(`${d.path}: catalog code differs from the demo code`);
  }
  for (const a of hub.areas) if (!new RegExp(AT_PATTERN).test(a.at) || !a.th) fail(`area ${a.at}`);
  return true;
}

function catalogDiffers(hub, catalog) {
  const byCode = new Map(catalog.records.map((r) => [r.datasetCode, r]));
  const lens = Object.fromEntries(catalog.groups.map((g) => [g.id, typeof g.label === "string" ? g.label : g.label?.en || g.id]));
  return hub.demos.filter((d) => d.catalog && byCode.get(d.catalog).group !== pillar(d.group))
    .map((d) => ({ name: d.name, catalog: lens[byCode.get(d.catalog).group] || byCode.get(d.catalog).group }));
}

/** A demo's start page in a hub language: English only for a demo that declares it (citymeter-shell 0.5.0 `?lang=en`). */
export const demoUrl = (hub, d, lang = "th") => `${hub.origin}/${d.path}/${lang === "en" && (d.languages || []).includes("en") ? "?lang=en" : ""}`;

function demoCard(d, lang, hub, catalog, base) {
  const t = copy[lang], byCode = new Map(catalog.records.map((r) => [r.datasetCode, r]));
  const url = demoUrl(hub, d, lang);
  const record = d.catalog ? byCode.get(d.catalog) : null;
  const catalogFact = record
    ? `<a class="hub-secondary" href="${base}${lang === "en" ? "en/" : ""}datasets/${esc(record.slug)}/">${esc(record.title[lang])}</a>`
    : `<span>${esc(t.noCatalog)}</span>`;
  const draft = lang === "en" ? `<p class="hub-draft" lang="en"><span class="hub-draft-label">Draft English</span> ${esc(d.questionDraft.en)}</p>` : "";
  return `<li class="hub-card" data-demo-card="${esc(d.path)}">
<h3 class="hub-card-title">${esc(d.name)}</h3>
<p class="hub-question" lang="th"><span class="hub-visually-hidden">${t.question}: </span>${esc(d.question.th)}</p>${draft}
<p class="hub-summary" lang="th">${esc(d.summary.th)}</p>
<dl class="hub-facts"><div><dt>${t.code}</dt><dd>${d.code ? `<code>${esc(d.code)}</code>` : esc(t.noCode)}</dd></div><div><dt>${t.catalogLabel}</dt><dd>${catalogFact}</dd></div></dl>
<div class="hub-actions"><a class="button button-accent hub-open" data-demo="${esc(d.path)}" href="${esc(url)}" aria-label="${esc(t.openName(d.name))}">${t.open}${uiIcon("arrow_forward", { size: 20 })}</a></div>
</li>`;
}

export function demoHubPage(hub, catalog, lang) {
  const t = copy[lang], base = lang === "en" ? "../../" : "../", self = `${catalog.canonicalBase}${HUB_PATHS[lang]}`;
  const other = lang === "th" ? "en" : "th";
  const diff = catalogDiffers(hub, catalog);
  const ctx = { ...hub, catalogDiffers: diff };
  const groups = ["Land", "Location", "Living"].map((g) => {
    const items = hub.demos.filter((d) => d.group === g);
    return `<section class="hub-group" aria-labelledby="hub-group-${pillar(g)}">
<h2 id="hub-group-${pillar(g)}"><span class="summary-pillar-cue" data-pillar="${pillar(g)}" aria-hidden="true"></span>${groupLabel[g]} <span class="hub-count">${t.count(items.length)}</span></h2>
<ul class="hub-cards">${items.map((d) => demoCard(d, lang, hub, catalog, base)).join("\n")}</ul>
</section>`;
  }).join("\n");
  const areas = [{ at: "", th: t.country }, ...hub.areas].map((a) =>
    `<li><a class="hub-area" href="./${a.at ? `?at=${esc(a.at)}` : ""}" data-at="${esc(a.at)}"${a.at ? ` lang="th"` : ""}>${esc(a.th)}${a.at ? ` <code>${esc(a.at)}</code>` : ""}</a></li>`).join("");
  const config = { pattern: AT_PATTERN, areas: Object.fromEntries(hub.areas.map((a) => [a.at, a.th])),
    text: { none: t.areaNone, bad: t.areaBad, known: t.areaKnown("{name}", "{at}"), code: t.areaCode("{at}") } };
  return `<!doctype html><html lang="${lang}" data-ds="landometer" data-ds-version="0.9.7" data-theme="light"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><script>${themeBootstrap}</script><title>${esc(t.title)} · CityMETER</title><meta name="description" content="${esc(t.description)}"/><meta name="robots" content="noindex, nofollow"/><link rel="canonical" href="${self}"/><link rel="alternate" hreflang="th" href="${catalog.canonicalBase}${HUB_PATHS.th}"/><link rel="alternate" hreflang="en" href="${catalog.canonicalBase}${HUB_PATHS.en}"/><link rel="alternate" type="application/json" href="${base}${HUB_PATHS.th}demos.json" title="CityMETER demos"/>${faviconHead(base)}<meta property="og:type" content="website"/><meta property="og:site_name" content="CityMETER"/><meta property="og:url" content="${self}"/><meta property="og:title" content="${esc(t.title)} · CityMETER"/><meta property="og:description" content="${esc(t.description)}"/><meta property="og:locale" content="${lang === "th" ? "th_TH" : "en_US"}"/><meta name="landometer:ds-version" content="0.9.7"/><meta name="citymeter:demo-hub" content="${esc(hub.schemaVersion)} · ${esc(hub.readAt)}"/>
<link rel="stylesheet" href="${base}assets/index-cqxdfePB.css?v=2"/><link rel="stylesheet" href="${base}assets/citymeter-fonts.css?v=1"/><link rel="stylesheet" href="${base}assets/landometer-ds/v0.9.7/color-srgb-10.production.css"/><link rel="stylesheet" href="${base}assets/catalog-shell-current-r1.css"/><link rel="stylesheet" href="${base}assets/dataset-summary-public-r1.css"/><link rel="stylesheet" href="${base}assets/public-footer-r1.css"/><link rel="stylesheet" href="${base}assets/demo-hub-public-r1.css"/>${uiIconHead(base)}<script defer src="${base}assets/demo-hub-public-r1.js"></script><script type="application/json" id="demo-hub-config">${json(config)}</script></head>
<body class="catalog-detail-page demo-hub-page" id="top"><a class="hub-skip" href="#main-content">${lang === "th" ? "ข้ามไปเนื้อหา" : "Skip to content"}</a>
<header class="hub-header"><a class="hub-logo" href="${base}${lang === "en" ? "en/" : ""}"><img src="${base}media/landometer-logo-horizontal.png" width="172" height="47" alt="Landometer"/></a><nav aria-label="${t.nav}"><a href="${base}${lang === "en" ? "en/" : ""}#datasets">${t.catalogHome}</a><a href="${base}${HUB_PATHS[other]}" hreflang="${other}" lang="${other}" data-hub-lang>${t.other}</a></nav></header>
<main id="main-content" class="hub-main">
<section class="hub-hero" aria-labelledby="hub-title"><p class="eyebrow">${esc(t.eyebrow)}</p><h1 id="hub-title">${esc(t.h1)}</h1><p class="hub-lead">${esc(t.lead(hub.demos.length))}</p><ul class="hub-notes">${t.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></section>
<section class="hub-area-panel" aria-labelledby="hub-area-title"><h2 id="hub-area-title">${t.areaTitle}</h2><p id="hub-area-status" class="hub-area-status" role="status">${esc(t.areaNone)}</p><ul class="hub-area-list">${areas}</ul><p class="hub-hint">${esc(t.areaHint)}</p></section>
${groups}
<section class="hub-dev" aria-labelledby="hub-dev-title"><h2 id="hub-dev-title">${t.devTitle}</h2><ul>${t.dev(ctx).map((p) => `<li>${esc(p)}</li>`).join("")}</ul><p><a href="${base}${HUB_PATHS.th}demos.json">${t.json}</a> · <a href="${base}${HUB_PATHS.th}llms.txt">llms.txt</a></p></section>
</main>
${publicFooter(lang, base, { kind: "catalog" })}</body></html>
`;
}

/** Machine-readable list for developers and coding agents (same content as the pages). */
export function demoHubJson(hub, catalog) {
  const byCode = new Map(catalog.records.map((r) => [r.datasetCode, r]));
  return {
    schemaVersion: hub.schemaVersion, readAt: hub.readAt, robots: "noindex, nofollow",
    pages: { th: `${catalog.canonicalBase}${HUB_PATHS.th}`, en: `${catalog.canonicalBase}${HUB_PATHS.en}` },
    shell: hub.shell, registry: hub.registry, sources: hub.sources,
    address: { grammar: "d · at · e · n · f.* · focus · view · v3d · cam", at: AT_PATTERN, example: `${hub.origin}/hotel/?at=BKK/D/1039`, production: "https://landometer.com/v3/citymeter/BKK/D/1039?d=hotel" },
    areas: hub.areas,
    demos: hub.demos.map((d) => ({
      path: d.path, name: d.name, group: d.group, code: d.code, url: `${hub.origin}/${d.path}/`, languages: d.languages || ["th"],
      ...((d.languages || []).includes("en") ? { urlEn: demoUrl(hub, d, "en") } : {}),
      question: d.question, questionDraft: d.questionDraft, summary: d.summary,
      catalog: d.catalog ? { code: d.catalog, page: `${catalog.canonicalBase}datasets/${byCode.get(d.catalog).slug}/`, lens: byCode.get(d.catalog).group } : null,
    })),
  };
}

export function demoHubLlms(hub, catalog) {
  const j = demoHubJson(hub, catalog);
  return `# CityMETER demos\n\nPrototype web apps on GitHub Pages, one per dataset, ${hub.demos.length} in all. They are noindex, nofollow and in Thai, except that ${hub.demos.filter((d) => (d.languages || []).includes("en")).map((d) => d.name).join(", ") || "none"} also reads in English (a draft translation) with \`?lang=en\`; they are not the production CityMETER. Every demo runs the same bytes of ${hub.shell.name} ${hub.shell.version}.\n\n- [Thai hub](${j.pages.th})\n- [English hub](${j.pages.en})\n- [Structured list](${catalog.canonicalBase}${HUB_PATHS.th}demos.json)\n\n## Address\nThe address is the production grammar: \`d\` dataset code, \`at\` area (a production path such as BKK/D/1039, the same as https://landometer.com/v3/citymeter/BKK/D/1039), \`e\` the thing open, \`n\` a network, \`f.*\` filters, then \`focus\`, \`view\`, \`v3d\`, \`cam\`. A demo opens the deepest level of \`at\` it carries. Opening a level adds one browser history entry; filters and view replace it.\n\n## Demos\n${j.demos.map((d) => `- [${d.name}](${d.url}) · ${d.group} · code ${d.code ? `\`${d.code}\`` : "none in the registry yet"}${d.urlEn ? ` · [in English](${d.urlEn})` : ""}: ${d.question.th} (draft English: ${d.questionDraft.en})`).join("\n")}\n\n## Groups\nLand · Location · Living follow the dataset registry (${hub.registry.tab}, read ${hub.registry.readAt}); ${catalogDiffers(hub, catalog).length ? `this catalog files some of the same datasets under other lenses: ${catalogDiffers(hub, catalog).map((d) => `${d.name} (catalog: ${d.catalog})`).join(", ")}` : "this catalog uses the same lenses for every demo with a catalog page"}.\n`;
}
