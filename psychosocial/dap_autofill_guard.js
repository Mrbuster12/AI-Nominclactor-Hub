(function(){
  function safeTrim(v){ try{ return (v==null?"":(""+v)).trim(); }catch(e){ return ""; } }
  if(typeof getText==="function"){
    const oldGetText = getText;
    window.getText = function(sel){
      try{
        const el = document.querySelector(sel);
        return safeTrim(el && (el.value||el.textContent||""));
      }catch(e){ return ""; }
    };
  }
})();
