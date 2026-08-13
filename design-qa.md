# CityMETER marketing landing — Design QA v2

## Comparison target

- Surface: bilingual CityMETER marketing showcase for web, a 55-inch 16:9 exhibition display, and booth-to-mobile handoff.
- Normative design source: `project_sources/09-Landometer-Design-System-v0.8.9.md`.
- Owner-approved brand asset: `project_sources/10-Landometer-Logo-TransparentBG.png`.
- User feedback visual truth:
  - Hero/reel issue: `/workspace/scratch/970b805dca48/upload/01-image.png` — 3420 × 2214 px.
  - Catalog preview issue: `/workspace/scratch/970b805dca48/upload/03-image.png` — 3420 × 2214 px.
  - Distorted handoff image issue: `/workspace/scratch/970b805dca48/upload/10-image.png` — 3420 × 2214 px.
- Browser-rendered implementation evidence:
  - `qa/hero-v2-browser.png` — 1348 × 926 px content viewport.
  - `qa/catalog-v2-browser.jpg` — 1348 × 926 px content viewport.
  - `qa/handoff-v2-browser.jpg` — 1348 × 926 px content viewport.
  - `qa/exhibition-v2-browser.jpg` — 1920 × 1080 CSS frame scaled into a 1363 × 936 browser capture.
  - `qa/mobile-v2-browser.jpg` and `qa/mobile-handoff-v2-browser.jpg` — 390 × 844 CSS iframe scaled into 1363 × 936 browser captures.
- State: Thai, light and dark themes tested; reel playing and paused; all dataset groups; desktop, exhibition and mobile layouts.
- Density normalization: the three 3420 × 2214 user captures were center-cropped and downsampled to 1348 × 926. Implementation captures were recorded from the same cloud browser at 1348 × 926 content pixels. Browser chrome in source screenshots is treated as framing rather than page fidelity.

## Combined comparison evidence

- Full hero comparison: `qa/comparison-hero-feedback-v2.jpg` places the supplied slow/static hero on the left and the browser-rendered v2 hero on the right.
- Full catalog comparison: `qa/comparison-catalog-feedback-v2.jpg` places the supplied repetitive overview previews on the left and the browser-rendered v2 focus-preview catalog on the right.
- Full handoff comparison: `qa/comparison-handoff-feedback-v2.jpg` places the supplied stretched perspective composition on the left and the browser-rendered aspect-safe composition on the right.
- Focused evidence:
  - `qa/reel-v2-contact-sheet.jpg` shows six points across the 17.2-second reel: business pattern, tourism demand, locale, Road DNA and flood lifecycle.
  - `public/media/previews-v2/contact-sheet.jpg` shows all 38 source-derived 1200 × 750 preview assets in one grid.
- The focused inputs were required because motion, small map labels, limited-data states, icon controls and image geometry cannot be judged reliably from the full-page captures alone.

## Findings

- No actionable P0, P1 or P2 findings remain.
- `[P3] Seven source views remain visually limited by the live product state.`
  - Location: Apartment rent, Hotel market, Registered cars, Earthquake sensors, Fire monitoring, Hat Yai event and QuakeSafe cards.
  - Evidence: the public interface showed a modal, no-data, sparse-map or unclear-scope state. Each v2 preview therefore uses the real screenshot inside a high-contrast framed `LIMITED PREVIEW` treatment; none is blank, broken or replaced with invented evidence.
  - Impact: these seven cards communicate less product proof than the other 31, but the limitation is now explicit and does not block exploration.
  - Follow-up: recapture only after each live dataset can be opened in a meaningful settled state and its visual/content rights are cleared.

## Required fidelity surfaces

- Fonts and typography: the supplied Thai display/body hierarchy remains intact; long Thai headlines wrap without clipping at 1920 × 1080 and 390 × 844. Bai Jamjuree/display treatment, weights, line height and compact icon labels were visually checked in hero, catalog and handoff captures.
- Spacing and layout rhythm: exhibition hero measures 1905 × 1008 below the header; the media shell is 1024 × 576, keeping the requested ~30% frame share while CTA and proof rail remain visible. Desktop and mobile have no horizontal page overflow. Grid gaps, card borders, radii and section rhythm follow the existing DS-led implementation.
- Colors and tokens: light, dark and system modes use the governed canvas/surface/text/interaction tokens. Caption surfaces maintain readable contrast over every reel scene; no contrast-obscured dataset screenshot is shipped without the limited-state treatment.
- Image quality and asset fidelity: the exact supplied transparent horizontal Landometer artwork is used. All 38 previews are 1200 × 750 source-derived images, load successfully, and use focus crops/labels without stretching. The hero MP4 is H.264, 1280 × 720, yuv420p, 30 fps, 17.2 seconds and decodes without errors. No generated maps, placeholder dashboards, handcrafted logos or CSS-drawn product imagery are used.
- Copy and content: reel copy follows problem awareness → previously fragmented/impractical task → closer evidence scale → risk lifecycle → invitation to apply CityMETER. Thai and English versions are siblings of the same five-beat structure. Catalog focus labels identify each dataset's selling evidence without claiming unverified 3D, nationwide, parcel-level, real-time or complete coverage.
- Icons: language and system/light/dark controls use one consistent icon family, 27–34 px quiet controls with semantic names and pressed states; no persistent text labels remain.
- Accessibility: semantic buttons/tabs, visible labels for assistive technology, reduced-motion poster behavior, pause/play control, alt text, focus styles and no sound-dependent information are present. Mobile preference controls remain operable without overlapping the logo.

