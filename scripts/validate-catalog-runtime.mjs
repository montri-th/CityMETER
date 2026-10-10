/** Behavioral fixtures run the shipped runtime in a small DOM adapter.
 * The adapter supplies browser primitives; it does not implement catalog filters.
 * Browser layout, computed CSS and native disclosure rendering remain separate QA.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const runtime = readFileSync(
  new URL("../src/runtime/catalog.js", import.meta.url),
  "utf8",
);
const dataKey = (name) =>
  name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

function harness({
  observerFailure = null,
  reducedMotion = false,
  hasObserver = true,
  coarsePointer = false,
} = {}) {
  const stats = {
    animations: [],
    cancellations: 0,
    observerConstructs: 0,
    observerDisconnects: 0,
    focus: 0,
    scrolls: 0,
  };
  const listeners = new Map(),
    windowListeners = new Map(),
    frames = [];
  let root;
  class Element {
    constructor(tag, attributes = {}, text = "") {
      this.tagName = tag.toUpperCase();
      this.attributes = new Map();
      this.dataset = {};
      this.children = [];
      this.parentElement = null;
      this.hidden = false;
      this.open = false;
      this.value = "";
      this.textContent = text;
      for (const [key, value] of Object.entries(attributes))
        this.setAttribute(key, value);
    }
    setAttribute(key, value) {
      this.attributes.set(key, String(value));
      if (key.startsWith("data-")) this.dataset[dataKey(key)] = String(value);
    }
    removeAttribute(key) {
      this.attributes.delete(key);
      if (key.startsWith("data-")) delete this.dataset[dataKey(key)];
    }
    getAttribute(key) {
      return this.attributes.get(key) ?? null;
    }
    hasAttribute(key) {
      return this.attributes.has(key);
    }
    append(...nodes) {
      for (const node of nodes) {
        node.parentElement = this;
        this.children.push(node);
      }
      return this;
    }
    get isConnected() {
      return this === root || Boolean(this.parentElement?.isConnected);
    }
    set innerHTML(_value) {
      throw new Error("Runtime must not replace initial HTML");
    }
    matches(selector) {
      return selector.split(",").some((part) => {
        part = part.trim();
        if (part.includes(" > ")) {
          const [parent, child] = part.split(" > ");
          return (
            this.matches(child) && Boolean(this.parentElement?.matches(parent))
          );
        }
        const ancestorSplit = part.lastIndexOf(" ");
        if (ancestorSplit >= 0)
          return (
            this.matches(part.slice(ancestorSplit + 1)) &&
            Boolean(this.parentElement?.closest(part.slice(0, ancestorSplit)))
          );
        const attrs = [...part.matchAll(/\[([^\]=^]+)(?:(\^?=)"([^"]*)")?\]/g)];
        const simple = part.replace(/\[[^\]]+\]/g, "");
        const tag = simple.match(/^[a-z]+/i)?.[0];
        if (tag && this.tagName !== tag.toUpperCase()) return false;
        const id = simple.match(/#([\w-]+)/)?.[1];
        if (id && this.getAttribute("id") !== id) return false;
        for (const [, cls] of simple.matchAll(/\.([\w-]+)/g))
          if (!(this.getAttribute("class") || "").split(/\s+/).includes(cls))
            return false;
        return attrs.every(
          ([, name, operator, expected]) =>
            this.hasAttribute(name) &&
            (!operator ||
              (operator === "="
                ? this.getAttribute(name) === expected
                : this.getAttribute(name).startsWith(expected))),
        );
      });
    }
    closest(selector) {
      for (let node = this; node; node = node.parentElement)
        if (node.matches(selector)) return node;
      return null;
    }
    querySelectorAll(selector) {
      return this.children.flatMap((child) => [
        ...(child.matches(selector) ? [child] : []),
        ...child.querySelectorAll(selector),
      ]);
    }
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
    focus() {
      stats.focus++;
    }
    scrollIntoView() {
      stats.scrolls++;
    }
    getBoundingClientRect() {
      const owner = this.closest("[data-record-id]") || this;
      const peers = root
        .querySelectorAll("[data-record-id]")
        .filter((card) => !card.hidden);
      const top = 40 + Math.max(0, peers.indexOf(owner)) * 130;
      return {
        top,
        bottom: top + 100,
        left: 0,
        right: 300,
        width: this.hidden ? 0 : 300,
        height: this.hidden ? 0 : 100,
      };
    }
    animate(keyframes, options) {
      const animation = {
        node: this,
        keyframes,
        options,
        cancelled: false,
        finished: new Promise(() => {}),
        cancel() {
          if (!this.cancelled) {
            this.cancelled = true;
            stats.cancellations++;
          }
        },
      };
      stats.animations.push(animation);
      return animation;
    }
  }
  const element = (tag, attrs, text) => new Element(tag, attrs, text);
  root = element("main");
  const section = element("section", { id: "datasets" });
  const search = element("input", { "data-catalog-search": "" });
  const controls = ["all", "land", "location", "living"].map((id) =>
    element(
      "button",
      { "data-catalog-group": id, "aria-pressed": String(id === "all") },
      id,
    ),
  );
  const reset = element("button", { "data-catalog-reset": "" }, "Clear");
  const resetLabel = element("span", {}, "Clear");
  reset.append(resetLabel);
  const count = element(
    "p",
    { "data-catalog-count": "", "data-label": "Results" },
    "Results: 4",
  );
  const grid = element("div", { id: "catalog-results" });
  const empty = element("div", { "data-catalog-empty": "" }, "No results");
  empty.hidden = true;
  root.append(section.append(search, ...controls, reset, count, grid, empty));
  const rows = [
    {
      id: "buildings",
      group: "land",
      subgroup: "built-form",
      search: "buildings อาคาร height",
    },
    {
      id: "land-appraisal",
      group: "land",
      subgroup: "land-market",
      search: "land appraisal ราคาประเมิน",
    },
    {
      id: "grocery-retail",
      group: "location",
      subgroup: "retail",
      search: "grocery retail ร้านค้า",
    },
    {
      id: "population",
      group: "living",
      subgroup: "people",
      search: "population people ประชากร",
    },
  ];
  const cards = [],
    images = [],
    disclosures = [];
  for (const group of ["land", "location", "living"]) {
    const members = rows.filter((row) => row.group === group);
    const lane = element("section", { "data-catalog-lane": group });
    lane.append(
      element(
        "span",
        { "data-catalog-lane-count": "", "data-total": members.length },
        String(members.length),
      ),
    );
    grid.append(lane);
    for (const row of members) {
      const subgroup = element("section", {
        "data-catalog-subgroup": row.subgroup,
      });
      const card = element("article", {
        id: "dataset-" + row.id,
        "data-catalog-owner": "public-registry",
        "data-record-id": row.id,
        "data-search": row.search,
        "data-group": row.group,
      });
      const preview = element("figure", { class: "catalog-preview" });
      const image = element("img");
      images.push(image);
      preview.append(image);
      const details = element("details", { class: "catalog-details" });
      const summary = element("summary", {}, "What can I use this data for?");
      details.append(
        summary,
        element(
          "div",
          { class: "catalog-detail-content" },
          "Source, limits and QR stay readable",
        ),
      );
      card.append(
        preview,
        element("h5", {}, row.id),
        element("a", { href: "https://example.invalid/map" }, "Open map"),
        details,
      );
      cards.push(card);
      disclosures.push(details);
      subgroup.append(card);
      lane.append(subgroup);
    }
  }
  const sameHashLink = element("a", { href: "#dataset-buildings" });
  const anchorLabel = element("span", {}, "Buildings");
  sameHashLink.append(anchorLabel);
  root.append(sameHashLink);
  const add = (map, name, fn) => map.set(name, [...(map.get(name) || []), fn]);
  const media = (matches) => ({
    matches,
    listeners: [],
    addEventListener(_name, fn) {
      this.listeners.push(fn);
    },
    change(value) {
      this.matches = value;
      this.listeners.forEach((fn) => fn({ matches: value }));
    },
  });
  const reduced = media(reducedMotion),
    coarse = media(coarsePointer),
    hover = media(!coarsePointer);
  const documentElement = element("html");
  const document = {
    readyState: "complete",
    documentElement,
    visibilityState: "visible",
    querySelector: (selector) => root.querySelector(selector),
    getElementById: (id) => root.querySelector("#" + id),
    addEventListener: (name, fn) => add(listeners, name, fn),
  };
  const window = {
    innerHeight: 900,
    scrollX: 0,
    scrollY: 0,
    location: { hash: "" },
    matchMedia: (query) =>
      query.includes("reduced-motion")
        ? reduced
        : query.includes("hover:")
          ? hover
          : coarse,
    addEventListener: (name, fn) => add(windowListeners, name, fn),
  };
  let observerInstance;
  class Observer {
    constructor(callback) {
      stats.observerConstructs++;
      if (observerFailure === "constructor")
        throw Error("Observer construction failed");
      this.callback = callback;
      this.targets = new Set();
      observerInstance = this;
    }
    observe(node) {
      if (observerFailure === "observe") throw Error("Observer observe failed");
      this.targets.add(node);
    }
    unobserve(node) {
      this.targets.delete(node);
    }
    disconnect() {
      stats.observerDisconnects++;
      this.targets.clear();
    }
    intersect() {
      this.callback(
        [...this.targets].map((target) => ({ target, isIntersecting: true })),
      );
    }
  }
  const context = vm.createContext({
    window,
    document,
    requestAnimationFrame: (fn) => {
      frames.push(fn);
      return frames.length;
    },
    ...(hasObserver ? { IntersectionObserver: Observer } : {}),
  });
  const snapshot = () =>
    JSON.stringify(
      (function walk(node) {
        return {
          tag: node.tagName,
          attrs: [...node.attributes],
          hidden: node.hidden,
          text: node.textContent,
          children: node.children.map(walk),
        };
      })(root),
    );
  const initial = snapshot();
  const boot = () =>
    vm.runInContext(runtime, context, { filename: "src/runtime/catalog.js" });
  const flush = () => {
    let limit = 100;
    while (frames.length) {
      assert.ok(limit-- > 0, "Unbounded frame loop");
      frames.shift()();
    }
  };
  const dispatch = (type, target, extras = {}) => {
    const event = {
      type,
      target,
      button: 0,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...extras,
    };
    for (const listener of listeners.get(type) || []) listener(event);
    flush();
    return event;
  };
  const input = (value) => {
    search.value = value;
    dispatch("input", search);
  };
  const visible = () =>
    cards.filter((card) => !card.hidden).map((card) => card.dataset.recordId);
  return {
    boot,
    initial,
    snapshot,
    stats,
    cards,
    images,
    disclosures,
    root,
    grid,
    count,
    empty,
    search,
    resetLabel,
    controls,
    anchorLabel,
    window,
    documentElement,
    coarse,
    hover,
    reduced,
    listeners,
    dispatch,
    dispatchWindow: (name) => {
      for (const listener of windowListeners.get(name) || []) listener();
      flush();
    },
    input,
    visible,
    intersect: () => observerInstance?.intersect(),
  };
}

let passed = 0;
function test(name, run) {
  run();
  passed++;
  console.log("PASS " + name);
}
function assertAllVisible(h) {
  assert.deepEqual(h.visible(), [
    "buildings",
    "land-appraisal",
    "grocery-retail",
    "population",
  ]);
}
function assertHandlers(h) {
  for (const type of ["input", "click", "pointerdown", "keydown", "toggle"])
    assert.ok(h.listeners.get(type)?.length, type + " handler missing");
}

for (const observerFailure of ["constructor", "observe"])
  test(`${observerFailure} failure preserves initial HTML and delegated filters`, () => {
    const h = harness({ observerFailure });
    h.boot();
    assertHandlers(h);
    assert.equal(h.snapshot(), h.initial);
    assertAllVisible(h);
    h.input("grocery");
    assert.deepEqual(h.visible(), ["grocery-retail"]);
    assert.equal(h.count.textContent, "Results: 1");
    assert.equal(h.grid.dataset.visibleLanes, "1");
    assert.equal(
      h.root.querySelector('[data-catalog-lane="land"]').hidden,
      true,
    );
    assert.equal(
      h.root.querySelector('[data-catalog-subgroup="built-form"]').hidden,
      true,
    );
    h.dispatch("click", h.resetLabel);
    assertAllVisible(h);
    assert.equal(h.search.value, "");
    assert.equal(h.count.textContent, "Results: 4");
    assert.equal(h.stats.focus, 1);
  });

test("missing observer keeps native search and empty-state recovery available", () => {
  const h = harness({ hasObserver: false });
  h.boot();
  assert.equal(h.snapshot(), h.initial);
  h.dispatch("click", h.controls[2]);
  assert.deepEqual(h.visible(), ["grocery-retail"]);
  h.input("no matching fixture");
  assert.deepEqual(h.visible(), []);
  assert.equal(h.empty.hidden, false);
  assert.equal(h.grid.dataset.visibleLanes, "0");
  h.dispatch("click", h.resetLabel);
  assertAllVisible(h);
  assert.equal(h.empty.hidden, true);
});

test("reduced motion leaves all content visible and disables preview, reflow and disclosure animation", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  assert.equal(h.snapshot(), h.initial);
  assertAllVisible(h);
  assert.equal(h.stats.observerConstructs, 0);
  h.input("ราคาประเมิน");
  assert.deepEqual(h.visible(), ["land-appraisal"]);
  h.dispatch("click", h.resetLabel);
  const details = h.disclosures[0],
    summary = details.children[0];
  h.dispatch("keydown", summary, { key: "Enter" });
  details.open = true;
  h.dispatch("toggle", details);
  assert.equal(details.open, true);
  assertAllVisible(h);
  assert.equal(h.stats.animations.length, 0);
  assert.equal(
    details.children[1].textContent,
    "Source, limits and QR stay readable",
  );
});

test("changing reduced-motion preference cancels finite preview animations and keeps later controls usable", () => {
  const h = harness();
  h.boot();
  h.intersect();
  assert.equal(h.stats.animations.length, 4);
  assert.ok(
    h.stats.animations.every((animation) => h.images.includes(animation.node)),
    "Only preview images may arrive",
  );
  h.reduced.change(true);
  assert.equal(h.stats.cancellations, 4);
  assert.ok(h.stats.observerDisconnects > 0);
  h.input("grocery");
  h.dispatch("click", h.resetLabel);
  assertAllVisible(h);
  assert.equal(h.stats.animations.length, 4);
});

test("same-hash native anchor click reveals a filtered target before browser navigation", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  h.window.location.hash = "#dataset-buildings";
  h.dispatch("click", h.controls[2]);
  assert.deepEqual(h.visible(), ["grocery-retail"]);
  h.dispatch("click", h.anchorLabel);
  assertAllVisible(h);
  assert.equal(h.search.value, "");
  assert.equal(h.controls[0].getAttribute("aria-pressed"), "true");
  assert.equal(h.window.location.hash, "#dataset-buildings");
  assert.equal(
    h.stats.focus,
    0,
    "Native anchor navigation must not steal search focus",
  );
});

test("modified or prevented anchor clicks do not reset the current filter", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  h.input("grocery");
  for (const extras of [
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
    { shiftKey: true },
    { button: 1 },
    { defaultPrevented: true },
  ]) {
    h.dispatch("click", h.anchorLabel, extras);
    assert.deepEqual(h.visible(), ["grocery-retail"]);
    assert.equal(h.search.value, "grocery");
  }
});

test("loading runtime twice does not duplicate event ownership", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  h.boot();
  assert.equal(h.listeners.get("input").length, 1);
  assert.equal(h.listeners.get("click").length, 1);
  h.input("grocery");
  h.dispatch("click", h.resetLabel);
  assert.equal(h.stats.focus, 1);
  assertAllVisible(h);
});

test("fine-pointer hover quiets the page and does not consume native link clicks", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  const card = h.cards[0],
    link = card.querySelector("a");
  h.dispatch("pointerover", card, { pointerType: "mouse" });
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), "active");
  assert(card.hasAttribute("data-catalog-focused"));
  assertAllVisible(h);
  const event = h.dispatch("click", link);
  assert.equal(event.defaultPrevented, false);
  h.dispatch("pointerout", card, {
    pointerType: "mouse",
    relatedTarget: h.search,
  });
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  assert.equal(card.hasAttribute("data-catalog-focused"), false);
});

test("expanded details resume attention after another card is hovered without closing", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  const details = h.disclosures[0];
  h.dispatch("pointerdown", details.children[0], { pointerType: "mouse" });
  details.open = true;
  h.dispatch("toggle", details);
  h.dispatch("pointerover", h.cards[2], { pointerType: "mouse" });
  assert(h.cards[2].hasAttribute("data-catalog-focused"));
  h.dispatch("pointerout", h.cards[2], {
    pointerType: "mouse",
    relatedTarget: h.search,
  });
  assert(h.cards[0].hasAttribute("data-catalog-focused"));
  assert.equal(details.open, true);
  details.open = false;
  h.dispatch("toggle", details);
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
});

test("keyboard focus stays visible and leaving the card clears the quiet treatment", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  const summary = h.disclosures[0].children[0];
  h.dispatch("focusin", summary);
  assert(h.cards[0].hasAttribute("data-catalog-focused"));
  h.disclosures[0].open = true;
  h.dispatch("toggle", h.disclosures[0]);
  const escape = h.dispatch("keydown", summary, { key: "Escape" });
  assert.equal(escape.defaultPrevented, true);
  assert.equal(h.disclosures[0].open, false);
  assert.equal(h.stats.focus, 1);
  h.dispatch("focusout", summary, { relatedTarget: h.search });
  h.dispatch("focusin", h.search);
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  assert.equal(h.stats.animations.length, 0);
});

test("touch ignores synthetic hover and opens links on the first native tap", () => {
  const h = harness({ reducedMotion: true, coarsePointer: true });
  h.boot();
  const card = h.cards[0],
    link = card.querySelector("a");
  h.dispatch("pointerover", card, { pointerType: "touch" });
  h.dispatch("pointerover", card, { pointerType: "mouse" });
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  h.dispatch("pointerdown", link, { pointerType: "touch" });
  h.dispatch("focusin", link);
  assert.equal(h.dispatch("click", link).defaultPrevented, false);
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  const details = h.disclosures[0];
  details.open = true;
  h.dispatch("toggle", details);
  assert(card.hasAttribute("data-catalog-focused"));
  h.dispatch("pointerdown", h.search, { pointerType: "touch" });
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  assert.equal(details.open, true);
});

test("scrolling away from an open card suspends the veil without closing it", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  const card = h.cards[0],
    details = h.disclosures[0];
  details.open = true;
  h.dispatch("toggle", details);
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), "active");
  const originalRect = card.getBoundingClientRect.bind(card);
  card.getBoundingClientRect = () => ({ top: -200, bottom: -40 });
  h.dispatchWindow("scroll");
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  assert.equal(details.open, true);
  card.getBoundingClientRect = originalRect;
  h.dispatchWindow("scroll");
  assert(card.hasAttribute("data-catalog-focused"));
  h.dispatch("pointerover", card, { pointerType: "mouse" });
  card.getBoundingClientRect = () => ({ top: -200, bottom: -40 });
  h.dispatchWindow("scroll");
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  assert.equal(h.stats.scrolls, 0, "Attention must not move the page");
});

test("filtering an active card removes its quiet state without changing disclosure state", () => {
  const h = harness({ reducedMotion: true });
  h.boot();
  h.dispatch("pointerover", h.cards[0], { pointerType: "mouse" });
  h.input("grocery");
  assert.equal(h.documentElement.getAttribute("data-catalog-focus"), null);
  assert.deepEqual(h.visible(), ["grocery-retail"]);
});

console.log(
  `Validated catalog runtime: ${passed} behavioral fixtures pass; browser rendering remains a separate check.`,
);
