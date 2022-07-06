import geoHelpers from './geohelpers'

const $currentLocationDisplay = document.querySelector('.app-current-location')
$currentLocationDisplay.classList.add('js-hidden')

function getCurrentLocation () {
  geoHelpers.getLocation(function (e) {
    console.log('Success', e)
    const bbox = geoHelpers.getBBox(geoHelpers.convertPointToFeature(e.coords.latitude, e.coords.longitude, 0.01))
    console.log('Current location', bbox)
    displayLocation(e.coords)
  }, function (e) {
    console.log('Error', e)
  })
}

function displayLocation (coords) {
  $currentLocationDisplay.classList.remove('js-hidden')
  const $lat = $currentLocationDisplay.querySelector('.app-current-location--latitude')
  const $lng = $currentLocationDisplay.querySelector('.app-current-location--longitude')
  $lat.textContent = coords.latitude
  $lng.textContent = coords.longitude
}

const $curentLocationBtn = document.querySelector('.app-current-location-button')
$curentLocationBtn.addEventListener('click', function (e) {
  getCurrentLocation()
})
