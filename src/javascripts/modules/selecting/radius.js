import utils from '../../utils.js'
import Map from '../map'
import mapHelpers from '../../map-helpers'

/* global turf */

function RadiusMap ($mapContainer) {
  this.$mapContainer = $mapContainer
}

RadiusMap.prototype.init = function (opts) {
  this.setOptions(opts)

  this.mapModule = this.createMap()

  return this
}

RadiusMap.prototype.addCircleLayer = function () {
  this.mapModule.addPolygonLayer('circles', 'radius', {
    fillColor: '#ff0000',
    fillOpacity: 0.4,
    lineColor: '#ff0000',
    lineOpacity: 0.8,
    lineWidth: 1
  })
}

RadiusMap.prototype.createMap = function () {
  const boundOnBaseMapLoaded = this.onBaseMapLoaded.bind(this)
  return new Map(this.$mapContainer).init({
    initialMapPosition: this.options.initialMapPosition,
    onLoadCallback: boundOnBaseMapLoaded
  })
}

RadiusMap.prototype.drawCircle = function (coord) {
  console.log(coord)
  const center = [coord.lng, coord.lat]
  const radius = 5
  const options = { steps: 50, units: 'kilometers', properties: { foo: 'bar' } }
  const circle = turf.circle(center, radius, options)
  const featureCollection = turf.featureCollection([
    circle
  ])
  this.mapModule.map.getSource('radius').setData(featureCollection)
  console.log(circle)
}

RadiusMap.prototype.onBaseMapLoaded = function (e) {
  console.log('map ready to go', e)

  this.mapModule.addEmptySource('radius')
  this.addCircleLayer()

  const boundOnClickHandler = this.onClickHandler.bind(this)
  this.mapModule.map.on('click', boundOnClickHandler)
}

RadiusMap.prototype.onClickHandler = function (e) {
  console.log(e)
  this.drawCircle(e.lngLat)
}

RadiusMap.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(RadiusMapDefaults, options)
}

const RadiusMapDefaults = {
  initialMapPosition: {
    center: [-3.7, 52.4],
    zoom: 6.39
  }
}

export default RadiusMap
