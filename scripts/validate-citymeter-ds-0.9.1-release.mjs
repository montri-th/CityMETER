import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(root, relativePath))).digest("hex");
}

function count(source, token) {
  return source.split(token).length - 1;
}

function bodyBytes(html) {
  const start = html.indexOf("<body>");
  assert(start >= 0, "Static HTML body is missing");
  return html.slice(start);
}

function assertBalancedCss(source, label) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  for (const character of withoutComments) {
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    assert(depth >= 0, `${label}: unexpected closing brace`);
  }
  assert(depth === 0, `${label}: unbalanced braces`);
}

const expected = {
  releaseId: "2026-09-04-citymeter-ds091-motif-internal-v1",
  buildId: "ui-20260904-ds091-motif-internal-v1",
  tupleHash: "852f2cb97c5c7ba269c4c543f27cb4587b519263ea2075d84562289f21890e49",
  productionCss: {
    path: "assets/landometer-ds/v0.9.1/color-srgb-05.production.css",
    sha256: "3bac2499df594bbf6b016b650ee7763f7ec093e33bc5f28239144e0677281d5c",
    bytes: 8184
  },
  motifCss: {
    path: "assets/landometer-motifs/v1/landometer-motifs.css",
    sha256: "f5071a37a29bfe9196ea572f50d426bd7bb088c78219181ea8d3ae9f2fc4303c",
    bytes: 4194
  },
  motifJs: {
    path: "assets/landometer-motifs/v1/landometer-motifs.js",
    sha256: "593efc75a95daa3fdb458f0a4078c8ba207950d7ced14e1557548e6376e9a02f",
    bytes: 8056
  },
  compiledBaseCss: {
    path: "assets/index-cqxdfePB.css",
    sha256: "96c6366c085d7d36d9f6786f1f77f2bacb279805ff1e3e7fb7743ee30bf0a6e1",
    bytes: 23726
  },
  candidateFiles: [
    { path: "assets/catalog-enhancements-ds-0.9.1-v26.css", sha256: "e6490f3fb7b7d2ae83738401d5f0b3d06c76ad623ad3058cb6743e05fc50e60d", bytes: 46029 },
    { path: "assets/unified-navbar-r7-ds-0.9.1-v32.css", sha256: "56450afb1d12fb0047f60b0affa26239029bbe73d5f76bd43bc9ecabbb9df511", bytes: 19014 },
    { path: "assets/citymeter-ds-0.9.1-motif-placement-v1.js", sha256: "a2a36b348bafd96a0e0e41b118acd078f9ba96b752cb5728cbc5701986fa737d", bytes: 4550 },
    { path: "assets/index-qbT50gkr-v18.js", sha256: "f05fbbea8bbe9611c717207e004b1891ace973de93dc606625f78588ec5d77b3", bytes: 419960 },
    { path: "index.html", sha256: "ada8eeedf06317af5780bd51f709ab6e3f384622ef7766c6abedbacf800419e9", bytes: 401782 },
    { path: "en/index.html", sha256: "1236615f81e75f8b9d7c925ccbd7d6a7b0c195ce95f9a52e8fa91400fefa851c", bytes: 349560 }
  ],
  sourceBodyHashes: {
    "index.html": "91eff79f1c868975f7d4deece7bc847a8f91e0e4ba16d759b874150a6283aa5b",
    "en/index.html": "98557225006c9168f874bad92249c18756f28781995d0c1b0b2a3e34974b968a"
  }
};

for (const asset of [expected.productionCss, expected.motifCss, expected.motifJs, expected.compiledBaseCss]) {
  assert(statSync(join(root, asset.path)).size === asset.bytes, `${asset.path}: byte count drifted`);
  assert(sha256(asset.path) === asset.sha256, `${asset.path}: exact-byte SHA-256 drifted`);
}
for (const file of expected.candidateFiles) {
  assert(statSync(join(root, file.path)).size === file.bytes, `${file.path}: candidate byte count drifted`);
  assert(sha256(file.path) === file.sha256, `${file.path}: candidate SHA-256 drifted`);
}

