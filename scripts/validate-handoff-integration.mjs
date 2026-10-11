import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import { articleNavbar, attachArticleNavbar, navbarArticleRoutes } from "./lib/article-navbar.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const originalNavbar = read("assets/unified-navbar-r7-v32.js");
const adaptedNavbar = navbarArticleRoutes(originalNavbar);

function element(attributes = {}) {
  const values = new Map(Object.entries(attributes));
  const classes = new Set();
  const listeners = new Map();
  return {
    dataset: {}, style: {}, hidden: false,
    classList: { add: (...names) => names.forEach((name) => classes.add(name)), toggle(name, active) { if (active) classes.add(name); else classes.delete(name); } },
    getAttribute: (name) => values.get(name) ?? null,
    setAttribute: (name, value) => values.set(name, String(value)),
    removeAttribute: (name) => values.delete(name),
    hasAttribute: (name) => values.has(name),
    matches: (selector) => selector === "a",
    addEventListener(name, listener) { listeners.set(name, [...(listeners.get(name) || []), listener]); },
    dispatch(name, event = {}) { for (const listener of listeners.get(name) || []) listener(event); },
  };
}

// Execute the real preference installation; no copied locale or theme logic.
// The missing-header branch bounds this fixture to the route adapter's scope.
function navbarFixture(runtime, href, { lang = "th", stored = null, rootPreference, systemDark = false, storageDenied = false } = {}) {
  const documentRoot = element();
  documentRoot.lang = lang;
  if (rootPreference) documentRoot.dataset.themePreference = rootPreference;
  const controls = [element({ "data-lm-locale": "th" }), element({ "data-lm-locale": "en" })];
  const fallback = element();
  fallback.hidden = true;
  const document = {
    documentElement: documentRoot,
    querySelector: (selector) => selector === ".lm-js-fallback-nav" ? fallback : null,
    querySelectorAll: (selector) => selector === "[data-lm-locale]" ? controls : [],
  };
  const window = element();
  window.location = new URL(href);
  let writes = 0;
  window.localStorage = {
    getItem() { if (storageDenied) throw Error("Storage denied"); return stored; },
    setItem() { writes++; if (storageDenied) throw Error("Storage denied"); },
  };
  window.matchMedia = (query) => ({ matches: query === "(prefers-color-scheme: dark)" && systemDark, addEventListener() {} });
  vm.runInNewContext(runtime, { document, window, URL, URLSearchParams });
  return { documentRoot, controls, window, fallback, writes: () => writes };
}

function validateNavbarRoutes(runtime = adaptedNavbar) {
  let cases = 0;
  for (const prefix of ["/CityMETER/", "/", "/preview/CityMETER/"]) {
    for (const language of ["th", "en"]) {
      for (const suffix of ["", "index.html"]) {
        const pathname = `${prefix}${language === "en" ? "en/" : ""}datasets/terrain-elevation/${suffix}`;
        const href = `https://example.test${pathname}?theme=dark&lang=${language}&q=%E0%B8%A0%E0%B8%B9%E0%B9%80%E0%B8%82%E0%B8%B2&tag=a&tag=b#sources`;
        const fixture = navbarFixture(runtime, href, { lang: language });
        for (const control of fixture.controls) {
          const target = control.getAttribute("data-lm-locale");
          const destination = new URL(control.getAttribute("href"));
          assert.equal(destination.pathname, `${prefix}${target === "en" ? "en/" : ""}datasets/terrain-elevation/`, href);
          assert.equal(destination.searchParams.get("lang"), target);
          assert.equal(destination.searchParams.get("theme"), "dark");
          assert.equal(destination.searchParams.get("q"), "ภูเขา");
          assert.deepEqual(destination.searchParams.getAll("tag"), ["a", "b"]);
          assert.equal(destination.hash, "#sources");
          assert.equal(control.getAttribute("hreflang"), target);
          assert.equal(control.getAttribute("aria-current"), target === language ? "true" : null);
        }
        fixture.window.dispatch("pageshow");
        assert.equal(new URL(fixture.controls[1].getAttribute("href")).pathname, `${prefix}en/datasets/terrain-elevation/`);
        cases++;
      }
    }
  }
  for (const pathname of ["/CityMETER/", "/CityMETER/index.html", "/CityMETER/en/", "/CityMETER/en/index.html", "/", "/en/"]) {
    const href = `https://example.test${pathname}?theme=light&lang=en&q=Grocery#datasets`;
    const baseline = navbarFixture(originalNavbar, href);
    const current = navbarFixture(runtime, href);
    assert.deepEqual(current.controls.map((control) => control.getAttribute("href")), baseline.controls.map((control) => control.getAttribute("href")), `Catalog routing changed: ${pathname}`);
    cases++;
  }
  const themes = [
    { query: "dark", stored: "light", rootPreference: "light", expected: "dark", resolved: "dark" },
    { query: "light", stored: "dark", rootPreference: "dark", expected: "light", resolved: "light" },
    { query: "system", stored: "light", systemDark: true, expected: "system", resolved: "dark" },
    { query: "auto", stored: "dark", systemDark: false, expected: "system", resolved: "light" },
    { query: "unexpected", stored: "dark", expected: "dark", resolved: "dark" },
    { query: "", stored: null, systemDark: true, expected: "system", resolved: "dark" },
    { query: "dark", storageDenied: true, expected: "dark", resolved: "dark" },
    { query: "", storageDenied: true, systemDark: true, expected: "system", resolved: "dark" },
  ];
  for (const theme of themes) {
    const fixture = navbarFixture(runtime, `https://example.test/CityMETER/en/datasets/non-bank/?theme=${theme.query}`, { ...theme, lang: "en" });
    assert.equal(fixture.documentRoot.dataset.themePreference, theme.expected);
    assert.equal(fixture.documentRoot.dataset.theme, theme.resolved);
    assert.equal(fixture.documentRoot.style.colorScheme, theme.resolved);
    assert.equal(fixture.writes(), 0, "A query preference must not silently overwrite a stored preference");
    cases++;
  }
  assert.throws(() => navbarArticleRoutes("unrelated source"), /adapter changed/);
  assert.throws(() => navbarArticleRoutes(originalNavbar + originalNavbar), /adapter changed/);
  return cases + 2;
}

