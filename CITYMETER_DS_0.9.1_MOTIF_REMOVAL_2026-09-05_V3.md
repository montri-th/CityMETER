# CityMETER DS 0.9.1 motif removal release

Date: 2026-09-05

Release record: `2026-09-05-citymeter-ds091-public-v3`

Artifact build: `ui-20260905-ds091-public-v3`

Publication target: <https://montri-th.github.io/CityMETER/>

## Outcome

This revision removes the motif completely from the active Thai and English pages. The pages no longer reference or load motif CSS, the motif web component, the placement adapter, motif DOM, or a motif motion control. Previously supplied motif files remain unchanged as inactive repository history and are not loaded by the active page.

The snapshot-hover fix remains active: each scaled dataset image is clipped by its immediate media frame with a 15 px inner top radius, preventing square image corners from painting beyond the card's 16 px rounded border.

No catalogue record, factual product claim, card order, snapshot byte, hydrated product bundle, or main catalogue enhancer changed in this revision.

## Authority and Design System binding

The owner directed removal in `owner-message:2026-09-05:remove-motif-from-citymeter`; no additional approval is required. Active visual, interaction, accessibility, colour-projection, and web-format behavior remains bound to DS `0.9.1` / authoring release `0.9.1-r8` / ruleset `lds-rules-0.9.1` / machine package `v0.9.1-mp7`.

## Exact release bytes

| File | SHA-256 | Bytes |
|---|---|---:|
| `assets/catalog-enhancements-ds-0.9.1-v28.css` | `d5ccb8fd86ee5ab5eb1410bbac759775b2fef27d3b05e54cc3a4ee2671fa1fed` | 44,637 |
| `data/citymeter-ds-0.9.1-release-record.json` | `61ffc8d174a86ef6df9c27bfef37ae0a207adec84b08fc11a961a1dc762481be` | 6,223 |
| `scripts/apply-citymeter-ds-0.9.1-motif-release.mjs` | `d4683d0990f3145bc3f459c95584985e5caa66871e7366dbe275e647d8bbd025` | 69,043 |
| `index.html` | `cb325e2e6e17ed502f6b8adf488f8dac679c872f037706f9e95e714f7c3851b3` | 548,502 |
| `en/index.html` | `c7729cca67016364d5c926939e62c4c41976052a546ceb7bdcd600f79d80c415` | 471,607 |

The Thai and English body hashes are unchanged from the approved prior release because this revision only changes active head references and release metadata.

## Verification gates

The release gates require:

- zero active motif HTML, DOM, runtime, stylesheet, placement, or control references
- exact DS 0.9.1 audience CSS and pinned candidate bytes
- direct 15 px media-frame clipping around scaled snapshot images
- preservation of all 38 catalogue records and Thai/English static–hydrated parity
- responsive layouts without a motif gap or horizontal overflow
- no prohibited coloured card edges, left rails, or decorative dividers

GitHub Pages completion, live-byte equality, and rendered browser checks are post-push publication gates.
