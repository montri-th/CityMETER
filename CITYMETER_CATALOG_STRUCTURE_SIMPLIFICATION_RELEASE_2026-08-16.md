# CityMETER Catalog Structure Simplification Release — 2026-08-16

Release receipt: `2026-08-16-catalog-structure-simple-v21`

Status: validated local release candidate with open real-device gates. This receipt does not claim commit, pull request, deployment, or production verification.

## User-observed problem

The v20 catalog explainer behaved like a policy document rather than a quick visual guide. The first v21 candidate reduced the boxes, but the explicit `Deep / Clear / Easy` claims and repeated evidence caveat still interrupted the main idea and did not read like ordinary language.

## Authorized correction

The explainer now has one reading path with five primary marks:

1. `Land` — the physical base of the city.
2. `Living` — people, services, and everyday life.
3. `Location` — how the place works when those dimensions are read together, including change over time where the underlying view supports it.
4. `CityMETER` — one route to find, compare, and inspect 38 public views and modules.
5. `Landometer → Local Decisions` — the handoff from understanding place evidence to the next check and action.

The diagram no longer labels itself `Deep`, `Clear`, or `Easy`; those qualities must be evident from the communication. It also removes the repeated source caveat because source, period, coverage, and limitation details already remain available in every existing dataset card.

## Preserved truth and scope

- `Land`, `Location`, and `Living` remain the three CityMETER groups. The explainer uses `Land + Living → Location` as a narrative path, not as a formula or taxonomy change; filters, record ownership, and counts are unchanged.
- Counts remain derived from the canonical runtime group records: 12 Land, 13 Location, and 13 Living.
- Category colors remain a component-local candidate with visible names and accent rails. No atmosphere gradient encodes a category.
- The existing catalog heading, search, filters, 38 cards, detail drawers, 38 source-review blocks, 11 GD Catalog lineage marks, direct links, and QR blocks remain unchanged.
- The concise analysis/brief copy, Population-by-Age-and-Sex order, Land Appraisal QR, hero, showcase, contact, footer, SEO, social metadata, light/dark themes, and exhibition mode remain unchanged.
- `assets/catalog-enhancements-v17.js`, `data/catalog-source-review.json`, media, QR assets, and the v20 release artifacts remain byte-identical.
- Locale Insight remains contextual prior only and is not used as official population, eligibility, statutory boundary, risk determination, or observed-behavior evidence.

## Implementation contract

- Static Thai and English HTML and the hydrated React owner render the same semantic figure in the same position between the catalog heading and filters.
- The figure contains no image, video, canvas, iframe, network request, animation, or focusable control.
- Decorative `+` and `→` operators are hidden from assistive technology; the written caption carries the relationship.
- Desktop content width is capped at 1180px. The relationship becomes a single-column reading order at 720px without CSS reordering.
- The active CSS is rebuilt from immutable v17 plus the simpler scoped v21 diagram block, so the retired v20 diagram rules are not carried into the active stylesheet.

## Immutable local candidate

| Artifact | SHA-256 |
|---|---|
| `assets/index-qbT50gkr-v10.js` | `7946213bc8edefccf8ff2a2ca594903b548c51d11399dd0ea408295e71ab27ea` |
| `assets/catalog-enhancements-v19.css` | `e40c56eaf79c115349746c4ca721450342c5bba404e327e3882d25cb3ef7be95` |
| `scripts/apply-catalog-structure-simplification-release.mjs` | `b9b2fcef8e3a7661b5621428a0d488f2529cd83a4ffe807f7bc6392bfba78701` |
| `index.html` | `ba61313ad0c55356f6ea5e0d8435c5d448e68071c959760b4e8d8b12092579de` |
| `en/index.html` | `adb7efa309de2f5eb8a84c7448459c36655f5a391f8db10e28e122bb059d3eb5` |

## Release gates

- Syntax, deterministic migration idempotence, project validator, and diff hygiene: passed locally.
- HTTP browser smoke: passed for TH/EN, light/dark, 1440px and 390px. Each case retained one diagram, 38 cards, 38 source-review blocks, 11 GD Catalog lineage marks, zero horizontal overflow, zero failed requests, and a zero layout tail after the footer. React error #418 is the same pre-existing v20 baseline and was not introduced by this release.
- Production status: not published.
- Existing real-phone Land Appraisal QR scan and real iPhone Safari/WKWebView elastic-scroll checks remain open manual production gates.
