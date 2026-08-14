# CityMETER branding + canonical deep-link release — 14 August 2026

**เว็บไซต์:** https://montri-th.github.io/CityMETER/

**สถานะฐานก่อน revision นี้:** Published to GitHub Pages after release validation

**Revision ก่อนหน้า — วงกลมโลโก้ + muted surfaces + benefit-first copy:** Published to GitHub Pages; automated gates และ production browser QA ผ่าน

**Revision ปัจจุบัน — Measure deep + radial logos + canonical fonts:** local syntax, migration idempotency, release validator และ diff checks ผ่าน; ยังไม่ commit, publish หรือทำ production QA

## สิ่งที่ผู้ชมเห็น

- เปลี่ยน headline หลักทั้งภาษาไทยและอังกฤษเป็น `CityMETER`
- แยก lockup `depa × dSURE software × บัญชีบริการดิจิทัล` เป็น PNG โปร่งใส 3 ไฟล์จากไฟล์ต้นฉบับ โดย crop อย่างเดียว ไม่วาดใหม่ ไม่ลบสีขาวภายในเครื่องหมาย และคง quiet zone 80 px
  - ใน hero และ footer วางบนวงกลม CSS เส้นผ่านศูนย์กลางเท่ากัน 3 วง โดยปรับเฉพาะ optical size ภายในวงกลมให้แต่ละเครื่องหมายอ่านออก
  - พื้นวงกลมเป็น radial fade จาก `rgba(255,255,255,.5)` กลางวงสู่ `rgba(255,255,255,0)` ที่ขอบ ไม่มี border หรือ box-shadow; ไฟล์เครื่องหมายยังโปร่งใสและไม่ถูก crop, mask, filter, recolor หรือวาดใหม่
- แก้ footer ที่ล้นช่วง tablet/หน้าต่างขนาดกลาง โดยให้ grid child ย่อได้ เมนูตัดบรรทัดได้ และเปลี่ยนเป็นคอลัมน์เดียวตั้งแต่ 900 px
- แบ่งจังหวะของหน้าโดยใช้ surface สีอ่อนต่างกันในแต่ละ section จาก token ของ Design System v0.8.9 แทนการเติมสีสดหรือองค์ประกอบตกแต่ง
  - Light: canvas `#F6F7F3`, blue tint `#E2E9ED`, beige tint `#F2F1DF`, soft `#E5E9E6`, alt `#EEF1EE`
  - Dark: canvas `#11191D`, blue tint `#18333E`, beige tint `#2C2A22`, soft `#2B3534`, alt `#172126`
- ใช้ Design System v0.8.9 `atmosphere.gradient.measure.deep` กับ hero และ mobile handoff แบบ exact recipe `linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%)` พร้อม foreground แบบ onDeep สำหรับจังหวะ entry, direction และ closure
- เพิ่ม `assets/citymeter-fonts.css` เป็น canonical typography layer หลัง compiled base CSS
  - English display: Arvo 700; Thai display/UI heading: IBM Plex Sans Thai Looped 700; body: Bai Jamjuree 400/600; technical Thai fallback: IBM Plex Sans Thai 400; technical Latin: JetBrains Mono
  - Thai/Latin subsets ระบุ `unicode-range`; IBM Plex Sans Thai 400 ใช้ไฟล์ hash-suffixed แยก Thai/Latin และ `size-adjust: 102%`; shipped font contract ไม่มี Sarabun
  - preload แยกตาม route: หน้าไทยใช้ Arvo Latin, Bai Jamjuree Thai 400/600, JetBrains Mono Latin และ IBM Plex Sans Thai Thai 400; หน้าอังกฤษใช้ Arvo Latin, Bai Jamjuree Latin 400/600 และ JetBrains Mono Latin โดยใช้ prefix `./assets/` / `../assets/` ให้ตรง route
  - static HTML และ compiled React bundle กำหนด `lang="en"` ให้ `#page-title` กับ `.citymeter-label` เพื่อตัด hydration mismatch; enhancement ยังคง guard metadata หลัง hydration
  - `font-assets.manifest.json` บันทึก 6 semantic faces และไฟล์ 18 รายการพร้อม SHA-256; `font-license-records.json` ผูก 4 license records แบบ OFL-1.1
