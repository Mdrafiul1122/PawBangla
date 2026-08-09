(function (global) {
  var PETS_KEY = 'paw_pets';
  var editingId = null;

  function $(id) { return document.getElementById(id); }

  function seed() {
    if (localStorage.getItem(PETS_KEY) === null && global.PETS) {
      global.lsSet(PETS_KEY, global.PETS);
    }
  }

  function getPets() { return global.lsGet(PETS_KEY, global.PETS || []); }
  function savePets(list) { global.lsSet(PETS_KEY, list); }

  function statusLabel(s) {
    return (s || 'available') === 'available' ? 'Available' : 'Adopted';
  }
  function statusClass(s) {
    return (s || 'available') === 'available' ? 'available' : 'adopted';
  }

  function renderTable() {
    var body = $('petsBody');
    if (!body) return;
    var q = ($('petSearch').value || '').toLowerCase().trim();
    var statusF = $('petStatusFilter').value;
    var typeF = $('petTypeFilter').value;

    var list = getPets().filter(function (p) {
      var text = (p.name + ' ' + p.breed + ' ' + p.location + ' ' + p.district).toLowerCase();
      var matchQ = !q || text.indexOf(q) !== -1;
      var matchS = !statusF || (p.status || 'available') === statusF;
      var matchT = !typeF || p.type === typeF;
      return matchQ && matchS && matchT;
    });

    body.innerHTML = '';
    if (!list.length) {
      body.innerHTML = '<tr class="table-empty"><td colspan="6">No pets found. Try a different search or add a new pet.</td></tr>';
      return;
    }
    list.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><div class="pet-cell">' +
          '<img src="' + global.esc(p.img) + '" alt="" onerror="this.style.opacity=\'0.2\'">' +
          '<div><div class="cell-title">' + global.esc(p.name) + '</div>' +
          '<div class="cell-sub">' + global.esc(p.breed) + ' · ' + global.esc(p.age) + '</div></div></div></td>' +
        '<td>' + global.esc(p.type) + '</td>' +
        '<td>' + global.esc(p.location) + '</td>' +
        '<td><b>' + (p.compatibility || 0) + '%</b></td>' +
        '<td><span class="status-pill ' + statusClass(p.status) + '">' + statusLabel(p.status) + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-outline btn-sm pet-edit" data-id="' + global.esc(p.id) + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm pet-delete" data-id="' + global.esc(p.id) + '">Delete</button>' +
        '</div></td>';
      body.appendChild(tr);
    });

    body.querySelectorAll('.pet-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { openEdit(btn.getAttribute('data-id')); });
    });
    body.querySelectorAll('.pet-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { onDelete(btn.getAttribute('data-id')); });
    });
  }

  function resetForm() {
    var form = $('petForm');
    if (form) form.reset();
    $('petId').value = '';
    $('petType').value = 'Dog';
    $('petStatus').value = 'available';
    $('petGender').value = 'Male';
    $('petDistrict').value = 'Dhaka';
    $('petCompat').value = 80;
    var errors = document.querySelectorAll('.form-error[data-for]');
    for (var i = 0; i < errors.length; i++) errors[i].textContent = '';
    var invalids = document.querySelectorAll('.field-error');
    for (var j = 0; j < invalids.length; j++) invalids[j].classList.remove('field-error');
  }

  function openAdd() {
    editingId = null;
    resetForm();
    $('petModalTitle').textContent = 'Add Pet';
    $('savePetBtn').textContent = 'Add Pet';
    global.openModal('petModal');
    setTimeout(function () { if ($('petName')) $('petName').focus(); }, 50);
  }

  function openEdit(id) {
    var p = getPets().filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    editingId = id;
    resetForm();
    $('petId').value = p.id;
    $('petName').value = p.name || '';
    $('petType').value = p.type || 'Dog';
    $('petBreed').value = p.breed || '';
    $('petAge').value = p.age || '';
    $('petGender').value = p.gender || 'Male';
    $('petDistrict').value = p.district || 'Dhaka';
    $('petLocation').value = p.location || '';
    $('petCompat').value = p.compatibility || 80;
    $('petImg').value = p.img || '';
    $('petStatus').value = (p.status === 'adopted') ? 'adopted' : 'available';
    $('petDesc').value = p.description || '';
    $('petTraits').value = (p.traits || []).join(', ');
    $('petCare').value = (p.care || []).join(', ');
    $('petModalTitle').textContent = 'Edit Pet — ' + p.name;
    $('savePetBtn').textContent = 'Save Changes';
    global.openModal('petModal');
  }

  function onDelete(id) {
    var p = getPets().filter(function (x) { return x.id === id; })[0];
    var label = p ? p.name : 'this pet';
    global.confirmDialog('Delete "' + label + '" permanently? This cannot be undone.', function () {
      var list = getPets().filter(function (x) { return x.id !== id; });
      savePets(list);
      renderTable();
      global.toast('Pet "' + label + '" deleted.');
    });
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function setError(id, msg) {
    var el = $(id);
    var err = document.querySelector('.form-error[data-for="' + id + '"]');
    if (el) { if (msg) el.classList.add('field-error'); else el.classList.remove('field-error'); }
    if (err) err.textContent = msg || '';
  }

  function splitList(v) {
    return v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function onSave(e) {
    e.preventDefault();
    var name = $('petName').value.trim();
    var breed = $('petBreed').value.trim();
    var age = $('petAge').value.trim();
    var location = $('petLocation').value.trim();
    var compat = parseInt($('petCompat').value, 10);

    var ok = true;
    ok = setError('petName', !name ? 'Please enter the pet name.' : '') && ok;
    ok = setError('petBreed', !breed ? 'Please enter the breed.' : '') && ok;
    ok = setError('petAge', !age ? 'Please enter the age.' : '') && ok;
    ok = setError('petLocation', !location ? 'Please enter the location.' : '') && ok;
    if (!ok) return;

    var list = getPets();
    var base = {
      type: $('petType').value,
      breed: breed,
      age: age,
      gender: $('petGender').value,
      district: $('petDistrict').value,
      location: location,
      compatibility: isNaN(compat) ? 80 : Math.max(0, Math.min(100, compat)),
      img: $('petImg').value.trim() || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop',
      status: $('petStatus').value,
      description: $('petDesc').value.trim(),
      temperament: '',
      traits: splitList($('petTraits').value),
      care: splitList($('petCare').value)
    };

    var existing = null;
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === editingId) existing = list[i];

    if (existing) {
      var idx = list.indexOf(existing);
      list[idx] = Object.assign({}, existing, base, { id: existing.id });
    } else {
      var idBase = slugify(name) || 'pet';
      var id = idBase;
      var n = 1;
      while (list.some(function (p) { return p.id === id; })) { id = idBase + '-' + (++n); }
      list.unshift(Object.assign({ id: id }, base));
    }

    savePets(list);
    renderTable();
    global.closeModal('petModal');
    global.toast(existing ? 'Pet updated successfully.' : 'Pet added successfully.');
  }

  function bindModalClosers() {
    var closers = document.querySelectorAll('[data-close]');
    for (var i = 0; i < closers.length; i++) {
      closers[i].addEventListener('click', function () {
        global.closeModal(this.getAttribute('data-close'));
      });
    }
    document.querySelectorAll('.modal-overlay').forEach(function (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) ov.classList.remove('open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!global.requireAdmin()) return;
    seed();

    var form = $('petForm');
    if (form) form.addEventListener('submit', onSave);

    $('addPetBtn').addEventListener('click', openAdd);
    $('petSearch').addEventListener('input', renderTable);
    $('petStatusFilter').addEventListener('change', renderTable);
    $('petTypeFilter').addEventListener('change', renderTable);

    bindModalClosers();
    renderTable();

    if (window.location.hash === '#new-pet') openAdd();
  });
})(window);