(function (global) {
  document.addEventListener('DOMContentLoaded', function () {
    if (!global.requireAdmin()) return;

    var pets = (typeof global.getPets === 'function') ? global.getPets() : (global.PETS || []);
    var requests = global.lsGet('paw_applications', []);
    var users = global.lsGet('paw_users', []);

    function setStat(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

    /* ---------- Stats ---------- */
    var available = pets.filter(function (p) { return p.status === 'available'; }).length;
    var pending = requests.filter(function (r) {
      return r.status === 'Pending' || r.status === 'Under Review' || r.status === 'In Review';
    }).length;
    var approved = requests.filter(function (r) {
      return r.status === 'Approved' || r.status === 'Completed';
    }).length;

    setStat('statTotalPets', pets.length);
    setStat('statAvailablePets', available);
    setStat('statPendingRequests', requests.length ? pending : 0);
    setStat('statApprovedRequests', approved);
    setStat('statTotalUsers', users.length);

    /* ---------- Recent requests ---------- */
    var body = document.getElementById('recentRequests');
    if (body) {
      var recent = requests.slice(0, 5);
      body.innerHTML = '';
      if (!recent.length) {
        body.innerHTML = '<tr class="table-empty"><td colspan="4">No adoption requests yet.</td></tr>';
      } else {
        recent.forEach(function (r) {
          var pet = global.getPet ? global.getPet(r.petId) : null;
          var pill = 'status-pill';
          var s = (r.status || '').toLowerCase();
          if (s === 'under review' || s === 'in review') pill += ' review';
          else if (s === 'approved') pill += ' approved';
          else if (s === 'rejected') pill += ' rejected';
          else if (s === 'completed') pill += ' completed';
          else pill += ' pending';
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td><div class="cell-main" style="font-weight:600;">' + global.esc(r.applicant || '—') + '</div>' +
              '<div class="cell-sub" style="font-size:11px;color:var(--text-light);">' + global.esc(r.email || '') + '</div></td>' +
            '<td><div class="pet-cell">' +
              (pet ? '<img src="' + pet.img + '" alt="">' : '') +
              '<div><div class="cell-title">' + global.esc(r.petName || '—') + '</div>' +
              '<div class="cell-sub">' + global.esc(r.petType || '') + '</div></div></div></td>' +
            '<td>' + global.esc(r.date || '—') + '</td>' +
            '<td><span class="' + pill + '">' + global.esc(r.status || 'Pending') + '</span></td>';
          body.appendChild(tr);
        });
      }
    }

    /* ---------- Recent pets ---------- */
    var grid = document.getElementById('recentPets');
    if (grid) {
      grid.innerHTML = '';
      var recentPets = pets.slice(-8).reverse();
      if (!recentPets.length) {
        grid.innerHTML = '<div class="empty-box">No pets listed yet.</div>';
      } else {
        recentPets.forEach(function (p) {
          var card = document.createElement('div');
          card.className = 'mini-pet';
          card.innerHTML =
            '<div class="photo" style="background-image:url(\'' + p.img + '\')">' +
              '<span class="type-tag">' + global.esc(p.type) + '</span>' +
              (p.status !== 'available' ? '<span style="position:absolute;top:8px;right:8px;background:rgba(15,26,46,.75);color:#fff;font-size:10px;font-weight:600;padding:2px 8px;border-radius:12px;">' + global.esc(p.status) + '</span>' : '') +
            '</div>' +
            '<div class="body"><div class="m-name">' + global.esc(p.name) + '</div>' +
            '<div class="m-sub">' + global.esc(p.breed) + ' · ' + global.esc(p.location) + '</div></div>';
          grid.appendChild(card);
        });
      }
    }
  });
})(window);