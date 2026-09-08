(function () {
  function currentPage() {
    var file = window.location.pathname.split('/').pop().toLowerCase();
    return file || 'index.html';
  }

  function navMarkup(page) {
    var home = page === 'landingpage.html' || page === 'index.html';
    var browse = page === 'browse.html' || page === 'pet-details.html' || page === 'apply.html';
    var dashboard = page === 'user-dashboard.html';
    return '<header class="shared-nav" data-shared-nav>' +
      '<a class="shared-brand" href="landingpage.html" aria-label="PawBangla home">' +
        '<span class="shared-brand-mark" aria-hidden="true">✦</span><span>Paw<span>Bangla</span></span>' +
      '</a>' +
      '<button class="shared-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>' +
      '<nav class="shared-links" aria-label="Primary navigation">' +
        '<a class="' + (home ? 'active' : '') + '" href="landingpage.html">Home</a>' +
        '<a class="' + (browse ? 'active' : '') + '" href="Browse.html">Find a pet</a>' +
        '<a href="landingpage.html#how-it-works">How it works</a>' +
        '<a href="landingpage.html#stories">Our stories</a>' +
        (dashboard ? '<a class="' + (dashboard ? 'active' : '') + '" href="user-dashboard.html">Dashboard</a>' : '') +
      '</nav>' +
      '<div class="shared-actions">' +
        '<a class="shared-login" href="' + (dashboard ? 'login.html' : 'login.html') + '">Log in</a>' +
        '<a class="shared-cta" href="Browse.html">Start adopting</a>' +
      '</div>' +
    '</header>';
  }

  function setupCollapsibleSidebars() {
    var sidebars = document.querySelectorAll('.sidebar, .admin-sidebar');
    sidebars.forEach(function (sidebar) {
      var admin = sidebar.classList.contains('admin-sidebar');
      var key = admin ? 'paw_admin_sidebar_collapsed' : 'paw_sidebar_collapsed';
      var toggle = document.createElement('button');
      toggle.className = 'sidebar-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Collapse navigation');
      toggle.innerHTML = '<span aria-hidden="true">‹</span>';
      sidebar.insertBefore(toggle, sidebar.firstElementChild);

      var collapsed = false;
      try {
        collapsed = localStorage.getItem(key) === 'true';
      } catch (e) {}
      if (collapsed) sidebar.classList.add('collapsed');

      toggle.addEventListener('click', function () {
        collapsed = sidebar.classList.toggle('collapsed');
        try {
          localStorage.setItem(key, String(collapsed));
        } catch (e) {}
        toggle.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
        toggle.querySelector('span').textContent = collapsed ? '›' : '‹';
      });

      if (collapsed) {
        toggle.setAttribute('aria-label', 'Expand navigation');
        toggle.querySelector('span').textContent = '›';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = currentPage();
    document.body.insertAdjacentHTML('afterbegin', navMarkup(page));

    var nav = document.querySelector('[data-shared-nav]');
    var toggle = nav.querySelector('.shared-menu-toggle');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.shared-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    setupCollapsibleSidebars();
  });
})();