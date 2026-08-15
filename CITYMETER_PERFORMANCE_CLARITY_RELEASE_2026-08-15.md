# CityMETER performance + clarity release — 2026-08-15

Release receipt: `2026-08-15-performance-clarity-v16`

## Outcome

- ลด critical image load โดยกำหนด `loading="lazy"` และ `decoding="async"` ตั้งแต่ prerender และ hydrated bundle สำหรับ dataset preview ทั้ง 38 ภาพ, showcase 6 ภาพ, intent preview และสื่อ below-the-fold
- ยกเลิก runtime cache-busting ที่เปลี่ยน URL ของ preview และวิดีโอหลังโหลด พร้อมยกเลิก `video.load()` ซ้ำ
- กำหนด hero video เป็น `preload="metadata"` และคง poster เป็นภาพสำคัญแบบ high priority
- ลบ caption, progress และ visible figcaption ที่บังสื่อ โดยคง transcript แบบ visually hidden ที่อัปเดตให้ตรงกับ reel v3 ทั้งสี่หน้าจอ และปุ่ม play/pause ที่มี accessible name
- รักษากรอบ hero ที่ `16:9` ทั้ง desktop และ mobile; ไฟล์วิดีโอและ poster เป็น 16:9 จึงใช้ `object-fit: contain` โดยไม่ crop หลักฐาน
- เลื่อนการโหลด source registry ไปหลัง hydration stability และผูก cache key กับ release นี้

## Performance evidence

ก่อนแก้ แต่ละภาษา render รูป 50 ภาพ โดย dataset preview 38 ภาพไม่มี native lazy-loading ใน HTML หรือ React bundle ทำให้ preview set ราว 3.72 MiB เข้าสู่ initial navigation การเติม `loading="lazy"` หลัง `window.load` เดิมเกิดช้าเกินไป

Runtime เดิมยังเปลี่ยน URL ของ preview ที่โฟกัส 6 ภาพ และวิดีโอ/poster หลัง mount ทำให้มีโอกาสขอข้อมูลซ้ำสูงสุดราว 1.15 MB รอบนี้ตัดพฤติกรรมนั้นออก

## Land / Location / Living

DS v0.8.9 ไม่มี official mapping จาก Land / Location / Living ไปยังสี จึงบันทึก mapping นี้เป็น **component-local candidate** ไม่ใช่ Design System authority:

| Pillar | Surface base (light / dark) | `series.*` accent (light / dark) | Redundant cue |
|---|---|---|---|
| Land | `#F2F1DF` / `#2C2A22` | `series.03` Marigold `#846100` / `#F4C44E` | visible `LAND` label |
| Location | `#E2E9ED` / `#18333E` | `series.08` Ocean `#1F629B` / `#4C99D5` | visible `LOCATION` label |
| Living | `#E5E9E6` / `#2B3534` | `series.05` Green `#007A58` / `#3BD19B` | visible `LIVING` label |

แต่ละ card ใช้ accent rail 5px และ filled label chip พร้อม border emphasis ส่วน section background ย้ายกลับไปใช้ neutral surface เพื่อตัดปัญหา Location card ซ้ำกับ showcase background และ Land card ซ้ำกับ explorer background

ไม่ใช้ `atmosphere.gradient.*` เป็น category encoding เพราะ DS กำหนดให้ gradient ทำหน้าที่ entry, orientation, transition, momentum หรือ closure ระดับใหญ่ และห้ามใช้แทนหมวดข้อมูลหรือวางหลังทุก card Hero และ handoff ยังคงใช้ `atmosphere.gradient.measure.deep` ตามหน้าที่เดิม

## Immutable runtime assets

- `assets/index-qbT50gkr-v5.js`
- `assets/catalog-enhancements-v16.css`
- `assets/catalog-enhancements-v16.js`
- `index.html`
- `en/index.html`
- `scripts/apply-performance-clarity-release.mjs`

## QA

- `node scripts/validate-release.mjs` — passed
- JavaScript syntax checks for main bundle, enhancement runtime, migration, and validator — passed
- Static/hydration contracts: 38 dataset previews, six showcase previews และ intent preview ต่อ locale เป็น lazy + async; hero visible captions absent; accessible transcript ตรงกับ Population → Building → municipal revenue → tourism — passed
- Light/dark categorical token and local foreground contracts — passed
- Video binaries, poster, social card, QR, fonts, canonical routes, TH/EN counts and reduced-motion contract remain hash/parity checked — passed

The generic `check-experience-contracts.mjs` fixture is specific to the Design System living-reference/atlas artifact and reports non-applicable atlas, sampler, manifest and teaching-plate requirements against this CityMETER landing page. The CityMETER release validator is the target-specific gate for this artifact.

## Production receipt

Pending branch/PR merge and GitHub Pages build verification.
