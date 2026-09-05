import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundleV17 = path.join(root, "assets/index-qbT50gkr-v17.js");
const bundleV18 = path.join(root, "assets/index-qbT50gkr-v18.js");
const enhancerV25 = path.join(root, "assets/catalog-enhancements-v25.js");
const enhancerV26 = path.join(root, "assets/catalog-enhancements-ds-0.9.1-v26.js");
const catalogReview = JSON.parse(fs.readFileSync(path.join(root, "data/catalog-source-review.json"), "utf8"));
const inlineCatalogReview = JSON.stringify(catalogReview).replaceAll("<", "\\u003c");
const checkOnly = process.argv.includes("--check");

function count(source, needle) {
  return source.split(needle).length - 1;
}

function replaceOne(source, before, after, label) {
  const beforeCount = count(source, before);
  const afterCount = count(source, after);
  if (beforeCount === 1 && afterCount === 0) return source.replace(before, after);
  if (afterCount === 1 && (beforeCount === 0 || after.includes(before))) return source;
  throw new Error(`${label}: expected one old or one migrated match; found old=${beforeCount}, new=${afterCount}`);
}

function replaceRequired(source, before, after, label) {
  const beforeCount = count(source, before);
  if (beforeCount !== 1) throw new Error(`${label}: expected one source match; found ${beforeCount}`);
  return source.replace(before, after);
}

function replaceEvery(source, before, after, label) {
  const beforeCount = count(source, before);
  const afterCount = count(source, after);
  if (beforeCount > 0) return source.replaceAll(before, after);
  if (afterCount > 0) return source;
  throw new Error(`${label}: expected at least one source or migrated match`);
}

function replaceOneVariant(source, variants, after, label) {
  const matches = variants.map((variant) => ({ variant, count: count(source, variant) }));
  const beforeCount = matches.reduce((total, match) => total + match.count, 0);
  const afterCount = count(source, after);
  if (beforeCount === 1 && afterCount === 0) {
    return source.replace(matches.find((match) => match.count === 1).variant, after);
  }
  if (beforeCount === 0 && afterCount === 1) return source;
  throw new Error(`${label}: expected one source variant or one migrated match; found old=${beforeCount}, new=${afterCount}`);
}

function normalizeAdjacentDuplicateLine(source, line, label) {
  const occurrences = count(source, line);
  if (occurrences === 1) return source;
  if (occurrences === 2 && source.includes(`${line}\n${line}`)) {
    return source.replace(`${line}\n${line}`, line);
  }
  throw new Error(`${label}: expected one line or one adjacent duplicate pair; found ${occurrences}`);
}

