import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
const qrManifest = JSON.parse(readFileSync(join(root, "media/qr/manifest.json"), "utf8"));
const ids = review.records.map((record) => record.id);
const routeById = new Map(review.records.map((record) => [record.id, record.citymeterUrl]));
const muenRaiRoute = "https://landometer.com/v3/citymeter/PRE?d=muenRai";
const oldMuenRaiRoute = "https://landometer.com/v3/citymeter?d=muenRai";
const focusedRoutes = {
  "dataset-buildings": "https://landometer.com/v3/citymeter-3d/BKK/L/8b60964e-0c26-408e-95f6-e3f46fe37d46?d=building",
  "dataset-land-appraisal": "https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed",
  "dataset-apartment-rent": "https://landometer.com/v3/citymeter/BKK?d=apartment",
  "dataset-condo-listing-prices": "https://landometer.com/v3/citymeter/BKK?d=condoOffer",
  "dataset-townhouse-listing-prices": "https://landometer.com/v3/citymeter/BKK?d=townhouse",
  "dataset-condo-rent-yield": "https://landometer.com/v3/citymeter/BKK?d=rentWise",
  "dataset-registered-companies-status-capital": "https://landometer.com/v3/citymeter/BKK?d=company",
  "dataset-restaurants": "https://landometer.com/v3/citymeter/BKK?d=restaurant",
  "dataset-road-network-archetypes": "https://landometer.com/v3/citymeter/BKK?d=roadDna",
  "dataset-flood-recurrent": "https://landometer.com/v3/citymeter/AYA/D/1408?d=floodimpact",
  "dataset-flood-forecast-depth": "https://landometer.com/v3/citymeter/BKK?d=flood-forecast-depth",
  "dataset-events-hat-yai-flood-2025-11": "https://landometer.com/v3/citymeter/SKA/D/9011?d=hatyaiflood",
  "dataset-events-quake-building-inspection": "https://landometer.com/v3/citymeter/BKK?d=quakeSafe"
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function pngInfo(path) {
  const bytes = readFileSync(path);
  assert(bytes.subarray(1, 4).toString("ascii") === "PNG", `Not a PNG: ${path}`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25]
  };
}

const supporterAssets = [
  {
    path: "media/supporters/depa.png",
    width: 2160,
    height: 1350,
    sha256: "6098165e3424c8f7b4c15e26200e88f561ab0a841b8a60125b1735d1260532cd"
  },
  {
    path: "media/supporters/dsure-software.png",
    width: 1014,
    height: 1465,
    sha256: "d60db2a3f73abf7a5b815307027c0cf25d6c01ed3134648c094217446bc85143"
  },
  {
    path: "media/supporters/digital-service-account.png",
    width: 2298,
    height: 1042,
    sha256: "57c01b122575800f475cc29e958f6b1c5a7bac705cb5b6ba2365ae9bd90e3086"
  }
];

assert(review.reviewedAt === "2026-08-14", "Unexpected review date");
assert(ids.length === 38 && new Set(ids).size === 38, "Source registry must contain 38 unique records");
const thaiBenefits = review.records.map((record) => record.benefitTh?.trim());
const englishBenefits = review.records.map((record) => record.benefitEn?.trim());
assert(
  thaiBenefits.every((benefit) => typeof benefit === "string" && benefit.length > 24),
  "All 38 source-review records need a concrete Thai reader benefit"
);
assert(
  englishBenefits.every((benefit) => typeof benefit === "string" && benefit.length > 24),
  "All 38 source-review records need a concrete English reader benefit"
);
assert(new Set(thaiBenefits).size === 38, "Thai reader benefits must be specific rather than repeated placeholders");
assert(new Set(englishBenefits).size === 38, "English reader benefits must be specific rather than repeated placeholders");
assert(review.records.filter((record) => record.status === "verified-lineage").length === 11, "Expected 11 verified-lineage records");
assert(review.records.filter((record) => record.conceptualPreview).length === 3, "Expected three labelled conceptual previews");
assert(review.records.every((record) => typeof record.citymeterUrl === "string" && record.citymeterUrl.startsWith("https://landometer.com/v3/citymeter")), "All 38 records must have a canonical CityMETER URL");
assert(
  review.records.find((record) => record.id === "dataset-crop-area-output")?.citymeterUrl === muenRaiRoute,
  "Muen Rai registry record must use the direct Phrae route"
);
for (const [id, url] of Object.entries(focusedRoutes)) {
  assert(routeById.get(id) === url, `Focused route is stale for ${id}`);
}

