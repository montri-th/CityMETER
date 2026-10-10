import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  catalogInner,
  showcaseInner,
  identityGraph,
  detailUrl,
  matchesQuery,
  sourcePanel,
  esc,
} from "./lib/catalog-render.mjs";
import { replaceOnce } from "./lib/patch-public.mjs";
import { validatePreviewContract } from "./lib/preview-contract.mjs";
import { languageForPath } from "./lib/route-language.mjs";
import { runInNewContext } from "node:vm";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const data = (p) => JSON.parse(read(p));
const catalog = data("src/catalog.json"),
  publicData = data("data/catalog.json"),
  projection = data("data/landom-contributors.json"),
  manifest = data("data/catalog-build.json");
let checks = 0;
function test(name, fn) {
  try {
    fn();
    checks++;
  } catch (error) {
    throw new Error(name + ": " + error.message, { cause: error });
  }
}
const newIds = [
  "grocery-retail",
  "non-bank",
  "places-of-worship",
  "terrain-elevation",
  "events-notices",
  "government-spending",
];
test("43 unique public records and 3 peer groups", () => {
  assert.equal(catalog.records.length, 43);
  assert.equal(new Set(catalog.records.map((r) => r.id)).size, 43);
  assert.deepEqual(
    catalog.groups.map((g) => [g.id, g.count]),
    [
      ["land", 13],
      ["location", 16],
      ["living", 14],
    ],
  );
  for (const g of catalog.groups)
    assert.equal(
      catalog.records.filter((r) => r.group === g.id).length,
      g.count,
    );
});
test("current authority is LDS 0.9.7 with explicit coverage", () => {
  assert.equal(catalog.authority.dsVersion, "0.9.7");
  assert.equal(
    catalog.authority.baseSha256,
    "d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96",
  );
  assert.match(catalog.authority.scope, /no full-site conformance claim/);
});
test("literal replacement keeps author dollar text", () => {
  const copy = "ราคา $& / $` / $' / $$";
  assert.equal(replaceOnce("a{{COPY}}b", "{{COPY}}", copy), "a" + copy + "b");
  assert.throws(() => replaceOnce("absent", "{{COPY}}", "text"));
});
test("public projection has 41 joined credit modules", () => {
  assert.equal(Object.keys(projection.byModuleSlug).length, 41);
  for (const key of Object.keys(projection.byModuleSlug))
    assert(
      catalog.records.some((r) => "dataset-" + r.slug === key),
      key,
    );
  for (const id of [
    "dataset-non-bank",
    "dataset-places-of-worship",
    "dataset-business-dynamics",
  ])
    assert(!projection.byModuleSlug[id]);
});
const expectedCredits = {
  "grocery-retail": ["I0030"],
  "terrain-elevation": ["I0034"],
  "government-spending": ["I0036"],
  "events-notices": ["S0001", "I0034"],
};
for (const [id, expected] of Object.entries(expectedCredits))
  test("approved public credit " + id, () =>
    assert.deepEqual(
      projection.byModuleSlug["dataset-" + id].map((p) => p.personId).sort(),
      expected.sort(),
    ),
  );
