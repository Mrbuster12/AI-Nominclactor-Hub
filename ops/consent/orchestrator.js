window.ConsentOrchestrator=async function run({intent,userId,policyVer='v1.0'}){
  window.CONSENT_POLICY_VERSION=policyVer;
  const base=['ppi-basic'];
  const matrix={group:base.concat(['mic']), outpatient:base.concat(['mic','cam']),
                inpatient:base.concat(['mic','cam','location']),
                crisis:base.concat(['mic','cam','location','webauthn'])};
  const required=(matrix[intent]||base);
  ConsentBus.emit('session.start',{intent,required});
  const okBasic=await ConsentCollectors.ppiBasic();
  if(!okBasic){ ConsentBus.emit('session.blocked',{reason:'ppi-basic required'}); return {ok:false}; }
  for(const scope of required.slice(1)){ const fn=ConsentCollectors[scope]; if(typeof fn==='function') await fn(); }
  const snapshot=ConsentRegistry.all();
  const session={userId:userId||null,intent,granted:Object.keys(snapshot).filter(k=>snapshot[k].granted),ts:new Date().toISOString()};
  try{ (window.VSCRepo&&VSCRepo.write)&&VSCRepo.write('consent_session',session); }catch{}
  ConsentBus.emit('intake.ready',{session,snapshot});
  return {ok:true,session,snapshot};
};
