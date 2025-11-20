(function(){
  if (window.__TP_AUTOFILL_WIRED__) return; window.__TP_AUTOFILL_WIRED__=true;

  const $ = sel => document.querySelector(sel);
  const goals = $('#tpGoals'), objs = $('#tpObjectives'), ivs = $('#tpInterventions');
  async function loadMap(){
    try { return await fetch('/shared/mappers/homework_map.json').then(r=>r.json()); }
    catch(e){ console.warn('map load failed', e); return {}; }
  }
  function addList(el, arr){
    if(!el || !arr) return;
    el.innerHTML = '';
    const ul = document.createElement('ul');
    arr.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
    el.appendChild(ul);
  }
  async function onSpecifiers(specs){
    const map = await loadMap();
    const merged = { goals:[], objectives:[], interventions:[], homework_keys:[] };
    (specs||[]).forEach(k=>{
      const m = map[k]; if(!m) return;
      ['goals','objectives','interventions','homework_keys'].forEach(f=>{
        if(m[f]) merged[f].push(...m[f]);
      });
    });
    merged.goals = [...new Set(merged.goals)];
    merged.objectives = [...new Set(merged.objectives)];
    merged.interventions = [...new Set(merged.interventions)];
    addList(goals, merged.goals);
    addList(objs, merged.objectives);
    addList(ivs, merged.interventions);

    const hwList = document.querySelector('#tpHomeworkLibrary');
    if(hwList && merged.homework_keys.length){
      const links = Array.from(hwList.querySelectorAll('a'));
      links.forEach(a=>{
        a.parentElement.style.display = merged.homework_keys.some(k => a.href.endsWith(k)) ? '' : 'none';
      });
    }
    console.log('TP autofill applied from specifiers:', specs);
  }

  window.addEventListener('ctc_update', function(e){
    if(e.__sanitized){ onSpecifiers((e.detail&&e.detail.specifiers)||[]); }
  }, true);
})();
