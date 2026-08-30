# CityMETER marketing showcase — static preview

หน้า marketing landing page สำหรับ prospect ที่ต้องการเห็นตัวอย่าง implementation จริงของ CityMETER ก่อนเลือกโจทย์ พื้นที่ และข้อมูลที่จะเปิดดูต่อ

## Current release

- Showcase shell receipt: `2026-08-30-citymeter-unified-nav-r7-v31` (`ui-20260830-09`)
- Inherited contributor receipt: `2026-08-27-landom-thumbnail-sync-v29`
- Active hydrated runtime: `assets/index-qbT50gkr-v17.js`; contributor enhancement owners remain `assets/catalog-enhancements-v25.css` and `assets/catalog-enhancements-v25.js`
- Unified navigation owners: `assets/unified-navbar-r7-v30.css` and `assets/unified-navbar-r7-v31.js`
- Navigation alignment: Landometer Design System v0.9.0-r7 authoring-aligned with recorded owner-directed artifact exceptions; the unmerged r8 proposal and full machine-package conformance are not claimed
- Dataset-card thumbnails: `media/previews-v3/` (38 files, 800×500, 1.42 MB total); high-value intent/showcase evidence remains in `media/previews-v2/`
- Team rebuild guide: `CITYMETER_REBUILD_BRIEF.md`
- Release evidence: `CITYMETER_UNIFIED_NAV_R7_RELEASE_2026-08-30.md`

## Preview URLs

- Landing page on GitHub Pages: https://montri-th.github.io/CityMETER/
- English initial HTML: https://montri-th.github.io/CityMETER/en/
- Exhibition loop mode: https://montri-th.github.io/CityMETER/?display=exhibition
- Mobile QA on GitHub Pages: https://montri-th.github.io/CityMETER/mobile-qa.html
- Production target: https://www.landometer.com/citymeter

## Scope

