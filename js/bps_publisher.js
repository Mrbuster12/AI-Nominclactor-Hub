;(function(w,d){
  function num(v){var n=parseFloat(v);return isNaN(n)?0:n;}
  function snap(){
    var out={ dsm:[], risk:{}, crdpss:{}, bps:{bio:{},psycho:{},social:{}} };
    var dx=d.querySelectorAll('[data-dsm-code]');
    for(var i=0;i<dx.length;i++){var el=dx[i];
      if((el.type==='checkbox'&&el.checked)||el.getAttribute('aria-checked')==='true'){
        out.dsm.push(el.getAttribute('data-dsm-code'));
      }
    }
    var r=d.querySelectorAll('[data-risk-key]');
    for(i=0;i<r.length;i++){var x=r[i],k=x.getAttribute('data-risk-key');
      out.risk[k]=(x.type==='checkbox')?!!x.checked:(x.value||x.textContent);
    }
    var c=d.querySelectorAll('[data-crdpss-key]');
    for(i=0;i<c.length;i++){var y=c[i],ky=y.getAttribute('data-crdpss-key');
      out.crdpss[ky]=num(y.value||y.textContent);
    }
    var segs=d.querySelectorAll('[data-bps-seg][data-bps-key]');
    for(i=0;i<segs.length;i++){var z=segs[i],seg=z.getAttribute('data-bps-seg'),key=z.getAttribute('data-bps-key'),val;
      if(z.type==='checkbox') val=!!z.checked;
      else if(z.type==='number'||z.getAttribute('data-type')==='num') val=num(z.value||z.textContent);
      else val=(z.value!=null?z.value:z.textContent)||'';
      if(!out.bps[seg]) out.bps[seg]={};
      out.bps[seg][key]=val;
    }
    return out;
  }
  function wire(){
    if(!(w.VSCBridge&&w.AIEngine&&w.AIEngine.bus)) return console.warn('[bps] bridge missing');
    var t; 
    var publish=function(){
      clearTimeout(t);
      t=setTimeout(function(){ w.VSCBridge.publish('ctc_update', snap(), {module:'bps'}); }, 60);
    };
    d.addEventListener('input', publish, true);
    d.addEventListener('change', publish, true);
    publish();
  }
  (d.readyState==='loading')? d.addEventListener('DOMContentLoaded', wire): wire();
})(window,document);
