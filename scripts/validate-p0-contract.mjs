import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const privateRootSetting = process.env.CITYMETER_P0_PRIVATE_DIR ?? ".p0-private";
const privateRoot = isAbsolute(privateRootSetting)
  ? privateRootSetting
  : resolve(root, privateRootSetting);
const privateRootRelative = relative(root, privateRoot);
const privateRootIsOutsideRepo = privateRootRelative === ".." || privateRootRelative.startsWith(`..${sep}`);
const privateRootIsIgnoredBoundary = privateRootRelative === ".p0-private" || privateRootRelative.startsWith(`.p0-private${sep}`);
if (!privateRootIsOutsideRepo && !privateRootIsIgnoredBoundary) {
  throw new Error("CITYMETER_P0_PRIVATE_DIR must resolve outside the public repository or inside its gitignored .p0-private boundary");
}
const landomRootSetting = process.env.LANDOM_P0_ROOT ?? "../landom-repo";
const landomRoot = isAbsolute(landomRootSetting)
  ? landomRootSetting
  : resolve(root, landomRootSetting);
const citymeterReleaseSha = "e37924762a97ee6e2262c8f11f19fbf8ba09848a";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) => createHash("sha256").update(stableJson(value)).digest("hex");
const sha256Bytes = (value) => createHash("sha256").update(value).digest("hex");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const assertUnique = (values, label) => {
  assert(new Set(values).size === values.length, `${label} must be unique`);
};

const catalog = readJson(join(privateRoot, "generated/citymeter-catalog.json"));
const map = readJson(join(privateRoot, "generated/citymeter-record-work-map.json"));
const bootstrap = readJson(join(privateRoot, "source/catalog-bootstrap.json"));
const routeMatrix = readJson(join(privateRoot, "authority/route-profile-matrix.json"));
const publicSchema = readJson(join(root, "data/schema/common-public-snapshot-p0.schema.json"));
const sourceReview = readJson(join(root, "data/catalog-source-review.json"));
const authoritativeWorks = readJson(join(landomRoot, "data/generated/works.json"));
const liveSiteDataPath = join(privateRoot, "evidence/landom-live-site-data-2026-08-25.json");
const liveAppPath = join(privateRoot, "evidence/landom-live-app-2026-08-25.js");
const liveSiteDataBytes = readFileSync(liveSiteDataPath);
const liveSiteData = JSON.parse(liveSiteDataBytes.toString("utf8"));
const liveApp = readFileSync(liveAppPath, "utf8");

const records = catalog.records;
const mappings = map.mappings;
const recordIds = records.map((record) => record.dataset_id);
const mappingDatasetIds = mappings.map((mapping) => mapping.dataset_id);
const bootstrapByDataset = new Map(bootstrap.records.map((record) => [record.dataset_id, record]));
const mappingByDataset = new Map(mappings.map((mapping) => [mapping.dataset_id, mapping]));
const sourceByDataset = new Map(sourceReview.records.map((record) => [record.id, record]));
const workById = new Map(authoritativeWorks.map((work) => [work.workId, work]));
const liveWorkById = new Map(liveSiteData.works.map((work) => [work.workId, work]));
const liveContributionWorkIds = new Set(liveSiteData.contributions.map((contribution) => contribution.workId));
const approval = bootstrap.mapping_approval;
const resourceClasses = new Set([
  "data_layer",
  "public_dataset_record",
  "market_layer",
  "derived_insight",
  "derived_model",
  "monitoring_feed",
  "forecast_layer",
  "event"
]);
const mappingStatuses = new Set(["canonical", "candidate", "approved", "withdrawn"]);
const authorityStatuses = new Set([
  "aligned_to_current_release_baseline",
  "candidate_exact_scope_owner_review",
  "owner_approved_current_release",
  "withdrawn"
]);
const allowedLocaleUses = ["service_planning", "field_validation", "engagement", "prioritization"];
const prohibitedLocaleUses = [
  "official_population",
  "eligibility_rule",
  "statutory_boundary",
  "risk_determination",
  "observed_behavior"
];

