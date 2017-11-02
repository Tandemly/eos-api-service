const { isArray, mapValues, mapKeys, isObject, zipObject, map, keys, filter } = require('lodash');

const getAllFieldsProjection = (schema) => {
  // remove system fields /^__.*/
  const ownFields = filter(keys(schema.schema.paths), k => !/^__/.test(k));
  // build projection object
  return zipObject(ownFields, map(ownFields, () => 1));
};

//
// Helpers for use with lodash
//

// filter for keys that match a given regex pattern
const keyMatches = regex => (val, key) => regex.test(key);

// will modify keys by trimming `len` characters from the beginning
const trimLeft = len => (val, key) => key.slice(len);

// Recursive mapKeys
const mapKeysDeep = (obj, cb) =>
  (isArray(obj)
    ? map(obj, v => mapKeysDeep(v, cb))
    : mapValues(mapKeys(obj, cb), val => (isObject(val) ? mapKeysDeep(val, cb) : val)));

const pad = number => (number < 10 ? `0${number}` : number);

const formatISO = d =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

module.exports = {
  getAllFieldsProjection,
  mapKeysDeep,
  keyMatches,
  trimLeft,
  formatISO,
};
