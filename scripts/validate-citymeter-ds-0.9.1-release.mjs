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

function replaceExactlyOnce(source, before, after, label) {
  assert(count(source, before) === 1, `${label}: expected exactly one source value`);
  assert(count(source, after) === 0, `${label}: replacement already exists in the source`);
  return source.replace(before, after);
}

function replaceEveryExactly(source, before, after, expectedCount, label) {
  assert(count(source, before) === expectedCount, `${label}: expected exactly ${expectedCount} source values`);
  assert(count(source, after) === 0, `${label}: replacement already exists in the source`);
  return source.replaceAll(before, after);
}

function replaceSpanExactlyOnce(source, startMarker, endMarker, replacement, label) {
  assert(count(source, startMarker) === 1, `${label}: expected exactly one start marker`);
  assert(count(source, endMarker) === 1, `${label}: expected exactly one end marker`);
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(end > start, `${label}: end marker must follow the start marker`);
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function attribute(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] || "";
}

function classTokenCount(source, className) {
  return [...source.matchAll(/(?:^|\s)class="([^"]*)"/g)]
    .filter((match) => match[1].split(/\s+/).includes(className))
    .length;
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
  releaseId: "2026-09-05-citymeter-ds091-public-v6",
  buildId: "ui-20260905-ds091-public-v6",
  tupleHash: "852f2cb97c5c7ba269c4c543f27cb4587b519263ea2075d84562289f21890e49",
  productionCss: {
    path: "assets/landometer-ds/v0.9.1/color-srgb-05.production.css",
    sha256: "3bac2499df594bbf6b016b650ee7763f7ec093e33bc5f28239144e0677281d5c",
    bytes: 8184
  },
  compiledBaseCss: {
    path: "assets/index-cqxdfePB.css",
    sha256: "96c6366c085d7d36d9f6786f1f77f2bacb279805ff1e3e7fb7743ee30bf0a6e1",
    bytes: 23726
  },
  migrationSources: [
    { path: "assets/index-qbT50gkr-v17.js", sha256: "23d79ee191a447fcbfbfeee2b1514604882a9085e1bb9d1ed3361e89ec778b26", bytes: 419960 },
    { path: "assets/catalog-enhancements-v25.js", sha256: "6200d3fdc620ed5cd37da5f5babcac487117b14015bcdae7d020040ae8c7aa44", bytes: 63768 }
  ],
  authorityFiles: [
    { path: "data/catalog-source-review.json", sha256: "b1141375790b3d6c4d63cf064702b49bf246f26695373ab59e9b9f8bb2e167a4", bytes: 72839 },
    { path: "data/citymeter-product-brief-v6-approval.json", sha256: "039afad5935caf9f729012c7ca8d861c6e0b766d292993d92ca4532f32456bd8", bytes: 2170 },
    { path: "data/citymeter-owner-publication-approval-2026-09-04.json", sha256: "fca4a59abb6097174b3ab922c1c85391591feb1e71321b88fbdc09be90f569fc", bytes: 2754 },
    { path: "data/citymeter-owner-media-reuse-confirmation-2026-09-05.json", sha256: "041895bafc399e2ba94697760edd8ad267b6d081b0b307f1a75bc38e78236e9c", bytes: 2452 },
    { path: "data/citymeter-depa-supporter-marks-rights-record.json", sha256: "115d3cdcd6954361aa10ed72793c05e30e51c410961b1e87d01399f7ba0afedd", bytes: 3316 }
  ],
  supporterMarks: [
    { key: "depa", path: "media/supporters/depa.png", sha256: "6098165e3424c8f7b4c15e26200e88f561ab0a841b8a60125b1735d1260532cd", bytes: 70866, width: 2160, height: 1350, altTh: "depa", altEn: "depa" },
    { key: "dsure", path: "media/supporters/dsure-software.png", sha256: "d60db2a3f73abf7a5b815307027c0cf25d6c01ed3134648c094217446bc85143", bytes: 54776, width: 1014, height: 1465, altTh: "dSURE Software", altEn: "dSURE Software" },
    { key: "account", path: "media/supporters/digital-service-account.png", sha256: "57c01b122575800f475cc29e958f6b1c5a7bac705cb5b6ba2365ae9bd90e3086", bytes: 112508, width: 2298, height: 1042, altTh: "บัญชีบริการดิจิทัล", altEn: "Digital Service Account" }
  ],
  candidateFiles: [
    { path: "assets/catalog-enhancements-ds-0.9.1-v30.css", sha256: "7e3ed3a8b600114480e5b5cce63767f3e01c17800876549ec42e0a04b3abe041", bytes: 46604 },
    { path: "assets/unified-navbar-r7-ds-0.9.1-v34.css", sha256: "4aa2f994dc67e56866a9dc7d4805acfd206d647b33b0112e27ae69de3b2f08a3", bytes: 22318 },
    { path: "assets/unified-navbar-r7-v32.js", sha256: "461cec2c203236d3a0bf4f73333690b9eec731647e0c78cff8a1bb61e9e00989", bytes: 22328 },
    { path: "assets/catalog-enhancements-ds-0.9.1-v26.js", sha256: "f38e255ed8f921ea7beda520fe9d6eff9da0078ef69f892747b8585fad2807d5", bytes: 61551 },
    { path: "assets/citymeter-ds-0.9.1-approach-reveal-v1.js", sha256: "378c8797958cae7b39311125abe6d759eee6b9056b23c5d59243fb0786d88100", bytes: 10311 },
    { path: "assets/index-qbT50gkr-v18.js", sha256: "808fa6d1805b61181c8675885e68d3be664dcc50d277df3a3af21d0d85c3bed0", bytes: 531713 },
    { path: "data/citymeter-ds-0.9.1-release-record.json", sha256: "e1a690a2dbc80371b861b0e99b8514919f10f1eae8f0d2f3770f89d2d2b9aedc", bytes: 10265 },
    { path: "scripts/apply-citymeter-ds-0.9.1-motif-release.mjs", sha256: "1dc7e73e81c1ed1cb6400af37f6b5665448a0e60c7dc50bbafa46382a7a27180", bytes: 81289 },
    { path: "index.html", sha256: "94f25b588471f807fdac9af47fd2b165838c3ccbc069bd254ef2db2001ecfb00", bytes: 551242 },
    { path: "en/index.html", sha256: "d05945044bdcc33c53e2105eb2a51352488fe07e417edd812e38f560bf02301e", bytes: 474246 }
  ],
  sourceBodyHashes: {
    "index.html": "bd0ac3cd092b1327f026f55a19c23731578bd8793ff0bc88e0529690da16f646",
    "en/index.html": "0b3edd918dc09bba00c81da13b0740eb8f572c5fda22cb0e611901e8258c4476"
  }
};

for (const asset of [expected.productionCss, expected.compiledBaseCss]) {
  assert(statSync(join(root, asset.path)).size === asset.bytes, `${asset.path}: byte count drifted`);
  assert(sha256(asset.path) === asset.sha256, `${asset.path}: exact-byte SHA-256 drifted`);
}
for (const file of [...expected.migrationSources, ...expected.authorityFiles, ...expected.supporterMarks, ...expected.candidateFiles]) {
  assert(/^[a-f0-9]{64}$/.test(file.sha256) && file.bytes >= 0, `${file.path}: replace the v5 candidate hash/byte placeholder before running the release gate`);
  assert(statSync(join(root, file.path)).size === file.bytes, `${file.path}: candidate byte count drifted`);
  assert(sha256(file.path) === file.sha256, `${file.path}: candidate SHA-256 drifted`);
}

