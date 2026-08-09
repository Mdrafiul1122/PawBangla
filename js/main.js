(function () {
  function $(id) { return document.getElementById(id); }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = $('navToggle');
    var nav = $('mainNav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
      nav.addEventListener('click', function () {
        if (window.innerWidth <= 900) nav.classList.remove('open');
      });
    }

    var years = document.querySelectorAll('.js-year');
    for (var i = 0; i < years.length; i++) {
      years[i].textContent = new Date().getFullYear();
    }
  });
})();