function countFixture() {
  const frames = [];
  const pending = [];
  let observer;
  let labels = [];
  let writes = 0;
  const body = {};
  function mutation(record) {
    if (!observer?.target) return;
    const options = observer.options;
    if (record.type === "childList" && options.childList) pending.push(record);
    if (record.type === "attributes" && options.attributes && (!options.attributeFilter || options.attributeFilter.includes(record.attributeName))) pending.push(record);
  }
  function group(size, { total = String(size), initial = String(size) } = {}) {
    const node = {};
    const cards = Array.from({ length: size }, () => {
      let hidden = false;
      return { get hidden() { return hidden; }, set hidden(value) { hidden = Boolean(value); mutation({ type: "attributes", attributeName: "hidden", target: this }); } };
    });
    let text = initial;
    const label = {
      dataset: total === null ? {} : { total },
      closest: (selector) => selector === ".catalog-subgroup" ? node : null,
      get textContent() { return text; },
      set textContent(value) { writes++; text = value; mutation({ type: "childList", target: this }); },
    };
    node.querySelectorAll = (selector) => selector === ".catalog-card[data-record-id]" ? cards : [];
    return { cards, label, node };
  }
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(target, options) { this.target = target; this.options = options; }
  }
  const document = { body, querySelectorAll: (selector) => selector === "[data-catalog-subgroup-count]" ? labels : [] };
  return {
    group, frames, pending, writes: () => writes,
    replace(groups) { labels = groups.map((item) => item.label); mutation({ type: "childList", target: body }); },
    start() { vm.runInNewContext(read("src/runtime/catalog-layout.js"), { document, MutationObserver: Observer, requestAnimationFrame: (fn) => frames.push(fn) }); },
    mutate: mutation,
    observer: () => observer,
    deliver() { if (pending.length) observer.callback(pending.splice(0)); },
    drain() {
      let turns = 0;
      while (pending.length || frames.length) {
        assert(++turns <= 20, "Subgroup counts never settle: observer/self-mutation loop");
        this.deliver();
        const work = frames.splice(0);
        work.forEach((fn) => fn());
      }
      return turns;
    },
  };
}

