(function (global) {
  var USER_KEY = 'paw_user';
  var USERS_KEY = 'paw_users';

  /* Always open every page at the very top, regardless of the previous page's scroll or back/forward history. */
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
  window.scrollTo(0, 0);
  window.addEventListener('load', function () { window.scrollTo(0, 0); });

  /* ---------- Session (localStorage when "remember", sessionStorage otherwise) ---------- */
  function getSession() {
    try {
      var v = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }
  function setSession(user, remember) {
    if (remember === undefined) remember = true;
    try {
      if (remember) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem(USER_KEY); } catch (e) {}
    try { sessionStorage.removeItem(USER_KEY); } catch (e) {}
  }
  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }
  function requireAuth() {
    if (getSession()) return true;
    window.location.href = 'login.html';
    return false;
  }

  /* ---------- Demo user store (frontend only) ---------- */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; }
  }
  function findUserByEmail(users, email) {
    var e = (email || '').toLowerCase().trim();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email && users[i].email.toLowerCase() === e) return users[i];
    }
    return null;
  }
  function saveUser(user) {
    var users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function idFor(email) {
    return 'u_' + String(email || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function ensureUserIds() {
    try {
      var users = getUsers();
      var changed = false;
      for (var i = 0; i < users.length; i++) {
        if (!users[i].id) { users[i].id = idFor(users[i].email); changed = true; }
      }
      if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  }
  function getCurrentUserId() {
    var u = getSession();
    return (u && (u.id || idFor(u.email))) || '';
  }
  function redirectAfterAuth() {
    var next = new URLSearchParams(window.location.search).get('next');
    if (next && !/^(?:https?:)?\/\//.test(next)) window.location.href = next;
    else window.location.href = 'user-dashboard.html';
  }

  global.getSession = getSession;
  global.setSession = setSession;
  global.clearSession = clearSession;
  global.logout = logout;
  global.requireAuth = requireAuth;
  global.getUsers = getUsers;
  global.findUserByEmail = findUserByEmail;
  global.saveUser = saveUser;
  global.idFor = idFor;
  global.ensureUserIds = ensureUserIds;
  global.getCurrentUserId = getCurrentUserId;

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function validatePhone(v) {
    var d = v.replace(/[\s\-]+/g, '');
    return /^(?:\+8801?[3-9]\d{8}|01[3-9]\d{8})$/.test(d);
  }
  function nameFromEmail(email) {
    var parts = email.split('@')[0].split(/[._\-]+/);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) { parts.splice(i, 1); i--; }
    }
    var name = parts.map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join(' ');
    return name || 'PawBangla User';
  }

  function setFieldError(id, msg) {
    var input = $(id);
    var err = document.querySelector('.form-error[data-for="' + id + '"]');
    if (input) {
      if (msg) input.classList.add('field-error'); else input.classList.remove('field-error');
    }
    if (err) err.textContent = msg || '';
    return !msg;
  }
  function showTopError(el, msg) {
    if (!el) return;
    if (msg) { el.classList.remove('hidden'); el.textContent = msg; }
    else { el.classList.add('hidden'); el.textContent = ''; }
  }

  /* ---------- Nav reflects login state ---------- */
  function fillUserNames() {
    var u = getSession();
    if (u) {
      var names = document.querySelectorAll('.js-username');
      for (var i = 0; i < names.length; i++) {
        names[i].textContent = u.name || 'User';
      }
    }
    var loginBtn = $('loginBtn');
    if (loginBtn) {
      if (getSession()) {
        loginBtn.textContent = 'Dashboard';
        loginBtn.href = 'user-dashboard.html';
      } else {
        loginBtn.textContent = 'Login';
        loginBtn.href = 'login.html';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureUserIds();
    fillUserNames();

    /* ---------- LOGIN ---------- */
    var loginForm = $('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = $('loginError');
        var email = $('loginEmail').value.trim();
        var pass = $('loginPassword').value;
        var remember = $('loginRemember') ? $('loginRemember').checked : false;

        if (!validateEmail(email)) { showTopError(err, 'Please enter a valid email address.'); return; }
        if (!pass || pass.length < 6) { showTopError(err, 'Password must be at least 6 characters.'); return; }

        var users = getUsers();
        var user = findUserByEmail(users, email);

        if (!user) {
          if (users.length === 0) {
            user = { name: nameFromEmail(email), email: email, phone: '', password: pass };
          } else {
            showTopError(err, 'No account found with that email. Please register first.');
            return;
          }
        } else if (user.active === false) {
          showTopError(err, 'This account has been blocked. Please contact support.');
          return;
        } else if (user.password !== pass) {
          showTopError(err, 'Invalid email or password. Please try again.');
          return;
        }

        showTopError(err, null);
        setSession({
          id: user.id || idFor(user.email),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          createdAt: user.createdAt || ''
        }, remember);
        redirectAfterAuth();
      });
    }

    /* ---------- REGISTER ---------- */
    var registerForm = $('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = $('registerError');
        var name = $('regName').value.trim();
        var email = $('regEmail').value.trim();
        var phone = $('regPhone').value.trim();
        var pass = $('regPassword').value;
        var confirmPass = $('regConfirm').value;
        var agree = $('regAgree').checked;

        var ok = true;
        ok = setFieldError('regName', name.length < 2 ? 'Please enter your full name.' : '') && ok;
        ok = setFieldError('regEmail', !validateEmail(email) ? 'Please enter a valid email address.' : '') && ok;
        ok = setFieldError('regPhone', (phone && !validatePhone(phone)) ? 'Please enter a valid Bangladesh phone number.' : '') && ok;
        ok = setFieldError('regPassword', pass.length < 6 ? 'Password must be at least 6 characters.' : '') && ok;
        ok = setFieldError('regConfirm', pass !== confirmPass ? 'Passwords do not match.' : '') && ok;
        ok = setFieldError('regAgree', !agree ? 'Please accept the Terms of Service to continue.' : '') && ok;

        if (ok && findUserByEmail(getUsers(), email)) {
          ok = setFieldError('regEmail', 'An account with this email already exists. Please log in.') && ok;
        }

        if (!ok) { showTopError(err, null); return; }

        var newUser = {
          name: name,
          email: email,
          phone: phone,
          password: pass,
          id: idFor(email),
          createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        saveUser(newUser);
        setSession({ id: newUser.id, name: name, email: email, phone: phone, createdAt: newUser.createdAt }, true);

        showTopError(err, null);
        redirectAfterAuth();
      });
    }
  });
})(window);