/* global maplibregl, fetch */

import mapHelpers from '../javascripts/map-helpers'
import utils from '../javascripts/utils'

// helpers used in script
const createMarker = mapHelpers.createMarker
const getBBox = mapHelpers.generateBBox
const capitalizeEachWord = utils.capitalizeEachWord

// platform endpoint
const LA_BOUNDARIES_ENDPOINT = 'https://landplatform.azurefd.net/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3AHighWaterMark4326&maxFeatures=50&outputFormat=application%2Fjson'
//const LA_BOUNDARIES_ENDPOINT = '/static/data/platform-la-boundaries.json'
const attrToMatchOn = 'name_en'

const createMap = function () {
  const map = new maplibregl.Map({
    container: 'mapId', // container id
    style: '/static/javascripts/base-tile.json',
    center: [-3.7, 52.4], // starting position [lng, lat]
    zoom: 6.89// starting zoom
  })

  map.addControl(new maplibregl.FullscreenControl({
    container: document.querySelector('#mapId')
  }), 'bottom-left')
  return map
}

const applyLayerFilters = function () {
  if (!urlParams.has('region')) {
    return false
  }

  const filter = ['==', attrToMatchOn, capitalizeEachWord(urlParams.get('region').toLowerCase().replace('+', ' '))]
  map.setFilter('laLayer', filter)

  let flownTo = false
  const sourceName = 'laBoundaries'
  map.on('sourcedata', function (e) {
    if (!flownTo) {
      if (map.getSource(sourceName) && map.isSourceLoaded(sourceName)) {
        const features = flyToBoundary(map, filter, true)

        if (features.length) {
          flownTo = true
        }
      }
    }
  })
  flyToBoundary(map, filter)
}

const flyToBoundary = function (map, filter, returnFeatures) {
  const matchedFeatures = map.querySourceFeatures('laBoundaries', {
    filter: filter
  })

  console.log('attempting to fly to boundary')
  console.log(map.isSourceLoaded('laBoundaries'))
  console.log(filter, matchedFeatures)

  if (matchedFeatures.length) {
    const bbox = getBBox(matchedFeatures)
    map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]])
  }

  if (returnFeatures) {
    return matchedFeatures
  }
}

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
      // apply any filters if they exist
      applyLayerFilters()
    })
}

const getLocalAuthorityFeatures = function (map, pt) {
  const features = map.queryRenderedFeatures(pt)
  return features.filter(feature => feature.layer.source === 'laBoundaries')
}

const map = createMap()
const marker = createMarker()
const $lat = document.querySelector('.app-dynamic-latitude')
const $lng = document.querySelector('.app-dynamic-longitude')
const $laName = document.querySelector('.app-dynamic-la-name')
// get the url params
const urlParams = (new URL(document.location)).searchParams
// if region is not set then do something
// else if it is set then need to set filter on boundaries layer
console.log(urlParams.get('region'))

// add listener for when initial map loaded
map.on('load', function (e) {
  console.log('map loaded')
  renderBoundaries(map)
})
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

window.wramap = map
window.flyToBoundary = flyToBoundary
window.utils = utils
