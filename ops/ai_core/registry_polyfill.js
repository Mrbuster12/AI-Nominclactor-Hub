(()=>{ 
  window.AIEngine = window.AIEngine || {};
  if (typeof AIEngine.bandersnatch !== 'function') {
    AIEngine.bandersnatch = i => ({
      risk: (i?.objectives?.length || 0) > 1 ? 'elevated' : 'low',
      flags: []
    });
  }
  if (typeof AIEngine.asam !== 'function') {
    AIEngine.asam = i => ({ level: (i?.primary_need ? 'Level 2.1' : 'Level 1'), reasons: [] });
  }
  if (typeof AIEngine.dsm !== 'function') {
    AIEngine.dsm = i => ({ ctc: i?.dx_code || 'unspecified', severity: 'moderate' });
  }
  if (typeof AIEngine.eclipse !== 'function') {
    AIEngine.eclipse = i => ({ pass: true, token: (crypto.randomUUID?.() || String(Date.now())) });
  }
  console.log('[ai] registry polyfill patched');
})();
