# P6 shared-kit candidate receipt — 2026-08-25

Status: `gated` / not runtime-activated. This is a custody and provenance receipt, not product-release authority.

## Source identity

- Repository: `landometer-root-repo`
- Source HEAD: `d82ac775ab9d35a84cfb0dc77bc0ae804a7a0665`
- DS / authoring / package / kit: `0.9.0` / `v0.9.0-r7` / `v0.9.0-mp1` / `lds-kit-0.9.0-r4`
- Color set / token schema / manifest: `color-srgb-05` / `6` / `2.1`
- Package manifest SHA-256: `0b4b8bfd9abcf403cfebdc8fe9b3299a821eb6e2e96d0d5c9495f1627f206e47`

## Candidate custody

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/shared-kit/v0.9.0/lds-tokens.css` | 11392 | `aa834b08c6ecd00704a0c3580da83d291237738815a8e2e408aba12bb9551323` |
| `assets/shared-kit/v0.9.0/lds-base.css` | 10718 | `47eb23f0b2a06bd6882080bcc693384f5d59791b434045e7281b98fa2831903c` |

Validate from the repository root with `node scripts/validate-p6-shared-kit.mjs`. The validator checks the manifest IDs, source HEAD and package receipts, file sizes and hashes, and byte equality with the authoritative DS source.

## Open gates

- Upstream `skeleton.html` still carries a stale color-set identity; it is not vendored.
- The DS package does not yet include the required Material Symbols package/record.
- Browser visual review and manual QA remain outstanding for this product.
- The authorized CityMETER v28 files (`assets/index-qbT50gkr-v17.js`, `assets/catalog-enhancements-v24.js`, `assets/catalog-enhancements-v25.css`, both locale prerenders, the active registry, and `data/citymeter-contributor-release-p1-cf7e7b55a7a1.json`) are bound by the append-only product artifact build `ui-20260825-05`. The published `ui-20260825-04` receipt and earlier receipts remain historical and are not rewritten. The deterministic Landom build remains `ui-20260825-02`.
- CityMETER v28 carries separate site-owner authority for publication to the existing GitHub Pages site. The common atomic release, shared shell/component-source migration, and root/legal/privacy/accessibility artifacts remain gated.

No shared-kit stylesheet import or runtime reference was added, so this custody step does not alter the approved visual output. The active CityMETER v28 release reads `lds-theme` first, reads `citymeter-theme` only for backward compatibility, and writes only `lds-theme`; the remaining shared language/shell contract is still gated. This shared-kit custody receipt does not itself grant release authority; CityMETER publication authority is recorded separately in the v28 manifest and contributor receipt.
