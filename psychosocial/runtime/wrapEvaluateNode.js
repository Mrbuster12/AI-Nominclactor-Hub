
window.wrapEvaluateNode = function wrapEvaluateNode(evaluateNode){
  return async function(node, ctx){
    const pre = await window.runPreHooks(node, ctx);
    if (pre === "shortcircuit"){
      return { shortcircuited: true };
    }
    return await evaluateNode(node, ctx);
  };
};
