# CityMETER motion and image performance release — 2026-08-16

Release identity: `2026-08-16-motion-image-performance-v23`

## Outcome

ปรับ motion ให้มีจังหวะสั้น–ยาวแบบ “reggae groove” โดยยังคงความชัดและ accessibility พร้อมลดน้ำหนักภาพการ์ด 38 ใบจาก 3,736,630 bytes เหลือ 1,421,966 bytes (ลด 61.9%)

## Changed

- `index.html`, `en/index.html`: active v12/v21/v19 refs และ dataset-card preview-v3 800×500
- `assets/index-qbT50gkr-v12.js`: hydrated dataset preview parity, hero autoplay policy ตาม viewport/network และ JSON-LD/transcript text-node parity ที่ไม่ทิ้ง hydration warning
- `assets/catalog-enhancements-v21.css`: scoped intent/social interaction refinement
- `assets/catalog-enhancements-v19.js`: syncopated motion, first-row preview warmup และ registry fetch ที่เริ่มพร้อม hydration wait
- `media/previews-v3/`: 38 deterministic presentation thumbnails + manifest
- `scripts/build-card-previews.py`: pinned image build contract
- `scripts/apply-motion-image-performance-release.mjs`: immutable migration
- `scripts/validate-release.mjs`: v23 artifact, motion, loading and byte-budget gates
- `CITYMETER_REBUILD_BRIEF.md`: step-by-step team rebuild handoff

## Unchanged

- Copy, page story, catalog records, Land/Location/Living mapping and counts
- Intent/showcase evidence captures in `media/previews-v2`
- Hero poster/reel bytes, QR routes/assets, social metadata, GD Catalog lineage and source registry
- Footer links, category-card surfaces and atmosphere gradients
- Historical immutable assets and receipts

## Performance evidence

- 38 preview-v2 sources: 3,736,630 bytes, 1200×750 each
- 38 preview-v3 outputs: 1,421,966 bytes, 800×500 each
- Transfer reduction: 2,314,664 bytes / 61.9%
- Unique local image payload ต่อ route: 4,133,802 → 2,417,426 bytes (ลด 41.5%; เป็น source-byte evidence ไม่ใช่ browser waterfall)
- Decoded surface: 34.2 MP → 15.2 MP (approximately 56% lower)
- Preview budget: pass at ≤1.45 MB
- CWV: `not_assessed` because Chrome DevTools trace was unavailable in this environment

## Immutable identities

- `assets/index-qbT50gkr-v12.js`: `f8d0f7d2f9fb5a643be4fce0310d025ab7559a458e04651580371cff03265600`
- `assets/catalog-enhancements-v21.css`: `e34d4384f49c9d16b00f6746758ce93a4c04d2128f04f8e9cd905a7a03ab6f7a`
- `assets/catalog-enhancements-v19.js`: `43324277a611d0a79c488c13355e63418703168cd2d2844f7f3438195ea00ea3`
- `media/previews-v3/manifest.json`: `e9430d86a03d800d456faad510b546f07332a0bfd94092bc9f2a768582ff614e`
- `scripts/build-card-previews.py`: `31004c77cf5d530934e1f90857f319a4739b8a360b0ffc8afec0fd7469b75708`
- `scripts/apply-motion-image-performance-release.mjs`: `31c537077449fe82bbb093f08bc6172c89ecb4b3161c45a952f0f447a4c42cc2`

## QA receipt

- Syntax, project validator and diff hygiene: passed locally
- Deterministic image build: two consecutive runs produced byte-identical 38-file output and manifest
- Migration idempotence: two consecutive runs produced byte-identical TH/EN/v12/v21/v19 output
- Local HTTP: TH, EN, v12 and preview-v3 returned 200 with expected HTML/JavaScript/WebP MIME types
- Rendered interaction smoke: TH/EN × 1440/390 passed with 38 source reviews, 11 GD marks, zero app-origin console warnings/errors, zero horizontal overflow and footer gap within subpixel rounding
- Hydration regression: JSON-LD and the four hidden transcript items match static markup in both routes; React #418 is absent
- Direct `#datasets`: hero video remains paused with no autoplay attribute; exactly three first-visible card images are promoted and all resolve at 800×500
- Slow-network byte evidence: source/manifest budget passed; browser waterfall/CWV trace not assessed
- Real iPhone Safari/WKWebView, 1×/2× thumbnail legibility and real-phone QR: manual post-deploy gates remain open

## Production receipt

- Reviewed head SHA: pending
- Merge/deployed SHA: pending
- GitHub Pages run/deployment ID: pending
- Live TH/EN/assets status, MIME and hashes: pending
