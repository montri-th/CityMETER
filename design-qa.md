# CityMETER marketing landing — Design QA

## Release under review

- Surface: bilingual CityMETER marketing showcase for web and a 55-inch exhibition screen.
- Normative design source: `project_sources/11-Landometer-Design-System-v0.8.9.md`.
- Inventory source: 24 July 2026 public-data reinspection, normalized to 38 records/modules (Land 12 / Location 13 / Living 13).
- Visual source: settled screenshots of the live public CityMETER implementation; no placeholder or generated dashboard imagery.
- Reference composition: the supplied 55-inch, 16:9 exhibition plan plus the supplied Landometer design-system boards.

## Final visual comparison

- The 1920 × 1080 first viewport is fully occupied by the 72 px header and hero; the hero ends exactly at 1080 px.
- Hero is a 4.5 / 7.5 content split at exhibition width. The real Tourism demo occupies 1023.625 × 575.781 px, or 28.42% of the 1920 × 1080 frame, while the primary CTA and proof rail remain visible.
- The final comparison corrected the browser-default `<figure>` margin, which had reduced the video to 24.15% of the frame.
- Header uses the byte-verified public Landometer mark and the live product's site-label typography treatment; the incorrect white OG banner is not used as a logo.
- Layout uses the DS 0.8.9 canvas, Measure gradient, typography stack, interaction color, radius and spacing rules. It does not reuse superseded poster-only palette or bento behavior.

## Content and claim safety

- Marketing story leads with prospect decisions, live examples, visual implementation proof and handoff; internal labels `TRUST CONTRACT`, `HUMAN + MACHINE` and `agent-ready` are absent from visible and source copy.
- All 38 records/modules have a real screenshot, bilingual name and story, evidence-safe feature tags, scope, evidenced granularity and a concise limitation.
- No unsupported `3D`, `real-time`, `nationwide`, `parcel-level`, `complete`, `official`, `predicts` or `AI-powered` badges were introduced.
- The Buildings example shows the verified differentiators GFA, height and floors without claiming 3D.
- Hazard examples retain the lifecycle distinction historical → observed → forecast. Listing prices remain described as asking prices rather than transactions.
- Root/Thailand states are labeled as views rather than proof of complete nationwide coverage. Bangkok, province-comparison, locale, station and event scopes are surfaced only where evidenced.

## Functional QA

- Thai/English preference order works as URL `lang` → saved preference → browser language → Thai fallback; switching language updates the document language, metadata, title and URL while preserving intent state.
- Five decision-intent tabs update the proof image, relevant records, direct action and a precise share URL.
- Dataset search returned the five flood-related records for `flood`; group filters, empty state and reset path are implemented.
- Native share / clipboard fallback and a 264 × 264 QR handoff point to the selected intent, supporting booth-to-phone and colleague-to-colleague continuation.
- Video is real CityMETER footage, H.264 MP4, 1280 × 720, 30 fps, 10 s, muted, looping and `playsinline`; poster and reduced-motion behavior are present. Playback control works.
- Every dataset card links to the current live CityMETER view. The prerendered first HTML contains 38 cards and JSON-LD contains 38 matching entities.
- Production build uses relative asset URLs, so it works from a GitHub Pages subpath without hydration-path drift.
- Standalone HTML embeds the application assets and all media; it contains no external script or stylesheet dependency.

## Browser and responsive checks

- Clean desktop build: one H1, 38 cards, 38 JSON-LD records, 0 broken loaded images, video ready state 4, no video error, QR 264 × 264, and 0 px horizontal overflow.
- Exhibition frame: 1920 × 1080, video share 28.42%, primary CTA visible, hero bottom exactly 1080 px, and 0 px horizontal overflow.
- Mobile frame: 390 × 844, 0 px horizontal overflow, language controls 44 × 44 px.
- Core interaction run covered language switching, intent selection, search filtering, detail disclosure and video pause/play.
- No application warnings or errors were observed. Browser-extension metadata errors were isolated to a Chrome extension origin and do not come from this page.

## Automated checks

- `npm run build`: passed.
- `npm run test:sites`: 4/4 passed.
- Registry validation: 38 unique IDs; Land 12 / Location 13 / Living 13.
- Media validation: every referenced dataset image exists and is non-zero; exact Landometer mark SHA-256 `8d9e5a06d9596b44bbd4a7b5090469c77bf4f4df5f334a7dd405931951856eaa`.
- Prerender validation: 38 cards, 38 JSON-LD datasets, zero root-absolute media paths.

## Comparison history

### Iteration 1 — catalog-first prototype

- `[P0]` The page exposed internal trust/machine vocabulary and made the catalog the story.
- `[P0]` Header used an OG banner rather than the Landometer brand mark.
- `[P1]` Records lacked visual proof, differentiated feature/scope/granularity metadata and intent-based handoff.
- Rebuilt as a bilingual, prospect-facing showcase with real media, decision routes, network-aware sharing and a booth-first hero.

### Iteration 2 — evidence and interaction gate

- `[P0]` Unsupported feature and coverage claims were possible when raw implementation state was interpreted as source coverage.
- `[P1]` Featured condo pair and machine identity needed exact record handling.
- Added evidence-safe marketing metadata for all 38 records, canonical record validation, scope/granularity status and current viewer links.

### Iteration 3 — exhibition composition

- `[P1]` The first 1920 × 1080 pass gave the video too little visual weight and the decision proof stacked at common desktop width.
- Widened the hero media split and kept decision proof side-by-side on desktop.
- `[P2]` Browser-default figure margins still reduced the final video from the requested area.
- Removed the default margin. Final measured video area is 28.42% with CTA and proof rail preserved.

### Iteration 4 — delivery integrity

- `[P0]` SSR initially emitted root-absolute media while the client used a relative GitHub Pages base.
- Unified prerendered and hydrated paths.
- `[P1]` Standalone media replacement risked corrupting absolute OG metadata and interactive hydration could revert embedded media paths.
- Limited replacements to quoted relative references and added an embedded media manifest for hydrated interactions.
- `[P2]` Mobile language controls measured 36 px high.
- Increased them to 44 × 44 px.

No actionable P0, P1 or P2 findings remain.

## Production gates outside this prototype

- Replace the temporary symbol-plus-site-label treatment with the owner-approved transparent horizontal Landometer lockup if/when that governed asset is supplied. The available public symbol is byte-verified but DS 0.8.9 treats the approved lockup as the production header norm.
- Replace the current legacy behavior at `www.landometer.com/citymeter` before production cutover and choose one canonical host/redirect policy.
- Remove review `noindex, nofollow` only when the production route, canonical host, social image and 38 live destination routes are release-approved.

## Final result

final result: passed
