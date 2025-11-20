
(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function clickOne(selectors){
    for(var i=0;i<selectors.length;i++){
      var el = document.querySelector(selectors[i]);
      if(el){ el.click(); return true; }
    }
    return false;
  }
  function handlers(){
    return {
      'draft': function(){
        var tried = clickOne(['button[data-ai="draft"]','button[data-action*="draft"]','button.ai-draft','button#ai-draft','.ai-toolbar button']);
        if(!tried) console.log('ai.action draft received (no matching button found)');
      },
      'review': function(){
        var tried = clickOne(['button[data-ai="review"]','button[data-action*="review"]','button.ai-review','button#ai-review','.ai-toolbar button']);
        if(!tried) console.log('ai.action review received (no matching button found)');
      },
      'clear': function(){
        var tried = clickOne(['button[data-ai="clear"]','button[data-action*="clear"]','button.ai-clear','button#ai-clear']);
        if(!tried) console.log('ai.action clear received (no matching button found)');
      }
    };
  }
  function onAction(msg){
    try{
      var act = (msg && msg.action || '').toLowerCase();
      var h = handlers()[act];
      if(typeof h === 'function') h();
    }catch(e){ console.warn('ai.action handler error', e); }
  }
  ready(function(){
    if(window.AIBus && typeof window.AIBus.on === 'function'){
      window.AIBus.on(onAction);
    }else{
      var iv = setInterval(function(){
        if(window.AIBus && typeof window.AIBus.on === 'function'){ clearInterval(iv); window.AIBus.on(onAction); }
      }, 200);
      setTimeout(function(){ clearInterval(iv); }, 5000);
    }
  });
})();