- ปรับ disclosure ของการ์ดครบ 38 records ให้ขึ้นต้นด้วยข้อความเฉพาะว่า **ข้อมูลนี้ช่วยตอบอะไร** ก่อนแสดงพื้นที่ครอบคลุม ระดับพื้นที่ สถานะ ที่มา ช่วงเวลา และสิ่งที่ควรตรวจเพิ่ม
  - `benefitTh` และ `benefitEn` มีครบ 38 รายการและไม่ใช้ข้อความ placeholder ซ้ำกัน
  - เปลี่ยนหัวข้อภายในจากศัพท์ audit เช่น `exact public lineage` และ `candidate` เป็นภาษาที่คนทั่วไปอ่านรู้เรื่อง โดยยังเก็บขอบเขตหลักฐานและลิงก์ต้นทางไว้
  - สีของสถานะใช้ semantic token ตาม Design System และตัดค่าสีเดิม `#9F78D8`, `#D89A27` และ `#36B9CC` ออกจาก enhancement layer
- คง Landometer เป็นแบรนด์หลักและไม่เปลี่ยนวิดีโอ ภาพ snapshot, canonical route, QR หรือไฟล์โลโก้ PNG ใน revision นี้
- เริ่ม enhancement หลัง `window.load`, รอขั้นต่ำ 1 วินาทีและช่วง DOM นิ่ง 250 ms แล้วเว้นอีกสอง animation frames ก่อนแก้ DOM เพื่อลด race กับ React hydration โดยการแสดง headline/lockup ไม่ขึ้นกับความสำเร็จของ registry fetch
- รักษา prerendered focused-card copy ให้ตรงกับ React baseline แล้วค่อย apply ข้อความพื้นที่เฉพาะหลัง hydration เพื่อไม่ให้เกิด text-hydration warning

## Section surface assignment

| Section | Light surface | Dark surface |
|---|---|---|
| Decision intents | canvas | canvas |
| Examples | blue tint | blue tint |
| Dataset explorer | beige tint | beige tint |
| Contact | soft | soft |
| Footer | alt | alt |

Hero และ mobile handoff อยู่นอก muted surface set และใช้ `atmosphere.gradient.measure.deep` เดียวกันตาม exact recipe ข้างต้น ส่วน 5 section ในตารางยังใช้ surface role แยกกันครบทั้ง light/dark

## Canonical route contract

แต่ละ dataset มี canonical runtime URL ใน `data/catalog-source-review.json` และใช้ URL เดียวกันกับ:

- ภาพ preview ที่กดได้
- ปุ่มเปิด CityMETER
- CTA ใน intent และ showcase ที่อ้างถึง dataset เดียวกัน
- mobile handoff
- QR ประจำ dataset
- JSON-LD `subjectOf.url`

การ์ดที่ภาพเป็นภาพรวมประเทศยังเปิดหน้า national view ส่วนการ์ดที่ภาพแสดงพื้นที่เฉพาะเปิดพื้นที่เดียวกับภาพโดยตรง

| Dataset | พื้นที่ใน snapshot | Direct route |
|---|---|---|
| Buildings | สวนพลู กรุงเทพมหานคร · 3D | `https://landometer.com/v3/citymeter-3d/BKK/L/8b60964e-0c26-408e-95f6-e3f46fe37d46?d=building` |
| Land Appraisal | อำเภอเมืองชลบุรี · 3D | `https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed` |
| Apartment Rent | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=apartment` |
| Condo Listing Prices | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=condoOffer` |
| Townhouse Listing Prices | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=townhouse` |
| Condo Rent & Yield | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=rentWise` |
| Registered Companies | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=company` |
| Restaurants | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=restaurant` |
| Road Network Archetypes | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=roadDna` |
| Flood: Recurrent | อำเภอผักไห่ พระนครศรีอยุธยา | `https://landometer.com/v3/citymeter/AYA/D/1408?d=floodimpact` |
| Flood Forecast Depth | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=flood-forecast-depth` |
| Hat Yai Flood | อำเภอหาดใหญ่ สงขลา | `https://landometer.com/v3/citymeter/SKA/D/9011?d=hatyaiflood` |
| QuakeSafe | กรุงเทพมหานคร | `https://landometer.com/v3/citymeter/BKK?d=quakeSafe` |
| Crop Area & Output | จังหวัดแพร่ | `https://landometer.com/v3/citymeter/PRE?d=muenRai` |

