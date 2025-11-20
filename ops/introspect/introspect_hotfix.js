(()=>{ if(!window.Introspect){console.warn('Introspect missing');return;}
const repoWrite=(k,o)=>{ try{ VSCRepo?.write?.(k,o); }catch{} };
const crisis=['suicide','overdose','kill myself','hurt myself','homicide','gun','knife'];
const sentiment=t=>{ t=(t||'').toLowerCase(); const pos=['better','hope','progress','good','improve']; const neg=['worse','bad','hopeless','anxious','depressed','relapse']; let s=0; pos.forEach(w=>{if(t.includes(w))s++}); neg.forEach(w=>{if(t.includes(w))s--}); return s>0?'positive':s<0?'negative':'neutral'; };
const kw=t=>{ const words=(t||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>3); const f={}; for(const w of words) f[w]=(f[w]||0)+1; return Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,c])=>({k,c})); };
const flags=t=>{ t=(t||'').toLowerCase(); const hits=crisis.filter(w=>t.includes(w)); return hits.length?[{type:'crisis',terms:hits}]:[]; };
window.Introspect.run=function(seed={}){ const text=[seed.context,...(seed.objectives||[]),seed.primary_need,seed.dx_code].filter(Boolean).join(' | '); const out={ sentiment:sentiment(text), flags:flags(text), top_terms:kw(text), ts:new Date().toISOString() }; repoWrite('introspect_result', out); try{ IntrospectBus?.emit?.('introspect.result', out); }catch{} return out; };
console.log('[introspect] hotfix applied');
})();
