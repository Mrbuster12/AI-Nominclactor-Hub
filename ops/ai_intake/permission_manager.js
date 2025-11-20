window.AIIntake = window.AIIntake || {};
AIIntake.permissions = {
  async ppiBasic(){
    const ok = true;
    if (ok) AIBridge.emit({ type: "consent.granted", payload: { scope: "ppi-basic" }});
    return ok;
  },
  async mic(){
    try{
      await navigator.mediaDevices.getUserMedia({ audio:true });
      AIBridge.emit({ type:"consent.granted", payload:{ scope:"mic" }});
      return true;
    }catch(e){ AIBridge.emit({ type:"consent.denied", payload:{ scope:"mic" }}); return false; }
  },
  async cam(){
    try{
      await navigator.mediaDevices.getUserMedia({ video:true });
      AIBridge.emit({ type:"consent.granted", payload:{ scope:"cam" }});
      return true;
    }catch(e){ AIBridge.emit({ type:"consent.denied", payload:{ scope:"cam" }}); return false; }
  },
  async location(){
    if(!('geolocation' in navigator)){ AIBridge.emit({ type:"consent.unavailable", payload:{ scope:"location" }}); return false; }
    return new Promise(resolve=>{
      navigator.geolocation.getCurrentPosition(
        pos=>{ AIBridge.emit({ type:"consent.granted", payload:{ scope:"location", coords:pos.coords }}); resolve(true); },
        _=>{ AIBridge.emit({ type:"consent.denied", payload:{ scope:"location" }}); resolve(false); }
      );
    });
  },
  async webauthn(){
    if(!window.PublicKeyCredential){ AIBridge.emit({ type:"consent.unavailable", payload:{ scope:"webauthn" }}); return false; }
    AIBridge.emit({ type:"consent.granted", payload:{ scope:"webauthn" }});
    return true;
  }
};
