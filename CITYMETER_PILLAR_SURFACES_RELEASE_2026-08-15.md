# CityMETER — Land / Location / Living quiet card surfaces

วันที่เผยแพร่: 15 สิงหาคม 2026

Release receipt: `2026-08-15-pillar-card-surfaces`

หน้าเว็บ: https://montri-th.github.io/CityMETER/

## ผลลัพธ์

- การ์ด `Land`, `Location` และ `Living` ใช้ surface คนละสีทั้งส่วนตัวอย่าง 6 ใบและ Dataset Explorer 38 ใบ
- สีเป็น flat, muted/quiet surface จาก Landometer Design System v0.8.9 ไม่มี gradient, opacity mix หรือสีสร้างใหม่บนตัวการ์ด
- ป้ายข้อความ `LAND` / `LOCATION` / `LIVING` ยังแสดงอยู่ สีจึงไม่ใช่สัญญาณแบ่งหมวดเพียงอย่างเดียว
- รูปตัวอย่างบนการ์ดไม่ถูก recolor และสถานะที่มาของข้อมูลยังคงเป็นสัญญาณอิสระ
- ไม่มีการเปลี่ยนข้อมูล 38 records, ลิงก์ CityMETER, QR, วิดีโอ หรือข้อความหลักของหน้า

## Surface mapping

| Pillar | DS surface role | Light | Dark |
|---|---|---:|---:|
| Land | `surface.beigeTint` | `#F2F1DF` | `#2C2A22` |
| Location | `surface.blueTint` | `#E2E9ED` | `#18333E` |
| Living | `surface.soft` | `#E5E9E6` | `#2B3534` |

แต่ละการ์ด resolve foreground contract ของตนเองแบบครบชุด: primary, secondary, metadata, hairline, border, interaction accent, raised และ alt surface ทั้ง light/dark เพื่อไม่ inherit ค่าสี dark รุ่นเก่าจาก compiled base bundle. ค่า contrast ต่ำสุดที่ตรวจได้คือ primary 11.39:1, secondary 5.01:1 และ interaction accent 4.94:1.

## Static / hydration contract

- Prerendered `index.html` และ `en/index.html` มี `data-pillar="land|location|living"` ครบทุกการ์ด
- Hydrated bundle `assets/index-qbT50gkr-v4.js` สร้าง attribute เดียวกันจาก `group` ของ record โดยตรง
- Dataset Explorer: Land 12, Location 13, Living 13
- Featured showcase: Land 1, Location 3, Living 2
- การ filter 38 → 12 → 13 → 13 → 38 ต้องคงสีและ pillar ของทุกการ์ด จึงไม่ใช้ `nth-child`, การค้นข้อความ หรือ post-hydration tagging
- `assets/catalog-enhancements-v15.css` เป็น immutable cache-busted stylesheet; ไฟล์ `v14` และ bundle `v3` เดิมเก็บไว้เพื่อ provenance/rollback

## Social share image

Production ก่อน release นี้มีภาพที่ผู้ขอต้องการอยู่แล้ว จึงเก็บไฟล์และ metadata เดิมโดยไม่สร้างหรือบีบอัดซ้ำ:

- Asset: `media/social/citymeter-land-appraisal-share-2026-08-14.jpg`
- ขนาด: 1200 × 630 JPEG
- SHA-256: `cadc66644987afa5abb29dbe720adc9302fe276b12d64172e794dd4e6ddabd88`
- ทั้งหน้าไทยและอังกฤษใช้ URL เดียวกันครบ `og:image`, `og:image:secure_url` และ `twitter:image` พร้อม alt text ตามภาษา
- ภาพ Tourism ในตัวอย่าง LINE เป็น social-platform cache เก่า ไม่ใช่ metadata ที่ production serve อยู่ในวันที่ตรวจ

ภาพนี้เก็บเป็น documentary product proof ตามคำขอของ owner และไม่ถูก recolor. สีม่วง/ชมพูในแผนที่ของภาพหน้าจอจึงไม่ถูกนับเป็นคำรับรอง palette-level conformance ของตัว product map; release นี้รับรองเฉพาะ metadata, byte integrity, crop, card surfaces และ observable page behavior.

## QA contract

- Migration รันสองรอบโดย SHA-256 ของ HTML, registry และ active assets ไม่เปลี่ยนในรอบที่สอง
- `node --check` ผ่านสำหรับ migration, validator, enhancement JavaScript และ hydrated bundle
- `node scripts/validate-release.mjs` ผ่าน โดยตรวจ static/hydrated parity, exact light/dark colors, 12/13/13 + 1/3/2 counts, source-status preservation, route/QR/font/video integrity และ Land Appraisal social-card hash
- `git diff --check` ผ่าน
- Production checks หลัง deploy ต้องยืนยัน Pages workflow success, served release receipt/asset paths, light/dark computed colors, filter counts, responsive overflow/footer geometry และ application-origin console errors

## Design-system status

สถานะ release นี้คือ **authoring-aligned and rendered-QA scoped to the changed surfaces**. ไม่อ้าง machine-token conformance เพราะ machine-readable v0.8.9 package ยังไม่ถูก publish ใน Design System source lock.

## ไฟล์หลัก

- `index.html` — หน้าไทยพร้อม prerendered pillar attributes
- `en/index.html` — หน้าอังกฤษพร้อม prerendered pillar attributes
- `assets/catalog-enhancements-v15.css` — exact quiet surfaces และ local foreground contracts
- `assets/index-qbT50gkr-v4.js` — hydrated semantic pillar parity
- `scripts/apply-branding-route-release.mjs` — idempotent migration
- `scripts/validate-release.mjs` — release gate

### Pre-publish artifact hashes

| Artifact | SHA-256 |
|---|---|
| `index.html` | `4eab07779f7da5d2e661ff76288634eb82f5389f58315f04f688fbf0fb72b8fa` |
| `en/index.html` | `3deab5d9ec45588792a18614c3d696290832aabb502754ba3ee85eba954a1603` |
| `assets/catalog-enhancements-v15.css` | `3f63595f95f1d5d702f4fefa8ddc3ca4f8a27c0d72f3fa3488fa7cc1439724d3` |
| `assets/index-qbT50gkr-v4.js` | `dd1b0cc185459b92925c08c1b0f576699eab3d1a31b3700b20e6a95c490e38a5` |

## Production receipt

- Implementation revision: _pending publish_
- GitHub Pages run: _pending publish_
- Production verification: _pending publish_
