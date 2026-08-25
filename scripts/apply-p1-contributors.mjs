import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTRIBUTOR_VISIBLE_LIMIT,
  deriveContributorProjectionSummary
} from "./p1-contributor-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const landomRoot = resolve(root, "../landom-repo");
const sourceSnapshotPath = join(landomRoot, "data/generated/common-public-snapshot.json");
const sourceContributorsPath = join(landomRoot, "data/generated/citymeter/contributors.json");
const sourcePortraitManifestPath = join(landomRoot, "data/generated/portrait-derivatives.json");
const sourceReleaseManifestPath = join(landomRoot, "data/generated/release-manifest.json");
const releaseReceipt = "2026-08-25-contributors-compact-details-v27";
const previousCandidateReceipt = "2026-08-25-contributors-p1-candidate-v26";
const previousReleaseReceipt = "2026-08-16-motion-image-performance-v23";
const sourceBundle = "index-qbT50gkr-v12.js";
const previousTargetBundle = "index-qbT50gkr-v15.js";
const targetBundle = "index-qbT50gkr-v16.js";
const sourceCss = "catalog-enhancements-v21.css";
const previousTargetCss = "catalog-enhancements-v24.css";
const targetCss = "catalog-enhancements-v25.css";
const sourceEnhancement = "catalog-enhancements-v19.js";
const previousTargetEnhancement = "catalog-enhancements-v22.js";
const targetEnhancement = "catalog-enhancements-v23.js";
const checkOnly = process.argv.slice(2).includes("--check");

const expectedHashes = {
  [sourceBundle]: "f8d0f7d2f9fb5a643be4fce0310d025ab7559a458e04651580371cff03265600",
  [sourceCss]: "e34d4384f49c9d16b00f6746758ce93a4c04d2128f04f8e9cd905a7a03ab6f7a",
  [sourceEnhancement]: "43324277a611d0a79c488c13355e63418703168cd2d2844f7f3438195ea00ea3"
};

