(function(){
  if (!('speechSynthesis' in window)) return;
  let voices = [];
  let speaking = false;
  const ui = document.createElement('div');
  ui.style.cssText = 'max-width:960px;margin:8px auto;padding:8px;border:1px solid #374151;border-radius:10px;background:#0b1220;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
  ui.innerHTML = '<strong style="font-size:14px;">Voice</strong><select id="vsc-voice" style="background:#111827;color:#e5e7eb;border:1px solid #4b5563;border-radius:8px;padding:6px;"></select><label style="font-size:12px;opacity:.8;">Rate <input id="vsc-rate" type="range" min="0.7" max="1.2" step="0.01" value="0.95"></label><label style="font-size:12px;opacity:.8;">Pitch <input id="vsc-pitch" type="range" min="0.8" max="1.2" step="0.01" value="1.02"></label><button id="vsc-read" style="padding:6px 10px;border:1px solid #4b5563;border-radius:8px;background:#1f2937;color:#e5e7eb;">🔊 Read</button><button id="vsc-stop" style="padding:6px 10px;border:1px solid #4b5563;border-radius:8px;background:#1f2937;color:#e5e7eb;">⏹️ Stop</button>';
  document.body.prepend(ui);
  const sel = ui.querySelector('#vsc-voice');
  const rateEl = ui.querySelector('#vsc-rate');
  const pitchEl = ui.querySelector('#vsc-pitch');
  const readBtn = ui.querySelector('#vsc-read');
  const stopBtn = ui.querySelector('#vsc-stop');
  function loadVoices(){
    voices = window.speechSynthesis.getVoices();
    sel.innerHTML = '';
    voices.forEach((v,i)=>{
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = v.name + (v.lang?(' – '+v.lang):'');
      sel.appendChild(o);
    });
    const pref = ['Samantha','Alex','Victoria','Google US English','Google UK English Female','Daniel'];
    const idx = voices.findIndex(v=>pref.some(p=>v.name.includes(p)));
    sel.value = String(idx >= 0 ? idx : 0);
  }
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
  function splitIntoSentences(t){
    return (t||'').replace(/\s+/g,' ').trim().split(/(?<=[\.\!\?])\s+(?=[A-Z0-9])/).filter(Boolean);
  }
  function stopAll(){ speaking = false; window.speechSynthesis.cancel(); }
  function speak(t){
    stopAll();
    const parts = splitIntoSentences(t);
    speaking = true;
    const voice = voices[Number(sel.value)] || null;
    const r = Number(rateEl.value)||1, p = Number(pitchEl.value)||1;
    let i = 0;
    function next(){
      if (!speaking || i>=parts.length){ speaking=false; return; }
      const u = new SpeechSynthesisUtterance(parts[i++]);
      if (voice) u.voice = voice;
      u.rate = r; u.pitch = p; u.volume = 1;
      u.onend = ()=>{ if (speaking) next(); };
      try { window.speechSynthesis.speak(u); } catch(_){ speaking=false; }
    }
    next();
  }
  readBtn.addEventListener('click',()=>{
    const tx = document.getElementById('transcript');
    let text = '';
    if (tx && tx.value) text = tx.value.trim();
    if (!text) {
      const q = document.querySelector('#question, .question, h1, h2');
      text = q ? (q.textContent||'').trim() : (document.title||'');
    }
    if (text) speak(text);
  });
  stopBtn.addEventListener('click', stopAll);
  window.addEventListener('beforeunload', stopAll);
  window.VSC_TTS = { speak, stopAll };
})();
