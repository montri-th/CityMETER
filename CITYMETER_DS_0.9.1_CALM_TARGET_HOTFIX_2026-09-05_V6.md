# CityMETER DS 0.9.1 public release V6

Date: 2026-09-05

Release record: `2026-09-05-citymeter-ds091-public-v6`

Artifact build: `ui-20260905-ds091-public-v6`

Target: <https://montri-th.github.io/CityMETER/>

## Outcome

V6 preserves every V5 behavior and corrects one issue caught during live verification: the scrolled calm header transformed its complete interactive row to 50%, reducing otherwise 44px language and theme targets to approximately 22px. The active V6 navbar keeps the row at `scale(1)`, uses a 60px calm header on desktop and 56px at compact widths, and retains calmness through surface, opacity, and brand-size changes instead of shrinking interactive controls.

Rendered checks cover 1280, 1120, 901, 821, 820, 600, and 390px widths. Direct desktop controls remain at least 44px in both normal and calm states. At 820px and below the direct preference group is hidden, the 44px menu button remains available, opening the menu removes calm state, and all menu language/theme controls remain at least 44px. No tested width introduces horizontal overflow.

Thai/English routing, System/Light/Dark persistence and synchronization, the owner-directed slow-reveal timing, motif removal, neutral DS colour treatment, rounded snapshot-hover clipping, 38-record evidence boundary, and all other V5 contracts remain unchanged.

## Exact candidate bytes

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/catalog-enhancements-ds-0.9.1-v30.css` | `7e3ed3a8b600114480e5b5cce63767f3e01c17800876549ec42e0a04b3abe041` | 46,604 |
| `assets/unified-navbar-r7-ds-0.9.1-v34.css` | `4aa2f994dc67e56866a9dc7d4805acfd206d647b33b0112e27ae69de3b2f08a3` | 22,318 |
| `assets/unified-navbar-r7-v32.js` | `461cec2c203236d3a0bf4f73333690b9eec731647e0c78cff8a1bb61e9e00989` | 22,328 |
| `assets/catalog-enhancements-ds-0.9.1-v26.js` | `f38e255ed8f921ea7beda520fe9d6eff9da0078ef69f892747b8585fad2807d5` | 61,551 |
| `assets/citymeter-ds-0.9.1-approach-reveal-v1.js` | `378c8797958cae7b39311125abe6d759eee6b9056b23c5d59243fb0786d88100` | 10,311 |
| `assets/index-qbT50gkr-v18.js` | `808fa6d1805b61181c8675885e68d3be664dcc50d277df3a3af21d0d85c3bed0` | 531,713 |
| `data/citymeter-ds-0.9.1-release-record.json` | `e1a690a2dbc80371b861b0e99b8514919f10f1eae8f0d2f3770f89d2d2b9aedc` | 10,265 |
| `scripts/apply-citymeter-ds-0.9.1-motif-release.mjs` | `1dc7e73e81c1ed1cb6400af37f6b5665448a0e60c7dc50bbafa46382a7a27180` | 81,289 |
| `index.html` | `94f25b588471f807fdac9af47fd2b165838c3ccbc069bd254ef2db2001ecfb00` | 551,242 |
| `en/index.html` | `d05945044bdcc33c53e2105eb2a51352488fe07e417edd812e38f560bf02301e` | 474,246 |

The release note itself is excluded from the self-referential candidate byte set.

## Governance boundary

The exact active Design System package remains `0.9.1` / `0.9.1-r8` / `lds-rules-0.9.1` / `v0.9.1-mp7`. All owner, product, brand, media, and supporter-mark authorities remain those recorded in `data/citymeter-ds-0.9.1-release-record.json` and the V5 release note. The owner-directed reveal durations remain an explicitly recorded artifact timing divergence; exact MOTION-03 recipe conformance is not claimed. Receipt-based `artifact_qa_passed` and `production_verified` remain unclaimed.