for (const page of ["index.html", "en/index.html"]) {
  const html = readFileSync(join(root, page), "utf8");
  assert((html.match(/class="dataset-card"/g) || []).length === 38, `${page} must prerender 38 cards`);
  assert(html.includes("catalog-enhancements.css") && html.includes("catalog-enhancements.js"), `${page} is missing the enhancement layer`);
  assert(html.includes("catalog-enhancements.css?v=11"), `${page} must load the contained fixed-diameter circle logo and muted section-surface stylesheet revision`);
  assert(html.includes("catalog-enhancements.js?v=14"), `${page} must load the observer-stable benefit-first r4 enhancement layer`);
  assert(html.includes("index-qbT50gkr-v3.js?v=3"), `${page} must load the CityMETER headline bundle revision`);
  assert(html.includes('name="citymeter:catalog-version" content="2026-08-14"'), `${page} has a stale catalog version`);
  assert(html.includes('name="citymeter:release-receipt" content="2026-08-14-benefit-first-circles-surfaces"'), `${page} is missing the final release receipt`);
  assert(html.includes("media/social/citymeter-share-2026-08-14.jpg"), `${page} must use the dedicated social card`);
  assert(html.includes('property="og:image:width" content="1200"'), `${page} is missing the OG image width`);
  assert(html.includes('property="og:image:height" content="630"'), `${page} is missing the OG image height`);
  assert(html.includes('name="twitter:card" content="summary_large_image"'), `${page} is missing the Twitter card`);
  assert(!html.includes('rel="preload" as="image" href="./media/previews-v2/') && !html.includes('rel="preload" as="image" href="../media/previews-v2/'), `${page} must not preload the full preview catalog`);
  assert(html.includes('<h1 id="page-title">CityMETER</h1>'), `${page} must use CityMETER as the hero headline`);
  assert(!html.includes("ก่อนตัดสินใจเรื่องพื้นที่") && !html.includes("Before you decide on a place"), `${page} still contains the retired hero headline`);

  for (const record of review.records) {
    const start = html.indexOf(`<article class="dataset-card" id="${record.id}"`);
    const end = html.indexOf("</article>", start) + "</article>".length;
    assert(start >= 0 && end >= "</article>".length, `${page} is missing ${record.id}`);
    const card = html.slice(start, end);
    const links = Array.from(card.matchAll(/<a class="dataset-(?:image|open)" href="([^"]+)"/g), (match) => match[1].replaceAll("&amp;", "&"));
    assert(links.length === 2 && links.every((href) => href === record.citymeterUrl), `${page} card links do not match the registry for ${record.id}`);
  }
  for (const route of Object.values(focusedRoutes)) {
    const datasetKey = new URL(route).searchParams.get("d");
    assert(!html.includes(`https://landometer.com/v3/citymeter?d=${datasetKey}`), `${page} still contains a generic route for focused dataset ${datasetKey}`);
  }

  const jsonLdText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || "";
  const jsonLd = JSON.parse(jsonLdText);
  const catalog = jsonLd["@graph"]?.find((entry) => entry["@type"] === "DataCatalog");
  assert(catalog?.dataset?.length === 38, `${page} JSON-LD must expose 38 datasets`);
  for (const dataset of catalog.dataset) {
    const id = dataset["@id"]?.split("#").at(-1);
    assert(dataset.subjectOf?.url === routeById.get(id), `${page} JSON-LD route does not match the registry for ${id}`);
  }
  assert(!html.includes(oldMuenRaiRoute), `${page} still contains the generic Muen Rai route`);
}

