(()=>{ if (window.AIRunner) return;
  window.AIRunner = function run(seed){
    const out={
      bandersnatch: AIEngine.bandersnatch(seed),
      asam:         AIEngine.asam(seed),
      dsm:          AIEngine.dsm(seed),
      eclipse:      AIEngine.eclipse(seed)
    };
    AIBus.emit('ai.results', out);
    if (out.eclipse?.pass && out.eclipse?.token){
      try { VSCRepo?.write?.('ai_voucher', {token:out.eclipse.token, ts:new Date().toISOString()}); } catch {}
      AIBus.emit('ai.voucher.ready', { token: out.eclipse.token });
    }
    return out;
  };
  console.log('[ai_core] runner ready');
})();
