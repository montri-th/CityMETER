# CityMETER catalog — Design QA v3 + current revision addendum

Verified 2026-08-14 against the immutable preview commit `5d465b611d0a24b58e7fd458afa3ae83a501127b`.

The original sections below are the receipt for that published baseline. Later revisions have separate addenda so a previous production receipt is never presented as evidence for newer bytes.

## Comparison targets

- Pinterest “All” reference supplied by the owner: variable-height pins with even inter-card gaps.
- Mobile overlap reference supplied by the owner: caption, label and progress obscured most of the video.
- Existing Landometer visual language and bilingual CityMETER page were preserved; this release changes the catalog evidence, hero media structure and responsive behavior rather than inventing a new visual system.

The Pinterest reference and the rendered catalog were inspected together in the cloud browser. The mobile reference and a rendered 390 × 844 QA frame were also inspected together at the affected hero state.

## Final findings

- No actionable P0, P1 or P2 visual findings remain.
- A desktop QA pass initially found that the inherited side-by-side card layout left too little width for source evidence and QR copy. Cards were changed to vertical pins: 16:10 image above a full-width body and disclosure.
- An interaction QA pass initially found that the enhancement observer could restart the reel after an explicit pause. Autoplay is now attempted only once; subsequent pause/play state belongs to the user.

## Catalog evidence

- 38 dataset cards render with 38 source-review disclosures and 38 dataset-specific QR assets.
- 11 cards carry the optimized owner-supplied GD Catalog logo and explicit “same-dataset lineage through an official owner channel” wording.
- Municipality links to the confirmed DLA `localincome` package and does not claim an exact central GD package.
- Each card distinguishes verified lineage, candidate, other source, derived evidence or unproven lineage; the copy does not imply that every file came directly from central GD Catalog.
- All enforced title, introduction and evidence clamps were removed so the real copy determines card height.
- Desktop renders three CSS columns with 24 px column and vertical gaps; tablet renders two; mobile renders one. Cards avoid column breaks and reflow when a disclosure opens.
- At the measured desktop state a pin was 401.5 px wide; its image was 399.5 × 249.7 px and its body used the full 399.5 px width. The expanded QR handoff used 355.5 px and remained legible.
- The verified QR inspected in-browser loaded at 256 × 256 and the normal tap link remained available next to it.

## Visual evidence

- All 38 preview assets are dark-theme 1200 × 750 WebP images.
- 35 use settled screenshots of the real product. Three weak or incomplete live states use generated conceptual art: Fire Monitoring, Hat Yai Flood and QuakeSafe.
- Every conceptual asset has a visible bilingual label stating that it is an illustration and not a real screen or real data.
- Card images use lazy loading and asynchronous decoding. The optimized GD logo is 240 × 304 and loads only on the 11 qualifying cards.

## Hero and mobile evidence

- Reel order is Population + Building, Municipality, Tourism.
- Web and exhibition reels are H.264, 24 fps and 12.958 seconds. Both autoplay muted, play inline and loop in ordinary as well as exhibition mode.
- One 44 × 44 pause/play control is the only element over the mobile media frame.
- At 390 px QA width the video frame measured 331 × 186.2 px. The label, three-step progress and chapter copy were in a separate 331 × 211 px panel directly below it.
- At 430 px QA width the video frame measured 371 × 208.7 px and the caption panel remained below it.
- Explicit pause remained at exactly the same timestamp for 2.1 seconds (`pauseDrift = 0`). Resume advanced 0.674 seconds during the following 0.65-second sample.
- The loop boundary was observed while playback remained active; the control retained its Pause state after replay.

## Interaction and browser checks

- All groups: 38 cards.
- Land filter: 12 cards.
- Search for “municipal revenue”: exactly one result, “Municipal Revenue”.
- Search clear restored 38 cards.
- One verified disclosure was opened and its official owner link, GD link, logo, source explanation and QR were visually inspected.
- Browser diagnostics contained no application-origin errors. Logged errors were limited to the cloud browser extension origin.

## Automated checks

- `node --check assets/catalog-enhancements.js`: passed.
- `node scripts/validate-release.mjs`: passed — 38 cards, 38 QR assets, 11 verified-lineage badges and 3 labelled concepts.
- All preview dimensions: 1200 × 750.
- All QR dimensions: 256 × 256.
- Full FFmpeg decode: web and exhibition MP4 passed.
- `index.html` and `en/index.html` both load the enhancement layer.

## Release boundary

- The repository exposes compiled/prerendered output but not the Vite/React authoring source named in its README. This release therefore uses a documented post-hydration enhancement layer instead of editing only SSR markup or the minified React bundle.
- The reel is editorial motion over real settled CityMETER screenshots, not a recording of one continuous live session.
- Source wording records what was verified as of 2026-08-14; changing source packages or periods requires a new source review.

## Published baseline result

final result: passed

## Previous published revision addendum — equal circles, quiet surface diversity and benefit-first details

### Intended change

