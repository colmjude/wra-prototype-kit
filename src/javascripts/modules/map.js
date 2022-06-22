import utils from '../utils.js'

/* global maplibregl */

function Map ($module) {
  this.$module = $module
}

Map.prototype.init = function (opts) {
  this.initialMapLoaded = false
  this.setOptions(opts)
  this.createMap()

  const boundOnMapLoad = this.onMapLoad.bind(this)
  this.map.on('load', boundOnMapLoad)

  return this
}

Map.prototype.createMap = function () {
  this.map = new maplibregl.Map({
    container: this.options.mapElementID, // container id
    style: '/static/javascripts/base-tile.json',
    center: [-3.7, 52.4], // starting position [lng, lat]
    zoom: 6.89// starting zoom
  })

  if (this.options.fullscreen) {
    this.map.addControl(new maplibregl.FullscreenControl({
      container: document.querySelector(`#${this.options.mapElementID}`)
    }), 'bottom-left')
  }
}

Map.prototype.getMap = function () {
  return this.map
}

Map.prototype.onMapLoad = function (e) {
  console.log('map has loaded')
  this.initialMapLoaded = true

  const that = this
  if (this.options.onLoadCallback) {
    this.options.onLoadCallback(that)
  }
}

Map.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(mapDefaults, options)
}

const mapDefaults = {
  fullscreen: true,
  onLoadCallback: undefined,
  mapElementID: 'mapId'
}

export default Map
