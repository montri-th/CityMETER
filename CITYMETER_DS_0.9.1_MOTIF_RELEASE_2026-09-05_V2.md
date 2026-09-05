# CityMETER DS 0.9.1 motif visibility and snapshot clipping release

Date: 2026-09-05

Release record: `2026-09-05-citymeter-ds091-motif-public-v2`

Artifact build: `ui-20260905-ds091-motif-public-v2`

Publication target: <https://montri-th.github.io/CityMETER/>

## Outcome

This revision makes the approved full-colour `rings` motif visible and useful in the Land + Location + Living orientation panel. It now has a reserved sidecar rather than behaving like a faint watermark, remains present throughout the supported responsive range, plays the supplied component's construction sequence once, and then moves continuously in a slow ambient loop as explicitly directed by the owner.

The movement can be paused and resumed with a visible Thai/English control. It becomes a static final-state graphic when the operating system requests reduced motion and pauses while the page is in a background tab. The motif remains decorative, `aria-hidden`, pointer-inert, outside text, and is never used as a border, rail, divider, control, evidence, status, or data encoding.

Dataset preview images still enlarge subtly on pointer hover, but the transformed pixels are now clipped by the immediate media frame at a 15 px inner top radius. Square image corners can no longer paint outside the card's 16 px rounded border.

No catalogue record, factual product claim, card order, snapshot byte, hydrated product bundle, or main catalogue enhancer was changed by this revision.

## Root causes resolved

- The previous adapter set `autoplay="false"`; only a subtle wrapper entrance moved, not the supplied rings.
- The motif was reduced to a small, quiet mark and hidden entirely at widths up to 979 px.
- The motif was absolutely positioned without a reserved layout zone, so prominence had to remain low to avoid overlapping text.
- The hover image scaled to `1.018` while relying on the outer card for clipping. A compositor layer could briefly expose square corners outside the rounded card.

## Authority and conformance boundary

The motif source and page use were already owner-approved. The owner's latest direction is recorded as `owner-message:2026-09-05:motif-must-move-continuously`; no additional approval is required for this release.

Continuous decorative ambient motion differs from the finite decorative-motion requirement in Landometer Design System 0.9.1 `MOTION-01`. This is a recorded CityMETER artifact-level divergence, not a change to the canonical Design System. The release therefore does not claim full DS 0.9.1 conformance, `artifact_qa_passed`, or `production_verified`. Reduced-motion and explicit pause/resume remain hard accessibility safeguards.

All other active visual, interaction, accessibility, colour-projection, and web-format behavior remains bound to DS `0.9.1` / authoring release `0.9.1-r8` / ruleset `lds-rules-0.9.1` / machine package `v0.9.1-mp7`.

## Exact release bytes

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/catalog-enhancements-ds-0.9.1-v27.css` | `0a10041fe6b53f99997fb12e56058187ed9479e138c82370b740443b4c970b9c` | 48,645 |
| `assets/citymeter-ds-0.9.1-motif-placement-v2.js` | `4cc7a131c62eafb9f1b3dc4989da0fc50c619ba0ea0c16ff044b5309db794be3` | 3,433 |
| `assets/landometer-motifs/v1/landometer-motifs.css` | `f5071a37a29bfe9196ea572f50d426bd7bb088c78219181ea8d3ae9f2fc4303c` | 4,194 |
| `assets/landometer-motifs/v1/landometer-motifs.js` | `593efc75a95daa3fdb458f0a4078c8ba207950d7ced14e1557548e6376e9a02f` | 8,056 |
| `assets/landometer-motifs/v1/manifest.json` | `6452e0fbc3c0b23330d6a188678d1dd9dde66cf22f19e0b7b471b48f4e7b5dee` | 4,818 |
| `data/citymeter-ds-0.9.1-release-record.json` | `70098843b7ecd13b63521ad41cd31814be6fe7e518f138102e50514252d3a1da` | 7,236 |
| `scripts/apply-citymeter-ds-0.9.1-motif-release.mjs` | `ded06dc96233e02c4d8b5a0495b6105fc176e1087775a20da39b2d0c46377284` | 68,432 |
| `index.html` | `2088ee8ae655fdda6a3f6150e81892c16c2846b8d134f74cae71385ff9f29db0` | 548,776 |
| `en/index.html` | `b56c484ceeb7a05217c5128277042953a8a481ed46f90bc23ee032e105264710` | 471,884 |

The supplied motif component CSS and JavaScript remain exact, unedited bytes. Only the page placement adapter and presentation layer changed.

## Verification gates

The deterministic migration is idempotent, JavaScript syntax is valid, and the dedicated DS release gate, unified-navigation gate, aggregate inherited-release gate, and whitespace gate pass. The installed DS machine package independently passes 5,394 checks, including 103 checksums, 50 rules, 6 format packs, 79 migrations, 37 fixtures, and 373 adversarial mutations.

The release gates assert:

- one motif placement and one localized pause/resume control after hydration
- a continuously repeating ambient animation, with reduced-motion and background-tab stops
- responsive motif visibility without text overlap or a JavaScript-disabled layout gap
- direct 15 px media-frame clipping around the scaled snapshot image
- exact Thai/English release identities and immutable v27/v2 asset references
- preservation of 38 catalogue records and all prior source, claim, schema, supporter-mark, and static/hydrated parity contracts
- absence of the prohibited coloured card edges, left rails, and decorative dividers

GitHub Pages provider completion, live-byte equality, and rendered browser checks are post-push publication gates. Their final commit and workflow identity are reported in the release handoff after deployment.
