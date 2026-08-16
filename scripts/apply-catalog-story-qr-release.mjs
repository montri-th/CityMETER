import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-16-catalog-story-qr-v20";
const sourceBundle = "index-qbT50gkr-v6.js";
const targetBundle = "index-qbT50gkr-v9.js";
const sourceCss = "catalog-enhancements-v17.css";
const targetCss = "catalog-enhancements-v18.css";
const analysisBriefOldRecordOrder = 'recordIds:["business-dynamics","buildings","road-network-archetypes","factories-workers-investment","locale-insights","population-age-sex"]';
const analysisBriefRecordOrder = 'recordIds:["business-dynamics","buildings","population-age-sex","road-network-archetypes","factories-workers-investment","locale-insights"]';

const thaiDatasetExplorerEnd = 'provisional:"อยู่ระหว่างตรวจสอบ",opensNewTab:"เปิดในแท็บใหม่"},boothHandoff:';
const thaiDatasetExplorerStory = 'provisional:"อยู่ระหว่างตรวจสอบ",opensNewTab:"เปิดในแท็บใหม่",story:{eyebrow:"38 มุมมองข้อมูลและโมดูล",title:"ข้อมูลเมืองซับซ้อน แต่การใช้งานไม่ควรซับซ้อน",intro:"CityMETER จัดมุมมองข้อมูลต่างเรื่อง ต่างระดับพื้นที่ และต่างช่วงเวลาไว้ใน 3 แกน เพื่อให้เริ่มจากคำถามแล้วหาเรื่องที่ต้องการได้ง่าย",count:c=>`${c} รายการ`,groups:{land:{name:"Land",role:"ฐานกายภาพของพื้นที่",body:"ที่ดิน อาคาร การพัฒนา การใช้ประโยชน์ และตลาดอสังหาริมทรัพย์"},location:{name:"Location",role:"พื้นที่นี้ทำงานอย่างไร",body:"ธุรกิจ ตลาด การเดินทาง การเข้าถึง และบริบทของทำเล"},living:{name:"Living",role:"ผู้คนและชีวิตในพื้นที่",body:"ประชากร การศึกษา บริการสาธารณะ ความเสี่ยง และเหตุการณ์"}},together:"ทั้ง 3 แกนทำงานร่วมกัน",benefits:[{label:"ลึก",body:"เห็นหลายด้านของพื้นที่เดียวกัน"},{label:"ชัด",body:"แยกเรื่อง ขอบเขต และสถานะข้อมูล"},{label:"ง่าย",body:"เริ่มจากคำถาม ไม่ต้องจำชื่อข้อมูล"}],outcome:{label:"Local Decisions",body:"ใช้เพื่อคัดกรอง เปรียบเทียบ จัดลำดับ ติดตาม และวางแผน",boundary:"ผลลัพธ์จากข้อมูล—ไม่ใช่หมวดที่สี่"},citymeter:{title:"ทำไมต้อง CityMETER",body:"คำถามเรื่องพื้นที่หนึ่งข้อ มักต้องใช้ข้อมูลหลายมุม CityMETER ให้เส้นทางเดียวสำหรับค้น เปรียบเทียบ และเปิดหลักฐานที่เกี่ยวข้อง"},landometer:{title:"ทำไมต้อง Landometer",body:"Landometer เชื่อมข้อมูลพื้นที่เข้ากับการตัดสินใจ ทำให้เห็นสิ่งที่ควรตรวจและทำต่อ—ไม่หยุดแค่การแสดงข้อมูล"},boundary:"38 หมายถึงมุมมองข้อมูลและโมดูล ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน แต่ละรายการอาจมีที่มา ช่วงเวลา พื้นที่ครอบคลุม และข้อจำกัดต่างกัน และไม่ใช่ทุกรายการจะเปลี่ยนตามเวลา จึงควรเปิดตรวจรายละเอียดของแต่ละรายการก่อนใช้"}},boothHandoff:';