const release = json("data/citymeter-ds-0.9.1-release-record.json");
assert(release.releaseId === expected.releaseId && release.artifactBuildId === expected.buildId, "Release identity drifted");
assert(release.recordVersion === "1.5", "Release decision record version drifted");
assert(release.productScope === "CityMETER", "Release product scope must remain CityMETER");
assert(release.artifact.format === "web_public" && release.artifact.runtime === "browser", "Web-public browser contract drifted");
assert(release.audience === "public" && release.intendedAudience === "public", "Public audience boundary drifted");
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
assert(
  release.changeBoundary.presentationOnly === false
    && release.changeBoundary.productCopyChanged === true
    && release.changeBoundary.productClaimsAdded === false
    && release.changeBoundary.datasetRecordsChanged === false
    && release.changeBoundary.sourceDisclosureChanged === true
    && release.changeBoundary.structuredDataSemanticStructureCorrected === true
    && release.changeBoundary.unsupportedExactPromotionalFiguresSoftened === true,
  "Evidence-bound copy/source/schema correction boundary drifted"
);
assert(release.changeBoundary.decorativeColoredEdgePolicy === "prohibited", "Decorative colored-edge prohibition drifted");
assert(release.changeBoundary.motifRole === "none" && release.changeBoundary.motifRuntime === "not_loaded" && release.changeBoundary.motifMotion === "none", "Motif removal boundary is not recorded exactly");
assert(release.changeBoundary.motifMotionDs091Disposition === "no_active_divergence_after_owner_directed_removal", "Removed motif must not retain an active motion divergence");
assert(release.changeBoundary.approachRevealRuntime === "browser_observer", "Slow reveal must use the DS browser-observer runtime");
assert(release.changeBoundary.approachRevealTargetCountPerLocale === 57, "Slow reveal must bind exactly 57 semantic targets per locale");
assert(JSON.stringify(release.changeBoundary.approachRevealRoles) === JSON.stringify({ "approach.soft": 11, "media.arrival": 45, "approach.inline-end": 1 }), "Slow-reveal role inventory drifted");
assert(release.changeBoundary.approachRevealConformanceDisposition === "owner_directed_artifact_timing_divergence; exact MOTION-03 recipe conformance is not claimed", "Owner-directed reveal timing divergence must remain explicit");
assert(JSON.stringify(release.changeBoundary.approachRevealCanonicalDsBaseline) === JSON.stringify({
  opacityDurationMs: 760,
  transformDurationMs: 920,
  mediaDurationMs: 900,
  blockDistancePx: 32,
  inlineDistancePx: 36,
  scaleFrom: 0.985,
  staggerStepMs: 150,
  staggerCapMs: 450
}), "Canonical DS 0.9.1 reveal baseline record drifted");
assert(JSON.stringify(release.changeBoundary.approachRevealTiming) === JSON.stringify({
  opacityDurationMs: 1200,
  transformDurationMs: 1450,
  mediaDurationMs: 1350,
  blockDistancePx: 32,
  inlineDistancePx: 36,
  scaleFrom: 0.985,
  staggerStepMs: 150,
  staggerCapMs: 450,
  staggerScope: "small_related_groups_only",
  datasetPreviewStaggerMs: 0,
  observerThreshold: 0.14,
  observerRootMargin: "0px 0px -12% 0px",
  initializationWatchdogMs: 2400
}), "Owner-directed perceivable reveal timing record drifted");
for (const safetyContract of [
  "Final-state source HTML",
  "one observer",
  "once-only unobserve",
  "two-frame reached-content audit",
  "reduced motion",
  "deep links",
  "history/BFCache",
  "print"
]) assert(release.changeBoundary.approachRevealSafety.includes(safetyContract), `Slow-reveal safety record is missing: ${safetyContract}`);
assert(release.changeBoundary.datasetSnapshotHoverClip.includes("15px inner top radius"), "Snapshot-hover clip decision is not recorded");
assert(release.changeBoundary.navigationUtilityRestoration?.status === "integrated_and_verified", "Language/theme navigation restoration must be integrated and verified");
assert(JSON.stringify(release.changeBoundary.navigationUtilityRestoration?.controls) === JSON.stringify(["th", "en", "system_theme", "light_theme", "dark_theme"]), "Language/theme control inventory drifted");
assert(release.changeBoundary.navigationUtilityRestoration?.verifiedBehavior.includes("at least 44px hit targets in both normal and calm header states"), "Navigation record must preserve physical hit targets in the calm header state");
assert(release.deliveryDecision.deliveryState === "ready_for_publication" && release.deliveryDecision.governedConformanceLevel === "not_claimed", "Public release must keep formal receipt-based conformance unclaimed");
assert(release.deliveryDecision.artifactQaPassedClaimed === false && release.deliveryDecision.productionVerifiedClaimed === false, "Unsigned QA/production promotion must remain unclaimed");
assert(release.deliveryDecision.publishable === true && release.deliveryDecision.mustNotDeploy === false, "Owner-authorized public release must remain deployable");
assert(release.deliveryDecision.blockingReasons.length === 0, "Public release must not retain resolved project-authored blockers");
assert(release.deliveryDecision.publicationBasis.length >= 4 && release.deliveryDecision.conformanceClaimBoundary.length >= 3, "Publication basis and formal-conformance boundary must remain explicit");
assert(release.knownBoundaries.length >= 4, "Known authority/trust boundaries must remain explicit");
assert(release.authority.citymeterProductBriefApprovalRef === "data/citymeter-product-brief-v6-approval.json", "CityMETER Product Brief approval binding drifted");
assert(release.authority.catalogEvidenceRef === "data/catalog-source-review.json" && release.authority.claimExpansionPerformed === false, "Catalogue evidence/claim boundary drifted");
assert(release.authority.ownerMediaReuseConfirmationRef === "data/citymeter-owner-media-reuse-confirmation-2026-09-05.json", "Owner media-reuse authority binding drifted");
assert(release.authority.ownerMotifRemovalDirectionRef === "owner-message:2026-09-05:remove-motif-from-citymeter", "Owner motif-removal direction is missing");
assert(release.authority.ownerSlowRevealDirectionRef === "owner-message:2026-09-05:restore-slow-reveal-all-eligible-pieces", "Owner slow-reveal direction is missing");
assert(release.authority.ownerRevealPerceptibilityDirectionRef === "owner-message:2026-09-05:reveal-slower-and-more-perceivable", "Owner reveal-perceptibility direction is missing");
assert(release.authority.ownerNavigationControlRestorationDirectionRef === "owner-message:2026-09-05:restore-language-and-theme-controls", "Owner language/theme restoration direction is missing");
assert(!("motifApprovalRef" in release.authority) && !("ownerContinuousMotifDirectionRef" in release.authority), "Inactive motif-use authority must not remain in the active release record");

const brandApproval = json("data/landometer-master-brand-brief-v0.5.3-approval.json");
assert(brandApproval.subject.version === "0.5.3" && brandApproval.approval.status === "owner_approved", "Master Brand Brief v0.5.3 approval record drifted");
assert(brandApproval.subject.sourceSha256 === "33041749f59bca930459dccc3637bad1a4884bf4cecc8e1a543f8ec3771fe87c" && brandApproval.subject.sourceBytes === 76984, "Master Brand Brief exact-source binding drifted");
assert(brandApproval.projectUse.productScope === "CityMETER" && brandApproval.projectUse.claimExpansionAuthorized === false, "Master Brand Brief authority boundary drifted");
assert(brandApproval.authorityExclusions.includes("CityMETER product claims") && brandApproval.authorityExclusions.includes("artifact QA or production conformance"), "Master Brand Brief exclusions drifted");

const productBriefApproval = json("data/citymeter-product-brief-v6-approval.json");
assert(productBriefApproval.subject.product === "CityMETER" && productBriefApproval.subject.version === "Landometer-aligned v6", "CityMETER Product Brief subject drifted");
assert(productBriefApproval.subject.sourceSha256 === "3c84c6b51fe0f8a288090ddaeb5b732c53f30234241103daa1d5a8baa0914448" && productBriefApproval.subject.sourceBytes === 120412, "CityMETER Product Brief exact-source binding drifted");
assert(productBriefApproval.approval.status === "owner_approved" && productBriefApproval.projectUse.productScope === "CityMETER", "CityMETER Product Brief approval scope drifted");
assert(productBriefApproval.authorityExclusions.includes("proof that a specific dataset, feature, endpoint or live operation exists") && productBriefApproval.authorityExclusions.includes("Design System artifact QA or production conformance"), "CityMETER Product Brief exclusions drifted");

const publicationApproval = json("data/citymeter-owner-publication-approval-2026-09-04.json");
assert(publicationApproval.productScope === "CityMETER" && publicationApproval.artifact.catalogRecordCount === 38, "Owner publication authorization scope drifted");
assert(publicationApproval.approval.status === "owner_approved_retroactively" && publicationApproval.approval.evidenceRefs.length === 2, "Owner publication authorization evidence drifted");
const approvedCatalog = publicationApproval.approvedSubjects.find((subject) => subject.ref === "data/catalog-source-review.json");
assert(approvedCatalog?.sha256 === expected.authorityFiles[0].sha256 && approvedCatalog?.bytes === expected.authorityFiles[0].bytes, "Owner authorization must bind the exact source registry bytes");
assert(publicationApproval.approvedSubjects.some((subject) => subject.ref === "data/citymeter-depa-supporter-marks-rights-record.json"), "Owner publication authorization must bind the supporter-mark rights record");
assert(publicationApproval.publicationPolicy.thirdPartyMarks === "Use only when a project-scoped rights record binds the exact bytes, placement, wording, and non-endorsement boundary. Remove any unbound mark rather than imply endorsement.", "Third-party mark publication policy drifted");
assert(publicationApproval.doesNotCreate.includes("source lineage, freshness, geographic coverage, capability, or production facts that are not otherwise evidenced"), "Owner authorization evidence boundary drifted");

const mediaReuse = json("data/citymeter-owner-media-reuse-confirmation-2026-09-05.json");
assert(mediaReuse.recordType === "owner_media_reuse_confirmation" && mediaReuse.authority.status === "owner_confirmed", "Owner media-reuse confirmation drifted");
assert(mediaReuse.productScope === "CityMETER" && mediaReuse.authorizedUse.reuseClass === "same_owner_cross_property_publication", "Same-owner media scope drifted");
assert(mediaReuse.assetBindings.reduce((total, binding) => total + binding.assetCount, 0) === 49, "Owner media-reuse confirmation must bind all 49 existing preview/reel/social assets");
assert(mediaReuse.confirmedFacts.some((fact) => fact.includes("already deployed on Landometer web")), "Owner source-deployment provenance is missing");
assert(mediaReuse.publicationBoundary.some((boundary) => boundary.includes("does not change a provider licence")), "Provider-licence boundary must remain explicit");

const supporterRights = json("data/citymeter-depa-supporter-marks-rights-record.json");
assert(supporterRights.recordType === "citymeter_third_party_mark_use_record" && supporterRights.authorityStatus === "document_supported_and_owner_attested", "Supporter-mark authority status drifted");
assert(supporterRights.productScope === "CityMETER" && supporterRights.artifactScope.placement === "site footer" && JSON.stringify(supporterRights.artifactScope.locales) === JSON.stringify(["th", "en"]), "Supporter-mark product/placement/locale scope drifted");
assert(supporterRights.evidence.some((entry) => entry.kind === "signed_contract" && entry.sha256 === "6466680e525268eaedb264facd77f9f0cfdbd0019625aae081f4860e5d93eac2" && entry.bytes === 15575142), "Supporter-mark signed-contract evidence drifted");
assert(supporterRights.evidence.some((entry) => entry.kind === "decision_and_programme_document" && entry.sha256 === "7ecc4f254c65399ad8d58ed990c59972fc829685954f3825cb05f7c9f275f0fb" && entry.bytes === 31209245), "Supporter-mark decision evidence drifted");
assert(supporterRights.evidence.some((entry) => entry.kind === "owner_attestation_of_delivery" && entry.evidenceRef === "owner-message:2026-09-04:depa-officer-supplied-marks-and-approval-letter"), "Supporter-mark owner delivery attestation drifted");
const publicationMarks = supporterRights.approvedExactAssets.filter((asset) => asset.publicationUse === true);
assert(publicationMarks.length === 3, "Supporter-mark rights record must approve exactly three publication assets");
for (const mark of expected.supporterMarks) {
  const approval = publicationMarks.find((asset) => asset.path === mark.path);
  assert(approval?.sha256 === mark.sha256 && approval?.bytes === mark.bytes, `Supporter-mark rights binding drifted: ${mark.key}`);
}
const retiredLockupApproval = supporterRights.approvedExactAssets.find((asset) => asset.path === "media/depa-dsure-tdc-lockup.png");
assert(retiredLockupApproval?.publicationUse === false && retiredLockupApproval?.sha256 === "804506f124cdb55dc14918b6eb64f7c2bd9badd29fc33fcfddeee5b62b07932c" && retiredLockupApproval?.bytes === 291328, "Combined supporter lockup must remain non-publication source material");
assert(supporterRights.requiredVisibleCopy.th === "ได้รับการส่งเสริมและสนับสนุนโดย depa" && supporterRights.requiredVisibleCopy.en === "Promoted and supported by depa", "Supporter-mark visible-copy authority drifted");
assert(supporterRights.useConditions.some((condition) => condition.includes("once in the footer")) && supporterRights.useConditions.some((condition) => condition.includes("Do not repeat the marks in the hero")), "Supporter-mark placement/non-duplication boundary drifted");

