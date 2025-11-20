// runtime/dsm_influence.js
(function(){
  function qs(s, r=document){ return r.querySelector(s); }
  function txt(el){ return (el && (el.value||el.textContent||'')).toString().trim(); }
  function setText(el, s){ if(el){ el.textContent = s; } }

  // Map DSM specifiers to diagnosis overrides + narratives
  const MAP = {
    "dsm_with_dissociative_symptoms": { code:"F60.3", name:"Borderline Personality Disorder, with dissociative symptoms", narrative:"Dissociative episodes reported/observed; affects continuity of mood and self-state." },
    "dsm_with_transient_stress_related_paranoid_ideation": { code:"F60.3", name:"Borderline Personality Disorder, with transient stress-related paranoid ideation", narrative:"Transient paranoid ideation in response to acute stressors." },
    "dsm_with_anxious_distress": { code:"F32.1", name:"Major Depressive Disorder, moderate, with anxious distress", narrative:"Marked physiological arousal, persistent worry, and tension consistent with anxious distress." },
    "dsm_with_psychotic_features": { code:"F31.2", name:"Bipolar I Disorder, current episode manic, with psychotic features", narrative:"Psychotic features present during mood episode." },
    "dsm_most_recent_episode_manic": { code:"F31.13", name:"Bipolar II Disorder, most recent episode hypomanic", narrative:"Recent mood elevation with functional change suggestive of hypomanic polarity." },
    "dsm_first_episode": { code:"F20.9", name:"Schizophrenia, first episode", narrative:"First-episode presentation; monitor duration and symptom clusters for specifier updates." },
    "dsm_currently_in_acute_episode": { code:"F20.9", name:"Schizophrenia, currently in acute episode", narrative:"Active phase symptoms prominent; acute management indicated." },
    "dsm_with_delayed_expression": { code:"F43.10", name:"Posttraumatic Stress Disorder, with delayed expression", narrative:"Onset of full diagnostic criteria occurs at least six months after the event." },
    "dsm_with_panic_attacks": { code:"F41.1", name:"Generalized Anxiety Disorder, with panic attacks", narrative:"Unexpected panic episodes overlaying generalized anxiety pattern." },
    "dsm_with_melancholic_features": { code:"F32.2", name:"Major Depressive Disorder, severe, with melancholic features", narrative:"Pervasive anhedonia, non-reactive mood, and diurnal variation suggest melancholic specifier." },
    "dsm_with_good_or_fair_insight": { code:"F42.9", name:"Obsessive-Compulsive Disorder, with good or fair insight", narrative:"Individual recognizes obsessions/compulsions are excessive or unreasonable." },
    "dsm_with_language_impairment": { code:"F84.0", name:"Autism Spectrum Disorder, with language impairment", narrative:"Notable language impairment impacting social communication and reciprocity." }
  };

  function getSelectedSpecId(){
    const sel = qs('#clinicianSelect');
    if(!sel) return "";
    // Prefer value (ids like dsm_*), fall back to normalized text
    const v = (sel.value||"").trim();
    if(v) return v;
    const lab = sel.options && sel.selectedIndex>=0 ? (sel.options[sel.selectedIndex].textContent||"").trim() : "";
    if(!lab) return "";
    return "dsm_" + lab.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  }

  function applyToSummary(diag){
    // Your UI containers
    const summaryEl = qs('#sessionNote') || qs('#outputBox');
    if(!summaryEl) return;
    const existing = summaryEl.textContent || "";
    const stamp = `Dx: ${diag.name} (${diag.code}) — ${diag.narrative}`;
    // Prepend a one-liner so the user sees it immediately without losing existing content
    const merged = stamp + (existing ? (" | " + existing) : "");
    summaryEl.textContent = merged;
  }

  function applyToDAP(diag){
    // Try to find existing DAP textareas/fields
    const dataEl = qs('#dapData');
    const assessEl = qs('#dapAssessment');
    const planEl = qs('#dapPlan');

    // Append a single narrative line to Assessment and seed diagnosis fields into a hidden JSON blob for export buttons
    if(assessEl){
      const a = txt(assessEl);
      const add = `Dx override: ${diag.name} (${diag.code}). ${diag.narrative}`;
      assessEl.value = a ? (a + " " + add) : add;
    }

    // Stash into window for export hooks
    window.VSC_DSM = { diagnosis: { code: diag.code, name: diag.name, narrative: diag.narrative } };
  }

  function run(){
    const id = getSelectedSpecId();
    const diag = MAP[id];
    if(!diag) return; // unknown specifier -> no-op
    applyToSummary(diag);
    applyToDAP(diag);
  }

  function hookExports(){
    // Ensure JSON/text exports include the DSM-influenced diagnosis
    function mergeIntoJSONPayload(payload){
      if(window.VSC_DSM && window.VSC_DSM.diagnosis){
        payload.diagnosis = Object.assign({}, payload.diagnosis||{}, window.VSC_DSM.diagnosis);
      }
      return payload;
    }

    // Hook JSON export
    const jsonBtn = document.getElementById('exportJsonBtn');
    if(jsonBtn){
      jsonBtn.addEventListener('click', function(){
        try{
          const raw = window.sessionPayload || {}; // your app may define this; fallback to minimal
          const merged = mergeIntoJSONPayload(raw);
          const blob = new Blob([JSON.stringify(merged, null, 2)], {type:'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'session_export.json';
          document.body.appendChild(a); a.click();
          setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 120);
        }catch(e){ console.warn('[DSM Influence] JSON export failed', e); }
      }, true);
    }

    // Hook text export by refreshing #sessionNote before default handler
    const txtBtn = document.getElementById('downloadBtn');
    if(txtBtn){
      txtBtn.addEventListener('click', function(){ try{ run(); }catch(e){} }, true);
    }
  }

  function init(){
    // Run immediately and also on change of the specifier select
    run();
    const sel = qs('#clinicianSelect');
    if(sel){
      sel.addEventListener('change', run);
    }
    hookExports();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();