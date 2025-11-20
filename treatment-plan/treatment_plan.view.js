(function(){
  const DRAWER_NS="tp_drawers";
  const SESSION_NS="session_bridge";
  const PSYCH_NS="bps_bridge";
  const MSE_NS="mse_bridge";
  const DAP_NS="dap_bridge";
  const TTL=parseInt(localStorage.getItem("session_bridge:ttl")||String(2*60*60*1000),10);
  let currentClientId=null;
  let currentPlan=null;
  let planVersion=1;
  function $(id){return document.getElementById(id)}
  function arr(x){return Array.isArray(x)?x:(x?[x]:[])}
  function nonEmpty(v){return v&&String(v).trim().length>0}
  async function loadBridge(ns){
    try{
      const frag=new URLSearchParams(location.hash.slice(1));
      const k=frag.get("k")||sessionStorage.getItem("session_bridge_key")||localStorage.getItem("session_bridge:last_k");
      return await window.Bridge.load(ns,k,TTL)
    }catch(e){return null}
  }
  async function gather(){
    const env=await loadBridge(SESSION_NS)||{};
    const bps=await loadBridge(PSYCH_NS)||{};
    const mse=await loadBridge(MSE_NS)||{};
    const dap=await loadBridge(DAP_NS)||{};
    const client=(env.client&&env.client.id)||(bps.client&&bps.client.id)||env.client_id||bps.client_id||"ANON";
    currentClientId=client;
    const dx={
      code:(bps.dx_code||env.dx_code||env.dsm_code||env.dsm_text||"R69"),
      text:(bps.dx_text||env.dx_text||env.dsm_label||"Unspecified condition"),
      tier:(env.ctcTier||bps.ctcTier||"CTC-1")
    };
    const seed={
      goals:arr(env.plan_goals).concat(arr(bps.plan_goals)),
      objectives:arr(env.plan_objectives).concat(arr(bps.plan_objectives)),
      interventions:arr(env.plan_interventions).concat(arr(bps.plan_interventions))
    };
    const mseFlags=(mse.flags||{});
    const dapLast=(dap.sessions&&dap.sessions[dap.sessions.length-1])||dap.last||null;
    return {dx,seed,mseFlags,dapLast,env}
  }
  function fillList(id,items){
    const ul=$(id);ul.innerHTML="";
    (items||[]).forEach(t=>{if(!nonEmpty(t))return;const li=document.createElement("li");li.textContent=t;ul.appendChild(li)})
  }
  function render(plan,meta){
    $("planClient").textContent="Client: "+(currentClientId||"ANON");
    $("planTrack").textContent="Track: "+(meta.track||"—");
    $("planTier").textContent=meta.tier||"CTC-1";
    $("planVersion").textContent="v"+planVersion;
    $("tpDx").textContent=(meta.dx_code?meta.dx_code+" — ":"")+(meta.dx_text||"Unspecified condition");
    fillList("tpGoals",plan.goals);
    fillList("tpObjectives",plan.objectives);
    fillList("tpInterventions",plan.interventions)
  }
  function loadDrawers(){
    try{return JSON.parse(localStorage.getItem(DRAWER_NS)||"{}")}catch(e){return {}}
  }
  function saveDrawers(store){
    try{localStorage.setItem(DRAWER_NS,JSON.stringify(store))}catch(e){}
  }
  function paintDrawer(arrList){
    const list=$("drawerList");list.innerHTML="";
    (arrList||[]).forEach((e,idx)=>{
      const li=document.createElement("li");
      li.innerHTML='<div class="meta">v'+e.v+' · '+new Date(e.at).toLocaleString()+' · '+(e.meta.tier||"CTC-1")+' · '+(e.meta.dx_code||"")+'</div><div><button data-idx="'+idx+'" class="btnLoad">Load</button> <button data-idx="'+idx+'" class="btnDel">Delete</button></div>';
      list.appendChild(li)
    });
    list.querySelectorAll(".btnLoad").forEach(b=>b.onclick=()=>{
      const store=loadDrawers();const arr=store[currentClientId]||[];
      const e=arr[parseInt(b.dataset.idx,10)];if(!e)return;
      planVersion=e.v;currentPlan=e.plan;$("tpNotes").value=e.notes||"";render(currentPlan,e.meta)
    });
    list.querySelectorAll(".btnDel").forEach(b=>b.onclick=()=>{
      const store=loadDrawers();const arr=store[currentClientId]||[];
      arr.splice(parseInt(b.dataset.idx,10),1);store[currentClientId]=arr;saveDrawers(store);paintDrawer(arr)
    })
  }
  function dedup(a){return Array.from(new Set((a||[]).map(x=>String(x).trim()).filter(Boolean)))}
  function merge(seed,mseFlags,dapLast){
    const plan={goals:dedup(seed.goals),objectives:dedup(seed.objectives),interventions:dedup(seed.interventions)};
    if(mseFlags.psychosis){plan.goals.unshift("Stabilize thought content");plan.interventions.unshift("Coordinate with psychiatric services for psychosis management")}
    if(dapLast&&dapLast.risk&&/relapse|use/i.test(dapLast.risk)){plan.objectives.unshift("Identify 3 relapse triggers and coping responses");plan.interventions.unshift("Relapse prevention skills session")}
    return plan
  }
  async function refresh(){
    const {dx,seed,mseFlags,dapLast,env}=await gather();
    const track=env.plan_track||env.route_track||"General";
    const tier=dx.tier||"CTC-1";
    const plan=merge(seed,mseFlags,dapLast);
    const meta={dx_code:dx.code,dx_text:dx.text,track,tier};
    currentPlan=plan;render(plan,meta);
    const store=loadDrawers();paintDrawer(store[currentClientId]||[])
  }
  function saveVersion(){
    if(!currentPlan)return;
    planVersion+=1;
    const meta={
      dx_code:(($("tpDx").textContent||"").split("—")[0]||"").trim(),
      dx_text:(($("tpDx").textContent||"").split("—").slice(1).join("—")||"").trim(),
      track:(($("planTrack").textContent||"").replace(/^Track:\s*/,"")).trim(),
      tier:$("planTier").textContent||"CTC-1"
    };
    const store=loadDrawers();const key=currentClientId||"ANON";store[key]=store[key]||[];
    store[key].unshift({at:new Date().toISOString(),v:planVersion,meta,plan:currentPlan,notes:$("tpNotes").value||""});
    saveDrawers(store);paintDrawer(store[key])
  }
  async function init(){
    $("btnRefreshFromBridges").addEventListener("click",refresh);
    $("btnNewVersion").addEventListener("click",saveVersion);
    window.addEventListener("vsc:bridge:update",(e)=>{
      const ns=(e.detail&&e.detail.ns)||"";
      if([SESSION_NS,PSYCH_NS,MSE_NS,DAP_NS].includes(ns)) refresh()
    });
    await refresh()
  }
  document.addEventListener("DOMContentLoaded",init)
})();
