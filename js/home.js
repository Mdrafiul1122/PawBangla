(function (global) {
  function $(id) { return document.getElementById(id); }

  function makeCard(p) {
    var card = document.createElement('div');
    card.className = 'p-card';

    var photo = document.createElement('div');
    photo.className = 'p-photo';
    photo.style.backgroundImage = "url('" + p.img + "')";
    var tag = document.createElement('span');
    tag.className = 'type-tag';
    tag.textContent = p.type;
    photo.appendChild(tag);
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
    breed.textContent = p.breed + ' · ' + p.location;
    info.appendChild(breed);

    var actions = document.createElement('div');
    actions.className = 'btn-row';
    var view = document.createElement('a');
    view.className = 'btn-outline';
    view.href = 'pet-details.html?id=' + p.id;
    view.textContent = 'View Details';
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
    if (!grid) return;
    var pets = (typeof global.getPets === 'function' ? global.getPets() : global.PETS || []).filter(function (p) {
      return (p.status || 'available') === 'available';
    }).slice(0, 4);
    grid.innerHTML = '';
    if (!pets.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;color:var(--text-mid);font-size:13px;">' +
        'No pets are available for adoption right now. Check back soon!</p>';
      return;
    }
    pets.forEach(function (p) { grid.appendChild(makeCard(p)); });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);