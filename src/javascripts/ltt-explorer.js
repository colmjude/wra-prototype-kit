/* global accessibleAutocomplete */
import PostcodeStats from './modules/postcode-stats'

// set up accessible autocomplete uesed for entering postcodes
accessibleAutocomplete.enhanceSelectElement({
  selectElement: document.querySelector('#new_postcode')
})

const $form = document.querySelector('.app-postcode-selector-form')
const $results = document.querySelector('.app-postcode-stat-results')
const statsModule = new PostcodeStats($form, $results).init()