function replaceSpan(source, startMarker, endMarker, replacement, label) {
  const startCount = count(source, startMarker);
  const endCount = count(source, endMarker);
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`${label}: expected one start and one end marker; found start=${startCount}, end=${endCount}`);
  }
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (end < start) throw new Error(`${label}: end marker precedes start marker`);
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function setInlineJsonAfter(source, anchor, script, id, label) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const inlinePattern = new RegExp(`\\n[ \\t]*<script type="application/json" id="${escapedId}">[\\s\\S]*?<\\/script>`, "g");
  const cleaned = source.replace(inlinePattern, "");
  const anchorCount = count(cleaned, anchor);
  if (anchorCount !== 1) throw new Error(`${label}: expected one anchor after registry cleanup; found ${anchorCount}`);
  return cleaned.replace(anchor, `${anchor}\n${script}`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function localized(record, field, language) {
  return record[`${field}${language === "th" ? "Th" : "En"}`] || "";
}

const sourceStatusLabels = {
  th: {
    "verified-lineage": "ยืนยันแหล่งข้อมูลต้นทางแล้ว",
    candidate: "พบแหล่งข้อมูลที่เกี่ยวข้อง — ต้องตรวจเพิ่ม",
    "other-source": "ใช้แหล่งข้อมูลเฉพาะด้าน",
    derived: "CityMETER คำนวณและสรุปต่อยอด",
    unproven: "ข้อมูลสำรวจเบื้องต้น — ยังไม่ยืนยันแหล่งต้นทาง"
  },
  en: {
    "verified-lineage": "Source dataset verified",
    candidate: "Related source identified — further checks needed",
    "other-source": "Uses a specialist data source",
    derived: "Calculated and summarised by CityMETER",
    unproven: "Exploratory view — source not yet verified"
  }
};

function sourceLinks(record, language, key, label) {
  const links = Array.isArray(record[key]) ? record[key] : [];
  if (!links.length) return "";
  const anchors = links.map((link) => `<a class="source-link" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(language === "th" ? link.labelTh : link.labelEn)}</a>`).join("");
  return `<div class="source-link-group"><span class="source-link-label">${label}</span><div class="source-links">${anchors}</div></div>`;
}

function staticSourceReviewInner(record, language) {
  const th = language === "th";
  const owner = localized(record, "owner", language);
  const source = localized(record, "source", language);
  const period = localized(record, "period", language) || (th
    ? "ยังไม่มีช่วงเวลาและรอบปรับปรุงที่ยืนยันในทะเบียนนี้"
    : "No verified coverage period or update cycle is recorded here yet");
  const reading = localized(record, "reading", language);
  return [
    `<span class="source-status source-status-${escapeHtml(record.status)}">${escapeHtml(sourceStatusLabels[language][record.status] || sourceStatusLabels[language].unproven)}</span>`,
    `<div class="source-copy-block"><strong>${th ? "ข้อมูลมาจากไหน" : "Where the data comes from"}</strong><p>${escapeHtml(`${owner} — ${source}`)}</p></div>`,
    `<div class="source-copy-block"><strong>${th ? "ข้อมูลครอบคลุมช่วงไหน" : "What period the data covers"}</strong><p>${escapeHtml(period)}</p></div>`,
    `<div class="source-copy-block"><strong>${th ? "ก่อนใช้ตัดสินใจ" : "Before making a decision"}</strong><p>${escapeHtml(reading)}</p></div>`,
    sourceLinks(record, language, "official", th ? "ช่องทางทางการ" : "Official channel"),
    sourceLinks(record, language, "gd", "GD Catalog"),
    `<p class="source-review-date">${th ? "ทบทวนหลักฐาน" : "Evidence reviewed"}: ${th ? "14 ส.ค. 2569" : "14 Aug 2026"}</p>`
  ].join("");
}

function staticSourceReview(record, language) {
  return `<div class="source-review source-review-static" data-evidence-for="claim.citymeter.catalog.${record.id}.v1">${staticSourceReviewInner(record, language)}</div>`;
}

function addStaticSourceReviews(html, relativePath, language) {
  for (const record of catalogReview.records) {
    const articleMarker = `<article class="dataset-card" id="${record.id}"`;
    const articleStart = html.indexOf(articleMarker);
    if (articleStart < 0) throw new Error(`${relativePath}: missing catalogue article ${record.id}`);
    const articleEnd = html.indexOf("</article>", articleStart);
    if (articleEnd < 0) throw new Error(`${relativePath}: unclosed catalogue article ${record.id}`);
    let article = html.slice(articleStart, articleEnd + "</article>".length);
    const openingEnd = article.indexOf(">");
    if (openingEnd < 0) throw new Error(`${relativePath}: missing opening tag for ${record.id}`);
    let opening = article.slice(0, openingEnd);
    opening = opening
      .replace(/\sdata-source-status="[^"]*"/g, "")
      .replace(/\sdata-claim-id="[^"]*"/g, "")
      .replace(/\sdata-source-review-version="[^"]*"/g, "");
    opening = opening.replace(
      articleMarker,
      `${articleMarker} data-source-status="${record.status}" data-claim-id="claim.citymeter.catalog.${record.id}.v1" data-source-review-version="2026-09-04-r5"`
    );
    article = `${opening}${article.slice(openingEnd)}`;
    const summaryStart = article.indexOf("<summary");
    const summaryEnd = article.indexOf("</summary>", summaryStart);
    if (summaryStart < 0 || summaryEnd < summaryStart) throw new Error(`${relativePath}: missing details summary for ${record.id}`);
    const statusSummary = `<summary class="source-summary"><span class="source-status-dot" aria-hidden="true"></span><span class="source-summary-copy">${escapeHtml(sourceStatusLabels[language][record.status] || sourceStatusLabels[language].unproven)}</span></summary>`;
    article = `${article.slice(0, summaryStart)}${statusSummary}${article.slice(summaryEnd + "</summary>".length)}`;
    if (record.conceptualPreview && !article.includes("conceptual-preview-label")) {
      const imageLinkEnd = article.indexOf('</a><div class="dataset-body">');
      if (imageLinkEnd < 0) throw new Error(`${relativePath}: missing image link boundary for ${record.id}`);
      const conceptual = language === "th"
        ? "ภาพประกอบแนวคิด — ไม่ใช่หน้าจอหรือข้อมูลจริง"
        : "Concept illustration — not a product screen or real data";
      article = `${article.slice(0, imageLinkEnd)}<span class="conceptual-preview-label">${conceptual}</span>${article.slice(imageLinkEnd)}`;
    }
    const detailsEnd = article.lastIndexOf("</details>");
    if (detailsEnd < 0) throw new Error(`${relativePath}: missing details for ${record.id}`);
    const reviewStart = article.indexOf('<div class="source-review source-review-static"');
    article = reviewStart >= 0
      ? `${article.slice(0, reviewStart)}${staticSourceReview(record, language)}${article.slice(detailsEnd)}`
      : `${article.slice(0, detailsEnd)}${staticSourceReview(record, language)}${article.slice(detailsEnd)}`;
    if (record.conceptualPreview && !article.includes("conceptual-preview-a11y")) {
      const imageLinkBoundary = '</a><div class="dataset-body">';
      const conceptual = language === "th"
        ? "ภาพประกอบแนวคิด — ไม่ใช่หน้าจอหรือข้อมูลจริง"
        : "Concept illustration — not a product screen or real data";
      article = replaceOne(
        article,
        imageLinkBoundary,
        `</a><span class="visually-hidden conceptual-preview-a11y">${conceptual}</span><div class="dataset-body">`,
        `${relativePath} accessible conceptual label ${record.id}`
      );
    }
    html = `${html.slice(0, articleStart)}${article}${html.slice(articleEnd + "</article>".length)}`;
  }
  return html;
}

function rewriteStaticCatalogFlow(html, language, relativePath) {
  const th = language === "th";
  const step = (group, countValue, body) => `<div class="catalog-structure-step" role="listitem" data-group="${group}"><div class="catalog-structure-step-heading"><span lang="en">${group[0].toUpperCase()}${group.slice(1)}</span><small>${countValue}${th ? " รายการ" : " views"}</small></div><p>${body}</p></div>`;
  const replacement = `<div class="catalog-structure-flow" role="list">${step("land", 12, th ? "ที่ดิน · อาคาร · โครงสร้างพื้นฐาน" : "Land · buildings · infrastructure")}<span class="catalog-structure-operator" aria-hidden="true">+</span>${step("location", 13, th ? "ธุรกิจ · การเดินทาง · การเข้าถึง" : "Business · mobility · access")}<span class="catalog-structure-operator" aria-hidden="true">+</span>${step("living", 13, th ? "ผู้คน · บริการ · ความเป็นอยู่" : "People · services · everyday life")}</div>`;
  return replaceSpan(
    html,
    '<div class="catalog-structure-flow" role="list">',
    '<div class="catalog-structure-citymeter">',
    replacement,
    `${relativePath} peer-category flow`
  );
}

function ensureStaticSupporterLogos(html, relativePath, prefix, language) {
  const footerStartMarker = '<div class="footer-brand">';
  const footerEndMarker = '</div><div class="footer-meta">';
  const footerStart = html.indexOf(footerStartMarker);
  const footerEnd = html.indexOf(footerEndMarker, footerStart);
  if (footerStart < 0 || footerEnd < footerStart) throw new Error(`${relativePath}: footer brand boundary is invalid`);
  const footerBrand = html.slice(footerStart, footerEnd + "</div>".length);
  const summaryEnd = footerBrand.indexOf("</p>");
  if (summaryEnd < 0) throw new Error(`${relativePath}: footer summary is missing`);
  const th = language === "th";
  const phrase = th ? "ได้รับการส่งเสริมและสนับสนุนโดย depa" : "Promoted and supported by depa";
  const label = th ? "การสนับสนุนและเครื่องหมายโครงการที่ได้รับจาก depa" : "Support and programme marks received from depa";
  const accountAlt = th ? "บัญชีบริการดิจิทัล" : "Digital Service Account";
  const supporterMarkup = `<p class="supporter-evidence-line">${phrase}</p><div class="supporter-logos supporter-logos-footer" role="group" aria-label="${label}"><span class="supporter-logo-cell supporter-logo-cell-depa"><img class="supporter-logo supporter-logo-depa" src="${prefix}media/supporters/depa.png" alt="depa" width="2160" height="1350" loading="lazy" decoding="async"/></span><span class="supporter-logo-cell supporter-logo-cell-dsure"><img class="supporter-logo supporter-logo-dsure" src="${prefix}media/supporters/dsure-software.png" alt="dSURE Software" width="1014" height="1465" loading="lazy" decoding="async"/></span><span class="supporter-logo-cell supporter-logo-cell-account"><img class="supporter-logo supporter-logo-account" src="${prefix}media/supporters/digital-service-account.png" alt="${accountAlt}" width="2298" height="1042" loading="lazy" decoding="async"/></span></div>`;
  const rebuilt = `${footerBrand.slice(0, summaryEnd + "</p>".length)}${supporterMarkup}</div>`;
  return `${html.slice(0, footerStart)}${rebuilt}${html.slice(footerEnd + "</div>".length)}`;
}

function replaceStaticSocialIcons(html, relativePath) {
  const start = html.indexOf('<nav class="footer-social"');
  const end = html.indexOf("</nav>", start);
  if (start < 0 || end < start) throw new Error(`${relativePath}: footer social navigation is missing`);
  const nav = html.slice(start, end + "</nav>".length);
  let replacements = 0;
  const textNav = nav.replace(/(<a\b[^>]*title="([^"]+)"[^>]*>)<svg\b[\s\S]*?<\/svg><\/a>/g, (_match, open, title) => {
    replacements += 1;
    return `${open}${escapeHtml(title)}</a>`;
  });
  if (replacements !== 4 && !nav.includes(">Facebook</a>")) {
    throw new Error(`${relativePath}: expected four social icon replacements; found ${replacements}`);
  }
  return `${html.slice(0, start)}${textNav}${html.slice(end + "</nav>".length)}`;
}