for (const r of catalog.records) {
  test("bilingual complete record " + r.id, () => {
    for (const value of [
      r.title,
      r.description,
      r.scope,
      r.granularity,
      r.limitation,
      r.sourceReview.owner,
      r.sourceReview.source,
    ])
      for (const lang of ["th", "en"])
        assert.equal(typeof value[lang], "string");
    assert.equal(r.slug, r.id.replaceAll("/", "-"));
    assert(["Dataset", "CreativeWork"].includes(r.resourceClass));
    assert.equal(new URL(r.mapUrl).hostname, "landometer.com");
    assert(r.mapUrl.startsWith("https://landometer.com/v3/"));
    assert(r.aliases.length >= 2);
  });
  test("real preview or explicit absence " + r.id, () => {
    if (newIds.includes(r.id)) {
      assert.equal(r.preview.available, false);
      assert.equal(r.preview.path, null);
    } else {
      assert.equal(r.preview.available, true);
      assert(existsSync(resolve(root, r.preview.path)));
    }
  });
  test("source references and privacy " + r.id, () => {
    for (const x of [...r.sourceReview.official, ...r.sourceReview.gd])
      assert.equal(new URL(x.url).protocol, "https:");
    assert(
      !/drive\.google\.com|docs\.google\.com|theshifters|\/Users\/|pendingowner|private telemetry/i.test(
        JSON.stringify(r),
      ),
    );
  });
  for (const lang of ["th", "en"])
    test("localized detail and minimal graph " + lang + " " + r.id, () => {
      const page = read(
        `${lang === "en" ? "en/" : ""}datasets/${r.slug}/index.html`,
      );
      assert(page.includes(`lang="${lang}"`));
      assert(
        page.includes(`rel="canonical" href="${detailUrl(catalog, r, lang)}"`),
      );
      assert(page.includes(sourcePanel(r, lang, 3)));
      assert(page.includes(r.mapUrl.replaceAll("&", "&amp;")));
      const graph = identityGraph(catalog, lang, r);
      for (const entity of graph["@graph"])
        assert.deepEqual(Object.keys(entity), ["@id", "@type", "name", "url"]);
      assert.equal(graph["@graph"].at(-1)["@type"], r.resourceClass);
      assert(page.includes(JSON.stringify(graph).replaceAll("<", "\\u003c")));
    });
}
const searchCases = {
  "grocery-retail": ["Grocery", "ร้านค้าปลีก", "grocery"],
  "non-bank": ["Non-bank", "nonBank", "นอนแบงก์"],
  "places-of-worship": ["Places of Worship", "placeOfWorship", "ศาสนสถาน"],
  "terrain-elevation": ["Terrain", "elevation", "ภูมิประเทศ"],
  "events-notices": ["Traffic Incident", "trafficIncident", "เหตุการณ์"],
  "government-spending": ["Government Spending", "govspending", "การใช้จ่าย"],
};
for (const lang of ["th", "en"])
  for (const [id, queries] of Object.entries(searchCases))
    for (const query of queries)
      test("search " + lang + " " + query, () => {
        const results = publicData.records.filter((r) =>
          matchesQuery(r, query),
        );
        assert(results.some((r) => r.id === id));
      });
test("search clears and no-match returns none", () => {
  assert.equal(catalog.records.filter((r) => matchesQuery(r, "")).length, 43);
  assert.equal(
    catalog.records.filter((r) => matchesQuery(r, "xyznomatch987")).length,
    0,
  );
});
const bundle = read("assets/index-public-catalog-r1.js");
test("explicit public route owns locale despite contrary preferences/query", () => {
  for (const [path, expected] of [
    ["/CityMETER/", "th"],
    ["/CityMETER/index.html", "th"],
    ["/CityMETER/en/", "en"],
    ["/CityMETER/en/index.html", "en"],
  ]) {
    assert.equal(languageForPath(path), expected);
    const start = bundle.indexOf("function R6(){");
    const end = bundle.indexOf("function _6(){", start);
    const result = runInNewContext(bundle.slice(start, end) + ";R6()", {
      window: {
        location: {
          pathname: path,
          search: "?lang=" + (expected === "th" ? "en" : "th"),
        },
        localStorage: { getItem: () => (expected === "th" ? "en" : "th") },
        navigator: { language: expected === "th" ? "en-US" : "th-TH" },
      },
    });
    assert.equal(result, expected);
  }
});
for (const lang of ["th", "en"])
  test("initial decision titles use current catalog " + lang, () => {
    const html = read(lang === "th" ? "index.html" : "en/index.html");
    const section = html.match(
      /<div class="related-records"[^>]*>(.*?)<\/div>/s,
    )?.[1];
    assert(section);
    const links = [
      ...section.matchAll(/<a href="#dataset-([^"]+)">([^<]+)<\/a>/g),
    ];
    assert.equal(links.length, 5);
    for (const [, slug, title] of links)
      assert.equal(
        title,
        esc(catalog.records.find((r) => r.slug === slug).title[lang]),
      );
  });

const previewRecords = catalog.records.map((r) => ({
  id: r.id,
  previewAvailable: r.preview.available,
}));
const approvedPreviews = catalog.records
  .filter((r) => r.preview.available)
  .map((r) => ({ id: r.id }));
test("preview guard accepts 37 real previews and six explicit absences", () => {
  assert.equal(approvedPreviews.length, 37);
  validatePreviewContract(previewRecords, approvedPreviews);
  const start = bundle.indexOf("const CitymeterValidatePreviewContract=");
  const end = bundle.indexOf("const rc=Object.freeze", start);
  assert(start >= 0 && end > start);
  runInNewContext(bundle.slice(start, end), {
    Rt: previewRecords,
    qn: approvedPreviews,
  });
});
test("preview guard rejects missing real preview", () =>
  assert.throws(
    () => validatePreviewContract(previewRecords, approvedPreviews.slice(1)),
    /missing=buildings/,
  ));
