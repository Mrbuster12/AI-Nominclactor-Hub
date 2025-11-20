(()=>{ 
  if (!window.IntrospectBus) {
    const subs = new Set();
    window.IntrospectBus = {
      emit(type, payload={}, meta={}) {
        const evt = { type, payload, meta:{...meta, ts: Date.now(), ver:'introspect/1.0' } };
        try { document.dispatchEvent(new CustomEvent('vsc:introspect', { detail: evt })); } catch {}
        subs.forEach(fn => { try { fn(evt); } catch {} });
        (window.VSC_INTROSPECT_LOG ||= []).push(evt);
        console.log('[introspect:emit]', type, evt);
        return evt;
      },
      on(fn){ subs.add(fn); return ()=>subs.delete(fn); }
    };
    console.log('[introspect] bus ready');
  }

  if (!window.IntrospectStore) {
    const K = 'vsc:introspect:events';
    const read = () => JSON.parse(localStorage.getItem(K) || '[]');
    const writeLocal = (o) => {
      const a = read(); a.push({ ...o, _saved: new Date().toISOString() });
      localStorage.setItem(K, JSON.stringify(a));
      return a[a.length-1];
    };
    window.IntrospectStore = {
      write(record){
        const saved = writeLocal(record);
        try { window.VSCRepo?.write?.('introspect_event', saved); } catch {}
        return saved;
      },
      all(){ return read(); },
      last(){ return read().slice(-1)[0]; }
    };
    console.log('[introspect] store ready');
  }

  try {
    window.AIBus?.on?.(evt => {
      if (!evt?.type) return;
      if (evt.type === 'ai.results') {
        const s = evt.payload || {};
        IntrospectStore.write({ source:'ai', kind:'results',
          bandersnatch: s.bandersnatch?.risk,
          asam:         s.asam?.level,
          dsm:          s.dsm?.ctc,
          eclipsePass:  !!s.eclipse?.pass
        });
      }
      if (evt.type === 'ai.voucher.ready') {
        IntrospectStore.write({ source:'ai', kind:'voucher', token: evt.payload?.token || null });
      }
    });
  } catch {}

  try {
    window.ConsentBus?.on?.(evt => {
      if (!evt?.type) return;
      if (evt.type === 'consent.granted' || evt.type === 'consent.denied' || evt.type === 'consent.revoked') {
        IntrospectStore.write({ source:'consent', kind:evt.type, scope:evt.payload?.scope || null });
      }
      if (evt.type === 'intake.ready') {
        IntrospectStore.write({ source:'consent', kind:'intake.ready', granted:(evt.payload?.session?.granted||[]).slice(0,8) });
      }
    });
  } catch {}

  try {
    window.RetinaBus?.on?.(evt => {
      if (!evt?.type) return;
      if (evt.type === 'retina.voucher.issued') {
        IntrospectStore.write({ source:'retina', kind:'voucher', token: evt.payload?.token || null });
      }
    });
  } catch {}

  const id='vsc-introspect-badge'; document.getElementById(id)?.remove();
  const b=document.createElement('div'); b.id=id; b.textContent='Introspective Engine active';
  Object.assign(b.style,{
    position:'fixed', bottom:'12px', left:'12px', padding:'6px 10px',
    background:'#37474f', color:'#fff', font:'12px system-ui',
    borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,.35)', zIndex:99990, opacity:.95
  });
  document.body.appendChild(b);

  IntrospectBus.emit('introspect.note', { msg:'boot ok' });
  console.log('[introspect] last saved →', window.IntrospectStore.last());
  console.log('[introspect] ready');
})();
