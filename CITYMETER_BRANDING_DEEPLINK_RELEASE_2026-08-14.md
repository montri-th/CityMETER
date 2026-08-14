# CityMETER branding + canonical deep-link release — 14 August 2026

**เว็บไซต์:** https://montri-th.github.io/CityMETER/

**สถานะ:** Published to GitHub Pages after release validation

## สิ่งที่ผู้ชมเห็น

- เปลี่ยน headline หลักทั้งภาษาไทยและอังกฤษเป็น `CityMETER`
- แยก lockup `depa × dSURE software × บัญชีบริการดิจิทัล` เป็น PNG โปร่งใส 3 ไฟล์จากไฟล์ต้นฉบับ โดย crop อย่างเดียว ไม่วาดใหม่ ไม่ลบสีขาวภายในเครื่องหมาย และคง quiet zone 80 px
  - ใน hero จัดเป็น 3 ส่วนบนพื้นสว่างเพื่อรักษา contrast กับ gradient
  - ใน footer จัดเป็น 3 ก้อนอิสระ จึงย่อและเรียงใหม่ได้โดยไม่เกิดแถบภาพยาว
- แก้ footer ที่ล้นช่วง tablet/หน้าต่างขนาดกลาง โดยให้ grid child ย่อได้ เมนูตัดบรรทัดได้ และเปลี่ยนเป็นคอลัมน์เดียวตั้งแต่ 900 px
- คง Landometer เป็นแบรนด์หลักและไม่เปลี่ยนวิดีโอ ภาพ snapshot หรือข้อความ lineage ในรอบนี้
- เริ่ม enhancement หลัง `window.load` และสอง animation frames เพื่อไม่ชน React hydration โดยการแสดง headline/lockup ไม่ขึ้นกับความสำเร็จของ registry fetch
- รักษา prerendered focused-card copy ให้ตรงกับ React baseline แล้วค่อย apply ข้อความพื้นที่เฉพาะหลัง hydration เพื่อไม่ให้เกิด text-hydration warning

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

## Release validation

- สร้าง QR ใหม่ครบ 38 datasets จาก canonical registry และสร้าง page QR ภาษาไทย/อังกฤษ พร้อม SHA-256 manifest ที่ผูก URL กับ bytes ของทุกไฟล์
- ตรวจว่า card image, CTA และ JSON-LD ของหน้าไทย/อังกฤษตรงกับ registry ครบ 38 รายการ
- ตรวจ focused routes ที่ระบุในตารางแบบ exact match
- ตรวจ headline และ supporter logo groups หลัง hydration: 2 ตำแหน่ง × 3 ไฟล์ ไม่มีการ inject ซ้ำ
- ตรวจ footer ไม่ล้นแนวนอน, การ wrap/stack ช่วง responsive, ความชัดของโลโก้บน hero และ light/dark footer และ console จากหน้า production ทั้งภาษาไทยและอังกฤษ
- รัน `node scripts/validate-release.mjs`, syntax checks และ `git diff --check`

## ไฟล์ส่งมอบหลัก

- `index.html` — หน้าไทย
- `en/index.html` — หน้าอังกฤษ
- `assets/catalog-enhancements.css`
- `assets/catalog-enhancements.js`
- `assets/index-qbT50gkr-v3.js`
- `data/catalog-source-review.json`
- `media/depa-dsure-tdc-lockup.png` — source provenance
- `media/supporters/depa.png`
- `media/supporters/dsure-software.png`
- `media/supporters/digital-service-account.png`
- `scripts/split-supporter-logos.sh`
- `media/qr/*.png`
- `CITYMETER_BRANDING_DEEPLINK_RELEASE_2026-08-14.md`
