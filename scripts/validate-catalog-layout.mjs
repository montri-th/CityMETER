import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import jsQR from "jsqr";
import {
  catalogInner,
  sourcePanel,
  esc,
  card,
  hasVerifiedGdReference,
} from "./lib/catalog-render.mjs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("src/catalog.json"));
const credits = JSON.parse(read("data/landom-contributors.json"));
const qrs = JSON.parse(read("data/catalog-qr.json"));
const floodOrder = [
  "flood-recurrent",
  "flood-latest-observed",
  "flood-forecast-depth",
  "flood-forecast-flash-flood-risk",
];
assert.deepEqual(
  catalog.records.filter((r) => r.subgroup === "flood").map((r) => r.id),
  floodOrder,
);
assert.equal(qrs.records.length, catalog.records.length);
let decoded = 0;
for (const record of catalog.records) {
  const group = catalog.subgroups.find((g) => g.id === record.subgroup);
  assert.equal(group?.group, record.group, `Invalid subgroup for ${record.id}`);
  const qr = qrs.records.find((q) => q.id === record.id);
  assert.equal(qr.url, record.mapUrl);
  const svg = read(qr.file);
  assert.equal(createHash("sha256").update(svg).digest("hex"), qr.sha256);
  const size = Number(svg.match(/viewBox="0 0 (\d+) \d+"/)[1]);
  const scale = 6,
    width = size * scale;
  const pixels = new Uint8ClampedArray(width * width * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels.set([252, 252, 250, 255], i);
  }
  for (const [, x, y] of svg.matchAll(/M(\d+),(\d+)h1v1h-1z/g)) {
    // Rasterize the emitted vector, then decode using an independent library.
    for (let dy = 0; dy < scale; dy++)
      for (let dx = 0; dx < scale; dx++)
        pixels.set(
          [24, 35, 39, 255],
          ((Number(y) * scale + dy) * width + Number(x) * scale + dx) * 4,
        );
  }
  assert.equal(
    jsQR(pixels, width, width)?.data,
    record.mapUrl,
    `Unreadable or incorrect QR: ${record.id}`,
  );
  decoded++;
}
for (const lang of ["th", "en"]) {
  const html = catalogInner(
    catalog,
    lang,
    credits,
    lang === "th" ? "./" : "../",
  );
  assert.equal((html.match(/data-catalog-lane=/g) || []).length, 3);
  assert.equal((html.match(/data-catalog-subgroup=/g) || []).length, 24);
  assert.equal((html.match(/class="catalog-details"/g) || []).length, 43);
  assert.equal((html.match(/class="catalog-qr-handoff"/g) || []).length, 43);
  const lanes = html.split('<section class="catalog-lane"').slice(1);
  for (const lane of lanes) {
    const group = lane.match(/data-catalog-lane="([^"]+)"/)[1];
    for (const record of catalog.records) {
      const appears = lane.includes(`id="dataset-${record.slug}"`);
      assert.equal(
        appears,
        record.group === group,
        `${record.id} mixed into ${group} lane`,
      );
      if (appears) {
        assert(lane.includes(sourcePanel(record, lang, 6)));
        assert(lane.includes(esc(record.limitation[lang])));
      }
    }
  }
}
// Card anatomy must survive without JavaScript and preserve actual source scope.
let checkedCards = 0;
for (const record of catalog.records) {
  for (const lang of ["th", "en"]) {
    const html = card(catalog, record, lang, credits, "./", 5);
    const closed = html.split('<details class="catalog-details">')[0];
    assert(closed.includes('class="catalog-card-pills"'));
    assert(
      closed.includes(
        'class="button catalog-map-link" href="' + esc(record.mapUrl) + '"',
      ),
    );
    assert(
      closed.includes(lang === "th" ? "เปิดใน CityMETER" : "Open in CityMETER"),
    );
    assert(closed.includes('class="catalog-detail-link catalog-summary-link"'));
    assert(
      !closed.includes('class="catalog-contributors"'),
      "Full credits belong in the native disclosure",
    );
    assert.equal(
      html.includes('class="catalog-gd-badge"'),
      hasVerifiedGdReference(record),
    );
    const people = credits.byModuleSlug["dataset-" + record.slug] || [];
    for (const person of people) {
      const name =
        person.nickname[lang] ||
        person.nickname.th ||
        person.nickname.en ||
        person.personId;
      assert(
        closed.includes('title="' + esc(name) + '"'),
        "Compact credit needs its canonical accessible name",
      );
      assert(
        html.includes(
          esc(
            person.profileUrl[lang] ||
              person.profileUrl.th ||
              person.profileUrl.en,
          ),
        ),
      );
    }
    if (record.preview.available && record.preview.focusLabel?.[lang])
      assert(
        closed.includes(
          '<span class="catalog-preview-feature">' +
            esc(record.preview.focusLabel[lang]) +
            "</span>",
        ),
      );
    const period = record.sourceReview.period?.[lang]?.trim();
    assert.equal(
      closed.includes("catalog-pill-period"),
      Boolean(period && [...period].length <= (lang === "th" ? 45 : 70)),
    );
    checkedCards++;
  }
}
const fixture = structuredClone(catalog.records[0]);
fixture.sourceReview.status = "verified-lineage";
fixture.sourceReview.gd = [{ url: "https://gdcatalog.go.th/dataset/fixture" }];
assert(hasVerifiedGdReference(fixture));
for (const badUrl of [
  "https://gdcatalog.go.th.example.invalid/dataset/test",
  "javascript:alert(1)",
  "http://gdcatalog.go.th/dataset/test",
])
  assert(
    !hasVerifiedGdReference({
      ...fixture,
      sourceReview: { ...fixture.sourceReview, gd: [{ url: badUrl }] },
    }),
  );
