(function () {
  const mobileButton = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 420);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("active", current === slideIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("active", current === slideIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 6200);
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get("q") || "";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(query, category) {
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const empty = document.querySelector("[data-empty-state]");
    const q = normalize(query);
    let visible = 0;
    cards.forEach(function (card) {
      const text = normalize(card.getAttribute("data-search"));
      const cardCategory = card.getAttribute("data-category") || "";
      const matchText = !q || text.indexOf(q) !== -1;
      const matchCategory = !category || category === "all" || cardCategory === category;
      const show = matchText && matchCategory;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  const libraryInput = document.querySelector("[data-library-input]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter-button]"));
  let activeCategory = "all";

  function runLibraryFilter() {
    const query = libraryInput ? libraryInput.value : "";
    filterCards(query, activeCategory);
  }

  if (libraryInput) {
    if (queryFromUrl) {
      libraryInput.value = queryFromUrl;
    }
    libraryInput.addEventListener("input", runLibraryFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
      });
      button.classList.add("active");
      activeCategory = button.getAttribute("data-filter-button") || "all";
      runLibraryFilter();
    });
  });

  if (queryFromUrl && document.querySelector("[data-card-grid]")) {
    filterCards(queryFromUrl, activeCategory);
  }

  Array.from(document.querySelectorAll("[data-site-search]")).forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[type='search']");
      const value = input ? input.value.trim() : "";
      if (document.querySelector("[data-library-input]") && value) {
        event.preventDefault();
        if (libraryInput) {
          libraryInput.value = value;
        }
        filterCards(value, activeCategory);
      }
    });
  });

  function createHls(video, source) {
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        const promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
      return hls;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return null;
    }
    video.src = source;
    return null;
  }

  Array.from(document.querySelectorAll("[data-player-shell]")).forEach(function (shell) {
    const video = shell.querySelector("[data-video-player]");
    const overlay = shell.querySelector("[data-play-button]");
    if (!video || !overlay) {
      return;
    }
    const source = video.getAttribute("data-source") || video.getAttribute("src");
    let loaded = false;
    let hls = null;

    function start() {
      if (!source) {
        return;
      }
      overlay.classList.add("hidden");
      if (!loaded) {
        hls = createHls(video, source);
        loaded = true;
      }
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("play", function () {
      overlay.classList.add("hidden");
    });
    video.addEventListener("error", function () {
      overlay.classList.remove("hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
