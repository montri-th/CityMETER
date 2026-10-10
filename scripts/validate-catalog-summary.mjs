import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { card, detailUrl, esc, shareLinks, sourcePanel, contributors, detailPage } from "./lib/catalog-render.mjs";

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
    for (const field of ["lead", "sectionTitle", "reading", "note", "takeaway"]) {
      assert(summary[field][lang].trim().length > 12, `${r.id}: missing localized ${field}`);
      assert(body.includes(esc(summary[field][lang])), `${r.id}: missing initial ${field}`);
    }
    for (const text of summary.questions[lang]) assert(body.includes(esc(text)), `${r.id}: missing initial question`);
    assert(html.includes(`<meta name="description" content="${esc(summary.lead[lang])}"/>`));
    assert(html.includes('assets/dataset-summary-public-r1.css'));
    assert(!body.includes('class="catalog-summary-limits"'), "Do not restore the blanket warning box");
    const firstMap = body.indexOf(`href="${esc(r.mapUrl)}"`);
    const sourceDisclosure = body.indexOf('<details class="summary-source-details">');
    assert(firstMap > 0 && sourceDisclosure > firstMap, "Source reading must not gate direct map access");
    assert(!body.includes('<details class="summary-source-details" open'), "Detailed provenance remains optional");
    assert(body.includes(`src="${lang === "en" ? "../../../" : "../../"}media/qr/datasets/${r.slug}.svg"`));
    if (r.preview.available) {
      assert(body.includes('class="catalog-preview summary-preview"'));
      assert(body.includes(esc(r.preview.largePath || r.preview.path)));
      if (r.preview.capture) {
        assert(body.includes(esc(r.preview.focusLabel[lang])));
        assert(body.includes(esc(r.preview.capture.note[lang])));
        assert(r.preview.capture.stateLabel?.[lang]?.trim(), "Captured previews need a localized selection caption");
        assert(body.includes(esc(r.preview.capture.stateLabel[lang])));
      }
    }
    assert(body.includes(sourcePanel(r, lang, 3)), `${r.id}: source panel changed`);
    assert(body.includes(esc(r.limitation[lang])), `${r.id}: full interpretation limits missing from source disclosure`);
    assert(body.includes(contributors(r, lang, projection)), `${r.id}: credits changed`);
    const base = lang === "en" ? "../../../en/" : "../../";
    const back = `href="${base}#dataset-${r.slug}"`;
    assert.equal(body.split(back).length - 1, 2);
    assert.equal(body.split(`href="${esc(r.mapUrl)}"`).length - 1, 3, "Direct map links at the lead, next action and QR");
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
    assert.equal(urls[0], esc(r.mapUrl), "The first card action must open the actual data map");
    assert(!actions.includes(canonical), "Contributor actions must not route through a mandatory summary");
    assert(renderedCard.includes(`<a class="catalog-detail-link catalog-summary-link" href="${canonical}">`), "The summary is a separate optional link");
    assert(renderedCard.includes(lang === "th" ? "อ่านสรุป →" : "Read summary →"));
    const sourceSummary = renderedCard.match(/<summary>([\s\S]*?)<\/summary>/)?.[1];
    assert(sourceSummary?.includes(lang === "th" ? "<span>ที่มา ข้อควรรู้ และ QR</span>" : "<span>Sources, notes & QR</span>"));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert(graph["@graph"].every((node) => Object.keys(node).every((key) => ["@id", "@type", "name", "url"].includes(key))));
    pages++;
  }
}
// Explicit route theme queries override storage without persisting that temporary choice.
const themeScript = detailPage(catalog, catalog.records[0], "th", projection).match(/<script>([\s\S]*?)<\/script>/)[1];
function themeFixture(search, stored, systemDark, blockedStorage = false, withMediaQuery = true) {
  const element = { dataset: { theme: "light" }, style: {} };
  const context = { document: { documentElement: element }, location: { search }, URLSearchParams,
    localStorage: { getItem(key) { if (blockedStorage) throw Error("Blocked"); return stored[key] || null; }, setItem() { throw Error("Query theme must not be persisted"); } } };
  if (withMediaQuery) context.matchMedia = () => ({ matches: systemDark });
  vm.runInNewContext(themeScript, context);
  assert.equal(element.style.colorScheme, element.dataset.theme);
  return element.dataset.theme;
}
assert.equal(themeFixture("?theme=dark", { "lds-theme": "light" }, false), "dark");
assert.equal(themeFixture("?theme=light", { "lds-theme": "dark" }, true), "light");
assert.equal(themeFixture("?theme=system", { "lds-theme": "light" }, true), "dark");
assert.equal(themeFixture("?theme=invalid", { "lds-theme": "dark" }, false), "dark");
assert.equal(themeFixture("", { "citymeter-theme": "dark" }, false), "dark");
assert.equal(themeFixture("", {}, true), "dark");
assert.equal(themeFixture("?theme=dark", {}, false, true), "dark");
assert.equal(themeFixture("?theme=system", {}, true, true, false), "light");
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
console.log(`PASS ${pages} initial value-led summaries, direct map/back/source/credit/QR/share contracts plus 8 theme-precedence and 6 sharing failure/success fixtures.`);