const englishDatasetExplorerEnd = 'provisional:"Under review",opensNewTab:"Opens in a new tab"},boothHandoff:';
const englishDatasetExplorerStory = 'provisional:"Under review",opensNewTab:"Opens in a new tab",story:{eyebrow:"38 DATA VIEWS & MODULES",title:"City data is complex. Using it should not be.",intro:"CityMETER organises views across topics, geographic levels and time periods into three lenses, so people can start with a question and find what matters.",count:c=>`${c} ${c===1?"view":"views"}`,groups:{land:{name:"Land",role:"The physical base",body:"Land, buildings, development, land use and property markets"},location:{name:"Location",role:"How the place works",body:"Business, markets, mobility, access and local context"},living:{name:"Living",role:"People and life in the place",body:"Population, education, public services, hazards and events"}},together:"Three lenses work together",benefits:[{label:"Deep",body:"See several dimensions of the same place"},{label:"Clear",body:"Keep topic, scope and status distinct"},{label:"Easy",body:"Start with a question, not a dataset name"}],outcome:{label:"Local Decisions",body:"Use the evidence to screen, compare, prioritise, monitor and plan",boundary:"An outcome layer—not a fourth data category"},citymeter:{title:"Why CityMETER",body:"One place question often needs several kinds of evidence. CityMETER gives people one path to find, compare and inspect the relevant views."},landometer:{title:"Why Landometer",body:"Landometer connects place data to a decision, keeping the next check and action in view—not only displaying information."},boundary:"The 38 items are data views and modules, not 38 independent source databases. Sources, periods, coverage and limitations vary, and not every view is time-dynamic. Inspect each record before use."}},boothHandoff:';

const componentSeam = '}function Q6(';
const catalogStructureComponent = `}function CatalogStructureDiagram({language:c,text:f}){const g=f.datasetExplorer.story;return p.jsxs("figure",{className:"catalog-structure","aria-labelledby":"catalog-structure-title","aria-describedby":"catalog-structure-description",children:[p.jsxs("figcaption",{className:"catalog-structure-caption",children:[p.jsx("p",{className:"eyebrow",children:g.eyebrow}),p.jsx("h3",{id:"catalog-structure-title",children:g.title}),p.jsx("p",{id:"catalog-structure-description",children:g.intro})]}),p.jsx("ul",{className:"catalog-structure-groups",children:p6.map(v=>{const E=g.groups[v.id];return p.jsxs("li",{className:"catalog-structure-group","data-group":v.id,children:[p.jsxs("div",{className:"catalog-structure-group-heading",children:[p.jsx("span",{className:"catalog-structure-group-name",lang:"en",children:E.name}),p.jsx("strong",{children:g.count(v.count)})]}),p.jsx("p",{className:"catalog-structure-group-role",children:E.role}),p.jsx("p",{children:E.body})]},v.id)})}),p.jsx("p",{className:"catalog-structure-together",children:g.together}),p.jsx("ul",{className:"catalog-structure-benefits",children:g.benefits.map(v=>p.jsxs("li",{children:[p.jsx("strong",{children:v.label}),p.jsx("span",{children:v.body})]},v.label))}),p.jsxs("div",{className:"catalog-structure-outcome",children:[p.jsxs("div",{className:"catalog-structure-local-decisions",children:[p.jsx("span",{className:"catalog-structure-outcome-label",lang:"en",children:g.outcome.label}),p.jsx("p",{children:g.outcome.body}),p.jsx("small",{children:g.outcome.boundary})]}),p.jsxs("div",{className:"catalog-structure-whys",children:[p.jsxs("div",{children:[p.jsx("strong",{children:g.citymeter.title}),p.jsx("p",{children:g.citymeter.body})]}),p.jsxs("div",{children:[p.jsx("strong",{children:g.landometer.title}),p.jsx("p",{children:g.landometer.body})]})]})]}),p.jsx("p",{className:"catalog-structure-boundary",children:g.boundary})]})}function Q6(`;

const diagramCallSeam = 'p.jsx(oc,{eyebrow:f.datasetExplorer.eyebrow,title:f.datasetExplorer.title,intro:f.datasetExplorer.intro,id:"datasets-title"}),p.jsxs("div",{className:"explorer-toolbar"';
const diagramCall = 'p.jsx(oc,{eyebrow:f.datasetExplorer.eyebrow,title:f.datasetExplorer.title,intro:f.datasetExplorer.intro,id:"datasets-title"}),p.jsx(CatalogStructureDiagram,{language:c,text:f}),p.jsxs("div",{className:"explorer-toolbar"';

