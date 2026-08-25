import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) => createHash("sha256").update(stableJson(value)).digest("hex");
const sha256Bytes = (value) => createHash("sha256").update(value).digest("hex");

const citymeterReleaseSha = "e37924762a97ee6e2262c8f11f19fbf8ba09848a";
const bootstrap = readJson(join(privateRoot, "source/catalog-bootstrap.json"));
const sourceReview = readJson(join(root, "data/catalog-source-review.json"));
const authoritativeWorks = readJson(join(landomRoot, "data/generated/works.json"));
const liveSiteDataPath = join(privateRoot, "evidence/landom-live-site-data-2026-08-25.json");
const liveAppPath = join(privateRoot, "evidence/landom-live-app-2026-08-25.js");
const liveSiteDataBytes = readFileSync(liveSiteDataPath);
const liveSiteData = JSON.parse(liveSiteDataBytes.toString("utf8"));
const liveApp = readFileSync(liveAppPath, "utf8");
const html = readFileSync(join(root, "index.html"), "utf8");
const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!jsonLdMatch) throw new Error("index.html is missing the governed JSON-LD block");

const graph = JSON.parse(jsonLdMatch[1])["@graph"];
const catalogNode = graph.find((node) => node["@type"] === "DataCatalog");
if (!catalogNode || !Array.isArray(catalogNode.dataset)) {
  throw new Error("JSON-LD DataCatalog is missing dataset records");
}

const reviewById = new Map(sourceReview.records.map((record) => [record.id, record]));
const jsonLdById = new Map(catalogNode.dataset.map((record) => [record["@id"].split("#").at(-1), record]));
const workById = new Map(authoritativeWorks.map((work) => [work.workId, work]));
const liveWorkById = new Map(liveSiteData.works.map((work) => [work.workId, work]));
const liveContributionWorkIds = new Set(liveSiteData.contributions.map((contribution) => contribution.workId));
const approval = bootstrap.mapping_approval;

if (approval?.status !== "approved" || approval.approved_by !== "project_owner") {
  throw new Error("P0 mapping approval is missing the explicit project-owner authority record");
}
if (sha256Bytes(liveSiteDataBytes) !== approval.live_site_data_sha256) {
  throw new Error("Approved live Landom snapshot hash does not match the captured evidence");
}
if (!liveApp.includes('"catalogUrl"') || !liveApp.includes('class="contribution-link"')) {
  throw new Error("Captured live Landom application does not expose catalog URLs as contribution links");
}

for (const seed of bootstrap.records) {
  const work = workById.get(seed.work_id);
  const liveWork = liveWorkById.get(seed.work_id);
  if (!work) throw new Error(`Missing authoritative Landom work ${seed.work_id}`);
  if (!liveWork || !liveContributionWorkIds.has(seed.work_id)) {
    throw new Error(`Approved live Landom display evidence is missing for ${seed.work_id}`);
  }
  if (work.parentProduct !== "CityMETER") {
    throw new Error(`Unexpected parentProduct for ${seed.work_id}`);
  }
  const expectedFragment = `#${seed.dataset_id}`;
  if (!liveWork.catalogUrl?.th?.endsWith(expectedFragment) || !liveWork.catalogUrl?.en?.endsWith(expectedFragment)) {
    throw new Error(`Approved live catalog link drift for ${seed.dataset_id}`);
  }
  if (seed.baseline_mapping_status === "canonical") {
    if (work.moduleSlug !== seed.dataset_id || work.authorityStatus !== "aligned_to_citymeter_current_release") {
      throw new Error(`Canonical Landom authority drift for ${seed.dataset_id}`);
    }
  } else if (seed.baseline_mapping_status === "candidate") {
    if (work.moduleSlug !== null || work.authorityStatus !== "sheet_recorded_not_current_release_authority") {
      throw new Error(`Candidate Landom authority drift for ${seed.dataset_id}`);
    }
    if (!work.catalogUrl?.th?.endsWith(expectedFragment) || !work.catalogUrl?.en?.endsWith(expectedFragment)) {
      throw new Error(`Candidate catalog evidence drift for ${seed.dataset_id}`);
    }
  } else {
    throw new Error(`Unsupported private bootstrap baseline_mapping_status for ${seed.dataset_id}`);
  }
  if (seed.mapping_status !== "approved") throw new Error(`Owner-approved live mapping regressed for ${seed.dataset_id}`);
}

