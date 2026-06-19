(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        showSlide(position);
        window.clearInterval(timer);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  function runFilter(input) {
    var value = input.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', value !== '' && haystack.indexOf(value) === -1);
    });
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      runFilter(input);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && filterInputs.length) {
    filterInputs[0].value = query;
    runFilter(filterInputs[0]);
  }
})();
