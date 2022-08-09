/* global fetch */
import { Map } from './map-prototypes'

const POSTCODE_AREAS_ENDPOINT = 'https://landplatform.azurefd.net/geoserver/test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=test%3Apostcode_boundaries&maxFeatures=103400&outputFormat=application%2Fjson'
const sourceName = 'postcodeAreas'

function trackDataLoad (mapModule) {
  const mapContainer = document.querySelector('.app-map__wrapper')
  mapContainer.classList.add('fetching-data')
  const map = mapModule.map

  function loadedHandler (e) {
    if (map.getSource(sourceName) && map.isSourceLoaded(sourceName)) {
      console.log(`${sourceName} source loaded!`)
      mapContainer.classList.remove('fetching-data')
      map.off('sourcedata', loadedHandler)
    }
  }
  map.on('sourcedata', loadedHandler)
}

function loadPostcodeLayer (mapModule) {
  trackDataLoad(mapModule)

  const endpoint = POSTCODE_AREAS_ENDPOINT
  mapModule.addGeojsonSource('postcodeAreas', endpoint)
  mapModule.addPolygonLayer('postcodes', 'postcodeAreas', {
    fillColor: '#088',
    fillOpacity: 0.4,
    lineColor: '#088',
    lineOpacity: 0.8,
    lineWidth: 1
  }, false)

  // can use a filter like this to only show postcodes that match the selected areas
  const filter = ['match', ['get', 'postcode_area'], ['CF11', 'CF1'], true, false]
  mapModule.map.setFilter('postcodesFill', filter)
}

const $mapContainer = document.querySelector('.app-map__wrapper')
const mapModule = new Map($mapContainer).init({
  initialMapPosition: {
    center: [-3.186880750418709, 51.47384699593374], //[-3.7, 52.4],
    zoom: 12.83 //6.39
  },
  onLoadCallback: loadPostcodeLayer
})

mapModule.map.on('click', function (e) {
  const features = mapModule.map.queryRenderedFeatures(e.point)
  const postcodeFeatures = features.filter(feature => feature.layer.source === 'postcodeAreas')
  console.log(postcodeFeatures)
})

fetch(POSTCODE_AREAS_ENDPOINT)
  .then(response => response.json())
  .then(function (data) {
    console.log(data)
  })

// attach to window for debugging
window.mapModule = mapModule