const records = bootstrap.records.map((seed, index) => {
  const source = reviewById.get(seed.dataset_id);
  const jsonLd = jsonLdById.get(seed.dataset_id);
  if (!source || !jsonLd) throw new Error(`Missing source evidence for ${seed.dataset_id}`);

  const mapUrl = new URL(source.citymeterUrl);
  const mapKey = mapUrl.searchParams.get("d");
  if (!mapKey) throw new Error(`Missing d= map key for ${seed.dataset_id}`);

  const isEvent = seed.resource_class === "event";
  const publicSlug = isEvent
    ? seed.dataset_id.replace(/^dataset-events-/, "")
    : seed.dataset_id.replace(/^dataset-/, "");
  const routeGroup = isEvent ? "events" : "datasets";

  return {
    dataset_id: seed.dataset_id,
    module_slug: seed.dataset_id,
    resource_class: seed.resource_class,
    layer_type: seed.layer_type,
    record_status: "active",
    lifecycle: isEvent ? "archived_event" : "active",
    taxonomy_status: "proposed_owner_review",
    public_slug: publicSlug,
    map_key: mapKey,
    map_route: mapUrl.pathname,
    legacy_aliases: seed.legacy_aliases ?? [],
    canonical_path_th: `/citymeter/${routeGroup}/${publicSlug}`,
    canonical_path_en: `/en/citymeter/${routeGroup}/${publicSlug}`,
    map_url: source.citymeterUrl,
    public_name_th: jsonLd.alternateName,
    public_name_en: jsonLd.name,
    pillar: seed.pillar,
    sort_order: index + 1,
    lineage_status: source.status,
    map_route_status: "observed_current_release",
    canonical_route_status: "proposed_owner_review",
    governance: seed.governance ?? null
  };
});

const mappings = bootstrap.records.map((seed) => ({
  mapping_id: seed.mapping_id,
  dataset_id: seed.dataset_id,
  work_id: seed.work_id,
  relationship_type: "public_record_attribution",
  display_order: 1,
  mapping_status: "approved",
  authority_status: "owner_approved_current_release",
  evidence_status: "verified",
  attribution_status: "approved",
  module_slug: seed.dataset_id,
  approved_by: approval.approved_by,
  approved_at: approval.approved_at,
  verified_at: approval.verified_at,
  source_release_sha: citymeterReleaseSha,
  source_ref: `live_landom_site-data@${approval.live_site_data_sha256};live_app_contribution-link;owner_task_instruction@${approval.approved_at}`
}));

const catalog = {
  schema_version: bootstrap.schema_version,
  status: "draft_owner_review_not_release_ready",
  evidence_cutoff: bootstrap.evidence_cutoff,
  source_spreadsheet_id: bootstrap.source_spreadsheet_id,
  source_review_date: sourceReview.reviewedAt,
  records,
  records_sha256: sha256(records)
};

const recordWorkMap = {
  schema_version: bootstrap.schema_version,
  status: "owner_approved_mapping_baseline_catalog_routes_pending",
  evidence_cutoff: bootstrap.evidence_cutoff,
  mappings,
  mappings_sha256: sha256(mappings)
};

const outputDir = join(privateRoot, "generated");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "citymeter-catalog.json"), stableJson(catalog));
writeFileSync(join(outputDir, "citymeter-record-work-map.json"), stableJson(recordWorkMap));

console.log(`Built ${records.length} catalog records and ${mappings.length} record-work mappings in the private P0 workspace.`);
console.log(`Catalog SHA-256: ${catalog.records_sha256}`);
console.log(`Mapping SHA-256: ${recordWorkMap.mappings_sha256}`);
