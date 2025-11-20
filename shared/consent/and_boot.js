(() => {
  const btn = document.getElementById('consent-accept');
  if (!btn || btn.__wired_ext) return;
  btn.__wired_ext = true;

  const get = id => (document.getElementById(id)?.value||'').trim();
  const chk = id => !!document.getElementById(id)?.checked;

  const uuid = () => {
    const d=new Uint8Array(16); crypto.getRandomValues(d);
    d[6]=(d[6]&0x0f)|0x40; d[8]=(d[8]&0x3f)|0x80;
    return [...d].map(x=>x.toString(16).padStart(2,'0')).join('');
  };

  btn.addEventListener('click', () => {
    const payload = {
      ts: Date.now(),
      ts_iso: new Date().toISOString(),
      name: get('cx_name'),
      phone: get('cx_phone'),
      geo_opt_in: chk('cx_geo'),
      bio_opt_in: chk('cx_bio'),
      signature_typed: get('cx_sig'),
      retina_hash: uuid(),
      ua: navigator.userAgent
    };

    // Voucher logic: only after multiple consents
    let od = parseInt(localStorage.getItem('od_count')||'0',10) || 0;
    od += 1; localStorage.setItem('od_count', String(od));
    payload.od_count = od;
    if (od >= 2) payload.voucher_token = `VCHR-${payload.retina_hash}-${payload.ts}`;

    // Broadcast out
    try { (window.__bc ||= new BroadcastChannel('consent')).postMessage({type:'consent', payload}); } catch {}
    try { localStorage.setItem('consent_emit', JSON.stringify(payload)); } catch {}

    console.log('[and] extended consent captured', payload);
  });

  console.log('[and] wiring with DSM/ASAM/voucher/retina ready');
})();
