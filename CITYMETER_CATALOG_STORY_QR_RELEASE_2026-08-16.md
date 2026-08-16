# CityMETER Catalog Story and Land Appraisal QR Release — 2026-08-16

Release receipt: `2026-08-16-catalog-story-qr-v20`

Status: local release candidate; commit, pull request, deployment, and production byte attestation are recorded only after those steps complete.

## Authorized scope

This release makes three focused changes:

1. Add one bilingual, semantic HTML/CSS diagram between the catalog heading and the existing search/filter controls. It explains why CityMETER organises 38 public data views and modules into `Land`, `Location`, and `Living`; how the three lenses support `Deep`, `Clear`, and `Easy` use; why the outcome is `Local Decisions`; and the distinct roles of CityMETER and Landometer.
2. Regenerate only `media/qr/land-appraisal.png` as a 512 × 512 RGBA QR with error correction Q. Its decoded payload is exactly `https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed`.
3. Keep the original concise `analysis-brief` description, while moving `Population by Age & Sex` to third in its related-record order so the first five links visibly cover `Location`, `Land`, and `Living`. The longer rejected explanation is not shipped; the new diagram owns that story.

## Diagram truth and boundaries

- `Land` — 12 views: the physical base of a place, including land, buildings, development, land use, and property markets.
- `Location` — 13 views: how a place works through business, markets, mobility, access, and local context.
- `Living` — 13 views: people and life in the place, including population, education, public services, hazards, and events.
- The mapping remains a CityMETER component-local information architecture, not a new Design System-wide color rule.
- The three groups use flat opaque surfaces, visible names, counts, and redundant accent rails. No atmosphere gradient encodes a category.
- `Local Decisions` is the outcome layer, not a fourth category.
- `Why CityMETER` explains the single path from a place question to relevant, inspectable views; `Why Landometer` explains how place evidence stays connected to the next check and decision.
- The 38 items are views and modules, not 38 independent source databases. Sources, periods, coverage, status, and limitations vary; not every view is time-dynamic, and each record should be inspected before use.
- The diagram introduces no image, canvas, video, fetch, focus target, or runtime enhancer dependency.

## Preserved contracts

- The existing catalog heading, search, filters, results, 38 cards, detail drawers, source disclosures, GD Catalog lineage marks, direct links, and QR blocks remain intact.
- Hero, six showcase cards, the concise analysis/brief description, Business Dynamics proof, CTA/share behavior, social metadata, handoff, contact, footer, light/dark themes, and exhibition mode remain intact.
- Static Thai/English HTML and the hydrated React owner render the same diagram in the same position.
- `assets/catalog-enhancements-v17.js` remains unchanged; it continues to own source-review enrichment and the 11 GD Catalog badges.
- All other dataset/page QR PNG bytes are unchanged.
- Locale Insight remains contextual prior only and is not used as official population, eligibility, statutory boundary, risk determination, or observed-behavior evidence.

## QR evidence

- Canonical registry/manifest destination: `https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed`
- New PNG: 512 × 512, RGBA, error correction Q.
- New SHA-256: `eeb68384e9327bf46b1a0c0d3fdad4b9206c5886e950ba31e20b642513a0f483`
- Independent decode check with `jsQR` returned the exact canonical destination above.
- The previous 256px PNG also decoded to the full canonical URL during this audit. The new bytes are intentionally higher resolution and use stronger error correction to address the reported scan failure rather than silently claiming a payload mismatch that the evidence did not reproduce.
- Direct navigation to the canonical destination retained the full Chonburi district/title-deed route and loaded the CityMETER page.

## Immutable artifacts

| Artifact | SHA-256 |
|---|---|
| `assets/index-qbT50gkr-v9.js` | `8f857fe4f6fb9e6dd39460eec3a841ba9338e54d1f479b8964fb410c197b0116` |
| `assets/catalog-enhancements-v17.css` (preserved input) | `8f4c95eb631b64b41d1beb6554265189474fff8dde419b0c0d4b46f985b8ff3a` |
| `assets/catalog-enhancements-v18.css` | `5661979c5ca33a332c3f57fc5dd233daa468875e7d0b32d0684ed3846bfc592a` |
| `scripts/apply-catalog-story-qr-release.mjs` | `67056fe888b79cfb7e20b53bc7ca53f8155c6a7321c11812815ef6c04195b2a1` |
| `scripts/generate-qr-assets.mjs` | `67d0b0869e4faa377ab78611f4f80d996d0ecd491c4bba8b0b2f0c745f1369c3` |
| `media/qr/land-appraisal.png` | `eeb68384e9327bf46b1a0c0d3fdad4b9206c5886e950ba31e20b642513a0f483` |
| `media/qr/manifest.json` | `214cb5ecc7a547bb875feb88dbda1d919a1607f1aefc6599260ec5c2de0025b6` |
| `index.html` | `e58105521c431a9ac86cbbc5162f5a5d2f1049cd58d4c8658e6a69f0f5a076f3` |
| `en/index.html` | `dd31d8c1fba710b18d951e810e5b910f3c54d10ecabcd67592a7e555c089d721` |

## Release gates

- JavaScript syntax and deterministic migration idempotence: passed locally on the candidate bytes recorded above.
- Project release validator and diff hygiene: passed locally.
- Bilingual HTTP browser smoke passed at desktop and 390px mobile widths in light/dark themes: the diagram stayed between the heading and toolbar before and after hydration, the catalog returned 38 → 12 → 38 records through filtering, horizontal overflow remained absent, and all 38 source-review blocks plus 11 GD Catalog marks remained present.
- The existing React minified error `#418` remains a documented baseline observation from the prior release; no new hydration signature was observed from this change.
- Real-device QR scan: open manual gate until checked with a phone camera after production deployment.
- Real iPhone Safari/WKWebView elastic-scroll verification remains the previously disclosed manual production gate.
- Production status, reviewed head, merge/deployed SHA, Pages run ID, final HTTP/MIME checks, and live hashes: pending authorized repository release.
