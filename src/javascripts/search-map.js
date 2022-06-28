import * as WRA from './map-prototypes'
// import DrawRectangle from './vendor/mapbox-gl-draw-rectangle-mode'

/* global MapboxDraw, turf */

function addQueryLayers (map) {
  map.addSource('query', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })
  map.addSource('bbox-query', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })
  map.addLayer({
    id: 'query-line',
    type: 'line',
    source: 'query',
    paint: {
      'line-color': 'hsl(140, 0%, 30%)',
      'line-width': 2,
      'line-dasharray': [2, 2]
    }
  })
  map.addLayer({
    id: 'bbox-query-line',
    type: 'line',
    source: 'bbox-query',
    paint: {
      'line-color': '#990000',
      'line-width': 2,
      'line-dasharray': [2, 2]
    }
  })
  map.addLayer({
    id: 'query-fill',
    type: 'fill',
    source: 'query',
    paint: {
      'fill-color': 'hsl(140, 0%, 50%)',
      'fill-opacity': 0.2
    },
    filter: ['==', ['geometry-type'], 'Polygon']
  })

  map.addLayer({
    id: 'query-circle',
    type: 'circle',
    source: 'query',
    paint: {
      'circle-color': 'hsl(140, 0%, 30%)'
    },
    filter: ['==', ['geometry-type'], 'Point']
  })
}

function getBBox (feature) {
  return turf.bbox(feature)
}

function performQuery (bbox) {
  const endpoint = `https://geoserverlp.azurewebsites.net/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=test%3AHighWaterMark4326&bbox=-5.670340987883478%2C51.374967138080336%2C-2.649867414033135%2C53.4357252657539&width=768&height=523&srs=EPSG%3A4326&styles=&format=geojson`
}

function loadHandler (appmap) {
  console.log('map loaded')
  const map = appmap.getMap()
  addQueryLayers(map)

  const draw = new MapboxDraw({
    displayControlsDefault: false, // Don't add any tools other than those below
    controls: {
      point: true,
      line_string: true,
      polygon: true
    }
  })

  map.addControl(draw, 'top-left')

  map.on('draw.create', (e) => {
    const feature = e.features[0]
    const bbox = getBBox(feature)
    console.log(bbox)
    map.getSource('query').setData(feature)
    map.getSource('bbox-query').setData(turf.bboxPolygon(bbox))
    draw.deleteAll()
  })
}

const $mapEl = document.querySelector('[data-module="wra-map"]')
const mapComponent = new WRA.Map($mapEl).init({
  onLoadCallback: loadHandler
})

window.appmap = mapComponent
