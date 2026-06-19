(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    activate(0);
    start();
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }

    window.addEventListener("scroll", function () {
      button.classList.toggle("visible", window.scrollY > 500);
    });

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  function setupFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    if (!buttons.length || !cards.length) {
      return;
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-kind") || "").toLowerCase();
          var visible = value === "all" || haystack.indexOf(value.toLowerCase()) !== -1;
          card.classList.toggle("hidden-card", !visible);
        });
      });
    });
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }

    var input = page.querySelector("[data-search-input]");
    var button = page.querySelector("[data-search-button]");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".search-card"));
    var empty = page.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input) {
      input.value = initial;
    }

    function applySearch() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var visible = query === "" || text.indexOf(query) !== -1;
        card.classList.toggle("hidden-card", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("hidden-card", visibleCount !== 0);
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        applySearch();
      });
    }

    if (input) {
      input.addEventListener("input", applySearch);
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          applySearch();
        }
      });
    }

    applySearch();
  }

  window.initializePlayer = function (source) {
    var video = document.querySelector(".site-video");
    var overlay = document.querySelector("[data-overlay]");
    var playButton = document.querySelector("[data-play]");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("hidden");
          }
        });
      }
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    video.addEventListener("click", togglePlayback);
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (video.currentTime > 0 && overlay) {
        overlay.classList.remove("hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupBackTop();
    setupFilters();
    setupSearchPage();
  });
})();
