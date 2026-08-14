import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
const qrManifest = JSON.parse(readFileSync(join(root, "media/qr/manifest.json"), "utf8"));
const fontManifest = JSON.parse(readFileSync(join(root, "assets/font-assets.manifest.json"), "utf8"));
const fontLicenseRecords = JSON.parse(readFileSync(join(root, "assets/font-license-records.json"), "utf8"));
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

function jpegInfo(path) {
  const bytes = readFileSync(path);
  assert(bytes[0] === 0xff && bytes[1] === 0xd8, `Not a JPEG: ${path}`);
  const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < bytes.length) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    const segmentLength = bytes.readUInt16BE(offset);
    assert(segmentLength >= 2 && offset + segmentLength <= bytes.length, `Malformed JPEG segment: ${path}`);
    if (startOfFrameMarkers.has(marker)) {
      return {
        width: bytes.readUInt16BE(offset + 5),
        height: bytes.readUInt16BE(offset + 3)
      };
    }
    offset += segmentLength;
  }
  throw new Error(`JPEG dimensions not found: ${path}`);
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

const canonicalFontAssets = [
  ["assets/arvo-latin-700-normal-jvQUOvPP.woff2", "3d908a2c04ec4c59d26d1454008b2d6744480654663a5f88e439f6483976bd37"],
  ["assets/arvo-latin-700-normal-jkf39thv.woff", "e0b1ad10d38bed4a3538c680ee817319f0757edbf529df251f0324521065b625"],
  ["assets/jetbrains-mono-latin-400-normal-V6pRDFza.woff2", "14425ba9c695763c1547f48a206b7aa60350a33ae23de09f0407877f3fcd89eb"],
  ["assets/jetbrains-mono-latin-400-normal-6-qcROiO.woff", "658b9ee07b0249cf910a8d6f3d812d46c962bae81d7379a0355b1db35c61586f"],
  ["assets/bai-jamjuree-thai-400-normal-CvLA45ZU.woff2", "357f8fe9fd08973568a061a2fc266a07819cdc33e8c9bb2b39985cc4ec49bfa9"],
  ["assets/bai-jamjuree-thai-400-normal-DQvRJNNu.woff", "b0d6ff6e4ee41d92bfb4089443f009e45e6b9128d244ec270e85904fe5987461"],
  ["assets/bai-jamjuree-latin-400-normal-C8Ab1JOR.woff2", "5200faf54f32adc1dc47b8522adbd1399e739f4ce5c9236866806c04d6397b19"],
  ["assets/bai-jamjuree-latin-400-normal-D7asZ9Ds.woff", "1f3c77498a55115c745d171a012976acca24e33cf51562c83b1b763596260e1d"],
  ["assets/bai-jamjuree-thai-600-normal-CzTxzpuq.woff2", "547483c6fbedcc13f4c04489c4ec3f6be4c69877ae7cd4cfbf4a0d289889ba32"],
  ["assets/bai-jamjuree-thai-600-normal-DfF4rXK8.woff", "dc240cd2bc63dc934b7f02881fc06e99673abcedcdb237ba061d8a87e3dd795c"],
  ["assets/bai-jamjuree-latin-600-normal-CgeOh7Cx.woff2", "5ae338ac0db4222226ad96bf1b4b460030c3af1affabb475c67bf218b2eaa83f"],
  ["assets/bai-jamjuree-latin-600-normal-D119NnP2.woff", "5ba7089d7b0faba0c067e13419de90bd666708f08527916474aeffb07b3828b0"],
  ["assets/ibm-plex-sans-thai-looped-thai-700-normal-CeC2XeGp.woff2", "fa03fc4dda6a69763997e79d50e0437795d06c02e1798bdacf3a2f5e685cea2c"],
  ["assets/ibm-plex-sans-thai-looped-thai-700-normal-C75_92AR.woff", "d311e20a32a59fd5877222cdf036365a74bf654d5fa64c04d0b175eeee58a410"],
  ["assets/ibm-plex-sans-thai-looped-latin-700-normal-CTbTsSQg.woff2", "47eb0fe82a8b96cc5f1ac057e2edad4d2550d6b73d4aa030697bf1678047c526"],
  ["assets/ibm-plex-sans-thai-looped-latin-700-normal-Bv6OPIRs.woff", "99b2df37f2ca48163e132a3aaa599d38c9c68558783810eae38386baf2daa263"],
  ["assets/ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2", "2d66381c26d32bf2a95bfe559d1a5ed5475fcdac3fa128e45a33301010d42056"],
  ["assets/ibm-plex-sans-thai-latin-400-normal-82ddd365.woff2", "82ddd36544e4776857cce6ab26d0e509d10c1eeddf872c1b16f421489b0096a7"]
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
  const assetPrefix = page === "index.html" ? "./" : "../";
  const baseStylesheet = `${assetPrefix}assets/index-cqxdfePB.css?v=2`;
  const fontStylesheet = `${assetPrefix}assets/citymeter-fonts.css?v=1`;
  const expectedFontPreloads = page === "index.html"
    ? [
        "arvo-latin-700-normal-jvQUOvPP.woff2",
        "bai-jamjuree-thai-400-normal-CvLA45ZU.woff2",
        "bai-jamjuree-thai-600-normal-CzTxzpuq.woff2",
        "jetbrains-mono-latin-400-normal-V6pRDFza.woff2",
        "ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2"
      ]
    : [
        "arvo-latin-700-normal-jvQUOvPP.woff2",
        "bai-jamjuree-latin-400-normal-C8Ab1JOR.woff2",
        "bai-jamjuree-latin-600-normal-CgeOh7Cx.woff2",
        "jetbrains-mono-latin-400-normal-V6pRDFza.woff2"
      ];
  assert((html.match(/class="dataset-card"/g) || []).length === 38, `${page} must prerender 38 cards`);
  assert(html.includes("catalog-enhancements.css") && html.includes("catalog-enhancements.js"), `${page} is missing the enhancement layer`);
  assert(html.includes("catalog-enhancements.css?v=14"), `${page} must load the true-edge radial and scroll-end containment stylesheet revision`);
  assert(html.includes("catalog-enhancements.js?v=15"), `${page} must load the canonical-language benefit-first r4 enhancement layer`);
  assert(html.includes(fontStylesheet), `${page} must load the canonical font-role stylesheet revision`);
  assert((html.match(/catalog-enhancements\.css\?v=\d+/g) || []).join() === "catalog-enhancements.css?v=14", `${page} must load exactly one enhancement stylesheet revision`);
  assert((html.match(/catalog-enhancements\.js\?v=\d+/g) || []).join() === "catalog-enhancements.js?v=15", `${page} must load exactly one enhancement script revision`);
  const baseStylesheetMatches = html.match(/index-cqxdfePB\.css(?:\?v=\d+)?/g) || [];
  assert(baseStylesheetMatches.length === 1 && baseStylesheetMatches[0] === "index-cqxdfePB.css?v=2", `${page} must load exactly one deduplicated base stylesheet revision`);
  assert((html.match(/citymeter-fonts\.css\?v=\d+/g) || []).join() === "citymeter-fonts.css?v=1", `${page} must load exactly one canonical font stylesheet revision`);
  assert(html.indexOf(baseStylesheet) < html.indexOf(fontStylesheet), `${page} must load canonical font roles after the compiled base stylesheet`);
  for (const fontFile of expectedFontPreloads) {
    const preload = `<link rel="preload" as="font" type="font/woff2" href="${assetPrefix}assets/${fontFile}" crossorigin />`;
    assert(html.split(preload).length === 2, `${page} must preload ${fontFile} exactly once with the route-correct prefix`);
  }
  assert((html.match(/<link rel="preload" as="font" type="font\/woff2" href="[^"]+" crossorigin \/>/g) || []).length === expectedFontPreloads.length, `${page} must preload only the route-specific critical font set`);
  assert(html.includes("index-qbT50gkr-v3.js?v=5"), `${page} must load the concise contact-title bundle revision`);
  assert((html.match(/index-qbT50gkr-v3\.js\?v=\d+/g) || []).join() === "index-qbT50gkr-v3.js?v=5", `${page} must load exactly one main bundle revision`);
  assert(html.includes('name="citymeter:catalog-version" content="2026-08-14"'), `${page} has a stale catalog version`);
  assert(html.includes('name="citymeter:release-receipt" content="2026-08-14-land-appraisal-share"'), `${page} is missing the final release receipt`);
  assert((html.match(/name="citymeter:release-receipt"/g) || []).length === 1, `${page} must expose exactly one release receipt`);
  const socialCard = "https://montri-th.github.io/CityMETER/media/social/citymeter-land-appraisal-share-2026-08-14.jpg";
  const socialAlt = page === "index.html"
    ? "หน้าจอ CityMETER แสดงราคาประเมินที่ดินด้วยแท่งข้อมูลสามมิติบนแผนที่"
    : "CityMETER Land Appraisal screen showing 3D data columns on a map";
  assert((html.match(/citymeter-land-appraisal-share-2026-08-14\.jpg/g) || []).length === 3, `${page} must use the Land Appraisal social card for OG, secure OG and Twitter`);
  assert(html.includes(`property="og:image"\n      content="${socialCard}"`) && html.includes(`property="og:image:secure_url" content="${socialCard}"`) && html.includes(`name="twitter:image" content="${socialCard}"`), `${page} social card URLs are incomplete`);
  assert(html.includes(`property="og:image:alt" content="${socialAlt}"`) && html.includes(`name="twitter:image:alt" content="${socialAlt}"`), `${page} social card alt text is stale`);
  assert(!html.includes("citymeter-share-2026-08-14.jpg"), `${page} still references the retired tourism social card`);
  assert(html.includes('property="og:image:width" content="1200"'), `${page} is missing the OG image width`);
  assert(html.includes('property="og:image:height" content="630"'), `${page} is missing the OG image height`);
  assert(html.includes('name="twitter:card" content="summary_large_image"'), `${page} is missing the Twitter card`);
  assert(!html.includes('rel="preload" as="image" href="./media/previews-v2/') && !html.includes('rel="preload" as="image" href="../media/previews-v2/'), `${page} must not preload the full preview catalog`);
  assert(html.includes('<h1 id="page-title" lang="en">CityMETER</h1>'), `${page} must identify the CityMETER hero name as English`);
  assert(html.includes('<a class="citymeter-label" href="#top" lang="en">CityMETER</a>'), `${page} must identify the CityMETER header label as English`);
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
  "assets/citymeter-fonts.css",
  "assets/font-assets.manifest.json",
  "assets/font-license-records.json",
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
  "media/social/citymeter-land-appraisal-share-2026-08-14.jpg"
]) {
  assert(existsSync(join(root, asset)) && statSync(join(root, asset)).size > 0, `Missing release asset: ${asset}`);
}

for (const [asset, expectedHash] of canonicalFontAssets) {
  const path = join(root, asset);
  assert(existsSync(path) && statSync(path).size > 0, `Missing or empty canonical font asset: ${asset}`);
  assert(sha256(path) === expectedHash, `Canonical font bytes changed: ${asset}`);
}

const expectedFontFaces = [
  { id: "arvo-latin-700", family: "Arvo", weight: 700, scripts: ["latin"], licenseRecord: "arvo-ofl-1.1", fileCount: 2 },
  { id: "ibm-plex-sans-thai-looped-thai-latin-700", family: "IBM Plex Sans Thai Looped", weight: 700, scripts: ["thai", "latin"], licenseRecord: "ibm-plex-ofl-1.1", fileCount: 4 },
  { id: "bai-jamjuree-thai-latin-400", family: "Bai Jamjuree", weight: 400, scripts: ["thai", "latin"], licenseRecord: "bai-jamjuree-ofl-1.1", fileCount: 4 },
  { id: "bai-jamjuree-thai-latin-600", family: "Bai Jamjuree", weight: 600, scripts: ["thai", "latin"], licenseRecord: "bai-jamjuree-ofl-1.1", fileCount: 4 },
  { id: "jetbrains-mono-latin-400", family: "JetBrains Mono", weight: 400, scripts: ["latin", "numerals"], licenseRecord: "jetbrains-mono-ofl-1.1", fileCount: 2 },
  { id: "ibm-plex-sans-thai-thai-latin-400", family: "IBM Plex Sans Thai", weight: 400, scripts: ["thai", "latin"], licenseRecord: "ibm-plex-ofl-1.1", fileCount: 2 }
];
assert(fontManifest.schemaVersion === "1.0", "Font manifest schema version is stale");
assert(fontManifest.designSystem === "Landometer Design System v0.8.9", "Font manifest Design System binding is stale");
assert(fontManifest.semanticFaceCount === 6 && fontManifest.faces?.length === 6, "Font manifest must contain six semantic faces");
assert(fontManifest.licenseRecords === "./font-license-records.json", "Font manifest license-record link is stale");
assert(fontLicenseRecords.schemaVersion === "1.0" && fontLicenseRecords.recordedAt === "2026-08-14", "Font license receipt is stale");
assert(fontLicenseRecords.records?.length === 4, "Font license receipt must contain four records");
const licenseById = new Map(fontLicenseRecords.records.map((record) => [record.id, record]));
assert(licenseById.size === 4, "Font license record IDs must be unique");
for (const id of ["arvo-ofl-1.1", "bai-jamjuree-ofl-1.1", "ibm-plex-ofl-1.1", "jetbrains-mono-ofl-1.1"]) {
  const record = licenseById.get(id);
  assert(record?.spdx === "OFL-1.1", `Font license must use OFL-1.1: ${id}`);
  assert(Array.isArray(record.families) && record.families.length >= 1, `Font license families are missing: ${id}`);
  assert(typeof record.copyright === "string" && record.copyright.length > 12, `Font license copyright is missing: ${id}`);
  assert(/^https?:\/\//.test(record.licenseUrl) && typeof record.evidence === "string" && record.evidence.length > 20, `Font license evidence is incomplete: ${id}`);
}
const canonicalFontHashByAsset = new Map(canonicalFontAssets);
const manifestedFontAssets = [];
for (const contract of expectedFontFaces) {
  const face = fontManifest.faces.find((candidate) => candidate.id === contract.id);
  assert(face, `Font manifest face is missing: ${contract.id}`);
  assert(face.family === contract.family && face.weight === contract.weight && face.style === "normal", `Font manifest role is stale: ${contract.id}`);
  assert(JSON.stringify(face.scripts) === JSON.stringify(contract.scripts), `Font manifest scripts are stale: ${contract.id}`);
  assert(face.licenseRecord === contract.licenseRecord && licenseById.has(face.licenseRecord), `Font manifest license reference is stale: ${contract.id}`);
  assert(licenseById.get(face.licenseRecord).families.includes(face.family), `Font license does not cover manifest family: ${contract.id}`);
  assert(face.files?.length === contract.fileCount, `Font manifest file coverage is stale: ${contract.id}`);
  for (const file of face.files) {
    assert(/^\.\/[a-z0-9_-]+\.(?:woff2?|woff)$/i.test(file.path), `Font manifest path is unsafe: ${file.path}`);
    const asset = `assets/${file.path.slice(2)}`;
    const expectedHash = canonicalFontHashByAsset.get(asset);
    assert(expectedHash && file.sha256 === expectedHash, `Font manifest hash is stale: ${asset}`);
    assert(file.format === (file.path.endsWith(".woff2") ? "woff2" : "woff"), `Font manifest format is stale: ${asset}`);
    if (file.subset) assert(face.scripts.includes(file.subset), `Font manifest subset is not declared by its semantic face: ${asset}`);
    assert(sha256(join(root, asset)) === file.sha256, `Font manifest bytes do not match: ${asset}`);
    manifestedFontAssets.push(asset);
  }
}
assert(new Set(manifestedFontAssets).size === 18 && manifestedFontAssets.length === 18, "Font manifest must cover 18 unique font files");
assert(
  [...canonicalFontHashByAsset.keys()].sort().join("\n") === [...manifestedFontAssets].sort().join("\n"),
  "Font manifest and immutable font asset contract must cover the same files"
);

const releaseMigration = readFileSync(join(root, "scripts/apply-branding-route-release.mjs"), "utf8");
for (const priorVersion of [5, 6, 7, 8, 9, 10, 11, 12, 13]) {
  assert(
    releaseMigration.includes(`.replaceAll("catalog-enhancements.css?v=${priorVersion}", "catalog-enhancements.css?v=14")`),
    `Release migration must retain the CSS v${priorVersion} -> v14 upgrade`
  );
}
for (const priorVersion of [8, 9, 10, 11, 12, 13, 14]) {
  assert(
    releaseMigration.includes(`.replaceAll("catalog-enhancements.js?v=${priorVersion}", "catalog-enhancements.js?v=15")`),
    `Release migration must retain the JS v${priorVersion} -> v15 upgrade`
  );
}
assert(releaseMigration.includes("citymeter-fonts.css?v=1"), "Release migration must add the canonical font stylesheet");
assert(releaseMigration.includes('.replaceAll("index-cqxdfePB.css?v=1", "index-cqxdfePB.css?v=2")'), "Release migration must upgrade base CSS v1 to v2");
assert(releaseMigration.includes('.replaceAll("index-cqxdfePB.css\\\"", "index-cqxdfePB.css?v=2\\\"")'), "Release migration must upgrade the unversioned base CSS to v2");
for (const fontFile of [
  "arvo-latin-700-normal-jvQUOvPP.woff2",
  "bai-jamjuree-thai-400-normal-CvLA45ZU.woff2",
  "bai-jamjuree-thai-600-normal-CzTxzpuq.woff2",
  "bai-jamjuree-latin-400-normal-C8Ab1JOR.woff2",
  "bai-jamjuree-latin-600-normal-CgeOh7Cx.woff2",
  "jetbrains-mono-latin-400-normal-V6pRDFza.woff2",
  "ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2"
]) {
  assert(releaseMigration.includes(fontFile), `Release migration must manage route-specific preload: ${fontFile}`);
}
for (const priorVersion of [2, 3, 4]) {
  assert(
    releaseMigration.includes(`.replaceAll("index-qbT50gkr-v3.js?v=${priorVersion}", "index-qbT50gkr-v3.js?v=5")`),
    `Release migration must retain the main bundle v${priorVersion} -> v5 upgrade`
  );
}
assert(releaseMigration.includes("2026-08-14-land-appraisal-share"), "Release migration must bind the current receipt");
assert(releaseMigration.includes('.replaceAll("citymeter-share-2026-08-14.jpg", "citymeter-land-appraisal-share-2026-08-14.jpg")'), "Release migration must replace the retired tourism social card");
assert(releaseMigration.includes('หน้าจอ CityMETER แสดงราคาประเมินที่ดินด้วยแท่งข้อมูลสามมิติบนแผนที่'), "Release migration must set the Thai Land Appraisal social alt text");
assert(releaseMigration.includes('CityMETER Land Appraisal screen showing 3D data columns on a map'), "Release migration must set the English Land Appraisal social alt text");
assert(releaseMigration.includes('["คุยกับทีม Landometer ว่าควรเริ่มตรวจข้อมูลชุดไหน", "คุยกับทีม Landometer"]'), "Release migration must shorten the Thai contact title");
assert(releaseMigration.includes('["Ask the Landometer team where to start", "Talk to the Landometer team"]'), "Release migration must keep the English contact title in parity");
assert(releaseMigration.includes('<h1 id="page-title" lang="en">') && releaseMigration.includes('<a class="citymeter-label" href="#top" lang="en">'), "Release migration must preserve static language metadata");
assert(releaseMigration.includes('id:\"page-title\",children:c.hero.title') && releaseMigration.includes('id:\"page-title\",lang:\"en\",children:c.hero.title'), "Release migration must upgrade the compiled page-title language metadata");
assert(releaseMigration.includes('className:\"citymeter-label\",href:\"#top\",children:\"CityMETER\"') && releaseMigration.includes('className:\"citymeter-label\",href:\"#top\",lang:\"en\",children:\"CityMETER\"'), "Release migration must upgrade the compiled header-label language metadata");

const responsiveHarness = readFileSync(join(root, "mobile-qa.html"), "utf8");
for (const width of [320, 390, 430, 720, 900, 901, 1120, 1440]) {
  assert(responsiveHarness.includes(`data-width="${width}"`), `Responsive QA harness is missing ${width}px`);
}
assert(responsiveHarness.includes("box-sizing: content-box"), "Responsive iframe width must equal its content viewport");

const thHtml = readFileSync(join(root, "index.html"), "utf8");
const enHtml = readFileSync(join(root, "en/index.html"), "utf8");
const baseCss = readFileSync(join(root, "assets/index-cqxdfePB.css"), "utf8");
const enhancementJs = readFileSync(join(root, "assets/catalog-enhancements.js"), "utf8");
const enhancementCss = readFileSync(join(root, "assets/catalog-enhancements.css"), "utf8");
const canonicalFontCss = readFileSync(join(root, "assets/citymeter-fonts.css"), "utf8");
const enhancementSourceLower = `${enhancementCss}\n${enhancementJs}`.toLowerCase();
for (const retiredColor of ["#9f78d8", "#d89a27", "#36b9cc"]) {
  assert(!enhancementSourceLower.includes(retiredColor), `Retired non-canonical status color remains: ${retiredColor}`);
}

function cssBlock(selector, source = enhancementCss) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert(match, `Missing CSS rule: ${selector}`);
  return match[1];
}

function exactCssBlock(selector, source = enhancementCss) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`(?:^|})\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert(match, `Missing exact CSS rule: ${selector}`);
  return match[1];
}

function cssValue(block, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`${escapedProperty}\\s*:\\s*([^;}]+)(?:;|$)`))?.[1].trim().toLowerCase();
}

function normalizedCss(value) {
  return value?.replace(/\s+/g, "").toLowerCase();
}

assert(cssValue(exactCssBlock("body", baseCss), "min-width") === "320px", "Compiled base body floor changed unexpectedly");
assert(cssValue(exactCssBlock("body", enhancementCss), "min-width") === "0", "Enhancement layer must clear the body width floor for strict 320px iframe containment");

const declaredFontSource = `${baseCss}\n${canonicalFontCss}\n${enhancementCss}`;
assert(!declaredFontSource.toLowerCase().includes("sarabun"), "Canonical typography must not introduce Sarabun");
for (const [asset] of canonicalFontAssets) {
  const file = asset.split("/").at(-1);
  assert(declaredFontSource.includes(file), `Canonical typography does not declare required font asset: ${file}`);
}

const canonicalFontFaces = Array.from(
  canonicalFontCss.matchAll(/@font-face\s*\{([\s\S]*?)\}/g),
  (match) => match[1]
);
assert(canonicalFontFaces.length === 8, "Canonical font stylesheet must declare eight Thai/Latin subset faces");
assert(canonicalFontFaces.every((face) => /unicode-range\s*:/.test(face)), "Every canonical subset face must declare unicode-range");

const baseFontFaces = Array.from(
  baseCss.matchAll(/@font-face\s*\{([\s\S]*?)\}/g),
  (match) => match[1]
);
const normalizedFontFamily = (face) => cssValue(face, "font-family")?.replace(/["']/g, "").replace(/\s+/g, " ").trim();
assert(baseFontFaces.length === 2, "Compiled base CSS must retain only its Arvo and JetBrains Mono font faces");
assert(
  baseFontFaces.map(normalizedFontFamily).sort().join("|") === "arvo|jetbrains mono",
  "Compiled base CSS must not redeclare Bai Jamjuree or IBM Plex Sans Thai Looped"
);
const combinedFontFaces = [...baseFontFaces, ...canonicalFontFaces];
const combinedFaceDescriptors = combinedFontFaces.map((face) => [
  normalizedFontFamily(face),
  cssValue(face, "font-style"),
  cssValue(face, "font-weight"),
  cssValue(face, "unicode-range") || "unbounded"
].join("|"));
assert(new Set(combinedFaceDescriptors).size === combinedFaceDescriptors.length, "Base and canonical CSS must not contain duplicate font-face descriptors");
const combinedFontUrls = combinedFontFaces.flatMap((face) =>
  Array.from(face.matchAll(/url\((?:["'])?\.\/([^"')]+)(?:["'])?\)/g), (match) => match[1])
);
assert(combinedFontUrls.length === 18, "Combined base and canonical font-face declarations must reference exactly 18 assets");
assert(new Set(combinedFontUrls).size === combinedFontUrls.length, "A font asset URL must be declared by only one base/canonical font face");

function fontFaceByFile(file) {
  const face = canonicalFontFaces.find((candidate) => candidate.includes(file));
  assert(face, `Missing canonical font face for ${file}`);
  return face.toLowerCase();
}

for (const file of [
  "bai-jamjuree-thai-400-normal-CvLA45ZU.woff2",
  "bai-jamjuree-thai-600-normal-CzTxzpuq.woff2",
  "ibm-plex-sans-thai-looped-thai-700-normal-CeC2XeGp.woff2",
  "ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2"
]) {
  const face = fontFaceByFile(file);
  assert(face.includes("u+0e01-0e3a") && face.includes("u+0e3f-0e5b"), `Thai Unicode coverage is incomplete for ${file}`);
}
for (const file of [
  "bai-jamjuree-latin-400-normal-C8Ab1JOR.woff2",
  "bai-jamjuree-latin-600-normal-CgeOh7Cx.woff2",
  "ibm-plex-sans-thai-looped-latin-700-normal-CTbTsSQg.woff2",
  "ibm-plex-sans-thai-latin-400-normal-82ddd365.woff2"
]) {
  const face = fontFaceByFile(file);
  assert(face.includes("u+0020") && !face.includes("u+0e01"), `Latin subset coverage is stale for ${file}`);
}
for (const file of [
  "ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2",
  "ibm-plex-sans-thai-latin-400-normal-82ddd365.woff2"
]) {
  const face = fontFaceByFile(file);
  assert(face.includes('font-family: "ibm plex sans thai"') && face.includes("font-weight: 400"), `IBM Plex Sans Thai 400 role is stale for ${file}`);
  assert(face.includes("size-adjust: 102%"), `IBM Plex Sans Thai 400 size adjustment is stale for ${file}`);
}

const fontRoleCss = cssBlock(":root", canonicalFontCss);
const canonicalFontRoles = [
  ["--font-display-en-fallback", 'georgia, cambria, "times new roman", serif'],
  ["--font-display-th-fallback", '"noto sans thai looped", "leelawadee ui", tahoma, sans-serif'],
  ["--font-body-fallback", '"noto sans thai", "leelawadee ui", tahoma, sans-serif'],
  ["--font-number-fallback", '"sfmono-regular", consolas, "liberation mono", monospace'],
  ["--font-display-en", '"arvo", var(--font-display-en-fallback)'],
  ["--font-display-th", '"ibm plex sans thai looped", var(--font-display-th-fallback)'],
  ["--font-ui-heading-en", '"arvo", var(--font-display-en-fallback)'],
  ["--font-ui-heading-th", '"ibm plex sans thai looped", var(--font-display-th-fallback)'],
  ["--font-body", '"bai jamjuree", var(--font-body-fallback)'],
  ["--font-technical-latin", '"jetbrains mono", var(--font-number-fallback)'],
  ["--font-technical-th", '"ibm plex sans thai", var(--font-body-fallback)'],
  ["--font-technical", '"jetbrains mono", "ibm plex sans thai", "sfmono-regular", consolas, monospace'],
  ["--font-number", "var(--font-technical-latin)"]
];
for (const [role, value] of canonicalFontRoles) {
  assert(cssValue(fontRoleCss, role) === value, `Canonical Design System font role is stale: ${role}`);
}
for (const [role, value] of [
  ["--leading-display-en", "1.02"],
  ["--leading-display-th", "1.16"],
  ["--leading-editorial-en", "1.15"],
  ["--leading-ui-heading-en", "1.22"],
  ["--leading-ui-heading-th", "1.32"],
  ["--leading-body", "1.60"],
  ["--leading-body-compact", "1.45"],
  ["--leading-label", "1.35"],
  ["--leading-number", "1.25"]
]) {
  assert(cssValue(fontRoleCss, role) === value, `Canonical Design System leading role is stale: ${role}`);
}
assert(cssValue(cssBlock("body", canonicalFontCss), "font-family") === "var(--font-body)", "Body must consume the canonical body role");
assert(/h1,\s*h2,\s*h3\s*\{[\s\S]*?font-family:\s*var\(--font-display-th\)/.test(canonicalFontCss), "Thai headings must consume the canonical Thai display role");
assert(/html\[lang="en"\] h1,\s*html\[lang="en"\] h2,\s*html\[lang="en"\] h3\s*\{[\s\S]*?font-family:\s*var\(--font-display-en\)/.test(canonicalFontCss), "English headings must consume the canonical English display role");
assert(cssValue(cssBlock('html[lang="en"] h2', canonicalFontCss), "line-height") === "var(--leading-editorial-en)", "English h2 must consume the editorial leading role");
assert(cssValue(cssBlock('html[lang="en"] h3', canonicalFontCss), "line-height") === "var(--leading-ui-heading-en)", "English h3 must consume the UI-heading leading role");
assert(cssValue(cssBlock("#page-title", canonicalFontCss), "font-family") === "var(--font-display-en)", "CityMETER page title must consume the English display role");
assert(cssValue(cssBlock(".citymeter-label", canonicalFontCss), "font-family") === "var(--font-technical-latin)", "CityMETER header label must consume the Latin technical role");
assert(cssValue(cssBlock(".citymeter-label", canonicalFontCss), "line-height") === "var(--leading-label)", "CityMETER header label must consume the label leading role");
const technicalRuleStart = canonicalFontCss.indexOf(".eyebrow,\n");
const technicalRuleOpen = canonicalFontCss.indexOf("{", technicalRuleStart);
const technicalRuleClose = canonicalFontCss.indexOf("}", technicalRuleOpen);
assert(technicalRuleStart >= 0 && technicalRuleClose > technicalRuleOpen, "Canonical technical-label rule is missing");
const technicalSelectors = canonicalFontCss.slice(technicalRuleStart, technicalRuleOpen);
const technicalRuleCss = canonicalFontCss.slice(technicalRuleOpen + 1, technicalRuleClose);
for (const selector of [".eyebrow", ".demo-story-caption span", ".demo-figure figcaption span:first-child", ".record-group", ".dataset-kicker", ".group-filters button span", ".results-line strong", ".footer-grid small"]) {
  assert(technicalSelectors.includes(selector), `Canonical technical-label selector is missing: ${selector}`);
}
assert(cssValue(technicalRuleCss, "font-family") === "var(--font-technical)" && cssValue(technicalRuleCss, "font-weight") === "400", "Technical labels must consume the bilingual technical role at weight 400");
assert(cssValue(technicalRuleCss, "line-height") === "var(--leading-label)", "Technical labels must consume the label leading role");
const thaiTechnicalRuleStart = canonicalFontCss.indexOf('html[lang="th"] .eyebrow,');
const thaiTechnicalRuleOpen = canonicalFontCss.indexOf("{", thaiTechnicalRuleStart);
const thaiTechnicalRuleClose = canonicalFontCss.indexOf("}", thaiTechnicalRuleOpen);
assert(thaiTechnicalRuleStart >= 0 && thaiTechnicalRuleClose > thaiTechnicalRuleOpen, "Thai technical-label rule is missing");
const thaiTechnicalSelectors = canonicalFontCss.slice(thaiTechnicalRuleStart, thaiTechnicalRuleOpen);
const thaiTechnicalRuleCss = canonicalFontCss.slice(thaiTechnicalRuleOpen + 1, thaiTechnicalRuleClose);
for (const selector of [".eyebrow", ".demo-story-caption span", ".demo-figure figcaption span:first-child", ".record-group", ".dataset-kicker", ".group-filters button span", ".results-line strong", ".footer-grid small"]) {
  assert(thaiTechnicalSelectors.includes(`html[lang="th"] ${selector}`), `Thai technical-label selector is missing: ${selector}`);
}
assert(cssValue(thaiTechnicalRuleCss, "letter-spacing") === ".008em" && cssValue(thaiTechnicalRuleCss, "line-height") === "1.48", "All Thai technical labels must use canonical tracking and leading");
assert(cssValue(cssBlock(".results-line strong", canonicalFontCss), "line-height") === "var(--leading-number)", "Technical result numbers must consume the number leading role");
assert(cssValue(cssBlock('html[lang="th"] .results-line strong', canonicalFontCss), "line-height") === "1.48", "Thai technical result numbers must retain Thai leading");

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
assert(enhancementJs.includes('if (pageTitle.lang !== "en") pageTitle.lang = "en"'), "Runtime must preserve the English language metadata on the CityMETER page title");
assert(enhancementJs.includes('if (citymeterLabel && citymeterLabel.lang !== "en") citymeterLabel.lang = "en"'), "Runtime must preserve the English language metadata on the CityMETER header label");
assert(enhancementCss.includes(".site-footer .footer-grid > *") && enhancementCss.includes("flex-wrap: wrap"), "Footer grid children and links must be allowed to shrink and wrap");
assert(enhancementCss.includes("@media (max-width: 900px)") && enhancementCss.includes("grid-template-columns: 1fr"), "Footer must collapse before the former 720px overflow band");
assert(normalizedCss(enhancementCss).includes("html,body{overscroll-behavior-y:none;}"), "Root scrolling must suppress elastic over-scroll beyond the footer");
assert(enhancementCss.includes(".supporter-logo-depa") && enhancementCss.includes(".supporter-logo-dsure") && enhancementCss.includes(".supporter-logo-account"), "Split supporter logos need independent optical sizing");
assert(enhancementCss.includes("height: calc(var(--supporter-logo-disc) * .68)"), "Tall dSURE artwork must fit inside the fixed circle without percentage-track expansion");
const supporterGroupCss = cssBlock(".supporter-logos");
const supporterCellCss = cssBlock(".supporter-logo-cell");
assert(cssValue(supporterGroupCss, "grid-template-columns") === "repeat(3, var(--supporter-logo-disc))", "Supporter logos must use three equal grid columns");
assert(cssValue(supporterCellCss, "width") === "var(--supporter-logo-disc)", "Each supporter circle must use the shared diameter token");
assert(cssValue(supporterCellCss, "height") === "var(--supporter-logo-disc)", "Each supporter circle must lock height to the shared diameter token");
assert(cssValue(supporterCellCss, "aspect-ratio") === "1", "Supporter logo plates must remain square before rounding");
assert(cssValue(supporterCellCss, "border-radius") === "50%", "Supporter logo plates must remain circular");
assert(cssValue(supporterCellCss, "border") === "0", "Supporter logo plates must not reintroduce an edge border");
assert(
  normalizedCss(cssValue(supporterCellCss, "background")) === "radial-gradient(circleclosest-sideatcenter,rgba(255,255,255,.5)0%,rgba(255,255,255,0)100%)",
  "Supporter logo plates must fade from 50% white at the centre to zero alpha at the visible circle edge"
);
const supporterCellRules = Array.from(
  enhancementCss.matchAll(/([^{}]*\.supporter-logo-cell[^{}]*)\{([^{}]*)\}/g),
  (match) => match[2]
);
assert(supporterCellRules.length >= 1, "Supporter logo cell rules are missing");
assert(supporterCellRules.every((block) => !/box-shadow\s*:/.test(block)), "Supporter logo cells must not reintroduce a box shadow");
assert(
  supporterCellRules.every((block) => !/border\s*:/.test(block) || cssValue(block, "border") === "0"),
  "Supporter logo cells must not reintroduce a placement-specific border"
);
assert(!enhancementCss.includes(".supporter-logo-cell-account"), "Mobile layout must not move the Digital Service Account mark into a separate row");

const brandBlueShellMatch = enhancementCss.match(/\.hero\s*,\s*\.handoff-section\s*\{([\s\S]*?)\}/);
assert(brandBlueShellMatch, "Measure deep hero and handoff shell rule is missing");
assert(
  normalizedCss(cssValue(brandBlueShellMatch[1], "background")) === "linear-gradient(135deg,#1d44970%,#176b8254%,#08756f100%)",
  "Hero and handoff must use the exact Design System v0.8.9 atmosphere.gradient.measure.deep recipe"
);
assert(cssValue(cssBlock(".hero", baseCss), "color") === "#fff", "Hero foreground must retain the onDeep color");
assert(cssValue(cssBlock(".handoff-section", baseCss), "color") === "#fff", "Handoff foreground must retain the onDeep color");

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
assert(mainBundle.includes('id:"page-title",lang:"en",children:c.hero.title'), "Compiled bundle must render the CityMETER page title with English language metadata");
assert(mainBundle.includes('className:"citymeter-label",href:"#top",lang:"en",children:"CityMETER"'), "Compiled bundle must render the CityMETER header label with English language metadata");
assert(!mainBundle.includes('id:"page-title",children:c.hero.title'), "Compiled bundle still contains the hydration-unsafe page-title pattern");
assert(!mainBundle.includes('className:"citymeter-label",href:"#top",children:"CityMETER"'), "Compiled bundle still contains the hydration-unsafe CityMETER label pattern");
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
assert(thHtml.includes('<h2 id="contact-title">คุยกับทีม Landometer</h2>'), "Thai prerender must use the concise contact title");
assert(enHtml.includes('<h2 id="contact-title">Talk to the Landometer team</h2>'), "English prerender must use the concise contact title");
assert(!thHtml.includes("คุยกับทีม Landometer ว่าควรเริ่มตรวจข้อมูลชุดไหน"), "Thai prerender still contains the retired contact title");
assert(!enHtml.includes("Ask the Landometer team where to start"), "English prerender still contains the retired contact title");
assert(mainBundle.includes('title:"คุยกับทีม Landometer"'), "Hydrated Thai contact title is stale");
assert(mainBundle.includes('title:"Talk to the Landometer team"'), "Hydrated English contact title is stale");
assert(!mainBundle.includes("คุยกับทีม Landometer ว่าควรเริ่มตรวจข้อมูลชุดไหน") && !mainBundle.includes("Ask the Landometer team where to start"), "Hydrated bundle still contains a retired contact title");

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
assert(
  sha256(join(root, "media/social/citymeter-land-appraisal-share-2026-08-14.jpg")) === "cadc66644987afa5abb29dbe720adc9302fe276b12d64172e794dd4e6ddabd88",
  "Land Appraisal social card bytes changed; regenerate with the approved deterministic crop"
);
const landAppraisalSocialCardInfo = jpegInfo(join(root, "media/social/citymeter-land-appraisal-share-2026-08-14.jpg"));
assert(
  landAppraisalSocialCardInfo.width === 1200 && landAppraisalSocialCardInfo.height === 630,
  "Land Appraisal social card must decode to 1200x630"
);

for (const asset of supporterAssets) {
  const path = join(root, asset.path);
  const info = pngInfo(path);
  assert(info.width === asset.width && info.height === asset.height, `Supporter crop dimensions changed: ${asset.path}`);
  assert(info.colorType === 6, `Supporter crop must remain RGBA with transparency: ${asset.path}`);
  assert(sha256(path) === asset.sha256, `Supporter crop bytes changed: ${asset.path}`);
}

console.log("CityMETER release validation passed: deterministic 1200x630 Land Appraisal social card, strict 320px iframe containment, root scroll-end containment, deduplicated base CSS v2 font declarations, canonical typography with no Sarabun, six semantic font faces across 18 immutable files with four OFL receipts, route-specific critical preloads, hydration-safe main bundle v5, exact Measure deep shell, five muted section surfaces per theme, six true-edge 50%-to-0% radial logo circles, concise bilingual contact titles, 38 unique bilingual benefits, benefit-first r4 disclosures, canonical routes, responsive footer, reduced-motion fallback, preserved PNG alpha, and unchanged videos.");
