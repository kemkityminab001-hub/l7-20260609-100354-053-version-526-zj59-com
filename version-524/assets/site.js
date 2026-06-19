(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    if (slides.length < 2) {
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-form]").forEach(function (panel) {
      var textInput = panel.querySelector("[data-filter-text]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(
        grid.querySelectorAll(".movie-card"),
      );

      function apply() {
        var keyword = normalize(textInput && textInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        cards.forEach(function (card) {
          var haystack = normalize(
            [
              card.getAttribute("data-title"),
              card.getAttribute("data-region"),
              card.getAttribute("data-genre"),
              card.getAttribute("data-tags"),
            ].join(" "),
          );
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear =
            !year || normalize(card.getAttribute("data-year")) === year;
          var matchType =
            !type || normalize(card.getAttribute("data-type")) === type;
          card.classList.toggle(
            "is-filter-hidden",
            !(matchKeyword && matchYear && matchType),
          );
        });
      }

      [textInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupSearchPage() {
    var resultBox = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var form = document.querySelector("[data-search-form]");
    var typeSelect = document.querySelector("[data-search-type]");
    var yearSelect = document.querySelector("[data-search-year]");
    var data = window.movieSearchData || [];
    if (!resultBox || !input || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    Array.from(
      new Set(
        data
          .map(function (item) {
            return item.type;
          })
          .filter(Boolean),
      ),
    )
      .sort()
      .forEach(function (type) {
        var option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });

    Array.from(
      new Set(
        data
          .map(function (item) {
            return item.year;
          })
          .filter(Boolean),
      ),
    )
      .sort()
      .reverse()
      .slice(0, 30)
      .forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });

    function card(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' +
          item.path +
          '" aria-label="观看 ' +
          escapeHtml(item.title) +
          '">',
        '<img src="' +
          item.image +
          '" alt="' +
          escapeHtml(item.title) +
          '" loading="lazy">',
        '<span class="play-hover">▶</span>',
        '<span class="card-badge">' + escapeHtml(item.type) + "</span>",
        "</a>",
        '<div class="movie-card-body">',
        '<h3><a href="' +
          item.path +
          '">' +
          escapeHtml(item.title) +
          "</a></h3>",
        '<p class="movie-meta">' +
          escapeHtml(item.year) +
          " · " +
          escapeHtml(item.region) +
          "</p>",
        '<p class="movie-desc">' + escapeHtml(item.oneLine) + "</p>",
        '<div class="tag-row"><span>' +
          escapeHtml(item.genre) +
          "</span></div>",
        "</div>",
        "</article>",
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"]/g, function (match) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
        }[match];
      });
    }

    function render() {
      var keyword = normalize(input.value);
      var type = normalize(typeSelect.value);
      var year = normalize(yearSelect.value);
      var items = data
        .filter(function (item) {
          var text = normalize(
            [
              item.title,
              item.region,
              item.genre,
              item.tags,
              item.oneLine,
              item.year,
            ].join(" "),
          );
          return (
            (!keyword || text.indexOf(keyword) !== -1) &&
            (!type || normalize(item.type) === type) &&
            (!year || normalize(item.year) === year)
          );
        })
        .slice(0, 120);
      resultBox.innerHTML = items.map(card).join("");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var params = new URLSearchParams(window.location.search);
        if (input.value.trim()) {
          params.set("q", input.value.trim());
        } else {
          params.delete("q");
        }
        history.replaceState(
          null,
          "",
          window.location.pathname +
            (params.toString() ? "?" + params.toString() : ""),
        );
        render();
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
