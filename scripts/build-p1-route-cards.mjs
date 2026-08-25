import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argumentsSet = new Set(process.argv.slice(2));
const checkOnly = argumentsSet.delete("--check");
if (argumentsSet.size > 0) {
  throw new Error(`Unsupported argument(s): ${[...argumentsSet].join(", ")}`);
}

const privateSetting = process.env.CITYMETER_P1_PRIVATE_DIR ?? ".p1-private";
const privateRoot = isAbsolute(privateSetting) ? privateSetting : resolve(root, privateSetting);
const privateRelative = relative(root, privateRoot);
const outsideRepo = privateRelative === ".." || privateRelative.startsWith(`..${sep}`);
const ignoredBoundary = privateRelative === ".p1-private" || privateRelative.startsWith(`.p1-private${sep}`);
if (!outsideRepo && !ignoredBoundary) {
  throw new Error("CITYMETER_P1_PRIVATE_DIR must be outside the repository or inside .p1-private");
}

const dsSetting = process.env.LANDOMETER_DS_ROOT ?? "../landometer-root-repo";
const dsRoot = isAbsolute(dsSetting) ? dsSetting : resolve(root, dsSetting);
const landomSetting = process.env.LANDOM_P1_ROOT ?? "../landom-repo";
const landomRoot = isAbsolute(landomSetting) ? landomSetting : resolve(root, landomSetting);
const matrixPath = join(privateRoot, "authority/route-profile-matrix.json");
const generatedRoot = join(privateRoot, "generated");
const outputDir = join(generatedRoot, "build-cards");
const receiptDir = join(generatedRoot, "artifact-receipts");
const packageRoot = join(dsRoot, "deployment/machine/v0.9.0");

const CITY_BUILD_ID = "ui-20260825-04";
const PREVIOUS_CITY_BUILD_ID = "ui-20260825-03";
const LANDOM_BUILD_ID = "ui-20260825-02";
const CITY_RECEIPT_FILE = `citymeter.${CITY_BUILD_ID}.receipt.json`;
const LANDOM_RECEIPT_FILE = `landom.${LANDOM_BUILD_ID}.receipt.json`;
const BUILT_ROUTE_FAMILIES = new Set([
  "citymeter_catalog",
  "citymeter_dataset",
  "citymeter_event",
  "landom_directory",
  "landom_person"
]);
const PENDING_ROUTE_FAMILIES = new Set(["root", "legal", "privacy", "accessibility"]);
const PENDING_GATES = [
  "actual_artifact_build_required",
  "approved_product_brief_or_product_specific_page_kind",
  "indexability_authority"
];
const EXPECTED_CITY_RELEASE_RECEIPT = "2026-08-25-contributors-compact-details-v27";
const EXPECTED_CITY_MANIFEST = "data/citymeter-contributor-release-p1-d5d089845ca8.json";
const EXPECTED_CITY_REFS = {
  runtime_bundle: "assets/index-qbT50gkr-v16.js",
  catalog_enhancer: "assets/catalog-enhancements-v23.js",
  catalog_styles: "assets/catalog-enhancements-v25.css"
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));
const sha256Bytes = (bytes) => createHash("sha256").update(bytes).digest("hex");
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const mode = (filePath) => statSync(filePath).mode & 0o777;
const assertInside = (base, target, label) => {
  const local = relative(base, target);
  assert(local !== ".." && !local.startsWith(`..${sep}`) && !isAbsolute(local), `${label} escapes its authority root`);
};
const fileReceipt = (filePath, logicalPath, extras = {}) => {
  const bytes = readFileSync(filePath);
  return {
    ...extras,
    path: logicalPath,
    bytes: bytes.byteLength,
    sha256: sha256Bytes(bytes)
  };
};
const aggregateReceipt = (artifacts) => ({
  algorithm: "sha256(stable-json-artifact-receipts)",
  artifact_count: artifacts.length,
  total_bytes: artifacts.reduce((sum, artifact) => sum + artifact.bytes, 0),
  sha256: sha256Bytes(stableJson(artifacts))
});
const metaContent = (html, name, label) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = html.match(new RegExp(`<meta\\s+[^>]*name=["']${escaped}["'][^>]*>`, "i"))?.[0];
  assert(tag, `${label} is missing meta ${name}`);
  const content = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
  assert(content, `${label} meta ${name} has no content`);
  return content;
};
const activeAssetRef = (html, expectedPath, htmlPath, label) => {
  const basePrefix = htmlPath === "index.html" ? "./" : "../";
  const expectedRef = `${basePrefix}${expectedPath}`;
  assert(html.includes(`src="${expectedRef}"`) || html.includes(`href="${expectedRef}"`), `${label} does not point to ${expectedRef}`);
  const resolved = resolve(dirname(join(root, htmlPath)), expectedRef);
  assertInside(root, resolved, `${label} ${expectedRef}`);
  assert(resolved === resolve(root, expectedPath), `${label} ${expectedRef} resolves to an unexpected path`);
  assert(existsSync(resolved), `${label} ${expectedRef} does not resolve to a file`);
};
const atomicWrite0600 = (destination, bytes) => {
  const temporary = `${destination}.tmp-${process.pid}`;
  writeFileSync(temporary, bytes, { mode: 0o600 });
  chmodSync(temporary, 0o600);
  renameSync(temporary, destination);
  chmodSync(destination, 0o600);
};
const assertBytes = (destination, expected, label) => {
  assert(existsSync(destination), `${label} is missing at ${destination}`);
  const actual = readFileSync(destination);
  assert(actual.equals(Buffer.from(expected)), `${label} bytes drifted`);
  assert(mode(destination) === 0o600, `${label} must remain mode 0600`);
};

