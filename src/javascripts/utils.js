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

export default utils
