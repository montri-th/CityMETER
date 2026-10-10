import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import jsQR from "jsqr";
import { catalogInner, sourcePanel, esc } from "./lib/catalog-render.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("src/catalog.json"));
const credits = JSON.parse(read("data/landom-contributors.json"));
const qrs = JSON.parse(read("data/catalog-qr.json"));
const floodOrder = ["flood-recurrent", "flood-latest-observed", "flood-forecast-depth", "flood-forecast-flash-flood-risk"];
assert.deepEqual(catalog.records.filter((r) => r.subgroup === "flood").map((r) => r.id), floodOrder);
assert.equal(qrs.records.length, catalog.records.length);
let decoded = 0;
for (const record of catalog.records) {
  const group = catalog.subgroups.find((g) => g.id === record.subgroup);
  assert.equal(group?.group, record.group, `Invalid subgroup for ${record.id}`);
  const qr = qrs.records.find((q) => q.id === record.id);
  assert.equal(qr.url, record.mapUrl);
  const svg = read(qr.file);
  assert.equal(createHash("sha256").update(svg).digest("hex"), qr.sha256);
  const size = Number(svg.match(/viewBox="0 0 (\d+) \d+"/)[1]);
  const scale = 6, width = size * scale;
  const pixels = new Uint8ClampedArray(width * width * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels.set([252, 252, 250, 255], i);
  }
  for (const [, x, y] of svg.matchAll(/M(\d+),(\d+)h1v1h-1z/g)) {
    // Rasterize the emitted vector, then decode using an independent library.
    for (let dy = 0; dy < scale; dy++)
      for (let dx = 0; dx < scale; dx++)
        pixels.set([24, 35, 39, 255], (((Number(y) * scale + dy) * width) + Number(x) * scale + dx) * 4);
  }
  assert.equal(jsQR(pixels, width, width)?.data, record.mapUrl, `Unreadable or incorrect QR: ${record.id}`);
  decoded++;
}
for (const lang of ["th", "en"]) {
  const html = catalogInner(catalog, lang, credits, lang === "th" ? "./" : "../");
  assert.equal((html.match(/data-catalog-lane=/g) || []).length, 3);
  assert.equal((html.match(/data-catalog-subgroup=/g) || []).length, 24);
  assert.equal((html.match(/class="catalog-details"/g) || []).length, 43);
  assert.equal((html.match(/class="catalog-qr-handoff"/g) || []).length, 43);
  const lanes = html.split('<section class="catalog-lane"').slice(1);
  for (const lane of lanes) {
    const group = lane.match(/data-catalog-lane="([^"]+)"/)[1];
    for (const record of catalog.records) {
      const appears = lane.includes(`id="dataset-${record.slug}"`);
      assert.equal(appears, record.group === group, `${record.id} mixed into ${group} lane`);
      if (appears) {
        assert(lane.includes(sourcePanel(record, lang, 6)));
        assert(lane.includes(esc(record.limitation[lang])));
      }
    }
  }
}
const css = read("src/styles/shell-current.css");
assert(!/--ldm-series-\d\d-(?:light|dark)\b/.test(css), "Retired ambiguous series aliases are active");
assert(!read("src/styles/navbar-current.css").includes("nav-filled-r1.ttf"));
console.log(`PASS grouped lane/source parity in both locales; independently decoded ${decoded} exact dataset QR destinations.`);