const matrix = readJson(matrixPath);
const machinePackage = readJson(join(packageRoot, "package.json"));
const pageKinds = readJson(join(packageRoot, "page-kinds.json"));
const buildCardSchema = readJson(join(packageRoot, "build-card.schema.json"));
const dsHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: dsRoot, encoding: "utf8" }).trim();

const expectedPackage = matrix.ds_package;
const packageChecks = [
  [dsHead, expectedPackage.source_sha, "DS source SHA"],
  [machinePackage.dsVersion, expectedPackage.ds_version, "DS version"],
  [machinePackage.packageRevision, expectedPackage.package_revision, "package revision"],
  [machinePackage.generatedAtAuthoringRevision, expectedPackage.authoring_revision, "authoring revision"],
  [machinePackage.kitVersion, expectedPackage.kit_version, "kit version"],
  [machinePackage.manifestVersion, expectedPackage.manifest_version, "manifest version"]
];
for (const [actual, expected, label] of packageChecks) {
  assert(String(actual) === String(expected), `${label} drift: expected ${expected}; found ${actual}`);
}
assert(matrix.release_authority === false && String(matrix.status).includes("candidate"), "P1 route matrix must remain a non-release candidate");
assert(new Set(matrix.routes.map((route) => route.route_family)).size === matrix.routes.length, "P1 route families must be unique");
assert(matrix.routes.every((route) => BUILT_ROUTE_FAMILIES.has(route.route_family) || PENDING_ROUTE_FAMILIES.has(route.route_family)), "P1 route matrix contains an unclassified route family");
assert(machinePackage.artifactBuildId !== CITY_BUILD_ID && machinePackage.artifactBuildId !== LANDOM_BUILD_ID, "Product candidate IDs must differ from the DS reference artifact ID");
assert(CITY_BUILD_ID !== LANDOM_BUILD_ID, "Product candidate IDs must be distinct");

const tokenReceipt = fileReceipt(join(packageRoot, "tokens.json"), "v0.9.0-mp1/tokens.json");
const scaleReceipt = fileReceipt(join(dsRoot, "deployment/assets/data/scales.json"), "v0.9.0-r7/assets/data/scales.json");
const immutableColorBuildName = `landometer-design-system-v0.9.0-standalone.${machinePackage.colorSetId}.${machinePackage.artifactBuildId}.html`;
const immutableColorBaseline = fileReceipt(
  join(dsRoot, "deployment", immutableColorBuildName),
  `v0.9.0-r7/${immutableColorBuildName}`,
  { id: machinePackage.artifactBuildId }
);
const pageKindById = new Map(pageKinds.kinds.map((kind) => [kind.id, kind]));

