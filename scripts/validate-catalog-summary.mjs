import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { card, detailUrl, esc, shareLinks, sourcePanel, contributors } from "./lib/catalog-render.mjs";

import { detailPage, articleReading, articleFacts, articleNavigation } from "./lib/summary-article.mjs";
import { validateSummaryRuntime } from "./validate-summary-runtime.mjs";
import { articleFactProjection } from "./lib/article-facts.mjs";
const sourceOnly = process.argv.includes("--source-only");
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
    const html = sourceOnly ? detailPage(catalog,r,lang,projection,story,stories.records) : read(path);
    const body = html.split("<body")[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    const disclosure = body.match(/<details class="summary-source-details"[^>]*>([\s\S]*?)<\/details>/)?.[0];
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
    const readingText=[story.lead[lang],...story.sections.flatMap(s=>[s.heading[lang],...s.paragraphs[lang]])].join(" ");
    const exactWords=[...new Intl.Segmenter(lang,{granularity:"word"}).segment(readingText)].filter(s=>s.isWordLike).length;
    assert.equal(reading.words,exactWords);
    assert.equal(reading.minutes,Math.max(1,Math.round(exactWords/170)));
    assert(body.includes(`data-reading-words="${reading.words}"`));
    assert(html.includes(`<meta name="description" content="${esc(story.lead[lang])}"/>`));
    const firstMap = body.indexOf(`href="${esc(story.mapUrl || r.mapUrl)}"`);
    assert(firstMap > 0 && body.indexOf('<details class="summary-source-details"') > firstMap);
    assert(!/^<details[^>]*\sopen(?:[\s=>])/.test(disclosure));
    assert(disclosure.includes(sourcePanel(r, lang, 3)));
    assert(disclosure.includes(esc(r.limitation[lang])));
    assert(!mainReading.includes(esc(r.limitation[lang])), `${r.id}: caveat escaped its disclosure`);
    assert(!mainReading.includes(esc(r.executiveSummary.note[lang])), `${r.id}: old reader warning remains visible`);
    assert(!mainReading.includes('catalog-source-status'));
    assert(disclosure.includes(contributors(r, lang, projection)));
    assert(disclosure.includes(`media/qr/datasets/${r.slug}.svg`));
    assert(disclosure.match(/<img[^>]+media\/qr[^>]+loading="lazy"/));
    const image = story.snapshot || r.preview;
    if (image.available || image.path) assert(body.includes(esc(image.largePath || image.path)));
    assert(body.includes('<main id="main-content">'));
    assert.equal((body.match(/<main\b/g)||[]).length,1);
    assert(body.includes('class="summary-facts"'));
    assert.equal((body.match(/class="summary-fact"/g)||[]).length,4);
    for(const fact of articleFacts(r,lang)) if(fact.value) assert(body.includes(esc(fact.value)));
    for(let i=0;i<story.sections.length;i++) {
      assert(body.includes(`id="s${i+1}" data-toc="s${i+1}"`));
      assert(body.includes(`href="#s${i+1}" data-toc-link="s${i+1}"`));
    }
    assert(/href="#sources"[^>]*data-open-sources/.test(body));
    assert(body.includes('href="#share"'));
    assert(body.includes('data-reading-progress hidden'));
    assert(!mainReading.includes('catalog-status'));
    const nav=articleNavigation(catalog,r,stories.records);
    assert.equal(nav.related.length,3);
    assert(new Set(nav.related.map(x=>x.record.datasetCode)).size===3);
    for(const related of nav.related) {
      assert.equal(related.record.group,r.group);
      assert.notEqual(related.record.datasetCode,r.datasetCode);
      assert(body.includes(esc(related.story.title[lang])));
      assert(body.includes(`href="${detailUrl(catalog,related.record,lang)}"`));
    }
    assert(body.includes(`href="${detailUrl(catalog,nav.previous.record,lang)}" rel="prev"`));
    assert(body.includes(`href="${detailUrl(catalog,nav.next.record,lang)}" rel="next"`));
    assert(!body.includes('CityMETER Article.dc.html'));
    const figure=body.match(/<figure class="catalog-preview summary-preview">([\s\S]*?)<\/figure>/)?.[0];
    assert(figure);
    assert(figure.includes('class="summary-image-stage"'));
    if(story.snapshot)assert(figure.includes(esc(story.snapshot.caption[lang])));
    else if(r.preview.conceptual)assert(figure.includes(lang==='th'?'ภาพประกอบเรื่องนี้':'Illustration for this story'));
    else assert(figure.includes(lang==='th'?'มุมมองข้อมูลใน CityMETER':'A view inside CityMETER'));
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
// All 43 concise projections are individually authored and bound to source fields.
assert.deepEqual(Object.keys(articleFactProjection).sort(),catalog.records.map(r=>r.datasetCode).sort());
for(const r of catalog.records) {
  const facts=articleFactProjection[r.datasetCode];
  assert.match(facts.sourceSha256,/^[a-f0-9]{64}$/);
  for(const key of ['period','scope','grain','publisher']) {
    if(facts[key]===null)continue;
    assert.deepEqual(Object.keys(facts[key]).sort(),['en','th']);
    for(const lang of ['th','en']) {
      assert(facts[key][lang].length>0&&facts[key][lang].length<=100,`${r.datasetCode}/${key}: concise field length`);
      assert(!/ยังไม่|ไม่ใช่|ต้องตรวจ|candidate|not (?:yet |fully )?(?:verified|confirmed|stated)|unknown|does not/i.test(facts[key][lang]),`${r.datasetCode}/${key}: source warning outside disclosure`);
    }
  }
  for(const lang of ['th','en']) assert.equal(articleFacts(r,lang).length,4);
}
const officer=catalog.records.find(r=>r.datasetCode==='governmentOfficer');
assert.deepEqual(articleFacts(officer,'th').map(f=>f.value),[
  '2566–2567 (สถิติกำลังคน)','ข้อมูลที่ตั้ง 76 จังหวัดและกรุงเทพมหานคร','ที่ตั้งหน่วยงาน · สถิติระดับกระทรวง/กรม','ก.พ. · ก.พ.ร. · กรมการปกครอง · กทม.'
]);
assert(articleFacts(catalog.records.find(r=>r.datasetCode==='landoffer'),'en').filter(f=>!f.value&&f.more).length===3);
assert(articleFacts(catalog.records.find(r=>r.datasetCode==='cars'),'en')[2].value.includes('selected types and brands'));
assert(articleFacts(catalog.records.find(r=>r.datasetCode==='building'),'en')[2].value.includes('estimated'));
assert(articleFacts(catalog.records.find(r=>r.datasetCode==='govspending'),'en')[1].value.includes('matched'));
assert.equal(articleFacts(catalog.records.find(r=>r.datasetCode==='school'),'en')[3].value,'');
assert.equal(articleFacts(catalog.records.find(r=>r.datasetCode==='quakeSafe'),'en')[3].value,'');
const changed=structuredClone(officer);changed.sourceReview.period.th='New data period';
assert.throws(()=>articleFacts(changed,'th'),/Source facts changed; review concise article facts/);
const first=articleNavigation(catalog,catalog.records[0],stories.records);
assert.notEqual(first.previous.record.datasetCode,catalog.records[0].datasetCode);
const css=read('src/styles/summary.css');
assert(css.includes('object-fit:contain'));
assert(!css.includes('object-fit:cover'));
assert(!css.includes('line-clamp'));
assert(css.includes('--atmosphere-measure-deep'));
assert(css.includes('@media(prefers-reduced-motion:reduce)'));
const runtimeChecks=await validateSummaryRuntime();
console.log(`PASS ${pages} ${sourceOnly?'source-rendered':'initial HTML'} articles: exact ICU reading time, fact/source/credit/QR/share, complete finding images, TOC and related/pager contracts; 8 theme and ${runtimeChecks} runtime fixtures.`);
