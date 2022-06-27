/* global fetch */

function OSM (map, selector) {
  this.map = map
  this.selector = selector
}

OSM.prototype.init = function () {
  this.$element = document.querySelector(this.selector)

  const boundClickHandler = this.clickHandler.bind(this)
  this.map.on('click', boundClickHandler)
}

OSM.prototype.clickHandler = function (evt) {
  this.getOSMData(evt.lngLat)
}

OSM.prototype.displayAddress = function (osmData) {
  this.$element.textContent = osmData.display_name
}

OSM.prototype.generateOSMEndpoint = function (lng, lat) {
  return `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&bounded=0&polygon_geojson=1&priority=5&accept-language=en-GB`
}

OSM.prototype.getOSMData = function (coord) {
  const that = this
  fetch(this.generateOSMEndpoint(coord.lng, coord.lat))
    .then(response => response.json())
    .then(function (data) {
      that.displayAddress(data)
    })
}

export default OSM
