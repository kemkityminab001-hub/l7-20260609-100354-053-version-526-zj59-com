(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function markMissingImages() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG' && target.classList.contains('poster-img')) {
        target.classList.add('is-missing');
      }
    }, true);
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });

    show(0);
    play();
  }

  function initCatalogFilters() {
    var grid = document.querySelector('[data-catalog-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var search = document.getElementById('catalogSearch');
    var year = document.getElementById('yearFilter');
    var type = document.getElementById('typeFilter');
    var region = document.getElementById('regionFilter');
    var count = document.querySelector('[data-visible-count]');

    function apply() {
      var query = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
          ok = false;
        }
        if (selectedType && normalize(card.dataset.type) !== selectedType) {
          ok = false;
        }
        if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
          ok = false;
        }
        card.classList.toggle('is-hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [search, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function createSearchCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="movie-card__cover" href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '  <img class="poster-img" src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '  <span class="movie-card__play">播放</span>',
      '</a>',
      '<div class="movie-card__body">',
      '  <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '  <p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
      '  <p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
      '  <div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    var form = document.querySelector('[data-search-form]');
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = form ? form.querySelector('input[name="q"]') : null;
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render() {
      var current = normalize(input && input.value);
      var data = window.MOVIE_SEARCH_DATA;
      var filtered = data.filter(function (item) {
        if (!current) {
          return true;
        }
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          item.oneLine,
          item.tags
        ].join(' '));
        return haystack.indexOf(current) !== -1;
      }).slice(0, 120);

      results.innerHTML = '';
      filtered.forEach(function (item) {
        results.appendChild(createSearchCard(item));
      });
      if (count) {
        count.textContent = String(filtered.length);
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var nextQuery = input ? input.value.trim() : '';
        var url = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
        window.history.replaceState({}, '', url);
        render();
      });
    }
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  markMissingImages();
  initMobileMenu();
  initHero();
  initCatalogFilters();
  initSearchPage();
})();
