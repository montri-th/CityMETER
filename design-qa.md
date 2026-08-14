# CityMETER catalog — Design QA v3

Verified 2026-08-14 against the immutable preview commit `5d465b611d0a24b58e7fd458afa3ae83a501127b`.

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

## Final result

final result: passed