assert(records.length === 38, "P0 catalog must contain 38 records");
assert(mappings.length === 38, "P0 record-work map must contain 38 mappings");
assert(bootstrap.records.length === 38, "P0 private bootstrap must contain 38 records");
assert(approval?.status === "approved" && approval.approved_by === "project_owner", "Explicit project-owner mapping approval is required");
assert(sha256Bytes(liveSiteDataBytes) === approval.live_site_data_sha256, "Captured live Landom snapshot hash drifted from the approval receipt");
assert(liveSiteData.people.length === 51 && liveSiteData.works.length === 63 && liveSiteData.contributions.length === 120 && liveSiteData.assets.length === 51, "Approved live Landom baseline counts drifted");
assert(liveApp.includes('"catalogUrl"') && liveApp.includes('class="contribution-link"'), "Captured live application no longer displays catalog URLs as contribution links");
assertUnique(recordIds, "dataset_id");
assertUnique(mappingDatasetIds, "record-work dataset_id");
assertUnique(mappings.map((mapping) => mapping.mapping_id), "mapping_id");
assertUnique(mappings.map((mapping) => mapping.work_id), "work_id in the current one-record/one-work baseline");
assertUnique(records.map((record) => record.public_slug), "public_slug");
assertUnique(records.map((record) => record.map_key), "map_key");
assertUnique(records.map((record) => record.canonical_path_th), "Thai canonical path");
assertUnique(records.map((record) => record.canonical_path_en), "English canonical path");
assert(JSON.stringify(recordIds) === JSON.stringify(sourceReview.records.map((record) => record.id)), "P0 catalog order must match the current 38-record release registry");
assert(JSON.stringify(recordIds) === JSON.stringify(mappingDatasetIds), "Catalog and mapping inventories must stay aligned");
assert(records.filter((record) => record.pillar === "land").length === 12, "Land pillar must contain 12 records");
assert(records.filter((record) => record.pillar === "location").length === 13, "Location pillar must contain 13 records");
assert(records.filter((record) => record.pillar === "living").length === 13, "Living pillar must contain 13 records");
assert(catalog.records_sha256 === sha256(records), "Catalog payload SHA-256 does not match its records");
assert(map.mappings_sha256 === sha256(mappings), "Mapping payload SHA-256 does not match its mappings");

const stableRouteTokens = new Set(records.flatMap((record) => [record.dataset_id, record.public_slug, record.map_key]));
const aliases = records.flatMap((record) => record.legacy_aliases);
assertUnique(aliases, "legacy alias");
assert(aliases.every((alias) => !stableRouteTokens.has(alias)), "legacy aliases must not collide with stable or current route tokens");

