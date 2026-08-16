import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-16-catalog-structure-simple-v21";
const previousReleaseReceipt = "2026-08-16-catalog-story-qr-v20";
const sourceBundle = "index-qbT50gkr-v9.js";
const targetBundle = "index-qbT50gkr-v10.js";
const sourceCss = "catalog-enhancements-v17.css";
const previousCss = "catalog-enhancements-v18.css";
const targetCss = "catalog-enhancements-v19.css";

const expectedHashes = {
  [sourceBundle]: "8f857fe4f6fb9e6dd39460eec3a841ba9338e54d1f479b8964fb410c197b0116",
  [sourceCss]: "8f4c95eb631b64b41d1beb6554265189474fff8dde419b0c0d4b46f985b8ff3a",
  [previousCss]: "5661979c5ca33a332c3f57fc5dd233daa468875e7d0b32d0684ed3846bfc592a"
};

const thaiStory = 'provisional:"อยู่ระหว่างตรวจสอบ",opensNewTab:"เปิดในแท็บใหม่",story:{eyebrow:"38 มุมมองข้อมูล · 3 กลุ่ม",title:"เข้าใจเมืองผ่าน 3 มุมที่เชื่อมกัน",intro:"Land คือฐานของเมือง Living คือผู้คน บริการ และความเป็นอยู่ เมื่อนำมาดูร่วมกันจึงเห็นว่าแต่ละ Location ต่างกันอย่างไร—และบางเรื่องเปลี่ยนไปตามเวลา",groups:{land:{name:"Land",body:"ที่ดิน · อาคาร · โครงสร้างพื้นฐาน"},living:{name:"Living",body:"ผู้คน · บริการ · ความเป็นอยู่"},location:{name:"Location",body:"ธุรกิจ · การเดินทาง · การเข้าถึง"}},citymeter:{label:"CityMETER",body:"รวม 38 มุมมองให้ค้น เทียบ และเปิดดูหลักฐานในที่เดียว"},outcome:{brand:"Landometer",label:"Local Decisions",body:"ช่วยให้เห็นว่าควรตรวจอะไรต่อ และตัดสินใจเรื่องพื้นที่ได้อย่างไร"}}}';
const englishStory = 'provisional:"Under review",opensNewTab:"Opens in a new tab",story:{eyebrow:"38 DATA VIEWS · 3 LENSES",title:"One city, seen through three connected lenses",intro:"Land is the city’s base. Living is people, services and everyday life. Together they show how each Location differs—and how some patterns change over time.",groups:{land:{name:"Land",body:"Land · buildings · infrastructure"},living:{name:"Living",body:"People · services · everyday life"},location:{name:"Location",body:"Business · mobility · access"}},citymeter:{label:"CityMETER",body:"Organises 38 views so people can find, compare and inspect evidence in one place."},outcome:{brand:"Landometer",label:"Local Decisions",body:"Shows what to check next and how to move a place decision forward."}}}';

const catalogStructureComponent = 'function CatalogStructureDiagram({language:c,text:f}){const g=f.datasetExplorer.story,v=new Map(p6.map(N=>[N.id,N.count])),E=N=>{const L=g.groups[N];return p.jsxs("div",{className:"catalog-structure-step",role:"listitem","data-group":N,children:[p.jsxs("div",{className:"catalog-structure-step-heading",children:[p.jsx("span",{lang:"en",children:L.name}),p.jsx("small",{children:c==="th"?v.get(N)+" รายการ":v.get(N)+" views"})]}),p.jsx("p",{children:L.body})]},N)};return p.jsxs("figure",{className:"catalog-structure","aria-labelledby":"catalog-structure-title","aria-describedby":"catalog-structure-description",children:[p.jsxs("figcaption",{className:"catalog-structure-caption",children:[p.jsx("p",{className:"eyebrow",children:g.eyebrow}),p.jsx("h3",{id:"catalog-structure-title",children:g.title}),p.jsx("p",{id:"catalog-structure-description",children:g.intro})]}),p.jsxs("div",{className:"catalog-structure-flow",role:"list",children:[E("land"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"+"}),E("living"),p.jsx("span",{className:"catalog-structure-operator","aria-hidden":"true",children:"→"}),E("location")]}),p.jsxs("div",{className:"catalog-structure-citymeter",children:[p.jsx("strong",{lang:"en",children:g.citymeter.label}),p.jsx("p",{children:g.citymeter.body})]}),p.jsxs("div",{className:"catalog-structure-outcome",children:[p.jsxs("span",{className:"catalog-structure-outcome-route",children:[p.jsx("strong",{lang:"en",children:g.outcome.brand}),p.jsx("span",{"aria-hidden":"true",children:"→"}),p.jsx("b",{lang:"en",children:g.outcome.label})]}),p.jsx("p",{children:g.outcome.body})]})]})}';

