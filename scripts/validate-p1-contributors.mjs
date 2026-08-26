import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTRIBUTOR_PROJECTION_SUMMARY_KEYS,
  CONTRIBUTOR_VISIBLE_LIMIT,
  assertProjectionSummary,
  deriveContributorProjectionSummary
} from "./p1-contributor-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  { path: "index.html", language: "th", prefix: "./" },
  { path: "en/index.html", language: "en", prefix: "../" }
];
const forbiddenPublicKeys = new Set([
  "approvedAt",
  "approvedBy",
  "approved_at",
  "approved_by",
  "approvalStatus",
  "authorityStatus",
  "consentEvidence",
  "consentPublic",
  "consent_public",
  "evidenceLocator",
  "mappingStatus",
  "mapping_status",
  "ownerNote",
  "permissionRecordId",
  "permission_record_id",
  "privateProvenance",
  "reviewer",
  "sourceRef",
  "source_ref",
  "withdrawalEvidence"
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function count(source, token) {
  return source.split(token).length - 1;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function elementWithClass(source, tagName, className, label) {
  const escapedTag = escapeRegex(tagName);
  const escapedClass = escapeRegex(className);
  const openingPattern = new RegExp(`<${escapedTag}\\b[^>]*class="(?:[^"]*\\s)?${escapedClass}(?:\\s[^"]*)?"[^>]*>`, "g");
  const openings = [...source.matchAll(openingPattern)];
  assert(openings.length === 1, `${label} must occur exactly once`);
  const start = openings[0].index;
  const tagPattern = new RegExp(`<\\/?${escapedTag}\\b[^>]*>`, "g");
  tagPattern.lastIndex = start;
  let depth = 0;
  for (let match = tagPattern.exec(source); match; match = tagPattern.exec(source)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return source.slice(start, tagPattern.lastIndex);
  }
  throw new Error(`${label} closing tag is missing`);
}

function readJson(path, label) {
  assert(existsSync(path), `${label} is missing: ${path}`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is invalid JSON: ${error.message}`);
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

function scanForbidden(value, path = "public") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${path}[${index}]`));
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    assert(!forbiddenPublicKeys.has(key), `${path}.${key} is private and must not be public`);
    scanForbidden(nested, `${path}.${key}`);
  }
}

const registryKeys = ["contentHash", "generatedAt", "linkResolution", "publicationScope", "records", "schemaVersion", "snapshotId"];
const recordKeys = ["contributors", "datasetId", "moduleSlug", "resourceClass"];
const contributorKeys = ["compatibilityAliasEn", "compatibilityAliasTh", "displayOrder", "nameEn", "nameTh", "personId", "portrait", "profilePathEn", "profilePathTh", "roles"];
const portraitKeys = ["assetId", "kind", "oneX", "twoX"];
const fallbackKeys = ["fallbackToken", "identityDisclosure", "kind"];
const renditionKeys = ["height", "mimeType", "path", "sha256", "sourcePath", "width"];
const linkResolutionKeys = ["enField", "governingGate", "mode", "thField"];

function assertExactKeys(value, allowedKeys, path) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${path} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...allowedKeys].sort();
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${path} additionalProperties=false failed; expected ${expected.join(", ")}, received ${actual.join(", ")}`);
}

function validateRegistryAllowedKeys(value) {
  assertExactKeys(value, registryKeys, "registry");
  assertExactKeys(value.linkResolution, linkResolutionKeys, "registry.linkResolution");
  assert(Array.isArray(value.records), "registry.records must be an array");
  for (const [recordIndex, record] of value.records.entries()) {
    assertExactKeys(record, recordKeys, `registry.records[${recordIndex}]`);
    assert(Array.isArray(record.contributors), `registry.records[${recordIndex}].contributors must be an array`);
    for (const [personIndex, person] of record.contributors.entries()) {
      const path = `registry.records[${recordIndex}].contributors[${personIndex}]`;
      assertExactKeys(person, contributorKeys, path);
      assert(Array.isArray(person.roles) && person.roles.every((role) => typeof role === "string"), `${path}.roles must contain strings only`);
      if (person.portrait?.kind === "portrait") {
        assertExactKeys(person.portrait, portraitKeys, `${path}.portrait`);
        assertExactKeys(person.portrait.oneX, renditionKeys, `${path}.portrait.oneX`);
        assertExactKeys(person.portrait.twoX, renditionKeys, `${path}.portrait.twoX`);
      } else {
        assertExactKeys(person.portrait, fallbackKeys, `${path}.portrait`);
      }
    }
  }
}

function validateManifestAllowedKeys(value) {
  assertExactKeys(value, ["canonicalPersonPathContract", "commonRelease", "contributorRegistry", "designSystem", "excludedPrivateInputs", "mustNotDeploy", "personLinkResolution", "portraitGovernance", "portraits", "projectionSummary", "publicationScope", "publishable", "releaseAuthority", "releaseReceipt", "releaseStatus", "renderOwnerHashes", "renderOwners", "retainedPortraits", "schemaVersion", "snapshotId", "sourceProjection", "sourceSnapshot"], "manifest");
  assertExactKeys(value.releaseAuthority, ["authority", "authorizedAt", "scope"], "manifest.releaseAuthority");
  assertExactKeys(value.sourceSnapshot, ["path", "sha256"], "manifest.sourceSnapshot");
  assertExactKeys(value.sourceProjection, ["path", "sha256"], "manifest.sourceProjection");
  assertExactKeys(value.contributorRegistry, ["path", "sha256"], "manifest.contributorRegistry");
  assertExactKeys(value.projectionSummary, CONTRIBUTOR_PROJECTION_SUMMARY_KEYS, "manifest.projectionSummary");
  assertExactKeys(value.personLinkResolution, linkResolutionKeys, "manifest.personLinkResolution");
  assertExactKeys(value.renderOwners, ["englishPrerender", "hydratedBundle", "styles", "thaiPrerender", "transitionalEnhancer"], "manifest.renderOwners");
  assertExactKeys(value.renderOwnerHashes, ["hydratedBundle", "styles", "transitionalEnhancer"], "manifest.renderOwnerHashes");
  assert(Array.isArray(value.portraits), "manifest.portraits must be an array");
  value.portraits.forEach((portrait, index) => assertExactKeys(portrait, ["path", "sha256"], `manifest.portraits[${index}]`));
  assert(Array.isArray(value.retainedPortraits), "manifest.retainedPortraits must be an array");
  value.retainedPortraits.forEach((portrait, index) => assertExactKeys(portrait, ["path", "sha256"], `manifest.retainedPortraits[${index}]`));
  assertExactKeys(value.portraitGovernance, ["cachePolicy", "withdrawalRunbook"], "manifest.portraitGovernance");
  assertExactKeys(value.portraitGovernance.cachePolicy, ["filenamePolicy", "header"], "manifest.portraitGovernance.cachePolicy");
  assertExactKeys(value.portraitGovernance.withdrawalRunbook, ["path", "portraitOnlyAction", "profileAction"], "manifest.portraitGovernance.withdrawalRunbook");
  assertExactKeys(value.commonRelease, ["dsIdentity", "localeAggregation", "mustNotDeploy", "openGates", "publishable", "releaseId", "stage"], "manifest.commonRelease");
  assert(Array.isArray(value.commonRelease.openGates) && value.commonRelease.openGates.every((gate) => typeof gate === "string"), "manifest.commonRelease.openGates must contain strings only");
  assertExactKeys(value.commonRelease.localeAggregation, ["aggregationOutputs", "crosswalkRequiredBeforeAggregation", "performed"], "manifest.commonRelease.localeAggregation");
  assert(Array.isArray(value.commonRelease.localeAggregation.aggregationOutputs), "manifest.commonRelease.localeAggregation.aggregationOutputs must be an array");
  assertExactKeys(value.commonRelease.dsIdentity, ["authoringRevision", "buildCardVersion", "colorSet", "dsVersion", "kitVersion", "manifestVersion", "packageRevision", "referenceArtifact", "tokenSchema"], "manifest.commonRelease.dsIdentity");
  assertExactKeys(value.designSystem, ["authoritySourceSha", "colorSet", "manifestVersion", "packageVersion", "uiKitVersion"], "manifest.designSystem");
  assertExactKeys(value.canonicalPersonPathContract, ["en", "th"], "manifest.canonicalPersonPathContract");
}

function validatePrivacyNegativeFixtures(sampleContributor) {
  for (const key of ["approved_at", "approved_by", "mapping_status", "source_ref", "consent_public", "permission_record_id"]) {
    let rejected = false;
    try {
      assertExactKeys({ ...sampleContributor, [key]: "negative-fixture" }, contributorKeys, `negativeFixture.${key}`);
    } catch {
      rejected = true;
    }
    assert(rejected, `Strict public schema failed to reject private key fixture: ${key}`);
  }
}

function assertRejected(label, operation) {
  let rejected = false;
  try {
    operation();
  } catch {
    rejected = true;
  }
  assert(rejected, `Strict validator failed to reject negative fixture: ${label}`);
}

function assertContributorTotals(actual, expected) {
  for (const key of ["assignments", "uniquePeople", "portraitIdentities", "fallbackIdentities"]) {
    assert(actual[key] === expected[key], `Contributor ${key} drifted; expected ${expected[key]}, received ${actual[key]}`);
  }
}

function assertPortraitInventory(portraits, expectedPortraits) {
  const paths = portraits.map((portrait) => portrait.path);
  assert(paths.length === expectedPortraits.size, "Manifest portrait inventory count differs from registry");
  assert(new Set(paths).size === paths.length, "Manifest portrait inventory contains duplicate paths");
  const actualPaths = [...paths].sort();
  const expectedPaths = [...expectedPortraits.keys()].sort();
  assert(JSON.stringify(actualPaths) === JSON.stringify(expectedPaths), "Manifest portrait inventory is not the exact registry path set");
  for (const portrait of portraits) {
    assert(expectedPortraits.get(portrait.path) === portrait.sha256, `Manifest portrait drift: ${portrait.path}`);
  }
}

function assertExactMediaDirectory(entries, expectedFiles) {
  assert(entries.every((entry) => entry.isFile()), "media/contributors must contain regular files only");
  const actualFiles = entries.map((entry) => entry.name).sort();
  assert(new Set(actualFiles).size === actualFiles.length, "media/contributors contains duplicate filenames");
  assert(JSON.stringify(actualFiles) === JSON.stringify(expectedFiles), `media/contributors exact file set drifted; expected ${expectedFiles.length}, received ${actualFiles.length}`);
}

function assertPortraitRenditionContract(personId, density, rendition) {
  const expectedSize = density === "1x" ? 192 : 384;
  assert(/^[a-f0-9]{64}$/.test(rendition.sha256 || ""), `${personId}/${density} hash is invalid`);
  const expectedFilename = `${personId.toLowerCase()}-${density}-${rendition.sha256.slice(0, 12)}.webp`;
  assert(rendition.path === `media/contributors/${expectedFilename}`, `${personId}/${density} local path is not bound to person, density, and hash`);
  assert(new RegExp(`^/Landom/public/assets/people/${personId}\\.jpg\\?v=[a-f0-9]{12}$`).test(rendition.sourcePath), `${personId}/${density} source path is not bound to the current versioned Landom portrait`);
  assert(rendition.mimeType === "image/webp", `${personId}/${density} must be WebP`);
  assert(rendition.width === expectedSize && rendition.height === expectedSize, `${personId}/${density} must be ${expectedSize}x${expectedSize}`);
}

function webpInfo(path) {
  const bytes = readFileSync(path);
  assert(bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP", `Not a WebP: ${path}`);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunk = bytes.subarray(offset, offset + 4).toString("ascii");
    const size = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (chunk === "VP8 ") return { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = bytes.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") return {
      width: 1 + bytes[data + 4] + (bytes[data + 5] << 8) + (bytes[data + 6] << 16),
      height: 1 + bytes[data + 7] + (bytes[data + 8] << 8) + (bytes[data + 9] << 16)
    };
    offset = data + size + (size % 2);
  }
  throw new Error(`WebP dimensions not found: ${path}`);
}

function safeLocalPath(path) {
  assert(typeof path === "string" && /^media\/contributors\/[spi][0-9]{4}-(?:1x|2x)-[a-f0-9]{12}\.webp$/.test(path), `Unsafe contributor asset path: ${path}`);
  const absolute = resolve(root, path);
  assert(absolute.startsWith(resolve(root) + sep), `Contributor asset escapes artifact root: ${path}`);
  return absolute;
}

function discoverActive(html) {
  const registry = html.match(/<meta name="citymeter:contributor-data" content="(data\/citymeter-contributors-p1-[a-f0-9]{12}\.json)" \/>/)?.[1];
  const manifest = html.match(/<meta name="citymeter:contributor-release-manifest" content="(data\/citymeter-contributor-release-p1-[a-f0-9]{12}\.json)" \/>/)?.[1];
  assert(registry && manifest, "P1 registry or manifest meta is missing");
  return { registry, manifest };
}

function validateSourceAlignment(registry, mapping, peopleMedia, mappingBytes, peopleMediaBytes, canonicalIds) {
  const peopleMediaHash = sha256(peopleMediaBytes);
  const expectedSnapshotId = `${mapping.snapshotId}-media-${peopleMediaHash.slice(0, 12)}`;
  const expectedContentHash = sha256(Buffer.concat([mappingBytes, Buffer.from("\n"), peopleMediaBytes]));
  assert(registry.snapshotId === expectedSnapshotId, "CityMETER registry is not bound to the approved mapping and current Landom media snapshot");
  assert(registry.generatedAt === peopleMedia.generatedAt, "CityMETER registry generatedAt differs from Landom people-media");
  assert(registry.contentHash === expectedContentHash, "CityMETER registry contentHash differs from the approved mapping plus Landom media bytes");
  assert(registry.publicationScope === mapping.publicationScope, "CityMETER registry publication scope differs from the approved mapping");
  assert(JSON.stringify(registry.linkResolution) === JSON.stringify(mapping.linkResolution), "CityMETER link resolver differs from the approved mapping");
  const sourceById = new Map(mapping.records.map((record) => [record.datasetId, record]));
  const peopleById = new Map(peopleMedia.people.map((person) => [person.personId, person]));
  assert(sourceById.size === canonicalIds.length, "Approved contributor mapping must exactly cover the canonical catalog");
  assert(JSON.stringify(registry.records.map((record) => record.datasetId)) === JSON.stringify(canonicalIds), "CityMETER registry order differs from the canonical catalog");
  assert(canonicalIds.every((id) => sourceById.has(id)), "Approved contributor mapping omits a canonical catalog record");

  for (const record of registry.records) {
    const sourceRecord = sourceById.get(record.datasetId);
    assert(record.moduleSlug === sourceRecord.moduleSlug && record.resourceClass === sourceRecord.resourceClass, `${record.datasetId} record identity differs from the approved mapping`);
    assert(record.contributors.length === sourceRecord.contributors.length, `${record.datasetId} contributor count differs from the approved mapping`);
    for (const [index, person] of record.contributors.entries()) {
      const mapped = sourceRecord.contributors[index];
      const landomPerson = peopleById.get(person.personId);
      assert(landomPerson, `${record.datasetId}/${person.personId} is missing from Landom people-media`);
      const { portrait: _portrait, ...publicMapping } = person;
      assert(JSON.stringify(publicMapping) === JSON.stringify(mapped), `${record.datasetId}/${person.personId} differs from the approved mapping`);
      assert(person.nameTh === landomPerson.displayName.th && person.nameEn === landomPerson.displayName.en, `${record.datasetId}/${person.personId} display name differs from Landom`);
      assert(landomPerson.profileUrl.th.endsWith(person.compatibilityAliasTh) && landomPerson.profileUrl.en.endsWith(person.compatibilityAliasEn), `${record.datasetId}/${person.personId} compatibility profile URL differs from Landom`);
      if (landomPerson.portrait?.status === "publishable") {
        assert(person.portrait.kind === "portrait", `${record.datasetId}/${person.personId} must use the current Landom portrait`);
        const sourceUrl = new URL(landomPerson.portrait.versionedUrl);
        const expectedSourcePath = `${sourceUrl.pathname}${sourceUrl.search}`;
        assert(person.portrait.oneX.sourcePath === expectedSourcePath && person.portrait.twoX.sourcePath === expectedSourcePath, `${record.datasetId}/${person.personId} versioned Landom source path drifted`);
        assert(expectedSourcePath.endsWith(`?v=${landomPerson.portrait.sha256.slice(0, 12)}`), `${record.datasetId}/${person.personId} source version is not bound to the Landom hash`);
      } else {
        assert(person.portrait.kind === "neutral_fallback", `${record.datasetId}/${person.personId} must use the governed CityMETER neutral fallback`);
      }
    }
  }
}

const thaiHtml = readFileSync(join(root, "index.html"), "utf8");
const active = discoverActive(thaiHtml);
const registryPath = join(root, active.registry);
const manifestPath = join(root, active.manifest);
const registryBytes = readFileSync(registryPath);
const registry = JSON.parse(registryBytes);
const manifestBytes = readFileSync(manifestPath);
const manifest = JSON.parse(manifestBytes);
validateRegistryAllowedKeys(registry);
validateManifestAllowedKeys(manifest);
validatePrivacyNegativeFixtures(registry.records[0]?.contributors[0]);
scanForbidden(registry);
scanForbidden(manifest);

const catalogReview = readJson(join(root, "data/catalog-source-review.json"), "Canonical CityMETER catalog");
const canonicalIds = catalogReview.records.map((record) => record.id);
assert(canonicalIds.length > 0 && new Set(canonicalIds).size === canonicalIds.length, "Canonical CityMETER catalog identities must be non-empty and unique");
const landomRoot = resolve(root, process.env.LANDOM_REPO || "../Landom");
const mappingRef = manifest.sourceSnapshot.path.match(/^citymeter:(data\/citymeter-contributor-mapping-p1-[a-f0-9]{12}\.json)$/)?.[1];
assert(mappingRef, "Manifest approved contributor mapping locator drifted");
const peopleMediaRef = manifest.sourceProjection.path.match(/^landom:(data\/generated\/people-media\.json)@([a-f0-9]{40})$/);
assert(peopleMediaRef, "Manifest Landom people-media locator or revision drifted");
const sourceSnapshotPath = join(root, mappingRef);
const sourceProjectionPath = join(landomRoot, peopleMediaRef[1]);
const sourceSnapshotBytes = readFileSync(sourceSnapshotPath);
const sourceProjectionBytes = readFileSync(sourceProjectionPath);
const sourceSnapshot = JSON.parse(sourceSnapshotBytes);
const sourceProjection = JSON.parse(sourceProjectionBytes);
const landomRevision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: landomRoot, encoding: "utf8" }).trim();
assert(landomRevision === peopleMediaRef[2], "Checked-out Landom revision differs from the manifest portrait source revision");
assert(manifest.sourceSnapshot.sha256 === sha256(sourceSnapshotBytes), "Manifest contributor mapping hash differs from the canonical input bytes");
assert(manifest.sourceProjection.sha256 === sha256(sourceProjectionBytes), "Manifest Landom people-media hash differs from the canonical input bytes");
assert(sha256(sourceSnapshotBytes).startsWith(mappingRef.match(/([a-f0-9]{12})\.json$/)[1]), "Contributor mapping immutable filename does not match its bytes");
validateSourceAlignment(registry, sourceSnapshot, sourceProjection, sourceSnapshotBytes, sourceProjectionBytes, canonicalIds);

const p1ManifestFiles = readdirSync(join(root, "data")).filter((name) => /^citymeter-contributor-release-p1-[a-f0-9]{12}\.json$/.test(name));
assert(p1ManifestFiles.includes(active.manifest.split("/").at(-1)), "Active P1 release manifest is absent from the immutable manifest inventory");
for (const filename of p1ManifestFiles) assert(sha256(readFileSync(join(root, "data", filename))).startsWith(filename.match(/([a-f0-9]{12})\.json$/)[1]), `Historical P1 manifest filename does not match its bytes: ${filename}`);
const p1RegistryFiles = readdirSync(join(root, "data")).filter((name) => /^citymeter-contributors-p1-[a-f0-9]{12}\.json$/.test(name));
assert(p1RegistryFiles.includes(active.registry.split("/").at(-1)), "Active P1 contributor registry is absent from the immutable registry inventory");
for (const filename of p1RegistryFiles) assert(sha256(readFileSync(join(root, "data", filename))).startsWith(filename.match(/([a-f0-9]{12})\.json$/)[1]), `Historical P1 registry filename does not match its bytes: ${filename}`);
const receiptPath = join(root, "CITYMETER_CONTRIBUTOR_THUMBNAIL_SYNC_2026-08-27.md");
assert(existsSync(receiptPath), "Contributor thumbnail synchronization receipt is missing");
const receipt = readFileSync(receiptPath, "utf8");
for (const token of [
  "approved_for_publication",
  registry.snapshotId,
  active.registry,
  active.manifest,
  sha256(registryBytes),
  sha256(manifestBytes),
  manifest.releaseReceipt,
  "mustNotDeploy: false"
]) assert(receipt.includes(token), `P1 publication receipt is missing active evidence: ${token}`);

assert(registry.schemaVersion === "1.1.0-p1", "Unexpected contributor registry schemaVersion");
assert(manifest.schemaVersion === "1.1.0-p1", "Unexpected contributor manifest schemaVersion");
assert(registry.publicationScope === "landometer_public_website", "Contributor registry scope drifted");
assert(/^[a-z0-9][a-z0-9._-]{11,127}$/.test(registry.snapshotId || ""), "Contributor snapshotId is invalid");
assert(/^[a-f0-9]{64}$/.test(registry.contentHash || ""), "Contributor source contentHash is invalid");
assert(Array.isArray(registry.records) && registry.records.length === canonicalIds.length, "Contributor registry must exactly cover the canonical CityMETER catalog");
assert(manifest.releaseStatus === "approved_for_publication", "P1 artifact must carry the authorized publication state");
assert(manifest.releaseAuthority.authority === "site_owner" && manifest.releaseAuthority.authorizedAt === "2026-08-27", "P1 publication authority drifted");
assert(typeof manifest.releaseAuthority.scope === "string" && manifest.releaseAuthority.scope.includes("CityMETER") && manifest.releaseAuthority.scope.includes("existing GitHub Pages site"), "P1 publication authority scope is incomplete");
assert(manifest.publishable === true && manifest.mustNotDeploy === false, "P1 authorized artifact must remain publishable and deployable");
assert(manifest.snapshotId === registry.snapshotId, "Manifest and registry snapshotId differ");
assert(manifest.publicationScope === registry.publicationScope, "Manifest and registry publication scope differ");
assert(manifest.contributorRegistry.path === active.registry, "Manifest points to a different contributor registry");
assert(manifest.contributorRegistry.sha256 === sha256(registryBytes), "Contributor registry hash mismatch");
assert(sha256(registryBytes).startsWith(active.registry.match(/([a-f0-9]{12})\.json$/)[1]), "Contributor registry immutable filename does not match its bytes");
assert(manifest.designSystem.packageVersion === "v0.9.0-mp1", "DS package identity drifted");
assert(manifest.designSystem.uiKitVersion === "lds-kit-0.9.0-r4", "UI kit identity drifted");
assert(manifest.designSystem.manifestVersion === "2.1", "DS manifest version drifted");
assert(manifest.designSystem.colorSet === "color-srgb-05", "DS color set drifted");
assert(manifest.designSystem.authoritySourceSha === "d82ac775ab9d35a84cfb0dc77bc0ae804a7a0665", "DS authority source SHA drifted");
assert(manifest.canonicalPersonPathContract.th === "/landom/people/{personId}", "Thai canonical person path contract drifted");
assert(manifest.canonicalPersonPathContract.en === "/en/landom/people/{personId}", "English canonical person path contract drifted");
assert(manifest.excludedPrivateInputs === true, "Manifest must explicitly exclude private inputs");
assert(manifest.portraitGovernance.cachePolicy.header === "public, max-age=31536000, immutable", "Portrait cache policy drifted");
assert(manifest.portraitGovernance.cachePolicy.filenamePolicy === "content_addressed_sha256_12", "Portrait filename policy drifted");
assert(manifest.portraitGovernance.withdrawalRunbook.portraitOnlyAction === "replace_with_neutral_fallback_and_purge_cached_renditions", "Portrait-only withdrawal action drifted");
assert(manifest.portraitGovernance.withdrawalRunbook.profileAction === "remove_profile_identity_and_all_contributor_references_then_issue_new_receipt", "Profile withdrawal action drifted");
assert(manifest.commonRelease.stage === "draft", "Common release must remain draft until the atomic set is built");
assert(manifest.commonRelease.publishable === false && manifest.commonRelease.mustNotDeploy === true, "Common draft release must remain non-publishable and must-not-deploy");
assert(Array.isArray(manifest.commonRelease.openGates), "Common release open gates are missing");
assert(manifest.commonRelease.localeAggregation.performed === false && manifest.commonRelease.localeAggregation.aggregationOutputs.length === 0, "P1 must state that no Locale aggregation was performed");
assert(manifest.commonRelease.localeAggregation.crosswalkRequiredBeforeAggregation === true, "P1 must preserve the crosswalk-before-aggregation rule");
assert(!manifest.commonRelease.openGates.includes("locale_crosswalk_verification_receipt"), "P1 must not carry an unconditional Locale crosswalk release gate when no aggregation was performed");
assert(manifest.commonRelease.dsIdentity.packageRevision === "v0.9.0-mp1", "Common release DS package identity drifted");
assert(manifest.commonRelease.dsIdentity.kitVersion === "lds-kit-0.9.0-r4", "Common release UI kit identity drifted");
assert(sha256(manifestBytes).startsWith(active.manifest.match(/([a-f0-9]{12})\.json$/)[1]), "Manifest immutable filename does not match its bytes");
const canonicalPersonGateOpen = manifest.commonRelease.openGates.includes("canonical_person_routes_activation");
const expectedLinkResolution = canonicalPersonGateOpen
  ? { mode: "compatibility_alias", governingGate: "canonical_person_routes_activation", thField: "compatibilityAliasTh", enField: "compatibilityAliasEn" }
  : { mode: "canonical_person_path", governingGate: "canonical_person_routes_activation", thField: "profilePathTh", enField: "profilePathEn" };
assert(JSON.stringify(registry.linkResolution) === JSON.stringify(expectedLinkResolution), "Contributor link resolver does not follow the canonical-person-route gate");
assert(JSON.stringify(manifest.personLinkResolution) === JSON.stringify(expectedLinkResolution), "Manifest person link resolution differs from the canonical registry resolver");

const ids = new Set();
const uniquePeople = new Set();
const portraitPeople = new Set();
const fallbackPeople = new Set();
const portraitSignatures = new Map();
const expectedPortraits = new Map();
let assignmentCount = 0;
for (const [recordIndex, record] of registry.records.entries()) {
  assert(/^dataset-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.datasetId || ""), `records[${recordIndex}].datasetId is invalid`);
  assert(record.moduleSlug === record.datasetId, `${record.datasetId} moduleSlug drifted`);
  assert(!ids.has(record.datasetId), `Duplicate datasetId: ${record.datasetId}`);
  ids.add(record.datasetId);
  assert(Array.isArray(record.contributors) && record.contributors.length > 0, `${record.datasetId} has no contributor`);
  const people = new Set();
  let priorOrder = 0;
  for (const person of record.contributors) {
    assignmentCount += 1;
    assert(/^[SPI][0-9]{4}$/.test(person.personId || ""), `${record.datasetId} has an invalid personId`);
    assert(!people.has(person.personId), `${record.datasetId} duplicates ${person.personId}`);
    people.add(person.personId);
    uniquePeople.add(person.personId);
    assert(person.displayOrder >= priorOrder, `${record.datasetId} contributor order is unstable`);
    priorOrder = person.displayOrder;
    assert(typeof person.nameTh === "string" && person.nameTh.trim(), `${record.datasetId}/${person.personId} is missing nameTh`);
    assert(typeof person.nameEn === "string" && person.nameEn.trim(), `${record.datasetId}/${person.personId} is missing nameEn`);
    assert(person.profilePathTh === `/landom/people/${person.personId}`, `${record.datasetId}/${person.personId} Thai profile path is not canonical`);
    assert(person.profilePathEn === `/en/landom/people/${person.personId}`, `${record.datasetId}/${person.personId} English profile path is not canonical`);
    assert(person.compatibilityAliasTh === `/Landom/?person=${person.personId}&lang=th`, `${record.datasetId}/${person.personId} Thai compatibility alias drifted`);
    assert(person.compatibilityAliasEn === `/Landom/en/?person=${person.personId}&lang=en`, `${record.datasetId}/${person.personId} English compatibility alias drifted`);
    assert(Array.isArray(person.roles) && person.roles.length > 0 && new Set(person.roles).size === person.roles.length, `${record.datasetId}/${person.personId} roles are invalid`);
    assert(person.roles.every((role) => /^[a-z][a-z0-9_]*$/.test(role)), `${record.datasetId}/${person.personId} has an invalid role`);
    if (person.portrait.kind === "neutral_fallback") {
      assert(person.portrait.fallbackToken === "neutral-person" && person.portrait.identityDisclosure === "none", `${record.datasetId}/${person.personId} fallback is not neutral`);
      assert(!portraitPeople.has(person.personId), `${person.personId} cannot mix portrait and fallback presentations`);
      fallbackPeople.add(person.personId);
      continue;
    }
    assert(person.portrait.kind === "portrait", `${record.datasetId}/${person.personId} portrait kind is invalid`);
    assert(person.portrait.assetId === `portrait-${person.personId.toLowerCase()}-contributor`, `${record.datasetId}/${person.personId} portrait assetId is not person-bound`);
    assert(!fallbackPeople.has(person.personId), `${person.personId} cannot mix portrait and fallback presentations`);
    portraitPeople.add(person.personId);
    const portraitSignature = [];
    for (const [density, rendition] of [["1x", person.portrait.oneX], ["2x", person.portrait.twoX]]) {
      assertPortraitRenditionContract(person.personId, density, rendition);
      const path = safeLocalPath(rendition.path);
      assert(existsSync(path) && statSync(path).size > 0, `Missing contributor portrait: ${rendition.path}`);
      assert(sha256(readFileSync(path)) === rendition.sha256, `Contributor portrait bytes changed: ${rendition.path}`);
      const dimensions = webpInfo(path);
      assert(dimensions.width === rendition.width && dimensions.height === rendition.height, `Contributor portrait dimensions changed: ${rendition.path}`);
      portraitSignature.push([density, rendition.path, rendition.sourcePath, rendition.sha256, rendition.width, rendition.height]);
      if (expectedPortraits.has(rendition.path)) assert(expectedPortraits.get(rendition.path) === rendition.sha256, `Conflicting portrait hash: ${rendition.path}`);
      else expectedPortraits.set(rendition.path, rendition.sha256);
    }
    const serializedPortraitSignature = JSON.stringify(portraitSignature);
    if (portraitSignatures.has(person.personId)) {
      assert(portraitSignatures.get(person.personId) === serializedPortraitSignature, `${person.personId} portrait signature differs across assignments`);
    } else {
      portraitSignatures.set(person.personId, serializedPortraitSignature);
    }
  }
}

assert(ids.size === canonicalIds.length, "Contributor dataset IDs are not the exact canonical set");
const contributorTotals = {
  assignments: assignmentCount,
  uniquePeople: uniquePeople.size,
  portraitIdentities: portraitPeople.size,
  fallbackIdentities: fallbackPeople.size
};
const derivedProjectionSummary = deriveContributorProjectionSummary(registry);
assertProjectionSummary(assert, manifest.projectionSummary, derivedProjectionSummary);
assertContributorTotals(contributorTotals, manifest.projectionSummary);
for (const key of CONTRIBUTOR_PROJECTION_SUMMARY_KEYS) {
  assertRejected(`projection summary ${key}`, () => assertProjectionSummary(assert, { ...manifest.projectionSummary, [key]: manifest.projectionSummary[key] + 1 }, derivedProjectionSummary));
}
assert(portraitPeople.size + fallbackPeople.size === uniquePeople.size, "Portrait and fallback identity sets must exactly partition public contributors");
assert(portraitSignatures.size === manifest.projectionSummary.portraitIdentities, `Portrait signature inventory drifted; expected ${manifest.projectionSummary.portraitIdentities}, received ${portraitSignatures.size}`);
assert(expectedPortraits.size === manifest.projectionSummary.portraitRenditions, `Portrait rendition inventory drifted; expected ${manifest.projectionSummary.portraitRenditions}, received ${expectedPortraits.size}`);
const samplePortraitContributor = registry.records.flatMap((record) => record.contributors).find((person) => person.portrait.kind === "portrait");
assert(samplePortraitContributor, "Portrait contract negative fixture requires one portrait contributor");
assertRejected("portrait filename person binding", () => assertPortraitRenditionContract("I9999", "1x", samplePortraitContributor.portrait.oneX));
assertRejected("portrait filename density binding", () => assertPortraitRenditionContract(samplePortraitContributor.personId, "2x", samplePortraitContributor.portrait.oneX));
assertPortraitInventory(manifest.portraits, expectedPortraits);
const duplicatePortraitFixture = manifest.portraits.length > 1
  ? [...manifest.portraits.slice(0, -1), manifest.portraits[0]]
  : [...manifest.portraits, ...manifest.portraits];
assertRejected("duplicate manifest portrait path", () => assertPortraitInventory(duplicatePortraitFixture, expectedPortraits));
const retainedPortraits = new Map();
for (const portrait of manifest.retainedPortraits) {
  assert(/^media\/contributors\/[spi][0-9]{4}-(?:1x|2x)-[a-f0-9]{12}\.webp$/.test(portrait.path), `Unsafe retained contributor portrait path: ${portrait.path}`);
  assert(!expectedPortraits.has(portrait.path), `Retained portrait overlaps the active inventory: ${portrait.path}`);
  assert(!retainedPortraits.has(portrait.path), `Duplicate retained portrait path: ${portrait.path}`);
  const path = safeLocalPath(portrait.path);
  assert(existsSync(path) && statSync(path).size > 0, `Missing retained contributor portrait: ${portrait.path}`);
  assert(sha256(readFileSync(path)) === portrait.sha256, `Retained contributor portrait bytes changed: ${portrait.path}`);
  webpInfo(path);
  retainedPortraits.set(portrait.path, portrait.sha256);
}
const expectedPortraitFiles = [...expectedPortraits.keys(), ...retainedPortraits.keys()].map((path) => path.split("/").at(-1)).sort();
const actualPortraitEntries = readdirSync(join(root, "media/contributors"), { withFileTypes: true });
assertExactMediaDirectory(actualPortraitEntries, expectedPortraitFiles);
assertRejected("extra non-WebP media file", () => assertExactMediaDirectory([
  ...actualPortraitEntries,
  { name: "unexpected.txt", isFile: () => true }
], expectedPortraitFiles));

const recordById = new Map(registry.records.map((record) => [record.datasetId, record]));
const activeBundleName = manifest.renderOwners.hydratedBundle.split("/").at(-1);
const activeEnhancerName = manifest.renderOwners.transitionalEnhancer.split("/").at(-1);
const activeStylesName = manifest.renderOwners.styles.split("/").at(-1);
for (const page of pages) {
  const html = readFileSync(join(root, page.path), "utf8");
  const canonicalHref = html.match(/<link rel="canonical" href="([^"]+)" \/>/)?.[1];
  assert(canonicalHref, `${page.path} canonical URL is missing`);
  const pageOrigin = new URL(canonicalHref).origin;
  const discovered = discoverActive(html);
  assert(JSON.stringify(discovered) === JSON.stringify(active), `${page.path} uses a different P1 artifact`);
  assert(count(html, `name="citymeter:release-receipt" content="${manifest.releaseReceipt}"`) === 1, `${page.path} must expose exactly one authorized publication receipt`);
  assert(count(html, `name="citymeter:contributor-candidate-build" content="${manifest.releaseReceipt}"`) === 1, `${page.path} must expose exactly one contributor build receipt`);
  assert(count(html, `name="citymeter:contributor-snapshot" content="${registry.snapshotId}"`) === 1, `${page.path} snapshot meta is missing or duplicated`);
  assert(count(html, 'id="citymeter-contributor-data"') === 1, `${page.path} inline contributor registry is missing or duplicated`);
  const inline = html.match(/<script type="application\/json" id="citymeter-contributor-data">([\s\S]*?)<\/script>/)?.[1];
  assert(inline, `${page.path} inline contributor registry cannot be read`);
  assert(JSON.stringify(JSON.parse(inline)) === JSON.stringify(registry), `${page.path} inline contributor registry differs from the immutable JSON`);
  assert(count(html, 'localStorage.getItem("lds-theme")') === 1 && count(html, 'localStorage.getItem("citymeter-theme")') === 1, `${page.path} static theme owner must read canonical then legacy exactly once`);
  assert(html.indexOf('localStorage.getItem("lds-theme")') < html.indexOf('localStorage.getItem("citymeter-theme")'), `${page.path} static theme owner must prefer the canonical key`);
  assert(html.includes('stored === "auto" ? "system" : stored') && html.includes('["system", "light", "dark"].includes(normalized)'), `${page.path} static theme owner must normalize auto/system and reject invalid preferences`);
  assert(!html.includes('localStorage.setItem("citymeter-theme"') && !html.includes('localStorage.setItem("lds-theme"'), `${page.path} static head must remain a read-only theme owner`);
  assert(count(html, activeStylesName) === 1, `${page.path} must load exactly one active contributor stylesheet`);
  assert(count(html, activeEnhancerName) === 1, `${page.path} must load exactly one active contributor enhancer`);
  assert(count(html, activeBundleName) === 1, `${page.path} must load exactly one active contributor bundle`);
  assert(JSON.stringify([...html.matchAll(/assets\/(index-qbT50gkr-v\d+\.js)/g)].map((match) => match[1])) === JSON.stringify([activeBundleName]), `${page.path} contains a stale hydrated P1 owner reference`);
  assert(JSON.stringify([...html.matchAll(/assets\/(catalog-enhancements-v\d+\.js)/g)].map((match) => match[1])) === JSON.stringify([activeEnhancerName]), `${page.path} contains a stale enhancer P1 owner reference`);
  assert(JSON.stringify([...html.matchAll(/assets\/(catalog-enhancements-v\d+\.css)/g)].map((match) => match[1])) === JSON.stringify([activeStylesName]), `${page.path} contains a stale stylesheet P1 owner reference`);
  assert(count(html, 'class="dataset-card-actions"') === manifest.projectionSummary.records, `${page.path} must prerender one action row per card`);
  assert(count(html, 'class="citymeter-contributors-compact"') === manifest.projectionSummary.records, `${page.path} must prerender one compact portrait group per card`);
  assert(count(html, `data-contributor-compact-snapshot-id="${registry.snapshotId}"`) === manifest.projectionSummary.records, `${page.path} compact portrait groups must share the active snapshotId`);
  assert(count(html, 'data-contributor-compact-person-id="') === manifest.projectionSummary.assignments, `${page.path} compact portrait assignments differ from the projection`);
  assert(count(html, 'class="citymeter-contributors"') === manifest.projectionSummary.records, `${page.path} must prerender every full contributor block`);
  assert(count(html, `data-contributor-snapshot-id="${registry.snapshotId}"`) === manifest.projectionSummary.records, `${page.path} cards must share the active snapshotId`);
  assert(count(html, 'class="citymeter-contributor"') === manifest.projectionSummary.assignments, `${page.path} full contributor link assignments differ from the projection`);
  assert(count(html, 'class="citymeter-contributor-name"') === manifest.projectionSummary.assignments, `${page.path} full contributor names differ from the projection`);
  assert(count(html, 'data-citymeter-record-id="dataset-') === manifest.projectionSummary.records, `${page.path} must expose every stable record hook`);
  assert(count(html, 'data-module-slug="dataset-') === manifest.projectionSummary.records, `${page.path} must expose every module hook`);
  assert(count(html, 'data-contributor-disclosure') === manifest.projectionSummary.expandedRecords, `${page.path} disclosure count differs from the projection`);
  for (const removedCopy of [
    "ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง",
    "Contributors to this CityMETER view, not owners or endorsers of the source data"
  ]) assert(!html.includes(removedCopy), `${page.path} still contains removed contributor disclaimer copy`);
  assert(count(html, 'class="citymeter-contributors-note"') === 0, `${page.path} must not retain contributor disclaimer elements`);
  assert(!html.includes("-contributors-note"), `${page.path} must not retain removed contributor disclaimer IDs or references`);

  const cardParts = html.split('<article class="dataset-card"').slice(1);
  assert(cardParts.length === manifest.projectionSummary.records, `${page.path} must contain every canonical dataset card`);
  for (const part of cardParts) {
    const card = part.slice(0, part.indexOf("</article>"));
    const datasetId = card.match(/ id="(dataset-[a-z0-9-]+)"/)?.[1];
    const record = recordById.get(datasetId);
    assert(record, `${page.path} contains unknown dataset card ${datasetId}`);
    const encodedRecordTitle = card.match(/<h3>([\s\S]*?)<\/h3>/)?.[1]?.replace(/<[^>]+>/g, "");
    assert(typeof encodedRecordTitle === "string", `${page.path}/${datasetId} localized h3 is missing`);
    const decodedRecordTitle = decodeHtmlText(encodedRecordTitle);
    assert(count(card, `data-citymeter-record-id="${datasetId}"`) === 1, `${page.path}/${datasetId} record hook drifted`);
    assert(count(card, `data-module-slug="${record.moduleSlug}"`) === 1, `${page.path}/${datasetId} module hook drifted`);
    const actionRow = elementWithClass(card, "div", "dataset-card-actions", `${page.path}/${datasetId} action row`);
    const compact = elementWithClass(card, "div", "citymeter-contributors-compact", `${page.path}/${datasetId} compact contributor group`);
    const details = elementWithClass(card, "details", "dataset-details", `${page.path}/${datasetId} outer details`);
    const full = elementWithClass(card, "section", "citymeter-contributors", `${page.path}/${datasetId} full contributor block`);
    assert(card.indexOf(actionRow) < card.indexOf(details), `${page.path}/${datasetId} compact action row must precede the outer details`);
    assert(actionRow.includes(compact), `${page.path}/${datasetId} compact portrait group must be inside the action row`);
    assert(count(actionRow, 'class="dataset-open"') === 1, `${page.path}/${datasetId} action row must retain exactly one CityMETER link`);
    assert(actionRow.indexOf('class="dataset-open"') < actionRow.indexOf(compact), `${page.path}/${datasetId} action row must place the CityMETER link before the compact portraits`);
    assert(!actionRow.includes(full), `${page.path}/${datasetId} full contributor attribution must not remain in the collapsed action row`);
    assert(details.includes(full), `${page.path}/${datasetId} full contributor attribution must be inside the outer details`);
    assert(details.indexOf(full) > details.indexOf("</summary>"), `${page.path}/${datasetId} full contributor attribution must follow the outer details summary`);
    assert(count(details, 'class="citymeter-contributors"') === 1, `${page.path}/${datasetId} outer details must own exactly one full contributor block`);
    assert(compact.includes(`data-contributor-compact-snapshot-id="${registry.snapshotId}"`), `${page.path}/${datasetId} compact snapshot hook drifted`);
    const contributorWord = record.contributors.length === 1 ? "contributor" : "contributors";
    const compactLabel = page.language === "th"
      ? `ผู้ร่วมพัฒนา CityMETER ${decodedRecordTitle} ${record.contributors.length} คน ดูรายชื่อเมื่อเปิดรายละเอียด`
      : `${record.contributors.length} ${contributorWord} to CityMETER ${decodedRecordTitle}; open details to view names`;
    assert(compact.includes('role="img"') && compact.includes(`aria-label="${escapeHtml(compactLabel)}"`), `${page.path}/${datasetId} compact portrait group needs a localized nonvisual summary`);
    assert(!/<(?:a|button|details|summary|input|select|textarea)\b/i.test(compact), `${page.path}/${datasetId} compact portraits must remain noninteractive`);
    assert(!/\b(?:tabindex|href)=/i.test(compact) && !/role="(?:button|link)"/i.test(compact), `${page.path}/${datasetId} compact portraits must not expose interactive semantics`);
    assert(!compact.includes("citymeter-contributor-name") && !compact.includes("citymeter-contributors-note"), `${page.path}/${datasetId} compact portraits must not contain names or attribution copy`);
    assert(compact.replace(/<[^>]*>/g, "").trim() === "", `${page.path}/${datasetId} compact portraits must not contain visible text`);
    assert(count(compact, 'class="citymeter-contributor-compact-person"') === record.contributors.length, `${page.path}/${datasetId} compact portrait wrappers differ from the projection`);
    assert(count(compact, 'class="citymeter-contributor-portrait" aria-hidden="true"') === record.contributors.length, `${page.path}/${datasetId} compact portrait count differs from the projection`);
    assert(count(compact, 'class="citymeter-contributor-fallback"') === record.contributors.length, `${page.path}/${datasetId} compact fallback layers must cover every portrait slot`);
    const compactMatches = [...compact.matchAll(/data-contributor-compact-person-id="([SPI][0-9]{4})"/g)];
    const expectedPeople = record.contributors.map((person) => person.personId);
    assert(JSON.stringify(compactMatches.map((match) => match[1])) === JSON.stringify(expectedPeople), `${page.path}/${datasetId} compact contributor order differs from the projection`);
    assert(count(full, 'class="citymeter-contributor"') === record.contributors.length, `${page.path}/${datasetId} full contributor count differs from projection`);
    assert(!full.includes("citymeter-contributors-note") && !full.includes("-contributors-note") && !full.includes("aria-describedby"), `${page.path}/${datasetId} removed contributor disclaimer semantics must not remain`);
    assert(full.includes(`<h4 id="${datasetId}-contributors-title">`) && full.includes('class="citymeter-contributor-list"'), `${page.path}/${datasetId} contributor heading and list must remain after note removal`);
    const peopleInDom = [...full.matchAll(/data-contributor-person-id="([SPI][0-9]{4})"/g)].map((match) => match[1]);
    assert(JSON.stringify(peopleInDom) === JSON.stringify(record.contributors.map((person) => person.personId)), `${page.path}/${datasetId} contributor order differs from projection`);
    for (const [personIndex, person] of record.contributors.entries()) {
      const name = page.language === "th" ? person.nameTh : person.nameEn;
      const pathField = page.language === "th" ? registry.linkResolution.thField : registry.linkResolution.enField;
      const path = person[pathField];
      const accessibleName = page.language === "th"
        ? `ดูโปรไฟล์ของ ${name} ผู้ร่วมพัฒนา CityMETER ${decodedRecordTitle}`
        : `View ${name}'s profile, a contributor to CityMETER ${decodedRecordTitle}`;
      const compactStart = compactMatches[personIndex].index;
      const compactEnd = compactMatches[personIndex + 1]?.index ?? compact.length;
      const compactPerson = compact.slice(compactStart, compactEnd);
      assert(full.includes(`href="${escapeHtml(path)}" data-contributor-person-id="${person.personId}"`), `${page.path}/${datasetId}/${person.personId} profile link drifted`);
      assert(count(full, `data-contributor-person-id="${person.personId}" aria-label="${escapeHtml(accessibleName)}"`) === 1, `${page.path}/${datasetId}/${person.personId} decoded contributor accessible name drifted`);
      assert(full.includes(`<span class="citymeter-contributor-name">${escapeHtml(name)}</span>`), `${page.path}/${datasetId}/${person.personId} full contributor name drifted`);
      if (person.portrait.kind === "portrait") {
        for (const [presentation, owner] of [["compact", compactPerson], ["full", full]]) {
          assert(owner.includes('class="citymeter-contributor-image" data-contributor-image'), `${page.path}/${datasetId}/${person.personId} ${presentation} portrait needs the stable broken-image hook`);
          assert(owner.includes(`src="${page.prefix}${person.portrait.oneX.path}"`), `${page.path}/${datasetId}/${person.personId} ${presentation} 1x portrait drifted`);
          assert(owner.includes(`${page.prefix}${person.portrait.twoX.path} 2x`), `${page.path}/${datasetId}/${person.personId} ${presentation} 2x portrait drifted`);
        }
      } else {
        const anchorStart = full.indexOf(`data-contributor-person-id="${person.personId}"`);
        const anchorEnd = full.indexOf("</a>", anchorStart);
        assert(!full.slice(anchorStart, anchorEnd).includes("citymeter-contributor-image"), `${page.path}/${datasetId}/${person.personId} full fallback must not borrow a portrait`);
        assert(!compactPerson.includes("citymeter-contributor-image"), `${page.path}/${datasetId}/${person.personId} compact fallback must not borrow a portrait`);
      }
    }
    const remaining = record.contributors.length - CONTRIBUTOR_VISIBLE_LIMIT;
    const moreListId = `${datasetId}-contributors-more-list`;
    if (remaining > 0) {
      const showLabel = page.language === "th" ? "แสดงผู้ร่วมพัฒนาที่เหลือ" : "Show remaining contributors";
      const groupLabel = page.language === "th" ? "ผู้ร่วมพัฒนาเพิ่มเติม" : "Additional contributors";
      const closeLabel = page.language === "th" ? "ปิดรายชื่อเพิ่มเติม" : "Close additional contributors";
      assert(count(full, 'class="citymeter-contributors-more" data-contributor-disclosure') === 1, `${page.path}/${datasetId} full contributor list must expose one nested disclosure`);
      assert(full.includes(`<summary aria-controls="${moreListId}" data-contributor-more-count="${remaining}"`), `${page.path}/${datasetId} disclosure control binding drifted`);
      assert(full.includes(`aria-label="${showLabel} ${remaining}">+${remaining}</summary>`), `${page.path}/${datasetId} disclosure accessible name drifted`);
      assert(full.includes(`<div class="citymeter-contributors-more-list" id="${moreListId}" role="group" aria-label="${groupLabel}">`), `${page.path}/${datasetId} disclosure list semantics drifted`);
      assert(full.includes(`<button type="button" class="citymeter-contributors-more-close" data-contributor-more-close hidden>${closeLabel}</button>`), `${page.path}/${datasetId} no-JS-safe close control drifted`);
    } else {
      assert(!full.includes("data-contributor-disclosure"), `${page.path}/${datasetId} must not render an empty disclosure`);
    }
    assert(!full.match(/class="citymeter-contributor"[\s\S]*?aria-label="[^"]*&amp;amp;/), `${page.path}/${datasetId} contains a double-escaped contributor accessible name`);
  }

  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(jsonLdMatches.length === 1, `${page.path} must contain one JSON-LD owner`);
  const graph = JSON.parse(jsonLdMatches[0][1]);
  const catalog = graph["@graph"]?.find((entry) => entry["@type"] === "DataCatalog");
  assert(catalog?.numberOfItems === manifest.projectionSummary.datasetRecords, `${page.path} JSON-LD DataCatalog numberOfItems must count only Dataset records`);
  assert(Array.isArray(catalog?.dataset) && catalog.dataset.length === manifest.projectionSummary.datasetRecords, `${page.path} JSON-LD Dataset count differs from the projection`);
  assert(Array.isArray(catalog?.hasPart) && catalog.hasPart.length === manifest.projectionSummary.eventRecords, `${page.path} JSON-LD event CreativeWork count differs from the projection`);
  const structuredEntries = [
    ...catalog.dataset.map((entry) => ({ entry, collection: "dataset" })),
    ...catalog.hasPart.map((entry) => ({ entry, collection: "hasPart" }))
  ];
  const structuredIds = new Set();
  for (const { entry, collection } of structuredEntries) {
    const datasetId = entry["@id"].split("#").at(-1);
    const record = recordById.get(datasetId);
    assert(record, `${page.path} JSON-LD contains unknown ${datasetId}`);
    assert(!structuredIds.has(datasetId), `${page.path} JSON-LD duplicates ${datasetId}`);
    structuredIds.add(datasetId);
    if (record.resourceClass === "event") {
      assert(collection === "hasPart" && entry["@type"] === "CreativeWork", `${page.path}/${datasetId} event archive must be hasPart CreativeWork`);
    } else {
      assert(collection === "dataset" && entry["@type"] === "Dataset", `${page.path}/${datasetId} ${record.resourceClass} must remain a Dataset`);
    }
    const expected = record.contributors.map((person) => {
      const pathField = page.language === "th" ? registry.linkResolution.thField : registry.linkResolution.enField;
      const path = person[pathField];
      return {
        "@type": "Person",
        "@id": `${pageOrigin}${path}`,
        url: `${pageOrigin}${path}`,
        name: page.language === "th" ? person.nameTh : person.nameEn
      };
    });
    assert(JSON.stringify(entry.contributor) === JSON.stringify(expected), `${page.path}/${datasetId} JSON-LD contributor parity failed`);
  }
  assert(structuredIds.size === manifest.projectionSummary.records, `${page.path} JSON-LD resource-class inventory must cover every UI record exactly once`);

  const allIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert(new Set(allIds).size === allIds.length, `${page.path} contains duplicate HTML ids`);
}