for (const record of records) {
  const source = sourceByDataset.get(record.dataset_id);
  const seed = bootstrapByDataset.get(record.dataset_id);
  const mapping = mappingByDataset.get(record.dataset_id);
  const authoritativeWork = workById.get(mapping?.work_id);
  const liveWork = liveWorkById.get(mapping?.work_id);
  assert(source && seed && mapping, `Missing P0 evidence relationship for ${record.dataset_id}`);
  assert(authoritativeWork, `Missing authoritative Landom work for ${record.dataset_id}`);
  assert(liveWork && liveContributionWorkIds.has(mapping.work_id), `Approved live display evidence missing for ${record.dataset_id}`);
  assert(authoritativeWork.parentProduct === "CityMETER", `Unexpected Landom parentProduct for ${record.dataset_id}`);
  assert(resourceClasses.has(record.resource_class), `Unknown resource_class for ${record.dataset_id}`);
  assert(record.module_slug === record.dataset_id, `catalog module_slug compatibility drift for ${record.dataset_id}`);
  assert(record.public_name_th && record.public_name_en, `Missing bilingual public name for ${record.dataset_id}`);
  assert(record.taxonomy_status === "proposed_owner_review", `P0 taxonomy must remain fail-closed for ${record.dataset_id}`);
  assert(record.map_route_status === "observed_current_release", `Map route evidence status drift for ${record.dataset_id}`);
  assert(record.canonical_route_status === "proposed_owner_review", `Canonical route must remain proposed for ${record.dataset_id}`);
  assert(!("mapping_status" in record), `Mapping authority must not be duplicated into the catalog for ${record.dataset_id}`);
  assert(record.lineage_status === source.status, `Lineage status drift for ${record.dataset_id}`);

  const mapUrl = new URL(record.map_url);
  assert(mapUrl.origin === "https://landometer.com", `Map URL origin drift for ${record.dataset_id}`);
  assert(mapUrl.pathname === record.map_route, `Map route/url mismatch for ${record.dataset_id}`);
  assert(mapUrl.pathname.startsWith("/v3/citymeter"), `Unexpected current map path family for ${record.dataset_id}`);
  assert(mapUrl.searchParams.getAll("d").length === 1, `Map URL must contain exactly one d parameter for ${record.dataset_id}`);
  assert([...mapUrl.searchParams.keys()].length === 1, `Map URL has unexpected query parameters for ${record.dataset_id}`);
  assert(mapUrl.searchParams.get("d") === record.map_key, `Map key/url mismatch for ${record.dataset_id}`);
  assert(mapUrl.hash === "", `Map URL must not contain a fragment for ${record.dataset_id}`);
  assert(record.map_url === source.citymeterUrl, `Map URL source parity drift for ${record.dataset_id}`);

  const routeGroup = record.resource_class === "event" ? "events" : "datasets";
  assert(record.canonical_path_th === `/citymeter/${routeGroup}/${record.public_slug}`, `Thai canonical path mismatch for ${record.dataset_id}`);
  assert(record.canonical_path_en === `/en/citymeter/${routeGroup}/${record.public_slug}`, `English canonical path mismatch for ${record.dataset_id}`);
  assert(record.lifecycle === (record.resource_class === "event" ? "archived_event" : "active"), `Lifecycle mismatch for ${record.dataset_id}`);

  assert(mapping.mapping_id === seed.mapping_id, `Stable mapping_id drift for ${record.dataset_id}`);
  assert(mapping.work_id === seed.work_id, `work_id drift for ${record.dataset_id}`);
  assert(mapping.mapping_status === seed.mapping_status, `Mapping status drift for ${record.dataset_id}`);
  assert(mappingStatuses.has(mapping.mapping_status), `Unknown mapping status for ${record.dataset_id}`);
  assert(authorityStatuses.has(mapping.authority_status), `Unknown mapping authority status for ${record.dataset_id}`);
  assert(mapping.relationship_type === "public_record_attribution" && mapping.display_order === 1, `Relationship shape drift for ${record.dataset_id}`);
  assert(mapping.source_release_sha === citymeterReleaseSha, `Unpinned CityMETER source release for ${record.dataset_id}`);
  assert(mapping.mapping_status === "approved", `Live-displayed mapping is not owner-approved for ${record.dataset_id}`);
  assert(mapping.authority_status === "owner_approved_current_release", `Approved mapping authority drift for ${record.dataset_id}`);
  assert(mapping.evidence_status === "verified" && mapping.attribution_status === "approved", `Approved evidence/attribution drift for ${record.dataset_id}`);
  assert(mapping.module_slug === record.dataset_id, `Approved module_slug drift for ${record.dataset_id}`);
  assert(mapping.approved_by === approval.approved_by && mapping.approved_at === approval.approved_at && mapping.verified_at === approval.verified_at, `Approval provenance drift for ${record.dataset_id}`);
  assert(mapping.source_ref.includes(`live_landom_site-data@${approval.live_site_data_sha256}`), `Approved live snapshot reference drift for ${record.dataset_id}`);
  assert(mapping.source_ref.includes(`owner_task_instruction@${approval.approved_at}`), `Owner decision reference drift for ${record.dataset_id}`);
  assert(liveWork.catalogUrl?.th?.endsWith(`#${record.dataset_id}`) && liveWork.catalogUrl?.en?.endsWith(`#${record.dataset_id}`), `Approved live catalog link drift for ${record.dataset_id}`);
  if (seed.baseline_mapping_status === "candidate") {
    assert(authoritativeWork.moduleSlug === null && authoritativeWork.authorityStatus === "sheet_recorded_not_current_release_authority", `Candidate Landom authority drift for ${record.dataset_id}`);
    assert(authoritativeWork.catalogUrl?.th?.endsWith(`#${record.dataset_id}`) && authoritativeWork.catalogUrl?.en?.endsWith(`#${record.dataset_id}`), `Candidate catalog evidence drift for ${record.dataset_id}`);
  } else if (seed.baseline_mapping_status === "canonical") {
    assert(authoritativeWork.moduleSlug === record.dataset_id && authoritativeWork.authorityStatus === "aligned_to_citymeter_current_release", `Canonical Landom authority drift for ${record.dataset_id}`);
  } else {
    assert(false, `Unknown historical mapping baseline for ${record.dataset_id}`);
  }
}

