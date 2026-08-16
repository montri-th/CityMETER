# CityMETER landing page — team rebuild brief

ฉบับนี้เป็นคู่มือสร้างหน้า CityMETER แบบเดียวกับ release `2026-08-16-motion-image-performance-v23` โดยรักษาเรื่องราว ความจริงของข้อมูล Design System การเข้าถึง และ performance ไว้พร้อมกัน

## 1. เป้าหมายของหน้า

ทำให้คนทั่วไปเริ่มจากคำถามเกี่ยวกับพื้นที่ เห็นตัวอย่างจริง เข้าใจว่าเมืองมองได้ผ่าน Land, Location และ Living แล้วเปิดข้อมูลหรือหลักฐานที่ตรงกับสิ่งที่กำลังตัดสินใจได้

ลำดับการอ่านหลัก:

1. Hero: รู้ทันทีว่า CityMETER ช่วยดูพื้นที่ก่อนตัดสินใจ
2. เลือกโจทย์: เริ่มจากคำถาม ไม่ใช่ชื่อ dataset
3. ตัวอย่างจริง: เห็นหน้าจอและสิ่งที่ดูได้
4. โครงสร้างข้อมูล: Land + Living ช่วยให้เห็น Location และความเปลี่ยนแปลงตามเวลา
5. Catalog: ค้น กรอง เปิดรายละเอียด ดูที่มา และไปยังข้อมูลจริง
6. Mobile handoff, contact และ footer

## 2. โครงสร้างไฟล์ที่ต้องส่งมอบ

หน้านี้ไม่ใช่ single-file HTML และห้ามส่งเฉพาะ `index.html`

- `index.html` — route ภาษาไทย
- `en/index.html` — route ภาษาอังกฤษ
- `assets/index-qbT50gkr-v12.js` — hydrated React owner
- `assets/catalog-enhancements-v21.css` — visual and interaction layer
- `assets/catalog-enhancements-v19.js` — source review, motion และ loading enhancement
- ไฟล์ `assets/index-cqxdfePB.css` และ `assets/citymeter-fonts.css` โดย HTML อ้างอิงพร้อม revision `?v=2` และ `?v=1`
- `data/catalog-source-review.json` — 38 source-review records
- `media/previews-v2/` — evidence captures 1200×750 สำหรับ intent/showcase และต้นฉบับอ้างอิง
- `media/previews-v3/` — presentation thumbnails 800×500 สำหรับ 38 dataset cards
- `media/qr/`, `media/reel/`, `media/social/`, logos, fonts และ supporter marks
- `scripts/build-card-previews.py`, `scripts/apply-motion-image-performance-release.mjs`, `scripts/validate-release.mjs`

ต้องเปิดผ่าน HTTP(S) เช่น local server หรือ GitHub Pages ไม่ใช่ `file://` เพราะ module และ registry fetch จะทำงานไม่ครบ จากโฟลเดอร์รากของ repo ใช้ `python3 -m http.server 8765` แล้วเปิด `http://127.0.0.1:8765/` และ `http://127.0.0.1:8765/en/`

## 3. Source authority และข้อห้าม

1. Landometer Design System v0.8.9 เป็น visual/interaction authority
2. CityMETER Product Brief เป็น product, audience และ claim authority
3. Release receipts เป็นหลักฐาน implementation เฉพาะรุ่น

ข้อกำกับสำคัญ:

- Land / Location / Living เป็น taxonomy ของผลิตภัณฑ์ แต่การจับคู่สีปัจจุบันเป็น component-local candidate ไม่ใช่กฎ DS ระดับระบบ
- Atmosphere gradient ใช้บอกจังหวะ Entry, Orientation และ Closure เท่านั้น ห้ามใช้แทนหมวดข้อมูล สถานะ ความเสี่ยง หรือค่าบนแผนที่
- Locale Insight ใช้เป็น contextual prior สำหรับ service planning, field validation, engagement และ prioritization เท่านั้น ต้อง crosswalk `locale_id` ก่อน aggregate และห้ามใช้แทน official population, eligibility, statutory boundary, risk determination หรือพฤติกรรมจริง
- ภาพ concept ต้องมีป้ายชัดว่าไม่ใช่หน้าจอหรือข้อมูลจริง
- Missing ไม่เท่ากับ zero, modelled ไม่เท่ากับ observed และ appraisal ไม่เท่ากับ transaction price

