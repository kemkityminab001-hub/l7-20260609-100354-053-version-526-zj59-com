(function () {
  var data = window.SEARCH_DATA || [];
  var form = document.querySelector('[data-search-page-form]');
  var results = document.querySelector('[data-search-results]');
  var defaults = document.querySelector('[data-search-default]');
  if (!form || !results) {
    return;
  }

  var input = form.querySelector('input[name="q"]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card compact" href="' + item.url + '">'
      + '<div class="movie-cover">'
      + '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
      + '<div class="cover-shade"></div>'
      + '<span class="cover-category">' + escapeHtml(item.category) + '</span>'
      + '<span class="cover-play">▶</span>'
      + '</div>'
      + '<div class="movie-info">'
      + '<h2>' + escapeHtml(item.title) + '</h2>'
      + '<p>' + escapeHtml(item.summary) + '</p>'
      + '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>'
      + '<div class="tag-row">' + tags + '</div>'
      + '</div>'
      + '</a>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function render(query) {
    var q = normalize(query);
    if (!q) {
      results.innerHTML = '';
      if (defaults) {
        defaults.style.display = '';
      }
      return;
    }
    var matched = data.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.region,
        item.year,
        item.type,
        item.genre,
        (item.tags || []).join(' '),
        item.summary,
        item.category
      ].join(' '));
      return haystack.indexOf(q) >= 0;
    }).slice(0, 80);
    if (defaults) {
      defaults.style.display = 'none';
    }
    if (!matched.length) {
      results.innerHTML = '<section class="section-block"><h2 class="search-title">没有找到相关影片</h2></section>';
      return;
    }
    results.innerHTML = '<section class="section-block"><h2 class="search-title">搜索结果</h2><div class="movie-grid full-grid">'
      + matched.map(card).join('')
      + '</div></section>';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState(null, '', url);
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(initial);
})();
