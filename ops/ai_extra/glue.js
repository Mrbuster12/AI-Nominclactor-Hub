(()=>{ // listens for assessment.seed, computes, emits, persists
  if(!window.BUS){
    const subs=[]; window.BUS={
      subscribe:f=>{ if(typeof f==="function") subs.push(f) },
      emit:(t,p={},m={})=>{
        const msg={type:t,payload:p,meta:{...m,ts:Date.now(),src:"intake"}};
        subs.forEach(fn=>{ try{ fn(msg) }catch(_){} });
        try{ window.dispatchEvent(new CustomEvent("BUS",{detail:msg})) }catch(_){}
        console.log("[bus:emit]", t, msg); return msg;
      }
    };
  }
  if(!window.VSCRepo){
    window.VSCRepo = {
      write: (k,o) => {
        const key = `vsc:repo:${k}`;
        const a = JSON.parse(localStorage.getItem(key)||"[]");
        a.push({...o,_saved:new Date().toISOString()});
        localStorage.setItem(key, JSON.stringify(a));
        console.log("[VSCRepo.write]", k, o);
      }
    };
  }
  BUS.subscribe(msg=>{
    if(!msg || msg.type!=="assessment.seed") return;
    const seed = msg.payload||{};
    const asil  = (window.ASIL  && ASIL.compute)  ? ASIL.compute(seed)  : null;
    const sscrl = (window.SSCRL && SSCRL.score)   ? SSCRL.score(seed)   : null;
    if(asil){  BUS.emit("ai.asil",  asil);  VSCRepo.write("asil_result",  asil); }
    if(sscrl){ BUS.emit("ai.sscrl", sscrl); VSCRepo.write("sscrl_result", sscrl); }
    if(asil || sscrl){ BUS.emit("ai.results.merge", { asil, sscrl }); }
  });
  console.log("[asil+sscrl] glue active");
})();
