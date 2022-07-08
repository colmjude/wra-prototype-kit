/* global fetch */

import geoHelpers from './geohelpers'
import Locator from './modules/locator'
import InWales from './modules/checks/wales'
import Checker from './modules/checker'

function displayIfInWales (feature) {
  console.log('displaying statement')
  const $walesStatement = document.querySelector('[data-dynamic-element="in-wales-check"]')
  $walesStatement.classList.remove('js-hidden')
  let statement = 'Location NOT in Wales'
  if (feature.length) {
    statement = 'Location in Wales'
  }
  $walesStatement.textContent = statement
}

const $inputContainer = document.querySelector('[data-locator="locator-inputs"]')
const $summaryContainer = document.querySelector('[data-locator="locator-summary"]')
const locator = new Locator($inputContainer, $summaryContainer).init({})
// // $currentLocationDisplay.classList.add('js-hidden')

// $summaryContainer.addEventListener('dataRetrieved', function (e) {
//   console.log('Event heard', e)
//   displayIfInWales(isInWales(e.detail.data.features))
// })

// function isInWales (features) {
//   const statisticalGeographyField = 'ctry18cd'
//   const statisticalGeographyWales = 'W92000004'
//   return features.filter(function (feature) {
//     // only interested in national boundaries
//     if (feature.id.includes('nationalBoundaries')) {
//       if (feature.properties[statisticalGeographyField] && feature.properties[statisticalGeographyField] == statisticalGeographyWales) {
//         return true
//       }
//     }
//     return false
//   })
// }

const $walesStatement = document.querySelector('[data-dynamic-element="in-wales-check"]')
const $localAuthorityItem = document.querySelector('[data-dynamic-element="which-local-authority"]')
const inWalesCheck = new InWales($walesStatement).init({})
const whichLocalAuthorityCheck = new Checker($localAuthorityItem).init({
  datasetName: 'localauthorities',
  dataRecordType: 'local authority',
  nameAttribute: 'name_en'
})
window.checkers = [inWalesCheck, whichLocalAuthorityCheck]
