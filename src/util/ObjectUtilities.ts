export const ObjectUtilities = {
  isEqual(objA, objB) {
    if (!objA || !objB) {
      return !objA && !objB;
    }

    let aKeys = Object.keys(objA),
      bKeys = Object.keys(objB);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (let key of aKeys) {
      if (!objB.hasOwnProperty(key) || objA[key] !== objB[key]) {
        return false;
      }
    }
    return true;
  },

  deepExtend (destination, source) {
    for (let property of source) {
      if (source[property] && source[property].constructor &&
        source[property].constructor === Object) {
        destination[property] = destination[property] || {};
        ObjectUtilities.deepExtend(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  }

};

