(function (global) {
  var REQUESTS_KEY = 'paw_applications';
  var currentTab = 'All';

  function $(id) { return document.getElementById(id); }

  function seedRequests() {
    var existing = global.lsGet(REQUESTS_KEY, []);
    if (existing.length) return;
    global.lsSet(REQUESTS_KEY, [
      {
        id: 'req_seed_1', userId: 'urahimexamplecom', petId: 'bruno', petName: 'Bruno', petType: 'Dog',
        applicant: 'Rahim Uddin', email: 'rahim@example.com', phone: '+8801712345678',
        address: 'House 12, Road 4, Mirpur, Dhaka', experience: 'Some experience',
        reason: 'I am looking for a friendly companion for my two kids and have a large garden for daily walks.',
        contact: 'Phone', date: '02 Aug 2026', status: 'Pending'
      },
      {
        id: 'req_seed_2', userId: 'uayeshaexamplecom', petId: 'luna', petName: 'Luna', petType: 'Cat',
        applicant: 'Ayesha Khan', email: 'ayesha@example.com', phone: '+8801911112222',
        address: 'Chittagong', experience: 'Experienced (2+ years)',
        reason: 'I have cared for Persian cats before and keep an indoor-only apartment perfect for Luna.',
        contact: 'Email', date: '28 Jul 2026', status: 'Under Review'
      },
      {
        id: 'req_seed_3', userId: 'utanvirexamplecom', petId: 'bella', petName: 'Bella', petType: 'Rabbit',
        applicant: 'Tanvir Ahmed', email: 'tanvir@example.com', phone: '+8801812345678',
        address: 'Rajshahi', experience: 'No experience yet',
        reason: 'My daughter loves animals and we have prepared a spacious indoor play area for a bunny.',
        contact: 'Phone', date: '20 Jul 2026', status: 'Approved'
      },
      {
        id: 'req_seed_4', userId: 'unusratexamplecom', petId: 'rex', petName: 'Rex', petType: 'Dog',
        applicant: 'Nusrat Jahan', email: 'nusrat@example.com', phone: '+8801611122233',
        address: 'Dhaka, Banani', experience: 'Some experience',
        reason: 'I want a guard dog but can only offer a small apartment without outdoor space.',
        contact: 'Email', date: '12 Jul 2026', status: 'Rejected'
      },
      {
        id: 'req_seed_5', userId: 'urahimexamplecom', petId: 'mia', petName: 'Mia', petType: 'Cat',
        applicant: 'Rahim Uddin', email: 'rahim@example.com', phone: '+8801712345678',
        address: 'Mirpur, Dhaka', experience: 'Some experience',
        reason: 'Mia completed a successful trial week and is now part of our family.',
        contact: 'Phone', date: '18 Jul 2026', status: 'Completed'
      }
    ]);
  }

  function getRequests() { return global.lsGet(REQUESTS_KEY, []); }
  function saveRequests(list) { global.lsSet(REQUESTS_KEY, list); }

  function ensurePetStore() {
    var pets = global.lsGet('paw_pets', null);
    if (!pets) {
      pets = (typeof global.getPets === 'function') ? global.getPets() : [];
      global.lsSet('paw_pets', pets);
    }
    return pets;
  }

  function markPetAdopted(petId) {
    if (!petId) return;
    var pets = ensurePetStore();
    for (var i = 0; i < pets.length; i++) {
      if (pets[i].id === petId) { pets[i].status = 'adopted'; break; }
    }
    global.lsSet('paw_pets', pets);
  }

  function pillClass(s) {
    var k = (s || '').toLowerCase();
    if (k === 'under review' || k === 'in review') return 'review';
    if (k === 'approved') return 'approved';
    if (k === 'rejected') return 'rejected';
    if (k === 'completed') return 'completed';
    return 'pending';
  }

  function render() {
    var body = $('requestsBody');
    if (!body) return;
    var list = getRequests().filter(function (r) {
      return currentTab === 'All' || r.status === currentTab;
    });

    body.innerHTML = '';
    if (!list.length) {
      body.innerHTML = '<tr class="table-empty"><td colspan="5">No adoption requests in this view.</td></tr>';
      return;
    }
    list.forEach(function (r) {
      var pet = global.getPet ? global.getPet(r.petId) : null;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><div class="cell-main" style="font-weight:600;">' + global.esc(r.applicant || '—') + '</div>' +
          '<div class="cell-sub" style="font-size:11px;color:var(--text-light);">' + global.esc(r.contact || '') + '</div></td>' +
        '<td><div class="pet-cell">' +
          (pet ? '<img src="' + pet.img + '" alt="">' : '') +
          '<div><div class="cell-title">' + global.esc(r.petName || '—') + '</div>' +
          '<div class="cell-sub">' + global.esc(r.petType || '') + '</div></div></div></td>' +
        '<td>' + global.esc(r.date || '—') + '</td>' +
        '<td><span class="status-pill ' + pillClass(r.status) + '">' + global.esc(r.status || 'Pending') + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-outline btn-sm req-view" data-id="' + global.esc(r.id) + '">View</button>' +
          '<button class="btn btn-primary btn-sm req-approve" data-id="' + global.esc(r.id) + '">Approve</button>' +
          '<button class="btn btn-danger btn-sm req-reject" data-id="' + global.esc(r.id) + '">Reject</button>' +
        '</div></td>';
      body.appendChild(tr);
    });

    body.querySelectorAll('.req-view').forEach(function (b) { b.addEventListener('click', function () { openDetails(b.getAttribute('data-id')); }); });
    body.querySelectorAll('.req-approve').forEach(function (b) { b.addEventListener('click', function () { setStatus(b.getAttribute('data-id'), 'Approved'); }); });
    body.querySelectorAll('.req-reject').forEach(function (b) { b.addEventListener('click', function () { setStatus(b.getAttribute('data-id'), 'Rejected'); }); });
  }

  function findReq(id) {
    var list = getRequests();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function openDetails(id) {
    var r = findReq(id);
    if (!r) return;
    var pet = global.getPet ? global.getPet(r.petId) : null;

    $('reqModalTitle').textContent = 'Request for ' + (r.petName || 'a pet');
    $('reqModalStatus').innerHTML = '<span class="status-pill ' + pillClass(r.status) + '">' + global.esc(r.status || 'Pending') + '</span>';

    var dg = $('reqDetails');
    dg.innerHTML =
      '<div class="dg-row"><div class="dg-k">Applicant</div><div class="dg-v">' + global.esc(r.applicant || '—') + '</div></div>' +
      '<div class="dg-row"><div class="dg-k">Email</div><div class="dg-v">' + global.esc(r.email || '—') + '</div></div>' +
      '<div class="dg-row"><div class="dg-k">Phone</div><div class="dg-v">' + global.esc(r.phone || '—') + '</div></div>' +
      '<div class="dg-row"><div class="dg-k">Pet</div><div class="dg-v">' + global.esc(r.petName || '—') + ' · ' + global.esc(r.petType || '') + '</div></div>' +
      '<div class="dg-row"><div class="dg-k">Applied On</div><div class="dg-v">' + global.esc(r.date || '—') + '</div></div>' +
      '<div class="dg-row"><div class="dg-k">Experience</div><div class="dg-v">' + global.esc(r.experience || '—') + '</div></div>' +
      '<div class="dg-row"><div class="dg-k">Contact Method</div><div class="dg-v">' + global.esc(r.contact || '—') + '</div></div>' +
      (r.address ? '<div class="dg-row detail-full"><div class="dg-k">Address</div><div class="dg-v">' + global.esc(r.address) + '</div></div>' : '') +
      '<div class="dg-row detail-full"><div class="dg-k">Reason for Adoption</div><div class="dg-v">' + global.esc(r.reason || '—') + '</div></div>' +
      (pet ? '<div class="dg-row detail-full"><div class="dg-k">Pet</div><div class="dg-v"><a class="btn-link" href="pet-details.html?id=' + pet.id + '">View "' + pet.name + '" details →</a></div></div>' : '');

    var actions = $('reqModalActions');
    actions.innerHTML = '';
    if (r.status !== 'Approved' && r.status !== 'Completed' && r.status !== 'Rejected') {
      actions.innerHTML =
        '<button class="btn btn-primary" id="modalApprove">✔ Approve</button>' +
        '<button class="btn btn-danger" id="modalReject">✕ Reject</button>';
    }
    actions.insertAdjacentHTML('beforeend', '<button class="btn btn-outline" data-close="requestModal">Close</button>');

    var ap = $('modalApprove');
    if (ap) ap.addEventListener('click', function () { closeModalThen(id, 'Approved'); });
    var rj = $('modalReject');
    if (rj) rj.addEventListener('click', function () { closeModalThen(id, 'Rejected'); });

    global.openModal('requestModal');
  }

  function closeModalThen(id, status) {
    global.closeModal('requestModal');
    setStatus(id, status);
  }

  function setStatus(id, status) {
    var r = findReq(id);
    if (!r) return;
    var actionText = status === 'Approved' ? 'Approve this application for "' + (r.petName || 'the pet') + '"?' : 'Reject this application for "' + (r.petName || 'the pet') + '"?';
    global.confirmDialog(actionText, function () {
      var list = getRequests();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i].status = status;
          break;
        }
      }
      saveRequests(list);
      if (status === 'Approved' || status === 'Completed') markPetAdopted(r.petId);
      render();
      global.toast((status === 'Approved' ? 'Request approved.' : 'Request rejected.') + ' "' + (r.petName || '') + '"');
    });
  }

  function setupTabs() {
    var wrap = $('reqTabs');
    if (!wrap) return;
    wrap.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentTab = btn.getAttribute('data-status') || 'All';
        wrap.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        render();
      });
    });
  }

  function bindModalClosers() {
    var closers = document.querySelectorAll('[data-close]');
    for (var i = 0; i < closers.length; i++) {
      closers[i].addEventListener('click', function () {
        global.closeModal(this.getAttribute('data-close'));
      });
    }
    document.querySelectorAll('.modal-overlay').forEach(function (ov) {
      ov.addEventListener('click', function (e) { if (e.target === ov) ov.classList.remove('open'); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!global.requireAdmin()) return;
    seedRequests();
    setupTabs();
    bindModalClosers();
    render();
  });
})(window);