# CityMETER marketing showcase — static preview

หน้า marketing landing page สำหรับ prospect ที่ต้องการเห็นตัวอย่าง implementation จริงของ CityMETER ก่อนเลือกโจทย์ พื้นที่ และข้อมูลที่จะเปิดดูต่อ

## Preview URLs

- Landing page on GitHub Pages: https://montri-th.github.io/CityMETER/
- English initial HTML: https://montri-th.github.io/CityMETER/en/
- Exhibition loop mode: https://montri-th.github.io/CityMETER/?display=exhibition
- Mobile QA on GitHub Pages: https://montri-th.github.io/CityMETER/mobile-qa.html
- Production target: https://www.landometer.com/citymeter

## Scope

- Exhibition-first hero อัตราส่วน 16:9 พร้อม reel 12.958 วินาที 3 chapter ตามลำดับ Population + Building → Municipality → Tourism, caption ไทย/อังกฤษ และปุ่ม Pause/Play เพียงปุ่มเดียว; autoplay แบบ muted/playsinline และวนต่อเนื่องเป็นค่าเริ่มต้น
- ภาษาไทย/อังกฤษตาม URL, preference ที่ผู้ใช้เลือก และภาษา browser พร้อม quiet icon controls
- Theme system / light / dark โดยจำ preference ของผู้ใช้
- 5 decision intents สำหรับการลงทุน/พัฒนา การเลือกทำเล การประเมินความเสี่ยง การวางบริการ และงานวิเคราะห์
- สีพื้นของแต่ละช่วงใช้ surface token คนละบทบาท—canvas, blue tint, beige tint, soft และ alt—ทั้ง light/dark เพื่อให้หน้าแบ่งจังหวะชัดขึ้นโดยยังคงสีเงียบและอ่านง่าย
- Hero และ mobile handoff ใช้ Design System v0.8.9 `atmosphere.gradient.measure.deep` แบบเดียวกัน: `linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%)` พร้อม foreground แบบ onDeep
- Social share card ใช้ภาพหน้าจอ Land Appraisal จริงที่แสดงแท่งข้อมูลสามมิติบนแผนที่ ตัดเป็น 1200 × 630 แบบ crop-only โดยไม่วาดหรือเติมข้อมูลใหม่
- ฟอนต์ใช้ canonical role แยกหน้าที่: Arvo สำหรับ display ภาษาอังกฤษ, IBM Plex Sans Thai Looped สำหรับหัวข้อไทย, Bai Jamjuree สำหรับ body และ JetBrains Mono + IBM Plex Sans Thai สำหรับ technical label; ทุก webfont subset ระบุ `unicode-range` และไม่มี Sarabun ใน shipped font contract
- Compiled base CSS เหลือเฉพาะ Arvo และ JetBrains Mono; legacy `@font-face` ของ Bai Jamjuree/IBM Plex Sans Thai Looped ที่ไม่มี `unicode-range` ถูกตัดออก เพื่อให้ canonical font stylesheet เป็นผู้ประกาศสองตระกูลนี้เพียงชั้นเดียวและไม่ทำให้ Safari เลือก face กำกวม
- Critical font preload แยกตาม route: หน้าไทยโหลด Arvo Latin, Bai Jamjuree Thai 400/600, JetBrains Mono Latin และ IBM Plex Sans Thai Thai 400; หน้าอังกฤษโหลด Arvo Latin, Bai Jamjuree Latin 400/600 และ JetBrains Mono Latin
- Strict 320 px iframe/mobile containment ล้าง `min-width: 320px` ที่มาจาก compiled body ด้วย enhancement `body { min-width: 0; }` เพื่อไม่ให้ classic scrollbar หรือ embedded-browser gutter ดันหน้าเกิน usable inline size
- หน้าเดิมจบตรง footer อยู่แล้ว; enhancement เพิ่ม `overscroll-behavior-y: none` ให้ทั้ง `html` และ `body` เพื่อไม่ให้ native elastic overscroll เผยพื้น root ต่อจาก footer
- Snapshot dark theme ครบ 38 records/modules: ภาพจริงที่รอ map/legend/sidebar settle 35 ใบ และภาพประกอบแนวคิดที่ติดป้ายชัดเจน 3 ใบสำหรับ Fire, Hatyai Flood และ QuakeSafe
- การ์ดทุกใบเปิดรายละเอียดด้วยข้อความเฉพาะว่าใช้ข้อมูลทำอะไรได้ แล้วจึงแสดงพื้นที่ครอบคลุม ระดับพื้นที่ ที่มา ช่วงเวลา สิ่งที่ควรตรวจเพิ่ม และ direct link; ข้อมูล benefit ภาษาไทย/อังกฤษครบและไม่ซ้ำกันทั้ง 38 records
- 11 ใบที่ยืนยัน same-dataset lineage ผ่านช่องทางทางการแสดงโลโก้ GD Catalog โดยไม่อ้างว่าเป็น direct central-GD download
- QR เฉพาะ dataset ครบ 38 ใบ ซ่อนอยู่ใน source disclosure และพาไป exact CityMETER viewer URL
- Pinterest-style masonry ใช้ความสูงจริงของ card และ reflow เมื่อเปิด source/QR
- เครื่องหมาย depa, dSURE Software และบัญชีบริการดิจิทัลใช้ไฟล์ PNG โปร่งใสแยกกัน วางในวงกลม CSS ขนาดเท่ากันด้วย `circle closest-side`: ขาว alpha `.5` กลางวงสู่ `rgba(255,255,255,0)` ที่ขอบวงกลมที่มองเห็นจริง โดยไม่มี border หรือ box-shadow และไม่ crop, mask, filter หรือเปลี่ยนสีไฟล์ต้นฉบับ
- หัวข้อส่วนติดต่อใช้ข้อความตรงกับ CTA: `คุยกับทีม Landometer` ในภาษาไทย และ `Talk to the Landometer team` ในภาษาอังกฤษ
- Semantic HTML และ JSON-LD สร้างจาก registry เดียวกับหน้า visible โดยไม่มีหัวข้อเทคนิคในหน้า marketing

