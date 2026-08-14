# CityMETER marketing release — 14 August 2026

**เว็บไซต์:** https://montri-th.github.io/CityMETER/

**สถานะ:** Published to GitHub Pages after release validation

## ผลลัพธ์ที่ผู้ชมเห็น

- ภาพ Population ถูก capture ใหม่หลัง render สมบูรณ์ แผนที่ประเทศไทยไม่แหว่งเป็นช่องสี่เหลี่ยมแล้ว
- ภาพแชร์ LINE / Open Graph เปลี่ยนเป็น social card ขนาด 1200×630 แยกจากเฟรม Population จึงไม่ดึงภาพแผนที่ที่มีปัญหาเดิมไปใช้เป็น thumbnail
- บท Building ในวิดีโอหน้าแรกเปลี่ยนเป็นภาพ 3 มิติของ **สวนพลู** เห็นอาคารที่ render ครบ รายละเอียดอาคารที่เลือก GFA ความสูง จำนวนชั้น และสรุปพื้นที่
- การ์ด Building ใช้ภาพโฟกัสสวนพลู พร้อมป้าย `สวนพลู · อาคาร 3 มิติ · GFA`
- การ์ด Land Appraisal ใช้ภาพ 3 มิติของ **อำเภอเมือง จังหวัดชลบุรี** พร้อมป้าย `เมืองชลบุรี · ราคาประเมิน 3 มิติ`
- snapshot ที่มีข้อมูลกระจุกในพื้นที่เล็กถูกเปลี่ยนจากมุมประเทศไทยเป็นมุมที่โฟกัสพื้นที่ข้อมูล ได้แก่ Apartment Rent, Restaurants, Registered Companies, Road Network, Condo Listing, Townhouse Listing, Condo Rent & Yield และ Flood Forecast
- ปุ่มข้อความทั้งหมดเป็น capsule และปุ่มที่มีเฉพาะ icon เป็นวงกลม
- เพิ่ม QR ขนาดเล็กบนหน้าแรกสำหรับจอ 55 นิ้ว แยกปลายทางภาษาไทยและอังกฤษ และยังคง QR handoff ด้านล่างไว้
- หน้า marketing แสดงภาพจริงและ CTA ก่อน ส่วนที่มา ขอบเขต และข้อควรรู้ถูกย้ายเข้า disclosure ที่ผู้ใช้เปิดดูเมื่อจำเป็น
- ตัดการ preload ภาพ preview ทั้ง 38 ภาพออก เหลือเฉพาะ asset สำคัญของ first screen

## การเตรียมภาพ 3 มิติ

ภาพต้นฉบับที่เจ้าของงานส่งมาได้รับการเตรียมแบบ deterministic โดยไม่สร้างหรือเติมข้อมูลด้วย AI:

| Dataset | พื้นที่ | ต้นฉบับ | Asset บนเว็บ | วิธีเตรียม |
|---|---|---:|---|---|
| Building | สวนพลู กรุงเทพมหานคร | 3400×1810 PNG | `media/previews-v2/buildings.webp` | ตัด chrome ด้านซ้ายที่ไม่จำเป็น โฟกัสแผนที่ 3D + panel แล้วลดเป็น 1200×750 |
| Building hero | สวนพลู กรุงเทพมหานคร | 3400×1810 PNG | `media/reel/hero-scenes/02-building.webp` | รักษาเฟรมเต็ม ลดและวางบนพื้นหลังสีเดียวกับ UI เป็น 1280×720 |
| Land Appraisal | อำเภอเมือง ชลบุรี | 3412×1808 PNG | `media/previews-v2/land-appraisal.webp` | ตัด chrome ด้านซ้ายที่ไม่จำเป็น โฟกัสแท่ง 3D + distribution + panel แล้วลดเป็น 1200×750 |

## Social sharing

หน้าไทยและอังกฤษกำหนด Open Graph และ Twitter card ครบ โดยใช้ `media/social/citymeter-share-2026-08-14.jpg` พร้อม type, width, height และ alt text ภาพเดียวกันไม่ผูกกับโปสเตอร์ Population อีกต่อไป

## วิดีโอหน้าแรก

ลำดับภาพจริงยังคงเล่าเรื่องสามบท:

1. Population ที่ render สมบูรณ์ → Building 3D สวนพลู
2. Municipal revenue
3. Tourism demand

| Output | ขนาด | FPS | ระยะเวลา | SHA-256 |
|---|---:|---:|---:|---|
| Web MP4 | 960×540 | 24 | 12.958 s | `9b075ee35eaa9c9d41dacb8e0580a5dbb07b26076d723c4185810678f1520bf5` |
| Exhibition MP4 | 1280×720 | 24 | 12.958 s | `eb382551b5b2778dad5a0db7045a311b42823121f23c0380a234261b7ceedd2e` |
| Poster | 1280×720 WebP | — | — | `fd526a398b83db3b9e8ead7af2abcd7f9f83cde91cbb3b8547deb272f22ae650` |

วิดีโอ muted, autoplay, plays inline, loop และมีปุ่ม Pause/Play เพียงจุดเดียว โหมด reduced motion ใช้โปสเตอร์นิ่ง

## Release validation

ผ่านการตรวจต่อไปนี้:

- `node scripts/validate-release.mjs`
- `node --check assets/catalog-enhancements.js`
- `node --check scripts/apply-focus-copy.mjs`
- `git diff --check`
- ตรวจ MP4 ด้วย `ffprobe`: H.264 High, yuv420p, 24 fps, 12.958 วินาที ทั้ง web และ exhibition
- ตรวจ contact sheet จากเฟรมจริงที่เวลา 1.0, 4.5, 7.8 และ 11.0 วินาที โดยเฟรม 4.5 วินาทีแสดง Building 3D สวนพลูครบ
- ตรวจภาพ preview ที่ 1200×750 และ hero scene ที่ 1280×720 ด้วยภาพ render จริง

## ไฟล์ส่งมอบหลัก

- `index.html` — หน้าไทย
- `en/index.html` — หน้าอังกฤษ
- `assets/catalog-enhancements.css`
- `assets/catalog-enhancements.js`
- `media/previews-v2/buildings.webp`
- `media/previews-v2/land-appraisal.webp`
- `media/reel/citymeter-proof-v3.mp4`
- `media/reel/citymeter-proof-v3-exhibition.mp4`
- `media/social/citymeter-share-2026-08-14.jpg`
- `docs/video-beats-v3.md`

