# CityMETER motion + focused snapshot release — 14 August 2026

**เว็บไซต์:** https://montri-th.github.io/CityMETER/

**สถานะ:** Published to GitHub Pages after release validation

## สิ่งที่เปลี่ยนในรอบนี้

- เพิ่ม motion เฉพาะตอนผู้ใช้ลงมือทำ เพื่ออธิบายการเปลี่ยน state และตำแหน่งของข้อมูล
  - เปิด/ปิดรายละเอียด: การ์ดข้างเคียงไหลไปตำแหน่งใหม่และค่อยหยุดภายใน 280 ms
  - เนื้อหาที่เพิ่งเปิด: ปรากฏจากระยะ 8 px ภายใน 200 ms
  - ปุ่มและ disclosure: ตอบสนองต่อการกดด้วยระยะ 2 px ภายใน 120 ms
  - ค้นหาและกรอง: การ์ดที่ยังอยู่ไหลไปตำแหน่งใหม่ ส่วนการ์ดที่เพิ่งเข้ามาปรากฏครั้งเดียวจากระยะ 12 px
  - เปลี่ยนโจทย์การตัดสินใจ: proof panel ชุดใหม่ปรากฏจากระยะ 8 px ภายใน 200 ms
- ไม่มี bounce, pulse, shimmer, autoplay decoration หรือ motion ที่แย่งความสนใจจากภาพข้อมูล
- เมื่อระบบตั้ง `prefers-reduced-motion: reduce` เว็บจะแสดง state สุดท้ายทันทีและไม่เรียก Web Animations API
- ปรับ handoff ให้ใช้ต่อได้ถาวร ไม่ผูกกับช่วงหลังจบนิทรรศการหรือการส่งให้ทีมเท่านั้น
  - ภาษาไทย: เก็บตัวอย่างไว้ใช้เมื่อต้องตัดสินใจเรื่องพื้นที่ และเก็บลิงก์หรือส่งให้เพื่อนได้
  - English: keep the example handy for a place decision, then save it or share it
- ลิงก์ของ Agriculture: Crop Area & Output เปลี่ยนเป็นเส้นทางจังหวัดแพร่โดยตรงทั้งการ์ด, JSON-LD, mobile handoff และ QR: `https://landometer.com/v3/citymeter/PRE?d=muenRai`
- Runtime enhancement จะตั้ง direct route ซ้ำเมื่อ React คืนค่า href เดิมหลังค้นหา กรอง หรือสลับภาษา
- QR ที่สร้างใหม่มีเฉพาะ `media/qr/crop-area-output.png` (SHA-256 `6d7b4ba9bcd42f130ccb6f6c6571dab888e476de376bb1e843ad9611ac38d530`); QR อื่นไม่ได้สร้างซ้ำ
- วิดีโอหน้าแรกและวิดีโอสำหรับจอนิทรรศการไม่ได้แก้ไขในรอบนี้

## Snapshot ที่เปลี่ยน

ภาพทั้งสี่เป็น screenshot จริงที่เจ้าของงานส่งมา แล้วเตรียมแบบ deterministic โดย crop จากมุมขวาล่างเพื่อตัด global chrome ที่ไม่จำเป็น รักษาแผนที่ แผงอธิบาย และกราฟ ก่อนลดเป็น WebP 1200×750 โดยไม่สร้างหรือเติมข้อมูลด้วย AI