for (const status of ["candidate", "other-source", "derived", "unproven"])
  assert(
    !hasVerifiedGdReference({
      ...fixture,
      sourceReview: { ...fixture.sourceReview, status },
    }),
  );
fixture.sourceReview.gd = [];
assert(
  !hasVerifiedGdReference(fixture),
  "Verified official source alone does not prove GD Catalog lineage",
);
fixture.sourceReview.period = { th: "", en: "" };
fixture.sourceReview.reviewedAt = "2099-01-01";
assert(
  !card(catalog, fixture, "th", credits, "./").includes("catalog-pill-period"),
  "Editorial review date must not become a data-period pill",
);
const cardCss = read("src/styles/catalog.css");
assert(cardCss.includes('html[data-catalog-focus="active"] body::after'));
assert(
  cardCss.includes("pointer-events: none"),
  "Quiet treatment must not consume native actions",
);
assert(
  cardCss.includes("object-fit: contain"),
  "Documentary previews must preserve their complete geometry",
);
assert(
  !cardCss.includes("transform: scale(1.025)"),
  "Documentary screenshots must not zoom on hover",
);
console.log(
  `PASS ${checkedCards} bilingual card anatomy checks, explicit GD lineage gates, date semantics and compact native contributor links.`,
);
const css = read("src/styles/shell-current.css");
assert(
  !/--ldm-series-\d\d-(?:light|dark)\b/.test(css),
  "Retired ambiguous series aliases are active",
);
const navCss = read("src/styles/navbar-current.css");
assert(!navCss.includes("nav-filled-r1.ttf"));
const navRule = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [
    ...navCss.matchAll(new RegExp(`^${escaped}\\s*\\{([^}]+)\\}`, "gm")),
  ];
  assert.equal(matches.length, 1, `Unique navbar rule: ${selector}`);
  return matches[0][1];
};
for (const selector of [".lm-site-header", ".lm-site-header.is-calm"])
  assert.match(
    navRule(selector),
    /background-color:\s*var\(--lm-surface-canvas\);/,
  );
assert.match(navRule(".lm-site-header"), /backdrop-filter:\s*none;/);
for (const selector of [".lm-nav-row", ".lm-site-header.is-calm .lm-nav-row"])
  assert.match(navRule(selector), /opacity:\s*1;/);
const foundationCss = read(
  "assets/landometer-ds/v0.9.7/color-srgb-10.production.css",
);
assert.match(
  foundationCss,
  /--ldm-foundation-surface-canvas-light:\s*#F6F7F3;/,
);
assert.match(foundationCss, /--ldm-foundation-surface-canvas-dark:\s*#11191D;/);
console.log(
  `PASS grouped lane/source parity in both locales; independently decoded ${decoded} exact dataset QR destinations.`,
);
