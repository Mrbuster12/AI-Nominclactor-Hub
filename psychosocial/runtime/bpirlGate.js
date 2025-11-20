
window.bpirlGate = async function bpirlGate(ctx){
  const flag = (ctx && ctx.state && ctx.state.bpirl && ctx.state.bpirl.flag === true)
            || (ctx && ctx.triggers && ctx.triggers.bpd_early_trigger === true);
  if (!flag) return "continue";
  if (ctx.activateTSBL01) ctx.activateTSBL01();
  if (ctx.setClinicianProfile) ctx.setClinicianProfile("HighEmpathy_LowConfrontation");
  if (ctx.SCRL && ctx.SCRL.log) ctx.SCRL.log("bpirl.enter", { ts: Date.now(), route: (ctx.route && ctx.route.id) || "unknown" });
  if (ctx.escalationPersists && ctx.escalationPersists()) {
    if (ctx.engageBoundaryReconstruction) ctx.engageBoundaryReconstruction();
  }
  if (ctx.applyDCML) ctx.applyDCML();
  return "shortcircuit";
};
