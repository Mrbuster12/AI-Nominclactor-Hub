(function () {
  function el(tag, attrs, kids){ const n=document.createElement(tag); if(attrs){Object.keys(attrs).forEach(k=>{ if(k==='style'&&typeof attrs[k]==='object'){Object.assign(n.style,attrs[k])} else if(k==='className'){n.className=attrs[k]} else {n.setAttribute(k,attrs[k])}})} (kids||[]).forEach(k=>n.appendChild(typeof k==='string'?document.createTextNode(k):k)); return n; }
  function btnStyle(bg){ return {background:bg,color:'#e5e7eb',border:'1px solid #374151',borderRadius:'8px',padding:'8px 12px',cursor:'pointer'}; }
  function saveState(s){ try{localStorage.setItem('ai.nom.state',JSON.stringify(s))}catch{} }
  function loadState(){ try{return JSON.parse(localStorage.getItem('ai.nom.state')||'{}')}catch{return {}} }

  const qs = [
    { id:'presenting', text:'In one sentence, what brings you in today?' },
    { id:'risk', text:'Any immediate safety concerns (yes/no)?' },
    { id:'substances', text:'Any current substance use? If yes, what and how often?' },
    { id:'supports', text:'Name one support person you can contact.' },
    { id:'goal', text:'What’s one goal you want to work on this week?' }
  ];

  function render(container){
    const state = loadState(); if(!state.answers) state.answers={}; if(typeof state.step!=='number') state.step=0;

    const wrap = el('section',{style:{maxWidth:'960px',margin:'16px auto',padding:'16px',border:'1px solid #1f2937',borderRadius:'12px',background:'#0b1220',color:'#e5e7eb',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif'}},[]);
    const h = el('h2',null,['AI Nominclactor — Pre-Assessment']);
    const status = el('div',{id:'status',style:{margin:'8px 0',color:'#9ca3af'}},['Loading…']);
    const qLabel = el('div',{style:{fontSize:'18px',margin:'8px 0'}},['']);
    const input = el('textarea',{rows:'4',style:{width:'100%',borderRadius:'8px',border:'1px solid #4b5563',padding:'8px',background:'#0f172a',color:'#e5e7eb'}},[]);
    const controls = el('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'12px'}},[]);
    const backBtn = el('button',{type:'button',style:btnStyle('#374151')},['Back']);
    const nextBtn = el('button',{type:'button',style:btnStyle('#2563eb')},['Next']);
    const copyBtn = el('button',{type:'button',style:btnStyle('#10b981')},['Copy Summary']);
    const resetBtn= el('button',{type:'button',style:btnStyle('#b91c1c')},['Reset']);
    const ttsBtn  = el('button',{type:'button',style:btnStyle('#6b21a8')},['🔊 Read']);
    const micBtn  = el('button',{type:'button',style:btnStyle('#0ea5e9')},['🎙️ Mic']);
    const sendBtn = el('button',{type:'button',style:btnStyle('#22c55e')},['Send to Doc Engine']);
    controls.append(backBtn,nextBtn,copyBtn,resetBtn,ttsBtn,micBtn,sendBtn);

    const transcript = el('pre',{style:{whiteSpace:'pre-wrap',background:'#0f172a',padding:'8px',borderRadius:'8px',border:'1px solid #253046',marginTop:'12px',maxHeight:'260px',overflow:'auto'}},[]);
    wrap.append(h,status,qLabel,input,controls,transcript);
    container.appendChild(wrap);

    function renderTranscript(){
      const lines=[];
      lines.push('AI Nominclactor — Pre-Assessment Summary');
      lines.push('Timestamp: '+new Date().toISOString()); lines.push('');
      qs.forEach(q=>{ const a=(state.answers[q.id]||'').trim(); if(a){ lines.push('• '+q.text+'\n  '+a)} });
      transcript.textContent = lines.join('\n');
      return lines.join('\n');
    }

    function setQuestion(){
      const step = Math.max(0, Math.min(state.step, qs.length-1));
      qLabel.textContent = qs[step].text;
      input.value = state.answers[qs[step].id] || '';
      backBtn.disabled = (step===0);
      nextBtn.textContent = (step===qs.length-1) ? 'Finish' : 'Next';
      renderTranscript(); saveState(state);
      status.textContent = 'Step '+(step+1)+' of '+qs.length;
      const host = document.getElementById('status'); if(host) host.textContent = status.textContent;
      speak(qs[step].text);
    }

    backBtn.addEventListener('click',()=>{ if(state.step>0){ state.step--; setQuestion(); saveState(state);} });
    nextBtn.addEventListener('click',()=>{
      const q = qs[state.step]; state.answers[q.id]=(input.value||'').trim();
      if(state.step<qs.length-1){ state.step++; setQuestion(); }
      else { renderTranscript(); status.textContent='Intake complete. Use "Send to Doc Engine" to dispatch.'; }
      saveState(state);
    });
    copyBtn.addEventListener('click',async()=>{
      try{ await navigator.clipboard.writeText(renderTranscript()); status.textContent='Summary copied to clipboard.'; }catch{ status.textContent='Copy failed.'; }
    });
    resetBtn.addEventListener('click',()=>{ state.step=0; state.answers={}; saveState(state); setQuestion(); transcript.textContent='Reset complete.'; status.textContent='Form reset.'; });

    // --- TTS ---
    function speak(text){
      try{
        if(!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utt=new SpeechSynthesisUtterance(String(text||'').trim());
        utt.rate=1.0; utt.pitch=1.0;
        window.speechSynthesis.speak(utt);
      }catch{}
    }
    ttsBtn.addEventListener('click',()=>speak(qLabel.textContent||''));

    // --- Mic / ASR (Chrome-based browsers over https or localhost) ---
    let recognizing=false, recognizer;
    try{
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(SR){
        recognizer = new SR();
        recognizer.lang='en-US'; recognizer.interimResults=true; recognizer.continuous=false;
        recognizer.onresult=(ev)=>{ let t=''; for(let i=ev.resultIndex;i<ev.results.length;i++){ t+=ev.results[i][0].transcript; } input.value=(input.value+' '+t).trim(); };
        recognizer.onend=()=>{ recognizing=false; micBtn.textContent='🎙️ Mic'; };
      } else {
        micBtn.disabled=true; micBtn.title='Speech recognition not supported in this browser';
      }
    }catch{ micBtn.disabled=true; }
    micBtn.addEventListener('click',()=>{
      if(!recognizer){ status.textContent='Mic not supported on this browser.'; return; }
      if(!recognizing){ recognizing=true; micBtn.textContent='🛑 Stop'; try{ recognizer.start(); }catch{ recognizing=false; micBtn.textContent='🎙️ Mic'; } }
      else { try{ recognizer.stop(); }catch{} }
    });

    // --- Doc Engine hook: postMessage + localStorage queue ---
    function buildSummaryText(){ return renderTranscript(); }
    function enqueueLocal(text){
      try{ const key='vsc.note.queue'; const q=JSON.parse(localStorage.getItem(key)||'[]'); q.push({ts:Date.now(),source:'ai_nominclactor',intent:'pre_assessment_summary',text}); localStorage.setItem(key,JSON.stringify(q)); }catch{}
    }
    function postNote(text){
      try{ window.postMessage({type:'VSC_NOTE_EVENT',intent:'pre_assessment_summary',source:'ai_nominclactor',text,ts:Date.now()}, window.location.origin); }catch{}
    }
    sendBtn.addEventListener('click',()=>{ const text=buildSummaryText(); enqueueLocal(text); postNote(text); status.textContent='Summary dispatched to documentation engine.'; });

    setQuestion();
  }

  document.addEventListener('DOMContentLoaded',function(){ const host=document.querySelector('.ai-nominclactor-host')||document.body; render(host); });
})();
/* ---- Mic integration: final-results only, no duplicates, PTT control ---- */
(function(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recog = do{var r=new SpeechRecognition(); r.interimResults=false; r.continuous=false; r.lang=(navigator.language||"en-US"); r};
  recog.lang = 'en-US';
  recog.interimResults = true;           // we’ll ignore interims in UI
  recog.continuous = false;              // end each utterance cleanly

  // Find or create UI bits
  const transcriptEl = document.getElementById('transcript') || (function(){
    const ta = document.createElement('textarea');
    ta.id = 'transcript';
    ta.rows = 6;
    ta.style.width = '100%';
    document.body.appendChild(ta);
    return ta;
  })();

  // Try to hook an existing “Mic” button; if not, add one.
  let micBtn = document.getElementById('mic-btn');
  if (!micBtn) {
    micBtn = Array.from(document.querySelectorAll('button'))
      .find(b => /mic/i.test(b.textContent || ''));
  }
  if (!micBtn) {
    micBtn = document.createElement('button');
    micBtn.id = 'mic-btn';
    micBtn.textContent = '🎙️ Mic';
    micBtn.style.margin = '8px 8px 0 0';
    document.body.prepend(micBtn);
  }

  // Push-to-talk behaviour: click to start, click again to stop.
  let active = false;
  function setActive(on){
    active = !!on;
    micBtn.disabled = false;
    micBtn.textContent = active ? '⏹️ Stop' : '🎙️ Mic';
  }

  // Deduplicate final segments in case of odd event batching.
  const seenFinals = new Set();
  function hash(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h + s.charCodeAt(i))|0 } return String(h) }

  recog.addEventListener("result", (event)=>{let out="";for(let i=event.resultIndex;i<event.results.length;i++){const res=event.results[i];if(res.isFinal){out+=res[0].transcript}}if(out){const t=document.getElementById("transcript");if(t){t.value+=(t.value?"\n":"")+out.trim()}}});

  // Keep UI sane and avoid runaway repeats
  recog.addEventListener('end', () => {
    setActive(false);
  });
  recog.addEventListener('speechend', () => {
    try { recog.stop(); } catch (_) {}
  });
  recog.addEventListener('error', (e) => {
    console.warn('[Mic Error]', e && e.error);
    setActive(false);
  });

  micBtn.addEventListener('click', () => {
    if (!active) {
      try { recog.start(); setActive(true); }
      catch (_) { setActive(false); }
    } else {
      try { recog.stop(); } catch (_) {}
    }
  });
})();
(function(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recog = new SpeechRecognition();
  recog.lang = 'en-US';
  recog.interimResults = true;
  recog.continuous = false;

  const transcriptEl = document.getElementById('transcript') || (function(){
    const ta = document.createElement('textarea');
    ta.id = 'transcript';
    ta.rows = 6;
    ta.style.width = '100%';
    ta.style.marginTop = '8px';
    document.body.appendChild(ta);
    return ta;
  })();

  let micBtn = document.getElementById('mic-btn');
  if (!micBtn) {
    micBtn = Array.from(document.querySelectorAll('button'))
      .find(b => /mic/i.test((b.textContent||'')));
  }
  if (!micBtn) {
    micBtn = document.createElement('button');
    micBtn.id = 'mic-btn';
    micBtn.textContent = '🎙️ Mic';
    micBtn.style.margin = '8px 8px 0 0';
    document.body.prepend(micBtn);
  }

  let active = false;
  function setActive(on){
    active = !!on;
    micBtn.disabled = false;
    micBtn.textContent = active ? '⏹️ Stop' : '🎙️ Mic';
  }

  const seenFinals = new Set();
  function hash(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h + s.charCodeAt(i))|0 } return String(h) }

  recog.addEventListener('result', (event) => {
    let finalChunk = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal && res[0] && res[0].transcript) {
        finalChunk += res[0].transcript.trim() + ' ';
      }
    }
    finalChunk = finalChunk.trim();
    if (finalChunk) {
      const h = hash(finalChunk);
      if (seenFinals.has(h)) return;
      seenFinals.add(h);
      transcriptEl.value += (transcriptEl.value ? '\n' : '') + finalChunk;
      try {
        const evt = new Event('input', { bubbles: true });
        transcriptEl.dispatchEvent(evt);
      } catch(_){}
    }
  });

  recog.addEventListener('end', () => { setActive(false); });
  recog.addEventListener('speechend', () => { try { recog.stop(); } catch(_){ } });
  recog.addEventListener('error', () => { setActive(false); });

  micBtn.addEventListener('click', () => {
    if (!active) { try { recog.start(); setActive(true); } catch(_){ setActive(false); } }
    else { try { recog.stop(); } catch(_){ } }
  });
})();
window.addEventListener('message', (e) => {
  if (e && e.data) console.log('[Message]', e.data);
});