const release = json("data/citymeter-ds-0.9.1-release-record.json");
assert(release.releaseId === expected.releaseId && release.artifactBuildId === expected.buildId, "Release identity drifted");
assert(release.productScope === "CityMETER", "Release product scope must remain CityMETER");
assert(release.artifact.format === "web_public" && release.artifact.runtime === "browser", "Web-public browser contract drifted");
assert(release.audience === "internal_review" && release.intendedAudience === "public", "Internal-review/public-intent boundary drifted");
assert(JSON.stringify(release.localeState.supported) === JSON.stringify(["th", "en"]) && release.localeState.equivalenceRequired === true, "TH/EN locale contract drifted");
assert(release.designSystem.version === "0.9.1", "DS version drifted");
assert(release.designSystem.authoringVersion === "0.9.1-r8", "DS authoring version drifted");
assert(release.designSystem.rulesetVersion === "lds-rules-0.9.1", "DS ruleset drifted");
assert(release.designSystem.machinePackageVersion === "v0.9.1-mp7", "Machine package version drifted");
assert(release.designSystem.releaseTupleHash === expected.tupleHash, "DS release tuple hash drifted");
assert(release.designSystem.formatPack === "web.public.01" && release.designSystem.formatKit === "kit.web.base.01", "Format pack/kit drifted");
assert(release.designSystem.targetProfile === "target.web.responsive.360-1600.01", "Responsive target profile drifted");
assert(release.designSystem.experienceProfile === "product_orientation", "Experience profile drifted");
assert(JSON.stringify(release.designSystem.capabilities) === JSON.stringify(["claims", "evidence", "motion"]), "Declared capability set drifted");
assert(JSON.stringify(release.designSystem.audienceColorProjection) === JSON.stringify(expected.productionCss), "Audience color projection binding drifted");
assert(release.changeBoundary.presentationOnly === true && release.changeBoundary.productCopyChanged === false && release.changeBoundary.productClaimsAdded === false && release.changeBoundary.datasetRecordsChanged === false, "Presentation-only release boundary drifted");
assert(release.changeBoundary.decorativeColoredEdgePolicy === "prohibited", "Decorative colored-edge prohibition drifted");
assert(release.deliveryDecision.deliveryState === "internal_preview" && release.deliveryDecision.governedConformanceLevel === "not_claimed", "Blocked candidate must not claim a governed conformance level");
assert(release.deliveryDecision.artifactQaPassedClaimed === false && release.deliveryDecision.productionVerifiedClaimed === false, "Unsigned QA/production promotion must remain unclaimed");
assert(release.deliveryDecision.publishable === false && release.deliveryDecision.mustNotDeploy === true, "Unresolved product authority must block publication");
assert(release.deliveryDecision.blockingReasons.length >= 2, "Publication blockers must remain explicit");
assert(release.knownBoundaries.length >= 4, "Known authority/trust boundaries must remain explicit");

const brandApproval = json("data/landometer-master-brand-brief-v0.5.3-approval.json");
assert(brandApproval.subject.version === "0.5.3" && brandApproval.approval.status === "owner_approved", "Master Brand Brief v0.5.3 approval record drifted");
assert(brandApproval.subject.sourceSha256 === "33041749f59bca930459dccc3637bad1a4884bf4cecc8e1a543f8ec3771fe87c" && brandApproval.subject.sourceBytes === 76984, "Master Brand Brief exact-source binding drifted");
assert(brandApproval.projectUse.productScope === "CityMETER" && brandApproval.projectUse.claimExpansionAuthorized === false, "Master Brand Brief authority boundary drifted");
assert(brandApproval.authorityExclusions.includes("CityMETER product claims") && brandApproval.authorityExclusions.includes("artifact QA or production conformance"), "Master Brand Brief exclusions drifted");