const thaiDiagram = '<figure class="catalog-structure" aria-labelledby="catalog-structure-title" aria-describedby="catalog-structure-description"><figcaption class="catalog-structure-caption"><p class="eyebrow">38 มุมมองข้อมูล · 3 กลุ่ม</p><h3 id="catalog-structure-title">เข้าใจเมืองผ่าน 3 มุมที่เชื่อมกัน</h3><p id="catalog-structure-description">Land คือฐานของเมือง Living คือผู้คน บริการ และความเป็นอยู่ เมื่อนำมาดูร่วมกันจึงเห็นว่าแต่ละ Location ต่างกันอย่างไร—และบางเรื่องเปลี่ยนไปตามเวลา</p></figcaption><div class="catalog-structure-flow" role="list"><div class="catalog-structure-step" role="listitem" data-group="land"><div class="catalog-structure-step-heading"><span lang="en">Land</span><small>12 รายการ</small></div><p>ที่ดิน · อาคาร · โครงสร้างพื้นฐาน</p></div><span class="catalog-structure-operator" aria-hidden="true">+</span><div class="catalog-structure-step" role="listitem" data-group="living"><div class="catalog-structure-step-heading"><span lang="en">Living</span><small>13 รายการ</small></div><p>ผู้คน · บริการ · ความเป็นอยู่</p></div><span class="catalog-structure-operator" aria-hidden="true">→</span><div class="catalog-structure-step" role="listitem" data-group="location"><div class="catalog-structure-step-heading"><span lang="en">Location</span><small>13 รายการ</small></div><p>ธุรกิจ · การเดินทาง · การเข้าถึง</p></div></div><div class="catalog-structure-citymeter"><strong lang="en">CityMETER</strong><p>รวม 38 มุมมองให้ค้น เทียบ และเปิดดูหลักฐานในที่เดียว</p></div><div class="catalog-structure-outcome"><span class="catalog-structure-outcome-route"><strong lang="en">Landometer</strong><span aria-hidden="true">→</span><b lang="en">Local Decisions</b></span><p>ช่วยให้เห็นว่าควรตรวจอะไรต่อ และตัดสินใจเรื่องพื้นที่ได้อย่างไร</p></div></figure>';
const englishDiagram = '<figure class="catalog-structure" aria-labelledby="catalog-structure-title" aria-describedby="catalog-structure-description"><figcaption class="catalog-structure-caption"><p class="eyebrow">38 DATA VIEWS · 3 LENSES</p><h3 id="catalog-structure-title">One city, seen through three connected lenses</h3><p id="catalog-structure-description">Land is the city’s base. Living is people, services and everyday life. Together they show how each Location differs—and how some patterns change over time.</p></figcaption><div class="catalog-structure-flow" role="list"><div class="catalog-structure-step" role="listitem" data-group="land"><div class="catalog-structure-step-heading"><span lang="en">Land</span><small>12 views</small></div><p>Land · buildings · infrastructure</p></div><span class="catalog-structure-operator" aria-hidden="true">+</span><div class="catalog-structure-step" role="listitem" data-group="living"><div class="catalog-structure-step-heading"><span lang="en">Living</span><small>13 views</small></div><p>People · services · everyday life</p></div><span class="catalog-structure-operator" aria-hidden="true">→</span><div class="catalog-structure-step" role="listitem" data-group="location"><div class="catalog-structure-step-heading"><span lang="en">Location</span><small>13 views</small></div><p>Business · mobility · access</p></div></div><div class="catalog-structure-citymeter"><strong lang="en">CityMETER</strong><p>Organises 38 views so people can find, compare and inspect evidence in one place.</p></div><div class="catalog-structure-outcome"><span class="catalog-structure-outcome-route"><strong lang="en">Landometer</strong><span aria-hidden="true">→</span><b lang="en">Local Decisions</b></span><p>Shows what to check next and how to move a place decision forward.</p></div></figure>';