const catalogReview = json("data/catalog-source-review.json");
const allowedSourceStatuses = new Set(["verified-lineage", "candidate", "other-source", "derived", "unproven"]);
const expectedSourceStatusCounts = { "verified-lineage": 11, candidate: 7, "other-source": 5, derived: 2, unproven: 13 };
assert(catalogReview.reviewedAt === "2026-08-14" && catalogReview.records.length === 38, "Source registry release/count drifted");
assert(new Set(catalogReview.records.map((record) => record.id)).size === 38, "Source registry IDs must be unique");
for (const record of catalogReview.records) {
  assert(/^dataset-[a-z0-9-]+$/.test(record.id), `Source registry ID is invalid: ${record.id}`);
  assert(allowedSourceStatuses.has(record.status), `Source registry status is invalid for ${record.id}`);
  for (const field of ["ownerTh", "ownerEn", "sourceTh", "sourceEn", "readingTh", "readingEn"]) {
    assert(typeof record[field] === "string" && record[field].trim(), `Source registry ${record.id} is missing ${field}`);
  }
}
for (const [status, expectedCount] of Object.entries(expectedSourceStatusCounts)) {
  assert(catalogReview.records.filter((record) => record.status === status).length === expectedCount, `Source registry status count drifted: ${status}`);
}

const v17 = read("assets/index-qbT50gkr-v17.js");
const v18 = read("assets/index-qbT50gkr-v18.js");
const oldThemeProjection = 'O==="dark"?"#141820":"#176b82"';
const newThemeProjection = 'O==="dark"?"#11191D":"#F6F7F3"';
assert(count(v17, oldThemeProjection) === 1 && count(v17, newThemeProjection) === 0, "v17 theme-color migration source drifted");
assert(count(v18, oldThemeProjection) === 0 && count(v18, newThemeProjection) === 1, "v18 must contain exactly one DS 0.9.1 hydrated theme-color projection");

let expectedV18 = v17;
for (const [before, after, label] of [
  [oldThemeProjection, newThemeProjection, "hydrated theme-color projection"],
  ["สำรวจอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยงจากข้อมูลจริง แล้วเปิดดูพื้นที่ที่สนใจได้ทันที", "สำรวจตัวอย่างอาคาร ราคา ธุรกิจ ผู้คน การเดินทาง และความเสี่ยง พร้อมดูขอบเขตและสิ่งที่ยังต้องตรวจ ก่อนเปิดพื้นที่ที่สนใจ", "hydrated Thai hero evidence boundary"],
  ["Explore buildings, prices, businesses, people, access and risk through real data, then open the place you need.", "Explore examples across buildings, prices, businesses, people, access and risk, with each record’s scope and checks to make before you open a place.", "hydrated English hero evidence boundary"],
  ["แสดงเฉพาะหน่วยที่ยืนยันได้ในแต่ละรายการ", "แต่ละรายการบอกระดับพื้นที่ที่รองรับได้ หรือสิ่งที่ยังต้องตรวจ", "hydrated Thai spatial proof boundary"],
  ["Only evidenced units are shown for each record", "Each record states the spatial level it supports or what still needs checking", "hydrated English spatial proof boundary"],
  ['title:"เข้าใจเมืองผ่าน 3 มุมที่เชื่อมกัน",intro:"Land คือฐานของเมือง Living คือผู้คน บริการ และความเป็นอยู่ เมื่อนำมาดูร่วมกันจึงเห็นว่าแต่ละ Location ต่างกันอย่างไร—และบางเรื่องเปลี่ยนไปตามเวลา"', 'title:"เข้าใจเมืองผ่าน 3 มิติ แล้วไปสู่การตัดสินใจ",intro:"Land, Location และ Living เป็นบริบทคนละมิติที่ CityMETER นำมาเชื่อมกัน เพื่อให้เห็นสิ่งที่ควรตรวจ เปรียบเทียบ และตัดสินใจต่อในพื้นที่จริง"', "hydrated Thai product architecture"],
  ['title:"One city, seen through three connected lenses",intro:"Land is the city’s base. Living is people, services and everyday life. Together they show how each Location differs—and how some patterns change over time."', 'title:"Three dimensions of a place, connected to a decision",intro:"Land, Location and Living are peer dimensions that CityMETER connects so people can see what to check, compare and decide next in a real place."', "hydrated English product architecture"],
  ['body:"รวม 38 มุมมองให้ค้น เทียบ และเปิดดูหลักฐานในที่เดียว"},outcome:{brand:"Landometer",label:"Local Decisions",body:"ช่วยให้เห็นว่าควรตรวจอะไรต่อ และตัดสินใจเรื่องพื้นที่ได้อย่างไร"}', 'body:"เชื่อม 38 มุมมองให้ค้น เทียบ และเห็นทั้งสิ่งที่รู้กับสิ่งที่ยังต้องตรวจ"},outcome:{brand:"CityMETER",label:"Local Decisions",body:"เปลี่ยนบริบทเชิงพื้นที่ให้เป็นสิ่งที่ควรตรวจ เทียบ และทำต่อ"}', "hydrated Thai outcome boundary"],
  ['body:"Organises 38 views so people can find, compare and inspect evidence in one place."},outcome:{brand:"Landometer",label:"Local Decisions",body:"Shows what to check next and how to move a place decision forward."}', 'body:"Connects 38 views so people can find, compare and see both what is known and what still needs checking."},outcome:{brand:"CityMETER",label:"Local Decisions",body:"Turns spatial context into what to check, compare and do next."}', "hydrated English outcome boundary"],
  ["เล่าโครงข่าย 50,000 สาขา พร้อมสำนักงานใหญ่ หมวดธุรกิจ และสาขาจดทะเบียนใหม่", "สำรวจตัวอย่างโครงข่ายสำนักงานใหญ่–สาขา หมวดธุรกิจ และสาขาจดทะเบียนใหม่ โดยตรวจขนาดชุดข้อมูลในรายละเอียดก่อนใช้", "hydrated Thai business sample boundary"],
  ["Tell the 50,000-branch network story through headquarters, sectors, and newly registered branches", "Explore a sample headquarters–branch network, sectors, and newly registered branches, checking the dataset size in the details before use", "hydrated English business sample boundary"],
  ["ความครบของแต่ละฟิลด์ไม่เท่ากัน: GFA และ GLA ราว 70% ส่วนจำนวนผู้เช่าราว 95.6% ของระเบียนที่ตรวจ", "ความครบของฟิลด์ GFA, GLA และจำนวนผู้เช่าไม่เท่ากัน ต้องตรวจ coverage ของระเบียนก่อนเปรียบเทียบ", "hydrated Thai retail coverage boundary"],
  ["Field coverage differs: GFA and GLA are about 70%, while tenant count is about 95.6% in the audited records", "Coverage differs across GFA, GLA and tenant fields; check record completeness before comparison", "hydrated English retail coverage boundary"],
  ["ใช้เส้นเวลา 14 ปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นภาพตั้งต้นของความเสี่ยงย้อนหลัง", "ใช้เส้นเวลาหลายปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นบริบทน้ำท่วมย้อนหลัง โดยตรวจช่วงปีจากแหล่งข้อมูลก่อนใช้", "hydrated Thai flood-period boundary"],
  ["Use the 14-year timeline, recurrence count, and worst year as the historical risk baseline", "Use the multi-year timeline, recurrence count, and worst year as historical flood context, checking the source period before use", "hydrated English flood-period boundary"],
  ["แสดงพื้นที่ที่ตรวจพบพร้อมวันที่สังเกตการณ์ให้เด่นกว่าคำว่า ‘ล่าสุด’", "ใช้ภาพขอบเขตเป็น snapshot เบื้องต้น โดยตรวจ observation date จากแหล่งข้อมูลก่อนและไม่ใช้แทนสถานการณ์สด", "hydrated Thai observed-flood boundary"],
  ["Make the observation date more prominent than the word ‘latest’ when showing detected flood areas", "Use the extent only as a provisional snapshot after verifying its observation date at the source", "hydrated English observed-flood boundary"],
  ["ข้อมูลที่ตรวจพบล่าสุดเป็นภาพตามวันที่ระบุ ไม่ใช่สถานการณ์สด", "หน้านี้ยังไม่ยืนยัน observation date หรือ vintage; พื้นที่ไม่มีสีไม่ได้แปลว่าปลอดภัย", "hydrated Thai observed-flood limitation"],
  ["The latest observed layer is a dated snapshot, not present conditions", "This page does not yet verify the layer’s observation date or vintage; uncoloured areas are not automatically safe", "hydrated English observed-flood limitation"],
  ["ใช้พื้นที่น้ำท่วม ความลึกสูงสุด–เฉลี่ย และเวลาออกรัน เพื่อช่วยจัดลำดับการติดตาม", "ใช้รายการนี้ระบุคำถามเรื่องพื้นที่ ความลึก วิธี และเวลาออกรันที่ต้องตรวจจากหน่วยงานก่อนเฝ้าระวัง", "hydrated Thai forecast-depth boundary"],
  ["Use flooded area, maximum and average depth, and run time to prioritise follow-up", "Use this record to identify the area, depth, method and run-time questions to verify before monitoring", "hydrated English forecast-depth boundary"],
  ["ผลโมเดลไม่ใช่คำยืนยันเหตุการณ์ และต้องแสดงเวลาออกรัน แหล่งข้อมูล วิธี และข้อจำกัด", "exact package, เวลาออกรัน วิธี และโมเดลยังไม่ยืนยัน จึงห้ามใช้เป็นคำยืนยันหรือคำแนะนำฉุกเฉิน", "hydrated Thai forecast-depth limitation"],
  ["Model output is not confirmation of an event; show run time, source, method, and limitations", "The exact package, run time, method and model remain unverified; do not treat this as confirmation or emergency advice", "hydrated English forecast-depth limitation"],
  ["ใช้ระดับความเสี่ยง 24 ชั่วโมง อันดับจังหวัด และเวลาออกรันเป็นภาพเฝ้าระวัง", "ใช้รายการนี้ระบุพื้นที่ ช่วงคาดการณ์ และเวลาออกรันที่ต้องตรวจจากแหล่งทางการก่อนเฝ้าระวัง", "hydrated Thai flash-flood boundary"],
  ["Use the 24-hour risk levels, province ranking, and run time as a monitoring story", "Use this record to identify the area, forecast horizon and run time to verify at the named provider source", "hydrated English flash-flood boundary"],
  ["เป็นสัญญาณจากโมเดล ไม่ใช่คำยืนยันว่าจะเกิดเหตุ และต้องคงป้ายสถานะการทดลองไว้", "exact feed, ช่วงคาดการณ์และเวลาออกรันยังไม่ยืนยัน จึงไม่ใช่คำเตือนทางการหรือคำแนะนำเดินทาง", "hydrated Thai flash-flood limitation"],
  ["This is a model signal, not confirmation that an event will occur; retain the experimental status", "The exact feed, forecast horizon and run time remain unverified; this is not a verified alert or travel advice", "hydrated English flash-flood limitation"],
  ["ใช้ตำแหน่งสถานี ค่า MMI ความเร่ง และเวลาอัปเดตสร้างภาพเครือข่ายตรวจวัด", "ใช้รายการนี้ระบุสถานี ตัวชี้วัดแรงสั่นสะเทือน และเวลาข้อมูลที่ต้องตรวจจากแหล่งทางการ", "hydrated Thai earthquake boundary"],
  ["Use station locations, MMI, acceleration, and update time to explain the sensing network", "Use this record to identify the station, shaking measures and timestamp to verify at the named provider source", "hydrated English earthquake boundary"],
  ["ต้องแสดงความใหม่ของข้อมูล; วันที่อัปเดตที่พบในการตรวจคือ 10 มีนาคม 2569", "หน้านี้ยังไม่มี freshness record ปัจจุบัน ต้องตรวจสถานี ตัวชี้วัด และเวลาอัปเดตจากแหล่งทางการ", "hydrated Thai earthquake limitation"],
  ["Freshness must remain visible; the inspected page showed an update date of 10 March 2026", "This page has no current freshness record; verify the station, measures and update time at the named provider source", "hydrated English earthquake limitation"],
  ["14 ปี · การเกิดซ้ำ · ปีหนักสุด", "หลายปี · การเกิดซ้ำ · ปีหนักสุด", "hydrated Thai flood focus boundary"],
  ["14 years · recurrence · worst year", "Multi-year · recurrence · worst year", "hydrated English flood focus boundary"],
  ['E("land"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("living"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"→"}),E("location")', 'E("land"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("location"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("living")', "hydrated peer-category order"],
  ['name:"CityMETER public data views and modules",numberOfItems:g.length,dataset:', 'name:"CityMETER public data views and modules",dataset:', "hydrated structured-data schema boundary"]
]) {
  expectedV18 = replaceExactlyOnce(expectedV18, before, after, label);
}
expectedV18 = replaceEveryExactly(expectedV18, "สัญญาณความเสี่ยง 24 ชั่วโมง", "ช่วงคาดการณ์และเวลาออกรัน · ต้องยืนยัน", 3, "hydrated Thai flash-flood focus boundary");
expectedV18 = replaceEveryExactly(expectedV18, "24-hour risk signal", "Forecast horizon and run time · verify", 2, "hydrated English flash-flood focus boundary");
expectedV18 = replaceExactlyOnce(
  expectedV18,
  'const g=f==="th"?"หน่วยงานและเครื่องหมายรับรองที่เกี่ยวข้อง":"Related programme and certification marks"',
  'const g=f==="th"?"การสนับสนุนและเครื่องหมายโครงการที่ได้รับจาก depa":"Support and programme marks received from depa"',
  "hydrated supporter attribution label"
);
expectedV18 = replaceExactlyOnce(
  expectedV18,
  'p.jsx("p",{children:c.footer.summary}),p.jsxs("div",{className:"supporter-logos supporter-logos-footer"',
  'p.jsx("p",{children:c.footer.summary}),p.jsx("p",{className:"supporter-evidence-line",children:f==="th"?"ได้รับการส่งเสริมและสนับสนุนโดย depa":"Promoted and supported by depa"}),p.jsxs("div",{className:"supporter-logos supporter-logos-footer"',
  "hydrated visible depa attribution"
);
expectedV18 = replaceExactlyOnce(expectedV18, 'children:p.jsx(SocialIconGlyph,{path:N.path})', "children:N.name", "hydrated text social links");
const v17CardComponent = v17.slice(v17.indexOf("function G6"), v17.indexOf("function CatalogStructureDiagram"));
assert(v17CardComponent.startsWith("function G6") && v17CardComponent.length > 1000, "v17 card-component source boundary drifted");
const normalizedV18 = replaceSpanExactlyOnce(v18, "const CitymeterSourceReviewMeta=", "function CatalogStructureDiagram", v17CardComponent, "hydrated r5 source-review owner transaction");
if (normalizedV18 !== expectedV18) {
  let offset = 0;
  const sharedLength = Math.min(normalizedV18.length, expectedV18.length);
  while (offset < sharedLength && normalizedV18[offset] === expectedV18[offset]) offset += 1;
  throw new Error(`Hydrated bundle changed outside the exact authorized migration from v17 at byte ${offset}: expected ${JSON.stringify(expectedV18.slice(offset, offset + 160))}, observed ${JSON.stringify(normalizedV18.slice(offset, offset + 160))}`);
}