assert(readFileSync(join(root, "en/index.html"), "utf8").includes('property="og:locale:alternate" content="th_TH"'), "English alternate locale must be th_TH");

for (const language of ["th", "en"]) {
  const qr = join(root, "media/qr", `citymeter-page-${language}.png`);
  assert(existsSync(qr) && statSync(qr).size > 1000, `Missing or empty page QR: ${language}`);
  const manifestEntry = qrManifest.pages.find((entry) => entry.language === language);
  assert(manifestEntry?.sha256 === sha256(qr), `Page QR manifest is stale for ${language}`);
}

assert(
  sha256(join(root, "media/qr/crop-area-output.png")) === "6d7b4ba9bcd42f130ccb6f6c6571dab888e476de376bb1e843ad9611ac38d530",
  "Muen Rai QR must encode the direct Phrae route"
);

for (const record of review.records) {
  const slug = record.id.replace(/^dataset-/, "");
  const qr = join(root, "media/qr", `${slug}.png`);
  const preview = join(root, "media/previews-v2", `${slug}.webp`);
  assert(existsSync(qr) && statSync(qr).size > 1000, `Missing or empty QR: ${slug}`);
  const manifestEntry = qrManifest.datasets.find((entry) => entry.id === record.id);
  assert(manifestEntry?.url === record.citymeterUrl, `QR manifest route is stale for ${record.id}`);
  assert(manifestEntry?.file === `media/qr/${slug}.png`, `QR manifest path is stale for ${record.id}`);
  assert(manifestEntry?.sha256 === sha256(qr), `QR bytes do not match the manifest for ${record.id}`);
  assert(existsSync(preview) && statSync(preview).size > 10000, `Missing or empty preview: ${slug}`);
}
assert(qrManifest.version === "2026-08-14" && qrManifest.datasets.length === 38 && qrManifest.pages.length === 2, "QR manifest coverage is incomplete");

for (const asset of [
  "CITYMETER_BRANDING_DEEPLINK_RELEASE_2026-08-14.md",
  "assets/catalog-enhancements.js",
  "assets/catalog-enhancements.css",
  "assets/index-qbT50gkr-v3.js",
  "scripts/apply-branding-route-release.mjs",
  "scripts/split-supporter-logos.sh",
  "scripts/build-hero-reel.sh",
  "scripts/apply-focus-copy.mjs",
  "media/gdcatalog-logo.png",
  "media/depa-dsure-tdc-lockup.png",
  "media/supporters/depa.png",
  "media/supporters/dsure-software.png",
  "media/supporters/digital-service-account.png",
  "media/qr/manifest.json",
  "media/reel/citymeter-proof-v3.mp4",
  "media/reel/citymeter-proof-v3-exhibition.mp4",
  "media/reel/citymeter-proof-v3-poster.webp",
  "media/social/citymeter-share-2026-08-14.jpg"
]) {
  assert(existsSync(join(root, asset)) && statSync(join(root, asset)).size > 0, `Missing release asset: ${asset}`);
}

const responsiveHarness = readFileSync(join(root, "mobile-qa.html"), "utf8");
for (const width of [320, 390, 430, 720, 900, 901, 1120, 1440]) {
  assert(responsiveHarness.includes(`data-width="${width}"`), `Responsive QA harness is missing ${width}px`);
}
assert(responsiveHarness.includes("box-sizing: content-box"), "Responsive iframe width must equal its content viewport");

const thHtml = readFileSync(join(root, "index.html"), "utf8");
const enHtml = readFileSync(join(root, "en/index.html"), "utf8");
const enhancementJs = readFileSync(join(root, "assets/catalog-enhancements.js"), "utf8");
const enhancementCss = readFileSync(join(root, "assets/catalog-enhancements.css"), "utf8");
const enhancementSourceLower = `${enhancementCss}\n${enhancementJs}`.toLowerCase();
for (const retiredColor of ["#9f78d8", "#d89a27", "#36b9cc"]) {
  assert(!enhancementSourceLower.includes(retiredColor), `Retired non-canonical status color remains: ${retiredColor}`);
}

