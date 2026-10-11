# CityMETER marketing showcase

## เริ่มงานสำหรับ intern และ AI agent — 11 ตุลาคม 2026

เปิด [Handoff + Implementation Plan ฉบับรวม r2](docs/unified-handoff/2026-10-11/CityMETER_Landom_Unified_Handoff_Implementation_Plan_2026-10-11.md) ก่อนแก้ **CityMETER Catalog, Article หรือ Landom** เอกสารเดียวรวมข้อกำหนดที่ต้องรักษา ขั้นตอน T00–T12, acceptance checks, inventory 43 dataset และ prompts สำหรับ coding agent

- สำหรับเครื่องมือ: [JSON ฉบับเดียวกัน](docs/unified-handoff/2026-10-11/CityMETER_Landom_Unified_Handoff_Implementation_Plan_2026-10-11.json)
- ไฟล์อ้างอิง ภาพ และวิธีตรวจแพ็ก: [เริ่มจากไฟล์นี้](docs/unified-handoff/2026-10-11/README.md)
- ฉบับคู่กันใน [Landom](https://github.com/montri-th/Landom/tree/main/docs/unified-handoff/2026-10-11)

อ่าน baseline และ D01–D15 แล้วเลือกเฉพาะ task ที่ตรงงาน ไม่ต้องทำส่วนที่เผยแพร่แล้วใหม่ ฉบับนี้รวมคำยืนยันว่า **Locale Insight เวอร์ชันล่าสุดเอิร์ธ (CEDT) พัฒนาต่อจากอิ๋ง** โดยคงเครดิตงานเดิม; baseline hashes และ receipts เก่าแยกจากการเผยแพร่เครดิตใหม่

Current catalog release: 2026-10-10 masonry and executive summaries r3. The catalog renders 43 records in three independent Land / Location / Living lanes, with 24 semantic subgroups, native source disclosures and a static QR to each exact data-view URL. Every data view also has an optional bilingual executive summary with direct map actions, references, credits and sharing links. Current UI colors resolve LDS0.9.7 roles; earlier release notes below are retained history.

Edit and validate with [the maintainer guide](docs/catalog-maintenance.md) and [machine plan](docs/catalog-maintenance.json). The [dataset switcher specification](docs/dataset-switcher.md) is a proposal for the map application, not an installed feature.

หน้า public showcase สำหรับให้ผู้ใช้ค้น เปรียบเทียบ และตรวจข้อจำกัดของตัวอย่าง CityMETER ก่อนเปิดพื้นที่หรือแหล่งข้อมูลที่เกี่ยวข้องต่อ

## แค็ตตาล็อกปัจจุบัน — 2026-10-10

งานแค็ตตาล็อกใหม่ใช้ **LDS 0.9.7** เป็นฐาน: 43 รายการ (Land 13 / Location 16 / Living 14), หน้ารายละเอียดไทย–อังกฤษ 86 หน้า, ที่มา/ช่วงเวลา/ข้อจำกัดใน HTML และ [public JSON](data/catalog.json) พร้อมเครดิตจาก [public Landom projection](https://montri-th.github.io/Landom/data/generated/citymeter-contributors.json) รายการ Business Dynamics ไม่อยู่ใน public catalog นี้

แก้เนื้อหาที่ `src/catalog.json` แล้วรัน `npm run build` และ `npm run check` ด้วย Node 20 ขึ้นไป ไม่ต้องติดตั้ง dependency อ่าน [คู่มือ intern](docs/catalog-maintenance.md) และ [ขั้นตอนสำหรับ agent](docs/catalog-maintenance.json) ก่อนแก้แหล่งข้อมูลหรือ attribution CI ตรวจ PR/main แต่ไม่ deploy จาก PR; การเผยแพร่ยังใช้ GitHub Pages `main` / root เดิม

Initial HTML และ React hydration ใช้ renderer เดียวกันสำหรับ catalog/showcase/identity graph เพื่อไม่ให้ค้นหา กรอง หรือโหลดเสร็จแล้วกลับเป็นข้อมูลเก่า Shell, navigation และสื่อเดิมยังเก็บจาก public release ก่อนหน้า ส่วน audience CSS ปัจจุบันเป็น exact `color-srgb-10` ของ LDS 0.9.7 ขอบเขตนี้ไม่ใช่การอ้างว่าเว็บทั้งหมดผ่าน migration หรือ conformance แล้ว

`data/catalog-build.json` เป็นหลักฐานการสร้างไฟล์และ hash ไม่ใช่ใบยืนยัน deployment รายละเอียด LDS 0.9.1 และตัวเลข 38 รายการด้านล่างเป็นประวัติของ release เก่าเท่านั้น ไม่ใช่ authority หรือจำนวนปัจจุบัน

## ประวัติ public release 2026-09-05 — LDS 0.9.1

สาขานี้เก็บ public release สำหรับ Landometer Design System 0.9.1 ที่ได้รับอนุญาตให้ publish ไปยัง GitHub Pages เดิม

- release: `2026-09-05-citymeter-ds091-public-v6`
- artifact build: `ui-20260905-ds091-public-v6`
- public URL เดิม: <https://montri-th.github.io/CityMETER/>
- public source ก่อน patch นี้: commit `2070b41463322da9d79c2c05d0b2a3a51bcf7f73`
- local hydrated runtime: `assets/index-qbT50gkr-v18.js`
- local enhancement owners: `assets/catalog-enhancements-ds-0.9.1-v30.css`, `assets/catalog-enhancements-ds-0.9.1-v26.js` และ `assets/citymeter-ds-0.9.1-approach-reveal-v1.js`
- unified navigation: `assets/unified-navbar-r7-ds-0.9.1-v34.css` และ `assets/unified-navbar-r7-v32.js`
- DS binding: `0.9.1` / `0.9.1-r8` / `lds-rules-0.9.1` / `v0.9.1-mp7`
- delivery state: `ready_for_publication`, `publishable: true`, `mustNotDeploy: false`

รายละเอียด exact bytes, authority และ QA อยู่ใน `CITYMETER_DS_0.9.1_CALM_TARGET_HOTFIX_2026-09-05_V6.md`, เอกสารฐาน V5 และ `data/citymeter-ds-0.9.1-release-record.json`.

## สิ่งที่ release นี้เปลี่ยน

- ห้ามเส้นบน เส้นซ้าย ขอบ หรือ rail สีเชิงตกแต่งบนการ์ด แผนภาพ ตัวกรอง และ navigation
- ใช้ neutral 1 px separation, quiet surfaces, spacing, typography และ low elevation แทน
- คงสีไว้เฉพาะกรณีที่เป็น focus, interaction หรือ semantic state พร้อมข้อความกำกับ
- ใช้ exact audience projection `assets/landometer-ds/v0.9.1/color-srgb-05.production.css`; ไม่ส่ง raw colour-provenance files
- แสดง Land, Location และ Living เป็น peer dimensions แล้วเชื่อมผ่าน CityMETER ไปสู่ Local Decisions
- ไม่มี motif, motif runtime, motif placement หรือปุ่มควบคุม motif บน active page
- คืนปุ่มภาษาไทย/English และ System/Light/Dark ให้เห็นและใช้งานได้โดยตรงบน desktop พร้อมชุดเดียวกันใน compact menu; ลิงก์ภาษายังทำงานได้เมื่อ JavaScript ใช้ไม่ได้ และพื้นที่กดคงอย่างน้อย 44 px แม้ header เข้าโหมด calm หลังเลื่อนหน้า
- คืน slow reveal ให้ 57 semantic targets ที่มี logical key ไม่ซ้ำต่อภาษา: section headings 3 ชิ้น, showcase media 6 ชิ้น, โครงสร้าง catalogue 8 ชิ้น, snapshot 38 ชิ้น, handoff media 1 ชิ้น และ QR 1 ชิ้น
- ใช้ DS 0.9.1 approach semantics แบบ once-only และ fail-open แต่ยืดเฉพาะ duration ตามคำสั่งเจ้าของเป็น opacity 1,200 ms, transform 1,450 ms และ media 1,350 ms เพื่อให้มองเห็นจังหวะได้ชัด; คงระยะ scale easing observer และ stagger 150/450 ms เดิม ส่วน snapshot ทั้ง 38 ชิ้นไม่หน่วงเป็นคิวยาว
- หลังค้นหา กรอง หรือล้างตัวกรอง snapshot ที่ระบบสร้างใหม่ยังผูกกับรหัสรายการเดิม: ชิ้นที่ reveal แล้วไม่เล่นซ้ำ ส่วนชิ้นที่ยังไม่ถึง viewport ยังรอ reveal ตามเดิม
- hero/LCP, decision proof, search/filter/status, card copy/actions/details, contact CTA, legal และ identity แสดงทันทีเสมอ
- ตัดภาพ snapshot ที่ขยายเมื่อ hover ภายใน media frame รัศมี 15 px เพื่อไม่ให้มุมเหลี่ยมล้นพ้นการ์ดรัศมี 16 px
- คง catalogue 38 records: Land 12, Location 13, Living 13
- source status ปัจจุบัน: verified lineage 11, candidate 7, specialist source 5, derived 2, unproven 13
- source review r5 และ registry ตรงกันก่อน/หลัง hydration ทั้งไทยและอังกฤษ
- JSON-LD ใช้ 36 `Dataset` + 2 event `CreativeWork`; ไม่ใช้ `numberOfItems` ที่เป็น property ของ `ItemList` บน `DataCatalog`
- 3 conceptual previews มีป้ายชัดเจนว่าไม่ใช่หน้าจอหรือข้อมูลจริง
- ลดหรือเอาตัวเลข/ถ้อยคำโปรโมตที่ยังไม่มี exact evidence ออก เช่นจำนวนสาขา ช่วงคาดการณ์ และ freshness
- ใช้เครื่องหมาย depa, dSURE Software และบัญชีบริการดิจิทัล exact PNG หนึ่งชุดใน footer พร้อมข้อความสนับสนุน; ไม่มีสำเนาใน hero
- social links เป็นข้อความที่อ่านได้แทน icon-only controls

## Authority และ evidence

- Master Brand Brief v0.5.3: `data/landometer-master-brand-brief-v0.5.3-approval.json`
- CityMETER Product Brief v6: `data/citymeter-product-brief-v6-approval.json`
- owner publication authorization: `data/citymeter-owner-publication-approval-2026-09-04.json`
- owner confirmation สำหรับ same-owner snapshot reuse: `data/citymeter-owner-media-reuse-confirmation-2026-09-05.json`
- depa project-mark evidence and exact assets: `data/citymeter-depa-supporter-marks-rights-record.json`
- owner direction ให้นำ motif ออกจากหน้า: `owner-message:2026-09-05:remove-motif-from-citymeter`
- owner direction ให้คืน slow reveal ทุกชิ้นที่เข้าเกณฑ์: `owner-message:2026-09-05:restore-slow-reveal-all-eligible-pieces`
- owner direction ให้ reveal ช้าลงและสังเกตได้ชัด: `owner-message:2026-09-05:reveal-slower-and-more-perceivable`
- owner direction ให้คืนภาษาและธีม: `owner-message:2026-09-05:restore-language-and-theme-controls`
- 38-record source ledger: `data/catalog-source-review.json`
- release decision: `data/citymeter-ds-0.9.1-release-record.json`

Owner approval ครบแล้วและไม่ต้องขอซ้ำ ภาพตัวอย่างเป็นภาพจาก Landometer web ที่เจ้าของสั่งให้จับและอนุญาตให้นำมาใช้ข้าม property ภายใต้เจ้าของเดียวกัน โดยคง provider pixels และ attribution เดิมไว้ Release นี้ไม่อ้างระดับรับรองแบบ receipt-based `artifact_qa_passed` / `production_verified`.

## โครงสร้างสำคัญ

- `index.html` / `en/index.html` — prerendered Thai/English public release
- `assets/index-qbT50gkr-v17.js` — immutable migration source
- `assets/index-qbT50gkr-v18.js` — active local hydrated bundle
- `assets/catalog-enhancements-v25.js` — immutable enhancement migration source
- `assets/catalog-enhancements-ds-0.9.1-v26.js` — active local enhancement runtime
- `assets/catalog-enhancements-ds-0.9.1-v30.css` — active local presentation owner
- `assets/unified-navbar-r7-ds-0.9.1-v34.css` / `assets/unified-navbar-r7-v32.js` — active navigation and preference controls
- `assets/citymeter-ds-0.9.1-approach-reveal-v1.js` — active motif-independent slow-reveal runtime
- `assets/landometer-ds/v0.9.1/` — exact DS audience CSS used by the release
- `assets/landometer-motifs/v1/` — inactive immutable history; active HTML does not load these files
- `media/previews-v2/` — high-value intent/showcase captures
- `media/previews-v3/` — 38 card thumbnails at 800 × 500
- `media/supporters/` — exact depa, dSURE Software and Digital Service Account files
- `scripts/apply-citymeter-ds-0.9.1-motif-release.mjs` — deterministic migration
- `scripts/validate-citymeter-ds-0.9.1-release.mjs` — exact release gate
- `CITYMETER_REBUILD_BRIEF.md` — rebuild guide for a future source-level implementation

## Local verification

Serve the repository root and inspect both `/` and `/en/`. Then run:

```bash
node scripts/apply-citymeter-ds-0.9.1-motif-release.mjs --check
node scripts/validate-citymeter-ds-0.9.1-release.mjs
node scripts/validate-unified-navbar-r7.mjs
node scripts/validate-release.mjs
```

Release checks cover Thai/English static–hydrated parity, visible language/theme controls, persisted themes, query/hash-preserving locale routes, 57 unique reveal targets per locale, the recorded owner-directed duration profile with preserved DS stagger/observer values, once-only and fail-open lifecycle, filter-rerender continuity, 360–1600 px widths, deep links, absence of all motif DOM/runtime/style references, rounded hover clipping, supporter assets, duplicate IDs, horizontal overflow and application console/page/request errors.

## Publication boundary

การ publish ได้รับอนุญาตแล้ว และ release record กำหนด `publishable: true`, `mustNotDeploy: false`.

Release นี้ใช้ DS 0.9.1 ด้าน visual, interaction, accessibility และ format behavior และไม่มี motif หรือ motif-specific motion divergence เหลืออยู่ ระยะเวลา reveal ที่ยืดเป็น owner-directed artifact divergence จึงไม่อ้าง exact `MOTION-03`; และยังไม่อ้าง formal `artifact_qa_passed` หรือ `production_verified` จนกว่าจะมี signed receipts ตามระดับดังกล่าว.
