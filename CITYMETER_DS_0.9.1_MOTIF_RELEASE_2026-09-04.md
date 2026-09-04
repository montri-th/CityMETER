# CityMETER Design System 0.9.1 public release

Date: 2026-09-05

Release record: `2026-09-05-citymeter-ds091-motif-public-v1`

Artifact build: `ui-20260905-ds091-motif-public-v1`

Requested publication target: <https://montri-th.github.io/CityMETER/>

## Outcome

The Thai and English CityMETER site has been migrated locally to the active Landometer Design System 0.9.1 presentation layer. Decorative coloured card edges, rails and dividers are prohibited. They are replaced by neutral one-pixel separation, quiet DS surfaces, spacing and low elevation. Category, source and limitation meaning remains explicit in text rather than being encoded only by colour.

The approved `rings` motif is used once in the catalogue-orientation space to aid spatial orientation. It is decorative, pointer-inert and excluded from the accessibility tree. It plays once when the section becomes visible and resolves immediately to its final state for reduced motion or observer failure. It is not identity, evidence, data, state, a control, border or divider.

The catalogue remains 38 records. No new dataset or factual product claim was added. Product architecture, explanatory copy, evidence disclosures and JSON-LD were corrected so that Land, Location and Living are peer dimensions connected by CityMETER to Local Decisions. Unsupported exact promotional figures and unverified forecast/freshness wording were removed or explicitly limited.

The release is public and indexable. Owner publication authority is complete, including same-owner reuse of the existing Landometer snapshots. Formal receipt-based `artifact_qa_passed` and `production_verified` levels are not claimed by this release.

## Governed scope

- product scope: `CityMETER`
- format/runtime: `web_public`; static initial HTML with browser hydration
- current and intended delivery: public
- user job: find, compare and inspect place-data examples, then continue to the stated source or live example
- locales: Thai primary with an equivalent English route
- experience profile: `product_orientation`
- format pack / kit / target: `web.public.01` / `kit.web.base.01` / `target.web.responsive.360-1600.01`
- capability triggers: claims, evidence and motion

The exact boundary is recorded in `data/citymeter-ds-0.9.1-release-record.json`.

## Design System authority

| Field | Value |
|---|---|
| Design System | `0.9.1` |
| authoring release | `0.9.1-r8` |
| ruleset | `lds-rules-0.9.1` |
| machine package | `v0.9.1-mp7` |
| release tuple SHA-256 | `852f2cb97c5c7ba269c4c543f27cb4587b519263ea2075d84562289f21890e49` |
| audience colour projection | `assets/landometer-ds/v0.9.1/color-srgb-05.production.css` |
| colour projection SHA-256 | `3bac2499df594bbf6b016b650ee7763f7ec093e33bc5f28239144e0677281d5c` |
| colour projection bytes | `8184` |

The installed machine package passed 5,394 checks, 103 checksums, 50 rules, 6 format packs, 79 migrations, 37 fixtures and 373 adversarial mutations before this release was built.

## Owner authority and supplied evidence

- Master Brand Brief v0.5.3: owner-approved in `data/landometer-master-brand-brief-v0.5.3-approval.json`.
- CityMETER Product Brief, Landometer-aligned v6: owner-approved in `data/citymeter-product-brief-v6-approval.json`; supplied SHA-256 `3c84c6b51fe0f8a288090ddaeb5b732c53f30234241103daa1d5a8baa0914448`, 120,412 bytes.
- Publication intent, all current 38 catalogue records, the supplied motif and the project-scoped depa marks: owner-approved retroactively in `data/citymeter-owner-publication-approval-2026-09-04.json`.
- Existing Landometer website captures: confirmed by the owner as owner-directed, already deployed source material approved for same-owner reuse in `data/citymeter-owner-media-reuse-confirmation-2026-09-05.json`.
- Animated motif source: `Landometer Brand Motifs.zip`, SHA-256 `916d18dee1d760d53ec2157d511e16ac6379b645f2a923c40da4356b1b4f90a2`, 12,481 bytes. The CSS and JavaScript component files are copied byte-for-byte; autoplay is disabled and the page wrapper owns bounded motion.
- depa support marks: `data/citymeter-depa-supporter-marks-rights-record.json` binds the signed contract, depa decision material, owner delivery statement and exact PNG hashes. The visible wording is `ได้รับการส่งเสริมและสนับสนุนโดย depa` / `Promoted and supported by depa`. The depa, dSURE Software and Digital Service Account marks appear once in the footer and never in the hero.

These records authorize the owner-controlled product positioning, exact page use, same-owner snapshot reuse and publication intent. Existing provider pixels and any attribution remain unchanged; the record does not alter provider licences or create endorsement claims.