test("preview guard rejects fake preview for a no-preview record", () =>
  assert.throws(
    () =>
      validatePreviewContract(previewRecords, [
        ...approvedPreviews,
        { id: "grocery-retail" },
      ]),
    /extra=grocery-retail/,
  ));
test("preview guard rejects duplicate preview", () =>
  assert.throws(
    () =>
      validatePreviewContract(previewRecords, [
        ...approvedPreviews,
        approvedPreviews[0],
      ]),
    /preview config mismatch/,
  ));

for (const lang of ["th", "en"])
  test("initial and hydrated sections identical " + lang, () => {
    const html = read(lang === "th" ? "index.html" : "en/index.html"),
      base = lang === "th" ? "./" : "../";
    const section = catalogInner(catalog, lang, projection, base),
      showcase = showcaseInner(catalog, lang, base);
    assert(html.includes(section));
    assert(html.includes(showcase));
    assert(bundle.includes(JSON.stringify(section).replaceAll("<", "\\u003c")));
    assert(
      bundle.includes(JSON.stringify(showcase).replaceAll("<", "\\u003c")),
    );
    assert.equal(
      (html.match(/data-catalog-owner="public-registry"/g) || []).length,
      43,
    );
    assert.equal((html.match(/id="datasets"/g) || []).length, 1);
    assert.equal((html.match(/id="examples"/g) || []).length, 1);
    assert.equal((html.match(/type="application\/ld\+json"/g) || []).length, 1);
    assert(!html.includes("business-dynamics"));
    assert(!html.includes("implementation จริง"));
    assert(!html.includes("ไม่ใช้ภาพรายการยาวทั้งหน้า"));
    assert(!html.includes("38 city data views"));
    assert(!html.includes("เชื่อม 38 มุมมอง"));
    assert(!html.includes("Connects 38 views"));
    assert(!html.includes("มุมมองข้อมูลเมือง 38 รายการ"));
    assert(html.includes("assets/unified-navbar-public-r1.js"));
    assert(html.includes("assets/unified-navbar-r7-ds-0.9.1-v34.css"));
    assert(html.includes("assets/citymeter-ds-0.9.1-approach-reveal-v1.js"));
    assert(html.includes("media/reel/citymeter-proof-v3-poster.webp"));
    assert(html.includes('data-ds-version="0.9.7"'));
    assert(!html.includes("assets/landometer-ds/v0.9.1/"));
  });
test("hidden resource absent from all active catalog surfaces", () => {
  for (const file of [
    "data/catalog.json",
    "assets/index-public-catalog-r1.js",
    "sitemap.xml",
    "llms.txt",
  ])
    assert(!read(file).includes("business-dynamics"));
});
test("static and runtime owner separation", () => {
  assert(bundle.includes("function q6("));
  assert(bundle.includes("function X6("));
  assert(bundle.includes("hydrateRoot"));
  assert(
    read("assets/catalog-enhancements-public-r1.js").includes(
      'if (card.dataset.catalogOwner === "public-registry") return;',
    ),
  );
  assert(!read("src/runtime/catalog.js").includes("MutationObserver"));
});
test("sitemap contains two homes and 86 details", () =>
  assert.equal((read("sitemap.xml").match(/<loc>/g) || []).length, 88));
test("governed media, shell and baseline bytes preserved", () => {
  for (const [path, expected] of Object.entries(manifest.immutableInputs))
    assert.equal(
      createHash("sha256")
        .update(readFileSync(resolve(root, path)))
        .digest("hex"),
      expected,
      path,
    );
});
test("generated scripts parse", () => {
  for (const path of [
    "assets/index-public-catalog-r1.js",
    "assets/catalog-enhancements-public-r1.js",
    "assets/unified-navbar-public-r1.js",
    "assets/catalog-public-r1.js",
  ])
    execFileSync(process.execPath, ["--check", resolve(root, path)], {
      stdio: "pipe",
    });
});
test("generated output is deterministic", () =>
  execFileSync(
    process.execPath,
    [resolve(root, "scripts/build-catalog.mjs"), "--check"],
    { stdio: "pipe" },
  ));
console.log(
  `PASS ${checks} current public catalog checks (43 records, 86 localized details). Browser QA still required for rendered layout and interactions.`,
);
