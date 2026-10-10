/* One delegated owner for catalog filters and bounded progressive motion.
 * Initial HTML is complete; enhancement never hides essential content. */
(() => {
  if (window.__citymeterPublicCatalog) return;
  window.__citymeterPublicCatalog = true;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia?.("(pointer: coarse)");
  const hover = window.matchMedia?.("(hover: hover) and (pointer: fine)");
  const active = new Set();
  const landed = new Set();
  let observer;
  let observerFailed = false;
  let pendingDetails;
  let sequence = 0;
  let hoveredCard = null;
  let focusedCard = null;
  let quietCard = null;
  let quietSuppressed = false;
  let keyboardMode = true;
  const openedCards = [];
  const normalize = (value) =>
    String(value)
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const cards = (section) => [
    ...section.querySelectorAll('[data-catalog-owner="public-registry"]'),
  ];
  const eligibleCard = (node) => {
    const card = node?.closest?.('[data-catalog-owner="public-registry"]');
    return card?.isConnected && !card.hidden ? card : null;
  };
  const visibleAttentionCard = (node) => {
    const card = eligibleCard(node);
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight ? card : null;
  };
  function setQuietCard(card) {
    if (quietCard === card) return;
    quietCard?.removeAttribute("data-catalog-focused");
    quietCard = card;
    if (card) {
      card.setAttribute("data-catalog-focused", "");
      document.documentElement?.setAttribute("data-catalog-focus", "active");
    } else document.documentElement?.removeAttribute("data-catalog-focus");
  }
  function syncQuiet() {
    // Direct focus/hover temporarily owns attention. An open disclosure resumes
    // when the pointer leaves, and never collapses because of pointer movement.
    const open = [...openedCards]
      .reverse()
      .find(
        (card) =>
          visibleAttentionCard(card)?.querySelector(".catalog-details")?.open,
      );
    setQuietCard(
      quietSuppressed
        ? null
        : visibleAttentionCard(focusedCard) ||
            visibleAttentionCard(hoveredCard) ||
            open ||
            null,
    );
  }
  function clearQuiet() {
    hoveredCard = null;
    focusedCard = null;
    quietSuppressed = true;
    setQuietCard(null);
  }
  const near = (rect) =>
    rect.bottom >= -120 && rect.top <= window.innerHeight + 120;
  function settle() {
    sequence++;
    for (const animation of active) animation.cancel();
    active.clear();
    pendingDetails = null;
  }
  function animate(node, frames, options) {
    if (reduced?.matches || !node?.animate || !node.isConnected) return;
    const animation = node.animate(frames, {
      duration: 180,
      easing: "cubic-bezier(.2,0,0,1)",
      ...options,
    });
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
  }
  function capture(section) {
    settle();
    return {
      sequence,
      y: window.scrollY,
      x: window.scrollX,
      rects: new Map(
        cards(section)
          .filter((card) => !card.hidden && near(card.getBoundingClientRect()))
          .map((card) => [card, card.getBoundingClientRect()]),
      ),
    };
  }
  function moveFrom(snapshot) {
    if (!snapshot || reduced?.matches || coarse?.matches) return;
    requestAnimationFrame(() => {
      if (
        snapshot.sequence !== sequence ||
        Math.abs(snapshot.y - window.scrollY) > 4 ||
        Math.abs(snapshot.x - window.scrollX) > 4
      )
        return;
      for (const [card, before] of snapshot.rects) {
        if (!card.isConnected || card.hidden) continue;
        const after = card.getBoundingClientRect();
        const x = before.left - after.left,
          y = before.top - after.top;
        if (near(after) && (Math.abs(x) > 1 || Math.abs(y) > 1))
          animate(
            card,
            [
              { transform: `translate(${x}px, ${y}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: 220 },
          );
      }
    });
  }
  function enhance(section = document.querySelector("#datasets")) {
    if (
      !section ||
      observerFailed ||
      reduced?.matches ||
      typeof IntersectionObserver !== "function"
    )
      return;
    try {
      if (!observer)
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting && entry.target.isConnected) continue;
              observer.unobserve(entry.target);
              const id =
                entry.target.closest("[data-record-id]")?.dataset.recordId;
              if (!entry.target.isConnected || landed.has(id)) continue;
              landed.add(id);
              // Preview-only arrival: actions, labels, source facts and QR stay visible.
              animate(
                entry.target,
                coarse?.matches
                  ? [{ opacity: 0.8 }, { opacity: 1 }]
                  : [
                      { opacity: 0.8, transform: "translateY(6px)" },
                      { opacity: 1, transform: "translateY(0)" },
                    ],
                { duration: 200 },
              );
            }
          },
          { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
        );
      section.querySelectorAll(".catalog-preview img").forEach((image) => {
        const id = image.closest("[data-record-id]")?.dataset.recordId;
        if (!landed.has(id)) observer.observe(image);
      });
    } catch {
      // Motion is optional; a failed observer must not interrupt filtering.
      observerFailed = true;
      try {
        observer?.disconnect();
      } catch {
        /* Keep the visible document. */
      }
      observer = null;
    }
  }
  function apply(section) {
    if (!section) return;
    const snapshot = capture(section);
    const query = normalize(
      section.querySelector("[data-catalog-search]")?.value || "",
    )
      .split(/\s+/)
      .filter(Boolean);
    const selected =
      section.querySelector('[data-catalog-group][aria-pressed="true"]')
        ?.dataset.catalogGroup || "all";
    let count = 0;
    cards(section).forEach((card) => {
      card.hidden = !(
        (selected === "all" || card.dataset.group === selected) &&
        query.every((term) => card.dataset.search.includes(term))
      );
      if (!card.hidden) count++;
    });
    section.querySelectorAll("[data-catalog-subgroup]").forEach((group) => {
      group.hidden = !cards(group).some((card) => !card.hidden);
    });
    let lanes = 0;
    section.querySelectorAll("[data-catalog-lane]").forEach((lane) => {
      const shown = cards(lane).filter((card) => !card.hidden).length;
      lane.hidden = shown === 0;
      if (shown) lanes++;
      const label = lane.querySelector("[data-catalog-lane-count]");
      if (label)
        label.textContent =
          shown === Number(label.dataset.total)
            ? String(shown)
            : `${shown}/${label.dataset.total}`;
    });
    const grid = section.querySelector("#catalog-results");
    if (grid) grid.dataset.visibleLanes = String(lanes);
    const status = section.querySelector("[data-catalog-count]");
    if (status) status.textContent = `${status.dataset.label}: ${count}`;
    const empty = section.querySelector("[data-catalog-empty]");
    if (empty) empty.hidden = count !== 0;
    moveFrom(snapshot);
    enhance(section);
    syncQuiet();
  }
  function reset(section) {
    const search = section.querySelector("[data-catalog-search]");
    if (search) search.value = "";
    section
      .querySelectorAll("[data-catalog-group]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.catalogGroup === "all"),
        ),
      );
  }
  document.addEventListener("input", (event) => {
    if (event.target.matches?.("[data-catalog-search]"))
      apply(event.target.closest("#datasets"));
  });
  document.addEventListener("click", (event) => {
    // Native anchor activation must also work when its hash is unchanged.
    // Restore a filtered-out target before the browser follows the link.
    const anchor = event.target.closest?.('a[href^="#dataset-"]');
    if (
      anchor &&
      !event.defaultPrevented &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey &&
      event.button === 0
    ) {
      const target = document.getElementById(
        anchor.getAttribute("href").slice(1),
      );
      if (
        target?.matches('[data-catalog-owner="public-registry"]') &&
        target.hidden
      ) {
        const section = target.closest("#datasets");
        reset(section);
        apply(section);
      }
    }
    const button = event.target.closest?.(
      "[data-catalog-group], [data-catalog-reset]",
    );
    if (!button) return;
    const section = button.closest("#datasets");
    if (!section) return;
    if (button.hasAttribute("data-catalog-reset")) {
      reset(section);
      section.querySelector("[data-catalog-search]")?.focus();
    } else
      section
        .querySelectorAll("[data-catalog-group]")
        .forEach((control) =>
          control.setAttribute("aria-pressed", String(control === button)),
        );
    apply(section);
  });
  function captureDetails(event) {
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    const summary = event.target.closest?.(".catalog-details > summary");
    if (!summary) return;
    const section = summary.closest("#datasets");
    if (!section) return;
    pendingDetails = {
      details: summary.parentElement,
      snapshot: capture(section),
    };
  }
  document.addEventListener("pointerdown", captureDetails, true);
  document.addEventListener("keydown", captureDetails, true);
  document.addEventListener(
    "toggle",
    (event) => {
      if (!event.target.matches?.(".catalog-details")) return;
      const card = eligibleCard(event.target);
      if (card) {
        const index = openedCards.indexOf(card);
        if (index >= 0) openedCards.splice(index, 1);
        if (event.target.open) openedCards.push(card);
        quietSuppressed = false;
      }
      syncQuiet();
      const pending = pendingDetails;
      pendingDetails = null;
      if (pending?.details === event.target) moveFrom(pending.snapshot);
      if (event.target.open && !coarse?.matches)
        animate(event.target.querySelector(".catalog-detail-content"), [
          { transform: "translateY(-3px)" },
          { transform: "translateY(0)" },
        ]);
    },
    true,
  );
  function followHash() {
    const section = document.querySelector("#datasets");
    if (!section || !window.location.hash) return;
    let target;
    try {
      target = document.getElementById(
        decodeURIComponent(window.location.hash.slice(1)),
      );
    } catch {
      return;
    }
    if (
      !target?.matches('[data-catalog-owner="public-registry"]') ||
      !target.hidden
    )
      return;
    reset(section);
    apply(section);
    target.scrollIntoView({ block: "start", behavior: "instant" });
  }
  function ready() {
    enhance();
    followHash();
    // Hydration and history restore may replace nodes or restore native open.
    for (const card of cards(document.querySelector("#datasets") || document))
      if (
        card.querySelector(".catalog-details")?.open &&
        !openedCards.includes(card)
      )
        openedCards.push(card);
    syncQuiet();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
  window.addEventListener("load", () => requestAnimationFrame(ready), {
    once: true,
  });
  document.addEventListener("citymeter:catalog-ready", ready);
  let quietFrame = 0;
  const auditAttention = () => {
    if (quietFrame) return;
    quietFrame = requestAnimationFrame(() => {
      quietFrame = 0;
      syncQuiet();
    });
  };
  window.addEventListener("scroll", auditAttention, { passive: true });
  window.addEventListener("resize", auditAttention, { passive: true });
  window.addEventListener("hashchange", followHash);
  window.addEventListener("pageshow", ready);
  window.addEventListener("pagehide", () => {
    settle();
    clearQuiet();
  });
  window.addEventListener("beforeprint", () => {
    settle();
    clearQuiet();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      settle();
      clearQuiet();
    }
  });
  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || !hover?.matches || coarse?.matches)
      return;
    const card = eligibleCard(event.target);
    if (!card) return;
    hoveredCard = card;
    quietSuppressed = false;
    syncQuiet();
  });
  document.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse" || !hover?.matches || coarse?.matches)
      return;
    if (eligibleCard(event.target) === eligibleCard(event.relatedTarget))
      return;
    hoveredCard = eligibleCard(event.relatedTarget);
    syncQuiet();
  });
  document.addEventListener(
    "pointerdown",
    (event) => {
      keyboardMode = false;
      focusedCard = null;
      if (event.pointerType !== "mouse") hoveredCard = null;
      const card = eligibleCard(event.target);
      if (!card) {
        clearQuiet();
        return;
      }
      quietSuppressed = false;
      syncQuiet();
    },
    true,
  );
  document.addEventListener("focusin", (event) => {
    if (event.target.closest?.("#datasets")) settle();
    const card = eligibleCard(event.target);
    focusedCard = keyboardMode ? card : null;
    quietSuppressed = !card;
    syncQuiet();
  });
  document.addEventListener("focusout", (event) => {
    const next = eligibleCard(event.relatedTarget);
    if (next === focusedCard) return;
    focusedCard = keyboardMode ? next : null;
    // Focus moving elsewhere must never leave the next keyboard target dimmed.
    if (event.relatedTarget && !next) quietSuppressed = true;
    syncQuiet();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") keyboardMode = true;
    if (event.key !== "Escape") return;
    const card = eligibleCard(event.target);
    const details = card?.querySelector(".catalog-details");
    if (!details?.open) return;
    details.open = false;
    details.querySelector("summary")?.focus();
    event.preventDefault();
    // toggle settles the open-card list; preserve ordinary focus feedback.
  });
  hover?.addEventListener?.("change", () => {
    hoveredCard = null;
    syncQuiet();
  });
  coarse?.addEventListener?.("change", () => {
    hoveredCard = null;
    syncQuiet();
  });
  reduced?.addEventListener?.("change", () => {
    settle();
    if (reduced.matches) observer?.disconnect();
    else enhance();
  });
})();
