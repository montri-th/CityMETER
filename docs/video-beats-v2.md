# CityMETER proof reel v2 — beat and caption-intent sheet

**Output:** `public/media/reel/citymeter-proof-v2.mp4`

**Poster:** `public/media/reel/citymeter-proof-v2-poster.webp`

**Build date:** 13 August 2026 (Asia/Bangkok)

**Format:** 1280 × 720, 16:9, H.264 High Profile, yuv420p, 30 fps, progressive, video only

**Duration target / actual:** 15–18 s / 17.2 s

The reel contains no baked language caption. The landing page owns the Thai/English overlay, CTA, accessible transcript, and pause/reduced-motion behavior.

## Beat sheet

| Time | Visual source and motion | Story job | Bilingual caption intent for the app | Truth boundary |
|---:|---|---|---|---|
| 0.00–1.70 | `business-dynamics.jpg`; national view, slow push-in toward the map/evidence split | Problem awareness: decisions start with a spatial pattern, not a generic dashboard card | Ask which areas deserve attention first; do not state a finding | Registered branch distribution is not all operating businesses and not business performance. |
| 1.70–3.40 | `shopping-centers.jpg`; quick cut, slow push toward GLA/map evidence | Introduce a second market lens at the same national/province-comparison scale | “Compare supply and market structure” / equivalent native Thai | Samples for GFA, GLA, and tenant counts differ. Do not imply sales, footfall, vacancy, or complete coverage. |
| 3.40–5.10 | `tourism-demand-spending.jpg`; smooth lateral cut, push toward metric controls and province map | Country-to-province comparison context with a clear demand layer | “Read demand across provinces” / equivalent native Thai | This is a province comparison, not a selected-province drilldown; not forecast demand, occupancy, or revenue potential. |
| 5.10–6.80 | `population-age-sex.jpg`; quick cut, push toward period/source and age/sex evidence | Add people and time as planning context | “Add population and demographic context” / equivalent native Thai | Registered population is not live/daytime population, income, migration, or a census claim. |
| 6.80–8.50 | `locale-insights.jpg`; fast zoom transition from national scale to Bangkok local map | Geographic scale change: country/province comparison to a local spatial view | “Move from overview to a local view” / equivalent native Thai | This is an editorial sequence across different modules, not one continuous drilldown. The visible state says “Select a locale to see more insights”; do not claim a completed locale insight. |
| 8.50–10.20 | `road-network-archetypes.jpg`; dissolve, stronger local push toward coloured archetype areas | Differentiated local proof: derived street-network signals | “See how street networks differ by area” / equivalent native Thai | Road archetypes are diagnostic signals, not objective good/bad location, traffic flow, accessibility, or parcel truth. Keep satellite/provider attribution visible. |
| 10.20–11.90 | `flood-recurrent.jpg`; short fade through dark, national recurrent-history view | Begin risk lifecycle: historical recurrence | “Review recurrent flood history” / equivalent native Thai | Historical recurrence does not predict a specific future event or property safety. |
| 11.90–13.60 | `flood-latest-observed.jpg`; directional cut, recent-observed state and time series | Risk lifecycle: latest observed/recorded state | “Check the latest observed layer” / equivalent native Thai | Do not call it real-time without a current timestamp/source contract. Uncoloured areas are not automatically safe. |
| 13.60–15.30 | `flood-forecast-depth.jpg`; directional cut, forecast controls and ranking | Risk lifecycle: forecast/planning horizon | “Look ahead with a forecast layer” / equivalent native Thai | Forecast is not an observation, guarantee, emergency instruction, navigation advice, or property-specific assurance. Model/uncertainty/source must accompany any stronger claim. |
| 15.30–17.20 | `road-network-archetypes.jpg`; quick return and gentle pull-back to a stable local proof frame | Resolution and CTA runway: one evidence-rich frame remains while the app invites the next action | Invite the user to choose the dataset or decision path that answers their question | App overlay supplies the CTA; the footage itself must not imply an export, recommendation, or decision outcome. |

## Editorial and capture logic

- The sequence is **problem awareness → national/province comparisons → local view → multiple evidence layers → CTA runway**.
- It does **not** document one continuous country → province → local interaction. Caption it as movement between evidence scales/views, not as a literal drill-down, unless a same-dataset live drill-down is captured later.
- Every scene is derived from a real public CityMETER screenshot; no generative, stock, or simulated map image is used. The release keeps only the governed v2 reel/poster and card-preview derivatives.
- Source screenshots are 1363 × 936. Each is fitted intact to a 1280 × 720 foreground, with a subdued blurred duplicate behind it to fill the 16:9 canvas. This preserves the header, map, right evidence pane, bottom legend/chart, and satellite attribution rather than cover-cropping them away.
- Motion is editorial Ken Burns movement over still evidence. It must not be described as a recorded live interaction. Transitions are 0.20 s and total runtime is 17.2 s.
- App overlay copy should remain short, occupy a governed safe area, and never cover the dataset heading, selected controls, map legend, source/attribution, date, limitation, or material KPI context.

## Playback contract for the app

- Web: `muted`, `playsinline`, pause control available, no information dependent on sound.
- Reduced motion: do not autoplay; show `citymeter-proof-v2-poster.webp`.
- Do not use `object-fit: cover` on narrow breakpoints because it can remove the evidence pane, legends, or attribution. Prefer `contain` or the poster with an appropriate background surface.
- Keep the bilingual caption outside the video element so Thai and English remain sibling drafts from the same beat/evidence record.

## Asset limitations and release blockers

1. The reel is assembled from still captures, so apparent movement is pan/zoom—not a live product gesture, province selection, or dataset query.
2. `locale-insights.jpg` is visually useful for the scale transition but is not a completed locale result; its right pane explicitly asks the user to select a locale.
3. Road DNA and Locale Insights include a satellite basemap. Provider attribution remains visible, but marketing reuse still needs a separate terms/rights check.
4. Flood frames are lifecycle context only. Their source, model, timestamp, uncertainty, validation, and no-data semantics are not fully communicated by the reel; the landing page must not make safety or emergency claims from them.
5. Dynamic figures in screenshots are capture-time observations, not evergreen claims. Re-capture and re-verify before a major campaign or when the live interface changes.
6. The images include the current live Landometer/CityMETER header treatment. Its presence in a screenshot is documentary product evidence, not a replacement for the landing page's separately approved DS 0.8.9 header lockup.
7. The poster is a Road DNA frame because it is the strongest stable local proof, but the surrounding page must preserve the Low Confidence/diagnostic framing and must not turn “Good Location Ratio” into an absolute recommendation.

## Verification record

Run the following against the delivered MP4 before release:

```sh
ffprobe -v error \
  -show_entries format=duration,size,format_name \
  -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,field_order \
  -of json public/media/reel/citymeter-proof-v2.mp4
```

Expected essentials: H.264 High, 1280 × 720, yuv420p, 30/1 fps, progressive, duration about 17.2 s, no audio stream.

**SHA-256 at build time**

- MP4: `a75bc0a97823782222202c2b2e5a52abe943935ff9a9d7f8d8c97d2176431acf`
- Poster: `e1d4b3f47acb94651803f9a46d38c2462895a05e239ba0ae89cf5291fbd10d29`