for (const [owner, path] of Object.entries(manifest.renderOwners)) {
  if (!["hydratedBundle", "transitionalEnhancer", "styles"].includes(owner)) continue;
  const absolute = join(root, path);
  assert(existsSync(absolute), `Missing P1 render owner: ${path}`);
  assert(sha256(readFileSync(absolute)) === manifest.renderOwnerHashes[owner], `P1 render owner hash changed: ${path}`);
}

const assetFiles = readdirSync(join(root, "assets"));
const p1Bundles = assetFiles.filter((name) => /^index-qbT50gkr-v(\d+)\.js$/.test(name) && Number(name.match(/-v(\d+)\.js$/)[1]) >= 13).sort();
const p1Enhancers = assetFiles.filter((name) => /^catalog-enhancements-v(\d+)\.js$/.test(name) && Number(name.match(/-v(\d+)\.js$/)[1]) >= 20).sort((a, b) => Number(a.match(/-v(\d+)\.js$/)[1]) - Number(b.match(/-v(\d+)\.js$/)[1]));
const p1Styles = assetFiles.filter((name) => /^catalog-enhancements-v(\d+)\.css$/.test(name) && Number(name.match(/-v(\d+)\.css$/)[1]) >= 22).sort();
assert(JSON.stringify(p1Bundles) === JSON.stringify(["index-qbT50gkr-v16.js", activeBundleName]), "Only the prior published and active post-v12 P1 hydrated owners may remain");
assert(p1Enhancers.includes("catalog-enhancements-v23.js") && p1Enhancers.includes("catalog-enhancements-v24.js"), "Published contributor enhancer rollback owners are missing");
assert(p1Enhancers.at(-1) === activeEnhancerName, "The active contributor enhancer must be the latest immutable enhancer version");
assert(JSON.stringify(p1Styles) === JSON.stringify([activeStylesName]), "Exactly one active post-v21 P1 stylesheet owner must remain");