const retiredUnsupportedVisibleCopy = [
  "เล่าโครงข่าย 50,000 สาขา พร้อมสำนักงานใหญ่ หมวดธุรกิจ และสาขาจดทะเบียนใหม่",
  "Tell the 50,000-branch network story through headquarters, sectors, and newly registered branches",
  "ความครบของแต่ละฟิลด์ไม่เท่ากัน: GFA และ GLA ราว 70% ส่วนจำนวนผู้เช่าราว 95.6% ของระเบียนที่ตรวจ",
  "Field coverage differs: GFA and GLA are about 70%, while tenant count is about 95.6% in the audited records",
  "ใช้เส้นเวลา 14 ปี จำนวนปีที่เกิดซ้ำ และปีที่หนักที่สุดเป็นภาพตั้งต้นของความเสี่ยงย้อนหลัง",
  "Use the 14-year timeline, recurrence count, and worst year as the historical risk baseline",
  "แสดงพื้นที่ที่ตรวจพบพร้อมวันที่สังเกตการณ์ให้เด่นกว่าคำว่า ‘ล่าสุด’",
  "Make the observation date more prominent than the word ‘latest’ when showing detected flood areas",
  "ข้อมูลที่ตรวจพบล่าสุดเป็นภาพตามวันที่ระบุ ไม่ใช่สถานการณ์สด",
  "The latest observed layer is a dated snapshot, not present conditions",
  "ใช้พื้นที่น้ำท่วม ความลึกสูงสุด–เฉลี่ย และเวลาออกรัน เพื่อช่วยจัดลำดับการติดตาม",
  "Use flooded area, maximum and average depth, and run time to prioritise follow-up",
  "ผลโมเดลไม่ใช่คำยืนยันเหตุการณ์ และต้องแสดงเวลาออกรัน แหล่งข้อมูล วิธี และข้อจำกัด",
  "Model output is not confirmation of an event; show run time, source, method, and limitations",
  "ใช้ระดับความเสี่ยง 24 ชั่วโมง อันดับจังหวัด และเวลาออกรันเป็นภาพเฝ้าระวัง",
  "Use the 24-hour risk levels, province ranking, and run time as a monitoring story",
  "เป็นสัญญาณจากโมเดล ไม่ใช่คำยืนยันว่าจะเกิดเหตุ และต้องคงป้ายสถานะการทดลองไว้",
  "This is a model signal, not confirmation that an event will occur; retain the experimental status",
  "สัญญาณความเสี่ยง 24 ชั่วโมง",
  "24-hour risk signal",
  "ใช้ตำแหน่งสถานี ค่า MMI ความเร่ง และเวลาอัปเดตสร้างภาพเครือข่ายตรวจวัด",
  "Use station locations, MMI, acceleration, and update time to explain the sensing network",
  "ต้องแสดงความใหม่ของข้อมูล; วันที่อัปเดตที่พบในการตรวจคือ 10 มีนาคม 2569",
  "Freshness must remain visible; the inspected page showed an update date of 10 March 2026",
  "14 ปี · การเกิดซ้ำ · ปีหนักสุด",
  "14 years · recurrence · worst year"
];
for (const retiredCopy of retiredUnsupportedVisibleCopy) {
  assert(!v18.includes(retiredCopy), `Hydrated output restored unsupported visible copy: ${retiredCopy}`);
}

