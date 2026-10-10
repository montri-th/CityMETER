/** Optional sharing enhancement. Platform links and a selectable URL work without JS. */
(() => {
  const panel = document.querySelector("[data-summary-share]");
  if (!panel) return;
  const status = panel.querySelector("[data-share-status]");
  const urlField = panel.querySelector("input");
  const copy = panel.querySelector("[data-share-copy]");
  const native = panel.querySelector("[data-share-native]");
  const fallback = (message) => {
    status.textContent = message;
    urlField.focus();
    urlField.select();
  };
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Unavailable");
      await navigator.clipboard.writeText(panel.dataset.shareUrl);
      status.textContent = panel.dataset.copySuccess;
    } catch (_) {
      fallback(panel.dataset.copyFallback);
    }
  });
  if (typeof navigator.share === "function") {
    native.hidden = false;
    native.addEventListener("click", async () => {
      try {
        await navigator.share({ title: panel.dataset.shareTitle, url: panel.dataset.shareUrl });
        status.textContent = panel.dataset.shareSuccess;
      } catch (error) {
        if (error?.name !== "AbortError") fallback(panel.dataset.shareFallback);
      }
    });
  }
})();
