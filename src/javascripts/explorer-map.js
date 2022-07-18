import mapHelpers from '../javascripts/map-helpers'
import * as WRA from './map-prototypes'
import geoHelpers from './geohelpers'

// helpers used in script
const createMarker = mapHelpers.createMarker

// platform endpoint
const LA_BOUNDARIES_ENDPOINT = 'https://landplatform.azurefd.net/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3AHighWaterMark4326&maxFeatures=50&outputFormat=application%2Fjson'
//const LA_BOUNDARIES_ENDPOINT = '/static/data/platform-la-boundaries.json'
const attrToMatchOn = 'name_en'

const marker = createMarker()

function loadHandler (module) {
  console.log('map loaded')
  const featureDisplay = new WRA.FeatureDisplay(module).init({
    onlyDisplayAfterFirstClick: true
  })
  const $controlsList = document.querySelector('[data-module="layer-controls"]')
  const layerControlsComponent = new WRA.LayerControls($controlsList, module).init({})
  const osmComponent = new WRA.OSM(module.getMap()).init({})
  const wtwComponent = new WRA.WTW(module.getMap()).init({})
}

const $mapEl = document.querySelector('[data-module="wra-map"]')
const mapComponent = new WRA.Map($mapEl).init({
  onLoadCallback: loadHandler,
  permalink: true
})

// add listener for when map clicked on
mapComponent.addEventHandler('click', function (e, appmap) {
  const map = appmap.getMap()

  // put marker at point user clicked
  marker
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .addTo(map)
})

geoHelpers.getLocation(function (e) {
  console.log('Success', e)
  const bbox = geoHelpers.getBBox(geoHelpers.convertPointToFeature(e.coords.latitude, e.coords.longitude, 0.01))
  console.log('Current location', bbox)
}, function (e) {
  console.log('Error', e)
})

window.appmap = mapComponent