const validatorModule = await import(pathToFileURL(join(landomRoot, "tools/json-schema-subset.mjs")).href);
const validateSubset = validatorModule.validateJsonSchemaSubset;
assert(typeof validateSubset === "function", "Landom JSON Schema subset validator is unavailable");

const htmlSpecs = [
  { channel: "html_th", path: "index.html", language: "th" },
  { channel: "html_en", path: "en/index.html", language: "en" }
];
const htmlSources = htmlSpecs.map((spec) => ({ ...spec, html: readFileSync(join(root, spec.path), "utf8") }));
for (const source of htmlSources) {
  for (const expectedPath of Object.values(EXPECTED_CITY_REFS)) {
    activeAssetRef(source.html, expectedPath, source.path, `${source.language.toUpperCase()} HTML`);
  }
}

const registryPointers = htmlSources.map((source) => metaContent(source.html, "citymeter:contributor-data", `${source.language.toUpperCase()} HTML`));
const manifestPointers = htmlSources.map((source) => metaContent(source.html, "citymeter:contributor-release-manifest", `${source.language.toUpperCase()} HTML`));
const releaseReceiptPointers = htmlSources.map((source) => metaContent(source.html, "citymeter:release-receipt", `${source.language.toUpperCase()} HTML`));
const contributorBuildPointers = htmlSources.map((source) => metaContent(source.html, "citymeter:contributor-candidate-build", `${source.language.toUpperCase()} HTML`));
assert(new Set(registryPointers).size === 1, "TH/EN contributor registry pointers differ");
assert(new Set(manifestPointers).size === 1, "TH/EN contributor manifest pointers differ");
assert(new Set(releaseReceiptPointers).size === 1, "TH/EN release receipts differ");
assert(new Set(contributorBuildPointers).size === 1, "TH/EN contributor build receipts differ");
const contributorRegistryPath = registryPointers[0];
const contributorManifestPath = manifestPointers[0];
const cityReleaseReceipt = releaseReceiptPointers[0];
for (const [logicalPath, label] of [[contributorRegistryPath, "contributor registry"], [contributorManifestPath, "contributor manifest"]]) {
  assert(!isAbsolute(logicalPath), `${label} pointer must be repository-relative`);
  const resolved = resolve(root, logicalPath);
  assertInside(root, resolved, label);
  assert(existsSync(resolved), `${label} pointer does not resolve: ${logicalPath}`);
}
assert(contributorManifestPath === EXPECTED_CITY_MANIFEST, `CityMETER active manifest must be ${EXPECTED_CITY_MANIFEST}`);
assert(cityReleaseReceipt === EXPECTED_CITY_RELEASE_RECEIPT, `CityMETER active receipt must be ${EXPECTED_CITY_RELEASE_RECEIPT}`);
assert(contributorBuildPointers[0] === cityReleaseReceipt, "CityMETER contributor-build and page-level release receipts must both identify v27");
const contributorManifest = readJson(join(root, contributorManifestPath));
assert(contributorManifest.releaseReceipt === cityReleaseReceipt, "CityMETER manifest and HTML release receipts differ");
assert(contributorManifest.releaseStatus === "approved_for_publication", "CityMETER v27 must retain its approved publication state");
assert(contributorManifest.publishable === true && contributorManifest.mustNotDeploy === false, "CityMETER v27 must remain publishable and deployable");
assert(contributorManifest.releaseAuthority?.authority === "site_owner", "CityMETER v27 must retain site-owner authority");
assert(contributorManifest.releaseAuthority?.authorizedAt === "2026-08-25", "CityMETER v27 authorization date drifted");
assert(typeof contributorManifest.releaseAuthority?.scope === "string" && contributorManifest.releaseAuthority.scope.includes("existing GitHub Pages site"), "CityMETER v27 authority scope must name the existing GitHub Pages site");
assert(contributorManifest.commonRelease?.stage === "draft", "Common upstream release must remain draft");
assert(contributorManifest.commonRelease?.publishable === false && contributorManifest.commonRelease?.mustNotDeploy === true, "Common upstream release must remain gated independently of the authorized CityMETER lane");
assert(Array.isArray(contributorManifest.commonRelease?.openGates) && contributorManifest.commonRelease.openGates.length > 0, "Common upstream release gates are missing");
assert(contributorManifest.contributorRegistry?.path === contributorRegistryPath, "CityMETER manifest points to a different contributor registry");
assert(contributorManifest.contributorRegistry?.sha256 === sha256Bytes(readFileSync(join(root, contributorRegistryPath))), "CityMETER contributor registry bytes drifted from the manifest");
const expectedManifestOwners = {
  hydratedBundle: EXPECTED_CITY_REFS.runtime_bundle,
  transitionalEnhancer: EXPECTED_CITY_REFS.catalog_enhancer,
  styles: EXPECTED_CITY_REFS.catalog_styles
};
for (const [owner, logicalPath] of Object.entries(expectedManifestOwners)) {
  assert(contributorManifest.renderOwners?.[owner] === logicalPath, `CityMETER manifest ${owner} owner drifted`);
  assert(contributorManifest.renderOwnerHashes?.[owner] === sha256Bytes(readFileSync(join(root, logicalPath))), `CityMETER manifest ${owner} hash drifted`);
}
assert(sha256Bytes(readFileSync(join(root, contributorManifestPath))).startsWith("d5d089845ca8"), "CityMETER manifest immutable filename no longer matches its bytes");