dataset อื่นยังใช้ national route เพราะภาพและเนื้อหาในการ์ดไม่ได้ผูกกับพื้นที่ย่อยหนึ่งพื้นที่

## Asset integrity

| Asset | ข้อมูลยืนยัน |
|---|---|
| `media/depa-dsure-tdc-lockup.png` | ไฟล์ต้นฉบับ 6541×1561 RGBA; เก็บเป็น provenance และไม่ใช้ render โดยตรง; SHA-256 `804506f124cdb55dc14918b6eb64f7c2bd9badd29fc33fcfddeee5b62b07932c` |
| `media/supporters/depa.png` | PNG RGBA 2160×1350; SHA-256 `6098165e3424c8f7b4c15e26200e88f561ab0a841b8a60125b1735d1260532cd` |
| `media/supporters/dsure-software.png` | PNG RGBA 1014×1465; SHA-256 `d60db2a3f73abf7a5b815307027c0cf25d6c01ed3134648c094217446bc85143` |
| `media/supporters/digital-service-account.png` | PNG RGBA 2298×1042; SHA-256 `57c01b122575800f475cc29e958f6b1c5a7bac705cb5b6ba2365ae9bd90e3086` |
| `media/reel/citymeter-proof-v3.mp4` | ไม่เปลี่ยน; SHA-256 `9b075ee35eaa9c9d41dacb8e0580a5dbb07b26076d723c4185810678f1520bf5` |
| `media/reel/citymeter-proof-v3-exhibition.mp4` | ไม่เปลี่ยน; SHA-256 `bd4962bc88f66d5e0c5c14530f35628165d3f7879b35abd033a3a7039c7ada2f` |
| `assets/ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2` | Thai technical subset; SHA-256 `2d66381c26d32bf2a95bfe559d1a5ed5475fcdac3fa128e45a33301010d42056` |
| `assets/ibm-plex-sans-thai-latin-400-normal-82ddd365.woff2` | Latin technical subset; SHA-256 `82ddd36544e4776857cce6ab26d0e509d10c1eeddf872c1b16f421489b0096a7` |
| `assets/font-assets.manifest.json` | 6 semantic faces, 18 unique files; path/format/subset/SHA-256 ผูกกับ bytes จริง |
| `assets/font-license-records.json` | 4 unique OFL-1.1 records สำหรับ Arvo, Bai Jamjuree, IBM Plex และ JetBrains Mono |

## Release validation

### Automated pre-release gates

- ตรวจ reader benefit ภาษาไทย/อังกฤษว่ามีครบ 38 รายการ ความยาวผ่านเกณฑ์ และไม่ซ้ำกัน
- ตรวจ runtime disclosure ว่า benefit เป็น block แรก ใช้ source-review revision `2026-08-14-r4`, ลบ limitation block เก่า และไม่มี label audit ชุดเดิม
- ตรวจวงกลมโลโก้ว่าใช้ grid 3 คอลัมน์เท่ากัน, diameter token เดียวกัน, `aspect-ratio: 1`, `border-radius: 50%`, radial fade ขาว 50% → ขาวโปร่งใส 0% และไม่มี border, box-shadow หรือ mobile override ที่ย้ายเครื่องหมายที่สามลงแถวใหม่
- ตรวจ surface token และ selector ครบ 5 section ทั้ง light/dark
- ตรวจ hero + handoff ว่าใช้ exact `atmosphere.gradient.measure.deep` และคง onDeep foreground
- ตรวจ canonical font/fallback/leading/number roles, exact English h2/h3/label leading, Thai technical tracking/leading, `unicode-range`, manifest 6 faces/18 files, OFL records, path/hash ของทุก required font asset, preload เฉพาะ route, static + compiled `lang="en"` และยืนยันว่าไม่มี Sarabun
- ตรวจว่าไม่มีค่าสีสถานะเดิม `#9F78D8`, `#D89A27` หรือ `#36B9CC` เหลือใน CSS/JavaScript enhancement
- คงการตรวจ SHA-256, มิติและ RGBA transparency ของ PNG ทั้งสาม รวมถึง hash ของไฟล์ lockup ต้นฉบับและวิดีโอเดิม
- ตรวจ cache reference ของหน้าไทย/อังกฤษ: `catalog-enhancements.css?v=12`, `citymeter-fonts.css?v=1`, `catalog-enhancements.js?v=15`, main bundle `v=4` และ receipt `2026-08-14-brand-blue-shell-radial-logos-canonical-fonts`
- รัน `node scripts/validate-release.mjs`, syntax checks, migration idempotency และ `git diff --check`

