window.SSCRL = window.SSCRL || {
  score(seed){
    let s = 25;
    const obj = (seed?.objectives||[]).join(" ").toLowerCase();
    if(obj.includes("iop")) s += 20;
    if(/relapse/.test(String(seed?.primary_need||"").toLowerCase())) s += 15;
    if(/crisis|suicid|overdose/.test(obj)) s += 30;
    s = Math.max(0, Math.min(100, s));
    return { score:s, bucket: s>=70?"HIGH":s>=40?"MOD":"LOW", ts:new Date().toISOString() };
  }
};
