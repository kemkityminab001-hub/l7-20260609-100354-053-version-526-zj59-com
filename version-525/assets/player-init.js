async function loadHlsClass() {
  if (window.Hls) {
    return window.Hls;
  }
  try {
    const module = await import('./hls-player.js');
    return module.H || module.default || null;
  } catch (error) {
    console.warn('HLS module could not be loaded.', error);
    return null;
  }
}

function setStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

async function initializeMoviePlayer() {
  const video = document.querySelector('video[data-stream]');
  const button = document.querySelector('[data-player-start]');
  const status = document.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  const source = video.dataset.stream || '';
  let initialized = false;
  let initializing = false;

  async function attachSource() {
    if (initialized || initializing) {
      return;
    }
    initializing = true;

    if (!source) {
      setStatus(status, '当前影片暂未配置播放源。');
      initializing = false;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      initialized = true;
      setStatus(status, '已使用浏览器原生 HLS 播放能力加载播放源。');
      return;
    }

    const Hls = await loadHlsClass();
    if (Hls && typeof Hls.isSupported === 'function' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      if (Hls.Events && Hls.Events.ERROR) {
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus(status, '播放器遇到网络或媒体错误，请刷新后重试。');
          }
        });
      }
      initialized = true;
      setStatus(status, '已通过本地 HLS 模块加载播放源。');
      return;
    }

    video.src = source;
    initialized = true;
    setStatus(status, '浏览器不支持 HLS 模块时，将尝试直接播放源地址。');
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });

  if (button) {
    button.addEventListener('click', async function () {
      await attachSource();
      try {
        await video.play();
        button.classList.add('is-hidden');
      } catch (error) {
        setStatus(status, '浏览器阻止了自动播放，请再次点击播放器播放。');
      }
    });
  }

  await attachSource();
}

initializeMoviePlayer();
