(() => {
  document.querySelectorAll('script[src*="/ts_runtime/"]').forEach(s => s.remove());
  if (!document.getElementById('inbox-box')) {
    const box = document.createElement('div');
    box.id = 'inbox-box';
    box.style.cssText = 'max-width:900px;margin:16px auto;padding:16px;border:1px solid #ddd;border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.06);font:15px system-ui,-apple-system,Segoe UI,Arial;';
    box.innerHTML = `
      <h2 style="margin:0 0 10px">Consent Inbox</h2>
      <div style="margin:8px 0;color:#555">Listening on <code>BroadcastChannel("consent")</code> and storage key <code>consent_emit</code>.</div>
      <pre id="inbox-view" style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px;min-height:120px;margin:0"></pre>
    `;
    document.body.appendChild(box);
  }
  const view = document.getElementById('inbox-view');
  const show = (payload, source) => {
    const line = `[${new Date().toISOString()}] from ${source}\n` + JSON.stringify(payload, null, 2) + `\n\n`;
    view.textContent = line + view.textContent;
    console.log('[inbox] received', source, payload);
  };
  let bc = null;
  try { bc = new BroadcastChannel('consent'); bc.onmessage = (e)=>{ if (e?.data?.payload) show(e.data.payload, 'broadcast'); }; } catch {}
  window.addEventListener('storage', (e) => {
    if (e.key === 'consent_emit' && e.newValue) { try { show(JSON.parse(e.newValue), 'storage'); } catch {} }
  });
  window.addEventListener('consent:capture', (e) => { if (e?.detail) show(e.detail, 'event'); }, { passive: true });
  console.log('[inbox] wired');
})();