function buildHydratedBundle() {
  const source = fs.readFileSync(bundleV17, "utf8");
  let migrated = replaceOne(
    source,
    'O==="dark"?"#141820":"#176b82"',
    'O==="dark"?"#11191D":"#F6F7F3"',
    "hydrated theme-color projection"
  );
  migrated = replaceOne(migrated, "สำรวจอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยงจากข้อมูลจริง แล้วเปิดดูพื้นที่ที่สนใจได้ทันที", "สำรวจตัวอย่างอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยง พร้อมดูขอบเขตและสิ่งที่ยังต้องตรวจ ก่อนเปิดพื้นที่ที่สนใจ", "hydrated Thai hero evidence boundary");
  migrated = replaceOne(migrated, "Explore buildings, prices, businesses, people, access and risk through real data, then open the place you need.", "Explore examples across buildings, prices, businesses, people, access and risk, with each record’s scope and checks to make before you open a place.", "hydrated English hero evidence boundary");
  migrated = replaceOne(migrated, "แสดงเฉพาะหน่วยที่ยืนยันได้ในแต่ละรายการ", "แต่ละรายการบอกระดับพื้นที่ที่รองรับได้ หรือสิ่งที่ยังต้องตรวจ", "hydrated Thai spatial proof boundary");
  migrated = replaceOne(migrated, "Only evidenced units are shown for each record", "Each record states the spatial level it supports or what still needs checking", "hydrated English spatial proof boundary");
  migrated = replaceOne(migrated, 'title:"เข้าใจเมืองผ่าน 3 มุมที่เชื่อมกัน",intro:"Land คือฐานของเมือง Living คือผู้คน บริการ และความเป็นอยู่ เมื่อนำมาดูร่วมกันจึงเห็นว่าแต่ละ Location ต่างกันอย่างไร—และบางเรื่องเปลี่ยนไปตามเวลา"', 'title:"เข้าใจเมืองผ่าน 3 มิติ แล้วไปสู่การตัดสินใจ",intro:"Land, Location และ Living เป็นบริบทคนละมิติที่ CityMETER นำมาเชื่อมกัน เพื่อให้เห็นสิ่งที่ควรตรวจ เปรียบเทียบ และตัดสินใจต่อในพื้นที่จริง"', "hydrated Thai product architecture");
  migrated = replaceOne(migrated, 'title:"One city, seen through three connected lenses",intro:"Land is the city’s base. Living is people, services and everyday life. Together they show how each Location differs—and how some patterns change over time."', 'title:"Three dimensions of a place, connected to a decision",intro:"Land, Location and Living are peer dimensions that CityMETER connects so people can see what to check, compare and decide next in a real place."', "hydrated English product architecture");
  migrated = replaceOne(migrated, 'body:"รวม 38 มุมมองให้ค้น เทียบ และเปิดดูหลักฐานในที่เดียว"},outcome:{brand:"Landometer",label:"Local Decisions",body:"ช่วยให้เห็นว่าควรตรวจอะไรต่อ และตัดสินใจเรื่องพื้นที่ได้อย่างไร"}', 'body:"เชื่อม 38 มุมมองให้ค้น เทียบ และเห็นทั้งสิ่งที่รู้กับสิ่งที่ยังต้องตรวจ"},outcome:{brand:"CityMETER",label:"Local Decisions",body:"เปลี่ยนบริบทเชิงพื้นที่ให้เป็นสิ่งที่ควรตรวจ เทียบ และทำต่อ"}', "hydrated Thai outcome boundary");
  migrated = replaceOne(migrated, 'body:"Organises 38 views so people can find, compare and inspect evidence in one place."},outcome:{brand:"Landometer",label:"Local Decisions",body:"Shows what to check next and how to move a place decision forward."}', 'body:"Connects 38 views so people can find, compare and see both what is known and what still needs checking."},outcome:{brand:"CityMETER",label:"Local Decisions",body:"Turns spatial context into what to check, compare and do next."}', "hydrated English outcome boundary");
  migrated = replaceEvery(migrated, "เล่าโครงข่าย 50,000 สาขา พร้อมสำนักงานใหญ่ หมวดธุรกิจ และสาขาจดทะเบียนใหม่", "สำรวจตัวอย่างโครงข่ายสำนักงานใหญ่–สาขา หมวดธุรกิจ และสาขาจดทะเบียนใหม่ โดยตรวจขนาดชุดข้อมูลในรายละเอียดก่อนใช้", "hydrated Thai business sample boundary");
  migrated = replaceEvery(migrated, "Tell the 50,000-branch network story through headquarters, sectors, and newly registered branches", "Explore a sample headquarters–branch network, sectors, and newly registered branches, checking the dataset size in the details before use", "hydrated English business sample boundary");
  migrated = replaceEvery(migrated, "ความครบของแต่ละฟิลด์ไม่เท่ากัน: GFA และ GLA ราว 70% ส่วนจำนวนผู้เช่าราว 95.6% ของระเบียนที่ตรวจ", "ความครบของฟิลด์ GFA, GLA และจำนวนผู้เช่าไม่เท่ากัน ต้องตรวจ coverage ของระเบียนก่อนเปรียบเทียบ", "hydrated Thai retail coverage boundary");
  migrated = replaceEvery(migrated, "Field coverage differs: GFA and GLA are about 70%, while tenant count is about 95.6% in the audited records", "Coverage differs across GFA, GLA and tenant fields; check record completeness before comparison", "hydrated English retail coverage boundary");
  migrated = replaceEvery(migrated, "ใช้เส้นเวลา 14 ปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นภาพตั้งต้นของความเสี่ยงย้อนหลัง", "ใช้เส้นเวลาหลายปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นบริบทน้ำท่วมย้อนหลัง โดยตรวจช่วงปีจากแหล่งข้อมูลก่อนใช้", "hydrated Thai flood-period boundary");
  migrated = replaceEvery(migrated, "Use the 14-year timeline, recurrence count, and worst year as the historical risk baseline", "Use the multi-year timeline, recurrence count, and worst year as historical flood context, checking the source period before use", "hydrated English flood-period boundary");
  migrated = replaceEvery(migrated, "แสดงพื้นที่ที่ตรวจพบพร้อมวันที่สังเกตการณ์ให้เด่นกว่าคำว่า ‘ล่าสุด’", "ใช้ภาพขอบเขตเป็น snapshot เบื้องต้น โดยตรวจ observation date จากแหล่งข้อมูลก่อนและไม่ใช้แทนสถานการณ์สด", "hydrated Thai observed-flood boundary");
  migrated = replaceEvery(migrated, "Make the observation date more prominent than the word ‘latest’ when showing detected flood areas", "Use the extent only as a provisional snapshot after verifying its observation date at the source", "hydrated English observed-flood boundary");
  migrated = replaceEvery(migrated, "ข้อมูลที่ตรวจพบล่าสุดเป็นภาพตามวันที่ระบุ ไม่ใช่สถานการณ์สด", "หน้านี้ยังไม่ยืนยัน observation date หรือ vintage; พื้นที่ไม่มีสีไม่ได้แปลว่าปลอดภัย", "hydrated Thai observed-flood limitation");
  migrated = replaceEvery(migrated, "The latest observed layer is a dated snapshot, not present conditions", "This page does not yet verify the layer’s observation date or vintage; uncoloured areas are not automatically safe", "hydrated English observed-flood limitation");
  migrated = replaceEvery(migrated, "ใช้พื้นที่น้ำท่วม ความลึกสูงสุด–เฉลี่ย และเวลาออกรัน เพื่อช่วยจัดลำดับการติดตาม", "ใช้รายการนี้ระบุคำถามเรื่องพื้นที่ ความลึก วิธี และเวลาออกรันที่ต้องตรวจจากหน่วยงานก่อนเฝ้าระวัง", "hydrated Thai forecast-depth boundary");
  migrated = replaceEvery(migrated, "Use flooded area, maximum and average depth, and run time to prioritise follow-up", "Use this record to identify the area, depth, method and run-time questions to verify before monitoring", "hydrated English forecast-depth boundary");
  migrated = replaceEvery(migrated, "ผลโมเดลไม่ใช่คำยืนยันเหตุการณ์ และต้องแสดงเวลาออกรัน แหล่งข้อมูล วิธี และข้อจำกัด", "exact package, เวลาออกรัน วิธี และโมเดลยังไม่ยืนยัน จึงห้ามใช้เป็นคำยืนยันหรือคำแนะนำฉุกเฉิน", "hydrated Thai forecast-depth limitation");
  migrated = replaceEvery(migrated, "Model output is not confirmation of an event; show run time, source, method, and limitations", "The exact package, run time, method and model remain unverified; do not treat this as confirmation or emergency advice", "hydrated English forecast-depth limitation");
  migrated = replaceEvery(migrated, "ใช้ระดับความเสี่ยง 24 ชั่วโมง อันดับจังหวัด และเวลาออกรันเป็นภาพเฝ้าระวัง", "ใช้รายการนี้ระบุพื้นที่ ช่วงคาดการณ์ และเวลาออกรันที่ต้องตรวจจากแหล่งทางการก่อนเฝ้าระวัง", "hydrated Thai flash-flood boundary");
  migrated = replaceEvery(migrated, "Use the 24-hour risk levels, province ranking, and run time as a monitoring story", "Use this record to identify the area, forecast horizon and run time to verify at the named provider source", "hydrated English flash-flood boundary");
  migrated = replaceEvery(migrated, "เป็นสัญญาณจากโมเดล ไม่ใช่คำยืนยันว่าจะเกิดเหตุ และต้องคงป้ายสถานะการทดลองไว้", "exact feed, ช่วงคาดการณ์และเวลาออกรันยังไม่ยืนยัน จึงไม่ใช่คำเตือนทางการหรือคำแนะนำเดินทาง", "hydrated Thai flash-flood limitation");
  migrated = replaceEvery(migrated, "This is a model signal, not confirmation that an event will occur; retain the experimental status", "The exact feed, forecast horizon and run time remain unverified; this is not a verified alert or travel advice", "hydrated English flash-flood limitation");
  migrated = replaceEvery(migrated, "สัญญาณความเสี่ยง 24 ชั่วโมง", "ช่วงคาดการณ์และเวลาออกรัน · ต้องยืนยัน", "hydrated Thai flash-flood focus boundary");
  migrated = replaceEvery(migrated, "24-hour risk signal", "Forecast horizon and run time · verify", "hydrated English flash-flood focus boundary");
  migrated = replaceEvery(migrated, "ใช้ตำแหน่งสถานี ค่า MMI ความเร่ง และเวลาอัปเดตสร้างภาพเครือข่ายตรวจวัด", "ใช้รายการนี้ระบุสถานี ตัวชี้วัดแรงสั่นสะเทือน และเวลาข้อมูลที่ต้องตรวจจากแหล่งทางการ", "hydrated Thai earthquake boundary");
  migrated = replaceEvery(migrated, "Use station locations, MMI, acceleration, and update time to explain the sensing network", "Use this record to identify the station, shaking measures and timestamp to verify at the named provider source", "hydrated English earthquake boundary");
  migrated = replaceEvery(migrated, "ต้องแสดงความใหม่ของข้อมูล; วันที่อัปเดตที่พบในการตรวจคือ 10 มีนาคม 2569", "หน้านี้ยังไม่มี freshness record ปัจจุบัน ต้องตรวจสถานี ตัวชี้วัด และเวลาอัปเดตจากแหล่งทางการ", "hydrated Thai earthquake limitation");
  migrated = replaceEvery(migrated, "Freshness must remain visible; the inspected page showed an update date of 10 March 2026", "This page has no current freshness record; verify the station, measures and update time at the named provider source", "hydrated English earthquake limitation");
  migrated = replaceEvery(migrated, "14 ปี · การเกิดซ้ำ · ปีหนักสุด", "หลายปี · การเกิดซ้ำ · ปีหนักสุด", "hydrated Thai flood focus boundary");
  migrated = replaceEvery(migrated, "14 years · recurrence · worst year", "Multi-year · recurrence · worst year", "hydrated English flood focus boundary");
  migrated = replaceOne(migrated, 'E("land"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("living"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"→"}),E("location")', 'E("land"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("location"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("living")', "hydrated peer-category order");
  migrated = replaceOne(
    migrated,
    'name:"CityMETER public data views and modules",numberOfItems:g.length,dataset:',
    'name:"CityMETER public data views and modules",dataset:',
    "hydrated structured-data schema boundary"
  );
  migrated = replaceOne(
    migrated,
    'const g=f==="th"?"หน่วยงานและเครื่องหมายรับรองที่เกี่ยวข้อง":"Related programme and certification marks"',
    'const g=f==="th"?"การสนับสนุนและเครื่องหมายโครงการที่ได้รับจาก depa":"Support and programme marks received from depa"',
    "hydrated supporter attribution label"
  );
  migrated = replaceOne(
    migrated,
    'p.jsx("p",{children:c.footer.summary}),p.jsxs("div",{className:"supporter-logos supporter-logos-footer"',
    'p.jsx("p",{children:c.footer.summary}),p.jsx("p",{className:"supporter-evidence-line",children:f==="th"?"ได้รับการส่งเสริมและสนับสนุนโดย depa":"Promoted and supported by depa"}),p.jsxs("div",{className:"supporter-logos supporter-logos-footer"',
    "hydrated visible depa attribution"
  );
  migrated = replaceOne(migrated, 'children:p.jsx(SocialIconGlyph,{path:N.path})', "children:N.name", "hydrated text social links");
  const sourceReviewMeta = Object.fromEntries(catalogReview.records.map((record) => [record.id, {
    status: record.status,
    conceptualPreview: Boolean(record.conceptualPreview)
  }]));
  const sourceReviewHtml = Object.fromEntries(["th", "en"].map((language) => [
    language,
    Object.fromEntries(catalogReview.records.map((record) => [record.id, staticSourceReviewInner(record, language)]))
  ]));
  const sourceReviewRuntime = [
    `const CitymeterSourceReviewMeta=${JSON.stringify(sourceReviewMeta)};`,
    `const CitymeterSourceReviewHtml=${JSON.stringify(sourceReviewHtml)};`,
    `const CitymeterSourceStatusLabels=${JSON.stringify(sourceStatusLabels)};`,
    'function CitymeterSourceReview({recordId:c,language:f}){return p.jsx("div",{className:"source-review source-review-static","data-evidence-for":`claim.citymeter.catalog.${c}.v1`,dangerouslySetInnerHTML:{__html:CitymeterSourceReviewHtml[f][c]}})}',
    'function G6({record:c,language:f,text:g}){const s=sc(c),d=f==="th"?c.th:c.en,h="dataset-"+xn(c.id),A=CitymeterSourceReviewMeta[h],H=CitymeterSourceStatusLabels[f][A.status]||CitymeterSourceStatusLabels[f].unproven,v=A.conceptualPreview?(f==="th"?"ภาพประกอบแนวคิด — ไม่ใช่หน้าจอหรือข้อมูลจริง":"Concept illustration — not a product screen or real data"):"";return p.jsxs("article",{className:"dataset-card","data-pillar":c.group,id:h,"data-source-status":A.status,"data-claim-id":`claim.citymeter.catalog.${h}.v1`,"data-source-review-version":"2026-09-04-r5","data-citymeter-record-id":h,"data-module-slug":h,children:[p.jsxs("a",{className:"dataset-image",href:c.href,target:"_blank",rel:"noreferrer",tabIndex:"-1","aria-hidden":"true",children:[p.jsx("img",{src:ca(s.previewPath.replace("media/previews-v2/","media/previews-v3/")),alt:"",width:"800",height:"500",loading:"lazy",decoding:"async"}),p.jsx("span",{className:"preview-focus-label "+(s.assetStatus==="limited"?"is-limited":""),children:s.focusLabel[f]}),A.conceptualPreview?p.jsx("span",{className:"conceptual-preview-label",children:v}):null]}),A.conceptualPreview?p.jsx("span",{className:"visually-hidden conceptual-preview-a11y",children:v}):null,p.jsxs("div",{className:"dataset-body",children:[p.jsxs("div",{className:"dataset-kicker",children:[p.jsx("span",{children:c.group}),c.marketing.featured?p.jsxs("span",{children:["Featured ",String(c.marketing.featuredOrder).padStart(2,"0")]}):null]}),p.jsx("h3",{children:d}),p.jsx("p",{children:c.marketing.visualStory[f]}),p.jsx("div",{className:"feature-tags",children:c.marketing.featureTags.slice(0,3).map(E=>p.jsx("span",{children:E[f]},E.id))}),p.jsxs("dl",{className:"evidence-summary",children:[p.jsxs("div",{children:[p.jsxs("dt",{children:[p.jsx(gf,{size:18}),g.datasetExplorer.coverage]}),p.jsx("dd",{children:c.marketing.evidencedScope[f]})]}),p.jsxs("div",{children:[p.jsxs("dt",{children:[p.jsx(vf,{size:18}),g.datasetExplorer.resolution]}),p.jsx("dd",{children:c.marketing.evidencedGranularity[f]})]})]}),p.jsxs("div",{className:"dataset-card-actions",children:[p.jsxs("a",{className:"dataset-open",href:c.href,target:"_blank",rel:"noreferrer",children:[g.datasetExplorer.openRecord,p.jsx(Yl,{size:19,weight:"bold"}),p.jsxs("span",{className:"visually-hidden",children:[" · ",g.datasetExplorer.opensNewTab]})]}),p.jsx(CitymeterP1Compact,{record:c,language:f,recordName:d})]}),p.jsxs("details",{className:"dataset-details",children:[p.jsxs("summary",{className:"source-summary",children:[p.jsx("span",{className:"source-status-dot","aria-hidden":"true"}),p.jsx("span",{className:"source-summary-copy",children:H})]}),p.jsx(CitymeterP1ContributorsDetail,{record:c,language:f,recordName:d}),p.jsxs("div",{children:[p.jsx("strong",{children:g.datasetExplorer.limitation}),p.jsx("p",{children:c.marketing.limitation[f]})]}),p.jsx(CitymeterSourceReview,{recordId:h,language:f})]})]})]})}'
  ].join("");
  migrated = replaceSpan(
    migrated,
    "function G6",
    "function CatalogStructureDiagram",
    sourceReviewRuntime,
    "hydrated source-review parity"
  );
  if (!migrated.includes('O==="dark"?"#11191D":"#F6F7F3"')) {
    throw new Error("hydrated theme-color projection was not created");
  }
  if (checkOnly) {
    const current = fs.readFileSync(bundleV18, "utf8");
    if (current !== migrated) throw new Error("hydrated bundle differs from the deterministic migration");
    return;
  }
  fs.writeFileSync(bundleV18, migrated);
}

