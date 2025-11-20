(function(){
  window.addEventListener('ai.action', function(e){
    var a = (e && e.detail && e.detail.action) || '';
    if (!a) return;
    if (a === 'draft'){
      console.log('Bio ai.action draft received');
    } else if (a === 'review'){
      console.log('Bio ai.action review received');
    }
  });
})();
