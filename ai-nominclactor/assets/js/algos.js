(function(w,d){
  if (w.__ALGOS_WIRED__) return;
  w.__ALGOS_WIRED__ = true;

  const bus = (w.AIEngine && w.AIEngine.bus) || {};
  const hasBus = !!(bus && bus.on);

  function safeEmit(evt, payload){
    try{ bus.emit && bus.emit(evt, payload); }catch(e){}
    try{ w.dispatchEvent(new CustomEvent(evt,{detail:payload})); }catch(e){}
  }

  const ctx = (w.GroupRoster && w.GroupRoster.get && w.GroupRoster.get()) || {members:[], venue:{}, sessionKey:''};
  const bio = { cadence:0, pointer:null, keystroke_interval:null };
  try{ hasBus && bus.on('bio:cadence', v=>{ bio.cadence = v&&v.score||0; }); }catch(e){}
  try{ hasBus && bus.on('bio:pointer', v=>{ bio.pointer = v||null; }); }catch(e){}
  try{ hasBus && bus.on('bio:keystroke', v=>{ bio.keystroke_interval = (v&&v.ms)||null; }); }catch(e){}

  let tierX = null;
  try{ hasBus && bus.on('tierx:assignment', v=>{ tierX = v||null; safeEmit('algo:state',{source:'tierx',tierX}); }); }catch(e){}

  function gateCadence(min=0){ return (bio.cadence||0) >= min; }

  // simple in-memory caches to avoid repeated network fetches per click
  let __HW_MAP = null, __HW_INDEX = null;
  async function getHWMap(){
    if (__HW_MAP) return __HW_MAP;
    const res = await fetch('/shared/mappers/homework_map.json');
    __HW_MAP = await res.json();
    return __HW_MAP;
  }
  async function getHWIndex(){
    if (__HW_INDEX) return __HW_INDEX;
    const res = await fetch('/shared/homework/homework-index.json');
    __HW_INDEX = await res.json();
    return __HW_INDEX;
  }

  function mkHandler(code, opts){
    const minCadence = (opts && opts.minCadence) || 0;
    return async function handle(payload){
      const packet = { code, t: Date.now(), ctx, tierX, bio, payload: payload||{} };
      const clientId = (payload && payload.clientId) || null;
      packet.clientId = clientId;

      if (!gateCadence(minCadence)) {
        packet.skipped = true;
        packet.reason = 'cadence_below_threshold';
        return safeEmit('algo:result', packet);
      }
      try {
        const homeworkMap = await getHWMap();
        const homeworkIndex = await getHWIndex();

        // pick domain: prefer tierX.domain, else default
        const domain = (tierX && tierX.domain) || 'depression';
        const hwKeys = (homeworkMap[domain] && homeworkMap[domain].homework_keys) || [];
        const firstKey = hwKeys.length ? hwKeys[0] : null;

        let homeworkUrl = null;
        if (firstKey) {
          const baseKey = firstKey.replace(/\.pdf$/,'');
          homeworkUrl = homeworkIndex[baseKey] || null;
        }

        packet.ok = true;
        if (homeworkUrl) {
          packet.outcome = 'homework';
          packet.homeworkKey = firstKey;
          packet.homeworkUrl = homeworkUrl;
        } else {
          packet.outcome = 'homework-not-found';
        }
      } catch(e) {
        packet.ok = false;
        packet.error = String(e);
      }
      safeEmit('algo:result', packet);
    };
  }

  const ITS001_EDL = mkHandler('ITS-001',{minCadence:0});
  const ITS002_CCES = mkHandler('ITS-002',{minCadence:10});
  const ITS003_SSPE = mkHandler('ITS-003',{minCadence:0});
  const ITS004_RFD  = mkHandler('ITS-004',{minCadence:0});
  const ITS005_SBEP = mkHandler('ITS-005',{minCadence:0});
  const ITS006_IAS  = mkHandler('ITS-006',{minCadence:5});
  const ITS007_RRT  = mkHandler('ITS-007',{minCadence:8});
  const ITS008_CEM  = mkHandler('ITS-008',{minCadence:6});
  const ITS009_CAE  = mkHandler('ITS-009',{minCadence:0});

  function trigger(id, clientId){
    const map = { edl:ITS001_EDL, cces:ITS002_CCES, sspe:ITS003_SSPE, rfd:ITS004_RFD,
                  sbep:ITS005_SBEP, ias:ITS006_IAS, rrt:ITS007_RRT, cem:ITS008_CEM, cae:ITS009_CAE };
    const fn = map[id];
    if (fn) fn({source:'ai:button', id, clientId});
  }

  if (hasBus) {
    try{ bus.on('ai:button', e => trigger((e && e.id) || '', (e && e.clientId) || null)); }catch(e){}
  } else {
    try{ w.addEventListener('ai:button', ev => {
      const d = ev && ev.detail || {};
      trigger(d.id || '', d.clientId || null);
    }, { passive:true }); }catch(e){}
  }

  w.VSCAlgos = { ITS001_EDL, ITS002_CCES, ITS003_SSPE, ITS004_RFD,
                 ITS005_SBEP, ITS006_IAS, ITS007_RRT, ITS008_CEM, ITS009_CAE };
})(window, document);