function cssBlock(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = enhancementCss.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert(match, `Missing CSS rule: ${selector}`);
  return match[1];
}

function cssValue(block, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`${escapedProperty}\\s*:\\s*([^;]+);`))?.[1].trim().toLowerCase();
}

assert(enhancementJs.includes('summary: "ใช้ข้อมูลนี้ทำอะไรได้"') && enhancementJs.includes('summary: "What you can do with this data"'), "Source disclosure must lead with reader utility in both languages");
assert(enhancementJs.includes('benefit: "ข้อมูลนี้ช่วยตอบอะไร"') && enhancementJs.includes('benefit: "What this data helps you answer"'), "Reader-benefit headings must be present in both languages");
assert(enhancementJs.includes('source: "ข้อมูลมาจากไหน"') && enhancementJs.includes('source: "Where the data comes from"'), "Source labels must use plain language");
assert(enhancementJs.includes('reading: "ก่อนใช้ตัดสินใจ"') && enhancementJs.includes('reading: "Before making a decision"'), "Decision-check labels must use plain language");
for (const [key, retiredLabel] of [
  ["summary", "ที่มา ขอบเขต และรายละเอียด"],
  ["verifiedSummary", "ที่มา ขอบเขต และข้อมูลที่ยืนยันแล้ว"],
  ["verified", "ยืนยัน same-dataset lineage"],
  ["candidate", "candidate — ต้องมีหลักฐานเพิ่ม"],
  ["unproven", "ยังไม่ยืนยัน exact public lineage"],
  ["reading", "อ่านอย่างไรไม่ให้เกินหลักฐาน"],
  ["summary", "Sources, scope and details"],
  ["verifiedSummary", "Sources, scope and verified lineage"],
  ["verified", "Verified same-dataset lineage"],
  ["candidate", "Candidate — more evidence required"],
  ["unproven", "Exact public lineage not yet verified"],
  ["reading", "How to read it within the evidence"]
]) {
  assert(!enhancementJs.includes(`${key}: "${retiredLabel}"`), `Retired source-review label remains: ${retiredLabel}`);
}
assert(enhancementJs.includes('localized(record, "benefit") || localized(record, "reading")'), "Benefit-first disclosure needs a safe fallback for stale registry records");
assert(enhancementJs.includes('coverage: "เริ่มจากตัวอย่างสวนพลู') && enhancementJs.includes('coverage: "Start with the Suan Plu example'), "Focused examples must own actionable coverage copy in both languages");
const reviewStart = enhancementJs.indexOf('const review = element("div", "source-review")');
const reviewEnd = enhancementJs.indexOf('const handoff = element("div", "dataset-qr-handoff")', reviewStart);
const reviewConstruction = enhancementJs.slice(reviewStart, reviewEnd);
const benefitAppend = reviewConstruction.indexOf('review.append(benefit)');
const evidenceAppend = reviewConstruction.indexOf('if (evidence) review.append(evidence)');
const sourceAppend = reviewConstruction.indexOf('review.append(makeLabeledCopy(text.source');
const readingAppend = reviewConstruction.indexOf('review.append(makeLabeledCopy(text.reading');
assert(reviewStart >= 0 && reviewEnd > reviewStart, "Source-review construction block is missing");
assert(benefitAppend === reviewConstruction.indexOf("review.append("), "Reader benefit must be the first source-review block");
assert(benefitAppend < evidenceAppend && evidenceAppend < sourceAppend && sourceAppend < readingAppend, "Source disclosure must render benefit before scope, source and decision checks");
assert((enhancementJs.match(/2026-08-14-r4/g) || []).length >= 2 && !enhancementJs.includes("2026-08-14-r3"), "All source-review guards must use revision r4");
assert(enhancementJs.includes('details.querySelector(":scope > div:not(.source-review)")?.remove()'), "Legacy limitation-first copy must be removed after hydration");
assert(enhancementCss.includes(".source-copy-block-benefit"), "Reader-benefit copy needs a distinct quiet surface");
assert(thHtml.includes("GFA · ความสูง · จำนวนชั้น") && !thHtml.includes("สวนพลู · อาคาร 3 มิติ · GFA"), "Thai prerender must preserve the React hydration baseline");
assert(enHtml.includes("GFA · height · floors") && !enHtml.includes("Suan Plu · 3D buildings · GFA"), "English prerender must preserve the React hydration baseline");
for (const focusedCopy of [
  "สวนพลู · อาคาร 3 มิติ · GFA",
  "เมืองชลบุรี · ราคาประเมิน 3 มิติ",
  "ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี",
  "ปทุมวัน · Road DNA · รูปแบบถนน",
  "เวียงทอง · ผลผลิตรายเดือน",
  "24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน",
  "Suan Plu · 3D buildings · GFA",
  "Mueang Chonburi · 3D appraisal",
  "Phak Hai · 14-year flood history",
  "Pathum Wan · Road DNA · archetypes",
  "Wiang Thong · monthly output",
  "24-hour flash-flood risk by province"
]) {
  assert(enhancementJs.includes(focusedCopy), `Runtime focused copy is missing: ${focusedCopy}`);
}
assert(enhancementJs.includes("__CITYMETER_MOTION_DEBUG__"), "Motion debug receipt is missing");
assert(enhancementJs.includes("prefers-reduced-motion: reduce"), "Motion layer must respect reduced motion");
assert(enhancementJs.includes("duration: 280"), "Card reflow motion must use the 280ms map-state duration");
assert(enhancementJs.includes("record?.citymeterUrl"), "Runtime direct-route override is missing");
assert(enhancementJs.includes(".dataset-mobile-link"), "Runtime direct-route override must cover the mobile handoff link");
assert(enhancementJs.includes("supporter-logos-hero") && enhancementJs.includes("supporter-logos-footer"), "Runtime split supporter groups are missing");
for (const asset of supporterAssets) {
  assert(enhancementJs.includes(asset.path), `Runtime supporter asset is missing: ${asset.path}`);
}
assert(!enhancementJs.includes("media/depa-dsure-tdc-lockup.png"), "Runtime must not use the old combined supporter lockup");
assert(enhancementJs.includes('supporterAlt: {') && enhancementJs.includes('account: "บัญชีบริการดิจิทัล"') && enhancementJs.includes('account: "Digital Service Account"'), "Supporter logos need individual localized alt text");
assert(enhancementCss.includes(".site-footer .footer-grid > *") && enhancementCss.includes("flex-wrap: wrap"), "Footer grid children and links must be allowed to shrink and wrap");
assert(enhancementCss.includes("@media (max-width: 900px)") && enhancementCss.includes("grid-template-columns: 1fr"), "Footer must collapse before the former 720px overflow band");
assert(enhancementCss.includes(".supporter-logo-depa") && enhancementCss.includes(".supporter-logo-dsure") && enhancementCss.includes(".supporter-logo-account"), "Split supporter logos need independent optical sizing");
assert(enhancementCss.includes("height: calc(var(--supporter-logo-disc) * .68)"), "Tall dSURE artwork must fit inside the fixed circle without percentage-track expansion");
const supporterGroupCss = cssBlock(".supporter-logos");
const supporterCellCss = cssBlock(".supporter-logo-cell");
assert(cssValue(supporterGroupCss, "grid-template-columns") === "repeat(3, var(--supporter-logo-disc))", "Supporter logos must use three equal grid columns");
assert(cssValue(supporterCellCss, "width") === "var(--supporter-logo-disc)", "Each supporter circle must use the shared diameter token");
assert(cssValue(supporterCellCss, "height") === "var(--supporter-logo-disc)", "Each supporter circle must lock height to the shared diameter token");
assert(cssValue(supporterCellCss, "aspect-ratio") === "1", "Supporter logo plates must remain square before rounding");
assert(cssValue(supporterCellCss, "border-radius") === "50%", "Supporter logo plates must remain circular");
assert(!enhancementCss.includes(".supporter-logo-cell-account"), "Mobile layout must not move the Digital Service Account mark into a separate row");

