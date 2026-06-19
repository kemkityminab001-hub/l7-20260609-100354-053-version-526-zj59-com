(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scope = form.closest("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var keyword = form.querySelector("[data-filter-keyword]");
      var year = form.querySelector("[data-filter-year]");
      var type = form.querySelector("[data-filter-type]");
      var category = form.querySelector("[data-filter-category]");
      var count = form.querySelector("[data-filter-count]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyValue = normalize(keyword && keyword.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.textContent
          ].join(" "));
          var matched = true;
          if (keyValue && haystack.indexOf(keyValue) === -1) {
            matched = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            matched = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            matched = false;
          }
          if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "显示 " + visible + " / " + cards.length + " 部作品";
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    var root = document.querySelector("[data-player]");
    if (!root || !source) {
      return;
    }
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var hlsInstance = null;
    var attached = false;

    function attachSource() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        });
      } else {
        video.src = source;
        video.load();
      }
    }

    function begin() {
      attachSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
