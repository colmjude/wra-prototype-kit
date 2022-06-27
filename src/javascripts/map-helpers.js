/* global maplibregl, turf, fetch */

const mapHelpers = {}

mapHelpers.createMarker = function (colour) {
  const c = colour || 'red'
  return new maplibregl.Marker({ color: c })
}

mapHelpers.generateBBox = function (features) {
  const collection = turf.featureCollection(features)
  const bufferedCollection = turf.buffer(collection, 1)
  const envelope = turf.envelope(bufferedCollection)
  return envelope.bbox
}

mapHelpers.generateOSMEndpoint = function (lng, lat) {
  return `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&bounded=0&polygon_geojson=1&priority=5&accept-language=en-GB`
}

mapHelpers.getOSMData = function (coord) {
  const endpoint = `https://nominatim.openstreetmap.org/reverse?lat=${coord.lat}&lon=${coord.lng}&format=json&bounded=0&polygon_geojson=1&priority=5&accept-language=en-GB`
  fetch(endpoint)
    .then(response => response.json())
    .then(function (data) {
      console.log(data)
    })
}

export default mapHelpers
