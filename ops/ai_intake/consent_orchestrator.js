window.AIIntake = window.AIIntake || {};
AIIntake.orchestrate = async ({ intent, userId }) => {
  const caps = AIIntake.capabilities();
  AIBridge.emit({ type:"session.start", payload:{ intent, caps }});
  const { tier, requiredConsents } = AIIntake.classify({ intent });
  AIBridge.emit({ type:"tier.assigned", payload:{ tier, requiredConsents }});
  const okBasic = await AIIntake.permissions.ppiBasic();
  if(!okBasic){ AIBridge.emit({ type:"session.blocked", payload:{ reason:"ppi-basic required" }}); return { ok:false }; }
  for(const scope of requiredConsents){
    if(scope==="ppi-basic") continue;
    if(scope==="mic" && caps.mic)         await AIIntake.permissions.mic();
    if(scope==="cam" && caps.cam)         await AIIntake.permissions.cam();
    if(scope==="location" && caps.loc)    await AIIntake.permissions.location();
    if(scope==="webauthn" && caps.webauthn) await AIIntake.permissions.webauthn();
  }
  const granted = (window.VSC_BRIDGE_LOG||[]).filter(e=>e.type==="consent.granted").map(e=>e.payload.scope);
  const session = { sessionId: window.VSC_SESSION_ID, userId: userId||null, intent, tier, granted };
  try{ window.VSCRepo && VSCRepo.write && VSCRepo.write("intake_session", session); }catch(_){}
  AIBridge.emit({ type:"intake.ready", payload: session });
  return { ok:true, session };
};
