
import RadiusMap from './modules/selecting/radius.js'
import BespokeSelect from './modules/selecting/bespoke.js'
import ExistingShapeSelect from './modules/selecting/existing.js'

// instaniate radius map
const $mapContainer = document.querySelector('.app-map__wrapper')
if ($mapContainer) {
  const mapModule = new RadiusMap($mapContainer).init({})
  window.mapModule = mapModule
}

// instantiate bespoke shape
const $bespokeMapContainer = document.querySelector('[data-module="bespoke-selection"]')
if ($bespokeMapContainer) {
  const bespokeMapModule = new BespokeSelect($bespokeMapContainer).init({
    mapElementID: 'mapId2'
  })
  window.bespokeMapModule = bespokeMapModule
}

// instantiate bespoke shape
const $existingShapeMapContainer = document.querySelector('[data-module="existing-selection"]')
if ($existingShapeMapContainer) {
  const existingShapeMapModule = new ExistingShapeSelect($existingShapeMapContainer).init({
    mapElementID: 'mapId3'
  })
  window.existingShapeMapModule = existingShapeMapModule
}
