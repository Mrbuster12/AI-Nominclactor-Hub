(function(){
  if (typeof window === 'undefined') return;
  window.AIEngine = window.AIEngine || {};
  AIEngine.algorithms = AIEngine.algorithms || {};

  var names = ['aslt','dsil','male','nips','rcfe','rrle'];
  for (var i=0; i<names.length; i++) { AIEngine.algorithms[names[i]] = true; }

  if (!AIEngine.bus) {
    AIEngine.bus = (function(){
      var h = {};
      return {
        on: function(t,fn){ (h[t]=h[t]||[]).push(fn); },
        emit: function(t,p){
          var arr = h[t] || [];
          for (var i=0;i<arr.length;i++) { try { arr[i](p); } catch(e){} }
        }
      };
    })();
  }

  try { console.log('[alg_init] ready'); } catch(e){}
})();
