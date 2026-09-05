/* CityMETER DS 0.9.1 motif placement — owner-directed continuous-motion revision, 2026-09-05. */
(function () {
  "use strict";

  var selector = "#datasets .catalog-structure";
  var marker = "catalog-orientation";
  var stageMarker = "catalog-orientation-stage";

  function motionLabels() {
    var thai = document.documentElement.lang === "th";
    return thai
      ? { pause: "หยุดการเคลื่อนไหว", resume: "เล่นการเคลื่อนไหวต่อ" }
      : { pause: "Pause motion", resume: "Resume motion" };
  }

  function createPlacement() {
    var target = document.querySelector(selector);
    if (!target || target.querySelector('[data-lm-motif-stage="' + stageMarker + '"]')) return;

    var labels = motionLabels();
    var reducedMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    var userPaused = false;

    var stage = document.createElement("div");
    stage.className = "catalog-motif-stage";
    stage.setAttribute("data-lm-motif-stage", stageMarker);

    var placement = document.createElement("span");
    placement.setAttribute("data-lm-placement", marker);
    placement.setAttribute("aria-hidden", "true");

    var motif = document.createElement("lm-motif");
    motif.setAttribute("kind", "rings");
    motif.setAttribute("aria-hidden", "true");
    placement.appendChild(motif);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-motif-motion-toggle";

    function syncMotionState() {
      var reduced = Boolean(reducedMotion && reducedMotion.matches);
      var systemPaused = reduced || document.hidden;
      var paused = userPaused || systemPaused;
      stage.toggleAttribute("data-lm-paused", paused);
      stage.setAttribute("data-lm-motion-state", reduced
        ? "reduced"
        : userPaused
          ? "paused"
          : document.hidden
            ? "background-paused"
            : "running");
      button.hidden = reduced;
      var action = userPaused ? labels.resume : labels.pause;
      button.textContent = action;
      button.setAttribute("aria-label", action);
    }

    button.addEventListener("click", function () {
      userPaused = !userPaused;
      syncMotionState();
    });

    document.addEventListener("visibilitychange", syncMotionState);
    if (reducedMotion) {
      if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener("change", syncMotionState);
      } else if (typeof reducedMotion.addListener === "function") {
        reducedMotion.addListener(syncMotionState);
      }
    }

    stage.appendChild(placement);
    stage.appendChild(button);
    syncMotionState();

    var caption = target.querySelector(":scope > .catalog-structure-caption");
    target.setAttribute("data-lm-motif-ready", "");
    if (caption) caption.insertAdjacentElement("afterend", stage);
    else target.appendChild(stage);

    window.setTimeout(function () {
      if (!motif.querySelector("svg")) {
        stage.remove();
        target.removeAttribute("data-lm-motif-ready");
      }
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
