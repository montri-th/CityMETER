import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundleV17 = path.join(root, "assets/index-qbT50gkr-v17.js");
const bundleV18 = path.join(root, "assets/index-qbT50gkr-v18.js");
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

function buildHydratedBundle() {
  const source = fs.readFileSync(bundleV17, "utf8");
  const migrated = replaceOne(
    source,
    'O==="dark"?"#141820":"#176b82"',
    'O==="dark"?"#11191D":"#F6F7F3"',
    "hydrated theme-color projection"
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

function migratePage(relativePath, prefix, language) {
  const filePath = path.join(root, relativePath);
  let html = fs.readFileSync(filePath, "utf8");

  html = replaceOne(
    html,
    `lang="${language}" data-ds="landometer" data-ds-version="0.9.0" data-ds-profile="campaign.public"`,
    `lang="${language}" data-ds="landometer" data-ds-version="0.9.1" data-ds-profile="product_orientation" data-ds-format="web_public"`,
    `${relativePath} release identity`
  );
  html = replaceOne(
    html,
    'data-delivery-mode="static-initial-html" data-evidence-status="source_limited" data-visibility="public" data-indexable="true"',
    'data-delivery-mode="internal-preview" data-evidence-status="unresolved-product-authority" data-visibility="internal" data-indexable="false"',
    `${relativePath} internal-preview boundary`
  );
  html = replaceOne(html, '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />', '<meta name="robots" content="noindex, nofollow" />', `${relativePath} internal-preview robots policy`);
  html = replaceOne(html, '<meta name="theme-color" content="#176b82" />', '<meta name="theme-color" content="#F6F7F3" />', `${relativePath} initial theme color`);
  html = replaceOne(html, '<meta name="landometer:ds-version" content="0.9.0" />', '<meta name="landometer:ds-version" content="0.9.1" />', `${relativePath} DS version meta`);
  html = replaceOne(html, '<meta name="landometer:artifact-build" content="ui-20260830-09" />', '<meta name="landometer:artifact-build" content="ui-20260904-ds091-motif-internal-v1" />', `${relativePath} build meta`);
  html = replaceOne(html, '<meta name="landometer:release-receipt" content="2026-08-30-citymeter-unified-nav-r7-v31" />', '<meta name="landometer:release-receipt" content="2026-09-04-citymeter-ds091-motif-internal-v1" />', `${relativePath} release receipt meta`);
  html = replaceOne(html, `${prefix}assets/index-qbT50gkr-v17.js`, `${prefix}assets/index-qbT50gkr-v18.js`, `${relativePath} hydrated bundle`);

  const oldEnhancement = `    <link rel="stylesheet" href="${prefix}assets/catalog-enhancements-v25.css">`;
  const newEnhancement = [
    `    <link rel="stylesheet" href="${prefix}assets/landometer-ds/v0.9.1/color-srgb-05.production.css">`,
    `    <link rel="stylesheet" href="${prefix}assets/landometer-motifs/v1/landometer-motifs.css">`,
    `    <link rel="stylesheet" href="${prefix}assets/catalog-enhancements-ds-0.9.1-v26.css">`
  ].join("\n");
  html = replaceOne(html, oldEnhancement, newEnhancement, `${relativePath} DS styles`);
  html = replaceOne(html, `${prefix}assets/unified-navbar-r7-v30.css`, `${prefix}assets/unified-navbar-r7-ds-0.9.1-v32.css`, `${relativePath} navbar styles`);

  const oldScripts = [
    `    <script defer src="${prefix}assets/unified-navbar-r7-v31.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script>`,
    `    <script defer src="${prefix}assets/catalog-enhancements-v25.js"></script>`
  ].join("\n");
  const newScripts = [
    `    <script defer src="${prefix}assets/landometer-motifs/v1/landometer-motifs.js"></script>`,
    `    <script defer src="${prefix}assets/unified-navbar-r7-v31.js" onerror="document.querySelector('.lm-js-fallback-nav')?.removeAttribute('hidden')"></script>`,
    `    <script defer src="${prefix}assets/catalog-enhancements-v25.js"></script>`,
    `    <script defer src="${prefix}assets/citymeter-ds-0.9.1-motif-placement-v1.js"></script>`
  ].join("\n");
  html = replaceOne(html, oldScripts, newScripts, `${relativePath} DS scripts`);

  if (checkOnly) {
    const current = fs.readFileSync(filePath, "utf8");
    if (current !== html) throw new Error(`${relativePath} differs from the deterministic migration`);
    return;
  }
  fs.writeFileSync(filePath, html);
}

buildHydratedBundle();
migratePage("index.html", "./", "th");
migratePage("en/index.html", "../", "en");

console.log(checkOnly
  ? "CityMETER DS 0.9.1 internal-candidate migration check passed."
  : "Prepared the blocked CityMETER DS 0.9.1 internal candidate; do not deploy it.");
