(function (global) {
  var APP_KEY = 'paw_applications';

  function $(id) { return document.getElementById(id); }
  function query(key) { return new URLSearchParams(window.location.search).get(key); }

  var state = { pet: null, petRequested: false, loggedIn: false, available: true, duplicate: false };

  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validatePhone(v) {
    var d = v.replace(/[\s\-]+/g, '');
    return /^(?:\+8801?[3-9]\d{8}|01[3-9]\d{8})$/.test(d);
  }

  function getApplications() {
    try { return JSON.parse(localStorage.getItem(APP_KEY)) || []; } catch (e) { return []; }
  }
  function saveApplications(list) { localStorage.setItem(APP_KEY, JSON.stringify(list)); }

  function petStatus(petId) {
    if (!petId) return 'available';
    var list = typeof global.getPets === 'function' ? global.getPets() : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === petId) return list[i].status || 'available';
    }
    return 'available';
  }

  function setError(inputId, msg) {
    var input = $(inputId);
    var err = document.querySelector('.form-error[data-for="' + inputId + '"]');
    if (input) {
      if (msg) { input.classList.add('field-error'); } else { input.classList.remove('field-error'); }
    }
    if (err) { err.textContent = msg || ''; }
    return !msg;
  }

  function validate() {
    var ok = true;
    var name = $('fName').value.trim();
    var email = $('fEmail').value.trim();
    var phone = $('fPhone').value.trim();
    var address = $('fAddress').value.trim();
    var reason = $('fReason').value.trim();
    var experience = $('fExperience').value;

    ok = setError('fName', name.length < 2 ? 'Please enter your full name.' : '') && ok;
    ok = setError('fEmail', !validateEmail(email) ? 'Please enter a valid email address.' : '') && ok;
    ok = setError('fPhone', !validatePhone(phone) ? 'Enter a valid Bangladesh phone, e.g. +8801XXXXXXXXX.' : '') && ok;
    ok = setError('fAddress', address.length < 5 ? 'Please enter your full address.' : '') && ok;
    ok = setError('fExperience', !experience ? 'Please choose your experience level.' : '') && ok;
    ok = setError('fReason', reason.length < 20 ? 'Please write at least a short reason (20+ characters).' : '') && ok;

    var contact = document.querySelector('input[name="contact"]:checked');
    ok = setError('contact', !contact ? 'Please choose a preferred contact method.' : '') && ok;
    ok = setError('fAgree', !$('fAgree').checked ? 'Please agree to the confirmation to continue.' : '') && ok;

    return ok;
  }

  function appliedFor(petId, userId, email) {
    if (!petId) return false;
    var apps = getApplications();
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      if (a.petId !== petId) continue;
      if ((userId && a.userId === userId)) return true;
      if (userId && !a.userId && email && a.email && a.email.toLowerCase() === email.toLowerCase()) return true;
    }
    return false;
  }

  function render() {
    var session = global.getSession();
    state.loggedIn = !!session;
    var petId = $('petId').value;

    var form = $('applicationForm');
    var banner = $('applyingBanner');
    var loginNotice = $('loginNotice');
    var unavailableNotice = $('unavailableNotice');
    var duplicateNotice = $('duplicateNotice');

    if (!state.loggedIn) {
      var lpt = $('loginPet');
      if (lpt) lpt.textContent = (state.pet ? state.pet.name : 'this pet');
      var cta = $('loginCta');
      if (cta) cta.href = 'login.html?next=' + encodeURIComponent('Apply.html' + (petId ? '?pet=' + petId : ''));
      if (loginNotice) loginNotice.classList.remove('hidden');
      if (unavailableNotice) unavailableNotice.classList.add('hidden');
      if (duplicateNotice) duplicateNotice.classList.add('hidden');
      if (banner) banner.classList.add('hidden');
      if (form) form.classList.add('hidden');
      return;
    }

    if (loginNotice) loginNotice.classList.add('hidden');

    if (state.petRequested && !state.available) {
      var upt = $('unavailablePet');
      if (upt) upt.textContent = state.pet ? state.pet.name : 'This pet';
      if (unavailableNotice) unavailableNotice.classList.remove('hidden');
      if (duplicateNotice) duplicateNotice.classList.add('hidden');
      if (banner) banner.classList.add('hidden');
      if (form) form.classList.add('hidden');
      return;
    }
    if (unavailableNotice) unavailableNotice.classList.add('hidden');

    if (state.duplicate) {
      var dpt = $('duplicatePet');
      if (dpt) dpt.textContent = state.pet ? state.pet.name : 'this pet';
      if (duplicateNotice) duplicateNotice.classList.remove('hidden');
      if (banner) banner.classList.add('hidden');
      if (form) form.classList.add('hidden');
      return;
    }
    if (duplicateNotice) duplicateNotice.classList.add('hidden');

    if (banner) banner.classList.remove('hidden');
    if (form) form.classList.remove('hidden');
  }

  function prefill() {
    var petId = query('pet') || '';
    state.petRequested = !!petId;
    var session = global.getSession();

    if (session) {
      $('fName').value = session.name || '';
      $('fEmail').value = session.email || '';
      $('fPhone').value = session.phone || '';
    }

    if (petId) {
      $('petId').value = petId;
      var pet = global.getPet ? global.getPet(petId) : null;
      if (pet) {
        state.pet = pet;
        state.available = petStatus(pet.id) === 'available';
        for (var i = 0; i < $('fType').options.length; i++) {
          if ($('fType').options[i].value === pet.type) { $('fType').selectedIndex = i; break; }
        }
        $('applyingPhoto').src = pet.img;
        $('applyingTitle').textContent = 'Applying for: ' + pet.name;
        $('applyingSub').textContent = pet.breed + ' · ' + pet.location;
      } else {
        state.available = false;
      }
    }

    if (session && petId) {
      state.duplicate = appliedFor(petId, global.getCurrentUserId(), session.email);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!state.loggedIn) { render(); return; }
    if (state.duplicate) { render(); return; }
    if (state.petRequested && !state.available) { render(); return; }
    if (!validate()) return;

    var petId = $('petId').value;
    var pet = state.pet || (global.getPet ? global.getPet(petId) : null);
    var contact = document.querySelector('input[name="contact"]:checked');

    var session = global.getSession();
    var app = {
      id: 'app_' + Date.now(),
      userId: session ? (session.id || global.idFor(session.email)) : '',
      petId: petId || '',
      petName: pet ? pet.name : $('fType').value,
      petType: pet ? pet.type : $('fType').value,
      applicant: $('fName').value.trim(),
      email: $('fEmail').value.trim(),
      phone: $('fPhone').value.trim(),
      address: $('fAddress').value.trim(),
      experience: $('fExperience').value,
      reason: $('fReason').value.trim(),
      contact: contact ? contact.value : 'Email',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending'
    };

    // Save locally so the dashboard (localStorage-based) keeps working.
    var apps = getApplications();
    apps.unshift(app);
    saveApplications(apps);

    // Send the application to the PHP backend (php/apply.php).
    var form = $('applicationForm');
    var formData = new FormData(form);
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; }

    fetch(form.action, { method: form.method, body: formData })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        var success = $('applySuccess');
        var sp = $('successPet');
        if (sp) sp.textContent = (pet ? pet.name : 'your pet');
        if (success) success.classList.remove('hidden');
        if (form) form.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function () {
        // Even if the server is unreachable, keep the local success so the
        // dashboard still shows the application.
        var success = $('applySuccess');
        var sp = $('successPet');
        if (sp) sp.textContent = (pet ? pet.name : 'your pet');
        if (success) success.classList.remove('hidden');
        if (form) form.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .finally(function () {
        if (submitBtn) { submitBtn.disabled = false; }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    prefill();
    render();
    var form = $('applicationForm');
    if (form) form.addEventListener('submit', onSubmit);
  });
})(window);