const lightSurfaceCss = cssBlock(":root");
const darkSurfaceCss = cssBlock('[data-theme="dark"]');
const sectionSurfaces = [
  ["decision", ".decision-section", "#f6f7f3", "#11191d"],
  ["showcase", ".showcase-section", "#e2e9ed", "#18333e"],
  ["explorer", ".explorer-section", "#f2f1df", "#2c2a22"],
  ["contact", ".contact-section", "#e5e9e6", "#2b3534"],
  ["footer", ".site-footer", "#eef1ee", "#172126"]
];
for (const [name, selector, light, dark] of sectionSurfaces) {
  const token = `--section-surface-${name}`;
  assert(cssValue(lightSurfaceCss, token) === light, `Light ${name} surface token is stale`);
  assert(cssValue(darkSurfaceCss, token) === dark, `Dark ${name} surface token is stale`);
  assert(cssValue(cssBlock(selector), "background") === `var(${token})`, `${selector} must consume ${token}`);
}
const runtimeStart = enhancementJs.slice(enhancementJs.indexOf("async function start()"));
assert(runtimeStart.includes("enhanceAfterHydration") && runtimeStart.includes('window.addEventListener("load", enhanceAfterHydration'), "Branding must wait for the window load boundary");
assert((runtimeStart.match(/requestAnimationFrame/g) || []).length >= 2, "Branding must wait two animation frames after load before mutating hydrated markup");
assert(enhancementJs.includes("waitForHydrationStability") && enhancementJs.includes("minimumDelayElapsed") && enhancementJs.includes("quietWindowElapsed"), "Branding must wait for a quiet hydration boundary before DOM mutation");
assert(enhancementJs.includes("}, 1000)") && enhancementJs.includes("}, 250)") && enhancementJs.includes("setTimeout(finish, 3000)"), "Hydration stability timing contract is stale");
assert(runtimeStart.includes("registryResult") && runtimeStart.includes(".catch((error) => ({ error }))"), "Branding must remain available when the source registry fails");
assert(thHtml.includes("ดูต่อบนมือถือ"), "Thai page is missing the permanent handoff eyebrow");
assert(thHtml.includes("เก็บตัวอย่างนี้ไว้ใช้ เมื่อต้องตัดสินใจเรื่องพื้นที่"), "Thai page is missing the permanent handoff title");
assert(thHtml.includes("สแกน QR เพื่อเปิดบนมือถือ เก็บลิงก์ไว้ดูเอง หรือส่งให้เพื่อนที่กำลังเลือกบ้าน ทำเลธุรกิจ หรือพื้นที่ลงทุน"), "Thai page is missing the permanent handoff support copy");
assert(thHtml.includes("เก็บลิงก์หรือส่งให้เพื่อน"), "Thai page is missing the permanent handoff share CTA");
assert(thHtml.includes("ลิงก์จะเปิดตัวอย่างและข้อมูลชุดเดียวกัน"), "Thai page is missing the permanent handoff note");
assert(enHtml.includes("Continue on your phone"), "English page is missing the permanent handoff eyebrow");
assert(enHtml.includes("Keep this example handy for a place decision"), "English page is missing the permanent handoff title");
assert(enHtml.includes("Scan to open it on your phone, save it for yourself, or share it with someone choosing a home, business location, or investment area."), "English page is missing the permanent handoff support copy");
assert(enHtml.includes("Save or share this example"), "English page is missing the permanent handoff share CTA");
assert(enHtml.includes("The link opens the same example and data."), "English page is missing the permanent handoff note");