- Render depa, dSURE Software and Digital Service Account as three intact transparent PNGs on equal circular CSS plates in the hero and footer.
- Keep all three marks in one row down to the supported 320 px viewport; use one shared diameter token and logo-specific optical sizing inside each circle.
- Give Decision, Examples, Dataset Explorer, Contact and Footer distinct muted surface roles in both light and dark themes. Hero and handoff retain their existing governed gradients.
- Start each dataset disclosure with a specific answer to “What this data helps you answer,” then show coverage, spatial unit, source status, owner/source, period, decision checks, source links and QR.
- Preserve the original evidence boundaries, exact routes, QR bytes, videos and transparent logo asset bytes.

### Source-level acceptance contract

- Registry: 38 non-empty and unique `benefitTh` values plus 38 non-empty and unique `benefitEn` values.
- Runtime: benefit block is first, stale-registry fallback is present, source-review revision is `2026-08-14-r4`, and the terse prerendered limitation block is removed only after the hydration boundary.
- Language: retired audit labels such as `exact public lineage`, `candidate — ต้องมีหลักฐานเพิ่ม` and `How to read it within the evidence` are absent from public runtime labels.
- Semantic status color: the enhancement layer contains none of the retired local values `#9F78D8`, `#D89A27` or `#36B9CC`; status roles use the canonical semantic palette.
- Logo geometry: three equal grid columns; shared width token; square cells; 50% radius; no two-plus-one mobile rearrangement.
- Surface assignment: exact light/dark Design System v0.8.9 values for canvas, blue tint, beige tint, soft and alt are consumed by their named sections.
- Asset integrity: the three separated logos remain RGBA PNG files with their recorded dimensions and SHA-256 values; the owner-supplied combined lockup remains unchanged as provenance.
- Cache contract: both language entries load `catalog-enhancements.css?v=11` and `catalog-enhancements.js?v=14`.

### Production QA receipt

- QA target commit: `778b609dbb5f15b455bc3f4f5b7ee6b17eba5fbc`
- GitHub Pages deployment run `31804694135`: completed / success.
- Thai and English cold loads each produced 38 cards, 38 source reviews, 38 benefit blocks and 38 `2026-08-14-r4` receipts, with no duplicate benefit, evidence or source-review blocks.
- Search reduced the catalog to five flood records; clearing the input restored all 38. Observer re-entry preserved the six actionable focused coverage/unit texts.
- Five source states were inspected, including the Fuel Stations unproven record. Every inspected disclosure led with a concrete benefit before coverage, status, source and decision checks.
- The same-origin production iframe matrix measured 320, 390, 430, 720, 900, 901, 1120 and 1440 px. Every viewport kept the footer inside the page and reported no horizontal overflow beyond its declared viewport.
- All six supporter plates were square and 50% radius at every width; all PNG rectangles remained inside their plate. Measured diameters were 88 px at 320, 93.59 px at 390, 103.19 px at 430 and 112 px from 720 upward.
- Light and dark each rendered five distinct section surfaces; the supporter plates remained white for the unaltered dark owner marks.
- Application-origin console errors: zero on Thai, English and the responsive matrix. Repeated cloud-browser extension metadata errors were excluded because their URL was `chrome-extension://`, not the application origin.

previous revision result: passed

## Published release addendum — Measure deep, radial circles and canonical typography (`v12`)

### Intended change

- Apply the exact Design System v0.8.9 `atmosphere.gradient.measure.deep` recipe to hero and handoff: `linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%)`, with the existing onDeep foreground.
- Retain five distinct muted section surfaces in both themes: Decision, Examples, Dataset Explorer, Contact and Footer.
- Keep all six supporter cells equal and circular, but replace the opaque plate with a borderless, shadowless radial fade from 50% white at the centre to transparent white at the edge.
- Load `assets/citymeter-fonts.css?v=1` after the compiled base CSS. Use Arvo for English display, IBM Plex Sans Thai Looped for Thai headings, Bai Jamjuree for body text, and JetBrains Mono with IBM Plex Sans Thai for technical labels. Sarabun is not part of the shipped font contract.
- Mark both static and hydrated `CityMETER` title/label nodes as `lang="en"`, while retaining Thai/English route behavior and all prior benefit-first, route, QR and hydration guarantees.

### Source-level acceptance contract