## Final release bytes

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/landometer-ds/v0.9.1/color-srgb-05.production.css` | `3bac2499df594bbf6b016b650ee7763f7ec093e33bc5f28239144e0677281d5c` | 8,184 |
| `assets/index-cqxdfePB.css` | `96c6366c085d7d36d9f6786f1f77f2bacb279805ff1e3e7fb7743ee30bf0a6e1` | 23,726 |
| `assets/catalog-enhancements-ds-0.9.1-v26.css` | `81afa73a797277169243ae2b9df5819b654941764f6442fe3db4e1e3492c3ff2` | 46,423 |
| `assets/unified-navbar-r7-ds-0.9.1-v32.css` | `ad62a48dd65cfbba3798b26679a13b73e07f08927306780757ce15185a408fa2` | 19,010 |
| `assets/landometer-motifs/v1/landometer-motifs.css` | `f5071a37a29bfe9196ea572f50d426bd7bb088c78219181ea8d3ae9f2fc4303c` | 4,194 |
| `assets/landometer-motifs/v1/landometer-motifs.js` | `593efc75a95daa3fdb458f0a4078c8ba207950d7ced14e1557548e6376e9a02f` | 8,056 |
| `assets/citymeter-ds-0.9.1-motif-placement-v1.js` | `a2a36b348bafd96a0e0e41b118acd078f9ba96b752cb5728cbc5701986fa737d` | 4,550 |
| `assets/catalog-enhancements-ds-0.9.1-v26.js` | `f38e255ed8f921ea7beda520fe9d6eff9da0078ef69f892747b8585fad2807d5` | 61,551 |
| `assets/index-qbT50gkr-v18.js` | `808fa6d1805b61181c8675885e68d3be664dcc50d277df3a3af21d0d85c3bed0` | 531,713 |
| `index.html` | `bd6056f7bbb23d2a237e61c673e5c1e49b2fe89e3d49c1d84cafc838b2d94c23` | 548,776 |
| `en/index.html` | `14272f275c0cbf9e2352c16db6ee748350cd8f24c99e03d4119a988aef35046c` | 471,884 |
| `data/catalog-source-review.json` | `b1141375790b3d6c4d63cf064702b49bf246f26695373ab59e9b9f8bb2e167a4` | 72,839 |

## Implemented changes

- removed coloured top edges and left rails from cards, structure rows, outcomes, active filters and navigation treatments
- retained coloured focus indicators only where they communicate keyboard focus, not decoration
- bound all audience colour roles to the exact `color-srgb-05.production.css`; raw colour provenance files are not shipped
- used neutral borders, surfaces, spacing, typography and low elevation to communicate hierarchy
- preserved textual Land / Location / Living labels and explicit source-status labels
- embedded one deterministic source registry for static and hydrated rendering; no duplicate registry IDs
- exposed 38 unique card claim IDs and 38 source reviews with honest status labels: 11 verified lineage, 7 candidate, 5 specialist source, 2 derived and 13 unproven
- retained 36 `Dataset` entries and 2 event `CreativeWork` entries in JSON-LD; removed the ItemList-only `numberOfItems` property from `DataCatalog`
- labelled all three conceptual previews in visible copy and accessible text
- restored the three supplied depa-related marks once in the footer without redrawing, recolouring or hero duplication
- replaced icon-only social links with explicit text
- retired perpetual navbar CTA sweep and wordmark flicker; preserved 44 px targets, visible focus and no-JavaScript content

## Local verification

The deterministic migration is idempotent. Static and hydrated pages were checked across Thai and English, normal and reduced motion, deep links and 360, 600, 713, 900, 1200, 1440 and 1600 px widths. The checks observed 38 cards, 38 matching source reviews, one registry, one motif placement, one footer supporter group, no hero supporter group, no duplicate IDs, no horizontal overflow and no application console/page/request errors. The three exact supporter assets load and remain visibly distinguishable after the footer enters the viewport.

The local gates are:

```bash
node scripts/apply-citymeter-ds-0.9.1-motif-release.mjs --check
node scripts/validate-citymeter-ds-0.9.1-release.mjs
node scripts/validate-unified-navbar-r7.mjs
node scripts/validate-release.mjs
```

These observations verify local implementation behavior; live-provider verification follows deployment. They are not a signed formal-conformance promotion.

## Publication and formal-conformance boundary

Publication to the existing GitHub Pages URL is owner-authorized. The release record is `ready_for_publication`, `publishable: true`, `mustNotDeploy: false`.

The project does not claim receipt-based `artifact_qa_passed` or `production_verified`. A caller-pinned `operator_external` trust pair, signed promotion bundle and post-deployment CityMETER byte checks are required only before making either formal conformance claim; their absence is not a pre-deploy blocker.
