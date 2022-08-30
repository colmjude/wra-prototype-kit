import utils from '../../utils.js'
import Map from '../map'

/* global fetch */

// set up the module
function SelectMap ($mapContainer) {
  this.$mapContainer = $mapContainer
}

// initiate module with any options
SelectMap.prototype.init = function (opts) {
  this.setOptions(opts)

  // select the main component wrapper
  this.$component = this.$mapContainer.closest('.app-selecting-area')
  this.$statsTemplate = document.getElementById('stats-template')
  this.$resultsContainer = this.$component.querySelector('.app-results')

  this.mapModule = this.createMap()

  return this
}

// function to create the basic map
SelectMap.prototype.createMap = function () {
  const boundOnBaseMapLoaded = this.onBaseMapLoaded.bind(this)
  return new Map(this.$mapContainer).init({
    initialMapPosition: this.options.initialMapPosition,
    onLoadCallback: boundOnBaseMapLoaded,
    mapElementID: this.options.mapElementID
  })
}

SelectMap.prototype.displayResults = function (data) {
  const $result = this.$statsTemplate.content.cloneNode(true)
  const stats = data.lr_transaction_stats[0]
  console.log(stats)

  // add results to stats template
  const $total = $result.querySelector('[data-aggregate="transactions"]')
  $total.textContent = utils.readableNumber(stats.count)
  const $avgPrice = $result.querySelector('[data-aggregate="avg-price"]')
  $avgPrice.textContent = utils.readableNumber(stats.avg)
  const $maxPrice = $result.querySelector('[data-aggregate="max-price"]')
  $maxPrice.textContent = utils.readableNumber(stats.max)
  const $minPrice = $result.querySelector('[data-aggregate="min-price"]')
  $minPrice.textContent = utils.readableNumber(stats.min)

  // empty container
  this.$resultsContainer.textContent = ''
  this.$resultsContainer.appendChild($result)
}

SelectMap.prototype.getMap = function () {
  return this.mapModule.map
}

SelectMap.prototype.fetchStats = function (geometry, callback) {
  const that = this
  fetch(`/prototypes/area-stats?geometry=${JSON.stringify(geometry)}`)
    .then(response => response.json())
    .then(function (data) {
      if (callback) {
        callback(data)
      } else {
        that.displayResults(data)
        that.resizeMap()
      }
    })
}

// function called once the map has loaded
SelectMap.prototype.onBaseMapLoaded = function (e) {
  console.log('default base map loaded event', e)
}

SelectMap.prototype.resizeMap = function () {
  const h = this.$component.offsetHeight
  this.$mapContainer.style.height = `${h}px`
  this.getMap().resize()
}

// merge options provided to init() with defaults
SelectMap.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(selectMapDefaults, options)
}

// default options
const selectMapDefaults = {
  initialMapPosition: {
    center: [-3.7, 52.4],
    zoom: 6.39
  },
  mapElementID: 'mapId'
}

export default SelectMap
