window.ASIL = window.ASIL || {
  compute(seed){
    const dx = String(seed?.dx_code||"").toUpperCase();
    let tier = "ASIL-1";
    if(/F2[0-9]\./.test(dx)) tier="ASIL-3";
    if(/F33\./.test(dx))    tier="ASIL-2";
    if(String(seed?.primary_need||"").toLowerCase().includes("crisis")) tier="ASIL-4";
    return { tier, dx, ts:new Date().toISOString() };
  }
};
