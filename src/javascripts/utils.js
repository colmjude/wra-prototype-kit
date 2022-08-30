/* global fetch */

const utils = {}

utils.capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

utils.capitalizeEachWord = function (s) {
  const words = s.split(' ')
  const wordList = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  })
  return wordList.join(' ')
}

/*
  Takes 2 objects and performs a shallow merge
  Returns a new obj
*/
utils.extend = function (obj1, obj2) {
  // use the spread operator to force a (shallow) clone of the obj instead of a reference
  // https://stackoverflow.com/questions/12690107/clone-object-without-reference-javascript
  const extended = { ...obj1 }

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

utils.createElement = function (tag, textContent, classlist) {
  const $el = document.createElement(tag)
  $el.textContent = textContent
  if (classlist && classlist.length) {
    classlist.forEach((cls) => $el.classList.add(cls))
  }
  return $el
}

utils.createLink = function (href, text, classes = []) {
  const $link = document.createElement('a')
  $link.href = href
  $link.textContent = text
  if (classes.length) {
    $link.classList.add(...classes)
  }
  return $link
}

utils.randomHexColorCode = function () {
  const n = (Math.random() * 0xfffff * 1000000).toString(16)
  return '#' + n.slice(0, 6)
}

utils.getRelevantFeatures = function (features, dataType) {
  return features.filter(function (feature) {
    if (feature.id.includes(dataType)) {
      return true
    }
    return false
  })
}

utils.removeItemOnce = function (arr, value) {
  const index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

function numberWithCommas (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

utils.readableNumber = function (v) {
  const n = parseFloat(v)
  const d2 = n.toFixed(2)
  // use modulus to strip trailing 0s if whole number
  if (n % 1 === 0) {
    return numberWithCommas(parseInt(d2))
  }
  return numberWithCommas(d2)
}

export default utils