assert(bootstrap.records.filter((record) => record.baseline_mapping_status === "canonical").length === 30, "Expected 30 historically aligned baseline mappings");
assert(bootstrap.records.filter((record) => record.baseline_mapping_status === "candidate").length === 8, "Expected 8 historically candidate mappings");
assert(mappings.filter((mapping) => mapping.mapping_status === "approved").length === 38, "All 38 live-displayed mappings must be owner-approved");
assert(mappings.filter((mapping) => mapping.approved_by && mapping.approved_at && mapping.verified_at).length === 38, "All 38 approved mappings require durable provenance");
assert(map.status === "owner_approved_mapping_baseline_catalog_routes_pending", "Mapping envelope status must preserve approval without claiming release readiness");

const companies = records.find((record) => record.dataset_id === "dataset-registered-companies-status-capital");
const businessDynamics = records.find((record) => record.dataset_id === "dataset-business-dynamics");
assert(companies.map_key !== businessDynamics.map_key, "Registered Companies and Business Dynamics must remain separate map identities");
assert(companies.public_slug !== businessDynamics.public_slug, "Registered Companies and Business Dynamics must remain separate public identities");

const locale = records.find((record) => record.dataset_id === "dataset-locale-insights");
assert(locale.resource_class === "derived_model" && locale.layer_type === "contextual_prior", "Locale Insights must remain a contextual prior");
assert(JSON.stringify(locale.governance.allowed_uses) === JSON.stringify(allowedLocaleUses), "Locale Insights must retain all four governed contextual uses");
assert(JSON.stringify(locale.governance.not_for) === JSON.stringify(prohibitedLocaleUses), "Locale Insights must retain all five prohibited uses");
assert(locale.governance.aggregation_requirement === "verified_locale_id_crosswalk_to_municipality_community_or_service_boundary", "Locale aggregation requires a verified locale_id crosswalk");
assert(locale.governance.primary_evidence === "official_administrative_municipal_hazard_risk_and_live_operational_evidence_within_scope", "Locale Insights must remain secondary to primary official and live evidence");

assert(routeMatrix.one_profile_per_route_family === true, "Route matrix must enforce exactly one profile per family");
assert(routeMatrix.routes.length === 7, "Temporary route/profile registry must remain a seven-route owner decision batch");
assert(routeMatrix.routes.every((route) => route.profile && route.decision_status.startsWith("proposed")), "Unapproved route/profile decisions must stay proposed");
assert(routeMatrix.routes.every((route) => route.page_kind === null && route.page_kind_source_ref === null), "Missing Product Brief must fail closed for page-kind authority");

assert(publicSchema.additionalProperties === false, "Public snapshot schema must be a strict allowlist");
assert(!("recordWorkMap" in publicSchema.properties), "Raw record-work mappings must never enter the public snapshot");
assert(publicSchema.$defs.catalogRecord.additionalProperties === false, "Catalog public projection must reject unknown fields");
assert(publicSchema.$defs.person.additionalProperties === false, "Person public projection must reject unknown fields");
assert(!("permissionRecordId" in publicSchema.$defs.portraitAsset.properties), "Permission record locators must remain private");
assert(!("consentEvidence" in publicSchema.$defs.person.properties), "Consent evidence must remain private");
assert(publicSchema.$defs.release.required.includes("publicInputHash"), "Release identity must use a redacted public-input hash");

const accidentalPublicOutputs = [
  "data/generated/common-public-snapshot.json",
  "data/common-public-snapshot.json",
  "common-public-snapshot.json"
];
assert(accidentalPublicOutputs.every((path) => !existsSync(join(root, path))), "No public snapshot may be emitted before owner approvals and a release build");

console.log("P0 contract validation passed.");
console.log("38 catalog records; 38 owner-approved live-displayed mappings (historical baseline: 30 aligned + 8 candidate); 2 event records.");
console.log("Status: mapping/public-content authority cleared; catalog taxonomy, canonical routes and public snapshot remain pending; not release-ready.");
