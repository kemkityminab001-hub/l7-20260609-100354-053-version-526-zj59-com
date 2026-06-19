(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = player.getAttribute('data-url');
    var attached = false;
    var hls = null;

    function attachStream() {
      if (attached || !video || !url) {
        return;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
    }

    function beginPlay() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });

    var startButtons = Array.prototype.slice.call(document.querySelectorAll('[data-start-video]'));
    startButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        beginPlay();
      });
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
