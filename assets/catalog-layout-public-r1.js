// Count labels enhance the native filtered state. The catalog's existing
// search/quiet/FLIP/motion implementation remains unchanged.
(() => {
  let queued = false;
  function refresh() {
    queued = false;
    document.querySelectorAll('[data-catalog-subgroup-count]').forEach(label => {
      const group = label.closest('.catalog-subgroup');
      if (!group) return;
      const cards = [...group.querySelectorAll('.catalog-card[data-record-id]')];
      const count = cards.filter(card => !card.hidden).length;
      const total = Number(label.dataset.total || cards.length);
      const next = count === total ? String(total) : `${count}/${total}`;
      if (label.textContent !== next) label.textContent = next;
    });
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(refresh); } }
  new MutationObserver(queue).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
  queue();
})();
