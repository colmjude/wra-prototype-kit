/* global accessibleAutocomplete */
import PostcodeStats from './modules/postcode-stats'
import PostcodeMap from './modules/postcode-map'

// set up accessible autocomplete uesed for entering postcodes
accessibleAutocomplete.enhanceSelectElement({
  selectElement: document.querySelector('#new_postcode'),
  defaultValue: ''
})

const $form = document.querySelector('.app-postcode-selector-form')
const $results = document.querySelector('.app-postcode-stat-results')
const statsModule = new PostcodeStats($form, $results).init()

const $mapContainer = document.querySelector('.app-map__wrapper')
if ($mapContainer) {
  const mapModule = new PostcodeMap($mapContainer).init({})
  statsModule.addObserver($mapContainer)
  window.mapModule = mapModule
}