const dsIdentity = {
  packageVersion: "v0.9.0-mp1",
  uiKitVersion: "lds-kit-0.9.0-r4",
  manifestVersion: "2.1",
  colorSet: "color-srgb-05",
  authoritySourceSha: "d82ac775ab9d35a84cfb0dc77bc0ae804a7a0665"
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(path, label) {
  assert(existsSync(path), `${label} is missing: ${path}`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function immutableSource(name) {
  const source = readFileSync(join(root, "assets", name), "utf8");
  assert(sha256(source) === expectedHashes[name], `Unexpected immutable source bytes: ${name}`);
  return source;
}

function count(source, token) {
  return source.split(token).length - 1;
}

function replaceOnce(source, oldValue, newValue, label) {
  assert(count(source, oldValue) === 1, `${label} must occur exactly once`);
  return source.replace(oldValue, newValue);
}

function replaceActiveRef(source, oldValue, newValue, label) {
  const oldCount = count(source, oldValue);
  const newCount = count(source, newValue);
  assert((oldCount === 1 && newCount === 0) || (oldCount === 0 && newCount === 1), `${label} must contain exactly one old or new value`);
  return oldCount === 1 ? source.replace(oldValue, newValue) : source;
}

function replaceOneOfActiveRefs(source, oldValues, newValue, label) {
  const values = [...oldValues, newValue];
  const counts = values.map((value) => count(source, value));
  assert(counts.reduce((total, value) => total + value, 0) === 1, `${label} must contain exactly one accepted active value`);
  if (counts.at(-1) === 1) return source;
  const oldValue = oldValues[counts.findIndex((value) => value === 1)];
  return source.replace(oldValue, newValue);
}

function preserveApprovedReleaseReceipt(source, page) {
  const pattern = /<meta name="citymeter:release-receipt" content="([^"]+)" \/>/g;
  const matches = [...source.matchAll(pattern)];
  assert(matches.length === 1, `${page} must contain exactly one release-authority receipt`);
  assert([previousReleaseReceipt, previousCandidateReceipt, releaseReceipt].includes(matches[0][1]), `${page} has an unexpected release-authority receipt`);
  return source.replace(pattern, `<meta name="citymeter:release-receipt" content="${releaseReceipt}" />`);
}

function updateThemePreferenceOwner(source, page) {
  const legacyRead = '          const choice = localStorage.getItem("citymeter-theme") || "system";';
  const canonicalRead = `          const stored = localStorage.getItem("lds-theme") || localStorage.getItem("citymeter-theme") || "system";
          const normalized = stored === "auto" ? "system" : stored;
          const choice = ["system", "light", "dark"].includes(normalized) ? normalized : "system";`;
  return replaceActiveRef(source, legacyRead, canonicalRead, `${page} static theme preference owner`);
}

function replaceDelimited(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  assert(startIndex >= 0 && source.indexOf(start, startIndex + 1) === -1, `${label} start marker must occur exactly once`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(endIndex >= 0, `${label} end marker is missing`);
  return source.slice(0, startIndex) + replacement + source.slice(endIndex);
}

function publicJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("&", "\\u0026").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function safePublicSourcePath(publicPath) {
  assert(typeof publicPath === "string" && /^\/Landom\/public\/assets\/people\/contributors\/[spi][0-9]{4}-(?:1x|2x)-[a-f0-9]{12}\.webp$/.test(publicPath), `Unexpected portrait path: ${publicPath}`);
  const repoRelative = publicPath.replace(/^\/Landom\/public\//, "");
  const sourcePath = resolve(landomRoot, "public", repoRelative);
  const publicRoot = resolve(landomRoot, "public");
  assert(sourcePath.startsWith(publicRoot + sep), `Portrait path escapes Landom public root: ${publicPath}`);
  assert(existsSync(sourcePath), `Portrait rendition is missing: ${sourcePath}`);
  return sourcePath;
}

function normalizeRecords(source, expectedRecordCount) {
  const records = Array.isArray(source.records)
    ? source.records
    : source.records && typeof source.records === "object"
      ? Object.values(source.records)
      : [];
  assert(records.length === expectedRecordCount, `Contributor projection must contain the canonical ${expectedRecordCount} records; found ${records.length}`);
  return records;
}

function normalizeContributor(record, contributor, personIndex) {
  const person = personIndex.get(contributor.personId) || contributor;
  const personId = contributor.personId;
  assert(/^[SPI][0-9]{4}$/.test(personId || ""), `${record.datasetId} has an invalid personId`);
  const nameTh = contributor.nameTh || contributor.displayNameTh || person.displayNameTh;
  const nameEn = contributor.nameEn || contributor.displayNameEn || person.displayNameEn;
  const profilePathTh = contributor.profilePathTh || person.profilePathTh;
  const profilePathEn = contributor.profilePathEn || person.profilePathEn;
  const compatibilityAliasTh = contributor.compatibilityAliasTh || person.compatibilityAliasTh;
  const compatibilityAliasEn = contributor.compatibilityAliasEn || person.compatibilityAliasEn;
  assert(typeof nameTh === "string" && nameTh.trim(), `${record.datasetId}/${personId} is missing nameTh`);
  assert(typeof nameEn === "string" && nameEn.trim(), `${record.datasetId}/${personId} is missing nameEn`);
  assert(profilePathTh === `/landom/people/${personId}`, `${record.datasetId}/${personId} must use the canonical Thai same-origin person path`);
  assert(profilePathEn === `/en/landom/people/${personId}`, `${record.datasetId}/${personId} must use the canonical English same-origin person path`);
  assert(compatibilityAliasTh === `/Landom/?person=${personId}&lang=th`, `${record.datasetId}/${personId} Thai compatibility alias drifted`);
  assert(compatibilityAliasEn === `/Landom/en/?person=${personId}&lang=en`, `${record.datasetId}/${personId} English compatibility alias drifted`);
  assert((contributor.profilePublicationStatus || person.profilePublicationStatus) === "publishable", `${record.datasetId}/${personId} is not publishable`);
  assert(Array.isArray(contributor.roles) && contributor.roles.length > 0, `${record.datasetId}/${personId} requires evidenced roles`);
  const portrait = contributor.portrait || person.portrait;
  assert(portrait && ["portrait", "neutral_fallback"].includes(portrait.kind), `${record.datasetId}/${personId} has an invalid portrait state`);
  if (portrait.kind === "neutral_fallback") {
    assert(portrait.fallbackToken === "neutral-person" && portrait.identityDisclosure === "none", `${record.datasetId}/${personId} fallback must remain neutral`);
    return {
      personId,
      nameTh,
      nameEn,
      profilePathTh,
      profilePathEn,
      compatibilityAliasTh,
      compatibilityAliasEn,
      roles: [...contributor.roles],
      displayOrder: contributor.displayOrder,
      portrait: { kind: "neutral_fallback", fallbackToken: "neutral-person", identityDisclosure: "none" }
    };
  }
  const oneX = portrait.renditions?.oneX;
  const twoX = portrait.renditions?.twoX;
  for (const [density, rendition] of [["1x", oneX], ["2x", twoX]]) {
    assert(rendition?.density === density, `${record.datasetId}/${personId} is missing ${density}`);
    assert(rendition.mimeType === "image/webp", `${record.datasetId}/${personId}/${density} must be WebP`);
    assert(/^[a-f0-9]{64}$/.test(rendition.sha256 || ""), `${record.datasetId}/${personId}/${density} has an invalid hash`);
    const sourcePath = safePublicSourcePath(rendition.path);
    assert(sha256(readFileSync(sourcePath)) === rendition.sha256, `${record.datasetId}/${personId}/${density} bytes do not match the governed hash`);
    assert(Number.isInteger(rendition.width) && Number.isInteger(rendition.height) && rendition.width > 0 && rendition.height > 0, `${record.datasetId}/${personId}/${density} dimensions are invalid`);
  }
  return {
    personId,
    nameTh,
    nameEn,
    profilePathTh,
    profilePathEn,
    compatibilityAliasTh,
    compatibilityAliasEn,
    roles: [...contributor.roles],
    displayOrder: contributor.displayOrder,
    portrait: {
      kind: "portrait",
      assetId: portrait.assetId,
      oneX: {
        sourcePath: oneX.path,
        path: `media/contributors/${basename(oneX.path)}`,
        sha256: oneX.sha256,
        mimeType: oneX.mimeType,
        width: oneX.width,
        height: oneX.height
      },
      twoX: {
        sourcePath: twoX.path,
        path: `media/contributors/${basename(twoX.path)}`,
        sha256: twoX.sha256,
        mimeType: twoX.mimeType,
        width: twoX.width,
        height: twoX.height
      }
    }
  };
}

function buildRegistry(snapshot, sourceContributors, commonRelease) {
  assert(sourceContributors.snapshotId === snapshot.snapshotId, "Contributor projection and common snapshot use different snapshotId values");
  assert(sourceContributors.generatedAt === snapshot.generatedAt, "Contributor projection and common snapshot use different generatedAt values");
  const expectedIds = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8")).records.map((record) => record.id);
  assert(expectedIds.length > 0 && new Set(expectedIds).size === expectedIds.length, "Canonical catalog record identities must be non-empty and unique");
  const sourceRecords = normalizeRecords(sourceContributors, expectedIds.length);
  const snapshotPeople = Array.isArray(snapshot.people) ? snapshot.people : [];
  const peopleById = new Map(snapshotPeople.map((person) => [person.personId, person]));
  const snapshotCatalogById = new Map((snapshot.catalog || []).map((record) => [record.datasetId, record]));
  const sourceById = new Map(sourceRecords.map((record) => [record.datasetId, record]));
  assert(sourceById.size === sourceRecords.length, "Contributor projection datasetId values must be unique");
  assert(snapshotCatalogById.size === expectedIds.length, "Common snapshot catalog must exactly cover the canonical CityMETER inventory");
  assert(expectedIds.every((datasetId) => sourceById.has(datasetId)) && sourceRecords.every((record) => expectedIds.includes(record.datasetId)), "Contributor projection does not exactly cover the canonical inventory");
  assert(expectedIds.every((datasetId) => snapshotCatalogById.has(datasetId)) && [...snapshotCatalogById.keys()].every((datasetId) => expectedIds.includes(datasetId)), "Common snapshot catalog does not exactly cover the canonical inventory");
  const records = expectedIds.map((datasetId) => {
    const sourceRecord = sourceById.get(datasetId);
    const snapshotRecord = snapshotCatalogById.get(datasetId);
    assert(snapshotRecord, `${datasetId} is missing from the common snapshot catalog`);
    assert(sourceRecord.moduleSlug === datasetId, `${datasetId} moduleSlug must equal datasetId`);
    assert(sourceRecord.moduleSlug === snapshotRecord.moduleSlug && sourceRecord.resourceClass === snapshotRecord.resourceClass, `${datasetId} projection identity differs from the common snapshot`);
    assert(Array.isArray(sourceRecord.contributors) && sourceRecord.contributors.length > 0, `${datasetId} must have at least one contributor`);
    const seen = new Set();
    const snapshotRelationships = new Map((snapshotRecord.contributors || []).map((contributor) => [contributor.personId, contributor]));
    const contributors = sourceRecord.contributors
      .map((contributor) => {
        const relationship = snapshotRelationships.get(contributor.personId);
        const person = peopleById.get(contributor.personId);
        assert(relationship, `${datasetId}/${contributor.personId} is not present in the common snapshot relationship set`);
        assert(person, `${datasetId}/${contributor.personId} is not present in the common snapshot people set`);
        assert(JSON.stringify(contributor.roles) === JSON.stringify(relationship.roles) && contributor.displayOrder === relationship.displayOrder, `${datasetId}/${contributor.personId} relationship details differ from the common snapshot`);
        for (const field of ["displayNameTh", "displayNameEn", "profilePathTh", "profilePathEn", "compatibilityAliasTh", "compatibilityAliasEn", "portrait"]) {
          assert(JSON.stringify(contributor[field]) === JSON.stringify(person[field]), `${datasetId}/${contributor.personId}.${field} differs from the common snapshot person`);
        }
        return normalizeContributor(sourceRecord, contributor, peopleById);
      })
      .sort((a, b) => a.displayOrder - b.displayOrder || a.personId.localeCompare(b.personId));
    for (const contributor of contributors) {
      assert(!seen.has(contributor.personId), `${datasetId} contains duplicate contributor ${contributor.personId}`);
      seen.add(contributor.personId);
    }
    return {
      datasetId,
      moduleSlug: sourceRecord.moduleSlug,
      resourceClass: sourceRecord.resourceClass,
      contributors
    };
  });
  return {
    schemaVersion: "1.1.0-p1",
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    contentHash: snapshot.contentHash,
    publicationScope: "landometer_public_website",
    linkResolution: commonRelease.openGates.includes("canonical_person_routes_activation")
      ? {
          mode: "compatibility_alias",
          governingGate: "canonical_person_routes_activation",
          thField: "compatibilityAliasTh",
          enField: "compatibilityAliasEn"
        }
      : {
          mode: "canonical_person_path",
          governingGate: "canonical_person_routes_activation",
          thField: "profilePathTh",
          enField: "profilePathEn"
        },
    records
  };
}

function planPortraits(registry) {
  const planned = new Map();
  for (const record of registry.records) {
    for (const contributor of record.contributors) {
      if (contributor.portrait.kind !== "portrait") continue;
      for (const rendition of [contributor.portrait.oneX, contributor.portrait.twoX]) {
        if (planned.has(rendition.path)) {
          assert(planned.get(rendition.path).sha256 === rendition.sha256, `Conflicting portrait bytes for ${rendition.path}`);
          continue;
        }
        const sourcePath = safePublicSourcePath(rendition.sourcePath);
        const targetPath = join(root, rendition.path);
        assert(sha256(readFileSync(sourcePath)) === rendition.sha256, `Portrait source hash mismatch: ${rendition.path}`);
        planned.set(rendition.path, { path: rendition.path, sourcePath, targetPath, sha256: rendition.sha256 });
      }
    }
  }
  return [...planned.values()];
}

function copyPortraits(plannedPortraits) {
  mkdirSync(join(root, "media/contributors"), { recursive: true });
  for (const portrait of plannedPortraits) {
    copyFileSync(portrait.sourcePath, portrait.targetPath);
    assert(sha256(readFileSync(portrait.targetPath)) === portrait.sha256, `Copied portrait hash mismatch: ${portrait.path}`);
  }
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

function previousContributorCompactBlock(record, language, recordName, prefix, snapshotId) {
  const label = language === "th"
    ? `ผู้ร่วมพัฒนา CityMETER ${recordName} ${record.contributors.length} คน ดูรายชื่อเมื่อเปิดรายละเอียด`
    : `${record.contributors.length} contributors to CityMETER ${recordName}; open details to view names`;
  const portraits = record.contributors.map((contributor) => `<span class="citymeter-contributor-compact-person" data-contributor-compact-person-id="${contributor.personId}" aria-hidden="true">${portraitMarkup(contributor, prefix)}</span>`).join("");
  return `<div class="citymeter-contributors-compact" data-contributor-compact-snapshot-id="${escapeHtml(snapshotId)}" role="img" aria-label="${escapeHtml(label)}">${portraits}</div>`;
}

function contributorBlock(record, language, recordName, prefix, snapshotId, linkResolution) {
  const title = language === "th" ? "ผู้ร่วมพัฒนา" : "Contributors";
  const note = language === "th"
    ? "ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง"
    : "Contributors to this CityMETER view, not owners or endorsers of the source data";
  const showLabel = language === "th" ? "แสดงผู้ร่วมพัฒนาที่เหลือ" : "Show remaining contributors";
  const hideLabel = language === "th" ? "ซ่อนผู้ร่วมพัฒนาเพิ่มเติม" : "Hide additional contributors";
  const groupLabel = language === "th" ? "ผู้ร่วมพัฒนาเพิ่มเติม" : "Additional contributors";
  const closeLabel = language === "th" ? "ปิดรายชื่อเพิ่มเติม" : "Close additional contributors";
  const visible = record.contributors.slice(0, CONTRIBUTOR_VISIBLE_LIMIT).map((contributor) => contributorAnchor(contributor, language, recordName, prefix, linkResolution)).join("");
  const hidden = record.contributors.slice(CONTRIBUTOR_VISIBLE_LIMIT).map((contributor) => contributorAnchor(contributor, language, recordName, prefix, linkResolution)).join("");
  const remaining = record.contributors.length - CONTRIBUTOR_VISIBLE_LIMIT;
  const moreListId = `${record.datasetId}-contributors-more-list`;
  const more = hidden
    ? `<details class="citymeter-contributors-more" data-contributor-disclosure><summary aria-controls="${moreListId}" data-contributor-more-count="${remaining}" data-contributor-more-show-label="${escapeHtml(showLabel)}" data-contributor-more-hide-label="${escapeHtml(hideLabel)}" aria-label="${escapeHtml(`${showLabel} ${remaining}`)}">+${remaining}</summary><div class="citymeter-contributors-more-list" id="${moreListId}" role="group" aria-label="${escapeHtml(groupLabel)}">${hidden}<button type="button" class="citymeter-contributors-more-close" data-contributor-more-close hidden>${escapeHtml(closeLabel)}</button></div></details>`
    : "";
  const headingId = `${record.datasetId}-contributors-title`;
  const noteId = `${record.datasetId}-contributors-note`;
  return `<section class="citymeter-contributors" data-contributor-snapshot-id="${escapeHtml(snapshotId)}" aria-labelledby="${headingId}"><h4 id="${headingId}">${title}</h4><p class="citymeter-contributors-note" id="${noteId}">${note}</p><div class="citymeter-contributor-list" aria-describedby="${noteId}">${visible}${more}</div></section>`;
}

function previousContributorBlock(record, language, recordName, prefix, snapshotId) {
  const anchor = (contributor) => {
    const name = language === "th" ? contributor.nameTh : contributor.nameEn;
    const href = language === "th" ? contributor.profilePathTh : contributor.profilePathEn;
    const accessible = language === "th"
      ? `ดูโปรไฟล์ของ ${name} ผู้ร่วมพัฒนา CityMETER ${recordName}`
      : `View ${name}'s profile, a contributor to CityMETER ${recordName}`;
    const image = contributor.portrait.kind === "portrait"
      ? `<img class="citymeter-contributor-image" src="${prefix}${escapeHtml(contributor.portrait.oneX.path)}" srcset="${prefix}${escapeHtml(contributor.portrait.oneX.path)} 1x, ${prefix}${escapeHtml(contributor.portrait.twoX.path)} 2x" sizes="32px" alt="" width="${contributor.portrait.oneX.width}" height="${contributor.portrait.oneX.height}" loading="lazy" decoding="async"/>`
      : "";
    return `<a class="citymeter-contributor" href="${escapeHtml(href)}" data-contributor-person-id="${contributor.personId}" aria-label="${escapeHtml(accessible)}"><span class="citymeter-contributor-portrait" aria-hidden="true"><span class="citymeter-contributor-fallback"></span>${image}</span><span class="citymeter-contributor-name">${escapeHtml(name)}</span></a>`;
  };
  const title = language === "th" ? "ผู้ร่วมพัฒนา" : "Contributors";
  const note = language === "th"
    ? "ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง"
    : "Contributors to this CityMETER view, not owners or endorsers of the source data";
  const moreLabel = language === "th" ? "แสดงผู้ร่วมพัฒนาที่เหลือ" : "Show remaining contributors";
  const visible = record.contributors.slice(0, CONTRIBUTOR_VISIBLE_LIMIT).map(anchor).join("");
  const remaining = record.contributors.slice(CONTRIBUTOR_VISIBLE_LIMIT);
  const hidden = remaining.map(anchor).join("");
  const more = hidden
    ? `<details class="citymeter-contributors-more"><summary aria-label="${escapeHtml(`${moreLabel} ${remaining.length}`)}">+${remaining.length}</summary><div class="citymeter-contributors-more-list">${hidden}</div></details>`
    : "";
  const headingId = `${record.datasetId}-contributors-title`;
  const noteId = `${record.datasetId}-contributors-note`;
  return `<section class="citymeter-contributors" data-contributor-snapshot-id="${escapeHtml(snapshotId)}" aria-labelledby="${headingId}"><h4 id="${headingId}">${title}</h4><p class="citymeter-contributors-note" id="${noteId}">${note}</p><div class="citymeter-contributor-list" aria-describedby="${noteId}">${visible}${more}</div></section>`;
}

function updateCards(html, page, registry) {
  const language = page === "index.html" ? "th" : "en";
  const prefix = page === "index.html" ? "./" : "../";
  const records = new Map(registry.records.map((record) => [record.datasetId, record]));
  const parts = html.split('<article class="dataset-card"');
  assert(parts.length === registry.records.length + 1, `${page} must contain ${registry.records.length} prerendered dataset cards`);
  for (let index = 1; index < parts.length; index += 1) {
    const closeIndex = parts[index].indexOf("</article>");
    assert(closeIndex > 0, `${page} dataset card closing tag is missing`);
    let card = parts[index].slice(0, closeIndex);
    const tail = parts[index].slice(closeIndex);
    const idMatch = card.match(/ id="(dataset-[a-z0-9-]+)"/);
    assert(idMatch, `${page} dataset card is missing a stable id`);
    const datasetId = idMatch[1];
    const record = records.get(datasetId);
    assert(record, `${page} has no contributor projection for ${datasetId}`);
    const titleMatch = card.match(/<h3>([\s\S]*?)<\/h3>/);
    assert(titleMatch, `${page}/${datasetId} is missing its localized h3`);
    const articleOwner = ` id="${datasetId}" data-pillar=`;
    const migratedArticleOwner = ` id="${datasetId}" data-citymeter-record-id="${datasetId}" data-module-slug="${record.moduleSlug}" data-pillar=`;
    assert(
      (count(card, articleOwner) === 1 && count(card, migratedArticleOwner) === 0) ||
      (count(card, articleOwner) === 0 && count(card, migratedArticleOwner) === 1),
      `${page}/${datasetId} article identity owner must be old or migrated exactly once`
    );
    if (!card.includes(`data-citymeter-record-id="${datasetId}"`)) {
      card = card.replace(articleOwner, ` id="${datasetId}" data-citymeter-record-id="${datasetId}" data-module-slug="${record.moduleSlug}" data-pillar=`);
    } else {
      assert(count(card, `data-citymeter-record-id="${datasetId}"`) === 1 && count(card, `data-module-slug="${record.moduleSlug}"`) === 1, `${page}/${datasetId} stable hooks are inconsistent`);
    }
    const encodedRecordName = titleMatch[1].replace(/<[^>]+>/g, "");
    const decodedRecordName = decodeHtmlText(encodedRecordName);
    const expectedBlock = contributorBlock(record, language, decodedRecordName, prefix, registry.snapshotId, registry.linkResolution);
    const previousDoubleEscapedBlock = contributorBlock(record, language, encodedRecordName, prefix, registry.snapshotId, registry.linkResolution);
    const blockMatch = card.match(/<section class="citymeter-contributors"[\s\S]*?<\/section>/);
    if (blockMatch) {
      assert(count(card, 'class="citymeter-contributors"') === 1, `${page}/${datasetId} must contain exactly one contributor detail block`);
      const currentSnapshotId = blockMatch[0].match(/data-contributor-snapshot-id="([a-z0-9][a-z0-9._-]{11,127})"/)?.[1];
      assert(currentSnapshotId, `${page}/${datasetId} contributor detail snapshot identity is invalid`);
      const acceptedBlocks = new Set([
        expectedBlock,
        previousDoubleEscapedBlock,
        contributorBlock(record, language, decodedRecordName, prefix, currentSnapshotId, registry.linkResolution),
        contributorBlock(record, language, encodedRecordName, prefix, currentSnapshotId, registry.linkResolution),
        previousContributorBlock(record, language, decodedRecordName, prefix, currentSnapshotId),
        previousContributorBlock(record, language, encodedRecordName, prefix, currentSnapshotId)
      ]);
      assert(acceptedBlocks.has(blockMatch[0]), `${page}/${datasetId} contributor detail block drifted from the immutable projection`);
      card = card.replace(blockMatch[0], "");
    }

    const expectedCompact = contributorCompactBlock(record, language, decodedRecordName, prefix, registry.snapshotId);
    const compactMatch = card.match(/<div class="citymeter-contributors-compact"[\s\S]*?<\/div>/);
    if (compactMatch) {
      assert(count(card, 'class="citymeter-contributors-compact"') === 1, `${page}/${datasetId} must contain exactly one compact contributor group`);
      const currentCompactSnapshotId = compactMatch[0].match(/data-contributor-compact-snapshot-id="([a-z0-9][a-z0-9._-]{11,127})"/)?.[1];
      assert(currentCompactSnapshotId, `${page}/${datasetId} compact contributor snapshot identity is invalid`);
      const acceptedCompactBlocks = new Set([
        expectedCompact,
        contributorCompactBlock(record, language, encodedRecordName, prefix, registry.snapshotId),
        contributorCompactBlock(record, language, decodedRecordName, prefix, currentCompactSnapshotId),
        contributorCompactBlock(record, language, encodedRecordName, prefix, currentCompactSnapshotId),
        previousContributorCompactBlock(record, language, decodedRecordName, prefix, currentCompactSnapshotId),
        previousContributorCompactBlock(record, language, encodedRecordName, prefix, currentCompactSnapshotId)
      ]);
      assert(acceptedCompactBlocks.has(compactMatch[0]), `${page}/${datasetId} compact contributor group drifted from the immutable projection`);
      card = card.replace(compactMatch[0], "");
    }

    const actionsMatch = card.match(/<div class="dataset-card-actions">([\s\S]*?)<\/div>/);
    if (actionsMatch) {
      assert(count(card, 'class="dataset-card-actions"') === 1, `${page}/${datasetId} must contain exactly one action row`);
      card = card.replace(actionsMatch[0], actionsMatch[1]);
    }
    const openMatch = card.match(/<a class="dataset-open"[\s\S]*?<\/a>/);
    assert(openMatch && count(card, 'class="dataset-open"') === 1, `${page}/${datasetId} must contain exactly one CityMETER action`);
    card = card.replace(openMatch[0], "");
    const expectedActions = `<div class="dataset-card-actions">${openMatch[0]}${expectedCompact}</div>`;
    const detailsOwner = card.match(/<details class="dataset-details"><summary>[\s\S]*?<\/summary>/);
    assert(detailsOwner && count(card, '<details class="dataset-details">') === 1, `${page}/${datasetId} outer details owner must occur exactly once`);
    card = card.replace(detailsOwner[0], `${expectedActions}${detailsOwner[0]}${expectedBlock}`);
    parts[index] = card + tail;
  }
  return parts.join('<article class="dataset-card"');
}

function structuredContributors(record, language, linkResolution, origin) {
  return record.contributors.map((contributor) => {
    const path = resolvedProfilePath(contributor, language, linkResolution);
    return {
      "@type": "Person",
      "@id": `${origin}${path}`,
      url: `${origin}${path}`,
      name: language === "th" ? contributor.nameTh : contributor.nameEn
    };
  });
}

function updateStructuredData(html, page, registry) {
  const language = page === "index.html" ? "th" : "en";
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(matches.length === 1, `${page} must contain exactly one JSON-LD owner`);
  const graph = JSON.parse(matches[0][1]);
  const pageOwner = graph["@graph"]?.find((entry) => entry["@type"] === "WebPage");
  const origin = new URL(pageOwner?.url || (page === "index.html" ? "https://montri-th.github.io/CityMETER/" : "https://montri-th.github.io/CityMETER/en/")).origin;
  const catalog = graph["@graph"]?.find((entry) => entry["@type"] === "DataCatalog");
  assert(catalog && Array.isArray(catalog.dataset), `${page} JSON-LD DataCatalog is missing its dataset collection`);
  const existingEntries = [...catalog.dataset, ...(Array.isArray(catalog.hasPart) ? catalog.hasPart : [])];
  assert(existingEntries.length === registry.records.length, `${page} JSON-LD inventory must contain ${registry.records.length} total records`);
  const entriesById = new Map(existingEntries.map((entry) => [String(entry["@id"] || "").split("#").at(-1), entry]));
  assert(entriesById.size === registry.records.length, `${page} JSON-LD inventory contains duplicate record identities`);
  const datasets = [];
  const eventArchives = [];
  for (const record of registry.records) {
    const entry = entriesById.get(record.datasetId);
    assert(entry, `${page} JSON-LD is missing ${record.datasetId}`);
    const expected = structuredContributors(record, language, registry.linkResolution, origin);
    if (entry.contributor) {
      const previousCanonical = structuredContributors(record, language, { thField: "profilePathTh", enField: "profilePathEn" }, "https://landometer.com");
      assert([JSON.stringify(expected), JSON.stringify(previousCanonical)].includes(JSON.stringify(entry.contributor)), `${page}/${record.datasetId} JSON-LD contributor drift`);
    }
    entry.contributor = expected;
    if (record.resourceClass === "event") {
      entry["@type"] = "CreativeWork";
      eventArchives.push(entry);
    } else {
      entry["@type"] = "Dataset";
      datasets.push(entry);
    }
  }
  const summary = deriveContributorProjectionSummary(registry);
  assert(datasets.length === summary.datasetRecords && eventArchives.length === summary.eventRecords, `${page} JSON-LD resource-class branches differ from the canonical contributor projection`);
  catalog.numberOfItems = datasets.length;
  catalog.dataset = datasets;
  catalog.hasPart = eventArchives;
  const replacement = `<script type="application/ld+json">${publicJson(graph)}</script>`;
  return html.slice(0, matches[0].index) + replacement + html.slice(matches[0].index + matches[0][0].length);
}

const contributorRuntime = `const CitymeterP1VisibleLimit=${CONTRIBUTOR_VISIBLE_LIMIT},CitymeterP1Data=(()=>{try{return JSON.parse(document.getElementById("citymeter-contributor-data")?.textContent||'{"records":[]}')}catch{return{records:[]}}})(),CitymeterP1ById=new Map((CitymeterP1Data.records||[]).flatMap(c=>[[c.datasetId,c],[c.datasetId.replace(/^dataset-/,""),c]]));function CitymeterP1Record(c){return CitymeterP1ById.get(c)||CitymeterP1ById.get("dataset-"+xn(c))}function CitymeterP1Path(c,f){const g=f==="th"?CitymeterP1Data.linkResolution.thField:CitymeterP1Data.linkResolution.enField;return c[g]}function CitymeterP1Schema(c,f,g){const s=CitymeterP1Record(c);return(s?.contributors||[]).map(d=>{const h=CitymeterP1Path(d,f);return{"@type":"Person","@id":g+h,url:g+h,name:f==="th"?d.nameTh:d.nameEn}})}function CitymeterP1Portrait({person:c}){return p.jsxs("span",{className:"citymeter-contributor-portrait","aria-hidden":"true",children:[p.jsx("span",{className:"citymeter-contributor-fallback"}),c.portrait.kind==="portrait"?p.jsx("img",{className:"citymeter-contributor-image","data-contributor-image":"",src:ca(c.portrait.oneX.path),srcSet:ca(c.portrait.oneX.path)+" 1x, "+ca(c.portrait.twoX.path)+" 2x",sizes:"32px",alt:"",width:c.portrait.oneX.width,height:c.portrait.oneX.height,loading:"lazy",decoding:"async"}):null]})}function CitymeterP1Link({person:c,language:f,recordName:g}){const s=f==="th"?c.nameTh:c.nameEn,d=CitymeterP1Path(c,f),h=f==="th"?"ดูโปรไฟล์ของ "+s+" ผู้ร่วมพัฒนา CityMETER "+g:"View "+s+"'s profile, a contributor to CityMETER "+g;return p.jsxs("a",{className:"citymeter-contributor",href:d,"data-contributor-person-id":c.personId,"aria-label":h,children:[p.jsx(CitymeterP1Portrait,{person:c}),p.jsx("span",{className:"citymeter-contributor-name",children:s})]},c.personId)}function CitymeterP1Contributors({record:c,language:f,recordName:g}){const s=CitymeterP1Record(c.id),d=s?.contributors||[],h="dataset-"+xn(c.id)+"-contributors-title",A="dataset-"+xn(c.id)+"-contributors-note",H="dataset-"+xn(c.id)+"-contributors-more-list",v=f==="th"?"ผู้ร่วมพัฒนา":"Contributors",E=f==="th"?"ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง":"Contributors to this CityMETER view, not owners or endorsers of the source data",O=f==="th"?"แสดงผู้ร่วมพัฒนาที่เหลือ":"Show remaining contributors",ie=f==="th"?"ซ่อนผู้ร่วมพัฒนาเพิ่มเติม":"Hide additional contributors",Y=f==="th"?"ผู้ร่วมพัฒนาเพิ่มเติม":"Additional contributors",N=f==="th"?"ปิดรายชื่อเพิ่มเติม":"Close additional contributors",L=d.slice(0,CitymeterP1VisibleLimit),D=d.slice(CitymeterP1VisibleLimit);return p.jsxs("section",{className:"citymeter-contributors","data-contributor-snapshot-id":CitymeterP1Data.snapshotId,"aria-labelledby":h,children:[p.jsx("h4",{id:h,children:v}),p.jsx("p",{className:"citymeter-contributors-note",id:A,children:E}),p.jsxs("div",{className:"citymeter-contributor-list","aria-describedby":A,children:[L.map(B=>p.jsx(CitymeterP1Link,{person:B,language:f,recordName:g},B.personId)),D.length?p.jsxs("details",{className:"citymeter-contributors-more","data-contributor-disclosure":"",children:[p.jsx("summary",{"aria-controls":H,"data-contributor-more-count":D.length,"data-contributor-more-show-label":O,"data-contributor-more-hide-label":ie,"aria-label":O+" "+D.length,children:"+"+D.length}),p.jsxs("div",{className:"citymeter-contributors-more-list",id:H,role:"group","aria-label":Y,children:[D.map(B=>p.jsx(CitymeterP1Link,{person:B,language:f,recordName:g},B.personId)),p.jsx("button",{type:"button",className:"citymeter-contributors-more-close","data-contributor-more-close":"",hidden:!0,children:N})]})]}):null]})]})}`;

const hydratedCard = `function G6({record:c,language:f,text:g}){const s=sc(c),d=f==="th"?c.th:c.en;return p.jsxs("article",{className:"dataset-card","data-pillar":c.group,id:\`dataset-\${xn(c.id)}\`,"data-citymeter-record-id":"dataset-"+xn(c.id),"data-module-slug":"dataset-"+xn(c.id),children:[p.jsxs("a",{className:"dataset-image",href:c.href,target:"_blank",rel:"noreferrer",tabIndex:"-1","aria-hidden":"true",children:[p.jsx("img",{src:ca(s.previewPath.replace("media/previews-v2/","media/previews-v3/")),alt:"",width:"800",height:"500",loading:"lazy",decoding:"async"}),p.jsx("span",{className:\`preview-focus-label \${s.assetStatus==="limited"?"is-limited":""}\`,children:s.focusLabel[f]})]}),p.jsxs("div",{className:"dataset-body",children:[p.jsxs("div",{className:"dataset-kicker",children:[p.jsx("span",{children:c.group}),c.marketing.featured?p.jsxs("span",{children:["Featured ",String(c.marketing.featuredOrder).padStart(2,"0")]}):null]}),p.jsx("h3",{children:d}),p.jsx("p",{children:c.marketing.visualStory[f]}),p.jsx("div",{className:"feature-tags",children:c.marketing.featureTags.slice(0,3).map(A=>p.jsx("span",{children:A[f]},A.id))}),p.jsxs("dl",{className:"evidence-summary",children:[p.jsxs("div",{children:[p.jsxs("dt",{children:[p.jsx(gf,{size:18}),g.datasetExplorer.coverage]}),p.jsx("dd",{children:c.marketing.evidencedScope[f]})]}),p.jsxs("div",{children:[p.jsxs("dt",{children:[p.jsx(vf,{size:18}),g.datasetExplorer.resolution]}),p.jsx("dd",{children:c.marketing.evidencedGranularity[f]})]})]}),p.jsx(CitymeterP1Contributors,{record:c,language:f,recordName:d}),p.jsxs("details",{className:"dataset-details",children:[p.jsx("summary",{children:g.datasetExplorer.viewDetails}),p.jsxs("div",{children:[p.jsx("strong",{children:g.datasetExplorer.limitation}),p.jsx("p",{children:c.marketing.limitation[f]})]})]}),p.jsxs("a",{className:"dataset-open",href:c.href,target:"_blank",rel:"noreferrer",children:[g.datasetExplorer.openRecord,p.jsx(Yl,{size:19,weight:"bold"}),p.jsxs("span",{className:"visually-hidden",children:[" · ",g.datasetExplorer.opensNewTab]})]})]})]})}`;

const hydratedSchema = `function L6(){const c=typeof document<"u"?((document.querySelector('link[rel="canonical"]')?.href??"https://montri-th.github.io/CityMETER/").replace(/\\/en\\/?$/,"/")):"https://montri-th.github.io/CityMETER/",f=typeof document<"u"&&document.documentElement.lang==="en"?"en":"th",A=new URL(c).origin,g=Gl.filter(s=>CitymeterP1Record(s.id)?.resourceClass!=="event"),d=Gl.filter(s=>CitymeterP1Record(s.id)?.resourceClass==="event"),h={"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":c+"#page",url:c,name:"CityMETER — See the place before you decide",alternateName:"CityMETER — เห็นข้อมูลพื้นที่ก่อนตัดสินใจ",description:"A visual showcase of CityMETER implementations for land, location, business, people, services and risk decisions.",inLanguage:["th","en"],mainEntity:{"@id":c+"#catalog"}},{"@type":"DataCatalog","@id":c+"#catalog",name:"CityMETER public data views and modules",numberOfItems:g.length,dataset:g.map(s=>({"@type":"Dataset","@id":c+"#dataset-"+xn(s.id),url:c+"#dataset-"+xn(s.id),name:f==="th"?s.th:s.en,alternateName:f==="th"?s.en:s.th,description:s.marketing.visualStory[f]+". "+s.marketing.limitation[f],inLanguage:f,spatialCoverage:s.marketing.evidencedScope.status==="unknown"?void 0:s.marketing.evidencedScope[f],subjectOf:{"@type":"WebPage",url:s.href,name:(f==="th"?"เปิด ":"Open ")+(f==="th"?s.th:s.en)+" in CityMETER"},contributor:CitymeterP1Schema(s.id,f,A)})),hasPart:d.map(s=>({"@type":"CreativeWork","@id":c+"#dataset-"+xn(s.id),url:c+"#dataset-"+xn(s.id),name:f==="th"?s.th:s.en,alternateName:f==="th"?s.en:s.th,description:s.marketing.visualStory[f]+". "+s.marketing.limitation[f],inLanguage:f,spatialCoverage:s.marketing.evidencedScope.status==="unknown"?void 0:s.marketing.evidencedScope[f],subjectOf:{"@type":"WebPage",url:s.href,name:(f==="th"?"เปิด ":"Open ")+(f==="th"?s.th:s.en)+" in CityMETER"},contributor:CitymeterP1Schema(s.id,f,A)}))}]};return p.jsx("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:JSON.stringify(h)}})}`;

const contributorRuntimeV27 = `
const CitymeterP1VisibleLimit=${CONTRIBUTOR_VISIBLE_LIMIT},CitymeterP1Data=(()=>{try{return JSON.parse(document.getElementById("citymeter-contributor-data")?.textContent||'{"records":[]}')}catch{return{records:[]}}})(),CitymeterP1ById=new Map((CitymeterP1Data.records||[]).flatMap(c=>[[c.datasetId,c],[c.datasetId.replace(/^dataset-/,""),c]]));
function CitymeterP1Record(c){return CitymeterP1ById.get(c)||CitymeterP1ById.get("dataset-"+xn(c))}
function CitymeterP1Path(c,f){const g=f==="th"?CitymeterP1Data.linkResolution.thField:CitymeterP1Data.linkResolution.enField;return c[g]}
function CitymeterP1Schema(c,f,g){const s=CitymeterP1Record(c);return(s?.contributors||[]).map(d=>{const h=CitymeterP1Path(d,f);return{"@type":"Person","@id":g+h,url:g+h,name:f==="th"?d.nameTh:d.nameEn}})}
function CitymeterP1Portrait({person:c}){return p.jsxs("span",{className:"citymeter-contributor-portrait","aria-hidden":"true",children:[p.jsx("span",{className:"citymeter-contributor-fallback"}),c.portrait.kind==="portrait"?p.jsx("img",{className:"citymeter-contributor-image","data-contributor-image":"",src:ca(c.portrait.oneX.path),srcSet:ca(c.portrait.oneX.path)+" 1x, "+ca(c.portrait.twoX.path)+" 2x",sizes:"32px",alt:"",width:c.portrait.oneX.width,height:c.portrait.oneX.height,loading:"lazy",decoding:"async"}):null]})}
function CitymeterP1Link({person:c,language:f,recordName:g}){const s=f==="th"?c.nameTh:c.nameEn,d=CitymeterP1Path(c,f),h=f==="th"?"ดูโปรไฟล์ของ "+s+" ผู้ร่วมพัฒนา CityMETER "+g:"View "+s+"'s profile, a contributor to CityMETER "+g;return p.jsxs("a",{className:"citymeter-contributor",href:d,"data-contributor-person-id":c.personId,"aria-label":h,children:[p.jsx(CitymeterP1Portrait,{person:c}),p.jsx("span",{className:"citymeter-contributor-name",children:s})]},c.personId)}
function CitymeterP1Compact({record:c,language:f,recordName:g}){const s=CitymeterP1Record(c.id),d=s?.contributors||[],h=f==="th"?"ผู้ร่วมพัฒนา CityMETER "+g+" "+d.length+" คน ดูรายชื่อเมื่อเปิดรายละเอียด":d.length+" contributor"+(d.length===1?"":"s")+" to CityMETER "+g+"; open details to view names";return p.jsx("div",{className:"citymeter-contributors-compact","data-contributor-compact-snapshot-id":CitymeterP1Data.snapshotId,role:"img","aria-label":h,children:d.map(A=>p.jsx("span",{className:"citymeter-contributor-compact-person","data-contributor-compact-person-id":A.personId,"aria-hidden":"true",children:p.jsx(CitymeterP1Portrait,{person:A})},A.personId))})}
function CitymeterP1ContributorsDetail({record:c,language:f,recordName:g}){const s=CitymeterP1Record(c.id),d=s?.contributors||[],h="dataset-"+xn(c.id)+"-contributors-title",A="dataset-"+xn(c.id)+"-contributors-note",H="dataset-"+xn(c.id)+"-contributors-more-list",v=f==="th"?"ผู้ร่วมพัฒนา":"Contributors",E=f==="th"?"ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง":"Contributors to this CityMETER view, not owners or endorsers of the source data",O=f==="th"?"แสดงผู้ร่วมพัฒนาที่เหลือ":"Show remaining contributors",ie=f==="th"?"ซ่อนผู้ร่วมพัฒนาเพิ่มเติม":"Hide additional contributors",Y=f==="th"?"ผู้ร่วมพัฒนาเพิ่มเติม":"Additional contributors",N=f==="th"?"ปิดรายชื่อเพิ่มเติม":"Close additional contributors",L=d.slice(0,CitymeterP1VisibleLimit),D=d.slice(CitymeterP1VisibleLimit);return p.jsxs("section",{className:"citymeter-contributors","data-contributor-snapshot-id":CitymeterP1Data.snapshotId,"aria-labelledby":h,children:[p.jsx("h4",{id:h,children:v}),p.jsx("p",{className:"citymeter-contributors-note",id:A,children:E}),p.jsxs("div",{className:"citymeter-contributor-list","aria-describedby":A,children:[L.map(B=>p.jsx(CitymeterP1Link,{person:B,language:f,recordName:g},B.personId)),D.length?p.jsxs("details",{className:"citymeter-contributors-more","data-contributor-disclosure":"",children:[p.jsx("summary",{"aria-controls":H,"data-contributor-more-count":D.length,"data-contributor-more-show-label":O,"data-contributor-more-hide-label":ie,"aria-label":O+" "+D.length,children:"+"+D.length}),p.jsxs("div",{className:"citymeter-contributors-more-list",id:H,role:"group","aria-label":Y,children:[D.map(B=>p.jsx(CitymeterP1Link,{person:B,language:f,recordName:g},B.personId)),p.jsx("button",{type:"button",className:"citymeter-contributors-more-close","data-contributor-more-close":"",hidden:!0,children:N})]})]}):null]})]})}
`;

const hydratedCardV27 = `function G6({record:c,language:f,text:g}){const s=sc(c),d=f==="th"?c.th:c.en;return p.jsxs("article",{className:"dataset-card","data-pillar":c.group,id:"dataset-"+xn(c.id),"data-citymeter-record-id":"dataset-"+xn(c.id),"data-module-slug":"dataset-"+xn(c.id),children:[p.jsxs("a",{className:"dataset-image",href:c.href,target:"_blank",rel:"noreferrer",tabIndex:"-1","aria-hidden":"true",children:[p.jsx("img",{src:ca(s.previewPath.replace("media/previews-v2/","media/previews-v3/")),alt:"",width:"800",height:"500",loading:"lazy",decoding:"async"}),p.jsx("span",{className:"preview-focus-label "+(s.assetStatus==="limited"?"is-limited":""),children:s.focusLabel[f]})]}),p.jsxs("div",{className:"dataset-body",children:[p.jsxs("div",{className:"dataset-kicker",children:[p.jsx("span",{children:c.group}),c.marketing.featured?p.jsxs("span",{children:["Featured ",String(c.marketing.featuredOrder).padStart(2,"0")]}):null]}),p.jsx("h3",{children:d}),p.jsx("p",{children:c.marketing.visualStory[f]}),p.jsx("div",{className:"feature-tags",children:c.marketing.featureTags.slice(0,3).map(A=>p.jsx("span",{children:A[f]},A.id))}),p.jsxs("dl",{className:"evidence-summary",children:[p.jsxs("div",{children:[p.jsxs("dt",{children:[p.jsx(gf,{size:18}),g.datasetExplorer.coverage]}),p.jsx("dd",{children:c.marketing.evidencedScope[f]})]}),p.jsxs("div",{children:[p.jsxs("dt",{children:[p.jsx(vf,{size:18}),g.datasetExplorer.resolution]}),p.jsx("dd",{children:c.marketing.evidencedGranularity[f]})]})]}),p.jsxs("div",{className:"dataset-card-actions",children:[p.jsxs("a",{className:"dataset-open",href:c.href,target:"_blank",rel:"noreferrer",children:[g.datasetExplorer.openRecord,p.jsx(Yl,{size:19,weight:"bold"}),p.jsxs("span",{className:"visually-hidden",children:[" · ",g.datasetExplorer.opensNewTab]})]}),p.jsx(CitymeterP1Compact,{record:c,language:f,recordName:d})]}),p.jsxs("details",{className:"dataset-details",children:[p.jsx("summary",{children:g.datasetExplorer.viewDetails}),p.jsx(CitymeterP1ContributorsDetail,{record:c,language:f,recordName:d}),p.jsxs("div",{children:[p.jsx("strong",{children:g.datasetExplorer.limitation}),p.jsx("p",{children:c.marketing.limitation[f]})]})]})]})]})}`;

function buildBundle() {
  let bundle = immutableSource(sourceBundle);
  bundle = replaceDelimited(bundle, "function G6(", "function CatalogStructureDiagram(", `${contributorRuntimeV27}${hydratedCardV27}`, "Hydrated contributor owner");
  bundle = replaceDelimited(bundle, "function L6()", "function _f()", hydratedSchema, "Hydrated JSON-LD owner");
  bundle = replaceOnce(
    bundle,
    'function _6(){if(typeof window>"u")return"system";const c=window.localStorage.getItem("citymeter-theme");return wf.has(c)?c:"system"}',
    'function _6(){if(typeof window>"u")return"system";const c=window.localStorage.getItem("lds-theme")||window.localStorage.getItem("citymeter-theme"),f=c==="auto"?"system":c;return wf.has(f)?f:"system"}',
    "Hydrated canonical theme read"
  );
  bundle = replaceOnce(
    bundle,
    'window.localStorage.setItem("citymeter-theme",D)',
    'window.localStorage.setItem("lds-theme",D)',
    "Hydrated canonical theme write"
  );
  assert(count(bundle, "CitymeterP1Compact") >= 2, "Hydrated compact contributor component was not installed");
  assert(count(bundle, "CitymeterP1ContributorsDetail") >= 2, "Hydrated contributor detail component was not installed");
  assert(!bundle.includes('setItem("citymeter-theme"'), "Hydrated bundle must never write the read-only legacy theme key");
  return bundle;
}

const enhancerFunctions = `  const contributorDisclosureBindings = new WeakSet();
  const contributorImageBindings = new WeakSet();

  function bindContributorImage(image) {
    if (contributorImageBindings.has(image)) return;
    contributorImageBindings.add(image);
    const useFallback = () => {
      image.classList.add("is-broken");
      image.removeAttribute("srcset");
      image.removeAttribute("src");
    };
    image.addEventListener("error", useFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) useFallback();
  }

  function bindContributorDisclosure(more) {
    if (contributorDisclosureBindings.has(more)) return;
    const summary = more.querySelector(":scope > summary");
    const moreList = more.querySelector(":scope > .citymeter-contributors-more-list");
    const close = moreList?.querySelector("[data-contributor-more-close]");
    if (!summary || !moreList || !close) return;
    contributorDisclosureBindings.add(more);
    close.hidden = false;
    const focusable = () => [...moreList.querySelectorAll('a[href], button:not([hidden])')];
    const sync = () => {
      const label = more.open ? summary.dataset.contributorMoreHideLabel : summary.dataset.contributorMoreShowLabel;
      summary.setAttribute("aria-expanded", String(more.open));
      summary.setAttribute("aria-label", label + " " + summary.dataset.contributorMoreCount);
    };
    const closeAndReturn = () => {
      more.open = false;
      sync();
      summary.focus();
    };
    more.addEventListener("toggle", () => {
      sync();
      if (more.open) queueMicrotask(() => focusable()[0]?.focus());
    });
    more.addEventListener("keydown", (event) => {
      if (!more.open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndReturn();
        return;
      }
      if (event.key !== "Tab") return;
      const targets = focusable();
      if (!targets.length) return;
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && (document.activeElement === first || !moreList.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !moreList.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    });
    close.addEventListener("click", closeAndReturn);
    sync();
  }

  function bindContributorInteractions(section) {
    section.querySelectorAll("[data-contributor-image]").forEach(bindContributorImage);
    section.querySelectorAll("[data-contributor-disclosure]").forEach(bindContributorDisclosure);
  }

  function contributorPortrait(person) {
    const portrait = element("span", "citymeter-contributor-portrait");
    portrait.setAttribute("aria-hidden", "true");
    portrait.append(element("span", "citymeter-contributor-fallback"));
    if (person.portrait.kind === "portrait") {
      const image = document.createElement("img");
      image.className = "citymeter-contributor-image";
      image.dataset.contributorImage = "";
      image.src = assetBase + person.portrait.oneX.path;
      image.srcset = assetBase + person.portrait.oneX.path + " 1x, " + assetBase + person.portrait.twoX.path + " 2x";
      image.sizes = "32px";
      image.alt = "";
      image.width = person.portrait.oneX.width;
      image.height = person.portrait.oneX.height;
      image.loading = "lazy";
      image.decoding = "async";
      portrait.append(image);
    }
    return portrait;
  }

  function contributorLink(person, recordName) {
    const name = language === "th" ? person.nameTh : person.nameEn;
    const link = element("a", "citymeter-contributor");
    const pathField = language === "th" ? contributorRegistry.linkResolution.thField : contributorRegistry.linkResolution.enField;
    link.href = person[pathField];
    link.dataset.contributorPersonId = person.personId;
    link.setAttribute("aria-label", language === "th"
      ? "ดูโปรไฟล์ของ " + name + " ผู้ร่วมพัฒนา CityMETER " + recordName
      : "View " + name + "'s profile, a contributor to CityMETER " + recordName);
    link.append(contributorPortrait(person), element("span", "citymeter-contributor-name", name));
    return link;
  }

  function contributorCompact(record, recordName) {
    const compact = element("div", "citymeter-contributors-compact");
    compact.dataset.contributorCompactSnapshotId = contributorRegistry.snapshotId;
    compact.setAttribute("role", "img");
    compact.setAttribute("aria-label", language === "th"
      ? "ผู้ร่วมพัฒนา CityMETER " + recordName + " " + record.contributors.length + " คน ดูรายชื่อเมื่อเปิดรายละเอียด"
      : record.contributors.length + " contributor" + (record.contributors.length === 1 ? "" : "s") + " to CityMETER " + recordName + "; open details to view names");
    record.contributors.forEach((person) => {
      const item = element("span", "citymeter-contributor-compact-person");
      item.dataset.contributorCompactPersonId = person.personId;
      item.setAttribute("aria-hidden", "true");
      item.append(contributorPortrait(person));
      compact.append(item);
    });
    return compact;
  }

  function contributorDetailBlock(record, recordName) {
    const section = element("section", "citymeter-contributors");
    const headingId = record.datasetId + "-contributors-title";
    const noteId = record.datasetId + "-contributors-note";
    section.dataset.contributorSnapshotId = contributorRegistry.snapshotId;
    section.setAttribute("aria-labelledby", headingId);
    const heading = element("h4", "", language === "th" ? "ผู้ร่วมพัฒนา" : "Contributors");
    heading.id = headingId;
    const note = element("p", "citymeter-contributors-note", language === "th"
      ? "ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง"
      : "Contributors to this CityMETER view, not owners or endorsers of the source data");
    note.id = noteId;
    const list = element("div", "citymeter-contributor-list");
    list.setAttribute("aria-describedby", noteId);
    record.contributors.slice(0, ${CONTRIBUTOR_VISIBLE_LIMIT}).forEach((person) => list.append(contributorLink(person, recordName)));
    const remaining = record.contributors.slice(${CONTRIBUTOR_VISIBLE_LIMIT});
    if (remaining.length) {
      const more = element("details", "citymeter-contributors-more");
      more.dataset.contributorDisclosure = "";
      const summary = element("summary", "", "+" + remaining.length);
      const moreListId = record.datasetId + "-contributors-more-list";
      summary.setAttribute("aria-controls", moreListId);
      summary.dataset.contributorMoreCount = String(remaining.length);
      summary.dataset.contributorMoreShowLabel = language === "th" ? "แสดงผู้ร่วมพัฒนาที่เหลือ" : "Show remaining contributors";
      summary.dataset.contributorMoreHideLabel = language === "th" ? "ซ่อนผู้ร่วมพัฒนาเพิ่มเติม" : "Hide additional contributors";
      summary.setAttribute("aria-label", summary.dataset.contributorMoreShowLabel + " " + remaining.length);
      const moreList = element("div", "citymeter-contributors-more-list");
      moreList.id = moreListId;
      moreList.setAttribute("role", "group");
      moreList.setAttribute("aria-label", language === "th" ? "ผู้ร่วมพัฒนาเพิ่มเติม" : "Additional contributors");
      remaining.forEach((person) => moreList.append(contributorLink(person, recordName)));
      const close = element("button", "citymeter-contributors-more-close", language === "th" ? "ปิดรายชื่อเพิ่มเติม" : "Close additional contributors");
      close.type = "button";
      close.hidden = true;
      close.dataset.contributorMoreClose = "";
      moreList.append(close);
      more.append(summary, moreList);
      list.append(more);
    }
    section.append(heading, note, list);
    return section;
  }

  function enhanceContributors(card) {
    const record = contributorById.get(card.id);
    if (!record) return;
    card.dataset.citymeterRecordId = record.datasetId;
    card.dataset.moduleSlug = record.moduleSlug;
    const body = card.querySelector(":scope > .dataset-body");
    const details = body?.querySelector(":scope > .dataset-details");
    const open = body?.querySelector(".dataset-open");
    if (!body || !details || !open) return;
    const title = card.querySelector(":scope > .dataset-body > h3")?.textContent?.trim() || card.id;
    let actions = body.querySelector(":scope > .dataset-card-actions");
    if (!actions) {
      actions = element("div", "dataset-card-actions");
      details.before(actions);
    }
    if (open.parentElement !== actions) actions.prepend(open);

    const expectedCompactIds = record.contributors.map((person) => person.personId).join("|");
    let compact = actions.querySelector(":scope > .citymeter-contributors-compact");
    const compactIds = compact ? [...compact.querySelectorAll("[data-contributor-compact-person-id]")].map((item) => item.dataset.contributorCompactPersonId).join("|") : "";
    if (!compact || compact.dataset.contributorCompactSnapshotId !== contributorRegistry.snapshotId || compactIds !== expectedCompactIds) {
      const replacement = contributorCompact(record, title);
      if (compact) compact.replaceWith(replacement);
      else actions.append(replacement);
      compact = replacement;
    }

    const legacyDetail = body.querySelector(":scope > .citymeter-contributors");
    let detail = details.querySelector(":scope > .citymeter-contributors");
    const expectedDetailIds = record.contributors.map((person) => person.personId).join("|");
    const detailIds = detail ? [...detail.querySelectorAll("[data-contributor-person-id]")].map((item) => item.dataset.contributorPersonId).join("|") : "";
    if (!detail || detail.dataset.contributorSnapshotId !== contributorRegistry.snapshotId || detailIds !== expectedDetailIds) {
      const replacement = contributorDetailBlock(record, title);
      if (detail) detail.replaceWith(replacement);
      else details.querySelector(":scope > summary")?.after(replacement);
      detail = replacement;
    }
    if (legacyDetail && legacyDetail !== detail) legacyDetail.remove();
    bindContributorInteractions(compact);
    bindContributorInteractions(detail);
  }

`;

function buildEnhancer(registryFile) {
  let enhancer = immutableSource(sourceEnhancement);
  enhancer = replaceOnce(enhancer, "  let recordById = new Map();", "  let recordById = new Map();\n  let contributorRegistry = { snapshotId: \"unavailable\", records: [] };\n  let contributorById = new Map();", "Contributor registry state");
  enhancer = replaceOnce(enhancer, "  function enhanceCard(card) {", `${enhancerFunctions}  function enhanceCard(card) {\n    enhanceContributors(card);`, "Contributor enhancement owner");
  const oldLoader = `  function loadSourceRegistry() {
    if (!registryPromise) {
      registryPromise = fetch(assetBase + "data/catalog-source-review.json?v=20260816-motion-image-performance-v23", { cache: "force-cache" }).then(async (response) => {
        if (!response.ok) throw new Error("Source registry returned " + response.status);
        return { registry: await response.json() };
      }).catch((error) => ({ error }));
    }
    return registryPromise;
  }`;
  const newLoader = `  function loadSourceRegistry() {
    if (!registryPromise) {
      registryPromise = Promise.all([
        fetch(assetBase + "data/catalog-source-review.json?v=20260816-motion-image-performance-v23", { cache: "force-cache" }).then(async (response) => {
          if (!response.ok) throw new Error("Source registry returned " + response.status);
          return response.json();
        }),
        fetch(assetBase + "data/${registryFile}", { cache: "force-cache" }).then(async (response) => {
          if (!response.ok) throw new Error("Contributor registry returned " + response.status);
          return response.json();
        })
      ]).then(([registry, contributors]) => ({ registry, contributors })).catch((error) => ({ error }));
    }
    return registryPromise;
  }`;
  enhancer = replaceOnce(enhancer, oldLoader, newLoader, "Concurrent source and contributor registry loader");
  enhancer = replaceOnce(
    enhancer,
    "          const { registry, error } = await registryResultPromise;",
    "          const { registry, contributors, error } = await registryResultPromise;",
    "Contributor registry result"
  );
  enhancer = replaceOnce(
    enhancer,
    "          recordById = new Map(registry.records.map((record) => [record.id, record]));",
    "          recordById = new Map(registry.records.map((record) => [record.id, record]));\n          contributorRegistry = contributors;\n          contributorById = new Map(contributors.records.map((record) => [record.datasetId, record]));",
    "Contributor registry activation"
  );
  return enhancer;
}

const p1Css = `
/* CityMETER contributor release v27. Collapsed cards show faces only; full attribution stays in native details. */
.dataset-card-actions {
  order: 1;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
}

.dataset-card-actions .dataset-open {
  order: 0;
  margin-top: 0;
}

.citymeter-contributors-compact {
  min-height: 34px;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  margin-left: auto;
}

.citymeter-contributor-compact-person {
  width: 34px;
  height: 34px;
  display: inline-grid;
  flex: 0 0 34px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--raised);
}

.citymeter-contributor-compact-person .citymeter-contributor-portrait {
  border: 0;
}

.dataset-card:has(.dataset-details[open]) .citymeter-contributors-compact {
  display: none;
}

.citymeter-contributors {
  margin: 0 0 13px;
  padding-top: 16px;
  border-top: 1px solid var(--hairline);
}

.citymeter-contributors h4 {
  margin: 0 0 4px;
  color: var(--text);
  font-family: "IBM Plex Sans Thai Looped", "Bai Jamjuree", sans-serif;
  font-size: 14px;
  line-height: 1.35;
}

[lang="en"] .citymeter-contributors h4 {
  font-family: Arvo, Georgia, serif;
}

.citymeter-contributors-note {
  margin: 0 0 10px;
  color: var(--text-meta);
  font-size: 11px;
  line-height: 1.45;
}

.citymeter-contributor-list,
.citymeter-contributors-more-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.citymeter-contributor {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--raised);
  padding: 5px 10px 5px 5px;
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  text-decoration: none;
}

.citymeter-contributor:is(:hover, :focus-visible),
.citymeter-contributors-more > summary:is(:hover, :focus-visible),
.citymeter-contributors-more-close:is(:hover, :focus-visible) {
  border-color: var(--accent);
  color: var(--accent);
}

.citymeter-contributor-portrait {
  position: relative;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  overflow: hidden;
  border: 1px solid var(--hairline);
  border-radius: 50%;
  background: var(--canvas-soft);
}

.citymeter-contributor-fallback,
.citymeter-contributor-fallback::before,
.citymeter-contributor-fallback::after {
  position: absolute;
  content: "";
}

.citymeter-contributor-fallback {
  inset: 0;
}

.citymeter-contributor-fallback::before {
  width: 8px;
  height: 8px;
  top: 7px;
  left: 11px;
  border-radius: 50%;
  background: var(--text-meta);
}

.citymeter-contributor-fallback::after {
  width: 18px;
  height: 10px;
  left: 6px;
  bottom: 5px;
  border-radius: 10px 10px 6px 6px;
  background: var(--text-meta);
}

.citymeter-contributor-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.citymeter-contributor-image.is-broken {
  display: none;
}

.citymeter-contributors-more {
  flex: 0 0 auto;
}

.citymeter-contributors-more[open] {
  flex-basis: 100%;
}

.citymeter-contributors-more > summary {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--raised);
  color: var(--accent);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  cursor: pointer;
  list-style: none;
}

.citymeter-contributors-more > summary::-webkit-details-marker {
  display: none;
}

.citymeter-contributors-more-list {
  width: 100%;
  margin-top: 8px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  padding: 10px;
  box-shadow: var(--shadow-low);
}

.citymeter-contributors-more-close {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--raised);
  padding: 8px 12px;
  color: var(--accent);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 420px) {
  .citymeter-contributor-name {
    max-width: 18ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
`;

const snapshot = readJson(sourceSnapshotPath, "Common public snapshot");
const sourceContributors = readJson(sourceContributorsPath, "CityMETER contributor projection");
const sourcePortraitManifest = readJson(sourcePortraitManifestPath, "Portrait derivative manifest");
const sourceReleaseManifest = readJson(sourceReleaseManifestPath, "Common release manifest");
assert(sourceReleaseManifest.localeAggregation?.performed === false, "P1 common release must state that Locale aggregation was not performed");
assert(Array.isArray(sourceReleaseManifest.localeAggregation.aggregationOutputs) && sourceReleaseManifest.localeAggregation.aggregationOutputs.length === 0, "P1 common release must not claim Locale aggregation outputs");
assert(sourceReleaseManifest.localeAggregation.crosswalkRequiredBeforeAggregation === true, "P1 common release must preserve the crosswalk-before-aggregation rule");
const registry = buildRegistry(snapshot, sourceContributors, sourceReleaseManifest);
const registryBytes = prettyJson(registry);
const registryHash = sha256(registryBytes);
const registryFile = `citymeter-contributors-p1-${registryHash.slice(0, 12)}.json`;
const registryPath = join(root, "data", registryFile);
const plannedPortraits = planPortraits(registry);
const portraits = plannedPortraits.map(({ path, sha256: hash }) => ({ path, sha256: hash }));
const projectionSummary = deriveContributorProjectionSummary(registry);
assert(projectionSummary.portraitRenditions === portraits.length, "Portrait rendition inventory differs from the canonical contributor projection");
assert(sourcePortraitManifest.snapshotId === registry.snapshotId, "Portrait derivative manifest and contributor registry use different snapshots");

const bundle = buildBundle();
const enhancement = buildEnhancer(registryFile);
const css = `${immutableSource(sourceCss).trimEnd()}\n${p1Css.trim()}\n`;

const artifactManifest = {
  schemaVersion: "1.1.0-p1",
  releaseStatus: "approved_for_publication",
  releaseAuthority: {
    authority: "site_owner",
    authorizedAt: "2026-08-25",
    scope: "Publish the completed CityMETER P2-P6 contributor presentation to the existing GitHub Pages site while preserving approved live content"
  },
  publishable: true,
  mustNotDeploy: false,
  releaseReceipt,
  snapshotId: registry.snapshotId,
  sourceSnapshot: {
    path: "landom:data/generated/common-public-snapshot.json",
    sha256: sha256(readFileSync(sourceSnapshotPath))
  },
  sourceProjection: {
    path: "landom:data/generated/citymeter/contributors.json",
    sha256: sha256(readFileSync(sourceContributorsPath))
  },
  contributorRegistry: { path: `data/${registryFile}`, sha256: registryHash },
  projectionSummary,
  personLinkResolution: registry.linkResolution,
  renderOwners: {
    thaiPrerender: "index.html",
    englishPrerender: "en/index.html",
    hydratedBundle: `assets/${targetBundle}`,
    transitionalEnhancer: `assets/${targetEnhancement}`,
    styles: `assets/${targetCss}`
  },
  renderOwnerHashes: {
    hydratedBundle: sha256(bundle),
    transitionalEnhancer: sha256(enhancement),
    styles: sha256(css)
  },
  portraits,
  portraitGovernance: {
    cachePolicy: sourcePortraitManifest.cachePolicy,
    withdrawalRunbook: sourcePortraitManifest.withdrawalRunbook
  },
  commonRelease: {
    releaseId: sourceReleaseManifest.releaseId,
    stage: sourceReleaseManifest.stage,
    publishable: sourceReleaseManifest.publishable,
    mustNotDeploy: sourceReleaseManifest.mustNotDeploy,
    openGates: sourceReleaseManifest.openGates,
    localeAggregation: sourceReleaseManifest.localeAggregation,
    dsIdentity: sourceReleaseManifest.dsIdentity
  },
  designSystem: dsIdentity,
  publicationScope: registry.publicationScope,
  canonicalPersonPathContract: {
    th: "/landom/people/{personId}",
    en: "/en/landom/people/{personId}"
  },
  excludedPrivateInputs: true
};
const manifestBytes = prettyJson(artifactManifest);
const manifestHash = sha256(manifestBytes);
const manifestFile = `citymeter-contributor-release-p1-${manifestHash.slice(0, 12)}.json`;

const pageOutputs = new Map();
for (const page of ["index.html", "en/index.html"]) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  html = updateThemePreferenceOwner(html, page);
  html = updateCards(html, page, registry);
  html = updateStructuredData(html, page, registry);
  html = replaceOneOfActiveRefs(html, [sourceBundle, previousTargetBundle], targetBundle, `${page} bundle ref`);
  html = replaceOneOfActiveRefs(html, [sourceCss, previousTargetCss], targetCss, `${page} CSS ref`);
  html = replaceOneOfActiveRefs(html, [sourceEnhancement, previousTargetEnhancement], targetEnhancement, `${page} enhancement ref`);
  html = preserveApprovedReleaseReceipt(html, page);
  const assetPrefix = page === "index.html" ? "./" : "../";
  const headMarker = `    <link rel="stylesheet" crossorigin href="${assetPrefix}assets/index-cqxdfePB.css?v=2">`;
  const contributorMeta = `    <meta name="citymeter:contributor-candidate-build" content="${releaseReceipt}" />\n    <meta name="citymeter:contributor-snapshot" content="${escapeHtml(registry.snapshotId)}" />\n    <meta name="citymeter:contributor-data" content="data/${registryFile}" />\n    <meta name="citymeter:contributor-release-manifest" content="data/${manifestFile}" />\n    <script type="application/json" id="citymeter-contributor-data">${publicJson(registry)}</script>\n`;
  if (!html.includes('id="citymeter-contributor-data"')) {
    assert(count(html, headMarker) === 1, `${page} contributor data insertion owner must occur exactly once`);
    html = html.replace(headMarker, contributorMeta + headMarker);
  } else {
    assert(count(html, 'id="citymeter-contributor-data"') === 1, `${page} must contain exactly one inline contributor registry`);
    const inlinePattern = /<script type="application\/json" id="citymeter-contributor-data">([\s\S]*?)<\/script>/g;
    const inlineMatches = [...html.matchAll(inlinePattern)];
    assert(inlineMatches.length === 1, `${page} inline contributor registry owner must occur exactly once`);
    const currentInlineRegistry = JSON.parse(inlineMatches[0][1]);
    const snapshotMeta = `<meta name="citymeter:contributor-snapshot" content="${escapeHtml(registry.snapshotId)}" />`;
    const snapshotMetaPattern = /<meta name="citymeter:contributor-snapshot" content="([a-z0-9][a-z0-9._-]{11,127})" \/>/g;
    const snapshotMetaMatches = [...html.matchAll(snapshotMetaPattern)];
    assert(snapshotMetaMatches.length === 1 && snapshotMetaMatches[0][1] === currentInlineRegistry.snapshotId, `${page} current snapshot meta and inline registry must agree`);
    html = html.replace(snapshotMetaPattern, snapshotMeta);
    const candidateMeta = `<meta name="citymeter:contributor-candidate-build" content="${releaseReceipt}" />`;
    const candidateMetaPattern = /<meta name="citymeter:contributor-candidate-build" content="([^"]+)" \/>/g;
    const candidateMetaMatches = [...html.matchAll(candidateMetaPattern)];
    assert(candidateMetaMatches.length <= 1, `${page} must contain at most one candidate-build pointer before migration`);
    if (candidateMetaMatches.length === 0) {
      assert(count(html, snapshotMeta) === 1, `${page} candidate-build insertion owner must occur exactly once`);
      html = html.replace(snapshotMeta, `${candidateMeta}\n    ${snapshotMeta}`);
    } else {
      assert([previousCandidateReceipt, releaseReceipt].includes(candidateMetaMatches[0][1]), `${page} has an unexpected contributor candidate-build receipt`);
      html = html.replace(candidateMetaPattern, candidateMeta);
    }
    assert(count(html, candidateMeta) === 1, `${page} must contain exactly one candidate-build pointer`);
    const registryMetaPattern = /<meta name="citymeter:contributor-data" content="(data\/citymeter-contributors-p1-[a-f0-9]{12}\.json)" \/>/g;
    const registryMetaMatches = [...html.matchAll(registryMetaPattern)];
    assert(registryMetaMatches.length === 1, `${page} contributor data pointer must occur exactly once`);
    const currentRegistryPath = join(root, registryMetaMatches[0][1]);
    assert(existsSync(currentRegistryPath), `${page} current immutable contributor registry is missing`);
    assert(JSON.stringify(readJson(currentRegistryPath, `${page} current contributor registry`)) === JSON.stringify(currentInlineRegistry), `${page} current immutable and inline contributor registries disagree`);
    html = html.replace(registryMetaPattern, `<meta name="citymeter:contributor-data" content="data/${registryFile}" />`);
    html = html.replace(inlinePattern, `<script type="application/json" id="citymeter-contributor-data">${publicJson(registry)}</script>`);
    const manifestMetaPattern = /<meta name="citymeter:contributor-release-manifest" content="data\/citymeter-contributor-release-p1-[a-f0-9]{12}\.json" \/>/g;
    const manifestMetaMatches = [...html.matchAll(manifestMetaPattern)];
    assert(manifestMetaMatches.length === 1, `${page} must contain exactly one contributor release-manifest pointer`);
    html = html.replace(manifestMetaPattern, `<meta name="citymeter:contributor-release-manifest" content="data/${manifestFile}" />`);
  }
  pageOutputs.set(path, html);
}

if (!checkOnly) {
  writeFileSync(registryPath, registryBytes);
  copyPortraits(plannedPortraits);
  writeFileSync(join(root, "assets", targetBundle), bundle);
  writeFileSync(join(root, "assets", targetEnhancement), enhancement);
  writeFileSync(join(root, "assets", targetCss), css);
  writeFileSync(join(root, "data", manifestFile), manifestBytes);
  for (const [path, html] of pageOutputs) writeFileSync(path, html);
}

console.log(JSON.stringify({
  mode: checkOnly ? "check" : "write",
  releaseReceipt,
  snapshotId: registry.snapshotId,
  projectionSummary,
  portraitFiles: portraits.length,
  registry: `data/${registryFile}`,
  registryHash,
  manifest: `data/${manifestFile}`,
  manifestHash,
  bundleHash: artifactManifest.renderOwnerHashes.hydratedBundle,
  enhancerHash: artifactManifest.renderOwnerHashes.transitionalEnhancer,
  cssHash: artifactManifest.renderOwnerHashes.styles
}, null, 2));
