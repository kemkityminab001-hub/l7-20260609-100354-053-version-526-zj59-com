(function(){
  var navToggle=document.querySelector('[data-nav-toggle]');
  var navLinks=document.querySelector('[data-nav-links]');
  if(navToggle&&navLinks){navToggle.addEventListener('click',function(){navLinks.classList.toggle('is-open')})}
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  var dots=[].slice.call(document.querySelectorAll('.hero-dots button'));
  if(slides.length){
    var active=0;
    var show=function(i){slides[active].classList.remove('is-active');if(dots[active])dots[active].classList.remove('is-active');active=(i+slides.length)%slides.length;slides[active].classList.add('is-active');if(dots[active])dots[active].classList.add('is-active')};
    dots.forEach(function(btn,i){btn.addEventListener('click',function(){show(i)})});
    setInterval(function(){show(active+1)},5200);
  }
  document.querySelectorAll('[data-scroll-target]').forEach(function(btn){btn.addEventListener('click',function(){var row=document.querySelector(btn.getAttribute('data-scroll-target'));if(row){row.scrollBy({left:btn.getAttribute('data-dir')==='left'?-420:420,behavior:'smooth'})}})});
  document.querySelectorAll('[data-movie-filter]').forEach(function(box){
    var input=box.querySelector('[data-filter-input]');
    var region=box.querySelector('[data-filter-region]');
    var type=box.querySelector('[data-filter-type]');
    var year=box.querySelector('[data-filter-year]');
    var cards=[].slice.call(box.querySelectorAll('[data-card]'));
    var empty=box.querySelector('[data-empty]');
    var params=new URLSearchParams(location.search);
    if(input&&params.get('q')) input.value=params.get('q');
    var apply=function(){
      var q=(input&&input.value||'').trim().toLowerCase();
      var r=region&&region.value||'';
      var t=type&&type.value||'';
      var y=year&&year.value||'';
      var shown=0;
      cards.forEach(function(card){
        var text=(card.getAttribute('data-title')+' '+card.getAttribute('data-tags')+' '+card.getAttribute('data-genre')).toLowerCase();
        var ok=(!q||text.indexOf(q)>-1)&&(!r||card.getAttribute('data-region')===r)&&(!t||card.getAttribute('data-type')===t)&&(!y||card.getAttribute('data-year')===y);
        card.classList.toggle('hidden-card',!ok);
        if(ok) shown++;
      });
      if(empty) empty.style.display=shown?'none':'block';
    };
    [input,region,type,year].forEach(function(el){if(el){el.addEventListener('input',apply);el.addEventListener('change',apply)}});
    apply();
  });
})();