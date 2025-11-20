
window.ctxScaffold = {
  state: { bpirl: { flag: false } },
  triggers: {},
  route: { id: "unknown" },
  SCRL: { log: function(){ /* no-op for static demo */ } },
  activateTSBL01: function(){ console.log("[BPIRL] TS-BL01 activated"); },
  setClinicianProfile: function(p){ console.log("[BPIRL] set profile:", p); },
  escalationPersists: function(){ return false; },
  engageBoundaryReconstruction: function(){ console.log("[BPIRL] boundary reconstruction"); },
  applyDCML: function(){ console.log("[BPIRL] DCML apply"); }
};
