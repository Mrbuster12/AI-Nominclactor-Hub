(async function(){
  const elLib   = document.querySelector('#tpHomeworkLibrary');
  const elAssign= document.querySelector('#tpAssignments');
  if (!elLib && !elAssign) return;

  function specs(){
    const d = window._lastCTC || {};
    return Array.isArray(d.specifiers) ? d.specifiers : [];
  }

  async function j(url){
    try { const r = await fetch(url,{cache:'no-store'}); if(!r.ok) throw 0; return await r.json(); }
    catch(e){ return []; }
  }

  const [psych, rc] = await Promise.all([
    j('/psychosocial/homework/homework_manifest.json'),
    j('/recovery-coach/manifests/homework_manifest.json')
  ]);
  const manifest = [].concat(psych||[], rc||[]).filter(Boolean);

  function render(){
    const s = specs();
    const items = manifest.filter(x => x && s.includes(x.specifier));

    if (elLib){
      elLib.innerHTML = items.length
        ? items.map(x => `<li><a href="${x.url}" target="_blank" rel="noopener">${x.title}</a></li>`).join('')
        : '<li>No matching homework yet</li>';
    }

    if (elAssign){
      const goals = [];
      const objectives = [];
      const interventions = [];

      if (s.includes('depression')) {
        goals.push('Improve mood via behavioral activation');
        objectives.push('Track and increase valued activities 3x/week');
        interventions.push('CBT: Behavioral Activation');
      }
      if (s.includes('suicidal')) {
        goals.push('Enhance safety and crisis coping');
        objectives.push('Complete collaborative safety plan and means-restriction');
        interventions.push('DBT: Safety Planning');
      }

      elAssign.textContent = [goals.join('; '), objectives.join('; '), interventions.join('; ')].filter(Boolean).join(' | ');
    }
  }

  render();
  window.addEventListener('ctc_update', e => { if (e.__sanitized) render(); }, true);
})();
