window.AIIntake = window.AIIntake || {};
AIIntake.classify = (input) => {
  const base = ["ppi-basic"];
  if (input.intent === "group")      return { tier: "Tier-1", requiredConsents: base.concat(["mic"]) };
  if (input.intent === "outpatient") return { tier: "Tier-2", requiredConsents: base.concat(["mic","cam"]) };
  if (input.intent === "inpatient")  return { tier: "Tier-3", requiredConsents: base.concat(["mic","cam","location"]) };
  if (input.intent === "crisis")     return { tier: "Tier-4", requiredConsents: base.concat(["mic","cam","location","webauthn"]) };
  return { tier: "Tier-1", requiredConsents: base };
};
