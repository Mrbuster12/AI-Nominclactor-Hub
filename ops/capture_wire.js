(()=>{const styleBase={position:"fixed",padding:"6px 10px",font:"12px system-ui",borderRadius:"10px",boxShadow:"0 2px 8px rgba(0,0,0,.35)",zIndex:999999,opacity:.95};
function mkBUS(src){if(window.BUS)return;const subs=[];window.BUS={subscribe:f=>{"function"==typeof f&&subs.push(f)},emit:(t,p={},m={})=>{const msg={type:t,payload:p,meta:{...m,ts:Date.now(),src}};subs.forEach(fn=>{try{fn(msg)}catch(_){}});try{window.dispatchEvent(new CustomEvent("BUS",{detail:msg}))}catch(_){ }console.log("[bus:emit]",t,msg);return msg}};console.log("[bus] created ("+src+")")}
document.title="📝 [CAPTURE] Releases AND Consents — VSC"; mkBUS("capture");
let bc;try{bc=new BroadcastChannel("consent");console.log("[capture] BC(consent) ready")}catch(e){console.warn("[capture] BC unavailable",e)}
window.CAPTURE=window.CAPTURE||{};
CAPTURE.consent=(d={})=>{const payload={signed:!0,ts:new Date().toISOString(),...d};BUS.emit("consent.signed",payload);try{bc?.postMessage({type:"consent.signed",payload})}catch(_){ }console.log("[capture] consent.signed",payload)};
CAPTURE.logic=(name="baseline",d={})=>{const type=`logic.${name}`,payload={ts:new Date().toISOString(),...d};BUS.emit(type,payload);try{bc?.postMessage({type,payload})}catch(_){ }console.log("[capture]",type,payload)};
document.getElementById("vsc-badge-capture")?.remove();const b=document.createElement("div");b.id="vsc-badge-capture";b.textContent="📝 Releases AND Consents (Capture)";Object.assign(b.style,{...styleBase,top:"10px",right:"10px",background:"#1e88e5",color:"#fff"});document.body.appendChild(b);document.documentElement.style.outline="4px solid rgba(30,136,229,.65)";
})();
