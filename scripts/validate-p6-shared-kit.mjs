import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CONSUMER_REPOSITORY = "citymeter-repo";
const KIT_DIRECTORY = "assets/shared-kit/v0.9.0";
const REQUIRED_GATES = [
  "upstream_skeleton_color_set_defect",
  "upstream_material_symbols_package_missing",
  "browser_visual_and_manual_qa",
  "product_artifact_receipts"
];
const EXPECTED_SOURCE = {
  repository: "landometer-root-repo",
  repositoryHead: "d82ac775ab9d35a84cfb0dc77bc0ae804a7a0665",
  packageManifestPath: "deployment/machine/v0.9.0/package.json",
  packageManifestBytes: 12381,
  packageManifestSha256: "0b4b8bfd9abcf403cfebdc8fe9b3299a821eb6e2e96d0d5c9495f1627f206e47",
  buildKitRoot: "deployment/machine/v0.9.0/build-kit",
  dsVersion: "0.9.0",
  authoringRevision: "v0.9.0-r7",
  packageRevision: "v0.9.0-mp1",
  kitVersion: "lds-kit-0.9.0-r4",
  colorSetId: "color-srgb-05",
  tokenSchemaVersion: 6,
  manifestVersion: "2.1",
  referenceArtifactBuildId: "ui-20260821-05"
};
const EXPECTED_TOKEN_REGISTRY = {
  path: "deployment/machine/v0.9.0/tokens.json",
  bytes: 10749,
  sha256: "5afa9a93bafa8f2e5edb7e929d4924bc548a415098377ad53e18097c56980287"
};
const EXPECTED_FILES = [
  {
    role: "authoritative_tokens_css",
    path: "lds-tokens.css",
    sourcePath: "deployment/machine/v0.9.0/build-kit/lds-tokens.css",
    packagePath: "build-kit/lds-tokens.css",
    bytes: 11392,
    sha256: "aa834b08c6ecd00704a0c3580da83d291237738815a8e2e408aba12bb9551323"
  },
  {
    role: "authoritative_base_css",
    path: "lds-base.css",
    sourcePath: "deployment/machine/v0.9.0/build-kit/lds-base.css",
    packagePath: "build-kit/lds-base.css",
    bytes: 10718,
    sha256: "47eb23f0b2a06bd6882080bcc693384f5d59791b434045e7281b98fa2831903c"
  }
];

function fail(message) {
  throw new Error(`P6 shared-kit validation failed: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${label} is not readable JSON (${error.message})`);
  }
}

function verifyBytes(path, receipt, label) {
  const bytes = readFileSync(path);
  assert(bytes.byteLength === receipt.bytes, `${label} byte count is ${bytes.byteLength}, expected ${receipt.bytes}`);
  assert(sha256(bytes) === receipt.sha256, `${label} SHA-256 does not match ${receipt.sha256}`);
  return bytes;
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const kitRoot = resolve(repositoryRoot, KIT_DIRECTORY);
const sourceArgument = process.argv.slice(2).find((argument) => argument.startsWith("--source-repo="));
assert(process.argv.slice(2).every((argument) => argument.startsWith("--source-repo=")), "only --source-repo=<path> is supported");
const sourceRepository = sourceArgument
  ? resolve(sourceArgument.slice("--source-repo=".length))
  : resolve(repositoryRoot, "../landometer-root-repo");

const manifestPath = resolve(kitRoot, "shared-kit.manifest.json");
const manifest = readJson(manifestPath, "shared-kit manifest");
assert(manifest.schemaVersion === "1.0.0-p6-candidate", "schemaVersion drifted");
assert(manifest.candidateId === "p6-shared-kit-foundation-2026-08-25", "candidateId drifted");
assert(manifest.consumerRepository === CONSUMER_REPOSITORY, "consumerRepository drifted");
assert(manifest.activationStatus === "gated", "activationStatus must remain gated");
assert(manifest.runtimeActivated === false, "runtimeActivated must remain false");

for (const [key, expected] of Object.entries(EXPECTED_SOURCE)) {
  assert(manifest.source?.[key] === expected, `source.${key} drifted`);
}
for (const [key, expected] of Object.entries(EXPECTED_TOKEN_REGISTRY)) {
  assert(manifest.source?.tokenRegistry?.[key] === expected, `source.tokenRegistry.${key} drifted`);
}

assert(Array.isArray(manifest.openGates), "openGates must be an array");
assert(new Set(manifest.openGates).size === REQUIRED_GATES.length, "openGates contains duplicates or an unexpected count");
assert(REQUIRED_GATES.every((gate) => manifest.openGates.includes(gate)), "one or more required open gates are missing");
assert(Array.isArray(manifest.vendoredFiles) && manifest.vendoredFiles.length === EXPECTED_FILES.length, "vendoredFiles must contain exactly two CSS files");
assert(!existsSync(resolve(kitRoot, "skeleton.html")), "skeleton.html must not be vendored");

const vendoredBytes = new Map();
for (const expected of EXPECTED_FILES) {
  const receipt = manifest.vendoredFiles.find((entry) => entry.path === expected.path);
  assert(receipt, `${expected.path} is missing from vendoredFiles`);
  for (const key of ["role", "sourcePath", "bytes", "sha256"]) {
    assert(receipt[key] === expected[key], `${expected.path} ${key} drifted`);
  }
  vendoredBytes.set(expected.path, verifyBytes(resolve(kitRoot, expected.path), expected, `vendored ${expected.path}`));
}

assert(existsSync(sourceRepository), `authoritative source repository is missing at ${sourceRepository}`);
const sourceHead = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: sourceRepository,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
}).trim();
assert(sourceHead === EXPECTED_SOURCE.repositoryHead, `authoritative source HEAD is ${sourceHead}, expected ${EXPECTED_SOURCE.repositoryHead}`);