const cityArtifacts = [
  ...htmlSpecs.map((spec) => fileReceipt(join(root, spec.path), `citymeter-repo/${spec.path}`, {
    channel: spec.channel,
    colorSetId: machinePackage.colorSetId,
    artifactBuildId: CITY_BUILD_ID
  })),
  ...Object.entries(EXPECTED_CITY_REFS).map(([channel, logicalPath]) => fileReceipt(join(root, logicalPath), `citymeter-repo/${logicalPath}`, {
    channel,
    colorSetId: machinePackage.colorSetId,
    artifactBuildId: CITY_BUILD_ID
  })),
  fileReceipt(join(root, contributorRegistryPath), `citymeter-repo/${contributorRegistryPath}`, {
    channel: "contributor_registry",
    colorSetId: machinePackage.colorSetId,
    artifactBuildId: CITY_BUILD_ID
  }),
  fileReceipt(join(root, contributorManifestPath), `citymeter-repo/${contributorManifestPath}`, {
    channel: "contributor_manifest",
    colorSetId: machinePackage.colorSetId,
    artifactBuildId: CITY_BUILD_ID
  })
];
const cityAggregate = aggregateReceipt(cityArtifacts);
const cityReceipt = {
  schema_version: "0.2.0-p6-authorized-product-release",
  status: contributorManifest.releaseStatus,
  release_authority: true,
  product: "CityMETER",
  artifact_build_id: CITY_BUILD_ID,
  supersedes_artifact_build_id: PREVIOUS_CITY_BUILD_ID,
  release_receipt: cityReleaseReceipt,
  release_authority_evidence: {
    authority: contributorManifest.releaseAuthority.authority,
    authorized_at: contributorManifest.releaseAuthority.authorizedAt,
    scope: contributorManifest.releaseAuthority.scope
  },
  publication: {
    publishable: contributorManifest.publishable,
    must_not_deploy: contributorManifest.mustNotDeploy,
    target: "https://montri-th.github.io/CityMETER/"
  },
  common_upstream_release: {
    release_id: contributorManifest.commonRelease.releaseId,
    stage: contributorManifest.commonRelease.stage,
    publishable: contributorManifest.commonRelease.publishable,
    must_not_deploy: contributorManifest.commonRelease.mustNotDeploy,
    open_gates: contributorManifest.commonRelease.openGates
  },
  immutable_color_baseline_id: machinePackage.artifactBuildId,
  active_refs: {
    runtime_bundle: EXPECTED_CITY_REFS.runtime_bundle,
    catalog_enhancer: EXPECTED_CITY_REFS.catalog_enhancer,
    catalog_styles: EXPECTED_CITY_REFS.catalog_styles,
    contributor_registry: contributorRegistryPath,
    contributor_manifest: contributorManifestPath
  },
  artifacts: cityArtifacts,
  aggregate: cityAggregate
};
const cityReceiptBytes = stableJson(cityReceipt);
const cityReceiptMeta = {
  path: `artifact-receipts/${CITY_RECEIPT_FILE}`,
  bytes: Buffer.byteLength(cityReceiptBytes),
  sha256: sha256Bytes(cityReceiptBytes),
  aggregate_sha256: cityAggregate.sha256
};

