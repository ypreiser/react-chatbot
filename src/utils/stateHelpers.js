// Utility functions for managing complex/nested state immutably

/**
 * Performs a deep clone of a JSON-serializable object.
 * WARNING: Loses functions, Dates, Regexps, Maps, Sets, etc.
 * Suitable for simple state structures like the system prompt form.
 * For more complex state, consider libraries like Immer.
 * @param {object|array} obj - The object or array to clone.
 * @returns {object|array} A deep clone of the input.
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
      return obj; // Return primitives directly
  }
  try {
      return JSON.parse(JSON.stringify(obj));
  } catch (e) {
      console.error("Deep clone failed. Falling back to shallow clone.", e);
      // Fallback or throw error depending on needs
      return Array.isArray(obj) ? [...obj] : { ...obj };
  }
};

/**
* Gets a nested value from an object using a path array (e.g., ['openingHours', 'Sunday']).
* @param {object} obj - The source object.
* @param {string[]} pathParts - An array of keys representing the path.
* @returns {*} The value at the path, or undefined if the path doesn't exist.
*/
export const getNestedValue = (obj, pathParts) => {
let current = obj;
for (let i = 0; i < pathParts.length; i++) {
  const part = pathParts[i];
  if (current === null || current === undefined || typeof current !== 'object') {
      return undefined; // Path does not exist
  }
   // Handle array indices (string or number)
   const index = parseInt(part, 10);
   if (Array.isArray(current) && !isNaN(index) && index >= 0 && index < current.length) {
       current = current[index];
   } else if (typeof current === 'object' && !Array.isArray(current) && part in current) {
      current = current[part];
   } else {
       return undefined; // Part not found in object or array
   }
}
return current;
};

/**
* Sets a nested value in a cloned object using a path array.
* Creates intermediate objects/arrays if they don't exist.
* @param {object} obj - The original object.
* @param {string[]} pathParts - Array of keys/indices representing the path.
* @param {*} value - The value to set.
* @returns {object} A new object with the value set at the nested path.
*/
export const setNestedValue = (obj, pathParts, value) => {
if (!pathParts || pathParts.length === 0) {
  console.error("setNestedValue requires a path.");
  return obj; // Return original object if path is invalid
}

const newObj = deepClone(obj); // Start with a clone
let current = newObj;

for (let i = 0; i < pathParts.length - 1; i++) {
  const part = pathParts[i];
  const nextPart = pathParts[i + 1];

  // Determine if the current part should point to an array or object
  const isNextPartArrayIndex = typeof nextPart === 'number' || (typeof nextPart === 'string' && /^\d+$/.test(nextPart));

  // If the current part doesn't exist or is not the correct type (object/array)
  if (current[part] === null || typeof current[part] !== 'object') {
    current[part] = isNextPartArrayIndex ? [] : {};
  }
   // If it exists but is the wrong type (e.g., should be array but is object)
   else if (isNextPartArrayIndex && !Array.isArray(current[part])) {
       console.warn(`Path conflict in setNestedValue: expected array at '${part}', found object. Overwriting.`);
       current[part] = [];
   } else if (!isNextPartArrayIndex && Array.isArray(current[part])) {
        console.warn(`Path conflict in setNestedValue: expected object at '${part}', found array. Overwriting.`);
        current[part] = {};
   }

  current = current[part];
}

// Set the final value
const finalPart = pathParts[pathParts.length - 1];
 const finalIndex = parseInt(finalPart, 10);
 if (Array.isArray(current) && !isNaN(finalIndex)) {
     // Ensure array is large enough if setting by index directly
     if (finalIndex >= current.length) {
         // Pad with nulls if necessary, though typically array updates use push/splice
         // This path might indicate an issue if trying to set an index far beyond the end
         while(current.length <= finalIndex) {
             current.push(undefined); // Or null depending on desired behavior
         }
     }
     current[finalIndex] = value;
 } else {
     current[finalPart] = value;
 }

return newObj;
};


/**
* Immutably updates an array located at a nested path within an object.
* @param {object} currentState - The current state object.
* @param {string} path - Dot-separated path string to the array (e.g., 'tools.purposes').
* @param {function(array): array} arrayModifierFn - Function that receives a *copy* of the array and returns the *new* array.
* @returns {object} A new state object with the modified array.
*/
export const updateArrayByPath = (currentState, path, arrayModifierFn) => {
const pathParts = path.split('.');
if (pathParts.length < 1) {
    console.error("updateArrayByPath requires a valid path string.");
    return currentState;
}

const arrayKey = pathParts[pathParts.length - 1];
const pathToParent = pathParts.slice(0, -1);

const newState = deepClone(currentState);
let parentObject = newState;

// Navigate to the parent object
for (const part of pathToParent) {
  if (parentObject[part] === null || typeof parentObject[part] !== 'object') {
    // If path doesn't exist, create intermediate objects
    parentObject[part] = {};
  }
  parentObject = parentObject[part];
}

// Get the original array (or initialize if it doesn't exist)
const originalArray = parentObject[arrayKey];
if (!Array.isArray(originalArray)) {
    // If the key exists but isn't an array, or doesn't exist, initialize as empty array
    console.warn(`Initializing non-array or missing path '${path}' as empty array.`);
    parentObject[arrayKey] = [];
}

// Apply the modifier function to a shallow copy of the array
const modifiedArray = arrayModifierFn([...parentObject[arrayKey]]);

// Set the modified array back onto the parent object in the new state
parentObject[arrayKey] = modifiedArray;

return newState;
};