const utils = {}

utils.capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/*
  Takes 2 objects and performs a shallow merge
  Returns a new obj
*/
utils.extend = function (obj1, obj2) {
  const extended = obj1

  const merge = function (obj) {
    for (const prop in obj) {
      if (Object.hasOwnProperty.call(obj, prop)) {
        // Push each value from `obj` into `extended`
        extended[prop] = obj[prop]
      }
    }
  }

  merge(obj2)
  return extended
}

export default utils
