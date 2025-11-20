(() => {
  if (!window.RetinaBus) return console.warn('[retina-bridge] RetinaBus not found');
  RetinaBus.on(evt => {
    if (!evt || evt.type !== 'voucher.ready') return;
    try { window.VSCRepo && VSCRepo.write && VSCRepo.write('retina_voucher', evt.payload); } catch {}
    const K = 'vsc:repo:retina_voucher';
    const a = JSON.parse(localStorage.getItem(K) || '[]');
    a.push({ ...evt.payload, _saved: new Date().toISOString() });
    localStorage.setItem(K, JSON.stringify(a));
    console.log('[retina-bridge] archived → repo+local', evt.payload);
  });
  console.log('[retina-bridge] listening');
})();