function buildEnhancer() {
  let migrated = fs.readFileSync(enhancerV25, "utf8");
  migrated = replaceEvery(migrated, "ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี", "ผักไห่ · บริบทน้ำท่วมหลายปี", "enhancer Thai flood-period fallback label");
  migrated = replaceEvery(migrated, "เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ พร้อมเทียบกราฟย้อนหลัง 14 ปี", "เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ โดยตรวจช่วงปีจากแหล่งข้อมูลก่อนใช้", "enhancer Thai flood-period fallback copy");
  migrated = replaceEvery(migrated, "Phak Hai · 14-year flood history", "Phak Hai · multi-year flood context", "enhancer English flood-period fallback label");
  migrated = replaceEvery(migrated, "See annual flood extent and recurrence in Phak Hai with a 14-year comparison chart", "See annual flood extent and recurrence in Phak Hai, checking the source period before use", "enhancer English flood-period fallback copy");
  migrated = replaceEvery(migrated, "24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน", "สัญญาณน้ำท่วมฉับพลัน · ต้องยืนยันช่วงคาดการณ์", "enhancer Thai forecast-horizon fallback label");
  migrated = replaceEvery(migrated, "เห็นระดับความเสี่ยง 24 ชั่วโมงบนแผนที่ประเทศไทย พร้อมอันดับจังหวัดและเวลาออกรัน", "ใช้รายการนี้เพื่อระบุพื้นที่ ช่วงคาดการณ์ และเวลาออกรันที่ต้องตรวจจากแหล่งทางการ", "enhancer Thai forecast-horizon fallback copy");
  migrated = replaceEvery(migrated, "24-hour flash-flood risk by province", "Flash-flood signal · forecast horizon unverified", "enhancer English forecast-horizon fallback label");
  migrated = replaceEvery(migrated, "See 24-hour risk levels across Thailand with province ranking and forecast run time", "Use this record to identify the area, forecast horizon and run time to verify at the named provider source", "enhancer English forecast-horizon fallback copy");
  migrated = replaceRequired(
    migrated,
    [
      '      if (record.status === "verified-lineage") {',
      '        const logo = document.createElement("img");',
      '        logo.className = "gd-lineage-logo";',
      '        logo.src = `${assetBase}media/gdcatalog-logo.png`;',
      '        logo.alt = "Government Data Catalog Smart Plus";',
      '        logo.width = 240;',
      '        logo.height = 304;',
      '        logo.loading = "lazy";',
      '        logo.decoding = "async";',
      '        summary.append(logo);',
      '      } else {',
      '        summary.append(element("span", "source-status-dot"));',
      '      }'
    ].join("\n"),
    '      summary.append(element("span", "source-status-dot"));',
    "enhancer unapproved GD identity removal"
  );
  migrated = replaceOne(
    migrated,
    "    card.dataset.sourceStatus = record.status;",
    "    card.dataset.sourceStatus = record.status;\n    card.dataset.claimId = `claim.citymeter.catalog.${record.id}.v1`;",
    "enhancer claim identity binding"
  );
  migrated = replaceSpan(
    migrated,
    "    const visualFocus = text.visualFocus[card.id];",
    "    if (!record || card.dataset.sourceReviewVersion",
    "",
    "enhancer visual-copy mutation removal"
  );
  if (count(migrated, "2026-08-14-r4") !== 2) {
    throw new Error(`enhancer source-review version: expected two source matches; found ${count(migrated, "2026-08-14-r4")}`);
  }
  migrated = migrated.replaceAll("2026-08-14-r4", "2026-09-04-r5");
  const supporterStart = '  const supporterAssets = [';
  const supporterEnd = '  function enhanceHero() {';
  const start = migrated.indexOf(supporterStart);
  const end = migrated.indexOf(supporterEnd, start);
  if (start < 0 || end < start) throw new Error("enhancer supporter helper boundary is invalid");
  migrated = `${migrated.slice(0, start)}${migrated.slice(end)}`;
  migrated = replaceOne(
    migrated,
    [
      '    if (heroCopy) {',
      '      heroCopy.querySelector(".supporter-lockup-hero")?.remove();',
      '      let supporter = heroCopy.querySelector(".supporter-logos-hero");',
      '      if (!supporter) supporter = createSupporterLogos("hero");',
      '      const actions = heroCopy.querySelector(".hero-actions");',
      '      if (actions && actions.nextElementSibling !== supporter) actions.after(supporter);',
      '    }'
    ].join("\n"),
    [
      '    if (heroCopy) {',
      '      heroCopy.querySelector(".supporter-lockup-hero")?.remove();',
      '      heroCopy.querySelector(".supporter-logos-hero")?.remove();',
      '    }'
    ].join("\n"),
    "enhancer supporter insertion removal"
  );
  migrated = replaceRequired(
    migrated,
    [
      "  function loadSourceRegistry() {",
      "    if (!registryPromise) {",
      "      registryPromise = Promise.all([",
      '        fetch(assetBase + "data/catalog-source-review.json?v=20260816-motion-image-performance-v23", { cache: "force-cache" }).then(async (response) => {',
      '          if (!response.ok) throw new Error("Source registry returned " + response.status);',
      "          return response.json();",
      "        }),",
      '        fetch(assetBase + "data/citymeter-contributors-p1-c1d0f5a7c057.json", { cache: "force-cache" }).then(async (response) => {',
      '          if (!response.ok) throw new Error("Contributor registry returned " + response.status);',
      "          return response.json();",
      "        })",
      "      ]).then(([registry, contributors]) => ({ registry, contributors })).catch((error) => ({ error }));",
      "    }",
      "    return registryPromise;",
      "  }"
    ].join("\n"),
    [
      "  function readInlineRegistry(id) {",
      "    const node = document.getElementById(id);",
      "    if (!node) return null;",
      "    try {",
      '      return JSON.parse(node.textContent || "");',
      "    } catch (error) {",
      '      console.error("CityMETER inline registry is invalid: " + id, error);',
      "      return null;",
      "    }",
      "  }",
      "",
      "  function loadRegistryDocument(id, url, label) {",
      "    const inline = readInlineRegistry(id);",
      "    if (inline) return Promise.resolve(inline);",
      '    return fetch(url, { cache: "force-cache" }).then(async (response) => {',
      '      if (!response.ok) throw new Error(label + " returned " + response.status);',
      "      return response.json();",
      "    });",
      "  }",
      "",
      "  function loadSourceRegistry() {",
      "    if (!registryPromise) {",
      "      registryPromise = Promise.all([",
      '        loadRegistryDocument("citymeter-source-review-data", assetBase + "data/catalog-source-review.json?v=20260904-ds091-v26", "Source registry"),',
      '        loadRegistryDocument("citymeter-contributor-data", assetBase + "data/citymeter-contributors-p1-c1d0f5a7c057.json", "Contributor registry")',
      "      ]).then(([registry, contributors]) => ({ registry, contributors })).catch((error) => ({ error }));",
      "    }",
      "    return registryPromise;",
      "  }"
    ].join("\n"),
    "enhancer embedded-registry fail-open loader"
  );
  if (checkOnly) {
    const current = fs.readFileSync(enhancerV26, "utf8");
    if (current !== migrated) throw new Error("catalog enhancer differs from the deterministic migration");
    return;
  }
  fs.writeFileSync(enhancerV26, migrated);
}

