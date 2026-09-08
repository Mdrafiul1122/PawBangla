(function (global) {
  var ADMIN_KEY = 'paw_admin';
  var ADMIN_USERS_KEY = 'paw_admin_users';
  var DEFAULT_ADMINS = [{ name: 'Site Admin', email: 'admin@example.com', password: 'admin123' }];

  /* Always open every admin page at the very top, regardless of the previous page's scroll or back/forward history. */
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
  window.scrollTo(0, 0);
  window.addEventListener('load', function () { window.scrollTo(0, 0); });

  /* ---------- Admin session ---------- */
  function getAdmins() {
    try {
      var v = localStorage.getItem(ADMIN_USERS_KEY);
      return v ? JSON.parse(v) : DEFAULT_ADMINS;
    } catch (e) { return DEFAULT_ADMINS; }
  }
  function saveAdmins(list) { localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(list)); }
  function ensureDefaultAdmin() { if (!localStorage.getItem(ADMIN_USERS_KEY)) saveAdmins(DEFAULT_ADMINS); }

  function getAdminSession() {
    try {
      var v = localStorage.getItem(ADMIN_KEY) || sessionStorage.getItem(ADMIN_KEY);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }
  function setAdminSession(admin) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    sessionStorage.removeItem(ADMIN_KEY);
  }
  function clearAdminSession() {
    try { localStorage.removeItem(ADMIN_KEY); } catch (e) {}
    try { sessionStorage.removeItem(ADMIN_KEY); } catch (e) {}
  }
  function logoutAdmin() {
    clearAdminSession();
    window.location.href = 'admin-login.html';
  }
  function requireAdmin() {
    if (getAdminSession()) return true;
    window.location.href = 'admin-login.html';
    return false;
  }

  /* ---------- Generic helpers ---------- */
  function lsGet(key, def) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
  }
  function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function openModal(id) { var el = document.getElementById(id); if (el) el.classList.add('open'); }
  function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }

  function closeAllModals() {
    var overlays = document.querySelectorAll('.modal-overlay.open');
    for (var i = 0; i < overlays.length; i++) overlays[i].classList.remove('open');
  }

  function confirmDialog(message, onOk) {
    var overlay = document.getElementById('confirmModal');
    if (!overlay) { if (window.confirm(message)) onOk(); return; }
    var msgEl = document.getElementById('confirmText');
    var okBtn = document.getElementById('confirmOk');
    var cancelBtn = document.getElementById('confirmCancel');
    if (msgEl) msgEl.textContent = message;

    function finish() {
      overlay.classList.remove('open');
      okBtn.removeEventListener('click', okHandler);
      cancelBtn.removeEventListener('click', cancelHandler);
    }
    function okHandler() { finish(); onOk(); }
    function cancelHandler() { finish(); }

    okBtn.addEventListener('click', okHandler);
    cancelBtn.addEventListener('click', cancelHandler);
    overlay.classList.add('open');
  }

  function toast(message) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  function setActiveNav() {
    var page = (window.location.pathname.split('/').pop() || 'admin-dashboard.html').toLowerCase();
    var links = document.querySelectorAll('.admin-nav a[data-page], .admin-mobile-bar a[data-page]');
    for (var i = 0; i < links.length; i++) {
      if ((links[i].getAttribute('data-page') || '').toLowerCase() === page) {
        links[i].classList.add('active');
      }
    }
  }

  function fillAdminIdentity() {
    var a = getAdminSession();
    if (!a) return;
    var names = document.querySelectorAll('.js-admin-name');
    for (var i = 0; i < names.length; i++) names[i].textContent = a.name || 'Site Admin';
  }

  function setBadge(id, n) {
    var el = document.getElementById(id);
    if (el) el.textContent = n;
  }

  function updateAdminBadges() {
    var pets = (typeof global.getPets === 'function') ? global.getPets() : [];
    var reqs = lsGet('paw_applications', []);
    var users = lsGet('paw_users', []);
    var pending = 0;
    for (var i = 0; i < reqs.length; i++) {
      var s = reqs[i].status || '';
      if (s === 'Pending' || s === 'Under Review' || s === 'In Review') pending++;
    }
    setBadge('navPetBadge', pets.length);
    setBadge('navReqBadge', pending);
    setBadge('navUserBadge', users.length);
  }

  /* ---------- Login handler ---------- */
  function handleLogin() {
    var form = document.getElementById('adminLoginForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = document.getElementById('adminLoginError');
      var email = (document.getElementById('adminEmail').value || '').trim();
      var pass = document.getElementById('adminPassword').value;
      var remember = document.getElementById('adminRemember') ? document.getElementById('adminRemember').checked : false;

      /* DEMO-ONLY admin login: any non-empty email/username + any non-empty
         password grants access. This is NOT secure authentication. */
      if (!email) {
        if (err) { err.classList.remove('hidden'); err.textContent = 'Please enter your admin email or username.'; }
        return;
      }
      if (!pass) {
        if (err) { err.classList.remove('hidden'); err.textContent = 'Please enter your password.'; }
        return;
      }

      if (err) { err.classList.add('hidden'); err.textContent = ''; }
      var demoAdmin = { name: email.split('@')[0] || email, email: email };
      if (remember) setAdminSession(demoAdmin);
      else { sessionStorage.setItem(ADMIN_KEY, JSON.stringify(demoAdmin)); localStorage.removeItem(ADMIN_KEY); }
      window.location.href = 'admin-dashboard.html';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureDefaultAdmin();
    fillAdminIdentity();
    setActiveNav();
    updateAdminBadges();

    var logoutBtns = document.querySelectorAll('.logout-btn-admin');
    for (var i = 0; i < logoutBtns.length; i++) {
      logoutBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        logoutAdmin();
      });
    }
    handleLogin();
  });

  global.lsGet = lsGet;
  global.lsSet = lsSet;
  global.esc = esc;
  global.openModal = openModal;
  global.closeModal = closeModal;
  global.closeAllModals = closeAllModals;
  global.confirmDialog = confirmDialog;
  global.toast = toast;
  global.requireAdmin = requireAdmin;
  global.logoutAdmin = logoutAdmin;
  global.getAdminSession = getAdminSession;
  global.setAdminSession = setAdminSession;
})(window);