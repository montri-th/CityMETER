# CityMETER atmosphere and iPhone scroll-end release

Date: 2026-08-15
Release receipt: `2026-08-15-atmosphere-scroll-v17`
Design authority: Landometer Design System v0.8.9
Routes: Thai `/CityMETER/`, English `/CityMETER/en/`

## Outcome

This release addresses the reported iPhone “scroll-through” below `© 2026 Landometer` and adds a governed atmosphere cadence without using gradients as category or data encoding.

Source inspection confirms that the footer is the final layout element in both prerendered and hydrated routes. The apparent blank tail on iPhone is native WebKit elastic root-canvas exposure, not a hidden DOM spacer. The previous release only declared `overscroll-behavior-y: none`; that declaration does not itself change document geometry and was not manually verified with native Safari elastic pull.

The v17 treatment therefore:

- paints `html`, `body`, and `#root` with the footer surface so exposed root canvas visually continues the footer;
- keeps normal document scrolling, sticky header behavior, anchors, and browser address-bar behavior intact;
- accounts for `safe-area-inset-bottom` without adding a fixed-height tail;
- prerenders footer supporter marks and renders the same structure from React, removing the late post-hydration footer height change;
- groups footer navigation and legal copy in one metadata column instead of creating an artificial trailing grid row; and
- disables whole-card FLIP transforms on coarse pointers, avoiding stale transformed scroll overflow in WebKit after filtering, search, or details expansion.

Native elastic movement is browser chrome behavior and is not claimed to be disabled. The acceptance condition is that no contrasting blank page appears after the footer and that document geometry still ends at the footer.

`viewport-fit=cover` is intentionally not added without notch/header QA. With the current default viewport, the safe-area inset may resolve to zero because Safari already keeps content inside the safe area; the footer rule remains ready for hosts that expose a nonzero inset.

## Atmosphere cadence

The long route uses three major atmosphere moments, separated by flat or evidence-led scenes. No Diversity Spectrum is used because the page has no evidenced participation or co-creation moment.

### 1. Hero entry — Measure

- Job: entry and immediate product orientation.
- Focal path: CityMETER headline → first action → real demo media.
- Light recipe: `atmosphere.gradient.measure.deep` — `linear-gradient(135deg, #1D4497 0%, #176B82 54%, #08756F 100%)` with `surfaceForeground.onDeep`.
- Dark recipe: `atmosphere.gradient.measure.luminous` — `linear-gradient(135deg, #89CEF6 0%, #5ECAD6 50%, #6CD5B3 100%)` with `surfaceForeground.onLight`.
- `deletionTest: improves`
- Observed result: in the source-structure A/B against a flat `surface.canvas` replacement, Measure preserves the only immediate CityMETER identity/orientation field and keeps the headline → CTA → demo path distinct from the flat decision section. Removing it collapses entry and evidence into one undifferentiated surface.
- `evidenceRef: assets/catalog-enhancements-v16.css Measure baseline → assets/catalog-enhancements-v17.css hero-entry; 2026-08-15 source-structure deletion review`

### 2. Examples orientation band — Ground

- Job: orient the transition from the decision question to inspectable real examples.
- Focal path: examples eyebrow → heading → first proof card.
- Light recipe: `atmosphere.gradient.ground.mist` — `linear-gradient(135deg, #C4E0EE 0%, #B2E2E2 50%, #CCE6D0 100%)` with `surfaceForeground.onLight`.
- Dark recipe: `atmosphere.gradient.ground.current` — `linear-gradient(135deg, #0F5773 0%, #006A6A 50%, #1F744F 100%)` with `surfaceForeground.onDeep`.
- Boundary: the gradient ends before the six proof cards; every card remains on its opaque Land, Location, or Living surface.
- `deletionTest: improves`
- Observed result: in the source-structure A/B against the prior flat showcase heading, the bounded Ground band creates a distinct orientation handoff before proof while ending before every card. Removing it makes the examples heading merge into the same neutral evidence field; retaining it does not compete with screenshots or category chips because those begin in a separate flat container.
- `evidenceRef: assets/catalog-enhancements-v16.css showcase surface → assets/catalog-enhancements-v17.css showcase-atmosphere/showcase-content split; 2026-08-15 source-structure deletion review`

