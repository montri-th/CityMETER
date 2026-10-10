import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { card, detailUrl, esc, shareLinks, sourcePanel, contributors } from "./lib/catalog-render.mjs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("src/catalog.json"));
const projection = JSON.parse(read("data/landom-contributors.json"));
let pages = 0;
for (const r of catalog.records) {
  assert.equal(r.executiveSummary.editorialBasis, "catalog_description_and_source_review");
  for (const lang of ["th", "en"]) {
    const summary = r.executiveSummary;
    assert.equal(summary.questions[lang].length, 2);
    assert(summary.questions[lang].every((q) => q.trim().length > 12));
    assert(summary.reading[lang].trim().length > 50);
    const path = `${lang === "en" ? "en/" : ""}datasets/${r.slug}/index.html`;
    const html = read(path);
    const body = html.split("<body")[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert(body.includes('<article class="catalog-summary">'));
    for (const text of [...summary.questions[lang], summary.reading[lang], r.limitation[lang]]) assert(body.includes(esc(text)), `${r.id}: missing initial article text`);
    const previewIndex = body.indexOf('class="catalog-preview"');
    if (previewIndex !== -1) assert(body.indexOf(esc(r.limitation[lang])) < previewIndex);
    assert(body.includes(sourcePanel(r, lang, 3)), `${r.id}: source panel changed`);
    assert(body.includes(contributors(r, lang, projection)), `${r.id}: credits changed`);
    const base = lang === "en" ? "../../../en/" : "../../";
    const back = `href="${base}#dataset-${r.slug}"`;
    assert.equal(body.split(back).length - 1, 2);
    assert.equal(body.split(`href="${esc(r.mapUrl)}"`).length - 1, 2);
    assert(body.includes('href="https://montri-th.github.io/rebuild02/#contact"'));
    const canonical = detailUrl(catalog, r, lang);
    assert(html.includes(`<link rel="canonical" href="${canonical}"/>`));
    assert(html.includes(`<meta property="og:url" content="${canonical}"/>`));
    for (const link of shareLinks(catalog, r, lang)) {
      const parsed = new URL(link.url);
      assert.equal(parsed.searchParams.get(link.label === "Facebook" ? "u" : "url"), canonical);
      assert(body.includes(`href="${esc(link.url)}"`));
    }
    assert(body.includes(`readonly value="${canonical}"`), "No-JS selectable sharing link missing");
    const renderedCard = card(catalog, r, lang, projection, "./");
    const actions = renderedCard.split('<div class="catalog-actions">')[1].split("</div>")[0];
    const urls = [...actions.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(urls, [esc(r.mapUrl), canonical], "Summary must remain optional after direct map CTA");
    assert(renderedCard.includes(lang === "th" ? "อ่านสรุป →" : "Read summary →"));
    assert(renderedCard.includes(lang === "th" ? "<summary>ที่มา ข้อควรรู้ และ QR</summary>" : "<summary>Sources, notes &amp; QR</summary>") || renderedCard.includes("<summary>Sources, notes & QR</summary>"));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert(graph["@graph"].every((node) => Object.keys(node).every((key) => ["@id", "@type", "name", "url"].includes(key))));
    pages++;
  }
}
// Sharing error handling: no navigation or success claim when clipboard fails or user cancels.
const runtime = read("src/runtime/summary.js");
function fixture(navigator) {
  const controls = Object.fromEntries(["status", "input", "copy", "native"].map((key) => [key, { hidden: true, textContent: "", listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; }, focus() { this.focused = true; }, select() { this.selected = true; } }]));
  const panel = { dataset: { shareUrl: "https://example.com/en/datasets/test/", shareTitle: "Test", copySuccess: "copied", copyFallback: "copy-failed", shareSuccess: "opened", shareFallback: "share-failed" }, querySelector: (q) => controls[q === "input" ? "input" : q.includes("native") ? "native" : q.includes("copy") ? "copy" : "status"] };
  vm.runInNewContext(runtime, { document: { querySelector: () => panel }, navigator });
  return controls;
}
const missing = fixture({});
assert.equal(missing.native.hidden, true);
await missing.copy.listeners.click();
assert.equal(missing.status.textContent, "copy-failed");
assert(missing.input.focused && missing.input.selected);
let written;
const success = fixture({ clipboard: { writeText: async (url) => { written = url; } } });
await success.copy.listeners.click();
assert.equal(written, "https://example.com/en/datasets/test/");
assert.equal(success.status.textContent, "copied");
const denied = fixture({ clipboard: { writeText: async () => { throw new Error("Denied"); } } });
await denied.copy.listeners.click();
assert.equal(denied.status.textContent, "copy-failed");
const cancelled = fixture({ share: async () => { throw { name: "AbortError" }; } });
await cancelled.native.listeners.click();
assert.equal(cancelled.status.textContent, "");
const failed = fixture({ share: async () => { throw new Error("Failed"); } });
await failed.native.listeners.click();
assert.equal(failed.status.textContent, "share-failed");
assert(failed.input.selected);
const nativeSuccess = fixture({ share: async () => {} });
await nativeSuccess.native.listeners.click();
assert.equal(nativeSuccess.status.textContent, "opened");
console.log(`PASS ${pages} initial executive summaries, direct map/back/source/credit/share contracts and 6 sharing failure/success fixtures.`);