function validateSubgroupCounts() {
  const f = countFixture();
  const first = f.group(3), second = f.group(2);
  f.replace([first, second]);
  f.start();
  assert.equal(f.frames.length, 1);
  f.drain();
  assert.equal(first.label.textContent, "3");
  assert.equal(second.label.textContent, "2");
  assert.equal(f.writes(), 0, "Correct initial labels must not be rewritten");
  const options = f.observer().options;
  assert(options.subtree && options.childList && options.attributes);
  assert.deepEqual([...options.attributeFilter], ["hidden"]);

  first.cards[0].hidden = true;
  first.cards[1].hidden = true;
  second.cards[0].hidden = true;
  f.deliver();
  assert.equal(f.frames.length, 1, "Multiple mutation records should coalesce into one frame");
  const settleTurns = f.drain();
  assert(settleTurns <= 3);
  assert.equal(first.label.textContent, "1/3");
  assert.equal(second.label.textContent, "1/2");
  assert.equal(f.writes(), 2, "Only changed visible counts should be written");
  assert.deepEqual(first.cards.map((card) => card.hidden), [true, true, false], "The count enhancer must not change visibility");

  first.cards[2].hidden = true;
  f.drain();
  assert.equal(first.label.textContent, "0/3");
  first.cards.forEach((card) => { card.hidden = false; });
  second.cards.forEach((card) => { card.hidden = false; });
  f.drain();
  assert.equal(first.label.textContent, "3");
  assert.equal(second.label.textContent, "2");
  const beforeIdle = f.writes();
  f.mutate({ type: "childList", target: {} });
  f.drain();
  assert.equal(f.writes(), beforeIdle, "Unrelated DOM changes must settle without writes");
  f.mutate({ type: "attributes", attributeName: "class", target: {} });
  assert.equal(f.pending.length, 0, "Unrelated class mutations should not schedule count work");

  // React can replace the owned catalog subtree. Read the new labels and cards,
  // do not keep stale references or require another script installation.
  const hydrated = f.group(4, { initial: "stale" });
  const fallback = f.group(2, { total: null, initial: "stale" });
  const empty = f.group(0, { initial: "stale" });
  hydrated.cards[1].hidden = true;
  fallback.cards[0].hidden = true;
  f.replace([hydrated, fallback, empty]);
  f.drain();
  assert.equal(hydrated.label.textContent, "3/4");
  assert.equal(fallback.label.textContent, "1/2");
  assert.equal(empty.label.textContent, "0");
  assert.equal(first.label.textContent, "3", "Detached labels should remain untouched");
  hydrated.cards[1].hidden = false;
  f.drain();
  assert.equal(hydrated.label.textContent, "4");
  assert.equal(f.frames.length + f.pending.length, 0);
  return 9;
}

function validateCompiledThemeInitializer() {
  const bundle = read("assets/index-public-catalog-r1.js");
  const start = bundle.indexOf("function _6(){");
  const end = bundle.indexOf("function sc(", start);
  const themeValues = /\bwf=new Set\((\[[^\]]+\])\)/.exec(bundle);
  assert(start >= 0 && end > start && themeValues, "Compiled theme initialization span changed");
  const source = `const wf=new Set(${themeValues[1]});${bundle.slice(start, end)};globalThis.preference=_6();globalThis.resolved=D6(preference);`;
  const cases = [
    { query: "dark", stored: "light", expected: "dark", resolved: "dark", reads: 0 },
    { query: "light", stored: "dark", expected: "light", resolved: "light", reads: 0 },
    { query: "system", stored: "light", systemDark: true, expected: "system", resolved: "dark", reads: 0 },
    { query: "auto", stored: "dark", expected: "system", resolved: "light", reads: 0 },
    { query: "invalid", stored: "dark", expected: "dark", resolved: "dark" },
    { query: "", stored: "light", expected: "light", resolved: "light" },
    { query: "", stored: "auto", systemDark: true, expected: "system", resolved: "dark" },
    { query: "", legacyStored: "dark", expected: "dark", resolved: "dark" },
    { query: "", stored: "invalid", systemDark: true, expected: "system", resolved: "dark" },
    { query: "dark", storageDenied: true, expected: "dark", resolved: "dark", reads: 0 },
    { query: "", storageDenied: true, systemDark: true, expected: "system", resolved: "dark" },
  ];
  for (const item of cases) {
    let reads = 0, writes = 0;
    const context = {
      URLSearchParams,
      window: {
        location: { search: `?theme=${item.query}&q=Grocery` },
        localStorage: {
          getItem(key) { reads++; if (item.storageDenied) throw Error("Storage denied"); return (key === "lds-theme" ? item.stored : item.legacyStored) ?? null; },
          setItem() { writes++; },
        },
        matchMedia: () => ({ matches: Boolean(item.systemDark) }),
      },
    };
    vm.runInNewContext(source, context);
    assert.equal(context.preference, item.expected, `Compiled initial preference: ${JSON.stringify(item)}`);
    assert.equal(context.resolved, item.resolved, `Compiled resolved theme: ${JSON.stringify(item)}`);
    if (item.reads !== undefined) assert.equal(reads, item.reads, "An explicit valid query must win before storage access");
    assert.equal(writes, 0, "The React initializer must not persist URL preferences");
  }
  const server = { URLSearchParams };
  vm.runInNewContext(source, server);
  assert.equal(server.preference, "system");
  assert.equal(server.resolved, "system", "No browser media state should be invented during server initialization");
  return cases.length + 1;
}

