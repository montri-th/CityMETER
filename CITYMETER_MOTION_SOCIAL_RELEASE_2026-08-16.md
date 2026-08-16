# CityMETER Motion and Social Footer Release — 2026-08-16

Release receipt: `2026-08-16-motion-social-v22`

Status: validated local release candidate with open visual and real-device gates. This receipt does not claim commit, pull request, deployment, or production verification.

## Authorized scope

1. Keep the catalog-structure simplification from v21, including removal of the repeated “38 views/modules” caveat from the active Thai and English page.
2. Make dataset disclosure, filtering, search, and intent changes easier to follow with bounded user-triggered motion.
3. Add minimal Facebook, Instagram, LinkedIn, and TikTok links to the footer in both locales.
4. Ship a standalone Land Appraisal SVG QR whose payload is the Chonburi title-deed page, not the social-share JPEG.

## Motion contract

- Dataset-card movement continues to use transform-only FLIP. Height and column layout are never animated frame by frame.
- Fine pointers receive a distance-ordered ripple: disclosure changes use a 28ms stagger capped at 168ms; filter and search changes use an 18ms stagger capped at 108ms. Each moved card retains the governed 280ms state duration.
- Only cards whose previous or next position is close to the viewport are animated. This avoids unnecessary work across all 38 cards.
- A scroll change greater than 4px between capture and render cancels card travel and leaves the correct final layout in place.
- Rapid repeated actions use a monotonically increasing sequence; only the latest interaction may report a settled state.
- Coarse pointers retain the WebKit-safe rule of zero whole-card transforms and receive only a short opacity acknowledgement where relevant.
- Reduced-motion users receive the final state immediately with no CityMETER motion animation.
- No autoplay, scroll hijack, parallax, fixed animation layer, height transition, or continuous timer is introduced.

## Social footer contract

- The footer remains the final root child and is owned by both prerendered HTML and the hydrated bundle.
- A separate localized social navigation contains exactly four links in this order: Facebook, Instagram, LinkedIn, TikTok.
- Every link is a native 44×44px anchor, opens in a new tab with `noopener noreferrer`, and has a localized accessible name that discloses the new tab.
- Icons are self-contained monochrome inline SVGs using `currentColor`. No remote widget, icon font, tracking SDK, image request, or late layout injection is added.
- Hover and keyboard-focus states remain visible in light and dark themes; reduced motion removes the two-pixel hover travel.

## Land Appraisal SVG QR

- Asset: `media/qr/land-appraisal.svg`
- Payload: `https://landometer.com/v3/citymeter-3d/CBI/D/2001?d=deed`
- The SVG is a standalone vector asset and explicitly excludes the GitHub Pages social-share JPEG destination.
- The existing 512px PNG and manifest remain the canonical in-page dataset QR. The SVG is an additional owner-requested delivery format.

## Preserved behavior

- Thai and English catalog explainer, Land/Location/Living counts, search, filters, 38 dataset cards, 38 detail drawers, 38 source-review blocks, 11 GD Catalog lineage marks, direct routes, and catalog QR blocks remain in place.
- Business Dynamics proof, analysis/brief copy and related-record order, hero, showcase, handoff, contact, SEO, social metadata, light/dark themes, and exhibition mode are unchanged.
- The footer supporter marks remain prerendered and hydration-owned; the enhancer does not inject footer layout.
- Locale Insight remains contextual prior only and is not used as official population, eligibility, statutory boundary, risk determination, or observed-behavior evidence.

## Immutable local candidate

| Artifact | SHA-256 |
|---|---|
| `assets/index-qbT50gkr-v11.js` | `09a4e3dcf3048027692a08daae8cd5761fea23f924d7a9ed38a8f624403f9967` |
| `assets/catalog-enhancements-v20.css` | `a8e2af8c2896907e61c4a0c8750efbe630f6f10e334dbcc0cac45899a1203743` |
| `assets/catalog-enhancements-v18.js` | `4ce3e722bf6c6e21e28db8f08a84fc05cbaeabcc0864a345c31987fac9215fb2` |
| `media/qr/land-appraisal.svg` | `9f02e5f265a7b8e58ea0d00a190ae457ca33406c52463413cb6149ed375344ba` |
| `scripts/apply-motion-social-release.mjs` | `e6dc51ff4910916678f88e61b0efabc4994486057bd0d49f8795b19aebf552f2` |
| `index.html` | `0e3a14c365153bd1bfe425a7bc481a1cff6f6fe0d58dd80fc07e6ca966eaef06` |
| `en/index.html` | `d155ec04ee419e92840cac3d478a53ca3a84e2ebe997ba38806825ed6daca1e2` |

## Release gates

- Syntax, deterministic migration idempotence, project validator, and diff hygiene: passed locally. Two consecutive migration runs produced byte-identical v11/v20/v18 and Thai/English HTML outputs.
- Local HTTP delivery: passed. Thai, English, v11 bundle, v20 CSS, v18 enhancer, and the SVG QR returned 200 with the expected MIME types and byte-matched the reviewed files.
- Visual browser QA: not assessed in this session because the available browser rejected localhost reload under its URL policy. Disclosure open/close timing, keyboard ripple, reduced motion, coarse pointer behavior, responsive overflow, and rendered social-icon appearance remain explicit post-deploy/manual gates rather than inferred passes.
- Production status: not published.
- Existing real-phone Land Appraisal QR scan and real iPhone Safari/WKWebView elastic-scroll checks remain open manual production gates.
