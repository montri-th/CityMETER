/** Progressive article controls. Native links, details, body and copyable URL
 * remain usable without script, storage, clipboard or IntersectionObserver. */
(() => {
  const cleanups = [];
  const listen = (target, type, fn, options) => {
    target?.addEventListener?.(type, fn, options);
    cleanups.push(() => target?.removeEventListener?.(type, fn, options));
  };
  const sources = document.querySelector('#sources');
  const openSources = () => { if (sources) sources.open = true; };
  for (const link of document.querySelectorAll('[data-open-sources]')) {
    // Keep the native anchor/default scroll and keyboard activation. A failed
    // enhancement never cancels navigation or creates an extra reading step.
    listen(link, 'click', openSources);
  }
  const openHash = () => { if (location.hash === '#sources') openSources(); };
  openHash();
  listen(window, 'hashchange', openHash);

  const article = document.querySelector('[data-reading-body]');
  const targets = [...document.querySelectorAll('[data-toc]')];
  const links = [...document.querySelectorAll('[data-toc-link]')];
  const progress = document.querySelector('[data-reading-progress]');
  const meter = progress?.querySelector('progress');
  const percent = progress?.querySelector('[data-reading-percent]');
  let frame = 0, observer, disposed = false;
  const select = (id) => {
    for (const link of links) {
      if (link.dataset.tocLink === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const update = () => {
    frame = 0;
    if (!article) return;
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const rect = article.getBoundingClientRect();
    const denominator = rect.height - viewport * .5;
    const amount = Math.round(Math.max(0, Math.min(100,
      denominator > 0 ? (viewport * .5 - rect.top) / denominator * 100 : rect.top < viewport * .5 ? 100 : 0)));
    if (meter) { meter.value = amount; progress.hidden = false; }
    if (percent) percent.textContent = `${amount}%`;
    // Scroll calculation also works when observer construction/observe fails,
    // and updates the highlighted section when the user jumps a long distance.
    let current = targets[0]?.dataset.toc;
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= viewport * .35) current = target.dataset.toc;
    }
    if (current) select(current);
  };
  const schedule = () => {
    if (!disposed && !frame) frame = window.requestAnimationFrame(update);
  };
  if (article) {
    listen(window, 'scroll', schedule, { passive: true });
    listen(window, 'resize', schedule, { passive: true });
    listen(sources, 'toggle', schedule);
    // Image/font layout changes do not require the reader to scroll first.
    listen(window, 'load', schedule);
    document.fonts?.ready?.then(schedule).catch(() => {});
    try {
      if (typeof IntersectionObserver === 'function') {
        observer = new IntersectionObserver(schedule, { rootMargin: '-30% 0px -60% 0px' });
        for (const target of targets) observer.observe(target);
      }
    } catch (_) { observer?.disconnect(); observer = null; }
    update();
  }

  const panel = document.querySelector('[data-summary-share]');
  let toastTimer;
  if (panel) {
    const status = panel.querySelector('[data-share-status]');
    const toast = panel.querySelector('[data-share-toast]');
    const urlField = panel.querySelector('input');
    const copy = panel.querySelector('[data-share-copy]');
    const native = panel.querySelector('[data-share-native]');
    const message = (text) => {
      if (status) status.textContent = text;
      if (toast) {
        window.clearTimeout(toastTimer);
        toast.textContent = text;
        toast.hidden = false;
        toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
      }
    };
    const fallback = (text) => {
      message(`${text} — ${panel.dataset.shareUrl}`);
      urlField?.focus();
      urlField?.select();
    };
    if (copy) {
      copy.hidden = false;
      listen(copy, 'click', async () => {
        try {
          if (!navigator.clipboard?.writeText) throw new Error('Unavailable');
          await navigator.clipboard.writeText(panel.dataset.shareUrl);
          message(panel.dataset.copySuccess);
        } catch (_) { fallback(panel.dataset.copyFallback); }
      });
    }
    if (native && typeof navigator.share === 'function') {
      native.hidden = false;
      listen(native, 'click', async () => {
        try {
          await navigator.share({ title: panel.dataset.shareTitle, url: panel.dataset.shareUrl });
          message(panel.dataset.shareSuccess);
        } catch (error) {
          if (error?.name !== 'AbortError') fallback(panel.dataset.shareFallback);
        }
      });
    }
  }
  listen(window, 'pagehide', (event) => {
    if (event.persisted) return; // Back/forward-cache restoration retains live controls.
    disposed = true;
    for (const cleanup of cleanups) cleanup();
    observer?.disconnect();
    if (frame) window.cancelAnimationFrame(frame);
    window.clearTimeout(toastTimer);
  });
})();
