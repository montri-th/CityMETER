# CityMETER DS 0.9.1 slow-reveal release

Date: 2026-09-05

Release record: `2026-09-05-citymeter-ds091-public-v4`

Artifact build: `ui-20260905-ds091-public-v4`

Publication target: <https://montri-th.github.io/CityMETER/>

## Outcome

This revision restores slow reveal independently of the removed motif. Thai and English each bind 57 unique semantic targets: 3 supporting section headings, 6 showcase media items, 8 catalogue-structure elements, 38 dataset snapshots, 1 handoff media group, and 1 QR card.

The runtime uses the DS 0.9.1 browser-observer approach recipe, lands each logical target once, and keeps hero/LCP content, primary proof, search and filter controls, result status, card copy and actions, contact actions, identity, and legal content immediately visible. Small related groups use the bounded 0/150/300/450 ms four-beat stagger; the 38 dataset previews use individual 900 ms media arrival without a long stagger queue.

Catalogue filter rerenders preserve stable dataset-record keys. A snapshot that has landed does not replay when removed and restored; a snapshot that has not yet reached the viewport remains eligible for its first reveal. Deep links, history/BFCache restoration, reduced motion, focus, hidden tabs, print, missing observer support, observer failure, and the irrevocable 2.4-second initialization watchdog all fail open to the complete visible state.

The motif remains absent: active Thai and English pages load no motif stylesheet, web component, placement adapter, DOM, or motion control. The snapshot-hover clipping fix also remains active at the immediate 15 px rounded media frame.

No catalogue record, factual product claim, card order, snapshot byte, hydrated product bundle, or main catalogue enhancer changed in this revision.

## Authority and Design System binding

The owner directed the slow reveal restoration in `owner-message:2026-09-05:restore-slow-reveal-all-eligible-pieces` and previously directed motif removal in `owner-message:2026-09-05:remove-motif-from-citymeter`. No additional approval is required.

Active visual, interaction, accessibility, colour-projection, and web-format behavior is bound to DS `0.9.1` / authoring release `0.9.1-r8` / ruleset `lds-rules-0.9.1` / machine package `v0.9.1-mp7`.

## Exact release bytes

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/catalog-enhancements-ds-0.9.1-v29.css` | `06a31da996f6a0572781cf529bae207c4e54286ae69b4827268a0ef379c2bf66` | 46,526 |
| `assets/citymeter-ds-0.9.1-approach-reveal-v1.js` | `378c8797958cae7b39311125abe6d759eee6b9056b23c5d59243fb0786d88100` | 10,311 |
| `data/citymeter-ds-0.9.1-release-record.json` | `7f6961d8f797f834ae72fe447f2019438d321be10aa9685b6f8648945455ae28` | 8,102 |
| `scripts/apply-citymeter-ds-0.9.1-motif-release.mjs` | `3ba305e2e87308cce2b7a5bfd31fbee7f3b6a517098aa983bf98ff6b0b6f7307` | 70,040 |
| `index.html` | `a93d19c5a9bbdf69665ab714b4b7493d9843331c74af3d64b2a47406e7126610` | 548,586 |
| `en/index.html` | `562e70dcbf9f3c0031508b3ddaf740a755f036088aef75d62370751e846a30c5` | 471,692 |

The Thai and English body hashes remain unchanged from the approved public candidate because this revision changes active head references and release metadata while leaving the complete prerendered body intact.

## Verification gates

The settled candidate has been checked for:

- exactly 57 reveal targets and 57 unique logical keys in both Thai and English
- exact role inventory: 11 `approach.soft`, 45 `media.arrival`, and 1 `approach.inline-end`
- exact DS timing, threshold, root margin, movement, scale, and bounded small-group stagger
- once-only landing and exact unobserve behavior
- filter/search/reset continuity across React node replacement
- no reveal target inside protected task-critical regions
- complete deep-link and interruption fail-open behavior
- zero active motif references
- rounded snapshot-hover clipping, no horizontal overflow, and no browser warning or error
- preservation of all 38 catalogue records and Thai/English static–hydrated parity

GitHub Pages completion and live-byte equality are post-push publication gates.
