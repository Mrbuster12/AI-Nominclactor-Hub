(function(){
  if (window.GroupNotes) return
  function read(){ try{ return JSON.parse(localStorage.getItem('vsc:group:notes')||'[]') }catch(e){ return [] } }
  function write(arr){ try{ localStorage.setItem('vsc:group:notes', JSON.stringify(arr)) }catch(e){} }
  window.GroupNotes = {
    save: function(note){
      var n = Object.assign({ ts:new Date().toISOString() }, note||{})
      var arr = read(); arr.push(n); write(arr)
      try{ window.GroupBus && GroupBus.emit && GroupBus.emit('group.notes.saved', n) }catch(e){}
      console.log('[GroupNotes] saved', n)
      return n
    },
    list: function(){ return read() },
    clear: function(){ write([]); console.log('[GroupNotes] cleared') }
  }
  if (window.GroupBus && GroupBus.on){
    GroupBus.on('group.notes.save', function(payload){ window.GroupNotes.save(payload) })
  }
  console.log('[GroupNotes] ready')
})();
