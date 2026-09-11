(function () {
  function renderIcons(root) {
    if (typeof lucide === 'undefined' || typeof lucide.createIcons !== 'function') return;
    lucide.createIcons({
      attrs: { 'aria-hidden': 'true' }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { renderIcons(document); });
  } else {
    renderIcons(document);
  }
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type !== 'childList' || !m.addedNodes || !m.addedNodes.length) continue;
      for (var j = 0; j < m.addedNodes.length; j++) {
        var n = m.addedNodes[j];
        if (n.nodeType !== 1) continue;
        if (n.hasAttribute && n.hasAttribute('data-lucide')) { renderIcons(document); return; }
        if (n.querySelector && n.querySelector('[data-lucide]')) { renderIcons(document); return; }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