const thaiDiagram = `<figure class="catalog-structure" aria-labelledby="catalog-structure-title" aria-describedby="catalog-structure-description"><figcaption class="catalog-structure-caption"><p class="eyebrow">38 มุมมองข้อมูลและโมดูล</p><h3 id="catalog-structure-title">ข้อมูลเมืองซับซ้อน แต่การใช้งานไม่ควรซับซ้อน</h3><p id="catalog-structure-description">CityMETER จัดมุมมองข้อมูลต่างเรื่อง ต่างระดับพื้นที่ และต่างช่วงเวลาไว้ใน 3 แกน เพื่อให้เริ่มจากคำถามแล้วหาเรื่องที่ต้องการได้ง่าย</p></figcaption><ul class="catalog-structure-groups"><li class="catalog-structure-group" data-group="land"><div class="catalog-structure-group-heading"><span class="catalog-structure-group-name" lang="en">Land</span><strong>12 รายการ</strong></div><p class="catalog-structure-group-role">ฐานกายภาพของพื้นที่</p><p>ที่ดิน อาคาร การพัฒนา การใช้ประโยชน์ และตลาดอสังหาริมทรัพย์</p></li><li class="catalog-structure-group" data-group="location"><div class="catalog-structure-group-heading"><span class="catalog-structure-group-name" lang="en">Location</span><strong>13 รายการ</strong></div><p class="catalog-structure-group-role">พื้นที่นี้ทำงานอย่างไร</p><p>ธุรกิจ ตลาด การเดินทาง การเข้าถึง และบริบทของทำเล</p></li><li class="catalog-structure-group" data-group="living"><div class="catalog-structure-group-heading"><span class="catalog-structure-group-name" lang="en">Living</span><strong>13 รายการ</strong></div><p class="catalog-structure-group-role">ผู้คนและชีวิตในพื้นที่</p><p>ประชากร การศึกษา บริการสาธารณะ ความเสี่ยง และเหตุการณ์</p></li></ul><p class="catalog-structure-together">ทั้ง 3 แกนทำงานร่วมกัน</p><ul class="catalog-structure-benefits"><li><strong>ลึก</strong><span>เห็นหลายด้านของพื้นที่เดียวกัน</span></li><li><strong>ชัด</strong><span>แยกเรื่อง ขอบเขต และสถานะข้อมูล</span></li><li><strong>ง่าย</strong><span>เริ่มจากคำถาม ไม่ต้องจำชื่อข้อมูล</span></li></ul><div class="catalog-structure-outcome"><div class="catalog-structure-local-decisions"><span class="catalog-structure-outcome-label">Local Decisions</span><p>ใช้เพื่อคัดกรอง เปรียบเทียบ จัดลำดับ ติดตาม และวางแผน</p><small>ผลลัพธ์จากข้อมูล—ไม่ใช่หมวดที่สี่</small></div><div class="catalog-structure-whys"><div><strong>ทำไมต้อง CityMETER</strong><p>คำถามเรื่องพื้นที่หนึ่งข้อ มักต้องใช้ข้อมูลหลายมุม CityMETER ให้เส้นทางเดียวสำหรับค้น เปรียบเทียบ และเปิดหลักฐานที่เกี่ยวข้อง</p></div><div><strong>ทำไมต้อง Landometer</strong><p>Landometer เชื่อมข้อมูลพื้นที่เข้ากับการตัดสินใจ ทำให้เห็นสิ่งที่ควรตรวจและทำต่อ—ไม่หยุดแค่การแสดงข้อมูล</p></div></div></div><p class="catalog-structure-boundary">38 หมายถึงมุมมองข้อมูลและโมดูล ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน แต่ละรายการอาจมีที่มา ช่วงเวลา พื้นที่ครอบคลุม และข้อจำกัดต่างกัน และไม่ใช่ทุกรายการจะเปลี่ยนตามเวลา จึงควรเปิดตรวจรายละเอียดของแต่ละรายการก่อนใช้</p></figure>`;

