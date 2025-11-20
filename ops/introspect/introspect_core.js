(()=>{ if(window.Introspect){console.log('[introspect] already installed');return;}
const repoWrite=(k,o)=>{try{VSCRepo?.write?.(k,o);}catch{}};
const CRISIS=['suicide','overdose','kill myself','hurt myself','homicide','gun','knife'];
const sentiment=t=>{t=(t||'').toLowerCase();const pos=['better','hope','progress','good','improve'];const neg=['worse','bad','hopeless','anxious','depressed','relapse'];let s=0;for(const w of pos)if(t.includes(w))s++;for(const w of neg)if(t.includes(w))s--;return s>0?'positive':s<0?'negative':'neutral';};
const topTerms=t=>{const words=(t||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>3);const freq={};for(const w of words)freq[w]=(freq[w]||0)+1;return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,c])=>({k,c}));};
const riskFlags=t=>{t=(t||'').toLowerCase();const hits=CRISIS.filter(w=>t.includes(w));return hits.length?[{type:'crisis',terms:hits}]:[];};
const IntrospectBus={emit(type,payload={}){try{document.dispatchEvent(new CustomEvent('vsc:introspect',{detail:{type,payload,ts:Date.now()}}));}catch{}}};
window.Introspect={run(seed={}){const text=[seed.context,...(seed.objectives||[]),seed.primary_need,seed.dx_code].filter(Boolean).join(' | ');const out={sentiment:sentiment(text),flags:riskFlags(text),top_terms:topTerms(text),ts:new Date().toISOString()};repoWrite('introspect_result',out);IntrospectBus.emit('introspect.result',out);return out;}};
console.log('[introspect] core installed');
})();
