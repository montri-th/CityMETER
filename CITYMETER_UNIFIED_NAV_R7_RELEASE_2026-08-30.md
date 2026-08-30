# CityMETER unified navbar r7 release

Date: 2026-08-30

Release receipt: `2026-08-30-citymeter-unified-nav-r7-v31`

Artifact build: `ui-20260830-09`

DS reference artifact build: `ui-20260821-05`

Target: <https://montri-th.github.io/CityMETER/>

## Outcome

The Thai and English CityMETER Showcase release uses a standalone unified Landometer navigation shell that follows the attached r7 handoff and the direction of the concurrently rebuilt Landometer Home. The shell sits outside React's hydrated `#root`, so the immutable compiled v29 header cannot replace the new navigation after hydration.

The catalog and contributor layer was not regenerated. It remains bound to the approved `2026-08-27-landom-thumbnail-sync-v29` manifest with these invariants:

- 38 public records/modules
- 51 contributor assignments
- 29 unique contributors
- 25 portrait identities
- 4 neutral fallback identities

## Shipped navigation

- carrier-free owner-approved color symbol and typed Arvo `Landometer` wordmark
- plain `/ CityMETER` product indicator
- four post-logo desktop controls: selected CityMETER, CityWiki, `คุยกับเรา` / `Contact us`, and menu
- one compact post-logo control: menu; fit hardening starts this composition at 820px while the handoff's 68px/16px/45px size tokens still switch at 600px
- menu with compact page links, compact CTA, four ecosystem destinations and the current CityMETER state
- fixed desktop bookmark rail for `#decisions`, `#examples` and `#datasets`; the same links move into the compact menu
- calm row-scale state after downward scroll; restore on upward scroll, near top, header intent or menu open
- a single aria-hidden, pointer-inert CTA text sweep
- prominent header and no sweep under reduced motion
- static no-JS navigation plus script-load and menu-install fail-open navigation
- initial-HTML critical header-exclusivity rule, so loss of the shell stylesheet does not expose the immutable React header as a second navigation landmark
- menu close by repeated button, Escape, transparent outside click, focus leaving the non-modal disclosure or any menu navigation; Escape/repeat restores the opener, while outside activation preserves a real destination focus and restores the opener when focus would otherwise remain in the hidden panel, `body`, or the document root
- navbar visible copy, menu labels, rail tooltips and ARIA follow post-hydration `<html lang>` changes, including the inherited `/` route preference/browser-language behavior

## Authority and conformance statement

The owner instruction on 2026-08-30 — “ผมจะให้พี่ไปเปลี่ยน navbar + motion ในนี้ https://montri-th.github.io/CityMETER/ เลยน่ะ” — authorizes the bounded navigation and motion release directly on the existing CityMETER GitHub Pages site. Approval `owner-citymeter-navbar-r7-20260830` binds the exact symbol hash, assembled typed lockup, light/dark surfaces, direct placement, CityMETER-navbar-only scope, effective date and no-expiry-until-revoked validity. The active design authority remains Landometer Design System v0.9.0-r7, source SHA-256 `52ef41f1b231f8b84955a40c21a018991a114a4f5eaabd8c5111816bf8d645b1`, Color Set `color-srgb-05`.

This release is `authoring_aligned_with_owner_directed_artifact_exceptions`. It does not claim that the attached Riddim amendment is active DS r8, and it does not claim full-page machine-package conformance. The Riddim proposal was reference-only: no governed adapter was generated and the existing v25 state-motion layer remains unchanged. The underlying compiled showcase still contains legacy layers. Rendered production self-check remains `pending_rendered_production_matrix` until post-deploy QA passes.

Recorded artifact exceptions:

| ID | Decision | Boundary |
|---|---|---|
| `NAV-IDENTITY-01` | approved color symbol on both themes | approval `owner-citymeter-navbar-r7-20260830` accepts the handoff-recorded 2.01:1 dark-canvas contrast for this navbar only |
| `NAV-WORDMARK-01` | `#757575` typed wordmark in both themes | artifact exception, not a normative DS merge |
| `NAV-CALM-01` | r7 row-scale calm state | undersized calm controls restore before pointer, focus or menu activation |
| `MOTION-01` | one continuous CTA sweep | decorative duplicate is hidden from accessibility and removed for reduced motion |
| `FIT-01` | product indicator hides below 901px; compact controls start at 820px; size tokens switch at 600px | 320–900px fit hardening; page H1 and current ecosystem row retain CityMETER identity |
| `NAV-UTILITY-01` | omit theme and locale controls in the unified CityMETER navbar | follows the attached CityMETER preset; the real English sibling and first-paint system/stored theme still work but are not discoverable from this navbar |
| `FLOW-04` | icon-only 44px menu and rail controls | every control retains an accessible name and tooltip |
| `NAV-RAIL-01` | fixed three-item desktop bookmark rail | hidden in compact composition; the same links remain in the menu |
| `NAV-ZINDEX-01` | local shell layering for header, rail, menu and skip link | isolated pending shared-package adoption; rendered overlap is a release-gate check |

## Exact receipts

`data/citymeter-unified-navbar-r7-v31.receipt.json` binds both initial HTML routes, navigation CSS and corrective JavaScript, the approved identity symbol, outline/filled Material Symbols Rounded subsets, `assets/unified-navbar-assets-v31.manifest.json` and the Apache-2.0 licence. The shell asset manifest records exact bytes, hashes, approval status, embedded font identities, axes, glyph maps, provenance and the immutable relationship to the v29 text-font manifest. The receipt also records the inherited contributor manifest and registry hashes.

Identity approval `owner-citymeter-navbar-r7-20260830`: asset SHA-256 `b818eeb6a6f4abeb7a8fac2b858de0e7a03a662dff371842a29ebfe4c21d12f6`, assembled as the full-colour symbol plus typed Arvo 700 wordmark `#757575`, directly on navbar light `#F6F7F3` and dark `#11191D`, for the CityMETER production navbar only, effective 2026-08-30 with `expiresAt: null`.

Material Symbols Rounded subsets are self-hosted at weight 300 / optical size 24 / grade 0:

- outline: `checklist`, `close`, `database`, `menu`, `visibility`
- filled active rail: `checklist`, `database`, `visibility`

## Release gates

Run from the repository root:

```bash
node scripts/apply-unified-navbar-r7-release.mjs --check
node scripts/build-unified-navbar-r7-receipt.mjs --check
node scripts/validate-unified-navbar-r7.mjs
node scripts/validate-release.mjs
node scripts/validate-p1-contributors.mjs
```

The custom gate verifies TH/EN initial shell parity, identity receipts, standalone placement before `#root`, critical legacy-header exclusion, the 4/1 control budget, menu semantics, local anchors, scrollspy, calm/reduced-motion contracts, icon GSUB ligatures, asset hashes and inherited contributor counts. Existing release and P1 contributor validators remain mandatory and must pass unchanged.

Post-deploy QA must additionally verify the served commit and workflow, CDN bytes for every receipt-bound artifact, hydration persistence, menu keyboard paths, calm/restore behavior, active rail state, reduced motion, 320/390/430/720/900/1120/1440 px containment, both locale routes, both themes and console/network health.
