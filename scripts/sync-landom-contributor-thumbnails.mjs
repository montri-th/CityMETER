import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { deriveContributorProjectionSummary } from "./p1-contributor-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const landomRoot = resolve(root, process.env.LANDOM_REPO || "../Landom");
const peopleMediaPath = join(landomRoot, "data/generated/people-media.json");
const releaseReceipt = process.env.CITYMETER_CONTRIBUTOR_RELEASE || "2026-08-27-landom-thumbnail-sync-v29";
const authorizedAt = process.env.CITYMETER_CONTRIBUTOR_AUTHORIZED_AT || "2026-08-27";
let targetEnhancer;
const checkOnly = process.argv.includes("--check");
const visibleLimit = 3;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function publicJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function decodeHtmlText(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: "\u00a0", quot: '"' };
  return String(value).replace(/&(#x[0-9a-f]+|#[0-9]+|amp|apos|gt|lt|nbsp|quot);/gi, (entity, token) => {
    if (token[0] !== "#") return named[token.toLowerCase()] ?? entity;
    const codePoint = token[1].toLowerCase() === "x" ? Number.parseInt(token.slice(2), 16) : Number.parseInt(token.slice(1), 10);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
  });
}

function count(source, token) {
  return source.split(token).length - 1;
}

function readJson(path, label) {
  assert(existsSync(path), `${label} is missing: ${path}`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is invalid JSON: ${error.message}`);
  }
}

function discoverActive(html) {
  const registry = html.match(/<meta name="citymeter:contributor-data" content="(data\/citymeter-contributors-p1-[a-f0-9]{12}\.json)" \/>/)?.[1];
  const manifest = html.match(/<meta name="citymeter:contributor-release-manifest" content="(data\/citymeter-contributor-release-p1-[a-f0-9]{12}\.json)" \/>/)?.[1];
  assert(registry && manifest, "Active contributor registry or manifest pointer is missing");
  return { registry, manifest };
}

function mappingSnapshot(activeRegistry) {
  const existing = readdirSync(join(root, "data")).filter((name) => /^citymeter-contributor-mapping-p1-[a-f0-9]{12}\.json$/.test(name));
  assert(existing.length <= 1, "More than one immutable contributor mapping snapshot exists");
  if (existing.length === 1) {
    const path = `data/${existing[0]}`;
    const bytes = readFileSync(join(root, path));
    assert(sha256(bytes).startsWith(existing[0].match(/([a-f0-9]{12})\.json$/)[1]), "Contributor mapping snapshot filename does not match its bytes");
    return { path, bytes, value: JSON.parse(bytes) };
  }

  const value = {
    schemaVersion: "1.0.0",
    snapshotId: activeRegistry.snapshotId,
    generatedAt: activeRegistry.generatedAt,
    contentHash: activeRegistry.contentHash,
    publicationScope: activeRegistry.publicationScope,
    linkResolution: activeRegistry.linkResolution,
    records: activeRegistry.records.map((record) => ({
      datasetId: record.datasetId,
      moduleSlug: record.moduleSlug,
      resourceClass: record.resourceClass,
      contributors: record.contributors.map(({ portrait: _portrait, ...contributor }) => contributor)
    }))
  };
  const bytes = Buffer.from(prettyJson(value));
  const path = `data/citymeter-contributor-mapping-p1-${sha256(bytes).slice(0, 12)}.json`;
  return { path, bytes, value };
}

function currentLandomRevision() {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: landomRoot, encoding: "utf8" }).trim();
}

function assertCleanLandom(revision) {
  const status = execFileSync("git", ["status", "--short"], { cwd: landomRoot, encoding: "utf8" });
  assert(status.trim() === "", "Landom worktree must be clean before thumbnail synchronization");
  const remoteRevision = execFileSync("git", ["rev-parse", "origin/main"], { cwd: landomRoot, encoding: "utf8" }).trim();
  assert(revision === remoteRevision, "Landom HEAD must equal origin/main before thumbnail synchronization");
}

function sourceImagePath(person) {
  const sourceUrl = new URL(person.portrait.url);
  const expectedPrefix = "/Landom/public/assets/people/";
  assert(sourceUrl.protocol === "https:" && sourceUrl.pathname.startsWith(expectedPrefix), `${person.personId} portrait URL is outside the governed Landom public path`);
  const filename = sourceUrl.pathname.slice(expectedPrefix.length);
  assert(filename === `${person.personId}.jpg`, `${person.personId} portrait filename is not person-bound`);
  return join(landomRoot, "public/assets/people", filename);
}

function renderThumbnail(source, personId, density, size, tempRoot) {
  const temp = join(tempRoot, `${personId.toLowerCase()}-${density}.webp`);
  execFileSync("convert", [
    source,
    "-auto-orient",
    "-thumbnail", `${size}x${size}^`,
    "-gravity", "center",
    "-extent", `${size}x${size}`,
    "-strip",
    "-define", "webp:method=6",
    "-quality", "82",
    temp
  ]);
  const bytes = readFileSync(temp);
  const hash = sha256(bytes);
  const filename = `${personId.toLowerCase()}-${density}-${hash.slice(0, 12)}.webp`;
  return { bytes, hash, filename, size };
}

function buildPortraits(mapping, peopleMedia) {
  const peopleById = new Map(peopleMedia.people.map((person) => [person.personId, person]));
  assert(peopleById.size === peopleMedia.people.length, "Landom people-media contains duplicate personId values");
  const contributorIds = [...new Set(mapping.records.flatMap((record) => record.contributors.map((person) => person.personId)))].sort();
  const tempRoot = mkdtempSync(join(tmpdir(), "citymeter-contributors-"));
  const portraits = new Map();
  const outputs = new Map();
  try {
    for (const personId of contributorIds) {
      const person = peopleById.get(personId);
      assert(person, `${personId} is absent from Landom people-media`);
      const projected = mapping.records.flatMap((record) => record.contributors).find((candidate) => candidate.personId === personId);
      assert(projected.nameTh === person.displayName.th && projected.nameEn === person.displayName.en, `${personId} display name differs between the approved mapping and Landom`);
      assert(person.profileUrl.th.endsWith(projected.compatibilityAliasTh) && person.profileUrl.en.endsWith(projected.compatibilityAliasEn), `${personId} profile compatibility URL differs from the approved mapping`);
      if (person.portrait?.status !== "publishable") {
        portraits.set(personId, { kind: "neutral_fallback", fallbackToken: "neutral-person", identityDisclosure: "none" });
        continue;
      }

      const source = sourceImagePath(person);
      const sourceBytes = readFileSync(source);
      assert(sourceBytes.length === person.portrait.bytes, `${personId} Landom portrait byte count drifted`);
      assert(sha256(sourceBytes) === person.portrait.sha256, `${personId} Landom portrait hash drifted`);
      const sourcePath = `${new URL(person.portrait.versionedUrl).pathname}${new URL(person.portrait.versionedUrl).search}`;
      const oneX = renderThumbnail(source, personId, "1x", 192, tempRoot);
      const twoX = renderThumbnail(source, personId, "2x", 384, tempRoot);
      for (const rendition of [oneX, twoX]) outputs.set(rendition.filename, rendition.bytes);
      portraits.set(personId, {
        kind: "portrait",
        assetId: `portrait-${personId.toLowerCase()}-contributor`,
        oneX: {
          sourcePath,
          path: `media/contributors/${oneX.filename}`,
          sha256: oneX.hash,
          mimeType: "image/webp",
          width: oneX.size,
          height: oneX.size
        },
        twoX: {
          sourcePath,
          path: `media/contributors/${twoX.filename}`,
          sha256: twoX.hash,
          mimeType: "image/webp",
          width: twoX.size,
          height: twoX.size
        }
      });
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
  return { portraits, outputs };
}

function portraitMarkup(contributor, prefix) {
  const image = contributor.portrait.kind === "portrait"
    ? `<img class="citymeter-contributor-image" data-contributor-image src="${prefix}${escapeHtml(contributor.portrait.oneX.path)}" srcset="${prefix}${escapeHtml(contributor.portrait.oneX.path)} 1x, ${prefix}${escapeHtml(contributor.portrait.twoX.path)} 2x" sizes="32px" alt="" width="${contributor.portrait.oneX.width}" height="${contributor.portrait.oneX.height}" loading="lazy" decoding="async"/>`
    : "";
  return `<span class="citymeter-contributor-portrait" aria-hidden="true"><span class="citymeter-contributor-fallback"></span>${image}</span>`;
}

function resolvedProfilePath(contributor, language, linkResolution) {
  const field = language === "th" ? linkResolution.thField : linkResolution.enField;
  const path = contributor[field];
  assert(typeof path === "string" && path.startsWith("/") && !path.startsWith("//"), `${contributor.personId} resolved profile path must remain same-origin`);
  return path;
}

function contributorAnchor(contributor, language, recordName, prefix, linkResolution) {
  const name = language === "th" ? contributor.nameTh : contributor.nameEn;
  const href = resolvedProfilePath(contributor, language, linkResolution);
  const accessible = language === "th"
    ? `ดูโปรไฟล์ของ ${name} ผู้ร่วมพัฒนา CityMETER ${recordName}`
    : `View ${name}'s profile, a contributor to CityMETER ${recordName}`;
  return `<a class="citymeter-contributor" href="${escapeHtml(href)}" data-contributor-person-id="${contributor.personId}" aria-label="${escapeHtml(accessible)}">${portraitMarkup(contributor, prefix)}<span class="citymeter-contributor-name">${escapeHtml(name)}</span></a>`;
}

function contributorCompactBlock(record, language, recordName, prefix, snapshotId) {
  const contributorWord = record.contributors.length === 1 ? "contributor" : "contributors";
  const label = language === "th"
    ? `ผู้ร่วมพัฒนา CityMETER ${recordName} ${record.contributors.length} คน ดูรายชื่อเมื่อเปิดรายละเอียด`
    : `${record.contributors.length} ${contributorWord} to CityMETER ${recordName}; open details to view names`;
  const portraits = record.contributors.map((contributor) => `<span class="citymeter-contributor-compact-person" data-contributor-compact-person-id="${contributor.personId}" aria-hidden="true">${portraitMarkup(contributor, prefix)}</span>`).join("");
  return `<div class="citymeter-contributors-compact" data-contributor-compact-snapshot-id="${escapeHtml(snapshotId)}" role="img" aria-label="${escapeHtml(label)}">${portraits}</div>`;
}

function contributorBlock(record, language, recordName, prefix, snapshotId, linkResolution) {
  const title = language === "th" ? "ผู้ร่วมพัฒนา" : "Contributors";
  const showLabel = language === "th" ? "แสดงผู้ร่วมพัฒนาที่เหลือ" : "Show remaining contributors";
  const hideLabel = language === "th" ? "ซ่อนผู้ร่วมพัฒนาเพิ่มเติม" : "Hide additional contributors";
  const groupLabel = language === "th" ? "ผู้ร่วมพัฒนาเพิ่มเติม" : "Additional contributors";
  const closeLabel = language === "th" ? "ปิดรายชื่อเพิ่มเติม" : "Close additional contributors";
  const visible = record.contributors.slice(0, visibleLimit).map((contributor) => contributorAnchor(contributor, language, recordName, prefix, linkResolution)).join("");
  const hidden = record.contributors.slice(visibleLimit).map((contributor) => contributorAnchor(contributor, language, recordName, prefix, linkResolution)).join("");
  const remaining = record.contributors.length - visibleLimit;
  const moreListId = `${record.datasetId}-contributors-more-list`;
  const more = hidden
    ? `<details class="citymeter-contributors-more" data-contributor-disclosure><summary aria-controls="${moreListId}" data-contributor-more-count="${remaining}" data-contributor-more-show-label="${escapeHtml(showLabel)}" data-contributor-more-hide-label="${escapeHtml(hideLabel)}" aria-label="${escapeHtml(`${showLabel} ${remaining}`)}">+${remaining}</summary><div class="citymeter-contributors-more-list" id="${moreListId}" role="group" aria-label="${escapeHtml(groupLabel)}">${hidden}<button type="button" class="citymeter-contributors-more-close" data-contributor-more-close hidden>${escapeHtml(closeLabel)}</button></div></details>`
    : "";
  const headingId = `${record.datasetId}-contributors-title`;
  return `<section class="citymeter-contributors" data-contributor-snapshot-id="${escapeHtml(snapshotId)}" aria-labelledby="${headingId}"><h4 id="${headingId}">${title}</h4><div class="citymeter-contributor-list">${visible}${more}</div></section>`;
}

function updateCards(html, page, registry) {
  const language = page === "index.html" ? "th" : "en";
  const prefix = page === "index.html" ? "./" : "../";
  const records = new Map(registry.records.map((record) => [record.datasetId, record]));
  const parts = html.split('<article class="dataset-card"');
  assert(parts.length === registry.records.length + 1, `${page} must contain every contributor card`);
  for (let index = 1; index < parts.length; index += 1) {
    const closeIndex = parts[index].indexOf("</article>");
    assert(closeIndex > 0, `${page} dataset card closing tag is missing`);
    let card = parts[index].slice(0, closeIndex);
    const tail = parts[index].slice(closeIndex);
    const datasetId = card.match(/ id="(dataset-[a-z0-9-]+)"/)?.[1];
    const record = records.get(datasetId);
    assert(record, `${page} has no approved contributor mapping for ${datasetId}`);
    const encodedRecordName = card.match(/<h3>([\s\S]*?)<\/h3>/)?.[1]?.replace(/<[^>]+>/g, "");
    assert(typeof encodedRecordName === "string", `${page}/${datasetId} localized title is missing`);
    const recordName = decodeHtmlText(encodedRecordName);
    const compactMatch = card.match(/<div class="citymeter-contributors-compact"[\s\S]*?<\/div>/);
    const detailMatch = card.match(/<section class="citymeter-contributors"[\s\S]*?<\/section>/);
    assert(compactMatch && count(card, 'class="citymeter-contributors-compact"') === 1, `${page}/${datasetId} compact contributor owner is missing or duplicated`);
    assert(detailMatch && count(card, 'class="citymeter-contributors"') === 1, `${page}/${datasetId} detail contributor owner is missing or duplicated`);
    card = card.replace(compactMatch[0], contributorCompactBlock(record, language, recordName, prefix, registry.snapshotId));
    card = card.replace(detailMatch[0], contributorBlock(record, language, recordName, prefix, registry.snapshotId, registry.linkResolution));
    parts[index] = card + tail;
  }
  return parts.join('<article class="dataset-card"');
}

function updatePage(html, page, registry, registryPath, manifestPath, oldEnhancer) {
  const inlinePattern = /<script type="application\/json" id="citymeter-contributor-data">([\s\S]*?)<\/script>/g;
  assert([...html.matchAll(inlinePattern)].length === 1, `${page} inline contributor registry must occur exactly once`);
  html = updateCards(html, page, registry);
  html = html.replace(inlinePattern, `<script type="application/json" id="citymeter-contributor-data">${publicJson(registry)}</script>`);
  const replacements = [
    [/name="citymeter:release-receipt" content="[^"]+"/, `name="citymeter:release-receipt" content="${releaseReceipt}"`],
    [/name="citymeter:contributor-candidate-build" content="[^"]+"/, `name="citymeter:contributor-candidate-build" content="${releaseReceipt}"`],
    [/name="citymeter:contributor-snapshot" content="[^"]+"/, `name="citymeter:contributor-snapshot" content="${registry.snapshotId}"`],
    [/name="citymeter:contributor-data" content="data\/citymeter-contributors-p1-[a-f0-9]{12}\.json"/, `name="citymeter:contributor-data" content="${registryPath}"`],
    [/name="citymeter:contributor-release-manifest" content="data\/citymeter-contributor-release-p1-[a-f0-9]{12}\.json"/, `name="citymeter:contributor-release-manifest" content="${manifestPath}"`]
  ];
  for (const [pattern, replacement] of replacements) {
    assert(pattern.test(html), `${page} active contributor metadata is missing for ${pattern}`);
    html = html.replace(pattern, replacement);
  }
  assert(count(html, oldEnhancer) === 1, `${page} must reference the prior active enhancer exactly once`);
  return html.replace(oldEnhancer, targetEnhancer);
}

const thaiHtml = readFileSync(join(root, "index.html"), "utf8");
const active = discoverActive(thaiHtml);
const activeRegistry = readJson(join(root, active.registry), "Active contributor registry");
const activeManifest = readJson(join(root, active.manifest), "Active contributor manifest");
const mapping = mappingSnapshot(activeRegistry);
const peopleMediaBytes = readFileSync(peopleMediaPath);
const peopleMedia = JSON.parse(peopleMediaBytes);
const peopleMediaHash = sha256(peopleMediaBytes);
const landomRevision = currentLandomRevision();
assertCleanLandom(landomRevision);
assert(peopleMedia.contract?.access === "public_read_only", "Landom people-media is not a public read-only contract");
const { portraits, outputs } = buildPortraits(mapping.value, peopleMedia);
const combinedContentHash = sha256(Buffer.concat([mapping.bytes, Buffer.from("\n"), peopleMediaBytes]));
const registry = {
  schemaVersion: "1.1.0-p1",
  snapshotId: `${mapping.value.snapshotId}-media-${peopleMediaHash.slice(0, 12)}`,
  generatedAt: peopleMedia.generatedAt,
  contentHash: combinedContentHash,
  publicationScope: mapping.value.publicationScope,
  linkResolution: mapping.value.linkResolution,
  records: mapping.value.records.map((record) => ({
    ...record,
    contributors: record.contributors.map((contributor) => ({ ...contributor, portrait: portraits.get(contributor.personId) }))
  }))
};
const registryBytes = Buffer.from(prettyJson(registry));
const registryHash = sha256(registryBytes);
const registryPath = `data/citymeter-contributors-p1-${registryHash.slice(0, 12)}.json`;
const activePortraits = [...outputs.entries()].map(([filename, bytes]) => ({ path: `media/contributors/${filename}`, sha256: sha256(bytes) })).sort((a, b) => a.path.localeCompare(b.path));
const activeFiles = new Set(activePortraits.map((portrait) => portrait.path.split("/").at(-1)));
const retainedPortraits = readdirSync(join(root, "media/contributors"))
  .filter((filename) => !activeFiles.has(filename) && /^[spi][0-9]{4}-(?:1x|2x)-[a-f0-9]{12}\.webp$/.test(filename))
  .map((filename) => ({ path: `media/contributors/${filename}`, sha256: sha256(readFileSync(join(root, "media/contributors", filename))) }))
  .sort((a, b) => a.path.localeCompare(b.path));
const projectionSummary = deriveContributorProjectionSummary(registry);
assert(projectionSummary.records === 38 && projectionSummary.uniquePeople === 29, "Approved contributor mapping coverage drifted");
assert(projectionSummary.portraitIdentities === 25 && projectionSummary.fallbackIdentities === 4, "Current Landom portrait/fallback partition is unexpected");
assert(projectionSummary.portraitRenditions === 50 && activePortraits.length === 50, "Current Landom portrait rendition inventory is incomplete");

const oldEnhancer = activeManifest.renderOwners.transitionalEnhancer.split("/").at(-1);
const oldEnhancerVersion = Number(oldEnhancer.match(/^catalog-enhancements-v(\d+)\.js$/)?.[1]);
assert(Number.isInteger(oldEnhancerVersion), "Active enhancer filename does not carry a numeric immutable version");
targetEnhancer = active.registry === registryPath ? oldEnhancer : `catalog-enhancements-v${oldEnhancerVersion + 1}.js`;
const enhancerSource = readFileSync(join(root, activeManifest.renderOwners.transitionalEnhancer), "utf8");
assert(enhancerSource.includes(active.registry), "Prior enhancer does not contain the active registry path");
const enhancer = enhancerSource.replaceAll(active.registry, registryPath);
if (active.registry === registryPath) {
  assert(enhancer.includes(registryPath), "Idempotent enhancer registry pointer check failed");
} else {
  assert(!enhancer.includes(active.registry) && enhancer.includes(registryPath), "New enhancer registry pointer migration failed");
}
const enhancerHash = sha256(enhancer);
const manifestBase = {
  ...activeManifest,
  releaseAuthority: {
    authority: "site_owner",
    authorizedAt,
    scope: "Publish the CityMETER contributor thumbnail synchronization from the current Landom public media contract to the existing GitHub Pages site while preserving approved contributor mappings"
  },
  releaseReceipt,
  snapshotId: registry.snapshotId,
  sourceSnapshot: { path: `citymeter:${mapping.path}`, sha256: sha256(mapping.bytes) },
  sourceProjection: { path: `landom:data/generated/people-media.json@${landomRevision}`, sha256: peopleMediaHash },
  contributorRegistry: { path: registryPath, sha256: registryHash },
  projectionSummary,
  renderOwners: { ...activeManifest.renderOwners, transitionalEnhancer: `assets/${targetEnhancer}` },
  renderOwnerHashes: { ...activeManifest.renderOwnerHashes, transitionalEnhancer: enhancerHash },
  portraits: activePortraits,
  retainedPortraits
};
const manifestBytes = Buffer.from(prettyJson(manifestBase));
const manifestHash = sha256(manifestBytes);
const manifestPath = `data/citymeter-contributor-release-p1-${manifestHash.slice(0, 12)}.json`;

const pages = new Map();
for (const page of ["index.html", "en/index.html"]) {
  const path = join(root, page);
  pages.set(path, updatePage(readFileSync(path, "utf8"), page, registry, registryPath, manifestPath, oldEnhancer));
}

if (!checkOnly) {
  writeFileSync(join(root, mapping.path), mapping.bytes);
  writeFileSync(join(root, registryPath), registryBytes);
  for (const [filename, bytes] of outputs) writeFileSync(join(root, "media/contributors", filename), bytes);
  writeFileSync(join(root, "assets", targetEnhancer), enhancer);
  writeFileSync(join(root, manifestPath), manifestBytes);
  for (const [path, html] of pages) writeFileSync(path, html);
}

console.log(JSON.stringify({
  mode: checkOnly ? "check" : "write",
  releaseReceipt,
  landomRevision,
  peopleMediaHash,
  mappingSnapshot: mapping.path,
  registry: registryPath,
  manifest: manifestPath,
  enhancer: `assets/${targetEnhancer}`,
  projectionSummary,
  activePortraits: activePortraits.length,
  retainedPortraits: retainedPortraits.length
}, null, 2));
