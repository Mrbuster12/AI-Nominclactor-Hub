(function(){
  function requiredPermissions(capabilities){
    const c = capabilities || {};
    const needs = [];
    if (c.microphone) needs.push('mic');
    if (c.camera) needs.push('camera');
    if (c.tts) needs.push('tts');
    if (c.asr) needs.push('asr');
    return needs;
  }

  function summarize(consentLog){
    const ok = (consentLog||[]).reduce((acc, k)=>{ acc[k]=true; return acc; }, {});
    return {
      mic: !!ok.mic,
      camera: !!ok.camera,
      tts: !!ok.tts,
      asr: !!ok.asr
    };
  }

  window.AIIntake = window.AIIntake || {};
  window.AIIntake.PermissionManager = { requiredPermissions, summarize };
})();