const englishDiagram = `<figure class="catalog-structure" aria-labelledby="catalog-structure-title" aria-describedby="catalog-structure-description"><figcaption class="catalog-structure-caption"><p class="eyebrow">38 DATA VIEWS &amp; MODULES</p><h3 id="catalog-structure-title">City data is complex. Using it should not be.</h3><p id="catalog-structure-description">CityMETER organises views across topics, geographic levels and time periods into three lenses, so people can start with a question and find what matters.</p></figcaption><ul class="catalog-structure-groups"><li class="catalog-structure-group" data-group="land"><div class="catalog-structure-group-heading"><span class="catalog-structure-group-name" lang="en">Land</span><strong>12 views</strong></div><p class="catalog-structure-group-role">The physical base</p><p>Land, buildings, development, land use and property markets</p></li><li class="catalog-structure-group" data-group="location"><div class="catalog-structure-group-heading"><span class="catalog-structure-group-name" lang="en">Location</span><strong>13 views</strong></div><p class="catalog-structure-group-role">How the place works</p><p>Business, markets, mobility, access and local context</p></li><li class="catalog-structure-group" data-group="living"><div class="catalog-structure-group-heading"><span class="catalog-structure-group-name" lang="en">Living</span><strong>13 views</strong></div><p class="catalog-structure-group-role">People and life in the place</p><p>Population, education, public services, hazards and events</p></li></ul><p class="catalog-structure-together">Three lenses work together</p><ul class="catalog-structure-benefits"><li><strong>Deep</strong><span>See several dimensions of the same place</span></li><li><strong>Clear</strong><span>Keep topic, scope and status distinct</span></li><li><strong>Easy</strong><span>Start with a question, not a dataset name</span></li></ul><div class="catalog-structure-outcome"><div class="catalog-structure-local-decisions"><span class="catalog-structure-outcome-label">Local Decisions</span><p>Use the evidence to screen, compare, prioritise, monitor and plan</p><small>An outcome layer—not a fourth data category</small></div><div class="catalog-structure-whys"><div><strong>Why CityMETER</strong><p>One place question often needs several kinds of evidence. CityMETER gives people one path to find, compare and inspect the relevant views.</p></div><div><strong>Why Landometer</strong><p>Landometer connects place data to a decision, keeping the next check and action in view—not only displaying information.</p></div></div></div><p class="catalog-structure-boundary">The 38 items are data views and modules, not 38 independent source databases. Sources, periods, coverage and limitations vary, and not every view is time-dynamic. Inspect each record before use.</p></figure>`;

