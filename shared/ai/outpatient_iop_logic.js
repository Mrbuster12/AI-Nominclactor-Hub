(function(){
  if (typeof window==='undefined') return;
  window.AIEngine = window.AIEngine || {};
  AIEngine.bus = AIEngine.bus || { on:function(){}, emit:function(){} };

  var storeKey = 'iop:attendance';
  function load(){ try{ var v = localStorage.getItem(storeKey); return v? JSON.parse(v): { count:0, week:0, track:'day' }; }catch(e){ return { count:0, week:0, track:'day' }; } }
  function save(s){ try{ localStorage.setItem(storeKey, JSON.stringify(s)); }catch(e){} }
  function weekNumber(d){ var t = new Date(d||Date.now()); var onejan=new Date(t.getFullYear(),0,1); return Math.ceil((((t - onejan) / 86400000) + onejan.getDay()+1)/7); }

  function attendanceBump(meta){
    var s = load(); var wk = weekNumber();
    if (s.week !== wk){ s.week = wk; s.count = 0; }
    s.count += 1;
    if (meta && meta.track) s.track = meta.track;
    save(s);

    var cadence = { sessionsPerWeek: Math.max(3, s.count), reviewInDays: 7 };
    var path = 'IOP-'+(s.track||'day');
    var objectives = ['Maintain 3+ IOP group sessions per week'];
    var interventions = ['Offer day/evening switch to maintain attendance'];

    var payload = { iop: s, hub:{origin:location.pathname} };
    if (window.VSCBridge && VSCBridge.publish){
      VSCBridge.publish('ctc_update', Object.assign({ ai:{ projection:{ path:path, cadence:cadence, objectives:objectives, interventions:interventions } } }, payload), { module:'outpatient:iop' });
    }
    if (AIEngine.bus && AIEngine.bus.emit) AIEngine.bus.emit('iop:update', payload);
    console.log('[IOP] update', s);
  }

  if (AIEngine.bus && AIEngine.bus.on){
    try {
      AIEngine.bus.on('group:attendance', attendanceBump);
      AIEngine.bus.on('session:end', function(meta){ attendanceBump(meta||{}); });
    } catch(e){}
  }

  window.IOP = window.IOP || {};
  IOP.bump = attendanceBump;
  IOP.setTrack = function(track){ var s=load(); s.track = track==='evening'?'evening':'day'; save(s); console.log('[IOP] track', s.track); };

  console.log('[outpatient_iop_logic] ready');
})();