const motifManifest = json("assets/landometer-motifs/v1/manifest.json");
assert(motifManifest.productScope === "CityMETER" && motifManifest.approval.status === "owner_approved" && motifManifest.approval.publicationPermission === true, "Motif approval/publication authority drifted");
assert(motifManifest.source.sourceArchiveSha256 === "916d18dee1d760d53ec2157d511e16ac6379b645f2a923c40da4356b1b4f90a2" && motifManifest.source.sourceArchiveBytes === 12481, "Motif source archive binding drifted");
assert(motifManifest.files.length === 2, "Motif manifest must bind exactly two supplied files");
for (const file of motifManifest.files) {
  assert(sha256(file.targetPath) === file.sha256, `${file.targetPath}: motif manifest SHA-256 drifted`);
  assert(statSync(join(root, file.targetPath)).size === file.bytes, `${file.targetPath}: motif manifest byte count drifted`);
}
assert(motifManifest.implementation.selectedKind === "rings" && motifManifest.implementation.variant === "quiet" && motifManifest.implementation.ink === "sky" && motifManifest.implementation.autoplay === false, "Governed motif selection drifted");
for (const role of ["identity", "data_visualization", "evidence", "status", "control", "decorative_border", "edge", "rail", "divider"]) {
  assert(motifManifest.prohibitedRoles.includes(role), `Motif prohibited role is missing: ${role}`);
}
assert(motifManifest.conformanceBoundary.includes("not a signed DS asset-approval receipt"), "Motif conformance boundary drifted");

const v17 = read("assets/index-qbT50gkr-v17.js");
const v18 = read("assets/index-qbT50gkr-v18.js");
const oldThemeProjection = 'O==="dark"?"#141820":"#176b82"';
const newThemeProjection = 'O==="dark"?"#11191D":"#F6F7F3"';
assert(count(v17, oldThemeProjection) === 1 && count(v17, newThemeProjection) === 0, "v17 theme-color migration source drifted");
assert(count(v18, oldThemeProjection) === 0 && count(v18, newThemeProjection) === 1, "v18 must contain exactly one DS 0.9.1 hydrated theme-color projection");
assert(v18 === v17.replace(oldThemeProjection, newThemeProjection), "Hydrated bundle changed beyond the exact theme-color migration");

const pageContracts = [
  { path: "index.html", language: "th", prefix: "./", canonical: "https://montri-th.github.io/CityMETER/" },
  { path: "en/index.html", language: "en", prefix: "../", canonical: "https://montri-th.github.io/CityMETER/en/" }
];