const mainBundle = readFileSync(join(root, "assets/index-qbT50gkr-v3.js"), "utf8");
for (const record of review.records) {
  const bundleId = record.id.replace(/^dataset-events-/, "events/").replace(/^dataset-/, "");
  const marker = `id:"${bundleId}",`;
  const recordStart = mainBundle.indexOf(marker);
  const nextRecord = mainBundle.indexOf("},{id:", recordStart);
  const hrefStart = mainBundle.indexOf("href:", recordStart);
  assert(recordStart >= 0 && hrefStart >= 0 && (nextRecord < 0 || hrefStart < nextRecord), `Hydrated dataset route is missing for ${record.id}`);
  assert(mainBundle.slice(hrefStart, hrefStart + record.citymeterUrl.length + 9).includes(JSON.stringify(record.citymeterUrl)), `Hydrated dataset route is stale for ${record.id}`);
}
assert(!mainBundle.includes("ก่อนตัดสินใจเรื่องพื้นที่\\nดูให้เห็นมากกว่าจุดบนแผนที่"), "Hydrated Thai hero headline is stale");
assert(!mainBundle.includes("Before you decide on a place,\\nsee more than pins on a map"), "Hydrated English hero headline is stale");
assert(mainBundle.includes("เก็บตัวอย่างนี้ไว้ใช้ เมื่อต้องตัดสินใจเรื่องพื้นที่"), "Hydrated Thai handoff title is stale");
assert(mainBundle.includes("สแกน QR เพื่อเปิดบนมือถือ เก็บลิงก์ไว้ดูเอง หรือส่งให้เพื่อนที่กำลังเลือกบ้าน ทำเลธุรกิจ หรือพื้นที่ลงทุน"), "Hydrated Thai handoff support copy is stale");
assert(mainBundle.includes("เก็บลิงก์หรือส่งให้เพื่อน"), "Hydrated Thai handoff CTA is stale");
assert(mainBundle.includes("ลิงก์จะเปิดตัวอย่างและข้อมูลชุดเดียวกัน"), "Hydrated Thai handoff note is stale");
assert(mainBundle.includes("Keep this example handy for a place decision"), "Hydrated English handoff title is stale");
assert(mainBundle.includes("Scan to open it on your phone, save it for yourself, or share it with someone choosing a home, business location, or investment area."), "Hydrated English handoff support copy is stale");
assert(mainBundle.includes("Save or share this example"), "Hydrated English handoff CTA is stale");
assert(mainBundle.includes("The link opens the same example and data."), "Hydrated English handoff note is stale");
assert(!mainBundle.includes("after the exhibition"), "Hydrated bundle still contains exhibition-only handoff copy");
assert(!mainBundle.includes("ส่งตัวอย่างนี้ให้ทีม"), "Hydrated bundle still contains team-only handoff copy");

