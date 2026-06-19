(function () {
  var configNode = document.getElementById('player-config');
  var video = document.querySelector('.player-video');
  var cover = document.querySelector('.player-cover');
  if (!configNode || !video || !cover) {
    return;
  }

  var config = JSON.parse(configNode.textContent || '{}');
  var hls = null;
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(config.source);
      hls.attachMedia(video);
    } else {
      video.src = config.source;
    }
  }

  function begin() {
    attach();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  cover.addEventListener('click', begin);
  video.addEventListener('click', function () {
    if (!attached) {
      begin();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
