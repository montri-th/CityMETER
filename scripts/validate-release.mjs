import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const review = JSON.parse(readFileSync(join(root, "data/catalog-source-review.json"), "utf8"));
const ids = review.records.map((record) => record.id);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(review.reviewedAt === "2026-08-14", "Unexpected review date");
assert(ids.length === 38 && new Set(ids).size === 38, "Source registry must contain 38 unique records");
assert(review.records.filter((record) => record.status === "verified-lineage").length === 11, "Expected 11 verified-lineage records");
assert(review.records.filter((record) => record.conceptualPreview).length === 3, "Expected three labelled conceptual previews");

for (const page of ["index.html", "en/index.html"]) {
  const html = readFileSync(join(root, page), "utf8");
  assert((html.match(/class="dataset-card"/g) || []).length === 38, `${page} must prerender 38 cards`);
  assert(html.includes("catalog-enhancements.css") && html.includes("catalog-enhancements.js"), `${page} is missing the enhancement layer`);
  assert(html.includes('name="citymeter:catalog-version" content="2026-08-14"'), `${page} has a stale catalog version`);
}

for (const record of review.records) {
  const slug = record.id.replace(/^dataset-/, "");
  const qr = join(root, "media/qr", `${slug}.png`);
  const preview = join(root, "media/previews-v2", `${slug}.webp`);
  assert(existsSync(qr) && statSync(qr).size > 1000, `Missing or empty QR: ${slug}`);
  assert(existsSync(preview) && statSync(preview).size > 10000, `Missing or empty preview: ${slug}`);
}

for (const asset of [
  "assets/catalog-enhancements.js",
  "assets/catalog-enhancements.css",
  "media/gdcatalog-logo.png",
  "media/reel/citymeter-proof-v2.mp4",
  "media/reel/citymeter-proof-v2-exhibition.mp4",
  "media/reel/citymeter-proof-v2-poster.webp"
]) {
  assert(existsSync(join(root, asset)) && statSync(join(root, asset)).size > 0, `Missing release asset: ${asset}`);
}

console.log("CityMETER catalog release validation passed: 38 cards, 38 QR assets, 11 verified-lineage badges, 3 labelled concepts.");
