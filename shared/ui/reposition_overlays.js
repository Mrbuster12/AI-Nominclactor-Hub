(function(){
  function move(el){
    if(!el) return;
    el.style.top='12px';
    el.style.right='12px';
    el.style.bottom='auto';
    el.style.left='auto';
    el.style.transform='';
    el.style.margin='0';
    el.style.zIndex=99990;
  }
  function scan(){
    var nodes=[].concat(
      Array.from(document.querySelectorAll('#consentBanner,#bpirlToggle,.debug-panel,.consent-pill,.other-bottom-panels'))
    );
    document.querySelectorAll('*').forEach(function(el){
      try{
        var s=getComputedStyle(el);
        if (s.position==='fixed'
            && (parseInt(s.bottom||'0')>=0)
            && (parseInt(s.right||'0')>=0)
            && el.id!=='__bucky_hud__'
            && el.id!=='buckyHud') {
          nodes.push(el);
        }
      }catch(e){}
    });
    nodes.forEach(move);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
