# CityMETER marketing showcase — static preview

หน้า marketing landing page สำหรับ prospect ที่ต้องการเห็นตัวอย่าง implementation จริงของ CityMETER ก่อนเลือกโจทย์ พื้นที่ และข้อมูลที่จะเปิดดูต่อ

## Preview URLs

- Landing page after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/
- English initial HTML: https://montri-th.github.io/CityMETER/en/
- Exhibition loop mode: https://montri-th.github.io/CityMETER/?display=exhibition
- Mobile QA after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/mobile-qa.html
- Production target: https://www.landometer.com/citymeter

## Scope

- Exhibition-first hero อัตราส่วน 16:9 พร้อม reel 12.958 วินาที 3 chapter ตามลำดับ Population + Building → Municipality → Tourism, caption ไทย/อังกฤษ และปุ่ม Pause/Play เพียงปุ่มเดียว; autoplay แบบ muted/playsinline และวนต่อเนื่องเป็นค่าเริ่มต้น
- ภาษาไทย/อังกฤษตาม URL, preference ที่ผู้ใช้เลือก และภาษา browser พร้อม quiet icon controls
- Theme system / light / dark โดยจำ preference ของผู้ใช้
- 5 decision intents สำหรับการลงทุน/พัฒนา การเลือกทำเล การประเมินความเสี่ยง การวางบริการ และงานวิเคราะห์
- Snapshot dark theme ครบ 38 records/modules: ภาพจริงที่รอ map/legend/sidebar settle 35 ใบ และภาพประกอบแนวคิดที่ติดป้ายชัดเจน 3 ใบสำหรับ Fire, Hatyai Flood และ QuakeSafe
- การ์ดทุกใบแสดง feature, coverage, source-review status, วิธีอ่านและ direct link; 11 ใบที่ยืนยัน same-dataset lineage ผ่านช่องทางทางการแสดงโลโก้ GD Catalog โดยไม่อ้างว่าเป็น direct central-GD download
- QR เฉพาะ dataset ครบ 38 ใบ ซ่อนอยู่ใน source disclosure และพาไป exact CityMETER viewer URL
- Pinterest-style masonry ใช้ความสูงจริงของ card และ reflow เมื่อเปิด source/QR
- Semantic HTML และ JSON-LD สร้างจาก registry เดียวกับหน้า visible โดยไม่มีหัวข้อเทคนิคในหน้า marketing

The 38 records include datasets, derived modules, monitoring feeds, and two event archives. The preview therefore does not describe every record as a standalone dataset.

## Files

- `index.html` / `en/index.html` — deployed prerendered Thai/English output
- `assets/index-qbT50gkr.js` / `assets/index-cqxdfePB.css` — original compiled React application output (the referenced Vite `src/` files are not present in this repository)
- `assets/catalog-enhancements.js` / `assets/catalog-enhancements.css` — maintainable post-hydration layer for source drawers, QR, masonry and the mobile hero structure
- `data/catalog-source-review.json` — bilingual 38-record source ledger reviewed on 14 August 2026
- `media/` — owner-supplied Landometer logo, optimized GD Catalog logo, 38 dark previews, 38 QR assets, governed concept illustrations and the three-chapter web/exhibition reel
- `scripts/generate-qr-assets.mjs` — reproducible dataset-URL QR generator
- `CityMETER_Landing_Page_Prototype_DS_0.8.9.html` — lightweight noindex entry file ที่พาไปยัง static showcase หลัก
- `design-qa.md` / `qa/` — visual QA evidence ที่ 1920×1080, desktop และ mobile

## Status

This public preview is aligned with Landometer Design System v0.8.9 and is indexable. Unknown coverage, resolution, source, or definition metadata is never inferred. Source labels distinguish verified same-dataset lineage, candidates, other providers, derived layers and unproven public lineage.

Once merged, the static files publish from `main` through GitHub Pages. Before the production-domain cutover, change the current `/citymeter` redirect, complete record-level metadata, resolve the live SPA identity issue, and clear product/satellite screenshot reuse rights.

## Build

The repository currently contains the compiled/prerendered site rather than the Vite source tree named by older README revisions. Regenerate QR assets after changing any direct viewer URL:

```bash
node scripts/generate-qr-assets.mjs
```

Then serve the repository root with any static HTTP server and verify both `/` and `/en/`. Do not edit only the prerendered card markup: React hydration owns the base application, while the separate enhancement layer owns this catalog revision.
