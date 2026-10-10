import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { publicFooter, faviconHead, socialIcon } from "./lib/public-shell.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = JSON.parse(read("data/public-shell-assets.json"));
for (const item of manifest.files) {
  assert(!item.file.includes(".."));
  const bytes = readFileSync(resolve(root, item.file));
  assert.equal(bytes.length, item.bytes);
  assert.equal(hash(bytes), item.sha256, item.file);
}
assert(!/\/Users\/|\/private\/|contacts_internal|@gmail\.com/.test(JSON.stringify(manifest)));
const social = JSON.parse(read("data/public-footer-social.json"));
assert.equal(social.length, 5);
for (const item of social) {
  assert.equal(socialIcon(item.label), item.svg);
  assert(item.svg.startsWith('<svg viewBox="0 0 24 24" aria-hidden="true">'));
  assert.equal(item.style.fill, "none");
  assert.equal(item.style.strokeWidth, 1.65);
}
assert.throws(() => socialIcon("unknown"));
assert.throws(() => publicFooter("en", "../../", { kind: "summary", mapUrl: "javascript:alert(1)" }));
const contexts = [
  { lang: "th", base: "./", directory: "", kind: "catalog" },
  { lang: "en", base: "../", directory: "en/", kind: "catalog" },
  { lang: "th", base: "../../", directory: "datasets/grocery-retail/", kind: "summary" },
  { lang: "en", base: "../../../", directory: "en/datasets/grocery-retail/", kind: "summary" },
];
for (const ctx of contexts) {
  const html = publicFooter(ctx.lang, ctx.base, { kind: ctx.kind, slug: "grocery-retail", mapUrl: "https://landometer.com/v3/map?d=grocery" });
  assert.equal((html.match(/<footer\b/g) || []).length, 1);
  assert.equal((html.match(/Let us cultivate our city with data\./g) || []).length, 1);
  assert(html.includes("hello@landometer.com"));
  assert(html.includes("maps.app.goo.gl/8DQPVMtPdxWMBoZU9"));
  assert(html.includes(ctx.lang === "th" ? "ได้รับการส่งเสริมและสนับสนุนโดย depa" : "Promoted and supported by depa"));
  for (const name of ["depa.png", "dsure-software.png", "digital-service-account.png"]) assert(html.includes(name));
  for (const [, path] of html.matchAll(/src="([^"]+)"/g)) assert(existsSync(resolve(root, ctx.directory, path)), `${ctx.directory}: ${path}`);
  if (ctx.kind === "summary") {
    const back = html.match(/href="([^"]+#dataset-grocery-retail)"/)[1];
    const url = new URL(back, `https://montri-th.github.io/CityMETER/${ctx.directory}`);
    assert.equal(url.pathname, `/CityMETER/${ctx.lang === "en" ? "en/" : ""}`);
  }
  const icons = faviconHead(ctx.base);
  assert.equal((icons.match(/<link /g) || []).length, 4);
  assert(!icons.includes("https://"));
  for (const [, path] of icons.matchAll(/href="([^"]+)"/g)) assert(existsSync(resolve(root, ctx.directory, path)));
}
const css = read("src/styles/public-footer.css");
assert(css.includes("fill: none"));
assert(css.includes("stroke-width: 1.65"));
assert(!css.includes("beige"));
const shell = read("src/styles/shell-current.css");
assert(shell.includes("--pillar-surface-land: var(--ldm-foundation-surface-card-light)"));
assert(shell.includes("--pillar-surface-land: var(--ldm-foundation-surface-card-dark)"));
assert(!shell.includes("--ldm-foundation-surface-beige-tint"));

if (!process.argv.includes("--source-only")) {
  const bundle = read("assets/index-public-catalog-r1.js");
  const start = bundle.indexOf("function K6("), end = bundle.indexOf("function J6(", start);
  assert(start >= 0 && end > start);
  const ctx = { p: { jsx: (type, props) => ({ type, props }) } };
  vm.runInNewContext(bundle.slice(start, end) + ";globalThis.renderFooter=K6", ctx);
  for (const lang of ["th", "en"]) {
    const html = read(lang === "th" ? "index.html" : "en/index.html");
    const footers = html.match(/<footer\b[\s\S]*?<\/footer>/g) || [];
    assert.equal(footers.length, 1);
    const expected = publicFooter(lang, lang === "th" ? "./" : "../", { kind: "catalog" });
    assert.equal(footers[0], expected);
    const hydrated = ctx.renderFooter({ language: lang });
    assert.equal(hydrated.type, "footer");
    assert.equal(hydrated.props.className, "cm-public-footer");
    assert.equal(hydrated.props["aria-labelledby"], "cm-footer-title");
    assert.equal(hydrated.props.dangerouslySetInnerHTML.__html, expected.replace(/^<footer[^>]*>/, "").replace(/<\/footer>$/, ""));
    assert(html.includes(faviconHead(lang === "th" ? "./" : "../")));
    assert(!html.includes("https://landometer.com/static/images/favicon"));
    assert(html.includes("assets/public-footer-r1.css"));
  }
}
console.log(`Public shell: ${manifest.files.length} asset hashes, 4 locale/route contexts, 5 outline icons${process.argv.includes("--source-only") ? "; source-only (build parity pending)" : "; initial/React footer parity PASS"}.`);
