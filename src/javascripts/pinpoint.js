import Locator from './modules/locator'
import InWales from './modules/checks/wales'
import Checker from './modules/checker'
import OSM from './modules/osm'
import WTW from './modules/wtw'


const $inputContainer = document.querySelector('[data-locator="locator-inputs"]')
const $summaryContainer = document.querySelector('[data-locator="locator-summary"]')
const locator = new Locator($inputContainer, $summaryContainer).init({})

const $walesStatement = document.querySelector('[data-dynamic-element="in-wales-check"]')
const $localAuthorityItem = document.querySelector('[data-dynamic-element="which-local-authority"]')
const inWalesCheck = new InWales($walesStatement).init({})
const whichLocalAuthorityCheck = new Checker($localAuthorityItem).init({
  datasetName: 'localauthorities',
  nameAttribute: {
    en: 'name_en',
    cy: 'name_cy'
  }
})

const $wardItem = document.querySelector('[data-dynamic-element="which-ward"]')
const whichWardCheck = new Checker($wardItem).init({
  datasetName: 'Community_Wards'
})

const $nationalParklItem = document.querySelector('[data-dynamic-element="which-national-park"]')
const whichNationalPark = new Checker($nationalParklItem).init({
  datasetName: 'NATIONAL_PARK',
  nameAttribute: 'np_name'
})

const $conservationAreaItem = document.querySelector('[data-dynamic-element="which-conservation-area"]')
const whichConservationAreaCheck = new Checker($conservationAreaItem).init({
  datasetName: 'conservation_areas',
  nameAttribute: 'sitename'
})

const osmModule = new OSM().init({
  mapInteractionEnabled: false
})
const wtwModule = new WTW().init({
  mapInteractionEnabled: false
})
$summaryContainer.addEventListener('locationSet', function (e) {
  const latlng = {
    lat: e.detail.coordinates.latitude,
    lng: e.detail.coordinates.longitude
  }
  osmModule.getOSMData(latlng)
  wtwModule.getWTWData(latlng)
})

window.checkers = [inWalesCheck, whichLocalAuthorityCheck, whichWardCheck, whichNationalPark, whichConservationAreaCheck]