- Unified sticky navbar shared with the Landometer Home direction: carrier-free symbol + Arvo wordmark, plain `/ CityMETER` indicator, selected CityMETER link, CityWiki link, contact CTA, compact menu, ecosystem panel and three-anchor bookmark rail
- The compiled React header remains byte-identical as a rollback owner but is hidden inside `#root`; the active navbar is a standalone shell outside the hydrated root so React cannot replace it after hydration
- Calm navigation follows the attached r7 row-scale behavior on downward scroll and restores at the top, on upward scroll, pointer/focus intent or menu open; reduced motion keeps the header prominent and removes the CTA sweep
- Static/no-JS and script-failure navigation remain available; menu disclosure supports repeat press, transparent outside click, Escape, focus entry and focus return
- Exhibition-first hero อัตราส่วน 16:9 พร้อม reel 12.958 วินาที 3 chapter ตามลำดับ Population + Building → Municipality → Tourism, caption ไทย/อังกฤษ และปุ่ม Pause/Play เพียงปุ่มเดียว; autoplay แบบ muted/playsinline และวนต่อเนื่องเป็นค่าเริ่มต้น
- ภาษาไทย/อังกฤษยังเป็น sibling routes ที่เข้าถึงได้โดย URL, metadata และ browser preference; navbar preset นี้ตั้งใจไม่แสดง locale control ตามข้อยกเว้น `NAV-UTILITY-01`
- Theme light/dark ยัง resolve ก่อน paint จาก system หรือ stored preference และ sync browser theme color; navbar preset นี้ตั้งใจไม่แสดง theme control
- 5 decision intents สำหรับการลงทุน/พัฒนา การเลือกทำเล การประเมินความเสี่ยง การวางบริการ และงานวิเคราะห์
- สีพื้นของแต่ละช่วงใช้ surface token คนละบทบาท—canvas, blue tint, beige tint, soft และ alt—ทั้ง light/dark เพื่อให้หน้าแบ่งจังหวะชัดขึ้นโดยยังคงสีเงียบและอ่านง่าย
- การ์ด Land / Location / Living ใช้ quiet surface คนละบทบาททั้ง 6 featured cards และ 38 dataset cards: beige tint, blue tint และ soft ตามลำดับ พร้อม semantic `data-pillar` ที่ตรงกันก่อนและหลัง hydration
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
- `assets/unified-navbar-r7-v30.css` / `assets/unified-navbar-r7-v31.js` — standalone unified navigation shell, calm-scroll behavior, menu and scrollspy
- `data/citymeter-unified-navbar-r7-v31.receipt.json` / `assets/unified-navbar-assets-v31.manifest.json` — exact TH/EN shell bytes plus governed identity, icon-subset provenance and licence hashes
- `scripts/apply-unified-navbar-r7-release.mjs` / `scripts/build-unified-navbar-r7-receipt.mjs` / `scripts/validate-unified-navbar-r7.mjs` — deterministic retrofit, receipt builder and release gate
- `assets/index-qbT50gkr.js` / `assets/index-cqxdfePB.css` — original compiled React application output (the referenced Vite `src/` files are not present in this repository)
- `assets/catalog-enhancements.js` / `assets/catalog-enhancements.css` — maintainable post-hydration layer for source drawers, QR, masonry and the mobile hero structure
- `assets/catalog-enhancements-v15.css` / `assets/index-qbT50gkr-v4.js` — immutable quiet-pillar stylesheet และ hydrated semantic pillar bundle สำหรับ release 15 August 2026
- `assets/citymeter-fonts.css` — canonical Design System typography roles, Thai/Latin subset coverage and line-height contract; the IBM Plex Sans Thai 400 subset assets are immutable hash-suffixed WOFF2 files
- `assets/font-assets.manifest.json` / `assets/font-license-records.json` — six semantic face records covering 18 hash-verified webfont files and four OFL-1.1 license receipts
- `data/catalog-source-review.json` — bilingual 38-record source ledger พร้อมข้อความ reader benefit เฉพาะรายการ reviewed on 14 August 2026
- `media/previews-v2/` / `media/previews-v3/` — immutable 1200×750 evidence captures และ deterministic 800×500 card thumbnails
- `scripts/build-card-previews.py` — pinned Pillow/libwebp thumbnail builder พร้อม SHA-256 manifest
- `CITYMETER_REBUILD_BRIEF.md` — step-by-step brief สำหรับทีมที่ต้อง rebuild หน้าเต็มจาก repository
- `media/` — owner-supplied Landometer logo, optimized GD Catalog logo, 38 dark previews, 38 QR assets, governed concept illustrations, Land Appraisal social card and the three-chapter web/exhibition reel
- `scripts/generate-qr-assets.mjs` — reproducible dataset-URL QR generator
- `CityMETER_Landing_Page_Prototype_DS_0.8.9.html` — lightweight noindex entry file ที่พาไปยัง static showcase หลัก
- `design-qa.md` / `qa/` — visual QA evidence ที่ 1920×1080, desktop และ mobile
- `CITYMETER_PILLAR_SURFACES_RELEASE_2026-08-15.md` — release contract, exact surface mapping, social-card state และ production receipt

## Status

This public preview is indexable. Its new navigation shell is authoring-aligned with Landometer Design System v0.9.0-r7 and the attached owner-directed handoff; the underlying compiled showcase still contains legacy layers and therefore does not claim full-page machine-package conformance. Unknown coverage, resolution, source, or definition metadata is never inferred. Source labels distinguish verified same-dataset lineage, candidates, other providers, derived layers and unproven public lineage.

