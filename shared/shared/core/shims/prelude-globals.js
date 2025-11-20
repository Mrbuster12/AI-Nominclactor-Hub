(function(){
  if(!window.PAARE_ENGINE_JS){
    window.PAARE_ENGINE_JS = { score: function(input){ return {P:0,A:0,Att:0,R:0,E:0, raw: input||{}}; } };
    console.log("[prelude] PAARE_ENGINE_JS placeholder ready");
  }
  if(!window.AUTO_PLAN_JS){
    window.AUTO_PLAN_JS = { draft: function(payload){ return { goal:"", objectives:[], methods:[], tasks:[] }; } };
    console.log("[prelude] AUTO_PLAN_JS placeholder ready");
  }
  if(!window.HOMEWORK_ROUTER_JS){
    window.HOMEWORK_ROUTER_JS = { suggest: function(kind){ return []; } };
    console.log("[prelude] HOMEWORK_ROUTER_JS placeholder ready");
  }
})();
