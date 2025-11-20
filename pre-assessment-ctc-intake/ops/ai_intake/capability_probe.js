(function(){
  function capabilityProbe(){
    const n = navigator || {};
    const w = window || {};
    const d = document || {};
    return {
      mediaDevices: !!(n.mediaDevices && n.mediaDevices.getUserMedia),
      microphone: !!(n.mediaDevices && n.mediaDevices.getUserMedia),
      camera: !!(n.mediaDevices && n.mediaDevices.getUserMedia),
      tts: !!(w.speechSynthesis),
      asr: !!(w.webkitSpeechRecognition || w.SpeechRecognition),
      localStorage: (function(){ try{ localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }catch(e){ return false; } })(),
      broadcastChannel: !!w.BroadcastChannel,
      rtc: !!w.RTCPeerConnection,
      cookies: navigator.cookieEnabled === true,
      userAgent: n.userAgent || ''
    };
  }

  window.AIIntake = window.AIIntake || {};
  window.AIIntake.capabilityProbe = capabilityProbe;
})();
