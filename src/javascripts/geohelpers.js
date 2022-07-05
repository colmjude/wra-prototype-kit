/* global turf */
const geoHelpers = {}

geoHelpers.convertPointToFeature = function (lat, lng, buffer = 0) {
  const pt = turf.point([lat, lng])
  if (buffer) {
    return turf.buffer(pt, buffer, { units: 'kilometers' })
  }
  return pt
}

geoHelpers.getBBox = function (featureCollection) {
  return turf.bbox(featureCollection)
}

geoHelpers.getLocation = function (successCallback, errorCallback) {
  if (!navigator.geolocation) {
    console.log('Geolocation unavailable')
  } else {
    console.log('Geolocation available')
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }
}

export default geoHelpers
