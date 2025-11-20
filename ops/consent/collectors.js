window.ConsentCollectors={
  async ppiBasic(){ ConsentRegistry.grant('ppi-basic'); return true; },
  async mic(){ try{ await navigator.mediaDevices.getUserMedia({audio:true}); ConsentRegistry.grant('mic'); return true; }catch{ ConsentRegistry.deny('mic'); return false; } },
  async cam(){ try{ await navigator.mediaDevices.getUserMedia({video:true}); ConsentRegistry.grant('cam'); return true; }catch{ ConsentRegistry.deny('cam'); return false; } },
  async location(){
    if(!('geolocation' in navigator)){ ConsentBus.emit('consent.unavailable',{scope:'location'}); return false; }
    return new Promise(resolve=>{
      navigator.geolocation.getCurrentPosition(
        pos=>{ ConsentRegistry.grant('location',{coords:pos.coords}); resolve(true); },
        _=>{ ConsentRegistry.deny('location'); resolve(false); }
      );
    });
  },
  async webauthn(){ if(!window.PublicKeyCredential){ ConsentBus.emit('consent.unavailable',{scope:'webauthn'}); return false; }
    ConsentRegistry.grant('webauthn'); return true; },
  async face(){ ConsentRegistry.grant('face'); return true; },
  async palm(){ ConsentRegistry.grant('palm'); return true; },
  async retina(){ ConsentRegistry.grant('retina'); return true; }
};
