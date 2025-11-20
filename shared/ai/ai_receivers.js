(function(){
  function pick(id){ const el=document.getElementById(id); return el ? (('value'in el)?el.value:el.textContent||'').trim() : ''; }
  function makeMseSummary(){
    const fields = {
      mood: pick('mse_mood'),
      affect: pick('mse_affect'),
      speech: pick('mse_speech'),
      thought: pick('mse_thought'),
      perception: pick('mse_perception'),
      cognition: pick('mse_cognition'),
      insight: pick('mse_insight'),
      judgment: pick('mse_judgment')
    };
    const lines = [];
    if (fields.mood) lines.push('Mood: ' + fields.mood);
    if (fields.affect) lines.push('Affect: ' + fields.affect);
    if (fields.speech) lines.push('Speech: ' + fields.speech);
    if (fields.thought) lines.push('Thought Process: ' + fields.thought);
    if (fields.perception) lines.push('Perception: ' + fields.perception);
    if (fields.cognition) lines.push('Cognition: ' + fields.cognition);
    if (fields.insight || fields.judgment) lines.push('Insight/Judgment: ' + (fields.insight||'') + (fields.judgment?(' / '+fields.judgment):''));
    return lines.join('\n');
  }

  function sendBioInject(text){
    const detail = { summary: text, ts: Date.now() };
    try { new BroadcastChannel('vsc_bridge_channel').postMessage({ type: 'bio.inject', detail }); } catch(_){}
    try { localStorage.setItem('bio.inject', JSON.stringify(detail)+'::'+Math.random()); } catch(_){}
    window.dispatchEvent(new CustomEvent('bio.inject', { detail }));
    console.log('AI→BIO injected', detail);
  }

  window.addEventListener('ai.action', ev => {
    const d = ev && ev.detail || {};
    if (!d.type) return;
    if (d.type === 'draft.summary') {
      const txt = makeMseSummary();
      if (txt) sendBioInject(txt);
    }
    if (d.type === 'review.output') {
      console.log('AI review requested from', d.payload && d.payload.source);
    }
  });
})();