const diagramCss = `

/* CityMETER catalog structure explainer — release v20.
   This component-local diagram uses flat categorical surfaces and visible
   labels. Atmosphere gradients remain reserved for journey moments. */
.explorer-section .catalog-structure {
  --catalog-structure-surface: #ffffff;
  --catalog-structure-text: #182327;
  --catalog-structure-secondary: #5f635a;
  --catalog-structure-border: #7d877f;
  --catalog-structure-soft: #eef1ee;
  margin: 0 0 clamp(24px, 3vw, 36px);
  padding: clamp(22px, 3vw, 34px);
  color: var(--catalog-structure-text);
  background: var(--catalog-structure-surface);
  border: 1px solid var(--catalog-structure-border);
  border-radius: 24px;
}

[data-theme="dark"] .explorer-section .catalog-structure {
  --catalog-structure-surface: #293337;
  --catalog-structure-text: #f1f4ef;
  --catalog-structure-secondary: #c4ceca;
  --catalog-structure-border: #7c8a84;
  --catalog-structure-soft: #172126;
}

.explorer-section .catalog-structure-caption {
  max-width: 78ch;
}

.explorer-section .catalog-structure-caption h3 {
  margin: 8px 0 10px;
  font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  line-height: 1.2;
}

.explorer-section .catalog-structure-caption > p:last-child,
.explorer-section .catalog-structure-boundary {
  color: var(--catalog-structure-secondary);
}

.explorer-section .catalog-structure-groups,
.explorer-section .catalog-structure-benefits {
  list-style: none;
  padding: 0;
}

.explorer-section .catalog-structure-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(12px, 1.5vw, 18px);
  margin: clamp(22px, 3vw, 32px) 0 0;
}

.explorer-section .catalog-structure-group {
  --catalog-group-surface: var(--pillar-surface-alt);
  --catalog-group-accent: var(--pillar-interaction-accent);
  min-width: 0;
  padding: clamp(16px, 2vw, 22px);
  color: var(--pillar-text-primary);
  background: var(--catalog-group-surface);
  border: 1px solid var(--pillar-border-emphasis);
  border-block-start: 5px solid var(--catalog-group-accent);
  border-radius: 16px;
}

.explorer-section .catalog-structure-group[data-group="land"] {
  --catalog-group-surface: var(--pillar-surface-land);
  --catalog-group-accent: var(--pillar-accent-land);
}

.explorer-section .catalog-structure-group[data-group="location"] {
  --catalog-group-surface: var(--pillar-surface-location);
  --catalog-group-accent: var(--pillar-accent-location);
}

.explorer-section .catalog-structure-group[data-group="living"] {
  --catalog-group-surface: var(--pillar-surface-living);
  --catalog-group-accent: var(--pillar-accent-living);
}

.explorer-section .catalog-structure-group-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.explorer-section .catalog-structure-group-name {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  color: var(--pillar-accent-ink);
  background: var(--catalog-group-accent);
  border-radius: 999px;
  font-weight: 700;
}

.explorer-section .catalog-structure-group-heading strong {
  color: var(--pillar-text-metadata);
  font-size: .8125rem;
}

.explorer-section .catalog-structure-group-role {
  margin: 0 0 6px;
  color: var(--pillar-text-primary);
  font-weight: 700;
}

.explorer-section .catalog-structure-group > p:last-child {
  margin: 0;
  color: var(--pillar-text-secondary);
}

.explorer-section .catalog-structure-together {
  margin: 20px 0 10px;
  color: var(--catalog-structure-secondary);
  text-align: center;
  font-weight: 600;
}

.explorer-section .catalog-structure-benefits {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  overflow: clip;
  background: var(--catalog-structure-border);
  border: 1px solid var(--catalog-structure-border);
  border-radius: 16px;
}

.explorer-section .catalog-structure-benefits li {
  min-width: 0;
  padding: 16px;
  background: var(--catalog-structure-soft);
}

.explorer-section .catalog-structure-benefits strong,
.explorer-section .catalog-structure-benefits span {
  display: block;
}

.explorer-section .catalog-structure-benefits strong {
  margin-bottom: 4px;
  color: var(--catalog-structure-text);
}

.explorer-section .catalog-structure-benefits span {
  color: var(--catalog-structure-secondary);
}

.explorer-section .catalog-structure-outcome {
  display: grid;
  grid-template-columns: minmax(0, .85fr) minmax(0, 1.65fr);
  gap: clamp(12px, 1.5vw, 18px);
  margin-top: clamp(16px, 2vw, 22px);
}

.explorer-section .catalog-structure-local-decisions,
.explorer-section .catalog-structure-whys > div {
  min-width: 0;
  padding: clamp(16px, 2vw, 20px);
  background: var(--catalog-structure-soft);
  border: 1px solid var(--catalog-structure-border);
  border-radius: 16px;
}

.explorer-section .catalog-structure-outcome-label {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--catalog-structure-text);
  font-weight: 700;
}

.explorer-section .catalog-structure-local-decisions p,
.explorer-section .catalog-structure-whys p {
  margin: 0;
  color: var(--catalog-structure-secondary);
}

.explorer-section .catalog-structure-local-decisions small {
  display: block;
  margin-top: 8px;
  color: var(--catalog-structure-secondary);
}

.explorer-section .catalog-structure-whys {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 1.5vw, 18px);
  min-width: 0;
}

.explorer-section .catalog-structure-whys strong {
  display: block;
  margin-bottom: 8px;
  color: var(--catalog-structure-text);
}

.explorer-section .catalog-structure-boundary {
  margin: 18px 0 0;
  font-size: .875rem;
}

@media (max-width: 900px) {
  .explorer-section .catalog-structure-outcome {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .explorer-section .catalog-structure-groups,
  .explorer-section .catalog-structure-benefits,
  .explorer-section .catalog-structure-whys {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .explorer-section .catalog-structure {
    padding: 18px;
    border-radius: 18px;
  }

  .explorer-section .catalog-structure-groups,
  .explorer-section .catalog-structure-outcome,
  .explorer-section .catalog-structure-whys {
    gap: 10px;
  }
}
`;

function count(source, value) {
  return source.split(value).length - 1;
}

function replaceRequired(source, before, after, label) {
  const occurrences = count(source, before);
  if (occurrences !== 1) throw new Error(`${label}: expected exactly one match; found ${occurrences}`);
  return source.replace(before, after);
}