const enhancerV25 = read("assets/catalog-enhancements-v25.js");
const enhancerV26 = read("assets/catalog-enhancements-ds-0.9.1-v26.js");
assert(enhancerV25.includes("gdcatalog-logo.png") && enhancerV25.includes("const supporterAssets"), "v25 enhancer migration source drifted");
assert(!enhancerV26.includes("gdcatalog-logo.png") && !enhancerV26.includes("gd-lineage-logo"), "v26 must not render an unapproved GD identity mark");
assert(!enhancerV26.includes("const supporterAssets") && !enhancerV26.includes("function createSupporterLogos"), "v26 must not retain a supporter-mark insertion path");
assert(count(enhancerV26, "card.dataset.claimId = `claim.citymeter.catalog.${record.id}.v1`;") === 1, "v26 claim identity binding drifted");
assert(count(enhancerV26, "2026-09-04-r5") === 2 && !enhancerV26.includes("2026-08-14-r4"), "v26 must use the r5 source-review contract for both the stability guard and final state");
assert(!enhancerV26.includes("const visualFocus = text.visualFocus[card.id]"), "v26 must not mutate React-owned visual copy after hydration");
for (const contract of [
  "function readInlineRegistry(id)",
  "function loadRegistryDocument(id, url, label)",
  'loadRegistryDocument("citymeter-source-review-data", assetBase + "data/catalog-source-review.json?v=20260904-ds091-v26", "Source registry")',
  'heroCopy.querySelector(".supporter-lockup-hero")?.remove();',
  'heroCopy.querySelector(".supporter-logos-hero")?.remove();'
]) assert(enhancerV26.includes(contract), `v26 embedded-registry/mark-removal contract is missing: ${contract}`);
for (const retiredFallback of [
  "ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี",
  "เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ พร้อมเทียบกราฟย้อนหลัง 14 ปี",
  "Phak Hai · 14-year flood history",
  "See annual flood extent and recurrence in Phak Hai with a 14-year comparison chart",
  "24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน",
  "เห็นระดับความเสี่ยง 24 ชั่วโมงบนแผนที่ประเทศไทย พร้อมอันดับจังหวัดและเวลาออกรัน",
  "24-hour flash-flood risk by province",
  "See 24-hour risk levels across Thailand with province ranking and forecast run time"
]) assert(!enhancerV26.includes(retiredFallback), `v26 restored an unsupported fallback claim: ${retiredFallback}`);

assert(!v18.includes("media/depa-dsure-tdc-lockup.png") && !enhancerV26.includes("media/depa-dsure-tdc-lockup.png"), "Active JavaScript must not restore the retired combined supporter lockup");
for (const mark of expected.supporterMarks) {
  assert(count(v18, mark.path) === 1, `Hydrated footer must reference the exact ${mark.key} mark once`);
  assert(!enhancerV26.includes(mark.path), `v26 must not inject a duplicate ${mark.key} mark after hydration`);
}
assert(count(v18, 'className:"supporter-logos supporter-logos-footer"') === 1, "Hydrated footer must render one supporter-mark group");
assert(!v18.includes("supporter-logos-hero") && !v18.includes("supporter-lockup-hero"), "Hydrated hero must not render supporter marks");
assert(v18.includes("ได้รับการส่งเสริมและสนับสนุนโดย depa") && v18.includes("Promoted and supported by depa"), "Hydrated footer must retain localized visible depa attribution");
const expectedRuntimeSourceMeta = JSON.stringify(Object.fromEntries(catalogReview.records.map((record) => [record.id, {
  status: record.status,
  conceptualPreview: Boolean(record.conceptualPreview)
}])));
assert(v18.includes(`const CitymeterSourceReviewMeta=${expectedRuntimeSourceMeta};`), "Hydrated source-review metadata must align directly with all 38 registry records");
assert(v18.includes('"data-source-review-version":"2026-09-04-r5"') && v18.includes('dangerouslySetInnerHTML:{__html:CitymeterSourceReviewHtml[f][c]}'), "Hydrated cards must own the r5 source-review structure before enhancement");

const pageContracts = [
  { path: "index.html", language: "th", prefix: "./", canonical: "https://montri-th.github.io/CityMETER/" },
  { path: "en/index.html", language: "en", prefix: "../", canonical: "https://montri-th.github.io/CityMETER/en/" }
];

const sourceStatusLabels = {
  th: {
    "verified-lineage": "ยืนยันแหล่งข้อมูลต้นทางแล้ว",
    candidate: "พบแหล่งข้อมูลที่เกี่ยวข้อง — ต้องตรวจเพิ่ม",
    "other-source": "ใช้แหล่งข้อมูลเฉพาะด้าน",
    derived: "CityMETER คำนวณและสรุปต่อยอด",
    unproven: "ข้อมูลสำรวจเบื้องต้น — ยังไม่ยืนยันแหล่งต้นทาง"
  },
  en: {
    "verified-lineage": "Source dataset verified",
    candidate: "Related source identified — further checks needed",
    "other-source": "Uses a specialist data source",
    derived: "Calculated and summarised by CityMETER",
    unproven: "Exploratory view — source not yet verified"
  }
};

function localizedReview(record, field, language) {
  return record[`${field}${language === "th" ? "Th" : "En"}`] || "";
}

function sourceLinkMarkup(record, language, key, label) {
  const links = Array.isArray(record[key]) ? record[key] : [];
  if (!links.length) return "";
  const anchors = links.map((link) => `<a class="source-link" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(language === "th" ? link.labelTh : link.labelEn)}</a>`).join("");
  return `<div class="source-link-group"><span class="source-link-label">${label}</span><div class="source-links">${anchors}</div></div>`;
}

function sourceReviewInner(record, language) {
  const th = language === "th";
  const owner = localizedReview(record, "owner", language);
  const source = localizedReview(record, "source", language);
  const period = localizedReview(record, "period", language) || (th
    ? "ยังไม่มีช่วงเวลาและรอบปรับปรุงที่ยืนยันในทะเบียนนี้"
    : "No verified coverage period or update cycle is recorded here yet");
  const reading = localizedReview(record, "reading", language);
  return [
    `<span class="source-status source-status-${escapeHtml(record.status)}">${escapeHtml(sourceStatusLabels[language][record.status] || sourceStatusLabels[language].unproven)}</span>`,
    `<div class="source-copy-block"><strong>${th ? "ข้อมูลมาจากไหน" : "Where the data comes from"}</strong><p>${escapeHtml(`${owner} — ${source}`)}</p></div>`,
    `<div class="source-copy-block"><strong>${th ? "ข้อมูลครอบคลุมช่วงไหน" : "What period the data covers"}</strong><p>${escapeHtml(period)}</p></div>`,
    `<div class="source-copy-block"><strong>${th ? "ก่อนใช้ตัดสินใจ" : "Before making a decision"}</strong><p>${escapeHtml(reading)}</p></div>`,
    sourceLinkMarkup(record, language, "official", th ? "ช่องทางทางการ" : "Official channel"),
    sourceLinkMarkup(record, language, "gd", "GD Catalog"),
    `<p class="source-review-date">${th ? "ทบทวนหลักฐาน" : "Evidence reviewed"}: ${th ? "14 ส.ค. 2569" : "14 Aug 2026"}</p>`
  ].join("");
}

const expectedRuntimeSourceHtml = JSON.stringify(Object.fromEntries(["th", "en"].map((language) => [
  language,
  Object.fromEntries(catalogReview.records.map((record) => [record.id, sourceReviewInner(record, language)]))
])));
assert(v18.includes(`const CitymeterSourceReviewHtml=${expectedRuntimeSourceHtml};`), "Hydrated source-review HTML must match the approved registry in both locales");
assert(v18.includes(`const CitymeterSourceStatusLabels=${JSON.stringify(sourceStatusLabels)};`), "Hydrated source-status labels must match the static locale contract");

const expectedRevealTargets = [
  { selector: "#decisions > .wide-container > .section-heading", role: "approach.soft", group: "decisions-heading", count: 1 },
  { selector: "#examples > .showcase-atmosphere > .wide-container > .section-heading", role: "approach.soft", group: "examples-heading", count: 1 },
  { selector: "#examples .showcase-grid > .showcase-card > .showcase-image", role: "media.arrival", group: "showcase-media", count: 6 },
  { selector: "#datasets > .wide-container > .section-heading", role: "approach.soft", group: "datasets-heading", count: 1 },
  { selector: "#datasets .catalog-structure > :is(.catalog-structure-caption, .catalog-structure-citymeter, .catalog-structure-outcome)", role: "approach.soft", group: "catalog-panels", count: 3 },
  { selector: "#datasets .catalog-structure-flow > :is(.catalog-structure-step, .catalog-structure-operator)", role: "approach.soft", group: "catalog-flow", count: 5 },
  { selector: "#datasets .dataset-grid > .dataset-card > .dataset-image", role: "media.arrival", group: "dataset-previews", count: 38 },
  { selector: ".handoff-grid > .handoff-media", role: "media.arrival", group: "handoff-pair", count: 1 },
  { selector: ".handoff-grid > .qr-card", role: "approach.inline-end", group: "handoff-pair", count: 1 }
];
const expectedRevealRoleCounts = { "approach.soft": 11, "media.arrival": 45, "approach.inline-end": 1 };
assert(expectedRevealTargets.reduce((total, target) => total + target.count, 0) === 57, "Expected slow-reveal target inventory must total 57");
assert(JSON.stringify(Object.fromEntries(Object.keys(expectedRevealRoleCounts).map((role) => [
  role,
  expectedRevealTargets.filter((target) => target.role === role).reduce((total, target) => total + target.count, 0)
]))) === JSON.stringify(expectedRevealRoleCounts), "Expected slow-reveal role inventory is internally inconsistent");

