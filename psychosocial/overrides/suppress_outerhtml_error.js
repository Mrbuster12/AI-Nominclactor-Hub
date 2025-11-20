(function(){
  window.addEventListener('unhandledrejection', function(e){
    if (e && e.reason && String(e.reason).includes("outerHTML")) {
      e.preventDefault();
      console.warn("[suppress] outerHTML on detached node");
    }
  });
})();