const landomManifestPath = join(landomRoot, "dist/build-manifest.json");
const landomManifest = readJson(landomManifestPath);
assert(landomManifest.formatVersion === 1 && landomManifest.reproducible === true, "Landom build manifest is not a reproducible v1 manifest");
assert(Array.isArray(landomManifest.files) && landomManifest.files.length > 0, "Landom build manifest has no files");
assert(new Set(landomManifest.files.map((entry) => entry.path)).size === landomManifest.files.length, "Landom build manifest contains duplicate paths");
let landomTotalBytes = 0;
for (const entry of landomManifest.files) {
  assert(typeof entry.path === "string" && Number.isInteger(entry.bytes) && /^[0-9a-f]{64}$/.test(entry.sha256), `Invalid Landom build receipt for ${entry.path}`);
  const artifactPath = resolve(landomRoot, "dist", entry.path);
  assertInside(join(landomRoot, "dist"), artifactPath, `Landom artifact ${entry.path}`);
  const actual = fileReceipt(artifactPath, entry.path);
  assert(actual.bytes === entry.bytes, `Landom artifact byte drift: ${entry.path}`);
  assert(actual.sha256 === entry.sha256, `Landom artifact hash drift: ${entry.path}`);
  landomTotalBytes += entry.bytes;
}
const landomOutputAggregateSha = sha256Bytes(stableJson(landomManifest.files));
const landomManifestReceipt = fileReceipt(landomManifestPath, "landom-repo/dist/build-manifest.json", {
  channel: "deterministic_build_manifest",
  colorSetId: machinePackage.colorSetId,
  artifactBuildId: LANDOM_BUILD_ID
});
const landomReceipt = {
  schema_version: "0.1.0-p6-candidate",
  status: "candidate_not_release_ready",
  release_authority: false,
  product: "Landom",
  artifact_build_id: LANDOM_BUILD_ID,
  immutable_color_baseline_id: machinePackage.artifactBuildId,
  build_manifest: landomManifestReceipt,
  validated_output: {
    manifest_format_version: landomManifest.formatVersion,
    reproducible: landomManifest.reproducible,
    file_count: landomManifest.files.length,
    total_bytes: landomTotalBytes,
    aggregate_sha256: landomOutputAggregateSha,
    aggregate_algorithm: "sha256(stable-json-build-manifest-files)"
  }
};
const landomReceiptBytes = stableJson(landomReceipt);
const landomReceiptMeta = {
  path: `artifact-receipts/${LANDOM_RECEIPT_FILE}`,
  bytes: Buffer.byteLength(landomReceiptBytes),
  sha256: sha256Bytes(landomReceiptBytes),
  aggregate_sha256: landomOutputAggregateSha
};

const productBinding = (routeFamily) => routeFamily.startsWith("citymeter_")
  ? {
      id: CITY_BUILD_ID,
      receipt: cityReceiptMeta,
      artifactHashes: cityArtifacts,
      aggregateSha256: cityAggregate.sha256,
      releaseAuthority: true,
      publicationStatus: contributorManifest.releaseStatus,
      visibility: "public_existing_github_pages_site",
      authorityScope: contributorManifest.releaseAuthority.scope,
      commonUpstreamRelease: cityReceipt.common_upstream_release,
      qaReadiness: "authorized_product_lane_with_open_manual_and_common_upstream_gates"
    }
  : {
      id: LANDOM_BUILD_ID,
      receipt: landomReceiptMeta,
      artifactHashes: [landomManifestReceipt],
      aggregateSha256: landomOutputAggregateSha,
      releaseAuthority: false,
      publicationStatus: "candidate_not_release_ready",
      visibility: "private_local_candidate",
      authorityScope: null,
      commonUpstreamRelease: null,
      qaReadiness: "blocked_on_named_gates"
    };

