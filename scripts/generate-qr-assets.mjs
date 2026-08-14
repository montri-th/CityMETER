import { mkdirSync, readFileSync } from "node:fs";
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

for (const record of review.records) {
  const href = hrefById.get(record.id);
  if (!href) throw new Error(`No CityMETER URL found for ${record.id}`);

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
}

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
}

console.log(`Generated ${review.records.length} dataset QR assets and two page QR assets in ${outputDir}`);