const bundle = readFileSync(join(root, manifest.renderOwners.hydratedBundle), "utf8");
const enhancer = readFileSync(join(root, manifest.renderOwners.transitionalEnhancer), "utf8");
const css = readFileSync(join(root, manifest.renderOwners.styles), "utf8");
for (const [owner, source] of [["Hydrated bundle", bundle], ["Enhancer", enhancer]]) {
  for (const removedCopy of [
    "ผู้ร่วมพัฒนา CityMETER view นี้ ไม่ใช่เจ้าของหรือผู้รับรองข้อมูลต้นทาง",
    "Contributors to this CityMETER view, not owners or endorsers of the source data"
  ]) assert(!source.includes(removedCopy), `${owner} still contains removed contributor disclaimer copy`);
  assert(!source.includes("citymeter-contributors-note") && !source.includes("-contributors-note"), `${owner} still contains removed contributor disclaimer structure`);
}
for (const contract of [
  "CitymeterP1Data",
  "CitymeterP1Record",
  "CitymeterP1Path",
  `CitymeterP1VisibleLimit=${CONTRIBUTOR_VISIBLE_LIMIT}`,
  "CitymeterP1Compact",
  "CitymeterP1ContributorsDetail",
  '"data-citymeter-record-id":"dataset-"+xn(c.id)',
  '"data-module-slug":"dataset-"+xn(c.id)',
  'className:"dataset-card-actions"',
  'className:"citymeter-contributors-compact"',
  '"data-contributor-compact-snapshot-id"',
  '"data-contributor-compact-person-id"',
  "CitymeterP1Schema(s.id,f,A)",
  'resourceClass==="event"',
  '"@type":"CreativeWork"',
  "hasPart:d.map",
  'className:"citymeter-contributor"',
  'className:"citymeter-contributors-more"',
  '"data-contributor-disclosure":""',
  '"data-contributor-more-close":""',
  '"data-contributor-image":""'
]) assert(bundle.includes(contract), `Hydrated bundle is missing P1 contract: ${contract}`);
for (const contract of [
  'window.localStorage.getItem("lds-theme")||window.localStorage.getItem("citymeter-theme")',
  'c==="auto"?"system":c',
  'window.localStorage.setItem("lds-theme",D)'
]) assert(bundle.includes(contract), `Hydrated bundle is missing canonical theme contract: ${contract}`);
assert(!bundle.includes('setItem("citymeter-theme"'), "Hydrated bundle must treat the legacy theme key as read-only compatibility");
assert(enhancer.includes(`data/${active.registry.split("/").at(-1)}`), "Enhancer does not load the immutable contributor registry");
assert(enhancer.includes("enhanceContributors(card)") && enhancer.includes("contributorById"), "Enhancer is not an idempotent transitional contributor owner");
assert(count(enhancer, "new MutationObserver(scheduleEnhancements)") === 1, "Enhancer must retain exactly one hydration reapply observer");
for (const contract of [
  "contributorDisclosureBindings = new WeakSet()",
  "contributorImageBindings = new WeakSet()",
  'event.key === "Escape"',
  'event.key !== "Tab"',
  "closeAndReturn",
  "summary.focus()",
  "queueMicrotask",
  "image.naturalWidth === 0",
  'image.addEventListener("error"',
  'image.classList.add("is-broken")',
  "contributorRegistry.linkResolution.thField",
  "contributorCompact(record, recordName)",
  "contributorDetailBlock(record, recordName)",
  "contributorCompactSnapshotId",
  "contributorCompactPersonId",
  'element("div", "dataset-card-actions")',
  'details.querySelector(":scope > .citymeter-contributors")',
  "bindContributorInteractions(compact)",
  "bindContributorInteractions(detail)"
]) assert(enhancer.includes(contract), `Enhancer is missing contributor interaction contract: ${contract}`);
for (const personId of uniquePeople) {
  assert(!bundle.includes(personId) && !enhancer.includes(personId), `Render owner hard-codes canonical person truth: ${personId}`);
}
for (const selector of [
  ".dataset-card-actions {",
  ".citymeter-contributors-compact {",
  ".citymeter-contributor-compact-person {",
  ".dataset-card:has(.dataset-details[open]) .citymeter-contributors-compact {",
  ".citymeter-contributors {",
  ".citymeter-contributor {",
  ".citymeter-contributor-portrait {",
  ".citymeter-contributors-more[open] {",
  ".citymeter-contributor-image.is-broken {",
  ".citymeter-contributors-more-close {"
]) assert(css.includes(selector), `P1 stylesheet is missing ${selector}`);
assert(css.includes("min-height: 44px") && css.includes("width: 32px") && css.includes("height: 32px"), "Contributor target/avatar geometry drifted");

console.log(`CityMETER P1 contributor validation passed: ${manifest.projectionSummary.records}/${manifest.projectionSummary.records} cards with decorative compact portrait-only action rows and full contributor lists inside native details, ${assignmentCount} assignments, ${uniquePeople.size} unique people, ${portraitPeople.size} portrait identities with governed 1x/2x renditions, ${fallbackPeople.size} neutral fallback identities, ${manifest.projectionSummary.datasetRecords} Dataset + ${manifest.projectionSummary.eventRecords} CreativeWork JSON-LD parity, gate-resolved same-origin person links, accessible nested +N disclosure/focus/Escape and broken-image fallback contracts, strict public additionalProperties=false privacy, and exact immutable directory sets.`);
