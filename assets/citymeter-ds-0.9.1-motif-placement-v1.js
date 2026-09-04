/* CityMETER DS 0.9.1 motif placement — 2026-09-04. */
(function () {
  "use strict";

  var selector = "#datasets .catalog-structure";
  var marker = "catalog-orientation";
  var observer = null;
  var observerReported = false;
  var cleanupAudit = function () {};

  function hasReachedEffectiveRoot(element) {
    var rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.88;
  }

  function stopObserving(element) {
    if (!observer) return;
    try {
      observer.unobserve(element);
    } catch (_error) {
      observer = null;
    }
  }

  function reveal(element) {
    if (!element || element.hasAttribute("data-lm-play")) return;
    element.setAttribute("data-lm-play", "");
    element.removeAttribute("data-lm-armed");
    stopObserving(element);
    cleanupAudit();
  }

  function failOpen(element) {
    if (!element || element.hasAttribute("data-lm-play")) return;
    element.removeAttribute("data-lm-armed");
    stopObserving(element);
    cleanupAudit();
  }

  function installPassiveAudit(element) {
    var frameOne = 0;
    var frameTwo = 0;
    var scheduled = false;
    var passive = { passive: true };

    function auditReached() {
      if (scheduled || !element.hasAttribute("data-lm-armed")) return;
      scheduled = true;
      frameOne = requestAnimationFrame(function () {
        frameTwo = requestAnimationFrame(function () {
          scheduled = false;
          if (hasReachedEffectiveRoot(element)) reveal(element);
        });
      });
    }

    function settleLifecycle() {
      failOpen(element);
    }

    window.addEventListener("scroll", auditReached, passive);
    window.addEventListener("resize", auditReached, passive);
    window.addEventListener("pageshow", settleLifecycle);
    window.addEventListener("hashchange", settleLifecycle);
    window.addEventListener("popstate", settleLifecycle);
    window.addEventListener("focus", settleLifecycle);
    document.addEventListener("visibilitychange", settleLifecycle);

    cleanupAudit = function () {
      window.removeEventListener("scroll", auditReached);
      window.removeEventListener("resize", auditReached);
      window.removeEventListener("pageshow", settleLifecycle);
      window.removeEventListener("hashchange", settleLifecycle);
      window.removeEventListener("popstate", settleLifecycle);
      window.removeEventListener("focus", settleLifecycle);
      document.removeEventListener("visibilitychange", settleLifecycle);
      if (frameOne) cancelAnimationFrame(frameOne);
      if (frameTwo) cancelAnimationFrame(frameTwo);
      cleanupAudit = function () {};
    };

    auditReached();
  }

  function createPlacement() {
    var target = document.querySelector(selector);
    if (!target || target.querySelector('[data-lm-placement="' + marker + '"]')) return;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canObserve = "IntersectionObserver" in window;
    var placement = document.createElement("span");
    placement.setAttribute("data-lm-placement", marker);
    placement.setAttribute("aria-hidden", "true");

    if (!reduced && canObserve) placement.setAttribute("data-lm-armed", "");

    var motif = document.createElement("lm-motif");
    motif.setAttribute("kind", "rings");
    motif.setAttribute("quiet", "");
    motif.setAttribute("ink", "sky");
    motif.setAttribute("autoplay", "false");
    motif.setAttribute("aria-hidden", "true");
    placement.appendChild(motif);

    var caption = target.querySelector(":scope > .catalog-structure-caption");
    if (caption) caption.insertAdjacentElement("afterend", placement);
    else target.appendChild(placement);

    if (reduced || !canObserve) return;

    try {
      observer = new IntersectionObserver(function (entries) {
        observerReported = true;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -12% 0px" });
      observer.observe(placement);
    } catch (_error) {
      observer = null;
      failOpen(placement);
      return;
    }

    installPassiveAudit(placement);

    window.setTimeout(function () {
      if (!observerReported) failOpen(placement);
    }, 2400);
  }

  function start() {
    requestAnimationFrame(function () {
      requestAnimationFrame(createPlacement);
    });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
})();
