(function(){
  function html(){
    return `
    <link rel="stylesheet" href="assets/css/fourcol_form.css">
    <div id="ctc-fourcol">
      <section>
        <h2>Safety</h2>
        <label><input type="checkbox" name="si_current"> Suicidal thoughts (current)</label>
        <label><input type="checkbox" name="self_harm_current"> Self-harm (current)</label>
        <label><input type="checkbox" name="dv_risk"> Domestic violence risk</label>
        <label><input type="checkbox" name="weapons_access"> Access to weapons</label>
        <label>Panic frequency
          <select name="panic_freq">
            <option value="0">None</option>
            <option value="1">Monthly</option>
            <option value="2">Weekly</option>
            <option value="3">Daily</option>
          </select>
        </label>
      </section>
      <section>
        <h2>Mood & Function</h2>
        <label><input type="checkbox" name="anhedonia"> Loss of interest (anhedonia)</label>
        <label>Social avoidance
          <select name="social_avoidance">
            <option value="0">None</option><option value="1">Mild</option><option value="2">Moderate</option><option value="3">Marked</option>
          </select>
        </label>
        <label>Motivation low
          <select name="motivation_low">
            <option value="0">None</option><option value="1">Mild</option><option value="2">Moderate</option><option value="3">Marked</option>
          </select>
        </label>
        <label>Sleep fragmentation
          <select name="sleep_fragmentation">
            <option value="0">None</option><option value="1">Mild</option><option value="2">Moderate</option><option value="3">Severe</option>
          </select>
        </label>
        <label><input type="checkbox" name="values_in_treatment"> Values aligned with treatment</label>
      </section>
      <section>
        <h2>Demographics</h2>
        <label>Sex
          <select name="sex">
            <option value="">Select</option>
            <option>female</option>
            <option>male</option>
            <option>nonbinary</option>
            <option>other</option>
          </select>
        </label>
        <label>Date of birth <input type="date" name="dob"></label>
        <label>Age (years) <input type="number" name="age_years" min="0" max="120" step="1"></label>
        <label>Context (comma separated) <input type="text" name="bsi_context" placeholder="sleep-deprived, withdrawal-phase"></label>
      </section>
      <section>
        <h2>BSI Specifiers</h2>
        <label>Severity
          <select name="bsi_severity">
            <option>mild</option><option>moderate</option><option>marked</option><option>acute-flair</option>
          </select>
        </label>
        <label>Duration
          <select name="bsi_duration">
            <option>brief</option><option>sustained</option><option>recurrent</option><option>remitting</option>
          </select>
        </label>
        <label>Onset
          <select name="bsi_onset">
            <option>sudden</option><option>gradual</option><option>post-event</option><option>developmental</option>
          </select>
        </label>
      </section>
    </div>
    <div class="actions">
      <button id="export-json" class="btn secondary" type="button">Export Summary JSON</button>
      <button id="reset-session" class="btn danger" type="button">Reset Interview</button>
      <button id="mic" class="btn secondary" type="button">🎙️ Mic</button>
    </div>
    <div class="summary hidden" id="ctc-summary"></div>`;
  }
  function val(form, k){ const v = form.querySelector(`[name="${k}"]`); return v ? (v.type==='checkbox' ? v.checked : v.value) : ''; }
  function num(form,k){ const v = parseInt(val(form,k),10); return isNaN(v)?0:v; }
  function ctx(form){ const raw = val(form,'bsi_context')||''; return raw.split(',').map(s=>s.trim()).filter(Boolean); }
  function ageFromDob(dob){
    if(!dob) return null;
    try{ const d=new Date(dob), now=new Date(); let a=now.getFullYear()-d.getFullYear(); const m=now.getMonth()-d.getMonth(); if(m<0||(m===0&&now.getDate()<d.getDate())) a--; return Math.max(0,a); }catch(_){ return null; }
  }
  function collect(detailForm){
    const dob = val(detailForm,'dob');
    let age = num(detailForm,'age_years');
    const aFromDob = ageFromDob(dob);
    if(!age && aFromDob!=null) age = aFromDob;

    const signals = {
      si_current: !!val(detailForm,'si_current'),
      self_harm_current: !!val(detailForm,'self_harm_current'),
      si_past30d: false,
      dv_risk: !!val(detailForm,'dv_risk'),
      weapons_access: !!val(detailForm,'weapons_access'),
      panic_freq: num(detailForm,'panic_freq'),
      anhedonia: !!val(detailForm,'anhedonia'),
      withdrawal_symptoms: false,
      social_avoidance: num(detailForm,'social_avoidance'),
      motivation_low: num(detailForm,'motivation_low'),
      sleep_fragmentation: num(detailForm,'sleep_fragmentation'),
      values_in_treatment: !!val(detailForm,'values_in_treatment')
    };
    const bsi = {
      severity: val(detailForm,'bsi_severity')||'moderate',
      duration: val(detailForm,'bsi_duration')||'sustained',
      onset: val(detailForm,'bsi_onset')||'gradual',
      context: ctx(detailForm),
      alliance: 'neutral'
    };
    const specifiers = {
      sex: val(detailForm,'sex')||'',
      age_years: age||null
    };
    const risk = {
      suicide_current: signals.si_current===true,
      dv_risk: signals.dv_risk===true,
      weapons_access: signals.weapons_access===true
    };
    return { signals, bsi, specifiers, risk };
  }
  function emit(payload){
    const detail = Object.assign({ source:'pre_assessment', timestamp:new Date().toISOString() }, payload);
    try{ window.dispatchEvent(new CustomEvent('ctc_update', { detail })); }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('ctc_risk_update', { detail })); }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('ctc_specifiers_update', { detail })); }catch(_){}
    try{ if(window.CTC_BUS && typeof CTC_BUS.emit==='function'){ CTC_BUS.emit(detail); } }catch(_){}
    const s = document.getElementById('ctc-summary');
    if(s){ s.classList.remove('hidden'); s.textContent = JSON.stringify(detail, null, 2); }
  }
  function build(){
    const root = document.querySelector('main, #preassess-root, body') || document.body;
    const wrap = document.createElement('div');
    wrap.innerHTML = html();
    root.appendChild(wrap);
    const handler = ()=>emit(collect(document));
    document.querySelectorAll('#ctc-fourcol input, #ctc-fourcol select').forEach(el=>{
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    });
    document.getElementById('export-json').addEventListener('click', ()=>{
      try{
        const blob = new Blob([JSON.stringify(collect(document), null, 2)], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'preassessment_summary.json';
        a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
      }catch(_){}
    });
    document.getElementById('reset-session').addEventListener('click', ()=>{
      try{
        document.querySelectorAll('#ctc-fourcol input[type=checkbox]').forEach(i=>i.checked=false);
        document.querySelectorAll('#ctc-fourcol input[type=date], #ctc-fourcol input[type=number], #ctc-fourcol input[type=text]').forEach(i=>i.value='');
        document.querySelectorAll('#ctc-fourcol select[name=panic_freq], #ctc-fourcol select[name=social_avoidance], #ctc-fourcol select[name=sleep_fragmentation], #ctc-fourcol select[name=motivation_low]').forEach(s=>s.value='0');
        const map = { bsi_severity:'moderate', bsi_duration:'sustained', bsi_onset:'gradual' };
        Object.keys(map).forEach(k=>{ const el=document.querySelector(`[name="${k}"]`); if(el) el.value = map[k]; });
        const sm = document.getElementById('ctc-summary'); if(sm){ sm.textContent=''; sm.classList.add('hidden'); }
        handler();
      }catch(_){}
    });
    document.getElementById('mic').addEventListener('click', ()=>{ handler(); });
    handler();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
