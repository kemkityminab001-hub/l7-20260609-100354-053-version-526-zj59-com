(function(){
  function initMoviePlayer(videoId,buttonId,layerId,mediaUrl){
    var video=document.getElementById(videoId);
    var button=document.getElementById(buttonId);
    var layer=document.getElementById(layerId);
    if(!video||!mediaUrl)return;
    var loaded=false;
    function load(){
      if(loaded)return;
      if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=mediaUrl;}
      else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(mediaUrl);hls.attachMedia(video);}
      else{video.src=mediaUrl;}
      loaded=true;
    }
    function start(){load();if(layer)layer.classList.add('is-hidden');var p=video.play();if(p&&p.catch)p.catch(function(){});}
    if(button)button.addEventListener('click',start);
    if(layer)layer.addEventListener('click',start);
    video.addEventListener('click',function(){if(video.paused)start();});
    video.addEventListener('play',function(){if(layer)layer.classList.add('is-hidden');});
  }
  window.initMoviePlayer=initMoviePlayer;
})();