const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, decode(value)]));
}
function validateLocalUrl(raw, pageUrl) {
  const url = new URL(decode(raw), pageUrl);
  assert(["https:", "http:", "mailto:"].includes(url.protocol), `Unsafe navigation URL: ${raw}`);
  if (url.origin !== pageUrl.origin) return;
  if (!url.pathname.startsWith("/CityMETER/")) {
    assert(/^https?:\/\//.test(raw), `Relative navigation escaped public project base: ${url.href}`);
    return; // An explicit absolute sibling-property URL is not a local asset.
  }
  const relative = decodeURIComponent(url.pathname.slice("/CityMETER/".length));
  const path = relative.endsWith("/") ? `${relative}index.html` : relative;
  assert(existsSync(resolve(root, path)), `Missing local URL target: ${url.href}`);
  if (url.hash && path.endsWith(".html")) {
    const id = decodeURIComponent(url.hash.slice(1));
    assert(read(path).includes(`id="${id}"`), `Missing navigation fragment: ${url.href}`);
  }
}

function validateGeneratedNavbars() {
  const catalog = JSON.parse(read("src/catalog.json"));
  assert.equal(catalog.records.length, 43);
  if (!existsSync(resolve(root, "data/catalog-build.json"))) return { pages: 0, skipped: "No current build exists" };
  let pages = 0;
  for (const record of catalog.records) {
    for (const lang of ["th", "en"]) {
      const route = `${lang === "en" ? "en/" : ""}datasets/${record.slug}/`;
      const html = read(`${route}index.html`);
      const url = new URL(route, catalog.canonicalBase);
      const navbar = articleNavbar(lang, record.slug);
      assert(html.includes(navbar), `${route}: initial navbar differs from shared renderer`);
      assert.equal((html.match(/<header\b[^>]*\bdata-lm-nav\b/g) || []).length, 1, `${route}: duplicate/missing site header`);
      const menuToggle = attributes(navbar.match(/<button\b[^>]*data-lm-menu-open[^>]*>/)?.[0] || "");
      assert(menuToggle["aria-controls"], `${route}: menu control must name its target`);
      assert.equal((html.match(new RegExp(`\\bid="${menuToggle["aria-controls"]}"`, "g")) || []).length, 1, `${route}: duplicate/missing menu target ID`);
      assert(!html.includes('class="catalog-detail-header"'));
      assert(!navbar.includes("lm-bookmark-rail"));
      assert(!navbar.includes('data-lm-copy="localLabel"'), "Article navigation label must not be reset to 'On this page'");
      assert(html.includes(`<html lang="${lang}"`));
      const localeControls = [...navbar.matchAll(/<a\b[^>]*data-lm-locale="[^"]+"[^>]*>/g)].map(([tag]) => attributes(tag));
      assert.equal(localeControls.length, 4, `${route}: desktop and menu language controls`);
      for (const control of localeControls) {
        const target = control["data-lm-locale"];
        const destination = new URL(control.href, url);
        assert.equal(destination.pathname, `/CityMETER/${target === "en" ? "en/" : ""}datasets/${record.slug}/`);
        assert.equal(destination.searchParams.get("lang"), target);
        assert.equal(control.hreflang, target);
      }
      for (const [, raw] of navbar.matchAll(/(?:src|href)="([^"]+)"/g)) validateLocalUrl(raw, url);
      const navScripts = [...html.matchAll(/<script\b[^>]*src="([^"]*unified-navbar-public-r1\.js[^\"]*)"[^>]*>/g)];
      const navStyles = [...html.matchAll(/<link\b[^>]*href="([^"]*navbar-current-r1\.css[^\"]*)"[^>]*>/g)];
      assert.equal(navScripts.length, 1, `${route}: navbar runtime should install exactly once`);
      assert.equal(navStyles.length, 1, `${route}: navbar stylesheet should load exactly once`);
      validateLocalUrl(navScripts[0][1], url);
      validateLocalUrl(navStyles[0][1], url);
      pages++;
    }
  }
  assert.equal(pages, 86);
  assert.throws(() => attachArticleNavbar("<html></html>", "th", "grocery-retail"), /span changed/);
  return { pages };
}

export function validateHandoffIntegration() {
  const generated = validateGeneratedNavbars();
  return {
    navbarRouteAndThemeCases: validateNavbarRoutes(),
    generatedNavbarRuntimeCases: generated.pages ? validateNavbarRoutes(read("assets/unified-navbar-public-r1.js")) : 0,
    compiledThemeInitializerCases: generated.pages ? validateCompiledThemeInitializer() : 0,
    subgroupMutationCases: validateSubgroupCounts(),
    generated,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = validateHandoffIntegration();
  console.log(`PASS handoff integration: ${result.navbarRouteAndThemeCases} authored + ${result.generatedNavbarRuntimeCases} generated navbar route/theme cases, ${result.compiledThemeInitializerCases} compiled theme initializer cases, ${result.subgroupMutationCases} subgroup mutation cases, ${result.generated.pages} generated shared navbars${result.generated.skipped ? ` (${result.generated.skipped})` : ""}.`);
}
