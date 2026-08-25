# CityMETER contributor P1 publication receipt — 2026-08-25

Status: `approved_for_publication` / `ready_with_open_manual_gate`

This receipt covers the CityMETER contributor-consumption lane only. On 2026-08-25 the site owner authorized publication of this completed lane to the existing CityMETER GitHub Pages site while preserving the approved live content. The active manifest therefore states `publishable: true` and `mustNotDeploy: false`. This scoped CityMETER authority does not change the separate common atomic-release state.

The page-level and contributor-build receipts now both identify the authorized release `2026-08-25-contributor-note-removal-v28`. Its active manifest records `releaseStatus: approved_for_publication`, `releaseAuthority.authority: site_owner`, `publishable: true`, and `mustNotDeploy: false`.

## Scope and result

- Baseline CityMETER revision: `c6067ec648f64c3620a301b4114b9f05cc2c2b77`
- Common public snapshot: `landom-sheet-20260825-9a5e5cc19e2a`
- Routes checked: `/` (`th`) and `/en/` (`en`)
- Coverage: 38 cards per locale, 51 contributor assignments, 29 unique contributors
- Collapsed-card presentation: only the small contributor portraits are shown; contributor names and profile links remain inside the native expanded details
- Portrait handling: 23 contributor identities with governed 1x/2x WebP renditions; 6 identities use the neutral non-borrowing fallback
- Owner-directed copy change: the contributor disclaimer paragraph and its obsolete accessibility reference are removed from both locales; contributor identity remains typed as `Person` contributor data in the registry and JSON-LD
- Person link contract: the registry retains canonical `/landom/people/{personId}` and `/en/landom/people/{personId}` fields, while the open `canonical_person_routes_activation` gate deterministically resolves current links to the approved same-origin `/Landom/?person={personId}&lang=th` and `/Landom/en/?person={personId}&lang=en` compatibility routes
- Structured data: 36 `Dataset` records plus 2 event archives as `hasPart` `CreativeWork`, with 51 `Person` contributor assignments per locale
- Accessibility: each Thai and English contributor link has an exact decoded accessible name derived from the visible card title; encoded-title input cannot produce a double-escaped name; the two projected `+N` disclosures have a 44px control, visible enhanced close control, Escape handling, focus containment and return, while native `details` remains usable without JavaScript
- Resilience: governed portraits keep a fixed 32px box and switch to the neutral silhouette when image loading fails, without expanding the card; `auto`/`system` theme preferences read canonical `lds-theme` first, fall back to legacy `citymeter-theme`, and all UI writes use `lds-theme`
- Private approval/provenance fields: excluded by strict per-object public-key allowlists and snake_case negative fixtures

## Frozen upstream inputs

| Input | SHA-256 |
| --- | --- |
| `common-public-snapshot.json` | `4854eab202468d4f2f4dfcd6413e4c4880eb6466c19676e0a744faa8a4fd9988` |
| `citymeter/contributors.json` | `1f8a6b5b91e554f01f7d3a1765aa8e552ef344edc6d24bb78a3bcc3be49f060c` |
| `portrait-derivatives.json` | `3ac85bf6048973f7734c2a3fe75e6910c713aaed9f5b9c90981c1631898b9e1c` |
| `release-manifest.json` | `7d05188744b587a495a2761a3fd1522f71415ddea1a11efed5e5fff67671839a` |

## CityMETER immutable outputs