for (const page of pageContracts) {
  const html = read(page.path);
  assert(html.includes(`<html lang="${page.language}" data-ds="landometer" data-ds-version="0.9.1" data-ds-profile="product_orientation" data-ds-format="web_public" data-delivery-mode="static-initial-html" data-evidence-status="source_limited" data-visibility="public" data-indexable="true"`), `${page.path}: public source-limited release identity/boundary drifted`);
  assert(html.includes('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />'), `${page.path}: public indexing policy drifted`);
  assert(count(html, '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />') === 1 && !html.includes('content="noindex'), `${page.path}: public robots policy must be unique and conflict-free`);
  assert(html.includes('<meta name="theme-color" content="#F6F7F3" />'), `${page.path}: initial light theme color drifted`);
  assert(html.includes('theme === "dark" ? "#11191D" : "#F6F7F3"'), `${page.path}: prepaint theme-color mapping drifted`);
  assert(html.includes('<meta name="landometer:ds-version" content="0.9.1" />'), `${page.path}: DS meta drifted`);
  assert(html.includes(`<meta name="landometer:artifact-build" content="${expected.buildId}" />`), `${page.path}: artifact build meta drifted`);
  assert(html.includes(`<meta name="landometer:release-receipt" content="${expected.releaseId}" />`), `${page.path}: release identity meta drifted`);
  assert(html.includes(`<link rel="canonical" href="${page.canonical}" />`), `${page.path}: canonical URL drifted`);
  assert(count(html, "class=\"dataset-card\"") === 38, `${page.path}: static dataset record count drifted`);
  assert(count(html, "<main id=\"main-content\">") === 1 && count(html, "<h1") === 1, `${page.path}: semantic main/H1 contract drifted`);
  const shellHeader = html.match(/<header class="lm-site-header"[\s\S]*?<\/header>/)?.[0] || "";
  const shellMenu = html.match(/<div class="lm-menu-panel"[\s\S]*?<\/div>\s*<\/div>\s*<nav class="lm-bookmark-rail"/)?.[0] || "";
  assert(count(html, "data-lm-preferences") === 2 && count(shellHeader, "data-lm-preferences") === 1 && count(shellMenu, "data-lm-preferences") === 1, `${page.path}: preference controls must appear once in the header and once in the menu`);
  assert(count(html, 'data-lm-locale="th"') === 2 && count(html, 'data-lm-locale="en"') === 2, `${page.path}: synchronized Thai/English control inventory drifted`);
  for (const theme of ["system", "light", "dark"]) assert(count(html, `data-lm-theme-choice="${theme}"`) === 2, `${page.path}: synchronized ${theme} theme choice inventory drifted`);
  assert(count(shellHeader, "lm-preference-cluster lm-desktop-only") === 1 && count(shellMenu, "lm-menu-preferences") === 1, `${page.path}: direct desktop and compact-menu preference placements drifted`);
  const fallbackLocaleHref = page.language === "th" ? 'href="./en/?lang=en" hreflang="en" lang="en"' : 'href="../?lang=th" hreflang="th" lang="th"';
  assert(count(html, fallbackLocaleHref) >= 2, `${page.path}: script-failure and no-JS locale links are missing`);
  assert(!html.includes("data-lm-reveal-role") && !html.includes("data-lm-reveal-pending") && !html.includes("data-lm-reveal-landed") && !html.includes('data-lm-approach="armed"'), `${page.path}: source HTML must remain the complete visible state before reveal enhancement`);
  for (const sectionContract of [
    /<section class="section decision-section" id="decisions"[^>]*><div class="wide-container"><div class="section-heading">/,
    /<section class="section showcase-section" id="examples"[^>]*><div class="showcase-atmosphere"><div class="wide-container"><div class="section-heading">/,
    /<section class="section explorer-section" id="datasets"[^>]*><div class="wide-container"><div class="section-heading">/
  ]) assert(sectionContract.test(html), `${page.path}: an explicitly targeted supporting section heading moved outside its reveal contract`);
  const staticRevealRoleCounts = {
    "approach.soft":
      classTokenCount(html, "section-heading")
      + classTokenCount(html, "catalog-structure-caption")
      + classTokenCount(html, "catalog-structure-citymeter")
      + classTokenCount(html, "catalog-structure-outcome")
      + classTokenCount(html, "catalog-structure-step")
      + classTokenCount(html, "catalog-structure-operator"),
    "media.arrival": classTokenCount(html, "showcase-image") + classTokenCount(html, "dataset-image") + classTokenCount(html, "handoff-media"),
    "approach.inline-end": classTokenCount(html, "qr-card")
  };
  assert(JSON.stringify(staticRevealRoleCounts) === JSON.stringify(expectedRevealRoleCounts), `${page.path}: static slow-reveal role inventory must remain 11 soft + 45 media + 1 inline-end`);
  assert(Object.values(staticRevealRoleCounts).reduce((total, value) => total + value, 0) === 57, `${page.path}: slow reveal must resolve exactly 57 targets`);
  assert(createHash("sha256").update(bodyBytes(html)).digest("hex") === expected.sourceBodyHashes[page.path], `${page.path}: exact approved candidate body drifted`);
  for (const retiredCopy of retiredUnsupportedVisibleCopy) {
    assert(!html.includes(retiredCopy), `${page.path}: restored unsupported visible copy: ${retiredCopy}`);
  }

  const inlineRegistryMatches = [...html.matchAll(/<script type="application\/json" id="citymeter-source-review-data">([\s\S]*?)<\/script>/g)];
  assert(inlineRegistryMatches.length === 1, `${page.path}: source registry must be embedded exactly once`);
  const expectedInlineRegistry = JSON.stringify(catalogReview).replaceAll("<", "\\u003c");
  assert(inlineRegistryMatches[0][1] === expectedInlineRegistry, `${page.path}: embedded source registry bytes differ from the approved registry`);
  assert(JSON.stringify(JSON.parse(inlineRegistryMatches[0][1])) === JSON.stringify(catalogReview), `${page.path}: embedded source registry data drifted`);
  assert(inlineRegistryMatches[0].index < html.indexOf("</head>"), `${page.path}: embedded source registry must be available in the document head`);

  const cardOpenings = [...html.matchAll(/<article class="dataset-card"[^>]*>/g)];
  assert(cardOpenings.length === catalogReview.records.length, `${page.path}: source registry does not cover every static card`);
  const observedCardIds = [];
  const observedClaimIds = [];
  const observedPillars = [];
  for (const [index, openingMatch] of cardOpenings.entries()) {
    const opening = openingMatch[0];
    const record = catalogReview.records[index];
    const cardEnd = html.indexOf("</article>", openingMatch.index);
    assert(cardEnd > openingMatch.index, `${page.path}: dataset card ${record.id} is not closed`);
    const card = html.slice(openingMatch.index, cardEnd + "</article>".length);
    const id = attribute(opening, "id");
    const status = attribute(opening, "data-source-status");
    const claimId = attribute(opening, "data-claim-id");
    const sourceReviewVersion = attribute(opening, "data-source-review-version");
    const pillar = attribute(opening, "data-pillar");
    observedCardIds.push(id);
    observedClaimIds.push(claimId);
    observedPillars.push(pillar);
    assert(id === record.id && attribute(opening, "data-citymeter-record-id") === record.id && attribute(opening, "data-module-slug") === record.id, `${page.path}: card identity drifted for ${record.id}`);
    assert(status === record.status, `${page.path}: source status drifted for ${record.id}`);
    assert(claimId === `claim.citymeter.catalog.${record.id}.v1`, `${page.path}: claim ID drifted for ${record.id}`);
    assert(sourceReviewVersion === "2026-09-04-r5", `${page.path}: source-review version drifted for ${record.id}`);
    assert(count(card, 'class="source-review source-review-static"') === 1, `${page.path}: ${record.id} must contain one static source review`);
    assert(count(card, 'class="source-summary-copy"') === 1, `${page.path}: ${record.id} must contain one localized source summary`);
    assert(card.includes(`class="source-status source-status-${record.status}"`), `${page.path}: ${record.id} is missing its visible source-status class`);
    assert(card.includes(escapeHtml(sourceStatusLabels[page.language][record.status])), `${page.path}: ${record.id} is missing its localized visible source-status label`);
    assert(card.includes(escapeHtml(record[page.language === "th" ? "readingTh" : "readingEn"])), `${page.path}: ${record.id} is missing its localized decision-use limitation`);
  }
  assert(new Set(observedCardIds).size === 38 && new Set(observedClaimIds).size === 38, `${page.path}: card and claim IDs must each be unique`);
  assert(count(html, 'data-source-review-version="2026-09-04-r5"') === 38 && count(html, 'class="source-review source-review-static"') === 38 && count(html, 'class="source-summary-copy"') === 38, `${page.path}: r5 source-review structure must cover all 38 cards exactly once`);
  const observedPillarCounts = Object.fromEntries(["land", "location", "living"].map((pillar) => [pillar, observedPillars.filter((candidate) => candidate === pillar).length]));
  assert(JSON.stringify(observedPillarCounts) === JSON.stringify({ land: 12, location: 13, living: 13 }), `${page.path}: Land/Location/Living card distribution drifted`);

  const catalogDiagramMatches = html.match(/<figure class="catalog-structure"[\s\S]*?<\/figure>/g) || [];
  assert(catalogDiagramMatches.length === 1, `${page.path}: peer architecture must appear exactly once`);
  const catalogDiagram = catalogDiagramMatches[0];
  const architectureFlow = catalogDiagram.match(/<div class="catalog-structure-flow" role="list">[\s\S]*?<\/div><\/div>/)?.[0] || "";
  const architectureGroups = [...architectureFlow.matchAll(/data-group="(land|location|living)"/g)].map((match) => match[1]);
  assert(JSON.stringify(architectureGroups) === JSON.stringify(["land", "location", "living"]), `${page.path}: architecture must present Land, Location, and Living as peers in that order`);
  assert(count(architectureFlow, '<span class="catalog-structure-operator" aria-hidden="true">+</span>') === 2 && !architectureFlow.includes(">→</span>"), `${page.path}: peer architecture must use exactly two plus operators`);
  assert(catalogDiagram.includes('<span class="catalog-structure-outcome-route"><strong lang="en">CityMETER</strong><span aria-hidden="true">→</span><b lang="en">Local Decisions</b></span>'), `${page.path}: CityMETER must lead to Local Decisions after the peer dimensions`);
  const architectureCopy = page.language === "th"
    ? ["เข้าใจเมืองผ่าน 3 มิติ แล้วไปสู่การตัดสินใจ", "Land, Location และ Living เป็นบริบทคนละมิติ", "เชื่อม 38 มุมมองให้ค้น เทียบ และเห็นทั้งสิ่งที่รู้กับสิ่งที่ยังต้องตรวจ", "เปลี่ยนบริบทเชิงพื้นที่ให้เป็นสิ่งที่ควรตรวจ เทียบ และทำต่อ"]
    : ["Three dimensions of a place, connected to a decision", "Land, Location and Living are peer dimensions", "Connects 38 views so people can find, compare and see both what is known and what still needs checking.", "Turns spatial context into what to check, compare and do next."];
  for (const copy of architectureCopy) assert(catalogDiagram.includes(copy), `${page.path}: peer architecture copy is missing: ${copy}`);

  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(jsonLdMatches.length === 1, `${page.path}: must expose exactly one JSON-LD graph`);
  const jsonLd = JSON.parse(jsonLdMatches[0][1]);
  const catalogs = (jsonLd["@graph"] || []).filter((entry) => entry["@type"] === "DataCatalog");
  assert(catalogs.length === 1, `${page.path}: JSON-LD must expose exactly one DataCatalog`);
  const catalog = catalogs[0];
  assert(!Object.hasOwn(catalog, "numberOfItems"), `${page.path}: DataCatalog must not use the ItemList-only numberOfItems property`);
  assert(catalog.dataset?.length === 36 && catalog.hasPart?.length === 2, `${page.path}: JSON-LD must contain 38 items as 36 Dataset + 2 hasPart`);
  assert(catalog.dataset.every((entry) => entry["@type"] === "Dataset"), `${page.path}: JSON-LD dataset branch contains a non-Dataset record`);
  assert(catalog.hasPart.every((entry) => entry["@type"] === "CreativeWork"), `${page.path}: JSON-LD hasPart branch contains a non-CreativeWork record`);
  const structuredRecords = [...catalog.dataset, ...catalog.hasPart];
  const structuredIds = structuredRecords.map((entry) => entry["@id"]?.split("#").at(-1));
  assert(structuredRecords.length === 38 && new Set(structuredIds).size === 38, `${page.path}: JSON-LD records must be unique`);
  assert(JSON.stringify(structuredIds) === JSON.stringify(catalogReview.records.map((record) => record.id)), `${page.path}: JSON-LD record order/coverage differs from the approved registry`);
  assert(JSON.stringify(catalog.hasPart.map((entry) => entry["@id"].split("#").at(-1))) === JSON.stringify(["dataset-events-hat-yai-flood-2025-11", "dataset-events-quake-building-inspection"]), `${page.path}: JSON-LD hasPart membership drifted`);
  const catalogRecordById = new Map(catalogReview.records.map((record) => [record.id, record]));
  for (const [index, entry] of structuredRecords.entries()) {
    assert(structuredIds[index] === observedCardIds[index], `${page.path}: JSON-LD/card identity parity drifted at item ${index + 1}`);
    assert(entry.subjectOf?.url === catalogRecordById.get(structuredIds[index])?.citymeterUrl, `${page.path}: JSON-LD route drifted for ${structuredIds[index]}`);
  }

  const links = [
    `${page.prefix}${expected.productionCss.path}`,
    `${page.prefix}assets/catalog-enhancements-ds-0.9.1-v30.css`,
    `${page.prefix}assets/unified-navbar-r7-ds-0.9.1-v34.css`
  ];
  for (const link of links) assert(count(html, link) === 1, `${page.path}: expected one active stylesheet ${link}`);
  assert(html.indexOf(links[0]) < html.indexOf(links[1]) && html.indexOf(links[1]) < html.indexOf(links[2]), `${page.path}: DS/surface/navbar stylesheet order drifted`);

  const scripts = [
    `${page.prefix}assets/unified-navbar-r7-v32.js`,
    `${page.prefix}assets/catalog-enhancements-ds-0.9.1-v26.js`,
    `${page.prefix}assets/citymeter-ds-0.9.1-approach-reveal-v1.js`
  ];
  for (const script of scripts) assert(count(html, script) === 1, `${page.path}: expected one active script ${script}`);
  assert(html.indexOf(scripts[0]) < html.indexOf(scripts[1]) && html.indexOf(scripts[1]) < html.indexOf(scripts[2]), `${page.path}: navbar/enhancer/reveal script order drifted`);
  assert(count(html, `${page.prefix}assets/index-qbT50gkr-v18.js`) === 1, `${page.path}: DS 0.9.1 bundle is not uniquely active`);

  for (const retiredMotifRef of [
    "assets/landometer-motifs/",
    "citymeter-ds-0.9.1-motif-placement",
    "<lm-motif",
    "data-lm-motif",
    "data-lm-placement",
    "catalog-motif",
    "citymeter-motif"
  ]) assert(!html.includes(retiredMotifRef), `${page.path}: active motif reference remains: ${retiredMotifRef}`);

  for (const retired of [
    "catalog-enhancements-ds-0.9.1-v28.css",
    "catalog-enhancements-ds-0.9.1-v29.css",
    "catalog-enhancements-v25.css",
    "catalog-enhancements-v25.js",
    "unified-navbar-r7-v30.css",
    "index-qbT50gkr-v17.js"
  ]) assert(!html.includes(retired), `${page.path}: retired active asset remains linked: ${retired}`);

  for (const provenanceFile of ["color-srgb-05.light.provenance.css", "color-srgb-05.dark.provenance.css", "color-srgb-05.provenance.css", "color-srgb-05.raw.css"]) {
    assert(!html.includes(provenanceFile), `${page.path}: raw color provenance must not be audience-delivered`);
  }

  const footerMatches = html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/g) || [];
  assert(footerMatches.length === 1, `${page.path}: must expose exactly one footer`);
  const footer = footerMatches[0];
  const attribution = page.language === "th" ? "ได้รับการส่งเสริมและสนับสนุนโดย depa" : "Promoted and supported by depa";
  assert(count(footer, `class="supporter-evidence-line">${attribution}</p>`) === 1, `${page.path}: footer must expose one localized visible depa attribution`);
  assert(count(footer, 'class="supporter-logos supporter-logos-footer"') === 1, `${page.path}: footer must expose one supporter-mark group`);
  assert((footer.match(/class="supporter-logo-cell supporter-logo-cell-(?:depa|dsure|account)"/g) || []).length === 3, `${page.path}: footer must expose exactly three supporter-mark cells`);
  for (const mark of expected.supporterMarks) {
    const alt = page.language === "th" ? mark.altTh : mark.altEn;
    const image = `<img class="supporter-logo supporter-logo-${mark.key}" src="${page.prefix}${mark.path}" alt="${alt}" width="${mark.width}" height="${mark.height}" loading="lazy" decoding="async"/>`;
    assert(count(footer, image) === 1 && count(html, `${page.prefix}${mark.path}`) === 1, `${page.path}: footer must render the exact ${mark.key} mark once`);
  }
  assert(!html.includes("media/depa-dsure-tdc-lockup.png"), `${page.path}: retired combined supporter lockup must remain absent`);
  assert(!html.includes("supporter-logos-hero") && !html.includes("supporter-lockup-hero"), `${page.path}: supporter marks must not be duplicated in the hero`);
}