const cardBytesByName = new Map();
const cardIndexEntries = [];
const pendingRoutes = [];
for (const route of matrix.routes) {
  const pageKind = pageKindById.get(route.page_kind);
  assert(pageKind, `Unknown page kind ${route.page_kind} for ${route.route_family}`);
  const allowedProfiles = String(pageKind.profile).split("|");
  assert(allowedProfiles.includes(route.profile), `${route.route_family} profile ${route.profile} is incompatible with ${route.page_kind}`);
  assert(route.page_kind_source_ref.includes(`#${route.page_kind}`), `${route.route_family} page-kind source reference is not exact`);

  if (PENDING_ROUTE_FAMILIES.has(route.route_family)) {
    pendingRoutes.push({
      route_family: route.route_family,
      path: route.path,
      product: route.product,
      profile: route.profile,
      page_kind: route.page_kind,
      status: "pending_no_artifact",
      open_gates: [...PENDING_GATES]
    });
    continue;
  }

  assert(BUILT_ROUTE_FAMILIES.has(route.route_family), `No artifact classification for ${route.route_family}`);
  const profile = readJson(join(packageRoot, `profiles/${route.profile}.json`));
  const binding = productBinding(route.route_family);
  assert(binding.id !== machinePackage.artifactBuildId, `${route.route_family} product receipt reuses the DS reference artifact ID`);
  assert(binding.artifactHashes.length > 0, `${route.route_family} has no actual artifact hashes`);
  const isCityRoute = route.route_family.startsWith("citymeter_");
  const openGates = ["indexability_authority", "browser_accessibility_manual_qa"];
  if (!isCityRoute) openGates.push("product_release_receipt_and_authority");
  if (route.decision_status.includes("product_brief_open")) openGates.push("approved_product_brief_or_product_specific_page_kind");
  if (isCityRoute) openGates.push(...contributorManifest.commonRelease.openGates);
  if (route.route_family.startsWith("landom_")) openGates.push("canonical_host_cutover");

  const card = {
    landometerBuild: {
      dsVersion: machinePackage.dsVersion,
      authoringRevision: machinePackage.generatedAtAuthoringRevision,
      schemas: {
        buildCard: "0.9.0",
        manifest: machinePackage.manifestVersion,
        tokens: machinePackage.tokenSchemaVersion
      },
      colorDelivery: {
        registryId: machinePackage.colorSetId,
        registryPath: "v0.9.0-mp1/color-delivery.json",
        tokenRegistry: tokenReceipt,
        scaleRegistry: scaleReceipt,
        immutableColorBaseline,
        currentArtifactBuild: {
          id: binding.id,
          path: binding.receipt.path,
          sha256: binding.receipt.sha256
        }
      },
      deliveryIdentity: {
        colorSetId: machinePackage.colorSetId,
        artifactBuildId: binding.id,
        tokenRegistry: tokenReceipt,
        scaleRegistry: scaleReceipt,
        artifactHashes: binding.artifactHashes
      },
      artifact: {
        name: route.route_family,
        product: route.product,
        profile: route.profile,
        pageKind: route.page_kind,
        pageKindSourceRef: route.page_kind_source_ref
      },
      publication: {
        status: binding.publicationStatus,
        visibility: binding.visibility,
        indexability: route.indexability,
        releaseAuthority: binding.releaseAuthority,
        authorityScope: binding.authorityScope,
        commonUpstreamRelease: binding.commonUpstreamRelease
      },
      voice: {
        languages: ["th", "en"],
        productCopyReview: isCityRoute ? "approved_preserved_live_content" : "open"
      },
      experience: {
        oneJob: profile.oneJob,
        firstAha: profile.firstAha,
        character: profile.character,
        motionIntensity: profile.motionIntensity
      },
      composition: {
        routeFamily: route.route_family,
        path: route.path,
        initialHtmlRequired: true,
        hydratedParityRequired: route.route_family.startsWith("citymeter_") || route.route_family === "landom_directory"
      },
      capabilities: {
        status: isCityRoute ? "not_claimed_beyond_validated_v27_contract" : "not_claimed_until_product_authority_and_runtime_validation",
        live: [],
        fixtureScoped: []
      },
      network: {
        mode: "none",
        action: "none",
        telemetryEnabled: false
      },
      privacy: {
        personalData: route.route_family === "landom_person",
        sensitivity: "approved_public_projection_only",
        redactedPublicProjection: true,
        rawSheetOrPrivateLedgerIncluded: false
      },
      artifactIdentityEvidence: {
        receiptPath: binding.receipt.path,
        receiptBytes: binding.receipt.bytes,
        receiptSha256: binding.receipt.sha256,
        aggregateSha256: binding.aggregateSha256,
        immutableColorBaselineId: machinePackage.artifactBuildId
      },
      qa: {
        machineValidation: isCityRoute
          ? "passed_schema_source_bytes_and_authorized_v27_receipt_checks"
          : "passed_schema_source_bytes_and_candidate_receipt_checks",
        readiness: binding.qaReadiness,
        openGates
      }
    }
  };

  const schemaErrors = validateSubset(card, buildCardSchema);
  assert(schemaErrors.length === 0, `${route.route_family} Build Card failed schema:\n- ${schemaErrors.join("\n- ")}`);
  assert(card.landometerBuild.artifact.profile === route.profile, `${route.route_family} did not retain its route-specific Profile`);
  assert(card.landometerBuild.publication.releaseAuthority === isCityRoute, `${route.route_family} release authority does not match its product lane`);
  assert(card.landometerBuild.deliveryIdentity.artifactBuildId === card.landometerBuild.colorDelivery.currentArtifactBuild.id, `${route.route_family} artifact build identity is inconsistent`);
  assert(card.landometerBuild.deliveryIdentity.artifactBuildId !== machinePackage.artifactBuildId, `${route.route_family} product build ID equals the DS reference ID`);
  assert(card.landometerBuild.deliveryIdentity.artifactHashes.every((artifact) => artifact.artifactBuildId === binding.id && artifact.bytes > 0 && /^[0-9a-f]{64}$/.test(artifact.sha256)), `${route.route_family} has an unbound artifact hash`);
  if (isCityRoute) {
    assert(card.landometerBuild.publication.status === "approved_for_publication", `${route.route_family} lost the authorized v27 publication state`);
    assert(card.landometerBuild.publication.commonUpstreamRelease?.stage === "draft", `${route.route_family} must preserve the draft common upstream state`);
    assert(card.landometerBuild.publication.commonUpstreamRelease?.publishable === false && card.landometerBuild.publication.commonUpstreamRelease?.must_not_deploy === true, `${route.route_family} must preserve the gated common upstream state`);
    assert(contributorManifest.commonRelease.openGates.every((gate) => openGates.includes(gate)), `${route.route_family} omitted a common upstream gate`);
  }

  const fileName = `${route.route_family}.build-card.v0.9.0.json`;
  const bytes = stableJson(card);
  cardBytesByName.set(fileName, bytes);
  cardIndexEntries.push({
    route_family: route.route_family,
    path: `build-cards/${fileName}`,
    sha256: sha256Bytes(bytes),
    status: card.landometerBuild.publication.status,
    artifact_build_id: binding.id,
    artifact_receipt_path: binding.receipt.path,
    artifact_receipt_sha256: binding.receipt.sha256,
    artifact_aggregate_sha256: binding.aggregateSha256,
    artifact_hash_count: binding.artifactHashes.length,
    open_gates: [...openGates]
  });
}

