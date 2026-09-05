# CityMETER DS 0.9.1 controls-and-reveal release

Date: 2026-09-05

Status: **ready for publication; live verification follows deployment**

Release record: `2026-09-05-citymeter-ds091-public-v5`

Artifact build: `ui-20260905-ds091-public-v5`

Publication target: <https://montri-th.github.io/CityMETER/>

## Intended outcome

This revision makes the restored entrance rhythm clearly perceivable and restores direct access to the missing Thai/English and theme choices. The motif remains removed, and the rounded snapshot-hover clipping fix remains active.

Thai and English continue to bind the same 57 unique semantic reveal targets: 3 supporting section headings, 6 showcase media items, 8 catalogue-structure elements, 38 dataset snapshots, 1 handoff media group, and 1 QR card. Hero/LCP content, primary proof and decisions, search and filter controls, result status, card copy and actions, contact actions, identity, and legal content remain immediately visible.

The reveal runtime remains `assets/citymeter-ds-0.9.1-approach-reveal-v1.js`. Its one-observer, once-only, stable-key catalogue handling, bounded 0/150/300/450 ms small-group stagger, unstaggered dataset previews, and all interruption/fail-open behavior are unchanged.

## Owner-directed pacing disposition

The owner directed the reveal to be slower and more visibly distinct in `owner-message:2026-09-05:reveal-slower-and-more-perceivable`.

The V5 artifact therefore uses:

- opacity duration: 1,200 ms
- transform duration: 1,450 ms
- media duration: 1,350 ms

The canonical DS 0.9.1 `motion-riddim-approach-02` baseline is 760 ms opacity, 920 ms transform, and 900 ms media. V5 preserves the canonical 32 px block travel, 36 px inline travel, `.985` scale, easing curves, observer threshold/root margin, and 150/450 ms stagger bounds, but the three duration extensions are an explicit owner-directed artifact divergence. Exact `MOTION-03` recipe conformance is not claimed.

The complete source HTML remains the visible final state. Missing or failed observer support, reduced motion, hidden tabs, focus, deep links, history/BFCache restoration, print, and the irrevocable initialization watchdog continue to fail open without withholding content or controls.

## Language and theme control restoration

The owner directed restoration of the missing Thai/English and theme choices in `owner-message:2026-09-05:restore-language-and-theme-controls`.

The V5 candidate provides visible and keyboard-operable Thai and English choices plus system, light, and dark theme choices. Direct desktop controls and synchronized compact-menu controls preserve the governed header control budget, active-state clarity, 44 px targets, focus visibility, locale equivalence, and no-JavaScript language links.

Thai/English switching preserves the existing query and hash while routing to the matching locale. Theme selection persists in both supported storage keys, synchronizes the header and menu states, and follows operating-system changes when System is selected. The versioned navigation assets and both locale documents are integrated; local static, interaction, responsive-fit and browser checks pass.

## Authority and Design System binding

The owner directions above authorize the artifact-level changes. Existing publication, product-brief, brand-brief, media-reuse, depa-mark, and contributor authorities remain unchanged.

Active visual, interaction, accessibility, colour-projection, and web-format behavior remains bound to DS `0.9.1` / authoring release `0.9.1-r8` / ruleset `lds-rules-0.9.1` / machine package `v0.9.1-mp7`, subject to the explicitly recorded reveal-duration divergence. This release does not claim receipt-based `artifact_qa_passed` or `production_verified` conformance.

## Exact candidate bytes

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/catalog-enhancements-ds-0.9.1-v30.css` | `7e3ed3a8b600114480e5b5cce63767f3e01c17800876549ec42e0a04b3abe041` | 46,604 |
| `assets/unified-navbar-r7-ds-0.9.1-v33.css` | `2e32dbe287ee3a66cfbf532cfccfd3c043bbead10cd335e28749d283b1736804` | 22,270 |
| `assets/unified-navbar-r7-v32.js` | `461cec2c203236d3a0bf4f73333690b9eec731647e0c78cff8a1bb61e9e00989` | 22,328 |
| `assets/catalog-enhancements-ds-0.9.1-v26.js` | `f38e255ed8f921ea7beda520fe9d6eff9da0078ef69f892747b8585fad2807d5` | 61,551 |
| `assets/citymeter-ds-0.9.1-approach-reveal-v1.js` | `378c8797958cae7b39311125abe6d759eee6b9056b23c5d59243fb0786d88100` | 10,311 |
| `assets/index-qbT50gkr-v18.js` | `808fa6d1805b61181c8675885e68d3be664dcc50d277df3a3af21d0d85c3bed0` | 531,713 |
| `data/citymeter-ds-0.9.1-release-record.json` | `dc5fabff49e006ad3b7735149920e857f5779d9c9454f8b8ba8360f2e3f9d0c5` | 10,098 |
| `scripts/apply-citymeter-ds-0.9.1-motif-release.mjs` | `a561304ce38e2b83d78b8fccb7118be959bc1e1414df99f9a15921b62f7889b8` | 80,933 |
| `index.html` | `c6b78be1b75ae10963b335cef450d3998b73f779db5f43442b2f23d6f8d6380e` | 551,242 |
| `en/index.html` | `f769518b80c6876df37e60cc2f2fdeffb6ba03ee0076d7ce656674112ebbc513` | 474,246 |

These bytes are pinned by the dedicated release gate. The release note itself is excluded from the self-referential byte set.

## Local verification gates

The settled V5 candidate has verified:

- visible and operable Thai/English and system/light/dark choices at desktop and compact breakpoints
- language-route, query/hash preservation, persisted theme, system-theme response, keyboard, focus, and reduced-motion behavior
- exactly 57 reveal targets and 57 unique logical keys in both Thai and English
- exact active V5 durations of 1,200/1,450/1,350 ms and preserved 32/36 px travel, `.985` scale, threshold, root margin, and 150/450 ms stagger bounds
- once-only landing, filter/search/reset continuity, deep-link/interruption fail-open, and no protected-region reveal targets
- zero active motif references and preserved rounded snapshot-hover clipping
- preservation of all 38 catalogue records, Thai/English static–hydrated parity, no horizontal overflow, and no browser warning or error
- deterministic migration idempotence and exact local release bytes

Successful GitHub Pages completion and live-byte equality remain post-push publication gates.

No catalogue record, factual product claim, card order, snapshot byte, or hydrated product bundle is intended to change in this revision.
