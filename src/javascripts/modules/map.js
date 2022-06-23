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

Map.prototype.addGeojsonSource = function (sourceName, endpoint) {
  this.map.addSource(sourceName, {
    type: 'geojson',
    data: endpoint
  })
}

Map.prototype.addPolygonLayer = function (layerName, sourceName, paintOptions, defaultSmoothZoomingEnabled = true) {
  this.map.addLayer({
    id: `${layerName}Fill`,
    type: 'fill',
    source: sourceName,
    layout: {},
    paint: {
      'fill-color': paintOptions.fillColor,
      'fill-opacity': paintOptions.fillOpacity
    }
  })
  this.map.addLayer({
    id: `${layerName}Line`,
    type: 'line',
    source: sourceName,
    layout: {},
    paint: {
      'line-color': paintOptions.lineColor,
      'line-opacity': paintOptions.lineOpacity,
      'line-width': paintOptions.lineWidth
    }
  })

  if (defaultSmoothZoomingEnabled) {
    this.enableSmoothZoomForPolygonLayer(layerName)
  }
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

Map.prototype.enableSmoothZoomForPolygonLayer = function (layerName) {
  // to do - check layer exists
  this.setLayerPaintPropertyZoomChange(`${layerName}Fill`, 'fill-opacity', {
    minLevel: 6,
    minValue: 0.6,
    maxLevel: 15,
    maxValue: 0.2
  })

  this.setLayerPaintPropertyZoomChange(`${layerName}Line`, 'line-width', {
    minLevel: 7,
    minValue: 1,
    maxLevel: 15,
    maxValue: 3
  })
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

Map.prototype.setLayerPaintPropertyZoomChange = function (layerName, propertyName, zoomSettings) {
  this.map.setPaintProperty(layerName, propertyName, [
    'interpolate',
    ['exponential', 0.5],
    ['zoom'],
    zoomSettings.minLevel,
    zoomSettings.minValue,
    zoomSettings.maxLevel,
    zoomSettings.maxValue
  ])
}

const mapDefaults = {
  fullscreen: true,
  onLoadCallback: undefined,
  mapElementID: 'mapId'
}

export default Map
