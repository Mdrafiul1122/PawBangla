(function (global) {
  function $(id) { return document.getElementById(id); }

  function renderPet() {
    var root = $('detailRoot');
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var pet = global.getPet ? global.getPet(params.get('id')) : null;

    if (!pet) {
      var nf = $('notFound');
      if (nf) nf.classList.remove('hidden');
      return;
    }

    var adopted = pet.status !== 'available';
    var actionHtml = adopted
      ? '<div class="status-tag" style="inset:auto;position:static;"><span>Adopted 🎉</span></div>'
      : '<a class="btn-solid" href="Apply.html?pet=' + pet.id + '">Apply to Adopt</a>';

    root.innerHTML =
      '<div class="detail-layout">' +
        '<div class="detail-photo" style="background-image:url(\'' + pet.img + '\')">' +
          '<span class="type-tag">' + pet.type + '</span>' +
        '</div>' +
        '<div class="detail-meta">' +
          '<h1>' + pet.name + '</h1>' +
          '<div class="breed-line">' + pet.breed + ' · ' + pet.location + '</div>' +
          '<div class="detail-list">' +
            '<div class="dl-row"><span class="k">Type</span><span class="v">' + pet.type + '</span></div>' +
            '<div class="dl-row"><span class="k">Gender</span><span class="v">' + pet.gender + '</span></div>' +
            '<div class="dl-row"><span class="k">Age</span><span class="v">' + pet.age + '</span></div>' +
            '<div class="dl-row"><span class="k">Breed</span><span class="v">' + pet.breed + '</span></div>' +
            '<div class="dl-row"><span class="k">Location</span><span class="v">' + pet.location + '</span></div>' +
            '<div class="dl-row"><span class="k">Compatibility ' + '<span class="compat-flag">' + pet.compatibility + '%</span></span><span class="v">' + pet.temperament + '</span></div>' +
          '</div>' +
          '<div class="detail-actions">' + actionHtml +
            '<a class="btn-outline" href="Browse.html">← Back to Browse</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-about">' +
        '<h2>About ' + pet.name + '</h2>' +
        '<p>' + pet.description + '</p>' +
        '<div class="chips">' + pet.traits.map(function (t) { return '<span class="chip">' + t + '</span>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="detail-about">' +
        '<h2>Care &amp; Needs</h2>' +
        '<ul class="care-list">' + pet.care.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' +
        '<div style="margin-top:16px;">' +
          (adopted
            ? '<p style="font-size:13px;color:var(--green);font-weight:600;">This pet has already found a loving home. Please browse other available pets.</p>'
            : '<a class="btn-solid" style="flex:none;padding:12px 26px;display:inline-block;text-decoration:none;" href="Apply.html?pet=' + pet.id + '">Adopt ' + pet.name + '</a>') +
        '</div>' +
      '</div>';

    document.title = 'PawBangla — ' + pet.name + ' (' + pet.type + ')';
  }

  document.addEventListener('DOMContentLoaded', renderPet);
})(window);