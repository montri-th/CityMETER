# CityMETER public data catalog — static preview

หน้า landing page แบบ static สำหรับให้คน, search crawler, LLM และ agent เข้าใจว่า CityMETER มีข้อมูลและโมดูลสาธารณะอะไรบ้าง พร้อมเปิดแต่ละรายการใน CityMETER viewer ได้โดยตรง

## Preview URLs

- Landing page after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/
- Mobile QA after GitHub Pages is enabled: https://montri-th.github.io/CityMETER/mobile-qa.html
- Production target: https://landometer.com/citymeter

## Scope

- Recommended public catalog 38 records/modules: Land 12, Location 13, Living 13
- Decision-first entry routes for business/investment, local government, analysts, and search/LLM/agents
- Human-readable cards and machine-readable JSON-LD generated from the same registry
- Direct links to the current CityMETER viewer, including explicit scope, metadata status, and use limitations

The 38 records include datasets, derived modules, monitoring feeds, and two event archives. The preview therefore does not describe every record as a standalone dataset.

## Files

- `index.html` — GitHub Pages entry point
- `CityMETER_Landing_Page_Prototype_DS_0.8.9.html` — named standalone handoff file
- `mobile-qa.html` — responsive preview harness for common phone viewports

## Status

This is a review preview aligned with Landometer Design System v0.8.9. It intentionally carries `noindex` and points its canonical URL to the production target. Unknown source, time, or definition metadata is shown as pending rather than inferred.

The static files are published on `main`. GitHub Pages still needs to be enabled from `Settings → Pages → Deploy from a branch → main / (root)` before the preview URLs above become live.

Before production release, change the current `/citymeter` redirect, complete record-level metadata, resolve the live SPA identity issue, and replace the generic social image with an approved CityMETER-specific asset.
