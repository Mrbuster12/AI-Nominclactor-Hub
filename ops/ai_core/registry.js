(()=>{ if (window.AIEngine) return;
  window.AIEngine={
    bandersnatch:i=>({ risk:(i?.objectives?.length||0)>1?'elevated':'low', flags:[] }),
    asam:i=>({ level: (i?.primary_need? 'Level 2.1' : 'Level 1'), reasons:[] }),
    dsm:i=>({ ctc: i?.dx_code||'unspecified', severity:'moderate' }),
    eclipse:i=>({ pass:true, token:crypto.randomUUID?crypto.randomUUID():String(Date.now()) })
  };
  console.log('[ai_core] registry ready');
})();