### Carried checks from the published baseline

- สร้าง QR ใหม่ครบ 38 datasets จาก canonical registry และสร้าง page QR ภาษาไทย/อังกฤษ พร้อม SHA-256 manifest ที่ผูก URL กับ bytes ของทุกไฟล์
- ตรวจว่า card image, CTA และ JSON-LD ของหน้าไทย/อังกฤษตรงกับ registry ครบ 38 รายการ
- ตรวจ focused routes ที่ระบุในตารางแบบ exact match

### Production QA receipt for the previous published revision

- QA target commit: `778b609dbb5f15b455bc3f4f5b7ee6b17eba5fbc`
- GitHub Pages run: `31804694135` — completed / success
- Cold-load ภาษาไทยและอังกฤษหลัง hydration gate: การ์ด 38, source review 38, benefit 38 และ `data-source-review-version="2026-08-14-r4"` ครบ 38
- ตรวจสถานะตัวอย่างครบ `verified-lineage`, `candidate`, `other-source`, `derived` และ `unproven`; Fuel Stations เปิดด้วยประโยชน์ที่ใช้ได้จริงก่อนแสดงแหล่งที่มาและสิ่งที่ต้องตรวจ
- ค้นหา `น้ำท่วม` เหลือ 5 รายการ แล้วล้างคำค้นกลับเป็น 38 รายการได้โดยไม่มี source review, benefit หรือ evidence ซ้ำ; focused copy 6 ใบไม่ย้อนกลับหลัง MutationObserver ทำงาน
- responsive production matrix ผ่านที่ 320, 390, 430, 720, 900, 901, 1120 และ 1440 px: ไม่มี horizontal overflow เกิน viewport, footer child อยู่ในขอบ, วงกลมทั้ง 6 เป็นสี่เหลี่ยมจัตุรัสรัศมี 50% และ artwork อยู่ภายในวง
- ขนาดวงกลมที่วัดได้: 88 px ที่ 320; 93.59 px ที่ 390; 103.19 px ที่ 430; 112 px ตั้งแต่ 720–1440
- Light และ dark แสดง surface 5 บทบาทต่างกันครบ; วงกลมยังเป็นพื้นขาวเพื่อรักษา contrast ของเครื่องหมายต้นฉบับ
- application-origin console error: 0 ทั้งหน้าไทย อังกฤษ และ responsive matrix; error ที่พบมาจาก cloud-browser extension metadata เท่านั้น จึงไม่ใช่ข้อผิดพลาดของเว็บไซต์

### Production QA receipt for the current revision

- QA target commit: pending — ยังไม่ commit หรือ publish
- GitHub Pages run: pending — ยังไม่มี deployment run สำหรับ bytes ชุดนี้
- Production browser QA: pending — ต้องตรวจหน้าไทย/อังกฤษ, font loading, Measure deep, radial logos, five surfaces และ responsive matrix หลัง Pages สำเร็จ

## ไฟล์ส่งมอบหลัก

- `index.html` — หน้าไทย
- `en/index.html` — หน้าอังกฤษ
- `assets/catalog-enhancements.css`
- `assets/catalog-enhancements.js`
- `assets/citymeter-fonts.css`
- `assets/ibm-plex-sans-thai-thai-400-normal-2d66381c.woff2`
- `assets/ibm-plex-sans-thai-latin-400-normal-82ddd365.woff2`
- `assets/font-assets.manifest.json`
- `assets/font-license-records.json`
- `assets/index-qbT50gkr-v3.js`
- `data/catalog-source-review.json`
- `media/depa-dsure-tdc-lockup.png` — source provenance
- `media/supporters/depa.png`
- `media/supporters/dsure-software.png`
- `media/supporters/digital-service-account.png`
- `scripts/split-supporter-logos.sh`
- `media/qr/*.png`
- `CITYMETER_BRANDING_DEEPLINK_RELEASE_2026-08-14.md`
