(function(){
  const CRISIS = /\b(suicide|kill myself|homicide|kill (him|her|them)|overdose|self-harm)\b/i;
  function crisisResponse(){
    return {
      text: 'Crisis content detected. This educational system cannot respond. If you are in danger, call 911. For suicidal crisis in the US, call or text 988.',
      meta: { isSimulation:true, educationalPurpose:true, clinicalClaims:false, crisisIntercept:true }
    };
  }
  async function processPrompt(userInput, generateFn){
    try{
      if (CRISIS.test(String(userInput||''))) return crisisResponse();
      const out = await Promise.resolve(generateFn(userInput));
      const evt = { meta:{ isSimulation:true, educationalPurpose:true, clinicalClaims:false }, output:{ text:String(out && out.text || '') } };
      const vr = (window.VSC_Safety && window.VSC_Safety.validateEvent) ? window.VSC_Safety.validateEvent(evt) : {ok:true};
      if (!vr.ok) return { text: 'Content adjusted for safety.', meta: evt.meta };
      return { text: evt.output.text, meta: evt.meta };
    }catch(e){
      return { text: 'Unable to generate content in this educational simulation.', meta:{ isSimulation:true, educationalPurpose:true, clinicalClaims:false, error:true } };
    }
  }
  window.VSC_Safety = window.VSC_Safety || {};
  window.VSC_Safety.processPrompt = processPrompt;
})();