const diagramCss = [
  "",
  "/* CityMETER catalog structure simplification — release v21.",
  "   Five primary marks form one reading path: Land + Living → Location,",
  "   CityMETER, then Landometer to Local Decisions. Category surfaces stay flat. */",
  ".explorer-section .catalog-structure {",
  "  --catalog-simple-surface: #eef1ee;",
  "  --catalog-simple-panel: #ffffff;",
  "  --catalog-simple-text: #182327;",
  "  --catalog-simple-secondary: #5f635a;",
  "  --catalog-simple-border: #7d877f;",
  "  width: min(100%, 1180px);",
  "  margin: 0 auto clamp(24px, 3vw, 36px);",
  "  padding: clamp(20px, 2.5vw, 30px);",
  "  color: var(--catalog-simple-text);",
  "  background: var(--catalog-simple-surface);",
  "  border: 1px solid var(--catalog-simple-border);",
  "  border-radius: 20px;",
  "}",
  "[data-theme=\"dark\"] .explorer-section .catalog-structure {",
  "  --catalog-simple-surface: #172126;",
  "  --catalog-simple-panel: #11191d;",
  "  --catalog-simple-text: #f1f4ef;",
  "  --catalog-simple-secondary: #c4ceca;",
  "  --catalog-simple-border: #7c8a84;",
  "}",
  ".explorer-section .catalog-structure-caption { max-width: 64ch; }",
  ".explorer-section .catalog-structure-caption h3 {",
  "  margin: 7px 0 8px;",
  "  font-size: clamp(1.4rem, 2vw, 1.8rem);",
  "}",
  ".explorer-section .catalog-structure-caption > p:last-child { color: var(--catalog-simple-secondary); }",
  ".explorer-section .catalog-structure-flow {",
  "  display: grid;",
  "  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);",
  "  align-items: stretch;",
  "  gap: clamp(10px, 1.5vw, 18px);",
  "  margin-top: clamp(20px, 2.5vw, 28px);",
  "}",
  ".explorer-section .catalog-structure-step {",
  "  --catalog-step-surface: var(--pillar-surface-alt);",
  "  --catalog-step-accent: var(--pillar-interaction-accent);",
  "  min-width: 0;",
  "  padding: clamp(14px, 1.7vw, 18px);",
  "  color: var(--pillar-text-primary);",
  "  background: var(--catalog-step-surface);",
  "  border: 1px solid var(--pillar-border-emphasis);",
  "  border-block-start: 5px solid var(--catalog-step-accent);",
  "  border-radius: 14px;",
  "}",
  ".explorer-section .catalog-structure-step[data-group=\"land\"] { --catalog-step-surface: var(--pillar-surface-land); --catalog-step-accent: var(--pillar-accent-land); }",
  ".explorer-section .catalog-structure-step[data-group=\"living\"] { --catalog-step-surface: var(--pillar-surface-living); --catalog-step-accent: var(--pillar-accent-living); }",
  ".explorer-section .catalog-structure-step[data-group=\"location\"] { --catalog-step-surface: var(--pillar-surface-location); --catalog-step-accent: var(--pillar-accent-location); }",
  ".explorer-section .catalog-structure-step-heading {",
  "  display: flex;",
  "  align-items: center;",
  "  justify-content: space-between;",
  "  gap: 10px;",
  "}",
  ".explorer-section .catalog-structure-step-heading > span {",
  "  padding: 3px 9px;",
  "  color: var(--pillar-accent-ink);",
  "  background: var(--catalog-step-accent);",
  "  border-radius: 999px;",
  "  font-weight: 700;",
  "}",
  ".explorer-section .catalog-structure-step-heading small { color: var(--pillar-text-metadata); font-weight: 600; }",
  ".explorer-section .catalog-structure-step > p { margin: 12px 0 0; color: var(--pillar-text-secondary); }",
  ".explorer-section .catalog-structure-operator {",
  "  align-self: center;",
  "  color: var(--catalog-simple-text);",
  "  font-family: Arvo, serif;",
  "  font-size: 1.5rem;",
  "  font-weight: 700;",
  "}",
  ".explorer-section .catalog-structure-citymeter,",
  ".explorer-section .catalog-structure-outcome {",
  "  display: grid;",
  "  grid-template-columns: auto minmax(0, 1fr);",
  "  align-items: center;",
  "  gap: clamp(16px, 2vw, 24px);",
  "  margin-top: 14px;",
  "  padding: clamp(14px, 1.8vw, 18px);",
  "  background: var(--catalog-simple-panel);",
  "  border: 1px solid var(--catalog-simple-border);",
  "  border-radius: 14px;",
  "}",
  ".explorer-section .catalog-structure-citymeter { border-inline-start: 5px solid var(--pillar-interaction-accent); }",
  ".explorer-section .catalog-structure-citymeter > strong,",
  ".explorer-section .catalog-structure-outcome-route { color: var(--catalog-simple-text); font-weight: 700; }",
  ".explorer-section .catalog-structure-citymeter > p,",
  ".explorer-section .catalog-structure-outcome p { margin: 3px 0 0; color: var(--catalog-simple-secondary); }",
  ".explorer-section .catalog-structure-outcome { border-inline-start: 5px solid var(--pillar-interaction-accent); }",
  ".explorer-section .catalog-structure-outcome-route { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }",
  ".explorer-section .catalog-structure-outcome-route b { color: var(--catalog-simple-text); }",
  "@media (max-width: 720px) {",
  "  .explorer-section .catalog-structure-flow { grid-template-columns: 1fr; gap: 8px; }",
  "  .explorer-section .catalog-structure-operator { justify-self: center; line-height: 1; }",
  "  .explorer-section .catalog-structure-citymeter,",
  "  .explorer-section .catalog-structure-outcome { grid-template-columns: 1fr; gap: 10px; }",
  "}",
  "@media (max-width: 430px) {",
  "  .explorer-section .catalog-structure { padding: 16px; border-radius: 16px; }",
  "}"
].join("\n");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readAsset(name) {
  return readFileSync(join(root, "assets", name), "utf8");
}

