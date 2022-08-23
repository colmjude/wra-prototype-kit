
import RadiusMap from './modules/selecting/radius.js'

const $mapContainer = document.querySelector('.app-map__wrapper')
if ($mapContainer) {
  const mapModule = new RadiusMap($mapContainer).init({})
  window.mapModule = mapModule
}
