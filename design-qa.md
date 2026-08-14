# CityMETER catalog — Design QA v3 + current revision addendum

Verified 2026-08-14 against the immutable preview commit `5d465b611d0a24b58e7fd458afa3ae83a501127b`.

The original sections below are the receipt for that published baseline. They do not claim that the later equal-circle logo, muted section-surface and benefit-first copy revision has passed production QA. The current revision status is recorded in the addendum at the end.

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

## Current revision addendum — equal circles, quiet surface diversity and benefit-first details

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
- Cache contract: both language entries load `catalog-enhancements.css?v=10` and `catalog-enhancements.js?v=13`.

### Production checks still required

- Commit SHA: pending
- GitHub Pages deployment: pending
- Cold-load hydration on Thai and English routes with no application-origin console errors: pending
- Exactly 38 source reviews and benefit blocks after load, after filter/search, and after restoring all records: pending
- No duplicate benefit, evidence or source-review blocks after MutationObserver re-entry: pending
- Equal circles, legible marks and no horizontal overflow at 320, 390, 430, 720, 900, 901, 1120 and 1440 px: pending
- Light/dark section rhythm, text/control contrast, footer containment and the Fuel Stations mobile disclosure: pending

current revision result: pending production QA