function assertImmutableSource(name, source) {
  assert(sha256(source) === expectedHashes[name], "Unexpected immutable source bytes: " + name);
}

function replaceDelimited(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  assert(startIndex >= 0 && source.indexOf(start, startIndex + 1) === -1, label + " start marker must occur exactly once");
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(endIndex >= 0, label + " end marker is missing after its unique start marker");
  return source.slice(0, startIndex) + replacement + source.slice(endIndex);
}

function replaceActiveRef(source, oldValue, newValue, label) {
  const oldCount = source.split(oldValue).length - 1;
  const newCount = source.split(newValue).length - 1;
  assert((oldCount === 1 && newCount === 0) || (oldCount === 0 && newCount === 1), label + " must contain exactly one old or new value");
  return oldCount === 1 ? source.replace(oldValue, newValue) : source;
}

function replaceFigure(source, replacement, label) {
  const matches = source.match(/<figure class="catalog-structure"[\s\S]*?<\/figure>/g) || [];
  assert(matches.length === 1, label + " must contain exactly one catalog structure figure");
  return source.replace(matches[0], replacement);
}

const sourceBundleText = readAsset(sourceBundle);
const sourceCssText = readAsset(sourceCss);
const previousCssText = readAsset(previousCss);
assertImmutableSource(sourceBundle, sourceBundleText);
assertImmutableSource(sourceCss, sourceCssText);
assertImmutableSource(previousCss, previousCssText);

let nextBundle = replaceDelimited(
  sourceBundleText,
  'provisional:"อยู่ระหว่างตรวจสอบ",opensNewTab:"เปิดในแท็บใหม่",story:',
  ',boothHandoff:',
  thaiStory,
  "Thai catalog story"
);
nextBundle = replaceDelimited(
  nextBundle,
  'provisional:"Under review",opensNewTab:"Opens in a new tab",story:',
  ',boothHandoff:',
  englishStory,
  "English catalog story"
);
nextBundle = replaceDelimited(
  nextBundle,
  "function CatalogStructureDiagram(",
  "function Q6(",
  catalogStructureComponent,
  "CatalogStructureDiagram"
);
assert(!nextBundle.includes("catalog-structure-whys") && !nextBundle.includes("catalog-structure-together"), "Retired catalog story blocks remain in the next bundle");
writeFileSync(join(root, "assets", targetBundle), nextBundle);

const nextCss = sourceCssText.trimEnd() + "\n" + diagramCss.trimStart() + "\n";
writeFileSync(join(root, "assets", targetCss), nextCss);

for (const [page, diagram] of [["index.html", thaiDiagram], ["en/index.html", englishDiagram]]) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  html = replaceFigure(html, diagram, page);
  html = replaceActiveRef(html, "index-qbT50gkr-v9.js", targetBundle, page + " bundle ref");
  html = replaceActiveRef(html, "catalog-enhancements-v18.css", targetCss, page + " CSS ref");
  html = replaceActiveRef(html, previousReleaseReceipt, releaseReceipt, page + " receipt");
  writeFileSync(path, html);
}

console.log("Applied " + releaseReceipt + " with immutable v10/v19 assets.");