assert(cardBytesByName.size === BUILT_ROUTE_FAMILIES.size, "Exactly five artifact-backed Build Cards are required");
assert(pendingRoutes.length === PENDING_ROUTE_FAMILIES.size, "Exactly four pending routes are required");

const index = {
  schema_version: "0.2.0-p6-candidate",
  status: "candidate_not_release_ready",
  release_authority: false,
  ds_source_sha: dsHead,
  ds_package_revision: machinePackage.packageRevision,
  immutable_color_baseline: {
    id: machinePackage.artifactBuildId,
    ...immutableColorBaseline
  },
  product_receipts: [
    {
      product: "CityMETER",
      artifact_build_id: CITY_BUILD_ID,
      supersedes_artifact_build_id: PREVIOUS_CITY_BUILD_ID,
      status: cityReceipt.status,
      release_authority: cityReceipt.release_authority,
      release_receipt: cityReleaseReceipt,
      ...cityReceiptMeta
    },
    {
      product: "Landom",
      artifact_build_id: LANDOM_BUILD_ID,
      status: landomReceipt.status,
      release_authority: landomReceipt.release_authority,
      ...landomReceiptMeta
    }
  ],
  cards: cardIndexEntries,
  pending_routes: pendingRoutes
};
const indexBytes = stableJson(index);
const indexPath = join(generatedRoot, "build-cards-index.json");

