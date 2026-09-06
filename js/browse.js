(function (global) {
  var PETS = (global.getPets ? global.getPets() : (global.PETS || []));

  function $(id) { return document.getElementById(id); }
  function qs(n) { var p = new URLSearchParams(window.location.search); return p.get(n); }

  function getFavs() {
    try { return JSON.parse(localStorage.getItem('paw_favorites') || '[]'); } catch (e) { return []; }
  }
  function saveFavs(list) { localStorage.setItem('paw_favorites', JSON.stringify(list)); }
  function isFav(id) { return getFavs().indexOf(id) !== -1; }
  function toggleFav(id, btn) {
    var favs = getFavs();
    var i = favs.indexOf(id);
    if (i === -1) { favs.push(id); } else { favs.splice(i, 1); }
    saveFavs(favs);
    if (btn) { btn.classList.toggle('on', i === -1); btn.textContent = i === -1 ? '♥' : '♡'; }
    var fb = $('favBadge'); if (fb) fb.textContent = favs.length;
  }

  function statusLabel(p) {
    if (p.status === 'available') return '';
    return p.status.charAt(0).toUpperCase() + p.status.slice(1);
  }

  function makeCard(p) {
    var card = document.createElement('div');
    card.className = 'pet-card';

    var photo = document.createElement('div');
    photo.className = 'pet-photo';
    photo.style.backgroundImage = "url('" + p.img + "')";

    var tag = document.createElement('span');
    tag.className = 'type-tag';
    tag.textContent = p.type;
    photo.appendChild(tag);

    if (p.status !== 'available') {
      var st = document.createElement('div');
      st.className = 'status-tag';
      var stSpan = document.createElement('span');
      stSpan.textContent = statusLabel(p);
      st.appendChild(stSpan);
      photo.appendChild(st);
    }

    var favBtn = document.createElement('button');
    favBtn.className = 'fav-btn' + (isFav(p.id) ? ' on' : '');
    favBtn.type = 'button';
    favBtn.setAttribute('aria-label', isFav(p.id) ? 'Remove ' + p.name + ' from favorites' : 'Add ' + p.name + ' to favorites');
    favBtn.textContent = isFav(p.id) ? '♥' : '♡';
    favBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFav(p.id, favBtn);
      favBtn.setAttribute('aria-label', isFav(p.id) ? 'Remove ' + p.name + ' from favorites' : 'Add ' + p.name + ' to favorites');
    });
    photo.appendChild(favBtn);
    card.appendChild(photo);

    var info = document.createElement('div');
    info.className = 'pet-info';

    var nameRow = document.createElement('div');
    nameRow.className = 'pet-name-row';
    var name = document.createElement('span');
    name.className = 'name';
    name.textContent = p.name;
    var age = document.createElement('span');
    age.className = 'age';
    age.textContent = p.age;
    nameRow.appendChild(name);
    nameRow.appendChild(age);
    info.appendChild(nameRow);

    var breed = document.createElement('div');
    breed.className = 'pet-breed';
    breed.textContent = p.breed + ' · ' + p.location;
    info.appendChild(breed);

    var compatRow = document.createElement('div');
    compatRow.className = 'compat-row';
    var cl = document.createElement('span');
    cl.textContent = 'Compatibility Score';
    var cs = document.createElement('span');
    cs.className = 'compat-score ' + (p.compatibility >= 90 ? 'high' : 'mid');
    cs.textContent = p.compatibility + '%';
    compatRow.appendChild(cl);
    compatRow.appendChild(cs);
    info.appendChild(compatRow);

    var bar = document.createElement('div');
    bar.className = 'progress-bar';
    var fill = document.createElement('div');
    fill.className = 'progress-fill ' + (p.compatibility >= 90 ? 'high' : 'mid');
    fill.style.width = p.compatibility + '%';
    bar.appendChild(fill);
    info.appendChild(bar);

    var actions = document.createElement('div');
    actions.className = 'pet-actions';

    var view = document.createElement('a');
    view.className = 'btn-outline';
    view.href = 'pet-details.html?id=' + p.id;
    view.textContent = 'View Details';
    actions.appendChild(view);

    var apply = document.createElement('a');
    apply.className = 'btn-solid';
    if (p.status === 'available') {
      apply.href = 'Apply.html?pet=' + p.id;
      apply.textContent = 'Apply';
    } else {
      apply.setAttribute('aria-disabled', 'true');
      apply.classList.add('disabled');
      apply.textContent = (p.status === 'adopted') ? 'Adopted' : 'Apply';
    }
    actions.appendChild(apply);

    info.appendChild(actions);
    card.appendChild(info);
    return card;
  }

  function renderPets(list) {
    var grid = $('petGrid');
    var count = $('resultsCount');
    if (!grid) return;

    grid.innerHTML = '';
    if (!list.length) {
      var none = document.createElement('div');
      none.className = 'no-results';
      none.textContent = PETS.length
        ? 'No pets match your filters. Try adjusting your search.'
        : 'No pets are available for adoption right now. Check back soon!';
      grid.appendChild(none);
    } else {
      list.forEach(function (p) { grid.appendChild(makeCard(p)); });
    }
    if (count) {
      count.textContent = list.length + (list.length === 1 ? ' pet listed' : ' pets listed');
    }
  }

  function applyFilters() {
    var q = ($('searchInput').value || '').toLowerCase().trim();
    var type = $('typeFilter').value;
    var loc = $('locFilter').value;
    var compat = parseInt($('compatFilter').value, 10) || 0;

    var list = PETS.filter(function (p) {
      var matchQ = !q ||
        (p.name + ' ' + p.breed + ' ' + p.location + ' ' + p.district).toLowerCase().indexOf(q) !== -1;
      var matchType = !type || p.type === type;
      var matchLoc = !loc || p.district === loc;
      var matchCompat = p.compatibility >= compat;
      return matchQ && matchType && matchLoc && matchCompat;
    });
    renderPets(list);
  }

  function init() {
    var q = qs('q');
    var type = qs('type');
    var loc = qs('location');
    var compat = qs('compatibility');

    if (q) $('searchInput').value = q;
    if (type) {
      var cap = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      $('typeFilter').value = cap;
    }
    if (loc) $('locFilter').value = loc;
    if (compat) $('compatFilter').value = compat;

    $('searchInput').addEventListener('input', applyFilters);
    $('typeFilter').addEventListener('change', applyFilters);
    $('locFilter').addEventListener('change', applyFilters);
    $('compatFilter').addEventListener('change', applyFilters);

    var findBtn = $('findPetBtn');
    if (findBtn) {
      findBtn.addEventListener('click', function () {
        var f = $('filters');
        if (f) f.scrollIntoView({ behavior: 'smooth' });
      });
    }

    applyFilters();

    updateBadges();
  }

  function updateBadges() {
    var apps = 0;
    var favs = 0;
    try {
      apps = JSON.parse(localStorage.getItem('paw_applications') || '[]').length;
      favs = JSON.parse(localStorage.getItem('paw_favorites') || '[]').length;
    } catch (e) {}
    var ab = $('appBadge'); if (ab) ab.textContent = apps;
    var fb = $('favBadge'); if (fb) fb.textContent = favs;
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);