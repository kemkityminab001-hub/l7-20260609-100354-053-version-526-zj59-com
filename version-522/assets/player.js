(function () {
  function bindPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    if (!video || !overlay) {
      return;
    }
    var source = video.getAttribute('data-hls');
    var ready = false;
    var hls = null;

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function start() {
      overlay.classList.add('is-hidden');
      attach();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
  });
})();