function updateHtml(page, diagram, toolbarMarker, previousBoundary, currentBoundary) {
  const path = join(root, page);
  let source = readFileSync(path, "utf8");

  for (const [before, after, label] of [
    [sourceBundle, targetBundle, "main bundle"],
    [sourceCss, targetCss, "catalog stylesheet"],
    ["2026-08-15-atmosphere-scroll-v17", releaseReceipt, "release receipt"]
  ]) {
    const beforeCount = count(source, before);
    const afterCount = count(source, after);
    if (beforeCount === 1 && afterCount === 0) {
      source = source.replace(before, after);
    } else if (!(beforeCount === 0 && afterCount === 1)) {
      throw new Error(`${page}: expected exactly one current or final ${label}`);
    }
  }

  if (count(source, 'class="catalog-structure"') === 0) {
    source = replaceRequired(source, toolbarMarker, `${diagram}${toolbarMarker}`, `${page} catalog diagram insertion`);
  } else if (count(source, 'class="catalog-structure"') !== 1) {
    throw new Error(`${page}: catalog structure diagram is missing or duplicated`);
  } else {
    const previousCount = count(source, previousBoundary);
    const currentCount = count(source, currentBoundary);
    if (previousCount === 1 && currentCount === 0) {
      source = source.replace(previousBoundary, currentBoundary);
    } else if (!(previousCount === 0 && currentCount === 1)) {
      throw new Error(`${page}: expected exactly one previous or current catalog evidence boundary`);
    }
  }

  const previousOutcomeLabel = '<span class="catalog-structure-outcome-label">Local Decisions</span>';
  const currentOutcomeLabel = '<span class="catalog-structure-outcome-label" lang="en">Local Decisions</span>';
  const previousOutcomeCount = count(source, previousOutcomeLabel);
  const currentOutcomeCount = count(source, currentOutcomeLabel);
  if (previousOutcomeCount === 1 && currentOutcomeCount === 0) {
    source = source.replace(previousOutcomeLabel, currentOutcomeLabel);
  } else if (!(previousOutcomeCount === 0 && currentOutcomeCount === 1)) {
    throw new Error(`${page}: expected exactly one previous or current Local Decisions language contract`);
  }

  const headingIndex = source.indexOf('id="datasets-title"');
  const diagramIndex = source.indexOf('class="catalog-structure"');
  const toolbarIndex = source.indexOf(toolbarMarker);
  if (!(headingIndex >= 0 && headingIndex < diagramIndex && diagramIndex < toolbarIndex)) {
    throw new Error(`${page}: catalog structure diagram must sit between the heading and filters`);
  }
  writeFileSync(path, source);
}

let bundle = readFileSync(join(root, "assets", sourceBundle), "utf8");
bundle = replaceRequired(bundle, analysisBriefOldRecordOrder, analysisBriefRecordOrder, "analysis-brief related-record order");
bundle = replaceRequired(bundle, thaiDatasetExplorerEnd, thaiDatasetExplorerStory, "Thai catalog story copy");
bundle = replaceRequired(bundle, englishDatasetExplorerEnd, englishDatasetExplorerStory, "English catalog story copy");
bundle = replaceRequired(bundle, componentSeam, catalogStructureComponent, "catalog structure component");
bundle = replaceRequired(bundle, diagramCallSeam, diagramCall, "catalog structure render owner");
writeFileSync(join(root, "assets", targetBundle), bundle);

const css = readFileSync(join(root, "assets", sourceCss), "utf8");
if (css.includes("catalog structure explainer")) throw new Error("The immutable v17 CSS already contains the v20 diagram block");
writeFileSync(join(root, "assets", targetCss), `${css.trimEnd()}${diagramCss}`);

updateHtml(
  "index.html",
  thaiDiagram,
  '<div class="explorer-toolbar" aria-label="ตัวกรองข้อมูล">',
  "38 หมายถึงมุมมองข้อมูลและโมดูล ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน ที่มา ช่วงเวลา พื้นที่ครอบคลุม และข้อจำกัดจึงอาจต่างกันในแต่ละรายการ",
  "38 หมายถึงมุมมองข้อมูลและโมดูล ไม่ใช่ฐานข้อมูลต้นทาง 38 ฐาน แต่ละรายการอาจมีที่มา ช่วงเวลา พื้นที่ครอบคลุม และข้อจำกัดต่างกัน และไม่ใช่ทุกรายการจะเปลี่ยนตามเวลา จึงควรเปิดตรวจรายละเอียดของแต่ละรายการก่อนใช้"
);
updateHtml(
  "en/index.html",
  englishDiagram,
  '<div class="explorer-toolbar" aria-label="Data filters">',
  "The 38 items are data views and modules, not 38 independent source databases. Sources, periods, coverage and limitations can vary by record.",
  "The 38 items are data views and modules, not 38 independent source databases. Sources, periods, coverage and limitations vary, and not every view is time-dynamic. Inspect each record before use."
);

console.log(`Applied CityMETER ${releaseReceipt}`);
