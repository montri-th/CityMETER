import { uiIcon } from "./ui-icon.mjs";
/** Shared public HTML renderer: one source for initial HTML, hydration and detail pages. */
export const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
export const normalizeSearch = (value) =>
  String(value)
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function searchHaystack(record) {
  return normalizeSearch(
    [
      ...record.aliases,
      record.title.th,
      record.title.en,
      record.description.th,
      record.description.en,
      record.datasetCode,
      record.slug,
    ].join(" "),
  );
}
export function matchesQuery(record, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const hay = searchHaystack(record);
  return terms.every((term) => hay.includes(term));
}
const headingTitle = (value) =>
  esc(value).replaceAll(
    "Non-bank",
    '<span class="catalog-keep-word">Non-bank</span>',
  );
export const detailUrl = (catalog, record, lang) =>
  `${catalog.canonicalBase}${lang === "en" ? "en/" : ""}datasets/${record.slug}/`;
const words = {
  th: {
    source: "ที่มา",
    owner: "ผู้เผยแพร่ข้อมูล",
    period: "ช่วงเวลาของข้อมูล",
    unknown: "ยังไม่ยืนยันช่วงเวลา — ตรวจวันอ้างอิงในหน้าข้อมูลก่อนใช้",
    limits: "ควรรู้ก่อนใช้",
    references: "อ่านแหล่งอ้างอิง",
    credits: "ร่วมพัฒนาโดย",
    details: "ข้อมูลนี้ใช้ทำอะไรได้",
    sourceHeading: "ที่มาและขอบเขตข้อมูล",
    detailLink: "อ่านสรุป",
    questions: "ข้อมูลนี้ช่วยตอบคำถามอะไร",
    reading: "เริ่มอ่านข้อมูลอย่างไร",
    next: "นำข้อมูลไปใช้กับโจทย์ของคุณ",
    contact: "คุยกับทีมเรื่องการใช้ข้อมูลนี้",
    share: "แชร์สรุปนี้",
    shareIntro: "ส่งให้คนที่กำลังศึกษาเรื่องนี้ด้วยกัน",
    copy: "คัดลอกลิงก์",
    nativeShare: "แชร์ผ่านแอปอื่น",
    copied: "คัดลอกลิงก์แล้ว",
    copyFallback: "คัดลอกอัตโนมัติไม่ได้ เลือกลิงก์ด้านล่างแล้วคัดลอกได้เลย",
    shared: "เปิดตัวเลือกการแชร์แล้ว",
    shareFallback: "แชร์ผ่านแอปไม่ได้ เลือกแพลตฟอร์มหรือคัดลอกลิงก์ด้านล่างได้เลย",
    shareLink: "ลิงก์สรุปนี้",
    map: "เปิดข้อมูลบนแผนที่",
    preview: "ตัวอย่างมุมมองข้อมูล",
    concept: "ภาพสื่อแนวคิด ไม่ใช่ภาพหน้าจอข้อมูลจริง",
    noPreview: "สำรวจข้อมูลและตัวเลือกในแผนที่ CityMETER",
    coverage: "พื้นที่ครอบคลุม",
    level: "ระดับรายละเอียด",
    benefit: "ช่วยตอบเรื่องอะไร",
    back: "กลับไปเลือกข้อมูล",
    catalog: "ข้อมูลสำหรับอ่านต่อและใช้อ้างอิง",
  },
  en: {
    source: "Source",
    owner: "Data publisher",
    period: "Data period",
    unknown:
      "Period not confirmed — check the reference date in the data view before use.",
    limits: "Know before use",
    references: "Read the references",
    credits: "Contributors",
    details: "What can I use this data for?",
    sourceHeading: "Sources and coverage",
    detailLink: "Read summary",
    questions: "Questions this data can help answer",
    reading: "How to start reading the data",
    next: "Use this data for your question",
    contact: "Talk to the team about using this data",
    share: "Share this summary",
    shareIntro: "Send it to someone exploring the same question",
    copy: "Copy link",
    nativeShare: "Share through other apps",
    copied: "Link copied",
    copyFallback: "Automatic copy is unavailable. Select and copy the link below.",
    shared: "Sharing options opened",
    shareFallback: "App sharing is unavailable. Choose a platform or copy the link below.",
    shareLink: "Link to this summary",
    map: "Open the map",
    preview: "Example data view",
    concept: "Conceptual illustration, not a screenshot of actual data",
    noPreview: "Explore the data and available controls in CityMETER",
    coverage: "Coverage",
    level: "Level of detail",
    benefit: "What this helps answer",
    back: "Back to the catalog",
    catalog: "Data to read and reference",
  },
};
const statuses = {
  "verified-lineage": {
    th: "แหล่งอ้างอิงที่ตรวจเทียบแล้ว",
    en: "Reference checked",
  },
  candidate: {
    th: "แหล่งที่เกี่ยวข้อง — ยังไม่ยืนยันว่าเป็นข้อมูลรุ่นเดียวกัน",
    en: "Related reference — exact data release not confirmed",
  },
  "other-source": { th: "แหล่งเฉพาะทาง", en: "Specialist source" },
  derived: {
    th: "ข้อมูลที่รวบรวมหรือคำนวณต่อ",
    en: "Compiled or derived data",
  },
  unproven: {
    th: "ที่มายังมีส่วนที่ต้องยืนยัน",
    en: "Source details still need confirmation",
  },
};
function field(label, value) {
  return `<div class="catalog-fact"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
}
export function contributors(record, lang, projection, compact = false) {
  const people = projection.byModuleSlug[`dataset-${record.slug}`] || [];
  if (!people.length) return "";
  return `<div class="catalog-contributors"><span>${words[lang].credits}</span><ul>${people.map((p) => `<li><a href="${esc(p.profileUrl[lang] || p.profileUrl.th || p.profileUrl.en)}">${p.portrait ? `<img src="${esc(p.portrait.versionedUrl || p.portrait.url)}" alt="" width="28" height="28" loading="lazy" decoding="async"/>` : ""}<span>${esc(p.nickname[lang] || p.nickname.th || p.nickname.en || p.personId)}</span></a>${!compact && p.contributionRole ? `<small>${esc(p.contributionRole[lang] === "Contributor" ? "Team member" : p.contributionRole[lang])}</small>` : ""}</li>`).join("")}</ul></div>`;
}
export function sourcePanel(record, lang, headingLevel = 4) {
  const w = words[lang],
    s = record.sourceReview;
  const refs = [...(s.official || []), ...(s.gd || [])];
  return `<div class="catalog-source" data-source-status="${esc(s.status)}"><p class="catalog-status">${esc(statuses[s.status]?.[lang] || w.source)}</p><dl>${field(w.owner, s.owner[lang])}${field(w.source, s.source[lang])}${field(w.period, s.period?.[lang] || w.unknown)}${field(w.coverage, record.scope[lang])}${field(w.level, record.granularity[lang])}</dl>${refs.length ? `<div class="catalog-references"><h${headingLevel}>${w.references}</h${headingLevel}><ul>${refs.map((ref) => `<li><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.label[lang])}<span class="sr-only"> ${lang === "th" ? "(เปิดแท็บใหม่)" : "(opens a new tab)"}</span></a></li>`).join("")}</ul></div>` : ""}</div>`;
}
function preview(record, lang, base) {
  if (!record.preview.available)
    return `<p class="catalog-no-preview">${words[lang].noPreview}</p>`;
  return `<figure class="catalog-preview"><img src="${base}${esc(record.preview.path)}" alt="${esc(record.preview.conceptual ? words[lang].concept + ": " + record.title[lang] : words[lang].preview + ": " + record.title[lang])}" loading="lazy" decoding="async" width="${Number.isFinite(record.preview.width) && record.preview.width > 0 ? record.preview.width : 640}" height="${Number.isFinite(record.preview.height) && record.preview.height > 0 ? record.preview.height : 360}"/>${record.preview.conceptual ? `<figcaption>${words[lang].concept}</figcaption>` : ""}</figure>`;
}
export function qrHandoff(record, lang, base) {
  const label =
    lang === "th"
      ? "สแกนเพื่อเปิดข้อมูลนี้ใน CityMETER"
      : "Scan to open this data in CityMETER";
  return `<div class="catalog-qr-handoff"><img src="${base}media/qr/datasets/${esc(record.slug)}.svg" width="144" height="144" alt="${esc(label + ": " + record.title[lang])}" loading="lazy" decoding="async"/><div><strong>${label}</strong><a href="${esc(record.mapUrl)}" target="_blank" rel="noopener noreferrer">${words[lang].map}<span class="sr-only"> ${lang === "th" ? "(เปิดแท็บใหม่)" : "(opens a new tab)"}</span></a></div></div>`;
}
export function hasVerifiedGdReference(record) {
  return (
    record.sourceReview.status === "verified-lineage" &&
    (record.sourceReview.gd || []).some((ref) => {
      try {
        const url = new URL(ref.url);
        return url.protocol === "https:" &&
          (url.hostname === "gdcatalog.go.th" || url.hostname.endsWith(".gdcatalog.go.th"));
      } catch { return false; }
    })
  );
}
export function cardReferences(record, lang, headingLevel = 6) {
  const refs = [...(record.sourceReview.official || []), ...(record.sourceReview.gd || [])];
  if (!refs.length) return "";
  // These are reference links, not a claim that every referenced package was ingested.
  // Keep unresolved lineage prose in the article's source disclosure. A literal
  // hostname is a factual link label when the authored label contains review jargon.
  const label = (ref) => /candidate/i.test(ref.label[lang])
    ? new URL(ref.url).hostname : ref.label[lang];
  return `<div class="catalog-card-references"><h${headingLevel}>${words[lang].references}</h${headingLevel}><ul>${refs.map((ref) => `<li><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(label(ref))}<span class="sr-only"> ${lang === "th" ? "(เปิดแท็บใหม่)" : "(opens a new tab)"}</span></a></li>`).join("")}</ul></div>`;
}
function cardCredits(record, lang, projection) {
  const people = projection.byModuleSlug[`dataset-${record.slug}`] || [];
  if (!people.length) return "";
  return `<div class="catalog-credit-avatars" aria-label="${words[lang].credits}">${people.map((person) => {
    const name = person.nickname[lang] || person.nickname.th || person.nickname.en || person.personId;
    const href = person.profileUrl[lang] || person.profileUrl.th || person.profileUrl.en;
    return `<a href="${esc(href)}" aria-label="${esc(words[lang].credits + ": " + name)}" title="${esc(name)}">${person.portrait ? `<img src="${esc(person.portrait.versionedUrl || person.portrait.url)}" alt="" width="56" height="56" loading="lazy" decoding="async"/><span class="sr-only">${esc(name)}</span>` : `<span class="catalog-credit-name">${esc(name)}</span>`}</a>`;
  }).join("")}</div>`;
}
export function card(
  catalog,
  record,
  lang,
  projection,
  base,
  headingLevel = 4,
) {
  const w = words[lang];
  const benefit = record.sourceReview.benefit?.[lang] || record.description[lang];
  const focusLabel = record.preview.available && record.preview.focusLabel?.[lang];
  const previewLink = `<a class="catalog-preview-link" href="${esc(record.mapUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(w.map + ": " + record.title[lang])}">${preview(record, lang, base)}${focusLabel ? `<span class="catalog-preview-feature">${esc(focusLabel)}</span>` : ""}</a>`;
  const gdBadge = hasVerifiedGdReference(record)
    ? `<img class="catalog-gd-badge" src="${base}media/gdcatalog-logo.png" alt="Government Data Catalog" width="43" height="56" loading="lazy" decoding="async"/>` : "";
  const mapLabel = lang === "th" ? "เปิดใน CityMETER" : "Open in CityMETER";
  return `<article class="dataset-card catalog-card" data-catalog-owner="public-registry" data-group="${esc(record.group)}" data-record-id="${esc(record.id)}" data-search="${esc(searchHaystack(record))}" id="dataset-${esc(record.slug)}">${previewLink}<div class="catalog-card-main"><div class="catalog-card-pills"><span class="catalog-pill catalog-pill-pillar">${esc(catalog.groups.find((g) => g.id === record.group).label)}</span></div><h${headingLevel} class="catalog-card-title"><a href="${detailUrl(catalog, record, lang)}">${headingTitle(record.title[lang])}</a></h${headingLevel}><p class="catalog-description">${esc(record.description[lang])}</p><ul class="catalog-tags" aria-label="${lang === "th" ? "ประเด็นข้อมูล" : "Data topics"}">${record.tags.map((tag) => `<li>${esc(catalog.tagLabels[tag]?.[lang] || tag)}</li>`).join("")}</ul><div class="catalog-actions"><a class="button catalog-map-link" href="${esc(record.mapUrl)}" target="_blank" rel="noopener noreferrer">${mapLabel}${uiIcon("open_in_new", { size: 20 })}</a>${cardCredits(record, lang, projection)}</div><a class="catalog-detail-link catalog-summary-link" href="${detailUrl(catalog, record, lang)}">${w.detailLink}${uiIcon("arrow_forward", { size: 20 })}</a><details class="catalog-details"><summary>${gdBadge}<span>${w.details}</span>${uiIcon("add", { size: 20, className: "cm-disclosure-icon" })}</summary><div class="catalog-detail-content"><p class="catalog-benefit">${esc(benefit)}</p>${record.executiveSummary?.questions?.[lang] ? `<ul class="catalog-use-questions">${record.executiveSummary.questions[lang].map((question) => `<li>${esc(question)}</li>`).join("")}</ul>` : ""}${cardReferences(record, lang, 6)}${contributors(record, lang, projection)}${qrHandoff(record, lang, base)}</div></details></div></article>`;
}
// Category shapes are data cues, separate from the Google functional UI icons.
// The shared theme layer supplies the approved categorical fill and ink tokens.
function pillarCue(group, size = 12) {
  const shapes = {
    land: '<path d="M6 .9 11.1 6 6 11.1.9 6Z"/>',
    location: '<path d="M3.3 1.1h5.4L11.4 6 8.7 10.9H3.3L.6 6Z"/>',
    living: '<circle cx="6" cy="6" r="5.1"/>',
  };
  if (!shapes[group]) return "";
  return `<svg class="catalog-pillar-cue" data-catalog-category-cue="${esc(group)}" data-pillar="${esc(group)}" width="${size}" height="${size}" viewBox="0 0 12 12" aria-hidden="true" focusable="false">${shapes[group]}</svg>`;
}
function groupLane(catalog, group, lang, projection, base) {
  const records = catalog.records.filter((record) => record.group === group.id);
  const subgroups = (catalog.subgroups || [])
    .filter((subgroup) => subgroup.group === group.id)
    .sort((a, b) => a.order - b.order);
  let body;
  if (subgroups.length) {
    const known = new Set(subgroups.map((subgroup) => subgroup.id));
    if (records.some((record) => !known.has(record.subgroup)))
      throw new Error(`Missing catalog subgroup in ${group.id}`);
    body = subgroups
      .map((subgroup) => {
        const members = records.filter(
          (record) => record.subgroup === subgroup.id,
        );
        if (!members.length) return "";
        return `<section class="catalog-subgroup" data-catalog-subgroup="${esc(subgroup.id)}" aria-labelledby="catalog-subgroup-${esc(subgroup.id)}"><h4 id="catalog-subgroup-${esc(subgroup.id)}" class="catalog-subgroup-title"><span>${esc(subgroup.label[lang])}</span><span class="catalog-subgroup-count" data-catalog-subgroup-count data-total="${members.length}" aria-label="${lang === "th" ? "จำนวนรายการในกลุ่มย่อย" : "Data views in this subgroup"}">${members.length}</span></h4><div class="catalog-lane-cards">${members.map((record) => card(catalog, record, lang, projection, base, 5)).join("")}</div></section>`;
      })
      .join("");
  } else
    body = `<div class="catalog-lane-cards">${records.map((record) => card(catalog, record, lang, projection, base, 4)).join("")}</div>`;
  return `<section class="catalog-lane" data-catalog-lane="${esc(group.id)}" data-group="${esc(group.id)}" aria-labelledby="catalog-lane-${esc(group.id)}"><header class="catalog-lane-heading">${pillarCue(group.id, 18)}<h3 id="catalog-lane-${esc(group.id)}">${esc(group.label)}</h3><span class="catalog-lane-total" data-catalog-lane-count data-total="${records.length}" aria-label="${lang === "th" ? "จำนวนรายการ" : "Data views"}">${records.length}</span><p>${esc(group.summary?.[lang] || catalog.copy[lang].story.groups[group.id].body)}</p></header>${body}</section>`;
}
export function catalogInner(catalog, lang, projection, base) {
  const t = catalog.copy[lang];
  return `<div class="wide-container catalog-layout-handoff"><div class="section-heading"><p class="eyebrow">${esc(t.eyebrow)}</p><h2 id="datasets-title">${esc(t.title)}</h2><p>${esc(t.intro)}</p></div><div class="catalog-toolbar" role="search" aria-label="${esc(t.searchLabel)}"><label class="catalog-search"><span class="sr-only">${esc(t.searchLabel)}</span>${uiIcon("search", { size: 24, className: "catalog-search-icon" })}<input type="search" data-catalog-search placeholder="${esc(t.searchPlaceholder)}" aria-controls="catalog-results" autocomplete="off"/></label><div class="catalog-filter" role="group" aria-label="${esc(t.groupLabel)}">${[{ id: "all", label: t.allGroups, count: catalog.records.length }, ...catalog.groups].map((g) => `<button type="button" data-catalog-group="${g.id}" aria-pressed="${g.id === "all"}">${pillarCue(g.id)}<span class="catalog-filter-label">${esc(g.label)}</span><span class="catalog-filter-total">${g.count}</span></button>`).join("")}</div><button type="button" class="catalog-reset" data-catalog-reset>${uiIcon("close", { size: 20 })}<span>${esc(t.clearSearch)}</span></button><p class="catalog-result-count" data-catalog-count role="status" aria-live="polite" data-label="${esc(t.resultLabel)}">${esc(t.resultLabel)}: ${catalog.records.length}</p></div><div class="catalog-grid" id="catalog-results">${catalog.groups.map((group) => groupLane(catalog, group, lang, projection, base)).join("")}</div><div class="catalog-empty" data-catalog-empty hidden><h3>${esc(t.emptyTitle)}</h3><p>${esc(t.emptyBody)}</p><button type="button" class="button" data-catalog-reset>${esc(t.resetFilters)}</button></div><p class="catalog-machine-link"><a href="${base}data/catalog.json">${lang === "th" ? "อ่านแค็ตตาล็อกในรูปแบบ JSON" : "Read the catalog as JSON"}</a></p></div>`;
}
export function showcaseInner(catalog, lang, base) {
  return `<div class="wide-container catalog-examples-handoff"><header class="section-heading catalog-examples-heading"><div><p class="eyebrow">${lang === "th" ? "เปิดดูของจริง" : "Explore real examples"}</p><h2 id="examples-title">${lang === "th" ? "ตัวอย่างที่พาไปถึงพื้นที่และข้อมูลต้นทาง" : "Examples that connect places and source data"}</h2></div><p>${lang === "th" ? "อ่านตัวอย่างจากพื้นที่จริง แล้วเปิดแผนที่เพื่อดูคำตอบที่เกี่ยวกับคุณ" : "Read examples from real places, then open the map to explore your own question."}</p></header><div class="catalog-showcase-grid">${catalog.showcaseIds
    .map((id, index) => {
      const r = catalog.records.find((x) => x.id === id);
      if (!r) throw new Error(`Missing showcase record: ${id}`);
      const group = catalog.groups.find((g) => g.id === r.group);
      const subgroup = catalog.subgroups?.find((s) => s.id === r.subgroup);
      const featured = index === 0;
      const imageRecord = featured && r.preview.largePath
        ? { ...r, preview: { ...r.preview, path: r.preview.largePath } } : r;
      const focus = r.preview.available && r.preview.focusLabel?.[lang];
      return `<article class="catalog-showcase-card${featured ? " catalog-showcase-featured" : ""}" data-showcase-record-id="${esc(r.id)}" data-group="${esc(r.group)}"><a class="catalog-showcase-preview" href="${esc(r.mapUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(words[lang].map + ": " + r.title[lang])}">${preview(imageRecord, lang, base)}${focus ? `<span class="catalog-showcase-focus">${esc(focus)}</span>` : ""}</a><div class="catalog-showcase-body"><p class="catalog-showcase-category">${pillarCue(r.group)}<span>${esc(group.label)}${subgroup ? ` · ${esc(subgroup.label[lang])}` : ""}</span></p><h3><a href="${detailUrl(catalog, r, lang)}">${headingTitle(r.title[lang])}</a></h3><p class="catalog-showcase-description">${esc(r.description[lang])}</p><div class="catalog-showcase-actions"><a href="#dataset-${esc(r.slug)}">${lang === "th" ? "ดูตัวอย่าง" : "View example"}${uiIcon("arrow_forward", { size: 20 })}</a><a href="${esc(r.mapUrl)}" target="_blank" rel="noopener noreferrer">${words[lang].map}${uiIcon("open_in_new", { size: 20 })}<span class="sr-only"> ${lang === "th" ? "(เปิดแท็บใหม่)" : "(opens a new tab)"}</span></a></div></div></article>`;
    })
    .join("")}</div></div>`;
}
export function identityGraph(catalog, lang, record) {
  const base = catalog.canonicalBase,
    page = record
      ? detailUrl(catalog, record, lang)
      : base + (lang === "en" ? "en/" : "");
  const entity = (id, type, name, url) => ({
    "@id": id,
    "@type": type,
    name,
    url,
  });
  return {
    "@context": "https://schema.org",
    "@graph": [
      entity(
        base + "#organization",
        "Organization",
        "Landometer",
        "https://landometer.com/",
      ),
      entity(base + "#website", "WebSite", "CityMETER", base),
      entity(
        page + "#webpage",
        "WebPage",
        record ? record.title[lang] + " — CityMETER" : "CityMETER",
        page,
      ),
      entity(base + "#catalog", "DataCatalog", "CityMETER data catalog", base),
      ...(record ? [record] : catalog.records).map((r) =>
        entity(
          detailUrl(catalog, r, lang) +
            (r.resourceClass === "Dataset" ? "#dataset" : "#resource"),
          r.resourceClass,
          r.title[lang],
          detailUrl(catalog, r, lang),
        ),
      ),
    ],
  };
}
export function shareLinks(catalog, record, lang) {
  const url = detailUrl(catalog, record, lang);
  const title = `${record.title[lang]} — CityMETER`;
  const query = (base, values) => base + new URLSearchParams(values).toString();
  return [
    { label: "LINE", url: query("https://social-plugins.line.me/lineit/share?", { url, text: title }) },
    { label: "Facebook", url: query("https://www.facebook.com/sharer/sharer.php?", { u: url }) },
    { label: "LinkedIn", url: query("https://www.linkedin.com/sharing/share-offsite/?", { url }) },
    { label: "X", url: query("https://x.com/intent/tweet?", { url, text: title }) },
  ];
}
function sharePanel(catalog, record, lang) {
  const w = words[lang], url = detailUrl(catalog, record, lang);
  return `<section class="catalog-share" aria-labelledby="share-title" data-summary-share data-share-url="${esc(url)}" data-share-title="${esc(record.title[lang] + " — CityMETER")}" data-copy-success="${esc(w.copied)}" data-copy-fallback="${esc(w.copyFallback)}" data-share-success="${esc(w.shared)}" data-share-fallback="${esc(w.shareFallback)}"><h2 id="share-title">${w.share}</h2><p>${w.shareIntro}</p><div class="catalog-share-actions"><button class="button" type="button" data-share-native hidden>${w.nativeShare}</button>${shareLinks(catalog, record, lang).map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${link.label}<span class="sr-only"> ${lang === "th" ? "(เปิดแท็บใหม่)" : "(opens a new tab)"}</span></a>`).join("")}<button class="button" type="button" data-share-copy hidden>${w.copy}</button></div><label class="catalog-share-url">${w.shareLink}<input type="url" readonly value="${esc(url)}" aria-label="${w.shareLink}"/></label><p class="catalog-share-status" role="status" aria-live="polite" data-share-status></p></section>`;
}
function summaryPreview(record, lang, base) {
  if (!record.preview.available) return "";
  const p = record.preview;
  const width = p.largePath ? 1200 : (p.width || 640);
  const height = p.largePath ? (p.height && p.width ? Math.round(1200 * p.height / p.width) : 675) : (p.height || 360);
  const caption = [p.conceptual ? words[lang].concept : p.focusLabel?.[lang], p.capture?.stateLabel?.[lang], p.capture?.note?.[lang]].filter(Boolean);
  return `<figure class="catalog-preview summary-preview"><img src="${base}${esc(p.largePath || p.path)}" alt="${esc((p.conceptual ? words[lang].concept : words[lang].preview) + ": " + record.title[lang])}" width="${width}" height="${height}" decoding="async" fetchpriority="high"/>${caption.length ? `<figcaption>${caption.map((part) => `<span>${esc(part)}</span>`).join("")}</figcaption>` : ""}</figure>`;
}
export function detailPage(catalog, record, lang, projection) {
  const base = lang === "en" ? "../../../" : "../../",
    url = detailUrl(catalog, record, lang),
    w = words[lang];
  const alt = detailUrl(catalog, record, lang === "th" ? "en" : "th");
  const backUrl = `${base}${lang === "en" ? "en/" : ""}#dataset-${record.slug}`;
  const back = `<a class="catalog-back" href="${backUrl}">← ${w.back}</a>`;
  const map = `<a class="button button-accent" href="${esc(record.mapUrl)}" target="_blank" rel="noopener noreferrer">${w.map} ↗</a>`;
  const summary = record.executiveSummary;
  const lead = summary.lead[lang];
  const socialImage = record.preview.available && !record.preview.conceptual
    ? `<meta property="og:image" content="${esc(catalog.canonicalBase + record.preview.path)}"/><meta property="og:image:alt" content="${esc(w.preview + ": " + record.title[lang])}"/><meta name="twitter:image" content="${esc(catalog.canonicalBase + record.preview.path)}"/>` : "";
  const article = `<article class="catalog-summary"><header class="summary-hero"><div class="summary-hero-copy"><p class="eyebrow">CityMETER · ${catalog.groups.find((g) => g.id === record.group).label}</p><h1>${headingTitle(record.title[lang])}</h1><p class="catalog-detail-intro">${esc(lead)}</p>${map}</div>${summaryPreview(record, lang, base)}</header><div class="summary-reading-column"><section class="summary-insight" aria-labelledby="reading-title"><h2 id="reading-title">${esc(summary.sectionTitle[lang])}</h2><p>${esc(summary.reading[lang])}</p><p class="summary-reader-note">${esc(summary.note[lang])}</p></section><section class="catalog-summary-questions" aria-labelledby="questions-title"><h2 id="questions-title">${lang === "th" ? "ลองเริ่มจากสองคำถามนี้" : "Two questions to start with"}</h2><ul>${summary.questions[lang].map((q) => `<li>${esc(q)}</li>`).join("")}</ul></section><section class="catalog-summary-next" aria-labelledby="next-title"><h2 id="next-title">${lang === "th" ? "ดูพื้นที่ที่คุณสนใจต่อ" : "Explore the area on the map"}</h2><p>${esc(summary.takeaway[lang])}</p><div class="catalog-summary-actions">${map}<a class="summary-contact" href="https://montri-th.github.io/rebuild02/#contact">${w.contact}</a></div></section><section class="summary-reference-section" aria-labelledby="source-title"><h2 id="source-title">${lang === "th" ? "อ่านต่อจากต้นทาง" : "Read further at the source"}</h2><details class="summary-source-details"><summary>${lang === "th" ? "แหล่งอ้างอิง ช่วงเวลา และขอบเขตข้อมูล" : "References, dates and data coverage"}</summary>${sourcePanel(record, lang, 3)}<div class="summary-method-note"><h3>${lang === "th" ? "เมื่อจะนำข้อมูลไปเปรียบเทียบหรืออ้างอิง" : "When comparing or citing the data"}</h3><p>${esc(record.limitation[lang])}</p></div></details></section><section class="summary-people-handoff" aria-label="${lang === "th" ? "ทีมร่วมพัฒนาและลิงก์แผนที่" : "Contributors and map link"}">${contributors(record, lang, projection)}${qrHandoff(record, lang, base)}</section>${sharePanel(catalog, record, lang)}<div class="summary-return">${back}<p class="catalog-machine-link"><a href="${base}data/catalog.json">${lang === "th" ? "แค็ตตาล็อก JSON" : "Catalog JSON"}</a></p></div></div></article>`;
  return `<!doctype html><html lang="${lang}" data-ds="landometer" data-ds-version="0.9.7" data-ds-coverage="catalog-and-details" data-theme="light"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><script>(()=>{let stored="system";try{stored=localStorage.getItem("lds-theme")||localStorage.getItem("citymeter-theme")||"system";}catch(_){}const valid=["light","dark","system"];const query=new URLSearchParams(location.search).get("theme");const setting=valid.includes(query)?query:(valid.includes(stored)?stored:"system");let dark=false;try{dark=typeof matchMedia==="function"&&matchMedia("(prefers-color-scheme: dark)").matches;}catch(_){}const choice=setting==="system"?(dark?"dark":"light"):setting;document.documentElement.dataset.theme=choice;document.documentElement.style.colorScheme=choice;})();</script><title>${esc(record.title[lang])} — CityMETER</title><meta name="description" content="${esc(lead)}"/><meta name="robots" content="index,follow"/><link rel="canonical" href="${url}"/><link rel="alternate" hreflang="th" href="${detailUrl(catalog, record, "th")}"/><link rel="alternate" hreflang="en" href="${detailUrl(catalog, record, "en")}"/><link rel="alternate" hreflang="x-default" href="${detailUrl(catalog, record, "th")}"/><link rel="alternate" type="application/json" href="${base}data/catalog.json" title="CityMETER public catalog"/><link rel="icon" href="https://landometer.com/static/images/favicon/favicon-32x32.png"/><meta property="og:type" content="website"/><meta property="og:site_name" content="CityMETER"/><meta property="og:url" content="${url}"/><meta property="og:title" content="${esc(record.title[lang])} — CityMETER"/><meta property="og:description" content="${esc(lead)}"/><meta property="og:locale" content="${lang === "th" ? "th_TH" : "en_US"}"/>${socialImage}<meta name="twitter:card" content="${socialImage ? "summary_large_image" : "summary"}"/><meta name="twitter:title" content="${esc(record.title[lang])} — CityMETER"/><meta name="twitter:description" content="${esc(lead)}"/><meta name="landometer:ds-version" content="0.9.7"/><meta name="citymeter:catalog-version" content="${catalog.contentVersion}"/><link rel="stylesheet" href="${base}assets/index-cqxdfePB.css?v=2"/><link rel="stylesheet" href="${base}assets/citymeter-fonts.css?v=1"/><link rel="stylesheet" href="${base}assets/landometer-ds/v0.9.7/color-srgb-10.production.css"/><link rel="stylesheet" href="${base}assets/catalog-shell-current-r1.css"/><link rel="stylesheet" href="${base}assets/catalog-public-r1.css"/><link rel="stylesheet" href="${base}assets/dataset-summary-public-r1.css"/><script defer src="${base}assets/dataset-summary-public-r1.js"></script><script type="application/ld+json">${json(identityGraph(catalog, lang, record))}</script></head><body class="catalog-detail-page"><a class="skip-link" href="#main">${lang === "th" ? "ข้ามไปยังเนื้อหา" : "Skip to content"}</a><header class="catalog-detail-header"><a href="${base}${lang === "en" ? "en/" : ""}"><img src="${base}media/landometer-logo-horizontal.png" width="172" height="39" alt="Landometer"/></a><nav aria-label="${lang === "th" ? "เมนู" : "Navigation"}"><a href="${base}${lang === "en" ? "en/" : ""}#datasets">CityMETER</a><a href="${alt}" hreflang="${lang === "th" ? "en" : "th"}" lang="${lang === "th" ? "en" : "th"}">${lang === "th" ? "English" : "ไทย"}</a></nav></header><main id="main" class="catalog-detail-main">${back}${article}</main><footer class="catalog-detail-footer"><a href="https://landometer.com/">Landometer</a> · Local Decisions</footer></body></html>`;
}