const surfaceCss = read("assets/catalog-enhancements-ds-0.9.1-v30.css");
const revealRuntime = read("assets/citymeter-ds-0.9.1-approach-reveal-v1.js");
const compiledBaseCss = read("assets/index-cqxdfePB.css");
const navbarCss = read("assets/unified-navbar-r7-ds-0.9.1-v34.css");
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

const activeFilterRule = surfaceCss.match(/\.group-filters button\.is-active\s*\{([^}]+)\}/i)?.[1] || "";
const permittedActiveControlInset = "box-shadow: inset 0 -2px 0 var(--text);";
assert(activeFilterRule.includes("border-color: var(--border);") && activeFilterRule.includes(permittedActiveControlInset), "Active filters must use the one exact neutral text-colored state underline");
assert(count(surfaceCss, permittedActiveControlInset) === 1, "The neutral active-control inset must occur exactly once");
const decorativeEdgeAuditCss = surfaceCss.replace(permittedActiveControlInset, "");
for (const bannedPattern of [
  /border-block-start\s*:/i,
  /border-inline-start\s*:/i,
  /border-(?:top|left|right|bottom)\s*:\s*[2-9]\d*px/i,
  /(?:3|5)px\s+solid/i,
  /box-shadow\s*:\s*inset/i
]) assert(!bannedPattern.test(decorativeEdgeAuditCss), `Decorative colored-edge pattern remains: ${bannedPattern}`);
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

for (const retiredMotifToken of [
  "lm-motif",
  "catalog-motif",
  "data-lm-motif",
  "data-lm-placement",
  "data-lm-armed",
  "data-lm-play",
  "citymeter-motif-ambient"
]) assert(!surfaceCss.includes(retiredMotifToken), `Active surface stylesheet retains motif-only behavior: ${retiredMotifToken}`);
const mediaClipRule = surfaceCss.match(/\.dataset-card\s*>\s*\.dataset-image\s*\{([^}]+)\}/i)?.[1] || "";
for (const contract of [
  "overflow: hidden",
  "border-radius: 15px 15px 0 0",
  "clip-path: inset(0 round 15px 15px 0 0)",
  "contain: paint"
]) assert(mediaClipRule.includes(contract), `Dataset snapshot hover clip contract is missing: ${contract}`);

