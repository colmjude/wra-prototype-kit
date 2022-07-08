/* global fetch */

import geoHelpers from './geohelpers'

const $currentLocationDisplay = document.querySelector('.app-current-location')
$currentLocationDisplay.classList.add('js-hidden')

function getBBoxFromPoint (coords) {
  return geoHelpers.getBBox(geoHelpers.convertPointToFeature(coords.latitude, coords.longitude, 0.01))
}

function getCurrentLocation () {
  geoHelpers.getLocation(function (e) {
    console.log('Success', e)
    displayLocation(e.coords)
    const bbox = getBBoxFromPoint(e.coords)
    console.log('Current location', bbox)
    fetchData(bbox)
  }, function (e) {
    console.log('Error', e)
  })
}

function useDefaultCoords () {
  const coords = {
    latitude: 52.05935795369581,
    longitude: -3.5725398780735134
  }
  displayLocation(coords)
  const bbox = getBBoxFromPoint(coords)
  fetchData(bbox)
}

function displayLocation (coords) {
  $currentLocationDisplay.classList.remove('js-hidden')
  const $lat = $currentLocationDisplay.querySelector('.app-current-location--latitude')
  const $lng = $currentLocationDisplay.querySelector('.app-current-location--longitude')
  $lat.textContent = coords.latitude
  $lng.textContent = coords.longitude
}

function fetchData (bbox, successCallback, errorCallback) {
  // need to make sure all layers are listed
  // https://landplatform.azurefd.net/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=HighWaterMark4326,NRW_NATIONAL_PARKPolygon4326,GWC21_Community_Wards4326,conservation_areas&bbox=-4.057148676659978%2C51.90456243131746%2C-2.923089621907593%2C52.3365572489885&width=768&height=523&srs=EPSG%3A4326&styles=&format=geojson
  const endpoint = `https://landplatform.azurefd.net/geoserver/test/wms?service=WMS&version=1.1.0&request=GetMap&layers=HighWaterMark4326,NRW_NATIONAL_PARKPolygon4326,GWC21_Community_Wards4326,conservation_areas,nationalBoundaries&bbox=${bbox[1]}%2C${bbox[0]}%2C${bbox[3]}%2C${bbox[2]}&width=768&height=523&srs=EPSG%3A4326&styles=&format=geojson`
  console.log('query endpoint', endpoint)
  fetch(endpoint)
    .then(response => response.json())
    .then(function (data) {
      displayIfInWales(isInWales(data.features))
      console.log(data)
    })
}

function isInWales (features) {
  const statisticalGeographyField = 'ctry18cd'
  const statisticalGeographyWales = 'W92000004'
  return features.filter(function (feature) {
    // only interested in national boundaries
    if (feature.id.includes('nationalBoundaries')) {
      if (feature.properties[statisticalGeographyField] && feature.properties[statisticalGeographyField] == statisticalGeographyWales) {
        return true
      }
    }
    return false
  })
}

function displayIfInWales (feature) {
  const $walesStatement = document.querySelector('[data-dynamic-element="in-wales-check"]')
  $walesStatement.classList.remove('js-hidden')
  let statement = 'Location NOT in Wales'
  if (feature.length) {
    statement = 'Location in Wales'
  }
  $walesStatement.textContent = statement
}

const $curentLocationBtn = document.querySelector('.app-current-location-button')
$curentLocationBtn.addEventListener('click', function (e) {
  getCurrentLocation()
})

const $defaultLocationBtn = document.querySelector('.app-default-location-button')
$defaultLocationBtn.addEventListener('click', function (e) {
  e.preventDefault()
  useDefaultCoords()
})
