(function (global) {
  var USERS_KEY = 'paw_users';

  function $(id) { return document.getElementById(id); }

  function seedUsers() {
    if (localStorage.getItem(USERS_KEY) !== null) return;
    global.lsSet(USERS_KEY, [
      { id: 'urahimexamplecom', name: 'Rahim Uddin', email: 'rahim@example.com', phone: '+8801712345678', password: 'user123', createdAt: '01 Jul 2026', active: true },
      { id: 'uayeshaexamplecom', name: 'Ayesha Khan', email: 'ayesha@example.com', phone: '+8801911112222', password: 'user123', createdAt: '12 Jul 2026', active: true },
      { id: 'utanvirexamplecom', name: 'Tanvir Ahmed', email: 'tanvir@example.com', phone: '+8801812345678', password: 'user123', createdAt: '20 Jul 2026', active: false },
      { id: 'unusratexamplecom', name: 'Nusrat Jahan', email: 'nusrat@example.com', phone: '+8801611122233', password: 'user123', createdAt: '28 Jul 2026', active: true }
    ]);
  }

  function getUsers() { return global.lsGet(USERS_KEY, []); }
  function saveUsers(list) { global.lsSet(USERS_KEY, list); }

  function initial(name) { return (name || '?').charAt(0).toUpperCase(); }

  function renderTable() {
    var body = $('usersBody');
    if (!body) return;
    var q = ($('userSearch').value || '').toLowerCase().trim();
    var stF = $('userStatusFilter').value;

    var list = getUsers().filter(function (u) {
      var text = (u.name + ' ' + u.email + ' ' + u.phone).toLowerCase();
      var matchQ = !q || text.indexOf(q) !== -1;
      var isActive = u.active !== false;
      var matchS = !stF || (stF === 'active' ? isActive : !isActive);
      return matchQ && matchS;
    });

    var count = $('userCount');
    if (count) count.textContent = list.length + ' user' + (list.length === 1 ? '' : 's');

    body.innerHTML = '';
    if (!list.length) {
      body.innerHTML = '<tr class="table-empty"><td colspan="6">No users found.</td></tr>';
      return;
    }
    list.forEach(function (u) {
      var isActive = u.active !== false;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><div class="pet-cell">' +
          '<div class="admin-avatar" style="color:#7c5cd6;">' + initial(u.name) + '</div>' +
          '<div><div class="cell-title">' + global.esc(u.name) + '</div>' +
          '<div class="cell-sub">#' + global.esc((u.id || (u.email || '').split('@')[0])) + '</div></div></div></td>' +
        '<td>' + global.esc(u.email) + '</td>' +
        '<td>' + global.esc(u.phone || '—') + '</td>' +
        '<td>' + global.esc(u.createdAt || '—') + '</td>' +
        '<td><span class="status-pill ' + (isActive ? 'active' : 'blocked') + '">' + (isActive ? 'Active' : 'Blocked') + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-sm ' + (isActive ? 'btn-outline' : 'btn-primary') + ' user-toggle" data-id="' + global.esc(u.email) + '">' + (isActive ? 'Block' : 'Unblock') + '</button>' +
          '<button class="btn btn-danger btn-sm user-delete" data-id="' + global.esc(u.email) + '"><i data-lucide="trash-2" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px;"></i>Delete</button>' +
        '</div></td>';
      body.appendChild(tr);
    });

    body.querySelectorAll('.user-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleUser(btn.getAttribute('data-id')); });
    });
    body.querySelectorAll('.user-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var email = btn.getAttribute('data-id');
        var u = getUsers().filter(function (x) { return x.email === email; })[0];
        global.confirmDialog('Delete user "' + (u && u.name ? u.name : email) + '"? This cannot be undone.', function () {
          saveUsers(getUsers().filter(function (x) { return x.email !== email; }));
          renderTable();
          global.toast('User deleted.');
        });
      });
    });
  }

  function toggleUser(email) {
    var users = getUsers();
    var found = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        users[i].active = users[i].active === false;
        found = true;
        break;
      }
    }
    if (!found) return;
    saveUsers(users);
    renderTable();
    global.toast('User status updated.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!global.requireAdmin()) return;
    seedUsers();
    $('userSearch').addEventListener('input', renderTable);
    $('userStatusFilter').addEventListener('change', renderTable);
    renderTable();
  });
})(window);