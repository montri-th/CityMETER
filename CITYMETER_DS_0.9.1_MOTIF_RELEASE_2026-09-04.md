# CityMETER Design System 0.9.1 and motif internal candidate

Date: 2026-09-04

Candidate record: `2026-09-04-citymeter-ds091-motif-internal-v1`

Artifact build: `ui-20260904-ds091-motif-internal-v1`

Intended target, not published: <https://montri-th.github.io/CityMETER/>

## Outcome

The Thai and English CityMETER showcase has a local internal candidate for the active Landometer Design System 0.9.1 presentation layer. Decorative coloured card edges, rails and dividers are prohibited in this candidate. They are replaced by neutral one-pixel separation, quiet DS surfaces, spacing and low elevation. Category meaning remains explicit in text rather than being encoded only by colour.

One owner-approved animated `rings` motif is placed in the dataset-catalog orientation space to help explain spatial relationship. It is decorative and pointer-inert, plays once only when the section becomes visible, and resolves directly to its final state for reduced motion or observer failure. It is not identity, evidence, data, status, a control, a border or a divider.

This is a presentation-only candidate. Existing CityMETER product copy, claims and the 38-record catalogue remain unchanged. It is explicitly non-indexable, not publishable and must not be deployed until the blockers below are resolved.

## Governed scope

- product scope: `CityMETER`
- intended artifact and runtime: `web_public`, static initial HTML with browser hydration
- current delivery audience: internal review; intended audience after gates: public
- user job: find, compare and inspect place-data examples, then continue to the stated source or live example
- locale state: Thai primary with an equivalent English route
- experience profile: `product_orientation`
- capability triggers requiring resolution: claims, evidence and motion handling
- format pack, kit and target: `web.public.01`, `kit.web.base.01`, `target.web.responsive.360-1600.01`

The exact authority and boundary are recorded in `data/citymeter-ds-0.9.1-release-record.json`.

## Design System authority

The active release tuple used by this artifact is:

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

The machine package validator passed 5,394 checks across 50 rules, 6 packs, 79 migrations, 37 fixtures and 373 adversarial mutations before this artifact was authored.

## Owner approvals and evidence boundary

Master Brand Brief v0.5.3 is recorded as owner-approved in `data/landometer-master-brand-brief-v0.5.3-approval.json`. Its authority covers portfolio identity, shared methodology, shared design principles and product architecture. It does not approve CityMETER product or capability claims, dataset truth, unrelated asset rights, artifact QA or production conformance.

The supplied `Landometer Brand Motifs.zip` is recorded as owner-approved for this CityMETER public page in `assets/landometer-motifs/v1/manifest.json`:

| Asset | SHA-256 | Bytes |
|---|---|---:|
| source archive | `916d18dee1d760d53ec2157d511e16ac6379b645f2a923c40da4356b1b4f90a2` | 12481 |
| `landometer-motifs.css` | `f5071a37a29bfe9196ea572f50d426bd7bb088c78219181ea8d3ae9f2fc4303c` | 4194 |
| `landometer-motifs.js` | `593efc75a95daa3fdb458f0a4078c8ba207950d7ced14e1557548e6376e9a02f` | 8056 |

The component files are copied byte-for-byte. Component autoplay is disabled; only the placement wrapper uses the governed DS adapter. No replay method is invoked.

The project copy of the CityMETER Product Brief is unavailable, so this candidate does not add or expand product claims. Initial-body preservation is bound by SHA-256:

- Thai: `91eff79f1c868975f7d4deece7bc847a8f91e0e4ba16d759b874150a6283aa5b`
- English: `98557225006c9168f874bad92249c18756f28781995d0c1b0b2a3e34974b968a`

Settled candidate bytes:

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/landometer-ds/v0.9.1/color-srgb-05.production.css` | `3bac2499df594bbf6b016b650ee7763f7ec093e33bc5f28239144e0677281d5c` | 8184 |
| `assets/index-cqxdfePB.css` | `96c6366c085d7d36d9f6786f1f77f2bacb279805ff1e3e7fb7743ee30bf0a6e1` | 23726 |
| `assets/catalog-enhancements-ds-0.9.1-v26.css` | `e6490f3fb7b7d2ae83738401d5f0b3d06c76ad623ad3058cb6743e05fc50e60d` | 46029 |
| `assets/unified-navbar-r7-ds-0.9.1-v32.css` | `56450afb1d12fb0047f60b0affa26239029bbe73d5f76bd43bc9ecabbb9df511` | 19014 |
| `assets/citymeter-ds-0.9.1-motif-placement-v1.js` | `a2a36b348bafd96a0e0e41b118acd078f9ba96b752cb5728cbc5701986fa737d` | 4550 |
| `assets/index-qbT50gkr-v18.js` | `f05fbbea8bbe9611c717207e004b1891ace973de93dc606625f78588ec5d77b3` | 419960 |
| `index.html` | `ada8eeedf06317af5780bd51f709ab6e3f384622ef7766c6abedbacf800419e9` | 401782 |
| `en/index.html` | `1236615f81e75f8b9d7c925ccbd7d6a7b0c195ce95f9a52e8fa91400fefa851c` | 349560 |

## Presentation changes

- removed coloured top edges from catalogue and result cards
- removed coloured left rails from the CityMETER outcome and lineage rows
- removed coloured edges from the catalogue steps and lineage definition
- replaced those treatments with DS neutral borders, surfaces, spacing and low elevation
- projected light and dark colour roles only through the approved audience CSS; no raw colour-provenance files ship
- preserved readable category labels instead of relying on colour alone
- added one responsive, decorative catalogue-orientation motif with an inert fallback
- retired the historical perpetual navbar CTA sweep and wordmark flicker to meet bounded-motion rules
- retained minimum 44 px interactive targets, visible keyboard focus and no-JavaScript content access

## Candidate verification

The deterministic migration is idempotent and the local source gates pass:

```bash
node scripts/apply-citymeter-ds-0.9.1-motif-release.mjs --check
node scripts/validate-citymeter-ds-0.9.1-release.mjs
node scripts/validate-unified-navbar-r7.mjs
node scripts/validate-release.mjs
```

Exploratory browser checks informed the candidate, including both locales, neutral computed edges and the motif's initial, reached-section and deep-link fail-open states. Earlier layout exploration also covered the intended responsive widths, themes, keyboard path, reduced motion, no-JavaScript path and search mutation. These observations are not governed receipts and do not promote the candidate.

After product authority and machine records are supplied, the exact settled bytes still require a new, receipt-bound matrix covering:

- Thai and English routes and full static/hydrated parity
- 360, 600, 713 × 823, 900, 1200, 1440 and 1600 px viewports without horizontal overflow
- light, dark and print; keyboard, assistive-technology, zoom/reflow and target-size checks
- normal/reduced motion, observer failure, initialization timeout, hidden tab, focus, deep link and history/BFCache restoration
- no JavaScript, delayed/failed dependencies, search mutation and restored history
- exact final bytes, provider deployment and canonical live-route verification

No provider or live-byte evidence has been collected for this candidate because publication is blocked. The existing production site remains unchanged.

## Conformance boundary

This candidate is `internal_preview` and claims no Design System artifact-conformance level. It is `publishable: false` and `mustNotDeploy: true` because the approved CityMETER Product Brief and signed claim/evidence release are unavailable, and the exact candidate lacks an artifact-resolved Build Card, format implementation, artifact manifest, claim chain and promotion receipts. Owner approval of the Master Brand Brief and motif does not substitute for product truth or those gates.
