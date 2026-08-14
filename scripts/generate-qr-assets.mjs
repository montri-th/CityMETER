import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
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
const manifestDatasets = [];

for (const record of review.records) {
  const href = record.citymeterUrl;
  const htmlHref = hrefById.get(record.id);
  if (!href) throw new Error(`No canonical CityMETER URL found for ${record.id}`);
  if (htmlHref !== href) throw new Error(`HTML and registry routes differ for ${record.id}: ${htmlHref} !== ${href}`);

  const output = join(outputDir, `${record.id.replace(/^dataset-/, "")}.png`);
  const result = spawnSync(
    "npm",
    [
      "--cache", "/tmp/citymeter-qr-npm-cache",
      "exec", "--yes", "qrcode", "--",
      "--error", "M",
      "--width", "256",
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
  manifestDatasets.push({
    id: record.id,
    url: href,
    file: `media/qr/${record.id.replace(/^dataset-/, "")}.png`,
    sha256: createHash("sha256").update(readFileSync(output)).digest("hex")
  });
}

const manifestPages = [];
for (const [language, href] of [
  ["th", "https://montri-th.github.io/CityMETER/"],
  ["en", "https://montri-th.github.io/CityMETER/en/"]
]) {
  const output = join(outputDir, `citymeter-page-${language}.png`);
  const result = spawnSync(
    "npm",
    [
      "--cache", "/tmp/citymeter-qr-npm-cache",
      "exec", "--yes", "qrcode", "--",
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

writeFileSync(
  join(outputDir, "manifest.json"),
  `${JSON.stringify({ version: "2026-08-14", datasets: manifestDatasets, pages: manifestPages }, null, 2)}\n`
);

console.log(`Generated ${review.records.length} dataset QR assets, two page QR assets and their SHA-256 manifest in ${outputDir}`);
