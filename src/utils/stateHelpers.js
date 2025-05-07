// --- START OF FILE src/utils/stateHelpers.js ---
// Utility function to handle nested state updates

// Clones state deeply (simple approach sufficient for this structure)
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Gets a nested value from an object using a path array (e.g., ['openingHours', 'Sunday'])
export const getNestedValue = (obj, pathParts) => {
  let current = obj;
  for (let i = 0; i < pathParts.length; i++) {
    // Handle null/undefined or non-object intermediate paths gracefully
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = current[pathParts[i]];
  }
  return current;
};

// Sets a nested value in a cloned object using a path array
export const setNestedValue = (obj, pathParts, value) => {
  const newObj = deepClone(obj); // Start with a fresh clone
  let current = newObj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    // If the key doesn't exist or isn't an object/array, create it
    if (current[part] === null || typeof current[part] !== 'object' || current[part] === undefined) {
       // Determine if next part is an index (number-like) or a key
       // This is a heuristic, safer would be to know schema or structure based on path
       if (typeof pathParts[i+1] === 'number' || (typeof pathParts[i+1] === 'string' && /^\d+$/.test(pathParts[i+1]))) {
            current[part] = []; // Assume it should be an array
       } else {
            current[part] = {}; // Assume it should be an object
       }
    }
    current = current[part];
  }
  current[pathParts[pathParts.length - 1]] = value;
  return newObj;
};

// Handles updates for arrays nested within the state
// Takes the current state, the path to the array (e.g., 'languageRules', 'tools.purposes'),
// and a function that receives the array and returns the modified array.
export const updateArrayByPath = (currentState, path, arrayModifierFn) => {
  const pathParts = path.split('.'); // Split the string path
  const arrayPathParts = pathParts.slice(0, -1); // Path to the parent object
  const arrayKey = pathParts[pathParts.length - 1]; // Key for the array itself

  const newPrompt = deepClone(currentState); // Clone the state
  let current = newPrompt;

  // Navigate to the parent object containing the array
  for (let i = 0; i < arrayPathParts.length; i++) {
     const part = arrayPathParts[i];
      // If the key doesn't exist or isn't an object, create it
     if (current[part] === null || typeof current[part] !== 'object' || current[part] === undefined) {
         current[part] = {}; // Ensure parent objects exist
     }
     current = current[part];
  }

  // Get the array, apply the modifier function to a copy, and set it back
  const originalArray = current[arrayKey] || [];
  const newArray = arrayModifierFn([...originalArray]); // Modify a copy
  current[arrayKey] = newArray;

  return newPrompt; // Return the new state object
};
// --- END OF FILE src/utils/stateHelpers.js ---