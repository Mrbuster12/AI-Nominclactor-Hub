(function(){
  function ready(fn){ if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function ensureRail(){
    var rail = document.getElementById('vsc-ai-rail');
    if (!rail){
      rail = document.createElement('div');
      rail.id = 'vsc-ai-rail';
      rail.style.position = 'fixed';
      rail.style.top = (document.getElementById('vsc-safety-banner') ? 56 : 12) + 'px';
      rail.style.right = '10px';
      rail.style.bottom = '12px';
      rail.style.width = '56px';
      rail.style.display = 'flex';
      rail.style.flexDirection = 'column';
      rail.style.gap = '8px';
      rail.style.zIndex = 2147483646;
      rail.style.pointerEvents = 'none';
      document.body.appendChild(rail);
    }
    return rail;
  }
  function collectCandidates(){
    var sels = [
      '.ai-toolbar button',
      'button.ai-button',
      'button[data-ai]',
      'button[data-action*="ai"]',
      'button[title*="AI"]',
      'button[id*="ai"]',
      'button[class*="ai"]'
    ];
    var seen = new Set(), list = [];
    sels.forEach(function(s){
      document.querySelectorAll(s).forEach(function(b){
        if (b && b.offsetParent !== null && !seen.has(b)){ seen.add(b); list.push(b); }
      });
    });
    return list;
  }
  function colorClassFor(btn){
    var t = (btn.getAttribute('data-action') || btn.textContent || '').toLowerCase();
    if (t.includes('run') || t.includes('assist') || t.includes('launch')) return 'vsc-ai-primary';
    if (t.includes('draft') || t.includes('note') || t.includes('summary')) return 'vsc-ai-success';
    if (t.includes('analyze') || t.includes('review')) return 'vsc-ai-warning';
    if (t.includes('clear') || t.includes('danger') || t.includes('reset')) return 'vsc-ai-danger';
    return 'vsc-ai-secondary';
  }
  function normalizeIntoRail(){
    var rail = ensureRail();
    collectCandidates().forEach(function(src){
      if (!rail.contains(src)){
        src.classList.add('vsc-ai-btn', colorClassFor(src));
        src.style.pointerEvents = 'auto';
        src.style.margin = '0';
        var txt = (src.textContent||'').trim();
        if (txt && !src.querySelector('span')) {
          src.textContent = '';
          var span = document.createElement('span');
          span.textContent = txt;
          src.appendChild(span);
        }
        rail.appendChild(src);
      }else{
        src.classList.add('vsc-ai-btn', colorClassFor(src));
      }
    });
    var banner = document.getElementById('vsc-safety-banner');
    var topPad = banner ? 56 : 12;
    var r = document.getElementById('vsc-ai-rail');
    if (r && r.style.top !== topPad+'px') r.style.top = topPad+'px';
  }
  function tick(){ try{ normalizeIntoRail(); }catch(_){} }
  ready(function(){
    tick();
    var mo = new MutationObserver(tick);
    mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true});
    window.addEventListener('resize', tick);
  });
})();