// -------- VNP Phase 2 bridge for AI Nominclactor hub --------
document.addEventListener('DOMContentLoaded', function () {
  const status = document.getElementById('status');

  // If VNP Phase 2 is present, reflect it in the status panel
  const aiAlgos = window.AI_ALGOS || null;
  if (status && aiAlgos && typeof aiAlgos === 'object') {
    const keys = Object.keys(aiAlgos);
    if (keys.length) {
      const prefix = status.textContent || '';
      status.textContent =
        (prefix ? prefix + '\n\n' : '') +
        'VNP Phase 2 Online:\n- ' + keys.join('\n- ');
    }
  }

  // Create/locate actions row
  let row = document.querySelector('.actions');
  if (!row) {
    row = document.createElement('section');
    row.className = 'actions';
    row.style.cssText = 'display:flex;gap:8px;margin:12px 0;flex-wrap:wrap';
    (document.querySelector('.wrap') || document.body).appendChild(row);
  }

  // Add a dedicated VNP trigger button
  let vnpBtn = document.getElementById('run-vnp-scenario');
  if (!vnpBtn) {
    vnpBtn = document.createElement('button');
    vnpBtn.id = 'run-vnp-scenario';
    vnpBtn.type = 'button';
    vnpBtn.className = 'btn primary';
    vnpBtn.textContent = 'Run VNP Scenario Driver';
    row.appendChild(vnpBtn);
  }

  vnpBtn.addEventListener('click', function () {
    const algos = window.AI_ALGOS || {};
    const scenarioFn =
      algos.vnp_psy_phase3_scenario_driver ||
      algos.VNP_DSM_SPLINTER ||
      null;

    if (!scenarioFn) {
      console.warn('[AI-Hub] VNP Phase 2 algorithms not attached to window.AI_ALGOS');
      if (status) {
        const prefix = status.textContent || '';
        status.textContent =
          (prefix ? prefix + '\n\n' : '') +
          'VNP Phase 2 not available (no scenario driver found).';
      }
      return;
    }

    const payload = {
      source: 'ai-nominclactor-hub',
      at: new Date().toISOString(),
      mode: 'test-harness',
      ctx: {
        page: 'ai-nominclactor',
        intent: 'vnp_phase2_scenario'
      }
    };

    try {
      console.log('[AI-Hub] Invoking VNP Phase 2 scenario driver with payload:', payload);
      scenarioFn(payload);
      if (status) {
        const prefix = status.textContent || '';
        status.textContent =
          (prefix ? prefix + '\n\n' : '') +
          'VNP Phase 2 scenario fired from hub.';
      }
    } catch (e) {
      console.error('[AI-Hub] VNP Phase 2 call failed:', e);
      if (status) {
        const prefix = status.textContent || '';
        status.textContent =
          (prefix ? prefix + '\n\n' : '') +
          'VNP Phase 2 error: ' + String(e);
      }
    }
  });
});

