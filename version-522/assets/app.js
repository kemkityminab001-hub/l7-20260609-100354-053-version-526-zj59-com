(function () {
  var doc = document;

  function qs(selector, root) {
    return (root || doc).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setHero(hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        if (timer) {
          window.clearInterval(timer);
          play();
        }
      });
    });

    show(0);
    play();
  }

  function fillSelect(select, cards, attr) {
    if (!select || select.children.length > 1) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attr) || '';
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort().slice(0, 120).forEach(function (value) {
      var option = doc.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function decadeHit(year, decade) {
    var y = parseInt(year || '0', 10);
    if (!decade) {
      return true;
    }
    if (decade === '1980') {
      return y < 1990;
    }
    var start = parseInt(decade, 10);
    return y >= start && y < start + 10;
  }

  function setFilters(form) {
    var section = form.closest('.filter-section') || doc;
    var cards = qsa('[data-movie-card]', section);
    var keyword = qs('[data-filter-keyword]', form);
    var region = qs('[data-filter-region]', form);
    var type = qs('[data-filter-type]', form);
    var decade = qs('[data-filter-decade]', form);
    var empty = qs('[data-filter-empty]', section);

    fillSelect(region, cards, 'data-region');
    fillSelect(type, cards, 'data-type');

    function apply() {
      var q = normalize(keyword && keyword.value);
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var d = decade ? decade.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-keywords'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var hit = (!q || text.indexOf(q) !== -1) &&
          (!r || card.getAttribute('data-region') === r) &&
          (!t || card.getAttribute('data-type') === t) &&
          decadeHit(card.getAttribute('data-year'), d);
        card.hidden = !hit;
        if (hit) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    [keyword, region, type, decade].forEach(function (el) {
      if (el) {
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && keyword) {
      keyword.value = initial;
      apply();
    }
  }

  function setImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-hidden');
      });
    });
  }

  function setMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setBackTop() {
    var button = qs('[data-back-top]');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 420);
    });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  doc.addEventListener('DOMContentLoaded', function () {
    qsa('[data-hero]').forEach(setHero);
    qsa('[data-filter-form]').forEach(setFilters);
    setImages();
    setMobileMenu();
    setBackTop();
  });
})();