## Primary interactions tested

- Reel play/pause; caption changed from `พื้นที่ไหนควรดูต่อก่อน` to the locale/Road-DNA beat after 3.9 seconds.
- Thai → English → Thai; the H1 and document language updated correctly.
- System, light and dark theme selection; pressed state and rendered theme updated.
- Dataset group filter: Land returned 12 cards; resetting returned 38 cards.
- Five decision tabs and the direct/share actions were visible and semantic.
- All 38 dataset images reported `complete`, natural size 1200 × 750 and zero broken sources.
- Mobile handoff shows one 1200 × 750 image at 333 × 207 before the QR; the second desktop stacking image is intentionally hidden. No stretched perspective or incorrect aspect ratio remains.
- Console errors checked on desktop, exhibition and mobile. No application-origin errors were observed; the only logged errors came from the cloud browser's Chrome extension origin.

## Comparison history

### Iteration 1 — supplied feedback state

- `[P1]` Hero footage appeared static and did not progress from ICP problem to action.
- `[P1]` Catalog cards repeated similar national/Bangkok overview maps and obscured individual dataset differentiators.
- `[P1]` Several preview images were dark, blank, incomplete or missing.
- `[P2]` Footer product collage distorted screenshots on mobile.
- `[P2]` Language control was visually loud and theme controls were absent.

### Iteration 2 — implemented fixes

- Recut the reel to 17.2 seconds with rapid transitions and visible pan/zoom across business, demand, population, locale, Road DNA and historical/observed/forecast flood evidence; added five synchronized bilingual caption beats and a pause/reduced-motion contract.
- Built a canonical preview config and 38 unique 1200 × 750 source-derived assets with dataset-specific focus labels, contrast treatment and explicit limited states.
- Replaced fixed/stretched footer imagery with aspect-ratio wrappers and a single natural-ratio mobile proof image.
- Replaced language text toggle with one translation icon and added quiet system/light/dark icons.
- Replaced the reconstructed header mark/text with the exact owner-supplied transparent horizontal Landometer logo.

### Iteration 3 — post-fix visual evidence

- Combined hero, catalog and handoff comparisons show the changed hierarchy, focus imagery and corrected geometry.
- 1920 × 1080 frame: 0 horizontal overflow; hero and CTA remain in the first frame; media shell 1024 × 576.
- 390 × 844 frame: 0 horizontal overflow; preference controls fit; handoff image preserves the 1200:750 source ratio.
- Catalog: 38/38 previews loaded, 0 broken, Land/Location/Living validation remains 12/13/13.
- Reel: H.264 full decode passed; browser ready state 4; captions changed with playback.

## Automated checks

- `npm run build`: passed.
- `npm run test:sites`: passed.
- Registry validation: 38 unique IDs; Land 12 / Location 13 / Living 13.
- Preview validation: 38 files, 1200 × 750 each, READY 31 / LIMITED 7.
- Video validation: H.264 High, 1280 × 720, yuv420p, 30 fps, 17.2 s; full decode passed.
- Prerender/standalone validation: first HTML contains all cards and relative media paths; standalone output embeds the application assets.

## Release boundary

- The reel uses editorial motion over real CityMETER screenshots. It communicates movement across evidence scales but must not be described as a recording of one continuous live drill-down until such a capture exists.
- Satellite/product screenshot reuse and campaign-scale publication remain subject to owner/provider media-rights review.
- The seven limited previews should be recaptured when meaningful live states become available.
- Production cutover at `www.landometer.com/citymeter` still requires replacing the legacy redirect and approving one canonical host.

## Final result

final result: passed

## Publication accessibility and indexing gate

- Public HTML uses `index, follow` and keeps a large image/video preview policy.
- Thai and English each have localized initial HTML (`/` and `/en/`), titles, descriptions, canonicals, and hreflang links.
- Server/prerender output is poster-first. The video is mounted only after the browser resolves motion preference, so reduced-motion and no-JS states never flash autoplay footage.
- Ordinary web playback runs once and ends on the final CTA beat. Explicit `?display=exhibition` mode loops for the 55-inch booth screen.
- The five visual beats have a complete static bilingual transcript and localized figure caption; the silent-video status is stated in text.
