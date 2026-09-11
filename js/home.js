(function (global) {
  function $(id) { return document.getElementById(id); }

  function makeCard(p) {
    var card = document.createElement('div');
    card.className = 'p-card fade-in';

    var photo = document.createElement('div');
    photo.className = 'p-photo';
    photo.style.backgroundImage = "url('" + p.img + "')";

    var tag = document.createElement('span');
    tag.className = 'type-tag';
    tag.textContent = p.type;
    photo.appendChild(tag);

    if (p.status && p.status !== 'available') {
      var statusOverlay = document.createElement('div');
      statusOverlay.className = 'status-tag';
      var statusSpan = document.createElement('span');
      statusSpan.textContent = p.status === 'adopted' ? 'Adopted' : p.status;
      statusOverlay.appendChild(statusSpan);
      photo.appendChild(statusOverlay);
    }

    card.appendChild(photo);

    var info = document.createElement('div');
    info.className = 'p-info';

    var nameRow = document.createElement('div');
    nameRow.className = 'p-name-row';
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
    breed.className = 'p-breed';
    breed.textContent = p.breed + ' \u00B7 ' + p.location;
    info.appendChild(breed);

    if (p.traits && p.traits.length) {
      var traitsWrap = document.createElement('div');
      traitsWrap.className = 'p-traits';
      var maxTraits = Math.min(p.traits.length, 3);
      for (var i = 0; i < maxTraits; i++) {
        var trait = document.createElement('span');
        trait.className = 'p-trait';
        trait.textContent = p.traits[i];
        traitsWrap.appendChild(trait);
      }
      info.appendChild(traitsWrap);
    }

    var actions = document.createElement('div');
    actions.className = 'btn-row';
    var view = document.createElement('a');
    view.className = 'btn-outline';
    view.href = 'pet-details.html?id=' + p.id;
    view.textContent = 'View Profile';
    var apply = document.createElement('a');
    apply.className = 'btn-solid';
    apply.href = 'Apply.html?pet=' + p.id;
    apply.textContent = 'Adopt';
    actions.appendChild(view);
    actions.appendChild(apply);
    info.appendChild(actions);
    card.appendChild(info);
    return card;
  }

  function init() {
    var grid = $('featuredGrid');
    if (grid) {
      var pets = (typeof global.getPets === 'function' ? global.getPets() : global.PETS || []).filter(function (p) {
        return (p.status || 'available') === 'available';
      }).slice(0, 3);
      grid.innerHTML = '';
      if (!pets.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-mid);font-size:14px;padding:40px 0;">' +
          'No pets are available for adoption right now. Check back soon!</p>';
      } else {
        pets.forEach(function (p) { grid.appendChild(makeCard(p)); });
      }
    }

    requestAnimationFrame(function () {
      observeFadeIns();
    });
  }

  function observeFadeIns() {
    var els = document.querySelectorAll('.fade-in');
    if (!els.length) return;

    if (!('IntersectionObserver' in global)) {
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add('visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 10) header.classList.add('header-shadow');
        else header.classList.remove('header-shadow');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });

  document.addEventListener('DOMContentLoaded', init);
})(window);
