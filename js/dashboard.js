(function (global) {
  function $(id) { return document.getElementById(id); }

  function localStorageGet(key, def) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
  }
  function localStorageSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function statusClass(s) {
    var k = (s || '').toLowerCase();
    if (k === 'under review' || k === 'in review') return 'review';
    if (k === 'rejected') return 'rejected';
    return k; // pending, approved, completed
  }

  function setStat(id, text) { var el = $(id); if (el) el.textContent = text; }

  function myApps(apps, u) {
    var uid = global.getCurrentUserId ? global.getCurrentUserId() : (u.id || '');
    var email = (u.email || '').toLowerCase();
    return apps.filter(function (a) {
      if (a.userId) return a.userId === uid;
      if (email) return a.email && a.email.toLowerCase() === email;
      return false;
    });
  }

  function renderProfileCard(u) {
    var avatar = $('profileAvatar');
    var name = $('profileCardName');
    var meta = $('profileCardMeta');
    var since = $('profileSince');

    var initial = (u.name || 'U').charAt(0).toUpperCase();
    if (avatar) avatar.textContent = initial;
    if (name) name.textContent = u.name || 'User';
    if (meta) {
      var parts = [];
      if (u.email) parts.push(u.email);
      if (u.phone) parts.push(u.phone);
      meta.textContent = parts.join(' · ') || 'No contact info yet';
    }
    if (since) since.textContent = u.createdAt ? 'Member since ' + u.createdAt : 'Member since —';
  }

  function renderApplications(apps) {
    var body = $('applicationsBody');
    if (!body) return;
    body.innerHTML = '';
    if (!apps.length) {
      body.innerHTML = '<tr><td colspan="5" style="color:var(--text-light);text-align:center;padding:28px;">' +
        'No applications in this view yet. <a class="link-plain" href="Browse.html">Browse pets</a> to get started.</td></tr>';
      return;
    }
    apps.forEach(function (a) {
      var pet = global.getPet ? global.getPet(a.petId) : null;
      var row = document.createElement('tr');
      row.innerHTML =
        '<td><div class="pet-cell">' +
          (pet ? '<img src="' + pet.img + '" alt="' + a.petName + '">' : '') +
          '<span>' + a.petName + '</span></div></td>' +
        '<td>' + (a.petType || '') + '</td>' +
        '<td>' + a.date + '</td>' +
        '<td><span class="status-pill ' + statusClass(a.status) + '">' + a.status + '</span></td>' +
        '<td>' + (a.petId ? '<a class="link-plain" href="pet-details.html?id=' + a.petId + '">View Pet</a>' : '—') + '</td>';
      body.appendChild(row);
    });
  }

  function setupStatusTabs(apps) {
    var tabsWrap = $('statusTabs');
    if (!tabsWrap) { renderApplications(apps); return; }

    var current = 'All';
    function apply() {
      var filtered = apps.filter(function (a) {
        return current === 'All' || a.status === current;
      });
      renderApplications(filtered);
    }
    tabsWrap.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = btn.getAttribute('data-status') || 'All';
        tabsWrap.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        apply();
      });
    });
    apply();
  }

  function renderFavorites() {
    var grid = $('favoritesGrid');
    if (!grid) return;
    var favs = localStorageGet('paw_favorites', []);
    grid.innerHTML = '';

    if (!favs.length) {
      grid.innerHTML = '<p style="color:var(--text-light);font-size:13px;grid-column:1/-1;">' +
        'No favorites yet. Visit <a class="link-plain" href="Browse.html">Browse Pets</a> and save the ones you love.</p>';
      return;
    }

    favs.forEach(function (id) {
      var p = global.getPet ? global.getPet(id) : null;
      if (!p) return;
      var card = document.createElement('div');
      card.className = 'fav-card';
      card.innerHTML =
        '<img src="' + p.img + '" alt="' + p.name + '">' +
        '<div class="fav-info">' +
          '<div class="fav-name">' + p.name + '</div>' +
          '<div class="fav-breed">' + p.type + ' · ' + p.age + '</div>' +
        '</div>' +
        '<a class="icon-btn small" href="pet-details.html?id=' + p.id + '" title="View details">👁</a>' +
        '<button class="icon-btn small fav-remove" data-id="' + p.id + '" title="Remove favorite">✕</button>';
      grid.appendChild(card);
    });

    grid.querySelectorAll('.fav-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var favs = localStorageGet('paw_favorites', []);
        localStorageSet('paw_favorites', favs.filter(function (f) { return f !== id; }));
        renderFavorites();
        var b = $('favBadge'); if (b) b.textContent = favs.length;
        setStat('statFavorites', localStorageGet('paw_favorites', []).length);
      });
    });
  }

  function renderAdopted(apps) {
    var grid = $('adoptedGrid');
    if (!grid) return;
    var adopted = apps.filter(function (a) {
      return a.status === 'Approved' || a.status === 'Completed';
    });
    grid.innerHTML = '';

    if (!adopted.length) {
      grid.innerHTML = '<p style="color:var(--text-light);font-size:13px;grid-column:1/-1;">' +
        'No adopted pets yet. Once an application is approved or completed, your new family member will appear here.</p>';
      return;
    }

    adopted.forEach(function (a) {
      var p = global.getPet ? global.getPet(a.petId) : null;
      var card = document.createElement('div');
      card.className = 'fav-card';
      card.innerHTML =
        (p ? '<img src="' + p.img + '" alt="' + a.petName + '">' : '<img src="" alt="' + a.petName + '">') +
        '<div class="fav-info">' +
          '<div class="fav-name">' + (p ? p.name : a.petName) + '</div>' +
          '<div class="fav-breed">' + (a.petType || '') + ' · Home since ' + a.date + '</div>' +
          '<div style="margin-top:6px;"><span class="status-pill ' + statusClass(a.status) + '">' + a.status + '</span></div>' +
        '</div>' +
        (p ? '<a class="icon-btn small" href="pet-details.html?id=' + p.id + '" title="View pet">👁</a>' : '');
      grid.appendChild(card);
    });
  }

  function renderNotifications(apps) {
    var list = $('notifList');
    if (!list) return;
    if (!apps.length) {
      list.innerHTML = '<div class="notif-item">' +
        '<div><div class="notif-text">No notifications yet. Apply for a pet to see updates here.</div>' +
        '<div class="notif-time">—</div></div></div>';
      return;
    }
    var items = apps.slice(0, 4).map(function (a) {
      var st = (a.status || '').toLowerCase();
      var icon, text;
      if (st === 'approved') {
        icon = '🎉';
        text = 'Your adoption application for <b>' + a.petName + '</b> was approved. Welcome home!';
      } else if (st === 'completed') {
        icon = '💚';
        text = 'Adoption of <b>' + a.petName + '</b> is complete. Congratulations!';
      } else if (st === 'rejected') {
        icon = '✉️';
        text = 'Your application for <b>' + a.petName + '</b> was not approved this time.';
      } else {
        icon = '';
        text = 'Your application for <b>' + a.petName + '</b> is ' + a.status + ' by our team.';
      }
      return { icon: icon, text: text, time: a.date };
    }).map(function (n) {
      return '<div class="notif-item">' +
        '<div><div class="notif-text">' + n.text + '</div><div class="notif-time">' + n.time + '</div></div></div>';
    }).join('');
    list.innerHTML = items;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (global.requireAuth && !global.requireAuth()) return;

    var u = global.getSession ? global.getSession() : null;
    if (!u) u = { name: 'User', email: '' };

    var un = document.querySelectorAll('.js-username');
    for (var i = 0; i < un.length; i++) un[i].textContent = u.name || 'User';
    var greet = $('greetingName');
    if (greet) greet.textContent = (u.name || 'User').split(' ')[0];

    renderProfileCard(u);

    var apps = myApps(localStorageGet('paw_applications', []), u);
    var favs = localStorageGet('paw_favorites', []);

    setStat('statApplications', apps.length);
    setStat('statFavorites', favs.length);
    setStat('statInReview', apps.filter(function (a) {
      return a.status === 'Pending' || a.status === 'Under Review' || a.status === 'In Review';
    }).length);
    setStat('statAdopted', apps.filter(function (a) {
      return a.status === 'Approved' || a.status === 'Completed';
    }).length);

    var ab = $('appBadge'); if (ab) ab.textContent = apps.length;
    var adb = $('adoptedBadge'); if (adb) adb.textContent = apps.filter(function (a) {
      return a.status === 'Approved' || a.status === 'Completed';
    }).length;
    var fb = $('favBadge'); if (fb) fb.textContent = favs.length;

    setupStatusTabs(apps);
    renderFavorites();
    renderAdopted(apps);
    renderNotifications(apps);

    var pName = $('profileName'); if (pName) pName.value = u.name || '';
    var pEmail = $('profileEmail'); if (pEmail) pEmail.value = u.email || '';
    var pPhone = $('profilePhone'); if (pPhone) pPhone.value = u.phone || '';

    var form = $('profileForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        u.name = (pName && pName.value.trim()) || u.name;
        u.email = (pEmail && pEmail.value.trim()) || u.email;
        u.phone = (pPhone && pPhone.value.trim()) || u.phone;
        if (global.setSession) global.setSession(u, true);

        renderProfileCard(u);
        for (var i = 0; i < un.length; i++) un[i].textContent = u.name || 'User';
        if (greet) greet.textContent = (u.name || 'User').split(' ')[0];

        var msg = $('profileMsg');
        if (msg) { msg.classList.remove('hidden'); setTimeout(function () { msg.classList.add('hidden'); }, 2500); }
      });
    }

    var logoutBtns = document.querySelectorAll('.logout-btn');
    for (var j = 0; j < logoutBtns.length; j++) {
      logoutBtns[j].addEventListener('click', function (e) {
        e.preventDefault();
        if (global.logout) global.logout();
      });
    }
  });
})(window);