| Dataset | พื้นที่/มุมที่ใช้ | Crop จากภาพต้นฉบับ | Asset บนเว็บ | SHA-256 |
|---|---|---:|---|---|
| Flood: Recurrent | อำเภอผักไห่ พระนครศรีอยุธยา · น้ำท่วมย้อนหลัง 14 ปี | `2768×1730+652+98` | `media/previews-v2/flood-recurrent.webp` | `9690c74aaab939da5afc43c6cbae1244b00babea3b5d7f77a12c64ca54b5754f` |
| Road Network Archetypes | เขตปทุมวัน กรุงเทพมหานคร · Road DNA | `2768×1730+652+104` | `media/previews-v2/road-network-archetypes.webp` | `009a6c3cc19b81260d8e9a4a6a6ea0644e7e9dd2727a210ac4d70204e56e8d75` |
| Agriculture: Crop Area & Output | อบต.เวียงทอง จังหวัดแพร่ · ผลผลิตรายเดือน | `2768×1730+652+112` | `media/previews-v2/crop-area-output.webp` | `65e5f026df703be3a5a6d09dd9582bd9ec1de2ed299e9c5f89f80e76d7f9b205` |
| Flash Flood: 24-hour Risk by Google | ประเทศไทย · อันดับจังหวัดเสี่ยงใน 24 ชั่วโมง | `2768×1730+652+106` | `media/previews-v2/flood-forecast-flash-flood-risk.webp` | `bd51b77b35c133daf69981580bd3c3bdfaefdbb250c40f2a2eafb0c0a7cbed95` |

ป้ายใต้ภาพและข้อความเปิดเรื่องของการ์ดทั้งภาษาไทยและอังกฤษถูกปรับให้ตรงกับพื้นที่ที่เห็นในภาพ โดยยังคงที่มา ขอบเขต และข้อจำกัดไว้ใน disclosure เดิม

## Motion contract

| งานของ motion | Duration | Easing | เงื่อนไข |
|---|---:|---|---|
| Card layout reflow | 280 ms | `cubic-bezier(.2,0,0,1)` | เกิดหลัง expand/collapse, filter หรือ search เท่านั้น |
| Detail reveal | 200 ms | `cubic-bezier(.16,1,.3,1)` | เฉพาะเนื้อหาที่เพิ่งเปิด และ stagger ไม่เกิน 240 ms |
| Intent proof reveal | 200 ms | `cubic-bezier(.16,1,.3,1)` | เกิดเมื่อผู้ใช้เปลี่ยนโจทย์การตัดสินใจ |
| Press feedback | 120 ms | `cubic-bezier(.2,0,0,1)` | ระยะ 2 px; ไม่ใช้ overshoot |
| Reduced motion | 0 ms | — | แสดง final state ทันที |

## วิดีโอที่ยืนยันว่าไม่เปลี่ยน

| Output | SHA-256 |
|---|---|
| `media/reel/citymeter-proof-v3.mp4` | `9b075ee35eaa9c9d41dacb8e0580a5dbb07b26076d723c4185810678f1520bf5` |
| `media/reel/citymeter-proof-v3-exhibition.mp4` | `bd4962bc88f66d5e0c5c14530f35628165d3f7879b35abd033a3a7039c7ada2f` |

## Release validation

- `node scripts/validate-release.mjs`
- `node --check assets/catalog-enhancements.js`
- `node --check scripts/apply-focus-copy.mjs`
- รัน `scripts/apply-focus-copy.mjs` ซ้ำและยืนยันว่า idempotent
- ตรวจว่า prerendered card ทั้งภาษาไทยและอังกฤษมี direct Phrae route ครบทั้งภาพและปุ่มเปิด และไม่มี generic Muen Rai route เหลือ
- ตรวจ registry, runtime override, JSON-LD และ SHA-256 ของ Muen Rai QR
- ตรวจ permanent handoff copy ทั้ง prerendered HTML และ hydrated bundle
- ตรวจภาพจริงทั้งสี่ที่ 1200×750
- ตรวจ interaction expand/collapse, filter และ search จากหน้า production
- ตรวจว่า actionable controls ยังคงมีเพียงวงกลมและ capsule
- ตรวจ console จากหน้า production และยืนยันว่าไม่มี error ใหม่

## ไฟล์ส่งมอบหลัก

- `index.html` — หน้าไทย
- `en/index.html` — หน้าอังกฤษ
- `assets/catalog-enhancements.css`
- `assets/catalog-enhancements.js`
- `assets/index-qbT50gkr-v3.js`
- `data/catalog-source-review.json`
- `media/qr/crop-area-output.png`
- `CITYMETER_MOTION_SNAPSHOT_RELEASE_2026-08-14.md`
