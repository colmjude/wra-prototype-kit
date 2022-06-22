/* global maplibregl, fetch */
import mapHelpers from '../javascripts/map-helpers'
import * as WRA from './map-prototypes'

// helpers used in script
const createMarker = mapHelpers.createMarker

// platform endpoint
const LA_BOUNDARIES_ENDPOINT = 'https://geoserverlp.azurewebsites.net/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3AHighWaterMark4326&maxFeatures=50&outputFormat=application%2Fjson'
//const LA_BOUNDARIES_ENDPOINT = '/static/data/platform-la-boundaries.json'
const attrToMatchOn = 'name_en'

function renderBoundaries (map) {
  fetch(LA_BOUNDARIES_ENDPOINT)
    .then(response => response.json())
    .then(function (data) {
      console.log(data)
      map.addSource('laBoundaries', {
        type: 'geojson',
        data: LA_BOUNDARIES_ENDPOINT
      })
      map.addLayer({
        id: 'laLayer',
        type: 'fill',
        source: 'laBoundaries',
        layout: {},
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.4
        }
      })
      map.addLayer({
        id: 'laLayerLine',
        type: 'line',
        source: 'laBoundaries',
        layout: {},
        paint: {
          'line-color': '#088',
          'line-opacity': 0.8,
          'line-width': 1
        }
      })

      map.setPaintProperty('laLayer', 'fill-opacity', [
        'interpolate',
        // Set the exponential rate of change to 0.5
        ['exponential', 0.5],
        ['zoom'],
        // When zoom is 15, buildings will be beige.
        6,
        0.6,
        // When zoom is 18 or higher, buildings will be yellow.
        15,
        0.2
      ])

      map.setPaintProperty('laLayerLine', 'line-width', [
        'interpolate',
        // Set the exponential rate of change to 0.5
        ['exponential', 0.5],
        ['zoom'],
        // When zoom is 15, buildings will be beige.
        7,
        1,
        // When zoom is 18 or higher, buildings will be yellow.
        15,
        3
      ])
    })
}

const getLocalAuthorityFeatures = function (map, pt) {
  const features = map.queryRenderedFeatures(pt)
  return features.filter(feature => feature.layer.source === 'laBoundaries')
}

function loadHandler (module) {
  console.log('handler', this)
  renderBoundaries(module.getMap())
}

const $mapEl = document.querySelector('[data-module="wra-map"]')
const mapComponent = new WRA.Map($mapEl).init({
  onLoadCallback: loadHandler
})

const map = mapComponent.getMap()
const marker = createMarker()
const $lat = document.querySelector('.app-dynamic-latitude')
const $lng = document.querySelector('.app-dynamic-longitude')
const $laName = document.querySelector('.app-dynamic-la-name')

// add listener for when map clicked on
map.on('click', function (e) {
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