## 4. ภาษาและ render ownership

ภาษาไทยและอังกฤษต้องเขียนแยกจาก fact record เดียวกัน ไม่ใช้การแทนคำแบบตรงตัว ตรวจ title, CTA, alt, aria-label, transcript, metadata และ empty state แยกแต่ละภาษา

ทุกสิ่งที่เห็นตอนแรกต้องมี owner ครบ:

| ชั้น | Owner | หน้าที่ |
|---|---|---|
| Initial HTML | `index.html`, `en/index.html` | SEO, no-JS, first paint และ static content |
| Hydration | `assets/index-qbT50gkr-v12.js` | React state, intent/filter/share/theme/language และ markup parity |
| Enhancement | `assets/catalog-enhancements-v19.js` | source review, GD Catalog lineage, QR, bounded motion และ image warmup |
| Styling | `assets/catalog-enhancements-v21.css` | DS surfaces, responsive layout, focus, motion fallback |
| Registry | `data/catalog-source-review.json` | source, period, coverage, limits และ direct routes |

ห้ามแก้เฉพาะ HTML หาก React เป็น owner ด้วย เพราะข้อความหรือโครงสร้างจะเปลี่ยนกลับหลัง hydration

## 5. สร้างภาพการ์ดให้เร็ว

ภาพ v2 ทั้ง 38 ภาพมีขนาด 1200×750 รวม 3,736,630 bytes จึงหนักเกินจำเป็นสำหรับ thumbnail card

สร้าง v3 ด้วย:

```bash
python3 -m pip install Pillow==12.3.0
python3 scripts/build-card-previews.py
```

สัญญาของ output:

- libwebp 1.6.0
- 800×500 RGB WebP
- quality 75, method 6, LANCZOS
- 38 files รวมไม่เกิน 1.45 MB
- `media/previews-v3/manifest.json` ต้องเก็บ source/output SHA-256, bytes และ dimensions
- v2 ต้องไม่ถูกแก้ทับ

ใช้ v3 เฉพาะ `.dataset-card`. Intent proof และ showcase ใช้ v2 เพื่อรักษารายละเอียดของหลักฐานสำคัญ

Loading policy:

- dataset images ยังคง `loading="lazy" decoding="async"`
- เมื่อ explorer เข้าใกล้ viewport ให้ promote เฉพาะภาพแถวแรกที่มองเห็น 3 ภาพ
- ข้าม warmup เมื่อเปิด Save-Data หรือเครือข่าย `slow-2g`/`2g`
- ห้าม eager-load หรือ prefetch ทั้ง 38 ภาพพร้อมกัน
- ห้ามเติม query cache-busting หลัง mount

Hero video ใช้ `preload="metadata"`, เริ่มเล่นเมื่อ hero อยู่ใน viewport และไม่ autoplay บน Save-Data/2G; ผู้ใช้ยังสั่งเล่นเองได้

หาก browser ไม่มี `IntersectionObserver` ให้ fail closed คือคงวิดีโอหยุดไว้จนผู้ใช้กดเล่นเอง ตัว enhancer ห้ามเรียก `video.play()` หรือเปิด autoplay ซ้ำ เพราะ React เป็น owner เดียวของนโยบาย viewport/network

## 6. Motion แบบ “reggae groove”

คำว่า reggae หมายถึงจังหวะตอบสนองสั้น–ยาวสลับกัน มีชีวิตชีวาแต่ไม่เด้ง ไม่สั่น และไม่แย่งความสนใจจากข้อมูล

- Expand/collapse card: 280ms, delay `[0, 40, 64, 104, 128, 168]`
- Filter: 280ms, delay `[0, 28, 44, 72, 88, 108]`
- Search: 200ms, delay `[0, 24, 40, 64, 80, 96]`
- Intent: visual มาก่อน copy 48ms
- Details content: แสดงทีละส่วนด้วย `[0, 48, 72, 120, 144]`
- Result count ขยับเบา ๆ เฉพาะเมื่อจำนวนเปลี่ยน

