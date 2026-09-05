# CityMETER marketing showcase

หน้า public showcase สำหรับให้ผู้ใช้ค้น เปรียบเทียบ และตรวจข้อจำกัดของตัวอย่าง CityMETER ก่อนเปิดพื้นที่หรือแหล่งข้อมูลที่เกี่ยวข้องต่อ

## สถานะปัจจุบัน

สาขานี้เก็บ public release สำหรับ Landometer Design System 0.9.1 ที่ได้รับอนุญาตให้ publish ไปยัง GitHub Pages เดิม

- release: `2026-09-05-citymeter-ds091-motif-public-v2`
- artifact build: `ui-20260905-ds091-motif-public-v2`
- public URL เดิม: <https://montri-th.github.io/CityMETER/>
- public source ก่อน patch นี้: commit `1c4d70dc2dd4da56ff0f69d919c81219a11fc2f7`
- local hydrated runtime: `assets/index-qbT50gkr-v18.js`
- local enhancement owners: `assets/catalog-enhancements-ds-0.9.1-v27.css` และ `assets/catalog-enhancements-ds-0.9.1-v26.js`
- unified navigation: `assets/unified-navbar-r7-ds-0.9.1-v32.css` และ `assets/unified-navbar-r7-v31.js`
- DS binding: `0.9.1` / `0.9.1-r8` / `lds-rules-0.9.1` / `v0.9.1-mp7`
- delivery state: `ready_for_publication`, `publishable: true`, `mustNotDeploy: false`

รายละเอียด exact bytes, authority และ QA อยู่ใน `CITYMETER_DS_0.9.1_MOTIF_RELEASE_2026-09-05_V2.md` และ `data/citymeter-ds-0.9.1-release-record.json`.

## สิ่งที่ release นี้เปลี่ยน

- ห้ามเส้นบน เส้นซ้าย ขอบ หรือ rail สีเชิงตกแต่งบนการ์ด แผนภาพ ตัวกรอง และ navigation
- ใช้ neutral 1 px separation, quiet surfaces, spacing, typography และ low elevation แทน
- คงสีไว้เฉพาะกรณีที่เป็น focus, interaction หรือ semantic state พร้อมข้อความกำกับ
- ใช้ exact audience projection `assets/landometer-ds/v0.9.1/color-srgb-05.production.css`; ไม่ส่ง raw colour-provenance files
- แสดง Land, Location และ Living เป็น peer dimensions แล้วเชื่อมผ่าน CityMETER ไปสู่ Local Decisions
- ใช้ owner-approved `rings` motif หนึ่งจุดในพื้นที่ว่างเฉพาะของ catalogue orientation ให้มองเห็นได้ทุก breakpoint; component สร้างรูปหนึ่งครั้งแล้ว host เคลื่อนไหวต่อเนื่องตามคำสั่งเจ้าของ พร้อมปุ่มหยุด/เล่น การหยุดเมื่อแท็บอยู่เบื้องหลัง และ static final state สำหรับ reduced motion
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
- owner-approved motif: `assets/landometer-motifs/v1/manifest.json`
- owner direction ให้ motif เคลื่อนไหวต่อเนื่อง: `owner-message:2026-09-05:motif-must-move-continuously`
- 38-record source ledger: `data/catalog-source-review.json`
- release decision: `data/citymeter-ds-0.9.1-release-record.json`

Owner approval ครบแล้วและไม่ต้องขอซ้ำ ภาพตัวอย่างเป็นภาพจาก Landometer web ที่เจ้าของสั่งให้จับและอนุญาตให้นำมาใช้ข้าม property ภายใต้เจ้าของเดียวกัน โดยคง provider pixels และ attribution เดิมไว้ การเคลื่อนไหวตกแต่งแบบต่อเนื่องเป็น page-specific owner direction ที่บันทึกเป็นข้อแตกต่างจาก DS 0.9.1 MOTION-01; release นี้จึงไม่อ้าง full DS conformance หรือระดับรับรองแบบ receipt-based `artifact_qa_passed` / `production_verified`.

## โครงสร้างสำคัญ

- `index.html` / `en/index.html` — prerendered Thai/English public release
- `assets/index-qbT50gkr-v17.js` — immutable migration source
- `assets/index-qbT50gkr-v18.js` — active local hydrated bundle
- `assets/catalog-enhancements-v25.js` — immutable enhancement migration source
- `assets/catalog-enhancements-ds-0.9.1-v26.js` — active local enhancement runtime
- `assets/catalog-enhancements-ds-0.9.1-v27.css` — active local presentation owner
- `assets/landometer-ds/v0.9.1/` — exact DS audience CSS used by the release
- `assets/landometer-motifs/v1/` — exact owner-supplied motif component bytes
- `assets/citymeter-ds-0.9.1-motif-placement-v2.js` — governed placement/motion adapter และ pause/resume control
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

Release checks cover Thai/English static–hydrated parity, 360–1600 px widths, deep links, normal/reduced motion, continuous motif state, pause/resume, rounded hover clipping, supporter assets, filter behavior, duplicate IDs, horizontal overflow and application console/page/request errors.

## Publication boundary

การ publish ได้รับอนุญาตแล้ว และ release record กำหนด `publishable: true`, `mustNotDeploy: false`.

Release นี้ใช้ DS 0.9.1 ด้าน visual, interaction, accessibility และ format behavior ยกเว้น continuous decorative ambient motion ที่เจ้าของเลือกให้ต่างจากข้อกำหนด finite motion ใน MOTION-01 โดยยังคง reduced-motion และ explicit pause/resume. จึงไม่อ้าง full DS conformance, formal `artifact_qa_passed` หรือ `production_verified`; ข้อแตกต่างนี้ไม่ใช่เงื่อนไขห้าม deploy ตาม authority ของ release นี้.
