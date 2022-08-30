import SelectMap from './selecting-module'

/* global turf */

function RadiusMap ($item) {
  SelectMap.call(this, $item)
}

RadiusMap.prototype = Object.create(SelectMap.prototype)
RadiusMap.prototype.constructor = SelectMap

RadiusMap.prototype.addCircleLayer = function () {
  this.mapModule.addPolygonLayer('circles', 'radius', {
    fillColor: '#ff0000',
    fillOpacity: 0.4,
    lineColor: '#ff0000',
    lineOpacity: 0.8,
    lineWidth: 1
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
  console.log('circle', circle)
  this.fetchStats(circle.geometry)
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

export default RadiusMap
