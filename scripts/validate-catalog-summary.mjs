import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { card, detailUrl, esc, shareLinks, sourcePanel, contributors } from "./lib/catalog-render.mjs";

import { detailPage, articleReading } from "./lib/summary-article.mjs";
const stories = JSON.parse(readFileSync(new URL("../src/dataset-stories.json", import.meta.url), "utf8"));
const storyByCode = new Map(stories.records.map(s => [s.datasetCode,s]));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("src/catalog.json"));
const projection = JSON.parse(read("data/landom-contributors.json"));
let pages = 0;
for (const r of catalog.records) {
  const story = storyByCode.get(r.datasetCode);
  assert(story && story.sections.length >= 3, `${r.id}: independent feature absent`);
  for (const lang of ["th", "en"]) {
    const path = `${lang === "en" ? "en/" : ""}datasets/${r.slug}/index.html`;
    const html = read(path);
    const body = html.split("<body")[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    const disclosure = body.match(/<details class="summary-source-details">([\s\S]*?)<\/details>/)?.[0];
    assert(disclosure, `${r.id}: optional provenance absent`);
    const mainReading = body.replace(disclosure, "");
    assert(body.includes('<article class="catalog-summary"'));
    for (const field of ["title", "lead", "findingContext", "action"]) assert(body.includes(esc(story[field][lang])), `${r.id}: missing ${field}`);
    for (const section of story.sections) {
      assert(body.includes(esc(section.heading[lang])));
      for (const paragraph of section.paragraphs[lang]) assert(body.includes(esc(paragraph)));
      for (const ref of section.references || []) assert(body.includes(`href="${esc(ref.url)}"`));
    }
    const reading = articleReading(story, lang);
    assert(reading.minutes >= 3 && reading.minutes <= 5, `${r.id}/${lang}: ${reading.words} words, ${reading.minutes} minutes`);
    assert(body.includes(`data-reading-words="${reading.words}"`));
    assert(html.includes(`<meta name="description" content="${esc(story.lead[lang])}"/>`));
    const firstMap = body.indexOf(`href="${esc(story.mapUrl || r.mapUrl)}"`);
    assert(firstMap > 0 && body.indexOf('<details class="summary-source-details">') > firstMap);
    assert(!body.includes('<details class="summary-source-details" open'));
    assert(disclosure.includes(sourcePanel(r, lang, 3)));
    assert(disclosure.includes(esc(r.limitation[lang])));
    assert(!mainReading.includes(esc(r.limitation[lang])), `${r.id}: caveat escaped its disclosure`);
    assert(!mainReading.includes(esc(r.executiveSummary.note[lang])), `${r.id}: old reader warning remains visible`);
    assert(!mainReading.includes('catalog-source-status'));
    assert(body.includes(contributors(r, lang, projection)));
    assert(body.includes(`media/qr/datasets/${r.slug}.svg`));
    const image = story.snapshot || r.preview;
    if (image.available || image.path) assert(body.includes(esc(image.largePath || image.path)));
    const canonical = detailUrl(catalog, r, lang);
    assert(html.includes(`<link rel="canonical" href="${canonical}"/>`));
    assert(html.includes(`<meta property="og:url" content="${canonical}"/>`));
    for (const link of shareLinks(catalog, r, lang)) {
      const parsed = new URL(link.url);
      assert.equal(parsed.searchParams.get(link.label === "Facebook" ? "u" : "url"), canonical);
      assert(body.includes(`href="${esc(link.url)}"`));
    }
    assert.equal((body.match(/class="summary-social-link"/g)||[]).length,4);
    assert(body.includes(`readonly value="${canonical}"`));
    const renderedCard = card(catalog, r, lang, projection, "./");
    const actions = renderedCard.split('<div class="catalog-actions">')[1].split("</div>")[0];
    const urls = [...actions.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(urls[0], esc(r.mapUrl));
    assert(!actions.includes(canonical));
    assert(renderedCard.includes(`<a class="catalog-detail-link catalog-summary-link" href="${canonical}">`));
    assert(renderedCard.includes(lang === "th" ? "ข้อมูลนี้ใช้ทำอะไรได้" : "What can I use this data for?"));
    assert(!renderedCard.includes(esc(r.limitation[lang])));
    assert(!renderedCard.includes('catalog-status'));
    assert(!renderedCard.includes('catalog-source-status'));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert(graph["@graph"].every(node=>Object.keys(node).every(key=>["@id","@type","name","url"].includes(key))));
    pages++;
  }
}
// Explicit route theme queries override storage without persisting that temporary choice.
const themeScript = detailPage(catalog, catalog.records[0], "th", projection, storyByCode.get(catalog.records[0].datasetCode)).match(/<script>([\s\S]*?)<\/script>/)[1];
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
console.log(`PASS ${pages} initial place-led 3–5 minute articles, direct map/back/source/credit/QR/share contracts plus 8 theme-precedence and 6 sharing failure/success fixtures.`);