const observedRevealDefinitions = [...revealRuntime.matchAll(/\{\s*selector: "([^"]+)",\s*role: "([^"]+)",\s*group: "([^"]+)"/g)]
  .map((match) => ({ selector: match[1], role: match[2], group: match[3] }));
assert(JSON.stringify(observedRevealDefinitions) === JSON.stringify(expectedRevealTargets.map(({ selector, role, group }) => ({ selector, role, group }))), "Slow-reveal runtime selector/role/group registry drifted");
for (const selector of observedRevealDefinitions.map((definition) => definition.selector)) {
  assert(selector !== ".section-heading" && selector !== ".showcase-card" && selector !== ".dataset-card" && selector !== ".dataset-image", `Slow reveal must not use a broad every-item selector: ${selector}`);
  for (const protectedFragment of [
    ".site-header",
    ".primary-nav",
    ".hero",
    ".hero-media",
    ".hero-proof",
    ".intent-proof",
    ".explorer-toolbar",
    ".results-meta",
    ".dataset-body",
    ".dataset-card-actions",
    ".dataset-open",
    ".dataset-details",
    ".handoff-copy",
    ".contact-section",
    ".contact-actions",
    ".site-footer",
    ".footer-grid",
    ".button",
    "h1",
    "[aria-live",
    ":target",
    ":focus"
  ]) assert(!selector.includes(protectedFragment), `Slow reveal directly targets protected content (${protectedFragment}): ${selector}`);
}

for (const runtimeContract of [
  "var STAGGER_STEP_MS = 150;",
  "var STAGGER_CAP_INDEX = 3;",
  "var INITIALIZATION_WATCHDOG_MS = 2400;",
  "var EFFECTIVE_VIEWPORT_RATIO = 0.88;",
  "threshold: 0.14,",
  'rootMargin: "0px 0px -12% 0px"',
  "Math.min(index, STAGGER_CAP_INDEX) * STAGGER_STEP_MS",
  "Math.min(definition.delayIndex || 0, STAGGER_CAP_INDEX) * STAGGER_STEP_MS",
  "if (!node || node.hasAttribute(LANDED_ATTRIBUTE)) return;",
  "if (!observer || !observedNodes.has(node)) return;",
  "observedNodes.delete(node);",
  "observer.unobserve(node);",
  "if (entry.isIntersecting) land(entry.target);",
  'return definition.group + ":" + definition.role + ":" + index;',
  'if (recordId) return definition.group + ":" + recordId;',
  'var initializationTimedOut = false;',
  '!initializationTimedOut &&',
  'initializationTimedOut = true;',
  'mutationObserver.observe(catalogRoot, { childList: true, subtree: true });',
  'mutationObserver.disconnect();',
  'window.addEventListener("scroll", scheduleReachedAudit, { passive: true });',
  'window.addEventListener("resize", scheduleReachedAudit, { passive: true });',
  'window.addEventListener("hashchange", settleForDeepLink);',
  'window.addEventListener("popstate", landAll);',
  'window.addEventListener("beforeprint", landAll);',
  'document.addEventListener("focusin", settleForFocus, true);',
  'document.addEventListener("visibilitychange", function () {',
  'reducedMotion.addEventListener("change", function (event) {',
  'typeof window.performance.getEntriesByType === "function"',
  'window.performance.getEntriesByType("navigation")[0]',
  'navigationEntry.type === "back_forward"',
  "if (event.persisted) {",
  "scheduleReachedAudit();"
]) assert(revealRuntime.includes(runtimeContract), `Slow-reveal runtime contract is missing: ${runtimeContract}`);
assert(count(revealRuntime, "new window.IntersectionObserver(") === 1, "Slow reveal must instantiate exactly one shared IntersectionObserver");
assert(count(revealRuntime, "new window.MutationObserver(") === 1, "Slow reveal must use exactly one catalogue refresh observer");
assert(count(revealRuntime, "window.requestAnimationFrame(function () {") === 2, "Reached-content fail-open audit must wait exactly two animation frames");
assert(/window\.setTimeout\(function \(\) \{\s*if \(!initialized\) \{\s*initializationTimedOut = true;\s*landAll\(\);\s*return;\s*\}\s*scheduleReachedAudit\(\);\s*\}, INITIALIZATION_WATCHDOG_MS\);/.test(revealRuntime), "Slow reveal must latch fail-open on its 2400ms initialization watchdog and then audit reached content");
assert(/window\.addEventListener\("pageshow", function \(event\) \{\s*if \(event\.persisted\) \{\s*landAll\(\);\s*\} else \{\s*scheduleReachedAudit\(\);\s*\}\s*\}\);/.test(revealRuntime), "Slow reveal must settle BFCache restoration and run the two-frame audit on normal pageshow");
assert(revealRuntime.indexOf("node.setAttribute(PENDING_ATTRIBUTE") < revealRuntime.indexOf("root.setAttribute(ROOT_ATTRIBUTE, ROOT_ARMED)"), "Slow reveal must identify only off-screen pending nodes before arming the root");
assert(revealRuntime.includes('!window.location.hash') && revealRuntime.includes('!historyRestoration') && revealRuntime.includes('document.visibilityState === "visible"') && revealRuntime.includes('!(reducedMotion && reducedMotion.matches)') && revealRuntime.includes('typeof window.IntersectionObserver === "function"'), "Slow reveal must be gated by deep-link, history-restoration, visibility, reduced-motion, and observer capability checks");
const datasetRevealDefinition = revealRuntime.match(/selector: "#datasets \.dataset-grid > \.dataset-card > \.dataset-image",\s*role: "media\.arrival",\s*group: "dataset-previews",\s*stagger: (true|false)/)?.[1];
assert(datasetRevealDefinition === "false", "The 38-item catalogue must use individual media arrival without a long stagger queue");
for (const prohibitedRuntimePattern of [
  /\bsetInterval\s*\(/,
  /\binnerHTML\b/,
  /\binsertAdjacentHTML\b/,
  /\bdocument\.createElement\b/,
  /\binfinite\b/i,
  /lm-motif|catalog-motif|data-lm-motif|data-lm-placement|citymeter-motif/i
]) assert(!prohibitedRuntimePattern.test(revealRuntime), `Slow-reveal adapter contains prohibited rendering or motif behavior: ${prohibitedRuntimePattern}`);

const revealCssMarker = "/* CityMETER owner-directed perceivable reveal — based on DS 0.9.1";
assert(count(surfaceCss, revealCssMarker) === 1, "DS-based surface CSS must contain exactly one owner-directed perceivable-reveal layer");
const revealCss = surfaceCss.slice(surfaceCss.indexOf(revealCssMarker));
for (const cssContract of [
  'html[data-lm-approach="armed"] [data-lm-reveal-role]',
  "opacity 1200ms cubic-bezier(.16, 1, .3, 1)",
  "transform 1450ms cubic-bezier(.2, .9, .25, 1.08)",
  "transition-delay: var(--lm-approach-delay, 0ms)",
  'data-lm-reveal-role="approach.soft"',
  "transform: translateY(32px) scale(.985)",
  'data-lm-reveal-role="approach.inline-start"',
  "transform: translateX(-36px)",
  'data-lm-reveal-role="approach.inline-end"',
  "transform: translateX(36px)",
  'data-lm-reveal-role="media.arrival"',
  "transition-duration: 1350ms, 1350ms",
  "@media print, (prefers-reduced-motion: reduce)",
  "opacity: 1 !important",
  "transform: none !important",
  "transition: none !important"
]) assert(revealCss.includes(cssContract), `Slow-reveal CSS contract is missing: ${cssContract}`);
assert(!/^\s*(?:display|position|inset|top|right|bottom|left|width|height|min-width|min-height|max-width|max-height|margin|padding|border|grid|flex|overflow|clip-path)\s*:/im.test(revealCss), "Slow reveal must animate without changing layout geometry or clipping");
assert(!/@keyframes|\banimation\s*:|\binfinite\b/i.test(revealCss), "Slow reveal must remain once-only observer motion, not a looping CSS animation");

assert(!/#[0-9a-f]{3,8}\b/i.test(navbarCss) && !/rgba?\(/i.test(navbarCss), "Navbar authored colors must resolve only through DS tokens");
for (const contract of [
  "--lm-surface-canvas: var(--ldm-foundation-surface-canvas-light)",
  "--lm-surface-canvas: var(--ldm-foundation-surface-canvas-dark)",
  "--lm-interaction-focus-ring: var(--ldm-foundation-interaction-focus-ring-light)",
  "--lm-interaction-focus-ring: var(--ldm-foundation-interaction-focus-ring-dark)",
  "--lm-motion-duration-state: 200ms",
  "--lm-motion-duration-feedback: 120ms",
  "--lm-nav-calm-height: 60px",
  "--lm-nav-calm-height: 56px",
  "min-height: 44px",
  "min-width: 44px",
  "outline: 3px solid var(--lm-interaction-focus-ring)"
]) assert(navbarCss.includes(contract), `Navbar DS/accessibility contract is missing: ${contract}`);
const calmNavbarRowRule = navbarCss.match(/\.lm-site-header\.is-calm \.lm-nav-row\s*\{([^}]+)\}/)?.[1] || "";
assert(calmNavbarRowRule.includes("width: 100%") && calmNavbarRowRule.includes("transform: scale(1)") && calmNavbarRowRule.includes("opacity: .9"), "Calm navbar must preserve its unscaled interactive row");
assert(!calmNavbarRowRule.includes("scale(.5)") && !calmNavbarRowRule.includes("width: 200%"), "Calm navbar must not shrink 44px controls below their physical target size");
for (const preferenceContract of [
  ".lm-site-header [data-lm-preferences]",
  ".lm-menu-panel [data-lm-preferences]",
  ".lm-preference-row",
  ".lm-segmented-control",
  "[data-lm-locale]",
  "[data-lm-theme-choice]",
  "min-width: 44px",
  "min-height: 44px",
  "html.lm-preferences-ready [data-lm-theme-choice]",
  ".lm-site-header [data-lm-preferences] {\n    display: none !important;"
]) assert(navbarCss.includes(preferenceContract), `Navbar preference-control CSS contract is missing: ${preferenceContract}`);
const navbarRuntime = read("assets/unified-navbar-r7-v32.js");
for (const preferenceRuntimeContract of [
  'var themeStorageKeys = ["lds-theme", "citymeter-theme"]',
  'window.matchMedia("(prefers-color-scheme: dark)")',
  'url.searchParams.set("lang", target)',
  'document.querySelectorAll("[data-lm-locale]")',
  'document.querySelectorAll("[data-lm-theme-choice]")',
  'control.setAttribute("aria-pressed", String(selected))',
  'window.addEventListener("storage"',
  'root.classList.add("lm-preferences-ready")'
]) assert(navbarRuntime.includes(preferenceRuntimeContract), `Navbar preference-control runtime contract is missing: ${preferenceRuntimeContract}`);
assert(navbarCss.includes(".lm-nav-cta__sweep") && /\.lm-nav-cta__sweep\s*\{[\s\S]*?display:\s*none;[\s\S]*?\}/.test(navbarCss), "Retired navbar sweep must remain absent from every motion mode");
assert(!/\binfinite\b/i.test(navbarCss) && !navbarCss.includes("@keyframes lmNavSweep") && !navbarCss.includes("@keyframes lmNavFlick"), "DS 0.9.1 forbids the historical unbounded CTA sweep/flicker");

console.log("CityMETER DS 0.9.1 v6 public-release gate passed: pinned release bytes, restored Thai/English and system/light/dark controls with 44px targets preserved in normal and calm header states, 57 semantic once-only reveal targets per locale with an explicit owner-directed 1200/1450/1350ms timing divergence and preserved fail-open contracts, no active motif references, clipped snapshot hover media, embedded 38-record r5 source/status/claim hydration parity in TH/EN, peer Land + Location + Living architecture, 36 Dataset + 2 hasPart JSON-LD, exact footer supporter marks with no hero duplication, and a public source_limited/indexable boundary. Exact MOTION-03, artifact_qa_passed, and production_verified claims remain intentionally unclaimed.");
