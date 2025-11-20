;(function(w,d){
function snap(){
var out={ dsm:[], risk:{}, crdpss:{} };
var n=d.querySelectorAll('[data-dsm-code]');
for(var i=0;i<n.length;i++){ var el=n[i]; if((el.type==='checkbox'&&el.checked)||el.getAttribute('aria-checked')==='true'){ out.dsm.push(el.getAttribute('data-dsm-code')); } }
var r=d.querySelectorAll('[data-risk-key]');
for(i=0;i<r.length;i++){ var x=r[i], k=x.getAttribute('data-risk-key'); var v=(x.type==='checkbox')? !!x.checked : x.value||x.textContent; out.risk[k]=v; }
var c=d.querySelectorAll('[data-crdpss-key]');
for(i=0;i<c.length;i++){ var y=c[i], ky=y.getAttribute('data-crdpss-key'); var vv=parseFloat(y.value||y.textContent)||0; out.crdpss[ky]=vv; }
return out;
}
function wire(){
if(!(w.VSCBridge&&w.AIEngine&&w.AIEngine.bus)) return console.warn('[preass] bridge missing');
var publish=function(){ var payload=snap(); w.VSCBridge.publish('ctc_update', payload, {module:'preassessment'}); };
d.addEventListener('change', publish, true);
d.addEventListener('input', publish, true);
publish();
}
(d.readyState==='loading')? d.addEventListener('DOMContentLoaded', wire): wire();
})(window,document);