### 3. Mobile handoff — Cultivate

- Job: closure and momentum toward saving, sharing, or continuing on mobile.
- Focal path: save/share copy → proof media → QR handoff.
- Light recipe: `atmosphere.gradient.cultivate.glow` — `linear-gradient(135deg, #EB8182 0%, #F5A06F 50%, #EBC573 100%)` with `surfaceForeground.onLight`.
- Dark recipe: `atmosphere.gradient.cultivate.mist` — `linear-gradient(135deg, #F7CBC7 0%, #FBD1B6 50%, #F1E0B4 100%)` with `surfaceForeground.onLight`.
- `deletionTest: improves`
- Observed result: in the source-structure A/B against a flat closure, Cultivate distinguishes save/share/QR handoff from the preceding long explorer and the following flat contact section. Removing it makes the handoff read as another evidence block and weakens the page-ending action change.
- `evidenceRef: assets/catalog-enhancements-v16.css repeated Measure closure → assets/catalog-enhancements-v17.css cultivate handoff; 2026-08-15 source-structure deletion review`

Decision, explorer, contact, card, QR, button, filter, map, preview, and footer surfaces remain flat. Gradients are static CSS backgrounds with no animation, fixed attachment, blur, oversized pseudo-element, extra media, or network request.

## Foreground contracts

`surfaceForeground.onDeep`:

- primary and icons: `#FFFFFF`
- secondary, metadata, and separator: `#F1F4EF`
- interactive surface / ink: `#FFFFFF` / `#182327`
- focus inner / outer: `#182327` / `#FFFFFF`

`surfaceForeground.onLight`:

- primary and icons: `#182327`
- secondary and metadata: `#293337`
- separator: `#182327`
- interactive surface / ink: `#FFFFFF` / `#182327`
- focus inner / outer: `#FFFFFF` / `#182327`

The minimum sampled contrast across 1,001 positions per gradient is:

- Measure Deep: primary `5.54:1`, secondary `4.99:1`
- Measure Luminous: primary `8.32:1`, secondary `6.71:1`
- Ground Mist: primary `11.36:1`, secondary `9.16:1`
- Ground Current: primary `5.72:1`, secondary `5.16:1`
- Cultivate Glow: primary `6.11:1`, secondary `4.93:1`
- Cultivate Mist: primary `10.94:1`, secondary `8.82:1`

The demo proof rail, hero page QR, and cards redeclare opaque local contracts. Atmosphere names are journey jobs and are never mapped to Land, Location, or Living.

## Immutable release assets

- `assets/index-qbT50gkr-v6.js`
- `assets/catalog-enhancements-v17.css`
- `assets/catalog-enhancements-v17.js`
- `scripts/apply-atmosphere-scroll-release.mjs`

SHA-256:

- `assets/index-qbT50gkr-v6.js`: `b78332185bf7b86a3534e53c568b8b684d475e68c783ac0e7534066006aad4c6`
- `assets/catalog-enhancements-v17.css`: `8f4c95eb631b64b41d1beb6554265189474fff8dde419b0c0d4b46f985b8ff3a`
- `assets/catalog-enhancements-v17.js`: `8838d5e11340db1e6ce460e4f4e2190ae1fa27edcce358ba7a987b7014a2db4d`
- `scripts/apply-atmosphere-scroll-release.mjs`: `0c0d266f636c01902c3f66973892d7bddd72f4220d80f889b2714ef96ba37684`

Both HTML routes load exactly those revisions and expose the release receipt above. The existing videos, poster, social share image, preview images, QR codes, fonts, catalog registry, and dataset URLs are unchanged.

## Verification gates

- migration is deterministic and idempotent;
- JavaScript syntax checks pass for bundle, enhancement runtime, migration, and validator;
- release validator checks exact gradient recipes, theme-paired foregrounds, gradient/card separation, TH/EN static and hydration footer parity, one footer supporter group, no runtime footer injection, coarse-pointer motion suppression, root/footer surface continuation, safe-area treatment, immutable assets, routes, media hashes, and all previous release contracts;
- `git diff --check` passes;
- no publish is performed until explicitly authorized;
- after publish, native iPhone Safari must verify the footer end-state in light/dark/system, normal/exhibition, before and after filter/search/details interaction.