for (const page of pageContracts) {
  const html = read(page.path);
  assert(html.includes(`<html lang="${page.language}" data-ds="landometer" data-ds-version="0.9.1" data-ds-profile="product_orientation" data-ds-format="web_public" data-delivery-mode="internal-preview" data-evidence-status="unresolved-product-authority" data-visibility="internal" data-indexable="false"`), `${page.path}: internal candidate identity/boundary drifted`);
  assert(html.includes('<meta name="robots" content="noindex, nofollow" />'), `${page.path}: blocked candidate must remain non-indexable`);
  assert(html.includes('<meta name="theme-color" content="#F6F7F3" />'), `${page.path}: initial light theme color drifted`);
  assert(html.includes('theme === "dark" ? "#11191D" : "#F6F7F3"'), `${page.path}: prepaint theme-color mapping drifted`);
  assert(html.includes('<meta name="landometer:ds-version" content="0.9.1" />'), `${page.path}: DS meta drifted`);
  assert(html.includes(`<meta name="landometer:artifact-build" content="${expected.buildId}" />`), `${page.path}: artifact build meta drifted`);
  assert(html.includes(`<meta name="landometer:release-receipt" content="${expected.releaseId}" />`), `${page.path}: release identity meta drifted`);
  assert(html.includes(`<link rel="canonical" href="${page.canonical}" />`), `${page.path}: canonical URL drifted`);
  assert(count(html, "class=\"dataset-card\"") === 38, `${page.path}: static dataset record count drifted`);
  assert(count(html, "<main id=\"main-content\">") === 1 && count(html, "<h1") === 1, `${page.path}: semantic main/H1 contract drifted`);
  assert(createHash("sha256").update(bodyBytes(html)).digest("hex") === expected.sourceBodyHashes[page.path], `${page.path}: body/product copy changed in the presentation-only release`);

  const links = [
    `${page.prefix}${expected.productionCss.path}`,
    `${page.prefix}${expected.motifCss.path}`,
    `${page.prefix}assets/catalog-enhancements-ds-0.9.1-v26.css`,
    `${page.prefix}assets/unified-navbar-r7-ds-0.9.1-v32.css`
  ];
  for (const link of links) assert(count(html, link) === 1, `${page.path}: expected one active stylesheet ${link}`);
  assert(html.indexOf(links[0]) < html.indexOf(links[1]) && html.indexOf(links[1]) < html.indexOf(links[2]) && html.indexOf(links[2]) < html.indexOf(links[3]), `${page.path}: DS/motif/surface/navbar stylesheet order drifted`);

  const scripts = [
    `${page.prefix}${expected.motifJs.path}`,
    `${page.prefix}assets/unified-navbar-r7-v31.js`,
    `${page.prefix}assets/catalog-enhancements-v25.js`,
    `${page.prefix}assets/citymeter-ds-0.9.1-motif-placement-v1.js`
  ];
  for (const script of scripts) assert(count(html, script) === 1, `${page.path}: expected one active script ${script}`);
  assert(html.indexOf(scripts[0]) < html.indexOf(scripts[3]) && html.indexOf(scripts[2]) < html.indexOf(scripts[3]), `${page.path}: motif component/placement order drifted`);
  assert(count(html, `${page.prefix}assets/index-qbT50gkr-v18.js`) === 1, `${page.path}: DS 0.9.1 bundle is not uniquely active`);

  for (const retired of [
    "catalog-enhancements-v25.css",
    "unified-navbar-r7-v30.css",
    "index-qbT50gkr-v17.js"
  ]) assert(!html.includes(retired), `${page.path}: retired active asset remains linked: ${retired}`);

  for (const provenanceFile of ["color-srgb-05.light.provenance.css", "color-srgb-05.dark.provenance.css", "color-srgb-05.provenance.css", "color-srgb-05.raw.css"]) {
    assert(!html.includes(provenanceFile), `${page.path}: raw color provenance must not be audience-delivered`);
  }
}

const surfaceCss = read("assets/catalog-enhancements-ds-0.9.1-v26.css");
const compiledBaseCss = read("assets/index-cqxdfePB.css");
const navbarCss = read("assets/unified-navbar-r7-ds-0.9.1-v32.css");
const placementJs = read("assets/citymeter-ds-0.9.1-motif-placement-v1.js");
assertBalancedCss(surfaceCss, "DS surface CSS");
assertBalancedCss(navbarCss, "DS navbar CSS");

for (const legacyLiteral of [
  ".demo-figure{margin:0 0 18px;overflow:hidden;border:1px solid rgba(255,255,255,.3)",
  ".demo-story-caption{position:absolute;z-index:2;right:74px;bottom:18px;left:18px;max-width:min(620px,76%);border:1px solid rgba(255,255,255,.32)",
  ".preview-focus-label{position:absolute;right:12px;bottom:12px;left:12px;width:fit-content;max-width:calc(100% - 24px);border:1px solid rgba(255,255,255,.36)"
]) assert(compiledBaseCss.includes(legacyLiteral), `Compiled base literal changed; re-audit the DS override closure: ${legacyLiteral}`);

