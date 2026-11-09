// Demo hub (demos/, en/demos/): noindex, out of the sitemap, every demo linked once to its GitHub Pages start page,
// groups as in src/demo-hub.json, the same list in demos.json and demos/llms.txt, and the catalog links resolve.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const hub = JSON.parse(read("src/demo-hub.json"));
const catalog = JSON.parse(read("src/catalog.json"));
const list = JSON.parse(read("demos/demos.json"));
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

for (const [lang, path] of [["th", "demos/index.html"], ["en", "en/demos/index.html"]]) {
  const html = read(path);
  ok(html.includes('<meta name="robots" content="noindex, nofollow"/>') && !/content="index/.test(html), `${path}: noindex, nofollow`);
  ok((html.match(/<h1\b/g) || []).length === 1, `${path}: one H1`);
  const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] || "";
  ok(title.endsWith(" · CityMETER") && title.length <= 60, `${path}: title ≤ 60 (${title.length})`);
  ok(html.includes(`<html lang="${lang}"`), `${path}: lang`);
  const links = [...html.matchAll(/data-demo="([a-z]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
  ok(links.length === hub.demos.length && new Set(links.map((l) => l[0])).size === hub.demos.length, `${path}: every demo once`);
  for (const [demo, href] of links) {
    const english = lang === "en" && (hub.demos.find((d) => d.path === demo).languages || []).includes("en");
    ok(href === `${hub.origin}/${demo}/${english ? "?lang=en" : ""}`, `${path}: ${demo} start page${english ? " in English" : ""}`);
  }
  for (const d of hub.demos) {
    const card = html.slice(html.indexOf(`data-demo-card="${d.path}"`), html.indexOf("</li>", html.indexOf(`data-demo-card="${d.path}"`)));
    ok(card.includes(d.question.th.replaceAll("&", "&amp;")), `${path}: ${d.path} question quoted`);
    if (d.catalog) {
      const slug = catalog.records.find((r) => r.datasetCode === d.catalog).slug;
      ok(card.includes(`datasets/${slug}/`) && existsSync(resolve(root, `${lang === "en" ? "en/" : ""}datasets/${slug}/index.html`)), `${path}: ${d.path} catalog page exists`);
    } else ok(!card.includes("datasets/"), `${path}: ${d.path} has no catalog page and says so`);
  }
  for (const g of ["Land", "Location", "Living"]) {
    const n = hub.demos.filter((d) => d.group === g).length;
    ok(new RegExp(`id="hub-group-${g.toLowerCase()}">[\\s\\S]*?${g} <span class="hub-count">${n} `).test(html), `${path}: ${g} ${n}`);
  }
  ok(!/border-left|border-inline-start/.test(read("src/styles/demo-hub.css")), "no coloured side rail in the hub styles");
}
ok(!read("sitemap.xml").includes("/demos/"), "the hub stays out of the sitemap");
ok(list.robots === "noindex, nofollow" && list.demos.length === hub.demos.length, "demos.json lists every demo");
for (const d of list.demos) ok(d.url === `${hub.origin}/${d.path}/` && ["Land", "Location", "Living"].includes(d.group) && Array.isArray(d.languages) && d.languages[0] === "th"
  && (d.languages.includes("en") ? d.urlEn === `${d.url}?lang=en` : !("urlEn" in d)), `demos.json: ${d.path}`);
const llms = read("demos/llms.txt");
for (const d of hub.demos) ok(llms.includes(`(${hub.origin}/${d.path}/)`), `demos/llms.txt: ${d.path}`);
ok(read("llms.txt").includes("demos/llms.txt"), "llms.txt points to the demo list");
console.log(`PASS demo hub: ${checks} checks; ${hub.demos.length} demos, TH/EN pages noindex and out of the sitemap.`);
