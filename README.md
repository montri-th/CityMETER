# CityMETER marketing showcase — static preview

หน้า marketing landing page สำหรับ prospect ที่ต้องการเห็นตัวอย่าง implementation จริงของ CityMETER ก่อนเลือกโจทย์ พื้นที่ และข้อมูลที่จะเปิดดูต่อ

## Preview URLs

- Landing page after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/
- English initial HTML: https://montri-th.github.io/CityMETER/en/
- Exhibition loop mode: https://montri-th.github.io/CityMETER/?display=exhibition
- Mobile QA after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/mobile-qa.html
- Production target: https://www.landometer.com/citymeter

## Scope

- Exhibition-first hero สำหรับจอ 55 นิ้ว อัตราส่วน 16:9 พร้อม reel 17.2 วินาทีที่พาเห็น business pattern → demand → locale → road network → flood lifecycle, caption ไทย/อังกฤษ และ pause control; โหมด exhibition ใช้ไฟล์ 1280×720 แยกจากไฟล์เว็บ 960×540
- ภาษาไทย/อังกฤษตาม URL, preference ที่ผู้ใช้เลือก และภาษา browser พร้อม quiet icon controls
- Theme system / light / dark โดยจำ preference ของผู้ใช้
- 5 decision intents สำหรับการลงทุน/พัฒนา การเลือกทำเล การประเมินความเสี่ยง การวางบริการ และงานวิเคราะห์
- Snapshot จากหน้า CityMETER จริงครบ 38 records/modules: Land 12, Location 13, Living 13; 31 ภาพพร้อมใช้และ 7 ภาพแสดงสถานะ limited อย่างชัดเจนแทนการปล่อยภาพว่าง/เสีย
- การ์ดทุกใบแสดง feature, coverage และ spatial detail เท่าที่มีหลักฐาน พร้อม direct link ไปยัง viewer
- QR/native share ส่งต่อ exact intent เพื่อพาคนรับกลับมาที่ proof เดียวกัน
- Semantic HTML และ JSON-LD สร้างจาก registry เดียวกับหน้า visible โดยไม่มีหัวข้อเทคนิคในหน้า marketing

The 38 records include datasets, derived modules, monitoring feeds, and two event archives. The preview therefore does not describe every record as a standalone dataset.

## Files

- `src/App.jsx` — marketing experience และ interactions
- `src/marketingCopy.js` — authored Thai/English copy
- `src/marketingData.js` — evidence-safe feature, scope, resolution และ media registry
- `src/previewConfig.js` — dataset-specific visual focus และสถานะภาพครบ 38 รายการ
- `media/` — owner-supplied horizontal Landometer logo derivative, 38 focused previews และ web/exhibition hero reel v2
- `CityMETER_Landing_Page_Prototype_DS_0.8.9.html` — lightweight noindex entry file ที่พาไปยัง static showcase หลัก
- `design-qa.md` / `qa/` — visual QA evidence ที่ 1920×1080, desktop และ mobile

## Status

This public preview is aligned with Landometer Design System v0.8.9 and is indexable. Unknown coverage, resolution, source, or definition metadata is never inferred.

Once merged, the static files publish from `main` through GitHub Pages. Before the production-domain cutover, change the current `/citymeter` redirect, complete record-level metadata, resolve the live SPA identity issue, and clear product/satellite screenshot reuse rights.

## Build

```bash
npm install
npm run build
npm run test:sites
```

`vite.config.mjs` uses a relative base by default so the build works under the GitHub Pages repository path. Production can set `VITE_BASE_PATH=/citymeter/` when its asset path is final.
