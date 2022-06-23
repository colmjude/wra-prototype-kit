/* global maplibregl, fetch */
import mapHelpers from '../javascripts/map-helpers'
import * as WRA from './map-prototypes'

// helpers used in script
const createMarker = mapHelpers.createMarker

// platform endpoint
const LA_BOUNDARIES_ENDPOINT = 'https://geoserverlp.azurewebsites.net/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3AHighWaterMark4326&maxFeatures=50&outputFormat=application%2Fjson'
//const LA_BOUNDARIES_ENDPOINT = '/static/data/platform-la-boundaries.json'
const attrToMatchOn = 'name_en'

function renderBoundaries (appmap) {
  fetch(LA_BOUNDARIES_ENDPOINT)
    .then(response => response.json())
    .then(function (data) {
      console.log(data)

      appmap.addGeojsonSource('laBoundaries', LA_BOUNDARIES_ENDPOINT)
      appmap.addPolygonLayer('laLayer', 'laBoundaries', {
        fillColor: '#088',
        fillOpacity: 0.4,
        lineColor: '#088',
        lineOpacity: 0.8,
        lineWidth: 1
      })
    })
}

const getLocalAuthorityFeatures = function (map, pt) {
  const features = map.queryRenderedFeatures(pt)
  return features.filter(feature => feature.layer.source === 'laBoundaries')
}

function loadHandler (module) {
  console.log('handler', this)
  renderBoundaries(module)
}

const $mapEl = document.querySelector('[data-module="wra-map"]')
const mapComponent = new WRA.Map($mapEl).init({
  onLoadCallback: loadHandler
})

const marker = createMarker()
const $lat = document.querySelector('.app-dynamic-latitude')
const $lng = document.querySelector('.app-dynamic-longitude')
const $laName = document.querySelector('.app-dynamic-la-name')

// add listener for when map clicked on
mapComponent.addEventHandler('click', function (e, appmap) {
  const map = appmap.getMap()
  console.log('map clicked on', e)
  console.log('click location', e.lngLat.lng, e.lngLat.lat)
  console.log('point', e.point)
  const boundaries = getLocalAuthorityFeatures(map, e.point)
  console.log('clicked on boundaries', boundaries)

  $lat.classList.remove('app-no-value')
  $lat.textContent = e.lngLat.lat
  $lng.classList.remove('app-no-value')
  $lng.textContent = e.lngLat.lng

  // need to handle no boundary returned
  $laName.classList.remove('app-no-value')
  $laName.textContent = boundaries[0].properties[attrToMatchOn]

  // put marker at point user clicked
  marker
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .addTo(map)
})

window.WRA = WRA
window.appmap = mapComponent
