/* global maplibregl, turf */

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

export default mapHelpers
