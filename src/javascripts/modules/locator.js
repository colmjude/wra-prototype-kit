import utils from '../utils.js'
import geoHelpers from '../geohelpers'

/* global fetch, CustomEvent */

function Locator ($inputContainer, $summaryContainer) {
  this.$inputContainer = $inputContainer
  this.$summaryContainer = $summaryContainer
}

Locator.prototype.init = function (options) {
  this.setOptions(options)

  this.$locationDisplay = this.$summaryContainer.querySelector('.app-current-location')
  this.$locationDisplay.classList.add('js-hidden')

  this.$resultsContainer = this.$summaryContainer.querySelector('.app-locator-results')
  this.$resultsContainer.classList.add('js-hidden')

  // listen for click on current location option
  this.$curentLocationBtn = this.$inputContainer.querySelector('.app-current-location-button')
  const boundGetCurrentLocation = this.getCurrentLocation.bind(this)
  this.$curentLocationBtn.addEventListener('click', boundGetCurrentLocation)

  // listen for clicks on defautl option
  this.$defaultLocationBtn = this.$inputContainer.querySelector('.app-default-location-button')
  const boundUseDefaultCoords = this.useDefaultCoords.bind(this)
  this.$defaultLocationBtn.addEventListener('click', boundUseDefaultCoords)

  this.$input = this.$inputContainer.querySelector('[data-locator="locator-input"]')
  const boundInputHandler = this.inputHandler.bind(this)
  this.$input.addEventListener('blur', boundInputHandler)
}

Locator.prototype.dispatchDataEvent = function (data) {
  const dataEvent = new CustomEvent('dataRetrieved', { detail: { data: data } })
  this.$summaryContainer.dispatchEvent(dataEvent)
}

Locator.prototype.displayLocation = function (coords) {
  this.$locationDisplay.classList.remove('js-hidden')
  const $lat = this.$locationDisplay.querySelector('.app-current-location--latitude')
  const $lng = this.$locationDisplay.querySelector('.app-current-location--longitude')
  $lat.textContent = coords.latitude
  $lng.textContent = coords.longitude
}

Locator.prototype.getBBoxFromPoint = function (coords) {
  return geoHelpers.getBBox(geoHelpers.convertPointToFeature(coords.latitude, coords.longitude, 0.01))
}

Locator.prototype.getCurrentLocation = function () {
  const that = this
  geoHelpers.getLocation(function (e) {
    that.displayLocation(e.coords)
    that.performQuery(e.coords)
  }, function (e) {
    console.log('Error', e)
  })
}

Locator.prototype.getLatLng = function (s) {
  const inputSplit = s.split(',')
  console.log(inputSplit)
  if (inputSplit.length !== 2) {
    return { error: "can't parse string" }
  }
  return {
    latitude: parseFloat(inputSplit[0]),
    longitude: parseFloat(inputSplit[1])
  }
  // if (inputSplit.every((input) => typeof (parseFloat(input)) === 'number')) {
  //   return { error: 'input not floats' }
  // }
}

Locator.prototype.inputHandler = function (e) {
  console.log('input blur event fired')
  const inputValue = e.target.value
  const parsedInput = this.getLatLng(inputValue)
  if (Object.keys(parsedInput).includes('error')) {
    console.log('Error with input', parsedInput)
  } else {
    this.displayLocation(parsedInput)
    this.performQuery(parsedInput)
  }
}

Locator.prototype.performQuery = function (coords) {
  const that = this
  const bbox = this.getBBoxFromPoint(coords)
  const endpoint = `https://landplatform.azurefd.net/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=${this.options.layersStr}&bbox=${bbox[1]}%2C${bbox[0]}%2C${bbox[3]}%2C${bbox[2]}&width=768&height=523&srs=EPSG%3A4326&styles=&format=geojson`
  console.log('query endpoint', endpoint)
  // hide results until data collected
  // worth adding a loader?
  this.$resultsContainer.classList.add('js-hidden')
  fetch(endpoint)
    .then(response => response.json())
    .then(function (data) {
      // displayIfInWales(isInWales(data.features))
      that.$resultsContainer.classList.remove('js-hidden')
      that.dispatchDataEvent(data)
      console.log(data)
    })
}

Locator.prototype.useDefaultCoords = function () {
  // const coords = {
  //   latitude: 52.05935795369581,
  //   longitude: -3.5725398780735134
  // }
  const coords = {
    latitude: 51.85804448624384,
    longitude: -3.138910073077568
  }
  this.displayLocation(coords)
  this.performQuery(coords)
}

Locator.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(locatorDefaults, options)
}

const locatorDefaults = {
  elementSelector: '.app-dynamic__osm-address',
  layersStr: 'HighWaterMark4326,NRW_NATIONAL_PARKPolygon4326,GWC21_Community_Wards4326,conservation_areas,nationalBoundaries'
}

export default Locator