assert(
  sha256(join(root, "media/reel/citymeter-proof-v3.mp4")) === "9b075ee35eaa9c9d41dacb8e0580a5dbb07b26076d723c4185810678f1520bf5",
  "Web video changed in a snapshot-only release"
);
assert(
  sha256(join(root, "media/reel/citymeter-proof-v3-exhibition.mp4")) === "bd4962bc88f66d5e0c5c14530f35628165d3f7879b35abd033a3a7039c7ada2f",
  "Exhibition video changed in a snapshot-only release"
);
assert(
  sha256(join(root, "media/depa-dsure-tdc-lockup.png")) === "804506f124cdb55dc14918b6eb64f7c2bd9badd29fc33fcfddeee5b62b07932c",
  "Supporter source lockup must preserve the owner-supplied PNG bytes"
);

for (const asset of supporterAssets) {
  const path = join(root, asset.path);
  const info = pngInfo(path);
  assert(info.width === asset.width && info.height === asset.height, `Supporter crop dimensions changed: ${asset.path}`);
  assert(info.colorType === 6, `Supporter crop must remain RGBA with transparency: ${asset.path}`);
  assert(sha256(path) === asset.sha256, `Supporter crop bytes changed: ${asset.path}`);
}

console.log("CityMETER release validation passed: 38 unique bilingual reader benefits, benefit-first r4 disclosures, five muted section surfaces per theme, two equal-circle three-logo groups with preserved alpha, responsive footer, canonical routes, hydration safety, reduced-motion fallback, and unchanged videos.");
