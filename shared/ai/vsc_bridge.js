(function(w){
const bus = w.AIEngine && w.AIEngine.bus; if(!bus){ console.warn('AIEngine.bus missing'); return; }
const KEY='vsc:dsmctc:ledger:v1';
function load(){ try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]} }
function save(arr){ localStorage.setItem(KEY, JSON.stringify(arr)) }
function add(entry){ const arr=load(); arr.push(entry); save(arr); bus.emit('dsmctc:ledger:update',{size:arr.length}) }
w.DSMCTC = w.DSMCTC||{}; w.DSMCTC.ledger={load,save,add};
const VSCBridge = {
publish: (topic, payload, meta={})=>{
const evt={topic,payload,meta,ts:new Date().toISOString()};
bus.emit(topic, evt);
if(topic==='ctc_update'){ add({module:meta.module||'unknown',topic,payload}) }
},
subscribe: (topic, fn)=> bus.on(topic, fn)
};
w.VSCBridge = VSCBridge;
})(window);
