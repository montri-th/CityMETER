import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
const manifestPath = join(root, "media/qr/manifest.json");
const args = process.argv.slice(2);
let onlyId = null;

if (args.length === 2 && args[0] === "--only" && args[1].length > 0 && !args[1].startsWith("--")) {
  onlyId = args[1];
} else if (args.length !== 0) {
  throw new Error("Supported arguments: --only <dataset-id>");
}
const hrefById = new Map();
const cardPattern = /<article class="dataset-card" id="([^"]+)"[^>]*>[\s\S]*?<a class="dataset-open" href="([^"]+)"/g;

for (const match of html.matchAll(cardPattern)) {
  hrefById.set(match[1], match[2].replaceAll("&amp;", "&"));
}

if (hrefById.size !== 38 || review.records.length !== 38) {
  throw new Error(`Expected 38 cards and reviews; found ${hrefById.size} cards and ${review.records.length} reviews.`);
}

const outputDir = join(root, "media/qr");
mkdirSync(outputDir, { recursive: true });
const existingManifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { datasets: [], pages: [] };
const manifestDatasetById = new Map(existingManifest.datasets.map((entry) => [entry.id, entry]));
const selectedRecords = onlyId !== null
  ? review.records.filter((record) => record.id === onlyId)
  : review.records;

if (onlyId !== null && selectedRecords.length !== 1) {
  throw new Error(`Unknown dataset id for --only: ${onlyId}`);
}

for (const record of selectedRecords) {
  const href = record.citymeterUrl;
  const htmlHref = hrefById.get(record.id);
  if (!href) throw new Error(`No canonical CityMETER URL found for ${record.id}`);
  if (htmlHref !== href) throw new Error(`HTML and registry routes differ for ${record.id}: ${htmlHref} !== ${href}`);

  const output = join(outputDir, `${record.id.replace(/^dataset-/, "")}.png`);
  const isLandAppraisal = record.id === "dataset-land-appraisal";
  const result = spawnSync(
    "npm",
    [
      "--cache", "/tmp/citymeter-qr-npm-cache",
      "--prefer-offline",
      "exec", "--yes", "qrcode@1.5.4", "--",
      "--error", isLandAppraisal ? "Q" : "M",
      "--width", isLandAppraisal ? "512" : "256",
      "--qzone", "4",
      "--darkcolor", "182327ff",
      "--lightcolor", "fcfcfaff",
      "--output", output,
      href
    ],
    { cwd: root, encoding: "utf8" }
  );

  if (result.status !== 0) {
    throw new Error(`QR generation failed for ${record.id}: ${result.stderr || result.stdout}`);
  }
  manifestDatasetById.set(record.id, {
    id: record.id,
    url: href,
    file: `media/qr/${record.id.replace(/^dataset-/, "")}.png`,
    sha256: createHash("sha256").update(readFileSync(output)).digest("hex")
  });
}

const manifestDatasets = review.records.map((record) => manifestDatasetById.get(record.id));
if (manifestDatasets.some((entry) => !entry)) {
  throw new Error("Partial QR generation requires a complete existing manifest");
}

const manifestPages = onlyId !== null ? existingManifest.pages : [];
if (onlyId === null) {
  for (const [language, href] of [
    ["th", "https://montri-th.github.io/CityMETER/"],
    ["en", "https://montri-th.github.io/CityMETER/en/"]
  ]) {
    const output = join(outputDir, `citymeter-page-${language}.png`);
    const result = spawnSync(
      "npm",
      [
        "--cache", "/tmp/citymeter-qr-npm-cache",
        "--prefer-offline",
        "exec", "--yes", "qrcode@1.5.4", "--",
        "--error", "M",
        "--width", "512",
        "--qzone", "4",
        "--darkcolor", "182327ff",
        "--lightcolor", "fcfcfaff",
        "--output", output,
        href
      ],
      { cwd: root, encoding: "utf8" }
    );

    if (result.status !== 0) {
      throw new Error(`Page QR generation failed for ${language}: ${result.stderr || result.stdout}`);
    }
    manifestPages.push({
      language,
      url: href,
      file: `media/qr/citymeter-page-${language}.png`,
      sha256: createHash("sha256").update(readFileSync(output)).digest("hex")
    });
  }
}

writeFileSync(
  manifestPath,
  `${JSON.stringify({ version: "2026-08-16", datasets: manifestDatasets, pages: manifestPages }, null, 2)}\n`
);

console.log(
  onlyId !== null
    ? `Generated one QR asset (${onlyId}) and updated its SHA-256 manifest entry in ${outputDir}`
    : `Generated ${review.records.length} dataset QR assets, two page QR assets and their SHA-256 manifest in ${outputDir}`
);
