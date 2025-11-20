(()=>{ if(window.ProjectionEngine) return;
  const repoWrite=(k,v)=>{ try{ VSCRepo?.write?.(k,v); }catch{} };
  function onAI(e){
    if(!e || e.type!=='ai.results') return;
    const asam = e.payload?.asam?.level || '—';
    const need = (e.payload && e.payload.input && e.payload.input.primary_need) || '';
    VSCProjector.cue(`Reviewing intake… ASAM ${asam}${need? ` • ${need}`:''}`);
    const rec={ kind:'ai.results', asam, ts:new Date().toISOString(), input:e.payload?.input||null };
    repoWrite('projection_events', rec);
    ProjectionBus.emit('projection.note', rec);
  }
  function onIntakeReady(e){
    if(!e || e.type!=='intake.ready') return;
    const intent = e.payload?.session?.intent || 'session';
    VSCProjector.cue(`Welcome back — starting your ${intent} onboarding.`);
    const rec={ kind:'intake.ready', intent, ts:new Date().toISOString() };
    repoWrite('projection_events', rec);
    ProjectionBus.emit('projection.note', rec);
  }
  window.ProjectionEngine = {
    init(){
      document.addEventListener('vsc:ai',      ev=> onAI(ev.detail));
      document.addEventListener('vsc:consent',  ev=> onIntakeReady(ev.detail));
      window.BUS?.subscribe?.((m)=>{ if(!m||!m.type) return;
        if(m.type==='ai.results') onAI({type:m.type, payload:m.payload});
        if(m.type==='intake.ready') onIntakeReady({type:m.type, payload:m.payload});
      });
      console.log('[projection] engine listening');
    }
  };
  ProjectionEngine.init();
})();
