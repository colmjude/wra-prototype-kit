
import utils from '../utils.js'

function FeatureDisplay (mapModule) {
  this.mapModule = mapModule
  this.map = mapModule.getMap()
}

FeatureDisplay.prototype.init = function (opts) {
  this.setOptions(opts)
  this.$list = document.querySelector(this.options.listSelector)

  const boundClickHandler = this.clickHandler.bind(this)
  this.map.on('click', boundClickHandler)
}

FeatureDisplay.prototype.clickHandler = function (e) {
  console.log('click location', e.lngLat.lng, e.lngLat.lat)
  const clickedOnFeatures = this.mapModule.getFeaturesByPoint(e.point)
  console.log('clicked on features', clickedOnFeatures)
  if (clickedOnFeatures.length) {
    this.displayAllFeatures(clickedOnFeatures)
  }
}

FeatureDisplay.prototype.clearDisplay = function () {
  this.$list.textContent = ''
}

FeatureDisplay.prototype.createListItem = function () {
  const $item = document.createElement('li')
  $item.classList.add(this.options.itemClass)
  return $item
}

FeatureDisplay.prototype.createPropertiesList = function (properties) {
  const _list = document.createElement('ul')
  _list.classList.add('properties-list')
  for (const p in properties) {
    const i = document.createElement('li')
    i.textContent = `${p}: ${properties[p]}`
    _list.appendChild(i)
  }
  return _list
}

FeatureDisplay.prototype.displayAllFeatures = function (features) {
  this.clearDisplay()
  const boundDisplayFeatureData = this.displayFeatureData.bind(this)
  features.forEach(boundDisplayFeatureData)
}

FeatureDisplay.prototype.displayFeatureData = function (feature, ind) {
  const $item = this.createListItem()
  const $heading = document.createElement('h4')
  $heading.classList.add('app-features__list__heading')
  if (typeof ind !== 'undefined') {
    $heading.textContent = `Feature ${ind + 1}`
  } else {
    $heading.textContent = 'Feature'
  }
  $item.appendChild($heading)
  const $props = this.createPropertiesList(feature.properties)
  $item.appendChild($props)

  this.$list.appendChild($item)
}

FeatureDisplay.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(optionDefaults, options)
}

const optionDefaults = {
  itemClass: 'app-features__list',
  listSelector: '.app-features__list'
}

export default FeatureDisplay