The previous published release was deployed from commit `f83115747047af83bb212b1f7e352b6d419dc22c` (tree `1969e8a0ec0289b8335188a243a07b7f2a4c93eb`) through successful GitHub Pages run `31814244403` (#25). Its production receipt remains historical evidence for base CSS `v2`, enhancement CSS `v13`, font CSS `v1`, enhancement JS `v15`, main bundle `v4`, and receipt `2026-08-14-brand-blue-shell-radial-logos-canonical-fonts`.

The previous published release was deployed from commit `418c591c641d28d1763dd6dfbcb3a8cbe5621dd5` (tree `8a779adc8813b8066c9b3597ba60502ce8fe559c`) through successful GitHub Pages run `31819904277` (#27), created `2026-08-14T16:33:34Z` and updated `2026-08-14T16:34:09Z`. Its release contract retained base CSS `index-cqxdfePB.css?v=2` and font CSS `citymeter-fonts.css?v=1`; Thai and English cold loads matched enhancement CSS `catalog-enhancements.css?v=14`, enhancement JS `catalog-enhancements.js?v=15`, main bundle `v=5`, and receipt `2026-08-14-radial-edge-scroll-end-cta`.

Production QA returned 38 cards, 38 source reviews and 38 benefits on both routes. Filtering changed the set from 38 to 12 and back to 38 while preserving review/benefit parity and the two supporter groups with six cells. The 320, 390, 430, 720, 900, 901, 1120 and 1440 px matrix reported `scrollWidth == clientWidth`, footer-end geometry within ±0.5 px and valid circles; the declared 320 px case had 305 px of usable width because of the classic scrollbar. All six desktop circles measured 112 × 112 px, loaded their lazy assets and preserved the `closest-side` white-alpha `.5` to `0` fade without border or shadow. Thai and English contact headings/buttons matched their approved copy, Thai used the canonical fonts, and the governed hero gradient plus light/dark footer surfaces remained unchanged. A manual Mac/Safari elastic-pull check remains recommended and is not claimed by this receipt.

The current release was deployed from commit `304233fb76e91887ab1f8ba5c8c6b10ea023a940` (tree `4a3899cc3cd12d21675afed5e9db51e697406192`) through successful GitHub Pages run `31821764440` (#28), created `2026-08-14T16:57:35Z` and updated `2026-08-14T16:58:45Z`. It changes only the social metadata/asset and release receipt to `2026-08-14-land-appraisal-share`; base/font/enhancement/main runtime cache revisions remain unchanged.

Thai and English production pages each reference `media/social/citymeter-land-appraisal-share-2026-08-14.jpg` exactly three times across OG, secure OG and Twitter metadata, expose localized alt text, and contain no retired tourism-card URL. The deployed asset returned `image/jpeg`, decoded at 1200 × 630 and visually matched the approved Land Appraisal crop with 3D columns. Carried production checks still returned 38 cards/reviews/benefits, two supporter groups with six 112 × 112 circles, exact closest-side radial fade, no horizontal overflow, footer-end geometry within ±0.5 px, concise bilingual contact titles and no application-origin console errors. The only logged errors came from a browser extension origin.

The quiet pillar-card release was deployed from implementation commit `0bc8b3165a95be7a6bc44780e1646b5d69e490fa` (tree `47dcf68d7c924c83ca4a97977378f9322abd83da`) through successful GitHub Pages run `31860734132` (#30). Production verified exact Land / Location / Living light/dark surfaces on both routes, 12 / 13 / 13 dataset parity, 1 / 3 / 2 showcase parity, filter re-render parity and no horizontal overflow across the 320–1440 px responsive harness. Served HTML, CSS, JavaScript and Land Appraisal image hashes matched the release bytes.

Once merged, the static files publish from `main` through GitHub Pages. Before the production-domain cutover, change the current `/citymeter` redirect, complete record-level metadata, resolve the live SPA identity issue, and clear product/satellite screenshot reuse rights.

## Build

The repository currently contains the compiled/prerendered site rather than the Vite source tree named by older README revisions. Regenerate QR assets after changing any direct viewer URL:

```bash
node scripts/generate-qr-assets.mjs
```

Then serve the repository root with any static HTTP server and verify both `/` and `/en/`. Do not edit only the prerendered card markup: React hydration owns the base application, while the separate enhancement layer owns this catalog revision.

Run the release validator after changing copy, typography roles, gradient or surface assignments, supporter-logo layout, routes or release cache revisions:

```bash
node scripts/apply-unified-navbar-r7-release.mjs --check
node scripts/build-unified-navbar-r7-receipt.mjs --check
node scripts/validate-unified-navbar-r7.mjs
node scripts/validate-release.mjs
node scripts/validate-p1-contributors.mjs
```
