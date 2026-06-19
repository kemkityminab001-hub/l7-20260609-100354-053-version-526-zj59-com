(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        start();
      });
    });
    start();
  }

  var filterPage = document.querySelector('[data-filter-page]');
  if (filterPage) {
    var input = filterPage.querySelector('[data-filter-input]');
    var year = filterPage.querySelector('[data-filter-year]');
    var region = filterPage.querySelector('[data-filter-region]');
    var reset = filterPage.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(filterPage.querySelectorAll('[data-card]'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) >= 0;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchesRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesYear && matchesRegion));
      });
    }

    [input, year, region].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        applyFilter();
      });
    }
  }
})();
