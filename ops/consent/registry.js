(()=>{ if (window.ConsentRegistry) return;
  const K='vsc:consent:registry';
  const read=()=>JSON.parse(localStorage.getItem(K)||'{}');
  const write=o=>localStorage.setItem(K,JSON.stringify(o));
  window.ConsentRegistry={
    grant(scope,data={}){ const r=read(); r[scope]={granted:true,data,ts:new Date().toISOString(),policy:window.CONSENT_POLICY_VERSION||'v1.0'}; write(r); ConsentBus.emit('consent.granted',{scope,data}); },
    deny(scope,reason='declined'){ const r=read(); r[scope]={granted:false,reason,ts:new Date().toISOString(),policy:window.CONSENT_POLICY_VERSION||'v1.0'}; write(r); ConsentBus.emit('consent.denied',{scope,reason}); },
    revoke(scope){ const r=read(); const prev=r[scope]; delete r[scope]; write(r); ConsentBus.emit('consent.revoked',{scope,prev}); },
    all(){ return read(); }
  };
})();