const expectedCardNames = new Set(cardBytesByName.keys());
const knownCardNames = new Set(matrix.routes.map((route) => `${route.route_family}.build-card.v0.9.0.json`));
const existingCardNames = existsSync(outputDir)
  ? readdirSync(outputDir).filter((name) => name.endsWith(".build-card.v0.9.0.json"))
  : [];
const unknownCards = existingCardNames.filter((name) => !knownCardNames.has(name));
assert(unknownCards.length === 0, `Refusing to remove unknown private Build Cards: ${unknownCards.join(", ")}`);

const validateGenerated = () => {
  for (const directory of [privateRoot, join(privateRoot, "authority"), generatedRoot, outputDir, receiptDir]) {
    assert(existsSync(directory), `Private directory is missing: ${directory}`);
    assert(mode(directory) === 0o700, `Private directory must remain mode 0700: ${directory}`);
  }
  assertBytes(join(receiptDir, CITY_RECEIPT_FILE), cityReceiptBytes, "CityMETER artifact receipt");
  assertBytes(join(receiptDir, LANDOM_RECEIPT_FILE), landomReceiptBytes, "Landom artifact receipt");
  for (const [fileName, bytes] of cardBytesByName) {
    assertBytes(join(outputDir, fileName), bytes, `${fileName} Build Card`);
  }
  const actualCardNames = readdirSync(outputDir).filter((name) => name.endsWith(".build-card.v0.9.0.json"));
  assert(actualCardNames.length === expectedCardNames.size && actualCardNames.every((name) => expectedCardNames.has(name)), "Private Build Card directory does not contain exactly the five artifact-backed cards");
  assertBytes(indexPath, indexBytes, "Build Card index");
};

if (!checkOnly) {
  for (const directory of [privateRoot, join(privateRoot, "authority"), generatedRoot, outputDir, receiptDir]) {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    chmodSync(directory, 0o700);
  }

  for (const [destination, bytes, label] of [
    [join(receiptDir, CITY_RECEIPT_FILE), cityReceiptBytes, CITY_BUILD_ID],
    [join(receiptDir, LANDOM_RECEIPT_FILE), landomReceiptBytes, LANDOM_BUILD_ID]
  ]) {
    if (existsSync(destination)) {
      assert(readFileSync(destination).equals(Buffer.from(bytes)), `${label} is already bound to different artifact bytes; mint a new append-only candidate ID`);
      chmodSync(destination, 0o600);
    } else {
      atomicWrite0600(destination, bytes);
    }
  }

  for (const [fileName, bytes] of cardBytesByName) {
    atomicWrite0600(join(outputDir, fileName), bytes);
  }
  atomicWrite0600(indexPath, indexBytes);

  for (const fileName of existingCardNames) {
    if (!expectedCardNames.has(fileName)) unlinkSync(join(outputDir, fileName));
  }
}

validateGenerated();
console.log(`${checkOnly ? "Validated" : "Built and self-validated"} ${cardBytesByName.size} artifact-backed Build Cards; ${pendingRoutes.length} routes remain pending without cards.`);
console.log(`CityMETER ${CITY_BUILD_ID} aggregate SHA-256: ${cityAggregate.sha256}`);
console.log(`CityMETER receipt SHA-256: ${cityReceiptMeta.sha256}`);
console.log(`Landom ${LANDOM_BUILD_ID} aggregate SHA-256: ${landomOutputAggregateSha}`);
console.log(`Landom receipt SHA-256: ${landomReceiptMeta.sha256}`);
console.log(`Build Card index SHA-256: ${sha256Bytes(indexBytes)}`);
