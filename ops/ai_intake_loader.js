(()=>{ 
  if(!window.VSCRepo){
    window.VSCRepo = {
      write(key, obj){
        const k = "vsc:repo:"+key;
        const a = JSON.parse(localStorage.getItem(k)||"[]");
        a.push({...obj, _saved:new Date().toISOString()});
        localStorage.setItem(k, JSON.stringify(a));
        try{
          const bc = new BroadcastChannel("preassessment-repo");
          bc.postMessage({ type:"repo.write", payload:{ key, obj }});
        }catch(_){}
        console.log("[VSCRepo.write]", key, obj);
      }
    };
  }
  const add = (src)=>{ const s=document.createElement("script"); s.src=src; document.head.appendChild(s); };
  add("/ops/ai_intake/bridge_bus.js");
  add("/ops/ai_intake/capability_probe.js");
  add("/ops/ai_intake/tier_classifier.js");
  add("/ops/ai_intake/permission_manager.js");
  add("/ops/ai_intake/consent_orchestrator.js");
  console.log("[AI Intake Loader] queued");
})();