function migratePage(relativePath, prefix, language) {
  const filePath = path.join(root, relativePath);
  let html = fs.readFileSync(filePath, "utf8");

  html = replaceOne(
    html,
    `lang="${language}" data-ds="landometer" data-ds-version="0.9.0" data-ds-profile="campaign.public"`,
    `lang="${language}" data-ds="landometer" data-ds-version="0.9.1" data-ds-profile="product_orientation" data-ds-format="web_public"`,
    `${relativePath} release identity`
  );
  html = replaceOneVariant(
    html,
    [
      'data-delivery-mode="internal-preview" data-evidence-status="unresolved-product-authority" data-visibility="internal" data-indexable="false"',
      'data-delivery-mode="internal-preview" data-evidence-status="source_limited" data-visibility="internal" data-indexable="false"'
    ],
    'data-delivery-mode="static-initial-html" data-evidence-status="source_limited" data-visibility="public" data-indexable="true"',
    `${relativePath} public evidence boundary`
  );
  html = replaceOneVariant(
    html,
    [
      '<meta name="robots" content="noindex, nofollow" />'
    ],
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    `${relativePath} public robots policy`
  );
  html = replaceOne(html, '<meta name="theme-color" content="#176b82" />', '<meta name="theme-color" content="#F6F7F3" />', `${relativePath} initial theme color`);
  html = replaceOne(html, '<meta name="landometer:ds-version" content="0.9.0" />', '<meta name="landometer:ds-version" content="0.9.1" />', `${relativePath} DS version meta`);
  html = replaceOneVariant(html, ['<meta name="landometer:artifact-build" content="ui-20260830-09" />', '<meta name="landometer:artifact-build" content="ui-20260904-ds091-motif-internal-v1" />', '<meta name="landometer:artifact-build" content="ui-20260905-ds091-motif-public-v1" />'], '<meta name="landometer:artifact-build" content="ui-20260905-ds091-motif-public-v2" />', `${relativePath} build meta`);
  html = replaceOneVariant(html, ['<meta name="landometer:release-receipt" content="2026-08-30-citymeter-unified-nav-r7-v31" />', '<meta name="landometer:release-receipt" content="2026-09-04-citymeter-ds091-motif-internal-v1" />', '<meta name="landometer:release-receipt" content="2026-09-05-citymeter-ds091-motif-public-v1" />'], '<meta name="landometer:release-receipt" content="2026-09-05-citymeter-ds091-motif-public-v2" />', `${relativePath} release receipt meta`);
  html = replaceOneVariant(
    html,
    [
      '<meta name="citymeter:release-receipt" content="2026-08-27-landom-thumbnail-sync-v29" />',
      '<meta name="citymeter:release-receipt" content="2026-08-30-citymeter-unified-nav-r7-v31" />',
      '<meta name="citymeter:release-receipt" content="2026-09-04-citymeter-ds091-motif-internal-v1" />',
      '<meta name="citymeter:release-receipt" content="2026-09-05-citymeter-ds091-motif-public-v1" />'
    ],
    '<meta name="citymeter:release-receipt" content="2026-09-05-citymeter-ds091-motif-public-v2" />',
    `${relativePath} CityMETER release receipt meta`
  );
  html = replaceOne(html, `${prefix}assets/index-qbT50gkr-v17.js`, `${prefix}assets/index-qbT50gkr-v18.js`, `${relativePath} hydrated bundle`);
  html = replaceOneVariant(
    html,
    [
      '"name":"CityMETER public data views and modules","numberOfItems":36,"dataset":',
      '"name":"CityMETER public data views and modules","numberOfItems":38,"dataset":'
    ],
    '"name":"CityMETER public data views and modules","dataset":',
    `${relativePath} structured-data schema boundary`
  );
  const contributorManifestMeta = `    <meta name="citymeter:contributor-release-manifest" content="data/citymeter-contributor-release-p1-7712069325b3.json" />`;
  const inlineSourceReviewScript = `    <script type="application/json" id="citymeter-source-review-data">${inlineCatalogReview}</script>`;
  html = html.replaceAll("to verify at an official source", "to verify at the named provider source");
  html = html.replaceAll("update time at the official source", "update time at the named provider source");
  html = setInlineJsonAfter(
    html,
    contributorManifestMeta,
    inlineSourceReviewScript,
    "citymeter-source-review-data",
    `${relativePath} embedded source registry`
  );

  if (language === "th") {
    html = replaceOne(html, "สำรวจอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยงจากข้อมูลจริง แล้วเปิดดูพื้นที่ที่สนใจได้ทันที", "สำรวจตัวอย่างอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยง พร้อมดูขอบเขตและสิ่งที่ยังต้องตรวจ ก่อนเปิดพื้นที่ที่สนใจ", `${relativePath} hero evidence boundary`);
    html = replaceOne(html, "แสดงเฉพาะหน่วยที่ยืนยันได้ในแต่ละรายการ", "แต่ละรายการบอกระดับพื้นที่ที่รองรับได้ หรือสิ่งที่ยังต้องตรวจ", `${relativePath} spatial proof boundary`);
    html = replaceOne(html, "เข้าใจเมืองผ่าน 3 มุมที่เชื่อมกัน", "เข้าใจเมืองผ่าน 3 มิติ แล้วไปสู่การตัดสินใจ", `${relativePath} architecture title`);
    html = replaceOne(html, "Land คือฐานของเมือง Living คือผู้คน บริการ และความเป็นอยู่ เมื่อนำมาดูร่วมกันจึงเห็นว่าแต่ละ Location ต่างกันอย่างไร—และบางเรื่องเปลี่ยนไปตามเวลา", "Land, Location และ Living เป็นบริบทคนละมิติที่ CityMETER นำมาเชื่อมกัน เพื่อให้เห็นสิ่งที่ควรตรวจ เปรียบเทียบ และตัดสินใจต่อในพื้นที่จริง", `${relativePath} architecture explanation`);
    html = replaceOne(html, "รวม 38 มุมมองให้ค้น เทียบ และเปิดดูหลักฐานในที่เดียว", "เชื่อม 38 มุมมองให้ค้น เทียบ และเห็นทั้งสิ่งที่รู้กับสิ่งที่ยังต้องตรวจ", `${relativePath} catalogue evidence boundary`);
    html = replaceOne(html, "ช่วยให้เห็นว่าควรตรวจอะไรต่อ และตัดสินใจเรื่องพื้นที่ได้อย่างไร", "เปลี่ยนบริบทเชิงพื้นที่ให้เป็นสิ่งที่ควรตรวจ เทียบ และทำต่อ", `${relativePath} outcome copy`);
  } else {
    html = replaceOne(html, "Explore buildings, prices, businesses, people, access and risk through real data, then open the place you need.", "Explore examples across buildings, prices, businesses, people, access and risk, with each record’s scope and checks to make before you open a place.", `${relativePath} hero evidence boundary`);
    html = replaceOne(html, "Only evidenced units are shown for each record", "Each record states the spatial level it supports or what still needs checking", `${relativePath} spatial proof boundary`);
    html = replaceOne(html, "One city, seen through three connected lenses", "Three dimensions of a place, connected to a decision", `${relativePath} architecture title`);
    html = replaceOne(html, "Land is the city’s base. Living is people, services and everyday life. Together they show how each Location differs—and how some patterns change over time.", "Land, Location and Living are peer dimensions that CityMETER connects so people can see what to check, compare and decide next in a real place.", `${relativePath} architecture explanation`);
    html = replaceOne(html, "Organises 38 views so people can find, compare and inspect evidence in one place.", "Connects 38 views so people can find, compare and see both what is known and what still needs checking.", `${relativePath} catalogue evidence boundary`);
    html = replaceOne(html, "Shows what to check next and how to move a place decision forward.", "Turns spatial context into what to check, compare and do next.", `${relativePath} outcome copy`);
  }
  html = replaceEvery(html, "Tell the 50,000-branch network story through headquarters, sectors, and newly registered branches", "Explore a sample headquarters–branch network, sectors, and newly registered branches, checking the dataset size in the details before use", `${relativePath} English business sample boundary`);
  html = replaceEvery(html, "Field coverage differs: GFA and GLA are about 70%, while tenant count is about 95.6% in the audited records", "Coverage differs across GFA, GLA and tenant fields; check record completeness before comparison", `${relativePath} English retail coverage boundary`);
  html = replaceEvery(html, "Use the 14-year timeline, recurrence count, and worst year as the historical risk baseline", "Use the multi-year timeline, recurrence count, and worst year as historical flood context, checking the source period before use", `${relativePath} English flood-period boundary`);
  if (language === "th") {
    html = replaceEvery(html, "แสดงพื้นที่ที่ตรวจพบพร้อมวันที่สังเกตการณ์ให้เด่นกว่าคำว่า ‘ล่าสุด’", "ใช้ภาพขอบเขตเป็น snapshot เบื้องต้น โดยตรวจ observation date จากแหล่งข้อมูลก่อนและไม่ใช้แทนสถานการณ์สด", `${relativePath} Thai observed-flood boundary`);
    html = replaceEvery(html, "ข้อมูลที่ตรวจพบล่าสุดเป็นภาพตามวันที่ระบุ ไม่ใช่สถานการณ์สด", "หน้านี้ยังไม่ยืนยัน observation date หรือ vintage; พื้นที่ไม่มีสีไม่ได้แปลว่าปลอดภัย", `${relativePath} Thai observed-flood limitation`);
    html = replaceEvery(html, "ใช้พื้นที่น้ำท่วม ความลึกสูงสุด–เฉลี่ย และเวลาออกรัน เพื่อช่วยจัดลำดับการติดตาม", "ใช้รายการนี้ระบุคำถามเรื่องพื้นที่ ความลึก วิธี และเวลาออกรันที่ต้องตรวจจากหน่วยงานก่อนเฝ้าระวัง", `${relativePath} Thai forecast-depth boundary`);
    html = replaceEvery(html, "ผลโมเดลไม่ใช่คำยืนยันเหตุการณ์ และต้องแสดงเวลาออกรัน แหล่งข้อมูล วิธี และข้อจำกัด", "exact package, เวลาออกรัน วิธี และโมเดลยังไม่ยืนยัน จึงห้ามใช้เป็นคำยืนยันหรือคำแนะนำฉุกเฉิน", `${relativePath} Thai forecast-depth limitation`);
    html = replaceEvery(html, "ใช้ระดับความเสี่ยง 24 ชั่วโมง อันดับจังหวัด และเวลาออกรันเป็นภาพเฝ้าระวัง", "ใช้รายการนี้ระบุพื้นที่ ช่วงคาดการณ์ และเวลาออกรันที่ต้องตรวจจากแหล่งทางการก่อนเฝ้าระวัง", `${relativePath} Thai flash-flood boundary`);
    html = replaceEvery(html, "เป็นสัญญาณจากโมเดล ไม่ใช่คำยืนยันว่าจะเกิดเหตุ และต้องคงป้ายสถานะการทดลองไว้", "exact feed, ช่วงคาดการณ์และเวลาออกรันยังไม่ยืนยัน จึงไม่ใช่คำเตือนทางการหรือคำแนะนำเดินทาง", `${relativePath} Thai flash-flood limitation`);
    html = replaceEvery(html, "สัญญาณความเสี่ยง 24 ชั่วโมง", "ช่วงคาดการณ์และเวลาออกรัน · ต้องยืนยัน", `${relativePath} Thai flash-flood focus boundary`);
    html = replaceEvery(html, "ใช้ตำแหน่งสถานี ค่า MMI ความเร่ง และเวลาอัปเดตสร้างภาพเครือข่ายตรวจวัด", "ใช้รายการนี้ระบุสถานี ตัวชี้วัดแรงสั่นสะเทือน และเวลาข้อมูลที่ต้องตรวจจากแหล่งทางการ", `${relativePath} Thai earthquake boundary`);
    html = replaceEvery(html, "ต้องแสดงความใหม่ของข้อมูล; วันที่อัปเดตที่พบในการตรวจคือ 10 มีนาคม 2569", "หน้านี้ยังไม่มี freshness record ปัจจุบัน ต้องตรวจสถานี ตัวชี้วัด และเวลาอัปเดตจากแหล่งทางการ", `${relativePath} Thai earthquake limitation`);
  } else {
    html = replaceEvery(html, "Make the observation date more prominent than the word ‘latest’ when showing detected flood areas", "Use the extent only as a provisional snapshot after verifying its observation date at the source", `${relativePath} English observed-flood boundary`);
    html = replaceEvery(html, "The latest observed layer is a dated snapshot, not present conditions", "This page does not yet verify the layer’s observation date or vintage; uncoloured areas are not automatically safe", `${relativePath} English observed-flood limitation`);
    html = replaceEvery(html, "Use flooded area, maximum and average depth, and run time to prioritise follow-up", "Use this record to identify the area, depth, method and run-time questions to verify before monitoring", `${relativePath} English forecast-depth boundary`);
    html = replaceEvery(html, "Model output is not confirmation of an event; show run time, source, method, and limitations", "The exact package, run time, method and model remain unverified; do not treat this as confirmation or emergency advice", `${relativePath} English forecast-depth limitation`);
    html = replaceEvery(html, "Use the 24-hour risk levels, province ranking, and run time as a monitoring story", "Use this record to identify the area, forecast horizon and run time to verify at the named provider source", `${relativePath} English flash-flood boundary`);
    html = html.replaceAll("this is not an official alert or travel advice", "this is not a verified alert or travel advice");
    html = replaceEvery(html, "This is a model signal, not confirmation that an event will occur; retain the experimental status", "The exact feed, forecast horizon and run time remain unverified; this is not a verified alert or travel advice", `${relativePath} English flash-flood limitation`);
    html = replaceEvery(html, "24-hour risk signal", "Forecast horizon and run time · verify", `${relativePath} English flash-flood focus boundary`);
    html = replaceEvery(html, "Use station locations, MMI, acceleration, and update time to explain the sensing network", "Use this record to identify the station, shaking measures and timestamp to verify at the named provider source", `${relativePath} English earthquake boundary`);
    html = replaceEvery(html, "Freshness must remain visible; the inspected page showed an update date of 10 March 2026", "This page has no current freshness record; verify the station, measures and update time at the named provider source", `${relativePath} English earthquake limitation`);
  }
  if (language === "th") {
    html = replaceEvery(html, "เล่าโครงข่าย 50,000 สาขา พร้อมสำนักงานใหญ่ หมวดธุรกิจ และสาขาจดทะเบียนใหม่", "สำรวจตัวอย่างโครงข่ายสำนักงานใหญ่–สาขา หมวดธุรกิจ และสาขาจดทะเบียนใหม่ โดยตรวจขนาดชุดข้อมูลในรายละเอียดก่อนใช้", `${relativePath} Thai business sample boundary`);
    html = replaceEvery(html, "ความครบของแต่ละฟิลด์ไม่เท่ากัน: GFA และ GLA ราว 70% ส่วนจำนวนผู้เช่าราว 95.6% ของระเบียนที่ตรวจ", "ความครบของฟิลด์ GFA, GLA และจำนวนผู้เช่าไม่เท่ากัน ต้องตรวจ coverage ของระเบียนก่อนเปรียบเทียบ", `${relativePath} Thai retail coverage boundary`);
    html = replaceEvery(html, "ใช้เส้นเวลา 14 ปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นภาพตั้งต้นของความเสี่ยงย้อนหลัง", "ใช้เส้นเวลาหลายปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นบริบทน้ำท่วมย้อนหลัง โดยตรวจช่วงปีจากแหล่งข้อมูลก่อนใช้", `${relativePath} Thai flood-period boundary`);
    html = replaceEvery(html, "14 ปี · การเกิดซ้ำ · ปีหนักสุด", "หลายปี · การเกิดซ้ำ · ปีหนักสุด", `${relativePath} Thai flood focus boundary`);
  } else {
    html = replaceEvery(html, "14 years · recurrence · worst year", "Multi-year · recurrence · worst year", `${relativePath} English flood focus boundary`);
  }
  html = rewriteStaticCatalogFlow(html, language, relativePath);
  html = replaceOne(html, '<span class="catalog-structure-outcome-route"><strong lang="en">Landometer</strong>', '<span class="catalog-structure-outcome-route"><strong lang="en">CityMETER</strong>', `${relativePath} outcome product`);
  html = addStaticSourceReviews(html, relativePath, language);
  html = ensureStaticSupporterLogos(html, relativePath, prefix, language);
  html = replaceStaticSocialIcons(html, relativePath);

  const oldEnhancement = `    <link rel="stylesheet" href="${prefix}assets/catalog-enhancements-v25.css">`;
  const previousEnhancement = [
    `    <link rel="stylesheet" href="${prefix}assets/landometer-ds/v0.9.1/color-srgb-05.production.css">`,
    `    <link rel="stylesheet" href="${prefix}assets/landometer-motifs/v1/landometer-motifs.css">`,
    `    <link rel="stylesheet" href="${prefix}assets/catalog-enhancements-ds-0.9.1-v26.css">`
  ].join("\n");
  const newEnhancement = [
    `    <link rel="stylesheet" href="${prefix}assets/landometer-ds/v0.9.1/color-srgb-05.production.css">`,
    `    <link rel="stylesheet" href="${prefix}assets/landometer-motifs/v1/landometer-motifs.css">`,
    `    <link rel="stylesheet" href="${prefix}assets/catalog-enhancements-ds-0.9.1-v27.css">`
  ].join("\n");
  html = replaceOneVariant(html, [oldEnhancement, previousEnhancement], newEnhancement, `${relativePath} DS styles`);
  html = replaceOne(html, `${prefix}assets/unified-navbar-r7-v30.css`, `${prefix}assets/unified-navbar-r7-ds-0.9.1-v32.css`, `${relativePath} navbar styles`);

  const oldScripts = [
    `    <script defer src="${prefix}assets/unified-navbar-r7-v31.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script>`,
    `    <script defer src="${prefix}assets/catalog-enhancements-v25.js"></script>`
  ].join("\n");
  const previousScripts = [
    `    <script defer src="${prefix}assets/landometer-motifs/v1/landometer-motifs.js"></script>`,
    `    <script defer src="${prefix}assets/unified-navbar-r7-v31.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script>`,
    `    <script defer src="${prefix}assets/catalog-enhancements-ds-0.9.1-v26.js"></script>`,
    `    <script defer src="${prefix}assets/citymeter-ds-0.9.1-motif-placement-v1.js"></script>`
  ].join("\n");
  const newScripts = [
    `    <script defer src="${prefix}assets/landometer-motifs/v1/landometer-motifs.js"></script>`,
    `    <script defer src="${prefix}assets/unified-navbar-r7-v31.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script>`,
    `    <script defer src="${prefix}assets/catalog-enhancements-ds-0.9.1-v26.js"></script>`,
    `    <script defer src="${prefix}assets/citymeter-ds-0.9.1-motif-placement-v2.js"></script>`
  ].join("\n");
  html = replaceOneVariant(html, [oldScripts, previousScripts], newScripts, `${relativePath} DS scripts`);
  html = normalizeAdjacentDuplicateLine(
    html,
    `    <script defer src="${prefix}assets/landometer-motifs/v1/landometer-motifs.js"></script>`,
    `${relativePath} motif runtime uniqueness`
  );
  html = normalizeAdjacentDuplicateLine(
    html,
    `    <script defer src="${prefix}assets/citymeter-ds-0.9.1-motif-placement-v2.js"></script>`,
    `${relativePath} motif placement uniqueness`
  );

  if (checkOnly) {
    const current = fs.readFileSync(filePath, "utf8");
    if (current !== html) throw new Error(`${relativePath} differs from the deterministic migration`);
    return;
  }
  fs.writeFileSync(filePath, html);
}

buildHydratedBundle();
buildEnhancer();
migratePage("index.html", "./", "th");
migratePage("en/index.html", "../", "en");

console.log(checkOnly
  ? "CityMETER DS 0.9.1 public-release migration check passed."
  : "Prepared the CityMETER DS 0.9.1 public release candidate.");