| Owner | Active artifact | SHA-256 |
| --- | --- | --- |
| Public contributor registry | `data/citymeter-contributors-p1-d8a4a6682493.json` | `d8a4a66824933f72040e599b25f406e0aa6f5b6c49642c54c9a38401e3f9844b` |
| Authorized v28 manifest | `data/citymeter-contributor-release-p1-cf7e7b55a7a1.json` | `cf7e7b55a7a14666cb98a6af6a9280638b1c0c150344fde076c60842f7a9b8b2` |
| Hydrated owner | `assets/index-qbT50gkr-v17.js` | `23d79ee191a447fcbfbfeee2b1514604882a9085e1bb9d1ed3361e89ec778b26` |
| Transitional enhancer | `assets/catalog-enhancements-v24.js` | `ccdb8806de93b797a4938666c6917fa5fee30e40fd55dfadd240d5719aa8c3db` |
| Contributor styles | `assets/catalog-enhancements-v25.css` | `d37b1d43f6c582e0be32167f69e9ab48e58feada6633ff0f9c1aea82691482e7` |
| Thai prerender | `index.html` | `1cfb7088f8718032125a52944394516e88fce09073e59f363a7e768fef790e55` |
| English prerender | `en/index.html` | `7bf72cce91bd6cbc220a7d4f16b4e3a8a36e93f3117c15cb8de4448c8db47c40` |

Both locale documents reference exactly these three v28 render owners, the active public registry, and the one authorized v28 manifest. Build Card generation binds these settled bytes to the append-only CityMETER artifact build `ui-20260825-05`; the published `ui-20260825-04` receipt and earlier receipts remain historical evidence and are not rewritten. The approved pre-P1 source owners remain untouched.

Design-system identity: package `v0.9.0-mp1`, UI kit `lds-kit-0.9.0-r4`, manifest `2.1`, color set `color-srgb-05`, authority source `d82ac775ab9d35a84cfb0dc77bc0ae804a7a0665`.

## Verification evidence

- Deterministic migration re-run produced byte-identical HTML, registry, manifest, v28 render owners, and 46 copied portrait files.
- `node scripts/validate-release.mjs`: pass.
- `node scripts/validate-p1-contributors.mjs`: pass.
- `node scripts/validate-p0-contract.mjs`: pass; the private P0 contract was read-only.
- JavaScript syntax checks for the migration and validators: pass.
- `git diff --check`: pass.
- Local HTTP runtime: Thai `/` and English `/en/` return `200`; the I0030 governed 2x rendition returns `200 image/webp` and decodes as a 384×384 WebP.
- Static/hydrated owner validation derives its totals from the immutable registry/manifest contract and currently covers 38 cards, 38 contributor blocks, 51 assignments, 29 unique people, 36 Dataset records, 2 event CreativeWork records, 51 structured-data contributors, two `+N` disclosures, and the search/re-render ownership contract.
- Accessible-name sample: `Buildings: Footprint, GFA & Height` is emitted as one HTML-escaped `&amp;`, decodes to one accessible `&`, and contains no `&amp;amp;`.
- Fallback sample: I0034 is a governed `neutral_fallback` on two records and renders the neutral silhouette with no image element in both prerendered locales.
- A fresh interactive browser hydration/console/state-change pass remains a named manual gate: the in-app browser was available, but its admin-enforced security policy could not be verified for either the live URL or the sanitized public-only local preview. This receipt does not claim a fresh browser pass; `design-qa.md` records `final result: blocked` for that evidence gap.
- Directory-set checks require exactly one P1 registry, exactly one P1 manifest, and exactly the 46 content-addressed WebP files declared by the active registry.

The 46 copied WebP files have content-addressed names, declared dimensions, lazy loading, and asynchronous decoding. No measured Core Web Vitals claim is made by this receipt.

## Remaining release gates

The frozen common release manifest remains `draft`, `publishable: false`, and `mustNotDeploy: true`. Those common values govern the still-unfinished cross-product atomic set; they do not revoke the site owner's narrower authorization to publish CityMETER v28 to the existing Pages site. The common manifest records nine open atomic-set/operational gates, including catalog taxonomy approval, canonical CityMETER route approval, canonical person-route activation, portrait derivative visual review, root/CityMETER/Landom build receipts, scheduled Sheet refresh configuration, and atomic release-set attestation. The City lane additionally retains the fresh interactive browser hydration/console/state-change check as an explicit manual gate. `localeAggregation.performed` is `false`; there are no aggregation outputs, so the Locale crosswalk rule is retained as a prerequisite only if future Locale aggregation is performed, not as an unconditional P1 release gate.
