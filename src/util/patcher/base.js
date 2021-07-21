// GooseMod, if you want me to remove this please contact me. (DS ID: 342686594442067983)
// https://github.com/GooseMod/GooseMod/blob/master/src/util/patcher/base.js

const generateIdSegment = () => Math.random().toString(36).replace(/[^a-z0-9]+/g, ''); // Random 12 char string

export const generateId = (segments = 3) => new Array(segments).fill(0).map(() => generateIdSegment()).join(''); // Chain random 12 char strings together X times

const modIndex = {};

const beforePatches = (context, args, id, functionName) => {
  const patches = modIndex[id][functionName].before;

  if (patches.length === 0) return args;

  let newArgs = args;

  for (const patch of patches) {
    try {
      let toSetNewArgs = patch.call(context, args);

      if (toSetNewArgs === false) return false;

      if (Array.isArray(toSetNewArgs)) {
        newArgs = args;
      }
    } catch (e) {
      console.error(`Before patch (${id} - ${functionName}) failed, skipping`, e);
    }
  }

  return newArgs;
};

const afterPatches = (context, newArgs, returnValue, id, functionName) => {
  const patches = modIndex[id][functionName].after;
  
  let newReturnValue = returnValue;

  for (const patch of patches) {
    try {
      let toSetReturnValue = patch.call(context, newArgs, newReturnValue);

      if (toSetReturnValue) {
        newReturnValue = toSetReturnValue;
      }
    } catch (e) {
      console.error(`After patch (${id} - ${functionName}) failed, skipping`, e);
    }
  }
  
  return newReturnValue;
};

const generateNewFunction = (originalFunction, id, functionName) => (function (...args) {
  const newArgs = beforePatches(this, args, id, functionName);

  if (Array.isArray(newArgs)) {
    const returnValue = originalFunction.call(this, ...newArgs);

    return afterPatches(this, newArgs, returnValue, id, functionName);
  }
});

export const patch = (parent, functionName, handler, before = false) => {
  if (!parent._patcherId) {
    const id = generateId();

    parent._patcherId = id;

    modIndex[id] = {};
  }

  const id = parent._patcherId;

  if (!modIndex[id][functionName]) {
    const originalFunctionClone = Object.assign({}, parent)[functionName];

    parent[functionName] = Object.assign(generateNewFunction(parent[functionName], id, functionName), originalFunctionClone);

    parent[functionName].toString = () => originalFunctionClone.toString(); // You cannot just set directly a.toString = b.toString like we used to because strange internal JS prototype things, so make a new function just to run original function

    modIndex[id][functionName] = {
      before: [],
      after: []
    };
  }

  const newLength = modIndex[id][functionName][before ? 'before' : 'after'].push(handler);

  return () => { // Unpatch function
    modIndex[id][functionName][before ? 'before' : 'after'].splice(newLength - 1, 1);
  };
};