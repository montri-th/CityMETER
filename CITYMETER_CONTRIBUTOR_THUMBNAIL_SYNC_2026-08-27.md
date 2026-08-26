# CityMETER contributor thumbnail synchronization receipt — 2026-08-27

Status: `approved_for_publication`

The site owner authorized republishing CityMETER at the existing GitHub Pages site after synchronizing contributor thumbnails with the current public Landom media contract. The approved 38-record contributor mapping is unchanged. The release manifest states `publishable: true` and `mustNotDeploy: false`.

## Scope

- Baseline CityMETER revision: `e8fca2abffe076b57a32995870135002c86bf9e9`
- Landom source revision: `c006313d4ade1a5cbc9ff87d945db2e98ddea707`
- Landom public media contract: `data/generated/people-media.json`
- Landom public media SHA-256: `31dae41636a9a874ddb8e58cc1e88273c9087f6a77f0a419a383d1576ea3ea64`
- Approved contributor mapping: `data/citymeter-contributor-mapping-p1-947f894511f8.json`
- Mapping SHA-256: `947f894511f8d46edd4cd50f0d41591657df85afbd004b03f447407f10e616d0`
- Active snapshot: `landom-sheet-20260825-9a5e5cc19e2a-media-31dae41636a9`
- Release receipt: `2026-08-27-landom-thumbnail-sync-v29`

## Result

- Coverage remains 38 records, 51 assignments, and 29 unique contributors.
- Current Landom state resolves to 25 portrait identities with 50 active 1x/2x WebP renditions and 4 governed neutral fallbacks.
- I0009 and I0034 now use their publishable Landom portraits instead of stale fallbacks.
- I0001, I0008, I0032, I0035, and I0039 now use thumbnails derived from their current Landom portrait bytes.
- All 25 publishable identities were regenerated from current Landom JPEGs to keep one deterministic thumbnail pipeline.
- The 46 previously published immutable WebP files remain present and are explicitly inventoried for rollback/cache safety.
- Thai and English profile links remain on the working Landom compatibility routes until the canonical production-domain route cutover.

## Immutable outputs

| Owner | Active artifact | SHA-256 |
| --- | --- | --- |
| Contributor registry | `data/citymeter-contributors-p1-c1d0f5a7c057.json` | `c1d0f5a7c0571ae799365c24f4238f3eeba507db99a88e2a00cc692fb761146f` |
| Release manifest | `data/citymeter-contributor-release-p1-7712069325b3.json` | `7712069325b33b3310d434908be674265250c7776c69b95bdfa9a020baea442b` |
| Transitional enhancer | `assets/catalog-enhancements-v25.js` | `6200d3fdc620ed5cd37da5f5babcac487117b14015bcdae7d020040ae8c7aa44` |
| Hydrated owner | `assets/index-qbT50gkr-v17.js` | `23d79ee191a447fcbfbfeee2b1514604882a9085e1bb9d1ed3361e89ec778b26` |
| Contributor styles | `assets/catalog-enhancements-v25.css` | `d37b1d43f6c582e0be32167f69e9ab48e58feada6633ff0f9c1aea82691482e7` |

## Verification evidence before publication

- The synchronization script completed in write mode and then returned the same registry, manifest, enhancer, source hashes, and 25/4 portrait partition in check mode.
- `node scripts/validate-p1-contributors.mjs`: pass.
- `node scripts/validate-release.mjs`: pass.
- JavaScript syntax checks for the synchronization script, both validators, hydrated owner, prior enhancer, and active enhancer: pass.
- `git diff --check`: pass.
- Local HTTP checks: Thai, English, registry, manifest, enhancer, and all 50 active WebP URLs returned `200`; every portrait response was `image/webp`.
- Visual contact-sheet review covered all 25 active 192×192 renditions. Each is derived from the current Landom JPEG; the source bytes and version suffixes match `people-media.json`.
- Static contract checks cover both no-JavaScript prerenders and hydrated ownership: 38 cards per locale, 51 assignments, 29 people, 46 portrait assignments, 5 fallback assignments, and 92 portrait image slots across compact and expanded presentations.

Live-byte and live-browser verification must follow the GitHub Pages deployment before final handoff.
