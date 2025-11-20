
window.runPreHooks = async function runPreHooks(node, ctx){
  const list = Array.isArray(node && node.preHooks) ? node.preHooks
             : (node && node.hooks && Array.isArray(node.hooks.pre)) ? node.hooks.pre
             : [];
  for (const name of list){
    const res = await window.hooks.run(name, ctx);
    if (res === "shortcircuit") return "shortcircuit";
  }
  return "continue";
};