const sourcePackagePath = resolve(sourceRepository, EXPECTED_SOURCE.packageManifestPath);
verifyBytes(sourcePackagePath, {
  bytes: EXPECTED_SOURCE.packageManifestBytes,
  sha256: EXPECTED_SOURCE.packageManifestSha256
}, "authoritative package manifest");
const sourcePackage = readJson(sourcePackagePath, "authoritative package manifest");
const packageIdentity = {
  dsVersion: "dsVersion",
  packageRevision: "packageRevision",
  authoringRevision: "generatedAtAuthoringRevision",
  kitVersion: "kitVersion",
  colorSetId: "colorSetId",
  tokenSchemaVersion: "tokenSchemaVersion",
  manifestVersion: "manifestVersion",
  referenceArtifactBuildId: "artifactBuildId"
};
for (const [manifestKey, packageKey] of Object.entries(packageIdentity)) {
  assert(sourcePackage[packageKey] === EXPECTED_SOURCE[manifestKey], `source package ${packageKey} drifted`);
}

const tokenBytes = verifyBytes(resolve(sourceRepository, EXPECTED_TOKEN_REGISTRY.path), EXPECTED_TOKEN_REGISTRY, "authoritative token registry");
assert(tokenBytes.byteLength > 0, "authoritative token registry is empty");
const tokenPackageReceipt = sourcePackage.files?.find((entry) => entry.path === "tokens.json");
assert(tokenPackageReceipt?.bytes === EXPECTED_TOKEN_REGISTRY.bytes, "package token registry byte receipt drifted");
assert(tokenPackageReceipt?.sha256 === EXPECTED_TOKEN_REGISTRY.sha256, "package token registry hash receipt drifted");

for (const expected of EXPECTED_FILES) {
  const sourceBytes = verifyBytes(resolve(sourceRepository, expected.sourcePath), expected, `authoritative ${expected.path}`);
  assert(sourceBytes.equals(vendoredBytes.get(expected.path)), `${expected.path} is not byte-identical to the authoritative source`);
  const packageReceipt = sourcePackage.files?.find((entry) => entry.path === expected.packagePath);
  assert(packageReceipt?.bytes === expected.bytes, `${expected.path} package byte receipt drifted`);
  assert(packageReceipt?.sha256 === expected.sha256, `${expected.path} package hash receipt drifted`);
}

console.log(
  `P6 shared-kit candidate validated for ${CONSUMER_REPOSITORY}: ` +
  `${EXPECTED_FILES.length} byte-identical files, DS ${EXPECTED_SOURCE.dsVersion}, ` +
  `${EXPECTED_SOURCE.kitVersion}, activation gated with ${REQUIRED_GATES.length} open gates.`
);
