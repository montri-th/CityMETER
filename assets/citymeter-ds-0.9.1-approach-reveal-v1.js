/* CityMETER slow reveal — DS 0.9.1 motion-riddim-approach-02.
   The source document remains the complete visible state. This adapter enhances only
   explicit supporting groups, lands them once, and fails open for every interruption. */
(function () {
  "use strict";

  var ROOT_ATTRIBUTE = "data-lm-approach";
  var ROOT_ARMED = "armed";
  var ROLE_ATTRIBUTE = "data-lm-reveal-role";
  var GROUP_ATTRIBUTE = "data-lm-reveal-group";
  var KEY_ATTRIBUTE = "data-lm-reveal-key";
  var PENDING_ATTRIBUTE = "data-lm-reveal-pending";
  var LANDED_ATTRIBUTE = "data-lm-reveal-landed";
  var DELAY_PROPERTY = "--lm-approach-delay";
  var STAGGER_STEP_MS = 150;
  var STAGGER_CAP_INDEX = 3;
  var INITIALIZATION_WATCHDOG_MS = 2400;
  var EFFECTIVE_VIEWPORT_RATIO = 0.88;
  var OBSERVER_OPTIONS = {
    threshold: 0.14,
    rootMargin: "0px 0px -12% 0px"
  };
  var TARGET_GROUPS = [
    {
      selector: "#decisions > .wide-container > .section-heading",
      role: "approach.soft",
      group: "decisions-heading",
      stagger: false
    },
    {
      selector: "#examples > .showcase-atmosphere > .wide-container > .section-heading",
      role: "approach.soft",
      group: "examples-heading",
      stagger: false
    },
    {
      selector: "#examples .showcase-grid > .showcase-card > .showcase-image",
      role: "media.arrival",
      group: "showcase-media",
      stagger: true
    },
    {
      selector: "#datasets > .wide-container > .section-heading",
      role: "approach.soft",
      group: "datasets-heading",
      stagger: false
    },
    {
      selector: "#datasets .catalog-structure > :is(.catalog-structure-caption, .catalog-structure-citymeter, .catalog-structure-outcome)",
      role: "approach.soft",
      group: "catalog-panels",
      stagger: true
    },
    {
      selector: "#datasets .catalog-structure-flow > :is(.catalog-structure-step, .catalog-structure-operator)",
      role: "approach.soft",
      group: "catalog-flow",
      stagger: true
    },
    {
      selector: "#datasets .dataset-grid > .dataset-card > .dataset-image",
      role: "media.arrival",
      group: "dataset-previews",
      stagger: false
    },
    {
      selector: ".handoff-grid > .handoff-media",
      role: "media.arrival",
      group: "handoff-pair",
      stagger: false,
      delayIndex: 0
    },
    {
      selector: ".handoff-grid > .qr-card",
      role: "approach.inline-end",
      group: "handoff-pair",
      stagger: false,
      delayIndex: 1
    }
  ];

  var root = document.documentElement;
  var reducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  var observer = null;
  var mutationObserver = null;
  var nodes = [];
  var observedNodes = new Set();
  var landedKeys = new Set();
  var auditPending = false;
  var refreshPending = false;
  var initialized = false;
  var initializationTimedOut = false;
  var motionActive = false;

  function stableKey(definition, index, node) {
    if (definition.group === "dataset-previews") {
      var card = node.closest(".dataset-card");
      var recordId = card && (card.getAttribute("data-citymeter-record-id") || card.id);
      if (recordId) return definition.group + ":" + recordId;
    }
    return definition.group + ":" + definition.role + ":" + index;
  }

  function observeNode(node) {
    if (!observer || observedNodes.has(node)) return;
    observedNodes.add(node);
    observer.observe(node);
  }

  function unobserveNode(node) {
    if (!observer || !observedNodes.has(node)) return;
    observedNodes.delete(node);
    observer.unobserve(node);
  }

  function land(node) {
    if (!node || node.hasAttribute(LANDED_ATTRIBUTE)) return;
    var key = node.getAttribute(KEY_ATTRIBUTE);
    if (key) landedKeys.add(key);
    node.removeAttribute(PENDING_ATTRIBUTE);
    node.setAttribute(LANDED_ATTRIBUTE, "");
    unobserveNode(node);
  }

  function landAll() {
    motionActive = false;
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    nodes.forEach(land);
    root.removeAttribute(ROOT_ATTRIBUTE);
  }

  function landReached() {
    var effectiveBottom = window.innerHeight * EFFECTIVE_VIEWPORT_RATIO;
    nodes.forEach(function (node) {
      if (node.hasAttribute(LANDED_ATTRIBUTE) || !node.getClientRects().length) return;
      var box = node.getBoundingClientRect();
      if (box.top <= effectiveBottom && box.bottom >= 0) land(node);
    });
  }

  function scheduleReachedAudit() {
    if (auditPending) return;
    auditPending = true;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        auditPending = false;
        landReached();
      });
    });
  }

  function decorateTargets() {
    TARGET_GROUPS.forEach(function (definition) {
      var members = Array.prototype.slice.call(document.querySelectorAll(definition.selector));
      members.forEach(function (node, index) {
        if (nodes.indexOf(node) !== -1) return;
        node.setAttribute(ROLE_ATTRIBUTE, definition.role);
        node.setAttribute(GROUP_ATTRIBUTE, definition.group);
        node.setAttribute(KEY_ATTRIBUTE, stableKey(definition, index, node));
        node.style.setProperty(
          DELAY_PROPERTY,
          definition.stagger
            ? Math.min(index, STAGGER_CAP_INDEX) * STAGGER_STEP_MS + "ms"
            : Math.min(definition.delayIndex || 0, STAGGER_CAP_INDEX) * STAGGER_STEP_MS + "ms"
        );
        nodes.push(node);
      });
    });
  }

  function settleNode(node) {
    var key = node.getAttribute(KEY_ATTRIBUTE);
    if (!motionActive || (key && landedKeys.has(key))) {
      land(node);
      return;
    }

    var box = node.getBoundingClientRect();
    var isRendered = node.getClientRects().length > 0;
    var isReached = isRendered && box.top <= window.innerHeight * EFFECTIVE_VIEWPORT_RATIO;
    if (!isRendered || isReached || node.matches(":target") || node.contains(document.activeElement)) {
      land(node);
    } else {
      node.setAttribute(PENDING_ATTRIBUTE, "");
      observeNode(node);
    }
  }

  function refreshTargets() {
    refreshPending = false;
    nodes = nodes.filter(function (node) {
      if (node.isConnected) return true;
      unobserveNode(node);
      return false;
    });
    var previousCount = nodes.length;
    decorateTargets();
    nodes.slice(previousCount).forEach(settleNode);
    if (motionActive && nodes.some(function (node) { return node.hasAttribute(PENDING_ATTRIBUTE); })) {
      root.setAttribute(ROOT_ATTRIBUTE, ROOT_ARMED);
    } else {
      root.removeAttribute(ROOT_ATTRIBUTE);
    }
    scheduleReachedAudit();
  }

  function scheduleTargetRefresh() {
    if (refreshPending) return;
    refreshPending = true;
    window.requestAnimationFrame(refreshTargets);
  }

  function installDynamicTargetRefresh() {
    if (typeof window.MutationObserver !== "function") return;
    var catalogRoot = document.querySelector("#datasets > .wide-container");
    if (!catalogRoot) return;
    mutationObserver = new window.MutationObserver(scheduleTargetRefresh);
    mutationObserver.observe(catalogRoot, { childList: true, subtree: true });
  }

  function settleForFocus(event) {
    var target = event && event.target;
    if (!target || typeof target.closest !== "function") return;
    var revealTarget = target.closest("[" + ROLE_ATTRIBUTE + "]");
    if (revealTarget) land(revealTarget);
  }

  function settleForDeepLink() {
    if (window.location.hash) landAll();
  }

  function installFailOpenLifecycle() {
    window.addEventListener("scroll", scheduleReachedAudit, { passive: true });
    window.addEventListener("resize", scheduleReachedAudit, { passive: true });
    window.addEventListener("hashchange", settleForDeepLink);
    window.addEventListener("popstate", landAll);
    window.addEventListener("beforeprint", landAll);
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) {
        landAll();
      } else {
        scheduleReachedAudit();
      }
    });
    document.addEventListener("focusin", settleForFocus, true);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible") landAll();
    });
    if (reducedMotion && reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", function (event) {
        if (event.matches) landAll();
      });
    }
  }

  function initialize() {
    try {
      decorateTargets();
      window.__lmApproachSettleReached = landReached;
      var navigationEntry = window.performance && typeof window.performance.getEntriesByType === "function"
        ? window.performance.getEntriesByType("navigation")[0]
        : null;
      var historyRestoration = navigationEntry && navigationEntry.type === "back_forward";

      var enhancementAvailable =
        !window.location.hash &&
        !historyRestoration &&
        !initializationTimedOut &&
        document.visibilityState === "visible" &&
        !(reducedMotion && reducedMotion.matches) &&
        typeof window.IntersectionObserver === "function";

      if (!enhancementAvailable || !nodes.length) {
        initialized = true;
        landAll();
        return;
      }

      observer = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) land(entry.target);
        });
      }, OBSERVER_OPTIONS);

      motionActive = true;
      nodes.forEach(settleNode);
      installDynamicTargetRefresh();

      if (!nodes.some(function (node) { return node.hasAttribute(PENDING_ATTRIBUTE); })) {
        initialized = true;
        landAll();
        return;
      }
      root.setAttribute(ROOT_ATTRIBUTE, ROOT_ARMED);
      installFailOpenLifecycle();
      scheduleReachedAudit();
      initialized = true;
    } catch (_error) {
      initialized = true;
      landAll();
    }
  }

  window.setTimeout(function () {
    if (!initialized) {
      initializationTimedOut = true;
      landAll();
      return;
    }
    scheduleReachedAudit();
  }, INITIALIZATION_WATCHDOG_MS);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