The 38 records include datasets, derived modules, monitoring feeds, and two event archives. The preview therefore does not describe every record as a standalone dataset.

## Files

- `index.html` / `en/index.html` — deployed prerendered Thai/English output
- `assets/index-qbT50gkr.js` / `assets/index-cqxdfePB.css` — original compiled React application output (the referenced Vite `src/` files are not present in this repository)
- `assets/catalog-enhancements.js` / `assets/catalog-enhancements.css` — maintainable post-hydration layer for source drawers, QR, masonry and the mobile hero structure
- `assets/citymeter-fonts.css` — canonical Design System typography roles, Thai/Latin subset coverage and line-height contract; the IBM Plex Sans Thai 400 subset assets are immutable hash-suffixed WOFF2 files
- `assets/font-assets.manifest.json` / `assets/font-license-records.json` — six semantic face records covering 18 hash-verified webfont files and four OFL-1.1 license receipts
- `data/catalog-source-review.json` — bilingual 38-record source ledger พร้อมข้อความ reader benefit เฉพาะรายการ reviewed on 14 August 2026
- `media/` — owner-supplied Landometer logo, optimized GD Catalog logo, 38 dark previews, 38 QR assets, governed concept illustrations, Land Appraisal social card and the three-chapter web/exhibition reel
- `scripts/generate-qr-assets.mjs` — reproducible dataset-URL QR generator
- `CityMETER_Landing_Page_Prototype_DS_0.8.9.html` — lightweight noindex entry file ที่พาไปยัง static showcase หลัก
- `design-qa.md` / `qa/` — visual QA evidence ที่ 1920×1080, desktop และ mobile

## Status

This public preview is aligned with Landometer Design System v0.8.9 and is indexable. Unknown coverage, resolution, source, or definition metadata is never inferred. Source labels distinguish verified same-dataset lineage, candidates, other providers, derived layers and unproven public lineage.

The previous published release was deployed from commit `f83115747047af83bb212b1f7e352b6d419dc22c` (tree `1969e8a0ec0289b8335188a243a07b7f2a4c93eb`) through successful GitHub Pages run `31814244403` (#25). Its production receipt remains historical evidence for base CSS `v2`, enhancement CSS `v13`, font CSS `v1`, enhancement JS `v15`, main bundle `v4`, and receipt `2026-08-14-brand-blue-shell-radial-logos-canonical-fonts`.

The previous published release was deployed from commit `418c591c641d28d1763dd6dfbcb3a8cbe5621dd5` (tree `8a779adc8813b8066c9b3597ba60502ce8fe559c`) through successful GitHub Pages run `31819904277` (#27), created `2026-08-14T16:33:34Z` and updated `2026-08-14T16:34:09Z`. Its release contract retained base CSS `index-cqxdfePB.css?v=2` and font CSS `citymeter-fonts.css?v=1`; Thai and English cold loads matched enhancement CSS `catalog-enhancements.css?v=14`, enhancement JS `catalog-enhancements.js?v=15`, main bundle `v=5`, and receipt `2026-08-14-radial-edge-scroll-end-cta`.

Production QA returned 38 cards, 38 source reviews and 38 benefits on both routes. Filtering changed the set from 38 to 12 and back to 38 while preserving review/benefit parity and the two supporter groups with six cells. The 320, 390, 430, 720, 900, 901, 1120 and 1440 px matrix reported `scrollWidth == clientWidth`, footer-end geometry within ±0.5 px and valid circles; the declared 320 px case had 305 px of usable width because of the classic scrollbar. All six desktop circles measured 112 × 112 px, loaded their lazy assets and preserved the `closest-side` white-alpha `.5` to `0` fade without border or shadow. Thai and English contact headings/buttons matched their approved copy, Thai used the canonical fonts, and the governed hero gradient plus light/dark footer surfaces remained unchanged. A manual Mac/Safari elastic-pull check remains recommended and is not claimed by this receipt.

The current local delta changes only the social metadata/asset and release receipt to `2026-08-14-land-appraisal-share`. Both routes now reference `media/social/citymeter-land-appraisal-share-2026-08-14.jpg`, a deterministic 1200 × 630 crop of the real Land Appraisal preview. Commit, Pages run and production metadata/image QA are pending until these exact bytes are published.

Once merged, the static files publish from `main` through GitHub Pages. Before the production-domain cutover, change the current `/citymeter` redirect, complete record-level metadata, resolve the live SPA identity issue, and clear product/satellite screenshot reuse rights.

## Build

The repository currently contains the compiled/prerendered site rather than the Vite source tree named by older README revisions. Regenerate QR assets after changing any direct viewer URL:

```bash
node scripts/generate-qr-assets.mjs
```

Then serve the repository root with any static HTTP server and verify both `/` and `/en/`. Do not edit only the prerendered card markup: React hydration owns the base application, while the separate enhancement layer owns this catalog revision.

Run the release validator after changing copy, typography roles, gradient or surface assignments, supporter-logo layout, routes or release cache revisions:

```bash
node scripts/validate-release.mjs
```