for (const override of [
  ".demo-figure,\n.demo-story-caption,\n.preview-focus-label,\n.live-example-label,\n.playback-control {\n  border-color: var(--ldm-foundation-border-emphasis-dark);",
  "box-shadow: 0 12px 38px color-mix(in srgb, var(--ldm-foundation-surface-canvas-dark) 26%, transparent);",
  ".demo-story-caption small,\n.demo-figure figcaption,\n.hero-proof-item span {\n  color: var(--ldm-foundation-text-secondary-dark);",
  ".demo-figure figcaption span:first-child,\n.hero-proof-item strong {\n  color: var(--ldm-foundation-text-primary-dark);",
  ".hero-proof-item small {\n  color: var(--ldm-foundation-text-metadata-dark);",
  ".demo-progress span {\n  background: color-mix(in srgb, var(--ldm-foundation-surface-raised-light) 35%, transparent);"
]) assert(surfaceCss.includes(override), `Active compiled-color override closure is missing: ${override}`);

for (const tokenBridge of [
  "--canvas: var(--ldm-foundation-surface-canvas-light)",
  "--card: var(--ldm-foundation-surface-card-light)",
  "--text: var(--ldm-foundation-text-primary-light)",
  "--border: var(--ldm-foundation-border-default-light)",
  "--focus-ring: var(--ldm-foundation-interaction-focus-ring-light)",
  "--canvas: var(--ldm-foundation-surface-canvas-dark)",
  "--card: var(--ldm-foundation-surface-card-dark)",
  "--text: var(--ldm-foundation-text-primary-dark)",
  "--border: var(--ldm-foundation-border-default-dark)",
  "--focus-ring: var(--ldm-foundation-interaction-focus-ring-dark)"
]) assert(surfaceCss.includes(tokenBridge), `DS surface token bridge is missing: ${tokenBridge}`);

for (const replacement of [
  "border: 1px solid var(--border);",
  "border: 1px solid var(--pillar-border-emphasis);",
  "border: 1px solid var(--catalog-simple-border);",
  "box-shadow: 0 1px 0 var(--hairline);",
  "box-shadow: 0 1px 0 var(--pillar-border-hairline);"
]) assert(surfaceCss.includes(replacement), `Neutral edge replacement is missing: ${replacement}`);

for (const bannedPattern of [
  /border-block-start\s*:/i,
  /border-inline-start\s*:/i,
  /border-(?:top|left|right|bottom)\s*:\s*[2-9]\d*px/i,
  /(?:3|5)px\s+solid/i,
  /box-shadow\s*:\s*inset/i
]) assert(!bannedPattern.test(surfaceCss), `Decorative colored-edge pattern remains: ${bannedPattern}`);
const expandedCardRule = surfaceCss.match(/\.dataset-card:has\(\.dataset-details\[open\]\)\s*\{([^}]+)\}/i)?.[1] || "";
assert(expandedCardRule.includes("border-color: var(--pillar-border-emphasis)") && !/(?:color-mix|var\(--accent\))/.test(expandedCardRule), "Expanded cards must retain a neutral edge");

