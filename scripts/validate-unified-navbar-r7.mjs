import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const receiptPath = "data/citymeter-unified-navbar-r7-v30.receipt.json";
const receipt = JSON.parse(readFileSync(join(root, receiptPath), "utf8"));
const assetManifest = JSON.parse(readFileSync(join(root, "assets/unified-navbar-assets.manifest.json"), "utf8"));
const css = readFileSync(join(root, "assets/unified-navbar-r7-v30.css"), "utf8");
const js = readFileSync(join(root, "assets/unified-navbar-r7-v30.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function count(source, pattern) {
  if (typeof pattern === "string") return source.split(pattern).length - 1;
  return (source.match(pattern) || []).length;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function meta(html, name) {
  return html.match(new RegExp(`<meta\\s+name=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s+content=["']([^"']+)["']\\s*\\/?>(?:\\s*)`, "i"))?.[1];
}

const expectedIdentity = {
  "landometer:ds-version": "0.9.0",
  "landometer:color-set": "color-srgb-05",
  "landometer:artifact-build": "ui-20260830-08",
  "landometer:release-receipt": "2026-08-30-citymeter-unified-nav-r7-v30"
};

const pages = [
  { path: "index.html", language: "th", prefix: "./", contact: "คุยกับเรา" },
  { path: "en/index.html", language: "en", prefix: "../", contact: "Contact us" }
];

for (const page of pages) {
  const html = readFileSync(join(root, page.path), "utf8");
  assert(html.startsWith("<!doctype html>"), `${page.path}: initial HTML doctype drifted`);
  assert(html.includes(`<html lang="${page.language}" data-ds="landometer" data-ds-version="0.9.0"`), `${page.path}: DS identity attributes are missing`);
  assert(!html.includes("data-build-card-version=") && !html.includes("data-manifest-version=") && !html.includes("data-token-schema-version="), `${page.path}: unverified machine-package identity must not be claimed`);
  assert(html.includes('data-ds-profile="campaign.public"'), `${page.path}: campaign.public profile is missing`);
  assert(html.includes('data-delivery-mode="static-initial-html"'), `${page.path}: static delivery identity is missing`);
  for (const [name, value] of Object.entries(expectedIdentity)) {
    assert(meta(html, name) === value, `${page.path}: ${name} drifted`);
  }

  assert(count(html, 'class="lm-site-header"') === 1, `${page.path}: needs exactly one unified shell header`);
  assert(count(html, 'class="site-header"') === 1, `${page.path}: inherited React header count drifted`);
  assert(html.indexOf('class="lm-site-header"') < html.indexOf('<div id="root">'), `${page.path}: unified shell must remain outside #root`);
  assert(count(html, 'id="lm-header-exclusivity"') === 1, `${page.path}: critical header exclusivity rule drifted`);
  assert(html.includes('#root>.site-header{display:none!important}'), `${page.path}: legacy header CSS-failure guard is missing`);
  assert(count(html, 'class="lm-skip-link"') === 1, `${page.path}: unified skip link count drifted`);
  assert(count(html, 'id="main-content"') === 1, `${page.path}: skip-link target count drifted`);
  assert(count(html, '<main id="main-content">') === 1, `${page.path}: skip-link target drifted`);
  assert(!html.includes('<main id="main-content" tabindex="-1">'), `${page.path}: hydrated React subtree must not carry an unowned tabindex`);
  assert(html.includes(`href="${page.prefix}assets/unified-navbar-r7-v30.css"`), `${page.path}: navbar stylesheet is not active`);
  assert(html.includes(`src="${page.prefix}assets/unified-navbar-r7-v30.js"`), `${page.path}: navbar runtime is not active`);
  assert(html.includes(`src="${page.prefix}assets/landometer-symbol-color.png"`), `${page.path}: approved symbol is not active`);
  assert(count(html, `href="${page.prefix}assets/material-symbols-rounded-citymeter-nav-outline-r1.ttf"`) === 1, `${page.path}: outline icon-font preload drifted`);
  assert(count(html, `href="${page.prefix}assets/material-symbols-rounded-citymeter-nav-filled-r1.ttf"`) === 1, `${page.path}: filled icon-font preload drifted`);

  const header = html.match(/<header class="lm-site-header"[\s\S]*?<\/header>/)?.[0] || "";
  const actions = header.match(/<nav class="lm-header-actions"[\s\S]*?<\/nav>/)?.[0] || "";
  assert(count(actions, /<a\s/g) === 3 && count(actions, /<button\s/g) === 1, `${page.path}: desktop post-logo control budget must be four`);
  assert(count(header, 'aria-current="page"') === 1, `${page.path}: selected CityMETER state drifted`);
  const expectedCurrentUrl = page.language === "en" ? "https://montri-th.github.io/CityMETER/en/" : "https://montri-th.github.io/CityMETER/";
  assert(count(html, `href="${expectedCurrentUrl}" aria-current="page"`) === 2, `${page.path}: current CityMETER route/locale drifted`);
  assert(header.includes('<span class="lm-product-name" lang="en">CityMETER</span>'), `${page.path}: plain CityMETER product indicator is missing`);
  assert(!header.match(/lm-product-(?:lockup|name)[\s\S]{0,100}<a\s/), `${page.path}: product indicator became interactive`);
  assert(header.includes(`aria-hidden="true" data-lm-copy="contact">${page.contact}</span>`), `${page.path}: accessible CTA sweep duplicate drifted`);
  assert(header.includes('aria-haspopup="dialog"') && header.includes('aria-controls="lm-site-menu"'), `${page.path}: menu disclosure semantics drifted`);

  assert(count(html, 'id="lm-site-menu"') === 1, `${page.path}: menu panel id drifted`);
  assert(html.includes('role="dialog" aria-modal="false"'), `${page.path}: non-modal menu dialog semantics drifted`);
  assert(count(html, 'data-lm-menu-close') >= 5, `${page.path}: menu close paths are incomplete`);
  assert(count(html, 'class="lm-bookmark-rail"') === 1, `${page.path}: bookmark rail count drifted`);
  for (const id of ["decisions", "examples", "datasets"]) {
    assert(count(html, `data-lm-scrollspy-link="${id}"`) === 2, `${page.path}: ${id} rail/menu parity drifted`);
    assert(count(html, `id="${id}"`) === 1, `${page.path}: #${id} target drifted`);
  }
  for (const glyph of ["checklist", "visibility", "database", "menu"]) {
    assert(html.includes(`>${glyph}</span>`), `${page.path}: ${glyph} semantic glyph is missing`);
  }
  assert(count(html, '<nav class="lm-noscript-nav lm-js-fallback-nav"') === 1, `${page.path}: fail-open navigation is missing`);
  assert(html.includes('<nav class="lm-noscript-nav lm-js-fallback-nav"') && html.includes('aria-label=') && html.includes(' hidden>'), `${page.path}: JS fallback must start hidden to prevent layout shift`);
  assert(count(html, "data-lm-noscript-fallback") === 1, `${page.path}: no-JS navigation is missing`);
  assert(html.includes("onerror=\"document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')\""), `${page.path}: script-load fail-open hook is missing`);
  assert(!header.includes("data-theme-cycle") && !header.includes("data-locale-link"), `${page.path}: CityMETER preset must not add theme/locale bar controls`);
  assert(count(html, 'data-lm-copy="') >= 18 && count(html, 'data-lm-aria="') >= 5 && count(html, 'data-lm-rail-label="') === 3, `${page.path}: hydration-safe locale markers drifted`);
  assert(html.includes('themeMeta.setAttribute("content", theme === "dark" ? "#11191D" : "#F6F7F3")'), `${page.path}: first-paint theme-color sync drifted`);
  assert(count(html, /class="dataset-card"/g) === 38, `${page.path}: contributor/catalog cards regressed`);
}

for (const requiredCss of [
  "#root > .site-header",
  "height: var(--lm-nav-height)",
  "width: 200%",
  "transform: scale(.5)",
  "opacity: .72",
  "padding-inline: 24px",
  "color-mix(in srgb, var(--lm-surface-canvas) 26%, transparent)",
  "@keyframes lmNavSweep",
  "3.7s var(--lm-motion-ease-state) infinite",
  "@media (prefers-reduced-motion: reduce)",
  "animation: none !important",
  "transition: none !important",
  "scroll-behavior: auto !important",
  "@media (max-width: 820px)",
  "@media (max-width: 600px)",
  "--lm-nav-height: 68px",
  "padding-inline: 16px",
  "background: var(--lm-surface-soft)",
  "transform: translateY(2px)",
  "transform: none",
  "visibility: hidden",
  "visibility: visible",
  "--lm-text-secondary: #c4ceca",
  "--lm-text-metadata: #a6b5b1",
  "--lm-border-hairline: #33403d",
  "--lm-border-default: #46524f",
  "--lm-overlay-glass: rgba(17, 25, 29, .88)",
  "--lm-elevation-xs: 0 1px 2px rgba(30, 34, 48, .08)",
  ".lm-bookmark-rail"
]) {
  assert(css.includes(requiredCss), `Navbar CSS contract is missing: ${requiredCss}`);
}

for (const requiredJs of [
  "landometer-menu-state",
  'event.key !== "Escape"',
  'document.addEventListener("scroll"',
  'document.addEventListener("pointerdown"',
  '(!active || shell.contains(active))',
  'document.addEventListener("focusin"',
  'header.addEventListener("pointerenter"',
  'header.addEventListener("focusin"',
  'prefers-reduced-motion: reduce',
  'new MutationObserver(syncThemeColor)',
  'themeObserver.observe(themeMeta',
  'themeMeta.getAttribute("content") !== expected',
  'new MutationObserver(localizeShell)',
  'attributeFilter: ["lang"]',
  'function currentCopy()',
  'function localizeShell()',
  'root.dataset.theme === "dark" ? "#11191D" : "#F6F7F3"',
  "shell.querySelectorAll('a[href]')",
  'sameDocumentFragment',
  'window.requestAnimationFrame(syncFromViewport)',
  'section.getBoundingClientRect()',
  'window.addEventListener("resize", scheduleSync)',
  'showFallback()',
  'target.setAttribute("tabindex", "-1")',
  'root.classList.add("lm-nav-ready")'
]) {
  assert(js.includes(requiredJs), `Navbar runtime contract is missing: ${requiredJs}`);
}

assert(/\.lm-nav-viewport\s*\{[\s\S]*?padding-inline:\s*24px;[\s\S]*?\}/.test(css), "Desktop gutter must remain outside the scaled calm row");
assert(/@media \(max-width:\s*600px\)[\s\S]*?\.lm-nav-viewport\s*\{[\s\S]*?padding-inline:\s*16px;[\s\S]*?\}/.test(css), "Compact gutter must remain outside the scaled calm row");
assert(/\.lm-brand:active,[\s\S]*?background:\s*var\(--lm-surface-soft\);\s*transform:\s*translateY\(2px\);/.test(css), "Pressed-state soft surface and translation drifted");
assert(/\.lm-header-link\[aria-current\]:active,[\s\S]*?background:\s*var\(--lm-surface-blue-tint\);\s*transform:\s*none;/.test(css), "Selected-state no-motion contract drifted");
assert(!css.includes("body.lm-menu-open"), "Non-modal menu must not lock document scrolling");
assert(count(css, "--lm-overlay-glass:") === 1, "Governed overlay glass must remain theme-invariant");
assert(count(css, "--lm-elevation-xs:") === 1 && count(css, "--lm-elevation-sm:") === 1, "Governed elevation tokens must not be theme-overridden");
assert(!js.includes("IntersectionObserver") && !js.includes("rootMargin:"), "Scrollspy must use current geometry rather than cached intersection thresholds");

const outlineGsub = execFileSync("ttx", ["-q", "-t", "GSUB", "-o", "-", join(root, "assets/material-symbols-rounded-citymeter-nav-outline-r1.ttf")], { encoding: "utf8" });
for (const fragment of [
  'glyph="v"><Ligature components="i,s,i,b,i,l,i,t,y"',
  'glyph="c"><Ligature components="h,e,c,k,l,i,s,t"',
  'components="l,o,s,e"',
  'glyph="d"><Ligature components="a,t,a,b,a,s,e"',
  'glyph="m"><Ligature components="e,n,u"'
]) {
  assert(outlineGsub.replace(/\s+/g, "").includes(fragment.replace(/\s+/g, "")), `Outline icon subset is missing ${fragment}`);
}

const filledGsub = execFileSync("ttx", ["-q", "-t", "GSUB", "-o", "-", join(root, "assets/material-symbols-rounded-citymeter-nav-filled-r1.ttf")], { encoding: "utf8" });
for (const fragment of ["i,s,i,b,i,l,i,t,y", "h,e,c,k,l,i,s,t", "a,t,a,b,a,s,e"]) {
  assert(filledGsub.includes(fragment), `Filled icon subset is missing ${fragment}`);
}

function ligaturesFromTtx(xml) {
  const records = [];
  for (const set of xml.matchAll(/<LigatureSet glyph="([^"]+)">([\s\S]*?)<\/LigatureSet>/g)) {
    for (const ligature of set[2].matchAll(/<Ligature components="([^"]+)" glyph="([^"]+)"\/>/g)) {
      records.push({
        name: `${set[1]}${ligature[1].replaceAll(",", "")}`,
        targetGlyph: ligature[2]
      });
    }
  }
  return records.sort((a, b) => a.name.localeCompare(b.name));
}

for (const [xml, face] of [
  [outlineGsub, assetManifest.materialSymbolsRounded.outline],
  [filledGsub, assetManifest.materialSymbolsRounded.filled]
]) {
  const delivered = ligaturesFromTtx(xml);
  const declared = face.ligatures.map(({ name, targetGlyph }) => ({ name, targetGlyph })).sort((a, b) => a.name.localeCompare(b.name));
  assert(JSON.stringify(delivered) === JSON.stringify(declared), `${face.path}: exact GSUB ligature set drifted`);
}

assert(receipt.releaseReceipt === expectedIdentity["landometer:release-receipt"], "Shell receipt identity drifted");
assert(receipt.artifactBuildId === expectedIdentity["landometer:artifact-build"], "Shell artifact build drifted");
assert(receipt.designSystem.unmergedR8ProposalClaimed === false, "The unmerged r8 proposal must not be claimed as active DS");
assert(receipt.designSystem.machinePackageConformance === false, "Full machine-package conformance must remain unclaimed");
assert(receipt.designSystem.referenceArtifactBuildId === "ui-20260821-05", "DS reference artifact build identity drifted");
assert(receipt.designSystem.riddimProposalUse === "reference_only_no_governed_adapter", "Riddim proposal scope drifted");
assert(receipt.designSystem.selfCheckStatus === "pending_rendered_production_matrix", "Rendered self-check status must not be overclaimed before deployment");
assert(receipt.status === "approved_for_publication", "Owner-authorized navbar release must remain approved for publication");
assert(receipt.publication.publishable === true && receipt.publication.mustNotDeploy === false, "Owner-authorized navbar release must remain deployable");
assert(receipt.identityApproval?.id === "owner-citymeter-navbar-r7-20260830" && receipt.identityApproval?.status === "approved" && receipt.identityApproval?.blocking === false, "Exact identity approval record is missing");
assert(receipt.identityApproval?.assetSha256 === "b818eeb6a6f4abeb7a8fac2b858de0e7a03a662dff371842a29ebfe4c21d12f6", "Identity approval asset hash drifted");
assert(receipt.identityApproval?.assembledVariant === "full_colour_symbol_plus_typed_Arvo_700_wordmark_#757575" && receipt.identityApproval?.placement === "direct_surface", "Approved assembled lockup or placement drifted");
assert(JSON.stringify(receipt.identityApproval?.surfaces) === JSON.stringify(["navbar_light_#F6F7F3", "navbar_dark_#11191D"]), "Approved identity surfaces drifted");
assert(receipt.identityApproval?.context === "CityMETER production navbar only" && receipt.identityApproval?.validFrom === "2026-08-30" && receipt.identityApproval?.expiresAt === null, "Identity approval scope or validity drifted");
assert(receipt.identityApproval?.evidence?.verbatim === "ผมจะให้พี่ไปเปลี่ยน navbar + motion ในนี้ https://montri-th.github.io/CityMETER/ เลยน่ะ", "Owner decision evidence drifted");
assert(receipt.ownerDirectedExceptions.some((item) => item.id === "NAV-UTILITY-01"), "Theme/locale discoverability exception must be recorded");
for (const id of ["NAV-IDENTITY-01", "NAV-WORDMARK-01", "NAV-CALM-01", "MOTION-01", "FIT-01", "FLOW-04", "NAV-RAIL-01", "NAV-ZINDEX-01"]) {
  assert(receipt.ownerDirectedExceptions.some((item) => item.id === id), `Owner-directed exception is missing: ${id}`);
}
assert(receipt.inheritedContributorLayer.invariants.records === 38, "Contributor record invariant drifted");
assert(receipt.inheritedContributorLayer.invariants.assignments === 51, "Contributor assignment invariant drifted");
assert(receipt.inheritedContributorLayer.invariants.uniquePeople === 29, "Contributor person invariant drifted");
assert(receipt.inheritedContributorLayer.invariants.portraitIdentities === 25, "Contributor portrait invariant drifted");
assert(receipt.inheritedContributorLayer.invariants.fallbackIdentities === 4, "Contributor fallback invariant drifted");

assert(assetManifest.artifactBuildId === receipt.artifactBuildId, "Shell asset manifest build identity drifted");
assert(assetManifest.releaseReceipt === receipt.releaseReceipt, "Shell asset manifest receipt identity drifted");
assert(assetManifest.assetCount === 4, "Shell asset count drifted");
assert(assetManifest.materialSymbolsRounded.providerCssVersion === "v369", "Material Symbols source version drifted");
assert(assetManifest.materialSymbolsRounded.exactCssRequestUrl === null && assetManifest.materialSymbolsRounded.exactCssRequestUrlStatus === "not_retained_do_not_invent", "Unretained upstream URL must not be invented");
assert(assetManifest.materialSymbolsRounded.license.spdx === "Apache-2.0", "Material Symbols license drifted");
assert(assetManifest.identity.lifecycleState === "active" && assetManifest.identity.approvalStatus === "approved" && assetManifest.identity.approvalRef === "owner-citymeter-navbar-r7-20260830", "Identity manifest approval drifted");
assert(assetManifest.identity.assembledVariant === receipt.identityApproval.assembledVariant && assetManifest.identity.placement === receipt.identityApproval.placement, "Identity manifest assembled variant or placement drifted");
assert(JSON.stringify(assetManifest.identity.surfaces) === JSON.stringify(receipt.identityApproval.surfaces) && assetManifest.identity.deliveryContext === receipt.identityApproval.context, "Identity manifest surface or context drifted");
assert(assetManifest.identity.validFrom === receipt.identityApproval.validFrom && assetManifest.identity.expiresAt === receipt.identityApproval.expiresAt, "Identity manifest validity drifted");
assert(assetManifest.immutableBaseTextFontManifest.mutation === "none", "Settled text-font manifest must remain immutable");
for (const record of [
  assetManifest.identity,
  assetManifest.materialSymbolsRounded.outline,
  assetManifest.materialSymbolsRounded.filled,
  assetManifest.materialSymbolsRounded.license
]) {
  assert(!record.path.startsWith("/") && !record.path.split("/").includes(".."), `${record.path}: unsafe manifest path`);
  const bytes = readFileSync(join(root, record.path));
  assert(bytes.byteLength === record.bytes, `${record.path}: shell asset manifest byte count drifted`);
  assert(sha256(bytes) === record.sha256, `${record.path}: shell asset manifest hash drifted`);
}

const governedAssetPaths = [
  assetManifest.identity.path,
  assetManifest.materialSymbolsRounded.outline.path,
  assetManifest.materialSymbolsRounded.filled.path,
  assetManifest.materialSymbolsRounded.license.path
];
assert(new Set(governedAssetPaths).size === assetManifest.assetCount, "Shell asset paths must be unique");
const symbolBytes = readFileSync(join(root, assetManifest.identity.path));
assert(symbolBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "Identity asset must remain PNG");
assert(symbolBytes.readUInt32BE(16) === 1601 && symbolBytes.readUInt32BE(20) === 1601, "Identity PNG dimensions drifted");
assert(symbolBytes[24] === 8 && symbolBytes[25] === 6, "Identity PNG must remain 8-bit RGBA");

for (const record of [
  assetManifest.immutableBaseTextFontManifest,
  {
    path: assetManifest.immutableBaseTextFontManifest.licenseRecordsPath,
    sha256: assetManifest.immutableBaseTextFontManifest.licenseRecordsSha256
  }
]) {
  assert(sha256(readFileSync(join(root, record.path))) === record.sha256, `${record.path}: inherited text-font contract drifted`);
}

for (const [face, expected] of [
  [assetManifest.materialSymbolsRounded.outline, ["Material Symbols Rounded Light", "MaterialSymbolsRounded-Light"]],
  [assetManifest.materialSymbolsRounded.filled, ["Material Symbols Rounded Filled Light", "MaterialSymbolsRoundedFilled-Light"]]
]) {
  const tables = execFileSync("ttx", ["-q", "-t", "name", "-t", "OS/2", "-t", "fvar", "-o", "-", join(root, face.path)], { encoding: "utf8" });
  assert(tables.includes(expected[0]) && tables.includes(expected[1]), `${face.path}: embedded family identity drifted`);
  assert(tables.includes("Version 2.966") && tables.includes('<usWeightClass value="300"/>'), `${face.path}: embedded version or weight drifted`);
  assert(!tables.includes("<fvar>"), `${face.path}: icon subset must remain a static font instance`);
}

assert(css.includes(`font-family: "${assetManifest.materialSymbolsRounded.outline.cssFamilyAlias}"`) && css.includes(`url("./${assetManifest.materialSymbolsRounded.outline.path.split("/").at(-1)}") format("${assetManifest.materialSymbolsRounded.outline.format}")`), "Outline icon @font-face drifted from manifest");
assert(css.includes(`font-family: "${assetManifest.materialSymbolsRounded.filled.cssFamilyAlias}"`) && css.includes(`url("./${assetManifest.materialSymbolsRounded.filled.path.split("/").at(-1)}") format("${assetManifest.materialSymbolsRounded.filled.format}")`), "Filled icon @font-face drifted from manifest");
assert(receipt.iconSubset.sourceVersion === assetManifest.materialSymbolsRounded.providerCssVersion, "Receipt icon source version drifted from shell asset manifest");
assert(JSON.stringify(receipt.iconSubset.outlineGlyphs) === JSON.stringify(assetManifest.materialSymbolsRounded.outline.ligatures.map((item) => item.name)), "Receipt outline glyphs drifted from shell asset manifest");
assert(JSON.stringify(receipt.iconSubset.filledGlyphs) === JSON.stringify(assetManifest.materialSymbolsRounded.filled.ligatures.map((item) => item.name)), "Receipt filled glyphs drifted from shell asset manifest");

for (const item of receipt.artifacts) {
  const bytes = readFileSync(join(root, item.path));
  assert(bytes.byteLength === item.bytes, `${item.path}: receipt byte count drifted`);
  assert(sha256(bytes) === item.sha256, `${item.path}: receipt hash drifted`);
}

console.log("CityMETER unified navbar r7 validation passed: standalone TH/EN shell, 4/1 desktop/compact controls, menu/focus/Escape/outside close, calm-scroll restore, 3-anchor scrollspy, reduced-motion kill switch, exact logo/icon/license receipts, and inherited 38/51/29/25/4 contributor invariants.");
