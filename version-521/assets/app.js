(function() {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilterPanels() {
    selectAll('[data-filter-panel]').forEach(function(panel) {
      var input = panel.querySelector('[data-search-input]');
      var chips = selectAll('[data-filter-chip]', panel);
      var scope = document.querySelector(panel.getAttribute('data-filter-scope')) || document;
      var cards = selectAll('[data-movie-card]', scope);
      var active = '';

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function(card) {
          var search = (card.getAttribute('data-search') || '').toLowerCase();
          var tag = card.getAttribute('data-tag') || '';
          var matchKeyword = !keyword || search.indexOf(keyword) !== -1;
          var matchTag = !active || tag.indexOf(active) !== -1 || search.indexOf(active.toLowerCase()) !== -1;
          card.style.display = matchKeyword && matchTag ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          active = chip.getAttribute('data-filter-chip') || '';
          chips.forEach(function(item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayer() {
    var panel = document.querySelector('.player-panel[data-stream]');
    if (!panel) {
      return;
    }
    var video = panel.querySelector('video');
    var cover = panel.querySelector('.player-cover');
    var streamUrl = panel.getAttribute('data-stream');
    var loading = false;
    if (!video || !streamUrl) {
      return;
    }

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            try {
              hls.destroy();
            } catch (error) {}
            video.src = streamUrl;
          }
        });
      } else {
        video.src = streamUrl;
        video.play().catch(function() {});
      }
    }

    function beginPlayback() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== streamUrl) {
          video.src = streamUrl;
        }
        video.play().catch(function() {});
        return;
      }
      if (window.Hls) {
        attachWithHls();
        return;
      }
      if (loading) {
        return;
      }
      loading = true;
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = function() {
        loading = false;
        attachWithHls();
      };
      script.onerror = function() {
        loading = false;
        video.src = streamUrl;
        video.play().catch(function() {});
      };
      document.head.appendChild(script);
    }

    if (cover) {
      cover.addEventListener('click', beginPlayback);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        beginPlayback();
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function() {
      button.classList.toggle('is-visible', window.scrollY > 480);
    });
    button.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupHero();
    setupFilterPanels();
    setupPlayer();
    setupBackTop();
  });
})();
