window.GroupBus=window.GroupBus||{listeners:{},on:function(n,f){(this.listeners[n]=this.listeners[n]||[]).push(f)},emit:function(n,d){(this.listeners[n]||[]).forEach(function(fn){try{fn(d)}catch(e){console.error(e)}});console.log('[GroupBus] emit',n,d)}};
console.log('[stub] ops/group/bus.js loaded');
