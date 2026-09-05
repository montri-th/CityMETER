import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
const qrManifest = JSON.parse(readFileSync(join(root, "media/qr/manifest.json"), "utf8"));
const previewManifest = JSON.parse(readFileSync(join(root, "media/previews-v3/manifest.json"), "utf8"));
const fontManifest = JSON.parse(readFileSync(join(root, "assets/font-assets.manifest.json"), "utf8"));
const fontLicenseRecords = JSON.parse(readFileSync(join(root, "assets/font-license-records.json"), "utf8"));
const expectedContributorManifestRef = "data/citymeter-contributor-release-p1-7712069325b3.json";
const expectedContributorRelease = "2026-08-27-landom-thumbnail-sync-v29";
const expectedContributorRenderOwners = {
  thaiPrerender: "index.html",
  englishPrerender: "en/index.html",
  hydratedBundle: "assets/index-qbT50gkr-v17.js",
  transitionalEnhancer: "assets/catalog-enhancements-v25.js",
  styles: "assets/catalog-enhancements-v25.css"
};
const expectedContributorReleaseAuthority = {
  authority: "site_owner",
  authorizedAt: "2026-08-27",
  scope: "Publish the CityMETER contributor thumbnail synchronization from the current Landom public media contract to the existing GitHub Pages site while preserving approved contributor mappings"
};
const contributorShellHtml = readFileSync(join(root, "index.html"), "utf8");
const contributorManifestRef = contributorShellHtml.match(/<meta name="citymeter:contributor-release-manifest" content="(data\/citymeter-contributor-release-p1-[a-f0-9]{12}\.json)" \/>/)?.[1];
assert(contributorManifestRef, "Active P1 contributor manifest pointer is missing from index.html");
assert(contributorManifestRef === expectedContributorManifestRef, "Active contributor manifest pointer is not the authorized v29 manifest");
const contributorManifest = JSON.parse(readFileSync(join(root, contributorManifestRef), "utf8"));
assert(contributorManifest.releaseReceipt === expectedContributorRelease, "Active contributor receipt is not the authorized v29 receipt");
assert(contributorManifest.releaseStatus === "approved_for_publication", "Active contributor release is not approved for publication");
assert(JSON.stringify(contributorManifest.releaseAuthority) === JSON.stringify(expectedContributorReleaseAuthority), "Active contributor site-owner authority drifted");
assert(contributorManifest.publishable === true && contributorManifest.mustNotDeploy === false, "Active contributor release must remain publishable and deployable");
assert(JSON.stringify(contributorManifest.renderOwners) === JSON.stringify(expectedContributorRenderOwners), "Active contributor render-owner set drifted from v29");
const contributorP1Release = contributorManifest.releaseReceipt;
const contributorBundleName = contributorManifest.renderOwners.hydratedBundle.split("/").at(-1);
const contributorEnhancerName = contributorManifest.renderOwners.transitionalEnhancer.split("/").at(-1);
const contributorStylesName = contributorManifest.renderOwners.styles.split("/").at(-1);
const activeBundleName = "index-qbT50gkr-v18.js";
const activeStylesName = "catalog-enhancements-ds-0.9.1-v30.css";
const activeEnhancerName = "catalog-enhancements-ds-0.9.1-v26.js";
const activeApproachRevealName = "citymeter-ds-0.9.1-approach-reveal-v1.js";
const activeArtifactBuild = "ui-20260905-ds091-public-v5";
const activeReleaseReceipt = "2026-09-05-citymeter-ds091-public-v5";
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
const analysisBriefOldThai = "เทียบพื้นที่จากแหล่งเดียวกัน แล้วส่งลิงก์กลับไปยังหลักฐานที่คนรับตรวจต่อได้";
const analysisBriefRejectedThai = "เมืองไม่ได้มีแค่ที่ดินและอาคาร Land คือฐานกายภาพของพื้นที่ Living คือผู้คน บริการ ความเสี่ยง และชีวิตที่เกิดขึ้น เมื่อมองสองด้านนี้ร่วมกัน Location จะช่วยให้เห็นว่าพื้นที่นั้นทำงานอย่างไร—มีธุรกิจ การเดินทาง และความต้องการแบบไหน รวมถึงบางเรื่องที่เปลี่ยนไปตามวัน เดือน หรือปี CityMETER จัดภาพที่ซับซ้อนนี้ให้คนทั่วไปค้น เทียบ และเปิดแหล่งที่มาตรวจต่อได้ง่าย";
const analysisBriefOldEnglish = "Compare places from the same sources and link every handoff back to evidence the recipient can inspect.";
const analysisBriefRejectedEnglish = "A city is more than land and buildings. Land is the physical base of a place. Living covers people, services, risk and everyday life. Viewed together, Location shows how the place works—through business, movement and demand, including changes that some records reveal over days, months or years. CityMETER organises this complexity so anyone can find, compare and open the sources to check the evidence.";
const analysisBriefOldRecordOrder = 'recordIds:["business-dynamics","buildings","road-network-archetypes","factories-workers-investment","locale-insights","population-age-sex"]';
const analysisBriefRecordOrder = 'recordIds:["business-dynamics","buildings","population-age-sex","road-network-archetypes","factories-workers-investment","locale-insights"]';
const catalogStoryRelease = "2026-08-16-catalog-story-qr-v20";
const catalogStructureRelease = "2026-08-16-catalog-structure-simple-v21";
const motionSocialRelease = "2026-08-16-motion-social-v22";
const landAppraisalRoute = "https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed";
const landAppraisalQrHash = "eeb68384e9327bf46b1a0c0d3fdad4b9206c5886e950ba31e20b642513a0f483";
const landAppraisalSvgHash = "9f02e5f265a7b8e58ea0d00a190ae457ca33406c52463413cb6149ed375344ba";
const socialProfiles = [
  ["Facebook", "https://www.facebook.com/landometer/"],
  ["Instagram", "https://www.instagram.com/landometer/"],
  ["LinkedIn", "https://th.linkedin.com/company/landometer"],
  ["TikTok", "https://www.tiktok.com/@landometer82"]
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function count(source, token) {
  return source.split(token).length - 1;
}

function matchingElementEnd(source, startIndex, tagName, label) {
  assert(startIndex >= 0, `${label} start is missing`);
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "g");
  tagPattern.lastIndex = startIndex;
  let depth = 0;
  for (let match = tagPattern.exec(source); match; match = tagPattern.exec(source)) {
    depth += match[0].startsWith(`</${tagName}`) ? -1 : 1;
    if (depth === 0) return tagPattern.lastIndex;
  }
  throw new Error(`${label} closing tag is missing`);
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

function webpInfo(path) {
  const bytes = readFileSync(path);
  assert(bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP", `Not a WebP: ${path}`);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunk = bytes.subarray(offset, offset + 4).toString("ascii");
    const size = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (chunk === "VP8 ") {
      assert(bytes[data + 3] === 0x9d && bytes[data + 4] === 0x01 && bytes[data + 5] === 0x2a, `Invalid VP8 frame: ${path}`);
      return { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const bits = bytes.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") {
      return {
        width: 1 + bytes[data + 4] + (bytes[data + 5] << 8) + (bytes[data + 6] << 16),
        height: 1 + bytes[data + 7] + (bytes[data + 8] << 8) + (bytes[data + 9] << 16)
      };
    }
    offset = data + size + (size % 2);
  }
  throw new Error(`WebP dimensions not found: ${path}`);
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
  const datasetPillars = Array.from(
    html.matchAll(/<article\b[^>]*class="dataset-card"[^>]*>/g),
    (match) => match[0].match(/\sdata-pillar="(land|location|living)"/)?.[1]
  ).filter(Boolean);
  const showcasePillars = Array.from(
    html.matchAll(/<article class="showcase-card[^"]*" data-pillar="(land|location|living)"/g),
    (match) => match[1]
  );
  const countPillars = (pillars) => Object.fromEntries(
    ["land", "location", "living"].map((pillar) => [pillar, pillars.filter((candidate) => candidate === pillar).length])
  );
  assert(
    JSON.stringify(countPillars(datasetPillars)) === JSON.stringify({ land: 12, location: 13, living: 13 }),
    `${page} dataset pillar contract must remain 12 / 13 / 13`
  );
  assert(
    JSON.stringify(countPillars(showcasePillars)) === JSON.stringify({ land: 1, location: 3, living: 2 }),
    `${page} showcase pillar contract must remain 1 / 3 / 2`
  );
  assert(html.includes(activeStylesName) && html.includes(activeEnhancerName) && html.includes(activeApproachRevealName), `${page} is missing the active DS 0.9.1 surface, hardened P1 contributor runtime, or independent approach-reveal runtime`);
  assert(html.includes(activeStylesName), `${page} must load the DS 0.9.1 surface revision`);
  assert(html.includes(activeEnhancerName), `${page} must load the DS 0.9.1 hardened P1 enhancement revision`);
  assert(html.includes(activeApproachRevealName), `${page} must load the independent DS 0.9.1 approach-reveal runtime`);
  assert(html.includes(fontStylesheet), `${page} must load the canonical font-role stylesheet revision`);
  assert((html.match(/catalog-enhancements[^"']*\.css(?:\?v=\d+)?/g) || []).join() === activeStylesName, `${page} must load exactly one active enhancement stylesheet revision`);
  assert((html.match(/catalog-enhancements(?:-ds-0\.9\.1)?-v\d+\.js(?:\?v=\d+)?/g) || []).join() === activeEnhancerName, `${page} must load exactly one active enhancement script revision`);
  assert((html.match(/citymeter-ds-0\.9\.1-approach-reveal-v\d+\.js(?:\?v=\d+)?/g) || []).join() === activeApproachRevealName, `${page} must load exactly one active approach-reveal script revision`);
  assert(html.indexOf(activeEnhancerName) < html.indexOf(activeApproachRevealName), `${page} must load the approach reveal after the hydration-safe contributor enhancer`);
  assert(!/landometer-motifs|motif-placement|<lm-motif\b|data-motif-/i.test(html), `${page} must not restore active motif markup, styles, or runtime`);
  const baseStylesheetMatches = html.match(/index-cqxdfePB\.css(?:\?v=\d+)?/g) || [];
  assert(baseStylesheetMatches.length === 1 && baseStylesheetMatches[0] === "index-cqxdfePB.css?v=2", `${page} must load exactly one deduplicated base stylesheet revision`);
  assert((html.match(/citymeter-fonts\.css\?v=\d+/g) || []).join() === "citymeter-fonts.css?v=1", `${page} must load exactly one canonical font stylesheet revision`);
  assert(html.indexOf(baseStylesheet) < html.indexOf(fontStylesheet), `${page} must load canonical font roles after the compiled base stylesheet`);
  for (const fontFile of expectedFontPreloads) {
    const preload = `<link rel="preload" as="font" type="font/woff2" href="${assetPrefix}assets/${fontFile}" crossorigin />`;
    assert(html.split(preload).length === 2, `${page} must preload ${fontFile} exactly once with the route-correct prefix`);
  }
  assert((html.match(/<link rel="preload" as="font" type="font\/woff2" href="[^"]+" crossorigin \/>/g) || []).length === expectedFontPreloads.length, `${page} must preload only the route-specific critical font set`);
  assert(html.includes(activeBundleName), `${page} must load the DS 0.9.1 hydrated bundle revision`);
  assert((html.match(/index-qbT50gkr-v\d+\.js(?:\?v=\d+)?/g) || []).join() === activeBundleName, `${page} must load exactly one main bundle revision`);
  assert(html.includes(`name="landometer:artifact-build" content="${activeArtifactBuild}"`), `${page} is missing the active DS 0.9.1 artifact build`);
  assert((html.match(/name="landometer:artifact-build"/g) || []).length === 1, `${page} must expose exactly one artifact build`);
  assert(html.includes('name="citymeter:catalog-version" content="2026-08-14"'), `${page} has a stale catalog version`);
  assert(html.includes(`name="citymeter:release-receipt" content="${activeReleaseReceipt}"`), `${page} is missing the active DS 0.9.1 release receipt`);
  assert((html.match(/name="citymeter:release-receipt"/g) || []).length === 1, `${page} must expose exactly one release receipt`);
  assert(html.includes(`name="citymeter:contributor-candidate-build" content="${contributorP1Release}"`), `${page} is missing the v29 contributor build receipt`);
  assert((html.match(/name="citymeter:contributor-candidate-build"/g) || []).length === 1, `${page} must expose exactly one contributor build receipt`);
  assert(html.includes(`name="citymeter:contributor-release-manifest" content="${expectedContributorManifestRef}"`), `${page} is not bound to the authorized v29 contributor manifest`);
  assert((html.match(/name="citymeter:contributor-release-manifest"/g) || []).length === 1, `${page} must expose exactly one contributor manifest pointer`);
  assert(count(html, 'class="dataset-card-actions"') === contributorManifest.projectionSummary.records, `${page} must prerender one contributor action row per dataset card`);
  assert(count(html, 'class="citymeter-contributors-compact"') === contributorManifest.projectionSummary.records, `${page} must prerender one compact contributor group per dataset card`);
  assert(count(html, 'class="citymeter-contributors"') === contributorManifest.projectionSummary.records, `${page} must prerender one full contributor block per dataset card`);
  const contributorCardParts = html.split('<article class="dataset-card"').slice(1);
  assert(contributorCardParts.length === contributorManifest.projectionSummary.records, `${page} contributor structure must cover all dataset cards`);
  for (const [cardIndex, part] of contributorCardParts.entries()) {
    const cardEnd = part.indexOf("</article>");
    assert(cardEnd >= 0, `${page} dataset card ${cardIndex + 1} closing tag is missing`);
    const card = `<article class="dataset-card"${part.slice(0, cardEnd + "</article>".length)}`;
    const datasetId = card.match(/data-citymeter-record-id="([^"]+)"/)?.[1] || `card-${cardIndex + 1}`;
    const actionStart = card.indexOf('<div class="dataset-card-actions">');
    const compactStart = card.indexOf('<div class="citymeter-contributors-compact"');
    const detailsStart = card.indexOf('<details class="dataset-details">');
    const fullStart = card.indexOf('<section class="citymeter-contributors"');
    assert(count(card, 'class="dataset-card-actions"') === 1, `${page}/${datasetId} must contain exactly one action row`);
    assert(count(card, 'class="citymeter-contributors-compact"') === 1, `${page}/${datasetId} must contain exactly one compact contributor group`);
    assert(count(card, 'class="dataset-details"') === 1, `${page}/${datasetId} must contain exactly one outer dataset-details disclosure`);
    assert(count(card, 'class="citymeter-contributors"') === 1, `${page}/${datasetId} must contain exactly one full contributor block`);
    const actionEnd = matchingElementEnd(card, actionStart, "div", `${page}/${datasetId} action row`);
    const detailsEnd = matchingElementEnd(card, detailsStart, "details", `${page}/${datasetId} outer dataset-details`);
    const outerDetails = card.slice(detailsStart, detailsEnd);
    const outsideDetails = card.slice(0, detailsStart) + card.slice(detailsEnd);
    assert(actionStart < compactStart && compactStart < actionEnd, `${page}/${datasetId} compact contributor group must be nested inside the action row`);
    assert(actionEnd <= detailsStart, `${page}/${datasetId} action row must precede the outer dataset-details disclosure`);
    assert(fullStart > detailsStart && fullStart < detailsEnd, `${page}/${datasetId} full contributor block must be nested inside outer dataset-details`);
    assert(fullStart > card.indexOf("</summary>", detailsStart), `${page}/${datasetId} full contributor block must follow the outer details summary`);
    assert(count(outerDetails, 'class="citymeter-contributors"') === 1, `${page}/${datasetId} outer dataset-details must own the full contributor block`);
    assert(count(outsideDetails, 'class="citymeter-contributors"') === 0, `${page}/${datasetId} full contributor attribution must not appear outside outer dataset-details`);
  }
  const catalogDiagramMatches = html.match(/<figure class="catalog-structure"[\s\S]*?<\/figure>/g) || [];
  assert(catalogDiagramMatches.length === 1, `${page} must prerender exactly one catalog-structure diagram`);
  const catalogDiagram = catalogDiagramMatches[0];
  const explorerHeadingIndex = html.indexOf('id="datasets-title"');
  const catalogDiagramIndex = html.indexOf('<figure class="catalog-structure"');
  const explorerToolbarIndex = html.indexOf('<div class="explorer-toolbar"');
  assert(explorerHeadingIndex >= 0 && explorerHeadingIndex < catalogDiagramIndex && catalogDiagramIndex < explorerToolbarIndex, `${page} catalog diagram must remain between the heading and filters`);
  assert(catalogDiagram.includes('aria-labelledby="catalog-structure-title"') && catalogDiagram.includes('aria-describedby="catalog-structure-description"'), `${page} catalog diagram needs an explicit accessible name and description`);
  assert((catalogDiagram.match(/id="catalog-structure-title"/g) || []).length === 1 && (catalogDiagram.match(/id="catalog-structure-description"/g) || []).length === 1, `${page} catalog diagram ids must be unique`);
  const catalogGroups = Array.from(catalogDiagram.matchAll(/<div class="catalog-structure-step" role="listitem" data-group="(land|location|living)">/g), (match) => match[1]);
  assert(JSON.stringify(catalogGroups) === JSON.stringify(["land", "location", "living"]), `${page} catalog diagram must present Land, Location and Living as peer dimensions in DOM order`);
  const expectedDiagramCounts = page === "index.html" ? ["12 รายการ", "13 รายการ", "13 รายการ"] : ["12 views", "13 views", "13 views"];
  for (const countLabel of expectedDiagramCounts) assert(catalogDiagram.includes(`<small>${countLabel}</small>`), `${page} catalog diagram is missing ${countLabel}`);
  const expectedDiagramCopy = page === "index.html"
    ? ["เข้าใจเมืองผ่าน 3 มิติ แล้วไปสู่การตัดสินใจ", "Land, Location และ Living เป็นบริบทคนละมิติ", "ธุรกิจ · การเดินทาง · การเข้าถึง", "ผู้คน · บริการ · ความเป็นอยู่", "เชื่อม 38 มุมมองให้ค้น เทียบ และเห็นทั้งสิ่งที่รู้กับสิ่งที่ยังต้องตรวจ", "เปลี่ยนบริบทเชิงพื้นที่ให้เป็นสิ่งที่ควรตรวจ เทียบ และทำต่อ"]
    : ["Three dimensions of a place, connected to a decision", "Land, Location and Living are peer dimensions", "Business · mobility · access", "People · services · everyday life", "Connects 38 views so people can find, compare and see both what is known and what still needs checking.", "Turns spatial context into what to check, compare and do next."];
  for (const copy of expectedDiagramCopy) assert(catalogDiagram.includes(copy), `${page} catalog diagram is missing localized copy: ${copy}`);
  assert(catalogDiagram.includes('<span class="catalog-structure-outcome-route"><strong lang="en">CityMETER</strong><span aria-hidden="true">→</span><b lang="en">Local Decisions</b></span>'), `${page} must expose the CityMETER to Local Decisions route`);
  assert((catalogDiagram.match(/class="catalog-structure-operator" aria-hidden="true"/g) || []).length === 2, `${page} must expose exactly two decorative relationship operators`);
  assert((catalogDiagram.match(/<span class="catalog-structure-operator" aria-hidden="true">\+<\/span>/g) || []).length === 2, `${page} must join the three peer dimensions with two plus signs`);
  for (const retiredClass of ["catalog-structure-together", "catalog-structure-whys", "catalog-structure-local-decisions", "catalog-structure-benefits", "catalog-structure-boundary"]) {
    assert(!catalogDiagram.includes(retiredClass), `${page} must not restore the retired text-wall block: ${retiredClass}`);
  }
  for (const retiredCopy of ["ความต้องการ", "People · needs", "<strong>ลึก</strong>", "<strong>ชัด</strong>", "<strong>ง่าย</strong>", "<strong>Deep</strong>", "<strong>Clear</strong>", "<strong>Easy</strong>", "ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน", "not 38 source databases"]) {
    assert(!catalogDiagram.includes(retiredCopy), `${page} catalog diagram must omit rejected benefit or caveat copy: ${retiredCopy}`);
  }
  for (const removedCaveat of [
    "38 หมายถึงมุมมองข้อมูลและโมดูล ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน",
    "The 38 items are data views and modules, not 38 independent source databases"
  ]) {
    assert(!html.includes(removedCaveat), `${page} must omit the repeated catalog caveat from the active route`);
  }
  assert(!/<(?:img|video|canvas|iframe|a|button|input)\b/i.test(catalogDiagram), `${page} catalog diagram must remain semantic, static and request-free`);
  assert(!catalogDiagram.includes("data-pillar"), `${page} catalog explainer must not enter the governed card-pillar count contract`);
  assert((html.match(/class="showcase-atmosphere"/g) || []).length === 1, `${page} must expose exactly one Ground orientation band`);
  assert(html.includes('<div class="wide-container showcase-content"><div class="showcase-grid">'), `${page} must keep showcase cards on the flat evidence surface outside the Ground band`);
  assert((html.match(/class="supporter-logos supporter-logos-footer"/g) || []).length === 1, `${page} must prerender exactly one stable footer supporter group`);
  assert(html.includes('<div class="footer-meta"><nav aria-label="Footer">'), `${page} must group footer navigation and legal copy without an artificial trailing grid row`);
  const socialNavMatches = html.match(/<nav class="footer-social"[\s\S]*?<\/nav>/g) || [];
  assert(socialNavMatches.length === 1, `${page} must prerender exactly one social navigation`);
  const socialNav = socialNavMatches[0];
  assert((socialNav.match(/<a /g) || []).length === 4 && (socialNav.match(/<svg /g) || []).length === 0, `${page} social navigation must contain four explicit text links`);
  const observedSocialOrder = socialProfiles.map(([, url]) => socialNav.indexOf(`href="${url}"`));
  assert(observedSocialOrder.every((index) => index >= 0) && observedSocialOrder.every((index, position) => position === 0 || index > observedSocialOrder[position - 1]), `${page} social links must preserve the approved order`);
  for (const [name, url] of socialProfiles) {
    const localizedLabel = page === "index.html" ? `Landometer บน ${name} — เปิดในแท็บใหม่` : `Landometer on ${name} — opens in a new tab`;
    assert((html.split(url).length - 1) === 1, `${page} must expose ${name} exactly once`);
    assert(socialNav.includes(`href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${localizedLabel}" title="${name}"`), `${page} ${name} link is missing its safe target or localized accessible name`);
  }
  assert(!socialNav.includes("<svg"), `${page} social links must stay explicit text rather than decorative icon-only controls`);
  const footerEnd = html.lastIndexOf("</footer>");
  const rootEnd = html.lastIndexOf("</div>");
  assert(footerEnd > 0 && rootEnd > footerEnd && html.slice(footerEnd + "</footer>".length, rootEnd).trim() === "", `${page} must not contain layout content after the footer`);
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
  const datasetPreviewImages = html.match(/<a class="dataset-image"[^>]*><img[^>]*>/g) || [];
  assert(datasetPreviewImages.length === 38, `${page} must render 38 dataset preview images`);
  assert(datasetPreviewImages.every((image) => image.includes('loading="lazy"') && image.includes('decoding="async"')), `${page} dataset previews must be lazy and asynchronously decoded before hydration`);
  assert(datasetPreviewImages.every((image) => image.includes("media/previews-v3/") && image.includes('width="800" height="500"')), `${page} dataset cards must use the 800x500 preview-v3 presentation set`);
  assert(datasetPreviewImages.every((image) => !image.includes("media/previews-v2/")), `${page} dataset cards must not reselect the heavyweight evidence capture`);
  const showcasePreviewImages = (html.match(/<article class="showcase-card[\s\S]*?<\/article>/g) || [])
    .map((card) => card.match(/<img[^>]*>/)?.[0] || "");
  assert(showcasePreviewImages.length === 6, `${page} must render six showcase preview images`);
  assert(showcasePreviewImages.every((image) => image.includes('loading="lazy"') && image.includes('decoding="async"')), `${page} showcase previews must be lazy and asynchronously decoded before hydration`);
  assert(showcasePreviewImages.every((image) => image.includes("media/previews-v2/") && image.includes('width="1200" height="750"')), `${page} showcase proof must retain the high-resolution evidence capture`);
  const intentPreviewImage = html.match(/<div class="intent-proof-visual"><img[^>]*>/)?.[0] || "";
  assert(intentPreviewImage.includes('loading="lazy"') && intentPreviewImage.includes('decoding="async"'), `${page} intent preview must be lazy and asynchronously decoded before hydration`);
  assert(intentPreviewImage.includes("media/previews-v2/") && intentPreviewImage.includes('width="1200" height="750"'), `${page} intent proof must retain the high-resolution evidence capture`);
  assert(!html.includes('decoding="async" decoding="async"'), `${page} contains a duplicate decoding attribute`);
  assert(!html.includes('class="demo-story-caption"') && !html.includes('class="demo-progress"'), `${page} still renders the retired hero caption overlay`);
  const heroFigure = html.match(/<figure class="demo-figure">[\s\S]*?<\/figure>/)?.[0] || "";
  assert(heroFigure && !heroFigure.includes("<figcaption>"), `${page} still renders the retired visible hero figcaption`);
  assert(html.includes('id="demo-transcript" class="visually-hidden"'), `${page} must retain the accessible hero transcript`);
  const transcript = heroFigure.match(/<div id="demo-transcript" class="visually-hidden">[\s\S]*?<\/ol><\/div>/)?.[0] || "";
  const expectedTranscriptTerms = page === "index.html"
    ? ["ประชากรจดทะเบียน", "อาคาร 3 มิติที่สวนพลู", "รายได้องค์กรปกครองส่วนท้องถิ่น", "อุปสงค์การท่องเที่ยว"]
    : ["Registered population", "3D buildings in Suan Plu", "Municipal revenue", "Tourism demand"];
  assert((transcript.match(/<li>/g) || []).length === 4, `${page} hero transcript must describe the four reel v3 source screens`);
  assert(expectedTranscriptTerms.every((term) => transcript.includes(term)), `${page} hero transcript does not match the reel v3 source order`);
  assert(!transcript.includes("รูปแบบโครงข่ายถนน") && !transcript.includes("street-network patterns"), `${page} hero transcript still describes the retired reel`);
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
  assert(!Object.hasOwn(catalog || {}, "numberOfItems"), `${page} JSON-LD DataCatalog must not use the ItemList-only numberOfItems property`);
  assert(catalog?.dataset?.length === contributorManifest.projectionSummary.datasetRecords, `${page} JSON-LD Dataset branch differs from the contributor projection`);
  assert(catalog?.hasPart?.length === contributorManifest.projectionSummary.eventRecords, `${page} JSON-LD event CreativeWork branch differs from the contributor projection`);
  const structuredRecords = [...catalog.dataset, ...catalog.hasPart];
  assert(structuredRecords.length === contributorManifest.projectionSummary.records && new Set(structuredRecords.map((entry) => entry["@id"])).size === contributorManifest.projectionSummary.records, `${page} JSON-LD must cover the contributor projection exactly once`);
  assert(catalog.dataset.every((entry) => entry["@type"] === "Dataset"), `${page} JSON-LD dataset branch contains a non-Dataset record`);
  assert(catalog.hasPart.every((entry) => entry["@type"] === "CreativeWork"), `${page} JSON-LD event branch contains a non-CreativeWork record`);
  for (const entry of structuredRecords) {
    const id = entry["@id"]?.split("#").at(-1);
    assert(entry.subjectOf?.url === routeById.get(id), `${page} JSON-LD route does not match the registry for ${id}`);
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
assert(previewManifest.revision === "2026-08-16-preview-v3", "Preview-v3 manifest revision is stale");
assert(previewManifest.generator?.pillow === "12.3.0" && previewManifest.generator?.libwebp === "1.6.0", "Preview-v3 encoder contract is stale");
assert(previewManifest.generator?.width === 800 && previewManifest.generator?.height === 500 && previewManifest.generator?.quality === 75 && previewManifest.generator?.method === 6, "Preview-v3 render settings are stale");
assert(previewManifest.files?.length === 38 && new Set(previewManifest.files.map((file) => file.name)).size === 38, "Preview-v3 manifest must contain 38 unique records");
let previewV2Bytes = 0;
let previewV3Bytes = 0;
for (const file of previewManifest.files) {
  const source = join(root, "media/previews-v2", file.name);
  const output = join(root, "media/previews-v3", file.name);
  assert(existsSync(source) && existsSync(output), `Preview-v3 pair is missing: ${file.name}`);
  assert(file.sourceSha256 === sha256(source) && file.sourceBytes === statSync(source).size, `Preview-v3 source evidence is stale: ${file.name}`);
  assert(file.outputSha256 === sha256(output) && file.outputBytes === statSync(output).size, `Preview-v3 generated bytes are stale: ${file.name}`);
  const dimensions = webpInfo(output);
  assert(file.width === 800 && file.height === 500 && dimensions.width === 800 && dimensions.height === 500, `Preview-v3 dimensions are stale: ${file.name}`);
  previewV2Bytes += file.sourceBytes;
  previewV3Bytes += file.outputBytes;
}
assert(previewV2Bytes === 3736630, "Preview-v2 source byte baseline changed");
assert(previewV3Bytes === previewManifest.totals.outputBytes && previewV3Bytes <= 1450000, "Preview-v3 must stay within the 1.45 MB catalog thumbnail budget");
assert(previewManifest.totals.sourceBytes === previewV2Bytes && previewManifest.totals.reductionPercent >= 60, "Preview-v3 manifest must record at least a 60% byte reduction");
assert(qrManifest.version === "2026-08-16" && qrManifest.datasets.length === 38 && qrManifest.pages.length === 2, "QR manifest coverage or revision is incomplete");
const landAppraisalQr = join(root, "media/qr/land-appraisal.png");
const landAppraisalQrInfo = pngInfo(landAppraisalQr);
const landAppraisalManifest = qrManifest.datasets.find((entry) => entry.id === "dataset-land-appraisal");
assert(landAppraisalManifest?.url === landAppraisalRoute, "Land Appraisal QR manifest must retain the Chonburi title-deed destination");
assert(landAppraisalManifest?.sha256 === landAppraisalQrHash && sha256(landAppraisalQr) === landAppraisalQrHash, "Land Appraisal QR must use the rescanned v20 bytes");
assert(landAppraisalQrInfo.width === 512 && landAppraisalQrInfo.height === 512 && landAppraisalQrInfo.colorType === 6, "Land Appraisal QR must remain a 512px RGBA PNG");
const landAppraisalSvg = join(root, "media/qr/land-appraisal.svg");
const landAppraisalSvgText = readFileSync(landAppraisalSvg, "utf8");
assert(sha256(landAppraisalSvg) === landAppraisalSvgHash, "Land Appraisal SVG QR bytes changed");
assert(landAppraisalSvgText.includes('<svg xmlns="http://www.w3.org/2000/svg"') && landAppraisalSvgText.includes('viewBox="0 0 45 45"') && landAppraisalSvgText.includes('shape-rendering="crispEdges"'), "Land Appraisal SVG QR must remain a standalone crisp vector asset");
assert(!landAppraisalSvgText.includes("citymeter-land-appraisal-share") && !landAppraisalSvgText.includes(".jpg"), "Land Appraisal SVG QR must never point to the social-share image");

for (const asset of [
  "CITYMETER_BRANDING_DEEPLINK_RELEASE_2026-08-14.md",
  "CITYMETER_PERFORMANCE_CLARITY_RELEASE_2026-08-15.md",
  "CITYMETER_ATMOSPHERE_SCROLL_RELEASE_2026-08-15.md",
  "CITYMETER_CATALOG_STORY_QR_RELEASE_2026-08-16.md",
  "CITYMETER_CATALOG_STRUCTURE_SIMPLIFICATION_RELEASE_2026-08-16.md",
  "CITYMETER_MOTION_SOCIAL_RELEASE_2026-08-16.md",
  "CITYMETER_MOTION_IMAGE_PERFORMANCE_RELEASE_2026-08-16.md",
  "CITYMETER_REBUILD_BRIEF.md",
  "assets/catalog-enhancements.js",
  "assets/catalog-enhancements.css",
  "assets/catalog-enhancements-v15.css",
  "assets/catalog-enhancements-v16.css",
  "assets/catalog-enhancements-v16.js",
  "assets/catalog-enhancements-v17.css",
  "assets/catalog-enhancements-v18.css",
  "assets/catalog-enhancements-v19.css",
  "assets/catalog-enhancements-v20.css",
  "assets/catalog-enhancements-v21.css",
  "assets/catalog-enhancements-v17.js",
  "assets/catalog-enhancements-v18.js",
  "assets/catalog-enhancements-v19.js",
  "assets/citymeter-fonts.css",
  "assets/font-assets.manifest.json",
  "assets/font-license-records.json",
  "assets/index-qbT50gkr-v3.js",
  "assets/index-qbT50gkr-v4.js",
  "assets/index-qbT50gkr-v5.js",
  "assets/index-qbT50gkr-v6.js",
  "assets/index-qbT50gkr-v9.js",
  "assets/index-qbT50gkr-v10.js",
  "assets/index-qbT50gkr-v11.js",
  "assets/index-qbT50gkr-v12.js",
  "scripts/apply-branding-route-release.mjs",
  "scripts/apply-performance-clarity-release.mjs",
  "scripts/apply-atmosphere-scroll-release.mjs",
  "scripts/apply-catalog-story-qr-release.mjs",
  "scripts/apply-catalog-structure-simplification-release.mjs",
  "scripts/apply-motion-social-release.mjs",
  "scripts/apply-motion-image-performance-release.mjs",
  "scripts/build-card-previews.py",
  "scripts/generate-qr-assets.mjs",
  "scripts/split-supporter-logos.sh",
  "scripts/build-hero-reel.sh",
  "scripts/apply-focus-copy.mjs",
  "media/gdcatalog-logo.png",
  "media/depa-dsure-tdc-lockup.png",
  "media/supporters/depa.png",
  "media/supporters/dsure-software.png",
  "media/supporters/digital-service-account.png",
  "media/qr/manifest.json",
  "media/qr/land-appraisal.svg",
  "media/previews-v3/manifest.json",
  "media/reel/citymeter-proof-v3.mp4",
  "media/reel/citymeter-proof-v3-exhibition.mp4",
  "media/reel/citymeter-proof-v3-poster.webp",
  "media/social/citymeter-land-appraisal-share-2026-08-14.jpg"
]) {
  assert(existsSync(join(root, asset)) && statSync(join(root, asset)).size > 0, `Missing release asset: ${asset}`);
}

for (const [asset, expectedHash] of [
  ["assets/index-qbT50gkr-v6.js", "b78332185bf7b86a3534e53c568b8b684d475e68c783ac0e7534066006aad4c6"],
  ["assets/index-qbT50gkr-v9.js", "8f857fe4f6fb9e6dd39460eec3a841ba9338e54d1f479b8964fb410c197b0116"],
  ["assets/index-qbT50gkr-v10.js", "7946213bc8edefccf8ff2a2ca594903b548c51d11399dd0ea408295e71ab27ea"],
  ["assets/index-qbT50gkr-v11.js", "09a4e3dcf3048027692a08daae8cd5761fea23f924d7a9ed38a8f624403f9967"],
  ["assets/index-qbT50gkr-v12.js", "f8d0f7d2f9fb5a643be4fce0310d025ab7559a458e04651580371cff03265600"],
  ["assets/catalog-enhancements-v17.css", "8f4c95eb631b64b41d1beb6554265189474fff8dde419b0c0d4b46f985b8ff3a"],
  ["assets/catalog-enhancements-v18.css", "5661979c5ca33a332c3f57fc5dd233daa468875e7d0b32d0684ed3846bfc592a"],
  ["assets/catalog-enhancements-v19.css", "e40c56eaf79c115349746c4ca721450342c5bba404e327e3882d25cb3ef7be95"],
  ["assets/catalog-enhancements-v20.css", "a8e2af8c2896907e61c4a0c8750efbe630f6f10e334dbcc0cac45899a1203743"],
  ["assets/catalog-enhancements-v21.css", "e34d4384f49c9d16b00f6746758ce93a4c04d2128f04f8e9cd905a7a03ab6f7a"],
  ["assets/catalog-enhancements-v17.js", "8838d5e11340db1e6ce460e4f4e2190ae1fa27edcce358ba7a987b7014a2db4d"],
  ["assets/catalog-enhancements-v18.js", "4ce3e722bf6c6e21e28db8f08a84fc05cbaeabcc0864a345c31987fac9215fb2"],
  ["assets/catalog-enhancements-v19.js", "43324277a611d0a79c488c13355e63418703168cd2d2844f7f3438195ea00ea3"],
  ["scripts/apply-atmosphere-scroll-release.mjs", "0c0d266f636c01902c3f66973892d7bddd72f4220d80f889b2714ef96ba37684"],
  ["scripts/apply-catalog-story-qr-release.mjs", "67056fe888b79cfb7e20b53bc7ca53f8155c6a7321c11812815ef6c04195b2a1"],
  ["scripts/apply-catalog-structure-simplification-release.mjs", "b9b2fcef8e3a7661b5621428a0d488f2529cd83a4ffe807f7bc6392bfba78701"],
  ["scripts/apply-motion-social-release.mjs", "e6dc51ff4910916678f88e61b0efabc4994486057bd0d49f8795b19aebf552f2"],
  ["scripts/apply-motion-image-performance-release.mjs", "31c537077449fe82bbb093f08bc6172c89ecb4b3161c45a952f0f447a4c42cc2"],
  ["scripts/build-card-previews.py", "31004c77cf5d530934e1f90857f319a4739b8a360b0ffc8afec0fd7469b75708"],
  ["scripts/generate-qr-assets.mjs", "67d0b0869e4faa377ab78611f4f80d996d0ecd491c4bba8b0b2f0c745f1369c3"]
]) {
  assert(sha256(join(root, asset)) === expectedHash, `Immutable release bytes changed: ${asset}`);
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
for (const priorVersion of [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) {
  assert(
    releaseMigration.includes(`.replaceAll("catalog-enhancements.css?v=${priorVersion}", "catalog-enhancements-v15.css")`),
    `Release migration must retain the CSS v${priorVersion} -> immutable v15 upgrade`
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
for (const priorVersion of [2, 3, 4, 5]) {
  assert(
    releaseMigration.includes(`.replaceAll("index-qbT50gkr-v3.js?v=${priorVersion}", "index-qbT50gkr-v4.js")`),
    `Release migration must retain the main bundle v3 query ${priorVersion} -> immutable v4 upgrade`
  );
}
assert(releaseMigration.includes("2026-08-15-pillar-card-surfaces"), "Release migration must bind the quiet-pillar receipt");
assert(releaseMigration.includes('data-pillar="${group}"'), "Release migration must add semantic pillar attributes to prerendered cards");
assert(releaseMigration.includes('"data-pillar":s.group') && releaseMigration.includes('"data-pillar":c.group'), "Release migration must add semantic pillar attributes to hydrated cards");
assert(releaseMigration.includes('.replaceAll("citymeter-share-2026-08-14.jpg", "citymeter-land-appraisal-share-2026-08-14.jpg")'), "Release migration must replace the retired tourism social card");
assert(releaseMigration.includes('หน้าจอ CityMETER แสดงราคาประเมินที่ดินด้วยแท่งข้อมูลสามมิติบนแผนที่'), "Release migration must set the Thai Land Appraisal social alt text");
assert(releaseMigration.includes('CityMETER Land Appraisal screen showing 3D data columns on a map'), "Release migration must set the English Land Appraisal social alt text");
assert(releaseMigration.includes('["คุยกับทีม Landometer ว่าควรเริ่มตรวจข้อมูลชุดไหน", "คุยกับทีม Landometer"]'), "Release migration must shorten the Thai contact title");
assert(releaseMigration.includes('["Ask the Landometer team where to start", "Talk to the Landometer team"]'), "Release migration must keep the English contact title in parity");
assert(releaseMigration.includes('<h1 id="page-title" lang="en">') && releaseMigration.includes('<a class="citymeter-label" href="#top" lang="en">'), "Release migration must preserve static language metadata");
assert(releaseMigration.includes('id:\"page-title\",children:c.hero.title') && releaseMigration.includes('id:\"page-title\",lang:\"en\",children:c.hero.title'), "Release migration must upgrade the compiled page-title language metadata");
assert(releaseMigration.includes('className:\"citymeter-label\",href:\"#top\",children:\"CityMETER\"') && releaseMigration.includes('className:\"citymeter-label\",href:\"#top\",lang:\"en\",children:\"CityMETER\"'), "Release migration must upgrade the compiled header-label language metadata");

const performanceMigration = readFileSync(join(root, "scripts/apply-performance-clarity-release.mjs"), "utf8");
for (const contract of [
  "2026-08-15-performance-clarity-v16",
  "index-qbT50gkr-v5.js",
  "catalog-enhancements-v16.css",
  "catalog-enhancements-v16.js",
  'loading:"lazy",decoding:"async"',
  'preload:"metadata"',
  "ประชากรจดทะเบียน",
  "Registered population",
  "--pillar-accent-land",
  "--pillar-accent-location",
  "--pillar-accent-living",
  'cache: "force-cache"'
]) {
  assert(performanceMigration.includes(contract), `Performance-clarity migration is missing: ${contract}`);
}

const atmosphereMigration = readFileSync(join(root, "scripts/apply-atmosphere-scroll-release.mjs"), "utf8");
for (const contract of [
  "2026-08-15-atmosphere-scroll-v17",
  "index-qbT50gkr-v6.js",
  "catalog-enhancements-v17.css",
  "catalog-enhancements-v17.js",
  "showcase-atmosphere",
  "supporter-logos-footer",
  "footer-meta",
  "(pointer: coarse)",
  "safe-area-inset-bottom",
  "--atmosphere-measure",
  "--atmosphere-ground",
  "--atmosphere-cultivate"
]) {
  assert(atmosphereMigration.includes(contract), `Atmosphere-scroll migration is missing: ${contract}`);
}

const catalogStoryMigration = readFileSync(join(root, "scripts/apply-catalog-story-qr-release.mjs"), "utf8");
for (const contract of [
  catalogStoryRelease,
  "index-qbT50gkr-v6.js",
  "index-qbT50gkr-v9.js",
  analysisBriefRecordOrder,
  "catalog-enhancements-v17.css",
  "catalog-enhancements-v18.css",
  "CatalogStructureDiagram",
  "catalog-structure-groups",
  "catalog-structure-whys",
  "data-group",
  "Why CityMETER",
  "Why Landometer"
]) {
  assert(catalogStoryMigration.includes(contract), `Catalog-story migration is missing: ${contract}`);
}
const qrGenerator = readFileSync(join(root, "scripts/generate-qr-assets.mjs"), "utf8");
for (const contract of ["--only", "dataset-land-appraisal", 'args.length === 2', 'args[1].length > 0', 'onlyId !== null', 'qrcode@1.5.4', 'isLandAppraisal ? "Q" : "M"', 'isLandAppraisal ? "512" : "256"', "2026-08-16"]) {
  assert(qrGenerator.includes(contract), `QR generator is missing the one-asset Land Appraisal contract: ${contract}`);
}
const catalogStoryReceipt = readFileSync(join(root, "CITYMETER_CATALOG_STORY_QR_RELEASE_2026-08-16.md"), "utf8");
for (const contract of [catalogStoryRelease, landAppraisalRoute, landAppraisalQrHash, "Land", "Location", "Living", "Local Decisions", "Why CityMETER", "Why Landometer"]) {
  assert(catalogStoryReceipt.includes(contract), `Catalog-story QR release receipt is missing: ${contract}`);
}
const catalogStructureMigration = readFileSync(join(root, "scripts/apply-catalog-structure-simplification-release.mjs"), "utf8");
for (const contract of [
  catalogStructureRelease,
  "index-qbT50gkr-v9.js",
  "index-qbT50gkr-v10.js",
  "catalog-enhancements-v17.css",
  "catalog-enhancements-v19.css",
  "catalog-structure-flow",
  "catalog-structure-citymeter",
  "catalog-structure-outcome-route",
  "Land คือฐานของเมือง",
  "One city, seen through three connected lenses"
]) {
  assert(catalogStructureMigration.includes(contract), `Catalog simplification migration is missing: ${contract}`);
}
const catalogStructureReceipt = readFileSync(join(root, "CITYMETER_CATALOG_STRUCTURE_SIMPLIFICATION_RELEASE_2026-08-16.md"), "utf8");
for (const contract of [catalogStructureRelease, "Land", "Living", "Location", "CityMETER", "Landometer → Local Decisions", "1180px", "not published"]) {
  assert(catalogStructureReceipt.includes(contract), `Catalog simplification receipt is missing: ${contract}`);
}
const atmosphereRelease = readFileSync(join(root, "CITYMETER_ATMOSPHERE_SCROLL_RELEASE_2026-08-15.md"), "utf8");
assert((atmosphereRelease.match(/`deletionTest: improves`/g) || []).length === 3, "Every rendered atmosphere moment needs a completed improving deletion test");
assert((atmosphereRelease.match(/`evidenceRef:/g) || []).length === 3, "Every rendered atmosphere deletion test needs an evidence reference");

const responsiveHarness = readFileSync(join(root, "mobile-qa.html"), "utf8");
for (const width of [320, 390, 430, 720, 900, 901, 1120, 1440]) {
  assert(responsiveHarness.includes(`data-width="${width}"`), `Responsive QA harness is missing ${width}px`);
}
assert(responsiveHarness.includes("box-sizing: content-box"), "Responsive iframe width must equal its content viewport");

const thHtml = readFileSync(join(root, "index.html"), "utf8");
const enHtml = readFileSync(join(root, "en/index.html"), "utf8");
const baseCss = readFileSync(join(root, "assets/index-cqxdfePB.css"), "utf8");
const motionSocialEnhancementJs = readFileSync(join(root, "assets/catalog-enhancements-v18.js"), "utf8");
const enhancementJs = readFileSync(join(root, contributorManifest.renderOwners.transitionalEnhancer), "utf8");
const previousEnhancementCss = readFileSync(join(root, "assets/catalog-enhancements-v17.css"), "utf8");
const catalogStoryCss = readFileSync(join(root, "assets/catalog-enhancements-v18.css"), "utf8");
const catalogStructureCss = readFileSync(join(root, "assets/catalog-enhancements-v19.css"), "utf8");
const motionSocialCss = readFileSync(join(root, "assets/catalog-enhancements-v20.css"), "utf8");
const enhancementCss = readFileSync(join(root, contributorManifest.renderOwners.styles), "utf8");
const activeSurfaceCss = readFileSync(join(root, "assets", activeStylesName), "utf8");
const approachRevealJs = readFileSync(join(root, "assets", activeApproachRevealName), "utf8");
const canonicalFontCss = readFileSync(join(root, "assets/citymeter-fonts.css"), "utf8");
assert(catalogStoryCss.startsWith(previousEnhancementCss.trimEnd()), "Historical catalog CSS v18 must preserve immutable v17 before its scoped diagram block");
assert(catalogStructureCss.startsWith(previousEnhancementCss.trimEnd()), "Catalog CSS v19 must preserve immutable v17 before the simplified diagram block");
assert(motionSocialCss.startsWith(catalogStructureCss.trimEnd()), "Motion/social CSS v20 must preserve immutable v19 before its scoped release block");
assert(enhancementCss.startsWith(motionSocialCss.trimEnd()), "Active P1 CSS must preserve immutable v20 before its scoped contributor block");
assert(activeSurfaceCss.includes('html[data-lm-approach="armed"] [data-lm-reveal-role]'), "Active surface CSS is missing the bounded approach-reveal state");
assert(activeSurfaceCss.includes("opacity 1200ms cubic-bezier(.16, 1, .3, 1)") && activeSurfaceCss.includes("transform 1450ms cubic-bezier(.2, .9, .25, 1.08)") && activeSurfaceCss.includes("transition-duration: 1350ms, 1350ms"), "Active surface CSS owner-directed perceivable reveal timings drifted");
assert(activeSurfaceCss.includes("@media print, (prefers-reduced-motion: reduce)"), "Active surface CSS must settle reveals for print and reduced motion");
assert((approachRevealJs.match(/new window\.IntersectionObserver/g) || []).length === 1, "Approach reveal must own exactly one document observer");
assert((approachRevealJs.match(/new window\.MutationObserver/g) || []).length === 1, "Approach reveal must own exactly one dynamic-catalogue observer");
for (const contract of ['threshold: 0.14', 'rootMargin: "0px 0px -12% 0px"', "observer.unobserve(node)", "var INITIALIZATION_WATCHDOG_MS = 2400", "initializationTimedOut = true", 'window.requestAnimationFrame(function ()', 'mutationObserver.observe(catalogRoot, { childList: true, subtree: true })']) {
  assert(approachRevealJs.includes(contract), `Approach reveal safety contract is missing: ${contract}`);
}
assert(/group: "dataset-previews",\s*stagger: false/.test(approachRevealJs), "Dataset previews must reveal individually without a 38-item stagger queue");
assert(!/landometer-motifs|motif-placement|<lm-motif\b|data-motif-/i.test(`${activeSurfaceCss}\n${approachRevealJs}`), "Active slow reveal must remain independent of the removed motif layer");
const catalogCssDelta = catalogStructureCss.slice(previousEnhancementCss.trimEnd().length);
const motionSocialCssDelta = motionSocialCss.slice(catalogStructureCss.trimEnd().length);
const v23CssDelta = enhancementCss.slice(motionSocialCss.trimEnd().length);
for (const required of [
  ".explorer-section .catalog-structure",
  "width: min(100%, 1180px)",
  "catalog-structure-flow",
  "catalog-structure-citymeter",
  "catalog-structure-outcome-route",
  'data-group="land"',
  'data-group="living"',
  'data-group="location"',
  "@media (max-width: 720px)",
  "@media (max-width: 430px)"
]) {
  assert(catalogCssDelta.includes(required), `Catalog diagram CSS is missing: ${required}`);
}
for (const retired of ["catalog-structure-together", "catalog-structure-whys", "catalog-structure-local-decisions", "catalog-structure-benefits", "catalog-structure-boundary"]) {
  assert(!catalogCssDelta.includes(retired), `Simplified catalog CSS must not restore the retired text-wall selector: ${retired}`);
}
for (const prohibited of ["overflow-x: auto", "background-attachment: fixed", "backdrop-filter", "animation:", "position: fixed", "position: sticky"]) {
  assert(!catalogCssDelta.includes(prohibited), `Catalog diagram CSS contains a prohibited behavior: ${prohibited}`);
}
assert(!/data-group[^{}]*gradient|gradient[^{}]*data-group/i.test(catalogCssDelta), "Catalog groups must use flat surfaces, not atmosphere gradients");
assert(!/\.catalog-structure-caption h3\s*\{[^}]*line-height:/s.test(catalogCssDelta), "Catalog heading must inherit the locale-specific Thai/English line-height contract");
assert(/\.explorer-section \.catalog-structure-citymeter,\s*\.explorer-section \.catalog-structure-outcome\s*\{[\s\S]*?background:\s*var\(--catalog-simple-panel\)/.test(catalogCssDelta), "CityMETER and outcome bands must retain the complete local panel background contract");
assert(catalogCssDelta.includes(".explorer-section .catalog-structure-outcome-route b { color: var(--catalog-simple-text); }"), "Catalog outcome label must use the local simple-text contract");
assert(/\.catalog-structure-citymeter > p,\s*\.explorer-section \.catalog-structure-outcome p\s*\{[^}]*color:\s*var\(--catalog-simple-secondary\)/.test(catalogCssDelta), "CityMETER and outcome copy must use the local secondary-text contract");
for (const required of [
  ".explorer-section",
  "overflow-x: clip",
  ".site-footer .footer-social",
  "width: 44px",
  "height: 44px",
  "var(--pillar-border-default)",
  "var(--pillar-interaction-accent)",
  "@media (prefers-reduced-motion: reduce)"
]) {
  assert(motionSocialCssDelta.includes(required), `Motion/social CSS is missing: ${required}`);
}
for (const prohibited of ["transition: all", "animation:", "position: fixed", "background-attachment: fixed", "backdrop-filter"]) {
  assert(!motionSocialCssDelta.includes(prohibited), `Motion/social CSS contains a prohibited behavior: ${prohibited}`);
}
for (const required of [
  ".intent-tab .intent-icon",
  ".intent-tab > svg",
  ".site-footer .footer-social a:focus-visible",
  "@media (hover: hover) and (pointer: fine)"
]) {
  assert(v23CssDelta.includes(required), `V23 groove CSS is missing: ${required}`);
}
for (const prohibited of ["transition: all", "animation:", "position: fixed", "background-attachment: fixed", "backdrop-filter", "will-change"]) {
  assert(!v23CssDelta.includes(prohibited), `V23 groove CSS contains a prohibited behavior: ${prohibited}`);
}
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

function hexRgb(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function relativeLuminance(hex) {
  const channels = hexRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

function interpolateHex(first, second, progress) {
  const start = hexRgb(first);
  const end = hexRgb(second);
  return `#${start.map((channel, index) => Math.round(channel + (end[index] - channel) * progress).toString(16).padStart(2, "0")).join("")}`;
}

function minimumGradientContrast(stops, offsets, foreground) {
  let minimum = Number.POSITIVE_INFINITY;
  for (let sample = 0; sample <= 1000; sample += 1) {
    const position = sample / 1000;
    const segment = position <= offsets[1] ? 0 : 1;
    const progress = (position - offsets[segment]) / (offsets[segment + 1] - offsets[segment]);
    minimum = Math.min(minimum, contrastRatio(interpolateHex(stops[segment], stops[segment + 1], progress), foreground));
  }
  return minimum;
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
assert(enhancementJs.includes('logo.className = "gd-lineage-logo"') && enhancementJs.includes('logo.src = `${assetBase}media/gdcatalog-logo.png`'), "Verified GD Catalog lineage must keep its governed logo treatment");
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
assert(enhancementJs.includes('const duration = snapshot.reason === "search" ? 200 : 280'), "Card reflow motion must preserve the 280ms state duration and faster search acknowledgement");
assert(enhancementJs !== motionSocialEnhancementJs, "Enhancement v19 must contain the approved groove and image-performance refinement");
assert(enhancementJs.includes('animation.id === "citymeter-intent-reveal"'), "Starting a new interaction must cancel any in-flight intent reveal");
const captureOwnerStart = enhancementJs.indexOf("  function captureCardLayout(control)");
const captureOwnerEnd = enhancementJs.indexOf("  function revealOpenedDetails(details)", captureOwnerStart);
assert(captureOwnerStart >= 0 && captureOwnerEnd > captureOwnerStart, "Motion capture owner is missing");
const captureOwner = enhancementJs.slice(captureOwnerStart, captureOwnerEnd);
const reducedBranch = captureOwner.indexOf('if (reducedMotion.matches || typeof Element.prototype.animate !== "function")');
const reducedCancel = captureOwner.indexOf("cancelLayoutAnimations();", reducedBranch);
const rectCapture = captureOwner.indexOf("const rects = layoutEnabled");
const continuityCancel = captureOwner.indexOf("cancelLayoutAnimations();", rectCapture);
const snapshotAssignment = captureOwner.indexOf("pendingLayoutMotion = {", continuityCancel);
assert(reducedBranch >= 0 && reducedCancel > reducedBranch && reducedCancel < rectCapture, "Reduced motion must cancel in-flight animations before returning the final state");
assert(rectCapture >= 0 && continuityCancel > rectCapture && snapshotAssignment > continuityCancel, "Rapid interaction continuity requires visual rect capture before canceling the previous ripple");
for (const contract of [
  "layoutMotionSequence",
  "details: [0, 40, 64, 104, 128, 168]",
  "filter: [0, 28, 44, 72, 88, 108]",
  "search: [0, 24, 40, 64, 80, 96]",
  "intent: [0, 32, 52, 84, 104]",
  "const duration = snapshot.reason === \"search\" ? 200 : 280",
  'animation.id === "citymeter-results-ack"',
  "const entryDelays = [0, 44, 68, 112, 136]",
  "const delays = [0, 48, 72, 120, 144]",
  "index * 48",
  "snapshot.sequence !== layoutMotionSequence",
  "Math.abs(globalThis.scrollY - snapshot.scrollY) > 4",
  "isNearViewport",
  'fill: "backwards"',
  "abortedForScroll: scrollChanged",
  "layoutEnabled = !coarsePointer.matches",
  'reducedMotion.addEventListener?.("change", settleReducedMotion)',
  "layoutMotionSequence += 1"
]) {
  assert(enhancementJs.includes(contract), `Groove-motion contract is missing: ${contract}`);
}
for (const prohibited of ["scrollIntoView", "scrollTo(", "transition: all", "max-height", "height.animate", "commitStyles", "iterations: Infinity"] ) {
  assert(!enhancementJs.includes(prohibited), `Groove motion contains a prohibited layout or scroll behavior: ${prohibited}`);
}
for (const performanceContract of [
  "function installDatasetPreviewWarmup()",
  'rootMargin: "1000px 0px"',
  '.slice(0, 3)',
  'image.loading = "eager"',
  'image.fetchPriority = "high"',
  '"skipped-data-saver"',
  "function loadSourceRegistry()",
  "20260816-motion-image-performance-v23",
  "const registryResultPromise = loadSourceRegistry()"
]) {
  assert(enhancementJs.includes(performanceContract), `Image-performance contract is missing: ${performanceContract}`);
}
assert(!enhancementJs.includes("querySelectorAll(\".dataset-card .dataset-image img\")).forEach") && !enhancementJs.includes("preloadAll"), "V23 must not eagerly warm the full 38-card catalog");
assert(enhancementJs.includes("record?.citymeterUrl"), "Runtime direct-route override is missing");
assert(enhancementJs.includes(".dataset-mobile-link"), "Runtime direct-route override must cover the mobile handoff link");
assert(enhancementJs.includes("supporter-logos-hero"), "Runtime hero supporter group is missing");
for (const asset of supporterAssets) {
  assert(enhancementJs.includes(asset.path), `Runtime supporter asset is missing: ${asset.path}`);
}
assert(!enhancementJs.includes("media/depa-dsure-tdc-lockup.png"), "Runtime must not use the old combined supporter lockup");
assert(enhancementJs.includes('supporterAlt: {') && enhancementJs.includes('account: "บัญชีบริการดิจิทัล"') && enhancementJs.includes('account: "Digital Service Account"'), "Supporter logos need individual localized alt text");
assert(enhancementJs.includes('if (pageTitle.lang !== "en") pageTitle.lang = "en"'), "Runtime must preserve the English language metadata on the CityMETER page title");
assert(enhancementJs.includes('if (citymeterLabel && citymeterLabel.lang !== "en") citymeterLabel.lang = "en"'), "Runtime must preserve the English language metadata on the CityMETER header label");
assert(enhancementCss.includes(".site-footer .footer-grid > *") && enhancementCss.includes("flex-wrap: wrap"), "Footer grid children and links must be allowed to shrink and wrap");
assert(enhancementCss.includes("@media (max-width: 900px)") && enhancementCss.includes("grid-template-columns: 1fr"), "Footer must collapse before the former 720px overflow band");
assert(enhancementCss.includes(".site-footer .footer-meta") && enhancementCss.includes("justify-items: end"), "Footer navigation and legal copy must share one stable metadata column");
assert(!enhancementJs.includes("function enhanceFooterBranding") && !enhancementJs.includes("enhanceFooterBranding();"), "Footer supporters must not be injected after hydration");
assert(enhancementJs.includes('globalThis.matchMedia("(pointer: coarse)")') && enhancementJs.includes("coarsePointer.matches"), "Coarse pointers must bypass transformed card-layout motion that can pollute WebKit scroll overflow");
assert(normalizedCss(enhancementCss).includes("html,body{overscroll-behavior-y:none;}"), "Root scrolling must retain the available overscroll boundary hint");
assert(normalizedCss(enhancementCss).includes("html,body,#root{background:var(--section-surface-footer);}"), "The exposed root canvas must continue the footer surface on iOS elastic pull");
assert(enhancementCss.includes("env(safe-area-inset-bottom, 0px)"), "Footer must account for the iPhone bottom safe area without a fixed spacer");
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

const lightSurfaceCss = cssBlock(":root");
const darkSurfaceCss = cssBlock('[data-theme="dark"]');
for (const [token, light, dark] of [
  ["--atmosphere-measure", "linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%)", "linear-gradient(135deg, #89CEF6 0%, #5ECAD6 50%, #6CD5B3 100%)"],
  ["--atmosphere-ground", "linear-gradient(135deg, #C4E0EE 0%, #B2E2E2 50%, #CCE6D0 100%)", "linear-gradient(135deg, #0F5773 0%, #006A6A 50%, #1F744F 100%)"],
  ["--atmosphere-cultivate", "linear-gradient(135deg, #EB8182 0%, #F5A06F 50%, #EBC573 100%)", "linear-gradient(135deg, #F7CBC7 0%, #FBD1B6 50%, #F1E0B4 100%)"]
]) {
  assert(normalizedCss(cssValue(lightSurfaceCss, token)) === normalizedCss(light), `Light atmosphere recipe is stale: ${token}`);
  assert(normalizedCss(cssValue(darkSurfaceCss, token)) === normalizedCss(dark), `Dark atmosphere recipe is stale: ${token}`);
}
for (const [family, lightPrimary, lightSecondary, darkPrimary, darkSecondary] of [
  ["measure", "#ffffff", "#f1f4ef", "#182327", "#293337"],
  ["ground", "#182327", "#293337", "#ffffff", "#f1f4ef"],
  ["cultivate", "#182327", "#293337", "#182327", "#293337"]
]) {
  assert(cssValue(lightSurfaceCss, `--atmosphere-${family}-primary`) === lightPrimary, `Light ${family} primary foreground is stale`);
  assert(cssValue(lightSurfaceCss, `--atmosphere-${family}-secondary`) === lightSecondary, `Light ${family} secondary foreground is stale`);
  assert(cssValue(darkSurfaceCss, `--atmosphere-${family}-primary`) === darkPrimary, `Dark ${family} primary foreground is stale`);
  assert(cssValue(darkSurfaceCss, `--atmosphere-${family}-secondary`) === darkSecondary, `Dark ${family} secondary foreground is stale`);
}
for (const [name, stops, offsets, primary, secondary] of [
  ["Measure Deep", ["#1D4497", "#176B82", "#08756F"], [0, 0.54, 1], "#FFFFFF", "#F1F4EF"],
  ["Measure Luminous", ["#89CEF6", "#5ECAD6", "#6CD5B3"], [0, 0.5, 1], "#182327", "#293337"],
  ["Ground Mist", ["#C4E0EE", "#B2E2E2", "#CCE6D0"], [0, 0.5, 1], "#182327", "#293337"],
  ["Ground Current", ["#0F5773", "#006A6A", "#1F744F"], [0, 0.5, 1], "#FFFFFF", "#F1F4EF"],
  ["Cultivate Glow", ["#EB8182", "#F5A06F", "#EBC573"], [0, 0.5, 1], "#182327", "#293337"],
  ["Cultivate Mist", ["#F7CBC7", "#FBD1B6", "#F1E0B4"], [0, 0.5, 1], "#182327", "#293337"]
]) {
  assert(minimumGradientContrast(stops, offsets, primary) >= 4.5, `${name} primary foreground falls below 4.5:1`);
  assert(minimumGradientContrast(stops, offsets, secondary) >= 4.5, `${name} secondary foreground falls below 4.5:1`);
}
assert(cssValue(cssBlock(".hero"), "background") === "var(--atmosphere-measure)", "Hero must consume the Measure entry atmosphere");
assert(cssValue(cssBlock(".showcase-atmosphere"), "background") === "var(--atmosphere-ground)", "Examples orientation band must consume Ground atmosphere");
assert(cssValue(cssBlock(".handoff-section"), "background") === "var(--atmosphere-cultivate)", "Handoff must consume Cultivate closure atmosphere");
const heroQrCss = exactCssBlock(".hero-page-qr");
assert(cssValue(heroQrCss, "background") === "#11191d" && cssValue(heroQrCss, "color") === "#ffffff", "Hero QR must own an opaque onDeep surface contract");
assert(cssValue(heroQrCss, "backdrop-filter") === "none" && cssValue(heroQrCss, "-webkit-backdrop-filter") === "none", "Hero QR must not restore a translucent blur over Measure Luminous");
assert(cssValue(exactCssBlock(".hero-page-qr-copy span"), "color") === "#f1f4ef", "Hero QR secondary copy must use the onDeep foreground contract");
const handoffQrCss = exactCssBlock(".handoff-section .qr-card");
for (const [token, expected] of [
  ["--text", "#182327"],
  ["--text-secondary", "#293337"],
  ["--text-meta", "#293337"],
  ["--accent", "#176b82"],
  ["--card", "#ffffff"],
  ["--border", "#7d877f"]
]) {
  assert(cssValue(handoffQrCss, token) === expected, `Handoff QR local foreground contract is stale: ${token}`);
}
assert(cssValue(handoffQrCss, "background") === "var(--card)" && cssValue(handoffQrCss, "color") === "var(--text)", "Handoff QR must consume its component-owned surface and foreground tokens");
assert(!/data-pillar[^{}]*gradient|gradient[^{}]*data-pillar/i.test(enhancementCss), "Atmosphere gradients must never encode Land, Location or Living");
assert(!/animation[^{}]*gradient|background-attachment\s*:\s*fixed/i.test(enhancementCss), "Atmosphere gradients must remain static and bounded");
const sectionSurfaces = [
  ["decision", ".decision-section", "#f6f7f3", "#11191d"],
  ["showcase", ".showcase-section", "#eef1ee", "#172126"],
  ["explorer", ".explorer-section", "#f6f7f3", "#11191d"],
  ["contact", ".contact-section", "#e5e9e6", "#2b3534"],
  ["footer", ".site-footer", "#eef1ee", "#172126"]
];
for (const [name, selector, light, dark] of sectionSurfaces) {
  const token = `--section-surface-${name}`;
  assert(cssValue(lightSurfaceCss, token) === light, `Light ${name} surface token is stale`);
  assert(cssValue(darkSurfaceCss, token) === dark, `Dark ${name} surface token is stale`);
  assert(cssValue(exactCssBlock(selector), "background") === `var(${token})`, `${selector} must consume ${token}`);
}
const pillarSurfaces = [
  ["land", "#f2f1df", "#2c2a22", "#846100", "#f4c44e"],
  ["location", "#e2e9ed", "#18333e", "#1f629b", "#4c99d5"],
  ["living", "#e5e9e6", "#2b3534", "#007a58", "#3bd19b"]
];
for (const [pillar, light, dark, lightAccent, darkAccent] of pillarSurfaces) {
  const token = `--pillar-surface-${pillar}`;
  const accentToken = `--pillar-accent-${pillar}`;
  assert(cssValue(lightSurfaceCss, token) === light, `Light ${pillar} pillar surface is stale`);
  assert(cssValue(darkSurfaceCss, token) === dark, `Dark ${pillar} pillar surface is stale`);
  assert(cssValue(lightSurfaceCss, accentToken) === lightAccent, `Light ${pillar} categorical accent is stale`);
  assert(cssValue(darkSurfaceCss, accentToken) === darkAccent, `Dark ${pillar} categorical accent is stale`);
  const normalizedSource = normalizedCss(enhancementCss);
  assert(
    normalizedSource.includes(`.dataset-card[data-pillar="${pillar}"],.showcase-card[data-pillar="${pillar}"]{--pillar-surface:var(${token});--pillar-accent:var(${accentToken});}`),
    `${pillar} cards must consume ${token} and ${accentToken}`
  );
}
for (const [token, light, dark] of [
  ["--pillar-text-primary", "#182327", "#f1f4ef"],
  ["--pillar-text-secondary", "#5f635a", "#c4ceca"],
  ["--pillar-text-metadata", "#686354", "#a6b5b1"],
  ["--pillar-border-hairline", "#dce1dd", "#33403d"],
  ["--pillar-border-default", "#c9d0cb", "#46524f"],
  ["--pillar-border-emphasis", "#7d877f", "#7c8a84"],
  ["--pillar-interaction-accent", "#176b82", "#68c4e2"],
  ["--pillar-surface-raised", "#ffffff", "#293337"],
  ["--pillar-surface-alt", "#eef1ee", "#172126"],
  ["--pillar-accent-ink", "#ffffff", "#182327"]
]) {
  assert(cssValue(lightSurfaceCss, token) === light, `Light local pillar contract is stale: ${token}`);
  assert(cssValue(darkSurfaceCss, token) === dark, `Dark local pillar contract is stale: ${token}`);
}
assert(
  normalizedCss(enhancementCss).includes(".dataset-card[data-pillar],.showcase-card[data-pillar]{--text:var(--pillar-text-primary);--text-secondary:var(--pillar-text-secondary);--text-meta:var(--pillar-text-metadata);--hairline:var(--pillar-border-hairline);--border:var(--pillar-border-emphasis);--accent:var(--pillar-interaction-accent);--raised:var(--pillar-surface-raised);--canvas-soft:var(--pillar-surface-alt);--card:var(--pillar-surface);color:var(--text);background:var(--pillar-surface);border-color:var(--border);border-block-start:5pxsolidvar(--pillar-accent);}"),
  "Pillar cards must resolve the complete local foreground contract"
);
assert(enhancementCss.includes(".dataset-kicker > span:first-child") && enhancementCss.includes(".record-group"), "Pillar cards must retain a visible category label cue");
assert(enhancementCss.includes("background: var(--pillar-accent)") && enhancementCss.includes("color: var(--pillar-accent-ink)"), "Pillar category chips must use the governed local accent contract");
const runtimeStart = enhancementJs.slice(enhancementJs.indexOf("async function start()"));
assert(runtimeStart.includes("enhanceAfterHydration") && runtimeStart.includes('window.addEventListener("load", enhanceAfterHydration'), "Branding must wait for the window load boundary");
assert((runtimeStart.match(/requestAnimationFrame/g) || []).length >= 2, "Branding must wait two animation frames after load before mutating hydrated markup");
assert(enhancementJs.includes("waitForHydrationStability") && enhancementJs.includes("minimumDelayElapsed") && enhancementJs.includes("quietWindowElapsed"), "Branding must wait for a quiet hydration boundary before DOM mutation");
assert(enhancementJs.includes("}, 1000)") && enhancementJs.includes("}, 250)") && enhancementJs.includes("setTimeout(finish, 3000)"), "Hydration stability timing contract is stale");
assert(runtimeStart.includes("registryResultPromise") && enhancementJs.includes(".catch((error) => ({ error }))"), "Branding must remain available when the source registry fails");
assert(enhancementJs.includes("catalog-source-review.json?v=20260816-motion-image-performance-v23") && enhancementJs.includes('cache: "force-cache"'), "Source registry must start concurrently and remain bound to the immutable v23 cache key");
assert(runtimeStart.indexOf("const registryResultPromise = loadSourceRegistry()") < runtimeStart.indexOf("await waitForHydrationStability()"), "Registry fetch must begin before the hydration quiet wait");
assert(runtimeStart.indexOf("enhanceHero();") < runtimeStart.indexOf("await registryResultPromise"), "Hero enhancement must not wait for the source registry");
for (const retiredRuntime of ["renderHeroChapter", "heroTimer", "heroVideo", "video.load()", 'url.searchParams.set("v"']) {
  assert(!enhancementJs.includes(retiredRuntime), `Retired duplicate-load or hero-timer behavior remains: ${retiredRuntime}`);
}
assert(enhancementJs.includes('video.preload = "metadata"'), "Hero enhancement must preserve metadata-only preload");
const enhanceHeroStart = enhancementJs.indexOf("  function enhanceHero()");
const enhanceHeroEnd = enhancementJs.indexOf("  function applyEnhancements()", enhanceHeroStart);
assert(enhanceHeroStart >= 0 && enhanceHeroEnd > enhanceHeroStart, "Hero enhancement owner cannot be resolved");
const enhanceHeroOwner = enhancementJs.slice(enhanceHeroStart, enhanceHeroEnd);
assert(!enhanceHeroOwner.includes(".play(") && !enhanceHeroOwner.includes(".autoplay = true") && !enhanceHeroOwner.includes("catalogAutoplayTried"), "Enhancer must not override the React-owned viewport and network autoplay policy");
assert(enhancementJs.includes('shell.querySelectorAll(".demo-story-caption, .demo-progress").forEach((node) => node.remove())'), "Hero enhancement must remove stale visible caption overlays");
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

const previousMainBundle = readFileSync(join(root, "assets/index-qbT50gkr-v9.js"), "utf8");
const catalogStructureMainBundle = readFileSync(join(root, "assets/index-qbT50gkr-v10.js"), "utf8");
const motionSocialMainBundle = readFileSync(join(root, "assets/index-qbT50gkr-v11.js"), "utf8");
const imagePerformanceMainBundle = readFileSync(join(root, "assets/index-qbT50gkr-v12.js"), "utf8");
const mainBundle = readFileSync(join(root, contributorManifest.renderOwners.hydratedBundle), "utf8");
assert(catalogStructureMainBundle !== previousMainBundle, "Main bundle v10 must contain the governed catalog simplification");
assert(motionSocialMainBundle !== catalogStructureMainBundle, "Main bundle v11 must contain the hydration-owned social footer");
assert(imagePerformanceMainBundle !== motionSocialMainBundle, "Main bundle v12 must contain the dataset-thumbnail and hero-network policy");
assert(mainBundle !== imagePerformanceMainBundle, "Active main bundle must contain the hardened P1 contributor owners");
const oldDatasetImageOwner = 'p.jsx("img",{src:ca(s.previewPath),alt:"",width:"1200",height:"750",loading:"lazy",decoding:"async"})';
const newDatasetImageOwner = 'p.jsx("img",{src:ca(s.previewPath.replace("media/previews-v2/","media/previews-v3/")),alt:"",width:"800",height:"500",loading:"lazy",decoding:"async"})';
const oldHeroStart = motionSocialMainBundle.indexOf("function U6(");
const oldHeroEnd = motionSocialMainBundle.indexOf("function B6(", oldHeroStart);
const newHeroStart = imagePerformanceMainBundle.indexOf("function U6(");
const newHeroEnd = imagePerformanceMainBundle.indexOf("function B6(", newHeroStart);
assert(oldHeroStart >= 0 && oldHeroEnd > oldHeroStart && newHeroStart >= 0 && newHeroEnd > newHeroStart, "Hero owner transaction cannot be resolved");
const oldHeroOwner = motionSocialMainBundle.slice(oldHeroStart, oldHeroEnd);
const newHeroOwner = imagePerformanceMainBundle.slice(newHeroStart, newHeroEnd);
const oldSchemaStart = motionSocialMainBundle.indexOf("function L6()");
const oldSchemaEnd = motionSocialMainBundle.indexOf("function _f()", oldSchemaStart);
const newSchemaStart = imagePerformanceMainBundle.indexOf("function L6()");
const newSchemaEnd = imagePerformanceMainBundle.indexOf("function _f()", newSchemaStart);
assert(oldSchemaStart >= 0 && oldSchemaEnd > oldSchemaStart && newSchemaStart >= 0 && newSchemaEnd > newSchemaStart, "JSON-LD owner transaction cannot be resolved");
const oldSchemaOwner = motionSocialMainBundle.slice(oldSchemaStart, oldSchemaEnd);
const newSchemaOwner = imagePerformanceMainBundle.slice(newSchemaStart, newSchemaEnd);
assert((motionSocialMainBundle.split(oldDatasetImageOwner).length - 1) === 1 && (imagePerformanceMainBundle.split(newDatasetImageOwner).length - 1) === 1, "Dataset preview owner transaction must be exact");
const oldHydrationTranscriptItem = 'p.jsxs("li",{children:[Z.kicker,". ",Z.title,". ",Z.note]},Z.start)';
const newHydrationTranscriptItem = 'p.jsx("li",{children:Z.kicker+". "+Z.title+". "+Z.note},Z.start)';
assert(imagePerformanceMainBundle.includes(newHydrationTranscriptItem) && !imagePerformanceMainBundle.includes(oldHydrationTranscriptItem), "Hero transcript must hydrate each static list item as one text node");
assert(imagePerformanceMainBundle.includes('if(typeof IntersectionObserver!=="function"){X(!1);return}') && !imagePerformanceMainBundle.includes('if(typeof IntersectionObserver!=="function"){X(!0);return}'), "Hero autoplay must fail closed when viewport observation is unavailable");
assert(newSchemaOwner.includes('link[rel="canonical"]') && newSchemaOwner.includes('.replace(/\\/en\\/?$/,"/")') && !newSchemaOwner.includes("url:Da"), "Hydrated JSON-LD must derive its root URL from the route canonical instead of the runtime share base");
const normalizedV12 = imagePerformanceMainBundle.replace(newDatasetImageOwner, oldDatasetImageOwner).replace(newHeroOwner, oldHeroOwner).replace(newSchemaOwner, oldSchemaOwner);
assert(normalizedV12 === motionSocialMainBundle, "Bundle v12 may differ from v11 only in the dataset preview, hero media and canonical JSON-LD owners");
assert(mainBundle.split(analysisBriefOldThai).length === 2, "Hydrated Thai analysis-brief must preserve the approved concise description exactly once");
assert(mainBundle.split(analysisBriefOldEnglish).length === 2, "Hydrated English analysis-brief must preserve the approved concise description exactly once");
assert(!mainBundle.includes(analysisBriefRejectedThai) && !mainBundle.includes(analysisBriefRejectedEnglish), "Hydrated bundle must not restore the rejected long analysis-brief copy");
assert(mainBundle.includes('title:"จะทำ analysis หรือ brief ให้ทีมใช้ต่ออย่างไร"'), "Thai analysis-brief title changed outside scope");
assert(mainBundle.includes('title:"How can an analysis or brief stay useful to the next team?"'), "English analysis-brief title changed outside scope");
assert(mainBundle.includes('"analysis-brief":"business-dynamics"'), "Analysis-brief must keep the Business Dynamics proof image and CTA owner");
assert(mainBundle.includes("h.recordIds.slice(0,5)"), "Analysis-brief must keep the five-link rendering contract");
assert(mainBundle.split(analysisBriefRecordOrder).length === 2, "Analysis-brief related-record order must appear exactly once");
const analysisOrderMatch = mainBundle.match(/\{id:"analysis-brief",number:"05",icon:"analysis-brief",anchor:"intent-analysis-brief",recordIds:\[([^\]]+)\]\}/);
assert(analysisOrderMatch, "Compiled analysis-brief intent record is missing");
const analysisOrder = JSON.parse(`[${analysisOrderMatch[1]}]`);
assert(
  JSON.stringify(analysisOrder) === JSON.stringify(["business-dynamics", "buildings", "population-age-sex", "road-network-archetypes", "factories-workers-investment", "locale-insights"]),
  "Analysis-brief related records must preserve all six records and move population to third"
);
const visibleAnalysisGroups = analysisOrder.slice(0, 5).map((id) => {
  const group = mainBundle.match(new RegExp(`id:"${id}",group:"([^"]+)"`))?.[1];
  assert(group, `Compiled group is missing for analysis-brief record: ${id}`);
  return group;
});
assert(
  JSON.stringify(visibleAnalysisGroups) === JSON.stringify(["location", "land", "living", "location", "location"]),
  "The first five analysis-brief links must visibly cover Location, Land and Living"
);
const catalogComponentStart = mainBundle.indexOf("function CatalogStructureDiagram(");
const catalogComponentEnd = mainBundle.indexOf("function Q6(", catalogComponentStart);
assert(catalogComponentStart >= 0 && catalogComponentEnd > catalogComponentStart, "Compiled catalog structure component is missing");
const catalogComponent = mainBundle.slice(catalogComponentStart, catalogComponentEnd);
for (const contract of [
  'className:"catalog-structure"',
  'className:"catalog-structure-flow"',
  'className:"catalog-structure-step"',
  'className:"catalog-structure-citymeter"',
  'className:"catalog-structure-outcome-route"',
  '"data-group":N',
  "p6.map",
  'lang:"en"'
]) {
  assert(catalogComponent.includes(contract), `Compiled catalog structure component is missing: ${contract}`);
}
for (const retired of ["catalog-structure-together", "catalog-structure-whys", "catalog-structure-local-decisions", "catalog-structure-benefits", "catalog-structure-boundary"]) {
  assert(!catalogComponent.includes(retired), `Compiled catalog component must not restore the retired text-wall block: ${retired}`);
}
assert(catalogComponent.includes('children:"+"') && catalogComponent.includes('children:"→"') && !catalogComponent.includes('children:"="'), "Compiled catalog component must show Land plus Living leading to Location without claiming equivalence");
assert(!/(?:img|video|canvas|iframe)|fetch\(|new Image/i.test(catalogComponent), "Compiled catalog diagram must remain request-free and static");
for (const copy of [
  "เข้าใจเมืองผ่าน 3 มุมที่เชื่อมกัน",
  "One city, seen through three connected lenses",
  "Land คือฐานของเมือง",
  "Land is the city’s base",
  "ผู้คน · บริการ · ความเป็นอยู่",
  "People · services · everyday life",
  "รวม 38 มุมมองให้ค้น เทียบ และเปิดดูหลักฐานในที่เดียว",
  "Organises 38 views so people can find, compare and inspect evidence in one place.",
  "ช่วยให้เห็นว่าควรตรวจอะไรต่อ และตัดสินใจเรื่องพื้นที่ได้อย่างไร",
  "Shows what to check next and how to move a place decision forward."
]) {
  assert(mainBundle.includes(copy), `Compiled catalog story is missing localized copy: ${copy}`);
}
for (const retiredCopy of ["City data is complex. Using it should not be.", "ข้อมูลเมืองซับซ้อน แต่การใช้งานไม่ควรซับซ้อน", "Why CityMETER", "Why Landometer", 'label:"Deep",body:"See connections"', 'label:"ลึก",body:"เห็นความเชื่อมโยง"', "People · needs", "ผู้คน · ความต้องการ", "not 38 source databases", "ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน"]) {
  assert(!mainBundle.includes(retiredCopy), `Compiled bundle must not restore the retired catalog text wall: ${retiredCopy}`);
}
const explorerComponentEnd = mainBundle.indexOf("function X6(", catalogComponentEnd);
const explorerComponent = mainBundle.slice(catalogComponentEnd, explorerComponentEnd);
const explorerHeadingOwner = explorerComponent.indexOf('id:"datasets-title"');
const diagramOwner = explorerComponent.indexOf("p.jsx(CatalogStructureDiagram,{language:c,text:f})");
const toolbarOwner = explorerComponent.indexOf('className:"explorer-toolbar"');
assert(explorerHeadingOwner >= 0 && explorerHeadingOwner < diagramOwner && diagramOwner < toolbarOwner, "Hydrated catalog diagram must remain between the heading and filters");
assert(explorerComponent.includes("Gl.length") && explorerComponent.includes("p6.map"), "Hydrated explorer must continue deriving catalog and pillar counts from canonical runtime data");
assert(mainBundle.includes("text:O.description,url:B"), "Native share must continue to use the active intent description and URL");
assert(mainBundle.includes('id:"page-title",lang:"en",children:c.hero.title'), "Compiled bundle must render the CityMETER page title with English language metadata");
assert(mainBundle.includes('className:"citymeter-label",href:"#top",lang:"en",children:"CityMETER"'), "Compiled bundle must render the CityMETER header label with English language metadata");
assert(mainBundle.includes('className:d<2?"showcase-card showcase-card-wide":"showcase-card","data-pillar":s.group,children:'), "Compiled bundle must render semantic showcase pillars before hydration");
assert(mainBundle.includes('className:"dataset-card","data-pillar":c.group,id:'), "Compiled bundle must render semantic dataset pillars before hydration");
assert(mainBundle.includes('className:"showcase-atmosphere"') && mainBundle.includes('className:"wide-container showcase-content"'), "Compiled bundle must separate the Ground orientation band from flat showcase cards");
assert(mainBundle.includes('className:"supporter-logos supporter-logos-footer"') && mainBundle.includes('className:"footer-meta"'), "Compiled bundle must render the complete footer before hydration");
assert(mainBundle.includes('p.jsx(K6,{text:E,language:f})'), "Compiled footer must receive the active language for localized supporter metadata");
assert(mainBundle.includes('className:"footer-social"') && mainBundle.includes('"aria-label":d'), "Compiled footer must render the localized social navigation before hydration");
assert(mainBundle.includes('rel:"noopener noreferrer"') && mainBundle.includes('focusable:"false"') && mainBundle.includes('viewBox:"0 0 24 24"'), "Compiled social links must use safe new-tab behavior and decorative inline SVGs");
for (const [name, url] of socialProfiles) {
  assert((mainBundle.split(url).length - 1) === 1, `Compiled footer must expose ${name} exactly once`);
}
assert(mainBundle.includes('"Landometer บน "+N+" — เปิดในแท็บใหม่"') && mainBundle.includes('"Landometer on "+N+" — opens in a new tab"'), "Compiled social links need localized accessible names with new-tab disclosure");
assert(!mainBundle.includes('id:"page-title",children:c.hero.title'), "Compiled bundle still contains the hydration-unsafe page-title pattern");
assert(!mainBundle.includes('className:"citymeter-label",href:"#top",children:"CityMETER"'), "Compiled bundle still contains the hydration-unsafe CityMETER label pattern");
assert(mainBundle.includes('loading:"lazy",decoding:"async"'), "Compiled bundle must lazy-load and asynchronously decode deferred previews");
assert(mainBundle.includes('preload:"metadata"'), "Compiled hero video must request metadata before autoplay");
assert(mainBundle.includes('s.previewPath.replace("media/previews-v2/","media/previews-v3/")') && mainBundle.includes('width:"800",height:"500"'), "Compiled dataset cards must use the preview-v3 presentation set");
assert((mainBundle.match(/previewPath\.replace\("media\/previews-v2\/","media\/previews-v3\/"\)/g) || []).length === 1, "Only the hydrated dataset-card owner may switch to preview-v3");
for (const heroContract of [
  "navigator.connection||navigator.mozConnection||navigator.webkitConnection",
  '["slow-2g","2g"]',
  'rootMargin:"160px 0px"',
  "threshold:.12",
  'preload:"metadata"'
]) {
  assert(mainBundle.includes(heroContract), `Compiled hero network policy is missing: ${heroContract}`);
}
const heroComponentStart = mainBundle.indexOf("function U6(");
const heroComponentEnd = mainBundle.indexOf("function B6(", heroComponentStart);
const heroComponent = mainBundle.slice(heroComponentStart, heroComponentEnd);
assert(heroComponentStart >= 0 && heroComponentEnd > heroComponentStart, "Compiled hero media owner is missing");
assert(!heroComponent.includes("autoPlay:!0") && heroComponent.includes("IntersectionObserver"), "Hero video must be intersection-driven rather than unconditional autoplay");
assert(!mainBundle.includes('className:"demo-story-caption"') && !mainBundle.includes('className:"demo-progress"'), "Compiled hero still renders the retired caption overlay");
assert(!mainBundle.includes('p.jsxs("figcaption",{children:[p.jsx("span",{children:c.hero.demoJourney})'), "Compiled hero still renders the retired visible figcaption");
assert(mainBundle.includes('id:"demo-transcript",className:"visually-hidden"'), "Compiled hero must retain the accessible transcript");
const compiledTranscriptBlocks = mainBundle.match(/videoBeats:\[.*?\]\},featureProofs:/g) || [];
const compiledTranscript = compiledTranscriptBlocks.join("\n");
assert(compiledTranscriptBlocks.length === 2, "Compiled bundle must contain one Thai and one English reel transcript");
assert(compiledTranscriptBlocks.every((block) => (block.match(/\{start:/g) || []).length === 4), "Each compiled reel transcript must describe four source screens");
for (const transcriptTerm of [
  "ประชากรจดทะเบียน",
  "อาคาร 3 มิติที่สวนพลู",
  "รายได้องค์กรปกครองส่วนท้องถิ่น",
  "อุปสงค์การท่องเที่ยว",
  "Registered population",
  "3D buildings in Suan Plu",
  "Municipal revenue",
  "Tourism demand"
]) {
  assert(compiledTranscript.includes(transcriptTerm), `Compiled reel v3 transcript is missing: ${transcriptTerm}`);
}
for (const retiredTranscriptTerm of ["โจทย์ที่ทีมทำเลเจอทุกวัน", "A question every location team faces", "Risk is never one layer"]) {
  assert(!compiledTranscript.includes(retiredTranscriptTerm), `Compiled hero still contains retired transcript copy: ${retiredTranscriptTerm}`);
}
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

await import("./validate-citymeter-ds-0.9.1-release.mjs");

const externalPeopleRegistry = join(root, "../Landom/data/generated/people-media.json");
if (existsSync(externalPeopleRegistry)) {
  await import("./validate-p1-contributors.mjs");
} else {
  console.warn("Skipped cross-repository contributor source check: ../Landom is not present in this workspace; local snapshot and render checks passed.");
}

console.log(`CityMETER inherited release invariants passed for the DS 0.9.1 public release: hardened P1 static-hydrated ${contributorBundleName} contributor parity on ${contributorManifest.projectionSummary.records} Thai/English cards, ${contributorManifest.projectionSummary.datasetRecords} Dataset + ${contributorManifest.projectionSummary.eventRecords} CreativeWork schema parity, plus the preserved v23 performance, catalog, evidence, QR, social-card, typography, motion, responsive and media contracts.`);