const allowedAtmosphereColors = new Set([
  "#C4E0EE", "#B2E2E2", "#CCE6D0",
  "#EB8182", "#F5A06F", "#EBC573",
  "#89CEF6", "#5ECAD6", "#6CD5B3",
  "#0F5773", "#006A6A", "#1F744F",
  "#F7CBC7", "#FBD1B6", "#F1E0B4"
]);
const authoredHexColors = new Set(surfaceCss.match(/#[0-9a-f]{6}\b/gi) || []);
for (const color of authoredHexColors) assert(allowedAtmosphereColors.has(color.toUpperCase()), `Non-DS authored hex color remains in the surface layer: ${color}`);
assert(!/rgba?\(/i.test(surfaceCss), "Raw rgb/rgba colors must resolve through DS tokens or exact recipes");

for (const contract of [
  '[data-lm-placement="catalog-orientation"]',
  "position: absolute",
  "pointer-events: none",
  "contain: layout paint",
  "translateX(36px) scale(.985)",
  "citymeter-motif-approach-opacity 760ms cubic-bezier(.16, 1, .3, 1)",
  "citymeter-motif-approach-transform 920ms cubic-bezier(.2, .9, .25, 1.08)",
  "@media (max-width: 979px)",
  "@media (prefers-reduced-motion: reduce)",
  "@media print",
  "animation: none !important"
]) assert(surfaceCss.includes(contract), `Motif layout/motion contract is missing: ${contract}`);

assert(!/#[0-9a-f]{3,8}\b/i.test(navbarCss) && !/rgba?\(/i.test(navbarCss), "Navbar authored colors must resolve only through DS tokens");
for (const contract of [
  "--lm-surface-canvas: var(--ldm-foundation-surface-canvas-light)",
  "--lm-surface-canvas: var(--ldm-foundation-surface-canvas-dark)",
  "--lm-interaction-focus-ring: var(--ldm-foundation-interaction-focus-ring-light)",
  "--lm-interaction-focus-ring: var(--ldm-foundation-interaction-focus-ring-dark)",
  "--lm-motion-duration-state: 200ms",
  "--lm-motion-duration-feedback: 120ms",
  "min-height: 44px",
  "min-width: 44px",
  "outline: 3px solid var(--lm-interaction-focus-ring)"
]) assert(navbarCss.includes(contract), `Navbar DS/accessibility contract is missing: ${contract}`);
assert(navbarCss.includes(".lm-nav-cta__sweep") && /\.lm-nav-cta__sweep\s*\{[\s\S]*?display:\s*none;[\s\S]*?\}/.test(navbarCss), "Retired navbar sweep must remain absent from every motion mode");
assert(!/\binfinite\b/i.test(navbarCss) && !navbarCss.includes("@keyframes lmNavSweep") && !navbarCss.includes("@keyframes lmNavFlick"), "DS 0.9.1 forbids the historical unbounded CTA sweep/flicker");

for (const contract of [
  'var selector = "#datasets .catalog-structure"',
  'var marker = "catalog-orientation"',
  'motif.setAttribute("kind", "rings")',
  'motif.setAttribute("quiet", "")',
  'motif.setAttribute("ink", "sky")',
  'motif.setAttribute("autoplay", "false")',
  'placement.setAttribute("aria-hidden", "true")',
  'motif.setAttribute("aria-hidden", "true")',
  'threshold: 0.14, rootMargin: "0px 0px -12% 0px"',
  "function stopObserving(element)",
  "try {",
  "observer = null;",
  "failOpen(placement);",
  "var observerReported = false",
  "observerReported = true",
  "if (!observerReported) failOpen(placement)",
  "}, 2400)",
  'window.addEventListener("load", start, { once: true })'
]) assert(placementJs.includes(contract), `Motif placement contract is missing: ${contract}`);
for (const lifecycle of ["scroll", "resize", "pageshow", "hashchange", "popstate", "focus", "visibilitychange"]) {
  assert(placementJs.includes(`addEventListener("${lifecycle}"`) && placementJs.includes(`removeEventListener("${lifecycle}"`), `Motif passive lifecycle audit is incomplete: ${lifecycle}`);
}
assert(placementJs.includes("function installPassiveAudit(element)") && placementJs.includes("hasReachedEffectiveRoot(element)") && placementJs.includes("window.innerHeight * 0.88"), "Motif reached-content passive audit drifted");
assert(count(placementJs, "requestAnimationFrame") >= 4, "Motif placement must preserve hydration and visible-state two-frame boundaries");
assert(!/\.play\s*\(/.test(placementJs) && !/setAttribute\(\s*["']run["']/.test(placementJs), "Supplied motif internal animation must never be invoked");
for (const prohibitedKind of ["dial", "slice", "layers", "cultivate"]) {
  assert(!placementJs.includes(`\"${prohibitedKind}\"`), `Prohibited motif kind remains in placement runtime: ${prohibitedKind}`);
}

console.log("CityMETER DS 0.9.1 internal-candidate gate passed: exact production color projection, neutral decorative edges, TH/EN content preservation, and governed one-shot motif placement. Publication and every artifact conformance claim remain blocked.");
