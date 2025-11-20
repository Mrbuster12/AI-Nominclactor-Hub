
// BPIRL Debug Panel (appears only when ?debug=bpirl or localStorage.bpirlDebug='1')
(function(){
  function enabled(){
    if (new URLSearchParams(location.search).get('debug') === 'bpirl') return true;
    try { return localStorage.getItem('bpirlDebug') === '1'; } catch(e){ return false; }
  }
  function setFlag(on){
    try { localStorage.setItem('bpirlDebug','1'); } catch(e){}
    if (!window.engine) window.engine = (window.VSC && window.VSC.engine) || (window.app && window.app.engine) || window.engine || {};
    if (!window.engine.ctx) window.engine.ctx = window.ctxScaffold || (window.engine.ctx = {});
    if (!window.engine.ctx.state) window.engine.ctx.state = {};
    if (!window.engine.ctx.state.bpirl) window.engine.ctx.state.bpirl = {};
    window.engine.ctx.state.bpirl.flag = !!on;
    console.log('[BPIRL] debug toggle → state.bpirl.flag =', !!on);
    // visual feedback
    var lamp = document.querySelector('#bpirl-debug-lamp');
    if (lamp) lamp.style.background = on ? '#16a34a' : '#9ca3af';
    var label = document.querySelector('#bpirl-debug-label');
    if (label) label.textContent = 'bpirl.flag = ' + (!!on);
  }
  // expose for console/manual
  window.bpirlSet = setFlag;

// always on:   if (!enabled()) return;

  // styles
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'runtime/bpirl_debug_panel.css';
  document.head.appendChild(css);

  // panel
  var el = document.createElement('div');
  el.id = 'bpirl-debug';
  el.innerHTML = [
    '<div id="bpirl-debug-drag">BPIRL</div>',
    '<div id="bpirl-debug-row">',
      '<div id="bpirl-debug-lamp"></div>',
      '<span id="bpirl-debug-label">bpirl.flag = false</span>',
    '</div>',
    '<div id="bpirl-debug-row">',
      '<button id="bpirl-on">Set TRUE</button>',
      '<button id="bpirl-off">Set FALSE</button>',
    '</div>',
    '<div id="bpirl-debug-row" class="meta">?debug=bpirl to show • persists in localStorage</div>'
  ].join('');
  document.body.appendChild(el);

  // wiring
  document.getElementById('bpirl-on').onclick = function(){ setFlag(true); };
  document.getElementById('bpirl-off').onclick = function(){ setFlag(false); };

  // draggable
  (function(){
    var drag = document.getElementById('bpirl-debug-drag');
    var root = el;
    var x=0,y=0,ox=0,oy=0;
    drag.onmousedown = function(e){
      e.preventDefault();
      ox = e.clientX;
      oy = e.clientY;
      document.onmousemove = function(e2){
        x += e2.clientX - ox; y += e2.clientY - oy;
        ox = e2.clientX; oy = e2.clientY;
        root.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      };
      document.onmouseup = function(){ document.onmousemove = null; document.onmouseup = null; };
    };
  })();

  // init
  setTimeout(function(){ setFlag(!!(window.engine && window.engine.ctx && window.engine.ctx.state && window.engine.ctx.state.bpirl && window.engine.ctx.state.bpirl.flag)); }, 200);
})();