- Cache and receipt: Thai and English load `catalog-enhancements.css?v=12`, `citymeter-fonts.css?v=1`, `catalog-enhancements.js?v=15`, main bundle `v=4`, and receipt `2026-08-14-brand-blue-shell-radial-logos-canonical-fonts` exactly once.
- Typography: eight canonical Thai/Latin subset faces declare `unicode-range`; the complete A11 font, fallback, number and leading roles are consumed by the expected selectors; English h2/h3/labels and Thai technical labels use exact governed leading/tracking. The six-face manifest covers 18 unique hash-verified files and references four OFL-1.1 license records. The new IBM Plex Sans Thai 400 files are `2d66381c…` (Thai) and `82ddd365…` (Latin).
- Preload: Thai loads Arvo Latin, Bai Jamjuree Thai 400/600, JetBrains Mono Latin and IBM Plex Sans Thai Thai 400. English loads Arvo Latin, Bai Jamjuree Latin 400/600 and JetBrains Mono Latin. Each appears once with its route-correct prefix and no opposite-script Bai preload.
- Hydration: static HTML and the compiled `v4` bundle both render `lang="en"` on `#page-title` and `.citymeter-label`; migration upgrades both old compiled patterns idempotently.
- Shell: hero and handoff consume the exact Measure deep gradient and retain onDeep foreground; the five muted section tokens/selectors remain unchanged.
- Logo: three equal columns, shared diameter, square cells, 50% radius, exact white-alpha radial fade, no border, no box-shadow and no two-plus-one rearrangement.
- Carried gates: 38 unique benefits per language, benefit-first `r4`, retired label/color removal, direct routes, QR/video hashes, transparent supporter PNG hashes, hydration stability, responsive footer and reduced-motion behavior remain enforced.

### Local and production status

- Local checks: passed against the final contract — `node --check` ผ่านสำหรับ migration, validator, enhancement JS และ main bundle; migration สองรอบเป็น no-op โดย SHA-256 ของ HTML/registry/main bundle คงเดิม; validator ครอบคลุม `v4`, route-specific preloads, six-face/18-file manifest และ four-record OFL receipt; `git diff --check` ผ่าน.
- QA target commit: `00762648f9bc99b8271d8a4b875323834725a1a3`.
- GitHub Pages deployment run `31812149466` (run number 24): `pages build and deployment`, branch `main`, completed / success; created `2026-08-14T14:58:16Z`, updated `2026-08-14T14:58:38Z`.
- Production browser QA: not recorded. The successful Pages run is deployment evidence only and is not presented as a cold-load, visual, font or responsive-browser receipt.

`v12` deployment result: passed; production browser QA not recorded

## Current hotfix addendum — strict 320 px containment (`v13`) and base-font deduplication (`v2`)

### Intended change

- Preserve the compiled base bundle and its `body { min-width: 320px; }` rule, then clear that floor in the enhancement layer with `body { min-width: 0; }`.
- Prevent a viewport or same-origin iframe whose usable inline size is exactly 320 px from gaining horizontal overflow when classic scrollbars or embedded-browser gutters reduce the available content width.
- Remove only the six legacy unbounded Bai Jamjuree and IBM Plex Sans Thai Looped `@font-face` blocks from the compiled base CSS. Keep its Arvo and JetBrains Mono faces, and let the canonical Unicode-ranged layer declare Bai/Looped exactly once.
- Keep the `v12` visual, typography, content, route, asset and hydration contracts unchanged.

### Source-level acceptance contract

- Cache and receipt: Thai and English load base `index-cqxdfePB.css?v=2`, `catalog-enhancements.css?v=13`, `citymeter-fonts.css?v=1`, `catalog-enhancements.js?v=15`, main bundle `v=4`, and receipt `2026-08-14-brand-blue-shell-radial-logos-canonical-fonts` exactly once.
- Migration: every supported enhancement CSS revision `v5` through `v12` upgrades idempotently to `v13`; font CSS, enhancement JavaScript, main bundle and receipt remain at their settled versions.
- Width floor: validator confirms the compiled base still declares `body` `min-width: 320px` and the enhancement layer declares `body` `min-width: 0`.
- Font deduplication: migration upgrades unversioned/base `v1` links to `v2`; base declares only Arvo 700 and JetBrains Mono 400; combined base + canonical face descriptors and all 18 font asset URLs are unique; canonical Bai/Looped faces retain their Thai/Latin `unicode-range` contract.
- Carried gates: exact Measure deep shell, five muted section surfaces, borderless/shadowless radial logo circles, canonical font manifest/licenses/preloads, hydration language metadata, 38 unique bilingual benefits, benefit-first `r4`, direct routes and immutable asset hashes remain enforced.

### Local and production status

- Local checks: passed against the `v13` contract — syntax checks, two no-op migration runs with unchanged target hashes, full release validator and `git diff --check`.
- QA target commit: pending — the `v13` bytes are not committed or published.
- GitHub Pages deployment run: pending — run `31812149466` belongs to `v12` and does not validate the hotfix.
- Production browser QA: pending. After the new Pages run succeeds, cold-load Thai and English with base `v2` and enhancement `v13`; verify the release receipt, computed fonts and `document.fonts.check()` for Bai Jamjuree/IBM Plex Sans Thai Looped in Safari/WebKit as well as the normal browser matrix; verify both themes and system theme; then measure at an exact 320 px same-origin iframe/content viewport that `document.documentElement.scrollWidth <= document.documentElement.clientWidth` and `document.body.scrollWidth <= document.documentElement.clientWidth`. Confirm the footer, all six logo circles and their artwork remain contained, with no horizontal scrollbar under classic-scrollbar and embedded-browser-gutter conditions. Repeat the established 320–1440 px responsive matrix and record application-origin console errors separately from extension errors.

current hotfix result: production QA pending
