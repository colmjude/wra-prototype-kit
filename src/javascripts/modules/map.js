import utils from '../utils.js'
import Permalink from './permalink'

/* global maplibregl */

function Map ($module) {
  this.$module = $module
}

Map.prototype.init = function (opts) {
  this.initialMapLoaded = false
  this.events = {}
  this.polygonLayers = {}
  this.setOptions(opts)
  this.createMap()

  const boundOnMapLoad = this.onMapLoad.bind(this)
  this.map.on('load', boundOnMapLoad)

  return this
}

Map.prototype.addClass = function (class_) {
  this.$module.classList.add(class_)
}

Map.prototype.addEventHandler = function (event, callback) {
  const that = this
  this.map.on(event, function (evt) {
    callback(evt, that)
  })
  return this
}

Map.prototype.addEmptySource = function (sourceName) {
  // same as a geojson layer but with empty Feature collection
  this.addGeojsonSource(sourceName, {
    type: 'FeatureCollection',
    features: []
  })
}

Map.prototype.addGeojsonSource = function (sourceName, endpoint) {
  // to do: change param name from endpoint to ?
  this.map.addSource(sourceName, {
    type: 'geojson',
    data: endpoint
  })
}

Map.prototype.addFillLayer = function (layerName, sourceName, paintOptions) {
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
}

Map.prototype.addPolygonLayer = function (layerName, sourceName, paintOptions, defaultSmoothZoomingEnabled = true) {
  if (Object.prototype.hasOwnProperty.call(this.polygonLayers, sourceName)) {
    console.log(`already added layers for ${sourceName}`)
    return this
  }

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

  this.polygonLayers[sourceName] = [`${layerName}Fill`, `${layerName}Line`]
  return this
}

Map.prototype._bringToFront = function (layer) {
  this.map.moveLayer(layer)
}

Map.prototype.bringToFront = function (layer) {
  const that = this
  if (Array.isArray(layer)) {
    layer.forEach(function (l) {
      that._bringToFront(l)
    })
  } else {
    this._bringToFront(layer)
  }
}

Map.prototype.createMap = function () {
  let initialPosition = this.options.initialMapPosition

  if (this.options.permalink) {
    initialPosition = Permalink.getMapLocation(initialPosition.zoom, initialPosition.center)
  }

  console.log(initialPosition)
  this.map = new maplibregl.Map({
    container: this.options.mapElementID, // container id
    style: '/static/javascripts/base-tile.json',
    center: initialPosition.center, // starting position [lng, lat]
    zoom: initialPosition.zoom// starting zoom
  })
  console.log(this.map)

  if (this.options.permalink) {
    Permalink.setup(this.map)
  }

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

Map.prototype.getFeaturesByPoint = function (pt) {
  // could we use map.queryRenderedFeatures(bbox, {layers: clickableLayers})
  let features = this.map.queryRenderedFeatures(pt)
  // assuming all layers added are interactive
  const interactiveLayers = Object.keys(this.polygonLayers)
  console.log('interactive layers', interactiveLayers)
  // remove base vector layer features
  features = features.filter(feature => interactiveLayers.indexOf(feature.layer.source) !== -1)
  return this.removeDuplicates(features)
}

Map.prototype.getMap = function () {
  return this.map
}

Map.prototype.hideLayer = function (layerId) {
  this._setLayerVisibility(layerId, 'none')
}

Map.prototype.onMapLoad = function (e) {
  this.initialMapLoaded = true

  const that = this
  if (this.options.onLoadCallback) {
    this.options.onLoadCallback(that)
  }
}

Map.prototype.removeClass = function (class_) {
  this.$module.classList.remove(class_)
}

// problematic function when there is no consistency between attributes used by datasets
Map.prototype.removeDuplicates = function (features) {
  const uniqueFeatures = []

  return features.filter(function (feature) {
    // this would be easier if there was a common idenitfier for every feature (id, name, etc)
    // needs to be present for all features
    const props = Object.keys(feature.properties)
    if (props.includes('objectid') && uniqueFeatures.indexOf(feature.properties.objectid) === -1) {
      uniqueFeatures.push(feature.properties.objectid)
      return true
    }
    if (props.includes('ogc_fid') && uniqueFeatures.indexOf(feature.properties.ogc_fid) === -1) {
      uniqueFeatures.push(feature.properties.ogc_fid)
      return true
    }
    if (props.includes('inspireid') && uniqueFeatures.indexOf(feature.properties.ogc_fid) === -1) {
      uniqueFeatures.push(feature.properties.ogc_fid)
      return true
    }
    return false
  })
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

Map.prototype.setSourceData = function (sourceName, data) {
  this.map.getSource(sourceName).setData(data)
}

Map.prototype.showLayer = function (layerId) {
  this._setLayerVisibility(layerId, 'visible')
}

Map.prototype._setLayerVisibility = function (layerId, visibility) {
  this.map.setLayoutProperty(
    layerId,
    'visibility',
    visibility
  )
}

Map.prototype.togglePolygonLayerVisibility = function (layerName, toEnable) {
  const visibility = (toEnable) ? 'visible' : 'none'
  const layers = this.polygonLayers[layerName]
  console.log(layerName, layers)
  layers.forEach(layerId => this._setLayerVisibility(layerId, visibility))
}

const mapDefaults = {
  fullscreen: true,
  onLoadCallback: undefined,
  mapElementID: 'mapId',
  initialMapPosition: {
    center: [-3.7, 52.4],
    zoom: 6.89
  }
}

export default Map