(function(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  const recog = (function(){ try { return new SR(); } catch(_){ return null } })();
  if (!recog) return;
  let active=false, silenceTimer=null, lastResultAt=0, ptt=false;
  const micBtn = document.getElementById('mic-btn') || Array.from(document.querySelectorAll('button')).find(b=>/mic/i.test(b.textContent||'')) || (function(){ const b=document.createElement('button'); b.id='mic-btn'; b.textContent='🎙️ Mic'; b.style.margin='8px'; document.body.prepend(b); return b; })();
  const transcriptEl = document.getElementById('transcript') || (function(){ const ta=document.createElement('textarea'); ta.id='transcript'; ta.rows=6; ta.style.width='100%'; ta.style.marginTop='8px'; document.body.appendChild(ta); return ta; })();
  recog.lang='en-US'; recog.interimResults=true; recog.continuous=false;
  const seen = new Set(); function h(s){ let x=0; for(let i=0;i<s.length;i++){ x=((x<<5)-x+s.charCodeAt(i))|0 } return String(x) }
  function setActive(on){ active=!!on; micBtn.textContent = active?'⏹️ Stop':'🎙️ Mic'; try{ window.dispatchEvent(new CustomEvent('vsc-mic-active',{detail:active})) }catch(_){ } }
  function armSilence(){
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(()=>{ try{ recog.stop() }catch(_){ } }, 1750);
  }
  recog.addEventListener('result', ev=>{
    lastResultAt = Date.now();
    armSilence();
    let out='';
    for (let i=ev.resultIndex;i<ev.results.length;i++){
      const r=ev.results[i];
      if (r.isFinal && r[0] && r[0].transcript) out += r[0].transcript.trim()+' ';
    }
    out = out.trim();
    if (out){
      const k=h(out); if (seen.has(k)) return; seen.add(k);
      if (!window.VSC_TTS || !window.VSC_TTS._hold) transcriptEl.value += (transcriptEl.value?'\n':'') + out;
      try { transcriptEl.dispatchEvent(new Event('input',{bubbles:true})) }catch(_){}
    }
  });
  recog.addEventListener('end', ()=>{ setActive(false) });
  recog.addEventListener('speechend', ()=>{ try{ recog.stop() }catch(_){ } });
  recog.addEventListener('error', ()=>{ setActive(false) });
  micBtn.addEventListener('click', ()=>{ if (!active){ try{ recog.start(); setActive(true) }catch(_){ setActive(false) } } else { try{ recog.stop() }catch(_){ } } });
  document.addEventListener('keydown', e=>{ if (e.code==='Space' && !ptt){ ptt=true; if(!active){ try{ recog.start(); setActive(true) }catch(_){ } } e.preventDefault() } });
  document.addEventListener('keyup', e=>{ if (e.code==='Space' && ptt){ ptt=false; try{ recog.stop() }catch(_){ } e.preventDefault() } });
  const origSpeak = window.VSC_TTS && window.VSC_TTS.speak;
  if (origSpeak){
    window.VSC_TTS._hold = false;
    window.VSC_TTS.speak = function(t){ window.VSC_TTS._hold = true; try{ origSpeak(t) } finally { setTimeout(()=>{ window.VSC_TTS._hold=false }, 250)} };
  }
})();
