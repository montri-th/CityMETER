# CityMETER marketing showcase — static preview

หน้า marketing landing page สำหรับ prospect ที่ต้องการเห็นตัวอย่าง implementation จริงของ CityMETER ก่อนเลือกโจทย์ พื้นที่ และข้อมูลที่จะเปิดดูต่อ

## Preview URLs

- Landing page after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/
- Mobile QA after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/mobile-qa.html
- Production target: https://www.landometer.com/citymeter

## Scope

- Exhibition-first hero สำหรับจอ 55 นิ้ว อัตราส่วน 16:9 พร้อม muted looping product reel และ pause control
- ภาษาไทย/อังกฤษตาม URL, preference ที่ผู้ใช้เลือก และภาษา browser
- 5 decision intents สำหรับการลงทุน/พัฒนา การเลือกทำเล การประเมินความเสี่ยง การวางบริการ และงานวิเคราะห์
- Snapshot จากหน้า CityMETER จริงครบ 38 records/modules: Land 12, Location 13, Living 13
- การ์ดทุกใบแสดง feature, coverage และ spatial detail เท่าที่มีหลักฐาน พร้อม direct link ไปยัง viewer
- QR/native share ส่งต่อ exact intent เพื่อพาคนรับกลับมาที่ proof เดียวกัน
- Semantic HTML และ JSON-LD สร้างจาก registry เดียวกับหน้า visible โดยไม่มีหัวข้อเทคนิคในหน้า marketing

The 38 records include datasets, derived modules, monitoring feeds, and two event archives. The preview therefore does not describe every record as a standalone dataset.

## Files

- `src/App.jsx` — marketing experience และ interactions
- `src/marketingCopy.js` — authored Thai/English copy
- `src/marketingData.js` — evidence-safe feature, scope, resolution และ media registry
- `public/media/` — official public mark, 38 live snapshots และ hero reel
- `CityMETER_Landing_Page_Prototype_DS_0.8.9.html` — compatibility entry ที่พาไปยัง review build ล่าสุดใน `index.html`
- `design-qa.md` / `qa/` — visual QA evidence ที่ 1920×1080, desktop และ mobile

## Status

This is a review preview aligned with Landometer Design System v0.8.9. It intentionally carries `noindex` until the production route replaces the current legacy `/citymeter` redirect. Unknown coverage, resolution, source, or definition metadata is never inferred.

Once merged, the static review files publish from `main` through GitHub Pages. The public preview intentionally remains `noindex` until the production cutover is approved.

Before production release, change the current `/citymeter` redirect, confirm the approved horizontal Landometer lockup for normal headers, complete record-level metadata, resolve the live SPA identity issue, and switch `noindex` to the intended production crawler policy.

## Build

```bash
npm install
npm run build
npm run test:sites
```

`vite.config.mjs` uses a relative base by default so the build works under the GitHub Pages repository path. Production can set `VITE_BASE_PATH=/citymeter/` when its asset path is final.
