// common/helpers/deepMerge.js
//
// Merges `updates` into `base`, recursively — used so a partial settings
// update (e.g. just { appearance: { theme: 'dark' } }) only changes that one
// field and leaves every other setting untouched, instead of wiping them out.

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, updates) {
  const result = { ...base };

  for (const key of Object.keys(updates || {})) {
    const updateValue = updates[key];
    const baseValue = base ? base[key] : undefined;

    if (isPlainObject(updateValue) && isPlainObject(baseValue)) {
      result[key] = deepMerge(baseValue, updateValue);
    } else {
      result[key] = updateValue;
    }
  }

  return result;
}

module.exports = deepMerge;