กติกา:

- ใช้ transform/opacity เท่านั้น ไม่ animate height หรือ `transition: all`
- การ์ดที่อยู่ใกล้ control ที่กดตอบสนองก่อน
- เมื่อ interaction ใหม่มา ให้จับ visual rect ก่อนยกเลิก animation เดิม เพื่อไม่ให้ภาพกระโดด
- ห้าม programmatic scroll, parallax, infinite loop, bounce, overshoot หรือ persistent `will-change`
- coarse pointer ใช้ opacity เท่านั้น ไม่ FLIP ทั้ง card
- reduced motion แสดง final state ทันที และหยุด animation ที่กำลังทำงาน
- focus ต้องอยู่ที่ control เดิมตลอด

## 7. ขั้นตอน rebuild

1. เริ่มจาก checkout ที่ตรงกับ release ล่าสุดและ working tree สะอาด
2. ตรวจ registry ว่ามี 38 records และ route/QR ตรงกัน
3. สร้าง preview-v3 ด้วย script ด้านบน
4. แก้ source owner หรือ immutable previous assets; อย่าแก้ built asset รุ่นเก่าทับ
5. รัน `node scripts/apply-motion-image-performance-release.mjs`
6. ตรวจว่า TH/EN อ้างอิง v12/v21/v19 อย่างละหนึ่งครั้ง
7. รัน validation ทั้งหมด
8. เปิด local HTTP และทดสอบทั้งสองภาษา
9. Review exact diff และ hashes ก่อน commit
10. Publish ผ่าน PR/merge ไป `main`; รอ Pages deployment ของ merge SHA แล้วตรวจ live bytes

## 8. Validation ก่อน publish

```bash
node --check assets/index-qbT50gkr-v12.js
node --check assets/catalog-enhancements-v19.js
node --check scripts/apply-motion-image-performance-release.mjs
node --check scripts/validate-release.mjs
python3 -m py_compile scripts/build-card-previews.py
node scripts/validate-release.mjs
git diff --check
```

รัน migration และ image builder ซ้ำใน disposable copy แล้ว output ต้อง byte-identical

Browser matrix ขั้นต่ำ:

- TH/EN
- light/dark/system
- 320, 390, 768, 1024, 1180, 1440px
- mouse, keyboard Enter/Space และ touch/coarse pointer
- expand/collapse, rapid toggle, filters 38→12→13→13→38, search, intent, share, social links
- reduced motion ก่อน interaction และเปิดกลาง animation
- direct `#datasets`, Save-Data/2G fallback และ no-JS
- ไม่มี horizontal overflow, footer tail, duplicate enhancement หรือ failed local request
- ไม่มี hydration warning: JSON-LD ฝั่ง React ต้องสร้าง base จาก canonical route เดียวกับ static HTML และ transcript แต่ละ `<li>` ต้อง hydrate เป็น text node เดียว

Performance acceptance:

- v3 38 thumbnails ≤1.45 MB
- full-scroll payload target ≤3 MB โดยประมาณ
- first visible card row ถูก request เมื่อ explorer เข้าใกล้
- URL รูปไม่ request ซ้ำด้วย query ต่างกัน
- ภาพและข้อความ UI ใน thumbnail ยังอ่านแยกประเภทได้บนจอ 1×/2×

Core Web Vitals ต้องวัดด้วย browser trace จริง; source audit หรือ validator ไม่ถือว่าเป็น CWV evidence

## 9. Release และ rollback

บันทึก reviewed head SHA, merge SHA, deployed SHA, Pages run/deployment ID, checked-at, final URL/status/MIME และ live hashes ของ TH, EN, v12, v21, v19 และ preview manifest

หากพบปัญหา ให้ rollback ด้วย commit ใหม่ที่คืน route refs ไป v11/v20/v18 และ dataset image paths ไป v2 ห้ามแก้หรือลบ historical immutable assets

Manual gates ที่ต้องบันทึกแยก:

- real iPhone Safari/WKWebView: motion, elastic footer, filter/search/details
- real-phone camera: Land Appraisal QR ไปยัง deed route ที่ถูกต้อง
- 1×/2× visual legibility ของ preview-v3
