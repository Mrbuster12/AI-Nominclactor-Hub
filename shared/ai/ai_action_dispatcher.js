(function(){
  if (window.__AI_ACTION_WIRED__) return;
  window.__AI_ACTION_WIRED__ = true;
  function norm(x){ return (x||'').toString().trim(); }
  function gatherMSE(){
    return {
      mood: norm(document.getElementById('mse_mood')?.value),
      affect: norm(document.getElementById('mse_affect')?.value),
      speech: norm(document.getElementById('mse_speech')?.value),
      thought: norm(document.getElementById('mse_thought')?.value),
      cognition: norm(document.getElementById('mse_cognition')?.value),
      insight: norm(document.getElementById('mse_insight')?.value),
      judgment: norm(document.getElementById('mse_judgment')?.value)
    };
  }
  function gatherIntake(){
    var notes = document.querySelector('#intake_notes, textarea[name="notes"]');
    return { notes: norm(notes && ('value' in notes ? notes.value : notes.textContent)) };
  }
  function gatherBio(){
    var els = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], input[type="text"]'));
    var text = els.map(function(el){
      if (!el) return '';
      if ('value' in el && el.value != null) return String(el.value);
      return String(el.textContent||'');
    }).join('\n').trim();
    return { text: text };
  }
  function gatherTP(){
    try {
      var tier = document.querySelector('[data-care-tier],[data-ctc]')?.getAttribute('data-care-tier') || '';
      return { careTier: norm(tier) };
    } catch(_){ return { careTier: '' }; }
  }
  function buildContext(){
    return {
      source: location.pathname,
      mse: gatherMSE(),
      intake: gatherIntake(),
      bio: gatherBio(),
      tplan: gatherTP()
    };
  }
  function handle(action){
    var ctx = buildContext();
    AI_BUS.send('ai.request', { action: action||'draft', ctx: ctx });
  }
  function wireButtons(){
    var sels = [
      '.ai-toolbar button',
      'button.ai-button',
      'button[data-ai]',
      'button[data-action*="ai"]',
      'button[title*="AI"]',
      'button[id*="ai"]',
      'button[class*="ai"]'
    ];
    var wired = new WeakSet();
    function scan(){
      sels.forEach(function(s){
        document.querySelectorAll(s).forEach(function(b){
          if (!b || wired.has(b)) return;
          var act = (b.getAttribute('data-action') || b.textContent || 'draft').toLowerCase();
          b.addEventListener('click', function(e){ try{ e.preventDefault(); handle(act); }catch(_){}; });
          wired.add(b);
        });
      });
    }
    scan();
    new MutationObserver(function(){ scan(); })
      .observe(document.documentElement, {subtree:true, childList:true, attributes:true});
  }
  if (typeof window.AI_BUS === 'undefined') return;
  wireButtons();
})();
