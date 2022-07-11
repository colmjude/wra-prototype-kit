import utils from '../utils.js'

/* global fetch */

function WTW (map, selector) {
  this.map = map
  this.selector = selector
}

WTW.prototype.init = function (opts) {
  this.setOptions(opts)
  this.$element = document.querySelector(this.options.elementSelector)

  if (this.options.mapInteractionEnabled) {
    const boundClickHandler = this.clickHandler.bind(this)
    this.map.on('click', boundClickHandler)
  }

  return this
}

WTW.prototype.clickHandler = function (evt) {
  this.getWTWData(evt.lngLat)
}

WTW.prototype.displayResult = function (data) {
  this.$element.classList.remove(this.options.noValueClass)
  this.$element.textContent = ''

  const $link = utils.createLink(data.map, data.words)
  this.$element.appendChild($link)
}

WTW.prototype.generateWTWEndpoint = function (lng, lat) {
  return `https://mapapi.what3words.com/api/convert-to-3wa?coordinates=${lat}%2C${lng}&language=en&format=json`
}

WTW.prototype.getWTWData = function (coord) {
  const that = this
  fetch(this.generateWTWEndpoint(coord.lng, coord.lat))
    .then(response => response.json())
    .then(function (data) {
      console.log('wtw', data)
      that.displayResult(data)
    })
}

WTW.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(WTWDefaults, options)
}

const WTWDefaults = {
  elementSelector: '.app-dynamic__wtw',
  mapInteractionEnabled: true,
  noValueClass: 'app-no-value'
}

export default WTW
